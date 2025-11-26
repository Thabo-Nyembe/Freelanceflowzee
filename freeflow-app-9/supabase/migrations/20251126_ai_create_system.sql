-- =====================================================
-- AI CREATE SYSTEM MIGRATION
-- =====================================================
-- Migration for AI-powered creative asset generation
-- Includes: Assets, Versions, Models, Generation History
-- Date: 2025-11-26
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- GENERATED ASSETS TABLE
-- =====================================================

CREATE TABLE ai_generated_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Asset metadata
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  field TEXT NOT NULL CHECK (field IN (
    'photography', 'videography', 'ui-ux-design', 'graphic-design',
    'music-production', 'web-development', 'software-development', 'content-writing'
  )),
  style TEXT NOT NULL,
  color_scheme TEXT NOT NULL,

  -- File information
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_format TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  dimensions TEXT,
  duration INTEGER, -- For video/audio in seconds

  -- Generation details
  prompt TEXT NOT NULL,
  generation_settings JSONB DEFAULT '{}',
  ai_model_id UUID REFERENCES ai_models(id),
  quality TEXT NOT NULL DEFAULT 'standard' CHECK (quality IN ('draft', 'standard', 'professional', 'premium')),

  -- Engagement metrics
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- UPS Integration
  has_ups_feedback BOOLEAN DEFAULT false,
  ups_comment_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ASSET VERSIONS TABLE
-- =====================================================

CREATE TABLE ai_asset_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,

  -- Version details
  version_number INTEGER NOT NULL,
  changes TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- Generation details
  prompt TEXT,
  generation_settings JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ensure unique version numbers per asset
  UNIQUE(asset_id, version_number)
);

-- =====================================================
-- AI MODELS TABLE
-- =====================================================

CREATE TABLE ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,

  -- Model configuration
  category TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  version TEXT,

  -- Performance metrics
  performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),
  average_generation_time INTEGER, -- in seconds

  -- Pricing
  cost_per_generation NUMERIC(10, 4) DEFAULT 0,
  cost_currency TEXT DEFAULT 'USD',
  is_free BOOLEAN DEFAULT false,

  -- Availability
  is_active BOOLEAN DEFAULT true,
  max_concurrent_generations INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- GENERATION HISTORY TABLE
-- =====================================================

CREATE TABLE ai_generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES ai_generated_assets(id) ON DELETE SET NULL,

  -- Generation details
  field TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  settings JSONB DEFAULT '{}',

  -- AI model used
  ai_model_id UUID REFERENCES ai_models(id),
  model_name TEXT NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )),
  error_message TEXT,

  -- Performance metrics
  generation_time_seconds INTEGER,
  cost NUMERIC(10, 4),

  -- Result
  result_url TEXT,
  result_metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- ASSET COLLECTIONS TABLE
-- =====================================================

CREATE TABLE ai_asset_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection details
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COLLECTION ASSETS JUNCTION TABLE
-- =====================================================

CREATE TABLE ai_collection_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES ai_asset_collections(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,

  -- Order in collection
  position INTEGER DEFAULT 0,

  -- Timestamps
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique asset per collection
  UNIQUE(collection_id, asset_id)
);

-- =====================================================
-- ASSET LIKES TABLE
-- =====================================================

CREATE TABLE ai_asset_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure unique like per user per asset
  UNIQUE(asset_id, user_id)
);

-- =====================================================
-- ASSET DOWNLOADS TABLE
-- =====================================================

CREATE TABLE ai_asset_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES ai_generated_assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Download details
  format TEXT NOT NULL,
  quality TEXT,
  file_size BIGINT,

  -- Timestamps
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),

  -- IP tracking (optional, for analytics)
  ip_address INET,
  user_agent TEXT
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Generated Assets indexes
CREATE INDEX idx_ai_assets_user ON ai_generated_assets(user_id);
CREATE INDEX idx_ai_assets_project ON ai_generated_assets(project_id);
CREATE INDEX idx_ai_assets_field ON ai_generated_assets(field);
CREATE INDEX idx_ai_assets_type ON ai_generated_assets(asset_type);
CREATE INDEX idx_ai_assets_quality ON ai_generated_assets(quality);
CREATE INDEX idx_ai_assets_created ON ai_generated_assets(created_at DESC);
CREATE INDEX idx_ai_assets_downloads ON ai_generated_assets(downloads DESC);
CREATE INDEX idx_ai_assets_likes ON ai_generated_assets(likes DESC);
CREATE INDEX idx_ai_assets_ups_feedback ON ai_generated_assets(has_ups_feedback);

