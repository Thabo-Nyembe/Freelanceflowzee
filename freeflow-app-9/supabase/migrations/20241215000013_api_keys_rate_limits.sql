-- Migration: API Keys and Rate Limits Tables
-- Batch 1: Replace mock data with real database tables

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  environment VARCHAR(20) DEFAULT 'development' CHECK (environment IN ('production', 'development', 'staging', 'test')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'restricted', 'revoked', 'expired')),
  permissions TEXT[] DEFAULT ARRAY['read'],
  rate_limit INTEGER DEFAULT 1000,
  requests_count BIGINT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limit Tiers table
CREATE TABLE IF NOT EXISTS rate_limit_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_name VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (tier_name IN ('free', 'starter', 'professional', 'enterprise')),
  requests_limit INTEGER DEFAULT 1000,
  requests_used INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Stats table (for overview page real-time stats)
CREATE TABLE IF NOT EXISTS dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_type VARCHAR(50) NOT NULL,
  stat_value DECIMAL(15, 2) DEFAULT 0,
  previous_value DECIMAL(15, 2) DEFAULT 0,
  change_percent DECIMAL(5, 2) DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, stat_type, period)
);

-- Team Performance table (for leaderboard)
CREATE TABLE IF NOT EXISTS team_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_member_id UUID REFERENCES auth.users(id),
  member_name VARCHAR(255) NOT NULL,
  member_avatar VARCHAR(500),
  revenue DECIMAL(15, 2) DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  client_satisfaction DECIMAL(5, 2) DEFAULT 0,
  change_percent DECIMAL(5, 2) DEFAULT 0,
  rank INTEGER DEFAULT 0,
  period VARCHAR(20) DEFAULT 'monthly',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Request Logs table
CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
  method VARCHAR(10) NOT NULL,
  path VARCHAR(500) NOT NULL,
  status_code INTEGER,
  latency_ms INTEGER,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body JSONB,
  response_size INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user ON rate_limit_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user ON dashboard_stats(user_id, stat_type);
CREATE INDEX IF NOT EXISTS idx_team_performance_user ON team_performance(user_id, period);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user ON api_request_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_key ON api_request_logs(api_key_id);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
DROP POLICY IF EXISTS "Users can view own API keys" ON api_keys;
CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API keys" ON api_keys;
CREATE POLICY "Users can create own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON api_keys;
CREATE POLICY "Users can update own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON api_keys;
CREATE POLICY "Users can delete own API keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for rate_limit_tiers
DROP POLICY IF EXISTS "Users can view own rate limits" ON rate_limit_tiers;
CREATE POLICY "Users can view own rate limits" ON rate_limit_tiers FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own rate limits" ON rate_limit_tiers;
CREATE POLICY "Users can manage own rate limits" ON rate_limit_tiers FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for dashboard_stats
DROP POLICY IF EXISTS "Users can view own dashboard stats" ON dashboard_stats;
CREATE POLICY "Users can view own dashboard stats" ON dashboard_stats FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own dashboard stats" ON dashboard_stats;
CREATE POLICY "Users can manage own dashboard stats" ON dashboard_stats FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for team_performance
DROP POLICY IF EXISTS "Users can view own team performance" ON team_performance;
CREATE POLICY "Users can view own team performance" ON team_performance FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own team performance" ON team_performance;
CREATE POLICY "Users can manage own team performance" ON team_performance FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for api_request_logs
DROP POLICY IF EXISTS "Users can view own API logs" ON api_request_logs;
CREATE POLICY "Users can view own API logs" ON api_request_logs FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own API logs" ON api_request_logs;
CREATE POLICY "Users can create own API logs" ON api_request_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE api_keys;
ALTER PUBLICATION supabase_realtime ADD TABLE rate_limit_tiers;
ALTER PUBLICATION supabase_realtime ADD TABLE dashboard_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE team_performance;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(env VARCHAR DEFAULT 'dev')
RETURNS TEXT AS $$
DECLARE
  key_value TEXT;
BEGIN
  key_value := 'kazi_' || env || '_' || encode(gen_random_bytes(24), 'hex');
  RETURN key_value;
END;
$$ LANGUAGE plpgsql;

-- Function to update API key usage
CREATE OR REPLACE FUNCTION update_api_key_usage(key_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE api_keys
  SET
    requests_count = requests_count + 1,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  tier RECORD;
BEGIN
  SELECT * INTO tier FROM rate_limit_tiers WHERE user_id = p_user_id LIMIT 1;

  IF tier IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Reset if past reset time
  IF tier.reset_at < NOW() THEN
    UPDATE rate_limit_tiers
    SET requests_used = 0, reset_at = NOW() + INTERVAL '1 hour'
    WHERE id = tier.id;
    RETURN TRUE;
  END IF;

  -- Check if under limit (0 = unlimited)
  IF tier.requests_limit = 0 OR tier.requests_used < tier.requests_limit THEN
    UPDATE rate_limit_tiers SET requests_used = requests_used + 1 WHERE id = tier.id;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
