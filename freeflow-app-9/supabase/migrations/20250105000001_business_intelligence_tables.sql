-- ============================================================================
-- Business Intelligence Tables Migration
-- Supports freelancers, entrepreneurs, agencies, and enterprises
-- ============================================================================

-- KPI Goals Table
CREATE TABLE IF NOT EXISTS kpi_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('revenue', 'profitability', 'clients', 'projects', 'efficiency', 'growth', 'retention', 'cash_flow', 'marketing', 'operations')),
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'on_track', 'at_risk', 'behind', 'achieved', 'exceeded', 'abandoned')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  milestones JSONB DEFAULT '[]'::jsonb,
  history JSONB DEFAULT '[]'::jsonb,
  linked_metrics TEXT[] DEFAULT '{}',
  owner TEXT,
  team TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Metrics Snapshots (for historical tracking)
CREATE TABLE IF NOT EXISTS business_metrics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

  -- Revenue Metrics
  total_revenue NUMERIC DEFAULT 0,
  recurring_revenue NUMERIC DEFAULT 0,
  project_revenue NUMERIC DEFAULT 0,
  revenue_growth NUMERIC DEFAULT 0,

  -- Profitability Metrics
  gross_profit NUMERIC DEFAULT 0,
  gross_margin NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  net_margin NUMERIC DEFAULT 0,

  -- Client Metrics
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  client_acquisition_cost NUMERIC DEFAULT 0,
  client_lifetime_value NUMERIC DEFAULT 0,
  ltv_to_cac_ratio NUMERIC DEFAULT 0,
  retention_rate NUMERIC DEFAULT 0,

  -- Project Metrics
  total_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  average_project_value NUMERIC DEFAULT 0,
  average_project_margin NUMERIC DEFAULT 0,

  -- Time & Efficiency
  total_hours NUMERIC DEFAULT 0,
  billable_hours NUMERIC DEFAULT 0,
  utilization_rate NUMERIC DEFAULT 0,
  effective_hourly_rate NUMERIC DEFAULT 0,

  -- Cash Flow
  cash_on_hand NUMERIC DEFAULT 0,
  accounts_receivable NUMERIC DEFAULT 0,
  accounts_payable NUMERIC DEFAULT 0,
  burn_rate NUMERIC DEFAULT 0,
  cash_runway NUMERIC DEFAULT 0,

  -- Health Score
  health_score INTEGER DEFAULT 0,
  health_components JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, snapshot_date, period)
);

-- Revenue Forecasts Table
CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  target_month DATE NOT NULL,
  projected_amount NUMERIC NOT NULL,
  optimistic_amount NUMERIC,
  pessimistic_amount NUMERIC,
  confidence NUMERIC DEFAULT 0.7,
  method TEXT DEFAULT 'linear' CHECK (method IN ('linear', 'exponential', 'seasonal', 'ml_based')),
  assumptions JSONB DEFAULT '{}'::jsonb,
  actual_amount NUMERIC,
  variance NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Value Tracking
CREATE TABLE IF NOT EXISTS client_value_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Value Metrics
  total_revenue NUMERIC DEFAULT 0,
  monthly_revenue NUMERIC DEFAULT 0,
  estimated_ltv NUMERIC DEFAULT 0,

  -- Engagement Metrics
  project_count INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  tenure_months INTEGER DEFAULT 0,

  -- Health & Risk
  health_score INTEGER DEFAULT 50,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('thriving', 'healthy', 'at_risk', 'churning', 'churned')),
  churn_probability NUMERIC DEFAULT 0,
  days_since_last_activity INTEGER DEFAULT 0,

  -- Segmentation
  segment TEXT DEFAULT 'small_business' CHECK (segment IN ('enterprise', 'mid_market', 'small_business', 'startup', 'individual')),
  tier TEXT DEFAULT 'silver' CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),

  -- Profitability
  total_profit NUMERIC DEFAULT 0,
  profit_margin NUMERIC DEFAULT 0,
  effective_rate NUMERIC DEFAULT 0,

  UNIQUE(client_id, DATE(calculated_at))
);

