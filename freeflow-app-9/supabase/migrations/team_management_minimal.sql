-- Minimal Team Management Schema
--
-- This schema creates tables for user roles and permissions management.
-- Supports role-based access control (RBAC) and permission assignments.

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TYPE IF EXISTS permission_action CASCADE;
DROP TYPE IF EXISTS user_role_type CASCADE;

-- ENUMs
CREATE TYPE user_role_type AS ENUM ('owner', 'admin', 'manager', 'member', 'guest', 'viewer');
CREATE TYPE permission_action AS ENUM ('create', 'read', 'update', 'delete', 'manage', 'view_only');

-- User Roles Table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role information
  role_name user_role_type NOT NULL DEFAULT 'member',
  role_description TEXT,
  is_custom_role BOOLEAN DEFAULT FALSE,

  -- Team/Organization association
  team_id UUID, -- References team_members table
  department TEXT,

  -- Role hierarchy and permissions
  permission_level INTEGER DEFAULT 1 CHECK (permission_level >= 1 AND permission_level <= 5),
  can_invite_users BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_manage_projects BOOLEAN DEFAULT FALSE,
  can_manage_billing BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT FALSE,
  can_manage_integrations BOOLEAN DEFAULT FALSE,

  -- Status and validity
  is_active BOOLEAN DEFAULT TRUE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  -- Additional info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one primary role per user per team
  UNIQUE(user_id, team_id)
);

-- Role Permissions Table (Permission templates for roles)
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role configuration
  role_name user_role_type NOT NULL,

  -- Resource and actions
  resource_type TEXT NOT NULL, -- e.g., 'projects', 'clients', 'invoices', 'team_members'
  resource_id UUID, -- Optional: specific resource
  allowed_actions permission_action[] NOT NULL DEFAULT '{}',

  -- Scope and constraints
  scope TEXT DEFAULT 'organization', -- 'organization', 'team', 'personal'
  conditions JSONB DEFAULT '{}', -- Additional conditions (time-based, IP-based, etc.)

  -- Priority and inheritance
  priority INTEGER DEFAULT 1,
  inherited_from UUID REFERENCES role_permissions(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint for role-resource combination
  UNIQUE(user_id, role_name, resource_type, resource_id)
);

