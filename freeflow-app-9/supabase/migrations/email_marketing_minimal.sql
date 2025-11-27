-- Minimal Email Marketing Schema
-- Email campaigns, subscribers, automation, and analytics

-- ENUMS
DROP TYPE IF EXISTS email_campaign_type CASCADE;
DROP TYPE IF EXISTS email_campaign_status CASCADE;
DROP TYPE IF EXISTS subscriber_status CASCADE;
DROP TYPE IF EXISTS email_editor_type CASCADE;

CREATE TYPE email_campaign_type AS ENUM ('newsletter', 'promotional', 'transactional', 'drip', 'announcement', 'custom');
CREATE TYPE email_campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled');
CREATE TYPE subscriber_status AS ENUM ('subscribed', 'unsubscribed', 'bounced', 'complained');
CREATE TYPE email_editor_type AS ENUM ('drag-drop', 'html', 'markdown');

-- TABLES
DROP TABLE IF EXISTS email_campaign_links CASCADE;
DROP TABLE IF EXISTS email_campaign_recipients CASCADE;
DROP TABLE IF EXISTS email_templates CASCADE;
DROP TABLE IF EXISTS email_segments CASCADE;
DROP TABLE IF EXISTS email_subscribers CASCADE;
DROP TABLE IF EXISTS email_campaigns CASCADE;

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  preheader TEXT,
  type email_campaign_type NOT NULL DEFAULT 'newsletter',
  status email_campaign_status NOT NULL DEFAULT 'draft',
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  html_content TEXT NOT NULL,
  plain_text_content TEXT,
  template_id UUID,
  editor email_editor_type NOT NULL DEFAULT 'drag-drop',
  segment_id UUID,
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  complained_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status subscriber_status NOT NULL DEFAULT 'subscribed',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  source TEXT DEFAULT 'manual',
  emails_sent INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  ip_address TEXT,
  location JSONB DEFAULT '{}'::JSONB,
  preferences JSONB DEFAULT '{}'::JSONB,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  last_emailed_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  last_clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, email)
);

CREATE TABLE email_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  html_content TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE email_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES email_subscribers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, subscriber_id)
);

CREATE TABLE email_campaign_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  click_count INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_type ON email_campaigns(type);
CREATE INDEX idx_email_subscribers_user_id ON email_subscribers(user_id);
CREATE INDEX idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX idx_email_segments_user_id ON email_segments(user_id);
CREATE INDEX idx_email_templates_user_id ON email_templates(user_id);
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_campaign_recipients_campaign_id ON email_campaign_recipients(campaign_id);
CREATE INDEX idx_email_campaign_recipients_subscriber_id ON email_campaign_recipients(subscriber_id);
CREATE INDEX idx_email_campaign_links_campaign_id ON email_campaign_links(campaign_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_email_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
CREATE TRIGGER trigger_email_subscribers_updated_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
CREATE TRIGGER trigger_email_segments_updated_at BEFORE UPDATE ON email_segments FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();
CREATE TRIGGER trigger_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_email_updated_at();

CREATE OR REPLACE FUNCTION set_campaign_sent_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    NEW.sent_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_campaign_sent_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION set_campaign_sent_at();

CREATE OR REPLACE FUNCTION set_subscriber_unsubscribed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'unsubscribed' AND (OLD.status IS NULL OR OLD.status != 'unsubscribed') THEN
    NEW.unsubscribed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_subscriber_unsubscribed_at BEFORE UPDATE ON email_subscribers FOR EACH ROW EXECUTE FUNCTION set_subscriber_unsubscribed_at();
