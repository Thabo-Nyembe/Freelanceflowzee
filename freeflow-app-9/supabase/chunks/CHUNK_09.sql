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

DROP TYPE IF EXISTS insight_type CASCADE;
CREATE TYPE insight_type AS ENUM (
  'trend',
  'anomaly',
  'forecast',
  'pattern',
  'recommendation',
  'alert'
);

DROP TYPE IF EXISTS insight_category CASCADE;
CREATE TYPE insight_category AS ENUM (
  'revenue',
  'engagement',
  'performance',
  'retention',
  'quality',
  'growth'
);

DROP TYPE IF EXISTS confidence_level CASCADE;
CREATE TYPE confidence_level AS ENUM (
  'low',
  'medium',
  'high',
  'very-high'
);

DROP TYPE IF EXISTS impact_level CASCADE;
CREATE TYPE impact_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

DROP TYPE IF EXISTS severity_level CASCADE;
CREATE TYPE severity_level AS ENUM (
  'info',
  'warning',
  'error',
  'critical'
);

DROP TYPE IF EXISTS model_status CASCADE;
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
CREATE TABLE IF NOT EXISTS ml_insights (
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
CREATE TABLE IF NOT EXISTS trend_insights (
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
CREATE TABLE IF NOT EXISTS anomaly_insights (
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
CREATE TABLE IF NOT EXISTS forecast_insights (
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
CREATE TABLE IF NOT EXISTS forecast_points (
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
CREATE TABLE IF NOT EXISTS pattern_insights (
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
CREATE TABLE IF NOT EXISTS ml_models (
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
CREATE TABLE IF NOT EXISTS model_training_history (
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
CREATE TABLE IF NOT EXISTS insight_feedback (
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
CREATE INDEX IF NOT EXISTS idx_ml_insights_user_id ON ml_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_insights_type ON ml_insights(type);
CREATE INDEX IF NOT EXISTS idx_ml_insights_category ON ml_insights(category);
CREATE INDEX IF NOT EXISTS idx_ml_insights_impact ON ml_insights(impact);
CREATE INDEX IF NOT EXISTS idx_ml_insights_severity ON ml_insights(severity);
CREATE INDEX IF NOT EXISTS idx_ml_insights_confidence ON ml_insights(confidence);
CREATE INDEX IF NOT EXISTS idx_ml_insights_priority ON ml_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ml_insights_dismissed ON ml_insights(dismissed);
CREATE INDEX IF NOT EXISTS idx_ml_insights_implemented ON ml_insights(implemented);
CREATE INDEX IF NOT EXISTS idx_ml_insights_created_at ON ml_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ml_insights_tags ON ml_insights USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_ml_insights_user_type ON ml_insights(user_id, type);
CREATE INDEX IF NOT EXISTS idx_ml_insights_user_category ON ml_insights(user_id, category);
CREATE INDEX IF NOT EXISTS idx_ml_insights_actionable ON ml_insights(actionable) WHERE actionable = true;

-- Trend Insights Indexes
CREATE INDEX IF NOT EXISTS idx_trend_insights_insight_id ON trend_insights(insight_id);
CREATE INDEX IF NOT EXISTS idx_trend_insights_direction ON trend_insights(direction);

-- Anomaly Insights Indexes
CREATE INDEX IF NOT EXISTS idx_anomaly_insights_insight_id ON anomaly_insights(insight_id);
CREATE INDEX IF NOT EXISTS idx_anomaly_insights_detection_time ON anomaly_insights(detection_time DESC);

-- Forecast Insights Indexes
CREATE INDEX IF NOT EXISTS idx_forecast_insights_insight_id ON forecast_insights(insight_id);
CREATE INDEX IF NOT EXISTS idx_forecast_insights_horizon ON forecast_insights(time_horizon);

-- Forecast Points Indexes
CREATE INDEX IF NOT EXISTS idx_forecast_points_forecast_id ON forecast_points(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_points_date ON forecast_points(forecast_date);

-- Pattern Insights Indexes
CREATE INDEX IF NOT EXISTS idx_pattern_insights_insight_id ON pattern_insights(insight_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_type ON pattern_insights(pattern_type);

-- ML Models Indexes
CREATE INDEX IF NOT EXISTS idx_ml_models_user_id ON ml_models(user_id);
CREATE INDEX IF NOT EXISTS idx_ml_models_status ON ml_models(status);
CREATE INDEX IF NOT EXISTS idx_ml_models_name ON ml_models(name);
CREATE INDEX IF NOT EXISTS idx_ml_models_type ON ml_models(type);
CREATE INDEX IF NOT EXISTS idx_ml_models_accuracy ON ml_models(accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_ml_models_last_updated ON ml_models(last_updated DESC);

-- Model Training History Indexes
CREATE INDEX IF NOT EXISTS idx_model_training_history_model_id ON model_training_history(model_id);
CREATE INDEX IF NOT EXISTS idx_model_training_history_status ON model_training_history(status);
CREATE INDEX IF NOT EXISTS idx_model_training_history_started_at ON model_training_history(started_at DESC);

-- Insight Feedback Indexes
CREATE INDEX IF NOT EXISTS idx_insight_feedback_insight_id ON insight_feedback(insight_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_user_id ON insight_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_insight_feedback_helpful ON insight_feedback(helpful);

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
-- ============================================================================
-- Notifications System - Production Database Schema
-- ============================================================================
-- Comprehensive notification management with real-time updates, multi-channel
-- delivery, preferences, templates, and delivery tracking
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS notification_type CASCADE;
CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error', 'payment', 'project',
  'message', 'system', 'review', 'deadline', 'collaboration', 'file', 'invoice'
);

DROP TYPE IF EXISTS notification_priority CASCADE;
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
DROP TYPE IF EXISTS notification_channel CASCADE;
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms', 'webhook');
DROP TYPE IF EXISTS notification_status CASCADE;
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived', 'deleted');
DROP TYPE IF EXISTS delivery_status CASCADE;
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
DROP TYPE IF EXISTS notification_frequency CASCADE;
CREATE TYPE notification_frequency AS ENUM ('instant', 'hourly', 'daily', 'weekly');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  priority notification_priority NOT NULL DEFAULT 'medium',
  status notification_status NOT NULL DEFAULT 'unread',
  category TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  avatar TEXT,
  image_url TEXT,
  metadata JSONB DEFAULT '{}',
  related_id UUID,
  related_type TEXT,
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  channels notification_channel[] DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sound_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  show_previews BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  frequency notification_frequency NOT NULL DEFAULT 'instant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Notification Deliveries
CREATE TABLE IF NOT EXISTS notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel notification_channel NOT NULL,
  status delivery_status NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type notification_type NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  default_priority notification_priority NOT NULL DEFAULT 'medium',
  channels notification_channel[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Stats
CREATE TABLE IF NOT EXISTS notification_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_received INTEGER NOT NULL DEFAULT 0,
  total_read INTEGER NOT NULL DEFAULT 0,
  total_unread INTEGER NOT NULL DEFAULT 0,
  total_archived INTEGER NOT NULL DEFAULT 0,
  average_read_time INTEGER NOT NULL DEFAULT 0, -- minutes
  most_common_type notification_type,
  read_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  response_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  last_notification_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Groups
CREATE TABLE IF NOT EXISTS notification_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type notification_type,
  icon TEXT,
  color TEXT,
  notification_ids UUID[] DEFAULT '{}',
  is_expanded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bulk Actions Log
CREATE TABLE IF NOT EXISTS notification_bulk_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('read', 'unread', 'archive', 'delete')),
  notification_ids UUID[] NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_related ON notifications(related_id, related_type);
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON notifications USING GIN(metadata);

-- Notification Preferences indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Notification Deliveries indexes
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_created_at ON notification_deliveries(created_at DESC);

-- Notification Templates indexes
CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_is_active ON notification_templates(is_active);

-- Notification Stats indexes
CREATE INDEX IF NOT EXISTS idx_notification_stats_user_id ON notification_stats(user_id);

-- Notification Groups indexes
CREATE INDEX IF NOT EXISTS idx_notification_groups_user_id ON notification_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_groups_type ON notification_groups(type);

-- Bulk Actions indexes
CREATE INDEX IF NOT EXISTS idx_notification_bulk_actions_user_id ON notification_bulk_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_bulk_actions_created_at ON notification_bulk_actions(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_deliveries_updated_at
  BEFORE UPDATE ON notification_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_stats_updated_at
  BEFORE UPDATE ON notification_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_groups_updated_at
  BEFORE UPDATE ON notification_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on notification changes
CREATE OR REPLACE FUNCTION update_notification_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update stats
  INSERT INTO notification_stats (
    user_id,
    total_received,
    total_read,
    total_unread,
    total_archived,
    last_notification_at
  )
  SELECT
    user_id,
    COUNT(*) as total_received,
    COUNT(*) FILTER (WHERE status = 'read') as total_read,
    COUNT(*) FILTER (WHERE status = 'unread') as total_unread,
    COUNT(*) FILTER (WHERE status = 'archived') as total_archived,
    MAX(created_at) as last_notification_at
  FROM notifications
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
  GROUP BY user_id
  ON CONFLICT (user_id) DO UPDATE SET
    total_received = EXCLUDED.total_received,
    total_read = EXCLUDED.total_read,
    total_unread = EXCLUDED.total_unread,
    total_archived = EXCLUDED.total_archived,
    last_notification_at = EXCLUDED.last_notification_at,
    read_rate = CASE
      WHEN EXCLUDED.total_received > 0
      THEN ROUND((EXCLUDED.total_read::DECIMAL / EXCLUDED.total_received) * 100)
      ELSE 0
    END,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_notification_change
  AFTER INSERT OR UPDATE OR DELETE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_stats();

-- Auto-mark as read when read_at is set
CREATE OR REPLACE FUNCTION auto_mark_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read_at IS NOT NULL AND (OLD.read_at IS NULL OR OLD.read_at != NEW.read_at) THEN
    NEW.status := 'read';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_mark_read_trigger
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION auto_mark_read();

-- Auto-clean expired notifications
CREATE OR REPLACE FUNCTION clean_expired_notifications()
RETURNS void AS $$
BEGIN
  UPDATE notifications
  SET status = 'deleted', deleted_at = NOW()
  WHERE expires_at IS NOT NULL AND expires_at < NOW() AND status != 'deleted';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user notifications with filters
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id UUID,
  p_status notification_status DEFAULT NULL,
  p_type notification_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  message TEXT,
  type notification_type,
  priority notification_priority,
  status notification_status,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.priority, n.status, n.created_at
  FROM notifications n
  WHERE n.user_id = p_user_id
    AND (p_status IS NULL OR n.status = p_status)
    AND (p_type IS NULL OR n.type = p_type)
    AND n.status != 'deleted'
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_as_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET status = 'read', read_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id AND status = 'unread';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Archive old notifications
CREATE OR REPLACE FUNCTION archive_old_notifications(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET status = 'archived', archived_at = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id
    AND status = 'read'
    AND created_at < NOW() - (p_days || ' days')::INTERVAL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Get notification counts by type
CREATE OR REPLACE FUNCTION get_notification_counts(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_counts JSON;
BEGIN
  SELECT json_object_agg(type, count)
  INTO v_counts
  FROM (
    SELECT type, COUNT(*) as count
    FROM notifications
    WHERE user_id = p_user_id AND status = 'unread'
    GROUP BY type
  ) counts;

  RETURN COALESCE(v_counts, '{}'::JSON);
END;
$$ LANGUAGE plpgsql;

-- Get unread count
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND status = 'unread';

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Bulk action on notifications
CREATE OR REPLACE FUNCTION bulk_notification_action(
  p_user_id UUID,
  p_action TEXT,
  p_notification_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  CASE p_action
    WHEN 'read' THEN
      UPDATE notifications
      SET status = 'read', read_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status = 'unread';

    WHEN 'unread' THEN
      UPDATE notifications
      SET status = 'unread', read_at = NULL, updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status = 'read';

    WHEN 'archive' THEN
      UPDATE notifications
      SET status = 'archived', archived_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status != 'archived';

    WHEN 'delete' THEN
      UPDATE notifications
      SET status = 'deleted', deleted_at = NOW(), updated_at = NOW()
      WHERE user_id = p_user_id AND id = ANY(p_notification_ids) AND status != 'deleted';

    ELSE
      RAISE EXCEPTION 'Invalid action: %', p_action;
  END CASE;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Log bulk action
  INSERT INTO notification_bulk_actions (user_id, action, notification_ids, count)
  VALUES (p_user_id, p_action, p_notification_ids, v_count);

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_bulk_actions ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id AND status != 'deleted');

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Notification Preferences policies
CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

-- Notification Deliveries policies
CREATE POLICY "Users can view their deliveries"
  ON notification_deliveries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM notifications
    WHERE id = notification_deliveries.notification_id AND user_id = auth.uid()
  ));

-- Notification Templates policies (public read, admin write)
CREATE POLICY "Templates are viewable by all"
  ON notification_templates FOR SELECT
  USING (is_active = TRUE);

-- Notification Stats policies
CREATE POLICY "Users can view their own stats"
  ON notification_stats FOR SELECT
  USING (auth.uid() = user_id);

-- Notification Groups policies
CREATE POLICY "Users can manage their own groups"
  ON notification_groups FOR ALL
  USING (auth.uid() = user_id);

-- Bulk Actions policies
CREATE POLICY "Users can view their own bulk actions"
  ON notification_bulk_actions FOR SELECT
  USING (auth.uid() = user_id);
-- ========================================
-- PLUGIN MARKETPLACE SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete plugin marketplace with:
-- - Plugin discovery and installation
-- - Author profiles with verification
-- - Ratings and reviews system
-- - Multiple pricing models
-- - Version management
-- - Installation analytics
-- - Featured and trending plugins
--
-- Tables: 9
-- Functions: 9
-- Indexes: 48
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS plugin_category CASCADE;
CREATE TYPE plugin_category AS ENUM (
  'productivity',
  'creative',
  'analytics',
  'communication',
  'integration',
  'automation',
  'ai',
  'security',
  'finance',
  'marketing'
);

DROP TYPE IF EXISTS pricing_type CASCADE;
CREATE TYPE pricing_type AS ENUM (
  'free',
  'one-time',
  'subscription',
  'freemium'
);

DROP TYPE IF EXISTS plugin_status CASCADE;
CREATE TYPE plugin_status AS ENUM (
  'published',
  'beta',
  'coming-soon',
  'deprecated'
);

-- ========================================
-- TABLES
-- ========================================

-- Plugin Authors
CREATE TABLE IF NOT EXISTS plugin_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  email TEXT,
  website TEXT,
  total_plugins INTEGER NOT NULL DEFAULT 0,
  total_installs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugins
CREATE TABLE IF NOT EXISTS plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  category plugin_category NOT NULL,
  icon TEXT,
  author_id UUID NOT NULL REFERENCES plugin_authors(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,
  active_installs INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  pricing_type pricing_type NOT NULL DEFAULT 'free',
  status plugin_status NOT NULL DEFAULT 'published',
  file_size BIGINT NOT NULL DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  changelog JSONB DEFAULT '[]',
  download_url TEXT,
  documentation_url TEXT,
  support_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Installed Plugins
CREATE TABLE IF NOT EXISTS installed_plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  installed_version TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

-- Plugin Reviews
CREATE TABLE IF NOT EXISTS plugin_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  not_helpful INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, user_id)
);

-- Plugin Downloads
CREATE TABLE IF NOT EXISTS plugin_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugin Analytics
CREATE TABLE IF NOT EXISTS plugin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  installs INTEGER NOT NULL DEFAULT 0,
  uninstalls INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, date)
);

-- Plugin Versions
CREATE TABLE IF NOT EXISTS plugin_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes TEXT[] DEFAULT '{}',
  file_size BIGINT NOT NULL DEFAULT 0,
  download_url TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(plugin_id, version)
);

-- Plugin Collections
CREATE TABLE IF NOT EXISTS plugin_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  plugin_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plugin Wishlists
CREATE TABLE IF NOT EXISTS plugin_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plugin_id UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, plugin_id)
);

-- ========================================
-- INDEXES
-- ========================================

-- Plugin Authors Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_authors_user_id ON plugin_authors(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_authors_verified ON plugin_authors(verified);
CREATE INDEX IF NOT EXISTS idx_plugin_authors_name ON plugin_authors USING GIN(name gin_trgm_ops);

-- Plugins Indexes
CREATE INDEX IF NOT EXISTS idx_plugins_author_id ON plugins(author_id);
CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);
CREATE INDEX IF NOT EXISTS idx_plugins_pricing_type ON plugins(pricing_type);
CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
CREATE INDEX IF NOT EXISTS idx_plugins_rating ON plugins(rating DESC);
CREATE INDEX IF NOT EXISTS idx_plugins_install_count ON plugins(install_count DESC);
CREATE INDEX IF NOT EXISTS idx_plugins_is_featured ON plugins(is_featured);
CREATE INDEX IF NOT EXISTS idx_plugins_is_trending ON plugins(is_trending);
CREATE INDEX IF NOT EXISTS idx_plugins_is_popular ON plugins(is_popular);
CREATE INDEX IF NOT EXISTS idx_plugins_is_verified ON plugins(is_verified);
CREATE INDEX IF NOT EXISTS idx_plugins_last_updated ON plugins(last_updated DESC);
CREATE INDEX IF NOT EXISTS idx_plugins_name ON plugins USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_plugins_description ON plugins USING GIN(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_plugins_tags ON plugins USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_plugins_slug ON plugins(slug);

-- Installed Plugins Indexes
CREATE INDEX IF NOT EXISTS idx_installed_plugins_plugin_id ON installed_plugins(plugin_id);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_user_id ON installed_plugins(user_id);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_is_active ON installed_plugins(is_active);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_installed_at ON installed_plugins(installed_at DESC);
CREATE INDEX IF NOT EXISTS idx_installed_plugins_last_used ON installed_plugins(last_used DESC);

-- Plugin Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_reviews_plugin_id ON plugin_reviews(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_reviews_user_id ON plugin_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_reviews_rating ON plugin_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_reviews_verified ON plugin_reviews(verified);
CREATE INDEX IF NOT EXISTS idx_plugin_reviews_created_at ON plugin_reviews(created_at DESC);

-- Plugin Downloads Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_plugin_id ON plugin_downloads(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_user_id ON plugin_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_downloads_downloaded_at ON plugin_downloads(downloaded_at DESC);

-- Plugin Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_analytics_plugin_id ON plugin_analytics(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_analytics_date ON plugin_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_plugin_analytics_plugin_date ON plugin_analytics(plugin_id, date DESC);

-- Plugin Versions Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_versions_plugin_id ON plugin_versions(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_versions_version ON plugin_versions(plugin_id, version);
CREATE INDEX IF NOT EXISTS idx_plugin_versions_is_latest ON plugin_versions(is_latest);
CREATE INDEX IF NOT EXISTS idx_plugin_versions_release_date ON plugin_versions(release_date DESC);

-- Plugin Collections Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_collections_user_id ON plugin_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_collections_is_public ON plugin_collections(is_public);

-- Plugin Wishlists Indexes
CREATE INDEX IF NOT EXISTS idx_plugin_wishlists_user_id ON plugin_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_plugin_wishlists_plugin_id ON plugin_wishlists(plugin_id);
CREATE INDEX IF NOT EXISTS idx_plugin_wishlists_added_at ON plugin_wishlists(added_at DESC);

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

CREATE TRIGGER update_plugin_authors_updated_at BEFORE UPDATE ON plugin_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugins_updated_at BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_installed_plugins_updated_at BEFORE UPDATE ON installed_plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_reviews_updated_at BEFORE UPDATE ON plugin_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_analytics_updated_at BEFORE UPDATE ON plugin_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plugin_collections_updated_at BEFORE UPDATE ON plugin_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update plugin rating
CREATE OR REPLACE FUNCTION update_plugin_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plugins
  SET rating = (
    SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0)
    FROM plugin_reviews
    WHERE plugin_id = COALESCE(NEW.plugin_id, OLD.plugin_id)
  ),
  review_count = (
    SELECT COUNT(*)
    FROM plugin_reviews
    WHERE plugin_id = COALESCE(NEW.plugin_id, OLD.plugin_id)
  )
  WHERE id = COALESCE(NEW.plugin_id, OLD.plugin_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON plugin_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_plugin_rating();

-- Update install counts
CREATE OR REPLACE FUNCTION update_install_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE plugins
    SET install_count = install_count + 1,
        active_installs = active_installs + 1
    WHERE id = NEW.plugin_id;

    UPDATE plugin_authors
    SET total_installs = total_installs + 1
    WHERE id = (SELECT author_id FROM plugins WHERE id = NEW.plugin_id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE plugins
    SET active_installs = GREATEST(active_installs - 1, 0)
    WHERE id = OLD.plugin_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.is_active != NEW.is_active THEN
      UPDATE plugins
      SET active_installs = active_installs + CASE WHEN NEW.is_active THEN 1 ELSE -1 END
      WHERE id = NEW.plugin_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plugin_install_counts
  AFTER INSERT OR UPDATE OR DELETE ON installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_install_counts();

-- Update author stats
CREATE OR REPLACE FUNCTION update_author_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE plugin_authors
  SET total_plugins = (
    SELECT COUNT(*)
    FROM plugins
    WHERE author_id = COALESCE(NEW.author_id, OLD.author_id)
  )
  WHERE id = COALESCE(NEW.author_id, OLD.author_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_author_plugin_count
  AFTER INSERT OR DELETE ON plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_author_stats();

-- Update daily analytics
CREATE OR REPLACE FUNCTION update_daily_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO plugin_analytics (plugin_id, date, installs)
    VALUES (NEW.plugin_id, CURRENT_DATE, 1)
    ON CONFLICT (plugin_id, date)
    DO UPDATE SET installs = plugin_analytics.installs + 1;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO plugin_analytics (plugin_id, date, uninstalls)
    VALUES (OLD.plugin_id, CURRENT_DATE, 1)
    ON CONFLICT (plugin_id, date)
    DO UPDATE SET uninstalls = plugin_analytics.uninstalls + 1;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_daily_installs_uninstalls
  AFTER INSERT OR DELETE ON installed_plugins
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_analytics();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search plugins
CREATE OR REPLACE FUNCTION search_plugins(
  p_search_term TEXT,
  p_category plugin_category DEFAULT NULL,
  p_pricing_type pricing_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE status = 'published'
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_category IS NULL OR category = p_category)
    AND (p_pricing_type IS NULL OR pricing_type = p_pricing_type)
  ORDER BY
    CASE WHEN is_featured THEN 0 ELSE 1 END,
    install_count DESC,
    rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get plugin stats
CREATE OR REPLACE FUNCTION get_plugin_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalPlugins', COUNT(*),
      'totalInstalls', COALESCE(SUM(install_count), 0),
      'totalReviews', COALESCE(SUM(review_count), 0),
      'averageRating', COALESCE(AVG(rating), 0),
      'featured', COUNT(*) FILTER (WHERE is_featured = true),
      'trending', COUNT(*) FILTER (WHERE is_trending = true),
      'verified', COUNT(*) FILTER (WHERE is_verified = true),
      'byCategory', (
        SELECT json_object_agg(category, count)
        FROM (
          SELECT category, COUNT(*) as count
          FROM plugins
          WHERE status = 'published'
          GROUP BY category
        ) t
      ),
      'byPricing', (
        SELECT json_object_agg(pricing_type, count)
        FROM (
          SELECT pricing_type, COUNT(*) as count
          FROM plugins
          WHERE status = 'published'
          GROUP BY pricing_type
        ) t
      )
    )
    FROM plugins
    WHERE status = 'published'
  );
END;
$$ LANGUAGE plpgsql;

-- Install plugin
CREATE OR REPLACE FUNCTION install_plugin(
  p_plugin_id UUID,
  p_user_id UUID,
  p_version TEXT
)
RETURNS JSON AS $$
DECLARE
  v_plugin plugins;
BEGIN
  -- Get plugin
  SELECT * INTO v_plugin FROM plugins WHERE id = p_plugin_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plugin not found');
  END IF;

  IF v_plugin.status = 'deprecated' THEN
    RETURN json_build_object('success', false, 'error', 'Plugin is deprecated');
  END IF;

  IF v_plugin.status = 'coming-soon' THEN
    RETURN json_build_object('success', false, 'error', 'Plugin is not yet available');
  END IF;

  -- Install plugin
  INSERT INTO installed_plugins (plugin_id, user_id, installed_version)
  VALUES (p_plugin_id, p_user_id, p_version)
  ON CONFLICT (plugin_id, user_id)
  DO UPDATE SET
    installed_version = p_version,
    is_active = true;

  -- Record download
  INSERT INTO plugin_downloads (plugin_id, user_id, version)
  VALUES (p_plugin_id, p_user_id, p_version);

  RETURN json_build_object('success', true, 'plugin', v_plugin.name);
END;
$$ LANGUAGE plpgsql;

-- Uninstall plugin
CREATE OR REPLACE FUNCTION uninstall_plugin(
  p_plugin_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
BEGIN
  DELETE FROM installed_plugins
  WHERE plugin_id = p_plugin_id AND user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Plugin not installed');
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Get featured plugins
CREATE OR REPLACE FUNCTION get_featured_plugins(p_limit INTEGER DEFAULT 10)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE is_featured = true AND status = 'published'
  ORDER BY install_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get trending plugins
CREATE OR REPLACE FUNCTION get_trending_plugins(p_limit INTEGER DEFAULT 10)
RETURNS SETOF plugins AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM plugins
  WHERE is_trending = true AND status = 'published'
  ORDER BY install_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get plugin analytics
CREATE OR REPLACE FUNCTION get_plugin_analytics_summary(p_plugin_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalViews', COALESCE(SUM(views), 0),
      'totalInstalls', COALESCE(SUM(installs), 0),
      'totalUninstalls', COALESCE(SUM(uninstalls), 0),
      'averageActiveUsers', COALESCE(AVG(active_users), 0),
      'totalRevenue', COALESCE(SUM(revenue), 0),
      'dailyData', (
        SELECT json_agg(
          json_build_object(
            'date', date,
            'views', views,
            'installs', installs,
            'uninstalls', uninstalls,
            'activeUsers', active_users,
            'revenue', revenue
          ) ORDER BY date DESC
        )
        FROM plugin_analytics
        WHERE plugin_id = p_plugin_id
          AND date >= CURRENT_DATE - p_days
      )
    )
    FROM plugin_analytics
    WHERE plugin_id = p_plugin_id
      AND date >= CURRENT_DATE - p_days
  );
END;
$$ LANGUAGE plpgsql;

-- Submit review
CREATE OR REPLACE FUNCTION submit_review(
  p_plugin_id UUID,
  p_user_id UUID,
  p_rating INTEGER,
  p_title TEXT,
  p_comment TEXT
)
RETURNS JSON AS $$
BEGIN
  -- Check if user has installed the plugin
  IF NOT EXISTS (
    SELECT 1 FROM installed_plugins
    WHERE plugin_id = p_plugin_id AND user_id = p_user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You must install the plugin before reviewing');
  END IF;

  INSERT INTO plugin_reviews (plugin_id, user_id, rating, title, comment, verified)
  VALUES (p_plugin_id, p_user_id, p_rating, p_title, p_comment, true)
  ON CONFLICT (plugin_id, user_id)
  DO UPDATE SET
    rating = p_rating,
    title = p_title,
    comment = p_comment,
    updated_at = NOW();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Mark review helpful
CREATE OR REPLACE FUNCTION mark_review_helpful(
  p_review_id UUID,
  p_helpful BOOLEAN
)
RETURNS VOID AS $$
BEGIN
  IF p_helpful THEN
    UPDATE plugin_reviews
    SET helpful = helpful + 1
    WHERE id = p_review_id;
  ELSE
    UPDATE plugin_reviews
    SET not_helpful = not_helpful + 1
    WHERE id = p_review_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE plugin_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_wishlists ENABLE ROW LEVEL SECURITY;

-- Plugin Authors Policies
CREATE POLICY plugin_authors_select ON plugin_authors FOR SELECT USING (true);
CREATE POLICY plugin_authors_insert ON plugin_authors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_authors_update ON plugin_authors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_authors_delete ON plugin_authors FOR DELETE USING (auth.uid() = user_id);

-- Plugins Policies
CREATE POLICY plugins_select ON plugins FOR SELECT USING (true);
CREATE POLICY plugins_insert ON plugins FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));
CREATE POLICY plugins_update ON plugins FOR UPDATE
  USING (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));
CREATE POLICY plugins_delete ON plugins FOR DELETE
  USING (EXISTS (SELECT 1 FROM plugin_authors WHERE id = plugins.author_id AND user_id = auth.uid()));

-- Installed Plugins Policies
CREATE POLICY installed_plugins_select ON installed_plugins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY installed_plugins_insert ON installed_plugins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY installed_plugins_update ON installed_plugins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY installed_plugins_delete ON installed_plugins FOR DELETE USING (auth.uid() = user_id);

-- Plugin Reviews Policies
CREATE POLICY plugin_reviews_select ON plugin_reviews FOR SELECT USING (true);
CREATE POLICY plugin_reviews_insert ON plugin_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_reviews_update ON plugin_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_reviews_delete ON plugin_reviews FOR DELETE USING (auth.uid() = user_id);

-- Plugin Downloads Policies
CREATE POLICY plugin_downloads_select ON plugin_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plugin_downloads_insert ON plugin_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Plugin Analytics Policies
CREATE POLICY plugin_analytics_select ON plugin_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM plugins p JOIN plugin_authors pa ON p.author_id = pa.id WHERE p.id = plugin_analytics.plugin_id AND pa.user_id = auth.uid()));

-- Plugin Versions Policies
CREATE POLICY plugin_versions_select ON plugin_versions FOR SELECT USING (true);
CREATE POLICY plugin_versions_insert ON plugin_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM plugins p JOIN plugin_authors pa ON p.author_id = pa.id WHERE p.id = plugin_versions.plugin_id AND pa.user_id = auth.uid()));

-- Plugin Collections Policies
CREATE POLICY plugin_collections_select ON plugin_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY plugin_collections_insert ON plugin_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_collections_update ON plugin_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY plugin_collections_delete ON plugin_collections FOR DELETE USING (auth.uid() = user_id);

-- Plugin Wishlists Policies
CREATE POLICY plugin_wishlists_select ON plugin_wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY plugin_wishlists_insert ON plugin_wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY plugin_wishlists_delete ON plugin_wishlists FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE plugin_authors IS 'Plugin authors with verification status';
COMMENT ON TABLE plugins IS 'Available plugins in the marketplace';
COMMENT ON TABLE installed_plugins IS 'User-installed plugins with settings';
COMMENT ON TABLE plugin_reviews IS 'User reviews and ratings for plugins';
COMMENT ON TABLE plugin_downloads IS 'Plugin download tracking';
COMMENT ON TABLE plugin_analytics IS 'Daily plugin analytics and metrics';
COMMENT ON TABLE plugin_versions IS 'Plugin version history';
COMMENT ON TABLE plugin_collections IS 'User-created plugin collections';
COMMENT ON TABLE plugin_wishlists IS 'User plugin wishlists';
-- ============================================================================
-- Profile System - Production Database Schema
-- ============================================================================
-- Comprehensive user profile management with skills, experience, education,
-- portfolio, social links, and account settings
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS profile_status CASCADE;
CREATE TYPE profile_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
DROP TYPE IF EXISTS account_type CASCADE;
CREATE TYPE account_type AS ENUM ('free', 'pro', 'business', 'enterprise');
DROP TYPE IF EXISTS skill_level CASCADE;
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
DROP TYPE IF EXISTS privacy_level CASCADE;
CREATE TYPE privacy_level AS ENUM ('public', 'connections', 'private');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  avatar TEXT,
  cover_image TEXT,
  location TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  website TEXT,
  company TEXT,
  title TEXT,
  status profile_status NOT NULL DEFAULT 'active',
  account_type account_type NOT NULL DEFAULT 'free',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  level skill_level NOT NULL DEFAULT 'intermediate',
  years_of_experience INTEGER NOT NULL DEFAULT 0 CHECK (years_of_experience >= 0),
  endorsements INTEGER NOT NULL DEFAULT 0 CHECK (endorsements >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Experience
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Education
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT NOT NULL,
  field TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN NOT NULL DEFAULT FALSE,
  grade TEXT,
  activities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Portfolio
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  images TEXT[] DEFAULT '{}',
  url TEXT,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Social Links
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_name TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Profile Settings
CREATE TABLE IF NOT EXISTS profile_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  privacy_level privacy_level NOT NULL DEFAULT 'public',
  show_email BOOLEAN NOT NULL DEFAULT FALSE,
  show_phone BOOLEAN NOT NULL DEFAULT FALSE,
  show_location BOOLEAN NOT NULL DEFAULT TRUE,
  allow_messages BOOLEAN NOT NULL DEFAULT TRUE,
  allow_connections BOOLEAN NOT NULL DEFAULT TRUE,
  email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
  language TEXT NOT NULL DEFAULT 'en',
  theme TEXT NOT NULL DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile Stats
CREATE TABLE IF NOT EXISTS profile_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_views INTEGER NOT NULL DEFAULT 0,
  profile_views_this_month INTEGER NOT NULL DEFAULT 0,
  connections INTEGER NOT NULL DEFAULT 0,
  endorsements INTEGER NOT NULL DEFAULT 0,
  portfolio_views INTEGER NOT NULL DEFAULT 0,
  portfolio_likes INTEGER NOT NULL DEFAULT 0,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- User Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);

-- Skills indexes
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(level);
CREATE INDEX IF NOT EXISTS idx_skills_endorsements ON skills(endorsements DESC);

-- Experience indexes
CREATE INDEX IF NOT EXISTS idx_experience_user_id ON experience(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_current ON experience(current);
CREATE INDEX IF NOT EXISTS idx_experience_start_date ON experience(start_date DESC);

-- Education indexes
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_education_current ON education(current);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_likes ON portfolio(likes DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_views ON portfolio(views DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON portfolio USING GIN(tags);

-- Social Links indexes
CREATE INDEX IF NOT EXISTS idx_social_links_user_id ON social_links(user_id);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);

-- Profile Settings indexes
CREATE INDEX IF NOT EXISTS idx_profile_settings_user_id ON profile_settings(user_id);

-- Profile Stats indexes
CREATE INDEX IF NOT EXISTS idx_profile_stats_user_id ON profile_stats(user_id);

-- Achievements indexes
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at
  BEFORE UPDATE ON portfolio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_settings_updated_at
  BEFORE UPDATE ON profile_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_stats_updated_at
  BEFORE UPDATE ON profile_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile settings and stats on profile creation
CREATE OR REPLACE FUNCTION create_profile_defaults()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_settings (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO profile_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_profile_defaults_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_defaults();

-- Auto-update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_profile user_profiles%ROWTYPE;
  v_skills_count INTEGER;
  v_experience_count INTEGER;
BEGIN
  -- Get profile data
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);

  -- Basic info (40 points)
  IF v_profile.first_name IS NOT NULL AND v_profile.last_name IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.email IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.bio IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.avatar IS NOT NULL THEN v_score := v_score + 10; END IF;
  IF v_profile.location IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.phone IS NOT NULL THEN v_score := v_score + 5; END IF;

  -- Professional info (30 points)
  IF v_profile.company IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.title IS NOT NULL THEN v_score := v_score + 5; END IF;

  SELECT COUNT(*) INTO v_skills_count FROM skills WHERE user_id = v_profile.user_id;
  IF v_skills_count >= 5 THEN v_score := v_score + 10; END IF;

  SELECT COUNT(*) INTO v_experience_count FROM experience WHERE user_id = v_profile.user_id;
  IF v_experience_count >= 2 THEN v_score := v_score + 10; END IF;

  -- Verification (20 points)
  IF v_profile.email_verified THEN v_score := v_score + 10; END IF;
  IF v_profile.phone_verified THEN v_score := v_score + 10; END IF;

  -- Additional (10 points)
  IF v_profile.website IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_profile.cover_image IS NOT NULL THEN v_score := v_score + 5; END IF;

  -- Update stats
  UPDATE profile_stats
  SET completion_percentage = LEAST(v_score, 100),
      updated_at = NOW()
  WHERE user_id = v_profile.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_on_profile
  AFTER INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_skills
  AFTER INSERT OR UPDATE OR DELETE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profile_completion_on_experience
  AFTER INSERT OR UPDATE OR DELETE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get complete profile with stats
CREATE OR REPLACE FUNCTION get_complete_profile(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_profile JSON;
BEGIN
  SELECT json_build_object(
    'profile', row_to_json(up.*),
    'stats', row_to_json(ps.*),
    'settings', row_to_json(pst.*),
    'skillsCount', (SELECT COUNT(*) FROM skills WHERE user_id = p_user_id),
    'experienceCount', (SELECT COUNT(*) FROM experience WHERE user_id = p_user_id),
    'portfolioCount', (SELECT COUNT(*) FROM portfolio WHERE user_id = p_user_id),
    'achievementsCount', (SELECT COUNT(*) FROM achievements WHERE user_id = p_user_id)
  )
  INTO v_profile
  FROM user_profiles up
  LEFT JOIN profile_stats ps ON ps.user_id = up.user_id
  LEFT JOIN profile_settings pst ON pst.user_id = up.user_id
  WHERE up.user_id = p_user_id;

  RETURN v_profile;
END;
$$ LANGUAGE plpgsql;

-- Get top skills by endorsements
CREATE OR REPLACE FUNCTION get_top_skills(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  name TEXT,
  category TEXT,
  level skill_level,
  endorsements INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.name, s.category, s.level, s.endorsements
  FROM skills s
  WHERE s.user_id = p_user_id
  ORDER BY s.endorsements DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- User Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (
    status = 'active'
    AND EXISTS (
      SELECT 1 FROM profile_settings
      WHERE user_id = user_profiles.user_id
      AND privacy_level = 'public'
    )
  );

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Skills policies
CREATE POLICY "Public skills are viewable by everyone"
  ON skills FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profile_settings ps
    WHERE ps.user_id = skills.user_id AND ps.privacy_level = 'public'
  ));

CREATE POLICY "Users can manage their own skills"
  ON skills FOR ALL
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can manage their own experience"
  ON experience FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own education"
  ON education FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public portfolio is viewable by everyone"
  ON portfolio FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profile_settings ps
    WHERE ps.user_id = portfolio.user_id AND ps.privacy_level = 'public'
  ));

CREATE POLICY "Users can manage their own portfolio"
  ON portfolio FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own social links"
  ON social_links FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view and update their own settings"
  ON profile_settings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stats"
  ON profile_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);
-- ============================================================================
-- Reports & Analytics System - Complete Database Schema
-- ============================================================================
-- Description: Production-ready reports and financial analytics system
-- Features:
--   - Report generation and management
--   - Financial analytics tracking
--   - Scheduled report automation
--   - Export history and tracking
--   - Report templates
--   - Performance metrics
--   - Real-time analytics
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS report_type CASCADE;
CREATE TYPE report_type AS ENUM (
  'analytics',
  'financial',
  'performance',
  'sales',
  'custom'
);

DROP TYPE IF EXISTS report_status CASCADE;
CREATE TYPE report_status AS ENUM (
  'draft',
  'generating',
  'ready',
  'scheduled',
  'failed'
);

DROP TYPE IF EXISTS report_frequency CASCADE;
CREATE TYPE report_frequency AS ENUM (
  'once',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
);

DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM (
  'pdf',
  'excel',
  'csv',
  'json'
);

DROP TYPE IF EXISTS chart_type CASCADE;
CREATE TYPE chart_type AS ENUM (
  'line',
  'bar',
  'pie',
  'area',
  'scatter',
  'heatmap'
);

DROP TYPE IF EXISTS filter_operator CASCADE;
CREATE TYPE filter_operator AS ENUM (
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'contains'
);

DROP TYPE IF EXISTS kpi_status CASCADE;
CREATE TYPE kpi_status AS ENUM (
  'above',
  'on-track',
  'below'
);

DROP TYPE IF EXISTS trend_direction CASCADE;
CREATE TYPE trend_direction AS ENUM (
  'up',
  'stable',
  'down'
);

DROP TYPE IF EXISTS recommendation_category CASCADE;
CREATE TYPE recommendation_category AS ENUM (
  'revenue',
  'cost',
  'efficiency',
  'growth'
);

DROP TYPE IF EXISTS recommendation_impact CASCADE;
CREATE TYPE recommendation_impact AS ENUM (
  'high',
  'medium',
  'low'
);

DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM (
  'active',
  'completed',
  'cancelled'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  type report_type NOT NULL DEFAULT 'custom',
  status report_status NOT NULL DEFAULT 'draft',
  description TEXT,

  -- Scheduling
  frequency report_frequency NOT NULL DEFAULT 'once',
  next_run TIMESTAMPTZ,
  last_run TIMESTAMPTZ,

  -- Date Range
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,

  -- Data
  data_points INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,

  -- Recipients
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Configuration
  config JSONB DEFAULT '{
    "includeCharts": true,
    "includeTables": true,
    "includeRawData": false,
    "chartTypes": ["bar"],
    "metrics": [],
    "filters": [],
    "groupBy": [],
    "sortBy": "date",
    "limit": 1000
  }'::jsonb,

  -- Metadata
  created_by TEXT NOT NULL,
  generation_time INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_range_end >= date_range_start),
  CONSTRAINT valid_data_points CHECK (data_points >= 0),
  CONSTRAINT valid_file_size CHECK (file_size >= 0),
  CONSTRAINT valid_generation_time CHECK (generation_time >= 0),
  CONSTRAINT valid_views CHECK (views >= 0),
  CONSTRAINT valid_downloads CHECK (downloads >= 0)
);

-- Report Templates Table
CREATE TABLE IF NOT EXISTS report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  type report_type NOT NULL DEFAULT 'custom',

  -- Configuration
  config JSONB NOT NULL DEFAULT '{
    "includeCharts": true,
    "includeTables": true,
    "includeRawData": false,
    "chartTypes": ["bar"],
    "metrics": [],
    "filters": []
  }'::jsonb,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export History Table
CREATE TABLE IF NOT EXISTS report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Export Info
  format export_format NOT NULL,
  file_size BIGINT NOT NULL,
  download_url TEXT,

  -- Metadata
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0),
  CONSTRAINT valid_download_count CHECK (download_count >= 0)
);

