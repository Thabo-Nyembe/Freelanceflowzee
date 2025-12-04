-- Drop types from AI Video Generation
DROP TYPE IF EXISTS video_style CASCADE;
DROP TYPE IF EXISTS video_format CASCADE;
DROP TYPE IF EXISTS video_quality CASCADE;
DROP TYPE IF EXISTS ai_model CASCADE;
DROP TYPE IF EXISTS generation_status CASCADE;
DROP TYPE IF EXISTS video_category CASCADE;

-- ============================================================================
-- AI VIDEO GENERATION SYSTEM - SUPABASE MIGRATION
-- Complete video generation, templates, and analytics
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE video_style AS ENUM (
  'cinematic',
  'professional',
  'casual',
  'animated',
  'explainer',
  'social-media'
);

CREATE TYPE video_format AS ENUM (
  'landscape',
  'portrait',
  'square',
  'widescreen'
);

CREATE TYPE video_quality AS ENUM (
  'sd',
  'hd',
  'full-hd',
  '4k'
);

CREATE TYPE ai_model AS ENUM (
  'kazi-ai',
  'runway-gen3',
  'pika-labs',
  'stable-video'
);

CREATE TYPE generation_status AS ENUM (
  'idle',
  'analyzing',
  'generating',
  'rendering',
  'completed',
  'failed'
);

CREATE TYPE video_category AS ENUM (
  'marketing',
  'tutorial',
  'entertainment',
  'business',
  'education',
  'social'
);

-- ============================================================================
-- TABLE: generated_videos
-- ============================================================================

CREATE TABLE IF NOT EXISTS generated_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  style video_style NOT NULL DEFAULT 'professional',
  format video_format NOT NULL DEFAULT 'landscape',
  quality video_quality NOT NULL DEFAULT 'hd',
  ai_model ai_model NOT NULL DEFAULT 'kazi-ai',
  status generation_status NOT NULL DEFAULT 'idle',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  video_url TEXT,
  thumbnail_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  file_size BIGINT DEFAULT 0, -- in bytes
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

-- ============================================================================
-- TABLE: video_metadata
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  fps INTEGER DEFAULT 30,
  codec TEXT NOT NULL DEFAULT 'h264',
  bitrate TEXT NOT NULL DEFAULT '10 Mbps',
  aspect_ratio TEXT NOT NULL DEFAULT '16:9',
  color_space TEXT DEFAULT 'sRGB',
  audio_codec TEXT DEFAULT 'aac',
  audio_bitrate TEXT DEFAULT '192 kbps',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_templates (
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

-- ============================================================================
-- TABLE: generation_settings
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  default_model ai_model NOT NULL DEFAULT 'kazi-ai',
  default_quality video_quality NOT NULL DEFAULT 'hd',
  default_format video_format NOT NULL DEFAULT 'landscape',
  auto_save BOOLEAN DEFAULT true,
  high_quality_previews BOOLEAN DEFAULT true,
  watermark_enabled BOOLEAN DEFAULT false,
  max_concurrent_generations INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  avg_watch_time INTEGER DEFAULT 0, -- in seconds
  completion_rate DECIMAL(5, 2) DEFAULT 0, -- 0-100
  engagement_score DECIMAL(5, 2) DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date)
);

-- ============================================================================
-- TABLE: video_analytics_devices
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  desktop_views INTEGER DEFAULT 0,
  mobile_views INTEGER DEFAULT 0,
  tablet_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date)
);

-- ============================================================================
-- TABLE: video_analytics_countries
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_analytics_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, date, country_code)
);

-- ============================================================================
-- TABLE: generation_history
-- ============================================================================

CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  status generation_status NOT NULL,
  progress INTEGER DEFAULT 0,
  message TEXT,
  error_details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_shares
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL, -- 'email', 'twitter', 'facebook', 'linkedin', 'whatsapp'
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: video_likes
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(video_id, user_id)
);

