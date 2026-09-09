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


-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO countries (code, name, slug, region, subregion, latitude, longitude, flag_emoji, description, visa_stats, sort_order, meta_title, meta_desc) VALUES
('JPN', 'Japan', 'japan', 'Asia', 'Eastern Asia', 36.2048, 138.2529, '🇯🇵', 
'Japan offers world-class work opportunities in technology, engineering, and manufacturing. With a unique blend of tradition and cutting-edge innovation, Japan is a top destination for skilled professionals.',
'{"success_rate": 94.5, "avg_processing_days": 45, "popular_sectors": ["IT", "Engineering", "Healthcare", "Agriculture"]}',
1,
'Japan Work & Study Visa | Siddhivinayak Overseas',
'Apply for Japan work visa and study visa with expert guidance. Specified Skilled Worker program, student visas, and permanent residency pathways.'),

('AUS', 'Australia', 'australia', 'Oceania', 'Australia and New Zealand', -25.2744, 133.7751, '🇦🇺',
'Australia offers an excellent quality of life, high wages, and a welcoming environment for skilled migrants. The points-based system rewards qualified professionals.',
'{"success_rate": 91.2, "avg_processing_days": 60, "popular_sectors": ["Healthcare", "IT", "Engineering", "Construction", "Education"]}',
2,
'Australia Work & Study Visa | Siddhivinayak Overseas',
'Australia skilled migration, student visas, and PR pathways. Expert consultants for 482 TSS visa, 186 ENS visa, and post-study work permits.'),

('CAN', 'Canada', 'canada', 'Americas', 'Northern America', 56.1304, -106.3468, '🇨🇦',
'Canada is one of the most immigration-friendly countries with clear pathways to permanent residency. It actively seeks skilled workers through Express Entry and PNPs.',
'{"success_rate": 92.8, "avg_processing_days": 90, "popular_sectors": ["IT", "Healthcare", "Finance", "Engineering", "Trades"]}',
3,
'Canada Work & Study Visa | Express Entry | Siddhivinayak Overseas',
'Canada Express Entry, Provincial Nominee Programs, study permits, and PGWP. Expert guidance for PR pathways and LMIA work permits.'),

('GBR', 'United Kingdom', 'united-kingdom', 'Europe', 'Northern Europe', 55.3781, -3.4360, '🇬🇧',
'The UK offers the Skilled Worker visa and Graduate visa for international talent. London is a global hub for finance, tech, and creative industries.',
'{"success_rate": 89.5, "avg_processing_days": 30, "popular_sectors": ["Healthcare", "Finance", "IT", "Engineering", "Education"]}',
4,
'UK Work Visa & Study Visa | Skilled Worker | Siddhivinayak Overseas',
'UK Skilled Worker visa, Health and Care visa, Graduate Route, and student visas. Expert guidance for sponsors and NHS pathways.'),

('DEU', 'Germany', 'germany', 'Europe', 'Western Europe', 51.1657, 10.4515, '🇩🇪',
'Germany has Europes strongest economy and a severe skilled worker shortage. The new Opportunity Card (Chancenkarte) makes job searching easier than ever.',
'{"success_rate": 93.1, "avg_processing_days": 50, "popular_sectors": ["Engineering", "IT", "Healthcare", "Automotive", "Manufacturing"]}',
5,
'Germany Work & Study Visa | EU Blue Card | Siddhivinayak Overseas',
'Germany Opportunity Card, EU Blue Card, skilled worker visa, and study permits. Free education and strong job market for skilled professionals.'),

('NZL', 'New Zealand', 'new-zealand', 'Oceania', 'Australia and New Zealand', -40.9006, 174.8860, '🇳🇿',
'New Zealand offers a high quality of life, stunning landscapes, and a straightforward points-based immigration system. It actively seeks skilled migrants.',
'{"success_rate": 88.7, "avg_processing_days": 75, "popular_sectors": ["Healthcare", "IT", "Construction", "Agriculture", "Education"]}',
6,
'New Zealand Work & Study Visa | Skilled Migrant | Siddhivinayak Overseas',
'New Zealand Skilled Migrant Category, Accredited Employer Work Visa, and study pathways. Expert guidance for NZ immigration points system.'),