-- Project Profitability Analysis
CREATE TABLE IF NOT EXISTS project_profitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Revenue
  quoted_amount NUMERIC DEFAULT 0,
  actual_revenue NUMERIC DEFAULT 0,

  -- Costs
  labor_cost NUMERIC DEFAULT 0,
  material_cost NUMERIC DEFAULT 0,
  overhead_cost NUMERIC DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,

  -- Profit
  gross_profit NUMERIC DEFAULT 0,
  gross_margin NUMERIC DEFAULT 0,
  net_profit NUMERIC DEFAULT 0,
  net_margin NUMERIC DEFAULT 0,

  -- Time
  estimated_hours NUMERIC DEFAULT 0,
  actual_hours NUMERIC DEFAULT 0,
  hours_variance NUMERIC DEFAULT 0,
  effective_hourly_rate NUMERIC DEFAULT 0,

  -- Status
  budget_status TEXT DEFAULT 'on_track' CHECK (budget_status IN ('under_budget', 'on_track', 'over_budget', 'critical')),

  UNIQUE(project_id, DATE(calculated_at))
);

-- Business Insights (AI-generated)
CREATE TABLE IF NOT EXISTS business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('trend', 'anomaly', 'correlation', 'prediction', 'celebration', 'recommendation')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact TEXT DEFAULT 'neutral' CHECK (impact IN ('positive', 'negative', 'neutral')),
  confidence NUMERIC DEFAULT 0.7,
  related_entity_type TEXT,
  related_entity_id UUID,
  suggested_action TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_kpi_goals_user_id ON kpi_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_kpi_goals_status ON kpi_goals(status);
CREATE INDEX IF NOT EXISTS idx_kpi_goals_category ON kpi_goals(category);
CREATE INDEX IF NOT EXISTS idx_business_metrics_snapshots_user_date ON business_metrics_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_user_month ON revenue_forecasts(user_id, target_month);
CREATE INDEX IF NOT EXISTS idx_client_value_metrics_client ON client_value_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_client_value_metrics_user ON client_value_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_project_profitability_project ON project_profitability(project_id);
CREATE INDEX IF NOT EXISTS idx_business_insights_user ON business_insights(user_id, is_read);

-- Row Level Security
ALTER TABLE kpi_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_value_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_profitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own KPI goals" ON kpi_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics snapshots" ON business_metrics_snapshots
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own forecasts" ON revenue_forecasts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own client value metrics" ON client_value_metrics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own project profitability" ON project_profitability
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own insights" ON business_insights
  FOR ALL USING (auth.uid() = user_id);

-- Function to update business metrics snapshot
CREATE OR REPLACE FUNCTION update_business_metrics_snapshot(p_user_id UUID, p_period TEXT DEFAULT 'daily')
RETURNS UUID AS $$
DECLARE
  v_snapshot_id UUID;
  v_total_revenue NUMERIC;
  v_total_clients INTEGER;
  v_active_clients INTEGER;
  v_total_projects INTEGER;
  v_completed_projects INTEGER;
BEGIN
  -- Calculate metrics from existing tables
  SELECT COALESCE(SUM(amount), 0) INTO v_total_revenue
  FROM invoices
  WHERE user_id = p_user_id AND status = 'paid';

  SELECT COUNT(*) INTO v_total_clients
  FROM clients WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_active_clients
  FROM clients WHERE user_id = p_user_id AND status = 'active';

  SELECT COUNT(*) INTO v_total_projects
  FROM projects WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_completed_projects
  FROM projects WHERE user_id = p_user_id AND status = 'completed';

  -- Insert or update snapshot
  INSERT INTO business_metrics_snapshots (
    user_id, snapshot_date, period,
    total_revenue, total_clients, active_clients,
    total_projects, completed_projects
  ) VALUES (
    p_user_id, CURRENT_DATE, p_period,
    v_total_revenue, v_total_clients, v_active_clients,
    v_total_projects, v_completed_projects
  )
  ON CONFLICT (user_id, snapshot_date, period)
  DO UPDATE SET
    total_revenue = EXCLUDED.total_revenue,
    total_clients = EXCLUDED.total_clients,
    active_clients = EXCLUDED.active_clients,
    total_projects = EXCLUDED.total_projects,
    completed_projects = EXCLUDED.completed_projects
  RETURNING id INTO v_snapshot_id;

  RETURN v_snapshot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate client LTV
