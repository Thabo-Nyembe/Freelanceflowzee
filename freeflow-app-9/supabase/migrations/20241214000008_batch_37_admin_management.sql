-- Batch 37: Admin & Management
-- Tables: admin_settings, user_management, team_management
-- Created: December 14, 2024

-- ================================================
-- ADMIN SETTINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Setting Details
  setting_key VARCHAR(200) NOT NULL,
  setting_category VARCHAR(100) NOT NULL,
  setting_group VARCHAR(100),
  setting_name VARCHAR(300) NOT NULL,
  description TEXT,

  -- Value & Type
  value_type VARCHAR(50) NOT NULL DEFAULT 'string'
    CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'array', 'date', 'time', 'datetime', 'color', 'url', 'email')),
  value_string TEXT,
  value_number DECIMAL(20, 4),
  value_boolean BOOLEAN,
  value_json JSONB,
  default_value TEXT,

  -- Scope & Access
  scope VARCHAR(50) NOT NULL DEFAULT 'global'
    CHECK (scope IN ('global', 'organization', 'team', 'user', 'custom')),
  access_level VARCHAR(50) NOT NULL DEFAULT 'admin'
    CHECK (access_level IN ('superadmin', 'admin', 'manager', 'user', 'public')),

  -- Status & Validation
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'deprecated', 'testing')),
  is_required BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  is_editable BOOLEAN DEFAULT true,

  -- Validation Rules
  validation_rules JSONB DEFAULT '{}'::jsonb,
  allowed_values TEXT[],
  min_value DECIMAL(20, 4),
  max_value DECIMAL(20, 4),
  pattern VARCHAR(500),

  -- Audit & History
  previous_value TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ,
  change_reason TEXT,
  version INTEGER DEFAULT 1,

  -- Dependencies
  depends_on TEXT[],
  affects_settings TEXT[],

  -- Metadata
  help_text TEXT,
  warning_text TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT admin_settings_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT admin_settings_unique_key UNIQUE (user_id, setting_key, scope)
);

CREATE INDEX idx_admin_settings_user_id ON admin_settings(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_settings_key ON admin_settings(setting_key) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_settings_category ON admin_settings(setting_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_admin_settings_scope ON admin_settings(scope) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own admin settings" ON admin_settings FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own admin settings" ON admin_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own admin settings" ON admin_settings FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own admin settings" ON admin_settings FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_settings;

-- ================================================
-- USER MANAGEMENT TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS user_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Managed User Details
  managed_user_id UUID NOT NULL REFERENCES auth.users(id),
  username VARCHAR(100),
  email VARCHAR(300) NOT NULL,
  full_name VARCHAR(300),
  display_name VARCHAR(200),

  -- Role & Permissions
  role VARCHAR(50) NOT NULL DEFAULT 'user'
    CHECK (role IN ('superadmin', 'admin', 'manager', 'team_lead', 'member', 'user', 'guest', 'custom')),
  permissions TEXT[],
  permission_groups TEXT[],
  custom_permissions JSONB DEFAULT '{}'::jsonb,

  -- Status & Access
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'locked', 'archived')),
  account_status VARCHAR(50),
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,

  -- Account Information
  department VARCHAR(100),
  job_title VARCHAR(200),
  employee_id VARCHAR(100),
  hire_date DATE,
  termination_date DATE,

  -- Contact Details
  phone VARCHAR(50),
  mobile VARCHAR(50),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),

  -- Security
  two_factor_enabled BOOLEAN DEFAULT false,
  security_questions_set BOOLEAN DEFAULT false,
  password_changed_at TIMESTAMPTZ,
  must_change_password BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Session & Activity
  last_login_at TIMESTAMPTZ,
  last_active_at TIMESTAMPTZ,
  last_login_ip INET,
  login_count INTEGER DEFAULT 0,
  session_timeout INTEGER DEFAULT 3600,

  -- Teams & Organization
  team_ids UUID[],
  organization_id UUID,
  reports_to UUID REFERENCES auth.users(id),
  manages_team_ids UUID[],

  -- Preferences
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(100) DEFAULT 'UTC',
  date_format VARCHAR(50),
  time_format VARCHAR(50),
  notifications_enabled BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Quotas & Limits
  storage_quota BIGINT,
  storage_used BIGINT DEFAULT 0,
  api_quota INTEGER,
  api_calls_used INTEGER DEFAULT 0,

  -- Onboarding & Training
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_completed_at TIMESTAMPTZ,
  training_completed TEXT[],
  certifications TEXT[],

  -- Notes & Tags
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT user_management_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT user_management_unique_managed_user UNIQUE (user_id, managed_user_id)
);