('RUS', 'Russia', 'russia', 'Europe', 'Eastern Europe', 61.5240, 105.3188, '🇷🇺',
'Russia offers opportunities in engineering, energy, and technology sectors. Work visas are employer-sponsored with straightforward requirements.',
'{"success_rate": 85.3, "avg_processing_days": 40, "popular_sectors": ["Energy", "Engineering", "IT", "Construction", "Manufacturing"]}',
7,
'Russia Work & Study Visa | Siddhivinayak Overseas',
'Russia work permits and student visas. Opportunities in energy, engineering, and technology sectors with affordable living costs.'),

('USA', 'United States', 'united-states', 'Americas', 'Northern America', 37.0902, -95.7129, '🇺🇸',
'The USA remains the top destination for skilled professionals and students. The H-1B, L-1, and O-1 visas offer pathways for talent across industries.',
'{"success_rate": 87.4, "avg_processing_days": 120, "popular_sectors": ["IT", "Healthcare", "Finance", "Engineering", "Research"]}',
8,
'USA Work Visa & Study Visa | H-1B, F-1, OPT | Siddhivinayak Overseas',
'USA H-1B visa, F-1 student visa, OPT, L-1 transfer, and O-1 extraordinary ability visas. Expert guidance for US immigration.'),

('IND', 'India', 'india', 'Asia', 'Southern Asia', 20.5937, 78.9629, '🇮🇳',
'India is a top source country for skilled migrants worldwide. We help Indian professionals and students achieve their overseas dreams.',
'{"success_rate": 96.0, "avg_processing_days": 30, "popular_sectors": ["IT", "Healthcare", "Engineering", "Finance", "Education"]}',
9,
'India Best Visa Consultants | Work & Study Abroad | Siddhivinayak Overseas',
'Indias trusted visa consultancy for work and study visas to Japan, Australia, Canada, UK, Germany, New Zealand, Russia, and USA.'),

('ARE', 'United Arab Emirates', 'united-arab-emirates', 'Asia', 'Western Asia', 23.4241, 53.8478, '🇦🇪',
'The UAE offers tax-free salaries, modern infrastructure, and a cosmopolitan lifestyle. The Golden Visa provides long-term residency for skilled professionals.',
'{"success_rate": 95.2, "avg_processing_days": 20, "popular_sectors": ["Finance", "IT", "Hospitality", "Construction", "Aviation"]}',
10,
'UAE Work Visa & Golden Visa | Siddhivinayak Overseas',
'UAE employment visa, Golden Visa, and student permits. Tax-free income and long-term residency options for skilled professionals.');

INSERT INTO visa_programs (country_id, program_type, name, slug, description, eligibility, requirements, documents_needed, processing_time, visa_duration, success_rate, post_study_work, popular_sectors, universities, is_featured, sort_order, meta_title, meta_desc) VALUES
((SELECT id FROM countries WHERE code='JPN'), 'work', 'Specified Skilled Worker Visa (SSW)', 'specified-skilled-worker',
'The Specified Skilled Worker visa allows employment in 14 sectors facing labor shortages. It offers a pathway to permanent residency and can bring family after certain conditions.',
'["Age 18+", "Passed required skills test", "Passed Japanese language test (N4 or above)", "Job offer from registered employer", "Clean criminal record"]',
'["Valid passport", "Employment contract", "Skills test certificate", "Japanese language certificate", "Health check"]',
'["Passport (6+ months validity)", "Visa application form", "Photo (45x45mm)", "Certificate of Eligibility (COE)", "Employment contract", "Skills test results", "Japanese language test results"]',
'2-3 months (after COE)', '1 year, renewable up to 5 years', 94.5, 'Not applicable for work visa',
'["Caregiving", "Building cleaning", "Agriculture", "Fishery", "Food service", "Accommodation", "Automotive repair", "Aviation", "Shipbuilding", "Industrial machinery", "Electronics", "Construction", "Material processing", "Nursing"]',
'[]', true, 1,
'Japan Specified Skilled Worker Visa | SSW Visa Requirements',
'Apply for Japans Specified Skilled Worker visa. 14 sectors available, pathway to PR, family sponsorship. Expert guidance for skills and language tests.'),

