-- Minimal Growth Hub Schema
-- AI-powered growth strategy management with roadmaps and quick wins

-- ENUMS
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS growth_goal_type CASCADE;
DROP TYPE IF EXISTS strategy_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS timeframe_type CASCADE;
DROP TYPE IF EXISTS metric_type CASCADE;
DROP TYPE IF EXISTS action_category CASCADE;
DROP TYPE IF EXISTS probability_type CASCADE;

CREATE TYPE user_type AS ENUM ('freelancer', 'entrepreneur', 'startup', 'enterprise', 'creative');
CREATE TYPE growth_goal_type AS ENUM ('monetize', 'acquire', 'scale', 'optimize');
CREATE TYPE strategy_status AS ENUM ('draft', 'active', 'completed', 'paused', 'archived');
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE timeframe_type AS ENUM ('3-months', '6-months', '12-months', '24-months');
CREATE TYPE metric_type AS ENUM ('revenue', 'clients', 'efficiency', 'profit', 'growth-rate');
CREATE TYPE action_category AS ENUM ('pricing', 'marketing', 'operations', 'sales', 'product', 'team');
CREATE TYPE probability_type AS ENUM ('low', 'medium', 'high', 'very-high');

-- TABLES
DROP TABLE IF EXISTS growth_metrics CASCADE;
DROP TABLE IF EXISTS priority_actions CASCADE;
DROP TABLE IF EXISTS kpis CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS monthly_plans CASCADE;
DROP TABLE IF EXISTS quick_wins CASCADE;
DROP TABLE IF EXISTS user_type_profiles CASCADE;
DROP TABLE IF EXISTS growth_templates CASCADE;
DROP TABLE IF EXISTS growth_strategies CASCADE;

CREATE TABLE growth_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_type user_type NOT NULL,
  goal_type growth_goal_type NOT NULL,
  status strategy_status NOT NULL DEFAULT 'draft',
  current_revenue DECIMAL(12, 2) NOT NULL,
  target_revenue DECIMAL(12, 2) NOT NULL,
  timeline INTEGER NOT NULL CHECK (timeline > 0),
  challenges TEXT[] DEFAULT ARRAY[]::TEXT[],
  revenue_increase DECIMAL(5, 2) NOT NULL,
  probability probability_type NOT NULL DEFAULT 'medium',
  roi DECIMAL(5, 2) NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 70 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quick_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  category action_category NOT NULL,
  estimated_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  time_to_implement INTEGER NOT NULL DEFAULT 0,
  difficulty priority_level NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE monthly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month > 0),
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_target DECIMAL(12, 2) NOT NULL DEFAULT 0,
  actions TEXT[] DEFAULT ARRAY[]::TEXT[],
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(strategy_id, month)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metric metric_type NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  target_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE priority_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category action_category NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_impact DECIMAL(5, 2) NOT NULL DEFAULT 0,
  timeframe timeframe_type NOT NULL,
  resources TEXT[] DEFAULT ARRAY[]::TEXT[],
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE growth_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month > 0),
  metric_date DATE NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  clients INTEGER NOT NULL DEFAULT 0,
  average_project_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  efficiency_score INTEGER NOT NULL DEFAULT 0 CHECK (efficiency_score >= 0 AND efficiency_score <= 100),
  profit_margin DECIMAL(5, 2) NOT NULL DEFAULT 0,
  growth_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  client_acquisition_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  lifetime_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE growth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_type user_type NOT NULL,
  goal_type growth_goal_type NOT NULL,
  description TEXT,
  timeline INTEGER NOT NULL CHECK (timeline > 0),
  quick_wins TEXT[] DEFAULT ARRAY[]::TEXT[],
  milestones TEXT[] DEFAULT ARRAY[]::TEXT[],
  estimated_impact DECIMAL(5, 2) NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_type_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type user_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  quick_wins TEXT[] DEFAULT ARRAY[]::TEXT[],
  challenges TEXT[] DEFAULT ARRAY[]::TEXT[],
  recommended_strategies growth_goal_type[] DEFAULT ARRAY[]::growth_goal_type[],
  average_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  growth_potential DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_growth_strategies_user_id ON growth_strategies(user_id);
CREATE INDEX idx_growth_strategies_status ON growth_strategies(status);
CREATE INDEX idx_growth_strategies_user_type ON growth_strategies(user_type);
CREATE INDEX idx_growth_strategies_goal_type ON growth_strategies(goal_type);
CREATE INDEX idx_quick_wins_strategy_id ON quick_wins(strategy_id);
CREATE INDEX idx_quick_wins_completed ON quick_wins(completed);
CREATE INDEX idx_monthly_plans_strategy_id ON monthly_plans(strategy_id);
CREATE INDEX idx_monthly_plans_month ON monthly_plans(month);
CREATE INDEX idx_milestones_plan_id ON milestones(monthly_plan_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
CREATE INDEX idx_kpis_plan_id ON kpis(monthly_plan_id);
CREATE INDEX idx_priority_actions_strategy_id ON priority_actions(strategy_id);
CREATE INDEX idx_priority_actions_priority ON priority_actions(priority);
CREATE INDEX idx_growth_metrics_user_id ON growth_metrics(user_id);
CREATE INDEX idx_growth_metrics_strategy_id ON growth_metrics(strategy_id);
CREATE INDEX idx_growth_metrics_month ON growth_metrics(month);
CREATE INDEX idx_growth_templates_user_type ON growth_templates(user_type);
CREATE INDEX idx_user_type_profiles_type ON user_type_profiles(type);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_growth_hub_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_growth_strategies_updated_at BEFORE UPDATE ON growth_strategies FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_quick_wins_updated_at BEFORE UPDATE ON quick_wins FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_monthly_plans_updated_at BEFORE UPDATE ON monthly_plans FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_kpis_updated_at BEFORE UPDATE ON kpis FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_priority_actions_updated_at BEFORE UPDATE ON priority_actions FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_growth_metrics_updated_at BEFORE UPDATE ON growth_metrics FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_growth_templates_updated_at BEFORE UPDATE ON growth_templates FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();
CREATE TRIGGER trigger_user_type_profiles_updated_at BEFORE UPDATE ON user_type_profiles FOR EACH ROW EXECUTE FUNCTION update_growth_hub_updated_at();

CREATE OR REPLACE FUNCTION set_strategy_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_strategy_completed_at BEFORE UPDATE ON growth_strategies FOR EACH ROW EXECUTE FUNCTION set_strategy_completed_at();

CREATE OR REPLACE FUNCTION set_quick_win_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = true AND (OLD.completed IS NULL OR OLD.completed = false) THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_quick_win_completed_at BEFORE UPDATE ON quick_wins FOR EACH ROW EXECUTE FUNCTION set_quick_win_completed_at();
CREATE TRIGGER trigger_set_milestone_completed_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION set_quick_win_completed_at();
CREATE TRIGGER trigger_set_priority_action_completed_at BEFORE UPDATE ON priority_actions FOR EACH ROW EXECUTE FUNCTION set_quick_win_completed_at();