-- Schedule History Table
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Schedule Info
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financial Analytics Table
CREATE TABLE IF NOT EXISTS financial_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

  -- Revenue Metrics
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  revenue_growth DECIMAL(5, 2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  clients_count INTEGER DEFAULT 0,
  avg_project_value DECIMAL(12, 2) DEFAULT 0,

  -- Profitability Metrics
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  profit_margin DECIMAL(5, 2) DEFAULT 0,

  -- Cash Flow Metrics
  cash_balance DECIMAL(12, 2) DEFAULT 0,
  income DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  net_cash_flow DECIMAL(12, 2) DEFAULT 0,

  -- Metadata
  data_points INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT unique_user_period UNIQUE (user_id, period_start, period_end, period_type)
);

-- Project Profitability Table
CREATE TABLE IF NOT EXISTS project_profitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Info
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'active',

  -- Financial Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  profit DECIMAL(12, 2) DEFAULT 0,
  margin DECIMAL(5, 2) DEFAULT 0,

  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT valid_expenses CHECK (expenses >= 0)
);

-- Revenue Tracking Table
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  month TEXT NOT NULL,
  year INTEGER NOT NULL,

  -- Revenue Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  growth DECIMAL(5, 2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  clients_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
);

-- Service Revenue Table
CREATE TABLE IF NOT EXISTS service_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service Info
  service_name TEXT NOT NULL,

  -- Revenue Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  count INTEGER DEFAULT 0,
  avg_value DECIMAL(12, 2) DEFAULT 0,
  growth DECIMAL(5, 2) DEFAULT 0,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT valid_count CHECK (count >= 0)
);

