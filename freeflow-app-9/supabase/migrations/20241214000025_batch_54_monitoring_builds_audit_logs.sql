-- =============================================
-- BATCH 54: Monitoring, Builds, Audit Logs Tables
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. MONITORING TABLES
-- =============================================

-- Servers table for monitoring
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_name VARCHAR(200) NOT NULL,
  server_type VARCHAR(50) DEFAULT 'production', -- production, database, cache, worker, network, storage
  status VARCHAR(20) DEFAULT 'healthy', -- healthy, warning, critical, offline
  location VARCHAR(100),
  ip_address VARCHAR(50),
  cpu_usage DECIMAL(5, 2) DEFAULT 0,
  memory_usage DECIMAL(5, 2) DEFAULT 0,
  disk_usage DECIMAL(5, 2) DEFAULT 0,
  network_throughput DECIMAL(10, 2) DEFAULT 0, -- MB/s
  uptime_percentage DECIMAL(6, 3) DEFAULT 100.000,
  requests_per_hour INTEGER DEFAULT 0,
  last_health_check TIMESTAMPTZ DEFAULT NOW(),
  configuration JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Server metrics history
CREATE TABLE IF NOT EXISTS server_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type VARCHAR(50) NOT NULL, -- cpu, memory, disk, network, requests
  metric_value DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(20) DEFAULT 'percent',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- System alerts
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  server_id UUID REFERENCES servers(id) ON DELETE SET NULL,
  alert_type VARCHAR(50) NOT NULL, -- cpu_high, memory_high, disk_full, network_issue, offline
  severity VARCHAR(20) DEFAULT 'warning', -- info, warning, critical
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, acknowledged, resolved
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for monitoring
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_type ON servers(server_type);
CREATE INDEX IF NOT EXISTS idx_server_metrics_server ON server_metrics(server_id);
CREATE INDEX IF NOT EXISTS idx_server_metrics_type ON server_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_server_metrics_recorded ON server_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_user ON system_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_system_alerts_status ON system_alerts(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);

-- =============================================
-- 2. BUILDS TABLES
-- =============================================

-- Build pipelines
CREATE TABLE IF NOT EXISTS build_pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_name VARCHAR(200) NOT NULL,
  pipeline_type VARCHAR(50) DEFAULT 'ci_cd', -- ci_cd, feature, release, hotfix, nightly
  description TEXT,
  repository_url TEXT,
  branch_pattern VARCHAR(200),
  trigger_on TEXT[] DEFAULT '{push,pull_request}',
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Builds
CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES build_pipelines(id) ON DELETE SET NULL,
  build_number INTEGER NOT NULL,
  branch VARCHAR(200) NOT NULL,
  commit_hash VARCHAR(100),
  commit_message TEXT,
  author_name VARCHAR(200),
  author_email VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, running, success, failed, cancelled
  duration_seconds INTEGER DEFAULT 0,
  tests_passed INTEGER DEFAULT 0,
  tests_failed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) DEFAULT 0,
  artifacts_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  logs_url TEXT,
  artifacts_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Build artifacts
CREATE TABLE IF NOT EXISTS build_artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_name VARCHAR(200) NOT NULL,
  artifact_type VARCHAR(50) DEFAULT 'binary', -- binary, docker, npm, report, logs
  file_path TEXT,
  file_size INTEGER DEFAULT 0,
  download_url TEXT,
  checksum VARCHAR(100),
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for builds
CREATE INDEX IF NOT EXISTS idx_build_pipelines_user ON build_pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_build_pipelines_active ON build_pipelines(is_active);
CREATE INDEX IF NOT EXISTS idx_builds_user_id ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_builds_pipeline ON builds(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status);
CREATE INDEX IF NOT EXISTS idx_builds_branch ON builds(branch);
CREATE INDEX IF NOT EXISTS idx_builds_created ON builds(created_at);
CREATE INDEX IF NOT EXISTS idx_build_artifacts_build ON build_artifacts(build_id);

-- =============================================
-- 3. AUDIT LOGS TABLES
-- =============================================

-- Main audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_type VARCHAR(50) NOT NULL, -- authentication, data, system, security, admin
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
  action VARCHAR(200) NOT NULL,
  description TEXT,
  resource VARCHAR(200),
  user_email VARCHAR(255),
  ip_address VARCHAR(50),
  location VARCHAR(200),
  device VARCHAR(200),
  status VARCHAR(20) DEFAULT 'success', -- success, failed, blocked, error
  request_method VARCHAR(10),
  request_path TEXT,
  request_body JSONB DEFAULT '{}',
  response_status INTEGER,
  duration_ms INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log alerts/rules
CREATE TABLE IF NOT EXISTS audit_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_name VARCHAR(200) NOT NULL,
  description TEXT,
  log_type VARCHAR(50),
  severity VARCHAR(20),
  action_pattern VARCHAR(200),
  conditions JSONB DEFAULT '{}',
  notification_channels TEXT[] DEFAULT '{email}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_type ON audit_logs(log_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_audit_alert_rules_user ON audit_alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_alert_rules_active ON audit_alert_rules(is_active);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE build_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_alert_rules ENABLE ROW LEVEL SECURITY;

-- Servers policies
CREATE POLICY "Users can view own servers" ON servers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own servers" ON servers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own servers" ON servers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own servers" ON servers FOR DELETE USING (auth.uid() = user_id);

-- Server metrics policies
CREATE POLICY "Users can view own server metrics" ON server_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own server metrics" ON server_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System alerts policies
CREATE POLICY "Users can view own alerts" ON system_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alerts" ON system_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts" ON system_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Build pipelines policies
CREATE POLICY "Users can view own pipelines" ON build_pipelines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pipelines" ON build_pipelines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pipelines" ON build_pipelines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pipelines" ON build_pipelines FOR DELETE USING (auth.uid() = user_id);

-- Builds policies
CREATE POLICY "Users can view own builds" ON builds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own builds" ON builds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builds" ON builds FOR UPDATE USING (auth.uid() = user_id);

-- Build artifacts policies
CREATE POLICY "Users can view own build artifacts" ON build_artifacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own build artifacts" ON build_artifacts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Users can view own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit alert rules policies
CREATE POLICY "Users can view own alert rules" ON audit_alert_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own alert rules" ON audit_alert_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own alert rules" ON audit_alert_rules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own alert rules" ON audit_alert_rules FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_servers_updated_at BEFORE UPDATE ON servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_alerts_updated_at BEFORE UPDATE ON system_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_build_pipelines_updated_at BEFORE UPDATE ON build_pipelines FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_builds_updated_at BEFORE UPDATE ON builds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audit_alert_rules_updated_at BEFORE UPDATE ON audit_alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ENABLE REAL-TIME
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE servers;
ALTER PUBLICATION supabase_realtime ADD TABLE system_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE builds;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
