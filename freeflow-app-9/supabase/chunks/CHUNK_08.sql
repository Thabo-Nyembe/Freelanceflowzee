-- ============================================================================
-- Growth Hub System - Production Database Schema
-- ============================================================================
-- AI-powered growth strategy management with personalized roadmaps,
-- user type-specific strategies, quick wins, and business scaling tools
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS user_type CASCADE;
CREATE TYPE user_type AS ENUM ('freelancer', 'entrepreneur', 'startup', 'enterprise', 'creative');
DROP TYPE IF EXISTS growth_goal_type CASCADE;
CREATE TYPE growth_goal_type AS ENUM ('monetize', 'acquire', 'scale', 'optimize');
DROP TYPE IF EXISTS strategy_status CASCADE;
CREATE TYPE strategy_status AS ENUM ('draft', 'active', 'completed', 'paused', 'archived');
DROP TYPE IF EXISTS priority_level CASCADE;
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
DROP TYPE IF EXISTS timeframe_type CASCADE;
CREATE TYPE timeframe_type AS ENUM ('3-months', '6-months', '12-months', '24-months');
DROP TYPE IF EXISTS metric_type CASCADE;
CREATE TYPE metric_type AS ENUM ('revenue', 'clients', 'efficiency', 'profit', 'growth-rate');
DROP TYPE IF EXISTS action_category CASCADE;
CREATE TYPE action_category AS ENUM ('pricing', 'marketing', 'operations', 'sales', 'product', 'team');
DROP TYPE IF EXISTS probability_type CASCADE;
CREATE TYPE probability_type AS ENUM ('low', 'medium', 'high', 'very-high');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Growth Strategies
CREATE TABLE IF NOT EXISTS growth_strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  user_type user_type NOT NULL,
  goal_type growth_goal_type NOT NULL,
  status strategy_status NOT NULL DEFAULT 'draft',
  current_revenue DECIMAL(12, 2) NOT NULL,
  target_revenue DECIMAL(12, 2) NOT NULL,
  timeline INTEGER NOT NULL CHECK (timeline > 0), -- months
  challenges TEXT[] DEFAULT '{}',
  revenue_increase DECIMAL(5, 2) NOT NULL, -- percentage
  probability probability_type NOT NULL DEFAULT 'medium',
  roi DECIMAL(5, 2) NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 70 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Quick Wins
CREATE TABLE IF NOT EXISTS quick_wins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  category action_category NOT NULL,
  estimated_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  time_to_implement INTEGER NOT NULL DEFAULT 0, -- days
  difficulty priority_level NOT NULL DEFAULT 'medium',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Monthly Plans
CREATE TABLE IF NOT EXISTS monthly_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month > 0),
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_target DECIMAL(12, 2) NOT NULL DEFAULT 0,
  actions TEXT[] DEFAULT '{}',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(strategy_id, month)
);

-- Milestones
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- KPIs (Key Performance Indicators)
CREATE TABLE IF NOT EXISTS kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_plan_id UUID NOT NULL REFERENCES monthly_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  metric metric_type NOT NULL,
  current_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  target_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Priority Actions
