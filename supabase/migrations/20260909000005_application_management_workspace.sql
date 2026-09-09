-- Secure application-management primitives for the Super Admin workspace.
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  status TEXT NOT NULL DEFAULT 'Uploaded' CHECK (status IN ('Uploaded', 'Missing', 'Rejected', 'Verified')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.application_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS application_activity_application_idx
  ON public.application_activity(application_id, created_at DESC);

ALTER TABLE public.application_activity ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can read application activity" ON public.application_activity;
CREATE POLICY "Staff can read application activity" ON public.application_activity
  FOR SELECT USING (user_has_permission(ARRAY['applications.read', 'applications.process']));

CREATE OR REPLACE FUNCTION public.get_application_management_data(p_application_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  IF NOT user_has_permission(ARRAY['applications.read', 'applications.process']) THEN
    RAISE EXCEPTION 'insufficient privileges';
  END IF;

  SELECT jsonb_build_object(
    'application', to_jsonb(a) || jsonb_build_object(
      'applicant', to_jsonb(up),
      'country', to_jsonb(c),
      'visa_program', to_jsonb(vp),
      'assigned_officer', to_jsonb(officer)
    ),
    'documents', COALESCE((
      SELECT jsonb_agg(to_jsonb(d) ORDER BY d.created_at DESC)
      FROM public.documents d
      WHERE d.application_id = a.id
    ), '[]'::JSONB),
    'activity', COALESCE((
      SELECT jsonb_agg(to_jsonb(aa) ORDER BY aa.created_at DESC)
      FROM public.application_activity aa
      WHERE aa.application_id = a.id
    ), '[]'::JSONB)
  ) INTO result
  FROM public.applications a
  LEFT JOIN public.user_profiles up ON up.id = a.user_id
  LEFT JOIN public.countries c ON c.id = a.country_id
  LEFT JOIN public.visa_programs vp ON vp.id = a.visa_program_id
  LEFT JOIN public.user_profiles officer ON officer.id = a.assigned_consultant
  WHERE a.id = p_application_id;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_application_officers()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', id, 'full_name', full_name, 'email', email) ORDER BY full_name, email), '[]'::JSONB)
  FROM public.user_profiles
  WHERE user_role IN ('hr', 'visa_officer', 'counselor', 'consultant', 'manager', 'admin', 'super_admin', 'superadmin')
    AND status = 'active'
    AND user_has_permission(ARRAY['applications.read', 'applications.process']);
$$;

CREATE OR REPLACE FUNCTION public.manage_application(
  p_application_id UUID,
  p_action TEXT,
  p_value JSONB DEFAULT '{}'::JSONB,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_app public.applications;
  updated_app public.applications;
  action_reason TEXT := NULLIF(BTRIM(p_reason), '');
BEGIN
  IF (p_action = 'delete' AND NOT user_has_permission(ARRAY['applications.delete']))
     OR (p_action IN ('approve', 'reject', 'return_for_corrections', 'request_documents', 'change_status') AND NOT user_has_permission(ARRAY['applications.process']))
     OR (p_action NOT IN ('delete', 'approve', 'reject', 'return_for_corrections', 'request_documents', 'change_status') AND NOT user_has_permission(ARRAY['applications.update'])) THEN
    RAISE EXCEPTION 'insufficient privileges';
  END IF;

  SELECT * INTO current_app FROM public.applications WHERE id = p_application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'application not found'; END IF;

  IF p_action IN ('approve', 'reject', 'return_for_corrections', 'request_documents', 'change_status', 'archive', 'delete')
     AND p_action <> 'approve' AND action_reason IS NULL THEN
    RAISE EXCEPTION 'a reason is required for this action';
  END IF;

  IF p_action = 'delete' THEN
    INSERT INTO public.application_activity(application_id, actor_id, action, reason, metadata)
    VALUES (p_application_id, auth.uid(), p_action, action_reason, COALESCE(p_value, '{}'::JSONB));
    DELETE FROM public.applications WHERE id = p_application_id;
    RETURN jsonb_build_object('deleted', TRUE, 'id', p_application_id);
  END IF;

  IF p_action = 'duplicate' THEN
    INSERT INTO public.applications (user_id, visa_program_id, country_id, application_type, status, priority, personal_info, education_history, work_history, document_checklist, meta, consultant_notes)
    VALUES (current_app.user_id, current_app.visa_program_id, current_app.country_id, current_app.application_type, 'draft', current_app.priority, current_app.personal_info, current_app.education_history, current_app.work_history, current_app.document_checklist, current_app.meta || jsonb_build_object('duplicated_from', current_app.id), current_app.consultant_notes)
    RETURNING * INTO updated_app;
  ELSE
    updated_app := current_app;
    IF p_action IN ('approve', 'reject', 'return_for_corrections', 'request_documents', 'change_status') THEN
      updated_app.status := CASE p_action
        WHEN 'approve' THEN 'approved'
        WHEN 'reject' THEN 'rejected'
        WHEN 'return_for_corrections' THEN 'draft'
        WHEN 'request_documents' THEN 'under_review'
        ELSE COALESCE(p_value->>'status', current_app.status)
      END;
      updated_app.decision_at := CASE WHEN updated_app.status IN ('approved', 'rejected') THEN NOW() ELSE current_app.decision_at END;
      updated_app.review_started_at := CASE WHEN updated_app.status = 'under_review' THEN COALESCE(current_app.review_started_at, NOW()) ELSE current_app.review_started_at END;
    ELSIF p_action = 'change_priority' THEN
      updated_app.priority := COALESCE(p_value->>'priority', current_app.priority);
    ELSIF p_action = 'assign' THEN
      updated_app.assigned_consultant := NULLIF(p_value->>'officer_id', '')::UUID;
    ELSIF p_action = 'add_note' THEN
      updated_app.consultant_notes := CONCAT_WS(E'\n\n', current_app.consultant_notes, action_reason);
    ELSIF p_action = 'archive' THEN
      updated_app.meta := COALESCE(current_app.meta, '{}'::JSONB) || jsonb_build_object('archived', TRUE, 'archived_at', NOW(), 'archived_by', auth.uid());
    ELSE
      RAISE EXCEPTION 'unsupported application action';
    END IF;
    UPDATE public.applications SET status = updated_app.status, priority = updated_app.priority, assigned_consultant = updated_app.assigned_consultant, consultant_notes = updated_app.consultant_notes, decision_at = updated_app.decision_at, review_started_at = updated_app.review_started_at, meta = updated_app.meta, updated_at = NOW() WHERE id = p_application_id RETURNING * INTO updated_app;
  END IF;

  INSERT INTO public.application_activity(application_id, actor_id, action, reason, metadata)
  VALUES (updated_app.id, auth.uid(), p_action, action_reason, COALESCE(p_value, '{}'::JSONB));
  PERFORM public.write_audit_log('application.' || p_action, 'applications', updated_app.id::TEXT, NULL, jsonb_build_object('reason', action_reason, 'value', p_value), 'info');
  RETURN to_jsonb(updated_app);
END;
$$;

REVOKE ALL ON FUNCTION public.get_application_management_data(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_application_officers() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.manage_application(UUID, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_application_management_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_application_officers() TO authenticated;
GRANT EXECUTE ON FUNCTION public.manage_application(UUID, TEXT, JSONB, TEXT) TO authenticated;

-- Refresh PostgREST's function schema cache immediately after deployment.
NOTIFY pgrst, 'reload schema';