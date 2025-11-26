-- ============================================================================
-- Reports & Analytics System - Complete Database Schema
-- ============================================================================
-- Description: Production-ready reports and financial analytics system
-- Features:
--   - Report generation and management
--   - Financial analytics tracking
--   - Scheduled report automation
--   - Export history and tracking
--   - Report templates
--   - Performance metrics
--   - Real-time analytics
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE report_type AS ENUM (
  'analytics',
  'financial',
  'performance',
  'sales',
  'custom'
);

CREATE TYPE report_status AS ENUM (
  'draft',
  'generating',
  'ready',
  'scheduled',
  'failed'
);

CREATE TYPE report_frequency AS ENUM (
  'once',
  'daily',
  'weekly',
  'monthly',
  'quarterly',
  'yearly'
);

CREATE TYPE export_format AS ENUM (
  'pdf',
  'excel',
  'csv',
  'json'
);

CREATE TYPE chart_type AS ENUM (
  'line',
  'bar',
  'pie',
  'area',
  'scatter',
  'heatmap'
);

CREATE TYPE filter_operator AS ENUM (
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'in',
  'contains'
);

CREATE TYPE kpi_status AS ENUM (
  'above',
  'on-track',
  'below'
);

CREATE TYPE trend_direction AS ENUM (
  'up',
  'stable',
  'down'
);

CREATE TYPE recommendation_category AS ENUM (
  'revenue',
  'cost',
  'efficiency',
  'growth'
);

CREATE TYPE recommendation_impact AS ENUM (
  'high',
  'medium',
  'low'
);

CREATE TYPE project_status AS ENUM (
  'active',
  'completed',
  'cancelled'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name TEXT NOT NULL,
  type report_type NOT NULL DEFAULT 'custom',
  status report_status NOT NULL DEFAULT 'draft',
  description TEXT,

  -- Scheduling
  frequency report_frequency NOT NULL DEFAULT 'once',
  next_run TIMESTAMPTZ,
  last_run TIMESTAMPTZ,

  -- Date Range
  date_range_start TIMESTAMPTZ NOT NULL,
  date_range_end TIMESTAMPTZ NOT NULL,

  -- Data
  data_points INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,

  -- Recipients
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Tags
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Configuration
  config JSONB DEFAULT '{
    "includeCharts": true,
    "includeTables": true,
    "includeRawData": false,
    "chartTypes": ["bar"],
    "metrics": [],
    "filters": [],
    "groupBy": [],
    "sortBy": "date",
    "limit": 1000
  }'::jsonb,

  -- Metadata
  created_by TEXT NOT NULL,
  generation_time INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_range_end >= date_range_start),
  CONSTRAINT valid_data_points CHECK (data_points >= 0),
  CONSTRAINT valid_file_size CHECK (file_size >= 0),
  CONSTRAINT valid_generation_time CHECK (generation_time >= 0),
  CONSTRAINT valid_views CHECK (views >= 0),
  CONSTRAINT valid_downloads CHECK (downloads >= 0)
);

-- Report Templates Table
CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,
  type report_type NOT NULL DEFAULT 'custom',

  -- Configuration
  config JSONB NOT NULL DEFAULT '{
    "includeCharts": true,
    "includeTables": true,
    "includeRawData": false,
    "chartTypes": ["bar"],
    "metrics": [],
    "filters": []
  }'::jsonb,

  -- Metadata
  is_default BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export History Table
CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Export Info
  format export_format NOT NULL,
  file_size BIGINT NOT NULL,
  download_url TEXT,

  -- Metadata
  exported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  downloaded_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0),
  CONSTRAINT valid_download_count CHECK (download_count >= 0)
);

-- Schedule History Table
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Schedule Info
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Financial Analytics Table
CREATE TABLE financial_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),

  -- Revenue Metrics
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  revenue_growth DECIMAL(5, 2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  clients_count INTEGER DEFAULT 0,
  avg_project_value DECIMAL(12, 2) DEFAULT 0,

  -- Profitability Metrics
  total_expenses DECIMAL(12, 2) DEFAULT 0,
  total_profit DECIMAL(12, 2) DEFAULT 0,
  profit_margin DECIMAL(5, 2) DEFAULT 0,

  -- Cash Flow Metrics
  cash_balance DECIMAL(12, 2) DEFAULT 0,
  income DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  net_cash_flow DECIMAL(12, 2) DEFAULT 0,

  -- Metadata
  data_points INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT unique_user_period UNIQUE (user_id, period_start, period_end, period_type)
);

