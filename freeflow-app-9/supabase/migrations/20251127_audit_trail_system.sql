-- Audit Trail System - Complete Activity Logging & Compliance
-- Track all user actions, system changes, and security events

-- ENUMS
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS entity_type CASCADE;
DROP TYPE IF EXISTS severity_level CASCADE;

CREATE TYPE activity_type AS ENUM (
  'create', 'update', 'delete', 'login', 'logout',
  'export', 'import', 'share', 'permission_change', 'settings_change'
);

CREATE TYPE entity_type AS ENUM (
  'user', 'client', 'project', 'invoice', 'payment',
  'file', 'report', 'workflow', 'integration', 'widget'
);

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high', 'critical');

-- TABLES
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS compliance_reports CASCADE;
DROP TABLE IF EXISTS compliance_findings CASCADE;

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity Details
  activity_type activity_type NOT NULL,
  entity_type entity_type NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  action TEXT NOT NULL,
  description TEXT NOT NULL,
  severity severity_level NOT NULL DEFAULT 'low',

  -- Context
  ip_address INET,
  user_agent TEXT,
  location TEXT,

  -- Change Tracking
  changes JSONB DEFAULT '[]'::jsonb,
  old_values JSONB,
  new_values JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Report Details
  name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metrics
  total_logs INTEGER NOT NULL DEFAULT 0,
  critical_events INTEGER NOT NULL DEFAULT 0,
  security_incidents INTEGER NOT NULL DEFAULT 0,
  data_changes INTEGER NOT NULL DEFAULT 0,
  user_logins INTEGER NOT NULL DEFAULT 0,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  export_activities INTEGER NOT NULL DEFAULT 0,
  permission_changes INTEGER NOT NULL DEFAULT 0,

  -- Compliance Score (0-100)
  compliance_score INTEGER NOT NULL DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- Report Data
  summary JSONB DEFAULT '{}'::jsonb,
  findings_count INTEGER NOT NULL DEFAULT 0,

  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE compliance_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES compliance_reports(id) ON DELETE CASCADE,

  -- Finding Details
  category TEXT NOT NULL CHECK (category IN ('security', 'privacy', 'access', 'data_integrity')),
  severity severity_level NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,

  -- Affected Logs
  affected_log_ids UUID[] DEFAULT ARRAY[]::UUID[],
  affected_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_activity_type ON audit_logs(activity_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_tags ON audit_logs USING GIN(tags);
CREATE INDEX idx_audit_logs_changes ON audit_logs USING GIN(changes);

CREATE INDEX idx_compliance_reports_user_id ON compliance_reports(user_id);
CREATE INDEX idx_compliance_reports_generated_at ON compliance_reports(generated_at DESC);
CREATE INDEX idx_compliance_reports_period ON compliance_reports(period_start, period_end);

CREATE INDEX idx_compliance_findings_report_id ON compliance_findings(report_id);
CREATE INDEX idx_compliance_findings_severity ON compliance_findings(severity);
CREATE INDEX idx_compliance_findings_category ON compliance_findings(category);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_activity_type activity_type,
  p_entity_type entity_type,
  p_action TEXT,
  p_description TEXT,
  p_severity severity_level DEFAULT 'low',
  p_entity_id TEXT DEFAULT NULL,
  p_entity_name TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_changes JSONB DEFAULT '[]'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    activity_type,
    entity_type,
    action,
    description,
    severity,
    entity_id,
    entity_name,
    ip_address,
    changes,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_entity_type,
    p_action,
    p_description,
    p_severity,
    p_entity_id,
    p_entity_name,
    p_ip_address,
    p_changes,
    p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_activity_summary(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ := COALESCE(p_start_date, now() - interval '30 days');
  end_date TIMESTAMPTZ := COALESCE(p_end_date, now());
BEGIN
  SELECT jsonb_build_object(
    'total_activities', COUNT(*),
    'critical_count', COUNT(*) FILTER (WHERE severity = 'critical'),
    'high_count', COUNT(*) FILTER (WHERE severity = 'high'),
    'by_type', (
      SELECT jsonb_object_agg(activity_type, count)
      FROM (
        SELECT activity_type, COUNT(*) as count
        FROM audit_logs
        WHERE user_id = p_user_id
        AND timestamp BETWEEN start_date AND end_date
        GROUP BY activity_type
      ) t
    ),
    'by_entity', (
      SELECT jsonb_object_agg(entity_type, count)
      FROM (
        SELECT entity_type, COUNT(*) as count
        FROM audit_logs
        WHERE user_id = p_user_id
        AND timestamp BETWEEN start_date AND end_date
        GROUP BY entity_type
      ) t
    )
  ) INTO result
  FROM audit_logs
  WHERE user_id = p_user_id
  AND timestamp BETWEEN start_date AND end_date;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_compliance_report_findings_count() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE compliance_reports
    SET findings_count = findings_count + 1
    WHERE id = NEW.report_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE compliance_reports
    SET findings_count = findings_count - 1
    WHERE id = OLD.report_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_compliance_findings_count
AFTER INSERT OR DELETE ON compliance_findings
FOR EACH ROW
EXECUTE FUNCTION update_compliance_report_findings_count();

-- ROW LEVEL SECURITY
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_findings ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own audit logs
CREATE POLICY audit_logs_user_policy ON audit_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY compliance_reports_user_policy ON compliance_reports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY compliance_findings_user_policy ON compliance_findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compliance_reports
      WHERE compliance_reports.id = compliance_findings.report_id
      AND compliance_reports.user_id = auth.uid()
    )
  );
