-- =====================================================
-- CV PORTFOLIO SYSTEM MIGRATION
-- World-Class A+++ Professional Portfolio Platform
-- =====================================================
-- Features:
-- - 11 comprehensive tables
-- - 5 custom enums
-- - 35+ indexes for performance
-- - 25+ RLS policies for security
-- - 6+ triggers for automation
-- - Public portfolio URLs
-- - Analytics tracking
-- - Full-text search
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CUSTOM ENUMS
-- =====================================================

CREATE TYPE project_status AS ENUM ('draft', 'published', 'featured', 'archived');
CREATE TYPE skill_category AS ENUM ('Technical', 'Soft', 'Languages', 'Tools');
CREATE TYPE employment_type AS ENUM ('full-time', 'part-time', 'contract', 'freelance');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'auto');
CREATE TYPE testimonial_relationship AS ENUM ('colleague', 'manager', 'client', 'mentor');
CREATE TYPE contact_preference AS ENUM ('email', 'phone', 'linkedin');

-- =====================================================
-- PORTFOLIOS TABLE
-- Main portfolio configuration and profile data
-- =====================================================

CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,

  -- Profile Information
  title TEXT NOT NULL,
  subtitle TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,

  -- Contact Information
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  website TEXT,
  timezone TEXT,
  availability availability_status DEFAULT 'available',
  preferred_contact contact_preference DEFAULT 'email',

  -- Social Links
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  behance_url TEXT,
  dribbble_url TEXT,
  medium_url TEXT,
  stackoverflow_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,

  -- Settings
  is_public BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  show_social BOOLEAN DEFAULT true,
  show_analytics BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT true,
  allow_share BOOLEAN DEFAULT true,
  watermark BOOLEAN DEFAULT false,
  theme theme_mode DEFAULT 'auto',
  custom_domain TEXT,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_published_at TIMESTAMPTZ,

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_is_public ON portfolios(is_public);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);

-- =====================================================
-- PORTFOLIO PROJECTS TABLE
-- Showcase projects and work samples
-- =====================================================

CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Project Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  status project_status DEFAULT 'draft',

  -- Links
  live_url TEXT,
  github_url TEXT,
  demo_url TEXT,

  -- Technologies
  technologies TEXT[] DEFAULT '{}',

  -- Project Info
  duration TEXT,
  role TEXT,
  team_size INTEGER,
  highlights TEXT[] DEFAULT '{}',

  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Indexes
CREATE INDEX idx_portfolio_projects_portfolio_id ON portfolio_projects(portfolio_id);
CREATE INDEX idx_portfolio_projects_status ON portfolio_projects(status);
CREATE INDEX idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX idx_portfolio_projects_category ON portfolio_projects(category);
CREATE INDEX idx_portfolio_projects_order ON portfolio_projects(display_order);
CREATE INDEX idx_portfolio_projects_views ON portfolio_projects(views DESC);
CREATE INDEX idx_portfolio_projects_created_at ON portfolio_projects(created_at DESC);

-- Full-text search
CREATE INDEX idx_portfolio_projects_search ON portfolio_projects
  USING gin(to_tsvector('english', title || ' ' || description));

-- =====================================================
-- PORTFOLIO SKILLS TABLE
-- Skills and expertise tracking
-- =====================================================

CREATE TABLE portfolio_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Skill Details
  name TEXT NOT NULL,
  category skill_category NOT NULL,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 1 AND proficiency <= 5),

  -- Experience
  years_of_experience DECIMAL(3,1) DEFAULT 0,
  last_used TEXT,

  -- Social Proof
  endorsed BOOLEAN DEFAULT false,
  endorsement_count INTEGER DEFAULT 0,
  trending BOOLEAN DEFAULT false,

  -- Related Projects
  related_project_ids UUID[] DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_skills_portfolio_id ON portfolio_skills(portfolio_id);
CREATE INDEX idx_portfolio_skills_category ON portfolio_skills(category);
CREATE INDEX idx_portfolio_skills_proficiency ON portfolio_skills(proficiency DESC);
CREATE INDEX idx_portfolio_skills_endorsements ON portfolio_skills(endorsement_count DESC);
CREATE INDEX idx_portfolio_skills_trending ON portfolio_skills(trending);