-- Project Profitability Table
CREATE TABLE project_profitability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Info
  project_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'active',

  -- Financial Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  expenses DECIMAL(12, 2) DEFAULT 0,
  profit DECIMAL(12, 2) DEFAULT 0,
  margin DECIMAL(5, 2) DEFAULT 0,

  -- Dates
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT valid_expenses CHECK (expenses >= 0)
);

-- Revenue Tracking Table
CREATE TABLE revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  month TEXT NOT NULL,
  year INTEGER NOT NULL,

  -- Revenue Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  growth DECIMAL(5, 2) DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  clients_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT unique_user_month_year UNIQUE (user_id, month, year)
);

-- Service Revenue Table
CREATE TABLE service_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Service Info
  service_name TEXT NOT NULL,

  -- Revenue Data
  revenue DECIMAL(12, 2) DEFAULT 0,
  count INTEGER DEFAULT 0,
  avg_value DECIMAL(12, 2) DEFAULT 0,
  growth DECIMAL(5, 2) DEFAULT 0,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_revenue CHECK (revenue >= 0),
  CONSTRAINT valid_count CHECK (count >= 0)
);

-- Cash Flow Projections Table
CREATE TABLE cash_flow_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Period
  month TEXT NOT NULL,
  year INTEGER NOT NULL,

  -- Projection Data
  projected_income DECIMAL(12, 2) DEFAULT 0,
  projected_expenses DECIMAL(12, 2) DEFAULT 0,
  projected_net DECIMAL(12, 2) DEFAULT 0,
  projected_balance DECIMAL(12, 2) DEFAULT 0,

  -- Actual Data (filled when period completes)
  actual_income DECIMAL(12, 2),
  actual_expenses DECIMAL(12, 2),
  actual_net DECIMAL(12, 2),
  actual_balance DECIMAL(12, 2),

  -- Metadata
  confidence DECIMAL(3, 2) DEFAULT 0.80, -- 0.00 to 1.00

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_year CHECK (year >= 2000 AND year <= 2100),
  CONSTRAINT valid_confidence CHECK (confidence >= 0 AND confidence <= 1)
);

-- Business Insights Table
CREATE TABLE business_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Insight Data
  client_retention DECIMAL(5, 2) DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Additional Metrics
  metrics JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_retention CHECK (client_retention >= 0 AND client_retention <= 100)
);

-- Performance Metrics Table
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metric Info
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12, 2) NOT NULL,
  target_value DECIMAL(12, 2) NOT NULL,

  -- Status
  status kpi_status NOT NULL DEFAULT 'on-track',
  trend trend_direction NOT NULL DEFAULT 'stable',

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

-- Recommendations Table
CREATE TABLE business_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recommendation Info
  category recommendation_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Priority
  impact recommendation_impact NOT NULL,
  effort recommendation_impact NOT NULL,
  priority INTEGER NOT NULL DEFAULT 1,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed')),

  -- Metadata
  implemented_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_priority CHECK (priority >= 1)
);

-- Report Views Table (Analytics)
CREATE TABLE report_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- View Info
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INTEGER DEFAULT 0, -- seconds

  -- Metadata
  user_agent TEXT,
  ip_address INET
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Reports Indexes
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_frequency ON reports(frequency);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_next_run ON reports(next_run) WHERE next_run IS NOT NULL;
CREATE INDEX idx_reports_tags ON reports USING gin(tags);
CREATE INDEX idx_reports_user_status ON reports(user_id, status);
CREATE INDEX idx_reports_user_type ON reports(user_id, type);
CREATE INDEX idx_reports_date_range ON reports(date_range_start, date_range_end);

-- Report Templates Indexes
CREATE INDEX idx_report_templates_type ON report_templates(type);
CREATE INDEX idx_report_templates_user_id ON report_templates(user_id);
CREATE INDEX idx_report_templates_default ON report_templates(is_default) WHERE is_default = true;

-- Report Exports Indexes
CREATE INDEX idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX idx_report_exports_user_id ON report_exports(user_id);
CREATE INDEX idx_report_exports_exported_at ON report_exports(exported_at DESC);
CREATE INDEX idx_report_exports_format ON report_exports(format);

