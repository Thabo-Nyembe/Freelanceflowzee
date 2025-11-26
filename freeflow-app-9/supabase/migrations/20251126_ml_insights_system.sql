-- ============================================================================
-- ML Insights & Analytics System - Complete Database Schema
-- ============================================================================
-- Description: Production-ready machine learning insights and predictive analytics
-- Features:
--   - ML-powered insights and predictions
--   - Anomaly detection and alerts
--   - Trend analysis and forecasting
--   - Pattern recognition
--   - Actionable recommendations
--   - Model performance tracking
--   - Confidence scoring
--   - Impact assessment
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE insight_type AS ENUM (
  'trend',
  'anomaly',
  'forecast',
  'pattern',
  'recommendation',
  'alert'
);

CREATE TYPE insight_category AS ENUM (
  'revenue',
  'engagement',
  'performance',
  'retention',
  'quality',
  'growth'
);

CREATE TYPE confidence_level AS ENUM (
  'low',
  'medium',
  'high',
  'very-high'
);

CREATE TYPE impact_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE severity_level AS ENUM (
  'info',
  'warning',
  'error',
  'critical'
);

CREATE TYPE model_status AS ENUM (
  'training',
  'ready',
  'updating',
  'error'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ML Insights Table
CREATE TABLE ml_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight Info
  title TEXT NOT NULL,
  type insight_type NOT NULL,
  category insight_category NOT NULL,
  description TEXT NOT NULL,

  -- Confidence & Impact
  confidence confidence_level NOT NULL DEFAULT 'medium',
  impact impact_level NOT NULL DEFAULT 'medium',
  severity severity_level NOT NULL DEFAULT 'info',

  -- Actionability
  actionable BOOLEAN DEFAULT true,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Source
  data_source TEXT NOT NULL,
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_status model_status NOT NULL DEFAULT 'ready',

  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metrics
  accuracy DECIMAL(5, 2) DEFAULT 0,
  precision_score DECIMAL(5, 2) DEFAULT 0,
  recall_score DECIMAL(5, 2) DEFAULT 0,
  f1_score DECIMAL(5, 2) DEFAULT 0,

  -- Impact Estimation
  affected_users INTEGER,
  potential_revenue DECIMAL(12, 2),

  -- Priority
  priority INTEGER DEFAULT 5,

  -- Status
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,
  dismissed_reason TEXT,

  implemented BOOLEAN DEFAULT false,
  implemented_at TIMESTAMPTZ,
  implemented_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
  CONSTRAINT valid_precision CHECK (precision_score >= 0 AND precision_score <= 100),
  CONSTRAINT valid_recall CHECK (recall_score >= 0 AND recall_score <= 100),
  CONSTRAINT valid_f1 CHECK (f1_score >= 0 AND f1_score <= 100),
  CONSTRAINT valid_priority CHECK (priority >= 1 AND priority <= 10)
);

-- Trend Insights Table
CREATE TABLE trend_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ml_insights(id) ON DELETE CASCADE,

  -- Trend Data
  direction TEXT NOT NULL CHECK (direction IN ('up', 'down', 'stable')),
  percentage DECIMAL(5, 2) NOT NULL,

  -- Historical & Forecast
  historical_data DECIMAL[] DEFAULT ARRAY[]::DECIMAL[],
  forecast_data DECIMAL[] DEFAULT ARRAY[]::DECIMAL[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_insight UNIQUE (insight_id)
);

-- Anomaly Insights Table
CREATE TABLE anomaly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ml_insights(id) ON DELETE CASCADE,

  -- Anomaly Data
  expected_value DECIMAL(12, 2) NOT NULL,
  actual_value DECIMAL(12, 2) NOT NULL,
  deviation DECIMAL(5, 2) NOT NULL,
  threshold DECIMAL(5, 2) NOT NULL,
  detection_time TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_insight UNIQUE (insight_id)
);

