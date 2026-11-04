import crypto from 'node:crypto';
import {
  ProjectInvoice,
  PaymentRecord,
  InvoiceMilestone,
  calculatePlatformFee,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from '../types/billing';

export interface ServerPaymentConfig {
  stripeConfigured: boolean;
  stripePublishableKey: string | null;
  mode: 'live' | 'test' | 'disabled';
  supportedCurrencies: CurrencyCode[];
  platformFeeRate: number;
}

export interface PaymentIntentResponse {
  success: boolean;
  liveMode: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  amountMinor: number;
  currency: string;
  invoiceId: string;
  milestoneId?: string;
  message?: string;
  error?: string;
}

export interface ConnectAccountResponse {
  success: boolean;
  liveMode: boolean;
  accountId?: string;
  onboardingUrl?: string;
  message: string;
}

// In-memory processed webhook event store for idempotency protection
const processedWebhookEventIds = new Set<string>();

// In-memory tracking of payment states to prevent invalid out-of-order transitions
const paymentRecordStates = new Map<string, PaymentRecord['status']>();

export function resetPaymentStateForTesting(): void {
  processedWebhookEventIds.clear();
  paymentRecordStates.clear();
}

export const VALID_PAYMENT_TRANSITIONS: Record<PaymentRecord['status'], PaymentRecord['status'][]> = {
  pending: ['succeeded', 'failed', 'cancelled'],
  succeeded: ['refunded'],
  failed: [], // terminal
  cancelled: [], // terminal
  refunded: [], // terminal
};

export function isValidPaymentTransition(
  currentStatus: PaymentRecord['status'],
  targetStatus: PaymentRecord['status']
): boolean {
  if (currentStatus === targetStatus) return true;
  return VALID_PAYMENT_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false;
}

/**
 * Validates whether Stripe secret keys are configured in the environment.
 * IMPORTANT: Secret keys must NEVER be exposed to frontend code or client bundles.
 */
export function isStripeServerConfigured(): boolean {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return Boolean(secretKey && secretKey.startsWith('sk_') && secretKey.length > 20);
}

/**
 * Returns public payment configuration safe to send to clients.
 */
export function getPublicPaymentConfig(): ServerPaymentConfig {
  const configured = isStripeServerConfigured();
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || null;

  return {
    stripeConfigured: configured,
    stripePublishableKey: publishableKey,
    mode: configured ? (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live') : 'disabled',
    supportedCurrencies: Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[],
    platformFeeRate: 0.05,
  };
}

/**
 * Server-side creation of a Stripe Connect Express account link.
 * Used for onboarding creators securely without touching sensitive banking/tax info.
 */
export async function createCreatorConnectOnboarding(params: {
  editorId: string;
  legalName: string;
  country: string;
  email: string;
  businessType: 'individual' | 'company';
  returnUrl: string;
  refreshUrl: string;
}): Promise<ConnectAccountResponse> {
  if (!params.editorId || !params.country || !params.email) {
    return {
      success: false,
      liveMode: false,
      message: 'Missing required onboarding parameters (editorId, country, or email).',
    };
  }

  // If live Stripe keys are unconfigured, return clear informational response
  if (!isStripeServerConfigured()) {
    return {
      success: true,
      liveMode: false,
      accountId: `acct_demo_${params.editorId.slice(0, 10)}`,
      onboardingUrl: `${params.returnUrl}?demo_payout_onboarding=success&editorId=${encodeURIComponent(params.editorId)}`,
      message: 'Stripe API keys not configured in server environment. Providing verified sandbox onboarding link.',
    };
  }

  try {
    // Dynamically require or fetch if stripe npm library is available
    // Otherwise use standard Stripe REST API directly with fetch and Authorization Bearer
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    
    // 1. Create or retrieve account
    const accountRes = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        type: 'express',
        country: params.country,
        email: params.email,
        'capabilities[card_payments][requested]': 'true',
        'capabilities[transfers][requested]': 'true',
        business_type: params.businessType,
        'metadata[editor_id]': params.editorId,
        'metadata[platform]': 'Pixel Media',
      }).toString(),
    });

    const accountData = (await accountRes.json()) as Record<string, any>;
    if (!accountRes.ok) {
      return {
        success: false,
        liveMode: true,
        message: accountData.error?.message || 'Failed to create Stripe Connect account.',
      };
    }

    // 2. Generate Account Link for hosted onboarding
    const linkRes = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        account: String(accountData.id),
        refresh_url: params.refreshUrl,
        return_url: params.returnUrl,
        type: 'account_onboarding',
      }).toString(),
    });

    const linkData = (await linkRes.json()) as Record<string, any>;
    if (!linkRes.ok) {
      return {
        success: false,
        liveMode: true,
        message: linkData.error?.message || 'Failed to create Stripe onboarding link.',
      };
    }

    return {
      success: true,
      liveMode: true,
      accountId: String(accountData.id),
      onboardingUrl: String(linkData.url),
      message: 'Stripe Connect Express onboarding initiated.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      liveMode: false,
      message: err instanceof Error ? err.message : 'Unknown server error during onboarding.',
    };
  }
}

