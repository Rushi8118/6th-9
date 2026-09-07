-- =========================================================
-- RPC function to fetch all applications (bypasses RLS)
-- Run this in Supabase SQL Editor
-- =========================================================

CREATE OR REPLACE FUNCTION get_all_applications()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT COALESCE(jsonb_agg(row_data), '[]'::jsonb) INTO result
  FROM (
    SELECT jsonb_build_object(
      'id', a.id,
      'application_id', a.application_id,
      'user_id', a.user_id,
      'visa_program_id', a.visa_program_id,
      'country_id', a.country_id,
      'application_type', a.application_type,
      'status', a.status,
      'priority', a.priority,
      'personal_info', a.personal_info,
      'education_history', a.education_history,
      'work_history', a.work_history,
      'document_checklist', a.document_checklist,
      'submitted_at', a.submitted_at,
      'review_started_at', a.review_started_at,
      'decision_at', a.decision_at,
      'estimated_completion', a.estimated_completion,
      'assigned_consultant', a.assigned_consultant,
      'consultant_notes', a.consultant_notes,
      'meta', a.meta,
      'metadata', a.metadata,
      'created_at', a.created_at,
      'updated_at', a.updated_at,
      'user_profile_full_name', up.full_name,
      'user_profile_email', up.email
    ) AS row_data
    FROM applications a
    LEFT JOIN user_profiles up ON up.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 50
  ) sub;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_applications() TO authenticated;
