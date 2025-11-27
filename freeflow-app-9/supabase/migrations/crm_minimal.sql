-- Minimal CRM Schema
-- Customer Relationship Management system with contacts, leads, deals, activities

-- ENUMS
DROP TYPE IF EXISTS contact_type CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS lead_source CASCADE;
DROP TYPE IF EXISTS deal_stage CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;

CREATE TYPE contact_type AS ENUM ('lead', 'prospect', 'customer', 'partner', 'vendor');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost');
CREATE TYPE lead_source AS ENUM ('website', 'referral', 'social-media', 'email-campaign', 'event', 'cold-outreach', 'other');
CREATE TYPE deal_stage AS ENUM ('discovery', 'qualification', 'proposal', 'negotiation', 'closed-won', 'closed-lost');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'task', 'note', 'deal-update');
CREATE TYPE activity_status AS ENUM ('pending', 'completed', 'cancelled');

-- TABLES
DROP TABLE IF EXISTS crm_notes CASCADE;
DROP TABLE IF EXISTS crm_activities CASCADE;
DROP TABLE IF EXISTS crm_deal_products CASCADE;
DROP TABLE IF EXISTS crm_deals CASCADE;
DROP TABLE IF EXISTS crm_leads CASCADE;
DROP TABLE IF EXISTS crm_contacts CASCADE;

CREATE TABLE crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type contact_type NOT NULL DEFAULT 'lead',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  avatar TEXT,
  lead_status lead_status DEFAULT 'new',
  lead_source lead_source DEFAULT 'other',
  lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  address JSONB DEFAULT '{}'::JSONB,
  social_profiles JSONB DEFAULT '{}'::JSONB,
  last_contacted_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_deals INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  lifetime_value DECIMAL(15, 2) DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL DEFAULT 'other',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  temperature TEXT NOT NULL DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot')),
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_value DECIMAL(15, 2) DEFAULT 0,
  estimated_close_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  priority priority_level NOT NULL DEFAULT 'medium',
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  lost_reason TEXT,
  won_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  tax DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority priority_level NOT NULL DEFAULT 'medium',
  status activity_status NOT NULL DEFAULT 'pending',
  duration INTEGER DEFAULT 0,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_crm_contacts_user_id ON crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_type ON crm_contacts(type);
CREATE INDEX idx_crm_contacts_email ON crm_contacts(email);
CREATE INDEX idx_crm_contacts_lead_status ON crm_contacts(lead_status);
CREATE INDEX idx_crm_contacts_assigned_to ON crm_contacts(assigned_to);
CREATE INDEX idx_crm_leads_contact_id ON crm_leads(contact_id);
CREATE INDEX idx_crm_leads_user_id ON crm_leads(user_id);
CREATE INDEX idx_crm_leads_status ON crm_leads(status);
CREATE INDEX idx_crm_leads_assigned_to ON crm_leads(assigned_to);
CREATE INDEX idx_crm_deals_user_id ON crm_deals(user_id);
CREATE INDEX idx_crm_deals_contact_id ON crm_deals(contact_id);
CREATE INDEX idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX idx_crm_deals_assigned_to ON crm_deals(assigned_to);
CREATE INDEX idx_crm_deal_products_deal_id ON crm_deal_products(deal_id);
CREATE INDEX idx_crm_activities_user_id ON crm_activities(user_id);
CREATE INDEX idx_crm_activities_contact_id ON crm_activities(contact_id);
CREATE INDEX idx_crm_activities_deal_id ON crm_activities(deal_id);
CREATE INDEX idx_crm_activities_assigned_to ON crm_activities(assigned_to);
CREATE INDEX idx_crm_activities_status ON crm_activities(status);
CREATE INDEX idx_crm_notes_user_id ON crm_notes(user_id);
CREATE INDEX idx_crm_notes_contact_id ON crm_notes(contact_id);
CREATE INDEX idx_crm_notes_deal_id ON crm_notes(deal_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_crm_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_crm_contacts_updated_at BEFORE UPDATE ON crm_contacts FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
CREATE TRIGGER trigger_crm_leads_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
CREATE TRIGGER trigger_crm_deals_updated_at BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
CREATE TRIGGER trigger_crm_deal_products_updated_at BEFORE UPDATE ON crm_deal_products FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
CREATE TRIGGER trigger_crm_activities_updated_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();
CREATE TRIGGER trigger_crm_notes_updated_at BEFORE UPDATE ON crm_notes FOR EACH ROW EXECUTE FUNCTION update_crm_updated_at();

CREATE OR REPLACE FUNCTION set_lead_converted_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'won' AND (OLD.status IS NULL OR OLD.status != 'won') THEN
    NEW.converted_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_lead_converted_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION set_lead_converted_at();

CREATE OR REPLACE FUNCTION set_activity_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_activity_completed_at BEFORE UPDATE ON crm_activities FOR EACH ROW EXECUTE FUNCTION set_activity_completed_at();

CREATE OR REPLACE FUNCTION set_deal_close_date() RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.stage = 'closed-won' OR NEW.stage = 'closed-lost') AND (OLD.stage IS NULL OR (OLD.stage != 'closed-won' AND OLD.stage != 'closed-lost')) THEN
    NEW.actual_close_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_deal_close_date BEFORE UPDATE ON crm_deals FOR EACH ROW EXECUTE FUNCTION set_deal_close_date();
