-- =========================================================
-- RPC function to fetch all applications (bypasses RLS)
-- Run this in Supabase SQL Editor after FIX_APP_ADMIN_ACCESS.sql
-- =========================================================

CREATE OR REPLACE FUNCTION get_all_applications()
RETURNS TABLE (
  id UUID,
  application_id VARCHAR,
  user_id UUID,
  visa_program_id UUID,
  country_id UUID,
  application_type VARCHAR,
  status VARCHAR,
  priority VARCHAR,
  personal_info JSONB,
  education_history JSONB,
  work_history JSONB,
  document_checklist JSONB,
  submitted_at TIMESTAMPTZ,
  review_started_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  estimated_completion DATE,
  assigned_consultant UUID,
  consultant_notes TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_profile_full_name TEXT,
  user_profile_email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.application_id,
    a.user_id,
    a.visa_program_id,
    a.country_id,
    a.application_type,
    a.status,
    a.priority,
    a.personal_info,
    a.education_history,
    a.work_history,
    a.document_checklist,
    a.submitted_at,
    a.review_started_at,
    a.decision_at,
    a.estimated_completion,
    a.assigned_consultant,
    a.consultant_notes,
    a.meta,
    a.created_at,
    a.updated_at,
    up.full_name AS user_profile_full_name,
    up.email AS user_profile_email
  FROM applications a
  LEFT JOIN user_profiles up ON up.id = a.user_id
  ORDER BY a.created_at DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_applications() TO authenticated;
