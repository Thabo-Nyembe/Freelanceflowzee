-- ============================================================================
-- CONSOLIDATED MIGRATIONS - All System Schemas
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new
-- ============================================================================

-- First, create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RECENT MIGRATIONS (Sessions 45-54)
-- ============================================================================

-- ============================================================================
-- 20251126_growth_hub_system.sql
-- ============================================================================
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

-- ============================================================================
-- 20251126_email_agent_setup_system.sql
-- ============================================================================
-- ============================================================================
-- Email Agent Setup System - Production Database Schema
-- ============================================================================
-- Comprehensive setup wizard management for email agent integrations including
-- email providers, AI, calendar, payments, SMS, and CRM systems
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE setup_step AS ENUM ('welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete');
CREATE TYPE integration_type AS ENUM ('email', 'ai', 'calendar', 'payment', 'sms', 'crm');
CREATE TYPE integration_status AS ENUM ('not_configured', 'configuring', 'testing', 'connected', 'error', 'disconnected');
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'imap', 'resend', 'sendgrid');
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'both', 'google', 'cohere');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple', 'none');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'square', 'none');
CREATE TYPE sms_provider AS ENUM ('twilio', 'vonage', 'messagebird', 'none');
CREATE TYPE crm_provider AS ENUM ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'none');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Setup Progress
CREATE TABLE setup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step setup_step NOT NULL DEFAULT 'welcome',
  completed_steps setup_step[] DEFAULT '{}',
  total_steps INTEGER NOT NULL DEFAULT 9,
  percentage INTEGER NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  required_integrations INTEGER NOT NULL DEFAULT 2,
  configured_integrations INTEGER NOT NULL DEFAULT 0,
  optional_integrations INTEGER NOT NULL DEFAULT 4,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'not_configured',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  icon TEXT NOT NULL,
  description TEXT,
  error TEXT,
  connected_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Integration Config
CREATE TABLE integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  api_endpoint TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test Results
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  latency INTEGER, -- milliseconds
  error TEXT,
  details JSONB DEFAULT '{}',
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Configs
CREATE TABLE email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider email_provider NOT NULL,
  email TEXT,
  api_key TEXT,
  password TEXT, -- encrypted
  host TEXT,
  port INTEGER,
  secure BOOLEAN DEFAULT TRUE,
  auto_reply BOOLEAN DEFAULT FALSE,
  forward_to TEXT,
  signature TEXT,
  max_emails_per_day INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Configs
CREATE TABLE ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider ai_provider NOT NULL,
  api_key TEXT NOT NULL, -- encrypted
  model TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,
  enable_sentiment_analysis BOOLEAN DEFAULT TRUE,
  enable_auto_response BOOLEAN DEFAULT TRUE,
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'casual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Configs
CREATE TABLE calendar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider calendar_provider NOT NULL,
  credentials JSONB DEFAULT '{}',
  default_duration INTEGER DEFAULT 60, -- minutes
  buffer_time INTEGER DEFAULT 15, -- minutes
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Configs
CREATE TABLE payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider payment_provider NOT NULL,
  api_key TEXT, -- encrypted
  secret_key TEXT, -- encrypted
  webhook_secret TEXT, -- encrypted
  currency TEXT DEFAULT 'USD',
  accepted_methods TEXT[] DEFAULT ARRAY['card'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Configs
CREATE TABLE sms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider sms_provider NOT NULL,
  account_sid TEXT, -- encrypted
  auth_token TEXT, -- encrypted
  phone_number TEXT,
  enable_whatsapp BOOLEAN DEFAULT FALSE,
  default_country_code TEXT DEFAULT '+1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Configs
CREATE TABLE crm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider crm_provider NOT NULL,
  api_key TEXT, -- encrypted
  domain TEXT,
  sync_interval INTEGER DEFAULT 3600, -- seconds
  auto_create_contacts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider Templates (read-only reference data)
CREATE TABLE provider_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER NOT NULL, -- minutes
  requirements TEXT[] DEFAULT '{}',
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'paid', 'freemium')),
  starting_price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(type, provider)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Setup Progress indexes
CREATE INDEX idx_setup_progress_user_id ON setup_progress(user_id);
CREATE INDEX idx_setup_progress_current_step ON setup_progress(current_step);
CREATE INDEX idx_setup_progress_is_complete ON setup_progress(is_complete);

-- Integrations indexes
CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_type ON integrations(type);
CREATE INDEX idx_integrations_status ON integrations(status);
CREATE INDEX idx_integrations_provider ON integrations(provider);
CREATE INDEX idx_integrations_required ON integrations(required);
CREATE INDEX idx_integrations_user_type ON integrations(user_id, type);
CREATE INDEX idx_integrations_user_status ON integrations(user_id, status);

-- Integration Config indexes
CREATE INDEX idx_integration_config_integration_id ON integration_config(integration_id);
CREATE INDEX idx_integration_config_enabled ON integration_config(enabled);

-- Test Results indexes
CREATE INDEX idx_test_results_integration_id ON test_results(integration_id);
CREATE INDEX idx_test_results_success ON test_results(success);
CREATE INDEX idx_test_results_tested_at ON test_results(tested_at DESC);

-- Email Configs indexes
CREATE INDEX idx_email_configs_user_id ON email_configs(user_id);
CREATE INDEX idx_email_configs_provider ON email_configs(provider);

-- AI Configs indexes
CREATE INDEX idx_ai_configs_user_id ON ai_configs(user_id);
CREATE INDEX idx_ai_configs_provider ON ai_configs(provider);

-- Calendar Configs indexes
CREATE INDEX idx_calendar_configs_user_id ON calendar_configs(user_id);
CREATE INDEX idx_calendar_configs_provider ON calendar_configs(provider);

-- Payment Configs indexes
CREATE INDEX idx_payment_configs_user_id ON payment_configs(user_id);
CREATE INDEX idx_payment_configs_provider ON payment_configs(provider);

-- SMS Configs indexes
CREATE INDEX idx_sms_configs_user_id ON sms_configs(user_id);
CREATE INDEX idx_sms_configs_provider ON sms_configs(provider);

-- CRM Configs indexes
CREATE INDEX idx_crm_configs_user_id ON crm_configs(user_id);
CREATE INDEX idx_crm_configs_provider ON crm_configs(provider);

-- Provider Templates indexes
CREATE INDEX idx_provider_templates_type ON provider_templates(type);
CREATE INDEX idx_provider_templates_provider ON provider_templates(provider);
CREATE INDEX idx_provider_templates_recommended ON provider_templates(recommended);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_setup_progress_updated_at
  BEFORE UPDATE ON setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_config_updated_at
  BEFORE UPDATE ON integration_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_configs_updated_at
  BEFORE UPDATE ON email_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configs_updated_at
  BEFORE UPDATE ON ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_configs_updated_at
  BEFORE UPDATE ON calendar_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_configs_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_configs_updated_at
  BEFORE UPDATE ON sms_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_configs_updated_at
  BEFORE UPDATE ON crm_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update setup progress percentage
CREATE OR REPLACE FUNCTION update_setup_percentage()
RETURNS TRIGGER AS $$
DECLARE
  v_required_configured INTEGER;
  v_optional_configured INTEGER;
  v_required_total INTEGER;
  v_optional_total INTEGER;
BEGIN
  -- Count configured integrations
  SELECT
    COUNT(*) FILTER (WHERE required = TRUE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = FALSE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = TRUE),
    COUNT(*) FILTER (WHERE required = FALSE)
  INTO v_required_configured, v_optional_configured, v_required_total, v_optional_total
  FROM integrations
  WHERE user_id = NEW.user_id;

  -- Update setup progress
  UPDATE setup_progress
  SET
    configured_integrations = v_required_configured,
    percentage = CASE
      WHEN v_required_total > 0 THEN
        FLOOR(
          (v_required_configured::DECIMAL / v_required_total * 70) +
          (CASE WHEN v_optional_total > 0 THEN v_optional_configured::DECIMAL / v_optional_total * 30 ELSE 0 END)
        )
      ELSE 0
    END,
    is_complete = (v_required_configured = v_required_total),
    completed_at = CASE
      WHEN (v_required_configured = v_required_total) AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_setup_percentage
  AFTER INSERT OR UPDATE OF status ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_percentage();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get setup progress for user