CREATE INDEX idx_user_management_user_id ON user_management(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_management_managed_user ON user_management(managed_user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_management_role ON user_management(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_management_status ON user_management(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_user_management_email ON user_management(email) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE user_management ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own user management" ON user_management FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own user management" ON user_management FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own user management" ON user_management FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own user management" ON user_management FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE user_management;

-- ================================================
-- TEAM MANAGEMENT TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS team_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Team Details
  team_name VARCHAR(300) NOT NULL,
  team_code VARCHAR(100) UNIQUE,
  description TEXT,
  team_type VARCHAR(50) NOT NULL DEFAULT 'department'
    CHECK (team_type IN ('department', 'project', 'functional', 'cross_functional', 'temporary', 'permanent', 'virtual', 'custom')),

  -- Leadership
  team_lead_id UUID REFERENCES auth.users(id),
  manager_id UUID REFERENCES auth.users(id),
  sponsor_id UUID REFERENCES auth.users(id),

  -- Status & Settings
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'forming', 'suspended')),
  visibility VARCHAR(50) NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('public', 'private', 'restricted', 'secret')),
  join_policy VARCHAR(50) DEFAULT 'approval_required'
    CHECK (join_policy IN ('open', 'approval_required', 'invitation_only', 'closed')),

  -- Membership
  member_ids UUID[],
  member_count INTEGER DEFAULT 0,
  max_members INTEGER,
  pending_member_ids UUID[],

  -- Organization
  parent_team_id UUID REFERENCES team_management(id),
  child_team_ids UUID[],
  organization_id UUID,
  department VARCHAR(100),
  division VARCHAR(100),
  location VARCHAR(200),

  -- Goals & Metrics
  goals TEXT[],
  objectives JSONB DEFAULT '[]'::jsonb,
  key_results JSONB DEFAULT '[]'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,

  -- Permissions & Access
  permissions TEXT[],
  access_level VARCHAR(50) DEFAULT 'team'
    CHECK (access_level IN ('public', 'team', 'manager', 'admin')),
  can_invite_members BOOLEAN DEFAULT false,
  can_remove_members BOOLEAN DEFAULT false,
  can_manage_projects BOOLEAN DEFAULT false,

  -- Communication
  chat_enabled BOOLEAN DEFAULT true,
  email_alias VARCHAR(300),
  slack_channel VARCHAR(200),
  teams_channel VARCHAR(200),
  meeting_schedule VARCHAR(500),

  -- Resources
  budget DECIMAL(15, 2),
  budget_used DECIMAL(15, 2) DEFAULT 0.00,
  tools_access TEXT[],
  assigned_resources JSONB DEFAULT '[]'::jsonb,

  -- Timeline
  start_date DATE,
  end_date DATE,
  formation_date DATE,
  dissolution_date DATE,

  -- Performance
  health_score DECIMAL(5, 2),
  productivity_score DECIMAL(5, 2),
  collaboration_score DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Milestones
  milestones JSONB DEFAULT '[]'::jsonb,
  achievements TEXT[],

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT team_management_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_team_management_user_id ON team_management(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_management_name ON team_management(team_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_management_type ON team_management(team_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_management_status ON team_management(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_team_management_lead ON team_management(team_lead_id) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE team_management ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own team management" ON team_management FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own team management" ON team_management FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own team management" ON team_management FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own team management" ON team_management FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE team_management;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_admin_settings_updated_at BEFORE UPDATE ON admin_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_management_updated_at BEFORE UPDATE ON user_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_management_updated_at BEFORE UPDATE ON team_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
