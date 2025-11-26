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