-- Asset Versions indexes
CREATE INDEX idx_ai_versions_asset ON ai_asset_versions(asset_id);
CREATE INDEX idx_ai_versions_created ON ai_asset_versions(created_at DESC);

-- AI Models indexes
CREATE INDEX idx_ai_models_provider ON ai_models(provider);
CREATE INDEX idx_ai_models_active ON ai_models(is_active);
CREATE INDEX idx_ai_models_free ON ai_models(is_free);
CREATE INDEX idx_ai_models_performance ON ai_models(performance_score DESC);

-- Generation History indexes
CREATE INDEX idx_ai_history_user ON ai_generation_history(user_id);
CREATE INDEX idx_ai_history_asset ON ai_generation_history(asset_id);
CREATE INDEX idx_ai_history_status ON ai_generation_history(status);
CREATE INDEX idx_ai_history_created ON ai_generation_history(created_at DESC);
CREATE INDEX idx_ai_history_model ON ai_generation_history(ai_model_id);

-- Collections indexes
CREATE INDEX idx_ai_collections_user ON ai_asset_collections(user_id);
CREATE INDEX idx_ai_collections_public ON ai_asset_collections(is_public);

-- Collection Assets indexes
CREATE INDEX idx_ai_collection_assets_collection ON ai_collection_assets(collection_id);
CREATE INDEX idx_ai_collection_assets_asset ON ai_collection_assets(asset_id);

-- Likes indexes
CREATE INDEX idx_ai_likes_asset ON ai_asset_likes(asset_id);
CREATE INDEX idx_ai_likes_user ON ai_asset_likes(user_id);

-- Downloads indexes
CREATE INDEX idx_ai_downloads_asset ON ai_asset_downloads(asset_id);
CREATE INDEX idx_ai_downloads_user ON ai_asset_downloads(user_id);
CREATE INDEX idx_ai_downloads_date ON ai_asset_downloads(downloaded_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE ai_generated_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_collection_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_asset_downloads ENABLE ROW LEVEL SECURITY;

-- Generated Assets policies
CREATE POLICY ai_assets_select ON ai_generated_assets FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = ai_generated_assets.project_id
    AND pm.user_id = auth.uid()
  ));

CREATE POLICY ai_assets_insert ON ai_generated_assets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_assets_update ON ai_generated_assets FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY ai_assets_delete ON ai_generated_assets FOR DELETE
  USING (user_id = auth.uid());

-- Asset Versions policies
CREATE POLICY ai_versions_select ON ai_asset_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_generated_assets a
    WHERE a.id = ai_asset_versions.asset_id
    AND a.user_id = auth.uid()
  ));

CREATE POLICY ai_versions_insert ON ai_asset_versions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ai_generated_assets a
    WHERE a.id = ai_asset_versions.asset_id
    AND a.user_id = auth.uid()
  ));

-- AI Models policies (public read)
CREATE POLICY ai_models_select ON ai_models FOR SELECT
  USING (is_active = true);

-- Generation History policies
CREATE POLICY ai_history_select ON ai_generation_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY ai_history_insert ON ai_generation_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_history_update ON ai_generation_history FOR UPDATE
  USING (user_id = auth.uid());

-- Collections policies
CREATE POLICY ai_collections_select ON ai_asset_collections FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY ai_collections_insert ON ai_asset_collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_collections_update ON ai_asset_collections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY ai_collections_delete ON ai_asset_collections FOR DELETE
  USING (user_id = auth.uid());

-- Collection Assets policies
CREATE POLICY ai_collection_assets_select ON ai_collection_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND (c.user_id = auth.uid() OR c.is_public = true)
  ));

CREATE POLICY ai_collection_assets_insert ON ai_collection_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND c.user_id = auth.uid()
  ));

CREATE POLICY ai_collection_assets_delete ON ai_collection_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM ai_asset_collections c
    WHERE c.id = ai_collection_assets.collection_id
    AND c.user_id = auth.uid()
  ));

