-- ============================================================================
-- MAIN DASHBOARD SYSTEM - SUPABASE MIGRATION
-- Complete dashboard overview with analytics and insights
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE activity_type AS ENUM (
  'project',
  'payment',
  'feedback',
  'message',
  'system',
  'action',
  'client'
);

CREATE TYPE activity_status AS ENUM (
  'success',
  'info',
  'warning',
  'error'
);

CREATE TYPE activity_impact AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE project_status AS ENUM (
  'Not Started',
  'In Progress',
  'Review',
  'Completed',
  'On Hold',
  'Cancelled'
);

CREATE TYPE project_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

CREATE TYPE project_category AS ENUM (
  'design',
  'development',
  'marketing',
  'content',
  'consulting',
  'other'
);

CREATE TYPE insight_type AS ENUM (
  'revenue',
  'productivity',
  'client',
  'performance',
  'trend',
  'opportunity',
  'risk'
);

CREATE TYPE insight_impact AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE quick_action_category AS ENUM (
  'project',
  'client',
  'financial',
  'communication',
  'ai',
  'content'
);

CREATE TYPE metric_trend AS ENUM (
  'up',
  'down',
  'stable'
);

CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

CREATE TYPE goal_status AS ENUM (
  'on-track',
  'at-risk',
  'off-track',
  'completed'
);

-- ============================================================================
-- TABLE: dashboard_activities
-- ============================================================================

CREATE TABLE dashboard_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  time TIMESTAMPTZ NOT NULL DEFAULT now(),
  status activity_status NOT NULL DEFAULT 'info',
  impact activity_impact NOT NULL DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::JSONB,
  related_id TEXT,
  related_type TEXT,
  action_url TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_projects
-- ============================================================================

CREATE TABLE dashboard_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  client_id UUID,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status project_status NOT NULL DEFAULT 'Not Started',
  value DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  priority project_priority NOT NULL DEFAULT 'medium',
  category project_category NOT NULL DEFAULT 'other',
  ai_automation BOOLEAN DEFAULT false,
  collaboration INTEGER DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_completion TEXT,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_starred BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  hours_logged DECIMAL(10, 2) DEFAULT 0,
  hours_estimated DECIMAL(10, 2) DEFAULT 0,
  budget DECIMAL(12, 2) DEFAULT 0,
  spent DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_insights
-- ============================================================================

CREATE TABLE dashboard_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact insight_impact NOT NULL DEFAULT 'medium',
  action TEXT NOT NULL,
  action_url TEXT,
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  acted_upon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  category TEXT NOT NULL,
  related_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_ai_generated BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_metrics
-- ============================================================================

CREATE TABLE dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  previous_value DECIMAL(15, 2) DEFAULT 0,
  change DECIMAL(15, 2) DEFAULT 0,
  change_percent DECIMAL(10, 2) DEFAULT 0,
  trend metric_trend NOT NULL DEFAULT 'stable',
  unit TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_positive BOOLEAN DEFAULT true,
  target DECIMAL(15, 2),
  target_progress INTEGER,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_quick_actions
-- ============================================================================

CREATE TABLE dashboard_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category quick_action_category NOT NULL,
  url TEXT NOT NULL,
  shortcut TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  estimated_time TEXT,
  complexity TEXT DEFAULT 'simple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_notifications
-- ============================================================================

CREATE TABLE dashboard_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_url TEXT,
  action_label TEXT,
  priority notification_priority NOT NULL DEFAULT 'normal'
);

-- ============================================================================
-- TABLE: dashboard_goals
-- ============================================================================

CREATE TABLE dashboard_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target DECIMAL(15, 2) NOT NULL,
  current DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  unit TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status goal_status NOT NULL DEFAULT 'on-track',
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_goal_milestones
-- ============================================================================

CREATE TABLE dashboard_goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES dashboard_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target DECIMAL(15, 2) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_timeline_events
-- ============================================================================

CREATE TABLE dashboard_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  type activity_type NOT NULL,
  status activity_status NOT NULL DEFAULT 'info',
  related_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_stats
-- ============================================================================

