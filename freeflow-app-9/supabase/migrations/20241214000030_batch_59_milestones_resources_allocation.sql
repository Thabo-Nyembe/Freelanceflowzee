-- =============================================
-- BATCH 59: Milestones, Resources, Allocation V2 Integration
-- =============================================

-- =============================================
-- MILESTONES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'project', -- project, product, business, technical, compliance
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, in-progress, at-risk, completed, missed
  priority VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
  due_date DATE,
  days_remaining INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  owner_name VARCHAR(255),
  owner_email VARCHAR(255),
  team_name VARCHAR(255),
  deliverables INTEGER DEFAULT 0,
  completed_deliverables INTEGER DEFAULT 0,
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  dependencies INTEGER DEFAULT 0,
  stakeholders TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for milestones
CREATE INDEX IF NOT EXISTS idx_milestones_user_id ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_type ON milestones(type);
CREATE INDEX IF NOT EXISTS idx_milestones_priority ON milestones(priority);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_deleted_at ON milestones(deleted_at);

-- =============================================
-- MILESTONE DELIVERABLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS milestone_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES milestones(id) ON DELETE CASCADE,
  deliverable_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in-progress, completed, blocked
  due_date DATE,
  completed_date DATE,
  assignee_name VARCHAR(255),
  assignee_email VARCHAR(255),
  progress INTEGER DEFAULT 0,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for milestone_deliverables
CREATE INDEX IF NOT EXISTS idx_milestone_deliverables_user_id ON milestone_deliverables(user_id);
CREATE INDEX IF NOT EXISTS idx_milestone_deliverables_milestone_id ON milestone_deliverables(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_deliverables_status ON milestone_deliverables(status);

-- =============================================
-- RESOURCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  type VARCHAR(50) DEFAULT 'developer', -- developer, designer, manager, qa, devops, other
  skill_level VARCHAR(50) DEFAULT 'mid-level', -- junior, mid-level, senior, lead, principal
  status VARCHAR(50) DEFAULT 'available', -- available, assigned, overallocated, unavailable
  department VARCHAR(255),
  location VARCHAR(255),
  capacity INTEGER DEFAULT 40, -- hours per week
  allocated INTEGER DEFAULT 0, -- hours allocated
  utilization DECIMAL(5, 2) DEFAULT 0, -- percentage
  skills TEXT[] DEFAULT '{}',
  projects TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  availability_date DATE,
  hire_date DATE,
  phone VARCHAR(50),
  avatar_url TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for resources
CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_skill_level ON resources(skill_level);
CREATE INDEX IF NOT EXISTS idx_resources_department ON resources(department);
CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON resources(deleted_at);

-- =============================================
-- RESOURCE SKILLS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS resource_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  skill_name VARCHAR(255) NOT NULL,
  proficiency_level INTEGER DEFAULT 3, -- 1-5 scale
  years_experience DECIMAL(4, 1) DEFAULT 0,
  certified BOOLEAN DEFAULT FALSE,
  certification_date DATE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for resource_skills
CREATE INDEX IF NOT EXISTS idx_resource_skills_user_id ON resource_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_skills_resource_id ON resource_skills(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_skills_skill_name ON resource_skills(skill_name);

-- =============================================
-- ALLOCATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_code VARCHAR(50) NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  resource_name VARCHAR(255) NOT NULL,
  resource_role VARCHAR(255),
  project_name VARCHAR(255) NOT NULL,
  project_id UUID,
  allocation_type VARCHAR(50) DEFAULT 'full-time', -- full-time, part-time, temporary, contract
  status VARCHAR(50) DEFAULT 'pending', -- active, pending, completed, cancelled
  priority VARCHAR(50) DEFAULT 'medium', -- critical, high, medium, low
  hours_per_week INTEGER DEFAULT 40,
  allocated_hours INTEGER DEFAULT 0,
  utilization DECIMAL(5, 2) DEFAULT 0,
  start_date DATE,
  end_date DATE,
  weeks_remaining INTEGER DEFAULT 0,
  billable_rate DECIMAL(10, 2) DEFAULT 0,
  project_value DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  manager_name VARCHAR(255),
  manager_email VARCHAR(255),
  skills TEXT[] DEFAULT '{}',
  notes TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for allocations
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_resource_id ON allocations(resource_id);
CREATE INDEX IF NOT EXISTS idx_allocations_status ON allocations(status);
CREATE INDEX IF NOT EXISTS idx_allocations_allocation_type ON allocations(allocation_type);
CREATE INDEX IF NOT EXISTS idx_allocations_priority ON allocations(priority);
CREATE INDEX IF NOT EXISTS idx_allocations_start_date ON allocations(start_date);
CREATE INDEX IF NOT EXISTS idx_allocations_end_date ON allocations(end_date);
CREATE INDEX IF NOT EXISTS idx_allocations_deleted_at ON allocations(deleted_at);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Milestones RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Milestone Deliverables RLS
ALTER TABLE milestone_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestone deliverables"
  ON milestone_deliverables FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestone deliverables"
  ON milestone_deliverables FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestone deliverables"
  ON milestone_deliverables FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestone deliverables"
  ON milestone_deliverables FOR DELETE
  USING (auth.uid() = user_id);

-- Resources RLS
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resources"
  ON resources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resources"
  ON resources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resources"
  ON resources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resources"
  ON resources FOR DELETE
  USING (auth.uid() = user_id);

-- Resource Skills RLS
ALTER TABLE resource_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resource skills"
  ON resource_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resource skills"
  ON resource_skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own resource skills"
  ON resource_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own resource skills"
  ON resource_skills FOR DELETE
  USING (auth.uid() = user_id);

-- Allocations RLS
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own allocations"
  ON allocations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own allocations"
  ON allocations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own allocations"
  ON allocations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own allocations"
  ON allocations FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_deliverables_updated_at
  BEFORE UPDATE ON milestone_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_skills_updated_at
  BEFORE UPDATE ON resource_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- REAL-TIME SUBSCRIPTIONS
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE milestone_deliverables;
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
ALTER PUBLICATION supabase_realtime ADD TABLE resource_skills;
ALTER PUBLICATION supabase_realtime ADD TABLE allocations;
