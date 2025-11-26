-- ============================================================================
-- AI ENHANCED SYSTEM - SUPABASE MIGRATION
-- Complete AI tools management with analytics and workflows
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE ai_tool_type AS ENUM (
  'text',
  'image',
  'audio',
  'video',
  'code',
  'data',
  'assistant',
  'automation'
);

CREATE TYPE ai_tool_category AS ENUM (
  'content',
  'design',
  'development',
  'analytics',
  'productivity',
  'creative'
);

CREATE TYPE ai_tool_status AS ENUM (
  'active',
  'inactive',
  'training',
  'maintenance'
);

CREATE TYPE pricing_tier AS ENUM (
  'free',
  'basic',
  'pro',
  'enterprise'
);

CREATE TYPE performance_level AS ENUM (
  'excellent',
  'good',
  'fair',
  'poor'
);

CREATE TYPE provider_status AS ENUM (
  'active',
  'inactive',
  'deprecated'
);

-- ============================================================================
-- TABLE: ai_tools
-- ============================================================================

CREATE TABLE ai_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  category ai_tool_category NOT NULL,
  description TEXT NOT NULL,
  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  status ai_tool_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'free',
  performance performance_level NOT NULL DEFAULT 'good',
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 4) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 1),
  avg_response_time DECIMAL(10, 2) DEFAULT 0,
  cost_per_use DECIMAL(10, 4) DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  version TEXT NOT NULL,
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  limits JSONB DEFAULT '{}'::JSONB,
  config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: ai_tool_usage
-- ============================================================================

CREATE TABLE ai_tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  input_size INTEGER DEFAULT 0,
  output_size INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_providers
-- ============================================================================

CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  website TEXT,
  api_key_required BOOLEAN DEFAULT true,
  supported_types ai_tool_type[] DEFAULT ARRAY[]::ai_tool_type[],
  status provider_status NOT NULL DEFAULT 'active',
  pricing_tier pricing_tier NOT NULL DEFAULT 'pro',
  cost_per_request DECIMAL(10, 4) DEFAULT 0,
  cost_per_token DECIMAL(10, 6),
  rate_limit INTEGER DEFAULT 1000,
  quota_limit INTEGER DEFAULT 100000,
  reliability INTEGER DEFAULT 95 CHECK (reliability >= 0 AND reliability <= 100),
  avg_response_time DECIMAL(10, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_models
-- ============================================================================

CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type ai_tool_type NOT NULL,
  version TEXT NOT NULL,
  capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
  parameters BIGINT,
  context_window INTEGER,
  max_tokens INTEGER,
  input_cost DECIMAL(10, 6),
  output_cost DECIMAL(10, 6),
  quality performance_level NOT NULL DEFAULT 'good',
  speed INTEGER DEFAULT 50 CHECK (speed >= 0 AND speed <= 100),
  accuracy INTEGER DEFAULT 80 CHECK (accuracy >= 0 AND accuracy <= 100),
  is_multimodal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_tool_metrics
-- ============================================================================

CREATE TABLE ai_tool_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_usage INTEGER DEFAULT 0,
  successful_usage INTEGER DEFAULT 0,
  failed_usage INTEGER DEFAULT 0,
  total_cost DECIMAL(12, 2) DEFAULT 0,
  avg_response_time DECIMAL(10, 2) DEFAULT 0,
  avg_success_rate DECIMAL(5, 4) DEFAULT 0,
  peak_usage_time TIMESTAMPTZ,
  most_common_error TEXT,
  user_satisfaction INTEGER DEFAULT 0 CHECK (user_satisfaction >= 0 AND user_satisfaction <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_workflows
-- ============================================================================

CREATE TABLE ai_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tools UUID[] DEFAULT ARRAY[]::UUID[],
  triggers TEXT[] DEFAULT ARRAY[]::TEXT[],
  schedule TEXT,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed TIMESTAMPTZ,
  avg_execution_time INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_workflow_steps
-- ============================================================================

CREATE TABLE ai_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  input JSONB DEFAULT '{}'::JSONB,
  output JSONB DEFAULT '{}'::JSONB,
  condition TEXT,
  on_error TEXT DEFAULT 'stop' CHECK (on_error IN ('stop', 'continue', 'retry')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ai_tool_favorites
-- ============================================================================

CREATE TABLE ai_tool_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tool_id)
);

-- ============================================================================
-- TABLE: ai_tool_reviews
-- ============================================================================

CREATE TABLE ai_tool_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  pros TEXT[] DEFAULT ARRAY[]::TEXT[],
  cons TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_tools indexes
CREATE INDEX idx_ai_tools_user_id ON ai_tools(user_id);
CREATE INDEX idx_ai_tools_type ON ai_tools(type);
CREATE INDEX idx_ai_tools_category ON ai_tools(category);
CREATE INDEX idx_ai_tools_status ON ai_tools(status);
CREATE INDEX idx_ai_tools_provider ON ai_tools(provider);
CREATE INDEX idx_ai_tools_pricing_tier ON ai_tools(pricing_tier);
CREATE INDEX idx_ai_tools_performance ON ai_tools(performance);
CREATE INDEX idx_ai_tools_is_popular ON ai_tools(is_popular);
CREATE INDEX idx_ai_tools_is_favorite ON ai_tools(is_favorite);
CREATE INDEX idx_ai_tools_usage_count ON ai_tools(usage_count DESC);
CREATE INDEX idx_ai_tools_success_rate ON ai_tools(success_rate DESC);
CREATE INDEX idx_ai_tools_tags ON ai_tools USING gin(tags);
CREATE INDEX idx_ai_tools_name_trgm ON ai_tools USING gin(name gin_trgm_ops);

-- ai_tool_usage indexes
CREATE INDEX idx_ai_tool_usage_tool_id ON ai_tool_usage(tool_id);
CREATE INDEX idx_ai_tool_usage_user_id ON ai_tool_usage(user_id);
CREATE INDEX idx_ai_tool_usage_timestamp ON ai_tool_usage(timestamp DESC);
CREATE INDEX idx_ai_tool_usage_success ON ai_tool_usage(success);

-- ai_providers indexes
CREATE INDEX idx_ai_providers_name ON ai_providers(name);
CREATE INDEX idx_ai_providers_status ON ai_providers(status);
CREATE INDEX idx_ai_providers_reliability ON ai_providers(reliability DESC);

-- ai_models indexes
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_type ON ai_models(type);
CREATE INDEX idx_ai_models_quality ON ai_models(quality);

-- ai_tool_metrics indexes
CREATE INDEX idx_ai_tool_metrics_tool_id ON ai_tool_metrics(tool_id);
CREATE INDEX idx_ai_tool_metrics_period ON ai_tool_metrics(period);
CREATE INDEX idx_ai_tool_metrics_period_start ON ai_tool_metrics(period_start DESC);

-- ai_workflows indexes
CREATE INDEX idx_ai_workflows_user_id ON ai_workflows(user_id);
CREATE INDEX idx_ai_workflows_is_active ON ai_workflows(is_active);
CREATE INDEX idx_ai_workflows_execution_count ON ai_workflows(execution_count DESC);

-- ai_workflow_steps indexes
CREATE INDEX idx_ai_workflow_steps_workflow_id ON ai_workflow_steps(workflow_id);
CREATE INDEX idx_ai_workflow_steps_tool_id ON ai_workflow_steps(tool_id);
CREATE INDEX idx_ai_workflow_steps_order ON ai_workflow_steps(step_order);

-- ai_tool_favorites indexes
CREATE INDEX idx_ai_tool_favorites_user_id ON ai_tool_favorites(user_id);
CREATE INDEX idx_ai_tool_favorites_tool_id ON ai_tool_favorites(tool_id);

-- ai_tool_reviews indexes
CREATE INDEX idx_ai_tool_reviews_tool_id ON ai_tool_reviews(tool_id);
CREATE INDEX idx_ai_tool_reviews_user_id ON ai_tool_reviews(user_id);
CREATE INDEX idx_ai_tool_reviews_rating ON ai_tool_reviews(rating DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ai_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_reviews ENABLE ROW LEVEL SECURITY;

-- ai_tools policies
CREATE POLICY "Users can view their own tools"
  ON ai_tools FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tools"
  ON ai_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tools"
  ON ai_tools FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tools"
  ON ai_tools FOR DELETE
  USING (auth.uid() = user_id);

-- ai_tool_usage policies
CREATE POLICY "Users can view their own usage"
  ON ai_tool_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own usage"
  ON ai_tool_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ai_providers policies
CREATE POLICY "Anyone can view providers"
  ON ai_providers FOR SELECT
  TO authenticated
  USING (true);

-- ai_models policies
CREATE POLICY "Anyone can view models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (true);

-- ai_tool_metrics policies
CREATE POLICY "Users can view metrics for their tools"
  ON ai_tool_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_tools
    WHERE ai_tools.id = ai_tool_metrics.tool_id
    AND ai_tools.user_id = auth.uid()
  ));

-- ai_workflows policies
CREATE POLICY "Users can manage their own workflows"
  ON ai_workflows FOR ALL
  USING (auth.uid() = user_id);

-- ai_workflow_steps policies
CREATE POLICY "Users can manage steps for their workflows"
  ON ai_workflow_steps FOR ALL
  USING (EXISTS (
    SELECT 1 FROM ai_workflows
    WHERE ai_workflows.id = ai_workflow_steps.workflow_id
    AND ai_workflows.user_id = auth.uid()
  ));

-- ai_tool_favorites policies
CREATE POLICY "Users can manage their own favorites"
  ON ai_tool_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ai_tool_reviews policies
CREATE POLICY "Anyone can view reviews"
  ON ai_tool_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON ai_tool_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON ai_tool_reviews FOR UPDATE
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

CREATE TRIGGER update_ai_tools_updated_at
  BEFORE UPDATE ON ai_tools
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_workflows_updated_at
  BEFORE UPDATE ON ai_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update tool usage statistics
CREATE OR REPLACE FUNCTION update_tool_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_tools
  SET
    usage_count = usage_count + 1,
    last_used = NEW.timestamp,
    total_cost = total_cost + NEW.cost
  WHERE id = NEW.tool_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tool_usage_stats
  AFTER INSERT ON ai_tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_usage_stats();

