-- Minimal Notification Settings Schema
-- Advanced notification management: templates, delivery logs, tokens, schedules

-- ENUMS
DROP TYPE IF EXISTS notification_channel CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS delivery_status CASCADE;
DROP TYPE IF EXISTS template_type CASCADE;
DROP TYPE IF EXISTS digest_frequency CASCADE;

CREATE TYPE notification_channel AS ENUM ('email', 'push', 'sms', 'in_app', 'webhook');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced', 'clicked', 'opened');
CREATE TYPE template_type AS ENUM ('system', 'custom', 'transactional', 'marketing');
CREATE TYPE digest_frequency AS ENUM ('realtime', 'hourly', 'daily', 'weekly', 'monthly', 'never');

-- TABLES
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_schedules CASCADE;
DROP TABLE IF EXISTS notification_templates CASCADE;
DROP TABLE IF EXISTS notification_delivery_logs CASCADE;
DROP TABLE IF EXISTS push_notification_tokens CASCADE;
DROP TABLE IF EXISTS notification_unsubscribes CASCADE;

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Settings
  category TEXT NOT NULL,
  channel notification_channel NOT NULL,

  -- Preferences
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  priority notification_priority NOT NULL DEFAULT 'normal',
  digest_frequency digest_frequency NOT NULL DEFAULT 'realtime',

  -- Custom Rules
  conditions JSONB DEFAULT '{}'::JSONB,
  custom_settings JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, channel)
);

CREATE TABLE notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Schedule Details
  schedule_name TEXT NOT NULL,
  description TEXT,

  -- Quiet Hours
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',

  -- Days
  excluded_days INTEGER[] DEFAULT ARRAY[]::INTEGER[],

  -- Digest Settings
  digest_enabled BOOLEAN NOT NULL DEFAULT false,
  digest_frequency digest_frequency NOT NULL DEFAULT 'daily',
  digest_time TIME,

  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Template Details
  template_name TEXT NOT NULL,
  template_type template_type NOT NULL,
  category TEXT NOT NULL,

  -- Content
  subject TEXT,
  body TEXT NOT NULL,
  html_body TEXT,

  -- Variables
  variables JSONB DEFAULT '[]'::JSONB,

  -- Styling
  styles JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  language TEXT DEFAULT 'en',

  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,

  -- Usage
  usage_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_name, category)
);

CREATE TABLE notification_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Notification Details
  category TEXT NOT NULL,
  channel notification_channel NOT NULL,
  priority notification_priority NOT NULL DEFAULT 'normal',

  -- Content
  subject TEXT,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Delivery
  status delivery_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Target
  recipient_email TEXT,
  recipient_phone TEXT,
  device_token TEXT,

  -- Error Handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  -- External IDs
  external_id TEXT,
  provider TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE push_notification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Token Details
  token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'ios', 'android', 'desktop')),

  -- Device Info
  device_id TEXT,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,

  -- Expiry
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

CREATE TABLE notification_unsubscribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Unsubscribe Details
  email TEXT,
  category TEXT NOT NULL,
  channel notification_channel NOT NULL,

  -- Context
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  ip_address INET,

  -- Resubscribe
  resubscribed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_category ON notification_preferences(category);
CREATE INDEX idx_notification_preferences_channel ON notification_preferences(channel);
CREATE INDEX idx_notification_preferences_is_enabled ON notification_preferences(is_enabled);
CREATE INDEX idx_notification_schedules_user_id ON notification_schedules(user_id);
CREATE INDEX idx_notification_schedules_is_active ON notification_schedules(is_active);
CREATE INDEX idx_notification_templates_category ON notification_templates(category);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);
CREATE INDEX idx_notification_delivery_logs_user_id ON notification_delivery_logs(user_id);
CREATE INDEX idx_notification_delivery_logs_category ON notification_delivery_logs(category);
CREATE INDEX idx_notification_delivery_logs_channel ON notification_delivery_logs(channel);
CREATE INDEX idx_notification_delivery_logs_status ON notification_delivery_logs(status);
CREATE INDEX idx_notification_delivery_logs_sent_at ON notification_delivery_logs(sent_at DESC);
CREATE INDEX idx_notification_delivery_logs_created_at ON notification_delivery_logs(created_at DESC);
CREATE INDEX idx_push_notification_tokens_user_id ON push_notification_tokens(user_id);
CREATE INDEX idx_push_notification_tokens_token ON push_notification_tokens(token);
CREATE INDEX idx_push_notification_tokens_is_active ON push_notification_tokens(is_active);
CREATE INDEX idx_notification_unsubscribes_user_id ON notification_unsubscribes(user_id);
CREATE INDEX idx_notification_unsubscribes_email ON notification_unsubscribes(email);
CREATE INDEX idx_notification_unsubscribes_category ON notification_unsubscribes(category);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_notification_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_notification_settings_updated_at();
CREATE TRIGGER trigger_notification_schedules_updated_at BEFORE UPDATE ON notification_schedules FOR EACH ROW EXECUTE FUNCTION update_notification_settings_updated_at();
CREATE TRIGGER trigger_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_notification_settings_updated_at();
CREATE TRIGGER trigger_push_notification_tokens_updated_at BEFORE UPDATE ON push_notification_tokens FOR EACH ROW EXECUTE FUNCTION update_notification_settings_updated_at();

CREATE OR REPLACE FUNCTION increment_template_usage() RETURNS TRIGGER AS $$
BEGIN
  UPDATE notification_templates
  SET usage_count = usage_count + 1
  WHERE template_name = NEW.metadata->>'template_name'
    AND category = NEW.category;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_template_usage AFTER INSERT ON notification_delivery_logs FOR EACH ROW WHEN (NEW.metadata ? 'template_name') EXECUTE FUNCTION increment_template_usage();

CREATE OR REPLACE FUNCTION update_token_last_used() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND NEW.channel = 'push' AND NEW.device_token IS NOT NULL THEN
    UPDATE push_notification_tokens
    SET last_used_at = now()
    WHERE token = NEW.device_token;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_token_last_used AFTER UPDATE OF status ON notification_delivery_logs FOR EACH ROW EXECUTE FUNCTION update_token_last_used();

CREATE OR REPLACE FUNCTION update_delivery_status_timestamps() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND OLD.status != 'sent' THEN
    NEW.sent_at = now();
  ELSIF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = now();
  ELSIF NEW.status = 'opened' AND OLD.status != 'opened' THEN
    NEW.opened_at = now();
  ELSIF NEW.status = 'clicked' AND OLD.status != 'clicked' THEN
    NEW.clicked_at = now();
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    NEW.failed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delivery_status_timestamps BEFORE UPDATE OF status ON notification_delivery_logs FOR EACH ROW EXECUTE FUNCTION update_delivery_status_timestamps();
