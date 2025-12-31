-- =====================================================
-- USER ANALYTICS & ENGAGEMENT SYSTEM
-- Tracks user behavior for personalization and investor metrics
-- =====================================================

-- User Analytics - Per-user metrics and behavior tracking
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session metrics
  total_sessions INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  last_session_at TIMESTAMPTZ,
  avg_session_duration INTEGER DEFAULT 0, -- in seconds

  -- Feature usage counts
  projects_created INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  ai_features_used INTEGER DEFAULT 0,

  -- Engagement scores (0-100)
  engagement_score INTEGER DEFAULT 50,
  retention_score INTEGER DEFAULT 50,
  activation_score INTEGER DEFAULT 0,

  -- User journey stage
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,
  user_tier TEXT DEFAULT 'new', -- new, active, power, champion

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- User Sessions - Track individual sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- in seconds

  -- Session context
  device_type TEXT, -- desktop, mobile, tablet
  browser TEXT,
  os TEXT,
  screen_size TEXT,

  -- Session activity
  pages_viewed INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  features_used TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Activity Log - Granular action tracking
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id),

  -- Activity details
  action_type TEXT NOT NULL, -- page_view, feature_use, button_click, form_submit, etc.
  action_name TEXT NOT NULL, -- specific action name
  entity_type TEXT, -- project, task, invoice, file, etc.
  entity_id UUID,

  -- Context
  page_path TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timing
  duration INTEGER, -- time spent on this action in ms
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast querying
CREATE INDEX IF NOT EXISTS idx_activity_user_timestamp ON user_activity_log(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_activity_action_type ON user_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id, started_at DESC);

-- User Preferences - Learned preferences from behavior
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- UI Preferences (learned)
  preferred_dashboard_widgets TEXT[] DEFAULT '{}',
  preferred_view_mode TEXT DEFAULT 'grid', -- grid, list, kanban
  preferred_theme TEXT DEFAULT 'system',
  sidebar_collapsed BOOLEAN DEFAULT FALSE,

  -- Feature Preferences (learned from usage)
  most_used_features TEXT[] DEFAULT '{}',
  suggested_features TEXT[] DEFAULT '{}',
  hidden_features TEXT[] DEFAULT '{}',

  -- Content Preferences
  preferred_project_types TEXT[] DEFAULT '{}',
  preferred_client_industries TEXT[] DEFAULT '{}',

  -- Notification Preferences
  email_frequency TEXT DEFAULT 'daily', -- realtime, daily, weekly, none
  push_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,

  -- Engagement Preferences (learned)
  best_active_hours TEXT[] DEFAULT '{}', -- e.g., ['09:00', '14:00']
  best_active_days TEXT[] DEFAULT '{}', -- e.g., ['monday', 'tuesday']

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Engagement Recommendations - AI-generated suggestions
CREATE TABLE IF NOT EXISTS engagement_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Recommendation details
  recommendation_type TEXT NOT NULL, -- feature, action, content, tutorial
  title TEXT NOT NULL,
  description TEXT,
  priority INTEGER DEFAULT 50, -- 0-100

  -- Context
  trigger_reason TEXT, -- why this was recommended
  related_feature TEXT,
  action_url TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- pending, shown, clicked, dismissed, completed
  shown_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  -- Scoring
  relevance_score INTEGER DEFAULT 50, -- 0-100
  urgency_score INTEGER DEFAULT 50, -- 0-100

  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_status ON engagement_recommendations(user_id, status);

-- Investor Metrics - Aggregated platform metrics
CREATE TABLE IF NOT EXISTS investor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  period_type TEXT NOT NULL, -- daily, weekly, monthly

  -- User metrics
  total_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,

  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  avg_sessions_per_user DECIMAL(10,2) DEFAULT 0,

  -- Feature adoption
  feature_adoption_rates JSONB DEFAULT '{}',
  most_used_features TEXT[] DEFAULT '{}',

  -- Business metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  avg_revenue_per_user DECIMAL(10,2) DEFAULT 0,
  total_projects_created INTEGER DEFAULT 0,
  total_invoices_sent INTEGER DEFAULT 0,

  -- Retention metrics
  day_1_retention DECIMAL(5,2) DEFAULT 0,
  day_7_retention DECIMAL(5,2) DEFAULT 0,
  day_30_retention DECIMAL(5,2) DEFAULT 0,

  -- Growth metrics
  user_growth_rate DECIMAL(5,2) DEFAULT 0,
  revenue_growth_rate DECIMAL(5,2) DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(period_start, period_end, period_type)
);

-- User Milestones - Track user achievements
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  milestone_type TEXT NOT NULL, -- first_project, first_invoice, power_user, etc.
  milestone_name TEXT NOT NULL,
  description TEXT,

  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',

  UNIQUE(user_id, milestone_type)
);

-- Function to update user analytics on activity
CREATE OR REPLACE FUNCTION update_user_analytics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_analytics (user_id, updated_at)
  VALUES (NEW.user_id, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for activity logging
DROP TRIGGER IF EXISTS trigger_update_analytics ON user_activity_log;
CREATE TRIGGER trigger_update_analytics
  AFTER INSERT ON user_activity_log
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics();

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_sessions INTEGER;
  v_actions INTEGER;
  v_features INTEGER;
  v_recency INTEGER;
BEGIN
  -- Get metrics from last 30 days
  SELECT
    COUNT(DISTINCT id),
    COALESCE(SUM(actions_taken), 0)
  INTO v_sessions, v_actions
  FROM user_sessions
  WHERE user_id = p_user_id
    AND started_at > NOW() - INTERVAL '30 days';

  -- Count unique features used
  SELECT COUNT(DISTINCT action_name)
  INTO v_features
  FROM user_activity_log
  WHERE user_id = p_user_id
    AND timestamp > NOW() - INTERVAL '30 days';

  -- Calculate recency (days since last activity)
  SELECT EXTRACT(DAY FROM NOW() - MAX(timestamp))::INTEGER
  INTO v_recency
  FROM user_activity_log
  WHERE user_id = p_user_id;

  -- Calculate score (0-100)
  v_score := LEAST(100,
    (v_sessions * 5) +
    (v_actions / 10) +
    (v_features * 3) +
    CASE
      WHEN v_recency IS NULL THEN 0
      WHEN v_recency <= 1 THEN 30
      WHEN v_recency <= 7 THEN 20
      WHEN v_recency <= 14 THEN 10
      ELSE 0
    END
  );

  RETURN v_score;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see their own data
CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own activity" ON user_activity_log FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own recommendations" ON engagement_recommendations FOR ALL USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own milestones" ON user_milestones FOR SELECT USING (user_id = auth.uid() OR user_id::text = current_setting('app.current_user_id', true));

-- Service role can insert/update all
CREATE POLICY "Service can manage analytics" ON user_analytics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage activity" ON user_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage recommendations" ON engagement_recommendations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service can manage milestones" ON user_milestones FOR ALL USING (true) WITH CHECK (true);
