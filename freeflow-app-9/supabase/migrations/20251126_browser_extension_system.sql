-- ========================================
-- BROWSER EXTENSION SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete browser extension management with:
-- - Page captures (screenshot, full-page, selection, video, text)
-- - Quick actions with usage tracking
-- - Extension features management
-- - Keyboard shortcuts
-- - Cross-browser support
-- - Auto-sync capabilities
-- - Analytics and statistics
--
-- Tables: 11
-- Functions: 8
-- Indexes: 47
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE browser_type AS ENUM (
  'chrome',
  'firefox',
  'safari',
  'edge',
  'brave',
  'opera'
);

CREATE TYPE capture_type AS ENUM (
  'screenshot',
  'full-page',
  'selection',
  'video',
  'text'
);

CREATE TYPE action_type AS ENUM (
  'task',
  'link',
  'share',
  'translate',
  'summarize',
  'analyze'
);

CREATE TYPE feature_type AS ENUM (
  'quick-access',
  'page-capture',
  'web-clipper',
  'shortcuts',
  'sync',
  'ai-assistant'
);

CREATE TYPE sync_status AS ENUM (
  'synced',
  'syncing',
  'pending',
  'error',
  'offline'
);

CREATE TYPE shortcut_scope AS ENUM (
  'global',
  'page',
  'selection',
  'context'
);

-- ========================================
-- TABLES
-- ========================================

-- Page Captures
CREATE TABLE page_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  type capture_type NOT NULL,
  thumbnail TEXT,
  file_size BIGINT NOT NULL DEFAULT 0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  sync_status sync_status NOT NULL DEFAULT 'pending',
  storage_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quick Actions
CREATE TABLE quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type action_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  shortcut TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMPTZ,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Extension Features
CREATE TABLE extension_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type feature_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}',
  usage_stats JSONB NOT NULL DEFAULT '{"activations": 0, "errorCount": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Browser Information
CREATE TABLE browser_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  browser browser_type NOT NULL,
  version TEXT NOT NULL,
  is_installed BOOLEAN NOT NULL DEFAULT false,
  last_active TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, browser)
);

-- Keyboard Shortcuts
CREATE TABLE keyboard_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  key TEXT NOT NULL,
  modifiers TEXT[] NOT NULL DEFAULT '{}',
  scope shortcut_scope NOT NULL DEFAULT 'global',
  description TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, action)
);

-- Sync Settings
CREATE TABLE sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_sync BOOLEAN NOT NULL DEFAULT true,
  sync_interval INTEGER NOT NULL DEFAULT 15,
  sync_captures BOOLEAN NOT NULL DEFAULT true,
  sync_shortcuts BOOLEAN NOT NULL DEFAULT true,
  sync_settings BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMPTZ,
  device_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, device_name)
);

-- Capture Analytics
CREATE TABLE capture_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capture_id UUID NOT NULL REFERENCES page_captures(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  edits INTEGER NOT NULL DEFAULT 0,
  exports INTEGER NOT NULL DEFAULT 0,
  avg_view_duration INTEGER NOT NULL DEFAULT 0,
  last_viewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(capture_id)
);

-- Extension Statistics
CREATE TABLE extension_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  captures_created INTEGER NOT NULL DEFAULT 0,
  actions_executed INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0,
  features_activated INTEGER NOT NULL DEFAULT 0,
  sync_operations INTEGER NOT NULL DEFAULT 0,
  browser_usage JSONB NOT NULL DEFAULT '{}',
  capture_types JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Capture Tags
CREATE TABLE capture_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Action History
CREATE TABLE action_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES quick_actions(id) ON DELETE CASCADE,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  context JSONB NOT NULL DEFAULT '{}',
  result TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  execution_time INTEGER, -- milliseconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync History
CREATE TABLE sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  items_synced INTEGER NOT NULL DEFAULT 0,
  items_failed INTEGER NOT NULL DEFAULT 0,
  status sync_status NOT NULL DEFAULT 'syncing',
  error_message TEXT,
  sync_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Page Captures Indexes
