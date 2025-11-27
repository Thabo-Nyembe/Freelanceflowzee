-- Minimal Advanced Analytics Schema
-- Business intelligence with dashboards, insights, goals, and funnels

-- ENUMS
DROP TYPE IF EXISTS metric_type CASCADE;
DROP TYPE IF EXISTS time_range CASCADE;
DROP TYPE IF EXISTS chart_type CASCADE;
DROP TYPE IF EXISTS insight_type CASCADE;
DROP TYPE IF EXISTS insight_impact CASCADE;
DROP TYPE IF EXISTS goal_status CASCADE;
DROP TYPE IF EXISTS dashboard_widget_type CASCADE;
DROP TYPE IF EXISTS filter_type CASCADE;

CREATE TYPE metric_type AS ENUM ('revenue', 'users', 'engagement', 'conversion', 'retention', 'performance');
CREATE TYPE time_range AS ENUM ('today', 'week', 'month', 'quarter', 'year', 'custom');
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'pie', 'area', 'donut', 'radar', 'scatter', 'heatmap');
CREATE TYPE insight_type AS ENUM ('trend', 'anomaly', 'opportunity', 'warning', 'achievement');
CREATE TYPE insight_impact AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE goal_status AS ENUM ('on-track', 'at-risk', 'completed', 'missed');
CREATE TYPE dashboard_widget_type AS ENUM ('metric', 'chart', 'table', 'text', 'custom');
CREATE TYPE filter_type AS ENUM ('date-range', 'select', 'multi-select', 'text', 'number-range');

-- TABLES
DROP TABLE IF EXISTS analytics_segments CASCADE;
DROP TABLE IF EXISTS analytics_cohorts CASCADE;
DROP TABLE IF EXISTS analytics_goals CASCADE;
DROP TABLE IF EXISTS analytics_insights CASCADE;
DROP TABLE IF EXISTS analytics_funnel_stages CASCADE;
DROP TABLE IF EXISTS analytics_reports CASCADE;
DROP TABLE IF EXISTS analytics_dashboard_filters CASCADE;
DROP TABLE IF EXISTS analytics_dashboard_widgets CASCADE;
DROP TABLE IF EXISTS analytics_dashboards CASCADE;
DROP TABLE IF EXISTS analytics_metrics CASCADE;

CREATE TABLE analytics_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type metric_type NOT NULL,
  name TEXT NOT NULL,
  value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  previous_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  change_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  change_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  trend TEXT NOT NULL CHECK (trend IN ('up', 'down', 'stable')) DEFAULT 'stable',
  unit TEXT NOT NULL CHECK (unit IN ('currency', 'number', 'percentage', 'time')) DEFAULT 'number',
  icon TEXT,
  color TEXT,
  time_range time_range NOT NULL DEFAULT 'month',
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, metric_date, time_range)
);

CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  type dashboard_widget_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data_source TEXT NOT NULL,
  config JSONB DEFAULT '{}'::JSONB,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 6,
  height INTEGER NOT NULL DEFAULT 4,
  refresh_interval INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_dashboard_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type filter_type NOT NULL,
  value JSONB,
  options JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'sales', 'marketing', 'operations', 'custom')),
  format TEXT NOT NULL CHECK (format IN ('pdf', 'excel', 'csv', 'json')) DEFAULT 'pdf',
  schedule_frequency TEXT CHECK (schedule_frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  schedule_enabled BOOLEAN NOT NULL DEFAULT false,
  schedule_day_of_week INTEGER,
  schedule_day_of_month INTEGER,
  schedule_time TIME,
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  sections JSONB DEFAULT '[]'::JSONB,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_funnel_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  funnel_name TEXT NOT NULL,
  stage_name TEXT NOT NULL,
  stage_order INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2),
  dropoff_rate DECIMAL(5, 2),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, funnel_name, stage_order, metric_date)
);