-- =====================================================
-- PORTFOLIO EXPERIENCE TABLE
-- Work history and professional experience
-- =====================================================

CREATE TABLE portfolio_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Company Information
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  industry TEXT,
  company_size TEXT,

  -- Position Details
  position TEXT NOT NULL,
  employment_type employment_type NOT NULL,
  location TEXT NOT NULL,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  -- Description
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',

  -- Technologies
  technologies TEXT[] DEFAULT '{}',

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_portfolio_experience_portfolio_id ON portfolio_experience(portfolio_id);
CREATE INDEX idx_portfolio_experience_is_current ON portfolio_experience(is_current);
CREATE INDEX idx_portfolio_experience_start_date ON portfolio_experience(start_date DESC);
CREATE INDEX idx_portfolio_experience_order ON portfolio_experience(display_order);

-- =====================================================
-- PORTFOLIO EDUCATION TABLE
-- Educational background and qualifications
-- =====================================================

CREATE TABLE portfolio_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Institution
  institution_name TEXT NOT NULL,
  institution_logo_url TEXT,
  location TEXT NOT NULL,

  -- Degree
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  -- Academic Details
  gpa TEXT,
  honors TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  coursework TEXT[] DEFAULT '{}',
  thesis TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX idx_portfolio_education_portfolio_id ON portfolio_education(portfolio_id);
CREATE INDEX idx_portfolio_education_is_current ON portfolio_education(is_current);
CREATE INDEX idx_portfolio_education_start_date ON portfolio_education(start_date DESC);
CREATE INDEX idx_portfolio_education_order ON portfolio_education(display_order);

-- =====================================================
-- PORTFOLIO CERTIFICATIONS TABLE
-- Professional certifications and awards
-- =====================================================

CREATE TABLE portfolio_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Certification Details
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issuer_logo_url TEXT,

  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,

  -- Credentials
  credential_id TEXT,
  credential_url TEXT,
  verified BOOLEAN DEFAULT false,

  -- Details
  description TEXT,
  skills TEXT[] DEFAULT '{}',

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_certifications_portfolio_id ON portfolio_certifications(portfolio_id);
CREATE INDEX idx_portfolio_certifications_issue_date ON portfolio_certifications(issue_date DESC);
CREATE INDEX idx_portfolio_certifications_verified ON portfolio_certifications(verified);
CREATE INDEX idx_portfolio_certifications_expiry ON portfolio_certifications(expiry_date);

-- =====================================================
-- PORTFOLIO TESTIMONIALS TABLE
-- Client and colleague testimonials
-- =====================================================

CREATE TABLE portfolio_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Author Information
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_company TEXT,
  author_avatar_url TEXT,

  -- Testimonial
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  relationship testimonial_relationship NOT NULL,

  -- Status
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_testimonials_portfolio_id ON portfolio_testimonials(portfolio_id);
CREATE INDEX idx_portfolio_testimonials_featured ON portfolio_testimonials(featured);
CREATE INDEX idx_portfolio_testimonials_approved ON portfolio_testimonials(approved);
CREATE INDEX idx_portfolio_testimonials_rating ON portfolio_testimonials(rating DESC);

-- =====================================================
-- PORTFOLIO ANALYTICS TABLE
-- Track portfolio views and engagement
-- =====================================================

CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- View Tracking
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  project_views INTEGER DEFAULT 0,

  -- Engagement
  contact_clicks INTEGER DEFAULT 0,
  social_clicks INTEGER DEFAULT 0,
  cv_downloads INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Time Tracking
  avg_time_on_page INTEGER DEFAULT 0, -- in seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0,

  -- Top Content
  top_projects TEXT[] DEFAULT '{}',
  top_skills TEXT[] DEFAULT '{}',

  -- Geographic Data
  visitor_countries JSONB DEFAULT '{}',

  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX idx_portfolio_analytics_total_views ON portfolio_analytics(total_views DESC);

-- =====================================================
-- PORTFOLIO VIEW EVENTS TABLE
-- Detailed view tracking
-- =====================================================