((SELECT id FROM countries WHERE code='JPN'), 'study', 'Student Visa (College/University)', 'student-visa',
'Japan offers world-class education in technology, medicine, and humanities. The student visa allows part-time work (28 hours/week) and post-graduation employment options.',
'["Age 18+", "High school diploma or equivalent", "Japanese language proficiency (N5 minimum, N2 recommended)", "Proof of financial support (1.5M JPY/year)", "Acceptance letter from institution"]',
'["Valid passport", "Admission letter", "Financial proof", "Language certificate", "Academic transcripts", "Health certificate"]',
'["Passport", "Visa application form", "Photo", "Certificate of Eligibility (COE)", "Admission letter", "Financial documents", "Academic records", "Language certificate", "Statement of purpose"]',
'1-2 months (after COE)', 'Duration of course + 3 months', 96.2, 'Up to 1 year (depends on degree)',
'["Engineering", "Medicine", "Business", "IT", "Japanese Language"]',
'["University of Tokyo", "Kyoto University", "Osaka University", "Tohoku University", "Tokyo Institute of Technology", "Waseda University", "Keio University"]',
true, 2,
'Japan Student Visa | Study in Japan | Siddhivinayak Overseas',
'Japan student visa application guidance. Part-time work allowed, post-study employment options, MEXT scholarships. Top university admissions support.'),

((SELECT id FROM countries WHERE code='AUS'), 'work', 'Temporary Skill Shortage Visa (Subclass 482)', 'temporary-skill-shortage-482',
'The TSS 482 visa allows skilled workers to live and work in Australia for an approved employer. It offers a pathway to permanent residency through the Temporary Residence Transition stream.',
'["Occupation on eligible list", "2+ years relevant work experience", "Skills assessment (if required)", "English proficiency (IELTS 5.0+)", "Employer sponsorship from approved business"]',
'["Valid passport", "Skills assessment", "English test results", "Employment references", "Health insurance (OVHC)", "Police clearances"]',
'["Passport", "Application form", "Skills assessment", "Employment contracts", "Reference letters", "English test", "Health examination", "Police certificates", "Health insurance proof"]',
'1-3 months', 'Up to 4 years (2 years for short-term)', 91.2, 'PR pathway via TRT stream',
'["IT", "Engineering", "Healthcare", "Accounting", "Construction", "Education", "Hospitality", "Agriculture"]',
'[]', true, 1,
'Australia 482 TSS Visa | Temporary Skill Shortage | Siddhivinayak Overseas',
'Australia 482 visa application. Employer sponsorship, skills assessment, and PR pathway. Expert guidance for skilled worker migration.'),

((SELECT id FROM countries WHERE code='AUS'), 'study', 'Student Visa (Subclass 500)', 'student-visa-500',
'The Student Visa 500 allows international students to study full-time at Australian institutions. Includes work rights and post-study work visa options.',
'["Enrollment in CRICOS-registered course", "Genuine Temporary Entrant (GTE) requirement", "English proficiency (IELTS 5.5+)", "Financial capacity (tuition + living costs)", "Overseas Student Health Cover (OSHC)"]',
'["Valid passport", "COE (Confirmation of Enrollment)", "GTE statement", "English test", "Financial documents", "Health insurance (OSHC)", "Health examination"]',
'["Passport", "Application form", "COE", "GTE statement", "Academic transcripts", "English test results", "Financial evidence", "OSHC certificate", "Health check", "Police clearances"]',
'1-3 months', 'Duration of course', 93.8, '2-4 years via Temporary Graduate Visa (485)',
'["Business", "Engineering", "IT", "Healthcare", "Education", "Hospitality"]',
'["University of Melbourne", "Australian National University", "University of Sydney", "UNSW", "Monash University", "University of Queensland"]',
true, 2,
'Australia Student Visa 500 | Study in Australia | Siddhivinayak Overseas',
'Australia student visa Subclass 500. CRICOS courses, GTE guidance, OSHC, and post-study work visa pathway. Top university admissions support.'),

