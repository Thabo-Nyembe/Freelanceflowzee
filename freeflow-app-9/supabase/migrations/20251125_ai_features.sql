-- AI Features Database Migration
-- Created: 2025-11-25
-- Purpose: Enable AI monetization and growth features

-- ============================================================================
-- INVESTOR METRICS EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_metrics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT valid_event_type CHECK (event_type IN (
    'revenue_generated',
    'client_added',
    'project_completed',
    'task_completed',
    'ai_feature_used',
    'proposal_sent',
    'proposal_won',
    'subscription_started',
    'subscription_renewed',
    'churn_event',
    'user_signup',
    'user_activated',
    'feature_adopted'
  ))
);

CREATE INDEX idx_metrics_events_user ON investor_metrics_events(user_id, created_at DESC);
CREATE INDEX idx_metrics_events_type ON investor_metrics_events(event_type, created_at DESC);
CREATE INDEX idx_metrics_events_date ON investor_metrics_events(created_at DESC);

COMMENT ON TABLE investor_metrics_events IS 'Tracks user events for investor metrics calculation';

-- ============================================================================
-- REVENUE INTELLIGENCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS revenue_intelligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  insights JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',

  -- Metadata
  report_version VARCHAR(20) DEFAULT 'v1.0',
  model_used VARCHAR(50) DEFAULT 'claude-sonnet-4-5',
  processing_time_ms INTEGER,

  CONSTRAINT valid_report_data CHECK (jsonb_typeof(report_data) = 'object')
);

CREATE INDEX idx_revenue_intelligence_user ON revenue_intelligence(user_id, generated_at DESC);
CREATE INDEX idx_revenue_intelligence_expires ON revenue_intelligence(expires_at);

COMMENT ON TABLE revenue_intelligence IS 'Stores AI-generated revenue intelligence reports';

-- Auto-delete expired reports
CREATE OR REPLACE FUNCTION delete_expired_revenue_reports()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM revenue_intelligence WHERE expires_at < NOW();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_delete_expired_reports
  AFTER INSERT ON revenue_intelligence
  EXECUTE FUNCTION delete_expired_revenue_reports();

-- ============================================================================
-- LEAD SCORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id VARCHAR(255) NOT NULL,
  lead_name VARCHAR(255),
  lead_company VARCHAR(255),

  -- Scoring
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  conversion_probability DECIMAL(3,2) CHECK (conversion_probability >= 0 AND conversion_probability <= 1),
  estimated_value INTEGER DEFAULT 0,
  time_to_close INTEGER, -- days
  priority VARCHAR(20) CHECK (priority IN ('hot', 'warm', 'cold')),

  -- Analysis
  analysis JSONB DEFAULT '{}',
  strengths TEXT[],
  concerns TEXT[],
  next_best_action TEXT,

  -- Metadata
  scored_at TIMESTAMPTZ DEFAULT NOW(),
  model_used VARCHAR(50) DEFAULT 'claude-sonnet-4-5',

  -- Tracking
  converted BOOLEAN DEFAULT FALSE,
  converted_at TIMESTAMPTZ,
  actual_value INTEGER,

  UNIQUE(user_id, lead_id)
);

CREATE INDEX idx_lead_scores_user ON lead_scores(user_id, scored_at DESC);
CREATE INDEX idx_lead_scores_priority ON lead_scores(priority, score DESC);
CREATE INDEX idx_lead_scores_converted ON lead_scores(converted, converted_at);

COMMENT ON TABLE lead_scores IS 'AI-powered lead scoring and prioritization';

-- ============================================================================
-- GROWTH PLAYBOOKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS growth_playbooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  industry VARCHAR(100) NOT NULL,
  expertise TEXT[] DEFAULT '{}',

  -- Playbook content
  playbook_data JSONB NOT NULL,
  strategies JSONB DEFAULT '[]',
  action_plan JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  model_used VARCHAR(50) DEFAULT 'claude-sonnet-4-5',

  -- Effectiveness tracking
  actions_completed INTEGER DEFAULT 0,
  revenue_impact INTEGER DEFAULT 0,
  effectiveness_score DECIMAL(3,2),

  CONSTRAINT valid_playbook_data CHECK (jsonb_typeof(playbook_data) = 'object')
);

