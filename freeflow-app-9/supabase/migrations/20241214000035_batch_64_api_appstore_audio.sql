-- Batch 64: API Endpoints, App Store, Audio Studio
-- Tables for api-v2, app-store-v2, audio-studio-v2

-- =====================================================
-- API ENDPOINTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS api_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint_code VARCHAR(20) UNIQUE DEFAULT ('END-' || LPAD(nextval('api_endpoints_seq')::text, 6, '0')),

  -- Endpoint Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  method VARCHAR(10) NOT NULL DEFAULT 'GET', -- GET, POST, PUT, PATCH, DELETE
  path VARCHAR(500) NOT NULL,
  version VARCHAR(20) DEFAULT 'v1',

  -- Configuration
  is_public BOOLEAN DEFAULT false,
  is_deprecated BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_hour INTEGER DEFAULT 1000,
  timeout_ms INTEGER DEFAULT 30000,

  -- Documentation
  request_schema JSONB DEFAULT '{}',
  response_schema JSONB DEFAULT '{}',
  example_request JSONB DEFAULT '{}',
  example_response JSONB DEFAULT '{}',

  -- Analytics
  total_requests BIGINT DEFAULT 0,
  requests_today INTEGER DEFAULT 0,
  requests_this_month INTEGER DEFAULT 0,
  avg_latency_ms DECIMAL(10,2) DEFAULT 0,
  p95_latency_ms DECIMAL(10,2) DEFAULT 0,
  p99_latency_ms DECIMAL(10,2) DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100,

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, deprecated, maintenance
  last_called_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for endpoint codes
CREATE SEQUENCE IF NOT EXISTS api_endpoints_seq START 1;

-- =====================================================
-- APP STORE APPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS store_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_code VARCHAR(20) UNIQUE DEFAULT ('APP-' || LPAD(nextval('store_apps_seq')::text, 6, '0')),

  -- App Info
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(500),
  description TEXT,
  developer VARCHAR(255),
  icon_url TEXT,
  banner_url TEXT,
  screenshots TEXT[] DEFAULT '{}',

  -- Categorization
  category VARCHAR(50) DEFAULT 'utilities', -- business, productivity, creative, finance, education, utilities, developer, social
  subcategory VARCHAR(50),

  -- Pricing
  pricing_type VARCHAR(20) DEFAULT 'free', -- free, freemium, paid, subscription, enterprise
  price DECIMAL(10,2) DEFAULT 0,
  price_currency VARCHAR(3) DEFAULT 'USD',
  trial_days INTEGER DEFAULT 0,

  -- Installation Status (per user)
  status VARCHAR(20) DEFAULT 'available', -- installed, available, updating, trial, suspended
  installed_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,

  -- Version Info
  version VARCHAR(20) DEFAULT '1.0.0',
  min_version VARCHAR(20),
  size_bytes BIGINT DEFAULT 0,
  release_date DATE,
  last_updated DATE,

  -- Stats
  downloads INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,

  -- Features & Compatibility
  features TEXT[] DEFAULT '{}',
  permissions TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}', -- Web, iOS, Android, Desktop
  languages INTEGER DEFAULT 1,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for app codes
CREATE SEQUENCE IF NOT EXISTS store_apps_seq START 1;

-- =====================================================
-- APP REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS app_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES store_apps(id) ON DELETE CASCADE,

  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  reported BOOLEAN DEFAULT false,

  -- Response
  developer_response TEXT,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  UNIQUE(user_id, app_id)
);

-- =====================================================
-- AUDIO TRACKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_code VARCHAR(20) UNIQUE DEFAULT ('AUD-' || LPAD(nextval('audio_tracks_seq')::text, 6, '0')),

  -- Track Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  artist VARCHAR(255),
  album VARCHAR(255),
  genre VARCHAR(100),

  -- File Info
  file_url TEXT,
  file_name VARCHAR(255),
  file_size_bytes BIGINT DEFAULT 0,
  format VARCHAR(20) DEFAULT 'mp3', -- mp3, wav, flac, aac, ogg
  quality VARCHAR(20) DEFAULT 'high', -- low, medium, high, studio, lossless

  -- Audio Properties
  duration_seconds INTEGER DEFAULT 0,
  sample_rate INTEGER DEFAULT 44100,
  bit_rate INTEGER DEFAULT 128,
  channels INTEGER DEFAULT 2,

  -- Waveform
  waveform_url TEXT,
  waveform_data JSONB DEFAULT '{}',

  -- Processing
  is_processed BOOLEAN DEFAULT false,
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  processing_progress INTEGER DEFAULT 0,
  effects_applied TEXT[] DEFAULT '{}',

  -- Project
  project_id UUID,
  track_order INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for track codes
CREATE SEQUENCE IF NOT EXISTS audio_tracks_seq START 1;

-- =====================================================
-- AUDIO PROJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_code VARCHAR(20) UNIQUE DEFAULT ('PRJ-' || LPAD(nextval('audio_projects_seq')::text, 6, '0')),

  -- Project Info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Settings
  sample_rate INTEGER DEFAULT 44100,
  bit_depth INTEGER DEFAULT 16,
  channels INTEGER DEFAULT 2,

  -- Duration
  total_duration_seconds INTEGER DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, in_progress, completed, archived

  -- Export
  export_format VARCHAR(20),
  export_url TEXT,
  exported_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for project codes
CREATE SEQUENCE IF NOT EXISTS audio_projects_seq START 1;

