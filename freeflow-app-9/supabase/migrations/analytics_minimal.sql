-- Minimal Analytics Schema for Analytics Dashboard
--
-- This schema creates tables to store pre-computed analytics metrics for performance.
-- Analytics are derived from existing data (projects, clients, invoices, bookings, etc.)

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS analytics_daily_metrics CASCADE;
DROP TABLE IF EXISTS analytics_monthly_metrics CASCADE;
DROP TYPE IF EXISTS metric_category CASCADE;

-- ENUMs
CREATE TYPE metric_category AS ENUM ('revenue', 'projects', 'clients', 'time', 'performance');

-- Daily Analytics Metrics (for detailed daily tracking)
CREATE TABLE analytics_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  date DATE NOT NULL,
  category metric_category NOT NULL,

  -- Revenue metrics
  revenue DECIMAL(10, 2) DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,

  -- Project metrics
  projects_created INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  projects_active INTEGER DEFAULT 0,

  -- Client metrics
  clients_new INTEGER DEFAULT 0,
  clients_active INTEGER DEFAULT 0,
  clients_total INTEGER DEFAULT 0,

  -- Time metrics
  hours_tracked DECIMAL(10, 2) DEFAULT 0,
  billable_hours DECIMAL(10, 2) DEFAULT 0,

  -- Performance metrics
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  satisfaction_score DECIMAL(3, 2) DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, date, category)
);

-- Monthly Analytics Metrics (for month-over-month tracking and trends)
CREATE TABLE analytics_monthly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  -- Revenue metrics
  total_revenue DECIMAL(10, 2) DEFAULT 0,
  revenue_growth DECIMAL(10, 2) DEFAULT 0,
  average_project_value DECIMAL(10, 2) DEFAULT 0,

  -- Project metrics
  total_projects INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  projects_growth DECIMAL(10, 2) DEFAULT 0,

  -- Client metrics
  total_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  clients_growth DECIMAL(10, 2) DEFAULT 0,
  client_retention_rate DECIMAL(5, 2) DEFAULT 0,

  -- Time metrics
  total_hours DECIMAL(10, 2) DEFAULT 0,
  billable_hours DECIMAL(10, 2) DEFAULT 0,
  utilization_rate DECIMAL(5, 2) DEFAULT 0,

  -- Performance metrics
  project_completion_rate DECIMAL(5, 2) DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) DEFAULT 0,
  profit_margin DECIMAL(5, 2) DEFAULT 0,

  -- Category breakdown
  category_breakdown JSONB DEFAULT '{}',
  top_clients JSONB DEFAULT '[]',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, year, month)
);

-- Indexes for Daily Metrics
CREATE INDEX idx_analytics_daily_user_id ON analytics_daily_metrics(user_id);
CREATE INDEX idx_analytics_daily_date ON analytics_daily_metrics(date DESC);
CREATE INDEX idx_analytics_daily_category ON analytics_daily_metrics(category);
CREATE INDEX idx_analytics_daily_user_date ON analytics_daily_metrics(user_id, date DESC);
CREATE INDEX idx_analytics_daily_user_category ON analytics_daily_metrics(user_id, category);

-- Indexes for Monthly Metrics
CREATE INDEX idx_analytics_monthly_user_id ON analytics_monthly_metrics(user_id);
CREATE INDEX idx_analytics_monthly_year_month ON analytics_monthly_metrics(year DESC, month DESC);
CREATE INDEX idx_analytics_monthly_user_year_month ON analytics_monthly_metrics(user_id, year DESC, month DESC);

-- Helper function to calculate date range metrics
CREATE OR REPLACE FUNCTION get_date_range_metrics(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_revenue DECIMAL,
  total_projects INTEGER,
  total_clients INTEGER,
  total_hours DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(revenue), 0)::DECIMAL as total_revenue,
    COALESCE(SUM(projects_created), 0)::INTEGER as total_projects,
    COALESCE(SUM(clients_new), 0)::INTEGER as total_clients,
    COALESCE(SUM(hours_tracked), 0)::DECIMAL as total_hours
  FROM analytics_daily_metrics
  WHERE user_id = p_user_id
    AND date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get month-over-month growth
CREATE OR REPLACE FUNCTION calculate_growth(
  current_value DECIMAL,
  previous_value DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  IF previous_value = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND(((current_value - previous_value) / previous_value * 100)::NUMERIC, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;