CREATE INDEX idx_growth_playbooks_user ON growth_playbooks(user_id, created_at DESC);
CREATE INDEX idx_growth_playbooks_industry ON growth_playbooks(industry);

COMMENT ON TABLE growth_playbooks IS 'Industry-specific growth strategies and playbooks';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_growth_playbooks_modtime
  BEFORE UPDATE ON growth_playbooks
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- AI FEATURE USAGE
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_feature_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name VARCHAR(100) NOT NULL,
  feature_category VARCHAR(50),

  -- Usage details
  usage_count INTEGER DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,

  -- Timing
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  avg_response_time_ms INTEGER,

  -- Outcomes
  recommendations_accepted INTEGER DEFAULT 0,
  recommendations_rejected INTEGER DEFAULT 0,
  estimated_value_generated INTEGER DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,

  -- Satisfaction
  satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 10),
  feedback TEXT,

  UNIQUE(user_id, feature_name)
);

CREATE INDEX idx_ai_feature_usage_user ON ai_feature_usage(user_id, last_used_at DESC);
CREATE INDEX idx_ai_feature_usage_feature ON ai_feature_usage(feature_name, usage_count DESC);
CREATE INDEX idx_ai_feature_usage_cost ON ai_feature_usage(cost_usd DESC);

COMMENT ON TABLE ai_feature_usage IS 'Tracks individual AI feature usage and outcomes';

-- ============================================================================
-- AI RECOMMENDATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_type VARCHAR(100) NOT NULL,

  -- Recommendation content
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50),
  priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  estimated_impact INTEGER, -- dollars
  effort_level VARCHAR(20) CHECK (effort_level IN ('low', 'medium', 'high')),

  -- Details
  actions JSONB DEFAULT '[]',
  metrics JSONB DEFAULT '{}',
  deadline TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Outcome tracking
  actual_impact INTEGER,
  actual_effort VARCHAR(20),
  user_rating DECIMAL(2,1) CHECK (user_rating >= 0 AND user_rating <= 5),
  user_feedback TEXT
);

CREATE INDEX idx_ai_recommendations_user ON ai_recommendations(user_id, created_at DESC);
CREATE INDEX idx_ai_recommendations_status ON ai_recommendations(status, priority);
CREATE INDEX idx_ai_recommendations_type ON ai_recommendations(recommendation_type);

COMMENT ON TABLE ai_recommendations IS 'AI-generated recommendations and action items';

