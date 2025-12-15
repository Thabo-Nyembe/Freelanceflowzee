-- Batch 50: Logs, Audit & Permissions
-- System Administration tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. SYSTEM LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Log Entry
  log_level VARCHAR(20) DEFAULT 'info'
    CHECK (log_level IN ('error', 'warn', 'info', 'debug', 'trace')),
  log_source VARCHAR(50) DEFAULT 'api'
    CHECK (log_source IN ('api', 'database', 'auth', 'worker', 'scheduler', 'webhook', 'integration', 'system')),
  message TEXT NOT NULL,
  details TEXT,

  -- Request Context
  request_id VARCHAR(100),
  session_id VARCHAR(100),
  correlation_id VARCHAR(100),

  -- HTTP Context
  http_method VARCHAR(10),
  http_path VARCHAR(500),
  http_status_code INTEGER,
  response_time_ms INTEGER,

  -- User Context
  actor_user_id UUID,
  actor_email VARCHAR(255),
  actor_ip_address VARCHAR(45),
  actor_user_agent TEXT,

  -- Error Details
  error_code VARCHAR(100),
  error_stack TEXT,
  error_type VARCHAR(100),

  -- Classification
  category VARCHAR(50),
  tags TEXT[],
  severity VARCHAR(20) DEFAULT 'low'
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),

  -- Environment
  environment VARCHAR(20) DEFAULT 'production',
  server_hostname VARCHAR(100),
  server_region VARCHAR(50),

  -- Metadata
  metadata JSONB,
  context JSONB,

  -- Retention
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE,
  retention_days INTEGER DEFAULT 30,

  -- Timestamps
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(log_source);
CREATE INDEX IF NOT EXISTS idx_system_logs_logged_at ON system_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_severity ON system_logs(severity);
CREATE INDEX IF NOT EXISTS idx_system_logs_request_id ON system_logs(request_id);

-- RLS for system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON system_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs"
  ON system_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON system_logs FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE system_logs;

-- ============================================
-- 2. AUDIT EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Details
  action VARCHAR(50) NOT NULL
    CHECK (action IN ('create', 'read', 'update', 'delete', 'access', 'login', 'logout', 'export', 'import', 'approve', 'reject')),
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  resource_type VARCHAR(50),

  -- Actor Information
  actor_email VARCHAR(255) NOT NULL,
  actor_id VARCHAR(100),
  actor_role VARCHAR(50),
  actor_ip_address VARCHAR(45),
  actor_user_agent TEXT,
  actor_location VARCHAR(200),

  -- Event Context
  severity VARCHAR(20) DEFAULT 'low'
    CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  status VARCHAR(20) DEFAULT 'success'
    CHECK (status IN ('success', 'failure', 'pending', 'blocked')),

  -- Change Tracking
  changes JSONB,
  previous_values JSONB,
  new_values JSONB,

  -- Metadata
  metadata JSONB,
  reason TEXT,
  notes TEXT,
  tags TEXT[],

  -- Compliance
  compliance_framework VARCHAR(50),
  compliance_requirement VARCHAR(100),
  is_compliance_relevant BOOLEAN DEFAULT false,

  -- Session Info
  session_id VARCHAR(100),
  request_id VARCHAR(100),

  -- Risk Assessment
  risk_score DECIMAL(5, 2) DEFAULT 0,
  is_anomalous BOOLEAN DEFAULT false,
  anomaly_reason TEXT,

  -- Retention
  retention_years INTEGER DEFAULT 7,
  is_immutable BOOLEAN DEFAULT true,

  -- Timestamps
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for audit_events
CREATE INDEX IF NOT EXISTS idx_audit_events_user_id ON audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_action ON audit_events(action);
CREATE INDEX IF NOT EXISTS idx_audit_events_resource ON audit_events(resource);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_events_timestamp ON audit_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_severity ON audit_events(severity);
CREATE INDEX IF NOT EXISTS idx_audit_events_compliance ON audit_events(compliance_framework);

-- RLS for audit_events
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit events"
  ON audit_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create audit events"
  ON audit_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE audit_events;

