-- Minimal Performance Analytics Schema
-- Business performance tracking and metrics analysis

-- ENUMS
DROP TYPE IF EXISTS metric_category CASCADE;
DROP TYPE IF EXISTS trend_direction CASCADE;
DROP TYPE IF EXISTS performance_period CASCADE;
DROP TYPE IF EXISTS benchmark_level CASCADE;

CREATE TYPE metric_category AS ENUM ('revenue', 'productivity', 'client', 'project', 'financial', 'efficiency');
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE performance_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE benchmark_level AS ENUM ('poor', 'average', 'good', 'excellent', 'outstanding');

-- TABLES
DROP TABLE IF EXISTS performance_goals CASCADE;
DROP TABLE IF EXISTS performance_benchmarks CASCADE;
DROP TABLE IF EXISTS performance_alerts CASCADE;
DROP TABLE IF EXISTS performance_snapshots CASCADE;
DROP TABLE IF EXISTS performance_metrics CASCADE;

CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  period performance_period NOT NULL DEFAULT 'monthly',
  category metric_category NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_previous DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_change DECIMAL(5, 2) NOT NULL DEFAULT 0,
  projects_completed INTEGER NOT NULL DEFAULT 0,
  projects_in_progress INTEGER NOT NULL DEFAULT 0,
  projects_total INTEGER NOT NULL DEFAULT 0,
  completion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_project_duration DECIMAL(8, 2) NOT NULL DEFAULT 0,
  clients_total INTEGER NOT NULL DEFAULT 0,
  clients_active INTEGER NOT NULL DEFAULT 0,
  clients_new INTEGER NOT NULL DEFAULT 0,
  client_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) NOT NULL DEFAULT 0,
  hours_logged DECIMAL(8, 2) NOT NULL DEFAULT 0,
  hours_billable DECIMAL(8, 2) NOT NULL DEFAULT 0,
  efficiency_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  utilization_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expenses DECIMAL(12, 2) NOT NULL DEFAULT 0,
  profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_project_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  trend trend_direction NOT NULL DEFAULT 'stable',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date, period, category)
);

CREATE TABLE performance_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  period performance_period NOT NULL,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_projects INTEGER NOT NULL DEFAULT 0,
  total_clients INTEGER NOT NULL DEFAULT 0,
  avg_efficiency DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_performing_projects JSONB DEFAULT '[]'::JSONB,
  top_clients JSONB DEFAULT '[]'::JSONB,
  performance_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_category metric_category NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  threshold_value DECIMAL(12, 2),
  actual_value DECIMAL(12, 2),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category metric_category NOT NULL,
  metric_name TEXT NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  benchmark_level benchmark_level NOT NULL DEFAULT 'average',
  period performance_period NOT NULL DEFAULT 'monthly',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category metric_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value DECIMAL(12, 2) NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  progress DECIMAL(5, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  is_achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(metric_date DESC);
CREATE INDEX idx_performance_metrics_period ON performance_metrics(period);
CREATE INDEX idx_performance_metrics_category ON performance_metrics(category);
CREATE INDEX idx_performance_metrics_user_date ON performance_metrics(user_id, metric_date);
CREATE INDEX idx_performance_snapshots_user_id ON performance_snapshots(user_id);
CREATE INDEX idx_performance_snapshots_date ON performance_snapshots(snapshot_date DESC);
CREATE INDEX idx_performance_alerts_user_id ON performance_alerts(user_id);
CREATE INDEX idx_performance_alerts_is_read ON performance_alerts(is_read);
CREATE INDEX idx_performance_alerts_severity ON performance_alerts(severity);
CREATE INDEX idx_performance_benchmarks_user_id ON performance_benchmarks(user_id);
CREATE INDEX idx_performance_benchmarks_category ON performance_benchmarks(category);
CREATE INDEX idx_performance_goals_user_id ON performance_goals(user_id);
CREATE INDEX idx_performance_goals_target_date ON performance_goals(target_date);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_performance_analytics_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics FOR EACH ROW EXECUTE FUNCTION update_performance_analytics_updated_at();
CREATE TRIGGER trigger_performance_alerts_updated_at BEFORE UPDATE ON performance_alerts FOR EACH ROW EXECUTE FUNCTION update_performance_analytics_updated_at();
CREATE TRIGGER trigger_performance_benchmarks_updated_at BEFORE UPDATE ON performance_benchmarks FOR EACH ROW EXECUTE FUNCTION update_performance_analytics_updated_at();
CREATE TRIGGER trigger_performance_goals_updated_at BEFORE UPDATE ON performance_goals FOR EACH ROW EXECUTE FUNCTION update_performance_analytics_updated_at();

CREATE OR REPLACE FUNCTION set_alert_resolved_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_resolved = true AND (OLD.is_resolved IS NULL OR OLD.is_resolved = false) THEN
    NEW.resolved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_alert_resolved_at BEFORE UPDATE ON performance_alerts FOR EACH ROW EXECUTE FUNCTION set_alert_resolved_at();

CREATE OR REPLACE FUNCTION set_goal_achieved_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_achieved = true AND (OLD.is_achieved IS NULL OR OLD.is_achieved = false) THEN
    NEW.achieved_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_goal_achieved_at BEFORE UPDATE ON performance_goals FOR EACH ROW EXECUTE FUNCTION set_goal_achieved_at();

CREATE OR REPLACE FUNCTION calculate_goal_progress() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_value > 0 THEN
    NEW.progress = LEAST(100, (NEW.current_value / NEW.target_value) * 100);
    IF NEW.progress >= 100 THEN
      NEW.is_achieved = true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_goal_progress BEFORE INSERT OR UPDATE ON performance_goals FOR EACH ROW EXECUTE FUNCTION calculate_goal_progress();
