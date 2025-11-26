-- ============================================
-- TEAM MANAGEMENT SYSTEM MIGRATION
-- ============================================
-- Comprehensive database schema for team collaboration with:
-- - Team member profiles and roles
-- - Real-time availability tracking
-- - Performance metrics and ratings
-- - Skill management and matching
-- - Project assignments and tracking
-- - Communication and messaging
-- - Time tracking and schedules
-- - Permission management
-- - Team analytics and insights
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE member_status AS ENUM ('online', 'busy', 'away', 'offline');
CREATE TYPE member_role AS ENUM ('Lead Designer', 'Frontend Developer', 'Backend Developer', 'Project Manager', 'QA Engineer', 'Marketing Specialist', 'Content Writer', 'DevOps Engineer', 'UI/UX Designer', 'Data Analyst', 'Team Member');
CREATE TYPE department_type AS ENUM ('Design', 'Development', 'Management', 'Marketing', 'Quality Assurance', 'Content', 'Operations', 'Analytics', 'Sales', 'Support');
CREATE TYPE permission_level AS ENUM ('owner', 'admin', 'write', 'read');
CREATE TYPE timezone_type AS ENUM ('PST', 'MST', 'CST', 'EST', 'UTC', 'GMT', 'CET', 'IST', 'JST', 'AEST');
CREATE TYPE availability_status AS ENUM ('Available', 'Busy', 'In Meeting', 'On Break', 'Offline', 'On Leave', 'Pending');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'completed', 'blocked');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');
CREATE TYPE communication_type AS ENUM ('message', 'email', 'video-call', 'announcement');
CREATE TYPE skill_category AS ENUM ('technical', 'soft', 'tool', 'language', 'domain');

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role member_role NOT NULL,
    department department_type NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    avatar TEXT,
    status member_status DEFAULT 'offline',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    projects_count INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5.0),
    skills TEXT[] DEFAULT '{}',
    availability availability_status DEFAULT 'Offline',
    work_hours TEXT,
    timezone timezone_type DEFAULT 'UTC',
    permissions permission_level DEFAULT 'read',
    bio TEXT,
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    certifications TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    years_of_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    preferred_projects TEXT[] DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for team members
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_department ON team_members(department);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_availability ON team_members(availability);
CREATE INDEX idx_team_members_rating ON team_members(rating DESC);
CREATE INDEX idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX idx_team_members_join_date ON team_members(join_date DESC);
CREATE INDEX idx_team_members_metadata ON team_members USING GIN(metadata);

-- Full-text search for team members
CREATE INDEX idx_team_members_search ON team_members USING GIN(
    to_tsvector('english', name || ' ' || email || ' ' || COALESCE(bio, ''))
);

-- ============================================
-- TEAM INVITATIONS TABLE
-- ============================================

CREATE TABLE team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role member_role NOT NULL,
    department department_type NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status invitation_status DEFAULT 'pending',
    message TEXT,
    token TEXT NOT NULL UNIQUE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for invitations
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_invited_by ON team_invitations(invited_by);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_expires_at ON team_invitations(expires_at);

-- ============================================
-- TEAM PROJECTS TABLE
-- ============================================

CREATE TABLE team_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE NOT NULL,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX idx_team_projects_status ON team_projects(status);
CREATE INDEX idx_team_projects_created_by ON team_projects(created_by);
CREATE INDEX idx_team_projects_start_date ON team_projects(start_date DESC);
CREATE INDEX idx_team_projects_metadata ON team_projects USING GIN(metadata);

-- Full-text search for projects
CREATE INDEX idx_team_projects_search ON team_projects USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================

CREATE TABLE team_project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(project_id, member_id)
);

-- Indexes for project members
CREATE INDEX idx_team_project_members_project_id ON team_project_members(project_id);
CREATE INDEX idx_team_project_members_member_id ON team_project_members(member_id);

-- ============================================
-- TEAM TASKS TABLE
-- ============================================

CREATE TABLE team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX idx_team_tasks_project_id ON team_tasks(project_id);
CREATE INDEX idx_team_tasks_assigned_to ON team_tasks(assigned_to);
CREATE INDEX idx_team_tasks_status ON team_tasks(status);
CREATE INDEX idx_team_tasks_priority ON team_tasks(priority);
CREATE INDEX idx_team_tasks_due_date ON team_tasks(due_date);
CREATE INDEX idx_team_tasks_metadata ON team_tasks USING GIN(metadata);

-- Full-text search for tasks
CREATE INDEX idx_team_tasks_search ON team_tasks USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- ============================================
-- PERFORMANCE METRICS TABLE
-- ============================================

CREATE TABLE team_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    average_task_time DECIMAL(10, 2),
    on_time_delivery DECIMAL(5, 2),
    quality_score DECIMAL(2, 1),
    collaboration_score DECIMAL(2, 1),
    client_satisfaction DECIMAL(2, 1),
    skill_growth DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX idx_team_performance_metrics_member_id ON team_performance_metrics(member_id);