CREATE TABLE IF NOT EXISTS priority_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID NOT NULL REFERENCES growth_strategies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category action_category NOT NULL,
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_impact DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentage
  timeframe timeframe_type NOT NULL,
  resources TEXT[] DEFAULT '{}',
  dependencies UUID[] DEFAULT '{}', -- references to other priority_actions ids
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Growth Metrics
CREATE TABLE IF NOT EXISTS growth_metrics (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Growth Templates
CREATE TABLE IF NOT EXISTS growth_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_type user_type NOT NULL,
  goal_type growth_goal_type NOT NULL,
  description TEXT,
  timeline INTEGER NOT NULL CHECK (timeline > 0), -- months
  quick_wins TEXT[] DEFAULT '{}',
  milestones TEXT[] DEFAULT '{}',
  estimated_impact DECIMAL(5, 2) NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Type Profiles
CREATE TABLE IF NOT EXISTS user_type_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type user_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  quick_wins TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  recommended_strategies growth_goal_type[] DEFAULT '{}',
  average_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  growth_potential DECIMAL(5, 2) NOT NULL DEFAULT 0, -- percentage
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Growth Strategies indexes
CREATE INDEX IF NOT EXISTS idx_growth_strategies_user_id ON growth_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_status ON growth_strategies(status);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_user_type ON growth_strategies(user_type);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_goal_type ON growth_strategies(goal_type);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_created_at ON growth_strategies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_target_revenue ON growth_strategies(target_revenue);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_user_status ON growth_strategies(user_id, status);
CREATE INDEX IF NOT EXISTS idx_growth_strategies_completed ON growth_strategies(completed_at) WHERE completed_at IS NOT NULL;

-- Quick Wins indexes
CREATE INDEX IF NOT EXISTS idx_quick_wins_strategy_id ON quick_wins(strategy_id);
CREATE INDEX IF NOT EXISTS idx_quick_wins_category ON quick_wins(category);
CREATE INDEX IF NOT EXISTS idx_quick_wins_completed ON quick_wins(completed);
CREATE INDEX IF NOT EXISTS idx_quick_wins_difficulty ON quick_wins(difficulty);
CREATE INDEX IF NOT EXISTS idx_quick_wins_strategy_completed ON quick_wins(strategy_id, completed);

-- Monthly Plans indexes
CREATE INDEX IF NOT EXISTS idx_monthly_plans_strategy_id ON monthly_plans(strategy_id);
CREATE INDEX IF NOT EXISTS idx_monthly_plans_month ON monthly_plans(month);
CREATE INDEX IF NOT EXISTS idx_monthly_plans_completed ON monthly_plans(completed);
CREATE INDEX IF NOT EXISTS idx_monthly_plans_strategy_month ON monthly_plans(strategy_id, month);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_plan_id ON milestones(monthly_plan_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_date ON milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_milestones_completed ON milestones(completed);
CREATE INDEX IF NOT EXISTS idx_milestones_plan_completed ON milestones(monthly_plan_id, completed);

-- KPIs indexes
CREATE INDEX IF NOT EXISTS idx_kpis_plan_id ON kpis(monthly_plan_id);
CREATE INDEX IF NOT EXISTS idx_kpis_metric ON kpis(metric);
CREATE INDEX IF NOT EXISTS idx_kpis_plan_metric ON kpis(monthly_plan_id, metric);

-- Priority Actions indexes
CREATE INDEX IF NOT EXISTS idx_priority_actions_strategy_id ON priority_actions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_priority_actions_category ON priority_actions(category);
CREATE INDEX IF NOT EXISTS idx_priority_actions_priority ON priority_actions(priority);
CREATE INDEX IF NOT EXISTS idx_priority_actions_timeframe ON priority_actions(timeframe);
CREATE INDEX IF NOT EXISTS idx_priority_actions_completed ON priority_actions(completed);
CREATE INDEX IF NOT EXISTS idx_priority_actions_strategy_priority ON priority_actions(strategy_id, priority);

-- Growth Metrics indexes
CREATE INDEX IF NOT EXISTS idx_growth_metrics_user_id ON growth_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_strategy_id ON growth_metrics(strategy_id);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_month ON growth_metrics(month);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_date ON growth_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_strategy_month ON growth_metrics(strategy_id, month);
CREATE INDEX IF NOT EXISTS idx_growth_metrics_user_date ON growth_metrics(user_id, metric_date DESC);

-- Growth Templates indexes
CREATE INDEX IF NOT EXISTS idx_growth_templates_user_type ON growth_templates(user_type);
CREATE INDEX IF NOT EXISTS idx_growth_templates_goal_type ON growth_templates(goal_type);
CREATE INDEX IF NOT EXISTS idx_growth_templates_usage ON growth_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_growth_templates_type_goal ON growth_templates(user_type, goal_type);

-- User Type Profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_type_profiles_type ON user_type_profiles(type);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_growth_strategies_updated_at
  BEFORE UPDATE ON growth_strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_wins_updated_at
  BEFORE UPDATE ON quick_wins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_plans_updated_at
  BEFORE UPDATE ON monthly_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at
  BEFORE UPDATE ON kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priority_actions_updated_at
  BEFORE UPDATE ON priority_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_metrics_updated_at
  BEFORE UPDATE ON growth_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_templates_updated_at
  BEFORE UPDATE ON growth_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_type_profiles_updated_at
  BEFORE UPDATE ON user_type_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set completed_at timestamps
CREATE OR REPLACE FUNCTION set_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed = TRUE AND OLD.completed = FALSE THEN
    NEW.completed_at = NOW();
  ELSIF NEW.completed = FALSE THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_quick_wins_completed_at
  BEFORE UPDATE ON quick_wins
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

CREATE TRIGGER set_milestones_completed_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

CREATE TRIGGER set_priority_actions_completed_at
  BEFORE UPDATE ON priority_actions
  FOR EACH ROW
  EXECUTE FUNCTION set_completed_at();

-- Auto-calculate revenue increase percentage
CREATE OR REPLACE FUNCTION calculate_revenue_increase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_revenue > 0 THEN
    NEW.revenue_increase = ((NEW.target_revenue - NEW.current_revenue) / NEW.current_revenue) * 100;
  ELSE
    NEW.revenue_increase = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_strategy_revenue_increase
  BEFORE INSERT OR UPDATE OF current_revenue, target_revenue ON growth_strategies
  FOR EACH ROW
  EXECUTE FUNCTION calculate_revenue_increase();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get growth stats for a user
CREATE OR REPLACE FUNCTION get_growth_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'activeStrategies', COUNT(*) FILTER (WHERE status = 'active'),
    'completedStrategies', COUNT(*) FILTER (WHERE status = 'completed'),
    'totalStrategies', COUNT(*),
    'totalRevenueGoal', COALESCE(SUM(target_revenue) FILTER (WHERE status = 'active'), 0),
    'totalCurrentRevenue', COALESCE(SUM(current_revenue) FILTER (WHERE status = 'active'), 0),
    'averageGrowthRate', COALESCE(AVG(revenue_increase) FILTER (WHERE status = 'active'), 0),
    'completionRate', CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100 ELSE 0 END,
    'quickWinsCompleted', (
      SELECT COUNT(*)
      FROM quick_wins qw
      JOIN growth_strategies gs ON qw.strategy_id = gs.id
      WHERE gs.user_id = p_user_id AND qw.completed = TRUE
    ),
    'totalQuickWins', (
      SELECT COUNT(*)
      FROM quick_wins qw
      JOIN growth_strategies gs ON qw.strategy_id = gs.id
      WHERE gs.user_id = p_user_id
    )
  )
  INTO v_stats
  FROM growth_strategies
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get strategy progress
CREATE OR REPLACE FUNCTION get_strategy_progress(p_strategy_id UUID)
RETURNS JSON AS $$
DECLARE
  v_progress JSON;
BEGIN
  SELECT json_build_object(
    'strategyId', p_strategy_id,
    'quickWinsProgress', json_build_object(
      'completed', COUNT(*) FILTER (WHERE qw.completed = TRUE),
      'total', COUNT(*),
      'percentage', CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE qw.completed = TRUE)::DECIMAL / COUNT(*)) * 100 ELSE 0 END
    ),
    'priorityActionsProgress', json_build_object(
      'completed', COUNT(DISTINCT pa.id) FILTER (WHERE pa.completed = TRUE),
      'total', COUNT(DISTINCT pa.id),
      'percentage', CASE WHEN COUNT(DISTINCT pa.id) > 0 THEN (COUNT(DISTINCT pa.id) FILTER (WHERE pa.completed = TRUE)::DECIMAL / COUNT(DISTINCT pa.id)) * 100 ELSE 0 END
    ),
    'monthlyPlansProgress', json_build_object(
      'completed', COUNT(DISTINCT mp.id) FILTER (WHERE mp.completed = TRUE),
      'total', COUNT(DISTINCT mp.id),
      'percentage', CASE WHEN COUNT(DISTINCT mp.id) > 0 THEN (COUNT(DISTINCT mp.id) FILTER (WHERE mp.completed = TRUE)::DECIMAL / COUNT(DISTINCT mp.id)) * 100 ELSE 0 END
    ),
    'milestonesProgress', json_build_object(
      'completed', COUNT(DISTINCT m.id) FILTER (WHERE m.completed = TRUE),
      'total', COUNT(DISTINCT m.id),
      'percentage', CASE WHEN COUNT(DISTINCT m.id) > 0 THEN (COUNT(DISTINCT m.id) FILTER (WHERE m.completed = TRUE)::DECIMAL / COUNT(DISTINCT m.id)) * 100 ELSE 0 END
    )
  )
  INTO v_progress
  FROM growth_strategies gs
  LEFT JOIN quick_wins qw ON qw.strategy_id = gs.id
  LEFT JOIN priority_actions pa ON pa.strategy_id = gs.id
  LEFT JOIN monthly_plans mp ON mp.strategy_id = gs.id
  LEFT JOIN milestones m ON m.monthly_plan_id = mp.id
  WHERE gs.id = p_strategy_id
  GROUP BY gs.id;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Get monthly plan progress
CREATE OR REPLACE FUNCTION get_monthly_progress(p_strategy_id UUID, p_month INTEGER)
RETURNS JSON AS $$
DECLARE
  v_progress JSON;
BEGIN
  SELECT json_build_object(
    'month', p_month,
    'revenueProgress', CASE WHEN mp.revenue_target > 0 THEN (mp.revenue / mp.revenue_target) * 100 ELSE 0 END,
    'revenue', mp.revenue,
    'target', mp.revenue_target,
    'milestonesCompleted', COUNT(m.id) FILTER (WHERE m.completed = TRUE),
    'milestonesTotal', COUNT(m.id),
    'milestoneProgress', CASE WHEN COUNT(m.id) > 0 THEN (COUNT(m.id) FILTER (WHERE m.completed = TRUE)::DECIMAL / COUNT(m.id)) * 100 ELSE 0 END,
    'kpisOnTrack', COUNT(k.id) FILTER (WHERE k.current_value >= k.target_value * 0.9),
    'kpisTotal', COUNT(k.id),
    'onTrack', (
      CASE WHEN mp.revenue_target > 0 THEN (mp.revenue / mp.revenue_target) * 100 ELSE 0 END >= 90
      AND
      CASE WHEN COUNT(m.id) > 0 THEN (COUNT(m.id) FILTER (WHERE m.completed = TRUE)::DECIMAL / COUNT(m.id)) ELSE 0 END >= 0.7
    )
  )
  INTO v_progress
  FROM monthly_plans mp
  LEFT JOIN milestones m ON m.monthly_plan_id = mp.id
  LEFT JOIN kpis k ON k.monthly_plan_id = mp.id
  WHERE mp.strategy_id = p_strategy_id AND mp.month = p_month
  GROUP BY mp.id, mp.revenue, mp.revenue_target;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Get recommended actions
CREATE OR REPLACE FUNCTION get_recommended_actions(p_strategy_id UUID, p_current_month INTEGER)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  category action_category,
  priority priority_level,
  estimated_impact DECIMAL,
  timeframe timeframe_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pa.id,
    pa.title,
    pa.description,
    pa.category,
    pa.priority,
    pa.estimated_impact,
    pa.timeframe
  FROM priority_actions pa
  WHERE pa.strategy_id = p_strategy_id
    AND pa.completed = FALSE
    AND (
      CASE
        WHEN pa.timeframe = '3-months' THEN 3
        WHEN pa.timeframe = '6-months' THEN 6
        WHEN pa.timeframe = '12-months' THEN 12
        WHEN pa.timeframe = '24-months' THEN 24
      END
    ) >= p_current_month
  ORDER BY
    CASE pa.priority
      WHEN 'critical' THEN 0
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
    END,
    pa.estimated_impact DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Get growth trends
