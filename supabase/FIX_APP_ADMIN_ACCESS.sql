-- Fix: Add admin/superadmin access to applications table RLS
-- Run this in your Supabase SQL Editor

-- Verify user_profiles has the super_admin role allowed
-- (Requires create_super_admin.sql to have been run first)

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
