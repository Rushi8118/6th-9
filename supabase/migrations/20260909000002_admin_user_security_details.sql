-- Return non-secret auth metadata to authorized administrators.
CREATE OR REPLACE FUNCTION public.get_admin_user_security_details(p_user_id UUID)
RETURNS TABLE (
  email_confirmed_at TIMESTAMPTZ,
  phone_confirmed_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,
  recovery_sent_at TIMESTAMPTZ,
  app_metadata JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  IF NOT public.user_has_permission(ARRAY['users.read']) THEN
    RAISE EXCEPTION 'Not authorized to view user security details';
  END IF;

  RETURN QUERY
  SELECT
    u.email_confirmed_at,
    u.phone_confirmed_at,
    u.last_sign_in_at,
    u.confirmation_sent_at,
    u.recovery_sent_at,
    u.raw_app_meta_data
  FROM auth.users AS u
  WHERE u.id = p_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_user_security_details(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_user_security_details(UUID) TO authenticated;
