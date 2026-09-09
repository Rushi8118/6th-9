-- =========================================================
-- 021: Enterprise Role-Based Access Control (RBAC)
-- Roles, Permissions, User-Role mapping, RLS, Audit
-- =========================================================

-- ─── Extend user_profiles role check ──────────────────────
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (user_role IN (
    'customer','hr','visa_officer','counselor','accountant','marketing',
    'admin','super_admin',
    'user','viewer','editor','consultant','manager','superadmin'
  ));

-- ─── ROLES TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_system   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── PERMISSIONS TABLE ────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key         VARCHAR(100) NOT NULL UNIQUE,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  module      VARCHAR(50),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ROLE-PERMISSION JUNCTION ─────────────────────────────
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- ─── USER-ROLE JUNCTION ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    UUID REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- SEED ROLES
-- ═══════════════════════════════════════════════════════════
INSERT INTO roles (name, slug, description, is_system) VALUES
  ('Super Admin',  'super_admin',  'Full control over everything', TRUE),
  ('Admin',        'admin',        'Manage applications, customers, documents, staff, CRM, reports', TRUE),
  ('HR',           'hr',           'View applicants, manage jobs, schedule interviews, upload documents', TRUE),
  ('Visa Officer', 'visa_officer', 'Process applications, verify documents, update status', TRUE),
  ('Counselor',    'counselor',    'Create leads, contact clients, manage follow-ups, book appointments', TRUE),
  ('Accountant',   'accountant',   'Payments, invoices, transactions, refunds', TRUE),
  ('Marketing',    'marketing',    'Blogs, SEO, landing pages, campaigns, social media', TRUE),
  ('Customer',     'customer',     'Own profile, submit applications, upload documents, track status, payments', TRUE)
