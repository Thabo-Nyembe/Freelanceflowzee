-- Minimal Lead Generation Schema
-- Lead capture and conversion optimization system

-- ENUMS
DROP TYPE IF EXISTS lead_gen_source CASCADE;
DROP TYPE IF EXISTS lead_gen_status CASCADE;
DROP TYPE IF EXISTS lead_gen_score CASCADE;
DROP TYPE IF EXISTS form_field_type CASCADE;
DROP TYPE IF EXISTS landing_page_status CASCADE;
DROP TYPE IF EXISTS campaign_status CASCADE;

CREATE TYPE lead_gen_source AS ENUM ('website', 'landing-page', 'social-media', 'email', 'referral', 'paid-ads', 'organic', 'other');
CREATE TYPE lead_gen_status AS ENUM ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost');
CREATE TYPE lead_gen_score AS ENUM ('cold', 'warm', 'hot');
CREATE TYPE form_field_type AS ENUM ('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'date', 'file');
CREATE TYPE landing_page_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed');

-- TABLES
DROP TABLE IF EXISTS lead_gen_form_submissions CASCADE;
DROP TABLE IF EXISTS lead_gen_form_fields CASCADE;
DROP TABLE IF EXISTS lead_gen_forms CASCADE;
DROP TABLE IF EXISTS lead_gen_landing_pages CASCADE;
DROP TABLE IF EXISTS lead_gen_campaigns CASCADE;
DROP TABLE IF EXISTS lead_gen_leads CASCADE;

CREATE TABLE lead_gen_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  source lead_gen_source NOT NULL DEFAULT 'website',
  status lead_gen_status NOT NULL DEFAULT 'new',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  score_label lead_gen_score NOT NULL DEFAULT 'cold',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  page_views INTEGER DEFAULT 0,
  form_submissions INTEGER DEFAULT 0,
  email_opens INTEGER DEFAULT 0,
  email_clicks INTEGER DEFAULT 0,
  time_on_site INTEGER DEFAULT 0,
  device_type TEXT,
  location JSONB DEFAULT '{}'::JSONB,
  last_contacted_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_gen_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'email',
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  roi DECIMAL(10, 2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_gen_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES lead_gen_campaigns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status landing_page_status NOT NULL DEFAULT 'draft',
  template TEXT NOT NULL DEFAULT 'default',
  sections JSONB DEFAULT '[]'::JSONB,
  seo JSONB DEFAULT '{}'::JSONB,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_gen_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landing_page_id UUID REFERENCES lead_gen_landing_pages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::JSONB,
  submissions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_gen_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES lead_gen_forms(id) ON DELETE CASCADE,
  type form_field_type NOT NULL,
  label TEXT NOT NULL,
  placeholder TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  options TEXT[] DEFAULT ARRAY[]::TEXT[],
  validation JSONB DEFAULT '{}'::JSONB,
  field_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_gen_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES lead_gen_forms(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES lead_gen_leads(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}'::JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_lead_gen_leads_user_id ON lead_gen_leads(user_id);
CREATE INDEX idx_lead_gen_leads_email ON lead_gen_leads(email);
CREATE INDEX idx_lead_gen_leads_source ON lead_gen_leads(source);
CREATE INDEX idx_lead_gen_leads_status ON lead_gen_leads(status);
CREATE INDEX idx_lead_gen_leads_score ON lead_gen_leads(score DESC);
CREATE INDEX idx_lead_gen_campaigns_user_id ON lead_gen_campaigns(user_id);
CREATE INDEX idx_lead_gen_campaigns_status ON lead_gen_campaigns(status);
CREATE INDEX idx_lead_gen_landing_pages_user_id ON lead_gen_landing_pages(user_id);
CREATE INDEX idx_lead_gen_landing_pages_slug ON lead_gen_landing_pages(slug);
CREATE INDEX idx_lead_gen_landing_pages_status ON lead_gen_landing_pages(status);
CREATE INDEX idx_lead_gen_forms_user_id ON lead_gen_forms(user_id);
CREATE INDEX idx_lead_gen_form_fields_form_id ON lead_gen_form_fields(form_id);
CREATE INDEX idx_lead_gen_form_submissions_form_id ON lead_gen_form_submissions(form_id);
CREATE INDEX idx_lead_gen_form_submissions_lead_id ON lead_gen_form_submissions(lead_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_lead_gen_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lead_gen_leads_updated_at BEFORE UPDATE ON lead_gen_leads FOR EACH ROW EXECUTE FUNCTION update_lead_gen_updated_at();
CREATE TRIGGER trigger_lead_gen_campaigns_updated_at BEFORE UPDATE ON lead_gen_campaigns FOR EACH ROW EXECUTE FUNCTION update_lead_gen_updated_at();
CREATE TRIGGER trigger_lead_gen_landing_pages_updated_at BEFORE UPDATE ON lead_gen_landing_pages FOR EACH ROW EXECUTE FUNCTION update_lead_gen_updated_at();
CREATE TRIGGER trigger_lead_gen_forms_updated_at BEFORE UPDATE ON lead_gen_forms FOR EACH ROW EXECUTE FUNCTION update_lead_gen_updated_at();

CREATE OR REPLACE FUNCTION set_lead_converted_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'converted' AND (OLD.status IS NULL OR OLD.status != 'converted') THEN
    NEW.converted_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lead_converted_at BEFORE UPDATE ON lead_gen_leads FOR EACH ROW EXECUTE FUNCTION set_lead_converted_at();

CREATE OR REPLACE FUNCTION set_landing_page_published_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_landing_page_published_at BEFORE UPDATE ON lead_gen_landing_pages FOR EACH ROW EXECUTE FUNCTION set_landing_page_published_at();
