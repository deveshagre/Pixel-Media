-- ============================================================
-- Migration: 20261029_communication_and_calls.sql
-- Description: Adds call_sessions table and realtime publication for
-- Pixel Media direct project communications (voice/video calls and chat).
-- Authoritative security & Row Level Security (RLS) enforcement.
-- ============================================================

-- 1. Project Call Sessions & Invitations Table
CREATE TABLE IF NOT EXISTS public.project_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  caller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  call_type TEXT NOT NULL CHECK (call_type IN ('voice', 'video')),
  status TEXT NOT NULL CHECK (status IN ('initiating', 'ringing', 'connected', 'ended', 'declined', 'missed')),
  room_url TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_project_calls_request_id ON public.project_calls(request_id);
CREATE INDEX IF NOT EXISTS idx_project_calls_caller ON public.project_calls(caller_id);
CREATE INDEX IF NOT EXISTS idx_project_calls_receiver ON public.project_calls(receiver_id);
CREATE INDEX IF NOT EXISTS idx_project_calls_status ON public.project_calls(status);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.project_calls ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Participants can view call records for their own projects
DROP POLICY IF EXISTS "Participants can view their project calls" ON public.project_calls;
CREATE POLICY "Participants can view their project calls"
  ON public.project_calls FOR SELECT
  USING (
    (auth.uid() = caller_id OR auth.uid() = receiver_id)
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_calls.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );

-- 4. Policy: Only authorized project participants can initiate calls
DROP POLICY IF EXISTS "Participants can initiate project calls" ON public.project_calls;
CREATE POLICY "Participants can initiate project calls"
  ON public.project_calls FOR INSERT
  WITH CHECK (
    auth.uid() = caller_id
    AND caller_id <> receiver_id
    AND EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_calls.request_id
        AND (
          (pr.client_id = caller_id AND pr.editor_id = receiver_id)
          OR (pr.editor_id = caller_id AND pr.client_id = receiver_id)
        )
        AND pr.status IN ('accepted', 'in_progress', 'completed')
    )
  );

-- 5. Policy: Call participants can update call status (accept, decline, end)
DROP POLICY IF EXISTS "Participants can update call status" ON public.project_calls;
CREATE POLICY "Participants can update call status"
  ON public.project_calls FOR UPDATE
  USING (
    (auth.uid() = caller_id OR auth.uid() = receiver_id)
  )
  WITH CHECK (
    (auth.uid() = caller_id OR auth.uid() = receiver_id)
  );

-- 6. Add to Realtime Publication if present
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_calls;
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