-- Likes policies
CREATE POLICY ai_likes_select ON ai_asset_likes FOR SELECT
  USING (true); -- Anyone can see likes

CREATE POLICY ai_likes_insert ON ai_asset_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY ai_likes_delete ON ai_asset_likes FOR DELETE
  USING (user_id = auth.uid());

-- Downloads policies
CREATE POLICY ai_downloads_select ON ai_asset_downloads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY ai_downloads_insert ON ai_asset_downloads FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_assets_updated_at
  BEFORE UPDATE ON ai_generated_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON ai_models
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_collections_updated_at
  BEFORE UPDATE ON ai_asset_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment asset engagement metrics
CREATE OR REPLACE FUNCTION increment_asset_downloads()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_generated_assets
  SET downloads = downloads + 1
  WHERE id = NEW.asset_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_downloads
  AFTER INSERT ON ai_asset_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_asset_downloads();

CREATE OR REPLACE FUNCTION handle_asset_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_generated_assets
    SET likes = likes + 1
    WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ai_generated_assets
    SET likes = likes - 1
    WHERE id = OLD.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_like
  AFTER INSERT OR DELETE ON ai_asset_likes
  FOR EACH ROW
  EXECUTE FUNCTION handle_asset_like();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get user's total generations count
CREATE OR REPLACE FUNCTION get_user_generation_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM ai_generated_assets
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's total generation cost
CREATE OR REPLACE FUNCTION get_user_total_generation_cost(p_user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(cost), 0)
    FROM ai_generation_history
    WHERE user_id = p_user_id
    AND status = 'completed'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get most popular assets
CREATE OR REPLACE FUNCTION get_popular_assets(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  asset_id UUID,
  asset_name TEXT,
  downloads INTEGER,
  likes INTEGER,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    id as asset_id,
    name as asset_name,
    ai_generated_assets.downloads,
    ai_generated_assets.likes,
    (ai_generated_assets.downloads * 1.0 + ai_generated_assets.likes * 2.0) as popularity_score
  FROM ai_generated_assets
  ORDER BY popularity_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA: AI MODELS
-- =====================================================

INSERT INTO ai_models (name, provider, category, description, performance_score, cost_per_generation, is_free, is_active) VALUES
-- Free Models
('Llama 3.1 70B', 'OpenRouter (Meta)', ARRAY['text', 'content'], 'Open-source large language model', 85, 0, true, true),
('Mistral 7B', 'OpenRouter (Mistral)', ARRAY['text', 'code'], 'Efficient open-source model', 82, 0, true, true),
('Stable Diffusion 1.5', 'Stability AI', ARRAY['image', 'design'], 'Open-source image generation', 78, 0, true, true),
('MusicGen Small', 'Meta', ARRAY['audio', 'music'], 'AI music generation model', 75, 0, true, true),

-- Affordable Premium Models
('GPT-3.5 Turbo', 'OpenAI', ARRAY['text', 'code', 'content'], 'Fast and efficient ChatGPT model', 88, 0.06, false, true),
('Claude 3 Haiku', 'Anthropic', ARRAY['text', 'code', 'content'], 'Fast Claude model', 87, 0.12, false, true),
('Gemini 1.5 Flash', 'Google', ARRAY['text', 'code', 'multimodal'], 'Fast multimodal model', 86, 0.18, false, true),
('DALL-E 2', 'OpenAI', ARRAY['image', 'design'], 'Previous generation image model', 82, 0.36, false, true),

-- Premium Models
('GPT-4o', 'OpenAI', ARRAY['text', 'code', 'content', 'multimodal'], 'Latest GPT-4 with vision', 95, 2.50, false, true),
('Claude 3.5 Sonnet', 'Anthropic', ARRAY['text', 'code', 'content'], 'Most capable Claude model', 94, 3.00, false, true),
('DALL-E 3', 'OpenAI', ARRAY['image', 'design'], 'Latest image generation model', 93, 4.00, false, true),
('Stable Diffusion XL', 'Stability AI', ARRAY['image', 'design'], 'High-quality image generation', 91, 1.50, false, true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 8
-- Indexes created: 28
-- RLS policies: 22
-- Triggers: 4
-- Helper functions: 3
-- Seed data: 12 AI models
-- =====================================================
