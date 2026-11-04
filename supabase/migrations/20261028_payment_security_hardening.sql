-- ============================================================
-- Migration: 20261028_payment_security_hardening.sql
-- Description: Financial audit trail hardening, immutability of settled
-- payment records, strict RLS preventing client-side status tampering,
-- and multi-currency constraints (USD, EUR, GBP, CAD, AUD, INR, JPY).
-- ============================================================

-- 1. Support INR and JPY in invoices and payment records
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS invoices_currency_check;

ALTER TABLE public.invoices
  ADD CONSTRAINT invoices_currency_check
  CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'));

ALTER TABLE public.payment_records
  DROP CONSTRAINT IF EXISTS payment_records_currency_check;

ALTER TABLE public.payment_records
  ADD CONSTRAINT payment_records_currency_check
  CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'));

-- 2. Financial accounting balance integrity invariants
ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS chk_invoices_paid_lte_total;

ALTER TABLE public.invoices
  ADD CONSTRAINT chk_invoices_paid_lte_total
  CHECK (amount_paid_minor <= total_minor);

ALTER TABLE public.invoices
  DROP CONSTRAINT IF EXISTS chk_invoices_released_lte_paid;

ALTER TABLE public.invoices
  ADD CONSTRAINT chk_invoices_released_lte_paid
  CHECK (amount_released_minor <= amount_paid_minor);

-- 3. Revoke insecure client-side insertion policy on payment_records
-- Old policy allowed clients to insert status='succeeded' directly from the browser!
DROP POLICY IF EXISTS "Clients can initiate payment records" ON public.payment_records;

-- New strict client initiation policy: Clients can ONLY create records with status 'pending'
CREATE POLICY "Clients can initiate pending payment records only"
  ON public.payment_records FOR INSERT
  WITH CHECK (
    auth.uid() = client_id
    AND status = 'pending'
  );

-- Only trusted server-side service role can update or mark payments succeeded/refunded
DROP POLICY IF EXISTS "Service role manages settled payments" ON public.payment_records;
CREATE POLICY "Service role manages settled payments"
  ON public.payment_records FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role' OR current_user = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR current_user = 'service_role');

-- 4. Audit trail immutability: Settled payments can never be deleted or altered
CREATE OR REPLACE FUNCTION public.enforce_payment_record_immutability()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent deletion of any settled or recorded payment
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Financial audit record deletion forbidden for payment_records id %', OLD.id;
  END IF;

  -- Once settled as succeeded or refunded, record cannot be modified
  IF OLD.status IN ('succeeded', 'refunded') THEN
    IF NEW.status != OLD.status OR NEW.amount_minor != OLD.amount_minor OR NEW.currency != OLD.currency THEN
      RAISE EXCEPTION 'Settled payment record % is immutable and cannot be altered.', OLD.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payment_record_immutability ON public.payment_records;
CREATE TRIGGER trg_payment_record_immutability
  BEFORE UPDATE OR DELETE ON public.payment_records
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_payment_record_immutability();

-- 5. Additional performance indexes for settlement and reconciliation
CREATE INDEX IF NOT EXISTS idx_payment_records_status_created ON public.payment_records(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_records_provider_payment_id ON public.payment_records(provider_payment_id);