CREATE TABLE dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  earnings DECIMAL(15, 2) DEFAULT 0,
  earnings_trend DECIMAL(10, 2) DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  active_projects_trend DECIMAL(10, 2) DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  completed_projects_trend DECIMAL(10, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  total_clients_trend DECIMAL(10, 2) DEFAULT 0,
  hours_this_month DECIMAL(10, 2) DEFAULT 0,
  hours_this_month_trend DECIMAL(10, 2) DEFAULT 0,
  revenue_this_month DECIMAL(15, 2) DEFAULT 0,
  revenue_this_month_trend DECIMAL(10, 2) DEFAULT 0,
  average_project_value DECIMAL(15, 2) DEFAULT 0,
  average_project_value_trend DECIMAL(10, 2) DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) DEFAULT 0,
  client_satisfaction_trend DECIMAL(10, 2) DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  productivity_score_trend DECIMAL(10, 2) DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  upcoming_meetings INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- dashboard_activities indexes
CREATE INDEX idx_dashboard_activities_user_id ON dashboard_activities(user_id);
CREATE INDEX idx_dashboard_activities_type ON dashboard_activities(type);
CREATE INDEX idx_dashboard_activities_status ON dashboard_activities(status);
CREATE INDEX idx_dashboard_activities_impact ON dashboard_activities(impact);
CREATE INDEX idx_dashboard_activities_is_read ON dashboard_activities(is_read);
CREATE INDEX idx_dashboard_activities_time ON dashboard_activities(time DESC);
CREATE INDEX idx_dashboard_activities_related ON dashboard_activities(related_id, related_type);

-- dashboard_projects indexes
CREATE INDEX idx_dashboard_projects_user_id ON dashboard_projects(user_id);
CREATE INDEX idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX idx_dashboard_projects_priority ON dashboard_projects(priority);
CREATE INDEX idx_dashboard_projects_category ON dashboard_projects(category);
CREATE INDEX idx_dashboard_projects_client_id ON dashboard_projects(client_id);
CREATE INDEX idx_dashboard_projects_deadline ON dashboard_projects(deadline);
CREATE INDEX idx_dashboard_projects_is_starred ON dashboard_projects(is_starred);
CREATE INDEX idx_dashboard_projects_is_pinned ON dashboard_projects(is_pinned);
CREATE INDEX idx_dashboard_projects_tags ON dashboard_projects USING gin(tags);
CREATE INDEX idx_dashboard_projects_progress ON dashboard_projects(progress DESC);
CREATE INDEX idx_dashboard_projects_value ON dashboard_projects(value DESC);

-- dashboard_insights indexes
CREATE INDEX idx_dashboard_insights_user_id ON dashboard_insights(user_id);
CREATE INDEX idx_dashboard_insights_type ON dashboard_insights(type);
CREATE INDEX idx_dashboard_insights_impact ON dashboard_insights(impact);
CREATE INDEX idx_dashboard_insights_acted_upon ON dashboard_insights(acted_upon);
CREATE INDEX idx_dashboard_insights_priority ON dashboard_insights(priority DESC);
CREATE INDEX idx_dashboard_insights_confidence ON dashboard_insights(confidence DESC);
CREATE INDEX idx_dashboard_insights_created_at ON dashboard_insights(created_at DESC);
CREATE INDEX idx_dashboard_insights_expires_at ON dashboard_insights(expires_at);

-- dashboard_metrics indexes
CREATE INDEX idx_dashboard_metrics_user_id ON dashboard_metrics(user_id);
CREATE INDEX idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX idx_dashboard_metrics_name ON dashboard_metrics(name);
CREATE INDEX idx_dashboard_metrics_last_updated ON dashboard_metrics(last_updated DESC);

-- dashboard_quick_actions indexes
CREATE INDEX idx_dashboard_quick_actions_user_id ON dashboard_quick_actions(user_id);
CREATE INDEX idx_dashboard_quick_actions_category ON dashboard_quick_actions(category);
CREATE INDEX idx_dashboard_quick_actions_usage_count ON dashboard_quick_actions(usage_count DESC);
CREATE INDEX idx_dashboard_quick_actions_is_new ON dashboard_quick_actions(is_new);

-- dashboard_notifications indexes
CREATE INDEX idx_dashboard_notifications_user_id ON dashboard_notifications(user_id);
CREATE INDEX idx_dashboard_notifications_is_read ON dashboard_notifications(is_read);
CREATE INDEX idx_dashboard_notifications_priority ON dashboard_notifications(priority);
CREATE INDEX idx_dashboard_notifications_created_at ON dashboard_notifications(created_at DESC);

-- dashboard_goals indexes
CREATE INDEX idx_dashboard_goals_user_id ON dashboard_goals(user_id);
CREATE INDEX idx_dashboard_goals_status ON dashboard_goals(status);
CREATE INDEX idx_dashboard_goals_deadline ON dashboard_goals(deadline);
CREATE INDEX idx_dashboard_goals_category ON dashboard_goals(category);