CREATE OR REPLACE FUNCTION calculate_client_ltv(p_client_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_revenue NUMERIC;
  v_tenure_months INTEGER;
  v_monthly_revenue NUMERIC;
  v_avg_lifespan_months INTEGER := 24;
BEGIN
  -- Get total revenue from client
  SELECT COALESCE(SUM(i.amount), 0) INTO v_total_revenue
  FROM invoices i
  JOIN projects p ON p.id = i.project_id
  WHERE p.client_id = p_client_id AND i.status = 'paid';

  -- Get tenure in months
  SELECT GREATEST(1, EXTRACT(MONTH FROM AGE(NOW(), c.created_at))::INTEGER)
  INTO v_tenure_months
  FROM clients c WHERE c.id = p_client_id;

  -- Calculate monthly revenue
  v_monthly_revenue := v_total_revenue / v_tenure_months;

  -- Estimate LTV
  RETURN v_monthly_revenue * v_avg_lifespan_months;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample KPI goals for demo users
INSERT INTO kpi_goals (user_id, name, description, category, target_value, current_value, unit, start_date, end_date, status, priority, frequency, tags)
SELECT
  u.id,
  'Q1 Revenue Target',
  'Achieve $30,000 in revenue for Q1',
  'revenue',
  30000,
  24500,
  '$',
  '2025-01-01',
  '2025-03-31',
  'on_track',
  'critical',
  'quarterly',
  ARRAY['revenue', 'q1', 'priority']
FROM auth.users u
WHERE u.email = 'alex@freeflow.io'
ON CONFLICT DO NOTHING;

INSERT INTO kpi_goals (user_id, name, description, category, target_value, current_value, unit, start_date, end_date, status, priority, frequency, tags)
SELECT
  u.id,
  'Client Retention Rate',
  'Maintain 90% client retention',
  'retention',
  90,
  87,
  '%',
  '2025-01-01',
  '2025-12-31',
  'at_risk',
  'high',
  'yearly',
  ARRAY['retention', 'clients']
FROM auth.users u
WHERE u.email = 'alex@freeflow.io'
ON CONFLICT DO NOTHING;

INSERT INTO kpi_goals (user_id, name, description, category, target_value, current_value, unit, start_date, end_date, status, priority, frequency, tags)
SELECT
  u.id,
  'Profit Margin',
  'Achieve 35% net profit margin',
  'profitability',
  35,
  32,
  '%',
  '2025-01-01',
  '2025-12-31',
  'on_track',
  'high',
  'yearly',
  ARRAY['profitability', 'efficiency']
FROM auth.users u
WHERE u.email = 'alex@freeflow.io'
ON CONFLICT DO NOTHING;

COMMENT ON TABLE kpi_goals IS 'KPI goals and targets for business maximization';
COMMENT ON TABLE business_metrics_snapshots IS 'Historical snapshots of business metrics';
COMMENT ON TABLE revenue_forecasts IS 'Revenue forecasting data';
COMMENT ON TABLE client_value_metrics IS 'Client lifetime value and health metrics';
COMMENT ON TABLE project_profitability IS 'Project-level profitability analysis';
COMMENT ON TABLE business_insights IS 'AI-generated business insights and recommendations';
