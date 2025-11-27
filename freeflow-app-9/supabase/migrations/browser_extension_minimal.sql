-- Minimal Browser Extension Schema
-- Extension installations, page captures, quick actions, sync tracking

-- ENUMS
DROP TYPE IF EXISTS browser_type CASCADE;
DROP TYPE IF EXISTS capture_type CASCADE;
DROP TYPE IF EXISTS action_type CASCADE;
DROP TYPE IF EXISTS sync_status CASCADE;
DROP TYPE IF EXISTS extension_status CASCADE;

CREATE TYPE browser_type AS ENUM ('chrome', 'firefox', 'safari', 'edge', 'brave', 'opera');
CREATE TYPE capture_type AS ENUM ('screenshot', 'full_page', 'selection', 'video', 'text', 'article', 'pdf');
CREATE TYPE action_type AS ENUM ('task', 'link', 'share', 'translate', 'summarize', 'analyze', 'bookmark', 'note');
CREATE TYPE sync_status AS ENUM ('pending', 'syncing', 'synced', 'failed', 'conflict');
CREATE TYPE extension_status AS ENUM ('active', 'inactive', 'needs_update', 'error');

-- TABLES
DROP TABLE IF EXISTS browser_extension_installations CASCADE;
DROP TABLE IF EXISTS extension_page_captures CASCADE;
DROP TABLE IF EXISTS extension_quick_actions CASCADE;
DROP TABLE IF EXISTS extension_sync_queue CASCADE;
DROP TABLE IF EXISTS extension_usage_analytics CASCADE;

CREATE TABLE browser_extension_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Browser Details
  browser browser_type NOT NULL,
  browser_version TEXT NOT NULL,
  extension_version TEXT NOT NULL,

  -- Installation
  status extension_status NOT NULL DEFAULT 'active',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,

  -- Device Info
  device_id TEXT,
  os TEXT,
  os_version TEXT,

  -- Settings
  settings JSONB DEFAULT '{}'::JSONB,
  enabled_features TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Usage
  total_captures INTEGER NOT NULL DEFAULT 0,
  total_actions INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0, -- in bytes

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, browser, device_id)
);

CREATE TABLE extension_page_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES browser_extension_installations(id) ON DELETE SET NULL,

  -- Capture Details
  capture_type capture_type NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,

  -- Content
  thumbnail_url TEXT,
  content_url TEXT,
  content_text TEXT,

  -- Metadata
  file_size BIGINT NOT NULL DEFAULT 0,
  viewport_width INTEGER,
  viewport_height INTEGER,
  scroll_position INTEGER,

  -- Tags & Notes
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,

  -- Browser Context
  browser browser_type NOT NULL,
  page_title TEXT,
  page_meta JSONB DEFAULT '{}'::JSONB,

  -- Sync
  sync_status sync_status NOT NULL DEFAULT 'pending',
  synced_at TIMESTAMPTZ,

  -- Flags
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE extension_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES browser_extension_installations(id) ON DELETE SET NULL,

  -- Action Details
  action_type action_type NOT NULL,
  action_name TEXT NOT NULL,
  description TEXT,

  -- Configuration
  shortcut_key TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Execution
  target_url TEXT,
  action_data JSONB DEFAULT '{}'::JSONB,
  result_data JSONB DEFAULT '{}'::JSONB,

  -- Usage
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  average_duration_ms INTEGER,

  -- Status
  last_status TEXT, -- 'success', 'failed', 'cancelled'
  last_error TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE extension_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES browser_extension_installations(id) ON DELETE CASCADE,

  -- Sync Details
  sync_type TEXT NOT NULL, -- 'capture', 'action', 'setting', 'bookmark'
  resource_id UUID,
  resource_type TEXT,

  -- Data
  sync_data JSONB NOT NULL,
  sync_direction TEXT NOT NULL, -- 'up', 'down', 'bidirectional'

  -- Status
  sync_status sync_status NOT NULL DEFAULT 'pending',
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),

  -- Execution
  attempted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,

  -- Retry
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  -- Error Handling
  error_message TEXT,
  error_code TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE extension_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES browser_extension_installations(id) ON DELETE CASCADE,

  -- Time Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Capture Analytics
  total_captures INTEGER NOT NULL DEFAULT 0,
  captures_by_type JSONB DEFAULT '{}'::JSONB,

  -- Action Analytics
  total_actions INTEGER NOT NULL DEFAULT 0,
  actions_by_type JSONB DEFAULT '{}'::JSONB,

  -- Usage Patterns
  most_active_hour INTEGER,
  most_active_day TEXT,
  average_session_duration_minutes INTEGER,

  -- Performance
  average_capture_time_ms INTEGER,
  average_sync_time_ms INTEGER,

  -- Features
  features_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  most_used_feature TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_browser_extension_installations_user_id ON browser_extension_installations(user_id);
