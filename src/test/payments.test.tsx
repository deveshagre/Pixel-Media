import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { EventEmitter } from 'node:events';
import {
  createServerPaymentIntent,
  processStripeWebhookEvent,
  verifyStripeWebhookSignature,
  getPublicPaymentConfig,
  resetPaymentStateForTesting,
  isValidPaymentTransition,
} from '../server/paymentService';
import {
  authenticateRequest,
  authorizeInvoicePayment,
  authorizePayoutOnboarding,
} from '../server/auth';
import { handleApiRequest } from '../server/apiHandler';
import {
  ProjectInvoice,
  decimalToMinorUnits,
  minorUnitsToDecimal,
  formatMinorUnits,
} from '../types/billing';

// Helper to create mock IncomingMessage for testing
function createMockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  rawBuffer?: Buffer;
}): IncomingMessage {
  const req = new EventEmitter() as unknown as IncomingMessage;
  req.method = options.method || 'GET';
  req.url = options.url || '/api/payments/config';
  req.headers = {
    'content-type': 'application/json',
    ...(options.headers || {}),
  };
  req.socket = { remoteAddress: '127.0.0.1' } as any;

  // Stream data asynchronously on next tick
  process.nextTick(() => {
    if (options.rawBuffer) {
      req.emit('data', options.rawBuffer);
    } else if (options.body !== undefined) {
      const payload = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      req.emit('data', Buffer.from(payload, 'utf8'));
    }
    req.emit('end');
  });

  return req;
}

// Helper to create mock ServerResponse for testing
function createMockResponse(): ServerResponse & {
  _statusCode: number;
  _headers: Record<string, string>;
  _body: string;
} {
  const res = new EventEmitter() as any;
  res._statusCode = 200;
  res._headers = {};
  res._body = '';
  res.headersSent = false;

  Object.defineProperty(res, 'statusCode', {
    get: () => res._statusCode,
    set: (val: number) => {
      res._statusCode = val;
    },
  });

  res.setHeader = (key: string, val: string) => {
    res._headers[key.toLowerCase()] = val;
  };
  res.end = (chunk?: string | Buffer) => {
    if (chunk) res._body += chunk.toString();
    res.headersSent = true;
    res.emit('finish');
  };

  return res;
}