CREATE OR REPLACE FUNCTION get_setup_progress(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_progress JSON;
BEGIN
  SELECT json_build_object(
    'currentStep', sp.current_step,
    'completedSteps', sp.completed_steps,
    'totalSteps', sp.total_steps,
    'percentage', sp.percentage,
    'integrations', json_build_object(
      'required', sp.required_integrations,
      'configured', sp.configured_integrations,
      'optional', sp.optional_integrations
    ),
    'isComplete', sp.is_complete,
    'startedAt', sp.started_at,
    'completedAt', sp.completed_at
  )
  INTO v_progress
  FROM setup_progress sp
  WHERE sp.user_id = p_user_id;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Get integrations by status
CREATE OR REPLACE FUNCTION get_integrations_by_status(p_user_id UUID, p_status integration_status)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status,
  required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status, i.required
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.status = p_status
  ORDER BY i.required DESC, i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get required integrations
CREATE OR REPLACE FUNCTION get_required_integrations(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.required = TRUE
  ORDER BY i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Check if setup is complete
CREATE OR REPLACE FUNCTION is_setup_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_complete BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM integrations
    WHERE user_id = p_user_id
      AND required = TRUE
      AND status != 'connected'
  )
  INTO v_complete;

  RETURN v_complete;
END;
$$ LANGUAGE plpgsql;

-- Get integration config
CREATE OR REPLACE FUNCTION get_integration_config(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_config JSON;
BEGIN
  SELECT json_build_object(
    'provider', ic.provider,
    'credentials', ic.credentials,
    'settings', ic.settings,
    'webhookUrl', ic.webhook_url,
    'apiEndpoint', ic.api_endpoint,
    'enabled', ic.enabled
  )
  INTO v_config
  FROM integration_config ic
  WHERE ic.integration_id = p_integration_id;

  RETURN v_config;
END;
$$ LANGUAGE plpgsql;

-- Get test results for integration
CREATE OR REPLACE FUNCTION get_latest_test_results(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_results JSON;
BEGIN
  SELECT json_build_object(
    'success', tr.success,
    'latency', tr.latency,
    'error', tr.error,
    'details', tr.details,
    'testedAt', tr.tested_at
  )
  INTO v_results
  FROM test_results tr
  WHERE tr.integration_id = p_integration_id
  ORDER BY tr.tested_at DESC
  LIMIT 1;

  RETURN v_results;
END;
$$ LANGUAGE plpgsql;

-- Get recommended providers for integration type
CREATE OR REPLACE FUNCTION get_recommended_providers(p_type integration_type)
RETURNS TABLE(
  provider TEXT,
  name TEXT,
  icon TEXT,
  color TEXT,
  features TEXT[],
  difficulty TEXT,
  estimated_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.provider,
    pt.name,
    pt.icon,
    pt.color,
    pt.features,
    pt.difficulty,
    pt.estimated_time
  FROM provider_templates pt
  WHERE pt.type = p_type AND pt.recommended = TRUE
  ORDER BY pt.estimated_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Estimate total setup time
CREATE OR REPLACE FUNCTION estimate_setup_time(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_time INTEGER;
BEGIN
  SELECT COALESCE(SUM(pt.estimated_time), 0)
  INTO v_total_time
  FROM integrations i
  JOIN provider_templates pt ON pt.type = i.type AND pt.provider = LOWER(i.provider)
  WHERE i.user_id = p_user_id
    AND i.status != 'connected';

  RETURN v_total_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE setup_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_templates ENABLE ROW LEVEL SECURITY;

-- Setup Progress policies
CREATE POLICY "Users can view their own setup progress"
  ON setup_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup progress"
  ON setup_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress"
  ON setup_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Integration Config policies
CREATE POLICY "Users can view config for their integrations"
  ON integration_config FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create config for their integrations"
  ON integration_config FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update config for their integrations"
  ON integration_config FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

-- Test Results policies
CREATE POLICY "Users can view test results for their integrations"
  ON test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create test results for their integrations"
  ON test_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

-- Config tables policies (same pattern for all)
CREATE POLICY "Users can view their own email config"
  ON email_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email config"
  ON email_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI config"
  ON ai_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI config"
  ON ai_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar config"
  ON calendar_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar config"
  ON calendar_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment config"
  ON payment_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment config"
  ON payment_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS config"
  ON sms_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own SMS config"
  ON sms_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own CRM config"
  ON crm_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CRM config"
  ON crm_configs FOR ALL
  USING (auth.uid() = user_id);

-- Provider Templates policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view provider templates"
  ON provider_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED DATA (Provider Templates)
-- ============================================================================

-- Email Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('email', 'gmail', 'Gmail', 'Mail', 'bg-red-500', true,
   ARRAY['OAuth 2.0', 'High deliverability', 'Free tier', 'Easy setup'],
   'easy', 5, ARRAY['Google Account', 'OAuth consent screen'], 'free'),
  ('email', 'outlook', 'Outlook', 'Mail', 'bg-blue-500', true,
   ARRAY['Microsoft Graph API', 'Enterprise ready', 'Office 365 integration'],
   'easy', 5, ARRAY['Microsoft Account', 'Azure AD app'], 'free'),
  ('email', 'resend', 'Resend', 'Mail', 'bg-purple-500', false,
   ARRAY['Developer-first', 'API-based', 'Analytics', 'High deliverability'],
   'easy', 2, ARRAY['Resend account', 'API key', 'Domain verification'], 'freemium'),
  ('email', 'sendgrid', 'SendGrid', 'Mail', 'bg-cyan-500', false,
   ARRAY['Enterprise scale', 'Advanced analytics', 'Template engine'],
   'medium', 10, ARRAY['SendGrid account', 'API key', 'Sender authentication'], 'freemium');

-- AI Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('ai', 'openai', 'OpenAI', 'Brain', 'bg-green-500', true,
   ARRAY['GPT-4', 'Function calling', 'Vision', 'Most popular'],
   'easy', 2, ARRAY['OpenAI account', 'API key'], 'paid', '$0.03/1K tokens'),
  ('ai', 'anthropic', 'Anthropic', 'Brain', 'bg-orange-500', true,
   ARRAY['Claude 3.5', 'Long context', 'Safer outputs', 'Code generation'],
   'easy', 2, ARRAY['Anthropic account', 'API key'], 'paid', '$0.25/1M tokens'),
  ('ai', 'google', 'Google AI', 'Brain', 'bg-blue-500', false,
   ARRAY['Gemini Pro', 'Multimodal', 'Free tier', 'Google integration'],
   'medium', 5, ARRAY['Google Cloud account', 'API key', 'Project setup'], 'freemium', 'Free tier available');

-- Calendar Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('calendar', 'google', 'Google Calendar', 'Calendar', 'bg-blue-500', true,
   ARRAY['Easy integration', 'Free', 'Most popular', 'Mobile sync'],
   'easy', 5, ARRAY['Google account', 'OAuth setup'], 'free'),
  ('calendar', 'outlook', 'Outlook Calendar', 'Calendar', 'bg-indigo-500', true,
   ARRAY['Office 365', 'Enterprise features', 'Teams integration'],
   'easy', 5, ARRAY['Microsoft account', 'Graph API access'], 'free');

-- Payment Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('payment', 'stripe', 'Stripe', 'CreditCard', 'bg-purple-500', true,
   ARRAY['Most popular', 'Global', 'Low fees', 'Great docs'],
   'medium', 10, ARRAY['Stripe account', 'API keys', 'Webhook setup'], 'paid', '2.9% + $0.30/transaction');

-- SMS Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('sms', 'twilio', 'Twilio', 'MessageSquare', 'bg-red-500', true,
   ARRAY['SMS + WhatsApp', 'Global coverage', 'Reliable', 'Programmable'],
   'medium', 10, ARRAY['Twilio account', 'Phone number', 'API credentials'], 'paid', '$0.0075/SMS');

-- CRM Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('crm', 'hubspot', 'HubSpot', 'Users', 'bg-orange-500', true,
   ARRAY['Free tier', 'Full CRM', 'Marketing tools', 'Easy API'],
   'easy', 5, ARRAY['HubSpot account', 'API key'], 'freemium', 'Free tier available'),
  ('crm', 'salesforce', 'Salesforce', 'Users', 'bg-blue-500', false,
   ARRAY['Enterprise grade', 'Customizable', 'Industry leader'],
   'hard', 20, ARRAY['Salesforce account', 'Connected app', 'OAuth setup'], 'paid', '$25/user/month');

-- ============================================================================
-- 20251126_3d_modeling_system.sql
-- ============================================================================
-- ============================================================================
-- 3D Modeling System - Production Database Schema
-- ============================================================================
-- Comprehensive 3D modeling studio with scene management, objects, materials,
-- lighting, camera controls, and rendering capabilities
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE object_type AS ENUM ('cube', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'pyramid', 'prism');
CREATE TYPE material_type AS ENUM ('standard', 'metallic', 'glass', 'plastic', 'fabric', 'wood', 'stone', 'emission');
CREATE TYPE light_type AS ENUM ('directional', 'point', 'spot', 'ambient', 'area');
CREATE TYPE tool_type AS ENUM ('select', 'move', 'rotate', 'scale', 'extrude', 'subdivide');
CREATE TYPE view_mode AS ENUM ('solid', 'wireframe', 'textured', 'rendered');
CREATE TYPE render_quality AS ENUM ('low', 'medium', 'high', 'ultra');
CREATE TYPE projection_type AS ENUM ('perspective', 'orthographic');
CREATE TYPE export_format AS ENUM ('obj', 'fbx', 'gltf', 'stl', 'dae', 'blend');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Projects
CREATE TABLE modeling_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  active_scene_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scenes
CREATE TABLE modeling_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES modeling_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  grid_size INTEGER NOT NULL DEFAULT 10,
  grid_divisions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scene Objects
CREATE TABLE scene_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type object_type NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  scale_x DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_y DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_z DECIMAL(10, 4) NOT NULL DEFAULT 1,
  material_id UUID,
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id UUID REFERENCES scene_objects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type material_type NOT NULL,
  color TEXT NOT NULL,
  roughness DECIMAL(3, 2) NOT NULL DEFAULT 0.5 CHECK (roughness >= 0 AND roughness <= 1),
  metallic DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK (metallic >= 0 AND metallic <= 1),
  emission DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK (emission >= 0 AND emission <= 1),
  opacity DECIMAL(3, 2) NOT NULL DEFAULT 1 CHECK (opacity >= 0 AND opacity <= 1),
  texture_url TEXT,
  normal_map_url TEXT,
  bump_map_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lights
CREATE TABLE lights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type light_type NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 50 CHECK (intensity >= 0 AND intensity <= 100),
  color TEXT NOT NULL DEFAULT '#FFFFFF',
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  cast_shadow BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cameras
CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type projection_type NOT NULL DEFAULT 'perspective',
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 5,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 5,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 5,
  target_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  target_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  target_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  fov INTEGER NOT NULL DEFAULT 75 CHECK (fov >= 1 AND fov <= 180),
  near_plane DECIMAL(10, 4) NOT NULL DEFAULT 0.1,
  far_plane DECIMAL(10, 4) NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Render Jobs
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality render_quality NOT NULL DEFAULT 'medium',
  resolution_width INTEGER NOT NULL DEFAULT 1280,
  resolution_height INTEGER NOT NULL DEFAULT 720,
  samples INTEGER NOT NULL DEFAULT 64,
  max_bounces INTEGER NOT NULL DEFAULT 8,
  enable_shadows BOOLEAN NOT NULL DEFAULT TRUE,
  enable_reflections BOOLEAN NOT NULL DEFAULT TRUE,
  enable_ambient_occlusion BOOLEAN NOT NULL DEFAULT FALSE,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  output_format TEXT NOT NULL DEFAULT 'png',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,
  error_message TEXT,
  estimated_time INTEGER, -- seconds
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Export Jobs
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  include_textures BOOLEAN NOT NULL DEFAULT TRUE,
  include_materials BOOLEAN NOT NULL DEFAULT TRUE,
  include_lights BOOLEAN NOT NULL DEFAULT TRUE,
  include_camera BOOLEAN NOT NULL DEFAULT TRUE,
  scale DECIMAL(10, 4) NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url TEXT,
  error_message TEXT,
  file_size INTEGER, -- bytes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Projects indexes
CREATE INDEX idx_modeling_projects_user_id ON modeling_projects(user_id);
CREATE INDEX idx_modeling_projects_is_public ON modeling_projects(is_public);
CREATE INDEX idx_modeling_projects_tags ON modeling_projects USING GIN(tags);
CREATE INDEX idx_modeling_projects_created_at ON modeling_projects(created_at DESC);

-- Scenes indexes
CREATE INDEX idx_modeling_scenes_project_id ON modeling_scenes(project_id);
CREATE INDEX idx_modeling_scenes_user_id ON modeling_scenes(user_id);

-- Scene Objects indexes
CREATE INDEX idx_scene_objects_scene_id ON scene_objects(scene_id);
CREATE INDEX idx_scene_objects_type ON scene_objects(type);
CREATE INDEX idx_scene_objects_material_id ON scene_objects(material_id);
CREATE INDEX idx_scene_objects_parent_id ON scene_objects(parent_id);
CREATE INDEX idx_scene_objects_visible ON scene_objects(visible);
CREATE INDEX idx_scene_objects_locked ON scene_objects(locked);

-- Materials indexes
CREATE INDEX idx_materials_scene_id ON materials(scene_id);
CREATE INDEX idx_materials_type ON materials(type);

-- Lights indexes
CREATE INDEX idx_lights_scene_id ON lights(scene_id);
CREATE INDEX idx_lights_type ON lights(type);
CREATE INDEX idx_lights_enabled ON lights(enabled);

-- Cameras indexes
CREATE INDEX idx_cameras_scene_id ON cameras(scene_id);
CREATE INDEX idx_cameras_is_active ON cameras(is_active);

-- Render Jobs indexes
CREATE INDEX idx_render_jobs_scene_id ON render_jobs(scene_id);
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- Export Jobs indexes
CREATE INDEX idx_export_jobs_scene_id ON export_jobs(scene_id);
CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_modeling_projects_updated_at
  BEFORE UPDATE ON modeling_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_scenes_updated_at
  BEFORE UPDATE ON modeling_scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scene_objects_updated_at
  BEFORE UPDATE ON scene_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lights_updated_at
  BEFORE UPDATE ON lights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON cameras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set job completion timestamps
CREATE OR REPLACE FUNCTION set_job_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_render_job_completed_at
  BEFORE UPDATE OF status ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_completed_at();

CREATE TRIGGER set_export_job_completed_at
  BEFORE UPDATE OF status ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_completed_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get project stats
CREATE OR REPLACE FUNCTION get_project_stats(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalScenes', COUNT(DISTINCT ms.id),
    'totalObjects', (
      SELECT COUNT(*)
      FROM scene_objects so
      JOIN modeling_scenes ms ON so.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    ),
    'totalMaterials', (
      SELECT COUNT(*)
      FROM materials m
      JOIN modeling_scenes ms ON m.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    ),
    'totalLights', (
      SELECT COUNT(*)
      FROM lights l
      JOIN modeling_scenes ms ON l.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    )
  )
  INTO v_stats
  FROM modeling_scenes ms
  WHERE ms.project_id = p_project_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get scene bounds
CREATE OR REPLACE FUNCTION get_scene_bounds(p_scene_id UUID)
RETURNS JSON AS $$
DECLARE
  v_bounds JSON;
BEGIN
  SELECT json_build_object(
    'min', json_build_object(
      'x', MIN(position_x - scale_x),
      'y', MIN(position_y - scale_y),
      'z', MIN(position_z - scale_z)
    ),
    'max', json_build_object(
      'x', MAX(position_x + scale_x),
      'y', MAX(position_y + scale_y),
      'z', MAX(position_z + scale_z)
    ),
    'center', json_build_object(
      'x', (MIN(position_x - scale_x) + MAX(position_x + scale_x)) / 2,
      'y', (MIN(position_y - scale_y) + MAX(position_y + scale_y)) / 2,
      'z', (MIN(position_z - scale_z) + MAX(position_z + scale_z)) / 2
    )
  )
  INTO v_bounds
  FROM scene_objects
  WHERE scene_id = p_scene_id AND visible = TRUE;

  RETURN v_bounds;
END;
$$ LANGUAGE plpgsql;

-- Get objects by type
CREATE OR REPLACE FUNCTION get_objects_by_type(p_scene_id UUID, p_type object_type)
RETURNS TABLE(
  id UUID,
  name TEXT,
  "position" JSON,
  "rotation" JSON,
  "scale" JSON,
  material_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    so.id,
    so.name,
    json_build_object('x', so.position_x, 'y', so.position_y, 'z', so.position_z) AS position,
    json_build_object('x', so.rotation_x, 'y', so.rotation_y, 'z', so.rotation_z) AS rotation,
    json_build_object('x', so.scale_x, 'y', so.scale_y, 'z', so.scale_z) AS scale,
    so.material_id
  FROM scene_objects so
  WHERE so.scene_id = p_scene_id AND so.type = p_type AND so.visible = TRUE
  ORDER BY so.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get enabled lights
CREATE OR REPLACE FUNCTION get_enabled_lights(p_scene_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type light_type,
  intensity INTEGER,
  color TEXT,
  position JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.type,
    l.intensity,
    l.color,
    json_build_object('x', l.position_x, 'y', l.position_y, 'z', l.position_z) AS position
  FROM lights l
  WHERE l.scene_id = p_scene_id AND l.enabled = TRUE
  ORDER BY l.intensity DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate total light intensity
CREATE OR REPLACE FUNCTION calculate_light_intensity(p_scene_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(intensity), 0)
  INTO v_total
  FROM lights
  WHERE scene_id = p_scene_id AND enabled = TRUE;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Search scene objects
CREATE OR REPLACE FUNCTION search_scene_objects(p_scene_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type object_type,
  visible BOOLEAN,
  locked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT so.id, so.name, so.type, so.visible, so.locked
  FROM scene_objects so
  WHERE so.scene_id = p_scene_id
    AND (
      so.name ILIKE '%' || p_query || '%'
      OR so.type::TEXT ILIKE '%' || p_query || '%'
    )
  ORDER BY so.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Estimate render time
CREATE OR REPLACE FUNCTION estimate_render_time(
  p_quality render_quality,
  p_object_count INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_base_time INTEGER := 1;
  v_quality_factor DECIMAL;
  v_object_factor DECIMAL;
  v_total INTEGER;
BEGIN
  v_quality_factor := CASE p_quality
    WHEN 'low' THEN 0.5
    WHEN 'medium' THEN 1.0
    WHEN 'high' THEN 2.0
    WHEN 'ultra' THEN 4.0
  END;

  v_object_factor := p_object_count::DECIMAL / 10;

  v_total := CEIL(v_base_time * v_quality_factor * v_object_factor);

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Duplicate scene object
CREATE OR REPLACE FUNCTION duplicate_object(p_object_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_id UUID;
  v_object scene_objects%ROWTYPE;
BEGIN
  SELECT * INTO v_object FROM scene_objects WHERE id = p_object_id;

  INSERT INTO scene_objects (
    scene_id, name, type,
    position_x, position_y, position_z,
    rotation_x, rotation_y, rotation_z,
    scale_x, scale_y, scale_z,
    material_id, visible, locked
  )
  VALUES (
    v_object.scene_id,
    v_object.name || ' Copy',
    v_object.type,
    v_object.position_x + 1,
    v_object.position_y,
    v_object.position_z + 1,
    v_object.rotation_x,
    v_object.rotation_y,
    v_object.rotation_z,
    v_object.scale_x,
    v_object.scale_y,
    v_object.scale_z,
    v_object.material_id,
    v_object.visible,
    FALSE
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE modeling_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON modeling_projects FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own projects"
  ON modeling_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON modeling_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON modeling_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Scenes policies
CREATE POLICY "Users can view scenes from their projects or public projects"
  ON modeling_scenes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM modeling_projects
      WHERE id = modeling_scenes.project_id AND is_public = TRUE
    )
  );

CREATE POLICY "Users can create scenes in their projects"
  ON modeling_scenes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes"
  ON modeling_scenes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes"
  ON modeling_scenes FOR DELETE
  USING (auth.uid() = user_id);

-- Scene Objects policies
CREATE POLICY "Users can view objects from accessible scenes"
  ON scene_objects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = scene_objects.scene_id
      AND (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects
          WHERE id = modeling_scenes.project_id AND is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage objects in their scenes"
  ON scene_objects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = scene_objects.scene_id AND user_id = auth.uid()
  ));

-- Materials policies (same pattern as objects)
CREATE POLICY "Users can view materials from accessible scenes"
  ON materials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = materials.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage materials in their scenes"
  ON materials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = materials.scene_id AND user_id = auth.uid()
  ));

-- Lights policies
CREATE POLICY "Users can view lights from accessible scenes"
  ON lights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = lights.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage lights in their scenes"
  ON lights FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = lights.scene_id AND user_id = auth.uid()
  ));

-- Cameras policies
CREATE POLICY "Users can view cameras from accessible scenes"
  ON cameras FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = cameras.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage cameras in their scenes"
  ON cameras FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = cameras.scene_id AND user_id = auth.uid()
  ));

-- Render Jobs policies
CREATE POLICY "Users can view their own render jobs"
  ON render_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create render jobs for their scenes"
  ON render_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM modeling_scenes
      WHERE id = render_jobs.scene_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own render jobs"
  ON render_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Export Jobs policies
CREATE POLICY "Users can view their own export jobs"
  ON export_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export jobs for their scenes"
  ON export_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM modeling_scenes
      WHERE id = export_jobs.scene_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own export jobs"
  ON export_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20251126_email_agent_system.sql
-- ============================================================================
-- ============================================================================
-- Email Agent System - Production Database Schema
-- ============================================================================
-- Comprehensive email automation and intelligence with AI-powered analysis,
-- automatic responses, quotation generation, booking management, and workflows
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE email_intent AS ENUM ('quote_request', 'inquiry', 'booking', 'complaint', 'follow_up', 'support', 'payment', 'general');
CREATE TYPE email_sentiment AS ENUM ('positive', 'neutral', 'negative', 'urgent');
CREATE TYPE email_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE email_category AS ENUM ('sales', 'booking', 'support', 'billing', 'general', 'spam');
CREATE TYPE email_status AS ENUM ('pending', 'processing', 'processed', 'responded', 'archived', 'flagged');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE approval_type AS ENUM ('response', 'quotation', 'booking', 'refund', 'discount');
CREATE TYPE response_tone AS ENUM ('professional', 'friendly', 'formal', 'casual');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Email Messages
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  status email_status NOT NULL DEFAULT 'pending',
  has_response BOOLEAN NOT NULL DEFAULT FALSE,
  has_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  has_booking BOOLEAN NOT NULL DEFAULT FALSE,
  thread_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Analysis
CREATE TABLE email_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE UNIQUE,
  intent email_intent NOT NULL,
  sentiment email_sentiment NOT NULL,
  priority email_priority NOT NULL,
  category email_category NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  extracted_name TEXT,
  extracted_company TEXT,
  extracted_phone TEXT,
  extracted_deadline TEXT,
  extracted_budget TEXT,
  extracted_requirements TEXT[] DEFAULT '{}',
  requires_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  requires_booking BOOLEAN NOT NULL DEFAULT FALSE,
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_time INTEGER NOT NULL, -- milliseconds
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Responses
CREATE TABLE email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tone response_tone NOT NULL DEFAULT 'professional',
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  valid_until DATE NOT NULL,
  terms TEXT[] DEFAULT '{}',
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotation Items
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  confirmed_date DATE,
  confirmed_time TIME,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Attachments
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL, -- bytes
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval Workflows
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type approval_type NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_data JSONB NOT NULL DEFAULT '{}',
  requested_by TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Configuration
CREATE TABLE agent_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_respond BOOLEAN NOT NULL DEFAULT FALSE,
  require_approval BOOLEAN NOT NULL DEFAULT TRUE,
  auto_approve_threshold DECIMAL(5, 2) NOT NULL DEFAULT 90 CHECK (auto_approve_threshold >= 0 AND auto_approve_threshold <= 100),
  response_template TEXT,
  quotation_template TEXT,
  working_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  working_hours_timezone TEXT DEFAULT 'UTC',
  blocked_senders TEXT[] DEFAULT '{}',
  blocked_domains TEXT[] DEFAULT '{}',
  filter_keywords TEXT[] DEFAULT '{}',
  integration_email BOOLEAN NOT NULL DEFAULT TRUE,
  integration_calendar BOOLEAN NOT NULL DEFAULT FALSE,
  integration_payment BOOLEAN NOT NULL DEFAULT FALSE,
  integration_crm BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Email Messages indexes
CREATE INDEX idx_email_messages_user_id ON email_messages(user_id);
CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_received_at ON email_messages(received_at DESC);
CREATE INDEX idx_email_messages_thread_id ON email_messages(thread_id);
CREATE INDEX idx_email_messages_from ON email_messages(from_address);
CREATE INDEX idx_email_messages_user_status ON email_messages(user_id, status);

-- Email Analysis indexes
CREATE INDEX idx_email_analysis_email_id ON email_analysis(email_id);
CREATE INDEX idx_email_analysis_intent ON email_analysis(intent);
CREATE INDEX idx_email_analysis_priority ON email_analysis(priority);
CREATE INDEX idx_email_analysis_category ON email_analysis(category);
CREATE INDEX idx_email_analysis_requires_review ON email_analysis(requires_human_review);

-- Email Responses indexes
CREATE INDEX idx_email_responses_email_id ON email_responses(email_id);
CREATE INDEX idx_email_responses_status ON email_responses(status);
CREATE INDEX idx_email_responses_generated_at ON email_responses(generated_at DESC);

-- Quotations indexes
CREATE INDEX idx_quotations_email_id ON quotations(email_id);
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);

-- Quotation Items indexes
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_sort_order ON quotation_items(quotation_id, sort_order);

-- Bookings indexes
CREATE INDEX idx_bookings_email_id ON bookings(email_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_confirmed_date ON bookings(confirmed_date);

-- Email Attachments indexes
CREATE INDEX idx_email_attachments_email_id ON email_attachments(email_id);

-- Approval Workflows indexes
CREATE INDEX idx_approval_workflows_user_id ON approval_workflows(user_id);
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX idx_approval_workflows_type ON approval_workflows(type);
CREATE INDEX idx_approval_workflows_priority ON approval_workflows(priority);
CREATE INDEX idx_approval_workflows_email_id ON approval_workflows(email_id);
CREATE INDEX idx_approval_workflows_expires_at ON approval_workflows(expires_at);

-- Agent Configuration indexes
CREATE INDEX idx_agent_configuration_user_id ON agent_configuration(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON email_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configuration_updated_at
  BEFORE UPDATE ON agent_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate quotation total
CREATE OR REPLACE FUNCTION calculate_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.subtotal + NEW.tax - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quotation_total_trigger
  BEFORE INSERT OR UPDATE OF subtotal, tax, discount ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quotation_total();

-- Auto-calculate quotation item total
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_item_total_trigger
  BEFORE INSERT OR UPDATE OF quantity, unit_price ON quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Auto-expire approvals
CREATE OR REPLACE FUNCTION check_approval_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_approval_expiration_trigger
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION check_approval_expiration();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get email statistics
CREATE OR REPLACE FUNCTION get_email_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalEmailsReceived', COUNT(*),
    'totalEmailsProcessed', COUNT(*) FILTER (WHERE status != 'pending'),
    'responsesGenerated', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id),
    'responsesSent', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id AND er.sent_at IS NOT NULL),
    'quotationsGenerated', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id),
    'quotationsSent', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id AND sent_at IS NOT NULL),
    'bookingsCreated', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id),
    'bookingsConfirmed', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id AND confirmed_date IS NOT NULL),
    'approvalsPending', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'pending'),
    'approvalsApproved', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'approved'),
    'approvalsRejected', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'rejected'),
    'avgResponseTime', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (read_at - received_at)) / 60), 0)::INTEGER
      FROM email_messages
      WHERE user_id = p_user_id AND read_at IS NOT NULL
    ),
    'avgConfidenceScore', (
      SELECT COALESCE(AVG(ea.confidence_score), 0)::INTEGER
      FROM email_analysis ea
      JOIN email_messages em ON ea.email_id = em.id
      WHERE em.user_id = p_user_id
    )
  )
  INTO v_stats
  FROM email_messages
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search emails
CREATE OR REPLACE FUNCTION search_emails(p_user_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  status email_status,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, em.status, em.received_at
  FROM email_messages em
  WHERE em.user_id = p_user_id
    AND (
      em.from_address ILIKE '%' || p_query || '%'
      OR em.subject ILIKE '%' || p_query || '%'
      OR em.body ILIKE '%' || p_query || '%'
    )
  ORDER BY em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get pending approvals
CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type approval_type,
  priority email_priority,
  email_subject TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT aw.id, aw.type, aw.priority, em.subject, aw.created_at
  FROM approval_workflows aw
  JOIN email_messages em ON aw.email_id = em.id
  WHERE aw.user_id = p_user_id AND aw.status = 'pending'
  ORDER BY aw.priority, aw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get emails requiring review
CREATE OR REPLACE FUNCTION get_emails_requiring_review(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  priority email_priority,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, ea.priority, em.received_at
  FROM email_messages em
  JOIN email_analysis ea ON em.id = ea.email_id
  WHERE em.user_id = p_user_id
    AND ea.requires_human_review = TRUE
    AND em.status = 'processing'
  ORDER BY ea.priority, em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get quotation total with items
CREATE OR REPLACE FUNCTION get_quotation_total(p_quotation_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_items_total DECIMAL;
  v_quotation quotations%ROWTYPE;
BEGIN
  SELECT SUM(total) INTO v_items_total
  FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  RETURN COALESCE(v_items_total, 0) + v_quotation.tax - v_quotation.discount;
END;
$$ LANGUAGE plpgsql;

-- Update email status based on activity
CREATE OR REPLACE FUNCTION update_email_status(p_email_id UUID)
RETURNS VOID AS $$
DECLARE
  v_has_response BOOLEAN;
  v_has_quotation BOOLEAN;
  v_has_booking BOOLEAN;
BEGIN
  SELECT
    EXISTS(SELECT 1 FROM email_responses WHERE email_id = p_email_id AND sent_at IS NOT NULL),
    EXISTS(SELECT 1 FROM quotations WHERE email_id = p_email_id),
    EXISTS(SELECT 1 FROM bookings WHERE email_id = p_email_id)
  INTO v_has_response, v_has_quotation, v_has_booking;

  UPDATE email_messages
  SET
    has_response = v_has_response,
    has_quotation = v_has_quotation,
    has_booking = v_has_booking,
    status = CASE
      WHEN v_has_response THEN 'responded'::email_status
      WHEN status = 'pending' THEN 'processing'::email_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configuration ENABLE ROW LEVEL SECURITY;

-- Email Messages policies
CREATE POLICY "Users can view their own email messages"
  ON email_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email messages"
  ON email_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email messages"
  ON email_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email messages"
  ON email_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Email Analysis policies
CREATE POLICY "Users can view analysis for their emails"
  ON email_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage analysis for their emails"
  ON email_analysis FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

-- Email Responses policies (same pattern)
CREATE POLICY "Users can view responses for their emails"
  ON email_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage responses for their emails"
  ON email_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

-- Quotations policies
CREATE POLICY "Users can view their own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotations"
  ON quotations FOR ALL
  USING (auth.uid() = user_id);

-- Quotation Items policies
CREATE POLICY "Users can view items for their quotations"
  ON quotation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage items for their quotations"
  ON quotation_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Email Attachments policies
CREATE POLICY "Users can view attachments for their emails"
  ON email_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage attachments for their emails"
  ON email_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

-- Approval Workflows policies
CREATE POLICY "Users can view their own approval workflows"
  ON approval_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own approval workflows"
  ON approval_workflows FOR ALL
  USING (auth.uid() = user_id);

-- Agent Configuration policies
CREATE POLICY "Users can view their own agent configuration"
  ON agent_configuration FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent configuration"
  ON agent_configuration FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20251126_admin_analytics_system.sql
-- ============================================================================
-- ============================================================================
-- Admin Analytics System - Production Database Schema
-- ============================================================================
-- Comprehensive analytics and reporting with revenue tracking, conversion funnels,
-- traffic analysis, ROI calculations, and business intelligence
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE date_range AS ENUM ('7d', '30d', '90d', '365d', 'custom');
CREATE TYPE metric_type AS ENUM ('revenue', 'conversion', 'traffic', 'roi', 'aov', 'ltv');
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE traffic_source AS ENUM ('organic', 'direct', 'social', 'referral', 'paid', 'email');
CREATE TYPE conversion_stage AS ENUM ('visitor', 'lead', 'qualified', 'proposal', 'customer');
CREATE TYPE insight_type AS ENUM ('opportunity', 'warning', 'success', 'info');
CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE report_type AS ENUM ('revenue', 'conversion', 'traffic', 'full');
CREATE TYPE report_format AS ENUM ('pdf', 'csv', 'xlsx', 'json');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Revenue Data
CREATE TABLE revenue_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  transactions INTEGER NOT NULL DEFAULT 0,
  average_order_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  refunds DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Conversion Funnel
CREATE TABLE conversion_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stage conversion_stage NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, stage)
);

-- Traffic Sources
CREATE TABLE traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source traffic_source NOT NULL,
  visitors INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_session_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, source)
);

