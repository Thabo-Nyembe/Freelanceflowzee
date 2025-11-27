-- Minimal AI Video Generation Schema
--
-- Comprehensive video generation, templates, and analytics:
-- - Generated Videos with AI models and generation tracking
-- - Video Templates for quick creation
-- - Video Metadata for technical specifications
-- - Generation Settings for user preferences
-- - Video Analytics with engagement metrics
-- - Generation History for status tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS video_style CASCADE;
DROP TYPE IF EXISTS video_format CASCADE;
DROP TYPE IF EXISTS video_quality CASCADE;
DROP TYPE IF EXISTS ai_video_model CASCADE;
DROP TYPE IF EXISTS generation_status CASCADE;
DROP TYPE IF EXISTS video_category CASCADE;

-- Video style
CREATE TYPE video_style AS ENUM (
  'cinematic',
  'professional',
  'casual',
  'animated',
  'explainer',
  'social-media'
);

-- Video format/aspect ratio
CREATE TYPE video_format AS ENUM (
  'landscape',
  'portrait',
  'square',
  'widescreen'
);

-- Video quality
CREATE TYPE video_quality AS ENUM (
  'sd',
  'hd',
  'full-hd',
  '4k'
);

-- AI model for video generation
CREATE TYPE ai_video_model AS ENUM (
  'kazi-ai',
  'runway-gen3',
  'pika-labs',
  'stable-video'
);

-- Generation status
CREATE TYPE generation_status AS ENUM (
  'idle',
  'analyzing',
  'generating',
  'rendering',
  'completed',
  'failed'
);

-- Video category
CREATE TYPE video_category AS ENUM (
  'marketing',
  'tutorial',
  'entertainment',
  'business',
  'education',
  'social'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS generation_history CASCADE;
DROP TABLE IF EXISTS video_analytics CASCADE;
DROP TABLE IF EXISTS generation_settings CASCADE;
DROP TABLE IF EXISTS video_metadata CASCADE;
DROP TABLE IF EXISTS video_templates CASCADE;
DROP TABLE IF EXISTS generated_videos CASCADE;

-- Generated Videos
CREATE TABLE generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style video_style NOT NULL DEFAULT 'professional',
  format video_format NOT NULL DEFAULT 'landscape',
  quality video_quality NOT NULL DEFAULT 'hd',
  ai_model ai_video_model NOT NULL DEFAULT 'kazi-ai',
  status generation_status NOT NULL DEFAULT 'idle',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  video_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category video_category NOT NULL DEFAULT 'marketing',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Video Templates
CREATE TABLE video_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  style video_style NOT NULL DEFAULT 'professional',
  format video_format NOT NULL DEFAULT 'landscape',
  duration INTEGER NOT NULL DEFAULT 30,
  scenes INTEGER NOT NULL DEFAULT 5,
  premium BOOLEAN DEFAULT false,
  category video_category NOT NULL DEFAULT 'marketing',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  price DECIMAL(10, 2) DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Video Metadata
CREATE TABLE video_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE UNIQUE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  fps INTEGER DEFAULT 30,
  codec TEXT NOT NULL DEFAULT 'h264',
  bitrate TEXT NOT NULL DEFAULT '10 Mbps',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  color_space TEXT DEFAULT 'sRGB',
  audio_codec TEXT DEFAULT 'aac',
  audio_bitrate TEXT DEFAULT '192 kbps',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Generation Settings
CREATE TABLE generation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_model ai_video_model NOT NULL DEFAULT 'kazi-ai',
  default_quality video_quality NOT NULL DEFAULT 'hd',
  default_format video_format NOT NULL DEFAULT 'landscape',
  auto_save BOOLEAN DEFAULT true,
  high_quality_previews BOOLEAN DEFAULT true,
  watermark_enabled BOOLEAN DEFAULT false,
  max_concurrent_generations INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Video Analytics
CREATE TABLE video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date)
);

-- Generation History
CREATE TABLE generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  status generation_status NOT NULL,
  progress INTEGER DEFAULT 0,
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- generated_videos indexes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_style ON generated_videos(style);
CREATE INDEX IF NOT EXISTS idx_generated_videos_category ON generated_videos(category);
CREATE INDEX IF NOT EXISTS idx_generated_videos_is_public ON generated_videos(is_public);
CREATE INDEX IF NOT EXISTS idx_generated_videos_tags ON generated_videos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_generated_videos_views ON generated_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_likes ON generated_videos(likes DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_completed_at ON generated_videos(completed_at DESC);

-- video_templates indexes
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_style ON video_templates(style);
CREATE INDEX IF NOT EXISTS idx_video_templates_premium ON video_templates(premium);
CREATE INDEX IF NOT EXISTS idx_video_templates_tags ON video_templates USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_video_templates_usage_count ON video_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_templates_created_at ON video_templates(created_at DESC);

-- video_metadata indexes
CREATE INDEX IF NOT EXISTS idx_video_metadata_video_id ON video_metadata(video_id);

-- generation_settings indexes
CREATE INDEX IF NOT EXISTS idx_generation_settings_user_id ON generation_settings(user_id);

-- video_analytics indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_date ON video_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_video_analytics_views ON video_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_video_analytics_engagement ON video_analytics(engagement_score DESC);

-- generation_history indexes
CREATE INDEX IF NOT EXISTS idx_generation_history_video_id ON generation_history(video_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_status ON generation_history(status);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ai_video_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generated_videos_updated_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

CREATE TRIGGER trigger_video_templates_updated_at
  BEFORE UPDATE ON video_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

CREATE TRIGGER trigger_video_metadata_updated_at
  BEFORE UPDATE ON video_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

CREATE TRIGGER trigger_generation_settings_updated_at
  BEFORE UPDATE ON generation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

CREATE TRIGGER trigger_video_analytics_updated_at
  BEFORE UPDATE ON video_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_video_updated_at();

-- Auto-set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_video_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_video_completed_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION set_video_completed_at();

-- Auto-update video stats from analytics
CREATE OR REPLACE FUNCTION update_video_stats_from_analytics()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE generated_videos
  SET
    views = (
      SELECT COALESCE(SUM(views), 0)
      FROM video_analytics
      WHERE video_id = NEW.video_id
    ),
    likes = (
      SELECT COALESCE(SUM(likes), 0)
      FROM video_analytics
      WHERE video_id = NEW.video_id
    ),
    shares = (
      SELECT COALESCE(SUM(shares), 0)
      FROM video_analytics
      WHERE video_id = NEW.video_id
    ),
    downloads = (
      SELECT COALESCE(SUM(downloads), 0)
      FROM video_analytics
      WHERE video_id = NEW.video_id
    ),
    updated_at = now()
  WHERE id = NEW.video_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_stats
  AFTER INSERT OR UPDATE ON video_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_video_stats_from_analytics();