-- ============================================================================
-- TABLE: video_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- generated_videos indexes
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_id ON generated_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_status ON generated_videos(status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_quality ON generated_videos(quality);
CREATE INDEX IF NOT EXISTS idx_generated_videos_category ON generated_videos(category);
CREATE INDEX IF NOT EXISTS idx_generated_videos_is_public ON generated_videos(is_public);
CREATE INDEX IF NOT EXISTS idx_generated_videos_created_at ON generated_videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_views ON generated_videos(views DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_downloads ON generated_videos(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_likes ON generated_videos(likes DESC);
CREATE INDEX IF NOT EXISTS idx_generated_videos_tags ON generated_videos USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_generated_videos_title_trgm ON generated_videos USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generated_videos_prompt_trgm ON generated_videos USING gin(prompt gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_status ON generated_videos(user_id, status);
CREATE INDEX IF NOT EXISTS idx_generated_videos_user_category ON generated_videos(user_id, category);

-- video_metadata indexes
CREATE INDEX IF NOT EXISTS idx_video_metadata_video_id ON video_metadata(video_id);

-- video_templates indexes
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_premium ON video_templates(premium);
CREATE INDEX IF NOT EXISTS idx_video_templates_usage_count ON video_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_templates_tags ON video_templates USING gin(tags);

-- generation_settings indexes
CREATE INDEX IF NOT EXISTS idx_generation_settings_user_id ON generation_settings(user_id);

-- video_analytics indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_id ON video_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_date ON video_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_video_analytics_video_date ON video_analytics(video_id, date);

-- video_analytics_devices indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_devices_video_id ON video_analytics_devices(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_devices_date ON video_analytics_devices(date DESC);

-- video_analytics_countries indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_video_id ON video_analytics_countries(video_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_country ON video_analytics_countries(country_code);
CREATE INDEX IF NOT EXISTS idx_video_analytics_countries_date ON video_analytics_countries(date DESC);

-- generation_history indexes
CREATE INDEX IF NOT EXISTS idx_generation_history_video_id ON generation_history(video_id);
CREATE INDEX IF NOT EXISTS idx_generation_history_created_at ON generation_history(created_at DESC);

-- video_shares indexes
CREATE INDEX IF NOT EXISTS idx_video_shares_video_id ON video_shares(video_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_user_id ON video_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_platform ON video_shares(platform);
CREATE INDEX IF NOT EXISTS idx_video_shares_shared_at ON video_shares(shared_at DESC);

-- video_likes indexes
CREATE INDEX IF NOT EXISTS idx_video_likes_video_id ON video_likes(video_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_user_id ON video_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_video_likes_liked_at ON video_likes(liked_at DESC);

-- video_comments indexes
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_id ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_parent_id ON video_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;

-- generated_videos policies
CREATE POLICY "Users can view their own videos"
  ON generated_videos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public videos"
  ON generated_videos FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own videos"
  ON generated_videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON generated_videos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON generated_videos FOR DELETE
  USING (auth.uid() = user_id);

-- video_metadata policies
CREATE POLICY "Users can view metadata for their videos"
  ON video_metadata FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_metadata.video_id
    AND (generated_videos.user_id = auth.uid() OR generated_videos.is_public = true)
  ));

CREATE POLICY "Users can create metadata for their videos"
  ON video_metadata FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_metadata.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_templates policies (public read)
CREATE POLICY "Anyone can view templates"
  ON video_templates FOR SELECT
  TO authenticated
  USING (true);

-- generation_settings policies
CREATE POLICY "Users can view their own settings"
  ON generation_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own settings"
  ON generation_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON generation_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- video_analytics policies
CREATE POLICY "Users can view analytics for their videos"
  ON video_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_analytics_devices policies
CREATE POLICY "Users can view device analytics for their videos"
  ON video_analytics_devices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics_devices.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_analytics_countries policies
CREATE POLICY "Users can view country analytics for their videos"
  ON video_analytics_countries FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_analytics_countries.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- generation_history policies
CREATE POLICY "Users can view history for their videos"
  ON generation_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = generation_history.video_id
    AND generated_videos.user_id = auth.uid()
  ));

-- video_shares policies
CREATE POLICY "Users can view their own shares"
  ON video_shares FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create shares"
  ON video_shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- video_likes policies
CREATE POLICY "Users can view likes"
  ON video_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create likes"
  ON video_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON video_likes FOR DELETE
  USING (auth.uid() = user_id);

-- video_comments policies
CREATE POLICY "Users can view comments on accessible videos"
  ON video_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM generated_videos
    WHERE generated_videos.id = video_comments.video_id
    AND (generated_videos.user_id = auth.uid() OR generated_videos.is_public = true)
  ));

CREATE POLICY "Users can create comments"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON video_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON video_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_templates_updated_at
  BEFORE UPDATE ON video_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_settings_updated_at
  BEFORE UPDATE ON generation_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_comments_updated_at
  BEFORE UPDATE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION set_video_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_generated_videos_completed_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION set_video_completed_at();

-- Update video likes count
CREATE OR REPLACE FUNCTION update_video_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE generated_videos
    SET likes = likes + 1
    WHERE id = NEW.video_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE generated_videos
    SET likes = GREATEST(0, likes - 1)
    WHERE id = OLD.video_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_likes_count
  AFTER INSERT OR DELETE ON video_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_video_likes_count();

-- Update video shares count
CREATE OR REPLACE FUNCTION update_video_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE generated_videos
  SET shares = shares + 1
  WHERE id = NEW.video_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_video_shares_count
  AFTER INSERT ON video_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_video_shares_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's videos with stats
CREATE OR REPLACE FUNCTION get_user_videos_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  status generation_status,
  quality video_quality,
  duration INTEGER,
  views INTEGER,
  downloads INTEGER,
  likes INTEGER,
  shares INTEGER,
  engagement_score DECIMAL,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.status,
    v.quality,
    v.duration,
    v.views,
    v.downloads,
    v.likes,
    v.shares,
    ROUND(
      (v.views::DECIMAL / NULLIF(GREATEST(v.views, v.downloads, v.likes, v.shares), 0)) * 100,
      2
    ) as engagement_score,
    v.created_at
  FROM generated_videos v
  WHERE v.user_id = p_user_id
  ORDER BY v.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get popular videos
CREATE OR REPLACE FUNCTION get_popular_videos(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  views INTEGER,
  likes INTEGER,
  thumbnail_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.views,
    v.likes,
    v.thumbnail_url
  FROM generated_videos v
  WHERE v.is_public = true
    AND v.status = 'completed'
  ORDER BY v.views DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get trending videos (high engagement in last 30 days)
CREATE OR REPLACE FUNCTION get_trending_videos(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  views INTEGER,
  likes INTEGER,
  shares INTEGER,
  engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.views,
    v.likes,
    v.shares,
    ROUND(
      ((v.views + v.downloads * 2 + v.likes * 3 + v.shares * 5)::DECIMAL /
       NULLIF(GREATEST(v.views, 1), 0)) * 100,
      2
    ) as engagement_score
  FROM generated_videos v
  WHERE v.is_public = true
    AND v.status = 'completed'
    AND v.created_at >= now() - INTERVAL '30 days'
  ORDER BY engagement_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get video analytics summary
CREATE OR REPLACE FUNCTION get_video_analytics_summary(p_video_id UUID)
RETURNS TABLE (
  total_views INTEGER,
  unique_views INTEGER,
  total_downloads INTEGER,
  total_shares INTEGER,
  total_likes INTEGER,
  avg_watch_time INTEGER,
  avg_completion_rate DECIMAL,
  avg_engagement_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(views), 0)::INTEGER as total_views,
    COALESCE(SUM(unique_views), 0)::INTEGER as unique_views,
    COALESCE(SUM(downloads), 0)::INTEGER as total_downloads,
    COALESCE(SUM(shares), 0)::INTEGER as total_shares,
    COALESCE(SUM(likes), 0)::INTEGER as total_likes,
    COALESCE(AVG(avg_watch_time), 0)::INTEGER as avg_watch_time,
    COALESCE(AVG(completion_rate), 0)::DECIMAL as avg_completion_rate,
    COALESCE(AVG(engagement_score), 0)::DECIMAL as avg_engagement_score
  FROM video_analytics
  WHERE video_id = p_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search videos with full-text search
CREATE OR REPLACE FUNCTION search_user_videos(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  prompt TEXT,
  status generation_status,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.prompt,
    v.status,
    v.thumbnail_url,
    v.created_at
  FROM generated_videos v
  WHERE v.user_id = p_user_id
    AND (
      v.title ILIKE '%' || p_search_term || '%'
      OR v.prompt ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(v.tags)
    )
  ORDER BY v.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate user's total storage used
CREATE OR REPLACE FUNCTION calculate_user_video_storage(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  total_storage BIGINT;
BEGIN
  SELECT COALESCE(SUM(file_size), 0)
  INTO total_storage
  FROM generated_videos
  WHERE user_id = p_user_id
    AND status = 'completed';

  RETURN total_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user generation statistics
CREATE OR REPLACE FUNCTION get_user_generation_stats(p_user_id UUID)
RETURNS TABLE (
  total_videos INTEGER,
  completed_videos INTEGER,
  generating_videos INTEGER,
  failed_videos INTEGER,
  completion_rate DECIMAL,
  total_duration INTEGER,
  total_storage BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER as total_videos,
    COUNT(*) FILTER (WHERE status = 'completed')::INTEGER as completed_videos,
    COUNT(*) FILTER (WHERE status = 'generating')::INTEGER as generating_videos,
    COUNT(*) FILTER (WHERE status = 'failed')::INTEGER as failed_videos,
    CASE
      WHEN COUNT(*) > 0 THEN
        ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
      ELSE 0
    END as completion_rate,
    COALESCE(SUM(duration) FILTER (WHERE status = 'completed'), 0)::INTEGER as total_duration,
    COALESCE(SUM(file_size) FILTER (WHERE status = 'completed'), 0)::BIGINT as total_storage
  FROM generated_videos
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
