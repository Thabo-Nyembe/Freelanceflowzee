-- =====================================================
-- AI SETTINGS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive AI provider management with API keys,
-- model configuration, usage tracking, and cost monitoring
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS ai_provider_type CASCADE;
CREATE TYPE ai_provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'replicate',
  'huggingface',
  'cohere',
  'mistral'
);

DROP TYPE IF EXISTS provider_status CASCADE;
CREATE TYPE provider_status AS ENUM (
  'connected',
  'disconnected',
  'testing',
  'error'
);

DROP TYPE IF EXISTS model_capability CASCADE;
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

DROP TYPE IF EXISTS usage_status CASCADE;
CREATE TYPE usage_status AS ENUM (
  'success',
  'error',
  'timeout'
);

-- =====================================================
-- TABLES
-- =====================================================

-- AI Providers
CREATE TABLE IF NOT EXISTS ai_providers (
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
CREATE TABLE IF NOT EXISTS ai_models (
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
CREATE TABLE IF NOT EXISTS ai_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS ai_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS ai_api_keys (
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
CREATE TABLE IF NOT EXISTS ai_usage_stats (
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
CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_type ON ai_providers(type);
CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers(status);
CREATE INDEX IF NOT EXISTS idx_ai_providers_is_enabled ON ai_providers(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_providers_total_cost ON ai_providers(total_cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_providers_total_requests ON ai_providers(total_requests DESC);
CREATE INDEX IF NOT EXISTS idx_ai_providers_created_at ON ai_providers(created_at DESC);

-- AI Models Indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_provider_id ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_default ON ai_models(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_deprecated ON ai_models(is_deprecated);
CREATE INDEX IF NOT EXISTS idx_ai_models_capabilities ON ai_models USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_ai_models_created_at ON ai_models(created_at DESC);

-- AI Features Indexes
CREATE INDEX IF NOT EXISTS idx_ai_features_user_id ON ai_features(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_provider_id ON ai_features(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_model_id ON ai_features(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_is_enabled ON ai_features(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_features_usage_count ON ai_features(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_ai_features_last_used ON ai_features(last_used DESC);
CREATE INDEX IF NOT EXISTS idx_ai_features_created_at ON ai_features(created_at DESC);

-- Usage Records Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_user_id ON ai_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_provider_id ON ai_usage_records(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_model_id ON ai_usage_records(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_feature_id ON ai_usage_records(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_status ON ai_usage_records(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_timestamp ON ai_usage_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_cost ON ai_usage_records(cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_total_tokens ON ai_usage_records(total_tokens DESC);

-- API Keys Indexes
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_user_id ON ai_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_provider_id ON ai_api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_is_active ON ai_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_created_at ON ai_api_keys(created_at DESC);

-- Usage Stats Indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_date ON ai_usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_total_cost ON ai_usage_stats(total_cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_created_at ON ai_usage_stats(created_at DESC);

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
  p_model_id TEXT,
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
-- ============================================================================
-- AI VIDEO GENERATION SYSTEM - SUPABASE MIGRATION
-- Complete video generation, templates, and analytics
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS video_style CASCADE;
CREATE TYPE video_style AS ENUM (
  'cinematic',
  'professional',
  'casual',
  'animated',
  'explainer',
  'social-media'
);

DROP TYPE IF EXISTS video_format CASCADE;
CREATE TYPE video_format AS ENUM (
  'landscape',
  'portrait',
  'square',
  'widescreen'
);

DROP TYPE IF EXISTS video_quality CASCADE;
CREATE TYPE video_quality AS ENUM (
  'sd',
  'hd',
  'full-hd',
  '4k'
);

DROP TYPE IF EXISTS ai_model CASCADE;
CREATE TYPE ai_model AS ENUM (
  'kazi-ai',
  'runway-gen3',
  'pika-labs',
  'stable-video'
);

DROP TYPE IF EXISTS generation_status CASCADE;
CREATE TYPE generation_status AS ENUM (
  'idle',
  'analyzing',
  'generating',
  'rendering',
  'completed',
  'failed'
);

DROP TYPE IF EXISTS video_category CASCADE;
CREATE TYPE video_category AS ENUM (
  'marketing',
  'tutorial',
  'entertainment',
  'business',
  'education',
  'social'
);

-- ============================================================================
-- TABLE: generated_videos
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style video_style NOT NULL DEFAULT 'professional',
  format video_format NOT NULL DEFAULT 'landscape',
  quality video_quality NOT NULL DEFAULT 'hd',
  ai_model ai_model NOT NULL DEFAULT 'kazi-ai',
  status generation_status NOT NULL DEFAULT 'idle',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  video_url TEXT,
  thumbnail_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  file_size BIGINT DEFAULT 0, -- in bytes
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category video_category NOT NULL DEFAULT 'marketing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: video_metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  fps INTEGER DEFAULT 30,
  codec TEXT NOT NULL DEFAULT 'h264',
  bitrate TEXT NOT NULL DEFAULT '10 Mbps',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  color_space TEXT DEFAULT 'sRGB',
  audio_codec TEXT DEFAULT 'aac',
  audio_bitrate TEXT DEFAULT '192 kbps',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  style video_style NOT NULL DEFAULT 'professional',
  format video_format NOT NULL DEFAULT 'landscape',
  duration INTEGER NOT NULL DEFAULT 30,
  scenes INTEGER NOT NULL DEFAULT 5,
  premium BOOLEAN DEFAULT false,
  category video_category NOT NULL DEFAULT 'marketing',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  price DECIMAL(10, 2) DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: generation_settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_model ai_model NOT NULL DEFAULT 'kazi-ai',
  default_quality video_quality NOT NULL DEFAULT 'hd',
  default_format video_format NOT NULL DEFAULT 'landscape',
  auto_save BOOLEAN DEFAULT true,
  high_quality_previews BOOLEAN DEFAULT true,
  watermark_enabled BOOLEAN DEFAULT false,
  max_concurrent_generations INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0, -- in seconds
  completion_rate DECIMAL(5, 2) DEFAULT 0, -- 0-100
  engagement_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date)
);

-- ============================================================================
-- TABLE: video_analytics_devices
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  desktop_views INTEGER DEFAULT 0,
  mobile_views INTEGER DEFAULT 0,
  tablet_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date)
);

-- ============================================================================
-- TABLE: video_analytics_countries
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date, country_code)
);

-- ============================================================================
-- TABLE: generation_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  status generation_status NOT NULL,
  progress INTEGER DEFAULT 0,
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_shares
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'email', 'twitter', 'facebook', 'linkedin', 'whatsapp'
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_likes
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- ============================================================================
-- TABLE: video_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- generated_videos indexes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_quality ON generated_videos(quality);
CREATE INDEX IF NOT EXISTS idx_generated_videos_category ON generated_videos(category);
CREATE INDEX IF NOT EXISTS idx_generated_videos_is_public ON generated_videos(is_public);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_views ON generated_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_downloads ON generated_videos(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_likes ON generated_videos(likes DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_tags ON generated_videos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_generated_videos_title_trgm ON generated_videos USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generated_videos_prompt_trgm ON generated_videos USING gin(prompt gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_status ON generated_videos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_category ON generated_videos(user_id, category);

-- video_metadata indexes
CREATE INDEX IF NOT EXISTS idx_video_metadata_video_id ON video_metadata(video_id);

-- video_templates indexes
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_premium ON video_templates(premium);
CREATE INDEX IF NOT EXISTS idx_video_templates_usage_count ON video_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_templates_tags ON video_templates USING gin(tags);

-- generation_settings indexes
CREATE INDEX IF NOT EXISTS idx_generation_settings_user_id ON generation_settings(user_id);

-- video_analytics indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_date ON video_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_date ON video_analytics(video_id, date);

-- video_analytics_devices indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_devices_video_id ON video_analytics_devices(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_devices_date ON video_analytics_devices(date DESC);

-- video_analytics_countries indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_video_id ON video_analytics_countries(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_country ON video_analytics_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_date ON video_analytics_countries(date DESC);

-- generation_history indexes
CREATE INDEX IF NOT EXISTS idx_generation_history_video_id ON generation_history(video_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);

-- video_shares indexes
CREATE INDEX IF NOT EXISTS idx_video_shares_video_id ON video_shares(video_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_user_id ON video_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_platform ON video_shares(platform);
CREATE INDEX IF NOT EXISTS idx_video_shares_shared_at ON video_shares(shared_at DESC);

-- video_likes indexes
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_liked_at ON video_likes(liked_at DESC);

-- video_comments indexes
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_id ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_parent_id ON video_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- generated_videos policies
CREATE POLICY "Users can view their own videos"
  ON generated_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public videos"
  ON generated_videos FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own videos"
  ON generated_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON generated_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON generated_videos FOR DELETE
  USING (auth.uid() = user_id);

-- video_metadata policies
CREATE POLICY "Users can view metadata for their videos"
  ON video_metadata FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_metadata.video_id
    AND (generated_videos.user_id = auth.uid() OR generated_videos.is_public = true)
  ));

CREATE POLICY "Users can create metadata for their videos"
  ON video_metadata FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_metadata.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_templates policies (public read)
CREATE POLICY "Anyone can view templates"
  ON video_templates FOR SELECT
  TO authenticated
  USING (true);

-- generation_settings policies
CREATE POLICY "Users can view their own settings"
  ON generation_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON generation_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON generation_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- video_analytics policies
CREATE POLICY "Users can view analytics for their videos"
  ON video_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_analytics_devices policies
CREATE POLICY "Users can view device analytics for their videos"
  ON video_analytics_devices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics_devices.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_analytics_countries policies
CREATE POLICY "Users can view country analytics for their videos"
  ON video_analytics_countries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics_countries.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- generation_history policies
CREATE POLICY "Users can view history for their videos"
  ON generation_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = generation_history.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_shares policies
CREATE POLICY "Users can view their own shares"
  ON video_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares"
  ON video_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- video_likes policies
CREATE POLICY "Users can view likes"
  ON video_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- video_comments policies
CREATE POLICY "Users can view comments on accessible videos"
  ON video_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_comments.video_id
    AND (generated_videos.user_id = auth.uid() OR generated_videos.is_public = true)
  ));

CREATE POLICY "Users can create comments"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON video_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON video_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_templates_updated_at
  BEFORE UPDATE ON video_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_settings_updated_at
  BEFORE UPDATE ON generation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_comments_updated_at
  BEFORE UPDATE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_video_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_generated_videos_completed_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION set_video_completed_at();

-- Update video likes count
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE generated_videos
    SET likes = likes + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE generated_videos
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_likes_count
  AFTER INSERT OR DELETE ON video_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_likes_count();

-- Update video shares count
CREATE OR REPLACE FUNCTION update_video_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE generated_videos
  SET shares = shares + 1
  WHERE id = NEW.video_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_shares_count
  AFTER INSERT ON video_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_video_shares_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's videos with stats
CREATE OR REPLACE FUNCTION get_user_videos_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status generation_status,
  quality video_quality,
  duration INTEGER,
  views INTEGER,
  downloads INTEGER,
  likes INTEGER,
  shares INTEGER,
  engagement_score DECIMAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.status,
    v.quality,
    v.duration,
    v.views,
    v.downloads,
    v.likes,
    v.shares,
    ROUND(
      (v.views::DECIMAL / NULLIF(GREATEST(v.views, v.downloads, v.likes, v.shares), 0)) * 100,
      2
    ) as engagement_score,
    v.created_at
  FROM generated_videos v
  WHERE v.user_id = p_user_id
  ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get popular videos
CREATE OR REPLACE FUNCTION get_popular_videos(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  views INTEGER,
  likes INTEGER,
  thumbnail_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.views,
    v.likes,
    v.thumbnail_url
  FROM generated_videos v
  WHERE v.is_public = true
    AND v.status = 'completed'
  ORDER BY v.views DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get trending videos (high engagement in last 30 days)
CREATE OR REPLACE FUNCTION get_trending_videos(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  views INTEGER,
  likes INTEGER,
  shares INTEGER,
  engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.views,
    v.likes,
    v.shares,
    ROUND(
      ((v.views + v.downloads * 2 + v.likes * 3 + v.shares * 5)::DECIMAL /
       NULLIF(GREATEST(v.views, 1), 0)) * 100,
      2
    ) as engagement_score
  FROM generated_videos v
  WHERE v.is_public = true
    AND v.status = 'completed'
    AND v.created_at >= now() - INTERVAL '30 days'
  ORDER BY engagement_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get video analytics summary
CREATE OR REPLACE FUNCTION get_video_analytics_summary(p_video_id UUID)
RETURNS TABLE (
  total_views INTEGER,
  unique_views INTEGER,
  total_downloads INTEGER,
  total_shares INTEGER,
  total_likes INTEGER,
  avg_watch_time INTEGER,
  avg_completion_rate DECIMAL,
  avg_engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(views), 0)::INTEGER as total_views,
    COALESCE(SUM(unique_views), 0)::INTEGER as unique_views,
    COALESCE(SUM(downloads), 0)::INTEGER as total_downloads,
    COALESCE(SUM(shares), 0)::INTEGER as total_shares,
    COALESCE(SUM(likes), 0)::INTEGER as total_likes,
    COALESCE(AVG(avg_watch_time), 0)::INTEGER as avg_watch_time,
    COALESCE(AVG(completion_rate), 0)::DECIMAL as avg_completion_rate,
    COALESCE(AVG(engagement_score), 0)::DECIMAL as avg_engagement_score
  FROM video_analytics
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search videos with full-text search
CREATE OR REPLACE FUNCTION search_user_videos(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  prompt TEXT,
  status generation_status,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.prompt,
    v.status,
    v.thumbnail_url,
    v.created_at
  FROM generated_videos v
  WHERE v.user_id = p_user_id
    AND (
      v.title ILIKE '%' || p_search_term || '%'
      OR v.prompt ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(v.tags)
    )
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate user's total storage used
CREATE OR REPLACE FUNCTION calculate_user_video_storage(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  total_storage BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0)
  INTO total_storage
  FROM generated_videos
  WHERE user_id = p_user_id
    AND status = 'completed';

  RETURN total_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user generation statistics
CREATE OR REPLACE FUNCTION get_user_generation_stats(p_user_id UUID)
RETURNS TABLE (
  total_videos INTEGER,
  completed_videos INTEGER,
  generating_videos INTEGER,
  failed_videos INTEGER,
  completion_rate DECIMAL,
  total_duration INTEGER,
  total_storage BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_videos,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_videos,
    COUNT(*) FILTER (WHERE status = 'generating')::INTEGER as generating_videos,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_videos,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END as completion_rate,
    COALESCE(SUM(duration) FILTER (WHERE status = 'completed'), 0)::INTEGER as total_duration,
    COALESCE(SUM(file_size) FILTER (WHERE status = 'completed'), 0)::BIGINT as total_storage
  FROM generated_videos
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- AR COLLABORATION SYSTEM - SUPABASE MIGRATION
-- Complete augmented reality collaboration with spatial computing
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS ar_environment CASCADE;
CREATE TYPE ar_environment AS ENUM (
  'office',
  'studio',
  'park',
  'abstract',
  'conference',
  'zen'
);

DROP TYPE IF EXISTS device_type CASCADE;
CREATE TYPE device_type AS ENUM (
  'hololens',
  'quest',
  'arkit',
  'arcore',
  'webxr',
  'browser'
);

DROP TYPE IF EXISTS session_status CASCADE;
CREATE TYPE session_status AS ENUM (
  'active',
  'scheduled',
  'ended',
  'archived'
);

DROP TYPE IF EXISTS participant_status CASCADE;
CREATE TYPE participant_status AS ENUM (
  'connected',
  'away',
  'disconnected'
);

DROP TYPE IF EXISTS object_type CASCADE;
CREATE TYPE object_type AS ENUM (
  '3d-model',
  'annotation',
  'whiteboard',
  'screen',
  'marker',
  'portal'
);

DROP TYPE IF EXISTS interaction_type CASCADE;
CREATE TYPE interaction_type AS ENUM (
  'grab',
  'point',
  'gesture',
  'voice',
  'controller'
);

DROP TYPE IF EXISTS quality_level CASCADE;
CREATE TYPE quality_level AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- ============================================================================
-- TABLE: ar_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  environment ar_environment NOT NULL DEFAULT 'office',
  status session_status NOT NULL DEFAULT 'scheduled',
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 20,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  scheduled_time TIMESTAMPTZ,
  is_recording BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  password TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  features JSONB DEFAULT '{
    "spatialAudio": true,
    "whiteboard": true,
    "screenShare": true,
    "objects3D": true,
    "recording": true,
    "handTracking": false,
    "eyeTracking": false,
    "faceTracking": false,
    "roomMapping": true,
    "lightEstimation": true
  }'::JSONB,
  settings JSONB DEFAULT '{
    "audioQuality": "high",
    "videoQuality": "high",
    "renderQuality": "high",
    "networkOptimization": true,
    "autoReconnect": true
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  device device_type NOT NULL,
  status participant_status NOT NULL DEFAULT 'connected',
  position_x DECIMAL(10, 4) DEFAULT 0,
  position_y DECIMAL(10, 4) DEFAULT 1.5,
  position_z DECIMAL(10, 4) DEFAULT 0,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  scale DECIMAL(10, 4) DEFAULT 1.0,
  is_muted BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT true,
  is_sharing_screen BOOLEAN DEFAULT false,
  is_hand_tracking_enabled BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  latency INTEGER DEFAULT 0,
  bandwidth INTEGER DEFAULT 0,
  fps INTEGER DEFAULT 60,
  quality quality_level DEFAULT 'high',
  permissions JSONB DEFAULT '{
    "canAnnotate": true,
    "canPlace3D": true,
    "canControlWhiteboard": true,
    "canRecord": false
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_objects
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  type object_type NOT NULL,
  name TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  scale DECIMAL(10, 4) DEFAULT 1.0,
  color TEXT,
  texture TEXT,
  model_url TEXT,
  is_interactive BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{
    "canMove": true,
    "canRotate": true,
    "canScale": true,
    "canDelete": true
  }'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_annotations
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  object_id UUID REFERENCES ar_objects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  color TEXT DEFAULT '#000000',
  size DECIMAL(10, 2) DEFAULT 1.0,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'drawing', 'marker', 'highlight')),
  stroke_width DECIMAL(10, 2),
  points JSONB DEFAULT '[]'::JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_whiteboards
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  width DECIMAL(10, 2) DEFAULT 2.0,
  height DECIMAL(10, 2) DEFAULT 1.5,
  content TEXT,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_whiteboard_strokes
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_whiteboard_strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id UUID NOT NULL REFERENCES ar_whiteboards(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points JSONB NOT NULL,
  color TEXT NOT NULL DEFAULT '#000000',
  width DECIMAL(10, 2) DEFAULT 2.0,
  opacity DECIMAL(3, 2) DEFAULT 1.0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_recordings
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  format TEXT DEFAULT 'mp4' CHECK (format IN ('mp4', 'webm', 'glb')),
  quality quality_level DEFAULT 'high',
  thumbnail TEXT,
  url TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_session_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  total_participants INTEGER DEFAULT 0,
  peak_participants INTEGER DEFAULT 0,
  average_participants DECIMAL(10, 2) DEFAULT 0,
  duration INTEGER DEFAULT 0,
  objects_created INTEGER DEFAULT 0,
  annotations_created INTEGER DEFAULT 0,
  messages_exchanged INTEGER DEFAULT 0,
  data_transferred BIGINT DEFAULT 0,
  average_latency DECIMAL(10, 2) DEFAULT 0,
  average_fps DECIMAL(10, 2) DEFAULT 0,
  disconnections INTEGER DEFAULT 0,
  reconnections INTEGER DEFAULT 0,
  quality_audio INTEGER DEFAULT 0,
  quality_video INTEGER DEFAULT 0,
  quality_network INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_interactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES ar_participants(id) ON DELETE CASCADE,
  object_id UUID REFERENCES ar_objects(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  action TEXT NOT NULL,
  position_x DECIMAL(10, 4),
  position_y DECIMAL(10, 4),
  position_z DECIMAL(10, 4),
  metadata JSONB DEFAULT '{}'::JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ar_sessions indexes
CREATE INDEX IF NOT EXISTS idx_ar_sessions_user_id ON ar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_host_id ON ar_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_status ON ar_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_environment ON ar_sessions(environment);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_scheduled_time ON ar_sessions(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_start_time ON ar_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_is_recording ON ar_sessions(is_recording);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_is_locked ON ar_sessions(is_locked);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_tags ON ar_sessions USING gin(tags);

-- ar_participants indexes
CREATE INDEX IF NOT EXISTS idx_ar_participants_user_id ON ar_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_session_id ON ar_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_device ON ar_participants(device);
CREATE INDEX IF NOT EXISTS idx_ar_participants_status ON ar_participants(status);
CREATE INDEX IF NOT EXISTS idx_ar_participants_joined_at ON ar_participants(joined_at DESC);

-- ar_objects indexes
CREATE INDEX IF NOT EXISTS idx_ar_objects_session_id ON ar_objects(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_type ON ar_objects(type);
CREATE INDEX IF NOT EXISTS idx_ar_objects_owner_id ON ar_objects(owner_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_is_visible ON ar_objects(is_visible);

-- ar_annotations indexes
CREATE INDEX IF NOT EXISTS idx_ar_annotations_session_id ON ar_annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_object_id ON ar_annotations(object_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_author_id ON ar_annotations(author_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_created_at ON ar_annotations(created_at DESC);

-- ar_whiteboards indexes
CREATE INDEX IF NOT EXISTS idx_ar_whiteboards_session_id ON ar_whiteboards(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_whiteboards_created_by ON ar_whiteboards(created_by);

-- ar_whiteboard_strokes indexes
CREATE INDEX IF NOT EXISTS idx_ar_whiteboard_strokes_whiteboard_id ON ar_whiteboard_strokes(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_ar_whiteboard_strokes_author_id ON ar_whiteboard_strokes(author_id);

-- ar_recordings indexes
CREATE INDEX IF NOT EXISTS idx_ar_recordings_session_id ON ar_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_user_id ON ar_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_start_time ON ar_recordings(start_time DESC);

-- ar_session_metrics indexes
CREATE INDEX IF NOT EXISTS idx_ar_session_metrics_session_id ON ar_session_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_session_metrics_period ON ar_session_metrics(period);

-- ar_interactions indexes
CREATE INDEX IF NOT EXISTS idx_ar_interactions_session_id ON ar_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_participant_id ON ar_interactions(participant_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_object_id ON ar_interactions(object_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_timestamp ON ar_interactions(timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_whiteboard_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_session_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;

-- ar_sessions policies
CREATE POLICY "Users can view sessions they created or joined"
  ON ar_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = host_id
    OR EXISTS (
      SELECT 1 FROM ar_participants
      WHERE ar_participants.session_id = ar_sessions.id
      AND ar_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions"
  ON ar_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update their sessions"
  ON ar_sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions"
  ON ar_sessions FOR DELETE
  USING (auth.uid() = host_id);

-- ar_participants policies
CREATE POLICY "Users can view participants in sessions they're part of"
  ON ar_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_participants.session_id
    AND (
      ar_sessions.user_id = auth.uid()
      OR ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants p2
        WHERE p2.session_id = ar_sessions.id
        AND p2.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can join sessions"
  ON ar_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ar_objects policies
CREATE POLICY "Users can view objects in sessions they're part of"
  ON ar_objects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_objects.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create objects"
  ON ar_objects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their objects"
  ON ar_objects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their objects"
  ON ar_objects FOR DELETE
  USING (auth.uid() = owner_id);

-- ar_annotations policies
CREATE POLICY "Users can view annotations in sessions they're part of"
  ON ar_annotations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_annotations.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create annotations"
  ON ar_annotations FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ar_whiteboards policies
CREATE POLICY "Users can view whiteboards in sessions they're part of"
  ON ar_whiteboards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_whiteboards.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create whiteboards"
  ON ar_whiteboards FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ar_whiteboard_strokes policies
CREATE POLICY "Users can view whiteboard strokes"
  ON ar_whiteboard_strokes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_whiteboards wb
    JOIN ar_sessions s ON s.id = wb.session_id
    WHERE wb.id = ar_whiteboard_strokes.whiteboard_id
    AND (
      s.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = s.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can add strokes"
  ON ar_whiteboard_strokes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ar_recordings policies
CREATE POLICY "Users can view recordings of sessions they participated in"
  ON ar_recordings FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM ar_sessions
      WHERE ar_sessions.id = ar_recordings.session_id
      AND ar_sessions.host_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recordings"
  ON ar_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ar_session_metrics policies
CREATE POLICY "Hosts can view metrics for their sessions"
  ON ar_session_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_session_metrics.session_id
    AND ar_sessions.host_id = auth.uid()
  ));

-- ar_interactions policies
CREATE POLICY "Users can view interactions in sessions they're part of"
  ON ar_interactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_interactions.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can log interactions"
  ON ar_interactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ar_participants
    WHERE ar_participants.id = ar_interactions.participant_id
    AND ar_participants.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ar_sessions_updated_at
  BEFORE UPDATE ON ar_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ar_objects_updated_at
  BEFORE UPDATE ON ar_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ar_whiteboards_updated_at
  BEFORE UPDATE ON ar_whiteboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ar_sessions
    SET current_participants = current_participants + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ar_sessions
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_participant_count
  AFTER INSERT OR DELETE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get session statistics
CREATE OR REPLACE FUNCTION get_ar_session_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id),
      'active_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND status = 'active'),
      'scheduled_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND status = 'scheduled'),
      'total_participants', (SELECT COALESCE(SUM(current_participants), 0) FROM ar_sessions WHERE user_id = p_user_id),
      'recording_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND is_recording = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate distance between positions
CREATE OR REPLACE FUNCTION calculate_distance(
  x1 DECIMAL, y1 DECIMAL, z1 DECIMAL,
  x2 DECIMAL, y2 DECIMAL, z2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN SQRT(
    POWER(x2 - x1, 2) +
    POWER(y2 - y1, 2) +
    POWER(z2 - z1, 2)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get nearby participants
CREATE OR REPLACE FUNCTION get_nearby_participants(
  p_session_id UUID,
  p_x DECIMAL,
  p_y DECIMAL,
  p_z DECIMAL,
  p_max_distance DECIMAL DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    calculate_distance(p_x, p_y, p_z, p.position_x, p.position_y, p.position_z) as distance
  FROM ar_participants p
  WHERE p.session_id = p_session_id
  AND p.status = 'connected'
  AND calculate_distance(p_x, p_y, p_z, p.position_x, p.position_y, p.position_z) <= p_max_distance
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- Bookings System - Production Database Schema
-- ============================================================================
-- Comprehensive appointment and booking management with scheduling,
-- availability tracking, reminders, and revenue calculations
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS booking_status CASCADE;
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('awaiting', 'paid', 'partial', 'refunded', 'failed');
DROP TYPE IF EXISTS booking_type CASCADE;
CREATE TYPE booking_type AS ENUM ('consultation', 'meeting', 'service', 'call', 'workshop', 'event');
DROP TYPE IF EXISTS recurrence_type CASCADE;
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'biweekly', 'monthly');
DROP TYPE IF EXISTS reminder_type CASCADE;
CREATE TYPE reminder_type AS ENUM ('email', 'sms', 'push', 'all');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  service TEXT NOT NULL,
  type booking_type NOT NULL DEFAULT 'consultation',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status booking_status NOT NULL DEFAULT 'pending',
  payment payment_status NOT NULL DEFAULT 'awaiting',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  recurrence recurrence_type NOT NULL DEFAULT 'none',
  parent_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_type reminder_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Slots (Availability)
CREATE TABLE IF NOT EXISTS booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  slot_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  buffer_time INTEGER NOT NULL DEFAULT 0, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Settings
CREATE TABLE IF NOT EXISTS booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_hours_start TIME NOT NULL DEFAULT '09:00',
  business_hours_end TIME NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday-Friday
  slot_duration INTEGER NOT NULL DEFAULT 60,
  buffer_time INTEGER NOT NULL DEFAULT 0,
  advance_booking_days INTEGER NOT NULL DEFAULT 30,
  cancellation_policy TEXT,
  auto_confirm BOOLEAN NOT NULL DEFAULT FALSE,
  require_deposit BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_percentage INTEGER NOT NULL DEFAULT 0 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  send_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_hours INTEGER[] DEFAULT '{24,2}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Reminders
CREATE TABLE IF NOT EXISTS booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Stats
CREATE TABLE IF NOT EXISTS booking_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  confirmed INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  cancelled INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_booking_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  most_popular_service TEXT,
  peak_booking_day TEXT,
  completion_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  cancellation_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  no_show_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment ON bookings(payment);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_tags ON bookings USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_bookings_recurrence ON bookings(recurrence) WHERE recurrence != 'none';

-- Booking Slots indexes
CREATE INDEX IF NOT EXISTS idx_booking_slots_user_id ON booking_slots(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_day ON booking_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_booking_slots_available ON booking_slots(is_available);

-- Booking Settings indexes
CREATE INDEX IF NOT EXISTS idx_booking_settings_user_id ON booking_settings(user_id);

-- Booking Reminders indexes
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_scheduled ON booking_reminders(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_sent ON booking_reminders(sent) WHERE sent = FALSE;

-- Booking Stats indexes
CREATE INDEX IF NOT EXISTS idx_booking_stats_user_id ON booking_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_settings_updated_at
  BEFORE UPDATE ON booking_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_stats_updated_at
  BEFORE UPDATE ON booking_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on booking changes
CREATE OR REPLACE FUNCTION update_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO booking_stats (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO UPDATE SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id),
    confirmed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'confirmed'),
    pending = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'pending'),
    completed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'completed'),
    cancelled = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'cancelled'),
    no_shows = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'no_show'),
    total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE user_id = EXCLUDED.user_id AND payment = 'paid'),
    average_booking_value = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COALESCE(SUM(amount), 0) / COUNT(*), 2)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    completion_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    cancellation_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'cancelled')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    no_show_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'no_show')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_booking_change
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_stats();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_duration INTEGER DEFAULT 60
)
RETURNS TABLE(
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get business hours for the day
  SELECT business_hours_start, business_hours_end
  INTO v_start_time, v_end_time
  FROM booking_settings
  WHERE user_id = p_user_id AND v_day_of_week = ANY(working_days);

  IF v_start_time IS NULL THEN
    RETURN;
  END IF;

  -- Generate slots
  RETURN QUERY
  WITH RECURSIVE time_slots AS (
    SELECT v_start_time AS slot_time
    UNION ALL
    SELECT slot_time + (p_duration || ' minutes')::INTERVAL
    FROM time_slots
    WHERE slot_time + (p_duration || ' minutes')::INTERVAL < v_end_time
  )
  SELECT
    ts.slot_time,
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.user_id = p_user_id
        AND b.booking_date = p_date
        AND b.start_time = ts.slot_time
        AND b.status != 'cancelled'
    ) AS is_available
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming bookings
CREATE OR REPLACE FUNCTION get_upcoming_bookings(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  id UUID,
  client_name TEXT,
  service TEXT,
  booking_date DATE,
  start_time TIME,
  status booking_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.client_name, b.service, b.booking_date, b.start_time, b.status
  FROM bookings b
  WHERE b.user_id = p_user_id
    AND b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    AND b.status != 'cancelled'
  ORDER BY b.booking_date, b.start_time;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue for period
CREATE OR REPLACE FUNCTION calculate_booking_revenue(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_revenue DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_revenue
  FROM bookings
  WHERE user_id = p_user_id
    AND payment = 'paid'
    AND (p_start_date IS NULL OR booking_date >= p_start_date)
    AND (p_end_date IS NULL OR booking_date <= p_end_date);

  RETURN v_revenue;
END;
$$ LANGUAGE plpgsql;

-- Check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_user_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conflict BOOLEAN;
  v_end_time TIME;
BEGIN
  v_end_time := p_time + (p_duration || ' minutes')::INTERVAL;

  SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE user_id = p_user_id
      AND booking_date = p_date
      AND status != 'cancelled'
      AND (id IS DISTINCT FROM p_exclude_id)
      AND (
        (start_time >= p_time AND start_time < v_end_time) OR
        (start_time + (duration_minutes || ' minutes')::INTERVAL > p_time
         AND start_time < p_time)
      )
  )
  INTO v_conflict;

  RETURN v_conflict;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_stats ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Slots policies
CREATE POLICY "Users can view all public slots"
  ON booking_slots FOR SELECT
  USING (is_available = TRUE);

CREATE POLICY "Users can manage their own slots"
  ON booking_slots FOR ALL
  USING (auth.uid() = user_id);

-- Booking Settings policies
CREATE POLICY "Users can view their own settings"
  ON booking_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON booking_settings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Reminders policies
CREATE POLICY "Users can view reminders for their bookings"
  ON booking_reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_reminders.booking_id AND user_id = auth.uid()
  ));

-- Booking Stats policies
CREATE POLICY "Users can view their own stats"
  ON booking_stats FOR SELECT
  USING (auth.uid() = user_id);
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

DROP TYPE IF EXISTS browser_type CASCADE;
CREATE TYPE browser_type AS ENUM (
  'chrome',
  'firefox',
  'safari',
  'edge',
  'brave',
  'opera'
);

DROP TYPE IF EXISTS capture_type CASCADE;
CREATE TYPE capture_type AS ENUM (
  'screenshot',
  'full-page',
  'selection',
  'video',
  'text'
);

DROP TYPE IF EXISTS action_type CASCADE;
CREATE TYPE action_type AS ENUM (
  'task',
  'link',
  'share',
  'translate',
  'summarize',
  'analyze'
);

DROP TYPE IF EXISTS feature_type CASCADE;
CREATE TYPE feature_type AS ENUM (
  'quick-access',
  'page-capture',
  'web-clipper',
  'shortcuts',
  'sync',
  'ai-assistant'
);

DROP TYPE IF EXISTS sync_status CASCADE;
CREATE TYPE sync_status AS ENUM (
  'synced',
  'syncing',
  'pending',
  'error',
  'offline'
);

DROP TYPE IF EXISTS shortcut_scope CASCADE;
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
CREATE TABLE IF NOT EXISTS page_captures (
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
CREATE TABLE IF NOT EXISTS quick_actions (
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
CREATE TABLE IF NOT EXISTS extension_features (
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
CREATE TABLE IF NOT EXISTS browser_info (
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
CREATE TABLE IF NOT EXISTS keyboard_shortcuts (
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
CREATE TABLE IF NOT EXISTS sync_settings (
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
CREATE TABLE IF NOT EXISTS capture_analytics (
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
CREATE TABLE IF NOT EXISTS extension_statistics (
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
CREATE TABLE IF NOT EXISTS capture_tags (
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
CREATE TABLE IF NOT EXISTS action_history (
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
CREATE TABLE IF NOT EXISTS sync_history (
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
CREATE INDEX IF NOT EXISTS idx_page_captures_user_id ON page_captures(user_id);
CREATE INDEX IF NOT EXISTS idx_page_captures_type ON page_captures(type);
CREATE INDEX IF NOT EXISTS idx_page_captures_timestamp ON page_captures(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_captures_sync_status ON page_captures(sync_status);
CREATE INDEX IF NOT EXISTS idx_page_captures_tags ON page_captures USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_page_captures_title ON page_captures USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_page_captures_url ON page_captures USING GIN(url gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_page_captures_metadata ON page_captures USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_page_captures_user_timestamp ON page_captures(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_captures_user_type ON page_captures(user_id, type);

-- Quick Actions Indexes
CREATE INDEX IF NOT EXISTS idx_quick_actions_user_id ON quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_type ON quick_actions(type);
CREATE INDEX IF NOT EXISTS idx_quick_actions_enabled ON quick_actions(enabled);
CREATE INDEX IF NOT EXISTS idx_quick_actions_usage_count ON quick_actions(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_quick_actions_last_used ON quick_actions(last_used DESC);

-- Extension Features Indexes
CREATE INDEX IF NOT EXISTS idx_extension_features_user_id ON extension_features(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_features_type ON extension_features(type);
CREATE INDEX IF NOT EXISTS idx_extension_features_enabled ON extension_features(enabled);
CREATE INDEX IF NOT EXISTS idx_extension_features_is_premium ON extension_features(is_premium);
CREATE INDEX IF NOT EXISTS idx_extension_features_usage_stats ON extension_features USING GIN(usage_stats);

-- Browser Info Indexes
CREATE INDEX IF NOT EXISTS idx_browser_info_user_id ON browser_info(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_info_browser ON browser_info(browser);
CREATE INDEX IF NOT EXISTS idx_browser_info_is_installed ON browser_info(is_installed);
CREATE INDEX IF NOT EXISTS idx_browser_info_last_active ON browser_info(last_active DESC);

-- Keyboard Shortcuts Indexes
CREATE INDEX IF NOT EXISTS idx_keyboard_shortcuts_user_id ON keyboard_shortcuts(user_id);
CREATE INDEX IF NOT EXISTS idx_keyboard_shortcuts_scope ON keyboard_shortcuts(scope);
CREATE INDEX IF NOT EXISTS idx_keyboard_shortcuts_enabled ON keyboard_shortcuts(enabled);

-- Sync Settings Indexes
CREATE INDEX IF NOT EXISTS idx_sync_settings_user_id ON sync_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_settings_auto_sync ON sync_settings(auto_sync);
CREATE INDEX IF NOT EXISTS idx_sync_settings_last_sync ON sync_settings(last_sync DESC);

-- Capture Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_capture_analytics_capture_id ON capture_analytics(capture_id);
CREATE INDEX IF NOT EXISTS idx_capture_analytics_views ON capture_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_capture_analytics_last_viewed ON capture_analytics(last_viewed DESC);

-- Extension Statistics Indexes
CREATE INDEX IF NOT EXISTS idx_extension_statistics_user_id ON extension_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_extension_statistics_date ON extension_statistics(date DESC);
CREATE INDEX IF NOT EXISTS idx_extension_statistics_user_date ON extension_statistics(user_id, date DESC);

-- Capture Tags Indexes
CREATE INDEX IF NOT EXISTS idx_capture_tags_user_id ON capture_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_capture_tags_usage_count ON capture_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_capture_tags_name ON capture_tags USING GIN(name gin_trgm_ops);

-- Action History Indexes
CREATE INDEX IF NOT EXISTS idx_action_history_user_id ON action_history(user_id);
CREATE INDEX IF NOT EXISTS idx_action_history_action_id ON action_history(action_id);
CREATE INDEX IF NOT EXISTS idx_action_history_executed_at ON action_history(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_history_success ON action_history(success);

-- Sync History Indexes
CREATE INDEX IF NOT EXISTS idx_sync_history_user_id ON sync_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_history_started_at ON sync_history(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_history_status ON sync_history(status);

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
