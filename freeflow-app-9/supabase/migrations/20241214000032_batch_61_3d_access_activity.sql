-- =====================================================
-- Batch 61: 3D Modeling, Access Logs, Activity Logs
-- Created: December 14, 2024
-- =====================================================

-- =====================================================
-- 1. 3D Models Table
-- =====================================================
CREATE TABLE IF NOT EXISTS three_d_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(50) DEFAULT 'draft',

  -- File info
  file_url TEXT,
  thumbnail_url TEXT,
  file_format VARCHAR(20) DEFAULT 'OBJ',
  file_size BIGINT DEFAULT 0,

  -- Model metrics
  polygon_count BIGINT DEFAULT 0,
  vertex_count BIGINT DEFAULT 0,
  texture_count INTEGER DEFAULT 0,
  material_count INTEGER DEFAULT 0,

  -- Render settings
  render_quality VARCHAR(20) DEFAULT 'medium',
  render_samples INTEGER DEFAULT 128,
  last_render_time DECIMAL(10,2) DEFAULT 0,

  -- Project info
  project_id UUID,
  is_public BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for 3D models
CREATE INDEX IF NOT EXISTS idx_three_d_models_user_id ON three_d_models(user_id);
CREATE INDEX IF NOT EXISTS idx_three_d_models_model_code ON three_d_models(model_code);
CREATE INDEX IF NOT EXISTS idx_three_d_models_category ON three_d_models(category);
CREATE INDEX IF NOT EXISTS idx_three_d_models_status ON three_d_models(status);
CREATE INDEX IF NOT EXISTS idx_three_d_models_created_at ON three_d_models(created_at DESC);

-- RLS for 3D models
ALTER TABLE three_d_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 3D models" ON three_d_models
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public 3D models" ON three_d_models
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create own 3D models" ON three_d_models
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own 3D models" ON three_d_models
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own 3D models" ON three_d_models
  FOR DELETE USING (auth.uid() = user_id);

-- Auto-generate model code
CREATE OR REPLACE FUNCTION generate_model_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.model_code IS NULL OR NEW.model_code = '' THEN
    NEW.model_code := 'MOD-' || LPAD(NEXTVAL('three_d_model_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS three_d_model_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_model_code
  BEFORE INSERT ON three_d_models
  FOR EACH ROW
  EXECUTE FUNCTION generate_model_code();

-- Updated at trigger
CREATE TRIGGER trigger_three_d_models_updated_at
  BEFORE UPDATE ON three_d_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. Access Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  log_code VARCHAR(50) UNIQUE NOT NULL,

  -- User info
  user_name VARCHAR(255),
  user_email VARCHAR(255),

  -- Access details
  access_type VARCHAR(50) NOT NULL DEFAULT 'login',
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  resource VARCHAR(500),
  method VARCHAR(20) DEFAULT 'GET',
  status_code INTEGER DEFAULT 200,

  -- Location/Device
  ip_address VARCHAR(50),
  location VARCHAR(255),
  device_type VARCHAR(50) DEFAULT 'desktop',
  browser VARCHAR(255),
  user_agent TEXT,

  -- Timing
  duration INTEGER DEFAULT 0,

  -- Security
  is_suspicious BOOLEAN DEFAULT false,
  threat_level VARCHAR(20) DEFAULT 'none',
  blocked_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for access logs
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_log_code ON access_logs(log_code);
CREATE INDEX IF NOT EXISTS idx_access_logs_access_type ON access_logs(access_type);
CREATE INDEX IF NOT EXISTS idx_access_logs_status ON access_logs(status);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_access_logs_is_suspicious ON access_logs(is_suspicious) WHERE is_suspicious = true;

-- RLS for access logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access logs" ON access_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create access logs" ON access_logs
  FOR INSERT WITH CHECK (true);

-- Auto-generate log code
CREATE OR REPLACE FUNCTION generate_access_log_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.log_code IS NULL OR NEW.log_code = '' THEN
    NEW.log_code := 'LOG-' || LPAD(NEXTVAL('access_log_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS access_log_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_access_log_code
  BEFORE INSERT ON access_logs
  FOR EACH ROW
  EXECUTE FUNCTION generate_access_log_code();

-- =====================================================
-- 3. Activity Logs Table
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_code VARCHAR(50) UNIQUE NOT NULL,

  -- User info
  user_name VARCHAR(255),
  user_email VARCHAR(255),

  -- Activity details
  activity_type VARCHAR(50) NOT NULL DEFAULT 'view',
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(50) NOT NULL DEFAULT 'success',
  action TEXT NOT NULL,

  -- Resource info
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  resource_name VARCHAR(255),

  -- Changes tracking
  changes JSONB DEFAULT '[]',
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',

  -- Technical details
  ip_address VARCHAR(50),
  user_agent TEXT,
  duration INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_code ON activity_logs(activity_code);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_category ON activity_logs(category);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- RLS for activity logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);

-- Auto-generate activity code
CREATE OR REPLACE FUNCTION generate_activity_log_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.activity_code IS NULL OR NEW.activity_code = '' THEN
    NEW.activity_code := 'ACT-' || LPAD(NEXTVAL('activity_log_code_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS activity_log_code_seq START WITH 1000;

CREATE TRIGGER trigger_generate_activity_log_code
  BEFORE INSERT ON activity_logs
  FOR EACH ROW
  EXECUTE FUNCTION generate_activity_log_code();

-- =====================================================
-- Enable Real-time for all tables
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE three_d_models;
ALTER PUBLICATION supabase_realtime ADD TABLE access_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE three_d_models IS 'Stores 3D model projects and their metadata';
COMMENT ON TABLE access_logs IS 'Tracks user access and authentication events';
COMMENT ON TABLE activity_logs IS 'Tracks user activities and changes in the system';