((SELECT id FROM countries WHERE code='AUS'), 'work', 'Skilled Independent Visa (Subclass 189)', 'skilled-independent-189',
'The Subclass 189 is a points-based permanent residency visa for skilled workers who are not sponsored by an employer, family member, or state/territory.',
'["Occupation on MLTSSL", "Positive skills assessment", "Age under 45", "Competent English (IELTS 6.0+)", "Score minimum 65 points on points test"]',
'["Skills assessment", "English test", "Age proof", "Work experience evidence", "Educational qualifications", "Partner skills (if applicable)"]',
'["Passport", "Skills assessment", "English test", "Employment references", "Academic documents", "Partner documents (if applicable)", "Health examination", "Police clearances"]',
'8-12 months', 'Permanent', 88.5, 'Permanent visa - PR from day one',
'["IT", "Engineering", "Healthcare", "Accounting", "Education", "Trades"]',
'[]', true, 3,
'Australia 189 PR Visa | Skilled Independent | Siddhivinayak Overseas',
'Australia permanent residency via Skilled Independent 189 visa. Points test optimization, skills assessment, and EOI submission guidance.'),

((SELECT id FROM countries WHERE code='CAN'), 'work', 'Express Entry - Federal Skilled Worker', 'express-entry-fsw',
'Express Entry is Canadas primary system for managing skilled worker applications. The Federal Skilled Worker program is for professionals with foreign work experience.',
'["1+ year continuous skilled work experience", "Canadian Language Benchmark 7+", "Educational Credential Assessment", "Sufficient settlement funds", "Score competitive CRS points"]',
'["Passport", "Language test (IELTS/CELPIP/TEF)", "ECA report", "Work reference letters", "Police certificates", "Medical exam", "Proof of funds"]',
'["Passport", "Photos", "Language test results", "ECA", "Work experience letters", "Police clearances", "Medical exam results", "Bank statements", "Employment records"]',
'6-8 months (after ITA)', 'Permanent', 92.8, 'Permanent visa - PR from day one',
'["IT", "Engineering", "Finance", "Healthcare", "Marketing", "Accounting", "Education"]',
'[]', true, 1,
'Canada Express Entry | Federal Skilled Worker | Siddhivinayak Overseas',
'Canada Express Entry profile creation, CRS score optimization, and ITA application. Federal Skilled Worker, CEC, and FST pathways to PR.'),

((SELECT id FROM countries WHERE code='CAN'), 'study', 'Study Permit', 'study-permit',
'The Canadian study permit allows international students to study at Designated Learning Institutions (DLIs). Includes work rights and a clear PGWP pathway.',
'["Acceptance letter from DLI", "Proof of financial support", "Clean criminal record", "Medical exam (if required)", "Genuine intent to leave Canada after studies (initially)"]',
'["Valid passport", "DLI acceptance letter", "Proof of funds", "Quebec Acceptance Certificate (CAQ) if applicable", "Medical exam", "Statement of purpose"]',
'["Passport", "Application form", "DLI letter", "Financial proof", "SOP", "CAQ (if Quebec)", "Medical exam", "Police certificate", "Biometrics", "Family information"]',
'2-4 months', 'Duration of course + 90 days', 94.1, 'Up to 3 years via PGWP',
'["Computer Science", "Engineering", "Business", "Healthcare", "Data Science", "Environmental Science"]',
'["University of Toronto", "McGill University", "UBC", "University of Waterloo", "University of Alberta", "McMaster University"]',
true, 2,
'Canada Study Permit | Student Visa | Siddhivinayak Overseas',
'Canada study permit for Designated Learning Institutions. PGWP pathway, work while study, and PR through Canadian Experience Class.'),

((SELECT id FROM countries WHERE code='GBR'), 'work', 'Skilled Worker Visa', 'skilled-worker',
'The UK Skilled Worker visa allows you to come to or stay in the UK to do an eligible job with an approved employer. It replaced the Tier 2 (General) visa.',
'["Job offer from licensed sponsor", "Job at appropriate skill level (RQF 3+)", "Minimum salary threshold (generally £26,200 or going rate)", "English proficiency (CEFR B1)", "Certificate of Sponsorship (CoS)"]',
'["Valid passport", "Certificate of Sponsorship", "Job title and annual salary", "Employer name and sponsor license number", "English language proof", "Personal savings proof", "Tuberculosis test (if applicable)"]',
'["Passport", "CoS reference number", "Proof of English knowledge", "Bank statements", "Tuberculosis test results", "Criminal record certificate (if applicable)", "Academic qualifications", "Employment contract"]',
'3-8 weeks', 'Up to 5 years', 89.5, 'After 5 years, eligible for ILR',
'["Healthcare", "IT", "Engineering", "Finance", "Education", "Science", "Creative", "Agriculture"]',
'[]', true, 1,
'UK Skilled Worker Visa | Tier 2 Replacement | Siddhivinayak Overseas',
'UK Skilled Worker visa application. Licensed sponsor jobs, Certificate of Sponsorship, and ILR pathway. NHS and care worker fast-track available.'),