CREATE INDEX idx_browser_extension_installations_browser ON browser_extension_installations(browser);
CREATE INDEX idx_browser_extension_installations_status ON browser_extension_installations(status);
CREATE INDEX idx_browser_extension_installations_last_active_at ON browser_extension_installations(last_active_at DESC);
CREATE INDEX idx_extension_page_captures_user_id ON extension_page_captures(user_id);
CREATE INDEX idx_extension_page_captures_installation_id ON extension_page_captures(installation_id);
CREATE INDEX idx_extension_page_captures_capture_type ON extension_page_captures(capture_type);
CREATE INDEX idx_extension_page_captures_sync_status ON extension_page_captures(sync_status);
CREATE INDEX idx_extension_page_captures_is_favorite ON extension_page_captures(is_favorite);
CREATE INDEX idx_extension_page_captures_created_at ON extension_page_captures(created_at DESC);
CREATE INDEX idx_extension_quick_actions_user_id ON extension_quick_actions(user_id);
CREATE INDEX idx_extension_quick_actions_installation_id ON extension_quick_actions(installation_id);
CREATE INDEX idx_extension_quick_actions_action_type ON extension_quick_actions(action_type);
CREATE INDEX idx_extension_quick_actions_is_enabled ON extension_quick_actions(is_enabled);
CREATE INDEX idx_extension_quick_actions_usage_count ON extension_quick_actions(usage_count DESC);
CREATE INDEX idx_extension_sync_queue_user_id ON extension_sync_queue(user_id);
CREATE INDEX idx_extension_sync_queue_installation_id ON extension_sync_queue(installation_id);
CREATE INDEX idx_extension_sync_queue_sync_status ON extension_sync_queue(sync_status);
CREATE INDEX idx_extension_sync_queue_priority ON extension_sync_queue(priority DESC);
CREATE INDEX idx_extension_usage_analytics_user_id ON extension_usage_analytics(user_id);
CREATE INDEX idx_extension_usage_analytics_period_start ON extension_usage_analytics(period_start DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_browser_extension_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_browser_extension_installations_updated_at BEFORE UPDATE ON browser_extension_installations FOR EACH ROW EXECUTE FUNCTION update_browser_extension_updated_at();
CREATE TRIGGER trigger_extension_page_captures_updated_at BEFORE UPDATE ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION update_browser_extension_updated_at();
CREATE TRIGGER trigger_extension_quick_actions_updated_at BEFORE UPDATE ON extension_quick_actions FOR EACH ROW EXECUTE FUNCTION update_browser_extension_updated_at();
CREATE TRIGGER trigger_extension_sync_queue_updated_at BEFORE UPDATE ON extension_sync_queue FOR EACH ROW EXECUTE FUNCTION update_browser_extension_updated_at();

CREATE OR REPLACE FUNCTION update_installation_stats() RETURNS TRIGGER AS $$
BEGIN
  -- Update total_captures count
  IF TG_TABLE_NAME = 'extension_page_captures' AND TG_OP = 'INSERT' THEN
    UPDATE browser_extension_installations
    SET total_captures = total_captures + 1,
        storage_used = storage_used + NEW.file_size
    WHERE id = NEW.installation_id;
  ELSIF TG_TABLE_NAME = 'extension_page_captures' AND TG_OP = 'DELETE' THEN
    UPDATE browser_extension_installations
    SET total_captures = GREATEST(0, total_captures - 1),
        storage_used = GREATEST(0, storage_used - OLD.file_size)
    WHERE id = OLD.installation_id;
  END IF;

  -- Update total_actions count
  IF TG_TABLE_NAME = 'extension_quick_actions' AND TG_OP = 'INSERT' THEN
    UPDATE browser_extension_installations
    SET total_actions = total_actions + 1
    WHERE id = NEW.installation_id;
  ELSIF TG_TABLE_NAME = 'extension_quick_actions' AND TG_OP = 'DELETE' THEN
    UPDATE browser_extension_installations
    SET total_actions = GREATEST(0, total_actions - 1)
    WHERE id = OLD.installation_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installation_stats_capture_insert AFTER INSERT ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION update_installation_stats();
CREATE TRIGGER trigger_update_installation_stats_capture_delete AFTER DELETE ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION update_installation_stats();
CREATE TRIGGER trigger_update_installation_stats_action_insert AFTER INSERT ON extension_quick_actions FOR EACH ROW EXECUTE FUNCTION update_installation_stats();
CREATE TRIGGER trigger_update_installation_stats_action_delete AFTER DELETE ON extension_quick_actions FOR EACH ROW EXECUTE FUNCTION update_installation_stats();

CREATE OR REPLACE FUNCTION update_action_usage() RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count = NEW.usage_count + 1;
  NEW.last_used_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_action_usage BEFORE UPDATE OF usage_count ON extension_quick_actions FOR EACH ROW EXECUTE FUNCTION update_action_usage();

CREATE OR REPLACE FUNCTION mark_capture_synced() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_status = 'synced' AND OLD.sync_status != 'synced' THEN
    NEW.synced_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_capture_synced BEFORE UPDATE OF sync_status ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION mark_capture_synced();

CREATE OR REPLACE FUNCTION update_sync_timestamps() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_status = 'syncing' AND OLD.sync_status != 'syncing' THEN
    NEW.attempted_at = now();
  ELSIF NEW.sync_status = 'synced' AND OLD.sync_status != 'synced' THEN
    NEW.completed_at = now();
  ELSIF NEW.sync_status = 'failed' AND OLD.sync_status != 'failed' THEN
    NEW.failed_at = now();
    NEW.retry_count = NEW.retry_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sync_timestamps BEFORE UPDATE OF sync_status ON extension_sync_queue FOR EACH ROW EXECUTE FUNCTION update_sync_timestamps();

CREATE OR REPLACE FUNCTION update_installation_last_active() RETURNS TRIGGER AS $$
BEGIN
  UPDATE browser_extension_installations
  SET last_active_at = now()
  WHERE id = NEW.installation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installation_last_active_capture AFTER INSERT ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION update_installation_last_active();
CREATE TRIGGER trigger_update_installation_last_active_action AFTER INSERT ON extension_quick_actions FOR EACH ROW EXECUTE FUNCTION update_installation_last_active();

CREATE OR REPLACE FUNCTION update_installation_last_sync() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sync_status = 'synced' THEN
    UPDATE browser_extension_installations
    SET last_sync_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_installation_last_sync AFTER UPDATE OF sync_status ON extension_page_captures FOR EACH ROW EXECUTE FUNCTION update_installation_last_sync();
