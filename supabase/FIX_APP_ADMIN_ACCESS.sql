-- Fix: Add admin/superadmin access to applications table RLS
-- The existing policy only allows owners and assigned consultants to see applications.
-- Admins need full access to view all applications.

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;

-- Admin/superadmin can view all applications
CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
        OR auth.uid() = user_id
        OR auth.uid() = assigned_consultant
    );

-- Admin/superadmin can insert applications
CREATE POLICY "Admins can insert applications" ON applications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
        OR auth.uid() = user_id
    );

-- Admin/superadmin can update applications
CREATE POLICY "Admins can update applications" ON applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid()
            AND up.user_role IN ('admin', 'super_admin', 'superadmin')
        )
        OR auth.uid() = user_id
        OR auth.uid() = assigned_consultant
    );