-- dashboard_goal_milestones indexes
CREATE INDEX idx_dashboard_goal_milestones_goal_id ON dashboard_goal_milestones(goal_id);
CREATE INDEX idx_dashboard_goal_milestones_completed ON dashboard_goal_milestones(completed);

-- dashboard_timeline_events indexes
CREATE INDEX idx_dashboard_timeline_events_user_id ON dashboard_timeline_events(user_id);
CREATE INDEX idx_dashboard_timeline_events_type ON dashboard_timeline_events(type);
CREATE INDEX idx_dashboard_timeline_events_timestamp ON dashboard_timeline_events(timestamp DESC);

-- dashboard_stats indexes
CREATE INDEX idx_dashboard_stats_user_id ON dashboard_stats(user_id);
CREATE INDEX idx_dashboard_stats_last_updated ON dashboard_stats(last_updated DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE dashboard_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

-- dashboard_activities policies
CREATE POLICY "Users can view their own activities"
  ON dashboard_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON dashboard_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON dashboard_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_projects policies
CREATE POLICY "Users can view their own projects"
  ON dashboard_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON dashboard_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON dashboard_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON dashboard_projects FOR DELETE
  USING (auth.uid() = user_id);

-- dashboard_insights policies
CREATE POLICY "Users can view their own insights"
  ON dashboard_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON dashboard_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON dashboard_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_metrics policies
CREATE POLICY "Users can view their own metrics"
  ON dashboard_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON dashboard_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON dashboard_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_quick_actions policies
CREATE POLICY "Users can view quick actions"
  ON dashboard_quick_actions FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can track their own action usage"
  ON dashboard_quick_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_notifications policies
CREATE POLICY "Users can view their own notifications"
  ON dashboard_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON dashboard_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_goals policies
CREATE POLICY "Users can manage their own goals"
  ON dashboard_goals FOR ALL
  USING (auth.uid() = user_id);

-- dashboard_goal_milestones policies
CREATE POLICY "Users can manage milestones for their goals"
  ON dashboard_goal_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_goals
    WHERE dashboard_goals.id = dashboard_goal_milestones.goal_id
    AND dashboard_goals.user_id = auth.uid()
  ));

-- dashboard_timeline_events policies
CREATE POLICY "Users can view their own timeline events"
  ON dashboard_timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timeline events"
  ON dashboard_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- dashboard_stats policies
CREATE POLICY "Users can view their own stats"
  ON dashboard_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON dashboard_stats FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dashboard_projects_updated_at
  BEFORE UPDATE ON dashboard_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_insights_updated_at
  BEFORE UPDATE ON dashboard_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_quick_actions_updated_at
  BEFORE UPDATE ON dashboard_quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_goals_updated_at
  BEFORE UPDATE ON dashboard_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update project progress based on completed tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_tasks > 0 THEN
    NEW.progress := ROUND((NEW.completed_tasks::DECIMAL / NEW.total_tasks::DECIMAL) * 100);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
  BEFORE INSERT OR UPDATE OF completed_tasks, total_tasks ON dashboard_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress();

-- Update goal progress based on current value
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target > 0 THEN
    NEW.progress := LEAST(100, ROUND((NEW.current::DECIMAL / NEW.target::DECIMAL) * 100));
  END IF;

  -- Update goal status based on progress and deadline
  IF NEW.progress >= 100 THEN
    NEW.status := 'completed';
  ELSIF NEW.deadline < now() AND NEW.progress < 100 THEN
    NEW.status := 'off-track';
  ELSIF NEW.progress < 50 AND (NEW.deadline - now()) < INTERVAL '7 days' THEN
    NEW.status := 'at-risk';
  ELSE
    NEW.status := 'on-track';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
  BEFORE INSERT OR UPDATE OF current, target, deadline ON dashboard_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();

-- Track quick action usage
CREATE OR REPLACE FUNCTION track_quick_action_usage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count := NEW.usage_count + 1;
  NEW.last_used := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user dashboard overview
