-- =====================================================
-- Batch 63: AI Design, Alerts, API Keys
-- Created: December 14, 2024
-- =====================================================

-- =====================================================
-- 1. AI Designs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_designs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  design_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Design',

  -- Design details
  prompt TEXT NOT NULL,
  style VARCHAR(50) DEFAULT 'modern',
  category VARCHAR(50) DEFAULT 'general',

  -- Output
  thumbnail_url TEXT,
  output_url TEXT,
  output_urls TEXT[] DEFAULT '{}',
  resolution VARCHAR(20) DEFAULT '1024x1024',
  format VARCHAR(20) DEFAULT 'png',

  -- AI settings
  model VARCHAR(100) DEFAULT 'dall-e-3',
  seed INTEGER,
  cfg_scale DECIMAL(4,2) DEFAULT 7.0,
  steps INTEGER DEFAULT 50,

  -- Metrics
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  quality_score INTEGER DEFAULT 0,

  -- Generation stats
  generation_time_ms INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 1,
  total_cost DECIMAL(10,4) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for ai_designs
CREATE INDEX IF NOT EXISTS idx_ai_designs_user_id ON ai_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_designs_code ON ai_designs(design_code);
CREATE INDEX IF NOT EXISTS idx_ai_designs_style ON ai_designs(style);
CREATE INDEX IF NOT EXISTS idx_ai_designs_status ON ai_designs(status);
CREATE INDEX IF NOT EXISTS idx_ai_designs_is_public ON ai_designs(is_public);
CREATE INDEX IF NOT EXISTS idx_ai_designs_likes ON ai_designs(likes DESC);
CREATE INDEX IF NOT EXISTS idx_ai_designs_created_at ON ai_designs(created_at DESC);

-- RLS for ai_designs
ALTER TABLE ai_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI designs" ON ai_designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public AI designs" ON ai_designs
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own AI designs" ON ai_designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI designs" ON ai_designs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI designs" ON ai_designs
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate design code
CREATE OR REPLACE FUNCTION generate_design_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.design_code IS NULL OR NEW.design_code = '' THEN
    NEW.design_code := 'DES-' || LPAD(NEXTVAL('design_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS design_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_design_code
  BEFORE INSERT ON ai_designs
  FOR EACH ROW
  EXECUTE FUNCTION generate_design_code();

-- Updated at trigger
CREATE TRIGGER trigger_ai_designs_updated_at
  BEFORE UPDATE ON ai_designs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. Alerts Table
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  severity VARCHAR(20) DEFAULT 'info',
  category VARCHAR(50) DEFAULT 'other',
  status VARCHAR(50) DEFAULT 'active',
  priority INTEGER DEFAULT 3,

  -- Source
  source VARCHAR(100) DEFAULT 'system',
  source_id VARCHAR(100),
  source_type VARCHAR(50),

  -- Affected systems
  affected_systems TEXT[] DEFAULT '{}',
  impact TEXT,

  -- Assignment
  assigned_to VARCHAR(255),
  assigned_team VARCHAR(100),
  escalation_level INTEGER DEFAULT 0,

  -- Timing
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  snoozed_until TIMESTAMP WITH TIME ZONE,

  -- Metrics
  occurrences INTEGER DEFAULT 1,
  response_time_minutes INTEGER DEFAULT 0,
  resolution_time_minutes INTEGER DEFAULT 0,

  -- Notifications
  notification_channels TEXT[] DEFAULT '{}',
  notifications_sent INTEGER DEFAULT 0,

  -- Resolution
  resolution TEXT,
  root_cause TEXT,

  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_code ON alerts(alert_code);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);

-- RLS for alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts" ON alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts" ON alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate alert code
CREATE OR REPLACE FUNCTION generate_alert_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.alert_code IS NULL OR NEW.alert_code = '' THEN
    NEW.alert_code := 'ALT-' || LPAD(NEXTVAL('alert_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS alert_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_alert_code
  BEFORE INSERT ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION generate_alert_code();

-- Updated at trigger
CREATE TRIGGER trigger_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. API Keys Table
-- =====================================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Key details
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  key_type VARCHAR(50) DEFAULT 'api',

  -- Permissions
  permission VARCHAR(50) DEFAULT 'read',
  scopes TEXT[] DEFAULT '{}',

  -- Status
  status VARCHAR(50) DEFAULT 'active',
  environment VARCHAR(50) DEFAULT 'production',

  -- Security
  ip_whitelist TEXT[] DEFAULT '{}',
  allowed_origins TEXT[] DEFAULT '{}',
  rate_limit_per_hour INTEGER DEFAULT 1000,
  rate_limit_per_day INTEGER DEFAULT 10000,

  -- Usage
  total_requests BIGINT DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  last_ip_address VARCHAR(45),

  -- Ownership
  created_by VARCHAR(255),
  team VARCHAR(100),

  -- Expiry
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoked_by VARCHAR(255),
  revoke_reason TEXT,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_code ON api_keys(key_code);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_type ON api_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(environment);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires_at ON api_keys(expires_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at DESC);

-- RLS for api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys" ON api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys" ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate key code
CREATE OR REPLACE FUNCTION generate_api_key_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.key_code IS NULL OR NEW.key_code = '' THEN
    NEW.key_code := 'KEY-' || LPAD(NEXTVAL('api_key_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS api_key_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_api_key_code
  BEFORE INSERT ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION generate_api_key_code();

-- Updated at trigger
CREATE TRIGGER trigger_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily usage counter
CREATE OR REPLACE FUNCTION reset_daily_api_key_usage()
RETURNS void AS $$
BEGIN
  UPDATE api_keys SET requests_today = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Enable Real-time for all tables
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE ai_designs;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE api_keys;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE ai_designs IS 'AI-generated design assets and artwork';
COMMENT ON TABLE alerts IS 'System alerts and notifications';
COMMENT ON TABLE api_keys IS 'API keys and access tokens management';
