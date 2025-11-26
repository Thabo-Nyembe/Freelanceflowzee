-- =====================================================
-- INTEGRATIONS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive integration management with OAuth, API keys,
-- webhooks, third-party services, and sync monitoring
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE integration_category AS ENUM (
  'payment',
  'communication',
  'productivity',
  'analytics',
  'storage',
  'marketing',
  'crm',
  'development'
);

CREATE TYPE integration_status AS ENUM (
  'available',
  'connected',
  'disconnected',
  'error'
);

CREATE TYPE auth_type AS ENUM (
  'oauth',
  'api-key',
  'basic',
  'webhook'
);

CREATE TYPE setup_difficulty AS ENUM (
  'easy',
  'medium',
  'hard'
);

CREATE TYPE sync_frequency AS ENUM (
  'realtime',
  '5min',
  '15min',
  '1hour',
  '6hour',
  '24hour'
);

CREATE TYPE sync_direction AS ENUM (
  'inbound',
  'outbound',
  'bidirectional'
);

CREATE TYPE webhook_status AS ENUM (
  'active',
  'inactive',
  'failed'
);

CREATE TYPE sync_status AS ENUM (
  'running',
  'completed',
  'failed'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category integration_category NOT NULL,
  status integration_status NOT NULL DEFAULT 'available',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  auth_type auth_type NOT NULL,
  connected_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  total_syncs INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  data_transferred BIGINT NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  setup_difficulty setup_difficulty NOT NULL DEFAULT 'medium',
  documentation TEXT,
  webhook_url TEXT,
  api_endpoint TEXT,
  version TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integration Templates
CREATE TABLE integration_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category integration_category NOT NULL,
  integration_ids UUID[] DEFAULT '{}',
  config JSONB DEFAULT '{}'::jsonb,
  setup_steps TEXT[] DEFAULT '{}',
  estimated_time INTEGER NOT NULL DEFAULT 30,
  difficulty setup_difficulty NOT NULL DEFAULT 'medium',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status webhook_status NOT NULL DEFAULT 'active',
  response JSONB,
  response_time INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync Logs
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status sync_status NOT NULL DEFAULT 'running',
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  data_size BIGINT NOT NULL DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Integration Stats (aggregated statistics)
CREATE TABLE integration_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_integrations INTEGER NOT NULL DEFAULT 0,
  connected_integrations INTEGER NOT NULL DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  total_syncs INTEGER NOT NULL DEFAULT 0,
  total_data_transferred BIGINT NOT NULL DEFAULT 0,
  average_success_rate DECIMAL(5, 2) DEFAULT 0,
  most_used_integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  recent_errors INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- API Keys (secure storage)
CREATE TABLE integration_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  key_type TEXT NOT NULL DEFAULT 'api_key',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth Tokens (secure storage)
CREATE TABLE integration_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Integrations Indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_category ON integrations(category);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_auth_type ON integrations(auth_type);
CREATE INDEX idx_integrations_is_premium ON integrations(is_premium);
CREATE INDEX idx_integrations_is_popular ON integrations(is_popular);
CREATE INDEX idx_integrations_setup_difficulty ON integrations(setup_difficulty);
CREATE INDEX idx_integrations_total_syncs ON integrations(total_syncs DESC);
CREATE INDEX idx_integrations_success_rate ON integrations(success_rate DESC);
CREATE INDEX idx_integrations_data_transferred ON integrations(data_transferred DESC);
CREATE INDEX idx_integrations_connected_at ON integrations(connected_at DESC);
CREATE INDEX idx_integrations_last_sync ON integrations(last_sync DESC);
CREATE INDEX idx_integrations_features ON integrations USING GIN(features);
CREATE INDEX idx_integrations_name_search ON integrations USING GIN(to_tsvector('english', name));
CREATE INDEX idx_integrations_description_search ON integrations USING GIN(to_tsvector('english', description));
CREATE INDEX idx_integrations_config ON integrations USING GIN(config);
CREATE INDEX idx_integrations_created_at ON integrations(created_at DESC);

-- Integration Templates Indexes
CREATE INDEX idx_integration_templates_category ON integration_templates(category);
CREATE INDEX idx_integration_templates_difficulty ON integration_templates(difficulty);
CREATE INDEX idx_integration_templates_is_popular ON integration_templates(is_popular);
CREATE INDEX idx_integration_templates_usage_count ON integration_templates(usage_count DESC);
CREATE INDEX idx_integration_templates_name_search ON integration_templates USING GIN(to_tsvector('english', name));
CREATE INDEX idx_integration_templates_created_at ON integration_templates(created_at DESC);

-- Webhook Events Indexes
CREATE INDEX idx_webhook_events_integration_id ON webhook_events(integration_id);
CREATE INDEX idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_retry_count ON webhook_events(retry_count);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at DESC);
CREATE INDEX idx_webhook_events_payload ON webhook_events USING GIN(payload);

