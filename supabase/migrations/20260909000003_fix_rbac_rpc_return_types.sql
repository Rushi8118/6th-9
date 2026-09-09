-- Fix get_my_permissions result type for RLS checks.
-- permissions.key is VARCHAR, while the RPC contract returns TEXT.
CREATE OR REPLACE FUNCTION public.get_my_permissions()
RETURNS TABLE (permission_slug TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH user_role_slug AS (
    SELECT COALESCE(
      (SELECT user_role FROM public.user_profiles WHERE id = auth.uid()),
      'customer'
    )::TEXT AS slug
  )
  SELECT DISTINCT p.key::TEXT
  FROM public.permissions AS p
  WHERE EXISTS (
    SELECT 1
    FROM public.user_roles AS ur
    JOIN public.role_permissions AS rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND rp.permission_id = p.id
  )
  OR EXISTS (
    SELECT 1
    FROM public.role_permissions AS rp
    JOIN public.roles AS r ON r.id = rp.role_id
    CROSS JOIN user_role_slug AS urs
    WHERE r.slug = urs.slug
      AND rp.permission_id = p.id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_permissions() TO authenticated;
