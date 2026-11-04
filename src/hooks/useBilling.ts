// ============================================================
// Pixel Media — Invoicing, Milestone Accounting & Payments Hook
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  CurrencyCode,
  CreatorPayoutProfile,
  ProjectInvoice,
  InvoiceMilestone,
  PaymentRecord,
  decimalToMinorUnits,
  calculateInvoiceAccounting,
  DEFAULT_PLATFORM_FEE_RATE,
} from '../types/billing';
import { ProjectRequest, ProjectProposal } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const LOCAL_STORAGE_INVOICES_KEY = 'pixel_media_invoices';
const LOCAL_STORAGE_PAYOUTS_KEY = 'pixel_media_creator_payouts';
const LOCAL_STORAGE_PAYMENTS_KEY = 'pixel_media_payment_records';

// Fallback seed invoices for demo mode
const INITIAL_DEMO_INVOICES: ProjectInvoice[] = [
  {
    id: 'inv-seed-001',
    invoiceNumber: 'INV-2026-0001',
    requestId: 'req-accepted-1',
    proposalId: 'prop-sample-1',
    projectTitle: 'Cyberpunk Brand Anthem — Director Cut',
    clientId: 'mock-client-1',
    clientName: 'Nexus Interactive',
    clientEmail: 'producer@nexusinteractive.com',
    editorId: 'mock-editor-1',
    editorName: 'Elena Rostova',
    editorBusinessName: 'Rostova Cinematic Studio LLC',
    currency: 'USD',
    subtotalMinor: 140000, // $1,400.00
    platformFeeMinor: 7000, // $70.00 (5%)
    platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
    taxMinor: 0,
    taxRate: 0,
    totalMinor: 147000, // $1,470.00
    amountPaidMinor: 73500, // $735.00 funded for Milestone 1
    amountReleasedMinor: 0,
    status: 'partially_paid',
    issuedAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'Commercial terms: Deliverables-based milestone schedule arranged directly between parties.',
    taxComplianceNote: 'Marketplace platform facilitation. VAT/Tax compliance responsibility rests with the contracting parties. Clients and editors arrange payments directly between themselves, outside Pixel Media. Pixel Media does not process or track payments.',
    isDemo: true,
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    milestones: [
      {
        id: 'ms-inv-1',
        milestoneAgreementId: 'ms-1',
        title: 'V1 Rough Assembly & Mood Soundscape',
        description: 'First assembly timeline with sync sound and preliminary pacing.',
        amountMinor: 70000, // $700.00
        status: 'funded',
        dueCondition: 'Delivery of Review Version 1',
        fundedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'ms-inv-2',
        milestoneAgreementId: 'ms-2',
        title: 'V2 Color Grade, Sound Mix & Final Conform',
        description: 'Final 4K ProRes 422 HQ master, split stems, and web exports.',
        amountMinor: 70000, // $700.00
        status: 'pending',
        dueCondition: 'Final client sign-off and delivery approval',
      },
    ],
  },
];

const INITIAL_DEMO_PAYOUT_PROFILES: Record<string, CreatorPayoutProfile> = {
  'mock-editor-1': {
    editorId: 'mock-editor-1',
    businessType: 'company',
    legalName: 'Elena Rostova Studio LLC',
    country: 'US',
    taxIdProvided: true,
    taxIdType: 'ein',
    billingEmail: 'elena@rostovacinema.com',
    addressLine1: '1440 Broadway Ave, Suite 600',
    city: 'New York',
    postalCode: '10018',
    payoutStatus: 'enabled',
    provider: 'stripe',
    providerAccountId: 'acct_demo_rostova',
    chargesEnabled: true,
    payoutsEnabled: true,
    requirementsDue: [],
    updatedAt: new Date().toISOString(),
  },
};

const INITIAL_DEMO_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-seed-001',
    invoiceId: 'inv-seed-001',
    requestId: 'req-accepted-1',
    milestoneId: 'ms-inv-1',
    clientId: 'mock-client-1',
    editorId: 'mock-editor-1',
    amountMinor: 73500, // $700 + $35 platform fee
    currency: 'USD',
    provider: 'demo',
    providerPaymentId: 'demo_pi_99214',
    idempotencyKey: 'idem_seed_001',
    status: 'succeeded',
    isDemo: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    settledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