-- Analytics Insights
CREATE TABLE analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  priority insight_priority NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric metric_type NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type metric_type NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  previous_value DECIMAL(12, 2) NOT NULL,
  change DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(5, 2) NOT NULL,
  trend trend_direction NOT NULL,
  goal DECIMAL(12, 2),
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- Analytics Reports
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type report_type NOT NULL,
  date_range date_range NOT NULL,
  format report_format NOT NULL,
  custom_start_date DATE,
  custom_end_date DATE,
  data JSONB NOT NULL DEFAULT '{}',
  file_url TEXT,
  file_size INTEGER, -- bytes
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Analytics
CREATE TABLE user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_pageviews INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_pages JSONB DEFAULT '[]',
  devices JSONB DEFAULT '[]',
  locations JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Revenue Data indexes
CREATE INDEX idx_revenue_data_user_id ON revenue_data(user_id);
CREATE INDEX idx_revenue_data_date ON revenue_data(date DESC);
CREATE INDEX idx_revenue_data_user_date ON revenue_data(user_id, date DESC);

-- Conversion Funnel indexes
CREATE INDEX idx_conversion_funnel_user_id ON conversion_funnel(user_id);
CREATE INDEX idx_conversion_funnel_date ON conversion_funnel(date DESC);
CREATE INDEX idx_conversion_funnel_stage ON conversion_funnel(stage);

