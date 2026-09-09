-- Access log filters: extend event_type CHECK, add filter indexes,
-- and lock SELECT on interactions to super_admin / admin only.
-- Writers (anon + authenticated) may still INSERT page views / auth events.

-- ---------------------------------------------------------------------------
-- 1) Expand event_type CHECK (fixes application_submitted inserts failing)
-- ---------------------------------------------------------------------------
ALTER TABLE public.interactions
  DROP CONSTRAINT IF EXISTS interactions_event_type_check;

ALTER TABLE public.interactions
  ADD CONSTRAINT interactions_event_type_check
  CHECK (event_type IN (
    'page_view',
    'country_click',
    'program_click',
    'globe_interaction',
    'search',
    'consultation_book',
    'application_start',
    'application_submitted',
    'application_status_change',
    'document_download',
    'share',
    'signup',
    'login',
    'logout',
    'failed_login',
    'password_change'
  ));

-- ---------------------------------------------------------------------------
-- 2) Indexes for common filter columns
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_interactions_event_created
  ON public.interactions (event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interactions_created_desc
  ON public.interactions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interactions_page_path
  ON public.interactions (page_path);

CREATE INDEX IF NOT EXISTS idx_interactions_device_type
  ON public.interactions (device_type);

CREATE INDEX IF NOT EXISTS idx_interactions_browser
  ON public.interactions (browser);

CREATE INDEX IF NOT EXISTS idx_interactions_referrer
  ON public.interactions (referrer);

CREATE INDEX IF NOT EXISTS idx_interactions_user_created
  ON public.interactions (user_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- 3) RLS: public INSERT, SELECT only for super_admin / admin
-- ---------------------------------------------------------------------------
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all interactions" ON public.interactions;
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.interactions;
DROP POLICY IF EXISTS "Admins read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Public insert interactions" ON public.interactions;
DROP POLICY IF EXISTS "Staff read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Admins only read interactions" ON public.interactions;

-- Visitors (and signed-in users) can record events.
CREATE POLICY "Public insert interactions" ON public.interactions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only Super Administrator / Administrator may read the access log.
-- Non-admin staff (marketing, counselor, etc.) must not query guest/user activity.
CREATE POLICY "Admins only read interactions" ON public.interactions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles p
      WHERE p.id = auth.uid()
        AND lower(p.user_role::text) IN ('super_admin', 'superadmin', 'admin')
    )
  );