CREATE OR REPLACE FUNCTION get_growth_trends(p_user_id UUID, p_months INTEGER DEFAULT 12)
RETURNS TABLE(
  month INTEGER,
  metric_date DATE,
  revenue DECIMAL,
  clients INTEGER,
  growth_rate DECIMAL,
  efficiency_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gm.month,
    gm.metric_date,
    gm.revenue,
    gm.clients,
    gm.growth_rate,
    gm.efficiency_score
  FROM growth_metrics gm
  WHERE gm.user_id = p_user_id
    AND gm.metric_date >= CURRENT_DATE - (p_months || ' months')::INTERVAL
  ORDER BY gm.metric_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Search growth strategies
CREATE OR REPLACE FUNCTION search_growth_strategies(p_user_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  user_type user_type,
  goal_type growth_goal_type,
  status strategy_status,
  target_revenue DECIMAL,
  revenue_increase DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.id,
    gs.name,
    gs.user_type,
    gs.goal_type,
    gs.status,
    gs.target_revenue,
    gs.revenue_increase
  FROM growth_strategies gs
  WHERE gs.user_id = p_user_id
    AND (
      gs.name ILIKE '%' || p_query || '%'
      OR gs.user_type::TEXT ILIKE '%' || p_query || '%'
      OR gs.goal_type::TEXT ILIKE '%' || p_query || '%'
      OR p_query = ANY(gs.challenges)
    )
  ORDER BY gs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE growth_templates
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_template_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE growth_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE priority_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_type_profiles ENABLE ROW LEVEL SECURITY;

-- Growth Strategies policies
CREATE POLICY "Users can view their own growth strategies"
  ON growth_strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own growth strategies"
  ON growth_strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth strategies"
  ON growth_strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own growth strategies"
  ON growth_strategies FOR DELETE
  USING (auth.uid() = user_id);

-- Quick Wins policies
CREATE POLICY "Users can view quick wins for their strategies"
  ON quick_wins FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = quick_wins.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create quick wins for their strategies"
  ON quick_wins FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = quick_wins.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update quick wins for their strategies"
  ON quick_wins FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = quick_wins.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete quick wins for their strategies"
  ON quick_wins FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = quick_wins.strategy_id AND user_id = auth.uid()
  ));

-- Monthly Plans policies
CREATE POLICY "Users can view monthly plans for their strategies"
  ON monthly_plans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = monthly_plans.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create monthly plans for their strategies"
  ON monthly_plans FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = monthly_plans.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update monthly plans for their strategies"
  ON monthly_plans FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = monthly_plans.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete monthly plans for their strategies"
  ON monthly_plans FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = monthly_plans.strategy_id AND user_id = auth.uid()
  ));

-- Milestones policies
CREATE POLICY "Users can view milestones for their plans"
  ON milestones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = milestones.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for their plans"
  ON milestones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = milestones.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their plans"
  ON milestones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = milestones.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their plans"
  ON milestones FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = milestones.monthly_plan_id AND gs.user_id = auth.uid()
  ));

-- KPIs policies
CREATE POLICY "Users can view KPIs for their plans"
  ON kpis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = kpis.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can create KPIs for their plans"
  ON kpis FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = kpis.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can update KPIs for their plans"
  ON kpis FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = kpis.monthly_plan_id AND gs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete KPIs for their plans"
  ON kpis FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM monthly_plans mp
    JOIN growth_strategies gs ON mp.strategy_id = gs.id
    WHERE mp.id = kpis.monthly_plan_id AND gs.user_id = auth.uid()
  ));

-- Priority Actions policies
CREATE POLICY "Users can view priority actions for their strategies"
  ON priority_actions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = priority_actions.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create priority actions for their strategies"
  ON priority_actions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = priority_actions.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update priority actions for their strategies"
  ON priority_actions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = priority_actions.strategy_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete priority actions for their strategies"
  ON priority_actions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM growth_strategies
    WHERE id = priority_actions.strategy_id AND user_id = auth.uid()
  ));

-- Growth Metrics policies
CREATE POLICY "Users can view their own growth metrics"
  ON growth_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own growth metrics"
  ON growth_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own growth metrics"
  ON growth_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own growth metrics"
  ON growth_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Growth Templates policies (read-only for all users)
CREATE POLICY "All users can view growth templates"
  ON growth_templates FOR SELECT
  USING (true);

-- User Type Profiles policies (read-only for all users)
CREATE POLICY "All users can view user type profiles"
  ON user_type_profiles FOR SELECT
  USING (true);

-- ============================================================================
-- SEED DATA (User Type Profiles)
-- ============================================================================

INSERT INTO user_type_profiles (type, display_name, icon, color, quick_wins, challenges, recommended_strategies, average_revenue, growth_potential)
VALUES
  ('freelancer', 'Freelancers', 'Briefcase', 'bg-blue-100 text-blue-700',
   ARRAY['Increase rates by 30% in 90 days', 'Build 3-tier service packages', 'Create email templates for common tasks', 'Implement time tracking & reporting'],
   ARRAY['Feast or famine income', 'Trading time for money', 'Limited scalability', 'Client acquisition'],
   ARRAY['monetize', 'acquire', 'optimize']::growth_goal_type[],
   75000, 200),
  ('entrepreneur', 'Entrepreneurs', 'Rocket', 'bg-purple-100 text-purple-700',
   ARRAY['Validate MVP with 10 customers', 'Create growth funnel', 'Build founding team', 'Secure first $10K MRR'],
   ARRAY['Product-market fit', 'Scaling customer acquisition', 'Funding & cash flow', 'Team building'],
   ARRAY['acquire', 'scale', 'optimize']::growth_goal_type[],
   150000, 500),
  ('startup', 'Startups', 'BarChart3', 'bg-green-100 text-green-700',
   ARRAY['Optimize conversion funnel', 'Reduce CAC by 40%', 'Increase LTV 2x', 'Build investor pitch deck'],
   ARRAY['Achieving product-market fit', 'Scaling efficiently', 'Fundraising', 'Competitive differentiation'],
   ARRAY['scale', 'optimize', 'acquire']::growth_goal_type[],
   500000, 1000),
  ('enterprise', 'Enterprises', 'Award', 'bg-indigo-100 text-indigo-700',
   ARRAY['Digital transformation roadmap', 'Process optimization (20% efficiency)', 'Innovation framework', 'Market expansion strategy'],
   ARRAY['Innovation vs bureaucracy', 'Legacy system modernization', 'Agile transformation', 'Talent retention'],
   ARRAY['optimize', 'scale', 'monetize']::growth_goal_type[],
   5000000, 300),
  ('creative', 'Creatives', 'Lightbulb', 'bg-pink-100 text-pink-700',
   ARRAY['Portfolio positioning strategy', 'Premium pricing justification', 'Creative brief templates', 'Client onboarding system'],
   ARRAY['Undercharging for work', 'Scope creep management', 'Work-life balance', 'Finding ideal clients'],
   ARRAY['monetize', 'acquire', 'optimize']::growth_goal_type[],
   60000, 250);
-- =====================================================
-- INTEGRATIONS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive integration management with OAuth, API keys,
-- webhooks, third-party services, and sync monitoring
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS integration_category CASCADE;
CREATE TYPE integration_category AS ENUM (
  'payment',
  'communication',
  'productivity',
  'analytics',
  'storage',
  'marketing',
  'crm',
  'development'
);

DROP TYPE IF EXISTS integration_status CASCADE;
CREATE TYPE integration_status AS ENUM (
  'available',
  'connected',
  'disconnected',
  'error'
);

DROP TYPE IF EXISTS auth_type CASCADE;
CREATE TYPE auth_type AS ENUM (
  'oauth',
  'api-key',
  'basic',
  'webhook'
);

DROP TYPE IF EXISTS setup_difficulty CASCADE;
CREATE TYPE setup_difficulty AS ENUM (
  'easy',
  'medium',
  'hard'
);

DROP TYPE IF EXISTS sync_frequency CASCADE;
CREATE TYPE sync_frequency AS ENUM (
  'realtime',
  '5min',
  '15min',
  '1hour',
  '6hour',
  '24hour'
);

