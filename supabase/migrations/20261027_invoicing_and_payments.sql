-- ============================================================
-- Migration: 20261027_invoicing_and_payments.sql
-- Description: Creator business onboarding, invoices, milestone ledger,
-- and payment records with Row Level Security for Pixel Media.
-- ============================================================

-- 1. Creator Payout & Business Profiles Table
CREATE TABLE IF NOT EXISTS public.creator_payout_profiles (
  editor_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL DEFAULT 'individual' CHECK (business_type IN ('individual', 'company')),
  legal_name TEXT NOT NULL,
  country TEXT NOT NULL,
  tax_id_provided BOOLEAN NOT NULL DEFAULT FALSE,
  tax_id_type TEXT,
  billing_email TEXT NOT NULL,
  address_line1 TEXT,
  city TEXT,
  postal_code TEXT,
  payout_status TEXT NOT NULL DEFAULT 'not_started' CHECK (payout_status IN ('not_started', 'pending_verification', 'enabled', 'restricted')),
  provider TEXT NOT NULL DEFAULT 'stripe',
  provider_account_id TEXT,
  charges_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  payouts_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  requirements_due JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Project Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE RESTRICT,
  proposal_id TEXT NOT NULL,
  project_title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id),
  client_name TEXT NOT NULL,
  client_email TEXT,
  editor_id UUID NOT NULL REFERENCES auth.users(id),
  editor_name TEXT NOT NULL,
  editor_business_name TEXT,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
  platform_fee_minor BIGINT NOT NULL CHECK (platform_fee_minor >= 0),
  platform_fee_rate NUMERIC NOT NULL DEFAULT 0.05,
  tax_minor BIGINT NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  tax_rate NUMERIC NOT NULL DEFAULT 0.0,
  total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
  amount_paid_minor BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid_minor >= 0),
  amount_released_minor BIGINT NOT NULL DEFAULT 0 CHECK (amount_released_minor >= 0),
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'cancelled', 'refunded')),
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  notes TEXT,
  tax_compliance_note TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Invoice Milestones Ledger Table
CREATE TABLE IF NOT EXISTS public.invoice_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  milestone_agreement_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funded', 'released', 'refunded')),
  due_condition TEXT,
  funded_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Payment Records & Transaction History Table
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE RESTRICT,
  milestone_id UUID REFERENCES public.invoice_milestones(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES auth.users(id),
  editor_id UUID NOT NULL REFERENCES auth.users(id),
  amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD')),
  provider TEXT NOT NULL CHECK (provider IN ('stripe', 'demo')),
  provider_payment_id TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  failure_reason TEXT,
  refund_reason TEXT
);

-- 5. Indexes for fast participant queries
CREATE INDEX IF NOT EXISTS idx_creator_payout_profiles_status ON public.creator_payout_profiles(payout_status);
CREATE INDEX IF NOT EXISTS idx_invoices_request_id ON public.invoices(request_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_editor_id ON public.invoices(editor_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_milestones_invoice_id ON public.invoice_milestones(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_invoice_id ON public.payment_records(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_client_id ON public.payment_records(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_editor_id ON public.payment_records(editor_id);

-- 6. Row Level Security Policies

ALTER TABLE public.creator_payout_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Creator Payout Profile Policies: Only the creator can view and update their payout setup
DROP POLICY IF EXISTS "Creators can view their own payout profile" ON public.creator_payout_profiles;
CREATE POLICY "Creators can view their own payout profile"
  ON public.creator_payout_profiles FOR SELECT
  USING (auth.uid() = editor_id);

DROP POLICY IF EXISTS "Creators can upsert their own payout profile" ON public.creator_payout_profiles;
CREATE POLICY "Creators can upsert their own payout profile"
  ON public.creator_payout_profiles FOR ALL
  USING (auth.uid() = editor_id)
  WITH CHECK (auth.uid() = editor_id);

-- Invoice Policies: Both the client and the editor can view their invoices
DROP POLICY IF EXISTS "Participants can view project invoices" ON public.invoices;
CREATE POLICY "Participants can view project invoices"
  ON public.invoices FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = editor_id);

-- Invoice Milestones Policies: Participants can view milestone records
DROP POLICY IF EXISTS "Participants can view invoice milestones" ON public.invoice_milestones;
CREATE POLICY "Participants can view invoice milestones"
  ON public.invoice_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      WHERE invoices.id = invoice_milestones.invoice_id
      AND (invoices.client_id = auth.uid() OR invoices.editor_id = auth.uid())
    )
  );

-- Payment Records Policies: Participants can view payments for their projects
DROP POLICY IF EXISTS "Participants can view payment records" ON public.payment_records;
CREATE POLICY "Participants can view payment records"
  ON public.payment_records FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = editor_id);

-- Clients can create payment records when funding milestones
DROP POLICY IF EXISTS "Clients can initiate payment records" ON public.payment_records;
CREATE POLICY "Clients can initiate payment records"
  ON public.payment_records FOR INSERT
  WITH CHECK (auth.uid() = client_id);