/**
 * Server-side payment intent creation with strict server calculation.
 * NEVER trust a payable amount submitted by the client!
 * Always look up the invoice and calculate the exact payable minor units on the server.
 */
export async function createServerPaymentIntent(params: {
  invoice: ProjectInvoice;
  clientId: string;
  milestoneId?: string;
  idempotencyKey: string;
}): Promise<PaymentIntentResponse> {
  const { invoice, clientId, milestoneId, idempotencyKey } = params;

  // 1. Authorization Verification
  if (!clientId || invoice.clientId !== clientId) {
    return {
      success: false,
      liveMode: false,
      amountMinor: 0,
      currency: invoice.currency,
      invoiceId: invoice.id,
      error: 'Unauthorized: User is not the designated client for this invoice.',
    };
  }

  // 2. Server-side Calculation
  let payableSubtotalMinor = 0;
  let targetMilestone: InvoiceMilestone | undefined;

  if (milestoneId) {
    targetMilestone = invoice.milestones.find((m: InvoiceMilestone) => m.id === milestoneId);
    if (!targetMilestone) {
      return {
        success: false,
        liveMode: false,
        amountMinor: 0,
        currency: invoice.currency,
        invoiceId: invoice.id,
        error: `Milestone ${milestoneId} does not exist on this invoice.`,
      };
    }
    if (targetMilestone.status === 'funded' || targetMilestone.status === 'released') {
      return {
        success: false,
        liveMode: false,
        amountMinor: 0,
        currency: invoice.currency,
        invoiceId: invoice.id,
        error: `Milestone is already funded or released.`,
      };
    }
    payableSubtotalMinor = targetMilestone.amountMinor;
  } else {
    // Paying entire remaining unpaid balance of the invoice
    const unpaidMilestones = invoice.milestones.filter(
      (m: InvoiceMilestone) => m.status === 'pending'
    );
    payableSubtotalMinor = unpaidMilestones.reduce((acc: number, m: InvoiceMilestone) => acc + m.amountMinor, 0);
  }

  if (payableSubtotalMinor <= 0) {
    return {
      success: false,
      liveMode: false,
      amountMinor: 0,
      currency: invoice.currency,
      invoiceId: invoice.id,
      error: 'No outstanding payable balance found for this invoice selection.',
    };
  }

  // Calculate platform fee and total in minor units strictly on the server
  const platformFeeMinor = calculatePlatformFee(payableSubtotalMinor, invoice.platformFeeRate);
  const taxMinor = Math.round(payableSubtotalMinor * invoice.taxRate);
  const serverCalculatedTotalMinor = payableSubtotalMinor + platformFeeMinor + taxMinor;

  // 3. Check if Stripe is configured
  if (!isStripeServerConfigured()) {
    // When credentials are not available, leave live charging disabled
    return {
      success: true,
      liveMode: false,
      amountMinor: serverCalculatedTotalMinor,
      currency: invoice.currency,
      invoiceId: invoice.id,
      milestoneId,
      message: 'Live charging disabled: Stripe credentials are not configured on this server.',
    };
  }

  // 4. Live Stripe PaymentIntent creation with Idempotency Key
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
    const bodyParams = new URLSearchParams({
      amount: String(serverCalculatedTotalMinor),
      currency: invoice.currency.toLowerCase(),
      'payment_method_types[]': 'card',
      'metadata[invoice_id]': invoice.id,
      'metadata[invoice_number]': invoice.invoiceNumber,
      'metadata[request_id]': invoice.requestId,
      'metadata[client_id]': invoice.clientId,
      'metadata[editor_id]': invoice.editorId,
      ...(milestoneId ? { 'metadata[milestone_id]': milestoneId } : {}),
      description: `Pixel Media: ${invoice.projectTitle} (${invoice.invoiceNumber})`,
    });

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': idempotencyKey,
      },
      body: bodyParams.toString(),
    });

    const data = (await response.json()) as Record<string, any>;
    if (!response.ok) {
      return {
        success: false,
        liveMode: true,
        amountMinor: serverCalculatedTotalMinor,
        currency: invoice.currency,
        invoiceId: invoice.id,
        error: data.error?.message || 'Payment intent creation failed.',
      };
    }

    return {
      success: true,
      liveMode: true,
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
      amountMinor: serverCalculatedTotalMinor,
      currency: invoice.currency,
      invoiceId: invoice.id,
      milestoneId,
    };
  } catch (err: unknown) {
    return {
      success: false,
      liveMode: true,
      amountMinor: serverCalculatedTotalMinor,
      currency: invoice.currency,
      invoiceId: invoice.id,
      error: err instanceof Error ? err.message : 'Failed to connect to payment provider.',
    };
  }
}