describe('Payment Engine, Server Calculations & Webhook Idempotency', () => {
  beforeEach(() => {
    resetPaymentStateForTesting();
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  const mockInvoice: ProjectInvoice = {
    id: 'inv-test-101',
    invoiceNumber: 'INV-2026-0101',
    requestId: 'req-prod-101',
    proposalId: 'prop-101',
    projectTitle: 'Documentary Color Grading',
    clientId: 'client-alice-1',
    clientName: 'Alice Director',
    editorId: 'editor-bob-1',
    editorName: 'Bob Colorist',
    currency: 'USD',
    subtotalMinor: 200000, // $2,000.00
    platformFeeMinor: 10000, // $100.00 (5%)
    platformFeeRate: 0.05,
    taxMinor: 0,
    taxRate: 0,
    totalMinor: 210000, // $2,100.00
    amountPaidMinor: 0,
    amountReleasedMinor: 0,
    status: 'issued',
    issuedAt: new Date().toISOString(),
    milestones: [
      {
        id: 'ms-part-1',
        title: 'Initial Look LUT & Conform',
        amountMinor: 100000, // $1,000.00
        status: 'pending',
      },
      {
        id: 'ms-part-2',
        title: 'Final Film Master Grade',
        amountMinor: 100000, // $1,000.00
        status: 'pending',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('1. Server-Side Authentication & Authorization Guards', () => {
    it('rejects requests with missing or empty Authorization header', async () => {
      const req = createMockRequest({ headers: {} });
      const auth = await authenticateRequest(req);
      expect(auth.authenticated).toBe(false);
      expect(auth.error).toMatch(/Missing or malformed Authorization header/i);
    });

    it('authenticates valid demo bearer tokens and resolves user identity and role', async () => {
      const req = createMockRequest({
        headers: { authorization: 'Bearer demo-token:client-alice-1:client' },
      });
      const auth = await authenticateRequest(req);
      expect(auth.authenticated).toBe(true);
      expect(auth.user?.id).toBe('client-alice-1');
      expect(auth.user?.role).toBe('client');
      expect(auth.user?.isDemo).toBe(true);
    });

    it('forbids creators from funding their own invoice or charging clients', () => {
      const creatorUser = {
        id: 'editor-bob-1',
        role: 'editor' as const,
        isDemo: true,
      };
      const authz = authorizeInvoicePayment(creatorUser, mockInvoice);
      expect(authz.authorized).toBe(false);
      expect(authz.reason).toMatch(/Creators cannot initiate client payment charges/i);
    });

    it('forbids cross-user invoice payment attempts', () => {
      const attackerUser = {
        id: 'malicious-attacker-99',
        role: 'client' as const,
        isDemo: true,
      };
      const authz = authorizeInvoicePayment(attackerUser, mockInvoice);
      expect(authz.authorized).toBe(false);
      expect(authz.reason).toMatch(/Forbidden: Authenticated user is not the designated client/i);
    });

    it('forbids users from initiating Stripe Connect onboarding for other creators', () => {
      const normalUser = {
        id: 'user-impostor',
        role: 'editor' as const,
        isDemo: true,
      };
      const authz = authorizePayoutOnboarding(normalUser, 'editor-bob-1');
      expect(authz.authorized).toBe(false);
      expect(authz.reason).toMatch(/Users cannot manage Stripe Connect payout onboarding for another creator/i);
    });
  });

  describe('2. Authoritative Server Calculations & Currency Precision', () => {
    it('calculates payable milestone amount strictly from server-side invoice records', async () => {
      const result = await createServerPaymentIntent({
        invoice: mockInvoice,
        clientId: 'client-alice-1',
        milestoneId: 'ms-part-1',
        idempotencyKey: 'idem_test_abc_1',
      });

      expect(result.success).toBe(true);
      expect(result.amountMinor).toBe(105000); // 100,000 + 5,000 fee
      expect(result.currency).toBe('USD');
      expect(result.milestoneId).toBe('ms-part-1');
    });

    it('rejects payment authorization if client ID does not match invoice recipient', async () => {
      const result = await createServerPaymentIntent({
        invoice: mockInvoice,
        clientId: 'malicious-attacker-99',
        milestoneId: 'ms-part-1',
        idempotencyKey: 'idem_fail_1',
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/Unauthorized/i);
      expect(result.amountMinor).toBe(0);
    });

    it('prevents double funding of already funded or released milestones', async () => {
      const fundedInvoice: ProjectInvoice = {
        ...mockInvoice,
        milestones: [
          {
            id: 'ms-part-1',
            title: 'Initial Look LUT & Conform',
            amountMinor: 100000,
            status: 'funded',
          },
        ],
      };

      const result = await createServerPaymentIntent({
        invoice: fundedInvoice,
        clientId: 'client-alice-1',
        milestoneId: 'ms-part-1',
        idempotencyKey: 'idem_fail_2',
      });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/already funded or released/i);
    });

    it('correctly handles zero-decimal currency JPY with minor unit factor 1', () => {
      // 25,000 Yen should equal 25000 minor units
      expect(decimalToMinorUnits(25000, 'JPY')).toBe(25000);
      expect(minorUnitsToDecimal(25000, 'JPY')).toBe(25000);
      expect(formatMinorUnits(25000, 'JPY')).toBe('¥25,000 JPY');

      // Compare with standard 2-decimal USD (factor 100)
      expect(decimalToMinorUnits(250, 'USD')).toBe(25000);
      expect(minorUnitsToDecimal(25000, 'USD')).toBe(250);
      expect(formatMinorUnits(25000, 'USD')).toBe('$250.00 USD');

      // Compare with standard 2-decimal INR (factor 100)
      expect(decimalToMinorUnits(2500, 'INR')).toBe(250000);
      expect(minorUnitsToDecimal(250000, 'INR')).toBe(2500);
      expect(formatMinorUnits(250000, 'INR')).toBe('₹2,500.00 INR');
    });

    it('leaves live charging disabled and returns informational response when Stripe credentials are not configured', async () => {
      const config = getPublicPaymentConfig();
      expect(config.stripeConfigured).toBe(false);
      expect(config.mode).toBe('disabled');
      expect(config.supportedCurrencies).toContain('USD');
      expect(config.supportedCurrencies).toContain('INR');
      expect(config.supportedCurrencies).toContain('JPY');

      const result = await createServerPaymentIntent({
        invoice: mockInvoice,
        clientId: 'client-alice-1',
        milestoneId: 'ms-part-1',
        idempotencyKey: 'idem_test_unconf',
      });

      expect(result.success).toBe(true);
      expect(result.liveMode).toBe(false);
      expect(result.message).toMatch(/Live charging disabled/i);
    });
  });

  describe('3. Stripe Webhook HMAC Signature Verification & Security', () => {
    const webhookSecret = 'whsec_test_secret_key_1234567890abcdef';
    const payload = JSON.stringify({
      id: 'evt_sig_test_1',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_sig_1', amount: 105000, currency: 'usd' } },
    });

    it('verifies valid HMAC-SHA256 signature against raw payload', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      const header = `t=${timestamp},v1=${signature}`;
      const result = verifyStripeWebhookSignature({
        rawBody: Buffer.from(payload, 'utf8'),
        signatureHeader: header,
        webhookSecret,
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects tampered webhook payloads with HMAC mismatch', () => {
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${timestamp}.${payload}`)
        .digest('hex');

      const tamperedPayload = payload.replace('105000', '999999');
      const header = `t=${timestamp},v1=${signature}`;

      const result = verifyStripeWebhookSignature({
        rawBody: Buffer.from(tamperedPayload, 'utf8'),
        signatureHeader: header,
        webhookSecret,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/HMAC mismatch/i);
    });

    it('rejects replay attacks with timestamps outside tolerance window', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
      const signature = crypto
        .createHmac('sha256', webhookSecret)
        .update(`${oldTimestamp}.${payload}`)
        .digest('hex');

      const header = `t=${oldTimestamp},v1=${signature}`;
      const result = verifyStripeWebhookSignature({
        rawBody: Buffer.from(payload, 'utf8'),
        signatureHeader: header,
        webhookSecret,
        toleranceSeconds: 300,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/Replay attack suspected/i);
    });

    it('rejects missing or malformed Stripe-Signature header', () => {
      const res1 = verifyStripeWebhookSignature({
        rawBody: Buffer.from(payload, 'utf8'),
        signatureHeader: undefined,
        webhookSecret,
      });
      expect(res1.valid).toBe(false);
      expect(res1.error).toMatch(/Missing Stripe-Signature header/i);

      const res2 = verifyStripeWebhookSignature({
        rawBody: Buffer.from(payload, 'utf8'),
        signatureHeader: 'invalid_format_without_v1',
        webhookSecret,
      });
      expect(res2.valid).toBe(false);
      expect(res2.error).toMatch(/Invalid Stripe-Signature header format/i);
    });
  });

  describe('4. Idempotency & Out-of-Order Webhook Event Handling', () => {
    it('processes payment webhook events and enforces idempotency against duplicate delivery', () => {
      const eventId = `evt_test_${Date.now()}`;
      const webhookPayload = {
        eventId,
        eventType: 'payment_intent.succeeded',
        eventData: {
          object: {
            id: 'pi_test_123',
            amount: 105000,
            currency: 'usd',
            metadata: {
              invoice_id: 'inv-test-101',
              request_id: 'req-prod-101',
              milestone_id: 'ms-part-1',
              client_id: 'client-alice-1',
              editor_id: 'editor-bob-1',
            },
          },
        },
      };

      // First delivery
      const firstRun = processStripeWebhookEvent(webhookPayload);
      expect(firstRun.handled).toBe(true);
      expect(firstRun.duplicate).toBe(false);
      expect(firstRun.action).toBe('fund_milestone_or_invoice');
      expect(firstRun.paymentRecord?.status).toBe('succeeded');
      expect(firstRun.paymentRecord?.amountMinor).toBe(105000);

      // Duplicate delivery
      const secondRun = processStripeWebhookEvent(webhookPayload);
      expect(secondRun.handled).toBe(true);
      expect(secondRun.duplicate).toBe(true);
      expect(secondRun.action).toMatch(/already processed, skipping idempotently/i);
    });

    it('validates state transitions and rejects out-of-order un-refunds', () => {
      expect(isValidPaymentTransition('pending', 'succeeded')).toBe(true);
      expect(isValidPaymentTransition('succeeded', 'refunded')).toBe(true);
      expect(isValidPaymentTransition('refunded', 'succeeded')).toBe(false); // Illegal!
      expect(isValidPaymentTransition('failed', 'succeeded')).toBe(false); // Illegal!

      const paymentId = 'pi_order_test_99';
      // First, record payment refunded
      processStripeWebhookEvent({
        eventId: 'evt_first_refund',
        eventType: 'charge.refunded',
        eventData: { object: { id: paymentId, amount_refunded: 105000, currency: 'usd' } },
      });

      // An out-of-order payment_intent.succeeded arrives afterwards
      const outOfOrderResult = processStripeWebhookEvent({
        eventId: 'evt_delayed_success',
        eventType: 'payment_intent.succeeded',
        eventData: { object: { id: paymentId, amount: 105000, currency: 'usd' } },
      });

      expect(outOfOrderResult.handled).toBe(false);
      expect(outOfOrderResult.action).toBe('invalid_state_transition');
      expect(outOfOrderResult.error).toMatch(/Cannot transition payment.*from 'refunded' to 'succeeded'/i);
    });

    it('handles failed payment webhook events and records failure reason', () => {
      const failEventId = `evt_fail_${Date.now()}`;
      const result = processStripeWebhookEvent({
        eventId: failEventId,
        eventType: 'payment_intent.payment_failed',
        eventData: {
          object: {
            id: 'pi_fail_456',
            amount: 105000,
            currency: 'usd',
            last_payment_error: {
              message: 'Your card was declined by the issuing bank.',
            },
            metadata: {
              invoice_id: 'inv-test-101',
              client_id: 'client-alice-1',
            },
          },
        },
      });

      expect(result.handled).toBe(true);
      expect(result.paymentRecord?.status).toBe('failed');
      expect(result.paymentRecord?.failureReason).toBe('Your card was declined by the issuing bank.');
    });
  });

  describe('5. Unified HTTP API Handler Integration', () => {
    it('returns safe public payment config without exposing secret keys', async () => {
      const req = createMockRequest({
        method: 'GET',
        url: '/api/payments/config',
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(200);

      const parsed = JSON.parse(res._body);
      expect(parsed.stripePublishableKey).toBeNull();
      expect(parsed.stripeSecretKey).toBeUndefined();
      expect(parsed.notice).toBe(
        'Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.'
      );
      expect(parsed.supportedCurrencies).toContain('INR');
      expect(parsed.supportedCurrencies).toContain('JPY');
    });

    it('responds to CORS OPTIONS preflight with 204', async () => {
      const req = createMockRequest({
        method: 'OPTIONS',
        url: '/api/payments/create-intent',
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(204);
      expect(res._headers['access-control-allow-methods']).toContain('POST');
    });

    it('disables in-app card charge initiation with 410 Gone and direct settlement notice', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: '/api/payments/create-intent',
        body: { invoice: mockInvoice },
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(410);
      const parsed = JSON.parse(res._body);
      expect(parsed.directSettlement).toBe(true);
      expect(parsed.error).toContain(
        'Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.'
      );
    });

    it('disables Stripe Connect payout onboarding with 410 Gone and direct settlement notice', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: '/api/payouts/connect',
        body: { editorId: 'mock-editor-1' },
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(410);
      const parsed = JSON.parse(res._body);
      expect(parsed.directSettlement).toBe(true);
      expect(parsed.error).toContain(
        'Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.'
      );
    });

    it('returns calling provider status via /api/calls/config', async () => {
      const req = createMockRequest({
        method: 'GET',
        url: '/api/calls/config',
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(200);
      const parsed = JSON.parse(res._body);
      expect(parsed.provider).toBe('daily');
      expect(typeof parsed.configured).toBe('boolean');
    });

    it('rejects unauthenticated call session creation with 401', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: '/api/calls/session',
        body: {
          projectId: 'req-call-1',
          callType: 'voice',
          recipientId: 'editor-1',
        },
      });
      const res = createMockResponse();

      const handled = await handleApiRequest(req, res);
      expect(handled).toBe(true);
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._body).error).toMatch(/Authorization/i);
    });
  });
});