-- =====================================================
-- AUDIO EFFECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audio_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,

  -- Effect Info
  effect_type VARCHAR(50) NOT NULL, -- normalize, noise_reduction, voice_enhance, trim_silence, eq, compression, reverb
  name VARCHAR(100),

  -- Parameters
  parameters JSONB DEFAULT '{}',

  -- Order
  effect_order INTEGER DEFAULT 0,

  -- Status
  is_applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- API Endpoints indexes
CREATE INDEX IF NOT EXISTS idx_api_endpoints_user ON api_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_method ON api_endpoints(method);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_status ON api_endpoints(status);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_path ON api_endpoints(path);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_deleted ON api_endpoints(deleted_at) WHERE deleted_at IS NULL;

-- Store Apps indexes
CREATE INDEX IF NOT EXISTS idx_store_apps_user ON store_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_store_apps_category ON store_apps(category);
CREATE INDEX IF NOT EXISTS idx_store_apps_status ON store_apps(status);
CREATE INDEX IF NOT EXISTS idx_store_apps_pricing ON store_apps(pricing_type);
CREATE INDEX IF NOT EXISTS idx_store_apps_rating ON store_apps(rating DESC);
CREATE INDEX IF NOT EXISTS idx_store_apps_downloads ON store_apps(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_store_apps_deleted ON store_apps(deleted_at) WHERE deleted_at IS NULL;

-- App Reviews indexes
CREATE INDEX IF NOT EXISTS idx_app_reviews_user ON app_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_app ON app_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_app_reviews_rating ON app_reviews(rating);

-- Audio Tracks indexes
CREATE INDEX IF NOT EXISTS idx_audio_tracks_user ON audio_tracks(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_project ON audio_tracks(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_format ON audio_tracks(format);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_status ON audio_tracks(processing_status);
CREATE INDEX IF NOT EXISTS idx_audio_tracks_deleted ON audio_tracks(deleted_at) WHERE deleted_at IS NULL;

-- Audio Projects indexes
CREATE INDEX IF NOT EXISTS idx_audio_projects_user ON audio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_projects_status ON audio_projects(status);
CREATE INDEX IF NOT EXISTS idx_audio_projects_deleted ON audio_projects(deleted_at) WHERE deleted_at IS NULL;

-- Audio Effects indexes
CREATE INDEX IF NOT EXISTS idx_audio_effects_track ON audio_effects(track_id);
CREATE INDEX IF NOT EXISTS idx_audio_effects_type ON audio_effects(effect_type);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_effects ENABLE ROW LEVEL SECURITY;

-- API Endpoints policies
CREATE POLICY "Users can view own endpoints" ON api_endpoints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own endpoints" ON api_endpoints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own endpoints" ON api_endpoints FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own endpoints" ON api_endpoints FOR DELETE USING (auth.uid() = user_id);

-- Store Apps policies (can view all, manage own installations)
CREATE POLICY "Users can view all apps" ON store_apps FOR SELECT USING (true);
CREATE POLICY "Users can manage own app installations" ON store_apps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can install apps" ON store_apps FOR INSERT WITH CHECK (auth.uid() = user_id);

-- App Reviews policies
CREATE POLICY "Users can view all reviews" ON app_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create own reviews" ON app_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON app_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON app_reviews FOR DELETE USING (auth.uid() = user_id);

-- Audio Tracks policies
CREATE POLICY "Users can view own tracks" ON audio_tracks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tracks" ON audio_tracks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracks" ON audio_tracks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracks" ON audio_tracks FOR DELETE USING (auth.uid() = user_id);

-- Audio Projects policies
CREATE POLICY "Users can view own projects" ON audio_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON audio_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON audio_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON audio_projects FOR DELETE USING (auth.uid() = user_id);

-- Audio Effects policies
CREATE POLICY "Users can manage effects on own tracks" ON audio_effects FOR ALL USING (
  EXISTS (SELECT 1 FROM audio_tracks WHERE audio_tracks.id = audio_effects.track_id AND audio_tracks.user_id = auth.uid())
);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_api_endpoints_updated_at BEFORE UPDATE ON api_endpoints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_apps_updated_at BEFORE UPDATE ON store_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_reviews_updated_at BEFORE UPDATE ON app_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_tracks_updated_at BEFORE UPDATE ON audio_tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audio_projects_updated_at BEFORE UPDATE ON audio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update app rating when review is added/updated
CREATE OR REPLACE FUNCTION update_app_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE store_apps
  SET
    rating = (SELECT AVG(rating)::DECIMAL(2,1) FROM app_reviews WHERE app_id = COALESCE(NEW.app_id, OLD.app_id) AND deleted_at IS NULL),
    reviews_count = (SELECT COUNT(*) FROM app_reviews WHERE app_id = COALESCE(NEW.app_id, OLD.app_id) AND deleted_at IS NULL)
  WHERE id = COALESCE(NEW.app_id, OLD.app_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_rating_on_review AFTER INSERT OR UPDATE OR DELETE ON app_reviews
  FOR EACH ROW EXECUTE FUNCTION update_app_rating();

-- Update project duration when track is added/updated
CREATE OR REPLACE FUNCTION update_project_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    UPDATE audio_projects
    SET total_duration_seconds = (
      SELECT COALESCE(SUM(duration_seconds), 0)
      FROM audio_tracks
      WHERE project_id = NEW.project_id AND deleted_at IS NULL
    )
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_duration_on_track AFTER INSERT OR UPDATE ON audio_tracks
  FOR EACH ROW EXECUTE FUNCTION update_project_duration();