-- Existing system roles are protected by prevent_system_role_modification().
-- Do not issue an UPDATE on conflict so this migration remains safely rerunnable.
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- SEED PERMISSIONS
-- ═══════════════════════════════════════════════════════════
INSERT INTO permissions (key, name, description, module) VALUES
  -- Users
  ('users.read',      'View Users',        'View user list and details', 'users'),
  ('users.create',    'Create Users',      'Create new user accounts', 'users'),
  ('users.update',    'Update Users',      'Edit user profile data', 'users'),
  ('users.delete',    'Delete Users',      'Delete/disable user accounts', 'users'),
  -- Roles & Permissions
  ('roles.read',      'View Roles',        'View role list and details', 'roles'),
  ('roles.create',    'Create Roles',      'Create new roles', 'roles'),
  ('roles.update',    'Update Roles',      'Edit role definitions', 'roles'),
  ('roles.delete',    'Delete Roles',      'Delete roles', 'roles'),
  ('permissions.read','View Permissions',  'View permission list', 'roles'),
  ('permissions.assign','Assign Permissions','Assign permissions to roles', 'roles'),
  ('permissions.manage','Manage Permissions','Create/update/delete permissions', 'roles'),
  -- CRM
  ('crm.read',        'View CRM',          'View CRM dashboard and data', 'crm'),
  ('crm.create',      'Create CRM Entries','Create CRM records (leads, contacts)', 'crm'),
  ('crm.update',      'Update CRM Entries','Edit CRM records', 'crm'),
  ('crm.delete',      'Delete CRM Entries','Delete CRM records', 'crm'),
  -- Applications
  ('applications.read',   'View Applications',   'View application list and details', 'applications'),
  ('applications.create', 'Create Applications', 'Submit new applications', 'applications'),
  ('applications.update', 'Update Applications', 'Edit application data', 'applications'),
  ('applications.delete', 'Delete Applications', 'Delete/withdraw applications', 'applications'),
  ('applications.process','Process Applications','Change application status, review', 'applications'),
  -- Countries
  ('countries.read',   'View Countries',   'View country list and details', 'countries'),
  ('countries.create', 'Create Countries', 'Add new countries', 'countries'),
  ('countries.update', 'Update Countries', 'Edit country data', 'countries'),
  ('countries.delete', 'Delete Countries', 'Remove countries', 'countries'),
  -- Jobs
  ('jobs.read',        'View Jobs',         'View job postings', 'jobs'),
  ('jobs.create',      'Create Jobs',       'Create job postings', 'jobs'),
  ('jobs.update',      'Update Jobs',       'Edit job postings', 'jobs'),
  ('jobs.delete',      'Delete Jobs',       'Delete job postings', 'jobs'),
  -- Blogs
  ('blogs.read',       'View Blogs',        'View blog posts', 'blogs'),
  ('blogs.create',     'Create Blogs',      'Create blog posts', 'blogs'),
  ('blogs.update',     'Update Blogs',      'Edit blog posts', 'blogs'),
  ('blogs.delete',     'Delete Blogs',      'Delete blog posts', 'blogs'),
  ('blogs.publish',    'Publish Blogs',     'Publish/unpublish blog posts', 'blogs'),
  -- Reports
  ('reports.read',     'View Reports',      'View report dashboard', 'reports'),
  ('reports.create',   'Create Reports',    'Generate custom reports', 'reports'),
  ('reports.export',   'Export Reports',    'Export report data', 'reports'),
  -- Analytics
  ('analytics.view',   'View Analytics',    'Access analytics dashboard', 'analytics'),
  ('analytics.realtime','View Realtime',    'View realtime metrics', 'analytics'),
  -- Settings
  ('settings.read',    'View Settings',     'View system settings', 'settings'),
  ('settings.update',  'Update Settings',   'Modify system settings', 'settings'),
  ('settings.manage',  'Manage Settings',   'Full control over settings', 'settings'),
  -- Finance
  ('finance.read',     'View Finance',      'View financial data', 'finance'),
  ('finance.create',   'Create Transactions','Create payments/invoices', 'finance'),
  ('finance.update',   'Update Finance',    'Edit financial records', 'finance'),
  ('finance.delete',   'Delete Finance',    'Delete financial records', 'finance'),
  ('finance.refund',   'Process Refunds',   'Issue refunds', 'finance'),
  -- Notifications
  ('notifications.read',   'View Notifications',   'View notifications', 'notifications'),
  ('notifications.create', 'Create Notifications', 'Send notifications', 'notifications'),
  ('notifications.manage', 'Manage Notifications', 'Configure notification settings', 'notifications'),
  -- Audit
  ('audit.read',       'View Audit Logs',   'View audit trail', 'audit'),
  ('audit.export',     'Export Audit Logs', 'Export audit log data', 'audit'),
  -- Documents
  ('documents.read',   'View Documents',    'View uploaded documents', 'documents'),
  ('documents.create', 'Upload Documents',  'Upload new documents', 'documents'),
  ('documents.update', 'Update Documents',  'Edit document metadata', 'documents'),
  ('documents.delete', 'Delete Documents',  'Delete documents', 'documents'),
  ('documents.verify', 'Verify Documents',  'Verify/approve documents', 'documents'),
  -- Appointments
  ('appointments.read',   'View Appointments',   'View appointment schedule', 'appointments'),
  ('appointments.create', 'Create Appointments', 'Book appointments', 'appointments'),
  ('appointments.update', 'Update Appointments', 'Reschedule appointments', 'appointments'),
  ('appointments.delete', 'Delete Appointments', 'Cancel appointments', 'appointments'),
  -- Leads / Customers
  ('leads.read',       'View Leads',        'View lead list', 'leads'),
  ('leads.create',     'Create Leads',      'Create new leads', 'leads'),
  ('leads.update',     'Update Leads',      'Edit lead data', 'leads'),
  ('leads.delete',     'Delete Leads',      'Delete leads', 'leads'),
  ('customers.read',   'View Customers',    'View customer list', 'customers'),
  ('customers.create', 'Create Customers',  'Add new customers', 'customers'),
  ('customers.update', 'Update Customers',  'Edit customer data', 'customers'),
  ('customers.delete', 'Delete Customers',  'Delete customers', 'customers'),
  -- Staff
  ('staff.read',       'View Staff',        'View staff list', 'staff'),
  ('staff.assign',     'Assign Staff',      'Assign staff to applications/customers', 'staff'),
  -- Campaigns
  ('campaigns.read',   'View Campaigns',    'View marketing campaigns', 'marketing'),
  ('campaigns.create', 'Create Campaigns',  'Create campaigns', 'marketing'),
  ('campaigns.update', 'Update Campaigns',  'Edit campaigns', 'marketing'),
  ('campaigns.delete', 'Delete Campaigns',  'Delete campaigns', 'marketing'),
  -- SEO
  ('seo.read',         'View SEO Data',     'View SEO analytics', 'marketing'),
  ('seo.update',       'Update SEO',        'Edit SEO metadata', 'marketing'),
  -- Landing Pages
  ('landing_pages.read',   'View Landing Pages',   'View landing pages', 'marketing'),
  ('landing_pages.create', 'Create Landing Pages', 'Create landing pages', 'marketing'),
  ('landing_pages.update', 'Update Landing Pages', 'Edit landing pages', 'marketing'),
  ('landing_pages.delete', 'Delete Landing Pages', 'Delete landing pages', 'marketing'),
  -- Social Media
  ('social_media.read',   'View Social Media',   'View social media posts', 'marketing'),
  ('social_media.create', 'Create Social Posts', 'Create social media posts', 'marketing'),
  ('social_media.update', 'Update Social Posts', 'Edit social media posts', 'marketing'),
  ('social_media.delete', 'Delete Social Posts', 'Delete social media posts', 'marketing')
ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, module = EXCLUDED.module;