-- Update tool success rate
CREATE OR REPLACE FUNCTION update_tool_success_rate()
RETURNS TRIGGER AS $$
DECLARE
  v_total_usage INTEGER;
  v_successful_usage INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE success = true)
  INTO v_total_usage, v_successful_usage
  FROM ai_tool_usage
  WHERE tool_id = NEW.tool_id;

  IF v_total_usage > 0 THEN
    UPDATE ai_tools
    SET success_rate = v_successful_usage::DECIMAL / v_total_usage::DECIMAL
    WHERE id = NEW.tool_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tool_success_rate
  AFTER INSERT ON ai_tool_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_success_rate();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get tool performance score
CREATE OR REPLACE FUNCTION get_tool_performance_score(p_tool_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_tool RECORD;
  v_performance_score INTEGER;
  v_success_score INTEGER;
  v_response_score INTEGER;
  v_usage_score INTEGER;
  v_total_score INTEGER;
BEGIN
  SELECT * INTO v_tool FROM ai_tools WHERE id = p_tool_id;

  -- Performance weight: 30%
  v_performance_score := CASE v_tool.performance
    WHEN 'excellent' THEN 30
    WHEN 'good' THEN 22
    WHEN 'fair' THEN 15
    WHEN 'poor' THEN 7
  END;

  -- Success rate weight: 30%
  v_success_score := ROUND(v_tool.success_rate * 30);

  -- Response time weight: 20%
  v_response_score := GREATEST(0, ROUND(20 - (v_tool.avg_response_time * 4)));

  -- Usage weight: 20%
  v_usage_score := LEAST(20, ROUND(v_tool.usage_count::DECIMAL / 100 * 20));

  v_total_score := v_performance_score + v_success_score + v_response_score + v_usage_score;

  RETURN v_total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recommended tools
CREATE OR REPLACE FUNCTION get_recommended_tools(
  p_user_id UUID,
  p_type ai_tool_type DEFAULT NULL,
  p_category ai_tool_category DEFAULT NULL,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type ai_tool_type,
  performance_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.type,
    get_tool_performance_score(t.id) as performance_score
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND t.status = 'active'
  AND (p_type IS NULL OR t.type = p_type)
  AND (p_category IS NULL OR t.category = p_category)
  ORDER BY performance_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get tool statistics
CREATE OR REPLACE FUNCTION get_tool_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_tools', COUNT(*),
      'active_tools', COUNT(*) FILTER (WHERE status = 'active'),
      'total_usage', COALESCE(SUM(usage_count), 0),
      'total_cost', COALESCE(SUM(total_cost), 0),
      'avg_success_rate', COALESCE(AVG(success_rate), 0),
      'avg_response_time', COALESCE(AVG(avg_response_time), 0),
      'popular_tools', COUNT(*) FILTER (WHERE is_popular = true),
      'favorite_tools', COUNT(*) FILTER (WHERE is_favorite = true)
    )
    FROM ai_tools
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search AI tools
CREATE OR REPLACE FUNCTION search_ai_tools(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type ai_tool_type,
  category ai_tool_category,
  provider TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.type,
    t.category,
    t.provider
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND (
    t.name ILIKE '%' || p_search_term || '%'
    OR t.description ILIKE '%' || p_search_term || '%'
    OR t.provider ILIKE '%' || p_search_term || '%'
    OR t.model ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(t.tags)
  )
  ORDER BY t.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most cost-effective tools
CREATE OR REPLACE FUNCTION get_cost_effective_tools(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  cost_efficiency DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    CASE
      WHEN t.total_cost > 0 THEN (t.success_rate * t.usage_count) / t.total_cost
      ELSE 0
    END as cost_efficiency
  FROM ai_tools t
  WHERE t.user_id = p_user_id
  AND t.status = 'active'
  ORDER BY cost_efficiency DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate tool metrics for period
CREATE OR REPLACE FUNCTION calculate_tool_metrics(
  p_tool_id UUID,
  p_period TEXT,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS VOID AS $$
DECLARE
  v_total INTEGER;
  v_successful INTEGER;
  v_failed INTEGER;
  v_total_cost DECIMAL;
  v_avg_response DECIMAL;
BEGIN
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE success = true),
    COUNT(*) FILTER (WHERE success = false),
    COALESCE(SUM(cost), 0),
    COALESCE(AVG(duration), 0)
  INTO v_total, v_successful, v_failed, v_total_cost, v_avg_response
  FROM ai_tool_usage
  WHERE tool_id = p_tool_id
  AND timestamp BETWEEN p_start_date AND p_end_date;

  INSERT INTO ai_tool_metrics (
    tool_id,
    period,
    period_start,
    period_end,
    total_usage,
    successful_usage,
    failed_usage,
    total_cost,
    avg_response_time
  ) VALUES (
    p_tool_id,
    p_period,
    p_start_date,
    p_end_date,
    v_total,
    v_successful,
    v_failed,
    v_total_cost,
    v_avg_response
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