-- ============================================
-- 3. COMPLIANCE CHECKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check Details
  check_name VARCHAR(200) NOT NULL,
  framework VARCHAR(50) NOT NULL,
  requirement VARCHAR(200),
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('passing', 'failing', 'warning', 'pending', 'not_applicable')),
  score DECIMAL(5, 2) DEFAULT 0,
  max_score DECIMAL(5, 2) DEFAULT 100,

  -- Results
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  passed_controls INTEGER DEFAULT 0,
  total_controls INTEGER DEFAULT 0,

  -- Evidence
  evidence JSONB,
  findings JSONB,
  recommendations JSONB,

  -- Remediation
  remediation_required BOOLEAN DEFAULT false,
  remediation_status VARCHAR(50),
  remediation_due_date DATE,
  remediation_assigned_to VARCHAR(255),

  -- Schedule
  check_frequency VARCHAR(20) DEFAULT 'daily',
  next_check_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  last_check_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for compliance_checks
CREATE INDEX IF NOT EXISTS idx_compliance_checks_user_id ON compliance_checks(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_framework ON compliance_checks(framework);
CREATE INDEX IF NOT EXISTS idx_compliance_checks_status ON compliance_checks(status);

-- RLS for compliance_checks
ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own compliance checks"
  ON compliance_checks FOR ALL
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE compliance_checks;

-- ============================================
-- 4. ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role Details
  role_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200),
  description TEXT,

  -- Classification
  role_level VARCHAR(20) DEFAULT 'standard'
    CHECK (role_level IN ('system', 'admin', 'manager', 'standard', 'basic', 'guest')),
  role_type VARCHAR(50) DEFAULT 'custom'
    CHECK (role_type IN ('system', 'built-in', 'custom')),

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,
  is_deletable BOOLEAN DEFAULT true,

  -- Permissions
  permissions TEXT[],
  permission_groups TEXT[],
  inherited_from UUID,

  -- Scope
  scope VARCHAR(50) DEFAULT 'organization',
  scope_id VARCHAR(100),

  -- Limits
  max_users INTEGER DEFAULT 0,
  current_users INTEGER DEFAULT 0,

  -- Metadata
  color VARCHAR(50),
  icon VARCHAR(50),
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,

  -- Audit
  created_by VARCHAR(255),
  updated_by VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for roles
CREATE INDEX IF NOT EXISTS idx_roles_user_id ON roles(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(role_name);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(role_level);

-- RLS for roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own roles"
  ON roles FOR ALL
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE roles;

-- ============================================
-- 5. PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permission Details
  permission_key VARCHAR(200) NOT NULL,
  permission_name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Resource
  resource VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),

  -- Actions
  actions TEXT[] DEFAULT ARRAY['read'],
  allowed_actions TEXT[],
  denied_actions TEXT[],

  -- Classification
  category VARCHAR(50),
  permission_group VARCHAR(100),
  is_system BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Scope
  scope VARCHAR(50) DEFAULT 'all',
  scope_conditions JSONB,

  -- Roles
  assigned_roles TEXT[],
  role_count INTEGER DEFAULT 0,

  -- Dependencies
  requires_permissions TEXT[],
  conflicts_with TEXT[],

  -- Metadata
  priority INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for permissions
CREATE INDEX IF NOT EXISTS idx_permissions_user_id ON permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

-- RLS for permissions
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own permissions"
  ON permissions FOR ALL
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE permissions;

-- ============================================
-- 6. ROLE ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS role_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Assignment Details
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL,
  assigned_user_email VARCHAR(255),

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'suspended', 'expired', 'revoked')),

  -- Scope
  scope VARCHAR(50) DEFAULT 'organization',
  scope_id VARCHAR(100),

  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_temporary BOOLEAN DEFAULT false,

  -- Assignment Context
  assigned_by VARCHAR(255),
  assigned_by_id UUID,
  assignment_reason TEXT,

  -- Revocation
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by VARCHAR(255),
  revocation_reason TEXT,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for role_assignments
CREATE INDEX IF NOT EXISTS idx_role_assignments_user_id ON role_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_role_id ON role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_assigned_user ON role_assignments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_status ON role_assignments(status);

-- RLS for role_assignments
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own role assignments"
  ON role_assignments FOR ALL
  USING (auth.uid() = user_id);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE role_assignments;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE system_logs IS 'System logs for monitoring and debugging';
COMMENT ON TABLE audit_events IS 'Audit trail for compliance and security';
COMMENT ON TABLE compliance_checks IS 'Compliance framework checks and scores';
COMMENT ON TABLE roles IS 'Role definitions for RBAC';
COMMENT ON TABLE permissions IS 'Permission definitions for access control';
COMMENT ON TABLE role_assignments IS 'User to role assignments';