CREATE INDEX idx_page_captures_user_id ON page_captures(user_id);
CREATE INDEX idx_page_captures_type ON page_captures(type);
CREATE INDEX idx_page_captures_timestamp ON page_captures(timestamp DESC);
CREATE INDEX idx_page_captures_sync_status ON page_captures(sync_status);
CREATE INDEX idx_page_captures_tags ON page_captures USING GIN(tags);
CREATE INDEX idx_page_captures_title ON page_captures USING GIN(title gin_trgm_ops);
CREATE INDEX idx_page_captures_url ON page_captures USING GIN(url gin_trgm_ops);
CREATE INDEX idx_page_captures_metadata ON page_captures USING GIN(metadata);
CREATE INDEX idx_page_captures_user_timestamp ON page_captures(user_id, timestamp DESC);
CREATE INDEX idx_page_captures_user_type ON page_captures(user_id, type);

-- Quick Actions Indexes
CREATE INDEX idx_quick_actions_user_id ON quick_actions(user_id);
CREATE INDEX idx_quick_actions_type ON quick_actions(type);
CREATE INDEX idx_quick_actions_enabled ON quick_actions(enabled);
CREATE INDEX idx_quick_actions_usage_count ON quick_actions(usage_count DESC);
CREATE INDEX idx_quick_actions_last_used ON quick_actions(last_used DESC);

-- Extension Features Indexes
CREATE INDEX idx_extension_features_user_id ON extension_features(user_id);
CREATE INDEX idx_extension_features_type ON extension_features(type);
CREATE INDEX idx_extension_features_enabled ON extension_features(enabled);
CREATE INDEX idx_extension_features_is_premium ON extension_features(is_premium);
CREATE INDEX idx_extension_features_usage_stats ON extension_features USING GIN(usage_stats);

-- Browser Info Indexes
CREATE INDEX idx_browser_info_user_id ON browser_info(user_id);
CREATE INDEX idx_browser_info_browser ON browser_info(browser);
CREATE INDEX idx_browser_info_is_installed ON browser_info(is_installed);
CREATE INDEX idx_browser_info_last_active ON browser_info(last_active DESC);

-- Keyboard Shortcuts Indexes
CREATE INDEX idx_keyboard_shortcuts_user_id ON keyboard_shortcuts(user_id);
CREATE INDEX idx_keyboard_shortcuts_scope ON keyboard_shortcuts(scope);
CREATE INDEX idx_keyboard_shortcuts_enabled ON keyboard_shortcuts(enabled);

-- Sync Settings Indexes
CREATE INDEX idx_sync_settings_user_id ON sync_settings(user_id);
CREATE INDEX idx_sync_settings_auto_sync ON sync_settings(auto_sync);
CREATE INDEX idx_sync_settings_last_sync ON sync_settings(last_sync DESC);

-- Capture Analytics Indexes
CREATE INDEX idx_capture_analytics_capture_id ON capture_analytics(capture_id);
CREATE INDEX idx_capture_analytics_views ON capture_analytics(views DESC);
CREATE INDEX idx_capture_analytics_last_viewed ON capture_analytics(last_viewed DESC);

-- Extension Statistics Indexes
CREATE INDEX idx_extension_statistics_user_id ON extension_statistics(user_id);
CREATE INDEX idx_extension_statistics_date ON extension_statistics(date DESC);
CREATE INDEX idx_extension_statistics_user_date ON extension_statistics(user_id, date DESC);

-- Capture Tags Indexes
CREATE INDEX idx_capture_tags_user_id ON capture_tags(user_id);
CREATE INDEX idx_capture_tags_usage_count ON capture_tags(usage_count DESC);
CREATE INDEX idx_capture_tags_name ON capture_tags USING GIN(name gin_trgm_ops);