-- Cash Flow Projections Table
CREATE TABLE IF NOT EXISTS cash_flow_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  month TEXT NOT NULL,
  year INTEGER NOT NULL,

  -- Projection Data
  projected_income DECIMAL(12, 2) DEFAULT 0,
  projected_expenses DECIMAL(12, 2) DEFAULT 0,
  projected_net DECIMAL(12, 2) DEFAULT 0,
  projected_balance DECIMAL(12, 2) DEFAULT 0,

  -- Actual Data (filled when period completes)
  actual_income DECIMAL(12, 2),
  actual_expenses DECIMAL(12, 2),
  actual_net DECIMAL(12, 2),
  actual_balance DECIMAL(12, 2),

  -- Metadata
  confidence DECIMAL(3, 2) DEFAULT 0.80, -- 0.00 to 1.00

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Business Insights Table
CREATE TABLE IF NOT EXISTS business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight Data
  client_retention DECIMAL(5, 2) DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Additional Metrics
  metrics JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_retention CHECK (client_retention >= 0 AND client_retention <= 100)
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metric Info
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12, 2) NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,

  -- Status
  status kpi_status NOT NULL DEFAULT 'on-track',
  trend trend_direction NOT NULL DEFAULT 'stable',

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Recommendations Table
CREATE TABLE IF NOT EXISTS business_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recommendation Info
  category recommendation_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Priority
  impact recommendation_impact NOT NULL,
  effort recommendation_impact NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),

  -- Metadata
  implemented_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_priority CHECK (priority >= 1)
);