-- Report Schedules Indexes
CREATE INDEX idx_report_schedules_report_id ON report_schedules(report_id);
CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX idx_report_schedules_scheduled_at ON report_schedules(scheduled_at DESC);
CREATE INDEX idx_report_schedules_status ON report_schedules(status);

-- Financial Analytics Indexes
CREATE INDEX idx_financial_analytics_user_id ON financial_analytics(user_id);
CREATE INDEX idx_financial_analytics_period ON financial_analytics(period_start, period_end);
CREATE INDEX idx_financial_analytics_type ON financial_analytics(period_type);
CREATE INDEX idx_financial_analytics_user_period ON financial_analytics(user_id, period_start, period_end);

-- Project Profitability Indexes
CREATE INDEX idx_project_profitability_user_id ON project_profitability(user_id);
CREATE INDEX idx_project_profitability_project_id ON project_profitability(project_id);
CREATE INDEX idx_project_profitability_status ON project_profitability(status);
CREATE INDEX idx_project_profitability_margin ON project_profitability(margin DESC);
CREATE INDEX idx_project_profitability_dates ON project_profitability(start_date, end_date);

-- Revenue Tracking Indexes
CREATE INDEX idx_revenue_tracking_user_id ON revenue_tracking(user_id);
CREATE INDEX idx_revenue_tracking_year ON revenue_tracking(year DESC);
CREATE INDEX idx_revenue_tracking_user_year ON revenue_tracking(user_id, year);

-- Service Revenue Indexes
CREATE INDEX idx_service_revenue_user_id ON service_revenue(user_id);
CREATE INDEX idx_service_revenue_service ON service_revenue(service_name);
CREATE INDEX idx_service_revenue_period ON service_revenue(period_start, period_end);
CREATE INDEX idx_service_revenue_revenue ON service_revenue(revenue DESC);

-- Cash Flow Projections Indexes
CREATE INDEX idx_cash_flow_projections_user_id ON cash_flow_projections(user_id);
CREATE INDEX idx_cash_flow_projections_year ON cash_flow_projections(year DESC);
CREATE INDEX idx_cash_flow_projections_user_year ON cash_flow_projections(user_id, year);

-- Business Insights Indexes
CREATE INDEX idx_business_insights_user_id ON business_insights(user_id);
CREATE INDEX idx_business_insights_period ON business_insights(period_start, period_end);

-- Performance Metrics Indexes
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_status ON performance_metrics(status);
CREATE INDEX idx_performance_metrics_period ON performance_metrics(period_start, period_end);

-- Business Recommendations Indexes
CREATE INDEX idx_business_recommendations_user_id ON business_recommendations(user_id);
CREATE INDEX idx_business_recommendations_category ON business_recommendations(category);
CREATE INDEX idx_business_recommendations_status ON business_recommendations(status);
CREATE INDEX idx_business_recommendations_priority ON business_recommendations(priority);

