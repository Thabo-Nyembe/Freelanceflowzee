-- =====================================================
-- AI SETTINGS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive AI provider management with API keys,
-- model configuration, usage tracking, and cost monitoring
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE ai_provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'replicate',
  'huggingface',
  'cohere',
  'mistral'
);

CREATE TYPE provider_status AS ENUM (
  'connected',
  'disconnected',
  'testing',
  'error'
);

CREATE TYPE model_capability AS ENUM (
  'text',
  'image',
  'audio',
  'video',
  'code',
  'embeddings',
  'vision',
  'multimodal'
);

CREATE TYPE usage_status AS ENUM (
  'success',
  'error',
  'timeout'
);

-- =====================================================
-- TABLES
-- =====================================================

-- AI Providers
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type ai_provider_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  status provider_status NOT NULL DEFAULT 'disconnected',
  api_key TEXT,
  api_key_last_four TEXT,
  api_endpoint TEXT,
  features TEXT[] DEFAULT '{}',
  pricing TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  connected_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens BIGINT NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  monthly_budget DECIMAL(10, 2),
  rate_limits JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- AI Models
CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  capabilities model_capability[] NOT NULL,
  context_window INTEGER NOT NULL DEFAULT 4096,
  max_tokens INTEGER NOT NULL DEFAULT 2048,
  input_cost_per_1k DECIMAL(10, 6) NOT NULL,
  output_cost_per_1k DECIMAL(10, 6) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_deprecated BOOLEAN NOT NULL DEFAULT false,
  version TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Features
CREATE TABLE ai_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  requires_key BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used TIMESTAMPTZ,
  config JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Records
CREATE TABLE ai_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  feature_id UUID REFERENCES ai_features(id) ON DELETE SET NULL,
  request_type TEXT NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
  latency INTEGER NOT NULL DEFAULT 0,
  status usage_status NOT NULL DEFAULT 'success',
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- API Keys (secure storage)
CREATE TABLE ai_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  key_last_four TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Usage Stats (aggregated statistics)
CREATE TABLE ai_usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_tokens BIGINT NOT NULL DEFAULT 0,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_latency INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  provider_breakdown JSONB DEFAULT '{}'::jsonb,
  model_breakdown JSONB DEFAULT '{}'::jsonb,
  feature_breakdown JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- AI Providers Indexes
CREATE INDEX idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX idx_ai_providers_type ON ai_providers(type);
CREATE INDEX idx_ai_providers_status ON ai_providers(status);
CREATE INDEX idx_ai_providers_is_enabled ON ai_providers(is_enabled);
CREATE INDEX idx_ai_providers_total_cost ON ai_providers(total_cost DESC);
CREATE INDEX idx_ai_providers_total_requests ON ai_providers(total_requests DESC);
CREATE INDEX idx_ai_providers_created_at ON ai_providers(created_at DESC);

-- AI Models Indexes
CREATE INDEX idx_ai_models_provider_id ON ai_models(provider_id);
CREATE INDEX idx_ai_models_is_default ON ai_models(is_default);
CREATE INDEX idx_ai_models_is_deprecated ON ai_models(is_deprecated);
CREATE INDEX idx_ai_models_capabilities ON ai_models USING GIN(capabilities);
CREATE INDEX idx_ai_models_created_at ON ai_models(created_at DESC);

-- AI Features Indexes
CREATE INDEX idx_ai_features_user_id ON ai_features(user_id);
CREATE INDEX idx_ai_features_provider_id ON ai_features(provider_id);
CREATE INDEX idx_ai_features_model_id ON ai_features(model_id);
CREATE INDEX idx_ai_features_is_enabled ON ai_features(is_enabled);
CREATE INDEX idx_ai_features_usage_count ON ai_features(usage_count DESC);
CREATE INDEX idx_ai_features_last_used ON ai_features(last_used DESC);
CREATE INDEX idx_ai_features_created_at ON ai_features(created_at DESC);

-- Usage Records Indexes
CREATE INDEX idx_ai_usage_records_user_id ON ai_usage_records(user_id);
CREATE INDEX idx_ai_usage_records_provider_id ON ai_usage_records(provider_id);
CREATE INDEX idx_ai_usage_records_model_id ON ai_usage_records(model_id);
CREATE INDEX idx_ai_usage_records_feature_id ON ai_usage_records(feature_id);
CREATE INDEX idx_ai_usage_records_status ON ai_usage_records(status);
CREATE INDEX idx_ai_usage_records_timestamp ON ai_usage_records(timestamp DESC);
CREATE INDEX idx_ai_usage_records_cost ON ai_usage_records(cost DESC);
CREATE INDEX idx_ai_usage_records_total_tokens ON ai_usage_records(total_tokens DESC);

-- API Keys Indexes
CREATE INDEX idx_ai_api_keys_user_id ON ai_api_keys(user_id);
CREATE INDEX idx_ai_api_keys_provider_id ON ai_api_keys(provider_id);
CREATE INDEX idx_ai_api_keys_is_active ON ai_api_keys(is_active);
CREATE INDEX idx_ai_api_keys_created_at ON ai_api_keys(created_at DESC);