CREATE INDEX idx_team_performance_metrics_period ON team_performance_metrics(period);
CREATE INDEX idx_team_performance_metrics_period_dates ON team_performance_metrics(period_start, period_end);

-- ============================================
-- TEAM MEETINGS TABLE
-- ============================================

CREATE TABLE team_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meeting_link TEXT,
    agenda TEXT[] DEFAULT '{}',
    notes TEXT,
    status meeting_status DEFAULT 'scheduled',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for meetings
CREATE INDEX idx_team_meetings_organizer_id ON team_meetings(organizer_id);
CREATE INDEX idx_team_meetings_status ON team_meetings(status);
CREATE INDEX idx_team_meetings_start_time ON team_meetings(start_time);

-- ============================================
-- MEETING ATTENDEES TABLE
-- ============================================

CREATE TABLE team_meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES team_meetings(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    response TEXT CHECK (response IN ('accepted', 'declined', 'tentative', 'pending')),
    attended BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, member_id)
);

-- Indexes for meeting attendees
CREATE INDEX idx_team_meeting_attendees_meeting_id ON team_meeting_attendees(meeting_id);
CREATE INDEX idx_team_meeting_attendees_member_id ON team_meeting_attendees(member_id);

-- ============================================
-- TEAM COMMUNICATIONS TABLE
-- ============================================

CREATE TABLE team_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type communication_type NOT NULL,
    from_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for communications
CREATE INDEX idx_team_communications_from_member_id ON team_communications(from_member_id);
CREATE INDEX idx_team_communications_type ON team_communications(type);
CREATE INDEX idx_team_communications_read ON team_communications(read);
CREATE INDEX idx_team_communications_created_at ON team_communications(created_at DESC);

-- ============================================
-- COMMUNICATION RECIPIENTS TABLE
-- ============================================