CREATE TABLE analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact insight_impact NOT NULL DEFAULT 'medium',
  metric_name TEXT,
  metric_value DECIMAL(12, 2),
  recommendation TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  progress DECIMAL(5, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status goal_status NOT NULL DEFAULT 'on-track',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  retention_data JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE analytics_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB DEFAULT '[]'::JSONB,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_analytics_metrics_user_id ON analytics_metrics(user_id);
CREATE INDEX idx_analytics_metrics_type ON analytics_metrics(metric_type);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(metric_date DESC);
CREATE INDEX idx_analytics_metrics_time_range ON analytics_metrics(time_range);
CREATE INDEX idx_analytics_dashboards_user_id ON analytics_dashboards(user_id);
CREATE INDEX idx_analytics_dashboards_is_default ON analytics_dashboards(is_default);
CREATE INDEX idx_analytics_widgets_dashboard_id ON analytics_dashboard_widgets(dashboard_id);
CREATE INDEX idx_analytics_widgets_type ON analytics_dashboard_widgets(type);
CREATE INDEX idx_analytics_filters_dashboard_id ON analytics_dashboard_filters(dashboard_id);
CREATE INDEX idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX idx_analytics_reports_type ON analytics_reports(type);
CREATE INDEX idx_analytics_reports_schedule ON analytics_reports(schedule_enabled, schedule_frequency);
CREATE INDEX idx_analytics_funnel_user_id ON analytics_funnel_stages(user_id);
CREATE INDEX idx_analytics_funnel_name ON analytics_funnel_stages(funnel_name);
CREATE INDEX idx_analytics_funnel_date ON analytics_funnel_stages(metric_date DESC);
CREATE INDEX idx_analytics_insights_user_id ON analytics_insights(user_id);
CREATE INDEX idx_analytics_insights_type ON analytics_insights(type);
CREATE INDEX idx_analytics_insights_is_read ON analytics_insights(is_read);
CREATE INDEX idx_analytics_insights_impact ON analytics_insights(impact);
CREATE INDEX idx_analytics_goals_user_id ON analytics_goals(user_id);
CREATE INDEX idx_analytics_goals_status ON analytics_goals(status);
CREATE INDEX idx_analytics_goals_end_date ON analytics_goals(end_date);
CREATE INDEX idx_analytics_cohorts_user_id ON analytics_cohorts(user_id);
CREATE INDEX idx_analytics_cohorts_dates ON analytics_cohorts(start_date, end_date);
CREATE INDEX idx_analytics_segments_user_id ON analytics_segments(user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_analytics_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_analytics_metrics_updated_at BEFORE UPDATE ON analytics_metrics FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_dashboards_updated_at BEFORE UPDATE ON analytics_dashboards FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_widgets_updated_at BEFORE UPDATE ON analytics_dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_reports_updated_at BEFORE UPDATE ON analytics_reports FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_funnel_updated_at BEFORE UPDATE ON analytics_funnel_stages FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_insights_updated_at BEFORE UPDATE ON analytics_insights FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_goals_updated_at BEFORE UPDATE ON analytics_goals FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_cohorts_updated_at BEFORE UPDATE ON analytics_cohorts FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();
CREATE TRIGGER trigger_analytics_segments_updated_at BEFORE UPDATE ON analytics_segments FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();

CREATE OR REPLACE FUNCTION calculate_metric_change() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.previous_value > 0 THEN
    NEW.change_value = NEW.value - NEW.previous_value;
    NEW.change_percent = ((NEW.value - NEW.previous_value) / NEW.previous_value) * 100;

    IF NEW.change_percent > 1 THEN
      NEW.trend = 'up';
    ELSIF NEW.change_percent < -1 THEN
      NEW.trend = 'down';
    ELSE
      NEW.trend = 'stable';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_metric_change BEFORE INSERT OR UPDATE ON analytics_metrics FOR EACH ROW EXECUTE FUNCTION calculate_metric_change();

CREATE OR REPLACE FUNCTION calculate_goal_progress() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_value > 0 THEN
    NEW.progress = LEAST(100, (NEW.current_value / NEW.target_value) * 100);

    IF NEW.progress >= 100 THEN
      NEW.status = 'completed';
    ELSIF NEW.progress >= 75 THEN
      NEW.status = 'on-track';
    ELSIF NEW.progress >= 50 THEN
      NEW.status = 'at-risk';
    ELSE
      NEW.status = 'at-risk';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_goal_progress BEFORE INSERT OR UPDATE ON analytics_goals FOR EACH ROW EXECUTE FUNCTION calculate_goal_progress();