-- Usage Stats Indexes
CREATE INDEX idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);
CREATE INDEX idx_ai_usage_stats_date ON ai_usage_stats(date DESC);
CREATE INDEX idx_ai_usage_stats_total_cost ON ai_usage_stats(total_cost DESC);
CREATE INDEX idx_ai_usage_stats_created_at ON ai_usage_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_features_updated_at
  BEFORE UPDATE ON ai_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_api_keys_updated_at
  BEFORE UPDATE ON ai_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_usage_stats_updated_at
  BEFORE UPDATE ON ai_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track usage on record insert
CREATE OR REPLACE FUNCTION track_ai_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update provider stats
  UPDATE ai_providers
  SET
    total_requests = total_requests + 1,
    total_tokens = total_tokens + NEW.total_tokens,
    total_cost = total_cost + NEW.cost,
    last_used = NEW.timestamp,
    updated_at = NOW()
  WHERE id = NEW.provider_id;

  -- Update feature stats
  IF NEW.feature_id IS NOT NULL THEN
    UPDATE ai_features
    SET
      usage_count = usage_count + 1,
      last_used = NEW.timestamp,
      updated_at = NOW()
    WHERE id = NEW.feature_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_ai_usage
  AFTER INSERT ON ai_usage_records
  FOR EACH ROW
  EXECUTE FUNCTION track_ai_usage();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get usage statistics
CREATE OR REPLACE FUNCTION get_ai_usage_stats(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalRequests', COUNT(*),
    'totalTokens', COALESCE(SUM(total_tokens), 0),
    'totalCost', COALESCE(SUM(cost), 0),
    'averageLatency', ROUND(AVG(latency)),
    'successRate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / GREATEST(COUNT(*), 1)) * 100,
      2
    ),
    'byProvider', (
      SELECT json_object_agg(
        ap.type,
        json_build_object(
          'requests', COUNT(ur.*),
          'tokens', COALESCE(SUM(ur.total_tokens), 0),
          'cost', COALESCE(SUM(ur.cost), 0)
        )
      )
      FROM ai_providers ap
      LEFT JOIN ai_usage_records ur ON ur.provider_id = ap.id
        AND ur.user_id = p_user_id
        AND ur.timestamp BETWEEN p_start_date AND p_end_date
      WHERE ap.user_id = p_user_id
      GROUP BY ap.type
    ),
    'byModel', (
      SELECT json_object_agg(
        am.display_name,
        json_build_object(
          'requests', COUNT(ur.*),
          'tokens', COALESCE(SUM(ur.total_tokens), 0),
          'cost', COALESCE(SUM(ur.cost), 0)
        )
      )
      FROM ai_models am
      JOIN ai_providers ap ON ap.id = am.provider_id
      LEFT JOIN ai_usage_records ur ON ur.model_id = am.id
        AND ur.user_id = p_user_id
        AND ur.timestamp BETWEEN p_start_date AND p_end_date
      WHERE ap.user_id = p_user_id
      GROUP BY am.display_name
    )
  ) INTO v_stats
  FROM ai_usage_records
  WHERE user_id = p_user_id
    AND timestamp BETWEEN p_start_date AND p_end_date;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Test provider connection
