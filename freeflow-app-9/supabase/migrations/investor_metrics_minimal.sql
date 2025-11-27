-- Minimal Investor Metrics Schema
-- Investment-grade analytics for funding decisions and board reporting

-- ENUMS
DROP TYPE IF EXISTS market_position CASCADE;
DROP TYPE IF EXISTS trend_direction CASCADE;
DROP TYPE IF EXISTS metric_period CASCADE;

CREATE TYPE market_position AS ENUM ('leader', 'challenger', 'niche', 'emerging');
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
CREATE TYPE metric_period AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- TABLES
DROP TABLE IF EXISTS board_deck_reports CASCADE;
DROP TABLE IF EXISTS market_competitors CASCADE;
DROP TABLE IF EXISTS growth_projections CASCADE;
DROP TABLE IF EXISTS cohort_retention CASCADE;
DROP TABLE IF EXISTS platform_health_snapshots CASCADE;
DROP TABLE IF EXISTS investor_metrics CASCADE;

CREATE TABLE investor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  period metric_period NOT NULL DEFAULT 'monthly',

  -- User Metrics
  total_users INTEGER NOT NULL DEFAULT 0,
  active_users_daily INTEGER NOT NULL DEFAULT 0,
  active_users_weekly INTEGER NOT NULL DEFAULT 0,
  active_users_monthly INTEGER NOT NULL DEFAULT 0,
  user_growth_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  new_users_today INTEGER NOT NULL DEFAULT 0,
  new_users_this_week INTEGER NOT NULL DEFAULT 0,
  new_users_this_month INTEGER NOT NULL DEFAULT 0,
  churned_users INTEGER NOT NULL DEFAULT 0,
  churn_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,

  -- Engagement Metrics
  avg_session_duration INTEGER NOT NULL DEFAULT 0,
  avg_sessions_per_user DECIMAL(8, 2) NOT NULL DEFAULT 0,
  avg_actions_per_session DECIMAL(8, 2) NOT NULL DEFAULT 0,
  power_user_count INTEGER NOT NULL DEFAULT 0,
  active_projects_per_user DECIMAL(8, 2) NOT NULL DEFAULT 0,

  -- Revenue Metrics
  mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  arr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_growth DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_project_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_velocity DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_gmv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  platform_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_per_user DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_revenue_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  gross_revenue_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,

  -- Retention Metrics
  ltv DECIMAL(12, 2) NOT NULL DEFAULT 0,
  cac DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ltv_cac_ratio DECIMAL(5, 2) NOT NULL DEFAULT 0,
  payback_period INTEGER NOT NULL DEFAULT 0,

  -- AI Metrics
  ai_engagement_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_ai_interactions INTEGER NOT NULL DEFAULT 0,
  ai_interactions_per_user DECIMAL(8, 2) NOT NULL DEFAULT 0,
  avg_tokens_per_interaction INTEGER NOT NULL DEFAULT 0,
  total_ai_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ai_cost_per_user DECIMAL(8, 2) NOT NULL DEFAULT 0,
  ai_value_created DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ai_margin_contribution DECIMAL(5, 2) NOT NULL DEFAULT 0,

  -- Platform Metrics
  uptime DECIMAL(5, 2) NOT NULL DEFAULT 99.9,
  avg_response_time INTEGER NOT NULL DEFAULT 0,
  error_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  api_calls_per_day INTEGER NOT NULL DEFAULT 0,
  storage_used DECIMAL(12, 2) NOT NULL DEFAULT 0,
  bandwidth_used DECIMAL(12, 2) NOT NULL DEFAULT 0,
  concurrent_users INTEGER NOT NULL DEFAULT 0,
  peak_concurrent_users INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, metric_date, period)
);

CREATE TABLE platform_health_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  metric_id UUID REFERENCES investor_metrics(id) ON DELETE SET NULL,

  -- Market Intelligence
  market_share DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_addressable_market DECIMAL(15, 2) NOT NULL DEFAULT 0,
  servicable_addressable_market DECIMAL(15, 2) NOT NULL DEFAULT 0,
  servicable_obtainable_market DECIMAL(15, 2) NOT NULL DEFAULT 0,

  -- Financial Health
  burn_rate DECIMAL(12, 2) NOT NULL DEFAULT 0,
  runway_months INTEGER NOT NULL DEFAULT 0,

  -- Summary Data
  headline TEXT,
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  concerns TEXT[] DEFAULT ARRAY[]::TEXT[],
  next_steps TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cohort_retention (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cohort_name TEXT NOT NULL,
  cohort_date DATE NOT NULL,
  cohort_size INTEGER NOT NULL DEFAULT 0,

  -- Retention Percentages
  week1_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  month1_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  month3_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  month6_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,
  year1_retention DECIMAL(5, 2) NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cohort_name, cohort_date)
);