CREATE TABLE portfolio_view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Visitor Info
  visitor_id UUID, -- Anonymous visitor tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Location
  country TEXT,
  city TEXT,

  -- View Details
  page_url TEXT,
  session_duration INTEGER, -- in seconds

  -- Metadata
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_view_events_portfolio_id ON portfolio_view_events(portfolio_id);
CREATE INDEX idx_portfolio_view_events_viewed_at ON portfolio_view_events(viewed_at DESC);
CREATE INDEX idx_portfolio_view_events_country ON portfolio_view_events(country);

-- =====================================================
-- PORTFOLIO THEMES TABLE
-- Custom theme configurations
-- =====================================================

CREATE TABLE portfolio_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Theme Details
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,

  -- Colors
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,

  -- Typography
  font_family TEXT,
  heading_font TEXT,
  body_font TEXT,

  -- Layout
  layout_style TEXT, -- 'modern', 'classic', 'creative', 'minimal'
  sidebar_position TEXT, -- 'left', 'right', 'none'

  -- Custom CSS
  custom_css TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_themes_portfolio_id ON portfolio_themes(portfolio_id);
CREATE INDEX idx_portfolio_themes_is_active ON portfolio_themes(is_active);

-- =====================================================
-- PORTFOLIO SHARES TABLE
-- Track portfolio shares
-- =====================================================

CREATE TABLE portfolio_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Share Details
  platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'email', 'link', etc.
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,

  -- Analytics
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_portfolio_shares_portfolio_id ON portfolio_shares(portfolio_id);
CREATE INDEX idx_portfolio_shares_token ON portfolio_shares(share_token);
CREATE INDEX idx_portfolio_shares_platform ON portfolio_shares(platform);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_skills_updated_at
  BEFORE UPDATE ON portfolio_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_experience_updated_at
  BEFORE UPDATE ON portfolio_experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_education_updated_at
  BEFORE UPDATE ON portfolio_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_certifications_updated_at
  BEFORE UPDATE ON portfolio_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment project views
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolio_projects
  SET views = views + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment portfolio views