-- Report Views Table (Analytics)
CREATE TABLE IF NOT EXISTS report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- View Info
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0, -- seconds

  -- Metadata
  user_agent TEXT,
  ip_address INET
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Reports Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_frequency ON reports(frequency);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_next_run ON reports(next_run) WHERE next_run IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reports_tags ON reports USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_reports_user_status ON reports(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reports_user_type ON reports(user_id, type);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(date_range_start, date_range_end);

-- Report Templates Indexes
CREATE INDEX IF NOT EXISTS idx_report_templates_type ON report_templates(type);
CREATE INDEX IF NOT EXISTS idx_report_templates_user_id ON report_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_report_templates_default ON report_templates(is_default) WHERE is_default = true;

-- Report Exports Indexes
CREATE INDEX IF NOT EXISTS idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_user_id ON report_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_exports_exported_at ON report_exports(exported_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_exports_format ON report_exports(format);

-- Report Schedules Indexes
CREATE INDEX IF NOT EXISTS idx_report_schedules_report_id ON report_schedules(report_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_scheduled_at ON report_schedules(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_schedules_status ON report_schedules(status);

-- Financial Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_financial_analytics_user_id ON financial_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_period ON financial_analytics(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_type ON financial_analytics(period_type);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_user_period ON financial_analytics(user_id, period_start, period_end);

-- Project Profitability Indexes
CREATE INDEX IF NOT EXISTS idx_project_profitability_user_id ON project_profitability(user_id);
CREATE INDEX IF NOT EXISTS idx_project_profitability_project_id ON project_profitability(project_id);
CREATE INDEX IF NOT EXISTS idx_project_profitability_status ON project_profitability(status);
CREATE INDEX IF NOT EXISTS idx_project_profitability_margin ON project_profitability(margin DESC);
CREATE INDEX IF NOT EXISTS idx_project_profitability_dates ON project_profitability(start_date, end_date);

-- Revenue Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_year ON revenue_tracking(year DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_user_year ON revenue_tracking(user_id, year);

-- Service Revenue Indexes
CREATE INDEX IF NOT EXISTS idx_service_revenue_user_id ON service_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_service_revenue_service ON service_revenue(service_name);
CREATE INDEX IF NOT EXISTS idx_service_revenue_period ON service_revenue(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_service_revenue_revenue ON service_revenue(revenue DESC);

-- Cash Flow Projections Indexes
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_user_id ON cash_flow_projections(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_year ON cash_flow_projections(year DESC);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_user_year ON cash_flow_projections(user_id, year);

-- Business Insights Indexes
CREATE INDEX IF NOT EXISTS idx_business_insights_user_id ON business_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_business_insights_period ON business_insights(period_start, period_end);

-- Performance Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_status ON performance_metrics(status);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);

-- Business Recommendations Indexes
CREATE INDEX IF NOT EXISTS idx_business_recommendations_user_id ON business_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_business_recommendations_category ON business_recommendations(category);
CREATE INDEX IF NOT EXISTS idx_business_recommendations_status ON business_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_business_recommendations_priority ON business_recommendations(priority);

-- Report Views Indexes
CREATE INDEX IF NOT EXISTS idx_report_views_report_id ON report_views(report_id);
CREATE INDEX IF NOT EXISTS idx_report_views_user_id ON report_views(user_id);
CREATE INDEX IF NOT EXISTS idx_report_views_viewed_at ON report_views(viewed_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_profitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;

-- Reports Policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Report Templates Policies
CREATE POLICY "Users can view all templates"
  ON report_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create own templates"
  ON report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own templates"
  ON report_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON report_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Report Exports Policies
CREATE POLICY "Users can view own exports"
  ON report_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON report_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports"
  ON report_exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Report Schedules Policies
CREATE POLICY "Users can view own schedules"
  ON report_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules"
  ON report_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Financial Analytics Policies
CREATE POLICY "Users can view own analytics"
  ON financial_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics"
  ON financial_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON financial_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project Profitability Policies
CREATE POLICY "Users can view own project profitability"
  ON project_profitability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own project profitability"
  ON project_profitability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project profitability"
  ON project_profitability FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revenue Tracking Policies
CREATE POLICY "Users can view own revenue tracking"
  ON revenue_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own revenue tracking"
  ON revenue_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revenue tracking"
  ON revenue_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service Revenue Policies
CREATE POLICY "Users can view own service revenue"
  ON service_revenue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own service revenue"
  ON service_revenue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service revenue"
  ON service_revenue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cash Flow Projections Policies
CREATE POLICY "Users can view own cash flow projections"
  ON cash_flow_projections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cash flow projections"
  ON cash_flow_projections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flow projections"
  ON cash_flow_projections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Business Insights Policies
CREATE POLICY "Users can view own business insights"
  ON business_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business insights"
  ON business_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business insights"
  ON business_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Metrics Policies
CREATE POLICY "Users can view own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Business Recommendations Policies
CREATE POLICY "Users can view own recommendations"
  ON business_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recommendations"
  ON business_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON business_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Report Views Policies
CREATE POLICY "Users can view own report views"
  ON report_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create report views"
  ON report_views FOR INSERT
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

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_analytics_updated_at BEFORE UPDATE ON financial_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_profitability_updated_at BEFORE UPDATE ON project_profitability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_tracking_updated_at BEFORE UPDATE ON revenue_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_revenue_updated_at BEFORE UPDATE ON service_revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_projections_updated_at BEFORE UPDATE ON cash_flow_projections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_insights_updated_at BEFORE UPDATE ON business_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_recommendations_updated_at BEFORE UPDATE ON business_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate profit and margin for project profitability
CREATE OR REPLACE FUNCTION calculate_project_profitability()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profit = NEW.revenue - NEW.expenses;

  IF NEW.revenue > 0 THEN
    NEW.margin = (NEW.profit / NEW.revenue) * 100;
  ELSE
    NEW.margin = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_project_profitability
  BEFORE INSERT OR UPDATE OF revenue, expenses ON project_profitability
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_profitability();

-- Increment report views counter
CREATE OR REPLACE FUNCTION increment_report_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports
  SET views = views + 1
  WHERE id = NEW.report_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_views
  AFTER INSERT ON report_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_views();

-- Increment report downloads counter
CREATE OR REPLACE FUNCTION increment_report_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports
  SET downloads = downloads + 1
  WHERE id = NEW.report_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_downloads
  AFTER INSERT ON report_exports
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_downloads();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's total revenue for a period
CREATE OR REPLACE FUNCTION get_total_revenue(
  user_uuid UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(revenue), 0)
  FROM revenue_tracking
  WHERE user_id = user_uuid
    AND created_at >= start_date
    AND created_at <= end_date;
$$ LANGUAGE sql STABLE;

-- Get user's average profit margin
CREATE OR REPLACE FUNCTION get_average_profit_margin(
  user_uuid UUID
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(AVG(margin), 0)
  FROM project_profitability
  WHERE user_id = user_uuid
    AND status = 'completed';
$$ LANGUAGE sql STABLE;

-- Get user's top performing services
CREATE OR REPLACE FUNCTION get_top_services(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  service_name TEXT,
  total_revenue DECIMAL,
  project_count INTEGER,
  avg_value DECIMAL,
  growth DECIMAL
) AS $$
  SELECT
    sr.service_name,
    SUM(sr.revenue) as total_revenue,
    SUM(sr.count) as project_count,
    AVG(sr.avg_value) as avg_value,
    AVG(sr.growth) as growth
  FROM service_revenue sr
  WHERE sr.user_id = user_uuid
  GROUP BY sr.service_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Get user's cash runway
CREATE OR REPLACE FUNCTION get_cash_runway(
  user_uuid UUID
)
RETURNS INTEGER AS $$
DECLARE
  current_balance DECIMAL;
  avg_monthly_expenses DECIMAL;
  runway INTEGER;
BEGIN
  -- Get latest cash balance
  SELECT projected_balance INTO current_balance
  FROM cash_flow_projections
  WHERE user_id = user_uuid
  ORDER BY year DESC, created_at DESC
  LIMIT 1;

  -- Get average monthly expenses
  SELECT AVG(projected_expenses) INTO avg_monthly_expenses
  FROM cash_flow_projections
  WHERE user_id = user_uuid
    AND year = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Calculate runway
  IF avg_monthly_expenses > 0 THEN
    runway = FLOOR(current_balance / avg_monthly_expenses);
  ELSE
    runway = 0;
  END IF;

  RETURN runway;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate KPI status
CREATE OR REPLACE FUNCTION calculate_kpi_status(
  actual_value DECIMAL,
  target_value DECIMAL,
  threshold DECIMAL DEFAULT 0.95
)
RETURNS kpi_status AS $$
DECLARE
  ratio DECIMAL;
BEGIN
  IF target_value = 0 THEN
    RETURN 'on-track';
  END IF;

  ratio = actual_value / target_value;

  IF ratio >= 1 THEN
    RETURN 'above';
  ELSIF ratio >= threshold THEN
    RETURN 'on-track';
  ELSE
    RETURN 'below';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get scheduled reports ready to run
CREATE OR REPLACE FUNCTION get_scheduled_reports_to_run()
RETURNS TABLE (
  report_id UUID,
  report_name TEXT,
  user_id UUID,
  next_run TIMESTAMPTZ
) AS $$
  SELECT
    id as report_id,
    name as report_name,
    user_id,
    next_run
  FROM reports
  WHERE status = 'scheduled'
    AND next_run IS NOT NULL
    AND next_run <= NOW()
  ORDER BY next_run ASC;
$$ LANGUAGE sql STABLE;

-- Search reports by query
CREATE OR REPLACE FUNCTION search_reports(
  user_uuid UUID,
  search_query TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type report_type,
  status report_status,
  description TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
  SELECT
    r.id,
    r.name,
    r.type,
    r.status,
    r.description,
    r.created_at,
    ts_rank(
      to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM reports r
  WHERE r.user_id = user_uuid
    AND (
      to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.tags, ' '))
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC;
$$ LANGUAGE sql STABLE;

-- Get user's report statistics
CREATE OR REPLACE FUNCTION get_report_statistics(
  user_uuid UUID
)
RETURNS TABLE (
  total_reports INTEGER,
  ready_reports INTEGER,
  scheduled_reports INTEGER,
  total_views INTEGER,
  total_downloads INTEGER,
  total_data_points BIGINT
) AS $$
  SELECT
    COUNT(*)::INTEGER as total_reports,
    COUNT(*) FILTER (WHERE status = 'ready')::INTEGER as ready_reports,
    COUNT(*) FILTER (WHERE status = 'scheduled')::INTEGER as scheduled_reports,
    COALESCE(SUM(views), 0)::INTEGER as total_views,
    COALESCE(SUM(downloads), 0)::INTEGER as total_downloads,
    COALESCE(SUM(data_points), 0) as total_data_points
  FROM reports
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE reports IS 'User-generated reports with scheduling and export capabilities';
COMMENT ON TABLE report_templates IS 'Pre-defined report templates for quick report creation';
COMMENT ON TABLE report_exports IS 'Export history for reports in various formats';
COMMENT ON TABLE report_schedules IS 'Schedule execution history for automated reports';
COMMENT ON TABLE financial_analytics IS 'Financial analytics data aggregated by period';
COMMENT ON TABLE project_profitability IS 'Project-level profitability tracking';
COMMENT ON TABLE revenue_tracking IS 'Monthly revenue tracking with growth metrics';
COMMENT ON TABLE service_revenue IS 'Revenue breakdown by service type';
COMMENT ON TABLE cash_flow_projections IS 'Cash flow projections and actuals';
COMMENT ON TABLE business_insights IS 'Business insights and metrics aggregation';
COMMENT ON TABLE performance_metrics IS 'KPI tracking with targets and status';
COMMENT ON TABLE business_recommendations IS 'AI-generated business recommendations';
COMMENT ON TABLE report_views IS 'Report view analytics for usage tracking';
