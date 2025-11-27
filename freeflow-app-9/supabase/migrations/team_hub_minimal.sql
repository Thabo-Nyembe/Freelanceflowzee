-- Minimal Team Hub Schema
--
-- This schema creates tables for team member management and collaboration.
-- Supports member profiles, departments, projects, and team analytics.

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS availability_status CASCADE;
DROP TYPE IF EXISTS role_level CASCADE;
DROP TYPE IF EXISTS department_type CASCADE;

-- ENUMs
CREATE TYPE member_status AS ENUM ('online', 'offline', 'busy', 'away');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'in_meeting', 'on_break', 'offline', 'on_leave');
CREATE TYPE role_level AS ENUM ('entry', 'mid', 'senior', 'lead', 'executive');
CREATE TYPE department_type AS ENUM ('design', 'development', 'management', 'marketing', 'qa', 'content', 'operations', 'analytics', 'sales', 'support');

-- Team Members Table
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Member information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  bio TEXT,

  -- Role and department
  role TEXT NOT NULL,
  role_level role_level NOT NULL DEFAULT 'mid',
  department department_type NOT NULL,

  -- Contact and location
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',

  -- Status and availability
  status member_status NOT NULL DEFAULT 'offline',
  availability availability_status NOT NULL DEFAULT 'available',
  last_seen TIMESTAMPTZ,

  -- Skills and experience
  skills TEXT[] DEFAULT '{}',
  start_date DATE,

  -- Performance metrics
  projects_count INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),

  -- Settings and metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments Table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Department information
  name TEXT NOT NULL,
  type department_type NOT NULL,
  description TEXT,

  -- Leadership
  head_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,

  -- Metrics
  member_count INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  budget DECIMAL(15, 2),

  -- Additional info
  location TEXT,
  goals TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique department type per user
  UNIQUE(user_id, type)
);

-- Indexes for Team Members
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON team_members(availability);
CREATE INDEX IF NOT EXISTS idx_team_members_role_level ON team_members(role_level);
CREATE INDEX IF NOT EXISTS idx_team_members_rating ON team_members(rating DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);

-- Indexes for Departments
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_type ON departments(type);
CREATE INDEX IF NOT EXISTS idx_departments_head_member ON departments(head_member_id) WHERE head_member_id IS NOT NULL;

-- Helper function to get team overview
CREATE OR REPLACE FUNCTION get_team_overview(
  p_user_id UUID
) RETURNS TABLE (
  total_members INTEGER,
  online_members INTEGER,
  total_departments INTEGER,
  total_projects INTEGER,
  total_tasks_completed INTEGER,
  average_rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_members,
    COUNT(*) FILTER (WHERE status = 'online')::INTEGER as online_members,
    (SELECT COUNT(DISTINCT department) FROM team_members WHERE user_id = p_user_id)::INTEGER as total_departments,
    COALESCE(SUM(projects_count), 0)::INTEGER as total_projects,
    COALESCE(SUM(tasks_completed), 0)::INTEGER as total_tasks_completed,
    ROUND(AVG(rating)::NUMERIC, 1)::DECIMAL as average_rating
  FROM team_members
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get department stats
CREATE OR REPLACE FUNCTION get_department_stats(
  p_user_id UUID,
  p_department department_type
) RETURNS TABLE (
  member_count INTEGER,
  online_count INTEGER,
  average_rating DECIMAL,
  total_tasks_completed INTEGER,
  total_projects INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as member_count,
    COUNT(*) FILTER (WHERE status = 'online')::INTEGER as online_count,
    ROUND(AVG(rating)::NUMERIC, 1)::DECIMAL as average_rating,
    COALESCE(SUM(tasks_completed), 0)::INTEGER as total_tasks_completed,
    COALESCE(SUM(projects_count), 0)::INTEGER as total_projects
  FROM team_members
  WHERE user_id = p_user_id
    AND department = p_department;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get top performers
CREATE OR REPLACE FUNCTION get_top_performers(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  member_id UUID,
  name TEXT,
  role TEXT,
  department department_type,
  rating DECIMAL,
  tasks_completed INTEGER,
  projects_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id as member_id,
    team_members.name,
    team_members.role,
    team_members.department,
    team_members.rating,
    team_members.tasks_completed,
    team_members.projects_count
  FROM team_members
  WHERE user_id = p_user_id
  ORDER BY rating DESC, tasks_completed DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update member stats
CREATE OR REPLACE FUNCTION update_member_stats(
  p_member_id UUID,
  p_increment_projects BOOLEAN DEFAULT FALSE,
  p_increment_tasks BOOLEAN DEFAULT FALSE
) RETURNS void AS $$
BEGIN
  UPDATE team_members
  SET
    projects_count = CASE WHEN p_increment_projects THEN projects_count + 1 ELSE projects_count END,
    tasks_completed = CASE WHEN p_increment_tasks THEN tasks_completed + 1 ELSE tasks_completed END,
    updated_at = NOW()
  WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to update department member count
CREATE OR REPLACE FUNCTION update_department_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE departments
    SET member_count = member_count + 1
    WHERE user_id = NEW.user_id AND type = NEW.department;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE departments
    SET member_count = member_count - 1
    WHERE user_id = OLD.user_id AND type = OLD.department;
  ELSIF TG_OP = 'UPDATE' AND OLD.department != NEW.department THEN
    UPDATE departments
    SET member_count = member_count - 1
    WHERE user_id = OLD.user_id AND type = OLD.department;

    UPDATE departments
    SET member_count = member_count + 1
    WHERE user_id = NEW.user_id AND type = NEW.department;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_department_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_department_member_count();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_seen on status change
CREATE OR REPLACE FUNCTION update_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    NEW.last_seen = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_last_seen
  BEFORE UPDATE OF status ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_last_seen();