CREATE OR REPLACE FUNCTION get_dashboard_overview(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'activities', (
        SELECT json_agg(row_to_json(a))
        FROM (
          SELECT * FROM dashboard_activities
          WHERE user_id = p_user_id
          ORDER BY time DESC
          LIMIT 10
        ) a
      ),
      'projects', (
        SELECT json_agg(row_to_json(p))
        FROM (
          SELECT * FROM dashboard_projects
          WHERE user_id = p_user_id
          AND status = 'In Progress'
          ORDER BY deadline ASC
          LIMIT 5
        ) p
      ),
      'insights', (
        SELECT json_agg(row_to_json(i))
        FROM (
          SELECT * FROM dashboard_insights
          WHERE user_id = p_user_id
          AND acted_upon = false
          ORDER BY priority DESC, confidence DESC
          LIMIT 5
        ) i
      ),
      'stats', (
        SELECT row_to_json(s)
        FROM dashboard_stats s
        WHERE s.user_id = p_user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate and update dashboard statistics
CREATE OR REPLACE FUNCTION calculate_dashboard_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_earnings DECIMAL(15, 2);
  v_active_projects INTEGER;
  v_completed_projects INTEGER;
  v_total_clients INTEGER;
  v_hours_this_month DECIMAL(10, 2);
BEGIN
  -- Calculate earnings from completed projects
  SELECT COALESCE(SUM(value), 0)
  INTO v_earnings
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'Completed';

  -- Count active projects
  SELECT COUNT(*)
  INTO v_active_projects
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'In Progress';

  -- Count completed projects
  SELECT COUNT(*)
  INTO v_completed_projects
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'Completed';

  -- Count unique clients
  SELECT COUNT(DISTINCT client_id)
  INTO v_total_clients
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND client_id IS NOT NULL;

  -- Sum hours this month
  SELECT COALESCE(SUM(hours_logged), 0)
  INTO v_hours_this_month
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND created_at >= date_trunc('month', now());

  -- Upsert stats
  INSERT INTO dashboard_stats (
    user_id,
    earnings,
    active_projects,
    completed_projects,
    total_clients,
    hours_this_month,
    last_updated
  ) VALUES (
    p_user_id,
    v_earnings,
    v_active_projects,
    v_completed_projects,
    v_total_clients,
    v_hours_this_month,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    earnings = EXCLUDED.earnings,
    active_projects = EXCLUDED.active_projects,
    completed_projects = EXCLUDED.completed_projects,
    total_clients = EXCLUDED.total_clients,
    hours_this_month = EXCLUDED.hours_this_month,
    last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get high-impact unread activities
CREATE OR REPLACE FUNCTION get_high_impact_activities(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  type activity_type,
  message TEXT,
  time TIMESTAMPTZ,
  impact activity_impact
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.type,
    a.message,
    a.time,
    a.impact
  FROM dashboard_activities a
  WHERE a.user_id = p_user_id
  AND a.is_read = false
  AND a.impact IN ('high', 'critical')
  ORDER BY
    CASE a.impact
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      ELSE 3
    END,
    a.time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get projects at risk
CREATE OR REPLACE FUNCTION get_projects_at_risk(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  client TEXT,
  progress INTEGER,
  deadline TIMESTAMPTZ,
  risk_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.client,
    p.progress,
    p.deadline,
    CASE
      WHEN p.deadline < now() AND p.status != 'Completed' THEN 100
      WHEN p.deadline < now() + INTERVAL '7 days' AND p.progress < 80 THEN 75
      WHEN p.deadline < now() + INTERVAL '14 days' AND p.progress < 50 THEN 50
      ELSE 25
    END as risk_score
  FROM dashboard_projects p
  WHERE p.user_id = p_user_id
  AND p.status IN ('In Progress', 'Not Started', 'Review')
  ORDER BY risk_score DESC, p.deadline ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search across dashboard content
CREATE OR REPLACE FUNCTION search_dashboard(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'projects', (
        SELECT json_agg(row_to_json(p))
        FROM (
          SELECT id, name, client, status, progress
          FROM dashboard_projects
          WHERE user_id = p_user_id
          AND (
            name ILIKE '%' || p_search_term || '%'
            OR client ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
            OR p_search_term = ANY(tags)
          )
          LIMIT p_limit
        ) p
      ),
      'activities', (
        SELECT json_agg(row_to_json(a))
        FROM (
          SELECT id, type, message, time
          FROM dashboard_activities
          WHERE user_id = p_user_id
          AND (
            message ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
          )
          ORDER BY time DESC
          LIMIT p_limit
        ) a
      ),
      'insights', (
        SELECT json_agg(row_to_json(i))
        FROM (
          SELECT id, type, title, description
          FROM dashboard_insights
          WHERE user_id = p_user_id
          AND (
            title ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
          )
          LIMIT p_limit
        ) i
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
