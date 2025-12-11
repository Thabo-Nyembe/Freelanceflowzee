-- =====================================================
-- KAZI Team Collaboration System - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (clean slate)
-- =====================================================
DROP TABLE IF EXISTS team_activity CASCADE;
DROP TABLE IF EXISTS team_comments CASCADE;
DROP TABLE IF EXISTS team_tasks CASCADE;
DROP TABLE IF EXISTS team_projects CASCADE;
DROP TABLE IF EXISTS team_invitations CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    industry VARCHAR(100),
    size VARCHAR(50),
    settings JSONB DEFAULT '{}',
    billing_email TEXT,
    subscription_tier VARCHAR(20) DEFAULT 'free',
    max_members INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TEAM MEMBERS TABLE
-- =====================================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    title VARCHAR(100),
    department VARCHAR(100),
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- =====================================================
-- TEAM INVITATIONS TABLE
-- =====================================================
CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    token VARCHAR(64) NOT NULL UNIQUE,
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TEAM PROJECTS TABLE
-- =====================================================
CREATE TABLE team_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'planning',
    priority VARCHAR(20) DEFAULT 'medium',
    start_date DATE,
    due_date DATE,
    budget DECIMAL(15, 2),
    client_id UUID,
    lead_member_id UUID REFERENCES team_members(id),
    tags TEXT[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TEAM TASKS TABLE
-- =====================================================
CREATE TABLE team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    project_id UUID REFERENCES team_projects(id) ON DELETE SET NULL,
    parent_task_id UUID REFERENCES team_tasks(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'todo',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    estimated_hours DECIMAL(8, 2),
    actual_hours DECIMAL(8, 2),
    tags TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- TEAM COMMENTS TABLE
-- =====================================================
CREATE TABLE team_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    parent_id UUID REFERENCES team_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    mentions UUID[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    reactions JSONB DEFAULT '{}',
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TEAM ACTIVITY TABLE
-- =====================================================
CREATE TABLE team_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_active ON teams(is_active) WHERE is_active = true;

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_active ON team_members(team_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(team_id, role);

-- Team invitations indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_pending ON team_invitations(status, expires_at) WHERE status = 'pending';

-- Team projects indexes
CREATE INDEX IF NOT EXISTS idx_team_projects_team ON team_projects(team_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_status ON team_projects(team_id, status);
CREATE INDEX IF NOT EXISTS idx_team_projects_lead ON team_projects(lead_member_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_due ON team_projects(due_date);
CREATE INDEX IF NOT EXISTS idx_team_projects_tags ON team_projects USING GIN(tags);

-- Team tasks indexes
CREATE INDEX IF NOT EXISTS idx_team_tasks_team ON team_tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_project ON team_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned ON team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_created_by ON team_tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(team_id, status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_due ON team_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_team_tasks_order ON team_tasks(team_id, status, order_index);
CREATE INDEX IF NOT EXISTS idx_team_tasks_parent ON team_tasks(parent_task_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_tags ON team_tasks USING GIN(tags);

-- Team comments indexes
CREATE INDEX IF NOT EXISTS idx_team_comments_team ON team_comments(team_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_entity ON team_comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_user ON team_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_parent ON team_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_team_comments_created ON team_comments(created_at DESC);

-- Team activity indexes
CREATE INDEX IF NOT EXISTS idx_team_activity_team ON team_activity(team_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_user ON team_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_entity ON team_activity(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_created ON team_activity(created_at DESC);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Teams policies
CREATE POLICY "teams_select" ON teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "teams_insert" ON teams FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "teams_update" ON teams FOR UPDATE
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "teams_delete" ON teams FOR DELETE
    USING (owner_id = auth.uid());

-- Team members policies
CREATE POLICY "team_members_select" ON team_members FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_members_insert" ON team_members FOR INSERT
    WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
    );

CREATE POLICY "team_members_update" ON team_members FOR UPDATE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

CREATE POLICY "team_members_delete" ON team_members FOR DELETE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Team invitations policies
CREATE POLICY "team_invitations_select" ON team_invitations FOR SELECT
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_invitations_insert" ON team_invitations FOR INSERT
    WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
    );

CREATE POLICY "team_invitations_update" ON team_invitations FOR UPDATE
    USING (
        email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Team projects policies
CREATE POLICY "team_projects_select" ON team_projects FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_projects_insert" ON team_projects FOR INSERT
    WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_projects_update" ON team_projects FOR UPDATE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_projects_delete" ON team_projects FOR DELETE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
    );

-- Team tasks policies
CREATE POLICY "team_tasks_select" ON team_tasks FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_tasks_insert" ON team_tasks FOR INSERT
    WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_tasks_update" ON team_tasks FOR UPDATE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_tasks_delete" ON team_tasks FOR DELETE
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager'))
        OR created_by = auth.uid()
    );

-- Team comments policies
CREATE POLICY "team_comments_select" ON team_comments FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_comments_insert" ON team_comments FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_comments_update" ON team_comments FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "team_comments_delete" ON team_comments FOR DELETE
    USING (
        user_id = auth.uid() OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin'))
    );

-- Team activity policies
CREATE POLICY "team_activity_select" ON team_activity FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

CREATE POLICY "team_activity_insert" ON team_activity FOR INSERT
    WITH CHECK (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND is_active = true)
    );

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON teams TO authenticated;
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON team_invitations TO authenticated;
GRANT ALL ON team_projects TO authenticated;
GRANT ALL ON team_tasks TO authenticated;
GRANT ALL ON team_comments TO authenticated;
GRANT ALL ON team_activity TO authenticated;

GRANT ALL ON teams TO service_role;
GRANT ALL ON team_members TO service_role;
GRANT ALL ON team_invitations TO service_role;
GRANT ALL ON team_projects TO service_role;
GRANT ALL ON team_tasks TO service_role;
GRANT ALL ON team_comments TO service_role;
GRANT ALL ON team_activity TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_team_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER team_projects_updated_at
    BEFORE UPDATE ON team_projects
    FOR EACH ROW EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER team_tasks_updated_at
    BEFORE UPDATE ON team_tasks
    FOR EACH ROW EXECUTE FUNCTION update_team_updated_at();

-- Update project progress when tasks change
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_project_id UUID;
    v_total INTEGER;
    v_completed INTEGER;
    v_progress INTEGER;
BEGIN
    v_project_id := COALESCE(NEW.project_id, OLD.project_id);

    IF v_project_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE status = 'done')
    INTO v_total, v_completed
    FROM team_tasks
    WHERE project_id = v_project_id;

    IF v_total > 0 THEN
        v_progress := (v_completed * 100) / v_total;
    ELSE
        v_progress := 0;
    END IF;

    UPDATE team_projects
    SET progress = v_progress, updated_at = NOW()
    WHERE id = v_project_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_tasks_progress
    AFTER INSERT OR UPDATE OR DELETE ON team_tasks
    FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's teams with role
CREATE OR REPLACE FUNCTION get_user_teams(p_user_id UUID)
RETURNS TABLE(
    team_id UUID,
    team_name VARCHAR(255),
    team_avatar TEXT,
    user_role VARCHAR(20),
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.name,
        t.avatar_url,
        tm.role,
        (SELECT COUNT(*) FROM team_members WHERE team_id = t.id AND is_active = true)
    FROM teams t
    JOIN team_members tm ON tm.team_id = t.id
    WHERE tm.user_id = p_user_id AND tm.is_active = true AND t.is_active = true
    ORDER BY t.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team dashboard stats
CREATE OR REPLACE FUNCTION get_team_dashboard_stats(p_team_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'members', (SELECT COUNT(*) FROM team_members WHERE team_id = p_team_id AND is_active = true),
        'projects', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM team_projects WHERE team_id = p_team_id),
            'active', (SELECT COUNT(*) FROM team_projects WHERE team_id = p_team_id AND status = 'active'),
            'completed', (SELECT COUNT(*) FROM team_projects WHERE team_id = p_team_id AND status = 'completed')
        ),
        'tasks', jsonb_build_object(
            'total', (SELECT COUNT(*) FROM team_tasks WHERE team_id = p_team_id),
            'todo', (SELECT COUNT(*) FROM team_tasks WHERE team_id = p_team_id AND status = 'todo'),
            'in_progress', (SELECT COUNT(*) FROM team_tasks WHERE team_id = p_team_id AND status = 'in_progress'),
            'done', (SELECT COUNT(*) FROM team_tasks WHERE team_id = p_team_id AND status = 'done'),
            'overdue', (SELECT COUNT(*) FROM team_tasks WHERE team_id = p_team_id AND due_date < NOW() AND status != 'done')
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
