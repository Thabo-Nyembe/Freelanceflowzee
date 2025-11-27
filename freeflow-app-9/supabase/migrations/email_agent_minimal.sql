-- Minimal Email Agent Schema
-- AI-powered email automation and response system

-- ENUMS
DROP TYPE IF EXISTS email_intent CASCADE;
DROP TYPE IF EXISTS email_sentiment CASCADE;
DROP TYPE IF EXISTS email_priority CASCADE;
DROP TYPE IF EXISTS email_status CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS response_type CASCADE;

CREATE TYPE email_intent AS ENUM ('inquiry', 'quotation-request', 'booking', 'complaint', 'support', 'general');
CREATE TYPE email_sentiment AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE email_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE email_status AS ENUM ('pending', 'analyzed', 'responded', 'archived');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE response_type AS ENUM ('auto', 'template', 'manual', 'ai-generated');

-- TABLES
DROP TABLE IF EXISTS email_agent_responses CASCADE;
DROP TABLE IF EXISTS email_agent_approvals CASCADE;
DROP TABLE IF EXISTS email_agent_messages CASCADE;
DROP TABLE IF EXISTS email_agent_config CASCADE;

CREATE TABLE email_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_respond BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  response_tone TEXT NOT NULL DEFAULT 'professional',
  signature TEXT,
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::JSONB,
  email_provider TEXT,
  ai_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status email_status NOT NULL DEFAULT 'pending',
  intent email_intent,
  sentiment email_sentiment,
  priority email_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  summary TEXT,
  requires_quotation BOOLEAN NOT NULL DEFAULT false,
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  analyzed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_agent_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES email_agent_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type response_type NOT NULL DEFAULT 'ai-generated',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_id UUID REFERENCES email_agent_responses(id) ON DELETE CASCADE,
  message_id UUID REFERENCES email_agent_messages(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_email_agent_config_user_id ON email_agent_config(user_id);
CREATE INDEX idx_email_agent_messages_user_id ON email_agent_messages(user_id);
CREATE INDEX idx_email_agent_messages_status ON email_agent_messages(status);
CREATE INDEX idx_email_agent_messages_priority ON email_agent_messages(priority);
CREATE INDEX idx_email_agent_messages_received_at ON email_agent_messages(received_at DESC);
CREATE INDEX idx_email_agent_responses_message_id ON email_agent_responses(message_id);
CREATE INDEX idx_email_agent_responses_user_id ON email_agent_responses(user_id);
CREATE INDEX idx_email_agent_approvals_user_id ON email_agent_approvals(user_id);
CREATE INDEX idx_email_agent_approvals_status ON email_agent_approvals(status);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_email_agent_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_agent_config_updated_at BEFORE UPDATE ON email_agent_config FOR EACH ROW EXECUTE FUNCTION update_email_agent_updated_at();
CREATE TRIGGER trigger_email_agent_messages_updated_at BEFORE UPDATE ON email_agent_messages FOR EACH ROW EXECUTE FUNCTION update_email_agent_updated_at();
CREATE TRIGGER trigger_email_agent_responses_updated_at BEFORE UPDATE ON email_agent_responses FOR EACH ROW EXECUTE FUNCTION update_email_agent_updated_at();
CREATE TRIGGER trigger_email_agent_approvals_updated_at BEFORE UPDATE ON email_agent_approvals FOR EACH ROW EXECUTE FUNCTION update_email_agent_updated_at();

CREATE OR REPLACE FUNCTION set_message_analyzed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'pending' AND NEW.analyzed_at IS NULL THEN
    NEW.analyzed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_message_analyzed_at BEFORE UPDATE ON email_agent_messages FOR EACH ROW EXECUTE FUNCTION set_message_analyzed_at();

CREATE OR REPLACE FUNCTION set_message_responded_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'responded' AND (OLD.status IS NULL OR OLD.status != 'responded') THEN
    NEW.responded_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_message_responded_at BEFORE UPDATE ON email_agent_messages FOR EACH ROW EXECUTE FUNCTION set_message_responded_at();

CREATE OR REPLACE FUNCTION set_approval_approved_at() RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.status = 'approved' OR NEW.status = 'rejected') AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
    NEW.approved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_approval_approved_at BEFORE UPDATE ON email_agent_approvals FOR EACH ROW EXECUTE FUNCTION set_approval_approved_at();
