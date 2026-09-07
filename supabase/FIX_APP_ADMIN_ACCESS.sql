-- Fix: Add admin/superadmin access to applications table RLS
-- Run this in your Supabase SQL Editor

-- Verify user_profiles has the super_admin role allowed
-- (Requires create_super_admin.sql to have been run first)

-- Ensure submitted applications receive an application ID before NOT NULL is checked.
CREATE TABLE IF NOT EXISTS application_counters (
    country_code VARCHAR(5) NOT NULL,
    ist_date DATE NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (country_code, ist_date)
);

ALTER TABLE application_counters ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE application_counters FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION generate_application_id(p_country_code VARCHAR)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code TEXT := UPPER(BTRIM(p_country_code));
    v_ist_date DATE := (timezone('Asia/Kolkata', now()))::date;
    v_next INTEGER;
BEGIN
    IF v_code IS NULL OR v_code = '' THEN
        RAISE EXCEPTION 'country code is required';
    END IF;

    PERFORM pg_advisory_xact_lock(hashtext(v_code || ':' || v_ist_date::text));

    INSERT INTO application_counters(country_code, ist_date, counter)
    VALUES (v_code, v_ist_date, 0)
    ON CONFLICT (country_code, ist_date) DO NOTHING;

    UPDATE application_counters
    SET counter = counter + 1
    WHERE country_code = v_code AND ist_date = v_ist_date
    RETURNING counter INTO v_next;

    RETURN v_code || to_char(v_ist_date, 'DDMMYYYY') || lpad(v_next::text, 2, '0');
END;
$$;

CREATE OR REPLACE FUNCTION set_application_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_code TEXT;
BEGIN
    IF NEW.application_id IS NOT NULL AND BTRIM(NEW.application_id) <> '' THEN
        RETURN NEW;
    END IF;

    SELECT code INTO v_code FROM countries WHERE id = NEW.country_id;
    IF v_code IS NULL THEN
        RAISE EXCEPTION 'Invalid country_id %', NEW.country_id;
    END IF;

    NEW.application_id := generate_application_id(v_code);
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION generate_application_id(VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION set_application_id() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS applications_set_application_id ON applications;
CREATE TRIGGER applications_set_application_id
    BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION set_application_id();

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can insert applications" ON applications;
DROP POLICY IF EXISTS "Admins can update applications" ON applications;
DROP POLICY IF EXISTS "RBAC admins can view applications" ON applications;
DROP POLICY IF EXISTS "RBAC admins can insert applications" ON applications;
DROP POLICY IF EXISTS "RBAC admins can update applications" ON applications;

-- Admin and superadmin can view all applications
-- The subquery on user_profiles works because RLS allows auth.uid() = id
CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (
        auth.uid() = user_id
        OR auth.uid() = assigned_consultant
        OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
    );

-- Admin and superadmin can insert applications
CREATE POLICY "Admins can insert applications" ON applications
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
    );

-- Admin and superadmin can update applications
CREATE POLICY "Admins can update applications" ON applications
    FOR UPDATE USING (
        auth.uid() = user_id
        OR auth.uid() = assigned_consultant
        OR EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
    );

-- VERIFICATION: Run this to check your current user's role
-- SELECT id, email, user_role FROM user_profiles WHERE id = auth.uid();
-- If user_role is 'admin' or 'super_admin', the policies above will work.
-- If user_role is 'user', you need to update it:
-- UPDATE user_profiles SET user_role = 'admin' WHERE id = auth.uid();
