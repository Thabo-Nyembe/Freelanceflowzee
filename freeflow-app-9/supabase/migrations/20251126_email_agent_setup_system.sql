-- ============================================================================
-- Email Agent Setup System - Production Database Schema
-- ============================================================================
-- Comprehensive setup wizard management for email agent integrations including
-- email providers, AI, calendar, payments, SMS, and CRM systems
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE setup_step AS ENUM ('welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete');
CREATE TYPE integration_type AS ENUM ('email', 'ai', 'calendar', 'payment', 'sms', 'crm');
CREATE TYPE integration_status AS ENUM ('not_configured', 'configuring', 'testing', 'connected', 'error', 'disconnected');
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'imap', 'resend', 'sendgrid');
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'both', 'google', 'cohere');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple', 'none');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'square', 'none');
CREATE TYPE sms_provider AS ENUM ('twilio', 'vonage', 'messagebird', 'none');
CREATE TYPE crm_provider AS ENUM ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'none');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Setup Progress
CREATE TABLE setup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step setup_step NOT NULL DEFAULT 'welcome',
  completed_steps setup_step[] DEFAULT '{}',
  total_steps INTEGER NOT NULL DEFAULT 9,
  percentage INTEGER NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  required_integrations INTEGER NOT NULL DEFAULT 2,
  configured_integrations INTEGER NOT NULL DEFAULT 0,
  optional_integrations INTEGER NOT NULL DEFAULT 4,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'not_configured',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  icon TEXT NOT NULL,
  description TEXT,
  error TEXT,
  connected_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Integration Config
CREATE TABLE integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  api_endpoint TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test Results
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  latency INTEGER, -- milliseconds
  error TEXT,
  details JSONB DEFAULT '{}',
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Configs
CREATE TABLE email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider email_provider NOT NULL,
  email TEXT,
  api_key TEXT,
  password TEXT, -- encrypted
  host TEXT,
  port INTEGER,
  secure BOOLEAN DEFAULT TRUE,
  auto_reply BOOLEAN DEFAULT FALSE,
  forward_to TEXT,
  signature TEXT,
  max_emails_per_day INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Configs
CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider ai_provider NOT NULL,
  api_key TEXT NOT NULL, -- encrypted
  model TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,
  enable_sentiment_analysis BOOLEAN DEFAULT TRUE,
  enable_auto_response BOOLEAN DEFAULT TRUE,
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'casual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Configs
CREATE TABLE calendar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider calendar_provider NOT NULL,
  credentials JSONB DEFAULT '{}',
  default_duration INTEGER DEFAULT 60, -- minutes
  buffer_time INTEGER DEFAULT 15, -- minutes
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Configs
CREATE TABLE payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider payment_provider NOT NULL,
  api_key TEXT, -- encrypted
  secret_key TEXT, -- encrypted
  webhook_secret TEXT, -- encrypted
  currency TEXT DEFAULT 'USD',
  accepted_methods TEXT[] DEFAULT ARRAY['card'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Configs
CREATE TABLE sms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider sms_provider NOT NULL,
  account_sid TEXT, -- encrypted
  auth_token TEXT, -- encrypted
  phone_number TEXT,
  enable_whatsapp BOOLEAN DEFAULT FALSE,
  default_country_code TEXT DEFAULT '+1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Configs
CREATE TABLE crm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider crm_provider NOT NULL,
  api_key TEXT, -- encrypted
  domain TEXT,
  sync_interval INTEGER DEFAULT 3600, -- seconds
  auto_create_contacts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider Templates (read-only reference data)
CREATE TABLE provider_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER NOT NULL, -- minutes
  requirements TEXT[] DEFAULT '{}',
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'paid', 'freemium')),
  starting_price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(type, provider)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Setup Progress indexes
CREATE INDEX idx_setup_progress_user_id ON setup_progress(user_id);
CREATE INDEX idx_setup_progress_current_step ON setup_progress(current_step);
CREATE INDEX idx_setup_progress_is_complete ON setup_progress(is_complete);