/**
 * Verifies the Stripe webhook signature against the raw, unmodified request payload.
 * Protects against payload tampering and replay attacks using timestamp tolerance.
 */
export function verifyStripeWebhookSignature(params: {
  rawBody: Buffer | string;
  signatureHeader?: string;
  webhookSecret?: string;
  toleranceSeconds?: number;
}): { valid: boolean; error?: string } {
  const { rawBody, signatureHeader } = params;
  const webhookSecret = params.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  const tolerance = params.toleranceSeconds ?? 300; // 5 minute default tolerance

  if (!webhookSecret) {
    return {
      valid: false,
      error: 'Missing STRIPE_WEBHOOK_SECRET in server environment.',
    };
  }

  if (!signatureHeader) {
    return {
      valid: false,
      error: 'Missing Stripe-Signature header.',
    };
  }

  const items = signatureHeader.split(',');
  let timestamp = -1;
  const signatures: string[] = [];

  for (const item of items) {
    const [key, value] = item.trim().split('=');
    if (key === 't') {
      timestamp = parseInt(value, 10);
    } else if (key === 'v1' && value) {
      signatures.push(value);
    }
  }

  if (isNaN(timestamp) || timestamp === -1 || signatures.length === 0) {
    return {
      valid: false,
      error: 'Invalid Stripe-Signature header format.',
    };
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > tolerance) {
    return {
      valid: false,
      error: `Webhook timestamp outside tolerance window (${tolerance}s). Replay attack suspected.`,
    };
  }

  const payload = `${timestamp}.${typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')}`;
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  const matches = signatures.some((sig) => {
    const sigBuffer = Buffer.from(sig, 'utf8');
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  });

  if (!matches) {
    return {
      valid: false,
      error: 'Stripe webhook signature verification failed (HMAC mismatch).',
    };
  }

  return { valid: true };
}

/**
 * Webhook signature verification and idempotent event processor.
 * Safe to retry without double-crediting invoices or milestones.
 * Prevents out-of-order deliveries from corrupting payment state.
 */
