-- Minimal Advanced Settings Schema
-- Data exports, sync, backups, and account management

-- ENUMS
DROP TYPE IF EXISTS export_type CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS backup_type CASCADE;

CREATE TYPE export_type AS ENUM ('settings', 'user_data', 'gdpr', 'backup', 'custom');
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'expired');
CREATE TYPE sync_status AS ENUM ('synced', 'syncing', 'conflict', 'failed');
CREATE TYPE backup_type AS ENUM ('manual', 'automatic', 'scheduled', 'pre_reset');

-- TABLES
DROP TABLE IF EXISTS user_data_exports CASCADE;
DROP TABLE IF EXISTS settings_backups CASCADE;
DROP TABLE IF EXISTS settings_sync_history CASCADE;
DROP TABLE IF EXISTS account_deletion_requests CASCADE;
DROP TABLE IF EXISTS cache_clear_logs CASCADE;

CREATE TABLE user_data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_type export_type NOT NULL,
  export_status export_status NOT NULL DEFAULT 'pending',

  -- Export Details
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  includes_sections TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ,

  -- Error Handling
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,

  -- GDPR Compliance
  gdpr_compliant BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settings_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_type backup_type NOT NULL,

  -- Backup Content
  profile_data JSONB DEFAULT '{}'::JSONB,
  notification_settings JSONB DEFAULT '{}'::JSONB,
  security_settings JSONB DEFAULT '{}'::JSONB,
  appearance_settings JSONB DEFAULT '{}'::JSONB,
  advanced_settings JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  backup_name TEXT,
  description TEXT,
  file_size INTEGER,

  -- Restoration
  restored_at TIMESTAMPTZ,
  restore_count INTEGER NOT NULL DEFAULT 0,

  -- Flags
  is_automatic BOOLEAN NOT NULL DEFAULT false,
  keep_forever BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE settings_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sync Details
  sync_status sync_status NOT NULL DEFAULT 'syncing',
  synced_sections TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Device Info
  device_id TEXT,
  device_name TEXT,
  device_type TEXT,
  browser TEXT,
  ip_address INET,

  -- Sync Metrics
  sync_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Conflict Resolution
  had_conflicts BOOLEAN NOT NULL DEFAULT false,
  conflicts_resolved INTEGER NOT NULL DEFAULT 0,
  conflict_details JSONB DEFAULT '{}'::JSONB,

  -- Error Handling
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Request Details
  reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Confirmation
  confirmation_token TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,

  -- Grace Period
  grace_period_days INTEGER NOT NULL DEFAULT 7,
  reminder_sent_at TIMESTAMPTZ,

  -- Data Backup
  data_export_id UUID REFERENCES user_data_exports(id) ON DELETE SET NULL,
  backup_created BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cache_clear_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Clear Details
  cleared_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  signed_out BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  device_info JSONB DEFAULT '{}'::JSONB,
  ip_address INET,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_user_data_exports_user_id ON user_data_exports(user_id);
CREATE INDEX idx_user_data_exports_status ON user_data_exports(export_status);
CREATE INDEX idx_user_data_exports_type ON user_data_exports(export_type);
CREATE INDEX idx_user_data_exports_requested_at ON user_data_exports(requested_at DESC);
CREATE INDEX idx_user_data_exports_expires_at ON user_data_exports(expires_at);
CREATE INDEX idx_settings_backups_user_id ON settings_backups(user_id);
CREATE INDEX idx_settings_backups_type ON settings_backups(backup_type);
CREATE INDEX idx_settings_backups_created_at ON settings_backups(created_at DESC);
CREATE INDEX idx_settings_backups_is_automatic ON settings_backups(is_automatic);
CREATE INDEX idx_settings_sync_history_user_id ON settings_sync_history(user_id);
CREATE INDEX idx_settings_sync_history_status ON settings_sync_history(sync_status);
CREATE INDEX idx_settings_sync_history_device_id ON settings_sync_history(device_id);
CREATE INDEX idx_settings_sync_history_started_at ON settings_sync_history(sync_started_at DESC);
CREATE INDEX idx_account_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX idx_account_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX idx_account_deletion_requests_scheduled_for ON account_deletion_requests(scheduled_for);
CREATE INDEX idx_cache_clear_logs_user_id ON cache_clear_logs(user_id);
CREATE INDEX idx_cache_clear_logs_created_at ON cache_clear_logs(created_at DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_advanced_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_data_exports_updated_at BEFORE UPDATE ON user_data_exports FOR EACH ROW EXECUTE FUNCTION update_advanced_settings_updated_at();
CREATE TRIGGER trigger_settings_backups_updated_at BEFORE UPDATE ON settings_backups FOR EACH ROW EXECUTE FUNCTION update_advanced_settings_updated_at();
CREATE TRIGGER trigger_account_deletion_requests_updated_at BEFORE UPDATE ON account_deletion_requests FOR EACH ROW EXECUTE FUNCTION update_advanced_settings_updated_at();

CREATE OR REPLACE FUNCTION set_export_expiry() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.export_status = 'completed' AND NEW.completed_at IS NOT NULL THEN
    NEW.expires_at = NEW.completed_at + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_export_expiry BEFORE INSERT OR UPDATE ON user_data_exports FOR EACH ROW EXECUTE FUNCTION set_export_expiry();

CREATE OR REPLACE FUNCTION calculate_sync_duration() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_status = 'synced' AND NEW.sync_completed_at IS NOT NULL THEN
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.sync_completed_at - NEW.sync_started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_sync_duration BEFORE UPDATE ON settings_sync_history FOR EACH ROW EXECUTE FUNCTION calculate_sync_duration();

CREATE OR REPLACE FUNCTION auto_create_deletion_backup() RETURNS TRIGGER AS $$
DECLARE
  backup_id UUID;
BEGIN
  -- Create automatic backup before account deletion
  INSERT INTO settings_backups (
    user_id,
    backup_type,
    backup_name,
    description,
    is_automatic,
    keep_forever
  )
  VALUES (
    NEW.user_id,
    'automatic',
    'Pre-deletion backup',
    'Automatic backup created before account deletion request',
    true,
    true
  )
  RETURNING id INTO backup_id;

  NEW.backup_created = true;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_deletion_backup BEFORE INSERT ON account_deletion_requests FOR EACH ROW EXECUTE FUNCTION auto_create_deletion_backup();
