-- Minimal ML Insights Schema
-- Machine learning insights, predictions, and analytics system

-- ENUMS
DROP TYPE IF EXISTS insight_type CASCADE;
DROP TYPE IF EXISTS metric_category CASCADE;
DROP TYPE IF EXISTS prediction_confidence CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS trend_direction CASCADE;
DROP TYPE IF EXISTS pattern_frequency CASCADE;
DROP TYPE IF EXISTS ml_algorithm CASCADE;
DROP TYPE IF EXISTS action_status CASCADE;

CREATE TYPE insight_type AS ENUM ('trend', 'anomaly', 'forecast', 'pattern', 'recommendation', 'alert');
CREATE TYPE metric_category AS ENUM ('revenue', 'users', 'performance', 'engagement', 'conversion', 'retention', 'churn');
CREATE TYPE prediction_confidence AS ENUM ('low', 'medium', 'high', 'very-high');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE pattern_frequency AS ENUM ('daily', 'weekly', 'monthly', 'seasonal');
CREATE TYPE ml_algorithm AS ENUM ('linear-regression', 'random-forest', 'neural-network', 'time-series');
CREATE TYPE action_status AS ENUM ('pending', 'in-progress', 'completed', 'dismissed');

-- TABLES
DROP TABLE IF EXISTS ml_performance_metrics CASCADE;
DROP TABLE IF EXISTS ml_alerts CASCADE;
DROP TABLE IF EXISTS recommendation_actions CASCADE;
DROP TABLE IF EXISTS ml_recommendations CASCADE;
DROP TABLE IF EXISTS ml_patterns CASCADE;
DROP TABLE IF EXISTS ml_anomalies CASCADE;
DROP TABLE IF EXISTS ml_predictions CASCADE;
DROP TABLE IF EXISTS ml_models CASCADE;
DROP TABLE IF EXISTS ml_insights CASCADE;

