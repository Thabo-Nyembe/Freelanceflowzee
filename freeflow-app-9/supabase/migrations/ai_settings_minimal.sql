-- Minimal AI Settings Schema
--
-- AI provider management with API keys, model configuration, usage tracking, and cost monitoring:
-- - AI Providers with API keys and connection status
-- - AI Models with pricing and capabilities
-- - AI Features configuration
-- - Usage Records for tracking
-- - API Keys secure storage
-- - Usage Stats aggregation

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS ai_provider_type CASCADE;
DROP TYPE IF EXISTS provider_status CASCADE;
DROP TYPE IF EXISTS model_capability CASCADE;
DROP TYPE IF EXISTS usage_status CASCADE;

-- AI Provider types
CREATE TYPE ai_provider_type AS ENUM (
  'openai',
  'anthropic',
  'google',
  'replicate',
  'huggingface',
  'cohere',
  'mistral'
);

-- Provider connection status
CREATE TYPE provider_status AS ENUM (
  'connected',
  'disconnected',
  'testing',
  'error'
);

-- Model capabilities
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

-- Usage record status
CREATE TYPE usage_status AS ENUM (
  'success',
  'error',
  'timeout'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_usage_stats CASCADE;
DROP TABLE IF EXISTS ai_api_keys CASCADE;
DROP TABLE IF EXISTS ai_usage_records CASCADE;
DROP TABLE IF EXISTS ai_features CASCADE;
DROP TABLE IF EXISTS ai_models CASCADE;
DROP TABLE IF EXISTS ai_providers CASCADE;

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
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_providers indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_providers_type ON ai_providers(type);
CREATE INDEX IF NOT EXISTS idx_ai_providers_status ON ai_providers(status);
CREATE INDEX IF NOT EXISTS idx_ai_providers_is_enabled ON ai_providers(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_providers_total_cost ON ai_providers(total_cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_providers_total_requests ON ai_providers(total_requests DESC);
CREATE INDEX IF NOT EXISTS idx_ai_providers_created_at ON ai_providers(created_at DESC);

-- ai_models indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_provider_id ON ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_default ON ai_models(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_deprecated ON ai_models(is_deprecated);
CREATE INDEX IF NOT EXISTS idx_ai_models_capabilities ON ai_models USING gin(capabilities);
CREATE INDEX IF NOT EXISTS idx_ai_models_created_at ON ai_models(created_at DESC);

-- ai_features indexes
CREATE INDEX IF NOT EXISTS idx_ai_features_user_id ON ai_features(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_provider_id ON ai_features(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_model_id ON ai_features(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_features_is_enabled ON ai_features(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_features_usage_count ON ai_features(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_ai_features_last_used ON ai_features(last_used DESC);
CREATE INDEX IF NOT EXISTS idx_ai_features_created_at ON ai_features(created_at DESC);

-- ai_usage_records indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_user_id ON ai_usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_provider_id ON ai_usage_records(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_model_id ON ai_usage_records(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_feature_id ON ai_usage_records(feature_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_status ON ai_usage_records(status);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_timestamp ON ai_usage_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_cost ON ai_usage_records(cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_records_total_tokens ON ai_usage_records(total_tokens DESC);

-- ai_api_keys indexes
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_user_id ON ai_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_provider_id ON ai_api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_is_active ON ai_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_created_at ON ai_api_keys(created_at DESC);

-- ai_usage_stats indexes
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_date ON ai_usage_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_total_cost ON ai_usage_stats(total_cost DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_created_at ON ai_usage_stats(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

CREATE TRIGGER trigger_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

CREATE TRIGGER trigger_ai_features_updated_at
  BEFORE UPDATE ON ai_features
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

CREATE TRIGGER trigger_ai_api_keys_updated_at
  BEFORE UPDATE ON ai_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

CREATE TRIGGER trigger_ai_usage_stats_updated_at
  BEFORE UPDATE ON ai_usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();

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
    updated_at = now()
  WHERE id = NEW.provider_id;

  -- Update feature stats
  IF NEW.feature_id IS NOT NULL THEN
    UPDATE ai_features
    SET
      usage_count = usage_count + 1,
      last_used = NEW.timestamp,
      updated_at = now()
    WHERE id = NEW.feature_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_ai_usage
  AFTER INSERT ON ai_usage_records
  FOR EACH ROW
  EXECUTE FUNCTION track_ai_usage();