-- Report Views Indexes
CREATE INDEX idx_report_views_report_id ON report_views(report_id);
CREATE INDEX idx_report_views_user_id ON report_views(user_id);
CREATE INDEX idx_report_views_viewed_at ON report_views(viewed_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_profitability ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_flow_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_views ENABLE ROW LEVEL SECURITY;

-- Reports Policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Report Templates Policies
CREATE POLICY "Users can view all templates"
  ON report_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can create own templates"
  ON report_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own templates"
  ON report_templates FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON report_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Report Exports Policies
CREATE POLICY "Users can view own exports"
  ON report_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports"
  ON report_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exports"
  ON report_exports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Report Schedules Policies
CREATE POLICY "Users can view own schedules"
  ON report_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own schedules"
  ON report_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Financial Analytics Policies
CREATE POLICY "Users can view own analytics"
  ON financial_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analytics"
  ON financial_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analytics"
  ON financial_analytics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Project Profitability Policies
CREATE POLICY "Users can view own project profitability"
  ON project_profitability FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own project profitability"
  ON project_profitability FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project profitability"
  ON project_profitability FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Revenue Tracking Policies
CREATE POLICY "Users can view own revenue tracking"
  ON revenue_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own revenue tracking"
  ON revenue_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own revenue tracking"
  ON revenue_tracking FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service Revenue Policies
CREATE POLICY "Users can view own service revenue"
  ON service_revenue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own service revenue"
  ON service_revenue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service revenue"
  ON service_revenue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cash Flow Projections Policies
CREATE POLICY "Users can view own cash flow projections"
  ON cash_flow_projections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cash flow projections"
  ON cash_flow_projections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cash flow projections"
  ON cash_flow_projections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Business Insights Policies
CREATE POLICY "Users can view own business insights"
  ON business_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own business insights"
  ON business_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business insights"
  ON business_insights FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Metrics Policies
CREATE POLICY "Users can view own performance metrics"
  ON performance_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own performance metrics"
  ON performance_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own performance metrics"
  ON performance_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Business Recommendations Policies
CREATE POLICY "Users can view own recommendations"
  ON business_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recommendations"
  ON business_recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON business_recommendations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Report Views Policies
CREATE POLICY "Users can view own report views"
  ON report_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create report views"
  ON report_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_templates_updated_at BEFORE UPDATE ON report_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_analytics_updated_at BEFORE UPDATE ON financial_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_profitability_updated_at BEFORE UPDATE ON project_profitability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenue_tracking_updated_at BEFORE UPDATE ON revenue_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_revenue_updated_at BEFORE UPDATE ON service_revenue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cash_flow_projections_updated_at BEFORE UPDATE ON cash_flow_projections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_insights_updated_at BEFORE UPDATE ON business_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON performance_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_recommendations_updated_at BEFORE UPDATE ON business_recommendations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate profit and margin for project profitability
CREATE OR REPLACE FUNCTION calculate_project_profitability()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profit = NEW.revenue - NEW.expenses;

  IF NEW.revenue > 0 THEN
    NEW.margin = (NEW.profit / NEW.revenue) * 100;
  ELSE
    NEW.margin = 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_project_profitability
  BEFORE INSERT OR UPDATE OF revenue, expenses ON project_profitability
  FOR EACH ROW
  EXECUTE FUNCTION calculate_project_profitability();

-- Increment report views counter
CREATE OR REPLACE FUNCTION increment_report_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports
  SET views = views + 1
  WHERE id = NEW.report_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_views
  AFTER INSERT ON report_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_views();

-- Increment report downloads counter
CREATE OR REPLACE FUNCTION increment_report_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE reports
  SET downloads = downloads + 1
  WHERE id = NEW.report_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_downloads
  AFTER INSERT ON report_exports
  FOR EACH ROW
  EXECUTE FUNCTION increment_report_downloads();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's total revenue for a period
CREATE OR REPLACE FUNCTION get_total_revenue(
  user_uuid UUID,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(revenue), 0)
  FROM revenue_tracking
  WHERE user_id = user_uuid
    AND created_at >= start_date
    AND created_at <= end_date;
$$ LANGUAGE sql STABLE;

-- Get user's average profit margin
CREATE OR REPLACE FUNCTION get_average_profit_margin(
  user_uuid UUID
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(AVG(margin), 0)
  FROM project_profitability
  WHERE user_id = user_uuid
    AND status = 'completed';
$$ LANGUAGE sql STABLE;

-- Get user's top performing services
CREATE OR REPLACE FUNCTION get_top_services(
  user_uuid UUID,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  service_name TEXT,
  total_revenue DECIMAL,
  project_count INTEGER,
  avg_value DECIMAL,
  growth DECIMAL
) AS $$
  SELECT
    sr.service_name,
    SUM(sr.revenue) as total_revenue,
    SUM(sr.count) as project_count,
    AVG(sr.avg_value) as avg_value,
    AVG(sr.growth) as growth
  FROM service_revenue sr
  WHERE sr.user_id = user_uuid
  GROUP BY sr.service_name
  ORDER BY total_revenue DESC
  LIMIT limit_count;
$$ LANGUAGE sql STABLE;

-- Get user's cash runway
CREATE OR REPLACE FUNCTION get_cash_runway(
  user_uuid UUID
)
RETURNS INTEGER AS $$
DECLARE
  current_balance DECIMAL;
  avg_monthly_expenses DECIMAL;
  runway INTEGER;
BEGIN
  -- Get latest cash balance
  SELECT projected_balance INTO current_balance
  FROM cash_flow_projections
  WHERE user_id = user_uuid
  ORDER BY year DESC, created_at DESC
  LIMIT 1;

  -- Get average monthly expenses
  SELECT AVG(projected_expenses) INTO avg_monthly_expenses
  FROM cash_flow_projections
  WHERE user_id = user_uuid
    AND year = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Calculate runway
  IF avg_monthly_expenses > 0 THEN
    runway = FLOOR(current_balance / avg_monthly_expenses);
  ELSE
    runway = 0;
  END IF;

  RETURN runway;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate KPI status
CREATE OR REPLACE FUNCTION calculate_kpi_status(
  actual_value DECIMAL,
  target_value DECIMAL,
  threshold DECIMAL DEFAULT 0.95
)
RETURNS kpi_status AS $$
DECLARE
  ratio DECIMAL;
BEGIN
  IF target_value = 0 THEN
    RETURN 'on-track';
  END IF;

  ratio = actual_value / target_value;

  IF ratio >= 1 THEN
    RETURN 'above';
  ELSIF ratio >= threshold THEN
    RETURN 'on-track';
  ELSE
    RETURN 'below';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get scheduled reports ready to run
CREATE OR REPLACE FUNCTION get_scheduled_reports_to_run()
RETURNS TABLE (
  report_id UUID,
  report_name TEXT,
  user_id UUID,
  next_run TIMESTAMPTZ
) AS $$
  SELECT
    id as report_id,
    name as report_name,
    user_id,
    next_run
  FROM reports
  WHERE status = 'scheduled'
    AND next_run IS NOT NULL
    AND next_run <= NOW()
  ORDER BY next_run ASC;
$$ LANGUAGE sql STABLE;

-- Search reports by query
CREATE OR REPLACE FUNCTION search_reports(
  user_uuid UUID,
  search_query TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type report_type,
  status report_status,
  description TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
  SELECT
    r.id,
    r.name,
    r.type,
    r.status,
    r.description,
    r.created_at,
    ts_rank(
      to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.tags, ' ')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM reports r
  WHERE r.user_id = user_uuid
    AND (
      to_tsvector('english', r.name || ' ' || COALESCE(r.description, '') || ' ' || array_to_string(r.tags, ' '))
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY rank DESC;
$$ LANGUAGE sql STABLE;

-- Get user's report statistics
CREATE OR REPLACE FUNCTION get_report_statistics(
  user_uuid UUID
)
RETURNS TABLE (
  total_reports INTEGER,
  ready_reports INTEGER,
  scheduled_reports INTEGER,
  total_views INTEGER,
  total_downloads INTEGER,
  total_data_points BIGINT
) AS $$
  SELECT
    COUNT(*)::INTEGER as total_reports,
    COUNT(*) FILTER (WHERE status = 'ready')::INTEGER as ready_reports,
    COUNT(*) FILTER (WHERE status = 'scheduled')::INTEGER as scheduled_reports,
    COALESCE(SUM(views), 0)::INTEGER as total_views,
    COALESCE(SUM(downloads), 0)::INTEGER as total_downloads,
    COALESCE(SUM(data_points), 0) as total_data_points
  FROM reports
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE reports IS 'User-generated reports with scheduling and export capabilities';
COMMENT ON TABLE report_templates IS 'Pre-defined report templates for quick report creation';
COMMENT ON TABLE report_exports IS 'Export history for reports in various formats';
COMMENT ON TABLE report_schedules IS 'Schedule execution history for automated reports';
COMMENT ON TABLE financial_analytics IS 'Financial analytics data aggregated by period';
COMMENT ON TABLE project_profitability IS 'Project-level profitability tracking';
COMMENT ON TABLE revenue_tracking IS 'Monthly revenue tracking with growth metrics';
COMMENT ON TABLE service_revenue IS 'Revenue breakdown by service type';
COMMENT ON TABLE cash_flow_projections IS 'Cash flow projections and actuals';
COMMENT ON TABLE business_insights IS 'Business insights and metrics aggregation';
COMMENT ON TABLE performance_metrics IS 'KPI tracking with targets and status';
COMMENT ON TABLE business_recommendations IS 'AI-generated business recommendations';
COMMENT ON TABLE report_views IS 'Report view analytics for usage tracking';