DROP TYPE IF EXISTS sync_direction CASCADE;
CREATE TYPE sync_direction AS ENUM (
  'inbound',
  'outbound',
  'bidirectional'
);

DROP TYPE IF EXISTS webhook_status CASCADE;
CREATE TYPE webhook_status AS ENUM (
  'active',
  'inactive',
  'failed'
);

DROP TYPE IF EXISTS sync_status CASCADE;
CREATE TYPE sync_status AS ENUM (
  'running',
  'completed',
  'failed'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  category integration_category NOT NULL,
  status integration_status NOT NULL DEFAULT 'available',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  auth_type auth_type NOT NULL,
  connected_at TIMESTAMPTZ,
  last_sync TIMESTAMPTZ,
  total_syncs INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
  data_transferred BIGINT NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  setup_difficulty setup_difficulty NOT NULL DEFAULT 'medium',
  documentation TEXT,
  webhook_url TEXT,
  api_endpoint TEXT,
  version TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integration Templates
CREATE TABLE IF NOT EXISTS integration_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category integration_category NOT NULL,
  integration_ids UUID[] DEFAULT '{}',
  config JSONB DEFAULT '{}'::jsonb,
  setup_steps TEXT[] DEFAULT '{}',
  estimated_time INTEGER NOT NULL DEFAULT 30,
  difficulty setup_difficulty NOT NULL DEFAULT 'medium',
  is_popular BOOLEAN NOT NULL DEFAULT false,
  usage_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhook Events
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status webhook_status NOT NULL DEFAULT 'active',
  response JSONB,
  response_time INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync Logs
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status sync_status NOT NULL DEFAULT 'running',
  records_processed INTEGER NOT NULL DEFAULT 0,
  records_failed INTEGER NOT NULL DEFAULT 0,
  data_size BIGINT NOT NULL DEFAULT 0,
  error_message TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Integration Stats (aggregated statistics)
CREATE TABLE IF NOT EXISTS integration_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_integrations INTEGER NOT NULL DEFAULT 0,
  connected_integrations INTEGER NOT NULL DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  total_syncs INTEGER NOT NULL DEFAULT 0,
  total_data_transferred BIGINT NOT NULL DEFAULT 0,
  average_success_rate DECIMAL(5, 2) DEFAULT 0,
  most_used_integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,
  recent_errors INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- API Keys (secure storage)
CREATE TABLE IF NOT EXISTS integration_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  key_type TEXT NOT NULL DEFAULT 'api_key',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth Tokens (secure storage)
CREATE TABLE IF NOT EXISTS integration_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scope TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_auth_type ON integrations(auth_type);
CREATE INDEX IF NOT EXISTS idx_integrations_is_premium ON integrations(is_premium);
CREATE INDEX IF NOT EXISTS idx_integrations_is_popular ON integrations(is_popular);
CREATE INDEX IF NOT EXISTS idx_integrations_setup_difficulty ON integrations(setup_difficulty);
CREATE INDEX IF NOT EXISTS idx_integrations_total_syncs ON integrations(total_syncs DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_success_rate ON integrations(success_rate DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_data_transferred ON integrations(data_transferred DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_connected_at ON integrations(connected_at DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_last_sync ON integrations(last_sync DESC);
CREATE INDEX IF NOT EXISTS idx_integrations_features ON integrations USING GIN(features);
CREATE INDEX IF NOT EXISTS idx_integrations_name_search ON integrations USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_integrations_description_search ON integrations USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_integrations_config ON integrations USING GIN(config);
CREATE INDEX IF NOT EXISTS idx_integrations_created_at ON integrations(created_at DESC);

-- Integration Templates Indexes
CREATE INDEX IF NOT EXISTS idx_integration_templates_category ON integration_templates(category);
CREATE INDEX IF NOT EXISTS idx_integration_templates_difficulty ON integration_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_integration_templates_is_popular ON integration_templates(is_popular);
CREATE INDEX IF NOT EXISTS idx_integration_templates_usage_count ON integration_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_integration_templates_name_search ON integration_templates USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_integration_templates_created_at ON integration_templates(created_at DESC);

-- Webhook Events Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_integration_id ON webhook_events(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_retry_count ON webhook_events(retry_count);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_payload ON webhook_events USING GIN(payload);

-- Sync Logs Indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_integration_id ON sync_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_started_at ON sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_completed_at ON sync_logs(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_records_processed ON sync_logs(records_processed DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_data_size ON sync_logs(data_size DESC);

-- Integration Stats Indexes
CREATE INDEX IF NOT EXISTS idx_integration_stats_user_id ON integration_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_stats_date ON integration_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_integration_stats_total_integrations ON integration_stats(total_integrations DESC);
CREATE INDEX IF NOT EXISTS idx_integration_stats_connected_integrations ON integration_stats(connected_integrations DESC);
CREATE INDEX IF NOT EXISTS idx_integration_stats_most_used_integration_id ON integration_stats(most_used_integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_stats_created_at ON integration_stats(created_at DESC);

-- API Keys Indexes
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_integration_id ON integration_api_keys(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_user_id ON integration_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_is_active ON integration_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_expires_at ON integration_api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_integration_api_keys_created_at ON integration_api_keys(created_at DESC);

-- OAuth Tokens Indexes
CREATE INDEX IF NOT EXISTS idx_integration_oauth_tokens_integration_id ON integration_oauth_tokens(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_oauth_tokens_user_id ON integration_oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_oauth_tokens_expires_at ON integration_oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_integration_oauth_tokens_created_at ON integration_oauth_tokens(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_templates_updated_at
  BEFORE UPDATE ON integration_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_stats_updated_at
  BEFORE UPDATE ON integration_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_api_keys_updated_at
  BEFORE UPDATE ON integration_api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_oauth_tokens_updated_at
  BEFORE UPDATE ON integration_oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track sync completion
CREATE OR REPLACE FUNCTION track_sync_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status = 'running' THEN
    NEW.completed_at = NOW();

    UPDATE integrations
    SET
      last_sync = NOW(),
      total_syncs = total_syncs + 1,
      data_transferred = data_transferred + NEW.data_size,
      success_rate = (
        (success_rate * total_syncs + 100.0) / (total_syncs + 1)
      )
    WHERE id = NEW.integration_id;
  ELSIF NEW.status = 'failed' AND OLD.status = 'running' THEN
    NEW.completed_at = NOW();

    UPDATE integrations
    SET
      total_syncs = total_syncs + 1,
      error_count = error_count + 1,
      success_rate = (
        (success_rate * total_syncs) / (total_syncs + 1)
      )
    WHERE id = NEW.integration_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_sync_completion
  BEFORE UPDATE ON sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION track_sync_completion();

-- Track webhook events
CREATE OR REPLACE FUNCTION track_webhook_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'failed' THEN
    UPDATE integrations
    SET error_count = error_count + 1
    WHERE id = NEW.integration_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_webhook_event
  AFTER INSERT OR UPDATE ON webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION track_webhook_event();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get integration statistics
CREATE OR REPLACE FUNCTION get_integration_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalIntegrations', COUNT(*),
    'connectedIntegrations', COUNT(*) FILTER (WHERE status = 'connected'),
    'byCategory', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM integrations
        WHERE user_id = p_user_id
        GROUP BY category
      ) cat_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM integrations
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'totalSyncs', COALESCE(SUM(total_syncs), 0),
    'totalDataTransferred', COALESCE(SUM(data_transferred), 0),
    'averageSuccessRate', ROUND(AVG(success_rate) FILTER (WHERE status = 'connected'), 2),
    'mostUsed', (
      SELECT json_build_object('name', name, 'syncCount', total_syncs)
      FROM integrations
      WHERE user_id = p_user_id
      ORDER BY total_syncs DESC
      LIMIT 1
    ),
    'recentErrors', COALESCE(SUM(error_count), 0)
  ) INTO v_stats
  FROM integrations
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search integrations
CREATE OR REPLACE FUNCTION search_integrations(
  p_user_id UUID,
  p_search_term TEXT,
  p_category integration_category DEFAULT NULL,
  p_status integration_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  category integration_category,
  status integration_status,
  total_syncs INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.name,
    i.category,
    i.status,
    i.total_syncs,
    ts_rank(
      to_tsvector('english', i.name || ' ' || COALESCE(i.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM integrations i
  WHERE i.user_id = p_user_id
    AND (p_category IS NULL OR i.category = p_category)
    AND (p_status IS NULL OR i.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', i.name || ' ' || COALESCE(i.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, i.total_syncs DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Connect integration
CREATE OR REPLACE FUNCTION connect_integration(
  p_integration_id UUID,
  p_credentials JSONB DEFAULT '{}'::jsonb
)
RETURNS JSON AS $$
DECLARE
  v_integration integrations%ROWTYPE;
BEGIN
  UPDATE integrations
  SET
    status = 'connected',
    connected_at = NOW(),
    credentials = p_credentials,
    error_count = 0,
    updated_at = NOW()
  WHERE id = p_integration_id
  RETURNING * INTO v_integration;

  RETURN json_build_object(
    'success', true,
    'integrationId', v_integration.id,
    'name', v_integration.name,
    'connectedAt', v_integration.connected_at
  );
END;
$$ LANGUAGE plpgsql;

-- Disconnect integration
CREATE OR REPLACE FUNCTION disconnect_integration(p_integration_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE integrations
  SET
    status = 'disconnected',
    credentials = '{}'::jsonb,
    updated_at = NOW()
  WHERE id = p_integration_id;

  -- Remove API keys and OAuth tokens
  DELETE FROM integration_api_keys WHERE integration_id = p_integration_id;
  DELETE FROM integration_oauth_tokens WHERE integration_id = p_integration_id;

  RETURN json_build_object('success', true, 'integrationId', p_integration_id);
END;
$$ LANGUAGE plpgsql;

-- Start sync
CREATE OR REPLACE FUNCTION start_sync(
  p_integration_id UUID,
  p_user_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_sync_id UUID;
BEGIN
  INSERT INTO sync_logs (integration_id, user_id, status)
  VALUES (p_integration_id, p_user_id, 'running')
  RETURNING id INTO v_sync_id;

  RETURN v_sync_id;
END;
$$ LANGUAGE plpgsql;

-- Complete sync
CREATE OR REPLACE FUNCTION complete_sync(
  p_sync_id UUID,
  p_records_processed INTEGER,
  p_records_failed INTEGER,
  p_data_size BIGINT
)
RETURNS JSON AS $$
BEGIN
  UPDATE sync_logs
  SET
    status = 'completed',
    records_processed = p_records_processed,
    records_failed = p_records_failed,
    data_size = p_data_size,
    completed_at = NOW()
  WHERE id = p_sync_id;

  RETURN json_build_object('success', true, 'syncId', p_sync_id);
END;
$$ LANGUAGE plpgsql;

-- Get recent sync logs
CREATE OR REPLACE FUNCTION get_recent_syncs(
  p_integration_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status sync_status,
  records_processed INTEGER,
  data_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sl.id,
    sl.started_at,
    sl.completed_at,
    sl.status,
    sl.records_processed,
    sl.data_size
  FROM sync_logs sl
  WHERE sl.integration_id = p_integration_id
  ORDER BY sl.started_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update integration stats daily
CREATE OR REPLACE FUNCTION update_integration_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO integration_stats (
    user_id,
    date,
    total_integrations,
    connected_integrations,
    category_breakdown,
    status_breakdown,
    total_syncs,
    total_data_transferred,
    average_success_rate,
    most_used_integration_id,
    recent_errors
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'connected'),
    (SELECT get_integration_stats(p_user_id)->>'byCategory')::jsonb,
    (SELECT get_integration_stats(p_user_id)->>'byStatus')::jsonb,
    COALESCE(SUM(total_syncs), 0),
    COALESCE(SUM(data_transferred), 0),
    ROUND(AVG(success_rate) FILTER (WHERE status = 'connected'), 2),
    (SELECT id FROM integrations WHERE user_id = p_user_id ORDER BY total_syncs DESC LIMIT 1),
    COALESCE(SUM(error_count), 0)
  FROM integrations
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_integrations = EXCLUDED.total_integrations,
    connected_integrations = EXCLUDED.connected_integrations,
    category_breakdown = EXCLUDED.category_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    total_syncs = EXCLUDED.total_syncs,
    total_data_transferred = EXCLUDED.total_data_transferred,
    average_success_rate = EXCLUDED.average_success_rate,
    most_used_integration_id = EXCLUDED.most_used_integration_id,
    recent_errors = EXCLUDED.recent_errors,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_oauth_tokens ENABLE ROW LEVEL SECURITY;

-- Integrations Policies
CREATE POLICY integrations_select_policy ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integrations_insert_policy ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integrations_update_policy ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integrations_delete_policy ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Integration Templates Policies (public read)
CREATE POLICY integration_templates_select_policy ON integration_templates
  FOR SELECT USING (true);

-- Webhook Events Policies
CREATE POLICY webhook_events_select_policy ON webhook_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY webhook_events_insert_policy ON webhook_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sync Logs Policies
CREATE POLICY sync_logs_select_policy ON sync_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY sync_logs_insert_policy ON sync_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY sync_logs_update_policy ON sync_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Integration Stats Policies
CREATE POLICY integration_stats_select_policy ON integration_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_stats_insert_policy ON integration_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_stats_update_policy ON integration_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- API Keys Policies
CREATE POLICY integration_api_keys_select_policy ON integration_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_api_keys_insert_policy ON integration_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_api_keys_update_policy ON integration_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integration_api_keys_delete_policy ON integration_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- OAuth Tokens Policies
CREATE POLICY integration_oauth_tokens_select_policy ON integration_oauth_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_insert_policy ON integration_oauth_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_update_policy ON integration_oauth_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY integration_oauth_tokens_delete_policy ON integration_oauth_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all integrations by category
-- SELECT * FROM integrations WHERE user_id = 'user-id' AND category = 'payment' ORDER BY total_syncs DESC;

-- Example: Search integrations
-- SELECT * FROM search_integrations('user-id', 'stripe', NULL, 'connected', 20);

-- Example: Get integration statistics
-- SELECT * FROM get_integration_stats('user-id');

-- Example: Connect integration
-- SELECT * FROM connect_integration('integration-id', '{"api_key": "sk_test_xxx"}'::jsonb);

-- Example: Disconnect integration
-- SELECT * FROM disconnect_integration('integration-id');

-- Example: Start sync
-- SELECT start_sync('integration-id', 'user-id');

-- Example: Complete sync
-- SELECT * FROM complete_sync('sync-id', 1000, 5, 2048);

-- Example: Get recent syncs
-- SELECT * FROM get_recent_syncs('integration-id', 10);

-- Example: Update daily integration stats
-- SELECT update_integration_stats_daily('user-id');

-- =====================================================
-- END OF INTEGRATIONS SYSTEM SCHEMA
-- =====================================================
-- SESSION_14: INVOICES SYSTEM - Production Database Schema
-- World-class invoicing and billing with templates, payments, recurring invoices

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DROP TYPE IF EXISTS invoice_status CASCADE;
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded');
DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'paypal', 'stripe', 'cash', 'check', 'crypto', 'other');
DROP TYPE IF EXISTS template_layout CASCADE;
CREATE TYPE template_layout AS ENUM ('modern', 'classic', 'minimal', 'professional', 'creative');
DROP TYPE IF EXISTS recurring_frequency CASCADE;
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- TABLES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address JSONB,
  project_id UUID,
  project_name TEXT,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_rate NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  issue_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  status invoice_status DEFAULT 'draft',
  payment_method payment_method,
  description TEXT,
  notes TEXT,
  terms TEXT,
  template_id UUID,
  views INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  rate NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  taxable BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout template_layout DEFAULT 'professional',
  colors JSONB NOT NULL,
  logo TEXT,
  header_text TEXT,
  footer_text TEXT,
  show_logo BOOLEAN DEFAULT TRUE,
  show_header BOOLEAN DEFAULT TRUE,
  show_footer BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method payment_method NOT NULL,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_id UUID,
  frequency recurring_frequency NOT NULL,
  interval INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  next_invoice_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  generated_count INTEGER DEFAULT 0,
  max_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_name ON invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_user_id ON recurring_invoices(user_id);

-- RLS POLICIES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own items" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own items" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);

CREATE POLICY "Users view own templates" ON invoice_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own templates" ON invoice_templates FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own payments" ON payments FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users view own recurring" ON recurring_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recurring" ON recurring_invoices FOR ALL USING (auth.uid() = user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoice_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_updated_at();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_invoice_analytics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_invoices', COUNT(*),
    'paid_amount', COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0),
    'pending_amount', COALESCE(SUM(CASE WHEN status IN ('pending','sent') THEN total ELSE 0 END), 0),
    'overdue_amount', COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0)
  ) INTO result FROM invoices WHERE user_id = user_uuid;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE invoices IS 'Invoices with comprehensive tracking';
COMMENT ON TABLE invoice_templates IS 'Customizable invoice templates';
COMMENT ON TABLE payments IS 'Payment records linked to invoices';
COMMENT ON TABLE recurring_invoices IS 'Automated recurring invoice generation';
-- ============================================================================
-- Invoicing System - Production Database Schema
-- ============================================================================
-- Comprehensive invoicing and billing management with recurring invoices,
-- payment tracking, templates, and revenue analytics
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS invoice_status CASCADE;
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded');
DROP TYPE IF EXISTS payment_status CASCADE;
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'check', 'crypto');
DROP TYPE IF EXISTS billing_cycle CASCADE;
CREATE TYPE billing_cycle AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');
DROP TYPE IF EXISTS tax_type CASCADE;
CREATE TYPE tax_type AS ENUM ('percentage', 'fixed');
DROP TYPE IF EXISTS discount_type CASCADE;
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address TEXT,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_type discount_type,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  terms TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recurring Invoices
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  cycle billing_cycle NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE,
  occurrences INTEGER,
  current_occurrence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  reference TEXT,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Templates
CREATE TABLE IF NOT EXISTS invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_terms TEXT,
  default_notes TEXT,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template Items
CREATE TABLE IF NOT EXISTS template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing Stats
CREATE TABLE IF NOT EXISTS billing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  overdue_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_invoice_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_invoices INTEGER NOT NULL DEFAULT 0,
  paid_invoices INTEGER NOT NULL DEFAULT 0,
  pending_invoices INTEGER NOT NULL DEFAULT 0,
  overdue_invoices INTEGER NOT NULL DEFAULT 0,
  cancelled_invoices INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_metadata ON invoices USING GIN(metadata);

-- Invoice Items indexes
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Recurring Invoices indexes
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_invoice_id ON recurring_invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_enabled ON recurring_invoices(enabled) WHERE enabled = TRUE;

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at DESC);

-- Invoice Templates indexes
CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_is_default ON invoice_templates(is_default);

-- Template Items indexes
CREATE INDEX IF NOT EXISTS idx_template_items_template_id ON template_items(template_id);

-- Billing Stats indexes
CREATE INDEX IF NOT EXISTS idx_billing_stats_user_id ON billing_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_stats_updated_at
  BEFORE UPDATE ON billing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate item totals
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_invoice_item_total
  BEFORE INSERT OR UPDATE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

CREATE TRIGGER calculate_template_item_total
  BEFORE INSERT OR UPDATE ON template_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Auto-calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
BEGIN
  -- Calculate subtotal from items
  SELECT COALESCE(SUM(total), 0)
  INTO v_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.id;

  NEW.subtotal = v_subtotal;
  NEW.tax_amount = (v_subtotal - NEW.discount) * (NEW.tax_rate / 100);
  NEW.total = v_subtotal + NEW.tax_amount - NEW.discount;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update billing stats
CREATE OR REPLACE FUNCTION update_billing_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO billing_stats (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO UPDATE SET
    total_revenue = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'paid'
    ),
    pending_amount = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status IN ('sent', 'viewed')
    ),
    overdue_amount = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'overdue'
    ),
    total_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id
    ),
    paid_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'paid'
    ),
    pending_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status IN ('sent', 'viewed')
    ),
    overdue_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'overdue'
    ),
    cancelled_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'cancelled'
    ),
    average_invoice_value = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COALESCE(SUM(total), 0) / COUNT(*), 2)
        ELSE 0
      END
      FROM invoices
      WHERE user_id = EXCLUDED.user_id
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_stats();

-- Auto-mark invoices as overdue
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue', updated_at = NOW()
  WHERE status IN ('sent', 'viewed')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get invoice totals
CREATE OR REPLACE FUNCTION get_invoice_totals(p_invoice_id UUID)
RETURNS TABLE(
  subtotal DECIMAL,
  tax_amount DECIMAL,
  total DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.subtotal, i.tax_amount, i.total
  FROM invoices i
  WHERE i.id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Get outstanding invoices
CREATE OR REPLACE FUNCTION get_outstanding_invoices(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  invoice_number TEXT,
  client_name TEXT,
  total DECIMAL,
  due_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.invoice_number, i.client_name, i.total, i.due_date
  FROM invoices i
  WHERE i.user_id = p_user_id
    AND i.status NOT IN ('paid', 'cancelled')
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue for period
CREATE OR REPLACE FUNCTION calculate_revenue(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_revenue DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(total), 0)
  INTO v_revenue
  FROM invoices
  WHERE user_id = p_user_id
    AND status = 'paid'
    AND (p_start_date IS NULL OR paid_date >= p_start_date)
    AND (p_end_date IS NULL OR paid_date <= p_end_date);

  RETURN v_revenue;
END;
$$ LANGUAGE plpgsql;

-- Generate next invoice from recurring
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_id UUID)
RETURNS UUID AS $$
DECLARE
  v_original_invoice invoices%ROWTYPE;
  v_recurring recurring_invoices%ROWTYPE;
  v_new_invoice_id UUID;
  v_new_invoice_number TEXT;
BEGIN
  -- Get recurring config
  SELECT * INTO v_recurring FROM recurring_invoices WHERE id = p_recurring_id;

  IF NOT FOUND OR NOT v_recurring.enabled THEN
    RETURN NULL;
  END IF;

  -- Get original invoice
  SELECT * INTO v_original_invoice FROM invoices WHERE id = v_recurring.invoice_id;

  -- Generate new invoice number
  v_new_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY-MM-') || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');

  -- Create new invoice
  INSERT INTO invoices (
    user_id, invoice_number, client_id, client_name, client_email,
    client_address, tax_rate, discount, discount_type, currency,
    status, issue_date, due_date, notes, terms
  )
  VALUES (
    v_original_invoice.user_id, v_new_invoice_number, v_original_invoice.client_id,
    v_original_invoice.client_name, v_original_invoice.client_email,
    v_original_invoice.client_address, v_original_invoice.tax_rate,
    v_original_invoice.discount, v_original_invoice.discount_type,
    v_original_invoice.currency, 'draft', CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days', v_original_invoice.notes,
    v_original_invoice.terms
  )
  RETURNING id INTO v_new_invoice_id;

  -- Copy items
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
  SELECT v_new_invoice_id, description, quantity, unit_price
  FROM invoice_items
  WHERE invoice_id = v_recurring.invoice_id;

  -- Update recurring config
  UPDATE recurring_invoices
  SET
    current_occurrence = current_occurrence + 1,
    next_invoice_date = CASE v_recurring.cycle
      WHEN 'weekly' THEN next_invoice_date + INTERVAL '7 days'
      WHEN 'monthly' THEN next_invoice_date + INTERVAL '1 month'
      WHEN 'quarterly' THEN next_invoice_date + INTERVAL '3 months'
      WHEN 'yearly' THEN next_invoice_date + INTERVAL '1 year'
      ELSE next_invoice_date
    END,
    updated_at = NOW()
  WHERE id = p_recurring_id;

  RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_stats ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id);

-- Invoice Items policies
CREATE POLICY "Users can view items of their invoices"
  ON invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage items of their invoices"
  ON invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
  ));

-- Recurring Invoices policies
CREATE POLICY "Users can manage their recurring invoices"
  ON recurring_invoices FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = recurring_invoices.invoice_id AND user_id = auth.uid()
  ));