-- Traffic Sources indexes
CREATE INDEX idx_traffic_sources_user_id ON traffic_sources(user_id);
CREATE INDEX idx_traffic_sources_date ON traffic_sources(date DESC);
CREATE INDEX idx_traffic_sources_source ON traffic_sources(source);

-- Analytics Insights indexes
CREATE INDEX idx_analytics_insights_user_id ON analytics_insights(user_id);
CREATE INDEX idx_analytics_insights_type ON analytics_insights(type);
CREATE INDEX idx_analytics_insights_priority ON analytics_insights(priority);
CREATE INDEX idx_analytics_insights_dismissed ON analytics_insights(dismissed_at) WHERE dismissed_at IS NULL;

-- Metrics indexes
CREATE INDEX idx_metrics_user_id ON metrics(user_id);
CREATE INDEX idx_metrics_date ON metrics(date DESC);
CREATE INDEX idx_metrics_type ON metrics(type);

-- Analytics Reports indexes
CREATE INDEX idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX idx_analytics_reports_generated_at ON analytics_reports(generated_at DESC);
CREATE INDEX idx_analytics_reports_type ON analytics_reports(type);

-- User Analytics indexes
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at
  BEFORE UPDATE ON user_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate net revenue
CREATE OR REPLACE FUNCTION calculate_net_revenue()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_revenue = NEW.revenue - NEW.refunds;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_net_revenue_trigger
  BEFORE INSERT OR UPDATE OF revenue, refunds ON revenue_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_net_revenue();

