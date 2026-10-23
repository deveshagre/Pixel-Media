-- ============================================================
-- Pixel Pedia — Freelancing Marketplace Schema Migration
-- Run AFTER the existing schema.sql
-- ============================================================

-- 1. Add marketplace columns to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' CHECK (role IN ('client', 'editor', 'admin')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('beginner', 'pro')),
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  ADD COLUMN IF NOT EXISTS starting_price INTEGER,
  ADD COLUMN IF NOT EXISTS contact_for_quote BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Drop old restrictive SELECT policy and add public profile access
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view published editor profiles"
  ON public.profiles FOR SELECT
  USING (
    is_published = true
    OR auth.uid() = id
  );

-- 2. Categories table (admin-managed, data-driven)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  icon_name TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed initial categories
INSERT INTO public.categories (name, slug, description, icon_name, sort_order) VALUES
  ('Video Editing', 'video-editing', 'Professional video editing and post-production', 'Film', 1),
  ('Motion Graphics & Animation', 'motion-graphics', 'Animated titles, explainers, VFX, compositing', 'Sparkles', 2),
  ('Photo Editing', 'photo-editing', 'Retouching, product photography, color correction', 'Image', 3),
  ('Graphic Design', 'graphic-design', 'Thumbnails, posters, social media graphics, branding', 'Palette', 4),
  ('Audio Editing', 'audio-editing', 'Podcast cleanup, dialogue editing, sound design, mixing', 'Headphones', 5),
  ('Other Creative Services', 'other', 'Other creative editing services', 'Layers', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed subcategories
INSERT INTO public.categories (name, slug, description, parent_id, sort_order)
SELECT sub.name, sub.slug, sub.description, p.id, sub.sort_order
FROM (VALUES
  ('YouTube Videos', 'youtube-videos', 'Long-form YouTube content editing', 'video-editing', 1),
  ('Short-Form Content', 'short-form', 'Reels, TikTok, Shorts editing', 'video-editing', 2),
  ('Gaming & Esports', 'gaming-esports', 'Gaming highlights, esports content', 'video-editing', 3),
  ('Podcasts', 'podcasts-video', 'Video podcast editing', 'video-editing', 4),
  ('Commercials', 'commercials', 'Commercial and ad video editing', 'video-editing', 5),
  ('Animated Titles', 'animated-titles', 'Motion title design and animation', 'motion-graphics', 1),
  ('Explainer Videos', 'explainers', 'Animated explainer videos', 'motion-graphics', 2),
  ('VFX', 'vfx', 'Visual effects and compositing', 'motion-graphics', 3),
  ('Compositing', 'compositing', 'Multi-layer compositing', 'motion-graphics', 4),
  ('Photo Retouching', 'retouching', 'Beauty and portrait retouching', 'photo-editing', 1),
  ('Product Photography', 'product-photography', 'E-commerce product photo editing', 'photo-editing', 2),
  ('Color Correction', 'color-correction', 'Professional color grading', 'photo-editing', 3),
  ('Thumbnails', 'thumbnails', 'YouTube and social media thumbnails', 'graphic-design', 1),
  ('Posters', 'posters', 'Poster and print design', 'graphic-design', 2),
  ('Social Media Graphics', 'social-graphics', 'Social media visual content', 'graphic-design', 3),
  ('Branding', 'branding', 'Brand identity and logo design', 'graphic-design', 4),
  ('Podcast Cleanup', 'podcast-cleanup', 'Audio cleanup and enhancement', 'audio-editing', 1),
  ('Dialogue Editing', 'dialogue-editing', 'Dialogue editing and ADR', 'audio-editing', 2),
  ('Sound Design', 'sound-design', 'Custom sound design and foley', 'audio-editing', 3),
  ('Mixing & Mastering', 'mixing-mastering', 'Professional audio mixing and mastering', 'audio-editing', 4)
) AS sub(name, slug, description, parent_slug, sort_order)
JOIN public.categories p ON p.slug = sub.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- 3. Editor services (what services an editor offers)
CREATE TABLE IF NOT EXISTS public.editor_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(editor_id, category_id)
);

ALTER TABLE public.editor_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read editor services"
  ON public.editor_services FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage their own services"
  ON public.editor_services FOR ALL
  USING (auth.uid() = editor_id)
  WITH CHECK (auth.uid() = editor_id);

-- 4. Editor software (tools used by an editor)
CREATE TABLE IF NOT EXISTS public.editor_software (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(editor_id, name)
);

ALTER TABLE public.editor_software ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read editor software"
  ON public.editor_software FOR SELECT
  USING (true);

CREATE POLICY "Editors can manage their own software"
  ON public.editor_software FOR ALL
  USING (auth.uid() = editor_id)
  WITH CHECK (auth.uid() = editor_id);

-- 5. Portfolio items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  editor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'animation', 'external_link')),
  external_link TEXT,
  software_used TEXT[],
  editor_role TEXT,
  project_duration TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published portfolio items"
  ON public.portfolio_items FOR SELECT
  USING (
    status = 'published'
    OR auth.uid() = editor_id
  );

CREATE POLICY "Editors can manage their own portfolio"
  ON public.portfolio_items FOR INSERT
  WITH CHECK (auth.uid() = editor_id);

CREATE POLICY "Editors can update their own portfolio"
  ON public.portfolio_items FOR UPDATE
  USING (auth.uid() = editor_id);

CREATE POLICY "Editors can delete their own portfolio"
  ON public.portfolio_items FOR DELETE
  USING (auth.uid() = editor_id);

-- 6. Project requests (client hires editor)
CREATE TABLE IF NOT EXISTS public.project_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  deliverables TEXT,
  reference_links TEXT[],
  budget_min INTEGER,
  budget_max INTEGER,
  request_quote BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'declined', 'cancelled', 'completed'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own requests"
  ON public.project_requests FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Editors can view requests sent to them"
  ON public.project_requests FOR SELECT
  USING (auth.uid() = editor_id);

CREATE POLICY "Clients can create requests"
  ON public.project_requests FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can cancel their own requests"
  ON public.project_requests FOR UPDATE
  USING (auth.uid() = client_id);

CREATE POLICY "Editors can update request status"
  ON public.project_requests FOR UPDATE
  USING (auth.uid() = editor_id);

-- 7. Reports (moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('portfolio_item', 'profile', 'project_request')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports"
  ON public.reports FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 8. Admin settings
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by UUID REFERENCES public.profiles(id)
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON public.admin_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seed default settings
INSERT INTO public.admin_settings (key, value) VALUES
  ('learning_url', '"https://pixelpedia.com/learn"'),
  ('featured_editors_count', '6'),
  ('max_portfolio_items', '20')
ON CONFLICT (key) DO NOTHING;

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_published ON public.profiles(is_published);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_editor_services_editor ON public.editor_services(editor_id);
CREATE INDEX IF NOT EXISTS idx_editor_services_category ON public.editor_services(category_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_editor ON public.portfolio_items(editor_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_status ON public.portfolio_items(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_client ON public.project_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_editor ON public.project_requests(editor_id);
CREATE INDEX IF NOT EXISTS idx_project_requests_status ON public.project_requests(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- 10. Update the handle_new_user trigger to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Admin policies for profiles (admin can see all)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin policies for portfolio items
CREATE POLICY "Admins can manage all portfolio items"
  ON public.portfolio_items FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