-- Payments policies
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their payments"
  ON payments FOR ALL
  USING (auth.uid() = user_id);

-- Invoice Templates policies
CREATE POLICY "Users can manage their templates"
  ON invoice_templates FOR ALL
  USING (auth.uid() = user_id);

-- Template Items policies
CREATE POLICY "Users can manage their template items"
  ON template_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoice_templates WHERE id = template_items.template_id AND user_id = auth.uid()
  ));

-- Billing Stats policies
CREATE POLICY "Users can view their own stats"
  ON billing_stats FOR SELECT
  USING (auth.uid() = user_id);
-- ============================================================================
-- Messages Hub Database Schema
-- World-class A+++ messaging system with real-time capabilities
--
-- Features:
-- - Direct messages, group chats, and channels
-- - File attachments and media sharing
-- - Emoji reactions and message threads
-- - Read receipts and typing indicators
-- - User mentions and hashtags
-- - Chat permissions and roles
-- - Message search with full-text
-- - Real-time subscriptions
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS chat_type CASCADE;
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');
DROP TYPE IF EXISTS message_type CASCADE;
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'location', 'contact');
DROP TYPE IF EXISTS message_status CASCADE;
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
DROP TYPE IF EXISTS member_role CASCADE;
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
DROP TYPE IF EXISTS attachment_type CASCADE;
CREATE TYPE attachment_type AS ENUM ('image', 'video', 'audio', 'document', 'other');
DROP TYPE IF EXISTS invite_status CASCADE;
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Chats table (direct, group, channel conversations)
CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    type chat_type NOT NULL DEFAULT 'direct',
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT chats_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT chats_description_length CHECK (description IS NULL OR char_length(description) <= 500)
);

