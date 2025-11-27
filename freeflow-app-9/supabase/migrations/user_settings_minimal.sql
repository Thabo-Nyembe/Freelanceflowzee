-- Minimal User Settings Schema
-- User profile, notifications, security, and appearance settings

-- ENUMS
DROP TYPE IF EXISTS theme_mode CASCADE;
DROP TYPE IF EXISTS session_timeout CASCADE;
DROP TYPE IF EXISTS date_format CASCADE;

CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'system');
CREATE TYPE session_timeout AS ENUM ('15m', '1h', '4h', '12h', '24h', '7d', '30d', 'never');
CREATE TYPE date_format AS ENUM ('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY/MM/DD');

-- TABLES
DROP TABLE IF EXISTS appearance_settings CASCADE;
DROP TABLE IF EXISTS security_settings CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Personal Information
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  company TEXT,
  position TEXT,
  avatar_url TEXT,

  -- Social Links
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  behance_url TEXT,
  dribbble_url TEXT,

  -- Professional Info
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  portfolio_items TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Privacy
  profile_visibility TEXT NOT NULL DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'connections')),
  show_email BOOLEAN NOT NULL DEFAULT false,
  show_phone BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Channel Preferences
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,

  -- Activity Notifications
  project_updates BOOLEAN NOT NULL DEFAULT true,
  client_messages BOOLEAN NOT NULL DEFAULT true,
  team_mentions BOOLEAN NOT NULL DEFAULT true,
  task_assignments BOOLEAN NOT NULL DEFAULT true,
  deadline_reminders BOOLEAN NOT NULL DEFAULT true,

  -- Financial Notifications
  payment_alerts BOOLEAN NOT NULL DEFAULT true,
  invoice_reminders BOOLEAN NOT NULL DEFAULT true,
  payment_confirmations BOOLEAN NOT NULL DEFAULT true,

  -- Marketing & Updates
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  product_updates BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  monthly_reports BOOLEAN NOT NULL DEFAULT true,

  -- Frequency Settings
  digest_frequency TEXT NOT NULL DEFAULT 'weekly' CHECK (digest_frequency IN ('daily', 'weekly', 'monthly', 'never')),
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Authentication
  two_factor_auth BOOLEAN NOT NULL DEFAULT false,
  two_factor_method TEXT CHECK (two_factor_method IN ('sms', 'email', 'authenticator', 'none')),
  biometric_auth BOOLEAN NOT NULL DEFAULT false,

  -- Session Management
  session_timeout session_timeout NOT NULL DEFAULT '24h',
  remember_me_enabled BOOLEAN NOT NULL DEFAULT true,
  concurrent_sessions_limit INTEGER NOT NULL DEFAULT 5,

  -- Security Alerts
  login_alerts BOOLEAN NOT NULL DEFAULT true,
  login_alerts_email BOOLEAN NOT NULL DEFAULT true,
  suspicious_activity_alerts BOOLEAN NOT NULL DEFAULT true,
  new_device_alerts BOOLEAN NOT NULL DEFAULT true,

  -- Password Policy
  password_required BOOLEAN NOT NULL DEFAULT true,
  password_last_changed TIMESTAMPTZ,
  password_expiry_days INTEGER,

  -- Active Sessions
  active_sessions JSONB DEFAULT '[]'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appearance_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Theme
  theme theme_mode NOT NULL DEFAULT 'system',
  accent_color TEXT NOT NULL DEFAULT '#8B5CF6',
  custom_css TEXT,

  -- Localization
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  date_format date_format NOT NULL DEFAULT 'MM/DD/YYYY',
  time_format TEXT NOT NULL DEFAULT '12h' CHECK (time_format IN ('12h', '24h')),
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Display Preferences
  compact_mode BOOLEAN NOT NULL DEFAULT false,
  animations BOOLEAN NOT NULL DEFAULT true,
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  font_size TEXT NOT NULL DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large', 'xlarge')),

  -- Layout
  sidebar_collapsed BOOLEAN NOT NULL DEFAULT false,
  dashboard_layout JSONB DEFAULT '{}'::JSONB,
  pinned_items TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_visibility ON user_profiles(profile_visibility);
CREATE INDEX idx_user_profiles_company ON user_profiles(company);
CREATE INDEX idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_email_enabled ON notification_settings(email_notifications);
CREATE INDEX idx_security_settings_user_id ON security_settings(user_id);
CREATE INDEX idx_security_settings_2fa ON security_settings(two_factor_auth);
CREATE INDEX idx_security_settings_session_timeout ON security_settings(session_timeout);
CREATE INDEX idx_appearance_settings_user_id ON appearance_settings(user_id);
CREATE INDEX idx_appearance_settings_theme ON appearance_settings(theme);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_user_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();
CREATE TRIGGER trigger_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();
CREATE TRIGGER trigger_security_settings_updated_at BEFORE UPDATE ON security_settings FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();
CREATE TRIGGER trigger_appearance_settings_updated_at BEFORE UPDATE ON appearance_settings FOR EACH ROW EXECUTE FUNCTION update_user_settings_updated_at();

CREATE OR REPLACE FUNCTION create_default_user_settings() RETURNS TRIGGER AS $$
BEGIN
  -- Create default profile
  INSERT INTO user_profiles (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  -- Create default notification settings
  INSERT INTO notification_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  -- Create default security settings
  INSERT INTO security_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  -- Create default appearance settings
  INSERT INTO appearance_settings (user_id) VALUES (NEW.id) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_default_user_settings AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();