-- Integrations indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_required ON integrations(required);
CREATE INDEX idx_integrations_user_type ON integrations(user_id, type);
CREATE INDEX idx_integrations_user_status ON integrations(user_id, status);

-- Integration Config indexes
CREATE INDEX idx_integration_config_integration_id ON integration_config(integration_id);
CREATE INDEX idx_integration_config_enabled ON integration_config(enabled);

-- Test Results indexes
CREATE INDEX idx_test_results_integration_id ON test_results(integration_id);
CREATE INDEX idx_test_results_success ON test_results(success);
CREATE INDEX idx_test_results_tested_at ON test_results(tested_at DESC);

-- Email Configs indexes
CREATE INDEX idx_email_configs_user_id ON email_configs(user_id);
CREATE INDEX idx_email_configs_provider ON email_configs(provider);

-- AI Configs indexes
CREATE INDEX idx_ai_configs_user_id ON ai_configs(user_id);
CREATE INDEX idx_ai_configs_provider ON ai_configs(provider);

-- Calendar Configs indexes
CREATE INDEX idx_calendar_configs_user_id ON calendar_configs(user_id);
CREATE INDEX idx_calendar_configs_provider ON calendar_configs(provider);

-- Payment Configs indexes
CREATE INDEX idx_payment_configs_user_id ON payment_configs(user_id);
CREATE INDEX idx_payment_configs_provider ON payment_configs(provider);

-- SMS Configs indexes
CREATE INDEX idx_sms_configs_user_id ON sms_configs(user_id);
CREATE INDEX idx_sms_configs_provider ON sms_configs(provider);

-- CRM Configs indexes
CREATE INDEX idx_crm_configs_user_id ON crm_configs(user_id);
CREATE INDEX idx_crm_configs_provider ON crm_configs(provider);

-- Provider Templates indexes
CREATE INDEX idx_provider_templates_type ON provider_templates(type);
CREATE INDEX idx_provider_templates_provider ON provider_templates(provider);
CREATE INDEX idx_provider_templates_recommended ON provider_templates(recommended);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_setup_progress_updated_at
  BEFORE UPDATE ON setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_config_updated_at
  BEFORE UPDATE ON integration_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_configs_updated_at
  BEFORE UPDATE ON email_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configs_updated_at
  BEFORE UPDATE ON ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_configs_updated_at
  BEFORE UPDATE ON calendar_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_configs_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_configs_updated_at
  BEFORE UPDATE ON sms_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_configs_updated_at
  BEFORE UPDATE ON crm_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update setup progress percentage
CREATE OR REPLACE FUNCTION update_setup_percentage()
RETURNS TRIGGER AS $$
DECLARE
  v_required_configured INTEGER;
  v_optional_configured INTEGER;
  v_required_total INTEGER;
  v_optional_total INTEGER;
BEGIN
  -- Count configured integrations
  SELECT
    COUNT(*) FILTER (WHERE required = TRUE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = FALSE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = TRUE),
    COUNT(*) FILTER (WHERE required = FALSE)
  INTO v_required_configured, v_optional_configured, v_required_total, v_optional_total
  FROM integrations
  WHERE user_id = NEW.user_id;

  -- Update setup progress
  UPDATE setup_progress
  SET
    configured_integrations = v_required_configured,
    percentage = CASE
      WHEN v_required_total > 0 THEN
        FLOOR(
          (v_required_configured::DECIMAL / v_required_total * 70) +
          (CASE WHEN v_optional_total > 0 THEN v_optional_configured::DECIMAL / v_optional_total * 30 ELSE 0 END)
        )
      ELSE 0
    END,
    is_complete = (v_required_configured = v_required_total),
    completed_at = CASE
      WHEN (v_required_configured = v_required_total) AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_setup_percentage
  AFTER INSERT OR UPDATE OF status ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_percentage();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get setup progress for user