-- Chat members (users in chats with roles)
CREATE TABLE IF NOT EXISTS chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    mute_until TIMESTAMPTZ,
    custom_status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (chat_id, user_id),
    CONSTRAINT chat_members_custom_status_length CHECK (custom_status IS NULL OR char_length(custom_status) <= 100)
);

-- Messages table (all message types)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    status message_status NOT NULL DEFAULT 'sent',
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_id UUID,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_at TIMESTAMPTZ,
    pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,

    CONSTRAINT messages_text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 10000)
);

-- Message reactions (emoji reactions to messages)
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, user_id, emoji),
    CONSTRAINT message_reactions_emoji_length CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10)
);

-- Message attachments (files, images, videos)
CREATE TABLE IF NOT EXISTS message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type attachment_type NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT message_attachments_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT message_attachments_size CHECK (size_bytes > 0 AND size_bytes <= 52428800) -- 50MB max
);

-- Message mentions (user mentions in messages)
CREATE TABLE IF NOT EXISTS message_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, mentioned_user_id)
);

-- Message read receipts (tracking who read which messages)
CREATE TABLE IF NOT EXISTS message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, user_id)
);

-- Chat settings (per-user chat preferences)
CREATE TABLE IF NOT EXISTS chat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    mute_until TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    theme TEXT,
    background_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (chat_id, user_id)
);

