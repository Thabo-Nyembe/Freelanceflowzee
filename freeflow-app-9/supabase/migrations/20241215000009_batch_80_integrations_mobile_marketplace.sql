-- Batch 80: Third-Party Integrations, Mobile App, Integrations Marketplace V2
-- Tables for Integration Management with RLS

-- ============================================
-- Third-Party Integrations Table
-- ============================================
CREATE TABLE IF NOT EXISTS third_party_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  logo VARCHAR(50),
  category VARCHAR(50) DEFAULT 'saas' CHECK (category IN ('saas', 'database', 'cloud', 'messaging', 'ecommerce', 'collaboration', 'monitoring', 'deployment')),
  auth_method VARCHAR(50) DEFAULT 'api-key' CHECK (auth_method IN ('api-key', 'oauth2', 'basic-auth', 'jwt', 'custom')),
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'pending', 'inactive', 'error', 'testing')),
  api_key_encrypted TEXT,
  api_calls_count INTEGER DEFAULT 0,
  uptime_percent DECIMAL(5,2) DEFAULT 99.00,
  response_time_ms INTEGER DEFAULT 100,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  version VARCHAR(20),
  endpoints_count INTEGER DEFAULT 0,
  rate_limit VARCHAR(50),
  documentation_url VARCHAR(500),
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Third-Party Integrations RLS
ALTER TABLE third_party_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own integrations" ON third_party_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create integrations" ON third_party_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON third_party_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON third_party_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Third-Party Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_user_id ON third_party_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_status ON third_party_integrations(status);
CREATE INDEX IF NOT EXISTS idx_third_party_integrations_category ON third_party_integrations(category);

-- ============================================
-- Mobile App Features Table
-- ============================================
CREATE TABLE IF NOT EXISTS mobile_app_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  feature_type VARCHAR(50) DEFAULT 'standard' CHECK (feature_type IN ('core', 'standard', 'premium', 'beta', 'experimental')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'beta', 'deprecated', 'coming-soon')),
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  users_count INTEGER DEFAULT 0,
  engagement_percent INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  version VARCHAR(20),
  release_date TIMESTAMP WITH TIME ZONE,
  icon_color VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Features RLS
ALTER TABLE mobile_app_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mobile features" ON mobile_app_features
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create mobile features" ON mobile_app_features
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mobile features" ON mobile_app_features
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mobile features" ON mobile_app_features
  FOR DELETE USING (auth.uid() = user_id);

-- Mobile App Features Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_app_features_user_id ON mobile_app_features(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_app_features_status ON mobile_app_features(status);
CREATE INDEX IF NOT EXISTS idx_mobile_app_features_platform ON mobile_app_features(platform);

-- ============================================
-- Mobile App Versions Table
-- ============================================
CREATE TABLE IF NOT EXISTS mobile_app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version VARCHAR(20) NOT NULL,
  platform VARCHAR(20) DEFAULT 'all' CHECK (platform IN ('all', 'ios', 'android')),
  status VARCHAR(20) DEFAULT 'stable' CHECK (status IN ('stable', 'beta', 'deprecated', 'archived')),
  downloads_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  crash_free_rate DECIMAL(5,2) DEFAULT 99.00,
  release_notes TEXT,
  features TEXT[] DEFAULT '{}',
  release_date TIMESTAMP WITH TIME ZONE,
  min_os_version VARCHAR(20),
  size_mb DECIMAL(10,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile App Versions RLS
ALTER TABLE mobile_app_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own app versions" ON mobile_app_versions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create app versions" ON mobile_app_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own app versions" ON mobile_app_versions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own app versions" ON mobile_app_versions
  FOR DELETE USING (auth.uid() = user_id);

-- Mobile App Versions Indexes
CREATE INDEX IF NOT EXISTS idx_mobile_app_versions_user_id ON mobile_app_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_app_versions_status ON mobile_app_versions(status);
CREATE INDEX IF NOT EXISTS idx_mobile_app_versions_platform ON mobile_app_versions(platform);

-- ============================================
-- Marketplace Integrations Table
-- ============================================
CREATE TABLE IF NOT EXISTS marketplace_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  provider VARCHAR(255),
  logo VARCHAR(50),
  category VARCHAR(50) DEFAULT 'productivity' CHECK (category IN ('crm', 'marketing', 'productivity', 'communication', 'analytics', 'payment', 'storage', 'social')),
  integration_type VARCHAR(50) DEFAULT 'api' CHECK (integration_type IN ('native', 'api', 'webhook', 'oauth', 'zapier')),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('connected', 'available', 'disconnected', 'configuring', 'error')),
  users_count INTEGER DEFAULT 0,
  installs_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  version VARCHAR(20),
  pricing VARCHAR(50) DEFAULT 'Free',
  sync_frequency VARCHAR(50),
  data_direction VARCHAR(50),
  setup_time VARCHAR(50),
  features TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  config JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace Integrations RLS
ALTER TABLE marketplace_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own marketplace integrations" ON marketplace_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create marketplace integrations" ON marketplace_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own marketplace integrations" ON marketplace_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own marketplace integrations" ON marketplace_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Marketplace Integrations Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_user_id ON marketplace_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_status ON marketplace_integrations(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_integrations_category ON marketplace_integrations(category);
