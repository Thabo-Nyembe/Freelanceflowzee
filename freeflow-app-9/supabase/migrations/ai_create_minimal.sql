-- Minimal AI Create Schema
--
-- Creative asset generation and management:
-- - Generated assets (creations with metadata)
-- - Generation history and tracking
-- - Asset library/favorites
-- - User preferences and settings

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS creative_field CASCADE;
DROP TYPE IF EXISTS asset_type_enum CASCADE;
DROP TYPE IF EXISTS asset_format CASCADE;
DROP TYPE IF EXISTS generation_status CASCADE;
DROP TYPE IF EXISTS style_preset CASCADE;
DROP TYPE IF EXISTS color_scheme CASCADE;

-- Creative fields
CREATE TYPE creative_field AS ENUM (
  'photography',
  'videography',
  'ui-ux-design',
  'graphic-design',
  'music-production',
  'web-development',
  'software-development',
  'content-writing'
);

-- Asset types (general categories)
CREATE TYPE asset_type_enum AS ENUM (
  'luts',
  'presets',
  'actions',
  'overlays',
  'templates',
  'filters',
  'transitions',
  'effects',
  'figma-components',
  'wireframes',
  'prototypes',
  'design-systems',
  'mockups',
  'style-guides',
  'color-schemes',
  'patterns',
  'icons',
  'illustrations',
  'synth-presets',
  'samples',
  'midi',
  'mixing',
  'components',
  'themes',
  'snippets',
  'apis',
  'boilerplates',
  'algorithms',
  'architectures',
  'testing',
  'documentation',
  'devops',
  'database',
  'articles',
  'social',
  'copy',
  'scripts',
  'seo',
  'technical'
);

-- Asset formats
CREATE TYPE asset_format AS ENUM (
  'png',
  'jpg',
  'svg',
  'pdf',
  'psd',
  'ai',
  'fig',
  'sketch',
  'xd',
  'mp4',
  'mov',
  'avi',
  'mp3',
  'wav',
  'midi',
  'js',
  'ts',
  'jsx',
  'tsx',
  'css',
  'html',
  'json',
  'md',
  'txt',
  'zip'
);

-- Generation status
CREATE TYPE generation_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- Style presets
CREATE TYPE style_preset AS ENUM (
  'modern',
  'vintage',
  'minimalist',
  'bold',
  'elegant',
  'playful',
  'professional',
  'artistic'
);

-- Color schemes
CREATE TYPE color_scheme AS ENUM (
  'vibrant',
  'muted',
  'monochrome',
  'pastel',
  'dark',
  'light',
  'warm',
  'cool'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ai_create_favorites CASCADE;
DROP TABLE IF EXISTS ai_create_generations CASCADE;
DROP TABLE IF EXISTS ai_create_assets CASCADE;
DROP TABLE IF EXISTS ai_create_preferences CASCADE;

-- AI Create Assets (generated creations)
CREATE TABLE ai_create_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  creative_field creative_field NOT NULL,
  asset_type asset_type_enum NOT NULL,
  format asset_format NOT NULL,
  file_size BIGINT, -- bytes
  file_url TEXT,
  preview_url TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  style style_preset,
  color_scheme color_scheme,
  custom_prompt TEXT,
  model_used TEXT,
  generation_params JSONB DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generation history (tracks all generation attempts)
CREATE TABLE ai_create_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creative_field creative_field NOT NULL,
  asset_type asset_type_enum NOT NULL,
  style style_preset,
  color_scheme color_scheme,
  custom_prompt TEXT,
  model_used TEXT NOT NULL,
  batch_mode BOOLEAN DEFAULT false,
  assets_requested INTEGER DEFAULT 1,
  assets_generated INTEGER DEFAULT 0,
  status generation_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  generation_time_ms INTEGER,
  input_file_url TEXT,
  generation_params JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- User preferences/settings
CREATE TABLE ai_create_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_model TEXT DEFAULT 'openrouter/mistral-7b-instruct-free',
  default_style style_preset DEFAULT 'modern',
  default_color_scheme color_scheme DEFAULT 'vibrant',
  batch_mode_enabled BOOLEAN DEFAULT false,
  auto_save_enabled BOOLEAN DEFAULT true,
  quality_preset TEXT DEFAULT 'balanced',
  favorite_fields creative_field[] DEFAULT ARRAY[]::creative_field[],
  recent_prompts TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Favorites (many-to-many for easy querying)
CREATE TABLE ai_create_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES ai_create_assets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ai_create_assets indexes
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_user_id ON ai_create_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_creative_field ON ai_create_assets(creative_field);
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_asset_type ON ai_create_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_is_favorite ON ai_create_assets(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_created_at ON ai_create_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_tags ON ai_create_assets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_ai_create_assets_download_count ON ai_create_assets(download_count DESC);

-- ai_create_generations indexes
CREATE INDEX IF NOT EXISTS idx_ai_create_generations_user_id ON ai_create_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_create_generations_status ON ai_create_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_create_generations_creative_field ON ai_create_generations(creative_field);
CREATE INDEX IF NOT EXISTS idx_ai_create_generations_created_at ON ai_create_generations(created_at DESC);

-- ai_create_preferences indexes
CREATE INDEX IF NOT EXISTS idx_ai_create_preferences_user_id ON ai_create_preferences(user_id);

-- ai_create_favorites indexes
CREATE INDEX IF NOT EXISTS idx_ai_create_favorites_user_id ON ai_create_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_create_favorites_asset_id ON ai_create_favorites(asset_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_create_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ai_create_assets_updated_at
  BEFORE UPDATE ON ai_create_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_create_updated_at();

CREATE TRIGGER trigger_ai_create_preferences_updated_at
  BEFORE UPDATE ON ai_create_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_create_updated_at();

-- Auto-update generation completed_at
CREATE OR REPLACE FUNCTION update_generation_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('completed', 'failed') AND OLD.status NOT IN ('completed', 'failed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generation_completed_at
  BEFORE UPDATE ON ai_create_generations
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_generation_completed_at();

-- Sync favorites
CREATE OR REPLACE FUNCTION sync_asset_favorite()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ai_create_assets SET is_favorite = true WHERE id = NEW.asset_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ai_create_assets SET is_favorite = false WHERE id = OLD.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_asset_favorite
  AFTER INSERT OR DELETE ON ai_create_favorites
  FOR EACH ROW
  EXECUTE FUNCTION sync_asset_favorite();
