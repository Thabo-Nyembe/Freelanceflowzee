-- =====================================================
-- TEAM HUB SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive team management with member profiles,
-- departments, meetings, performance tracking, and analytics
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE member_status AS ENUM (
  'online',
  'offline',
  'away',
  'busy',
  'dnd'
);

CREATE TYPE department_type AS ENUM (
  'design',
  'development',
  'management',
  'marketing',
  'qa',
  'sales',
  'hr',
  'finance',
  'operations',
  'support'
);

CREATE TYPE role_level AS ENUM (
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'principal',
  'director',
  'vp',
  'c-level'
);

CREATE TYPE availability_status AS ENUM (
  'available',
  'in-meeting',
  'on-break',
  'off-sick',
  'on-leave',
  'business-trip'
);

CREATE TYPE meeting_status AS ENUM (
  'scheduled',
  'in-progress',
  'completed',
  'cancelled'
);

CREATE TYPE review_period AS ENUM (
  'monthly',
  'quarterly',
  'bi-annual',
  'annual'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  role_level role_level NOT NULL DEFAULT 'mid',
  department department_type NOT NULL,
  status member_status NOT NULL DEFAULT 'offline',
  availability availability_status NOT NULL DEFAULT 'available',
  avatar TEXT,
  bio TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  start_date DATE,
  skills TEXT[] DEFAULT '{}',
  projects_count INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type department_type NOT NULL,
  description TEXT,
  head_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  budget DECIMAL(15, 2),
  location TEXT,
  goals TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Team Projects
CREATE TABLE team_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  team_size INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Meetings
CREATE TABLE team_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  organizer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  attendees UUID[] DEFAULT '{}',
  agenda TEXT[] DEFAULT '{}',
  notes TEXT,
  recording_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Reviews
CREATE TABLE performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  period review_period NOT NULL,
  review_date DATE NOT NULL,
  overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  technical_rating DECIMAL(2, 1) CHECK (technical_rating >= 0 AND technical_rating <= 5),
  communication_rating DECIMAL(2, 1) CHECK (communication_rating >= 0 AND communication_rating <= 5),
  teamwork_rating DECIMAL(2, 1) CHECK (teamwork_rating >= 0 AND teamwork_rating <= 5),
  leadership_rating DECIMAL(2, 1) CHECK (leadership_rating >= 0 AND leadership_rating <= 5),
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  comments TEXT,
  action_items TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Announcements
CREATE TABLE team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  target_departments department_type[] DEFAULT '{}',
  target_members UUID[] DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Stats (aggregated statistics)
CREATE TABLE team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_members INTEGER NOT NULL DEFAULT 0,
  online_members INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  department_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  top_skills JSONB DEFAULT '[]'::jsonb,
  productivity_score DECIMAL(5, 2),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Team Members Indexes
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_member_user_id ON team_members(member_user_id);
CREATE INDEX idx_team_members_department ON team_members(department);
CREATE INDEX idx_team_members_status ON team_members(status);
CREATE INDEX idx_team_members_availability ON team_members(availability);
CREATE INDEX idx_team_members_role_level ON team_members(role_level);
CREATE INDEX idx_team_members_rating ON team_members(rating DESC);
CREATE INDEX idx_team_members_projects_count ON team_members(projects_count DESC);
CREATE INDEX idx_team_members_tasks_completed ON team_members(tasks_completed DESC);
CREATE INDEX idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX idx_team_members_name_search ON team_members USING GIN(to_tsvector('english', name));
CREATE INDEX idx_team_members_email_search ON team_members USING GIN(to_tsvector('english', email));
CREATE INDEX idx_team_members_created_at ON team_members(created_at DESC);
CREATE INDEX idx_team_members_last_seen ON team_members(last_seen DESC);

-- Departments Indexes
CREATE INDEX idx_departments_user_id ON departments(user_id);
CREATE INDEX idx_departments_type ON departments(type);
CREATE INDEX idx_departments_head_member_id ON departments(head_member_id);
CREATE INDEX idx_departments_member_count ON departments(member_count DESC);
CREATE INDEX idx_departments_active_projects ON departments(active_projects DESC);
CREATE INDEX idx_departments_name_search ON departments USING GIN(to_tsvector('english', name));
CREATE INDEX idx_departments_created_at ON departments(created_at DESC);

-- Team Projects Indexes
CREATE INDEX idx_team_projects_user_id ON team_projects(user_id);
CREATE INDEX idx_team_projects_department_id ON team_projects(department_id);
CREATE INDEX idx_team_projects_status ON team_projects(status);
CREATE INDEX idx_team_projects_priority ON team_projects(priority);
CREATE INDEX idx_team_projects_progress ON team_projects(progress DESC);
CREATE INDEX idx_team_projects_start_date ON team_projects(start_date DESC);
CREATE INDEX idx_team_projects_end_date ON team_projects(end_date);
CREATE INDEX idx_team_projects_team_size ON team_projects(team_size DESC);
CREATE INDEX idx_team_projects_name_search ON team_projects USING GIN(to_tsvector('english', name));
CREATE INDEX idx_team_projects_created_at ON team_projects(created_at DESC);

-- Team Meetings Indexes
CREATE INDEX idx_team_meetings_user_id ON team_meetings(user_id);
CREATE INDEX idx_team_meetings_department_id ON team_meetings(department_id);
CREATE INDEX idx_team_meetings_project_id ON team_meetings(project_id);
CREATE INDEX idx_team_meetings_status ON team_meetings(status);
CREATE INDEX idx_team_meetings_organizer_id ON team_meetings(organizer_id);
CREATE INDEX idx_team_meetings_scheduled_at ON team_meetings(scheduled_at DESC);
CREATE INDEX idx_team_meetings_attendees ON team_meetings USING GIN(attendees);
CREATE INDEX idx_team_meetings_title_search ON team_meetings USING GIN(to_tsvector('english', title));
CREATE INDEX idx_team_meetings_created_at ON team_meetings(created_at DESC);

-- Performance Reviews Indexes
CREATE INDEX idx_performance_reviews_user_id ON performance_reviews(user_id);
CREATE INDEX idx_performance_reviews_member_id ON performance_reviews(member_id);
CREATE INDEX idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX idx_performance_reviews_period ON performance_reviews(period);
CREATE INDEX idx_performance_reviews_review_date ON performance_reviews(review_date DESC);
CREATE INDEX idx_performance_reviews_overall_rating ON performance_reviews(overall_rating DESC);
CREATE INDEX idx_performance_reviews_created_at ON performance_reviews(created_at DESC);

-- Team Announcements Indexes
CREATE INDEX idx_team_announcements_user_id ON team_announcements(user_id);
CREATE INDEX idx_team_announcements_department_id ON team_announcements(department_id);
CREATE INDEX idx_team_announcements_author_id ON team_announcements(author_id);
CREATE INDEX idx_team_announcements_type ON team_announcements(type);
CREATE INDEX idx_team_announcements_priority ON team_announcements(priority);
CREATE INDEX idx_team_announcements_is_pinned ON team_announcements(is_pinned);
CREATE INDEX idx_team_announcements_published_at ON team_announcements(published_at DESC);
CREATE INDEX idx_team_announcements_target_departments ON team_announcements USING GIN(target_departments);
CREATE INDEX idx_team_announcements_target_members ON team_announcements USING GIN(target_members);
CREATE INDEX idx_team_announcements_read_by ON team_announcements USING GIN(read_by);
CREATE INDEX idx_team_announcements_title_search ON team_announcements USING GIN(to_tsvector('english', title));
CREATE INDEX idx_team_announcements_created_at ON team_announcements(created_at DESC);

-- Team Stats Indexes
CREATE INDEX idx_team_stats_user_id ON team_stats(user_id);
CREATE INDEX idx_team_stats_date ON team_stats(date DESC);
CREATE INDEX idx_team_stats_total_members ON team_stats(total_members DESC);
CREATE INDEX idx_team_stats_productivity_score ON team_stats(productivity_score DESC);
CREATE INDEX idx_team_stats_created_at ON team_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_projects_updated_at
  BEFORE UPDATE ON team_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_meetings_updated_at
  BEFORE UPDATE ON team_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_announcements_updated_at
  BEFORE UPDATE ON team_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_stats_updated_at
  BEFORE UPDATE ON team_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update department member count
CREATE OR REPLACE FUNCTION update_department_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE departments
    SET member_count = member_count + 1
    WHERE type = NEW.department AND user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE departments
    SET member_count = GREATEST(0, member_count - 1)
    WHERE type = OLD.department AND user_id = OLD.user_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.department != NEW.department THEN
    UPDATE departments
    SET member_count = GREATEST(0, member_count - 1)
    WHERE type = OLD.department AND user_id = OLD.user_id;
    UPDATE departments
    SET member_count = member_count + 1
    WHERE type = NEW.department AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_department_member_count
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_department_member_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get team statistics
CREATE OR REPLACE FUNCTION get_team_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalMembers', COUNT(*),
    'onlineMembers', COUNT(*) FILTER (WHERE status IN ('online', 'busy')),
    'activeProjects', SUM(projects_count),
    'completedTasks', SUM(tasks_completed),
    'averageRating', ROUND(AVG(rating), 2),
    'byDepartment', (
      SELECT json_object_agg(department, cnt)
      FROM (
        SELECT department, COUNT(*) as cnt
        FROM team_members
        WHERE user_id = p_user_id
        GROUP BY department
      ) dept_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM team_members
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    )
  ) INTO v_stats
  FROM team_members
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search team members
CREATE OR REPLACE FUNCTION search_team_members(
  p_user_id UUID,
  p_search_term TEXT,
  p_department department_type DEFAULT NULL,
  p_status member_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  department department_type,
  status member_status,
  rating DECIMAL,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.name,
    tm.email,
    tm.role,
    tm.department,
    tm.status,
    tm.rating,
    ts_rank(
      to_tsvector('english', tm.name || ' ' || tm.email || ' ' || tm.role),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM team_members tm
  WHERE tm.user_id = p_user_id
    AND (p_department IS NULL OR tm.department = p_department)
    AND (p_status IS NULL OR tm.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', tm.name || ' ' || tm.email || ' ' || tm.role) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, tm.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get department overview
CREATE OR REPLACE FUNCTION get_department_overview(
  p_user_id UUID,
  p_department_type department_type
)
RETURNS JSON AS $$
DECLARE
  v_overview JSON;
BEGIN
  SELECT json_build_object(
    'department', d.name,
    'type', d.type,
    'memberCount', d.member_count,
    'activeProjects', d.active_projects,
    'budget', d.budget,
    'headMember', (
      SELECT json_build_object('id', tm.id, 'name', tm.name, 'role', tm.role)
      FROM team_members tm
      WHERE tm.id = d.head_member_id
    ),
    'topPerformers', (
      SELECT json_agg(
        json_build_object('id', tm.id, 'name', tm.name, 'rating', tm.rating)
        ORDER BY tm.rating DESC
      )
      FROM (
        SELECT id, name, rating
        FROM team_members
        WHERE user_id = p_user_id AND department = p_department_type
        ORDER BY rating DESC
        LIMIT 5
      ) tm
    )
  ) INTO v_overview
  FROM departments d
  WHERE d.user_id = p_user_id AND d.type = p_department_type;

  RETURN v_overview;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings
CREATE OR REPLACE FUNCTION get_upcoming_meetings(
  p_user_id UUID,
  p_member_id UUID DEFAULT NULL,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  type TEXT,
  attendee_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.title,
    tm.scheduled_at,
    tm.duration_minutes,
    tm.type,
    COALESCE(array_length(tm.attendees, 1), 0) as attendee_count
  FROM team_meetings tm
  WHERE tm.user_id = p_user_id
    AND tm.status = 'scheduled'
    AND tm.scheduled_at BETWEEN NOW() AND NOW() + (p_days_ahead || ' days')::INTERVAL
    AND (p_member_id IS NULL OR p_member_id = ANY(tm.attendees))
  ORDER BY tm.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate productivity score
CREATE OR REPLACE FUNCTION calculate_productivity_score(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
BEGIN
  -- Productivity score based on:
  -- - Tasks completed (40%)
  -- - Project progress (30%)
  -- - Team rating (20%)
  -- - Meeting attendance (10%)
  SELECT
    (
      (COALESCE(SUM(tasks_completed), 0) * 0.4) +
      (COALESCE(AVG(projects_count), 0) * 10 * 0.3) +
      (COALESCE(AVG(rating), 0) * 20 * 0.2) +
      (10 * 0.1)  -- Simplified meeting score
    ) INTO v_score
  FROM team_members
  WHERE user_id = p_user_id;

  RETURN ROUND(LEAST(v_score, 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Update team stats
CREATE OR REPLACE FUNCTION update_team_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO team_stats (
    user_id,
    date,
    total_members,
    online_members,
    active_projects,
    completed_tasks,
    average_rating,
    department_breakdown,
    status_breakdown,
    productivity_score
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('online', 'busy')),
    SUM(projects_count),
    SUM(tasks_completed),
    ROUND(AVG(rating), 2),
    (SELECT get_team_stats(p_user_id)->>'byDepartment')::jsonb,
    (SELECT get_team_stats(p_user_id)->>'byStatus')::jsonb,
    calculate_productivity_score(p_user_id)
  FROM team_members
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_members = EXCLUDED.total_members,
    online_members = EXCLUDED.online_members,
    active_projects = EXCLUDED.active_projects,
    completed_tasks = EXCLUDED.completed_tasks,
    average_rating = EXCLUDED.average_rating,
    department_breakdown = EXCLUDED.department_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    productivity_score = EXCLUDED.productivity_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;

-- Team Members Policies
CREATE POLICY team_members_select_policy ON team_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = member_user_id);

CREATE POLICY team_members_insert_policy ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_members_update_policy ON team_members
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = member_user_id);

CREATE POLICY team_members_delete_policy ON team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Departments Policies
CREATE POLICY departments_select_policy ON departments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY departments_insert_policy ON departments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY departments_update_policy ON departments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY departments_delete_policy ON departments
  FOR DELETE USING (auth.uid() = user_id);

-- Team Projects Policies
CREATE POLICY team_projects_select_policy ON team_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_projects_insert_policy ON team_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_projects_update_policy ON team_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_projects_delete_policy ON team_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Team Meetings Policies
CREATE POLICY team_meetings_select_policy ON team_meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_meetings_insert_policy ON team_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_meetings_update_policy ON team_meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_meetings_delete_policy ON team_meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Performance Reviews Policies
CREATE POLICY performance_reviews_select_policy ON performance_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY performance_reviews_insert_policy ON performance_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY performance_reviews_update_policy ON performance_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY performance_reviews_delete_policy ON performance_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Team Announcements Policies
CREATE POLICY team_announcements_select_policy ON team_announcements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_announcements_insert_policy ON team_announcements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_announcements_update_policy ON team_announcements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_announcements_delete_policy ON team_announcements
  FOR DELETE USING (auth.uid() = user_id);

-- Team Stats Policies
CREATE POLICY team_stats_select_policy ON team_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_stats_insert_policy ON team_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_stats_update_policy ON team_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_stats_delete_policy ON team_stats
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all team members by department
-- SELECT * FROM team_members WHERE user_id = 'user-id' AND department = 'development' ORDER BY rating DESC;

-- Example: Search team members
-- SELECT * FROM search_team_members('user-id', 'John', 'development', 'online', 20);

-- Example: Get team statistics
-- SELECT * FROM get_team_stats('user-id');

-- Example: Get department overview
-- SELECT * FROM get_department_overview('user-id', 'development');

-- Example: Get upcoming meetings
-- SELECT * FROM get_upcoming_meetings('user-id', NULL, 7);

-- Example: Update daily team stats
-- SELECT update_team_stats_daily('user-id');

-- =====================================================
-- END OF TEAM HUB SYSTEM SCHEMA
-- =====================================================