CREATE TABLE growth_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  projection_date DATE NOT NULL,

  projected_users INTEGER NOT NULL DEFAULT 0,
  projected_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),

  assumptions JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE market_competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  user_count INTEGER NOT NULL DEFAULT 0,
  pricing DECIMAL(12, 2) NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  market_position market_position NOT NULL DEFAULT 'emerging',

  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE board_deck_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  health_snapshot_id UUID REFERENCES platform_health_snapshots(id) ON DELETE SET NULL,

  -- Summary Section
  headline TEXT NOT NULL,
  key_metrics JSONB DEFAULT '[]'::JSONB,
  highlights TEXT[] DEFAULT ARRAY[]::TEXT[],
  concerns TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Charts Data
  user_growth_chart JSONB DEFAULT '{}'::JSONB,
  revenue_chart JSONB DEFAULT '{}'::JSONB,
  revenue_breakdown JSONB DEFAULT '{}'::JSONB,

  -- Analysis
  user_growth_analysis TEXT,
  user_growth_prediction TEXT,
  revenue_analysis TEXT,
  retention_analysis TEXT,
  ai_insights TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Market Position
  differentiation TEXT[] DEFAULT ARRAY[]::TEXT[],
  market_opportunity TEXT,

  -- Financial
  ai_roi DECIMAL(5, 2) NOT NULL DEFAULT 0,
  next_steps TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_investor_metrics_user_id ON investor_metrics(user_id);
CREATE INDEX idx_investor_metrics_date ON investor_metrics(metric_date DESC);
CREATE INDEX idx_investor_metrics_period ON investor_metrics(period);
CREATE INDEX idx_investor_metrics_user_date ON investor_metrics(user_id, metric_date);
CREATE INDEX idx_health_snapshots_user_id ON platform_health_snapshots(user_id);
CREATE INDEX idx_health_snapshots_date ON platform_health_snapshots(snapshot_date DESC);
CREATE INDEX idx_health_snapshots_score ON platform_health_snapshots(health_score);
CREATE INDEX idx_cohort_retention_user_id ON cohort_retention(user_id);
CREATE INDEX idx_cohort_retention_date ON cohort_retention(cohort_date DESC);
CREATE INDEX idx_growth_projections_user_id ON growth_projections(user_id);
CREATE INDEX idx_growth_projections_date ON growth_projections(projection_date DESC);
CREATE INDEX idx_market_competitors_user_id ON market_competitors(user_id);
CREATE INDEX idx_market_competitors_position ON market_competitors(market_position);
CREATE INDEX idx_board_deck_reports_user_id ON board_deck_reports(user_id);
CREATE INDEX idx_board_deck_reports_date ON board_deck_reports(report_date DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_investor_metrics_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_investor_metrics_updated_at BEFORE UPDATE ON investor_metrics FOR EACH ROW EXECUTE FUNCTION update_investor_metrics_updated_at();
CREATE TRIGGER trigger_cohort_retention_updated_at BEFORE UPDATE ON cohort_retention FOR EACH ROW EXECUTE FUNCTION update_investor_metrics_updated_at();
CREATE TRIGGER trigger_growth_projections_updated_at BEFORE UPDATE ON growth_projections FOR EACH ROW EXECUTE FUNCTION update_investor_metrics_updated_at();
CREATE TRIGGER trigger_market_competitors_updated_at BEFORE UPDATE ON market_competitors FOR EACH ROW EXECUTE FUNCTION update_investor_metrics_updated_at();

CREATE OR REPLACE FUNCTION calculate_derived_metrics() RETURNS TRIGGER AS $$
BEGIN
  -- Calculate ARR from MRR
  IF NEW.mrr > 0 THEN
    NEW.arr = NEW.mrr * 12;
  END IF;

  -- Calculate revenue per user
  IF NEW.total_users > 0 THEN
    NEW.revenue_per_user = NEW.mrr / NEW.total_users;
  END IF;

  -- Calculate LTV:CAC ratio
  IF NEW.cac > 0 THEN
    NEW.ltv_cac_ratio = NEW.ltv / NEW.cac;
  END IF;

  -- Calculate AI interactions per user
  IF NEW.total_users > 0 THEN
    NEW.ai_interactions_per_user = NEW.total_ai_interactions::DECIMAL / NEW.total_users;
  END IF;

  -- Calculate AI cost per user
  IF NEW.total_users > 0 THEN
    NEW.ai_cost_per_user = NEW.total_ai_cost / NEW.total_users;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_derived_metrics BEFORE INSERT OR UPDATE ON investor_metrics FOR EACH ROW EXECUTE FUNCTION calculate_derived_metrics();