-- Typing indicators (real-time typing status)
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 seconds'),

    UNIQUE (chat_id, user_id)
);

-- Message threads (threaded conversations)
CREATE TABLE IF NOT EXISTS message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    participant_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (parent_message_id)
);

-- Chat invites (invitation system for group chats)
CREATE TABLE IF NOT EXISTS chat_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status invite_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,

    CONSTRAINT chat_invites_email_format CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Blocked users (user blocking system)
CREATE TABLE IF NOT EXISTS blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (blocker_id, blocked_id),
    CONSTRAINT blocked_users_not_self CHECK (blocker_id != blocked_id)
);

-- ============================================================================
-- INDEXES (40+ indexes for optimal performance)
-- ============================================================================

-- Chats indexes
CREATE INDEX IF NOT EXISTS idx_chats_creator ON chats(creator_id);
CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
CREATE INDEX IF NOT EXISTS idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chats_last_message_at ON chats(last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_chats_archived ON chats(is_archived) WHERE is_archived = TRUE;

-- Chat members indexes
CREATE INDEX IF NOT EXISTS idx_chat_members_chat ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_role ON chat_members(role);
CREATE INDEX IF NOT EXISTS idx_chat_members_joined_at ON chat_members(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_members_active ON chat_members(chat_id, user_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chat_members_muted ON chat_members(user_id) WHERE is_muted = TRUE;

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_pinned ON messages(chat_id) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(is_deleted);
CREATE INDEX IF NOT EXISTS idx_messages_search ON messages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

-- Message reactions indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_emoji ON message_reactions(emoji);
CREATE INDEX IF NOT EXISTS idx_message_reactions_created_at ON message_reactions(created_at DESC);

-- Message attachments indexes
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_attachments_type ON message_attachments(type);
CREATE INDEX IF NOT EXISTS idx_message_attachments_created_at ON message_attachments(created_at DESC);

-- Message mentions indexes
CREATE INDEX IF NOT EXISTS idx_message_mentions_message ON message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_user ON message_mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_created_at ON message_mentions(created_at DESC);

-- Message read receipts indexes
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_user ON message_read_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_message_read_receipts_read_at ON message_read_receipts(read_at DESC);

-- Chat settings indexes
CREATE INDEX IF NOT EXISTS idx_chat_settings_chat ON chat_settings(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_user ON chat_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_settings_pinned ON chat_settings(user_id) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_chat_settings_archived ON chat_settings(user_id) WHERE is_archived = TRUE;

-- Typing indicators indexes
CREATE INDEX IF NOT EXISTS idx_typing_indicators_chat ON typing_indicators(chat_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_user ON typing_indicators(user_id);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_expires ON typing_indicators(expires_at);

-- Message threads indexes
CREATE INDEX IF NOT EXISTS idx_message_threads_parent ON message_threads(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_chat ON message_threads(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_threads_activity ON message_threads(last_activity_at DESC);

-- Chat invites indexes
CREATE INDEX IF NOT EXISTS idx_chat_invites_chat ON chat_invites(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_invites_inviter ON chat_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_chat_invites_email ON chat_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_chat_invites_status ON chat_invites(status);
CREATE INDEX IF NOT EXISTS idx_chat_invites_expires ON chat_invites(expires_at);

-- Blocked users indexes
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update chats.updated_at on changes
CREATE OR REPLACE FUNCTION update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_chats_updated_at();

-- Update chats.last_message_at when message created
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_message();

-- Update message search vector on insert/update
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', COALESCE(NEW.text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_search_vector
    BEFORE INSERT OR UPDATE OF text ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_search_vector();

-- Increment thread message count
CREATE OR REPLACE FUNCTION increment_thread_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.thread_id IS NOT NULL THEN
        UPDATE message_threads
        SET message_count = message_count + 1,
            last_activity_at = NOW()
        WHERE id = NEW.thread_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_thread_message_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_thread_message_count();

-- Clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM typing_indicators
    WHERE expires_at < NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_expired_typing_indicators
    BEFORE INSERT ON typing_indicators
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_expired_typing_indicators();

-- Update chat settings timestamp
CREATE OR REPLACE FUNCTION update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_settings_updated_at
    BEFORE UPDATE ON chat_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_settings_updated_at();

-- Expire old chat invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_invites
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expire_old_invites
    BEFORE INSERT ON chat_invites
    FOR EACH ROW
    EXECUTE FUNCTION expire_old_invites();

-- Set message edited timestamp
CREATE OR REPLACE FUNCTION set_message_edited_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_edited = TRUE AND OLD.is_edited = FALSE THEN
        NEW.edited_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_message_edited_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_edited_timestamp();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get unread message count for user in chat
CREATE OR REPLACE FUNCTION get_unread_count(p_chat_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_read_at TIMESTAMPTZ;
    v_unread_count INTEGER;
BEGIN
    -- Get user's last read timestamp
    SELECT last_read_at INTO v_last_read_at
    FROM chat_members
    WHERE chat_id = p_chat_id AND user_id = p_user_id;

    -- Count unread messages
    SELECT COUNT(*)::INTEGER INTO v_unread_count
    FROM messages
    WHERE chat_id = p_chat_id
        AND sender_id != p_user_id
        AND is_deleted = FALSE
        AND (v_last_read_at IS NULL OR created_at > v_last_read_at);

    RETURN COALESCE(v_unread_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Mark all messages as read in chat
CREATE OR REPLACE FUNCTION mark_chat_as_read(p_chat_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update last_read_at for user
    UPDATE chat_members
    SET last_read_at = NOW()
    WHERE chat_id = p_chat_id AND user_id = p_user_id;

    -- Insert read receipts for unread messages
    INSERT INTO message_read_receipts (message_id, user_id)
    SELECT m.id, p_user_id
    FROM messages m
    LEFT JOIN message_read_receipts mrr ON mrr.message_id = m.id AND mrr.user_id = p_user_id
    WHERE m.chat_id = p_chat_id
        AND m.sender_id != p_user_id
        AND mrr.id IS NULL
    ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Get chat members with online status
CREATE OR REPLACE FUNCTION get_chat_members_with_status(p_chat_id UUID)
RETURNS TABLE (
    user_id UUID,
    role member_role,
    is_online BOOLEAN,
    last_seen TIMESTAMPTZ,
    custom_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.user_id,
        cm.role,
        -- In production, this would check a real-time presence table
        (EXTRACT(EPOCH FROM (NOW() - cm.joined_at)) < 300) AS is_online,
        cm.joined_at AS last_seen,
        cm.custom_status
    FROM chat_members cm
    WHERE cm.chat_id = p_chat_id
        AND cm.left_at IS NULL
    ORDER BY cm.role DESC, cm.joined_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Search messages with full-text search
CREATE OR REPLACE FUNCTION search_messages(
    p_user_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_id UUID,
    chat_id UUID,
    text TEXT,
    sender_id UUID,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.chat_id,
        m.text,
        m.sender_id,
        m.created_at,
        ts_rank(m.search_vector, plainto_tsquery('english', p_query)) AS rank
    FROM messages m
    INNER JOIN chat_members cm ON cm.chat_id = m.chat_id AND cm.user_id = p_user_id
    WHERE m.search_vector @@ plainto_tsquery('english', p_query)
        AND m.is_deleted = FALSE
        AND cm.left_at IS NULL
    ORDER BY rank DESC, m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get chat statistics
CREATE OR REPLACE FUNCTION get_chat_statistics(p_chat_id UUID)
RETURNS TABLE (
    total_messages BIGINT,
    total_members BIGINT,
    active_members BIGINT,
    total_attachments BIGINT,
    total_reactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM messages WHERE chat_id = p_chat_id AND is_deleted = FALSE),
        (SELECT COUNT(*) FROM chat_members WHERE chat_id = p_chat_id),
        (SELECT COUNT(*) FROM chat_members WHERE chat_id = p_chat_id AND left_at IS NULL),
        (SELECT COUNT(*) FROM message_attachments ma INNER JOIN messages m ON m.id = ma.message_id WHERE m.chat_id = p_chat_id),
        (SELECT COUNT(*) FROM message_reactions mr INNER JOIN messages m ON m.id = mr.message_id WHERE m.chat_id = p_chat_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Chats policies
CREATE POLICY "Users can view chats they are members of"
    ON chats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can create chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Chat owners and admins can update chats"
    ON chats FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Chat owners can delete chats"
    ON chats FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role = 'owner'
        )
    );

-- Chat members policies
CREATE POLICY "Users can view members of their chats"
    ON chat_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Admins can add members"
    ON chat_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chat_members.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update their own membership"
    ON chat_members FOR UPDATE
    USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their chats"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = messages.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
        AND NOT EXISTS (
            SELECT 1 FROM blocked_users
            WHERE blocked_users.blocker_id = auth.uid()
                AND blocked_users.blocked_id = messages.sender_id
        )
    );

CREATE POLICY "Users can send messages to their chats"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = messages.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "Users can view reactions in their chats"
    ON message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_reactions.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can add reactions"
    ON message_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
    ON message_reactions FOR DELETE
    USING (user_id = auth.uid());

-- Message attachments policies
CREATE POLICY "Users can view attachments in their chats"
    ON message_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_attachments.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can add attachments to their messages"
    ON message_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_attachments.message_id
                AND messages.sender_id = auth.uid()
        )
    );

-- Message mentions policies
CREATE POLICY "Users can view mentions in their chats"
    ON message_mentions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_mentions.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can create mentions in their messages"
    ON message_mentions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_mentions.message_id
                AND messages.sender_id = auth.uid()
        )
    );

-- Message read receipts policies
CREATE POLICY "Users can view read receipts in their chats"
    ON message_read_receipts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_read_receipts.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can mark messages as read"
    ON message_read_receipts FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Chat settings policies
CREATE POLICY "Users can view their own chat settings"
    ON chat_settings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat settings"
    ON chat_settings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat settings"
    ON chat_settings FOR UPDATE
    USING (user_id = auth.uid());

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their chats"
    ON typing_indicators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = typing_indicators.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can set their own typing status"
    ON typing_indicators FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own typing status"
    ON typing_indicators FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can remove their own typing status"
    ON typing_indicators FOR DELETE
    USING (user_id = auth.uid());

-- Message threads policies
CREATE POLICY "Users can view threads in their chats"
    ON message_threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = message_threads.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can create threads in their chats"
    ON message_threads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = message_threads.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

-- Chat invites policies
CREATE POLICY "Users can view invites they sent"
    ON chat_invites FOR SELECT
    USING (inviter_id = auth.uid());

CREATE POLICY "Admins can create invites"
    ON chat_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chat_invites.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Inviter can update their invites"
    ON chat_invites FOR UPDATE
    USING (inviter_id = auth.uid());

-- Blocked users policies
CREATE POLICY "Users can view their own blocks"
    ON blocked_users FOR SELECT
    USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others"
    ON blocked_users FOR DELETE
    USING (blocker_id = auth.uid());

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE chats IS 'Main chats table supporting direct messages, group chats, and channels';
COMMENT ON TABLE chat_members IS 'Chat membership with roles and permissions';
COMMENT ON TABLE messages IS 'All messages with support for text, media, and files';
COMMENT ON TABLE message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE message_attachments IS 'File attachments for messages';
COMMENT ON TABLE message_mentions IS 'User mentions in messages';
COMMENT ON TABLE message_read_receipts IS 'Read status tracking for messages';
COMMENT ON TABLE chat_settings IS 'Per-user chat preferences and settings';
COMMENT ON TABLE typing_indicators IS 'Real-time typing status indicators';
COMMENT ON TABLE message_threads IS 'Threaded conversation support';
COMMENT ON TABLE chat_invites IS 'Invitation system for group chats';
COMMENT ON TABLE blocked_users IS 'User blocking for privacy';

COMMENT ON FUNCTION get_unread_count(UUID, UUID) IS 'Returns unread message count for user in chat';
COMMENT ON FUNCTION mark_chat_as_read(UUID, UUID) IS 'Marks all messages in chat as read for user';
COMMENT ON FUNCTION get_chat_members_with_status(UUID) IS 'Returns chat members with online status';
COMMENT ON FUNCTION search_messages(UUID, TEXT, INTEGER) IS 'Full-text search across user messages';
COMMENT ON FUNCTION get_chat_statistics(UUID) IS 'Returns comprehensive chat statistics';

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Uncomment to insert sample data for testing:
-- INSERT INTO chats (id, name, type, creator_id) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'General', 'channel', auth.uid());