-- ═══════════════════════════════════════════════════════════
-- SEED ROLE-PERMISSION MAPPINGS
-- ═══════════════════════════════════════════════════════════
WITH
  perm AS (SELECT key, id FROM permissions),
  role AS (SELECT slug, id FROM roles),

  -- Build the mapping of role -> permission keys
  mappings(slug, perms) AS (VALUES
    -- SUPER ADMIN: everything
    ('super_admin', ARRAY['users.read','users.create','users.update','users.delete',
      'roles.read','roles.create','roles.update','roles.delete',
      'permissions.read','permissions.assign','permissions.manage',
      'crm.read','crm.create','crm.update','crm.delete',
      'applications.read','applications.create','applications.update','applications.delete','applications.process',
      'countries.read','countries.create','countries.update','countries.delete',
      'jobs.read','jobs.create','jobs.update','jobs.delete',
      'blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish',
      'reports.read','reports.create','reports.export',
      'analytics.view','analytics.realtime',
      'settings.read','settings.update','settings.manage',
      'finance.read','finance.create','finance.update','finance.delete','finance.refund',
      'notifications.read','notifications.create','notifications.manage',
      'audit.read','audit.export',
      'documents.read','documents.create','documents.update','documents.delete','documents.verify',
      'appointments.read','appointments.create','appointments.update','appointments.delete',
      'leads.read','leads.create','leads.update','leads.delete',
      'customers.read','customers.create','customers.update','customers.delete',
      'staff.read','staff.assign',
      'campaigns.read','campaigns.create','campaigns.update','campaigns.delete',
      'seo.read','seo.update',
      'landing_pages.read','landing_pages.create','landing_pages.update','landing_pages.delete',
      'social_media.read','social_media.create','social_media.update','social_media.delete'
    ]::TEXT[]),

    -- ADMIN
    ('admin', ARRAY['users.read','users.create','users.update',
      'roles.read',
      'crm.read','crm.create','crm.update','crm.delete',
      'applications.read','applications.create','applications.update','applications.process',
      'countries.read','countries.update',
      'blogs.read','blogs.create','blogs.update',
      'reports.read','reports.create','reports.export',
      'analytics.view',
      'notifications.read','notifications.create','notifications.manage',
      'documents.read','documents.create','documents.update','documents.verify',
      'appointments.read','appointments.create','appointments.update',
      'leads.read','leads.create','leads.update',
      'customers.read','customers.create','customers.update',
      'staff.read','staff.assign'
    ]::TEXT[]),

    -- HR
    ('hr', ARRAY['applications.read','applications.update',
      'jobs.read','jobs.create','jobs.update','jobs.delete',
      'blogs.read',
      'documents.read','documents.create','documents.update',
      'appointments.read','appointments.create','appointments.update',
      'leads.read','customers.read',
      'notifications.read','notifications.create'
    ]::TEXT[]),

    -- VISA OFFICER
    ('visa_officer', ARRAY['applications.read','applications.update','applications.process',
      'documents.read','documents.create','documents.update','documents.verify',
      'customers.read',
      'notifications.read','notifications.create'
    ]::TEXT[]),

    -- COUNSELOR
    ('counselor', ARRAY['crm.read','crm.create','crm.update',
      'leads.read','leads.create','leads.update',
      'customers.read',
      'appointments.read','appointments.create','appointments.update',
      'documents.read','documents.create',
      'notifications.read','notifications.create',
      'applications.read'
    ]::TEXT[]),

    -- ACCOUNTANT
    ('accountant', ARRAY['finance.read','finance.create','finance.update','finance.refund',
      'reports.read','reports.export',
      'customers.read',
      'notifications.read'
    ]::TEXT[]),

    -- MARKETING
    ('marketing', ARRAY['blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish',
      'seo.read','seo.update',
      'landing_pages.read','landing_pages.create','landing_pages.update','landing_pages.delete',
      'campaigns.read','campaigns.create','campaigns.update','campaigns.delete',
      'social_media.read','social_media.create','social_media.update','social_media.delete',
      'analytics.view',
      'notifications.read'
    ]::TEXT[]),

    -- CUSTOMER
    ('customer', ARRAY['applications.read','applications.create',
      'documents.read','documents.create',
      'finance.read','finance.create',
      'notifications.read',
      'appointments.read','appointments.create'
    ]::TEXT[])
  )

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM mappings m
JOIN role r ON r.slug = m.slug
JOIN perm p ON p.key = ANY(m.perms)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- UPDATED get_my_permissions RPC
-- Returns permissions from both new RBAC tables and legacy role
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_my_permissions()
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
      (SELECT user_role FROM user_profiles WHERE id = auth.uid()),
      'customer'
    ) AS slug
  )
  SELECT DISTINCT p.key::TEXT
  FROM permissions p
  WHERE EXISTS (
    -- From user_roles (new RBAC system)
    SELECT 1 FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    WHERE ur.user_id = auth.uid() AND rp.permission_id = p.id
  )
  OR EXISTS (
    -- From legacy user_role column via roles table slug match
    SELECT 1 FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    CROSS JOIN user_role_slug urs
    WHERE r.slug = urs.slug AND rp.permission_id = p.id
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- has_permission RPC (server-side check)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION has_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_my_permissions() WHERE permission_slug = required_permission
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- get_user_roles RPC
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION get_user_roles()
RETURNS TABLE (role_id UUID, role_slug TEXT, role_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.slug::TEXT, r.name::TEXT
  FROM roles r
  JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid()
  UNION
  SELECT r.id, r.slug::TEXT, r.name::TEXT
  FROM roles r
  WHERE r.slug = (SELECT user_role FROM user_profiles WHERE id = auth.uid());
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- AUDIT LOG FUNCTION
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION write_audit_log(
  p_action     TEXT,
  p_resource   TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_old_value  JSONB DEFAULT NULL,
  p_new_value  JSONB DEFAULT NULL,
  p_severity   TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_email TEXT;
  v_role TEXT;
BEGIN
  SELECT email, user_role INTO v_email, v_role
  FROM user_profiles WHERE id = auth.uid();

  INSERT INTO audit_logs (user_id, user_email, user_role, action, resource, resource_id, old_value, new_value, ip_address, severity)
  VALUES (
    auth.uid(),
    v_email,
    v_role,
    p_action,
    p_resource,
    p_resource_id,
    p_old_value,
    p_new_value,
    inet_client_addr(),
    p_severity
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- UPDATED RLS POLICIES — Role & permission aware
-- ═══════════════════════════════════════════════════════════

-- Drop all existing policies on tables managed by 021 (idempotent)
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN (
    'user_profiles','roles','permissions','role_permissions','user_roles',
    'applications','countries','blog_posts',
    'consultations','notifications'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Helper function for checking if user has any of the given permission keys
CREATE OR REPLACE FUNCTION user_has_permission(required_permissions TEXT[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM get_my_permissions()
    WHERE permission_slug = ANY(required_permissions)
  );
END;
$$;

-- ─── user_profiles RLS ───────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Staff can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Staff can view assigned users" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Staff can view assigned users" ON user_profiles
  FOR SELECT USING (
    user_has_permission(ARRAY['users.read','customers.read','leads.read','staff.read'])
  );

CREATE POLICY "Admins can update user roles" ON user_profiles
  FOR UPDATE USING (
    user_has_permission(ARRAY['users.update','roles.assign'])
  );

-- ─── roles RLS ───────────────────────────────────
DROP POLICY IF EXISTS "Super admins manage roles" ON roles;
DROP POLICY IF EXISTS "View roles" ON roles;
DROP POLICY IF EXISTS "Manage roles" ON roles;
CREATE POLICY "View roles" ON roles FOR SELECT USING (
  user_has_permission(ARRAY['roles.read','permissions.read'])
);
CREATE POLICY "Manage roles" ON roles FOR ALL USING (
  user_has_permission(ARRAY['roles.create','roles.update','roles.delete','permissions.manage'])
);

-- ─── permissions RLS ─────────────────────────────
DROP POLICY IF EXISTS "Permissions view" ON permissions;
DROP POLICY IF EXISTS "View permissions" ON permissions;
DROP POLICY IF EXISTS "Manage permissions" ON permissions;
CREATE POLICY "View permissions" ON permissions FOR SELECT USING (
  user_has_permission(ARRAY['permissions.read','roles.read'])
);
CREATE POLICY "Manage permissions" ON permissions FOR ALL USING (
  user_has_permission(ARRAY['permissions.manage'])
);

-- ─── role_permissions RLS ────────────────────────
DROP POLICY IF EXISTS "Role permissions view" ON role_permissions;
DROP POLICY IF EXISTS "View role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "Manage role_permissions" ON role_permissions;
CREATE POLICY "View role_permissions" ON role_permissions FOR SELECT USING (
  user_has_permission(ARRAY['roles.read','permissions.read'])
);
CREATE POLICY "Manage role_permissions" ON role_permissions FOR ALL USING (
  user_has_permission(ARRAY['permissions.assign','permissions.manage','roles.update'])
);

-- ─── user_roles RLS ──────────────────────────────
DROP POLICY IF EXISTS "User roles view" ON user_roles;
DROP POLICY IF EXISTS "User roles manage" ON user_roles;
DROP POLICY IF EXISTS "View user_roles" ON user_roles;
DROP POLICY IF EXISTS "Manage user_roles" ON user_roles;
CREATE POLICY "View user_roles" ON user_roles FOR SELECT USING (
  auth.uid() = user_id OR user_has_permission(ARRAY['roles.read','users.read'])
);
CREATE POLICY "Manage user_roles" ON user_roles FOR ALL USING (
  user_has_permission(ARRAY['roles.assign','roles.manage','users.update'])
);

-- ─── applications RLS ────────────────────────────
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can insert own applications" ON applications;
DROP POLICY IF EXISTS "Users can update own applications" ON applications;

CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() = assigned_consultant
    OR user_has_permission(ARRAY['applications.read','applications.process','applications.update'])
  );

CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR user_has_permission(ARRAY['applications.create'])
  );

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() = assigned_consultant
    OR user_has_permission(ARRAY['applications.update','applications.process'])
  );

-- ─── countries RLS ───────────────────────────────
DROP POLICY IF EXISTS "Countries are public" ON countries;
DROP POLICY IF EXISTS "Admins can write countries" ON countries;
DROP POLICY IF EXISTS "Staff can write countries" ON countries;

CREATE POLICY "Countries are public" ON countries
  FOR SELECT USING (is_active = true OR user_has_permission(ARRAY['countries.read','countries.update','countries.delete']));

CREATE POLICY "Staff can write countries" ON countries
  FOR INSERT WITH CHECK (user_has_permission(ARRAY['countries.create']));

CREATE POLICY "Staff can update countries" ON countries
  FOR UPDATE USING (user_has_permission(ARRAY['countries.update','countries.delete']));

-- ─── blog_posts RLS ──────────────────────────────
DROP POLICY IF EXISTS "Published blog posts are public" ON blog_posts;
DROP POLICY IF EXISTS "Staff can write blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Staff can update blog posts" ON blog_posts;

CREATE POLICY "Published blog posts are public" ON blog_posts
  FOR SELECT USING (
    (status = 'published' AND published_at <= NOW())
    OR user_has_permission(ARRAY['blogs.read','blogs.create','blogs.update','blogs.delete','blogs.publish'])
  );

CREATE POLICY "Staff can write blog posts" ON blog_posts
  FOR INSERT WITH CHECK (user_has_permission(ARRAY['blogs.create']));

CREATE POLICY "Staff can update blog posts" ON blog_posts
  FOR UPDATE USING (user_has_permission(ARRAY['blogs.update','blogs.publish','blogs.delete']));

-- ─── documents RLS (new policy if table exists) ───
-- If there's a documents table, add policies. Using applications as document store for now.

-- ─── finance RLS ──────────────────────────────────
-- Assuming finance data is in applications (payment_status, total_fee_inr, amount_paid)
-- We'll add scoped policies on applications for finance

-- ─── Update existing tables RLS ───────────────────

-- consultations: expanded for staff
DROP POLICY IF EXISTS "Users can view own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can insert own consultations" ON consultations;
DROP POLICY IF EXISTS "Users can update own consultations" ON consultations;
DROP POLICY IF EXISTS "View consultations" ON consultations;
DROP POLICY IF EXISTS "Insert consultations" ON consultations;
DROP POLICY IF EXISTS "Update consultations" ON consultations;

CREATE POLICY "View consultations" ON consultations
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() = assigned_consultant
    OR user_has_permission(ARRAY['appointments.read','crm.read','leads.read'])
  );

CREATE POLICY "Insert consultations" ON consultations
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR user_has_permission(ARRAY['appointments.create','crm.create','leads.create'])
  );

CREATE POLICY "Update consultations" ON consultations
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() = assigned_consultant
    OR user_has_permission(ARRAY['appointments.update','crm.update','leads.update'])
  );