-- Auto-calculate average order value
CREATE OR REPLACE FUNCTION calculate_aov()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transactions > 0 THEN
    NEW.average_order_value = NEW.revenue / NEW.transactions;
  ELSE
    NEW.average_order_value = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_aov_trigger
  BEFORE INSERT OR UPDATE OF revenue, transactions ON revenue_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_aov();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(p_user_id UUID, p_date_range date_range)
RETURNS JSON AS $$
DECLARE
  v_days INTEGER;
  v_start_date DATE;
  v_summary JSON;
BEGIN
  v_days := CASE p_date_range
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    WHEN '365d' THEN 365
    ELSE 30
  END;
  v_start_date := CURRENT_DATE - v_days;

  SELECT json_build_object(
    'totalRevenue', COALESCE(SUM(revenue), 0),
    'totalTransactions', COALESCE(SUM(transactions), 0),
    'averageOrderValue', CASE WHEN SUM(transactions) > 0 THEN SUM(revenue) / SUM(transactions) ELSE 0 END,
    'netRevenue', COALESCE(SUM(net_revenue), 0),
    'totalRefunds', COALESCE(SUM(refunds), 0)
  )
  INTO v_summary
  FROM revenue_data
  WHERE user_id = p_user_id AND date >= v_start_date;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Get conversion funnel for period
CREATE OR REPLACE FUNCTION get_conversion_funnel_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  stage conversion_stage,
  total_count BIGINT,
  avg_conversion_rate DECIMAL,
  avg_dropoff_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cf.stage,
    SUM(cf.count)::BIGINT,
    AVG(cf.conversion_rate),
    AVG(cf.dropoff_rate)
  FROM conversion_funnel cf
  WHERE cf.user_id = p_user_id
    AND cf.date >= CURRENT_DATE - p_days
  GROUP BY cf.stage
  ORDER BY CASE cf.stage
    WHEN 'visitor' THEN 1
    WHEN 'lead' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'proposal' THEN 4
    WHEN 'customer' THEN 5
  END;
END;
$$ LANGUAGE plpgsql;