-- Sync Logs Indexes
CREATE INDEX idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX idx_sync_logs_status ON sync_logs(status);
CREATE INDEX idx_sync_logs_started_at ON sync_logs(started_at DESC);
CREATE INDEX idx_sync_logs_completed_at ON sync_logs(completed_at DESC);
CREATE INDEX idx_sync_logs_records_processed ON sync_logs(records_processed DESC);
CREATE INDEX idx_sync_logs_data_size ON sync_logs(data_size DESC);

-- Integration Stats Indexes
CREATE INDEX idx_integration_stats_user_id ON integration_stats(user_id);
CREATE INDEX idx_integration_stats_date ON integration_stats(date DESC);
CREATE INDEX idx_integration_stats_total_integrations ON integration_stats(total_integrations DESC);
CREATE INDEX idx_integration_stats_connected_integrations ON integration_stats(connected_integrations DESC);
CREATE INDEX idx_integration_stats_most_used_integration_id ON integration_stats(most_used_integration_id);
CREATE INDEX idx_integration_stats_created_at ON integration_stats(created_at DESC);

-- API Keys Indexes
CREATE INDEX idx_integration_api_keys_integration_id ON integration_api_keys(integration_id);
CREATE INDEX idx_integration_api_keys_user_id ON integration_api_keys(user_id);
CREATE INDEX idx_integration_api_keys_is_active ON integration_api_keys(is_active);
CREATE INDEX idx_integration_api_keys_expires_at ON integration_api_keys(expires_at);
CREATE INDEX idx_integration_api_keys_created_at ON integration_api_keys(created_at DESC);