((SELECT id FROM countries WHERE code='GBR'), 'study', 'Student Visa', 'student-visa',
'The UK Student visa allows international students to study at licensed institutions. The Graduate Route provides 2 years of post-study work (3 years for PhD).',
'["Offer from licensed student sponsor", "English proficiency (CEFR B2 for degree level)", "Financial capacity (tuition + living costs)", "ATAS certificate (if required)", "Parental consent (if under 18)"]',
'["Valid passport", "CAS (Confirmation of Acceptance for Studies)", "Financial proof", "English test", "ATAS (if applicable)", "Tuberculosis test (if applicable)", "Parental consent (if under 18)"]',
'["Passport", "CAS", "Financial evidence", "English test", "Academic qualifications", "ATAS certificate", "Tuberculosis test", "Parental consent letter"]',
'3 weeks (priority available)', 'Duration of course + wrap-up', 91.3, '2 years (3 years for PhD) via Graduate Route',
'["Business", "Law", "Engineering", "Medicine", "Computer Science", "Arts", "Social Sciences"]',
'["Oxford", "Cambridge", "Imperial College London", "UCL", "LSE", "University of Edinburgh"]',
true, 2,
'UK Student Visa | Graduate Route | Study in UK | Siddhivinayak Overseas',
'UK student visa and Graduate Route application. Russell Group admissions, CAS guidance, and 2-year post-study work visa support.'),

((SELECT id FROM countries WHERE code='DEU'), 'work', 'Opportunity Card (Chancenkarte)', 'opportunity-card',
'The new Opportunity Card (Chancenkarte) allows skilled workers to come to Germany for up to 1 year to search for employment. No job offer required at application time.',
'["2+ years vocational training or university degree", "Basic German (A1) or English (B2)", "Proof of sufficient funds", "Maximum 6 points on points system (age, experience, language, etc.)"]',
'["Recognized qualification", "Language certificate", "Financial proof", "Health insurance", "CV and work references"]',
'["Passport", "Application form", "Photos", "Qualification documents", "Language certificate", "Financial proof", "Health insurance", "CV", "Work references", "Recognition of qualifications (if available)"]',
'4-12 weeks', '1 year (job search)', 93.1, 'After finding job, switch to work permit or EU Blue Card',
'["Engineering", "IT", "Healthcare", "Skilled Trades", "Mathematics", "Natural Sciences"]',
'[]', true, 1,
'Germany Opportunity Card | Chancenkarte | Siddhivinayak Overseas',
'Germany new Opportunity Card for job seekers. Points-based system, no job offer needed. Pathway to EU Blue Card and permanent residency.'),

((SELECT id FROM countries WHERE code='DEU'), 'work', 'EU Blue Card', 'eu-blue-card',
'The EU Blue Card is for highly qualified non-EU professionals. It offers fast-track to permanent residency and favorable conditions for family reunification.',
'["University degree recognized in Germany", "Job offer with minimum salary threshold (€45,300+ or €41,041 for shortage occupations)", "Job relevant to qualification"]',
'["Valid passport", "University degree", "Employment contract", "Salary proof", "Health insurance", "German residence address (if applicable)"]',
'["Passport", "Application form", "Photos", "Degree with recognition", "Employment contract", "Salary statement", "Health insurance", "Housing proof"]',
'6-12 weeks', '4 years', 95.4, 'After 27 months (with B1 German) or 21 months (with B1 and fast-track)',
'["IT", "Engineering", "Mathematics", "Natural Sciences", "Medicine", "Academic Research"]',
'[]', true, 2,
'Germany EU Blue Card | Highly Qualified Worker | Siddhivinayak Overseas',
'Germany EU Blue Card for highly qualified professionals. Fast-track PR, family reunification, and EU mobility rights.'),

