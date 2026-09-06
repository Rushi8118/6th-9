-- =========================================================
-- 019: Admin Feature Tables
-- Audit logs, sessions, automations, email templates
-- =========================================================

-- ─── Roles (extended) ─────────────────────────────────────
-- Ensure user_profiles.user_role supports new role slugs
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles
   ADD CONSTRAINT user_profiles_role_check
    CHECK (user_role IN ('user','viewer','editor','consultant','manager','admin','super_admin','superadmin'));

-- ─── Audit Logs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email   TEXT,
  user_role    TEXT,
  action       TEXT NOT NULL,           -- e.g. 'user.role_changed'
  resource     TEXT,                    -- e.g. 'user_profiles'
  resource_id  TEXT,                    -- affected row id
  old_value    JSONB,
  new_value    JSONB,
  ip_address   INET,
  user_agent   TEXT,
  fingerprint  TEXT,
  severity     TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx   ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx    ON audit_logs(action);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit logs"  ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('admin','superadmin','manager'))
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- ─── Admin Sessions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_sessions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fingerprint  TEXT,
  user_agent   TEXT,
  ip_address   INET,
  device_type  TEXT,
  browser      TEXT,
  os           TEXT,
  location     TEXT,
  timezone     TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  last_seen    TIMESTAMPTZ DEFAULT NOW(),
  terminated_at TIMESTAMPTZ,
  terminated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_sessions_user_id_idx  ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS admin_sessions_active_idx   ON admin_sessions(is_active) WHERE is_active = TRUE;

ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read all sessions" ON admin_sessions FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('admin','superadmin','manager'))
);
CREATE POLICY "Users can read own sessions" ON admin_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert sessions"  ON admin_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update sessions"  ON admin_sessions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('admin','superadmin'))
);

-- ─── Automations ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS automations (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  trigger_event TEXT NOT NULL,          -- e.g. 'user.registered'
  conditions   JSONB DEFAULT '[]',      -- filter conditions
  actions      JSONB NOT NULL,          -- list of action configs
  is_active    BOOLEAN DEFAULT TRUE,
  run_count    INTEGER DEFAULT 0,
  last_run_at  TIMESTAMPTZ,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Managers+ can read automations"  ON automations FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('manager','admin','superadmin'))
);
CREATE POLICY "Admins can write automations" ON automations FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('admin','superadmin'))
);

-- ─── Email Templates ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_templates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  slug         TEXT NOT NULL UNIQUE,
  subject      TEXT NOT NULL,
  html_body    TEXT NOT NULL,
  text_body    TEXT,
  variables    JSONB DEFAULT '[]',      -- list of available template vars
  category     TEXT DEFAULT 'transactional',
  is_active    BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  send_count   INTEGER DEFAULT 0,
  created_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff+ can read email templates"  ON email_templates FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('editor','consultant','manager','admin','superadmin'))
);
CREATE POLICY "Admins can write email templates" ON email_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND user_role IN ('admin','superadmin'))
);

-- ─── Seed default email templates ────────────────────────────
INSERT INTO email_templates (name, slug, subject, html_body, text_body, variables, category) VALUES
(
  'Welcome Email', 'welcome',
  'Welcome to Siddhivinayak Overseas, {{full_name}}!',
  '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#b45309">Welcome, {{full_name}}!</h1><p>Thank you for registering with <strong>Siddhivinayak Overseas</strong>.</p><p>Start your visa journey today — explore countries, apply for visas, and book a consultation.</p><a href="{{dashboard_url}}" style="display:inline-block;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Go to Dashboard</a></body></html>',
  'Welcome {{full_name}}! Thank you for registering with Siddhivinayak Overseas.',
  '["full_name","dashboard_url","email"]', 'transactional'
),
(
  'Password Reset', 'password-reset',
  'Reset your Siddhivinayak Overseas password',
  '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#b45309">Reset Your Password</h1><p>Hi {{full_name}},</p><p>We received a request to reset your password. Click the button below to proceed.</p><a href="{{reset_url}}" style="display:inline-block;background:#b45309;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px">Reset Password</a><p style="color:#666;margin-top:24px;font-size:12px">This link expires in 1 hour. If you did not request this, you can ignore this email.</p></body></html>',
  'Hi {{full_name}}, click this link to reset your password: {{reset_url}}',
  '["full_name","reset_url","email"]', 'transactional'
),
(
  'Application Received', 'application-received',
  'We received your visa application — Ref #{{application_id}}',
  '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#b45309">Application Received</h1><p>Hi {{full_name}},</p><p>We have received your visa application for <strong>{{country_name}}</strong> (Ref: <strong>#{{application_id}}</strong>).</p><p>Our team will review your documents and contact you within 2-3 business days.</p></body></html>',
  'Hi {{full_name}}, we received your visa application #{{application_id}} for {{country_name}}.',
  '["full_name","application_id","country_name","email"]', 'transactional'
),
(
  'Appointment Confirmation', 'appointment-confirmation',
  'Your consultation is confirmed — {{appointment_date}}',
  '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#b45309">Appointment Confirmed</h1><p>Hi {{full_name}},</p><p>Your consultation appointment is confirmed for <strong>{{appointment_date}} at {{appointment_time}}</strong>.</p><p>Please be available 5 minutes before your scheduled time.</p></body></html>',
  'Hi {{full_name}}, your appointment is confirmed for {{appointment_date}} at {{appointment_time}}.',
  '["full_name","appointment_date","appointment_time","email"]', 'transactional'
),
(
  'Admin Alert', 'admin-alert',
  '[ALERT] {{alert_type}} — Siddhivinayak Admin',
  '<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px"><h1 style="color:#dc2626">⚠️ Admin Alert</h1><p><strong>Type:</strong> {{alert_type}}</p><p><strong>Details:</strong> {{alert_message}}</p><p><strong>Time:</strong> {{timestamp}}</p></body></html>',
  'ALERT [{{alert_type}}]: {{alert_message}} at {{timestamp}}',
  '["alert_type","alert_message","timestamp"]', 'admin'
)
ON CONFLICT (slug) DO NOTHING;