export function processStripeWebhookEvent(params: {
  eventId: string;
  eventType: string;
  eventData: Record<string, unknown>;
  signatureHeader?: string;
  rawBody?: Buffer | string;
  webhookSecret?: string;
}): {
  handled: boolean;
  duplicate: boolean;
  action: string;
  paymentRecord?: Partial<PaymentRecord>;
  error?: string;
} {
  const { eventId, eventType, eventData, signatureHeader, rawBody, webhookSecret } = params;

  // 1. Signature Verification (when secret is provided or in live environment)
  const effectiveSecret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET;
  if (effectiveSecret && rawBody) {
    const verification = verifyStripeWebhookSignature({
      rawBody,
      signatureHeader,
      webhookSecret: effectiveSecret,
    });
    if (!verification.valid) {
      return {
        handled: false,
        duplicate: false,
        action: 'signature_verification_failed',
        error: verification.error,
      };
    }
  }

  // 2. Idempotency check: Ensure we never process the exact same event twice
  if (processedWebhookEventIds.has(eventId)) {
    return {
      handled: true,
      duplicate: true,
      action: 'Event already processed, skipping idempotently.',
    };
  }

  const object = (eventData.object || {}) as Record<string, unknown>;
  const metadata = (object.metadata || {}) as Record<string, string>;
  const providerPaymentId = String(object.id || '');
  const invoiceId = metadata.invoice_id || '';
  const stateKey = providerPaymentId || invoiceId || eventId;

  // 3. State transition safety against out-of-order deliveries
  let targetStatus: PaymentRecord['status'] = 'pending';
  if (eventType === 'payment_intent.succeeded') targetStatus = 'succeeded';
  else if (eventType === 'payment_intent.payment_failed') targetStatus = 'failed';
  else if (eventType === 'charge.refunded') targetStatus = 'refunded';

  const currentStatus = paymentRecordStates.get(stateKey);
  if (currentStatus && !isValidPaymentTransition(currentStatus, targetStatus)) {
    return {
      handled: false,
      duplicate: false,
      action: 'invalid_state_transition',
      error: `Out-of-order event rejected: Cannot transition payment '${stateKey}' from '${currentStatus}' to '${targetStatus}'.`,
    };
  }

  // Register event as processed and update state
  processedWebhookEventIds.add(eventId);
  paymentRecordStates.set(stateKey, targetStatus);

  switch (eventType) {
    case 'payment_intent.succeeded': {
      return {
        handled: true,
        duplicate: false,
        action: 'fund_milestone_or_invoice',
        paymentRecord: {
          id: `pay_${eventId}`,
          invoiceId: metadata.invoice_id,
          requestId: metadata.request_id,
          milestoneId: metadata.milestone_id,
          clientId: metadata.client_id,
          editorId: metadata.editor_id,
          amountMinor: Number(object.amount || 0),
          currency: String(object.currency || 'usd').toUpperCase() as CurrencyCode,
          provider: 'stripe',
          providerPaymentId,
          idempotencyKey: eventId,
          status: 'succeeded',
          isDemo: false,
          settledAt: new Date().toISOString(),
        },
      };
    }

    case 'payment_intent.payment_failed': {
      const lastError = (object.last_payment_error || {}) as Record<string, string>;
      return {
        handled: true,
        duplicate: false,
        action: 'record_failed_payment',
        paymentRecord: {
          id: `pay_${eventId}`,
          invoiceId: metadata.invoice_id,
          requestId: metadata.request_id,
          milestoneId: metadata.milestone_id,
          clientId: metadata.client_id,
          editorId: metadata.editor_id,
          amountMinor: Number(object.amount || 0),
          currency: String(object.currency || 'usd').toUpperCase() as CurrencyCode,
          provider: 'stripe',
          providerPaymentId,
          idempotencyKey: eventId,
          status: 'failed',
          isDemo: false,
          failureReason: lastError.message || 'Payment processing failed',
        },
      };
    }

    case 'charge.refunded': {
      return {
        handled: true,
        duplicate: false,
        action: 'record_refund',
        paymentRecord: {
          id: `ref_${eventId}`,
          invoiceId: metadata.invoice_id,
          requestId: metadata.request_id,
          milestoneId: metadata.milestone_id,
          amountMinor: Number(object.amount_refunded || 0),
          currency: String(object.currency || 'usd').toUpperCase() as CurrencyCode,
          provider: 'stripe',
          providerPaymentId,
          status: 'refunded',
          isDemo: false,
          refundReason: 'Charge refunded by marketplace administrator',
        },
      };
    }

    default:
      return {
        handled: true,
        duplicate: false,
        action: `Ignored unhandled event type: ${eventType}`,
      };
  }
}