CREATE OR REPLACE FUNCTION get_setup_progress(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_progress JSON;
BEGIN
  SELECT json_build_object(
    'currentStep', sp.current_step,
    'completedSteps', sp.completed_steps,
    'totalSteps', sp.total_steps,
    'percentage', sp.percentage,
    'integrations', json_build_object(
      'required', sp.required_integrations,
      'configured', sp.configured_integrations,
      'optional', sp.optional_integrations
    ),
    'isComplete', sp.is_complete,
    'startedAt', sp.started_at,
    'completedAt', sp.completed_at
  )
  INTO v_progress
  FROM setup_progress sp
  WHERE sp.user_id = p_user_id;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Get integrations by status
CREATE OR REPLACE FUNCTION get_integrations_by_status(p_user_id UUID, p_status integration_status)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status,
  required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status, i.required
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.status = p_status
  ORDER BY i.required DESC, i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get required integrations
CREATE OR REPLACE FUNCTION get_required_integrations(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.required = TRUE
  ORDER BY i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Check if setup is complete
CREATE OR REPLACE FUNCTION is_setup_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_complete BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM integrations
    WHERE user_id = p_user_id
      AND required = TRUE
      AND status != 'connected'
  )
  INTO v_complete;

  RETURN v_complete;
END;
$$ LANGUAGE plpgsql;

-- Get integration config
CREATE OR REPLACE FUNCTION get_integration_config(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_config JSON;
BEGIN
  SELECT json_build_object(
    'provider', ic.provider,
    'credentials', ic.credentials,
    'settings', ic.settings,
    'webhookUrl', ic.webhook_url,
    'apiEndpoint', ic.api_endpoint,
    'enabled', ic.enabled
  )
  INTO v_config
  FROM integration_config ic
  WHERE ic.integration_id = p_integration_id;

  RETURN v_config;
END;
$$ LANGUAGE plpgsql;

-- Get test results for integration
CREATE OR REPLACE FUNCTION get_latest_test_results(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_results JSON;
BEGIN
  SELECT json_build_object(
    'success', tr.success,
    'latency', tr.latency,
    'error', tr.error,
    'details', tr.details,
    'testedAt', tr.tested_at
  )
  INTO v_results
  FROM test_results tr
  WHERE tr.integration_id = p_integration_id
  ORDER BY tr.tested_at DESC
  LIMIT 1;

  RETURN v_results;
END;
$$ LANGUAGE plpgsql;

-- Get recommended providers for integration type
CREATE OR REPLACE FUNCTION get_recommended_providers(p_type integration_type)
RETURNS TABLE(
  provider TEXT,
  name TEXT,
  icon TEXT,
  color TEXT,
  features TEXT[],
  difficulty TEXT,
  estimated_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.provider,
    pt.name,
    pt.icon,
    pt.color,
    pt.features,
    pt.difficulty,
    pt.estimated_time
  FROM provider_templates pt
  WHERE pt.type = p_type AND pt.recommended = TRUE
  ORDER BY pt.estimated_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Estimate total setup time
CREATE OR REPLACE FUNCTION estimate_setup_time(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_time INTEGER;
BEGIN
  SELECT COALESCE(SUM(pt.estimated_time), 0)
  INTO v_total_time
  FROM integrations i
  JOIN provider_templates pt ON pt.type = i.type AND pt.provider = LOWER(i.provider)
  WHERE i.user_id = p_user_id
    AND i.status != 'connected';

  RETURN v_total_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE setup_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_templates ENABLE ROW LEVEL SECURITY;

-- Setup Progress policies
CREATE POLICY "Users can view their own setup progress"
  ON setup_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup progress"
  ON setup_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress"
  ON setup_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Integration Config policies
CREATE POLICY "Users can view config for their integrations"
  ON integration_config FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create config for their integrations"
  ON integration_config FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update config for their integrations"
  ON integration_config FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

-- Test Results policies
CREATE POLICY "Users can view test results for their integrations"
  ON test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create test results for their integrations"
  ON test_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

-- Config tables policies (same pattern for all)
CREATE POLICY "Users can view their own email config"
  ON email_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email config"
  ON email_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI config"
  ON ai_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI config"
  ON ai_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar config"
  ON calendar_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar config"
  ON calendar_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment config"
  ON payment_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment config"
  ON payment_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS config"
  ON sms_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own SMS config"
  ON sms_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own CRM config"
  ON crm_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CRM config"
  ON crm_configs FOR ALL
  USING (auth.uid() = user_id);

-- Provider Templates policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view provider templates"
  ON provider_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED DATA (Provider Templates)
-- ============================================================================

-- Email Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('email', 'gmail', 'Gmail', 'Mail', 'bg-red-500', true,
   ARRAY['OAuth 2.0', 'High deliverability', 'Free tier', 'Easy setup'],
   'easy', 5, ARRAY['Google Account', 'OAuth consent screen'], 'free'),
  ('email', 'outlook', 'Outlook', 'Mail', 'bg-blue-500', true,
   ARRAY['Microsoft Graph API', 'Enterprise ready', 'Office 365 integration'],
   'easy', 5, ARRAY['Microsoft Account', 'Azure AD app'], 'free'),
  ('email', 'resend', 'Resend', 'Mail', 'bg-purple-500', false,
   ARRAY['Developer-first', 'API-based', 'Analytics', 'High deliverability'],
   'easy', 2, ARRAY['Resend account', 'API key', 'Domain verification'], 'freemium'),
  ('email', 'sendgrid', 'SendGrid', 'Mail', 'bg-cyan-500', false,
   ARRAY['Enterprise scale', 'Advanced analytics', 'Template engine'],
   'medium', 10, ARRAY['SendGrid account', 'API key', 'Sender authentication'], 'freemium');

-- AI Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('ai', 'openai', 'OpenAI', 'Brain', 'bg-green-500', true,
   ARRAY['GPT-4', 'Function calling', 'Vision', 'Most popular'],
   'easy', 2, ARRAY['OpenAI account', 'API key'], 'paid', '$0.03/1K tokens'),
  ('ai', 'anthropic', 'Anthropic', 'Brain', 'bg-orange-500', true,
   ARRAY['Claude 3.5', 'Long context', 'Safer outputs', 'Code generation'],
   'easy', 2, ARRAY['Anthropic account', 'API key'], 'paid', '$0.25/1M tokens'),
  ('ai', 'google', 'Google AI', 'Brain', 'bg-blue-500', false,
   ARRAY['Gemini Pro', 'Multimodal', 'Free tier', 'Google integration'],
   'medium', 5, ARRAY['Google Cloud account', 'API key', 'Project setup'], 'freemium', 'Free tier available');

-- Calendar Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('calendar', 'google', 'Google Calendar', 'Calendar', 'bg-blue-500', true,
   ARRAY['Easy integration', 'Free', 'Most popular', 'Mobile sync'],
   'easy', 5, ARRAY['Google account', 'OAuth setup'], 'free'),
  ('calendar', 'outlook', 'Outlook Calendar', 'Calendar', 'bg-indigo-500', true,
   ARRAY['Office 365', 'Enterprise features', 'Teams integration'],
   'easy', 5, ARRAY['Microsoft account', 'Graph API access'], 'free');

-- Payment Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('payment', 'stripe', 'Stripe', 'CreditCard', 'bg-purple-500', true,
   ARRAY['Most popular', 'Global', 'Low fees', 'Great docs'],
   'medium', 10, ARRAY['Stripe account', 'API keys', 'Webhook setup'], 'paid', '2.9% + $0.30/transaction');

-- SMS Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('sms', 'twilio', 'Twilio', 'MessageSquare', 'bg-red-500', true,
   ARRAY['SMS + WhatsApp', 'Global coverage', 'Reliable', 'Programmable'],
   'medium', 10, ARRAY['Twilio account', 'Phone number', 'API credentials'], 'paid', '$0.0075/SMS');

-- CRM Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('crm', 'hubspot', 'HubSpot', 'Users', 'bg-orange-500', true,
   ARRAY['Free tier', 'Full CRM', 'Marketing tools', 'Easy API'],
   'easy', 5, ARRAY['HubSpot account', 'API key'], 'freemium', 'Free tier available'),
  ('crm', 'salesforce', 'Salesforce', 'Users', 'bg-blue-500', false,
   ARRAY['Enterprise grade', 'Customizable', 'Industry leader'],
   'hard', 20, ARRAY['Salesforce account', 'Connected app', 'OAuth setup'], 'paid', '$25/user/month');