CREATE OR REPLACE FUNCTION test_provider_connection(
  p_provider_id UUID,
  p_test_result BOOLEAN,
  p_error_message TEXT DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  IF p_test_result THEN
    UPDATE ai_providers
    SET
      status = 'connected',
      connected_at = NOW(),
      updated_at = NOW()
    WHERE id = p_provider_id;

    RETURN json_build_object(
      'success', true,
      'message', 'Connection successful'
    );
  ELSE
    UPDATE ai_providers
    SET
      status = 'error',
      updated_at = NOW()
    WHERE id = p_provider_id;

    RETURN json_build_object(
      'success', false,
      'message', COALESCE(p_error_message, 'Connection failed')
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Calculate cost for request
CREATE OR REPLACE FUNCTION calculate_request_cost(
  p_model_id UUID,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER
)
RETURNS DECIMAL AS $$
DECLARE
  v_model ai_models%ROWTYPE;
  v_cost DECIMAL;
BEGIN
  SELECT * INTO v_model FROM ai_models WHERE id = p_model_id;

  v_cost := (
    (p_input_tokens::DECIMAL / 1000 * v_model.input_cost_per_1k) +
    (p_output_tokens::DECIMAL / 1000 * v_model.output_cost_per_1k)
  );

  RETURN ROUND(v_cost, 6);
END;
$$ LANGUAGE plpgsql;

-- Get provider usage summary
CREATE OR REPLACE FUNCTION get_provider_usage_summary(
  p_provider_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  v_summary JSON;
BEGIN
  SELECT json_build_object(
    'totalRequests', COUNT(*),
    'totalTokens', COALESCE(SUM(total_tokens), 0),
    'totalCost', COALESCE(SUM(cost), 0),
    'averageLatency', ROUND(AVG(latency)),
    'successRate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / GREATEST(COUNT(*), 1)) * 100,
      2
    ),
    'dailyUsage', (
      SELECT json_agg(
        json_build_object(
          'date', date,
          'requests', requests,
          'tokens', tokens,
          'cost', cost
        )
        ORDER BY date DESC
      )
      FROM (
        SELECT
          DATE(timestamp) as date,
          COUNT(*) as requests,
          SUM(total_tokens) as tokens,
          SUM(cost) as cost
        FROM ai_usage_records
        WHERE provider_id = p_provider_id
          AND timestamp >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY DATE(timestamp)
      ) daily
    )
  ) INTO v_summary
  FROM ai_usage_records
  WHERE provider_id = p_provider_id
    AND timestamp >= NOW() - (p_days || ' days')::INTERVAL;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Check budget alert
CREATE OR REPLACE FUNCTION check_budget_alert(p_user_id UUID)
RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  current_cost DECIMAL,
  monthly_budget DECIMAL,
  usage_percentage DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.id,
    ap.name,
    COALESCE(SUM(ur.cost), 0) as current_cost,
    ap.monthly_budget,
    CASE
      WHEN ap.monthly_budget > 0 THEN
        ROUND((COALESCE(SUM(ur.cost), 0) / ap.monthly_budget) * 100, 2)
      ELSE 0
    END as usage_percentage
  FROM ai_providers ap
  LEFT JOIN ai_usage_records ur ON ur.provider_id = ap.id
    AND ur.timestamp >= DATE_TRUNC('month', NOW())
  WHERE ap.user_id = p_user_id
    AND ap.monthly_budget IS NOT NULL
    AND ap.is_enabled = true
  GROUP BY ap.id, ap.name, ap.monthly_budget
  HAVING COALESCE(SUM(ur.cost), 0) / NULLIF(ap.monthly_budget, 0) > 0.8;
END;
$$ LANGUAGE plpgsql;

-- Update usage stats daily
CREATE OR REPLACE FUNCTION update_ai_usage_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_usage_stats (
    user_id,
    date,
    total_requests,
    total_tokens,
    total_cost,
    average_latency,
    success_rate,
    provider_breakdown,
    model_breakdown
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COALESCE(SUM(total_tokens), 0),
    COALESCE(SUM(cost), 0),
    ROUND(AVG(latency))::INTEGER,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::DECIMAL / GREATEST(COUNT(*), 1)) * 100,
      2
    ),
    (SELECT get_ai_usage_stats(p_user_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')->>'byProvider')::jsonb,
    (SELECT get_ai_usage_stats(p_user_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')->>'byModel')::jsonb
  FROM ai_usage_records
  WHERE user_id = p_user_id
    AND DATE(timestamp) = CURRENT_DATE
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    total_tokens = EXCLUDED.total_tokens,
    total_cost = EXCLUDED.total_cost,
    average_latency = EXCLUDED.average_latency,
    success_rate = EXCLUDED.success_rate,
    provider_breakdown = EXCLUDED.provider_breakdown,
    model_breakdown = EXCLUDED.model_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_stats ENABLE ROW LEVEL SECURITY;

-- AI Providers Policies
CREATE POLICY ai_providers_select_policy ON ai_providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_providers_insert_policy ON ai_providers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ai_providers_update_policy ON ai_providers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ai_providers_delete_policy ON ai_providers
  FOR DELETE USING (auth.uid() = user_id);

-- AI Models Policies
CREATE POLICY ai_models_select_policy ON ai_models
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ai_providers ap
      WHERE ap.id = provider_id AND ap.user_id = auth.uid()
    )
  );

-- AI Features Policies
CREATE POLICY ai_features_select_policy ON ai_features
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_features_insert_policy ON ai_features
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ai_features_update_policy ON ai_features
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ai_features_delete_policy ON ai_features
  FOR DELETE USING (auth.uid() = user_id);

-- Usage Records Policies
CREATE POLICY ai_usage_records_select_policy ON ai_usage_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_usage_records_insert_policy ON ai_usage_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API Keys Policies
CREATE POLICY ai_api_keys_select_policy ON ai_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_api_keys_insert_policy ON ai_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ai_api_keys_update_policy ON ai_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY ai_api_keys_delete_policy ON ai_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Usage Stats Policies
CREATE POLICY ai_usage_stats_select_policy ON ai_usage_stats
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all providers
-- SELECT * FROM ai_providers WHERE user_id = 'user-id' ORDER BY total_cost DESC;

-- Example: Get usage statistics
-- SELECT * FROM get_ai_usage_stats('user-id', NOW() - INTERVAL '30 days', NOW());

-- Example: Test provider connection
-- SELECT * FROM test_provider_connection('provider-id', true);

-- Example: Calculate request cost
-- SELECT calculate_request_cost('model-id', 1000, 500);

-- Example: Get provider usage summary
-- SELECT * FROM get_provider_usage_summary('provider-id', 30);

-- Example: Check budget alerts
-- SELECT * FROM check_budget_alert('user-id');

-- Example: Update daily usage stats
-- SELECT update_ai_usage_stats_daily('user-id');

-- =====================================================
-- END OF AI SETTINGS SYSTEM SCHEMA
-- =====================================================
