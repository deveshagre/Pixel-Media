-- ============================================================
-- Migration: 20261027_collaboration_workspace.sql
-- Description: Creates project_messages, project_review_versions,
-- and project_review_comments tables for Pixel Media collaboration workspace.
-- Includes full Row Level Security (RLS) policies.
-- ============================================================

-- 1. Project Messages Table
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'editor')),
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 3000),
  read_by JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_messages_request_id ON public.project_messages(request_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_created_at ON public.project_messages(created_at);

ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view project messages" ON public.project_messages;
CREATE POLICY "Participants can view project messages"
  ON public.project_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can insert project messages" ON public.project_messages;
CREATE POLICY "Participants can insert project messages"
  ON public.project_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_messages.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
        AND pr.status IN ('accepted', 'in_progress', 'completed')
    )
  );

-- 2. Project Review Versions Table
CREATE TABLE IF NOT EXISTS public.project_review_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  version_number INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  notes TEXT,
  submitted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'changes_requested', 'approved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_review_versions_request ON public.project_review_versions(request_id);
CREATE INDEX IF NOT EXISTS idx_project_review_versions_created ON public.project_review_versions(created_at);

ALTER TABLE public.project_review_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view review versions" ON public.project_review_versions;
CREATE POLICY "Participants can view review versions"
  ON public.project_review_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_versions.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators and participants can insert review versions" ON public.project_review_versions;
CREATE POLICY "Creators and participants can insert review versions"
  ON public.project_review_versions FOR INSERT
  WITH CHECK (
    auth.uid() = submitted_by AND
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_versions.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
        AND pr.status IN ('accepted', 'in_progress', 'completed')
    )
  );

DROP POLICY IF EXISTS "Participants can update review versions" ON public.project_review_versions;
CREATE POLICY "Participants can update review versions"
  ON public.project_review_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_versions.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );

-- 3. Project Review Comments Table
CREATE TABLE IF NOT EXISTS public.project_review_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES public.project_review_versions(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_role TEXT NOT NULL CHECK (author_role IN ('client', 'editor')),
  timestamp_seconds INT,
  timestamp_display TEXT,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  reply_content TEXT,
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_review_comments_version ON public.project_review_comments(version_id);
CREATE INDEX IF NOT EXISTS idx_project_review_comments_request ON public.project_review_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_project_review_comments_timestamp ON public.project_review_comments(timestamp_seconds);

ALTER TABLE public.project_review_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view review comments" ON public.project_review_comments;
CREATE POLICY "Participants can view review comments"
  ON public.project_review_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_comments.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Participants can insert review comments" ON public.project_review_comments;
CREATE POLICY "Participants can insert review comments"
  ON public.project_review_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_comments.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
        AND pr.status IN ('accepted', 'in_progress', 'completed')
    )
  );

DROP POLICY IF EXISTS "Participants can update review comments" ON public.project_review_comments;
CREATE POLICY "Participants can update review comments"
  ON public.project_review_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_requests pr
      WHERE pr.id = project_review_comments.request_id
        AND (pr.client_id = auth.uid() OR pr.editor_id = auth.uid())
    )
  );