-- Action History Indexes
CREATE INDEX idx_action_history_user_id ON action_history(user_id);
CREATE INDEX idx_action_history_action_id ON action_history(action_id);
CREATE INDEX idx_action_history_executed_at ON action_history(executed_at DESC);
CREATE INDEX idx_action_history_success ON action_history(success);

-- Sync History Indexes
CREATE INDEX idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX idx_sync_history_started_at ON sync_history(started_at DESC);
CREATE INDEX idx_sync_history_status ON sync_history(status);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_captures_updated_at BEFORE UPDATE ON page_captures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_actions_updated_at BEFORE UPDATE ON quick_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_features_updated_at BEFORE UPDATE ON extension_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_browser_info_updated_at BEFORE UPDATE ON browser_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keyboard_shortcuts_updated_at BEFORE UPDATE ON keyboard_shortcuts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_settings_updated_at BEFORE UPDATE ON sync_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capture_analytics_updated_at BEFORE UPDATE ON capture_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_extension_statistics_updated_at BEFORE UPDATE ON extension_statistics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capture_tags_updated_at BEFORE UPDATE ON capture_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create analytics entry for new captures
CREATE OR REPLACE FUNCTION create_capture_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO capture_analytics (capture_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_capture_analytics
  AFTER INSERT ON page_captures
  FOR EACH ROW
  EXECUTE FUNCTION create_capture_analytics();

-- Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
BEGIN
  -- Increment usage for new tags
  FOREACH tag IN ARRAY NEW.tags
  LOOP
    INSERT INTO capture_tags (user_id, name, usage_count)
    VALUES (NEW.user_id, tag, 1)
    ON CONFLICT (user_id, name)
    DO UPDATE SET usage_count = capture_tags.usage_count + 1;
  END LOOP;

  -- Decrement usage for removed tags (on update)
  IF TG_OP = 'UPDATE' THEN
    FOREACH tag IN ARRAY OLD.tags
    LOOP
      IF NOT tag = ANY(NEW.tags) THEN
        UPDATE capture_tags
        SET usage_count = GREATEST(usage_count - 1, 0)
        WHERE user_id = OLD.user_id AND name = tag;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capture_tags_usage
  AFTER INSERT OR UPDATE ON page_captures
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage();

-- Update daily statistics
CREATE OR REPLACE FUNCTION update_daily_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO extension_statistics (
    user_id,
    date,
    captures_created,
    storage_used,
    capture_types
  )
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    NEW.file_size,
    jsonb_build_object(NEW.type::TEXT, 1)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    captures_created = extension_statistics.captures_created + 1,
    storage_used = extension_statistics.storage_used + NEW.file_size,
    capture_types = extension_statistics.capture_types ||
      jsonb_build_object(
        NEW.type::TEXT,
        COALESCE((extension_statistics.capture_types->>NEW.type::TEXT)::INTEGER, 0) + 1
      );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capture_statistics
  AFTER INSERT ON page_captures
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_statistics();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Get extension statistics for user
CREATE OR REPLACE FUNCTION get_extension_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalCaptures', (SELECT COUNT(*) FROM page_captures WHERE user_id = p_user_id),
    'totalActions', (SELECT COALESCE(SUM(usage_count), 0) FROM quick_actions WHERE user_id = p_user_id),
    'storageUsed', (SELECT COALESCE(SUM(file_size), 0) FROM page_captures WHERE user_id = p_user_id),
    'activeFeatures', (SELECT COUNT(*) FROM extension_features WHERE user_id = p_user_id AND enabled = true),
    'totalFeatures', (SELECT COUNT(*) FROM extension_features WHERE user_id = p_user_id),
    'capturesByType', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM page_captures
        WHERE user_id = p_user_id
        GROUP BY type
      ) t
    ),
    'browserUsage', (
      SELECT json_object_agg(browser, usage_count)
      FROM browser_info
      WHERE user_id = p_user_id
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Search captures
CREATE OR REPLACE FUNCTION search_captures(
  p_user_id UUID,
  p_search_term TEXT,
  p_filter_type capture_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF page_captures AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM page_captures
  WHERE user_id = p_user_id
    AND (
      p_search_term IS NULL
      OR title ILIKE '%' || p_search_term || '%'
      OR url ILIKE '%' || p_search_term || '%'
      OR notes ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_filter_type IS NULL OR type = p_filter_type)
  ORDER BY timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get top tags
CREATE OR REPLACE FUNCTION get_top_tags(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(tag TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT name, usage_count::BIGINT
  FROM capture_tags
  WHERE user_id = p_user_id
  ORDER BY usage_count DESC, name
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get weekly activity
CREATE OR REPLACE FUNCTION get_weekly_activity(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(daily_count ORDER BY day)
  INTO result
  FROM (
    SELECT
      generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        INTERVAL '1 day'
      )::DATE as day
  ) dates
  LEFT JOIN (
    SELECT
      timestamp::DATE as capture_date,
      COUNT(*) as daily_count
    FROM page_captures
    WHERE user_id = p_user_id
      AND timestamp >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY timestamp::DATE
  ) captures ON dates.day = captures.capture_date;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- Execute quick action
CREATE OR REPLACE FUNCTION execute_quick_action(
  p_user_id UUID,
  p_action_id UUID,
  p_context JSONB DEFAULT '{}'
)
RETURNS JSON AS $$
DECLARE
  v_action quick_actions;
  v_result JSON;
BEGIN
  -- Get action
  SELECT * INTO v_action
  FROM quick_actions
  WHERE id = p_action_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Action not found');
  END IF;

  IF NOT v_action.enabled THEN
    RETURN json_build_object('success', false, 'error', 'Action is disabled');
  END IF;

  -- Update usage
  UPDATE quick_actions
  SET usage_count = usage_count + 1,
      last_used = NOW()
  WHERE id = p_action_id;

  -- Record history
  INSERT INTO action_history (user_id, action_id, context, success)
  VALUES (p_user_id, p_action_id, p_context, true);

  RETURN json_build_object('success', true, 'action', v_action.name);
END;
$$ LANGUAGE plpgsql;

-- Sync captures
CREATE OR REPLACE FUNCTION sync_captures(
  p_user_id UUID,
  p_capture_ids UUID[] DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_sync_id UUID;
  v_synced_count INTEGER;
BEGIN
  -- Create sync history entry
  INSERT INTO sync_history (user_id, status)
  VALUES (p_user_id, 'syncing')
  RETURNING id INTO v_sync_id;

  -- Update captures
  WITH updated AS (
    UPDATE page_captures
    SET sync_status = 'synced'
    WHERE user_id = p_user_id
      AND (p_capture_ids IS NULL OR id = ANY(p_capture_ids))
      AND sync_status != 'synced'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_synced_count FROM updated;

  -- Update sync history
  UPDATE sync_history
  SET completed_at = NOW(),
      items_synced = v_synced_count,
      status = 'synced'
  WHERE id = v_sync_id;

  -- Update sync settings
  UPDATE sync_settings
  SET last_sync = NOW()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'synced', v_synced_count,
    'syncId', v_sync_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get capture analytics
CREATE OR REPLACE FUNCTION get_capture_analytics_summary(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalViews', COALESCE(SUM(ca.views), 0),
      'totalShares', COALESCE(SUM(ca.shares), 0),
      'totalEdits', COALESCE(SUM(ca.edits), 0),
      'totalExports', COALESCE(SUM(ca.exports), 0),
      'avgViewDuration', COALESCE(AVG(ca.avg_view_duration), 0)
    )
    FROM capture_analytics ca
    JOIN page_captures pc ON ca.capture_id = pc.id
    WHERE pc.user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Record capture view
CREATE OR REPLACE FUNCTION record_capture_view(
  p_capture_id UUID,
  p_duration INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  UPDATE capture_analytics
  SET views = views + 1,
      last_viewed = NOW(),
      avg_view_duration = (avg_view_duration * views + p_duration) / (views + 1)
  WHERE capture_id = p_capture_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE page_captures ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE browser_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyboard_shortcuts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE extension_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE capture_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_history ENABLE ROW LEVEL SECURITY;

-- Page Captures Policies
CREATE POLICY page_captures_select ON page_captures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY page_captures_insert ON page_captures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY page_captures_update ON page_captures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY page_captures_delete ON page_captures FOR DELETE USING (auth.uid() = user_id);

-- Quick Actions Policies
CREATE POLICY quick_actions_select ON quick_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY quick_actions_insert ON quick_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY quick_actions_update ON quick_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY quick_actions_delete ON quick_actions FOR DELETE USING (auth.uid() = user_id);

-- Extension Features Policies
CREATE POLICY extension_features_select ON extension_features FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY extension_features_insert ON extension_features FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY extension_features_update ON extension_features FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY extension_features_delete ON extension_features FOR DELETE USING (auth.uid() = user_id);

-- Browser Info Policies
CREATE POLICY browser_info_select ON browser_info FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY browser_info_insert ON browser_info FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY browser_info_update ON browser_info FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY browser_info_delete ON browser_info FOR DELETE USING (auth.uid() = user_id);

-- Keyboard Shortcuts Policies
CREATE POLICY keyboard_shortcuts_select ON keyboard_shortcuts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY keyboard_shortcuts_insert ON keyboard_shortcuts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY keyboard_shortcuts_update ON keyboard_shortcuts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY keyboard_shortcuts_delete ON keyboard_shortcuts FOR DELETE USING (auth.uid() = user_id);

-- Sync Settings Policies
CREATE POLICY sync_settings_select ON sync_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY sync_settings_insert ON sync_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sync_settings_update ON sync_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY sync_settings_delete ON sync_settings FOR DELETE USING (auth.uid() = user_id);

-- Capture Analytics Policies
CREATE POLICY capture_analytics_select ON capture_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM page_captures WHERE id = capture_analytics.capture_id AND user_id = auth.uid()));
CREATE POLICY capture_analytics_update ON capture_analytics FOR UPDATE
  USING (EXISTS (SELECT 1 FROM page_captures WHERE id = capture_analytics.capture_id AND user_id = auth.uid()));

-- Extension Statistics Policies
CREATE POLICY extension_statistics_select ON extension_statistics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY extension_statistics_insert ON extension_statistics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY extension_statistics_update ON extension_statistics FOR UPDATE USING (auth.uid() = user_id);

-- Capture Tags Policies
CREATE POLICY capture_tags_select ON capture_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY capture_tags_insert ON capture_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY capture_tags_update ON capture_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY capture_tags_delete ON capture_tags FOR DELETE USING (auth.uid() = user_id);

-- Action History Policies
CREATE POLICY action_history_select ON action_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY action_history_insert ON action_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sync History Policies
CREATE POLICY sync_history_select ON sync_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY sync_history_insert ON sync_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY sync_history_update ON sync_history FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE page_captures IS 'Browser extension page captures with multi-format support';
COMMENT ON TABLE quick_actions IS 'Quick action shortcuts with usage tracking';
COMMENT ON TABLE extension_features IS 'Extension feature toggles and settings';
COMMENT ON TABLE browser_info IS 'Browser installation and usage information';
COMMENT ON TABLE keyboard_shortcuts IS 'Customizable keyboard shortcuts';
COMMENT ON TABLE sync_settings IS 'Cross-device synchronization settings';
COMMENT ON TABLE capture_analytics IS 'Analytics for individual captures';
COMMENT ON TABLE extension_statistics IS 'Daily extension usage statistics';
COMMENT ON TABLE capture_tags IS 'User-defined tags for organization';
COMMENT ON TABLE action_history IS 'History of executed quick actions';
COMMENT ON TABLE sync_history IS 'Synchronization operation history';
