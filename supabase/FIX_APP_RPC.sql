-- =========================================================
-- RPC function to fetch all applications (bypasses RLS)
-- Run this in Supabase SQL Editor
-- =========================================================

DROP FUNCTION IF EXISTS public.get_all_applications();
DROP FUNCTION IF EXISTS public.get_all_applications(integer, integer);

CREATE OR REPLACE FUNCTION public.get_all_applications(
  p_page INT DEFAULT 1,
  p_page_size INT DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  v_offset INT := (p_page - 1) * p_page_size;
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
      'meta', COALESCE(to_jsonb(a) -> 'meta', '{}'::jsonb),
      'metadata', COALESCE(to_jsonb(a) -> 'meta', '{}'::jsonb),
      'created_at', a.created_at,
      'updated_at', a.updated_at,
      'user_profile_full_name', up.full_name,
      'user_profile_email', up.email
    ) AS row_data,
    a.created_at AS sort_date
    FROM applications a
    LEFT JOIN user_profiles up ON up.id = a.user_id
    UNION ALL
    SELECT jsonb_build_object(
      'id', c.id,
      'application_id', 'ENQ-' || LEFT(REPLACE(c.id::text, '-', ''), 8),
      'user_id', c.user_id,
      'visa_program_id', NULL,
      'country_id', NULL,
      'application_type', CASE
        WHEN c.consultation_type = 'study_visa' THEN 'study'
        WHEN c.consultation_type = 'work_visa' THEN 'work'
        ELSE 'business'
      END,
      'status', 'submitted',
      'priority', 'normal',
      'personal_info', c.user_notes,
      'education_history', '[]'::jsonb,
      'work_history', '[]'::jsonb,
      'document_checklist', '{}'::jsonb,
      'submitted_at', c.created_at,
      'review_started_at', NULL,
      'decision_at', NULL,
      'estimated_completion', NULL,
      'assigned_consultant', c.assigned_consultant,
      'consultant_notes', c.consultant_notes,
      'meta', jsonb_build_object(
        'source', 'consultations',
        'consultation_type', c.consultation_type,
        'preferred_country', c.preferred_country,
        'visa_category', c.visa_category
      ),
      'metadata', jsonb_build_object(
        'source', 'consultations',
        'preferred_country', c.preferred_country,
        'visa_category', c.visa_category
      ),
      'created_at', c.created_at,
      'updated_at', c.updated_at,
      'user_profile_full_name', up.full_name,
      'user_profile_email', up.email
    ) AS row_data,
    c.created_at AS sort_date
    FROM consultations c
    LEFT JOIN user_profiles up ON up.id = c.user_id
    ORDER BY sort_date DESC
    LIMIT p_page_size
    OFFSET v_offset
  ) sub;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_applications(integer, integer) TO authenticated;