-- Get top traffic sources
CREATE OR REPLACE FUNCTION get_top_traffic_sources(p_user_id UUID, p_days INTEGER DEFAULT 30, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  source traffic_source,
  total_visitors BIGINT,
  total_conversions BIGINT,
  avg_conversion_rate DECIMAL,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ts.source,
    SUM(ts.visitors)::BIGINT,
    SUM(ts.conversions)::BIGINT,
    AVG(ts.conversion_rate),
    SUM(ts.revenue)
  FROM traffic_sources ts
  WHERE ts.user_id = p_user_id
    AND ts.date >= CURRENT_DATE - p_days
  GROUP BY ts.source
  ORDER BY SUM(ts.visitors) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get active insights
CREATE OR REPLACE FUNCTION get_active_insights(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type insight_type,
  priority insight_priority,
  title TEXT,
  description TEXT,
  impact TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ai.id, ai.type, ai.priority, ai.title, ai.description, ai.impact, ai.recommendation
  FROM analytics_insights ai
  WHERE ai.user_id = p_user_id
    AND ai.dismissed_at IS NULL
  ORDER BY
    CASE ai.priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
    END,
    ai.detected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate ROI
CREATE OR REPLACE FUNCTION calculate_roi(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_total_spent DECIMAL;
  v_roi DECIMAL;
BEGIN
  SELECT COALESCE(SUM(revenue), 0)
  INTO v_total_revenue
  FROM revenue_data
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days;

  SELECT COALESCE(SUM(visitors * 2), 0)
  INTO v_total_spent
  FROM traffic_sources
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days;

  IF v_total_spent > 0 THEN
    v_roi := ((v_total_revenue - v_total_spent) / v_total_spent) * 100;
  ELSE
    v_roi := 0;
  END IF;

  RETURN ROUND(v_roi, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Revenue Data policies
CREATE POLICY "Users can view their own revenue data"
  ON revenue_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own revenue data"
  ON revenue_data FOR ALL
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view their own conversion funnel"
  ON conversion_funnel FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversion funnel"
  ON conversion_funnel FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own traffic sources"
  ON traffic_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own traffic sources"
  ON traffic_sources FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights"
  ON analytics_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own insights"
  ON analytics_insights FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
  ON metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own metrics"
  ON metrics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON analytics_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reports"
  ON analytics_reports FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own user analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own user analytics"
  ON user_analytics FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20251126_profile_system.sql
-- ============================================================================
-- ============================================================================
-- Profile System - Production Database Schema
-- ============================================================================
-- Comprehensive user profile management with skills, experience, education,
-- portfolio, social links, and account settings
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE profile_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
CREATE TYPE account_type AS ENUM ('free', 'pro', 'business', 'enterprise');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE privacy_level AS ENUM ('public', 'connections', 'private');

-- ============================================================================
-- TABLES
-- ============================================================================

-- User Profiles
CREATE TABLE user_profiles (
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
CREATE TABLE skills (
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
CREATE TABLE experience (
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
CREATE TABLE education (
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
CREATE TABLE portfolio (
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
CREATE TABLE social_links (
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
CREATE TABLE profile_settings (
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
CREATE TABLE profile_stats (
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
CREATE TABLE achievements (
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
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_status ON user_profiles(status);
CREATE INDEX idx_user_profiles_account_type ON user_profiles(account_type);

-- Skills indexes
CREATE INDEX idx_skills_user_id ON skills(user_id);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_level ON skills(level);
CREATE INDEX idx_skills_endorsements ON skills(endorsements DESC);

-- Experience indexes
CREATE INDEX idx_experience_user_id ON experience(user_id);
CREATE INDEX idx_experience_current ON experience(current);
CREATE INDEX idx_experience_start_date ON experience(start_date DESC);

-- Education indexes
CREATE INDEX idx_education_user_id ON education(user_id);
CREATE INDEX idx_education_current ON education(current);

-- Portfolio indexes
CREATE INDEX idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX idx_portfolio_category ON portfolio(category);
CREATE INDEX idx_portfolio_featured ON portfolio(featured);
CREATE INDEX idx_portfolio_likes ON portfolio(likes DESC);
CREATE INDEX idx_portfolio_views ON portfolio(views DESC);
CREATE INDEX idx_portfolio_tags ON portfolio USING GIN(tags);

-- Social Links indexes
CREATE INDEX idx_social_links_user_id ON social_links(user_id);
CREATE INDEX idx_social_links_platform ON social_links(platform);

-- Profile Settings indexes
CREATE INDEX idx_profile_settings_user_id ON profile_settings(user_id);

-- Profile Stats indexes
CREATE INDEX idx_profile_stats_user_id ON profile_stats(user_id);

-- Achievements indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_category ON achievements(category);

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
-- 20251126_ai_code_completion_system.sql
-- ============================================================================
-- ============================================================================
-- AI Code Completion System - Production Database Schema
-- ============================================================================
-- Comprehensive AI-powered code completion, analysis, optimization, and
-- intelligent code generation with bug detection and security scanning
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE programming_language AS ENUM (
  'javascript', 'typescript', 'python', 'react', 'vue', 'angular',
  'node', 'php', 'java', 'csharp', 'cpp', 'rust', 'go', 'swift',
  'kotlin', 'ruby', 'scala', 'dart'
);

CREATE TYPE completion_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE bug_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE bug_type AS ENUM ('syntax', 'logic', 'security', 'performance', 'style', 'type');
CREATE TYPE suggestion_type AS ENUM ('optimization', 'refactoring', 'security', 'best_practice', 'documentation');
CREATE TYPE analysis_type AS ENUM ('bugs', 'security', 'performance', 'complexity', 'coverage');
CREATE TYPE template_category AS ENUM ('component', 'api', 'hook', 'utility', 'test', 'config');
CREATE TYPE export_format AS ENUM ('gist', 'markdown', 'pdf', 'html', 'zip');
CREATE TYPE ai_model AS ENUM ('gpt-4', 'gpt-3.5-turbo', 'claude-3', 'codex', 'copilot');
CREATE TYPE impact_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE version_action AS ENUM ('create', 'edit', 'optimize', 'refactor', 'manual_save');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Code Completions
CREATE TABLE code_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language programming_language NOT NULL,
  original_code TEXT NOT NULL,
  completed_code TEXT NOT NULL,
  prompt TEXT,
  model ai_model NOT NULL DEFAULT 'gpt-4',
  status completion_status NOT NULL DEFAULT 'pending',
  confidence INTEGER NOT NULL DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER NOT NULL DEFAULT 0, -- milliseconds
  suggestions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Code Snippets
CREATE TABLE code_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  category template_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bug Reports
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  type bug_type NOT NULL,
  severity bug_severity NOT NULL,
  message TEXT NOT NULL,
  suggestion TEXT,
  code_snippet TEXT,
  auto_fixable BOOLEAN NOT NULL DEFAULT FALSE,
  fixed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Suggestions
CREATE TABLE code_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL,
  type suggestion_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact impact_level NOT NULL,
  effort impact_level NOT NULL,
  code_example TEXT,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Analysis
CREATE TABLE code_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  type analysis_type NOT NULL,
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  lines_of_code INTEGER NOT NULL DEFAULT 0,
  complexity INTEGER NOT NULL DEFAULT 0,
  maintainability INTEGER CHECK (maintainability >= 0 AND maintainability <= 100),
  test_coverage INTEGER CHECK (test_coverage >= 0 AND test_coverage <= 100),
  duplicate_code INTEGER CHECK (duplicate_code >= 0 AND duplicate_code <= 100),
  comment_ratio DECIMAL(5, 2) NOT NULL DEFAULT 0,
  function_count INTEGER NOT NULL DEFAULT 0,
  class_count INTEGER NOT NULL DEFAULT 0,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Security Issues
CREATE TABLE security_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES code_analysis(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  severity bug_severity NOT NULL,
  description TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  recommendation TEXT NOT NULL,
  cwe TEXT, -- Common Weakness Enumeration
  owasp TEXT, -- OWASP Top 10
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Templates
CREATE TABLE code_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL,
  language programming_language NOT NULL,
  template TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER NOT NULL DEFAULT 0, -- minutes
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Versions
CREATE TABLE code_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_id UUID NOT NULL REFERENCES code_snippets(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  action version_action NOT NULL,
  additions INTEGER NOT NULL DEFAULT 0,
  deletions INTEGER NOT NULL DEFAULT 0,
  modifications INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Code Exports
CREATE TABLE code_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language programming_language NOT NULL,
  format export_format NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL, -- bytes
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Code Stats
CREATE TABLE ai_code_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_completions INTEGER NOT NULL DEFAULT 0,
  total_tokens_used INTEGER NOT NULL DEFAULT 0,
  average_confidence DECIMAL(5, 2) NOT NULL DEFAULT 0,
  favorite_language programming_language,
  total_bugs_fixed INTEGER NOT NULL DEFAULT 0,
  total_optimizations INTEGER NOT NULL DEFAULT 0,
  code_quality_improvement DECIMAL(5, 2) NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Code Completions indexes
CREATE INDEX idx_code_completions_user_id ON code_completions(user_id);
CREATE INDEX idx_code_completions_language ON code_completions(language);
CREATE INDEX idx_code_completions_status ON code_completions(status);
CREATE INDEX idx_code_completions_model ON code_completions(model);
CREATE INDEX idx_code_completions_created_at ON code_completions(created_at DESC);

-- Code Snippets indexes
CREATE INDEX idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX idx_code_snippets_language ON code_snippets(language);
CREATE INDEX idx_code_snippets_category ON code_snippets(category);
CREATE INDEX idx_code_snippets_is_public ON code_snippets(is_public);
CREATE INDEX idx_code_snippets_tags ON code_snippets USING GIN(tags);
CREATE INDEX idx_code_snippets_usage_count ON code_snippets(usage_count DESC);
CREATE INDEX idx_code_snippets_likes ON code_snippets(likes DESC);

-- Bug Reports indexes
CREATE INDEX idx_bug_reports_analysis_id ON bug_reports(analysis_id);
CREATE INDEX idx_bug_reports_severity ON bug_reports(severity);
CREATE INDEX idx_bug_reports_type ON bug_reports(type);
CREATE INDEX idx_bug_reports_fixed ON bug_reports(fixed);

-- Code Suggestions indexes
CREATE INDEX idx_code_suggestions_analysis_id ON code_suggestions(analysis_id);
CREATE INDEX idx_code_suggestions_type ON code_suggestions(type);
CREATE INDEX idx_code_suggestions_priority ON code_suggestions(priority DESC);

-- Code Analysis indexes
CREATE INDEX idx_code_analysis_user_id ON code_analysis(user_id);
CREATE INDEX idx_code_analysis_language ON code_analysis(language);
CREATE INDEX idx_code_analysis_type ON code_analysis(type);
CREATE INDEX idx_code_analysis_quality_score ON code_analysis(quality_score DESC);
CREATE INDEX idx_code_analysis_analyzed_at ON code_analysis(analyzed_at DESC);

-- Security Issues indexes
CREATE INDEX idx_security_issues_analysis_id ON security_issues(analysis_id);
CREATE INDEX idx_security_issues_severity ON security_issues(severity);
CREATE INDEX idx_security_issues_type ON security_issues(type);

-- Code Templates indexes
CREATE INDEX idx_code_templates_user_id ON code_templates(user_id);
CREATE INDEX idx_code_templates_category ON code_templates(category);
CREATE INDEX idx_code_templates_language ON code_templates(language);
CREATE INDEX idx_code_templates_is_public ON code_templates(is_public);
CREATE INDEX idx_code_templates_tags ON code_templates USING GIN(tags);
CREATE INDEX idx_code_templates_usage_count ON code_templates(usage_count DESC);

-- Code Versions indexes
CREATE INDEX idx_code_versions_snippet_id ON code_versions(snippet_id);
CREATE INDEX idx_code_versions_created_at ON code_versions(created_at DESC);

-- Code Exports indexes
CREATE INDEX idx_code_exports_user_id ON code_exports(user_id);
CREATE INDEX idx_code_exports_format ON code_exports(format);
CREATE INDEX idx_code_exports_created_at ON code_exports(created_at DESC);

-- AI Code Stats indexes
CREATE INDEX idx_ai_code_stats_user_id ON ai_code_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_code_snippets_updated_at
  BEFORE UPDATE ON code_snippets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_templates_updated_at
  BEFORE UPDATE ON code_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_code_stats_updated_at
  BEFORE UPDATE ON ai_code_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on completion
CREATE OR REPLACE FUNCTION update_ai_code_stats_on_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO ai_code_stats (user_id, total_completions, total_tokens_used, average_confidence, favorite_language)
    VALUES (NEW.user_id, 1, NEW.tokens_used, NEW.confidence, NEW.language)
    ON CONFLICT (user_id) DO UPDATE
    SET
      total_completions = ai_code_stats.total_completions + 1,
      total_tokens_used = ai_code_stats.total_tokens_used + NEW.tokens_used,
      average_confidence = (ai_code_stats.average_confidence * ai_code_stats.total_completions + NEW.confidence) / (ai_code_stats.total_completions + 1),
      favorite_language = NEW.language,
      last_used_at = NOW(),
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_completion_trigger
  AFTER INSERT OR UPDATE ON code_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_code_stats_on_completion();

-- Auto-increment usage count
CREATE OR REPLACE FUNCTION increment_snippet_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE code_snippets
  SET usage_count = usage_count + 1
  WHERE id = NEW.snippet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get completion statistics
CREATE OR REPLACE FUNCTION get_completion_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalCompletions', COUNT(*),
    'completedCount', COUNT(*) FILTER (WHERE status = 'completed'),
    'averageConfidence', ROUND(AVG(confidence), 2),
    'totalTokens', SUM(tokens_used),
    'averageProcessingTime', ROUND(AVG(processing_time), 0),
    'topLanguage', (
      SELECT language
      FROM code_completions
      WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days
      GROUP BY language
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  )
  INTO v_stats
  FROM code_completions
  WHERE user_id = p_user_id AND created_at >= CURRENT_DATE - p_days;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get code quality summary
CREATE OR REPLACE FUNCTION get_code_quality_summary(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_summary JSON;
BEGIN
  SELECT json_build_object(
    'averageQuality', ROUND(AVG(quality_score), 2),
    'averageMaintainability', ROUND(AVG(maintainability), 2),
    'totalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    ),
    'criticalBugs', (
      SELECT COUNT(*)
      FROM bug_reports br
      JOIN code_analysis ca ON br.analysis_id = ca.id
      WHERE ca.user_id = p_user_id AND br.severity = 'critical'
    ),
    'securityIssues', (
      SELECT COUNT(*)
      FROM security_issues si
      JOIN code_analysis ca ON si.analysis_id = ca.id
      WHERE ca.user_id = p_user_id
    )
  )
  INTO v_summary
  FROM code_analysis
  WHERE user_id = p_user_id;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Get popular snippets
CREATE OR REPLACE FUNCTION get_popular_snippets(p_language programming_language DEFAULT NULL, p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  language programming_language,
  category template_category,
  usage_count INTEGER,
  likes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT cs.id, cs.name, cs.language, cs.category, cs.usage_count, cs.likes
  FROM code_snippets cs
  WHERE cs.is_public = TRUE
    AND (p_language IS NULL OR cs.language = p_language)
  ORDER BY cs.usage_count DESC, cs.likes DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Analyze code complexity
CREATE OR REPLACE FUNCTION analyze_code_complexity(p_code TEXT)
RETURNS JSON AS $$
DECLARE
  v_lines INTEGER;
  v_functions INTEGER;
  v_complexity INTEGER;
  v_result JSON;
BEGIN
  v_lines := array_length(string_to_array(p_code, E'\n'), 1);
  v_functions := array_length(regexp_split_to_array(p_code, 'function'), 1) - 1;
  v_complexity := 1 +
    array_length(regexp_split_to_array(p_code, 'if'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'for'), 1) - 1 +
    array_length(regexp_split_to_array(p_code, 'while'), 1) - 1;

  SELECT json_build_object(
    'linesOfCode', v_lines,
    'functionCount', v_functions,
    'cyclomaticComplexity', v_complexity,
    'averageFunctionLength', CASE WHEN v_functions > 0 THEN v_lines::DECIMAL / v_functions ELSE 0 END
  )
  INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get user's AI coding insights
CREATE OR REPLACE FUNCTION get_user_ai_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_insights JSON;
BEGIN
  SELECT json_build_object(
    'stats', row_to_json(acs.*),
    'recentCompletions', (
      SELECT json_agg(json_build_object(
        'id', cc.id,
        'language', cc.language,
        'confidence', cc.confidence,
        'createdAt', cc.created_at
      ))
      FROM (
        SELECT id, language, confidence, created_at
        FROM code_completions
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 5
      ) cc
    ),
    'topSnippets', (
      SELECT json_agg(json_build_object(
        'id', cs.id,
        'name', cs.name,
        'language', cs.language,
        'usageCount', cs.usage_count
      ))
      FROM (
        SELECT id, name, language, usage_count
        FROM code_snippets
        WHERE user_id = p_user_id
        ORDER BY usage_count DESC
        LIMIT 5
      ) cs
    )
  )
  INTO v_insights
  FROM ai_code_stats acs
  WHERE acs.user_id = p_user_id;

  RETURN v_insights;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE code_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_code_stats ENABLE ROW LEVEL SECURITY;

-- Code Completions policies
CREATE POLICY "Users can view their own completions"
  ON code_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own completions"
  ON code_completions FOR ALL
  USING (auth.uid() = user_id);

-- Code Snippets policies
CREATE POLICY "Users can view public snippets"
  ON code_snippets FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own snippets"
  ON code_snippets FOR ALL
  USING (auth.uid() = user_id);

-- Code Analysis policies (with related tables access through analysis_id)
CREATE POLICY "Users can view their own analysis"
  ON code_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own analysis"
  ON code_analysis FOR ALL
  USING (auth.uid() = user_id);

-- Bug Reports policies
CREATE POLICY "Users can view bugs from their analysis"
  ON bug_reports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage bugs from their analysis"
  ON bug_reports FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = bug_reports.analysis_id AND user_id = auth.uid()
  ));

-- Code Suggestions policies
CREATE POLICY "Users can view suggestions from their analysis"
  ON code_suggestions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage suggestions from their analysis"
  ON code_suggestions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = code_suggestions.analysis_id AND user_id = auth.uid()
  ));

-- Security Issues policies
CREATE POLICY "Users can view security issues from their analysis"
  ON security_issues FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage security issues from their analysis"
  ON security_issues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_analysis
    WHERE id = security_issues.analysis_id AND user_id = auth.uid()
  ));

-- Code Templates policies
CREATE POLICY "Users can view public templates"
  ON code_templates FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own templates"
  ON code_templates FOR ALL
  USING (auth.uid() = user_id);

-- Code Versions policies
CREATE POLICY "Users can view versions of their snippets"
  ON code_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage versions of their snippets"
  ON code_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM code_snippets
    WHERE id = code_versions.snippet_id AND user_id = auth.uid()
  ));

-- Code Exports policies
CREATE POLICY "Users can view their own exports"
  ON code_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own exports"
  ON code_exports FOR ALL
  USING (auth.uid() = user_id);

-- AI Code Stats policies
CREATE POLICY "Users can view their own stats"
  ON ai_code_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own stats"
  ON ai_code_stats FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20251126_notifications_system.sql
-- ============================================================================
-- ============================================================================
-- Notifications System - Production Database Schema
-- ============================================================================
-- Comprehensive notification management with real-time updates, multi-channel
-- delivery, preferences, templates, and delivery tracking
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE notification_type AS ENUM (
  'info', 'success', 'warning', 'error', 'payment', 'project',
  'message', 'system', 'review', 'deadline', 'collaboration', 'file', 'invoice'
);

CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push', 'sms', 'webhook');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived', 'deleted');
CREATE TYPE delivery_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');
CREATE TYPE notification_frequency AS ENUM ('instant', 'hourly', 'daily', 'weekly');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Notifications
CREATE TABLE notifications (
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
CREATE TABLE notification_preferences (
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
CREATE TABLE notification_deliveries (
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
CREATE TABLE notification_templates (
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
CREATE TABLE notification_stats (
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
CREATE TABLE notification_groups (
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
CREATE TABLE notification_bulk_actions (
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
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_expires_at ON notifications(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_notifications_related ON notifications(related_id, related_type);
CREATE INDEX idx_notifications_metadata ON notifications USING GIN(metadata);

-- Notification Preferences indexes
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(notification_type);
CREATE INDEX idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Notification Deliveries indexes
CREATE INDEX idx_notification_deliveries_notification_id ON notification_deliveries(notification_id);
CREATE INDEX idx_notification_deliveries_channel ON notification_deliveries(channel);
CREATE INDEX idx_notification_deliveries_status ON notification_deliveries(status);
CREATE INDEX idx_notification_deliveries_created_at ON notification_deliveries(created_at DESC);

-- Notification Templates indexes
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_is_active ON notification_templates(is_active);

-- Notification Stats indexes
CREATE INDEX idx_notification_stats_user_id ON notification_stats(user_id);

-- Notification Groups indexes
CREATE INDEX idx_notification_groups_user_id ON notification_groups(user_id);
CREATE INDEX idx_notification_groups_type ON notification_groups(type);

-- Bulk Actions indexes
CREATE INDEX idx_notification_bulk_actions_user_id ON notification_bulk_actions(user_id);
CREATE INDEX idx_notification_bulk_actions_created_at ON notification_bulk_actions(created_at DESC);

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

-- ============================================================================
-- 20251126_bookings_system.sql
-- ============================================================================
-- ============================================================================
-- Bookings System - Production Database Schema
-- ============================================================================
-- Comprehensive appointment and booking management with scheduling,
-- availability tracking, reminders, and revenue calculations
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_status AS ENUM ('awaiting', 'paid', 'partial', 'refunded', 'failed');
CREATE TYPE booking_type AS ENUM ('consultation', 'meeting', 'service', 'call', 'workshop', 'event');
CREATE TYPE recurrence_type AS ENUM ('none', 'daily', 'weekly', 'biweekly', 'monthly');
CREATE TYPE reminder_type AS ENUM ('email', 'sms', 'push', 'all');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  service TEXT NOT NULL,
  type booking_type NOT NULL DEFAULT 'consultation',
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status booking_status NOT NULL DEFAULT 'pending',
  payment payment_status NOT NULL DEFAULT 'awaiting',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  location TEXT,
  meeting_link TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  recurrence recurrence_type NOT NULL DEFAULT 'none',
  parent_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_type reminder_type,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Slots (Availability)
CREATE TABLE booking_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  slot_duration INTEGER NOT NULL DEFAULT 60, -- minutes
  buffer_time INTEGER NOT NULL DEFAULT 0, -- minutes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Settings
CREATE TABLE booking_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_hours_start TIME NOT NULL DEFAULT '09:00',
  business_hours_end TIME NOT NULL DEFAULT '17:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  working_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Monday-Friday
  slot_duration INTEGER NOT NULL DEFAULT 60,
  buffer_time INTEGER NOT NULL DEFAULT 0,
  advance_booking_days INTEGER NOT NULL DEFAULT 30,
  cancellation_policy TEXT,
  auto_confirm BOOLEAN NOT NULL DEFAULT FALSE,
  require_deposit BOOLEAN NOT NULL DEFAULT FALSE,
  deposit_percentage INTEGER NOT NULL DEFAULT 0 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
  send_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_hours INTEGER[] DEFAULT '{24,2}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Reminders
CREATE TABLE booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  type reminder_type NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Stats
CREATE TABLE booking_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  confirmed INTEGER NOT NULL DEFAULT 0,
  pending INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  cancelled INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_booking_value DECIMAL(10, 2) NOT NULL DEFAULT 0,
  most_popular_service TEXT,
  peak_booking_day TEXT,
  completion_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  cancellation_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  no_show_rate INTEGER NOT NULL DEFAULT 0, -- percentage
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Bookings indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, booking_date);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_tags ON bookings USING GIN(tags);
CREATE INDEX idx_bookings_recurrence ON bookings(recurrence) WHERE recurrence != 'none';

-- Booking Slots indexes
CREATE INDEX idx_booking_slots_user_id ON booking_slots(user_id);
CREATE INDEX idx_booking_slots_day ON booking_slots(day_of_week);
CREATE INDEX idx_booking_slots_available ON booking_slots(is_available);

-- Booking Settings indexes
CREATE INDEX idx_booking_settings_user_id ON booking_settings(user_id);

-- Booking Reminders indexes
CREATE INDEX idx_booking_reminders_booking_id ON booking_reminders(booking_id);
CREATE INDEX idx_booking_reminders_scheduled ON booking_reminders(scheduled_for);
CREATE INDEX idx_booking_reminders_sent ON booking_reminders(sent) WHERE sent = FALSE;

-- Booking Stats indexes
CREATE INDEX idx_booking_stats_user_id ON booking_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_slots_updated_at
  BEFORE UPDATE ON booking_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_settings_updated_at
  BEFORE UPDATE ON booking_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_booking_stats_updated_at
  BEFORE UPDATE ON booking_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update stats on booking changes
CREATE OR REPLACE FUNCTION update_booking_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO booking_stats (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO UPDATE SET
    total_bookings = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id),
    confirmed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'confirmed'),
    pending = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'pending'),
    completed = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'completed'),
    cancelled = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'cancelled'),
    no_shows = (SELECT COUNT(*) FROM bookings WHERE user_id = EXCLUDED.user_id AND status = 'no_show'),
    total_revenue = (SELECT COALESCE(SUM(amount), 0) FROM bookings WHERE user_id = EXCLUDED.user_id AND payment = 'paid'),
    average_booking_value = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COALESCE(SUM(amount), 0) / COUNT(*), 2)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    completion_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    cancellation_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'cancelled')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    no_show_rate = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND((COUNT(*) FILTER (WHERE status = 'no_show')::DECIMAL / COUNT(*)) * 100)
        ELSE 0
      END
      FROM bookings WHERE user_id = EXCLUDED.user_id
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_booking_change
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_stats();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get available time slots for a date
CREATE OR REPLACE FUNCTION get_available_slots(
  p_user_id UUID,
  p_date DATE,
  p_duration INTEGER DEFAULT 60
)
RETURNS TABLE(
  slot_time TIME,
  is_available BOOLEAN
) AS $$
DECLARE
  v_start_time TIME;
  v_end_time TIME;
  v_day_of_week INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  -- Get business hours for the day
  SELECT business_hours_start, business_hours_end
  INTO v_start_time, v_end_time
  FROM booking_settings
  WHERE user_id = p_user_id AND v_day_of_week = ANY(working_days);

  IF v_start_time IS NULL THEN
    RETURN;
  END IF;

  -- Generate slots
  RETURN QUERY
  WITH RECURSIVE time_slots AS (
    SELECT v_start_time AS slot_time
    UNION ALL
    SELECT slot_time + (p_duration || ' minutes')::INTERVAL
    FROM time_slots
    WHERE slot_time + (p_duration || ' minutes')::INTERVAL < v_end_time
  )
  SELECT
    ts.slot_time,
    NOT EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.user_id = p_user_id
        AND b.booking_date = p_date
        AND b.start_time = ts.slot_time
        AND b.status != 'cancelled'
    ) AS is_available
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming bookings
CREATE OR REPLACE FUNCTION get_upcoming_bookings(p_user_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  id UUID,
  client_name TEXT,
  service TEXT,
  booking_date DATE,
  start_time TIME,
  status booking_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.client_name, b.service, b.booking_date, b.start_time, b.status
  FROM bookings b
  WHERE b.user_id = p_user_id
    AND b.booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days
    AND b.status != 'cancelled'
  ORDER BY b.booking_date, b.start_time;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue for period
CREATE OR REPLACE FUNCTION calculate_booking_revenue(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_revenue DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO v_revenue
  FROM bookings
  WHERE user_id = p_user_id
    AND payment = 'paid'
    AND (p_start_date IS NULL OR booking_date >= p_start_date)
    AND (p_end_date IS NULL OR booking_date <= p_end_date);

  RETURN v_revenue;
END;
$$ LANGUAGE plpgsql;

-- Check for booking conflicts
CREATE OR REPLACE FUNCTION check_booking_conflict(
  p_user_id UUID,
  p_date DATE,
  p_time TIME,
  p_duration INTEGER,
  p_exclude_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conflict BOOLEAN;
  v_end_time TIME;
BEGIN
  v_end_time := p_time + (p_duration || ' minutes')::INTERVAL;

  SELECT EXISTS (
    SELECT 1
    FROM bookings
    WHERE user_id = p_user_id
      AND booking_date = p_date
      AND status != 'cancelled'
      AND (id IS DISTINCT FROM p_exclude_id)
      AND (
        (start_time >= p_time AND start_time < v_end_time) OR
        (start_time + (duration_minutes || ' minutes')::INTERVAL > p_time
         AND start_time < p_time)
      )
  )
  INTO v_conflict;

  RETURN v_conflict;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_stats ENABLE ROW LEVEL SECURITY;

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Slots policies
CREATE POLICY "Users can view all public slots"
  ON booking_slots FOR SELECT
  USING (is_available = TRUE);

CREATE POLICY "Users can manage their own slots"
  ON booking_slots FOR ALL
  USING (auth.uid() = user_id);

-- Booking Settings policies
CREATE POLICY "Users can view their own settings"
  ON booking_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON booking_settings FOR ALL
  USING (auth.uid() = user_id);

-- Booking Reminders policies
CREATE POLICY "Users can view reminders for their bookings"
  ON booking_reminders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE id = booking_reminders.booking_id AND user_id = auth.uid()
  ));

-- Booking Stats policies
CREATE POLICY "Users can view their own stats"
  ON booking_stats FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- 20251126_invoicing_system.sql
-- ============================================================================
-- ============================================================================
-- Invoicing System - Production Database Schema
-- ============================================================================
-- Comprehensive invoicing and billing management with recurring invoices,
-- payment tracking, templates, and revenue analytics
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'check', 'crypto');
CREATE TYPE billing_cycle AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE tax_type AS ENUM ('percentage', 'fixed');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
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
CREATE TABLE invoice_items (
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
CREATE TABLE recurring_invoices (
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
CREATE TABLE payments (
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
CREATE TABLE invoice_templates (
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
CREATE TABLE template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing Stats
CREATE TABLE billing_stats (
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
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_metadata ON invoices USING GIN(metadata);

-- Invoice Items indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Recurring Invoices indexes
CREATE INDEX idx_recurring_invoices_invoice_id ON recurring_invoices(invoice_id);
CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX idx_recurring_invoices_enabled ON recurring_invoices(enabled) WHERE enabled = TRUE;

-- Payments indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- Invoice Templates indexes
CREATE INDEX idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_invoice_templates_is_default ON invoice_templates(is_default);

-- Template Items indexes
CREATE INDEX idx_template_items_template_id ON template_items(template_id);

-- Billing Stats indexes
CREATE INDEX idx_billing_stats_user_id ON billing_stats(user_id);

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