-- Forecast Insights Table
CREATE TABLE forecast_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ml_insights(id) ON DELETE CASCADE,

  -- Forecast Data
  time_horizon INTEGER NOT NULL, -- days
  confidence_lower DECIMAL[] DEFAULT ARRAY[]::DECIMAL[],
  confidence_upper DECIMAL[] DEFAULT ARRAY[]::DECIMAL[],

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_insight UNIQUE (insight_id),
  CONSTRAINT valid_horizon CHECK (time_horizon > 0)
);

-- Forecast Points Table
CREATE TABLE forecast_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  forecast_id UUID NOT NULL REFERENCES forecast_insights(id) ON DELETE CASCADE,

  -- Point Data
  forecast_date TIMESTAMPTZ NOT NULL,
  predicted_value DECIMAL(12, 2) NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 100)
);

-- Pattern Insights Table
CREATE TABLE pattern_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ml_insights(id) ON DELETE CASCADE,

  -- Pattern Data
  pattern_type TEXT NOT NULL,
  frequency INTEGER NOT NULL,
  examples TEXT[] DEFAULT ARRAY[]::TEXT[],
  correlation DECIMAL(5, 2) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_insight UNIQUE (insight_id),
  CONSTRAINT valid_frequency CHECK (frequency > 0),
  CONSTRAINT valid_correlation CHECK (correlation >= -1 AND correlation <= 1)
);

-- ML Models Table
CREATE TABLE ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Model Info
  name TEXT NOT NULL,
  version TEXT NOT NULL,
  type TEXT NOT NULL,
  status model_status NOT NULL DEFAULT 'training',

  -- Performance
  accuracy DECIMAL(5, 2) NOT NULL DEFAULT 0,

  -- Training Info
  training_date TIMESTAMPTZ NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL,
  dataset_size INTEGER NOT NULL,

  -- Configuration
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  hyperparameters JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  description TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_accuracy CHECK (accuracy >= 0 AND accuracy <= 100),
  CONSTRAINT valid_dataset_size CHECK (dataset_size > 0),
  CONSTRAINT unique_user_model UNIQUE (user_id, name, version)
);

-- Model Training History Table
CREATE TABLE model_training_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,

  -- Training Session
  session_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Results
  accuracy DECIMAL(5, 2),
  loss DECIMAL(12, 6),
  validation_accuracy DECIMAL(5, 2),
  validation_loss DECIMAL(12, 6),

  -- Configuration
  epochs INTEGER,
  batch_size INTEGER,
  learning_rate DECIMAL(10, 8),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insight Feedback Table
