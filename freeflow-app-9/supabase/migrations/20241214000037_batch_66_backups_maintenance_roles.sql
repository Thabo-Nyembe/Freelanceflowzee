-- Batch 66: Backups, Maintenance, Roles
-- Tables for backups-v2, maintenance-v2, roles-v2

-- =====================================================
-- BACKUPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  backup_code VARCHAR(20) UNIQUE DEFAULT ('BKP-' || LPAD(nextval('backups_seq')::text, 6, '0')),

  -- Backup Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'full', -- full, incremental, differential, snapshot, archive
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in-progress, completed, failed, cancelled

  -- Frequency & Schedule
  frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly, monthly, on-demand
  schedule_cron VARCHAR(100),
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Storage
  storage_location VARCHAR(50) DEFAULT 'local', -- local, aws-s3, google-cloud, azure, dropbox, ftp
  storage_path TEXT,
  storage_bucket VARCHAR(255),

  -- Size & Stats
  size_bytes BIGINT DEFAULT 0,
  files_count INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100,

  -- Security
  encrypted BOOLEAN DEFAULT true,
  encryption_algorithm VARCHAR(50) DEFAULT 'AES-256',
  compressed BOOLEAN DEFAULT true,
  compression_type VARCHAR(20) DEFAULT 'gzip',
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Retention
  retention_days INTEGER DEFAULT 30,
  expires_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for backup codes
CREATE SEQUENCE IF NOT EXISTS backups_seq START 1;

-- =====================================================
-- BACKUP LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id UUID NOT NULL REFERENCES backups(id) ON DELETE CASCADE,

  -- Log Info
  action VARCHAR(50) NOT NULL, -- started, completed, failed, restored, verified, deleted
  status VARCHAR(20) DEFAULT 'success', -- success, failed, warning
  message TEXT,

  -- Stats
  size_bytes BIGINT DEFAULT 0,
  files_processed INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,

  -- Error
  error_code VARCHAR(50),
  error_details TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MAINTENANCE WINDOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  window_code VARCHAR(20) UNIQUE DEFAULT ('MNT-' || LPAD(nextval('maintenance_seq')::text, 6, '0')),

  -- Window Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) DEFAULT 'routine', -- routine, emergency, upgrade, patch, inspection, optimization
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, in-progress, completed, cancelled, delayed

  -- Impact & Priority
  impact VARCHAR(20) DEFAULT 'low', -- low, medium, high, critical
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Affected Systems
  affected_systems TEXT[] DEFAULT '{}',
  downtime_expected BOOLEAN DEFAULT false,

  -- Team
  assigned_to TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  notification_methods TEXT[] DEFAULT '{}', -- email, sms, push, in-app, slack
  users_notified INTEGER DEFAULT 0,

  -- Progress
  completion_rate DECIMAL(5,2) DEFAULT 0,
  notes TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for maintenance codes
CREATE SEQUENCE IF NOT EXISTS maintenance_seq START 1;

-- =====================================================
-- MAINTENANCE TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_id UUID NOT NULL REFERENCES maintenance_windows(id) ON DELETE CASCADE,

  -- Task Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  task_order INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in-progress, completed, failed, skipped

  -- Timing
  estimated_duration_minutes INTEGER DEFAULT 15,
  actual_duration_minutes INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Assignment
  assigned_to TEXT[] DEFAULT '{}',
  completed_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_code VARCHAR(20) UNIQUE DEFAULT ('ROLE-' || LPAD(nextval('roles_seq')::text, 6, '0')),

  -- Role Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'user', -- admin, manager, user, viewer, custom
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, deprecated

  -- Access
  access_level VARCHAR(20) DEFAULT 'read', -- full, write, read, restricted
  permissions TEXT[] DEFAULT '{}',

  -- Flags
  can_delegate BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,

  -- Stats
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  last_modified_by UUID REFERENCES auth.users(id),

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for role codes
CREATE SEQUENCE IF NOT EXISTS roles_seq START 1;

-- =====================================================
-- ROLE ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  assigned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Assignment Info
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(role_id, assigned_user_id)
);

