-- ============================================================
-- Pixel Media Client Portal: Production Database Schema & RLS
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi', 'de', 'fr')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'video_editing',
    'image_editing',
    'audio_editing',
    'esports_gaming',
    'graphic_design',
    'motion_graphics'
  )),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN (
    'requested',
    'in_progress',
    'in_review',
    'completed',
    'cancelled'
  )),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  deadline TIMESTAMPTZ,
  description TEXT,
  deliverables_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view only their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert projects for themselves"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = client_id);

-- 4. Service Requests Table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_category TEXT NOT NULL CHECK (service_category IN (
    'video_editing',
    'image_editing',
    'audio_editing',
    'esports_gaming',
    'graphic_design',
    'motion_graphics'
  )),
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard', 'express', 'rush')),
  budget_range TEXT,
  assets_url TEXT,
  target_format TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_production', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Service Requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view only their own service requests"
  ON public.service_requests FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can insert their own service requests"
  ON public.service_requests FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 5. Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'billing', 'project_revision', 'technical', 'deadline')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on Support Tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view only their own support tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- 6. Trigger to automatically create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