CREATE TABLE insight_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_id UUID NOT NULL REFERENCES ml_insights(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback
  helpful BOOLEAN NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ML Insights Indexes
CREATE INDEX idx_ml_insights_user_id ON ml_insights(user_id);
CREATE INDEX idx_ml_insights_type ON ml_insights(type);
CREATE INDEX idx_ml_insights_category ON ml_insights(category);
CREATE INDEX idx_ml_insights_impact ON ml_insights(impact);
CREATE INDEX idx_ml_insights_severity ON ml_insights(severity);
CREATE INDEX idx_ml_insights_confidence ON ml_insights(confidence);
CREATE INDEX idx_ml_insights_priority ON ml_insights(priority);
CREATE INDEX idx_ml_insights_dismissed ON ml_insights(dismissed);
CREATE INDEX idx_ml_insights_implemented ON ml_insights(implemented);
CREATE INDEX idx_ml_insights_created_at ON ml_insights(created_at DESC);
CREATE INDEX idx_ml_insights_tags ON ml_insights USING gin(tags);
CREATE INDEX idx_ml_insights_user_type ON ml_insights(user_id, type);
CREATE INDEX idx_ml_insights_user_category ON ml_insights(user_id, category);
CREATE INDEX idx_ml_insights_actionable ON ml_insights(actionable) WHERE actionable = true;

-- Trend Insights Indexes
CREATE INDEX idx_trend_insights_insight_id ON trend_insights(insight_id);
CREATE INDEX idx_trend_insights_direction ON trend_insights(direction);

-- Anomaly Insights Indexes
CREATE INDEX idx_anomaly_insights_insight_id ON anomaly_insights(insight_id);
CREATE INDEX idx_anomaly_insights_detection_time ON anomaly_insights(detection_time DESC);

-- Forecast Insights Indexes
CREATE INDEX idx_forecast_insights_insight_id ON forecast_insights(insight_id);
CREATE INDEX idx_forecast_insights_horizon ON forecast_insights(time_horizon);

-- Forecast Points Indexes
CREATE INDEX idx_forecast_points_forecast_id ON forecast_points(forecast_id);
CREATE INDEX idx_forecast_points_date ON forecast_points(forecast_date);

-- Pattern Insights Indexes
CREATE INDEX idx_pattern_insights_insight_id ON pattern_insights(insight_id);
CREATE INDEX idx_pattern_insights_type ON pattern_insights(pattern_type);

-- ML Models Indexes
CREATE INDEX idx_ml_models_user_id ON ml_models(user_id);
CREATE INDEX idx_ml_models_status ON ml_models(status);
CREATE INDEX idx_ml_models_name ON ml_models(name);
CREATE INDEX idx_ml_models_type ON ml_models(type);
CREATE INDEX idx_ml_models_accuracy ON ml_models(accuracy DESC);
CREATE INDEX idx_ml_models_last_updated ON ml_models(last_updated DESC);

-- Model Training History Indexes
CREATE INDEX idx_model_training_history_model_id ON model_training_history(model_id);
CREATE INDEX idx_model_training_history_status ON model_training_history(status);
CREATE INDEX idx_model_training_history_started_at ON model_training_history(started_at DESC);

-- Insight Feedback Indexes
CREATE INDEX idx_insight_feedback_insight_id ON insight_feedback(insight_id);
CREATE INDEX idx_insight_feedback_user_id ON insight_feedback(user_id);
CREATE INDEX idx_insight_feedback_helpful ON insight_feedback(helpful);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE ml_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE trend_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomaly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE insight_feedback ENABLE ROW LEVEL SECURITY;

-- ML Insights Policies
CREATE POLICY "Users can view own insights"
  ON ml_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights"
  ON ml_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON ml_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
  ON ml_insights FOR DELETE
  USING (auth.uid() = user_id);

-- Trend Insights Policies
CREATE POLICY "Users can view trend insights for their insights"
  ON trend_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create trend insights for their insights"
  ON trend_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

-- Anomaly Insights Policies
CREATE POLICY "Users can view anomaly insights for their insights"
  ON anomaly_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create anomaly insights for their insights"
  ON anomaly_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

-- Forecast Insights Policies
CREATE POLICY "Users can view forecast insights for their insights"
  ON forecast_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create forecast insights for their insights"
  ON forecast_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

-- Forecast Points Policies
CREATE POLICY "Users can view forecast points for their forecasts"
  ON forecast_points FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM forecast_insights fi
      JOIN ml_insights mi ON fi.insight_id = mi.id
      WHERE fi.id = forecast_id AND mi.user_id = auth.uid()
    )
  );

-- Pattern Insights Policies
CREATE POLICY "Users can view pattern insights for their insights"
  ON pattern_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create pattern insights for their insights"
  ON pattern_insights FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    )
  );

-- ML Models Policies
CREATE POLICY "Users can view own models"
  ON ml_models FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own models"
  ON ml_models FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own models"
  ON ml_models FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Model Training History Policies
CREATE POLICY "Users can view training history for their models"
  ON model_training_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_models
      WHERE id = model_id AND user_id = auth.uid()
    )
  );

-- Insight Feedback Policies
CREATE POLICY "Users can view feedback for their insights"
  ON insight_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ml_insights
      WHERE id = insight_id AND user_id = auth.uid()
    ) OR
    auth.uid() = user_id
  );

CREATE POLICY "Users can create feedback"
  ON insight_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

CREATE TRIGGER update_ml_insights_updated_at BEFORE UPDATE ON ml_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ml_models_updated_at BEFORE UPDATE ON ml_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Set dismissed timestamp
CREATE OR REPLACE FUNCTION set_dismissed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.dismissed = true AND OLD.dismissed = false THEN
    NEW.dismissed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_dismissed_timestamp
  BEFORE UPDATE OF dismissed ON ml_insights
  FOR EACH ROW
  EXECUTE FUNCTION set_dismissed_timestamp();