((SELECT id FROM countries WHERE code='DEU'), 'study', 'Student Visa', 'student-visa',
'German public universities charge little to no tuition fees. The student visa allows part-time work (120 full days or 240 half days per year) and an 18-month job search period after graduation.',
'["University admission (conditional or unconditional)", "Proof of financial means (blocked account with €11,208/year)", "Health insurance", "Educational certificates recognized", "German or English proficiency (depending on program)"]',
'["Valid passport", "Admission letter", "Blocked account statement", "Health insurance", "Language certificate", "Academic transcripts", "Motivation letter"]',
'["Passport", "Application form", "Photos", "Admission letter", "Blocked account proof", "Health insurance", "Language certificate", "Academic documents", "CV", "Motivation letter"]',
'6-12 weeks', 'Duration of studies', 96.7, '18 months after graduation',
'["Engineering", "Medicine", "Natural Sciences", "Computer Science", "Business", "Arts", "Social Sciences"]',
'["Technical University of Munich", "RWTH Aachen", "Karlsruhe Institute of Technology", "Humboldt University Berlin", "Free University of Berlin", "Heidelberg University"]',
true, 3,
'Germany Student Visa | Free Education | Study in Germany | Siddhivinayak Overseas',
'Germany student visa with zero tuition fees. Blocked account guidance, university admissions, and 18-month post-study job search visa.'),

((SELECT id FROM countries WHERE code='NZL'), 'work', 'Accredited Employer Work Visa (AEWV)', 'accredited-employer-work-visa',
'The AEWV allows you to work for an accredited New Zealand employer. It replaced several previous work visa categories and streamlines employer sponsorship.',
'["Job offer from accredited employer", "Job pays at least median wage", "Employer has Job Check approval", "Relevant qualifications or experience", "Good health and character"]',
'["Valid passport", "Employment agreement", "Employer accreditation proof", "Job Check approval", "Qualifications/experience evidence", "Health and character documents"]',
'["Passport", "Application form", "Photos", "Employment contract", "Employer documents", "Qualification certificates", "Work references", "Health examination", "Police certificates"]',
'1-2 months', 'Up to 3 years (up to 5 for high-paid roles)', 88.7, 'After 2 years on AEWV, eligible for residence via Work to Residence',
'["Healthcare", "IT", "Construction", "Engineering", "Agriculture", "Education", "Hospitality", "Manufacturing"]',
'[]', true, 1,
'New Zealand AEWV | Accredited Employer Work Visa | Siddhivinayak Overseas',
'New Zealand Accredited Employer Work Visa. Job Check requirements, median wage rules, and Work to Residence pathway.'),

((SELECT id FROM countries WHERE code='NZL'), 'study', 'Student Visa', 'student-visa',
'New Zealand offers quality education with practical focus. The student visa allows part-time work and a generous post-study work visa depending on qualification level.',
'["Offer of place from approved provider", "Paid tuition fees or evidence of funding", "Living cost proof (NZ$20,000/year)", "Genuine intent to study", "Good health and character"]',
'["Valid passport", "Offer letter", "Fee payment/receipt", "Financial documents", "Health insurance", "English test (if required)", "Academic transcripts", "Statement of purpose"]',
'["Passport", "Application form", "Photos", "Offer of place", "Fee receipt", "Financial evidence", "Health insurance", "English test", "Academic records", "SOP", "Health check", "Police certificates"]',
'1-2 months', 'Duration of course', 92.4, '1-3 years depending on qualification level',
'["Business", "Engineering", "IT", "Hospitality", "Health Sciences", "Agriculture", "Creative Arts"]',
'["University of Auckland", "University of Otago", "Victoria University of Wellington", "University of Canterbury", "Massey University", "AUT"]',
true, 2,
'New Zealand Student Visa | Study in NZ | Siddhivinayak Overseas',
'New Zealand student visa application. Approved education providers, work rights, and post-study work visa for 1-3 years.'),