-- =====================================================
-- ROLE PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permission Info
  permission_key VARCHAR(100) NOT NULL, -- e.g., 'users:read', 'settings:write'
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- users, settings, billing, analytics, etc.

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, permission_key)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Backups indexes
CREATE INDEX IF NOT EXISTS idx_backups_user ON backups(user_id);
CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
CREATE INDEX IF NOT EXISTS idx_backups_type ON backups(type);
CREATE INDEX IF NOT EXISTS idx_backups_next_run ON backups(next_run_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_backups_deleted ON backups(deleted_at) WHERE deleted_at IS NULL;

-- Backup Logs indexes
CREATE INDEX IF NOT EXISTS idx_backup_logs_backup ON backup_logs(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_logs_action ON backup_logs(action);
CREATE INDEX IF NOT EXISTS idx_backup_logs_created ON backup_logs(created_at DESC);

-- Maintenance Windows indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_user ON maintenance_windows(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_status ON maintenance_windows(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_type ON maintenance_windows(type);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_impact ON maintenance_windows(impact);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_start ON maintenance_windows(start_time);
CREATE INDEX IF NOT EXISTS idx_maintenance_windows_deleted ON maintenance_windows(deleted_at) WHERE deleted_at IS NULL;

-- Maintenance Tasks indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_window ON maintenance_tasks(window_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_status ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_tasks_order ON maintenance_tasks(window_id, task_order);

-- User Roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_type ON user_roles(type);
CREATE INDEX IF NOT EXISTS idx_user_roles_status ON user_roles(status);
CREATE INDEX IF NOT EXISTS idx_user_roles_system ON user_roles(is_system) WHERE is_system = true;
CREATE INDEX IF NOT EXISTS idx_user_roles_deleted ON user_roles(deleted_at) WHERE deleted_at IS NULL;

-- Role Assignments indexes
CREATE INDEX IF NOT EXISTS idx_role_assignments_role ON role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_user ON role_assignments(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignments_active ON role_assignments(role_id, is_active) WHERE is_active = true;

-- Role Permissions indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_user ON role_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_key ON role_permissions(permission_key);
CREATE INDEX IF NOT EXISTS idx_role_permissions_category ON role_permissions(category);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Backups policies
CREATE POLICY "Users can view own backups" ON backups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own backups" ON backups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own backups" ON backups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own backups" ON backups FOR DELETE USING (auth.uid() = user_id);

-- Backup Logs policies
CREATE POLICY "Users can view own backup logs" ON backup_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM backups WHERE backups.id = backup_logs.backup_id AND backups.user_id = auth.uid())
);

-- Maintenance Windows policies
CREATE POLICY "Users can view own maintenance windows" ON maintenance_windows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own maintenance windows" ON maintenance_windows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own maintenance windows" ON maintenance_windows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own maintenance windows" ON maintenance_windows FOR DELETE USING (auth.uid() = user_id);

-- Maintenance Tasks policies
CREATE POLICY "Users can manage own maintenance tasks" ON maintenance_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM maintenance_windows WHERE maintenance_windows.id = maintenance_tasks.window_id AND maintenance_windows.user_id = auth.uid())
);

-- User Roles policies
CREATE POLICY "Users can view own roles" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own roles" ON user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roles" ON user_roles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own roles" ON user_roles FOR DELETE USING (auth.uid() = user_id);

-- Role Assignments policies
CREATE POLICY "Users can view own role assignments" ON role_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.id = role_assignments.role_id AND user_roles.user_id = auth.uid())
);
CREATE POLICY "Users can manage own role assignments" ON role_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_roles.id = role_assignments.role_id AND user_roles.user_id = auth.uid())
);

-- Role Permissions policies
CREATE POLICY "Users can manage own permissions" ON role_permissions FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_backups_updated_at BEFORE UPDATE ON backups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_windows_updated_at BEFORE UPDATE ON maintenance_windows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update backup stats on log
CREATE OR REPLACE FUNCTION update_backup_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'completed' AND NEW.status = 'success' THEN
    UPDATE backups
    SET
      status = 'completed',
      last_run_at = NOW(),
      size_bytes = COALESCE(NEW.size_bytes, size_bytes),
      files_count = COALESCE(NEW.files_processed, files_count),
      duration_seconds = COALESCE(NEW.duration_seconds, duration_seconds),
      verified = true,
      verified_at = NOW()
    WHERE id = NEW.backup_id;
  ELSIF NEW.action = 'failed' THEN
    UPDATE backups
    SET
      status = 'failed',
      error_message = NEW.error_details
    WHERE id = NEW.backup_id;
  ELSIF NEW.action = 'started' THEN
    UPDATE backups
    SET status = 'in-progress'
    WHERE id = NEW.backup_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_backup_stats_on_log AFTER INSERT ON backup_logs
  FOR EACH ROW EXECUTE FUNCTION update_backup_stats();

-- Update maintenance progress
CREATE OR REPLACE FUNCTION update_maintenance_progress()
RETURNS TRIGGER AS $$
DECLARE
  completed_tasks INTEGER;
  total_tasks INTEGER;
BEGIN
  SELECT COUNT(*) INTO completed_tasks
  FROM maintenance_tasks
  WHERE window_id = NEW.window_id AND status = 'completed';

  SELECT COUNT(*) INTO total_tasks
  FROM maintenance_tasks
  WHERE window_id = NEW.window_id;

  IF total_tasks > 0 THEN
    UPDATE maintenance_windows
    SET
      completion_rate = (completed_tasks::DECIMAL / total_tasks) * 100,
      status = CASE
        WHEN completed_tasks = total_tasks THEN 'completed'
        WHEN completed_tasks > 0 THEN 'in-progress'
        ELSE status
      END,
      actual_end = CASE
        WHEN completed_tasks = total_tasks THEN NOW()
        ELSE NULL
      END
    WHERE id = NEW.window_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_maintenance_progress_on_task AFTER INSERT OR UPDATE ON maintenance_tasks
  FOR EACH ROW EXECUTE FUNCTION update_maintenance_progress();

-- Update role user counts
CREATE OR REPLACE FUNCTION update_role_user_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE user_roles
    SET
      total_users = (SELECT COUNT(*) FROM role_assignments WHERE role_id = NEW.role_id),
      active_users = (SELECT COUNT(*) FROM role_assignments WHERE role_id = NEW.role_id AND is_active = true)
    WHERE id = NEW.role_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE user_roles
    SET
      total_users = (SELECT COUNT(*) FROM role_assignments WHERE role_id = OLD.role_id),
      active_users = (SELECT COUNT(*) FROM role_assignments WHERE role_id = OLD.role_id AND is_active = true)
    WHERE id = OLD.role_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_user_counts_trigger AFTER INSERT OR UPDATE OR DELETE ON role_assignments
  FOR EACH ROW EXECUTE FUNCTION update_role_user_counts();