// Local storage reader helpers
function getStoredInvoices(): ProjectInvoice[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_INVOICES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(INITIAL_DEMO_INVOICES));
      return INITIAL_DEMO_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_INVOICES;
  }
}

function saveStoredInvoices(invoices: ProjectInvoice[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_INVOICES_KEY, JSON.stringify(invoices));
  } catch (err) {
    console.error('Failed to save invoices to local storage:', err);
  }
}

function getStoredPayoutProfiles(): Record<string, CreatorPayoutProfile> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PAYOUTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PAYOUTS_KEY, JSON.stringify(INITIAL_DEMO_PAYOUT_PROFILES));
      return INITIAL_DEMO_PAYOUT_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PAYOUT_PROFILES;
  }
}

function saveStoredPayoutProfiles(profiles: Record<string, CreatorPayoutProfile>) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PAYOUTS_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save payout profiles:', err);
  }
}

function getStoredPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PAYMENTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_DEMO_PAYMENTS));
      return INITIAL_DEMO_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PAYMENTS;
  }
}

function saveStoredPayments(payments: PaymentRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  } catch (err) {
    console.error('Failed to save payments:', err);
  }
}

export function useBilling() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<ProjectInvoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [payoutProfile, setPayoutProfile] = useState<CreatorPayoutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load invoices, payments, and creator payout profile
  const refreshBillingData = useCallback(async () => {
    if (!user) {
      setInvoices([]);
      setPayments([]);
      setPayoutProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isSupabaseConfigured && supabase) {
        // Fetch from Supabase
        const { data: invData, error: invErr } = await supabase
          .from('invoices')
          .select('*, milestones:invoice_milestones(*)');

        if (invErr) throw invErr;

        const { data: payData, error: payErr } = await supabase
          .from('payment_records')
          .select('*')
          .order('created_at', { ascending: false });

        if (payErr) throw payErr;

        if (user.role === 'editor') {
          const { data: profData } = await supabase
            .from('creator_payout_profiles')
            .select('*')
            .eq('editor_id', user.id)
            .single();

          if (profData) {
            setPayoutProfile({
              editorId: profData.editor_id,
              businessType: profData.business_type,
              legalName: profData.legal_name,
              country: profData.country,
              taxIdProvided: profData.tax_id_provided,
              taxIdType: profData.tax_id_type,
              billingEmail: profData.billing_email,
              addressLine1: profData.address_line1,
              city: profData.city,
              postalCode: profData.postal_code,
              payoutStatus: profData.payout_status,
              provider: profData.provider,
              providerAccountId: profData.provider_account_id,
              chargesEnabled: profData.charges_enabled,
              payoutsEnabled: profData.payouts_enabled,
              requirementsDue: profData.requirements_due || [],
              updatedAt: profData.updated_at,
            });
          }
        }

        setInvoices(invData as ProjectInvoice[]);
        setPayments(payData as PaymentRecord[]);
      } else {
        // Local demo mode
        const allInvoices = getStoredInvoices();
        const userInvoices = allInvoices.filter(
          (inv) => inv.clientId === user.id || inv.editorId === user.id
        );
        setInvoices(userInvoices);

        const allPayments = getStoredPayments();
        const userPayments = allPayments.filter(
          (p) => p.clientId === user.id || p.editorId === user.id
        );
        setPayments(userPayments);

        const profiles = getStoredPayoutProfiles();
        setPayoutProfile(profiles[user.id] || null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load billing records.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshBillingData();
  }, [refreshBillingData]);

  /**
   * Automatically creates a formal ProjectInvoice when a Proposal is accepted.
   * Guarantees prices and milestone splits strictly match the agreed proposal.
   */
  const createInvoiceForProposal = useCallback(
    async (
      request: ProjectRequest,
      proposal: ProjectProposal,
      currency: CurrencyCode = 'USD'
    ): Promise<ProjectInvoice> => {
      // Check if invoice already exists for this request
      const existingInvoices = getStoredInvoices();
      const existing = existingInvoices.find((i) => i.requestId === request.id);
      if (existing) {
        return existing;
      }

      // Calculate milestone splits
      let invoiceMilestones: InvoiceMilestone[] = [];

      if (proposal.milestones && proposal.milestones.length > 0) {
        invoiceMilestones = proposal.milestones.map((m, idx) => ({
          id: `ms-inv-${Date.now()}-${idx + 1}`,
          milestoneAgreementId: m.id,
          title: m.title,
          description: m.description,
          amountMinor: decimalToMinorUnits(m.amount),
          status: 'pending',
          dueCondition: `Milestone ${idx + 1} completion and sign-off`,
        }));
      } else {
        // Fallback: single milestone for full quoted price
        invoiceMilestones = [
          {
            id: `ms-inv-${Date.now()}-1`,
            title: 'Full Production Master & Final Delivery',
            description: proposal.scopeSummary || 'Project deliverables according to agreed proposal.',
            amountMinor: decimalToMinorUnits(proposal.quotedPrice),
            status: 'pending',
            dueCondition: 'Final master export review and client approval',
          },
        ];
      }

      // Calculate authoritative totals with minor unit precision
      const amountsMinor = invoiceMilestones.map((m) => m.amountMinor);
      const accounting = calculateInvoiceAccounting(amountsMinor, DEFAULT_PLATFORM_FEE_RATE, 0);

      const seq = existingInvoices.length + 1;
      const invoiceNumber = `INV-2026-${String(seq).padStart(4, '0')}`;

      const newInvoice: ProjectInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber,
        requestId: request.id,
        proposalId: proposal.id,
        projectTitle: request.title,
        clientId: request.clientId,
        clientName: request.client?.fullName || 'Client Producer',
        clientEmail: request.client?.email,
        editorId: request.editorId,
        editorName: request.editor?.fullName || 'Creator',
        currency,
        subtotalMinor: accounting.subtotalMinor,
        platformFeeMinor: accounting.platformFeeMinor,
        platformFeeRate: DEFAULT_PLATFORM_FEE_RATE,
        taxMinor: accounting.taxMinor,
        taxRate: 0,
        totalMinor: accounting.totalMinor,
        amountPaidMinor: 0,
        amountReleasedMinor: 0,
        status: 'issued',
        milestones: invoiceMilestones,
        issuedAt: new Date().toISOString(),
        dueDate: proposal.estimatedDelivery || undefined,
        notes: `Proposal reference #${proposal.id.slice(0, 8)}. Scope: ${proposal.scopeSummary}`,
        taxComplianceNote: 'Platform intermediary invoice. Official B2B tax exemptions apply where validated.',
        isDemo: !isSupabaseConfigured,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error: insertErr } = await supabase.from('invoices').insert({
          id: newInvoice.id,
          invoice_number: newInvoice.invoiceNumber,
          request_id: newInvoice.requestId,
          proposal_id: newInvoice.proposalId,
          project_title: newInvoice.projectTitle,
          client_id: newInvoice.clientId,
          client_name: newInvoice.clientName,
          client_email: newInvoice.clientEmail,
          editor_id: newInvoice.editorId,
          editor_name: newInvoice.editorName,
          currency: newInvoice.currency,
          subtotal_minor: newInvoice.subtotalMinor,
          platform_fee_minor: newInvoice.platformFeeMinor,
          platform_fee_rate: newInvoice.platformFeeRate,
          tax_minor: newInvoice.taxMinor,
          tax_rate: newInvoice.taxRate,
          total_minor: newInvoice.totalMinor,
          amount_paid_minor: 0,
          amount_released_minor: 0,
          status: newInvoice.status,
          issued_at: newInvoice.issuedAt,
          due_date: newInvoice.dueDate,
          notes: newInvoice.notes,
          tax_compliance_note: newInvoice.taxComplianceNote,
          is_demo: false,
        });

        if (insertErr) throw insertErr;

        // Insert milestones
        const msRows = newInvoice.milestones.map((m) => ({
          id: m.id,
          invoice_id: newInvoice.id,
          milestone_agreement_id: m.milestoneAgreementId,
          title: m.title,
          description: m.description,
          amount_minor: m.amountMinor,
          status: m.status,
          due_condition: m.dueCondition,
        }));
        await supabase.from('invoice_milestones').insert(msRows);
      } else {
        // Save to demo local storage
        const updated = [newInvoice, ...existingInvoices];
        saveStoredInvoices(updated);
      }

      await refreshBillingData();
      return newInvoice;
    },
    [refreshBillingData]
  );

  /**
   * Client funds a milestone advance deposit.
   * Records a dedicated PaymentRecord and updates milestone status to 'funded'.
   */
  const fundMilestone = useCallback(
    async (
      invoiceId: string,
      milestoneId: string,
      idempotencyKey?: string
    ): Promise<PaymentRecord> => {
      if (!user) throw new Error('Authentication required.');

      const key = idempotencyKey || `idem_${invoiceId}_${milestoneId}_${Date.now()}`;
      const allInvoices = getStoredInvoices();
      const targetInvoice = allInvoices.find((i) => i.id === invoiceId);

      if (!targetInvoice) {
        throw new Error('Invoice not found.');
      }

      // Authorization guard: Only the client can fund their invoice
      if (targetInvoice.clientId !== user.id) {
        throw new Error('Unauthorized: You cannot pay an invoice on behalf of another client.');
      }

      const targetMilestone = targetInvoice.milestones.find((m) => m.id === milestoneId);
      if (!targetMilestone) {
        throw new Error('Milestone not found on this invoice.');
      }

      if (targetMilestone.status === 'funded' || targetMilestone.status === 'released') {
        throw new Error('This milestone has already been funded.');
      }

      // Calculate payable minor units on server-verified rules
      const milestoneFeeMinor = Math.round(
        targetMilestone.amountMinor * targetInvoice.platformFeeRate
      );
      const payableAmountMinor = targetMilestone.amountMinor + milestoneFeeMinor;

      // Create Payment Record (clearly tagged demo if running locally)
      const paymentRecord: PaymentRecord = {
        id: `pay_${Date.now()}`,
        invoiceId: targetInvoice.id,
        requestId: targetInvoice.requestId,
        milestoneId,
        clientId: user.id,
        editorId: targetInvoice.editorId,
        amountMinor: payableAmountMinor,
        currency: targetInvoice.currency,
        provider: isSupabaseConfigured ? 'stripe' : 'demo',
        providerPaymentId: `demo_pi_${Date.now().toString().slice(-6)}`,
        idempotencyKey: key,
        status: 'succeeded',
        isDemo: !isSupabaseConfigured,
        createdAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
      };

      // Update milestone status
      targetMilestone.status = 'funded';
      targetMilestone.fundedAt = new Date().toISOString();
      targetMilestone.paymentRecordId = paymentRecord.id;

      // Update invoice totals and status
      targetInvoice.amountPaidMinor += targetMilestone.amountMinor;
      const allFunded = targetInvoice.milestones.every(
        (m) => m.status === 'funded' || m.status === 'released'
      );
      targetInvoice.status = allFunded ? 'paid' : 'partially_paid';
      targetInvoice.updatedAt = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        await supabase.from('payment_records').insert({
          id: paymentRecord.id,
          invoice_id: paymentRecord.invoiceId,
          request_id: paymentRecord.requestId,
          milestone_id: paymentRecord.milestoneId,
          client_id: paymentRecord.clientId,
          editor_id: paymentRecord.editorId,
          amount_minor: paymentRecord.amountMinor,
          currency: paymentRecord.currency,
          provider: paymentRecord.provider,
          provider_payment_id: paymentRecord.providerPaymentId,
          idempotency_key: paymentRecord.idempotencyKey,
          status: paymentRecord.status,
          is_demo: false,
          settled_at: paymentRecord.settledAt,
        });

        await supabase
          .from('invoice_milestones')
          .update({
            status: 'funded',
            funded_at: targetMilestone.fundedAt,
          })
          .eq('id', milestoneId);

        await supabase
          .from('invoices')
          .update({
            amount_paid_minor: targetInvoice.amountPaidMinor,
            status: targetInvoice.status,
            updated_at: targetInvoice.updatedAt,
          })
          .eq('id', invoiceId);
      } else {
        const allPayments = getStoredPayments();
        saveStoredPayments([paymentRecord, ...allPayments]);
        saveStoredInvoices(allInvoices);
      }

      await refreshBillingData();
      return paymentRecord;
    },
    [user, refreshBillingData]
  );

  /**
   * Client releases funds for an approved milestone to the creator.
   * Milestone status transitions to 'released'.
   */
  const releaseMilestone = useCallback(
    async (invoiceId: string, milestoneId: string): Promise<void> => {
      if (!user) throw new Error('Authentication required.');

      const allInvoices = getStoredInvoices();
      const targetInvoice = allInvoices.find((i) => i.id === invoiceId);

      if (!targetInvoice) throw new Error('Invoice not found.');
      if (targetInvoice.clientId !== user.id) {
        throw new Error('Unauthorized: Only the client can approve and release milestone funds.');
      }

      const targetMilestone = targetInvoice.milestones.find((m) => m.id === milestoneId);
      if (!targetMilestone) throw new Error('Milestone not found.');
      if (targetMilestone.status !== 'funded') {
        throw new Error('Milestone must be funded before release.');
      }

      targetMilestone.status = 'released';
      targetMilestone.releasedAt = new Date().toISOString();
      targetInvoice.amountReleasedMinor += targetMilestone.amountMinor;
      targetInvoice.updatedAt = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('invoice_milestones')
          .update({
            status: 'released',
            released_at: targetMilestone.releasedAt,
          })
          .eq('id', milestoneId);

        await supabase
          .from('invoices')
          .update({
            amount_released_minor: targetInvoice.amountReleasedMinor,
            updated_at: targetInvoice.updatedAt,
          })
          .eq('id', invoiceId);
      } else {
        saveStoredInvoices(allInvoices);
      }

      await refreshBillingData();
    },
    [user, refreshBillingData]
  );

  /**
   * Creator updates business & payout settings (legal name, country, tax profile).
   */
  const saveCreatorPayoutProfile = useCallback(
    async (profileData: Partial<CreatorPayoutProfile>): Promise<CreatorPayoutProfile> => {
      if (!user || user.role !== 'editor') {
        throw new Error('Only creators can update payout settings.');
      }

      const existingProfiles = getStoredPayoutProfiles();
      const current = existingProfiles[user.id] || {
        editorId: user.id,
        businessType: 'individual',
        legalName: user.fullName || '',
        country: 'US',
        taxIdProvided: false,
        billingEmail: user.email || '',
        payoutStatus: 'not_started',
        provider: 'stripe',
        chargesEnabled: false,
        payoutsEnabled: false,
        requirementsDue: ['tax_id', 'bank_account'],
        updatedAt: new Date().toISOString(),
      };

      const updated: CreatorPayoutProfile = {
        ...current,
        ...profileData,
        editorId: user.id,
        updatedAt: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error: upsertErr } = await supabase
          .from('creator_payout_profiles')
          .upsert({
            editor_id: user.id,
            business_type: updated.businessType,
            legal_name: updated.legalName,
            country: updated.country,
            tax_id_provided: updated.taxIdProvided,
            tax_id_type: updated.taxIdType,
            billing_email: updated.billingEmail,
            address_line1: updated.addressLine1,
            city: updated.city,
            postal_code: updated.postalCode,
            payout_status: updated.payoutStatus,
            provider: updated.provider,
            provider_account_id: updated.providerAccountId,
            charges_enabled: updated.chargesEnabled,
            payouts_enabled: updated.payoutsEnabled,
            requirements_due: updated.requirementsDue,
            updated_at: updated.updatedAt,
          });

        if (upsertErr) throw upsertErr;
      } else {
        existingProfiles[user.id] = updated;
        saveStoredPayoutProfiles(existingProfiles);
      }

      setPayoutProfile(updated);
      return updated;
    },
    [user]
  );

  /**
   * Helper to look up an invoice by its associated project request ID.
   */
  const getInvoiceByRequestId = useCallback(
    (requestId: string): ProjectInvoice | undefined => {
      return invoices.find((i) => i.requestId === requestId);
    },
    [invoices]
  );

  return {
    invoices,
    payments,
    payoutProfile,
    loading,
    error,
    refreshBillingData,
    createInvoiceForProposal,
    fundMilestone,
    releaseMilestone,
    saveCreatorPayoutProfile,
    getInvoiceByRequestId,
  };
}
