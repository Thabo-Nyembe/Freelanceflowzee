-- =====================================================
-- ENGAGEMENT SYSTEM V2 - New tables with unique names
-- Avoids conflicts with existing NextAuth/storage tables
-- =====================================================

-- =====================================================
-- ENGAGEMENT ANALYTICS TABLE (renamed from user_analytics)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  last_session_at TIMESTAMPTZ,
  avg_session_duration INTEGER DEFAULT 0,
  projects_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  ai_features_used INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 50,
  retention_score INTEGER DEFAULT 50,
  activation_score INTEGER DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  user_tier TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- ENGAGEMENT SESSIONS TABLE (renamed from user_sessions)
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENGAGEMENT ACTIVITY LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID,
  action_type TEXT NOT NULL,
  action_name TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  page_path TEXT,
  metadata JSONB DEFAULT '{}',
  duration INTEGER,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_activity_user ON engagement_activity_log(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_activity_type ON engagement_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_engagement_sessions_user ON engagement_sessions(user_id, started_at DESC);

-- =====================================================
-- ENGAGEMENT PREFERENCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  preferred_dashboard_widgets TEXT[] DEFAULT '{}',
  preferred_view_mode TEXT DEFAULT 'grid',
  preferred_theme TEXT DEFAULT 'system',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  most_used_features TEXT[] DEFAULT '{}',
  suggested_features TEXT[] DEFAULT '{}',
  hidden_features TEXT[] DEFAULT '{}',
  preferred_project_types TEXT[] DEFAULT '{}',
  preferred_client_industries TEXT[] DEFAULT '{}',
  email_frequency TEXT DEFAULT 'daily',
  push_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  best_active_hours TEXT[] DEFAULT '{}',
  best_active_days TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- ENGAGEMENT RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 50,
  trigger_reason TEXT,
  related_feature TEXT,
  action_url TEXT,
  status TEXT DEFAULT 'pending',
  shown_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  relevance_score INTEGER DEFAULT 50,
  urgency_score INTEGER DEFAULT 50,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_rec_user_status ON engagement_recommendations(user_id, status);

-- =====================================================
-- PLATFORM METRICS TABLE (for investors)
-- =====================================================
CREATE TABLE IF NOT EXISTS platform_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL,
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  avg_sessions_per_user DECIMAL(10,2) DEFAULT 0,
  feature_adoption_rates JSONB DEFAULT '{}',
  most_used_features TEXT[] DEFAULT '{}',
  total_revenue DECIMAL(12,2) DEFAULT 0,
  avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
  total_projects_created INTEGER DEFAULT 0,
  total_invoices_sent INTEGER DEFAULT 0,
  day_1_retention DECIMAL(5,2) DEFAULT 0,
  day_7_retention DECIMAL(5,2) DEFAULT 0,
  day_30_retention DECIMAL(5,2) DEFAULT 0,
  user_growth_rate DECIMAL(5,2) DEFAULT 0,
  revenue_growth_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_start, period_end, period_type)
);

-- =====================================================
-- USER MILESTONES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_name TEXT NOT NULL,
  description TEXT,
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, milestone_type)
);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - Allow service role full access
-- =====================================================
DROP POLICY IF EXISTS "service_engagement_analytics" ON engagement_analytics;
DROP POLICY IF EXISTS "service_engagement_sessions" ON engagement_sessions;
DROP POLICY IF EXISTS "service_engagement_activity" ON engagement_activity_log;
DROP POLICY IF EXISTS "service_engagement_prefs" ON engagement_preferences;
DROP POLICY IF EXISTS "service_engagement_recs" ON engagement_recommendations;
DROP POLICY IF EXISTS "service_platform_metrics" ON platform_metrics;
DROP POLICY IF EXISTS "service_user_milestones" ON user_milestones;

CREATE POLICY "service_engagement_analytics" ON engagement_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_engagement_sessions" ON engagement_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_engagement_activity" ON engagement_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_engagement_prefs" ON engagement_preferences FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_engagement_recs" ON engagement_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_platform_metrics" ON platform_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_user_milestones" ON user_milestones FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- INSERT INITIAL DATA FOR TEST USER
-- =====================================================
INSERT INTO engagement_analytics (user_id, engagement_score, user_tier, total_sessions)
VALUES ('00000000-0000-0000-0000-000000000001', 75, 'active', 15)
ON CONFLICT (user_id) DO UPDATE SET
  engagement_score = EXCLUDED.engagement_score,
  user_tier = EXCLUDED.user_tier;

INSERT INTO engagement_preferences (user_id, preferred_view_mode, most_used_features)
VALUES ('00000000-0000-0000-0000-000000000001', 'grid', ARRAY['projects', 'tasks', 'invoices'])
ON CONFLICT (user_id) DO UPDATE SET
  most_used_features = EXCLUDED.most_used_features;

INSERT INTO user_milestones (user_id, milestone_type, milestone_name, description)
VALUES ('00000000-0000-0000-0000-000000000001', 'first_login', 'Welcome to KAZI!', 'Completed first login')
ON CONFLICT (user_id, milestone_type) DO NOTHING;

-- Seed platform metrics for investors
INSERT INTO platform_metrics (period_start, period_end, period_type, total_users, active_users, new_users, total_revenue)
VALUES ('2025-12-31', '2025-12-31', 'daily', 100, 45, 5, 12500.00)
ON CONFLICT (period_start, period_end, period_type) DO UPDATE SET
  total_users = EXCLUDED.total_users,
  active_users = EXCLUDED.active_users;

SELECT 'Engagement System V2 tables created successfully!' as status;
