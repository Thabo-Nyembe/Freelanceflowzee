-- Minimal Custom Reports Schema
-- Report builder with templates, widgets, filters, and scheduling

-- ENUMS
DROP TYPE IF EXISTS report_type CASCADE;
DROP TYPE IF EXISTS chart_type CASCADE;
DROP TYPE IF EXISTS widget_type CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS schedule_frequency CASCADE;

CREATE TYPE report_type AS ENUM ('financial', 'project-performance', 'client-activity', 'time-tracking', 'resource-utilization', 'sales-pipeline', 'team-productivity', 'custom');
CREATE TYPE chart_type AS ENUM ('line', 'bar', 'pie', 'doughnut', 'area', 'scatter', 'radar', 'funnel', 'gauge', 'heatmap');
CREATE TYPE widget_type AS ENUM ('chart', 'table', 'metric', 'text', 'image');
CREATE TYPE export_format AS ENUM ('pdf', 'excel', 'csv', 'json', 'png', 'svg');
CREATE TYPE report_status AS ENUM ('draft', 'active', 'archived', 'scheduled');
CREATE TYPE schedule_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- TABLES
DROP TABLE IF EXISTS report_exports CASCADE;
DROP TABLE IF EXISTS report_schedules CASCADE;
DROP TABLE IF EXISTS report_shares CASCADE;
DROP TABLE IF EXISTS report_filters CASCADE;
DROP TABLE IF EXISTS report_widgets CASCADE;
DROP TABLE IF EXISTS report_templates CASCADE;
DROP TABLE IF EXISTS custom_reports CASCADE;

CREATE TABLE custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type report_type NOT NULL,
  status report_status NOT NULL DEFAULT 'draft',
  date_range_start DATE,
  date_range_end DATE,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  last_generated_at TIMESTAMPTZ,
  generation_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type report_type NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  thumbnail TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  usage_count INTEGER NOT NULL DEFAULT 0,
  popularity INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  type widget_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 6,
  height INTEGER NOT NULL DEFAULT 4,
  chart_type chart_type,
  data_source TEXT NOT NULL,
  data_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  aggregation TEXT,
  group_by TEXT[] DEFAULT ARRAY[]::TEXT[],
  settings JSONB DEFAULT '{}'::JSONB,
  widget_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES report_widgets(id) ON DELETE CASCADE,
  field TEXT NOT NULL,
  operator TEXT NOT NULL,
  value JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT filter_parent_check CHECK (
    (report_id IS NOT NULL AND widget_id IS NULL) OR
    (report_id IS NULL AND widget_id IS NOT NULL)
  )
);

CREATE TABLE report_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_export BOOLEAN NOT NULL DEFAULT true,
  access_count INTEGER NOT NULL DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  frequency schedule_frequency NOT NULL,
  export_format export_format NOT NULL DEFAULT 'pdf',
  recipients TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  next_run_at TIMESTAMPTZ NOT NULL,
  last_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE report_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES custom_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_custom_reports_user_id ON custom_reports(user_id);
CREATE INDEX idx_custom_reports_type ON custom_reports(type);
CREATE INDEX idx_custom_reports_status ON custom_reports(status);
CREATE INDEX idx_custom_reports_is_favorite ON custom_reports(is_favorite);
CREATE INDEX idx_report_templates_type ON report_templates(type);
CREATE INDEX idx_report_templates_category ON report_templates(category);
CREATE INDEX idx_report_templates_is_public ON report_templates(is_public);
CREATE INDEX idx_report_widgets_report_id ON report_widgets(report_id);
CREATE INDEX idx_report_widgets_type ON report_widgets(type);
CREATE INDEX idx_report_filters_report_id ON report_filters(report_id);
CREATE INDEX idx_report_filters_widget_id ON report_filters(widget_id);
CREATE INDEX idx_report_shares_report_id ON report_shares(report_id);
CREATE INDEX idx_report_shares_token ON report_shares(share_token);
CREATE INDEX idx_report_schedules_report_id ON report_schedules(report_id);
CREATE INDEX idx_report_schedules_next_run ON report_schedules(next_run_at);
CREATE INDEX idx_report_exports_report_id ON report_exports(report_id);
CREATE INDEX idx_report_exports_user_id ON report_exports(user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_custom_reports_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_custom_reports_updated_at BEFORE UPDATE ON custom_reports FOR EACH ROW EXECUTE FUNCTION update_custom_reports_updated_at();
CREATE TRIGGER trigger_report_templates_updated_at BEFORE UPDATE ON report_templates FOR EACH ROW EXECUTE FUNCTION update_custom_reports_updated_at();
CREATE TRIGGER trigger_report_widgets_updated_at BEFORE UPDATE ON report_widgets FOR EACH ROW EXECUTE FUNCTION update_custom_reports_updated_at();
CREATE TRIGGER trigger_report_schedules_updated_at BEFORE UPDATE ON report_schedules FOR EACH ROW EXECUTE FUNCTION update_custom_reports_updated_at();

CREATE OR REPLACE FUNCTION increment_report_generation() RETURNS TRIGGER AS $$
BEGIN
  UPDATE custom_reports
  SET generation_count = generation_count + 1, last_generated_at = now()
  WHERE id = NEW.report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_report_generation AFTER INSERT ON report_exports FOR EACH ROW EXECUTE FUNCTION increment_report_generation();

CREATE OR REPLACE FUNCTION increment_template_usage() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status = 'draft') THEN
    UPDATE report_templates
    SET usage_count = usage_count + 1
    WHERE type = NEW.type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_template_usage AFTER UPDATE ON custom_reports FOR EACH ROW EXECUTE FUNCTION increment_template_usage();
