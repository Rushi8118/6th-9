-- Hardening for the live access log (interactions).
-- Prefer applying the versioned migration:
--   supabase/migrations/20260908042941_interactions_access_log_filters.sql
-- This file is a convenient SQL Editor copy for production hotfixing.

ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Allow all interactions" ON public.interactions;
DROP POLICY IF EXISTS "Anyone can insert interactions" ON public.interactions;
DROP POLICY IF EXISTS "Admins read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Public insert interactions" ON public.interactions;
DROP POLICY IF EXISTS "Staff read interactions" ON public.interactions;
DROP POLICY IF EXISTS "Admins only read interactions" ON public.interactions;

CREATE POLICY "Public insert interactions" ON public.interactions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- SELECT restricted to super_admin / admin only (not marketing/manager/staff).
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