-- OAuth Tokens Indexes
CREATE INDEX idx_integration_oauth_tokens_integration_id ON integration_oauth_tokens(integration_id);
CREATE INDEX idx_integration_oauth_tokens_user_id ON integration_oauth_tokens(user_id);
CREATE INDEX idx_integration_oauth_tokens_expires_at ON integration_oauth_tokens(expires_at);
CREATE INDEX idx_integration_oauth_tokens_created_at ON integration_oauth_tokens(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_templates_updated_at
  BEFORE UPDATE ON integration_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_stats_updated_at
  BEFORE UPDATE ON integration_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_api_keys_updated_at
  BEFORE UPDATE ON integration_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_oauth_tokens_updated_at
  BEFORE UPDATE ON integration_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track sync completion
CREATE OR REPLACE FUNCTION track_sync_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'running' THEN
    NEW.completed_at = NOW();

    UPDATE integrations
    SET
      last_sync = NOW(),
      total_syncs = total_syncs + 1,
      data_transferred = data_transferred + NEW.data_size,
      success_rate = (
        (success_rate * total_syncs + 100.0) / (total_syncs + 1)
      )
    WHERE id = NEW.integration_id;
  ELSIF NEW.status = 'failed' AND OLD.status = 'running' THEN
    NEW.completed_at = NOW();

    UPDATE integrations
    SET
      total_syncs = total_syncs + 1,
      error_count = error_count + 1,
      success_rate = (
        (success_rate * total_syncs) / (total_syncs + 1)
      )
    WHERE id = NEW.integration_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_sync_completion
  BEFORE UPDATE ON sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_sync_completion();

-- Track webhook events
CREATE OR REPLACE FUNCTION track_webhook_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' THEN
    UPDATE integrations
    SET error_count = error_count + 1
    WHERE id = NEW.integration_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_webhook_event
  AFTER INSERT OR UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION track_webhook_event();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get integration statistics
CREATE OR REPLACE FUNCTION get_integration_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalIntegrations', COUNT(*),
    'connectedIntegrations', COUNT(*) FILTER (WHERE status = 'connected'),
    'byCategory', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM integrations
        WHERE user_id = p_user_id
        GROUP BY category
      ) cat_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM integrations
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'totalSyncs', COALESCE(SUM(total_syncs), 0),
    'totalDataTransferred', COALESCE(SUM(data_transferred), 0),
    'averageSuccessRate', ROUND(AVG(success_rate) FILTER (WHERE status = 'connected'), 2),
    'mostUsed', (
      SELECT json_build_object('name', name, 'syncCount', total_syncs)
      FROM integrations
      WHERE user_id = p_user_id
      ORDER BY total_syncs DESC
      LIMIT 1
    ),
    'recentErrors', COALESCE(SUM(error_count), 0)
  ) INTO v_stats
  FROM integrations
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search integrations
CREATE OR REPLACE FUNCTION search_integrations(
  p_user_id UUID,
  p_search_term TEXT,
  p_category integration_category DEFAULT NULL,
  p_status integration_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category integration_category,
  status integration_status,
  total_syncs INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.category,
    i.status,
    i.total_syncs,
    ts_rank(
      to_tsvector('english', i.name || ' ' || COALESCE(i.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM integrations i
  WHERE i.user_id = p_user_id
    AND (p_category IS NULL OR i.category = p_category)
    AND (p_status IS NULL OR i.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', i.name || ' ' || COALESCE(i.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, i.total_syncs DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Connect integration
CREATE OR REPLACE FUNCTION connect_integration(
  p_integration_id UUID,
  p_credentials JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
  v_integration integrations%ROWTYPE;
BEGIN
  UPDATE integrations
  SET
    status = 'connected',
    connected_at = NOW(),
    credentials = p_credentials,
    error_count = 0,
    updated_at = NOW()
  WHERE id = p_integration_id
  RETURNING * INTO v_integration;

  RETURN json_build_object(
    'success', true,
    'integrationId', v_integration.id,
    'name', v_integration.name,
    'connectedAt', v_integration.connected_at
  );
END;
$$ LANGUAGE plpgsql;

-- Disconnect integration
CREATE OR REPLACE FUNCTION disconnect_integration(p_integration_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE integrations
  SET
    status = 'disconnected',
    credentials = '{}'::jsonb,
    updated_at = NOW()
  WHERE id = p_integration_id;

  -- Remove API keys and OAuth tokens
  DELETE FROM integration_api_keys WHERE integration_id = p_integration_id;
  DELETE FROM integration_oauth_tokens WHERE integration_id = p_integration_id;

  RETURN json_build_object('success', true, 'integrationId', p_integration_id);
END;
$$ LANGUAGE plpgsql;

-- Start sync
CREATE OR REPLACE FUNCTION start_sync(
  p_integration_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_sync_id UUID;
BEGIN
  INSERT INTO sync_logs (integration_id, user_id, status)
  VALUES (p_integration_id, p_user_id, 'running')
  RETURNING id INTO v_sync_id;

  RETURN v_sync_id;
END;
$$ LANGUAGE plpgsql;

-- Complete sync
CREATE OR REPLACE FUNCTION complete_sync(
  p_sync_id UUID,
  p_records_processed INTEGER,
  p_records_failed INTEGER,
  p_data_size BIGINT
)
RETURNS JSON AS $$
BEGIN
  UPDATE sync_logs
  SET
    status = 'completed',
    records_processed = p_records_processed,
    records_failed = p_records_failed,
    data_size = p_data_size,
    completed_at = NOW()
  WHERE id = p_sync_id;

  RETURN json_build_object('success', true, 'syncId', p_sync_id);
END;
$$ LANGUAGE plpgsql;

-- Get recent sync logs
CREATE OR REPLACE FUNCTION get_recent_syncs(
  p_integration_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status sync_status,
  records_processed INTEGER,
  data_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.id,
    sl.started_at,
    sl.completed_at,
    sl.status,
    sl.records_processed,
    sl.data_size
  FROM sync_logs sl
  WHERE sl.integration_id = p_integration_id
  ORDER BY sl.started_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update integration stats daily
CREATE OR REPLACE FUNCTION update_integration_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO integration_stats (
    user_id,
    date,
    total_integrations,
    connected_integrations,
    category_breakdown,
    status_breakdown,
    total_syncs,
    total_data_transferred,
    average_success_rate,
    most_used_integration_id,
    recent_errors
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'connected'),
    (SELECT get_integration_stats(p_user_id)->>'byCategory')::jsonb,
    (SELECT get_integration_stats(p_user_id)->>'byStatus')::jsonb,
    COALESCE(SUM(total_syncs), 0),
    COALESCE(SUM(data_transferred), 0),
    ROUND(AVG(success_rate) FILTER (WHERE status = 'connected'), 2),
    (SELECT id FROM integrations WHERE user_id = p_user_id ORDER BY total_syncs DESC LIMIT 1),
    COALESCE(SUM(error_count), 0)
  FROM integrations
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_integrations = EXCLUDED.total_integrations,
    connected_integrations = EXCLUDED.connected_integrations,
    category_breakdown = EXCLUDED.category_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    total_syncs = EXCLUDED.total_syncs,
    total_data_transferred = EXCLUDED.total_data_transferred,
    average_success_rate = EXCLUDED.average_success_rate,
    most_used_integration_id = EXCLUDED.most_used_integration_id,
    recent_errors = EXCLUDED.recent_errors,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Integrations Policies
CREATE POLICY integrations_select_policy ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integrations_insert_policy ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integrations_update_policy ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integrations_delete_policy ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Integration Templates Policies (public read)
CREATE POLICY integration_templates_select_policy ON integration_templates
  FOR SELECT USING (true);

-- Webhook Events Policies
CREATE POLICY webhook_events_select_policy ON webhook_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY webhook_events_insert_policy ON webhook_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sync Logs Policies
CREATE POLICY sync_logs_select_policy ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY sync_logs_insert_policy ON sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY sync_logs_update_policy ON sync_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Integration Stats Policies
CREATE POLICY integration_stats_select_policy ON integration_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_stats_insert_policy ON integration_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_stats_update_policy ON integration_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- API Keys Policies
CREATE POLICY integration_api_keys_select_policy ON integration_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_api_keys_insert_policy ON integration_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_api_keys_update_policy ON integration_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integration_api_keys_delete_policy ON integration_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- OAuth Tokens Policies
CREATE POLICY integration_oauth_tokens_select_policy ON integration_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_insert_policy ON integration_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_update_policy ON integration_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_delete_policy ON integration_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all integrations by category
-- SELECT * FROM integrations WHERE user_id = 'user-id' AND category = 'payment' ORDER BY total_syncs DESC;

-- Example: Search integrations
-- SELECT * FROM search_integrations('user-id', 'stripe', NULL, 'connected', 20);

-- Example: Get integration statistics
-- SELECT * FROM get_integration_stats('user-id');

-- Example: Connect integration
-- SELECT * FROM connect_integration('integration-id', '{"api_key": "sk_test_xxx"}'::jsonb);

-- Example: Disconnect integration
-- SELECT * FROM disconnect_integration('integration-id');

-- Example: Start sync
-- SELECT start_sync('integration-id', 'user-id');

-- Example: Complete sync
-- SELECT * FROM complete_sync('sync-id', 1000, 5, 2048);

-- Example: Get recent syncs
-- SELECT * FROM get_recent_syncs('integration-id', 10);

-- Example: Update daily integration stats
-- SELECT update_integration_stats_daily('user-id');

-- =====================================================
-- END OF INTEGRATIONS SYSTEM SCHEMA
-- =====================================================
