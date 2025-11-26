-- ============================================================================
-- Growth Hub System - Production Database Schema
-- ============================================================================
-- AI-powered growth strategy management with personalized roadmaps,
-- user type-specific strategies, quick wins, and business scaling tools
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE user_type AS ENUM ('freelancer', 'entrepreneur', 'startup', 'enterprise', 'creative');
CREATE TYPE growth_goal_type AS ENUM ('monetize', 'acquire', 'scale', 'optimize');
CREATE TYPE strategy_status AS ENUM ('draft', 'active', 'completed', 'paused', 'archived');
CREATE TYPE priority_level AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE timeframe_type AS ENUM ('3-months', '6-months', '12-months', '24-months');
CREATE TYPE metric_type AS ENUM ('revenue', 'clients', 'efficiency', 'profit', 'growth-rate');
CREATE TYPE action_category AS ENUM ('pricing', 'marketing', 'operations', 'sales', 'product', 'team');
CREATE TYPE probability_type AS ENUM ('low', 'medium', 'high', 'very-high');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Growth Strategies
CREATE TABLE growth_strategies (
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
CREATE TABLE quick_wins (
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
CREATE TABLE monthly_plans (
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
CREATE TABLE milestones (
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
CREATE TABLE kpis (
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
CREATE TABLE priority_actions (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Growth Templates
CREATE TABLE growth_templates (
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
CREATE TABLE user_type_profiles (
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
CREATE INDEX idx_growth_strategies_user_id ON growth_strategies(user_id);
CREATE INDEX idx_growth_strategies_status ON growth_strategies(status);
CREATE INDEX idx_growth_strategies_user_type ON growth_strategies(user_type);
CREATE INDEX idx_growth_strategies_goal_type ON growth_strategies(goal_type);
CREATE INDEX idx_growth_strategies_created_at ON growth_strategies(created_at DESC);
CREATE INDEX idx_growth_strategies_target_revenue ON growth_strategies(target_revenue);
CREATE INDEX idx_growth_strategies_user_status ON growth_strategies(user_id, status);
CREATE INDEX idx_growth_strategies_completed ON growth_strategies(completed_at) WHERE completed_at IS NOT NULL;

-- Quick Wins indexes
CREATE INDEX idx_quick_wins_strategy_id ON quick_wins(strategy_id);
CREATE INDEX idx_quick_wins_category ON quick_wins(category);
CREATE INDEX idx_quick_wins_completed ON quick_wins(completed);
CREATE INDEX idx_quick_wins_difficulty ON quick_wins(difficulty);
CREATE INDEX idx_quick_wins_strategy_completed ON quick_wins(strategy_id, completed);

-- Monthly Plans indexes
CREATE INDEX idx_monthly_plans_strategy_id ON monthly_plans(strategy_id);
CREATE INDEX idx_monthly_plans_month ON monthly_plans(month);
CREATE INDEX idx_monthly_plans_completed ON monthly_plans(completed);
CREATE INDEX idx_monthly_plans_strategy_month ON monthly_plans(strategy_id, month);

-- Milestones indexes
CREATE INDEX idx_milestones_plan_id ON milestones(monthly_plan_id);
CREATE INDEX idx_milestones_target_date ON milestones(target_date);
CREATE INDEX idx_milestones_completed ON milestones(completed);
CREATE INDEX idx_milestones_plan_completed ON milestones(monthly_plan_id, completed);

-- KPIs indexes
CREATE INDEX idx_kpis_plan_id ON kpis(monthly_plan_id);
CREATE INDEX idx_kpis_metric ON kpis(metric);
CREATE INDEX idx_kpis_plan_metric ON kpis(monthly_plan_id, metric);

-- Priority Actions indexes
CREATE INDEX idx_priority_actions_strategy_id ON priority_actions(strategy_id);
CREATE INDEX idx_priority_actions_category ON priority_actions(category);
CREATE INDEX idx_priority_actions_priority ON priority_actions(priority);
CREATE INDEX idx_priority_actions_timeframe ON priority_actions(timeframe);
CREATE INDEX idx_priority_actions_completed ON priority_actions(completed);
CREATE INDEX idx_priority_actions_strategy_priority ON priority_actions(strategy_id, priority);

-- Growth Metrics indexes
CREATE INDEX idx_growth_metrics_user_id ON growth_metrics(user_id);
CREATE INDEX idx_growth_metrics_strategy_id ON growth_metrics(strategy_id);
CREATE INDEX idx_growth_metrics_month ON growth_metrics(month);
CREATE INDEX idx_growth_metrics_date ON growth_metrics(metric_date DESC);
CREATE INDEX idx_growth_metrics_strategy_month ON growth_metrics(strategy_id, month);
CREATE INDEX idx_growth_metrics_user_date ON growth_metrics(user_id, metric_date DESC);

-- Growth Templates indexes
CREATE INDEX idx_growth_templates_user_type ON growth_templates(user_type);
CREATE INDEX idx_growth_templates_goal_type ON growth_templates(goal_type);
CREATE INDEX idx_growth_templates_usage ON growth_templates(usage_count DESC);
CREATE INDEX idx_growth_templates_type_goal ON growth_templates(user_type, goal_type);

-- User Type Profiles indexes
CREATE INDEX idx_user_type_profiles_type ON user_type_profiles(type);

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
