-- Minimal Security Settings Schema
-- Enhanced security features: 2FA, audit logs, login tracking, trusted devices

-- ENUMS
DROP TYPE IF EXISTS login_attempt_status CASCADE;
DROP TYPE IF EXISTS security_event_type CASCADE;
DROP TYPE IF EXISTS device_trust_status CASCADE;
DROP TYPE IF EXISTS security_alert_severity CASCADE;

CREATE TYPE login_attempt_status AS ENUM ('success', 'failed', 'blocked', 'suspicious');
CREATE TYPE security_event_type AS ENUM ('login', 'logout', 'password_change', '2fa_enabled', '2fa_disabled', 'password_reset', 'device_trusted', 'device_removed', 'settings_changed', 'suspicious_activity');
CREATE TYPE device_trust_status AS ENUM ('trusted', 'pending', 'blocked', 'expired');
CREATE TYPE security_alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

-- TABLES
DROP TABLE IF EXISTS two_factor_backup_codes CASCADE;
DROP TABLE IF EXISTS login_attempts CASCADE;
DROP TABLE IF EXISTS security_audit_logs CASCADE;
DROP TABLE IF EXISTS trusted_devices CASCADE;
DROP TABLE IF EXISTS password_history CASCADE;
DROP TABLE IF EXISTS security_alerts CASCADE;

CREATE TABLE two_factor_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Code Details
  code_hash TEXT NOT NULL UNIQUE,
  code_prefix TEXT NOT NULL,

  -- Usage
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMPTZ,
  used_from_ip INET,

  -- Metadata
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Attempt Details
  email TEXT,
  status login_attempt_status NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Location & Device
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,

  -- 2FA
  used_2fa BOOLEAN NOT NULL DEFAULT false,
  used_backup_code BOOLEAN NOT NULL DEFAULT false,

  -- Failure Details
  failure_reason TEXT,
  attempts_count INTEGER NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event Details
  event_type security_event_type NOT NULL,
  event_description TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Context
  ip_address INET,
  user_agent TEXT,
  device_id TEXT,

  -- Metadata
  old_value JSONB DEFAULT '{}'::JSONB,
  new_value JSONB DEFAULT '{}'::JSONB,
  additional_data JSONB DEFAULT '{}'::JSONB,

  -- Security
  is_suspicious BOOLEAN NOT NULL DEFAULT false,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Device Details
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,

  -- Trust Status
  trust_status device_trust_status NOT NULL DEFAULT 'pending',
  trusted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Location
  ip_address INET,
  country TEXT,
  city TEXT,

  -- Usage
  last_used_at TIMESTAMPTZ,
  login_count INTEGER NOT NULL DEFAULT 0,

  -- Verification
  verification_token TEXT,
  verified_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

CREATE TABLE password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Password Details
  password_hash TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Context
  changed_from_ip INET,
  changed_via TEXT,

  -- Flags
  was_reset BOOLEAN NOT NULL DEFAULT false,
  was_forced BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Alert Details
  alert_type TEXT NOT NULL,
  severity security_alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  dismissed_at TIMESTAMPTZ,

  -- Context
  related_ip INET,
  related_device_id TEXT,
  related_event_id UUID,

  -- Metadata
  alert_data JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_two_factor_backup_codes_user_id ON two_factor_backup_codes(user_id);
CREATE INDEX idx_two_factor_backup_codes_is_used ON two_factor_backup_codes(is_used);
CREATE INDEX idx_two_factor_backup_codes_code_hash ON two_factor_backup_codes(code_hash);
CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_email ON login_attempts(email);
CREATE INDEX idx_login_attempts_status ON login_attempts(status);
CREATE INDEX idx_login_attempts_attempted_at ON login_attempts(attempted_at DESC);
CREATE INDEX idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX idx_security_audit_logs_user_id ON security_audit_logs(user_id);
CREATE INDEX idx_security_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX idx_security_audit_logs_occurred_at ON security_audit_logs(occurred_at DESC);
CREATE INDEX idx_security_audit_logs_is_suspicious ON security_audit_logs(is_suspicious);
CREATE INDEX idx_trusted_devices_user_id ON trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_device_id ON trusted_devices(device_id);
CREATE INDEX idx_trusted_devices_trust_status ON trusted_devices(trust_status);
CREATE INDEX idx_trusted_devices_last_used_at ON trusted_devices(last_used_at DESC);
CREATE INDEX idx_password_history_user_id ON password_history(user_id);
CREATE INDEX idx_password_history_changed_at ON password_history(changed_at DESC);
CREATE INDEX idx_security_alerts_user_id ON security_alerts(user_id);
CREATE INDEX idx_security_alerts_severity ON security_alerts(severity);
CREATE INDEX idx_security_alerts_is_read ON security_alerts(is_read);
CREATE INDEX idx_security_alerts_created_at ON security_alerts(created_at DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_security_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_trusted_devices_updated_at BEFORE UPDATE ON trusted_devices FOR EACH ROW EXECUTE FUNCTION update_security_settings_updated_at();
CREATE TRIGGER trigger_security_alerts_updated_at BEFORE UPDATE ON security_alerts FOR EACH ROW EXECUTE FUNCTION update_security_settings_updated_at();

CREATE OR REPLACE FUNCTION mark_backup_code_used() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_used = true AND OLD.is_used = false THEN
    NEW.used_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_backup_code_used BEFORE UPDATE ON two_factor_backup_codes FOR EACH ROW EXECUTE FUNCTION mark_backup_code_used();

CREATE OR REPLACE FUNCTION update_device_last_used() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' AND NEW.user_id IS NOT NULL THEN
    UPDATE trusted_devices
    SET
      last_used_at = now(),
      login_count = login_count + 1
    WHERE user_id = NEW.user_id
      AND device_id = COALESCE(NEW.user_agent, 'unknown');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_last_used AFTER INSERT ON login_attempts FOR EACH ROW EXECUTE FUNCTION update_device_last_used();

CREATE OR REPLACE FUNCTION create_security_alert_on_suspicious_login() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'suspicious' OR NEW.status = 'blocked' THEN
    INSERT INTO security_alerts (
      user_id,
      alert_type,
      severity,
      title,
      message,
      related_ip,
      alert_data
    )
    VALUES (
      NEW.user_id,
      'suspicious_login',
      CASE WHEN NEW.status = 'blocked' THEN 'high' ELSE 'medium' END,
      'Suspicious Login Attempt',
      'A suspicious login attempt was detected from ' || COALESCE(NEW.city, 'Unknown Location') || ', ' || COALESCE(NEW.country, 'Unknown Country'),
      NEW.ip_address,
      jsonb_build_object(
        'ip_address', NEW.ip_address,
        'device_type', NEW.device_type,
        'browser', NEW.browser,
        'country', NEW.country,
        'city', NEW.city,
        'attempted_at', NEW.attempted_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_security_alert_on_suspicious_login AFTER INSERT ON login_attempts FOR EACH ROW EXECUTE FUNCTION create_security_alert_on_suspicious_login();

CREATE OR REPLACE FUNCTION log_password_change() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_audit_logs (
    user_id,
    event_type,
    event_description,
    ip_address
  )
  VALUES (
    NEW.user_id,
    'password_change',
    'Password was changed',
    NEW.changed_from_ip
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_password_change AFTER INSERT ON password_history FOR EACH ROW EXECUTE FUNCTION log_password_change();