((SELECT id FROM countries WHERE code='USA'), 'work', 'H-1B Specialty Occupation Visa', 'h1b-visa',
'The H-1B visa allows US companies to employ graduate-level workers in specialty occupations requiring theoretical or technical expertise.',
'["Bachelors degree or higher in related field", "Job offer in specialty occupation", "Employer willing to sponsor", "Labor Condition Application (LCA) approved", "Annual cap applies (85,000 per year)"]',
'["Valid passport", "Degree certificates", "Employment offer letter", "LCA approval", "Resume/CV", "Work experience letters", "License (if occupation requires)"]',
'["Passport", "Form DS-160", "Photo", "LCA copy", "Employment letter", "Degree transcripts", "Resume", "Work references", "License documents"]',
'2-6 months (premium processing 15 days)', '3 years, extendable to 6', 82.5, 'Employer can sponsor EB green card',
'["IT", "Engineering", "Finance", "Accounting", "Architecture", "Science", "Medicine", "Education", "Law"]',
'[]', true, 1,
'USA H-1B Visa | Specialty Occupation | Siddhivinayak Overseas',
'USA H-1B visa application and lottery strategy. Specialty occupation requirements, LCA process, and employer sponsorship guidance.'),

((SELECT id FROM countries WHERE code='USA'), 'study', 'F-1 Student Visa', 'f1-student-visa',
'The F-1 visa is for academic students enrolled in US universities, colleges, high schools, or language training programs. Includes OPT work authorization.',
'["Acceptance by SEVP-certified school", "Full-time enrollment intent", "Sufficient financial support", "English proficiency or enrolled in English courses", "Non-immigrant intent (ties to home country)"]',
'["Valid passport", "Form I-20", "SEVIS fee payment", "Financial documents", "Academic transcripts", "English test (TOEFL/IELTS)", "Ties to home country evidence"]',
'["Passport", "Form DS-160", "Photo", "Form I-20", "SEVIS receipt", "Financial proof", "Academic documents", "English test", "SOP", "Bank statements", "Affidavit of support"]',
'2-4 weeks (varies by consulate)', 'Duration of program', 90.2, '12 months OPT (24 months STEM extension)',
'["Computer Science", "Engineering", "Business Administration", "Data Science", "Medicine", "Economics", "Psychology"]',
'["MIT", "Stanford", "Harvard", "Caltech", "University of Chicago", "University of Pennsylvania", "Columbia University"]',
true, 2,
'USA F-1 Student Visa | OPT | Study in USA | Siddhivinayak Overseas',
'USA F-1 student visa and OPT guidance. SEVIS, I-20, university admissions, and 12-36 month Optional Practical Training support.'),

((SELECT id FROM countries WHERE code='ARE'), 'work', 'UAE Employment Visa', 'employment-visa',
'The UAE employment visa is sponsored by your employer. The process is streamlined and typically completed within 2-3 weeks once documents are ready.',
'["Valid job offer from UAE company", "Company holds valid trade license", "Applicant meets position requirements", "Medical fitness test", "Emirates ID registration"]',
'["Valid passport (6+ months)", "Degree attestation (if applicable)", "Medical fitness certificate", "Emirates ID application", "Health insurance", "Labor contract"]',
'["Passport copy", "Photos", "Degree certificates (attested)", "Medical test", "Emirates ID form", "Labor contract", "Company documents", "Insurance policy"]',
'2-4 weeks', '2-3 years (renewable)', 95.2, 'Golden Visa available for exceptional talent',
'["Finance", "IT", "Hospitality", "Construction", "Healthcare", "Aviation", "Oil & Gas", "Real Estate"]',
'[]', true, 1,
'UAE Employment Visa | Work in Dubai/Abu Dhabi | Siddhivinayak Overseas',
'UAE employment visa processing. Dubai and Abu Dhabi job placements, document attestation, and Golden Visa eligibility assessment.'),

