// ============================================================
// Pixel Media — Creator Business, Invoicing & Payment Types
// ============================================================

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'INR' | 'JPY';

export interface CurrencyMetadata {
  code: CurrencyCode;
  symbol: string;
  name: string;
  minorUnitFactor: number; // 100 for standard (cents, paise), 1 for zero-decimal currencies (JPY)
  decimals: number;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyMetadata> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', minorUnitFactor: 100, decimals: 2 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', minorUnitFactor: 100, decimals: 2 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', minorUnitFactor: 100, decimals: 2 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', minorUnitFactor: 100, decimals: 2 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', minorUnitFactor: 100, decimals: 2 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', minorUnitFactor: 100, decimals: 2 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', minorUnitFactor: 1, decimals: 0 },
};

export const DEFAULT_PLATFORM_FEE_RATE = 0.05; // 5% marketplace coordination fee

export type PayoutOnboardingStatus =
  | 'not_started'
  | 'pending_verification'
  | 'enabled'
  | 'restricted';

export interface CreatorPayoutProfile {
  editorId: string;
  businessType: 'individual' | 'company';
  legalName: string;
  country: string; // ISO 3166-1 alpha-2 code e.g. 'US', 'GB', 'IN', 'DE', etc.
  taxIdProvided: boolean;
  taxIdType?: 'vat' | 'ein' | 'gst' | 'pan' | 'abn' | 'other';
  billingEmail: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
  payoutStatus: PayoutOnboardingStatus;
  provider: 'stripe';
  providerAccountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirementsDue: string[];
  updatedAt: string;
}

export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'
  | 'refunded';

export type MilestonePaymentStatus =
  | 'pending'   // Invoice issued, funds not yet deposited by client
  | 'funded'    // Client advance deposit received for milestone
  | 'released'  // Deliverable approved by client, payout initiated to creator
  | 'refunded'; // Milestone payment refunded back to client

export interface InvoiceMilestone {
  id: string;
  milestoneAgreementId?: string;
  title: string;
  description?: string;
  amountMinor: number; // Stored in integer minor units (e.g. 25000 = $250.00, or 25000 = ¥25,000)
  status: MilestonePaymentStatus;
  dueCondition?: string;
  fundedAt?: string;
  releasedAt?: string;
  paymentRecordId?: string;
}

export interface ProjectInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0001"
  requestId: string;
  proposalId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  clientEmail?: string;
  editorId: string;
  editorName: string;
  editorBusinessName?: string;
  currency: CurrencyCode;
  subtotalMinor: number; // Sum of milestone amounts in minor units
  platformFeeMinor: number; // Marketplace fee in minor units
  platformFeeRate: number; // e.g. 0.05 (5%)
  taxMinor: number; // Tax in minor units (default 0 without tax nexus verification)
  taxRate: number; // e.g. 0.0
  totalMinor: number; // subtotal + platformFee + tax in minor units
  amountPaidMinor: number; // Total amount deposited/funded by client so far
  amountReleasedMinor: number; // Total amount paid out to creator so far
  status: InvoiceStatus;
  milestones: InvoiceMilestone[];
  issuedAt: string;
  dueDate?: string;
  notes?: string;
  taxComplianceNote?: string;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PaymentRecordStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  requestId: string;
  milestoneId?: string; // Set when payment funds a specific milestone
  clientId: string;
  editorId: string;
  amountMinor: number;
  currency: CurrencyCode;
  provider: 'stripe' | 'demo';
  providerPaymentId?: string;
  idempotencyKey: string;
  status: PaymentRecordStatus;
  isDemo: boolean;
  createdAt: string;
  settledAt?: string;
  failureReason?: string;
  refundReason?: string;
}

// ============================================================
// Minor-Unit Accounting & Precision Currency Math Helpers
// ============================================================

/**
 * Converts a decimal amount to integer minor units (cents, paise, or whole units for JPY).
 * Always uses Math.round to avoid IEEE-754 floating point inaccuracies.
 */
export function decimalToMinorUnits(
  decimalAmount: number,
  currencyCode: CurrencyCode | string = 'USD'
): number {
  if (isNaN(decimalAmount) || !isFinite(decimalAmount)) return 0;
  const code = (currencyCode || 'USD').toUpperCase() as CurrencyCode;
  const factor = SUPPORTED_CURRENCIES[code]?.minorUnitFactor ?? 100;
  return Math.round(decimalAmount * factor);
}

/**
 * Converts integer minor units to a decimal representation number.
 */
export function minorUnitsToDecimal(
  minorUnits: number,
  currencyCode: CurrencyCode | string = 'USD'
): number {
  if (isNaN(minorUnits) || !isFinite(minorUnits)) return 0;
  const code = (currencyCode || 'USD').toUpperCase() as CurrencyCode;
  const factor = SUPPORTED_CURRENCIES[code]?.minorUnitFactor ?? 100;
  return minorUnits / factor;
}

/**
 * Formats integer minor units into an authoritative localized currency string.
 * Example: formatMinorUnits(25000, 'USD') -> "$250.00 USD", formatMinorUnits(25000, 'JPY') -> "¥25,000 JPY"
 */
export function formatMinorUnits(
  minorUnits: number,
  currencyCode: CurrencyCode | string = 'USD'
): string {
  const code = (currencyCode || 'USD').toUpperCase() as CurrencyCode;
  const meta = SUPPORTED_CURRENCIES[code] || SUPPORTED_CURRENCIES.USD;
  const decimalVal = minorUnitsToDecimal(minorUnits, code);
  
  const formattedNumber = decimalVal.toLocaleString('en-US', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  });

  return `${meta.symbol}${formattedNumber} ${meta.code}`;
}

/**
 * Calculates marketplace platform fee in integer minor units.
 */
export function calculatePlatformFee(
  subtotalMinor: number,
  feeRate: number = DEFAULT_PLATFORM_FEE_RATE
): number {
  if (subtotalMinor <= 0) return 0;
  return Math.round(subtotalMinor * feeRate);
}

/**
 * Calculates authoritative invoice accounting totals in minor units.
 * Guarantees totalMinor = subtotalMinor + platformFeeMinor + taxMinor exactly.
 */
export function calculateInvoiceAccounting(
  milestoneAmountsMinor: number[],
  feeRate: number = DEFAULT_PLATFORM_FEE_RATE,
  taxRate: number = 0
): {
  subtotalMinor: number;
  platformFeeMinor: number;
  taxMinor: number;
  totalMinor: number;
} {
  const subtotalMinor = milestoneAmountsMinor.reduce((acc, curr) => acc + (curr > 0 ? curr : 0), 0);
  const platformFeeMinor = calculatePlatformFee(subtotalMinor, feeRate);
  const taxMinor = Math.round(subtotalMinor * taxRate);
  const totalMinor = subtotalMinor + platformFeeMinor + taxMinor;

  return {
    subtotalMinor,
    platformFeeMinor,
    taxMinor,
    totalMinor,
  };
}