-- User Permissions Table (Direct permission grants/overrides)
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- User being granted permission

  -- Permission details
  resource_type TEXT NOT NULL,
  resource_id UUID, -- Optional: specific resource
  allowed_actions permission_action[] NOT NULL DEFAULT '{}',
  denied_actions permission_action[] DEFAULT '{}', -- Explicit denials

  -- Scope and constraints
  scope TEXT DEFAULT 'personal',
  conditions JSONB DEFAULT '{}',

  -- Grant info
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  revoke_reason TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Additional info
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for User Roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_team_id ON user_roles(team_id) WHERE team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Indexes for Role Permissions
CREATE INDEX IF NOT EXISTS idx_role_permissions_user_id ON role_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_name ON role_permissions(role_name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource_type ON role_permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_role_permissions_resource_id ON role_permissions(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_role_permissions_is_active ON role_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_actions ON role_permissions USING GIN(allowed_actions);

-- Indexes for User Permissions
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_target_user_id ON user_permissions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource_type ON user_permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_user_permissions_resource_id ON user_permissions(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_permissions_is_active ON user_permissions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_permissions_expires_at ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_permissions_granted_by ON user_permissions(granted_by) WHERE granted_by IS NOT NULL;

-- Helper function to check if user has permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_resource_type TEXT,
  p_action permission_action,
  p_resource_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_user_role user_role_type;
BEGIN
  -- Get user's primary role
  SELECT role_name INTO v_user_role
  FROM user_roles
  WHERE user_id = p_user_id
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY permission_level DESC
  LIMIT 1;

  -- Check role permissions
  IF EXISTS (
    SELECT 1
    FROM role_permissions
    WHERE user_id = p_user_id
      AND role_name = v_user_role
      AND resource_type = p_resource_type
      AND (resource_id IS NULL OR resource_id = p_resource_id)
      AND p_action = ANY(allowed_actions)
      AND is_active = TRUE
  ) THEN
    v_has_permission := TRUE;
  END IF;

  -- Check direct user permissions (overrides role permissions)
  IF EXISTS (
    SELECT 1
    FROM user_permissions
    WHERE target_user_id = p_user_id
      AND resource_type = p_resource_type
      AND (resource_id IS NULL OR resource_id = p_resource_id)
      AND p_action = ANY(allowed_actions)
      AND NOT (p_action = ANY(denied_actions))
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
      AND revoked_at IS NULL
  ) THEN
    v_has_permission := TRUE;
  END IF;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_resource_type TEXT DEFAULT NULL
) RETURNS TABLE (
  resource_type TEXT,
  resource_id UUID,
  allowed_actions permission_action[],
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Get role-based permissions
  SELECT
    rp.resource_type,
    rp.resource_id,
    rp.allowed_actions,
    'role' AS source
  FROM role_permissions rp
  INNER JOIN user_roles ur ON ur.role_name = rp.role_name AND ur.user_id = p_user_id
  WHERE rp.user_id = p_user_id
    AND rp.is_active = TRUE
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND (p_resource_type IS NULL OR rp.resource_type = p_resource_type)

  UNION ALL

  -- Get direct user permissions
  SELECT
    up.resource_type,
    up.resource_id,
    up.allowed_actions,
    'direct' AS source
  FROM user_permissions up
  WHERE up.target_user_id = p_user_id
    AND up.is_active = TRUE
    AND (up.expires_at IS NULL OR up.expires_at > NOW())
    AND up.revoked_at IS NULL
    AND (p_resource_type IS NULL OR up.resource_type = p_resource_type)

  ORDER BY resource_type, source DESC; -- 'role' sorts before 'direct'
END;
$$ LANGUAGE plpgsql;

-- Helper function to get users by role
CREATE OR REPLACE FUNCTION get_users_by_role(
  p_owner_user_id UUID,
  p_role_name user_role_type
) RETURNS TABLE (
  user_id UUID,
  role_name user_role_type,
  permission_level INTEGER,
  assigned_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.user_id,
    ur.role_name,
    ur.permission_level,
    ur.assigned_at,
    ur.expires_at
  FROM user_roles ur
  WHERE ur.user_id IN (
    SELECT user_id FROM user_roles WHERE user_id = p_owner_user_id
  )
    AND ur.role_name = p_role_name
    AND ur.is_active = TRUE
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ORDER BY ur.permission_level DESC, ur.assigned_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get role summary
CREATE OR REPLACE FUNCTION get_role_summary(
  p_user_id UUID
) RETURNS TABLE (
  role_name user_role_type,
  user_count BIGINT,
  active_count BIGINT,
  permission_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ur.role_name,
    COUNT(DISTINCT ur.user_id) AS user_count,
    COUNT(DISTINCT ur.user_id) FILTER (WHERE ur.is_active = TRUE) AS active_count,
    COUNT(rp.id) AS permission_count
  FROM user_roles ur
  LEFT JOIN role_permissions rp ON rp.role_name = ur.role_name AND rp.user_id = p_user_id
  WHERE ur.user_id = p_user_id
  GROUP BY ur.role_name
  ORDER BY user_count DESC;
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

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_permissions_updated_at
  BEFORE UPDATE ON user_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to validate permission level hierarchy
CREATE OR REPLACE FUNCTION validate_permission_level()
RETURNS TRIGGER AS $$
BEGIN
  -- Owner has highest level (5)
  IF NEW.role_name = 'owner' AND NEW.permission_level != 5 THEN
    NEW.permission_level := 5;
  -- Admin has level 4
  ELSIF NEW.role_name = 'admin' AND NEW.permission_level != 4 THEN
    NEW.permission_level := 4;
  -- Manager has level 3
  ELSIF NEW.role_name = 'manager' AND NEW.permission_level != 3 THEN
    NEW.permission_level := 3;
  -- Member has level 2
  ELSIF NEW.role_name = 'member' AND NEW.permission_level != 2 THEN
    NEW.permission_level := 2;
  -- Guest and Viewer have level 1
  ELSIF NEW.role_name IN ('guest', 'viewer') AND NEW.permission_level != 1 THEN
    NEW.permission_level := 1;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_user_role_permission_level
  BEFORE INSERT OR UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION validate_permission_level();