((SELECT id FROM countries WHERE code='ARE'), 'work', 'UAE Golden Visa', 'golden-visa',
'The UAE Golden Visa offers 10-year residency for investors, entrepreneurs, specialized talents, researchers, and outstanding students. No sponsor needed.',
'["Investor: property worth AED 2M+", "Entrepreneur: approved startup", "Specialized talent: exceptional skills in culture, art, sports, digital technology, etc.", "Scientist/Researcher: significant contribution", "Outstanding student: top university graduate"]',
'["Passport", "Proof of category eligibility", "Financial documents", "Recommendation letters", "Medical test", "Emirates ID"]',
'["Passport", "Photos", "Eligibility proof", "Financial statements", "Recommendation letter", "Degree/certificates", "Medical fitness", "Emirates ID form"]',
'2-4 weeks', '10 years', 97.8, '10-year renewable residency',
'["Investment", "Technology", "Science", "Culture", "Sports", "Entrepreneurship", "Education"]',
'[]', true, 2,
'UAE Golden Visa | 10-Year Residency | Siddhivinayak Overseas',
'UAE Golden Visa application for investors, entrepreneurs, and specialized talents. 10-year residency, no sponsor required, family inclusion.'),

((SELECT id FROM countries WHERE code='ARE'), 'study', 'Student Residence Visa', 'student-residence-visa',
'The UAE student residence visa is sponsored by the educational institution. Valid for the duration of studies with part-time work options in some cases.',
'["Enrollment in UAE university/college", "Medical fitness test", "Valid passport", "Financial support proof", "Parental consent (if under 18)"]',
'["Passport", "Admission letter", "Medical test", "Photos", "Financial proof", "Parental consent (if minor)", "Insurance"]',
'["Passport", "Photos", "Admission letter", "Medical fitness", "Financial documents", "Parental consent", "Health insurance", "Emirates ID form"]',
'2-4 weeks', '1 year, renewable', 94.5, 'Employment visa after graduation',
'["Business", "Engineering", "IT", "Hospitality", "Aviation", "Design", "Media"]',
'["UAE University", "American University of Dubai", "University of Wollongong Dubai", "Heriot-Watt Dubai", "Manipal Academy Dubai"]',
false, 3,
'UAE Student Visa | Study in Dubai | Siddhivinayak Overseas',
'UAE student residence visa. Dubai university admissions, medical tests, and part-time work options for international students.');

INSERT INTO country_faqs (country_id, question, answer, category, sort_order) VALUES
((SELECT id FROM countries WHERE code='JPN'), 'Do I need to know Japanese for the Specified Skilled Worker visa?', 'Yes, you need to pass the Japanese Language Proficiency Test (JLPT) at N4 level or pass the Japan Foundation Test for Basic Japanese. Some sectors may require N3 level for advancement.', 'language', 1),
((SELECT id FROM countries WHERE code='JPN'), 'Can I bring my family on the SSW visa?', 'Yes, after completing 1 year on the SSW visa and demonstrating stable income, you can apply to bring your spouse and children. Additional financial requirements apply.', 'family', 2),
((SELECT id FROM countries WHERE code='JPN'), 'What is the Certificate of Eligibility (COE)?', 'The COE is a document issued by Japanese Immigration confirming you meet landing conditions. Your employer or school applies for this before you apply for the visa at the embassy.', 'process', 3),
((SELECT id FROM countries WHERE code='JPN'), 'How much can I earn in Japan on a work visa?', 'Salaries vary by sector and region. On average, SSW workers earn ¥180,000-250,000/month. IT and engineering roles can pay ¥300,000-500,000+. Overtime pay is mandatory by law.', 'salary', 4),
((SELECT id FROM countries WHERE code='AUS'), 'What is the points test for Australian PR?', 'The points test awards points for age (max 30 points), English proficiency (max 20 points), skilled employment (max 20 points), educational qualifications (max 20 points), and other factors. You need 65 points minimum to submit an EOI.', 'pr', 1),
((SELECT id FROM countries WHERE code='AUS'), 'Can I work while studying in Australia?', 'Yes, student visa holders can work up to 48 hours per fortnight during term and unlimited hours during breaks. Masters by research and PhD students have unlimited work rights.', 'work_rights', 2),
((SELECT id FROM countries WHERE code='AUS'), 'What is the difference between 189, 190, and 491 visas?', '189 is independent PR (no state sponsor), 190 is state-nominated PR (extra 5 points), and 491 is provisional regional visa (15 extra points, pathway to 191 PR after 3 years in regional area).', 'visa_types', 3);