-- notifications: staff can view notifications for their customers
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "View notifications" ON notifications;
DROP POLICY IF EXISTS "Insert notifications" ON notifications;
DROP POLICY IF EXISTS "Update notifications" ON notifications;
CREATE POLICY "View notifications" ON notifications
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_has_permission(ARRAY['notifications.read','notifications.manage'])
  );

CREATE POLICY "Insert notifications" ON notifications
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR user_has_permission(ARRAY['notifications.create','notifications.manage'])
  );

CREATE POLICY "Update notifications" ON notifications
  FOR UPDATE USING (
    auth.uid() = user_id
    OR user_has_permission(ARRAY['notifications.manage'])
  );

-- ═══════════════════════════════════════════════════════════
-- TRIGGER: Prevent modifying/deleting system roles
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION prevent_system_role_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.is_system THEN
    RAISE EXCEPTION 'System roles cannot be modified or deleted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_system_role_modification ON roles;
CREATE TRIGGER trg_prevent_system_role_modification
  BEFORE UPDATE OR DELETE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_system_role_modification();

-- ═══════════════════════════════════════════════════════════
-- TRIGGER: Sync user_profiles.user_role to user_roles
-- Ensures legacy role assignment is reflected in new system
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION sync_user_role_to_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_role IS DISTINCT FROM OLD.user_role THEN
    -- Remove existing role entries that match the old role mapping
    DELETE FROM user_roles
    WHERE user_id = NEW.id
    AND role_id IN (SELECT id FROM roles WHERE slug IN ('customer','hr','visa_officer','counselor','accountant','marketing','admin','super_admin','user','viewer','editor','consultant','manager','superadmin'));

    -- Insert new role mapping
    INSERT INTO user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM roles r
    WHERE r.slug = NEW.user_role
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_role ON user_profiles;
CREATE TRIGGER trg_sync_user_role
  AFTER UPDATE OF user_role ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role_to_user_roles();

-- ═══════════════════════════════════════════════════════════
-- GRANTS for new tables
-- ═══════════════════════════════════════════════════════════
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON roles, permissions, role_permissions, user_roles TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION has_permission(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_roles() TO authenticated;
GRANT EXECUTE ON FUNCTION write_audit_log(TEXT, TEXT, TEXT, JSONB, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_permission(TEXT[]) TO authenticated;