CREATE TABLE team_communication_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    communication_id UUID NOT NULL REFERENCES team_communications(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for communication recipients
CREATE INDEX idx_team_communication_recipients_communication_id ON team_communication_recipients(communication_id);
CREATE INDEX idx_team_communication_recipients_member_id ON team_communication_recipients(member_id);
CREATE INDEX idx_team_communication_recipients_read ON team_communication_recipients(read);

-- ============================================
-- TEAM SKILLS TABLE
-- ============================================

CREATE TABLE team_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    category skill_category NOT NULL,
    proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
    years_of_experience DECIMAL(3, 1),
    certifications TEXT[] DEFAULT '{}',
    last_used DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX idx_team_skills_member_id ON team_skills(member_id);
CREATE INDEX idx_team_skills_skill ON team_skills(skill);
CREATE INDEX idx_team_skills_category ON team_skills(category);
CREATE INDEX idx_team_skills_proficiency ON team_skills(proficiency DESC);

-- ============================================
-- TIME TRACKING TABLE
-- ============================================

CREATE TABLE team_time_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES team_tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    hours_worked DECIMAL(10, 2) NOT NULL,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for time tracking
CREATE INDEX idx_team_time_tracking_member_id ON team_time_tracking(member_id);
CREATE INDEX idx_team_time_tracking_project_id ON team_time_tracking(project_id);
CREATE INDEX idx_team_time_tracking_task_id ON team_time_tracking(task_id);
CREATE INDEX idx_team_time_tracking_date ON team_time_tracking(date DESC);
CREATE INDEX idx_team_time_tracking_billable ON team_time_tracking(billable);

-- ============================================
-- TEAM PERMISSIONS TABLE
-- ============================================

CREATE TABLE team_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    actions TEXT[] NOT NULL,
    level permission_level NOT NULL,
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for permissions
CREATE INDEX idx_team_permissions_member_id ON team_permissions(member_id);
CREATE INDEX idx_team_permissions_resource ON team_permissions(resource);
CREATE INDEX idx_team_permissions_level ON team_permissions(level);

-- ============================================
-- TEAM ANALYTICS TABLE
-- ============================================

CREATE TABLE team_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period TEXT NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    online_members INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    average_rating DECIMAL(2, 1),
    average_response_time DECIMAL(10, 2),
    utilization_rate DECIMAL(5, 2),
    retention_rate DECIMAL(5, 2),
    skill_coverage JSONB DEFAULT '{}',
    department_distribution JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX idx_team_analytics_period ON team_analytics(period);
CREATE INDEX idx_team_analytics_period_dates ON team_analytics(period_start, period_end);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update team member statistics on task completion
CREATE OR REPLACE FUNCTION update_team_member_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE team_members
        SET completed_tasks = completed_tasks + 1
        WHERE id = NEW.assigned_to;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_member_stats
    AFTER INSERT OR UPDATE OF status ON team_tasks
    FOR EACH ROW
    WHEN (NEW.assigned_to IS NOT NULL)
    EXECUTE FUNCTION update_team_member_stats();

-- Update project progress based on tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM team_tasks
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

    IF total_tasks > 0 THEN
        new_progress := (completed_tasks * 100 / total_tasks);
        UPDATE team_projects
        SET progress = new_progress, updated_at = NOW()
        WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
    AFTER INSERT OR UPDATE OR DELETE ON team_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Update last active timestamp
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE team_members
    SET last_active = NOW()
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_last_active_communication
    AFTER INSERT ON team_communications
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trigger_update_member_last_active_time
    AFTER INSERT ON team_time_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_active();

-- Auto-expire invitations
CREATE OR REPLACE FUNCTION auto_expire_invitations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
        NEW.status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_expire_invitations
    BEFORE UPDATE ON team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION auto_expire_invitations();

-- Update timestamp triggers
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

CREATE TRIGGER update_team_projects_updated_at
    BEFORE UPDATE ON team_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_tasks_updated_at
    BEFORE UPDATE ON team_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_meetings_updated_at
    BEFORE UPDATE ON team_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_skills_updated_at
    BEFORE UPDATE ON team_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_analytics ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Users can view all team members"
    ON team_members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
    ON team_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all members"
    ON team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Invitations policies
CREATE POLICY "Admins can manage invitations"
    ON team_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

CREATE POLICY "Users can view invitations sent to them"
    ON team_invitations FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Projects policies
CREATE POLICY "Team members can view projects"
    ON team_projects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Project creators and admins can manage projects"
    ON team_projects FOR ALL
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Tasks policies
CREATE POLICY "Team members can view tasks"
    ON team_tasks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Assigned members can update their tasks"
    ON team_tasks FOR UPDATE
    USING (
        assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all tasks"
    ON team_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Communications policies
CREATE POLICY "Users can view communications they sent or received"
    ON team_communications FOR SELECT
    USING (
        from_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM team_communication_recipients
            WHERE communication_id = team_communications.id
            AND member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create communications"
    ON team_communications FOR INSERT
    WITH CHECK (
        from_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

-- Other policies follow similar patterns...

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get team statistics
CREATE OR REPLACE FUNCTION get_team_statistics()
RETURNS TABLE (
    total_members BIGINT,
    online_members BIGINT,
    active_projects BIGINT,
    completed_tasks BIGINT,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_members,
        COUNT(*) FILTER (WHERE status = 'online')::BIGINT as online_members,
        SUM(projects_count)::BIGINT as active_projects,
        SUM(completed_tasks)::BIGINT as completed_tasks,
        AVG(rating) as average_rating
    FROM team_members;
END;
$$ LANGUAGE plpgsql;

-- Search team members
CREATE OR REPLACE FUNCTION search_team_members(search_query TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    department department_type,
    email TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.department,
        tm.email,
        ts_rank(
            to_tsvector('english', tm.name || ' ' || tm.email || ' ' || COALESCE(tm.bio, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM team_members tm
    WHERE to_tsvector('english', tm.name || ' ' || tm.email || ' ' || COALESCE(tm.bio, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Get member workload
CREATE OR REPLACE FUNCTION get_member_workload(member_uuid UUID)
RETURNS TABLE (
    total_tasks BIGINT,
    todo_tasks BIGINT,
    in_progress_tasks BIGINT,
    review_tasks BIGINT,
    completed_tasks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_tasks,
        COUNT(*) FILTER (WHERE status = 'todo')::BIGINT as todo_tasks,
        COUNT(*) FILTER (WHERE status = 'in-progress')::BIGINT as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'review')::BIGINT as review_tasks,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_tasks
    FROM team_tasks
    WHERE assigned_to = member_uuid;
END;
$$ LANGUAGE plpgsql;

-- Get available members
CREATE OR REPLACE FUNCTION get_available_members()
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    department department_type,
    availability availability_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.department,
        tm.availability
    FROM team_members tm
    WHERE tm.status = 'online'
        AND tm.availability = 'Available'
    ORDER BY tm.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Get department distribution
CREATE OR REPLACE FUNCTION get_department_distribution()
RETURNS TABLE (
    department department_type,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.department,
        COUNT(*)::BIGINT as member_count
    FROM team_members tm
    GROUP BY tm.department
    ORDER BY member_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Find members by skill
CREATE OR REPLACE FUNCTION find_members_by_skill(skill_name TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    skills TEXT[],
    rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.skills,
        tm.rating
    FROM team_members tm
    WHERE skill_name = ANY(tm.skills)
    ORDER BY tm.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE team_members IS 'Team member profiles with roles, skills, and availability';
COMMENT ON TABLE team_invitations IS 'Pending team member invitations';
COMMENT ON TABLE team_projects IS 'Team projects and their status';
COMMENT ON TABLE team_tasks IS 'Tasks assigned to team members';
COMMENT ON TABLE team_performance_metrics IS 'Performance tracking for team members';
COMMENT ON TABLE team_meetings IS 'Team meetings and schedules';
COMMENT ON TABLE team_communications IS 'Team communications and messages';
COMMENT ON TABLE team_skills IS 'Individual skills with proficiency levels';
COMMENT ON TABLE team_time_tracking IS 'Time tracking for projects and tasks';
