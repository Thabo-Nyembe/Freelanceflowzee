-- Minimal Reports Schema for Custom Reports Dashboard
--
-- This schema creates tables for custom report generation, scheduling, and management.
-- Reports can pull data from projects, clients, invoices, analytics, etc.

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS report_exports CASCADE;
DROP TABLE IF EXISTS custom_reports CASCADE;
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS report_frequency CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;

-- ENUMs
CREATE TYPE report_type AS ENUM ('analytics', 'financial', 'performance', 'sales', 'custom');
CREATE TYPE report_status AS ENUM ('draft', 'generating', 'ready', 'scheduled', 'failed');
CREATE TYPE report_frequency AS ENUM ('once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE export_format AS ENUM ('pdf', 'excel', 'csv', 'json');

-- Custom Reports Table (report definitions and metadata)
CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  type report_type NOT NULL,
  status report_status NOT NULL DEFAULT 'draft',

  -- Report configuration
  date_range_start DATE,
  date_range_end DATE,
  filters JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '[]',
  grouping TEXT[], -- e.g., ['client', 'project_type']

  -- Scheduling
  frequency report_frequency DEFAULT 'once',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Recipients for scheduled reports
  recipients TEXT[] DEFAULT '{}',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  data_points INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Report Exports Table (generated report files)
CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  format export_format NOT NULL,
  file_url TEXT,
  file_size BIGINT DEFAULT 0,

  -- Export metadata
  date_range_start DATE,
  date_range_end DATE,
  data_points INTEGER DEFAULT 0,

  -- Generation details
  status report_status NOT NULL DEFAULT 'generating',
  generated_at TIMESTAMPTZ,
  error_message TEXT,

  -- Download tracking
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,

  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Report Schedules Table (recurring report configurations)
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  frequency report_frequency NOT NULL,
  recipients TEXT[] NOT NULL,

  -- Schedule configuration
  day_of_week INTEGER, -- 0-6 for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  hour INTEGER DEFAULT 9, -- 0-23
  timezone TEXT DEFAULT 'UTC',

  is_active BOOLEAN DEFAULT TRUE,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Custom Reports
CREATE INDEX idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX idx_custom_reports_type ON custom_reports(type);
CREATE INDEX idx_custom_reports_status ON custom_reports(status);
CREATE INDEX idx_custom_reports_frequency ON custom_reports(frequency);
CREATE INDEX idx_custom_reports_next_run ON custom_reports(next_run_at) WHERE next_run_at IS NOT NULL;
CREATE INDEX idx_custom_reports_created_at ON custom_reports(created_at DESC);
CREATE INDEX idx_custom_reports_tags ON custom_reports USING GIN(tags);

-- Indexes for Report Exports
CREATE INDEX idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX idx_report_exports_user_id ON report_exports(user_id);
CREATE INDEX idx_report_exports_status ON report_exports(status);
CREATE INDEX idx_report_exports_created_at ON report_exports(created_at DESC);
CREATE INDEX idx_report_exports_expires_at ON report_exports(expires_at) WHERE expires_at IS NOT NULL;

-- Indexes for Report Schedules
CREATE INDEX idx_report_schedules_report_id ON report_schedules(report_id);
CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX idx_report_schedules_active ON report_schedules(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at) WHERE is_active = TRUE;

-- Helper function to calculate next run time based on frequency
CREATE OR REPLACE FUNCTION calculate_next_run(
  p_frequency report_frequency,
  p_current_time TIMESTAMPTZ DEFAULT NOW(),
  p_day_of_week INTEGER DEFAULT NULL,
  p_day_of_month INTEGER DEFAULT NULL,
  p_hour INTEGER DEFAULT 9
) RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
BEGIN
  CASE p_frequency
    WHEN 'once' THEN
      RETURN NULL;
    WHEN 'daily' THEN
      v_next_run := date_trunc('day', p_current_time) + INTERVAL '1 day' + (p_hour || ' hours')::INTERVAL;
    WHEN 'weekly' THEN
      -- Next occurrence of specified day_of_week
      v_next_run := date_trunc('week', p_current_time) + ((COALESCE(p_day_of_week, 1)) || ' days')::INTERVAL + (p_hour || ' hours')::INTERVAL;
      IF v_next_run <= p_current_time THEN
        v_next_run := v_next_run + INTERVAL '1 week';
      END IF;
    WHEN 'monthly' THEN
      -- Next occurrence of specified day_of_month
      v_next_run := date_trunc('month', p_current_time) + ((COALESCE(p_day_of_month, 1) - 1) || ' days')::INTERVAL + (p_hour || ' hours')::INTERVAL;
      IF v_next_run <= p_current_time THEN
        v_next_run := date_trunc('month', v_next_run + INTERVAL '1 month') + ((COALESCE(p_day_of_month, 1) - 1) || ' days')::INTERVAL + (p_hour || ' hours')::INTERVAL;
      END IF;
    WHEN 'quarterly' THEN
      v_next_run := date_trunc('quarter', p_current_time) + INTERVAL '3 months' + (p_hour || ' hours')::INTERVAL;
    WHEN 'yearly' THEN
      v_next_run := date_trunc('year', p_current_time) + INTERVAL '1 year' + (p_hour || ' hours')::INTERVAL;
  END CASE;

  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON custom_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_exports_updated_at BEFORE UPDATE ON report_exports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_report_schedules_updated_at BEFORE UPDATE ON report_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