-- Auto-update updated_at timestamp
CREATE TRIGGER update_ai_recommendations_modtime
  BEFORE UPDATE ON ai_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- AGGREGATED METRICS (for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_metrics_aggregate (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Revenue metrics
  total_revenue INTEGER DEFAULT 0,
  mrr INTEGER DEFAULT 0,
  arr INTEGER DEFAULT 0,
  avg_project_value INTEGER DEFAULT 0,

  -- Client metrics
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,
  churn_rate DECIMAL(5,2) DEFAULT 0,

  -- Project metrics
  total_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  avg_completion_time_days INTEGER,

  -- AI metrics
  ai_features_used INTEGER DEFAULT 0,
  ai_recommendations_received INTEGER DEFAULT 0,
  ai_recommendations_accepted INTEGER DEFAULT 0,
  ai_acceptance_rate DECIMAL(5,2),
  ai_value_generated INTEGER DEFAULT 0,

  -- Growth metrics
  lead_score_avg DECIMAL(5,2),
  conversion_rate DECIMAL(5,2),
  revenue_growth_rate DECIMAL(5,2),

  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ,

  -- Investment readiness
  investment_readiness_score INTEGER CHECK (investment_readiness_score >= 0 AND investment_readiness_score <= 100)
);

CREATE INDEX idx_user_metrics_aggregate_score ON user_metrics_aggregate(investment_readiness_score DESC);
CREATE INDEX idx_user_metrics_aggregate_revenue ON user_metrics_aggregate(mrr DESC);
CREATE INDEX idx_user_metrics_aggregate_calculated ON user_metrics_aggregate(calculated_at DESC);

COMMENT ON TABLE user_metrics_aggregate IS 'Pre-calculated user metrics for fast dashboard loading';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate user revenue metrics
CREATE OR REPLACE FUNCTION calculate_user_revenue_metrics(p_user_id UUID)
RETURNS TABLE (
  total_revenue INTEGER,
  mrr INTEGER,
  arr INTEGER,
  revenue_growth_rate DECIMAL
) AS $$
BEGIN
  -- This is a placeholder - implement based on your revenue data structure
  RETURN QUERY
  SELECT
    COALESCE(SUM((event_data->>'amount')::INTEGER), 0) as total_revenue,
    COALESCE(AVG((event_data->>'amount')::INTEGER), 0)::INTEGER as mrr,
    COALESCE(AVG((event_data->>'amount')::INTEGER) * 12, 0)::INTEGER as arr,
    10.0::DECIMAL as revenue_growth_rate
  FROM investor_metrics_events
  WHERE user_id = p_user_id
    AND event_type = 'revenue_generated'
    AND created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Calculate platform-wide investor metrics
CREATE OR REPLACE FUNCTION calculate_platform_metrics()
RETURNS TABLE (
  total_users INTEGER,
  active_users INTEGER,
  total_revenue INTEGER,
  mrr INTEGER,
  arr INTEGER,
  churn_rate DECIMAL,
  avg_clv INTEGER,
  avg_cac INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT user_id)::INTEGER as total_users,
    COUNT(DISTINCT CASE WHEN last_activity_at >= NOW() - INTERVAL '7 days' THEN user_id END)::INTEGER as active_users,
    SUM(total_revenue)::INTEGER as total_revenue,
    SUM(mrr)::INTEGER as mrr,
    SUM(arr)::INTEGER as arr,
    AVG(churn_rate)::DECIMAL as churn_rate,
    30000 as avg_clv, -- Placeholder
    300 as avg_cac    -- Placeholder
  FROM user_metrics_aggregate;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE investor_metrics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_intelligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics_aggregate ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_own_data_policy_metrics ON investor_metrics_events
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_revenue ON revenue_intelligence
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_leads ON lead_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_playbooks ON growth_playbooks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_usage ON ai_feature_usage
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_recommendations ON ai_recommendations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_own_data_policy_aggregate ON user_metrics_aggregate
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample event
INSERT INTO investor_metrics_events (user_id, event_type, event_data)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
  'revenue_generated',
  '{"amount": 5000, "source": "project", "client_name": "Test Client"}'::JSONB
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- MAINTENANCE & OPTIMIZATION
-- ============================================================================

-- Vacuum and analyze tables weekly
CREATE OR REPLACE FUNCTION maintain_ai_tables()
RETURNS void AS $$
BEGIN
  VACUUM ANALYZE investor_metrics_events;
  VACUUM ANALYZE revenue_intelligence;
  VACUUM ANALYZE lead_scores;
  VACUUM ANALYZE growth_playbooks;
  VACUUM ANALYZE ai_feature_usage;
  VACUUM ANALYZE ai_recommendations;
  VACUUM ANALYZE user_metrics_aggregate;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
GRANT SELECT, INSERT, UPDATE ON investor_metrics_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON revenue_intelligence TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lead_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE ON growth_playbooks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_feature_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE ON ai_recommendations TO authenticated;
GRANT SELECT ON user_metrics_aggregate TO authenticated;

-- ============================================================================
-- NOTES
-- ============================================================================

-- To apply this migration:
-- 1. Run via Supabase Dashboard: https://app.supabase.com/project/_/sql
-- 2. Or via CLI: supabase db push
-- 3. Or via psql: psql -U postgres -d your_database -f 20251125_ai_features.sql

-- To rollback (if needed):
-- DROP TABLE IF EXISTS investor_metrics_events CASCADE;
-- DROP TABLE IF EXISTS revenue_intelligence CASCADE;
-- DROP TABLE IF EXISTS lead_scores CASCADE;
-- DROP TABLE IF EXISTS growth_playbooks CASCADE;
-- DROP TABLE IF EXISTS ai_feature_usage CASCADE;
-- DROP TABLE IF NOT EXISTS ai_recommendations CASCADE;
-- DROP TABLE IF EXISTS user_metrics_aggregate CASCADE;
-- DROP FUNCTION IF EXISTS calculate_user_revenue_metrics;
-- DROP FUNCTION IF EXISTS calculate_platform_metrics;
-- DROP FUNCTION IF EXISTS maintain_ai_tables;