CREATE OR REPLACE FUNCTION increment_portfolio_views(p_portfolio_id UUID, p_visitor_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Update analytics
  UPDATE portfolio_analytics
  SET
    total_views = total_views + 1,
    last_updated = NOW()
  WHERE portfolio_id = p_portfolio_id;

  -- If no analytics record exists, create one
  IF NOT FOUND THEN
    INSERT INTO portfolio_analytics (portfolio_id, total_views)
    VALUES (p_portfolio_id, 1);
  END IF;

  -- Log view event
  INSERT INTO portfolio_view_events (portfolio_id, visitor_id, viewed_at)
  VALUES (p_portfolio_id, p_visitor_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portfolio statistics
CREATE OR REPLACE FUNCTION get_portfolio_stats(p_portfolio_id UUID)
RETURNS TABLE (
  total_projects BIGINT,
  featured_projects BIGINT,
  total_skills BIGINT,
  total_experience BIGINT,
  total_certifications BIGINT,
  total_views BIGINT,
  avg_project_views NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id AND status = 'published'),
    (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id AND featured = true),
    (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id),
    (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id),
    (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id),
    (SELECT COALESCE(total_views, 0) FROM portfolio_analytics WHERE portfolio_id = p_portfolio_id),
    (SELECT COALESCE(AVG(views), 0) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate completeness score
CREATE OR REPLACE FUNCTION calculate_completeness_score(p_portfolio_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  portfolio_rec RECORD;
BEGIN
  SELECT * INTO portfolio_rec FROM portfolios WHERE id = p_portfolio_id;

  -- Profile (20%)
  IF portfolio_rec.bio IS NOT NULL AND LENGTH(portfolio_rec.bio) >= 100 THEN
    score := score + 10;
  END IF;
  IF portfolio_rec.avatar_url IS NOT NULL THEN
    score := score + 5;
  END IF;
  IF portfolio_rec.cover_image_url IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Experience (25%)
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id AND array_length(achievements, 1) > 0) > 0 THEN
    score := score + 5;
  END IF;

  -- Education (15%)
  IF (SELECT COUNT(*) FROM portfolio_education WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_education WHERE portfolio_id = p_portfolio_id AND array_length(achievements, 1) > 0) > 0 THEN
    score := score + 5;
  END IF;

  -- Skills (15%)
  IF (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id) >= 5 THEN
    score := score + 8;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id) >= 10 THEN
    score := score + 7;
  END IF;

  -- Projects (15%)
  IF (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 8;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 7;
  END IF;

  -- Certifications (10%)
  IF (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 5;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  new_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM portfolios WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PORTFOLIOS POLICIES
-- =====================================================

-- Public can view public portfolios
CREATE POLICY "Public portfolios are viewable by everyone"
  ON portfolios FOR SELECT
  USING (is_public = true);

-- Users can view their own portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own portfolios
CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PORTFOLIO PROJECTS POLICIES
-- =====================================================

-- Public can view published projects of public portfolios
CREATE POLICY "Public projects are viewable"
  ON portfolio_projects FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.is_public = true
    )
  );

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON portfolio_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can manage their own projects
CREATE POLICY "Users can manage own projects"
  ON portfolio_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO SKILLS POLICIES
-- =====================================================

CREATE POLICY "Public skills are viewable"
  ON portfolio_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_skills.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own skills"
  ON portfolio_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_skills.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO EXPERIENCE POLICIES
-- =====================================================

CREATE POLICY "Public experience is viewable"
  ON portfolio_experience FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_experience.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own experience"
  ON portfolio_experience FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_experience.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO EDUCATION POLICIES
-- =====================================================

CREATE POLICY "Public education is viewable"
  ON portfolio_education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_education.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own education"
  ON portfolio_education FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_education.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO CERTIFICATIONS POLICIES
-- =====================================================

CREATE POLICY "Public certifications are viewable"
  ON portfolio_certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_certifications.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own certifications"
  ON portfolio_certifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_certifications.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO TESTIMONIALS POLICIES
-- =====================================================

CREATE POLICY "Approved testimonials are viewable"
  ON portfolio_testimonials FOR SELECT
  USING (
    approved = true AND
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_testimonials.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own testimonials"
  ON portfolio_testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_testimonials.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO ANALYTICS POLICIES
-- =====================================================

CREATE POLICY "Users can view own analytics"
  ON portfolio_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own analytics"
  ON portfolio_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO VIEW EVENTS POLICIES
-- =====================================================

-- Anyone can insert view events
CREATE POLICY "Anyone can log view events"
  ON portfolio_view_events FOR INSERT
  WITH CHECK (true);

-- Only owners can view their analytics
CREATE POLICY "Users can view own view events"
  ON portfolio_view_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_view_events.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO THEMES POLICIES
-- =====================================================

CREATE POLICY "Users can manage own themes"
  ON portfolio_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_themes.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO SHARES POLICIES
-- =====================================================

-- Anyone can view shares by token
CREATE POLICY "Shares are viewable by token"
  ON portfolio_shares FOR SELECT
  USING (true);

-- Users can manage own shares
CREATE POLICY "Users can manage own shares"
  ON portfolio_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE portfolios IS 'Main portfolio configuration and profile data';
COMMENT ON TABLE portfolio_projects IS 'Showcase projects and work samples';
COMMENT ON TABLE portfolio_skills IS 'Skills and expertise tracking';
COMMENT ON TABLE portfolio_experience IS 'Work history and professional experience';
COMMENT ON TABLE portfolio_education IS 'Educational background and qualifications';
COMMENT ON TABLE portfolio_certifications IS 'Professional certifications and awards';
COMMENT ON TABLE portfolio_testimonials IS 'Client and colleague testimonials';
COMMENT ON TABLE portfolio_analytics IS 'Portfolio views and engagement metrics';
COMMENT ON TABLE portfolio_view_events IS 'Detailed view tracking for analytics';
COMMENT ON TABLE portfolio_themes IS 'Custom theme configurations';
COMMENT ON TABLE portfolio_shares IS 'Portfolio share tracking and tokens';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
