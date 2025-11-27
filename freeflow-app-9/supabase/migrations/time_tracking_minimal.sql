-- Minimal Time Tracking Schema
--
-- This schema creates tables for time tracking and billing.
-- Supports time entry logging, billable hours, and project/task tracking.

-- Drop existing tables if they exist
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TYPE IF EXISTS entry_status CASCADE;

-- ENUMs
CREATE TYPE entry_status AS ENUM ('running', 'paused', 'stopped', 'completed');

-- Time Entries Table
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project and task association
  project_id UUID,
  project_name TEXT NOT NULL,
  task_id UUID,
  task_name TEXT,

  -- Time tracking
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  duration INTEGER DEFAULT 0, -- Duration in seconds
  status entry_status NOT NULL DEFAULT 'stopped',

  -- Billing information
  is_billable BOOLEAN DEFAULT TRUE,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,

  -- Date for reporting
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Additional info
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Time Entries
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_time_entries_status ON time_entries(status);
CREATE INDEX idx_time_entries_entry_date ON time_entries(entry_date DESC);
CREATE INDEX idx_time_entries_billable ON time_entries(is_billable);
CREATE INDEX idx_time_entries_created_at ON time_entries(created_at DESC);
CREATE INDEX idx_time_entries_tags ON time_entries USING GIN(tags);

-- Helper function to calculate time entry duration and amount
CREATE OR REPLACE FUNCTION calculate_time_entry_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate duration if end_time is set
  IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
  END IF;

  -- Calculate total amount if billable
  IF NEW.is_billable AND NEW.duration > 0 AND NEW.hourly_rate > 0 THEN
    NEW.total_amount = ROUND((NEW.duration / 3600.0 * NEW.hourly_rate)::NUMERIC, 2);
  ELSE
    NEW.total_amount = 0;
  END IF;

  -- Auto-complete if stopped
  IF NEW.status = 'stopped' AND NEW.end_time IS NULL THEN
    NEW.end_time = NOW();
    NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    IF NEW.is_billable AND NEW.hourly_rate > 0 THEN
      NEW.total_amount = ROUND((NEW.duration / 3600.0 * NEW.hourly_rate)::NUMERIC, 2);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_time_entry_totals_trigger
  BEFORE INSERT OR UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_totals();

-- Helper function to get time tracking summary
CREATE OR REPLACE FUNCTION get_time_tracking_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  total_entries INTEGER,
  total_hours DECIMAL,
  billable_hours DECIMAL,
  non_billable_hours DECIMAL,
  total_amount DECIMAL,
  entries_by_project JSONB
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Default to current month if dates not provided
  v_start_date := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);

  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_entries,
    ROUND((SUM(duration) / 3600.0)::NUMERIC, 2)::DECIMAL as total_hours,
    ROUND((SUM(CASE WHEN is_billable THEN duration ELSE 0 END) / 3600.0)::NUMERIC, 2)::DECIMAL as billable_hours,
    ROUND((SUM(CASE WHEN NOT is_billable THEN duration ELSE 0 END) / 3600.0)::NUMERIC, 2)::DECIMAL as non_billable_hours,
    COALESCE(SUM(total_amount), 0)::DECIMAL as total_amount,
    jsonb_agg(
      jsonb_build_object(
        'project_name', project_name,
        'hours', ROUND((SUM(duration) / 3600.0)::NUMERIC, 2),
        'amount', SUM(total_amount)
      )
    ) as entries_by_project
  FROM time_entries
  WHERE user_id = p_user_id
    AND entry_date BETWEEN v_start_date AND v_end_date
    AND status IN ('stopped', 'completed');
END;
$$ LANGUAGE plpgsql;

-- Helper function to get daily time entries
CREATE OR REPLACE FUNCTION get_daily_time_entries(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  id UUID,
  project_name TEXT,
  task_name TEXT,
  description TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  status entry_status,
  is_billable BOOLEAN,
  hourly_rate DECIMAL,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.project_name,
    t.task_name,
    t.description,
    t.start_time,
    t.end_time,
    t.duration,
    t.status,
    t.is_billable,
    t.hourly_rate,
    t.total_amount
  FROM time_entries t
  WHERE t.user_id = p_user_id
    AND t.entry_date = p_date
  ORDER BY t.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get weekly report
CREATE OR REPLACE FUNCTION get_weekly_time_report(
  p_user_id UUID,
  p_week_start DATE DEFAULT NULL
) RETURNS TABLE (
  day DATE,
  total_hours DECIMAL,
  billable_hours DECIMAL,
  total_amount DECIMAL,
  entries_count INTEGER
) AS $$
DECLARE
  v_week_start DATE;
BEGIN
  -- Default to start of current week (Monday)
  v_week_start := COALESCE(
    p_week_start,
    date_trunc('week', CURRENT_DATE)::DATE
  );

  RETURN QUERY
  SELECT
    t.entry_date as day,
    ROUND((SUM(t.duration) / 3600.0)::NUMERIC, 2)::DECIMAL as total_hours,
    ROUND((SUM(CASE WHEN t.is_billable THEN t.duration ELSE 0 END) / 3600.0)::NUMERIC, 2)::DECIMAL as billable_hours,
    COALESCE(SUM(t.total_amount), 0)::DECIMAL as total_amount,
    COUNT(*)::INTEGER as entries_count
  FROM time_entries t
  WHERE t.user_id = p_user_id
    AND t.entry_date BETWEEN v_week_start AND (v_week_start + INTERVAL '6 days')::DATE
    AND t.status IN ('stopped', 'completed')
  GROUP BY t.entry_date
  ORDER BY t.entry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
