-- -- ============================================================
-- -- SIDDHIVINAYAK OVERSEAS — PRODUCTION DATABASE SCHEMA
-- -- Supabase PostgreSQL (scalable, indexed, normalized)
-- -- ============================================================

-- -- Enable required extensions
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -- ============================================================
-- -- 1. COUNTRIES TABLE
-- -- Master data for destination countries with Geo data
-- -- ============================================================
-- CREATE TABLE countries (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     -- Short code used in UI / application ids (e.g. "AUD", "UK")
--     code            VARCHAR(5) NOT NULL UNIQUE,
--     name            VARCHAR(100) NOT NULL,
--     slug            VARCHAR(100) NOT NULL UNIQUE,
--     -- capital         VARCHAR(100),
--     region          VARCHAR(50),
--     subregion       VARCHAR(50),
--     latitude        NUMERIC(10, 8),
--     longitude       NUMERIC(11, 8),
--     -- currency        VARCHAR(50),
--     -- currency_code   VARCHAR(3),
--     -- language        VARCHAR(100),
--     flag_emoji      VARCHAR(10),
--     description     TEXT,
--     -- why_study       TEXT,
--     -- why_work        TEXT,
--     -- lifestyle       TEXT,
--     -- cost_of_living  JSONB DEFAULT '{}',
--     -- climate         JSONB DEFAULT '{}',
--     -- images          JSONB DEFAULT '[]',
--     visa_stats      JSONB DEFAULT '{}',
--     is_active       BOOLEAN NOT NULL DEFAULT TRUE,
--     sort_order      INTEGER DEFAULT 0,
--     meta_title      VARCHAR(200),
--     meta_desc       VARCHAR(500),
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_countries_active ON countries(is_active);
-- CREATE INDEX idx_countries_region ON countries(region);
-- CREATE INDEX idx_countries_slug ON countries(slug);

-- -- ============================================================
-- -- 2. VISA PROGRAMS TABLE
-- -- Available visa programs per country
-- -- ============================================================
-- CREATE TABLE visa_programs (
--     id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     country_id          UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
--     program_type        VARCHAR(50) NOT NULL CHECK (program_type IN ('work','study','tourist','skilled_worker')),
--     name                VARCHAR(200) NOT NULL,
--     slug                VARCHAR(200) NOT NULL,
--     description         TEXT NOT NULL,
--     eligibility         JSONB DEFAULT '[]',
--     requirements        JSONB DEFAULT '[]',
--     documents_needed    JSONB DEFAULT '[]',
--     processing_time     VARCHAR(100),
--     visa_duration       VARCHAR(100),
--     -- cost_inr            NUMERIC(12, 2),
--     -- cost_local          NUMERIC(12, 2),
--     -- cost_currency       VARCHAR(3),
--     success_rate        NUMERIC(5, 2),
--     -- pathway_to_pr       BOOLEAN DEFAULT FALSE,
--     -- spousal_rights      BOOLEAN DEFAULT FALSE,
--     -- work_while_study    BOOLEAN DEFAULT FALSE,
--     post_study_work     VARCHAR(200),
--     popular_sectors     JSONB DEFAULT '[]',
--     universities        JSONB DEFAULT '[]',
--     faq                 JSONB DEFAULT '[]',
--     is_active           BOOLEAN NOT NULL DEFAULT TRUE,
--     is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
--     sort_order          INTEGER DEFAULT 0,
--     meta_title          VARCHAR(200),
--     meta_desc           VARCHAR(500),
--     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--     UNIQUE(country_id, slug)
-- );

-- CREATE INDEX idx_visa_programs_country ON visa_programs(country_id);
-- CREATE INDEX idx_visa_programs_type ON visa_programs(program_type);
-- CREATE INDEX idx_visa_programs_active ON visa_programs(is_active);
-- CREATE INDEX idx_visa_programs_featured ON visa_programs(is_featured);

-- -- ============================================================
-- -- 3. USER PROFILES TABLE
-- -- Extends Supabase Auth users with profile data
-- -- ============================================================
-- CREATE TABLE user_profiles (
--     id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
--     email               VARCHAR(255) NOT NULL,
--     full_name           VARCHAR(200),
--     first_name          VARCHAR(100),
--     last_name           VARCHAR(100),
--     -- Display username (editable). Defaults to "First Last".
--     username            VARCHAR(200),
--     welcome_email_sent_at TIMESTAMPTZ,
--     phone               VARCHAR(20),
--     whatsapp            VARCHAR(20),
--     -- date_of_birth       DATE,
--     gender              VARCHAR(20),
--     nationality         VARCHAR(100),
--     current_city        VARCHAR(100),
--     current_country     VARCHAR(100),
--     -- preferred_countries JSONB DEFAULT '[]',
--     -- visa_type_interest  JSONB DEFAULT '[]',
--     education_level     VARCHAR(100),
--     field_of_study      VARCHAR(200),
--     -- work_experience_years INTEGER,
--     -- current_job         VARCHAR(200),
--     -- english_level       VARCHAR(50),
--     -- ielts_score         NUMERIC(3, 1),
--     -- pte_score           NUMERIC(3, 1),
--     -- toefl_score         NUMERIC(3, 1),
--     profile_photo_url   TEXT,
--     onboarding_complete BOOLEAN DEFAULT FALSE,
--     user_role           VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (user_role IN ('user','consultant','admin')),
--     status              VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
--     last_login_at       TIMESTAMPTZ,
--     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_user_profiles_email ON user_profiles(email);
-- CREATE INDEX idx_user_profiles_role ON user_profiles(user_role);
-- CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- -- ============================================================
-- -- 4. APPLICATIONS TABLE
-- -- Visa applications tracked per user
-- -- ============================================================
-- CREATE TABLE applications (
--     id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     -- Human readable id like AUD0805202601 (country code + IST DDMMYYYY + daily counter)
--     application_id      VARCHAR(32) UNIQUE,
--     user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
--     visa_program_id     UUID NOT NULL REFERENCES visa_programs(id) ON DELETE RESTRICT,
--     country_id          UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
--     application_type    VARCHAR(50) NOT NULL CHECK (application_type IN ('work','study','business','tourist','investor')),
--     status              VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','rejected','withdrawn')),
--     priority            VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    
--     -- Application details
--     personal_info       JSONB DEFAULT '{}',
--     education_history   JSONB DEFAULT '[]',
--     work_history        JSONB DEFAULT '[]',
--     document_checklist  JSONB DEFAULT '{}',
    
--     -- Timeline
--     submitted_at        TIMESTAMPTZ,
--     review_started_at   TIMESTAMPTZ,
--     decision_at         TIMESTAMPTZ,
--     estimated_completion  DATE,
    
--     -- -- Financial
--     -- total_fee_inr       NUMERIC(12, 2),
--     -- amount_paid         NUMERIC(12, 2) DEFAULT 0,
--     -- payment_status      VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partial','paid','refunded')),
    
--     -- Assignment
--     assigned_consultant UUID REFERENCES user_profiles(id),
--     consultant_notes    TEXT,
    
--     meta                JSONB DEFAULT '{}',
--     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_applications_user ON applications(user_id);
-- CREATE INDEX idx_applications_application_id ON applications(application_id);
-- CREATE INDEX idx_applications_status ON applications(status);
-- CREATE INDEX idx_applications_program ON applications(visa_program_id);
-- CREATE INDEX idx_applications_country ON applications(country_id);
-- CREATE INDEX idx_applications_assigned ON applications(assigned_consultant);

-- -- ============================================================
-- -- 5. CONSULTATIONS TABLE
-- -- Contact form + bookings
-- -- ============================================================
-- CREATE TABLE consultations (
--     id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id             UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
--     assigned_consultant UUID REFERENCES user_profiles(id),

--     consultation_type   VARCHAR(50) NOT NULL DEFAULT 'general'
--         CHECK (consultation_type IN ('general','work_visa','study_visa','country_specific','document_review','mock_interview')),
--     status              VARCHAR(30) NOT NULL DEFAULT 'requested'
--         CHECK (status IN ('requested','scheduled','confirmed','completed','cancelled','no_show')),

--     scheduled_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     duration_minutes    INTEGER DEFAULT 30,
--     timezone            VARCHAR(50) DEFAULT 'Asia/Kolkata',

--     -- Contact form fields (used by frontend contact page)
--     phone_number        VARCHAR(20),
--     whatsapp_number     VARCHAR(20),
--     preferred_country   VARCHAR(200),
--     visa_category       VARCHAR(200),
--     user_notes          JSONB DEFAULT '{}'::jsonb,

--     -- Internal notes / ops
--     consultant_notes    TEXT,
--     follow_up_needed    BOOLEAN DEFAULT FALSE,
--     follow_up_date      DATE,

--     rating              INTEGER CHECK (rating >= 1 AND rating <= 5),
--     feedback            TEXT,

--     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_consultations_user ON consultations(user_id);
-- CREATE INDEX idx_consultations_status ON consultations(status);
-- CREATE INDEX idx_consultations_date ON consultations(scheduled_at);
-- CREATE INDEX idx_consultations_consultant ON consultations(assigned_consultant);

-- -- -- ============================================================
-- -- -- 5. CONSULTATIONS TABLE
-- -- -- Free/paid consultation bookings
-- -- -- ============================================================
-- -- CREATE TABLE consultations (
-- --     id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
-- --     user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
-- --     assigned_consultant UUID REFERENCES user_profiles(id),
    
-- --     consultation_type   VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (consultation_type IN ('general','work_visa','study_visa','country_specific','document_review','mock_interview')),
-- --     status              VARCHAR(30) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('requested','scheduled','confirmed','completed','cancelled','no_show')),
    
-- --     scheduled_at        TIMESTAMPTZ NOT NULL,
-- --     duration_minutes    INTEGER DEFAULT 30,
-- --     timezone            VARCHAR(50) DEFAULT 'Asia/Kolkata',
    
-- --     -- Meeting details
-- --     meeting_link        TEXT,
-- --     meeting_platform    VARCHAR(50),
    
-- --     -- Topics & notes
-- --     topics              JSONB DEFAULT '[]',
-- --     preferred_countries JSONB DEFAULT '[]',
-- --     user_notes          TEXT,
-- --     consultant_notes    TEXT,
-- --     follow_up_needed    BOOLEAN DEFAULT FALSE,
-- --     follow_up_date      DATE,
    
-- --     rating              INTEGER CHECK (rating >= 1 AND rating <= 5),
-- --     feedback            TEXT,
    
-- --     created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
-- --     updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- -- );

-- -- CREATE INDEX idx_consultations_user ON consultations(user_id);
-- -- CREATE INDEX idx_consultations_status ON consultations(status);
-- -- CREATE INDEX idx_consultations_date ON consultations(scheduled_at);
-- -- CREATE INDEX idx_consultations_consultant ON consultations(assigned_consultant);

-- -- ============================================================
-- -- 6. SAVED PLACES / FAVORITES TABLE
-- -- Countries and programs saved by users
-- -- ============================================================
-- CREATE TABLE saved_places (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
--     item_type       VARCHAR(20) NOT NULL CHECK (item_type IN ('country','visa_program')),
--     country_id      UUID REFERENCES countries(id) ON DELETE CASCADE,
--     visa_program_id UUID REFERENCES visa_programs(id) ON DELETE CASCADE,
--     notes           TEXT,
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

--     UNIQUE(user_id, item_type, country_id, visa_program_id)
-- );

-- CREATE INDEX idx_saved_places_user ON saved_places(user_id);
-- CREATE INDEX idx_saved_places_type ON saved_places(item_type);

-- -- ============================================================
-- -- 7. INTERACTIONS / ANALYTICS TABLE
-- -- Track user interactions for insights
-- -- ============================================================
-- CREATE TABLE interactions (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
--     session_id      VARCHAR(100),
    
--     event_type      VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view','country_click','program_click','globe_interaction','search','consultation_book','application_start','application_submitted','application_status_change','document_download','share','signup','login','logout','failed_login','password_change')),
    
--     -- What was interacted with
--     entity_type     VARCHAR(30),  -- 'country', 'visa_program', 'page', 'globe'
--     entity_id       UUID,         -- references country or program
--     page_path       VARCHAR(500),
--     page_title      VARCHAR(200),
    
--     -- Context
--     referrer        VARCHAR(500),
--     device_type     VARCHAR(20),
--     browser         VARCHAR(50),
--     country_code    VARCHAR(3),
    
--     -- Globe-specific
--     globe_lat       NUMERIC(10, 8),
--     globe_lng       NUMERIC(11, 8),
    
--     metadata        JSONB DEFAULT '{}',
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_interactions_user ON interactions(user_id);
-- CREATE INDEX idx_interactions_event ON interactions(event_type);
-- CREATE INDEX idx_interactions_entity ON interactions(entity_type, entity_id);
-- CREATE INDEX idx_interactions_created ON interactions(created_at);
-- CREATE INDEX idx_interactions_session ON interactions(session_id);

-- -- ============================================================
-- -- 8. BLOG POSTS TABLE
-- -- SEO content for organic traffic
-- -- ============================================================
-- CREATE TABLE blog_posts (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     author_id       UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    
--     title           VARCHAR(300) NOT NULL,
--     slug            VARCHAR(300) NOT NULL UNIQUE,
--     excerpt         VARCHAR(500),
--     content         TEXT NOT NULL,
    
--     -- Categorization
--     category        VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general','work_visa','study_visa','country_guide','immigration_news','success_story','tips','document_guide')),
--     tags            JSONB DEFAULT '[]',
--     related_countries JSONB DEFAULT '[]',
--     related_programs  JSONB DEFAULT '[]',
    
--     -- Media
--     featured_image  TEXT,
--     -- cover_video     TEXT,
--     gallery         JSONB DEFAULT '[]',
    
--     -- SEO
--     meta_title      VARCHAR(200),
--     meta_desc       VARCHAR(500),
--     keywords        JSONB DEFAULT '[]',
--     canonical_url   VARCHAR(500),
    
--     -- Publishing
--     status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','scheduled','published','archived')),
--     published_at    TIMESTAMPTZ,
--     scheduled_at    TIMESTAMPTZ,
    
--     -- Engagement
--     view_count      INTEGER NOT NULL DEFAULT 0,
--     like_count      INTEGER NOT NULL DEFAULT 0,
--     share_count     INTEGER NOT NULL DEFAULT 0,
    
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
--     updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_blog_posts_status ON blog_posts(status);
-- CREATE INDEX idx_blog_posts_category ON blog_posts(category);
-- CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
-- CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
-- CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);

-- -- ============================================================
-- -- 9. NOTIFICATIONS TABLE
-- -- User notifications
-- -- ============================================================
-- CREATE TABLE notifications (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
--     type            VARCHAR(30) NOT NULL CHECK (type IN ('application_update','consultation_reminder','payment_due','document_request','general','promotion')),
--     title           VARCHAR(200) NOT NULL,
--     message         TEXT,
    
--     action_url      VARCHAR(500),
--     action_label    VARCHAR(50),
    
--     is_read         BOOLEAN NOT NULL DEFAULT FALSE,
--     read_at         TIMESTAMPTZ,
    
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_notifications_user ON notifications(user_id);
-- CREATE INDEX idx_notifications_read ON notifications(is_read);
-- CREATE INDEX idx_notifications_created ON notifications(created_at);

-- -- ============================================================
-- -- 10. COUNTRY FAQ TABLE
-- -- Country-specific FAQs
-- -- ============================================================
-- CREATE TABLE country_faqs (
--     id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     country_id      UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
--     question        TEXT NOT NULL,
--     answer          TEXT NOT NULL,
--     category        VARCHAR(50),
--     sort_order      INTEGER DEFAULT 0,
--     is_active       BOOLEAN DEFAULT TRUE,
--     created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- CREATE INDEX idx_country_faqs_country ON country_faqs(country_id);

-- -- ============================================================
-- -- FUNCTIONS & TRIGGERS
-- -- ============================================================

-- -- Auto-update updated_at function
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = NOW();
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Normalize names and default username to "First Last"
-- CREATE OR REPLACE FUNCTION set_user_profile_defaults()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   cleaned_full_name TEXT;
--   first_part TEXT;
--   last_part TEXT;
-- BEGIN
--   cleaned_full_name := NULLIF(BTRIM(COALESCE(NEW.full_name, '')), '');

--   -- If full_name provided but first/last not, derive them.
--   IF cleaned_full_name IS NOT NULL AND (NEW.first_name IS NULL OR NEW.last_name IS NULL) THEN
--     first_part := split_part(cleaned_full_name, ' ', 1);
--     last_part := NULLIF(BTRIM(replace(cleaned_full_name, first_part, '')), '');

--     IF NEW.first_name IS NULL THEN
--       NEW.first_name := NULLIF(BTRIM(first_part), '');
--     END IF;
--     IF NEW.last_name IS NULL THEN
--       NEW.last_name := last_part;
--     END IF;
--   END IF;

--   -- If full_name missing but first/last provided, build it.
--   IF cleaned_full_name IS NULL THEN
--     NEW.full_name := NULLIF(BTRIM(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
--   ELSE
--     NEW.full_name := cleaned_full_name;
--   END IF;

--   -- Default username = "First Last" (but keep user-chosen username if provided)
--   IF NEW.username IS NULL OR BTRIM(NEW.username) = '' THEN
--     NEW.username := NULLIF(BTRIM(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
--   END IF;

--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Application id counter table (per country code + IST date)
-- CREATE TABLE IF NOT EXISTS application_counters (
--   country_code VARCHAR(5) NOT NULL,
--   ist_date DATE NOT NULL,
--   counter INTEGER NOT NULL DEFAULT 0,
--   PRIMARY KEY (country_code, ist_date)
-- );

-- -- Generate application_id like AUD0805202601 (IST-based date + daily counter)
-- CREATE OR REPLACE FUNCTION generate_application_id(p_country_code VARCHAR)
-- RETURNS TEXT AS $$
-- DECLARE
--   v_code TEXT;
--   v_ist_date DATE;
--   v_date_str TEXT;
--   v_next INTEGER;
-- BEGIN
--   v_code := UPPER(BTRIM(p_country_code));
--   IF v_code IS NULL OR v_code = '' THEN
--     RAISE EXCEPTION 'country code is required';
--   END IF;

--   v_ist_date := (timezone('Asia/Kolkata', now()))::date;
--   v_date_str := to_char(v_ist_date, 'DDMMYYYY');

--   -- Lock per (code, date) to avoid duplicates under concurrency
--   PERFORM pg_advisory_xact_lock(hashtext(v_code || ':' || v_date_str));

--   INSERT INTO application_counters(country_code, ist_date, counter)
--   VALUES (v_code, v_ist_date, 0)
--   ON CONFLICT (country_code, ist_date) DO NOTHING;

--   UPDATE application_counters
--   SET counter = counter + 1
--   WHERE country_code = v_code AND ist_date = v_ist_date
--   RETURNING counter INTO v_next;

--   RETURN v_code || v_date_str || lpad(v_next::text, 2, '0');
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE OR REPLACE FUNCTION set_application_id()
-- RETURNS TRIGGER AS $$
-- DECLARE
--   v_code TEXT;
-- BEGIN
--   IF NEW.application_id IS NOT NULL AND BTRIM(NEW.application_id) <> '' THEN
--     RETURN NEW;
--   END IF;

--   SELECT code INTO v_code FROM countries WHERE id = NEW.country_id;
--   IF v_code IS NULL THEN
--     RAISE EXCEPTION 'Invalid country_id %', NEW.country_id;
--   END IF;

--   NEW.application_id := generate_application_id(v_code);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- Apply triggers to all tables with updated_at
-- CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_visa_programs_updated_at BEFORE UPDATE ON visa_programs
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER user_profiles_defaults BEFORE INSERT OR UPDATE ON user_profiles
--     FOR EACH ROW EXECUTE FUNCTION set_user_profile_defaults();

-- CREATE TRIGGER applications_set_application_id BEFORE INSERT ON applications
--     FOR EACH ROW EXECUTE FUNCTION set_application_id();

-- -- Function to increment view count safely
-- CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
-- RETURNS void AS $$
-- BEGIN
--     UPDATE blog_posts SET view_count = view_count + 1 WHERE id = post_id;
-- END;
-- $$ LANGUAGE plpgsql;

-- -- ============================================================
-- -- ROW LEVEL SECURITY (RLS) POLICIES
-- -- ============================================================

-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- -- user_profiles: users can read/update their own; admins can read all
-- CREATE POLICY "Users can view own profile" ON user_profiles
--     FOR SELECT USING (auth.uid() = id OR user_role = 'admin');
-- CREATE POLICY "Users can update own profile" ON user_profiles
--     FOR UPDATE USING (auth.uid() = id);

-- -- applications: users can access own; consultants can access assigned; admins all
-- CREATE POLICY "Users can view own applications" ON applications
--     FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);
-- CREATE POLICY "Users can insert own applications" ON applications
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own applications" ON applications
--     FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);

-- -- consultations
-- CREATE POLICY "Users can view own consultations" ON consultations
--     FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);
-- CREATE POLICY "Users can insert own consultations" ON consultations
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own consultations" ON consultations
--     FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);

-- -- saved_places
-- CREATE POLICY "Users can manage own saved places" ON saved_places
--     FOR ALL USING (auth.uid() = user_id);

-- -- notifications
-- CREATE POLICY "Users can manage own notifications" ON notifications
--     FOR ALL USING (auth.uid() = user_id);

-- -- interactions (anonymous + authenticated)
-- CREATE POLICY "Allow all interactions" ON interactions
--     FOR ALL USING (true);

-- -- Public read tables (no RLS needed for read, but enable for safety)
-- ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE visa_programs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE country_faqs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Countries are public" ON countries FOR SELECT USING (is_active = true);
-- CREATE POLICY "Visa programs are public" ON visa_programs FOR SELECT USING (is_active = true);
-- CREATE POLICY "Published blog posts are public" ON blog_posts FOR SELECT USING (status = 'published' AND published_at <= NOW());
-- CREATE POLICY "Country FAQs are public" ON country_faqs FOR SELECT USING (is_active = true);

-- -- ============================================================
-- -- VIEWS FOR CONVENIENT QUERYING
-- -- ============================================================

-- CREATE OR REPLACE VIEW public_countries WITH (security_invoker = true) AS
-- SELECT * FROM countries WHERE is_active = true ORDER BY sort_order, name;

-- CREATE OR REPLACE VIEW public_visa_programs WITH (security_invoker = true) AS
-- SELECT vp.*, c.name as country_name, c.slug as country_slug, c.flag_emoji
-- FROM visa_programs vp
-- JOIN countries c ON vp.country_id = c.id
-- WHERE vp.is_active = true AND c.is_active = true
-- ORDER BY c.sort_order, vp.sort_order;

-- CREATE OR REPLACE VIEW featured_programs WITH (security_invoker = true) AS
-- SELECT vp.*, c.name as country_name, c.slug as country_slug, c.flag_emoji
-- FROM visa_programs vp
-- JOIN countries c ON vp.country_id = c.id
-- WHERE vp.is_featured = true AND vp.is_active = true AND c.is_active = true
-- ORDER BY vp.sort_order;

-- CREATE OR REPLACE VIEW user_dashboard_summary WITH (security_invoker = true) AS
-- SELECT 
--     u.id as user_id,
--     u.full_name,
--     u.email,
--     (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id) as total_applications,
--     (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id AND a.status NOT IN ('approved','rejected','withdrawn')) as active_applications,
--     (SELECT COUNT(*) FROM consultations c WHERE c.user_id = u.id) as total_consultations,
--     (SELECT COUNT(*) FROM saved_places s WHERE s.user_id = u.id) as saved_count,
--     (SELECT COUNT(*) FROM notifications n WHERE n.user_id = u.id AND n.is_read = false) as unread_notifications
-- FROM user_profiles u;

-- -- ============================================================
-- -- END OF SCHEMA
-- -- ============================================================




-- ============================================================
-- SIDDHIVINAYAK OVERSEAS — PRODUCTION DATABASE SCHEMA
-- SOURCE OF TRUTH - edit here first
-- Supabase PostgreSQL (scalable, indexed, normalized)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. COUNTRIES
-- ============================================================
CREATE TABLE countries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(5) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    capital         VARCHAR(100),
    region          VARCHAR(50),
    subregion       VARCHAR(50),
    latitude        NUMERIC(10, 8),
    longitude       NUMERIC(11, 8),
    currency        VARCHAR(50),
    currency_code   VARCHAR(3),
    language        VARCHAR(100),
    flag_emoji      VARCHAR(10),
    description     TEXT,
    why_study       TEXT,
    why_work        TEXT,
    lifestyle       TEXT,
    cost_of_living  JSONB DEFAULT '{}',
    climate         JSONB DEFAULT '{}',
    images          JSONB DEFAULT '[]',
    visa_stats      JSONB DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INTEGER DEFAULT 0,
    meta_title      VARCHAR(200),
    meta_desc       VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_countries_active ON countries(is_active);
CREATE INDEX idx_countries_region ON countries(region);
CREATE INDEX idx_countries_slug ON countries(slug);

-- ============================================================
-- 2. VISA PROGRAMS
-- ============================================================
CREATE TABLE visa_programs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id          UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    program_type        VARCHAR(50) NOT NULL CHECK (program_type IN ('work','study','tourist','skilled_worker')),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(200) NOT NULL,
    description         TEXT NOT NULL,
    eligibility         JSONB DEFAULT '[]',
    requirements        JSONB DEFAULT '[]',
    documents_needed    JSONB DEFAULT '[]',
    processing_time     VARCHAR(100),
    visa_duration       VARCHAR(100),
    cost_inr            NUMERIC(12, 2),
    cost_local          NUMERIC(12, 2),
    cost_currency       VARCHAR(3),
    success_rate        NUMERIC(5, 2),
    pathway_to_pr       BOOLEAN DEFAULT FALSE,
    spousal_rights      BOOLEAN DEFAULT FALSE,
    work_while_study    BOOLEAN DEFAULT FALSE,
    post_study_work     VARCHAR(200),
    popular_sectors     JSONB DEFAULT '[]',
    universities        JSONB DEFAULT '[]',
    faq                 JSONB DEFAULT '[]',
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured         BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order          INTEGER DEFAULT 0,
    meta_title          VARCHAR(200),
    meta_desc           VARCHAR(500),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(country_id, slug)
);

CREATE INDEX idx_visa_programs_country ON visa_programs(country_id);
CREATE INDEX idx_visa_programs_type ON visa_programs(program_type);
CREATE INDEX idx_visa_programs_active ON visa_programs(is_active);
CREATE INDEX idx_visa_programs_featured ON visa_programs(is_featured);

-- ============================================================
-- 3. USER PROFILES (extends Supabase Auth)
-- ============================================================
CREATE TABLE user_profiles (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email               VARCHAR(255) NOT NULL,
    full_name           VARCHAR(200),
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    username            VARCHAR(200),
    welcome_email_sent_at TIMESTAMPTZ,
    phone               VARCHAR(20),
    whatsapp            VARCHAR(20),
    gender              VARCHAR(20),
    nationality         VARCHAR(100),
    current_city        VARCHAR(100),
    current_country     VARCHAR(100),
    education_level     VARCHAR(100),
    field_of_study      VARCHAR(200),
    profile_photo_url   TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    user_role           VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (user_role IN ('user','consultant','admin')),
    status              VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleted')),
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role ON user_profiles(user_role);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);

-- ============================================================
-- 4. APPLICATIONS
-- ============================================================
CREATE TABLE applications (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id      VARCHAR(32) UNIQUE,
    user_id             UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    visa_program_id     UUID NOT NULL REFERENCES visa_programs(id) ON DELETE RESTRICT,
    country_id          UUID NOT NULL REFERENCES countries(id) ON DELETE RESTRICT,
    application_type    VARCHAR(50) NOT NULL CHECK (application_type IN ('work','study','business','tourist','investor')),
    status              VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under_review','approved','rejected','withdrawn')),
    priority            VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    
    personal_info       JSONB DEFAULT '{}',
    education_history   JSONB DEFAULT '[]',
    work_history        JSONB DEFAULT '[]',
    document_checklist  JSONB DEFAULT '{}',
    
    submitted_at        TIMESTAMPTZ,
    review_started_at   TIMESTAMPTZ,
    decision_at         TIMESTAMPTZ,
    estimated_completion  DATE,
    
    assigned_consultant UUID REFERENCES user_profiles(id),
    consultant_notes    TEXT,
    
    meta                JSONB DEFAULT '{}',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_application_id ON applications(application_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_program ON applications(visa_program_id);
CREATE INDEX idx_applications_country ON applications(country_id);
CREATE INDEX idx_applications_assigned ON applications(assigned_consultant);

-- ============================================================
-- 5. CONSULTATIONS
-- ============================================================
CREATE TABLE consultations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    assigned_consultant UUID REFERENCES user_profiles(id),

    consultation_type   VARCHAR(50) NOT NULL DEFAULT 'general'
        CHECK (consultation_type IN ('general','work_visa','study_visa','country_specific','document_review','mock_interview')),
    status              VARCHAR(30) NOT NULL DEFAULT 'requested'
        CHECK (status IN ('requested','scheduled','confirmed','completed','cancelled','no_show')),

    scheduled_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes    INTEGER DEFAULT 30,
    timezone            VARCHAR(50) DEFAULT 'Asia/Kolkata',

    phone_number        VARCHAR(20),
    whatsapp_number     VARCHAR(20),
    preferred_country   VARCHAR(200),
    visa_category       VARCHAR(200),
    user_notes          JSONB DEFAULT '{}'::jsonb,

    consultant_notes    TEXT,
    follow_up_needed    BOOLEAN DEFAULT FALSE,
    follow_up_date      DATE,

    rating              INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback            TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultations_user ON consultations(user_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_date ON consultations(scheduled_at);
CREATE INDEX idx_consultations_consultant ON consultations(assigned_consultant);

-- ============================================================
-- 6. SAVED PLACES
-- ============================================================
CREATE TABLE saved_places (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    item_type       VARCHAR(20) NOT NULL CHECK (item_type IN ('country','visa_program')),
    country_id      UUID REFERENCES countries(id) ON DELETE CASCADE,
    visa_program_id UUID REFERENCES visa_programs(id) ON DELETE CASCADE,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, item_type, country_id, visa_program_id)
);

CREATE INDEX idx_saved_places_user ON saved_places(user_id);
CREATE INDEX idx_saved_places_type ON saved_places(item_type);

-- ============================================================
-- 7. INTERACTIONS
-- ============================================================
CREATE TABLE interactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    session_id      VARCHAR(100),
    event_type      VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view','country_click','program_click','globe_interaction','search','consultation_book','application_start','application_submitted','application_status_change','document_download','share','signup','login','logout','failed_login','password_change')),
    entity_type     VARCHAR(30),
    entity_id       UUID,
    page_path       VARCHAR(500),
    page_title      VARCHAR(200),
    referrer        VARCHAR(500),
    device_type     VARCHAR(20),
    browser         VARCHAR(50),
    country_code    VARCHAR(3),
    globe_lat       NUMERIC(10, 8),
    globe_lng       NUMERIC(11, 8),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_interactions_user ON interactions(user_id);
CREATE INDEX idx_interactions_event ON interactions(event_type);
CREATE INDEX idx_interactions_entity ON interactions(entity_type, entity_id);
CREATE INDEX idx_interactions_created ON interactions(created_at);
CREATE INDEX idx_interactions_session ON interactions(session_id);

-- ============================================================
-- 8. BLOG POSTS
-- ============================================================
CREATE TABLE blog_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    title           VARCHAR(300) NOT NULL,
    slug            VARCHAR(300) NOT NULL UNIQUE,
    excerpt         VARCHAR(500),
    content         TEXT NOT NULL,
    category        VARCHAR(50) NOT NULL DEFAULT 'general' CHECK (category IN ('general','work_visa','study_visa','country_guide','immigration_news','success_story','tips','document_guide')),
    tags            JSONB DEFAULT '[]',
    related_countries JSONB DEFAULT '[]',
    related_programs  JSONB DEFAULT '[]',
    featured_image  TEXT,
    gallery         JSONB DEFAULT '[]',
    meta_title      VARCHAR(200),
    meta_desc       VARCHAR(500),
    keywords        JSONB DEFAULT '[]',
    canonical_url   VARCHAR(500),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','scheduled','published','archived')),
    published_at    TIMESTAMPTZ,
    scheduled_at    TIMESTAMPTZ,
    view_count      INTEGER NOT NULL DEFAULT 0,
    like_count      INTEGER NOT NULL DEFAULT 0,
    share_count     INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);

-- ============================================================
-- 9. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('application_update','consultation_reminder','payment_due','document_request','general','promotion')),
    title           VARCHAR(200) NOT NULL,
    message         TEXT,
    action_url      VARCHAR(500),
    action_label    VARCHAR(50),
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- ============================================================
-- 10. COUNTRY FAQS
-- ============================================================
CREATE TABLE country_faqs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id      UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
    question        TEXT NOT NULL,
    answer          TEXT NOT NULL,
    category        VARCHAR(50),
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_country_faqs_country ON country_faqs(country_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_user_profile_defaults()
RETURNS TRIGGER AS $$
DECLARE
  cleaned_full_name TEXT;
  first_part TEXT;
  last_part TEXT;
BEGIN
  cleaned_full_name := NULLIF(BTRIM(COALESCE(NEW.full_name, '')), '');

  IF cleaned_full_name IS NOT NULL AND (NEW.first_name IS NULL OR NEW.last_name IS NULL) THEN
    first_part := split_part(cleaned_full_name, ' ', 1);
    last_part := NULLIF(BTRIM(replace(cleaned_full_name, first_part, '')), '');

    IF NEW.first_name IS NULL THEN
      NEW.first_name := NULLIF(BTRIM(first_part), '');
    END IF;
    IF NEW.last_name IS NULL THEN
      NEW.last_name := last_part;
    END IF;
  END IF;

  IF cleaned_full_name IS NULL THEN
    NEW.full_name := NULLIF(BTRIM(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
  ELSE
    NEW.full_name := cleaned_full_name;
  END IF;

  IF NEW.username IS NULL OR BTRIM(NEW.username) = '' THEN
    NEW.username := NULLIF(BTRIM(concat_ws(' ', NEW.first_name, NEW.last_name)), '');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS application_counters (
  country_code VARCHAR(5) NOT NULL,
  ist_date DATE NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (country_code, ist_date)
);

CREATE OR REPLACE FUNCTION generate_application_id(p_country_code VARCHAR)
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_ist_date DATE;
  v_date_str TEXT;
  v_next INTEGER;
BEGIN
  v_code := UPPER(BTRIM(p_country_code));
  IF v_code IS NULL OR v_code = '' THEN
    RAISE EXCEPTION 'country code is required';
  END IF;

  v_ist_date := (timezone('Asia/Kolkata', now()))::date;
  v_date_str := to_char(v_ist_date, 'DDMMYYYY');

  PERFORM pg_advisory_xact_lock(hashtext(v_code || ':' || v_date_str));

  INSERT INTO application_counters(country_code, ist_date, counter)
  VALUES (v_code, v_ist_date, 0)
  ON CONFLICT (country_code, ist_date) DO NOTHING;

  UPDATE application_counters
  SET counter = counter + 1
  WHERE country_code = v_code AND ist_date = v_ist_date
  RETURNING counter INTO v_next;

  RETURN v_code || v_date_str || lpad(v_next::text, 2, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_application_id()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visa_programs_updated_at BEFORE UPDATE ON visa_programs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER user_profiles_defaults BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_user_profile_defaults();

CREATE TRIGGER applications_set_application_id BEFORE INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION set_application_id();

CREATE OR REPLACE FUNCTION increment_blog_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE blog_posts SET view_count = view_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- RLS POLICIES
-- ============================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);
CREATE POLICY "Users can insert own applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON applications
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);

CREATE POLICY "Users can view own consultations" ON consultations
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);
CREATE POLICY "Users can insert own consultations" ON consultations
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own consultations" ON consultations
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = assigned_consultant);

CREATE POLICY "Users can manage own saved places" ON saved_places
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Allow all interactions" ON interactions
    FOR ALL USING (true);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are public" ON countries FOR SELECT USING (is_active = true);
CREATE POLICY "Visa programs are public" ON visa_programs FOR SELECT USING (is_active = true);
CREATE POLICY "Published blog posts are public" ON blog_posts FOR SELECT USING (status = 'published' AND published_at <= NOW());
CREATE POLICY "Country FAQs are public" ON country_faqs FOR SELECT USING (is_active = true);

CREATE SCHEMA IF NOT EXISTS app_private;

CREATE OR REPLACE FUNCTION app_private.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    whatsapp
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'whatsapp'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.user_profiles.full_name),
    first_name = COALESCE(EXCLUDED.first_name, public.user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, public.user_profiles.last_name),
    phone = COALESCE(EXCLUDED.phone, public.user_profiles.phone),
    whatsapp = COALESCE(EXCLUDED.whatsapp, public.user_profiles.whatsapp),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION app_private.handle_new_user();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public_countries WITH (security_invoker = true) AS
SELECT * FROM countries WHERE is_active = true ORDER BY sort_order, name;

CREATE OR REPLACE VIEW public_visa_programs WITH (security_invoker = true) AS
SELECT vp.*, c.name as country_name, c.slug as country_slug, c.flag_emoji
FROM visa_programs vp
JOIN countries c ON vp.country_id = c.id
WHERE vp.is_active = true AND c.is_active = true
ORDER BY c.sort_order, vp.sort_order;

CREATE OR REPLACE VIEW featured_programs WITH (security_invoker = true) AS
SELECT vp.*, c.name as country_name, c.slug as country_slug, c.flag_emoji
FROM visa_programs vp
JOIN countries c ON vp.country_id = c.id
WHERE vp.is_featured = true AND vp.is_active = true AND c.is_active = true
ORDER BY vp.sort_order;

CREATE OR REPLACE VIEW user_dashboard_summary WITH (security_invoker = true) AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id) as total_applications,
    (SELECT COUNT(*) FROM applications a WHERE a.user_id = u.id AND a.status NOT IN ('approved','rejected','withdrawn')) as active_applications,
    (SELECT COUNT(*) FROM consultations c WHERE c.user_id = u.id) as total_consultations,
    (SELECT COUNT(*) FROM saved_places s WHERE s.user_id = u.id) as saved_count,
    (SELECT COUNT(*) FROM notifications n WHERE n.user_id = u.id AND n.is_read = false) as unread_notifications
FROM user_profiles u;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON countries, visa_programs, country_faqs, public_countries, public_visa_programs, featured_programs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_profiles, applications, consultations, saved_places, notifications, interactions TO authenticated;