-- Set implemented timestamp
CREATE OR REPLACE FUNCTION set_implemented_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.implemented = true AND OLD.implemented = false THEN
    NEW.implemented_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_implemented_timestamp
  BEFORE UPDATE OF implemented ON ml_insights
  FOR EACH ROW
  EXECUTE FUNCTION set_implemented_timestamp();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get total insights count for user
CREATE OR REPLACE FUNCTION get_total_insights_count(
  user_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM ml_insights
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get active insights count (not dismissed, not implemented)
CREATE OR REPLACE FUNCTION get_active_insights_count(
  user_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM ml_insights
  WHERE user_id = user_uuid
    AND dismissed = false
    AND implemented = false;
$$ LANGUAGE sql STABLE;

-- Get insights by priority
CREATE OR REPLACE FUNCTION get_insights_by_priority(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  type insight_type,
  category insight_category,
  impact impact_level,
  priority INTEGER
) AS $$
  SELECT
    id,
    title,
    type,
    category,
    impact,
    priority
  FROM ml_insights
  WHERE user_id = user_uuid
    AND dismissed = false
    AND implemented = false
  ORDER BY priority ASC, created_at DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Get critical insights
CREATE OR REPLACE FUNCTION get_critical_insights(
  user_uuid UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  impact impact_level,
  severity severity_level
) AS $$
  SELECT
    id,
    title,
    description,
    impact,
    severity
  FROM ml_insights
  WHERE user_id = user_uuid
    AND dismissed = false
    AND (impact = 'critical' OR severity = 'critical')
  ORDER BY created_at DESC;
$$ LANGUAGE sql STABLE;

-- Get insight statistics
CREATE OR REPLACE FUNCTION get_insight_statistics(
  user_uuid UUID
)
RETURNS TABLE (
  total_insights INTEGER,
  active_insights INTEGER,
  dismissed_insights INTEGER,
  implemented_insights INTEGER,
  average_confidence DECIMAL,
  average_accuracy DECIMAL
) AS $$
  SELECT
    COUNT(*)::INTEGER as total_insights,
    COUNT(*) FILTER (WHERE dismissed = false AND implemented = false)::INTEGER as active_insights,
    COUNT(*) FILTER (WHERE dismissed = true)::INTEGER as dismissed_insights,
    COUNT(*) FILTER (WHERE implemented = true)::INTEGER as implemented_insights,
    CASE
      WHEN COUNT(*) > 0 THEN
        AVG(CASE confidence
          WHEN 'low' THEN 25
          WHEN 'medium' THEN 50
          WHEN 'high' THEN 75
          WHEN 'very-high' THEN 95
        END)
      ELSE 0
    END as average_confidence,
    COALESCE(AVG(accuracy), 0) as average_accuracy
  FROM ml_insights
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Search insights
CREATE OR REPLACE FUNCTION search_insights(
  user_uuid UUID,
  search_query TEXT
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type insight_type,
  category insight_category,
  rank REAL
) AS $$
  SELECT
    i.id,
    i.title,
    i.description,
    i.type,
    i.category,
    ts_rank(
      to_tsvector('english', i.title || ' ' || i.description || ' ' || array_to_string(i.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM ml_insights i
  WHERE i.user_id = user_uuid
    AND (
      to_tsvector('english', i.title || ' ' || i.description || ' ' || array_to_string(i.tags, ' '))
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE ml_insights IS 'Machine learning insights and predictions';
COMMENT ON TABLE trend_insights IS 'Trend analysis data for ML insights';
COMMENT ON TABLE anomaly_insights IS 'Anomaly detection data for ML insights';
COMMENT ON TABLE forecast_insights IS 'Forecast predictions for ML insights';
COMMENT ON TABLE forecast_points IS 'Individual forecast data points';
COMMENT ON TABLE pattern_insights IS 'Pattern recognition data for ML insights';
COMMENT ON TABLE ml_models IS 'Machine learning models and their configurations';
COMMENT ON TABLE model_training_history IS 'Training history for ML models';
COMMENT ON TABLE insight_feedback IS 'User feedback on ML insights';
