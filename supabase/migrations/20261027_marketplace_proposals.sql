-- ============================================================
-- Migration: 20261027_marketplace_proposals.sql
-- Description: Adds proposal, quote fields, milestones, and extended
-- statuses to project_requests table for Pixel Media marketplace.
-- ============================================================

-- 1. Update status check constraint on project_requests
ALTER TABLE public.project_requests
  DROP CONSTRAINT IF EXISTS project_requests_status_check;

ALTER TABLE public.project_requests
  ADD CONSTRAINT project_requests_status_check
  CHECK (status IN (
    'pending',
    'quoted',
    'accepted',
    'in_progress',
    'completed',
    'declined',
    'cancelled'
  ));

-- 2. Add proposal metadata and completion fields
ALTER TABLE public.project_requests
  ADD COLUMN IF NOT EXISTS proposal JSONB,
  ADD COLUMN IF NOT EXISTS final_deliverables_url TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- 3. Update RLS policies to allow creators to submit proposals and clients to accept them
-- Editors can update requests sent to them (including proposal and status transitions)
DROP POLICY IF EXISTS "Editors can update request status" ON public.project_requests;

CREATE POLICY "Editors can update proposal and request status"
  ON public.project_requests FOR UPDATE
  USING (auth.uid() = editor_id)
  WITH CHECK (auth.uid() = editor_id);

-- Clients can update their own requests (accept/reject quote or cancel before accepted)
DROP POLICY IF EXISTS "Clients can cancel their own requests" ON public.project_requests;

CREATE POLICY "Clients can review, accept, or cancel their requests"
  ON public.project_requests FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- 4. Index for fast status querying
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);
