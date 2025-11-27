-- Minimal Email Agent Setup Schema
-- Setup wizard for email agent integrations

-- ENUMS
DROP TYPE IF EXISTS setup_step CASCADE;
DROP TYPE IF EXISTS integration_type CASCADE;
DROP TYPE IF EXISTS integration_status CASCADE;
DROP TYPE IF EXISTS email_provider CASCADE;
DROP TYPE IF EXISTS ai_provider CASCADE;
DROP TYPE IF EXISTS calendar_provider CASCADE;
DROP TYPE IF EXISTS payment_provider CASCADE;
DROP TYPE IF EXISTS sms_provider CASCADE;
DROP TYPE IF EXISTS crm_provider CASCADE;

CREATE TYPE setup_step AS ENUM ('welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete');
CREATE TYPE integration_type AS ENUM ('email', 'ai', 'calendar', 'payment', 'sms', 'crm');
CREATE TYPE integration_status AS ENUM ('not_configured', 'configuring', 'testing', 'connected', 'error', 'disconnected');
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'imap', 'resend', 'sendgrid');
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'both', 'google', 'cohere');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple', 'none');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'square', 'none');
CREATE TYPE sms_provider AS ENUM ('twilio', 'vonage', 'messagebird', 'none');
CREATE TYPE crm_provider AS ENUM ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'none');

-- TABLES
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS integration_config CASCADE;
DROP TABLE IF EXISTS crm_configs CASCADE;
DROP TABLE IF EXISTS sms_configs CASCADE;
DROP TABLE IF EXISTS payment_configs CASCADE;
DROP TABLE IF EXISTS calendar_configs CASCADE;
DROP TABLE IF EXISTS ai_configs CASCADE;
DROP TABLE IF EXISTS email_configs CASCADE;
DROP TABLE IF EXISTS provider_templates CASCADE;
DROP TABLE IF EXISTS integrations CASCADE;
DROP TABLE IF EXISTS setup_progress CASCADE;

CREATE TABLE setup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step setup_step NOT NULL DEFAULT 'welcome',
  completed_steps setup_step[] DEFAULT ARRAY[]::setup_step[],
  total_steps INTEGER NOT NULL DEFAULT 9,
  percentage INTEGER NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  required_integrations INTEGER NOT NULL DEFAULT 2,
  configured_integrations INTEGER NOT NULL DEFAULT 0,
  optional_integrations INTEGER NOT NULL DEFAULT 4,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'not_configured',
  required BOOLEAN NOT NULL DEFAULT false,
  icon TEXT NOT NULL,
  description TEXT,
  error TEXT,
  connected_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

CREATE TABLE integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::JSONB,
  settings JSONB NOT NULL DEFAULT '{}'::JSONB,
  webhook_url TEXT,
  api_endpoint TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  latency INTEGER,
  error TEXT,
  details JSONB DEFAULT '{}'::JSONB,
  tested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider email_provider NOT NULL,
  email TEXT,
  api_key TEXT,
  password TEXT,
  host TEXT,
  port INTEGER,
  secure BOOLEAN DEFAULT true,
  auto_reply BOOLEAN DEFAULT false,
  forward_to TEXT,
  signature TEXT,
  max_emails_per_day INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider ai_provider NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,
  enable_sentiment_analysis BOOLEAN DEFAULT true,
  enable_auto_response BOOLEAN DEFAULT true,
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'casual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE calendar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider calendar_provider NOT NULL,
  credentials JSONB DEFAULT '{}'::JSONB,
  default_duration INTEGER DEFAULT 60,
  buffer_time INTEGER DEFAULT 15,
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider payment_provider NOT NULL,
  api_key TEXT,
  secret_key TEXT,
  webhook_secret TEXT,
  currency TEXT DEFAULT 'USD',
  accepted_methods TEXT[] DEFAULT ARRAY['card'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider sms_provider NOT NULL,
  account_sid TEXT,
  auth_token TEXT,
  phone_number TEXT,
  enable_whatsapp BOOLEAN DEFAULT false,
  default_country_code TEXT DEFAULT '+1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE crm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider crm_provider NOT NULL,
  api_key TEXT,
  domain TEXT,
  sync_interval INTEGER DEFAULT 3600,
  auto_create_contacts BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE provider_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT false,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER NOT NULL,
  requirements TEXT[] DEFAULT ARRAY[]::TEXT[],
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'paid', 'freemium')),
  starting_price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(type, provider)
);

-- INDEXES
CREATE INDEX idx_setup_progress_user_id ON setup_progress(user_id);
CREATE INDEX idx_setup_progress_current_step ON setup_progress(current_step);
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integration_config_integration_id ON integration_config(integration_id);
CREATE INDEX idx_test_results_integration_id ON test_results(integration_id);
CREATE INDEX idx_test_results_tested_at ON test_results(tested_at DESC);
CREATE INDEX idx_email_configs_user_id ON email_configs(user_id);
CREATE INDEX idx_ai_configs_user_id ON ai_configs(user_id);
CREATE INDEX idx_calendar_configs_user_id ON calendar_configs(user_id);
CREATE INDEX idx_payment_configs_user_id ON payment_configs(user_id);
CREATE INDEX idx_sms_configs_user_id ON sms_configs(user_id);
CREATE INDEX idx_crm_configs_user_id ON crm_configs(user_id);
CREATE INDEX idx_provider_templates_type ON provider_templates(type);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_email_agent_setup_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_setup_progress_updated_at BEFORE UPDATE ON setup_progress FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_integration_config_updated_at BEFORE UPDATE ON integration_config FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_email_configs_updated_at BEFORE UPDATE ON email_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_ai_configs_updated_at BEFORE UPDATE ON ai_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_calendar_configs_updated_at BEFORE UPDATE ON calendar_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_payment_configs_updated_at BEFORE UPDATE ON payment_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_sms_configs_updated_at BEFORE UPDATE ON sms_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();
CREATE TRIGGER trigger_crm_configs_updated_at BEFORE UPDATE ON crm_configs FOR EACH ROW EXECUTE FUNCTION update_email_agent_setup_updated_at();

CREATE OR REPLACE FUNCTION set_integration_connected_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'connected' AND (OLD.status IS NULL OR OLD.status != 'connected') THEN
    NEW.connected_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_integration_connected_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION set_integration_connected_at();

CREATE OR REPLACE FUNCTION set_setup_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_complete = true AND (OLD.is_complete IS NULL OR OLD.is_complete = false) THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_setup_completed_at BEFORE UPDATE ON setup_progress FOR EACH ROW EXECUTE FUNCTION set_setup_completed_at();