CREATE TABLE ml_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  category metric_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence prediction_confidence NOT NULL DEFAULT 'medium',
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high')),
  is_actionable BOOLEAN NOT NULL DEFAULT true,
  recommendations TEXT[] DEFAULT ARRAY[]::TEXT[],
  affected_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  data_points INTEGER DEFAULT 0,
  accuracy DECIMAL(5, 4) DEFAULT 0,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category metric_category NOT NULL,
  algorithm ml_algorithm NOT NULL,
  accuracy DECIMAL(5, 4) NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  mse DECIMAL(10, 4) DEFAULT 0,
  rmse DECIMAL(10, 4) DEFAULT 0,
  mae DECIMAL(10, 4) DEFAULT 0,
  r2_score DECIMAL(5, 4) DEFAULT 0,
  last_trained TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prediction_date DATE NOT NULL,
  predicted_value DECIMAL(15, 4) NOT NULL,
  confidence_lower DECIMAL(15, 4),
  confidence_upper DECIMAL(15, 4),
  actual_value DECIMAL(15, 4),
  error DECIMAL(15, 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_anomalies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  category metric_category NOT NULL,
  expected_value DECIMAL(15, 4) NOT NULL,
  actual_value DECIMAL(15, 4) NOT NULL,
  deviation DECIMAL(10, 4) NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'warning',
  description TEXT NOT NULL,
  possible_causes TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category metric_category NOT NULL,
  description TEXT NOT NULL,
  frequency pattern_frequency NOT NULL,
  confidence prediction_confidence NOT NULL DEFAULT 'medium',
  occurrences JSONB DEFAULT '[]'::JSONB,
  next_occurrence_date DATE,
  next_occurrence_probability DECIMAL(5, 4),
  insights TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category metric_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  expected_metric TEXT,
  expected_improvement DECIMAL(10, 4),
  expected_timeframe TEXT,
  based_on TEXT[] DEFAULT ARRAY[]::TEXT[],
  confidence prediction_confidence NOT NULL DEFAULT 'medium',
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recommendation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id UUID NOT NULL REFERENCES ml_recommendations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  effort TEXT NOT NULL DEFAULT 'medium' CHECK (effort IN ('low', 'medium', 'high')),
  impact TEXT NOT NULL DEFAULT 'medium' CHECK (impact IN ('low', 'medium', 'high')),
  status action_status NOT NULL DEFAULT 'pending',
  action_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  metric TEXT NOT NULL,
  category metric_category NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  threshold DECIMAL(15, 4),
  actual_value DECIMAL(15, 4),
  is_acknowledged BOOLEAN NOT NULL DEFAULT false,
  actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ml_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  accuracy DECIMAL(5, 4) NOT NULL DEFAULT 0,
  precision_score DECIMAL(5, 4) NOT NULL DEFAULT 0,
  recall_score DECIMAL(5, 4) NOT NULL DEFAULT 0,
  f1_score DECIMAL(5, 4) NOT NULL DEFAULT 0,
  auc_score DECIMAL(5, 4) NOT NULL DEFAULT 0,
  training_time INTEGER DEFAULT 0,
  prediction_time INTEGER DEFAULT 0,
  data_size INTEGER DEFAULT 0,
  feature_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_ml_insights_user_id ON ml_insights(user_id);
CREATE INDEX idx_ml_insights_type ON ml_insights(type);
CREATE INDEX idx_ml_insights_category ON ml_insights(category);
CREATE INDEX idx_ml_insights_detected_at ON ml_insights(detected_at DESC);
CREATE INDEX idx_ml_models_user_id ON ml_models(user_id);
CREATE INDEX idx_ml_models_category ON ml_models(category);
CREATE INDEX idx_ml_models_algorithm ON ml_models(algorithm);
CREATE INDEX idx_ml_predictions_model_id ON ml_predictions(model_id);
CREATE INDEX idx_ml_predictions_user_id ON ml_predictions(user_id);
CREATE INDEX idx_ml_predictions_date ON ml_predictions(prediction_date DESC);
CREATE INDEX idx_ml_anomalies_user_id ON ml_anomalies(user_id);
CREATE INDEX idx_ml_anomalies_category ON ml_anomalies(category);
CREATE INDEX idx_ml_anomalies_severity ON ml_anomalies(severity);
CREATE INDEX idx_ml_anomalies_resolved ON ml_anomalies(is_resolved);
CREATE INDEX idx_ml_patterns_user_id ON ml_patterns(user_id);
CREATE INDEX idx_ml_patterns_category ON ml_patterns(category);
CREATE INDEX idx_ml_recommendations_user_id ON ml_recommendations(user_id);
CREATE INDEX idx_ml_recommendations_category ON ml_recommendations(category);
CREATE INDEX idx_ml_recommendations_priority ON ml_recommendations(priority);
CREATE INDEX idx_recommendation_actions_rec_id ON recommendation_actions(recommendation_id);
CREATE INDEX idx_recommendation_actions_status ON recommendation_actions(status);
CREATE INDEX idx_ml_alerts_user_id ON ml_alerts(user_id);
CREATE INDEX idx_ml_alerts_severity ON ml_alerts(severity);
CREATE INDEX idx_ml_alerts_acknowledged ON ml_alerts(is_acknowledged);
CREATE INDEX idx_ml_performance_metrics_user_id ON ml_performance_metrics(user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_ml_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ml_insights_updated_at BEFORE UPDATE ON ml_insights FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_ml_models_updated_at BEFORE UPDATE ON ml_models FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_ml_anomalies_updated_at BEFORE UPDATE ON ml_anomalies FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_ml_patterns_updated_at BEFORE UPDATE ON ml_patterns FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_ml_recommendations_updated_at BEFORE UPDATE ON ml_recommendations FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_recommendation_actions_updated_at BEFORE UPDATE ON recommendation_actions FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();
CREATE TRIGGER trigger_ml_alerts_updated_at BEFORE UPDATE ON ml_alerts FOR EACH ROW EXECUTE FUNCTION update_ml_updated_at();

CREATE OR REPLACE FUNCTION set_anomaly_resolved_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_resolved = true AND (OLD.is_resolved IS NULL OR OLD.is_resolved = false) THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_anomaly_resolved_at BEFORE UPDATE ON ml_anomalies FOR EACH ROW EXECUTE FUNCTION set_anomaly_resolved_at();

CREATE OR REPLACE FUNCTION set_alert_acknowledged_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_acknowledged = true AND (OLD.is_acknowledged IS NULL OR OLD.is_acknowledged = false) THEN
    NEW.acknowledged_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_alert_acknowledged_at BEFORE UPDATE ON ml_alerts FOR EACH ROW EXECUTE FUNCTION set_alert_acknowledged_at();
