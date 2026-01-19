-- ============================================================================
-- Remotion Video Generation System
-- Migration: 20260119000021
-- ============================================================================

-- ============================================================================
-- Render Jobs Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS remotion_render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Composition info
  composition_id VARCHAR(100) NOT NULL,
  input_props JSONB DEFAULT '{}',

  -- Render configuration
  config JSONB NOT NULL DEFAULT '{}',

  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'bundling', 'rendering', 'encoding', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Output info
  output_path TEXT,
  output_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  error TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_remotion_render_jobs_user_id ON remotion_render_jobs(user_id);
CREATE INDEX idx_remotion_render_jobs_status ON remotion_render_jobs(status);
CREATE INDEX idx_remotion_render_jobs_created_at ON remotion_render_jobs(created_at DESC);
CREATE INDEX idx_remotion_render_jobs_composition_id ON remotion_render_jobs(composition_id);

-- RLS
ALTER TABLE remotion_render_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own render jobs"
  ON remotion_render_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own render jobs"
  ON remotion_render_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own render jobs"
  ON remotion_render_jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own render jobs"
  ON remotion_render_jobs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Video Templates Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS remotion_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,

  -- Composition configuration
  composition_id VARCHAR(100) NOT NULL,
  default_props JSONB DEFAULT '{}',
  default_settings JSONB DEFAULT '{}',

  -- Template metadata
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Organization
  is_system BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Stats
  use_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_remotion_templates_category ON remotion_templates(category);
CREATE INDEX idx_remotion_templates_composition_id ON remotion_templates(composition_id);
CREATE INDEX idx_remotion_templates_user_id ON remotion_templates(user_id);
CREATE INDEX idx_remotion_templates_is_public ON remotion_templates(is_public) WHERE is_public = TRUE;

-- RLS
ALTER TABLE remotion_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
  ON remotion_templates FOR SELECT
  USING (is_public = TRUE OR is_system = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
  ON remotion_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update their own templates"
  ON remotion_templates FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete their own templates"
  ON remotion_templates FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- ============================================================================
-- Saved Compositions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS remotion_saved_compositions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Composition info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  composition_id VARCHAR(100) NOT NULL,

  -- Configuration
  props JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',

  -- Preview
  thumbnail_url TEXT,

  -- Organization
  folder_id UUID,
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_remotion_saved_compositions_user_id ON remotion_saved_compositions(user_id);
CREATE INDEX idx_remotion_saved_compositions_composition_id ON remotion_saved_compositions(composition_id);
CREATE INDEX idx_remotion_saved_compositions_folder_id ON remotion_saved_compositions(folder_id);
CREATE INDEX idx_remotion_saved_compositions_tags ON remotion_saved_compositions USING GIN(tags);

-- RLS
ALTER TABLE remotion_saved_compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved compositions"
  ON remotion_saved_compositions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved compositions"
  ON remotion_saved_compositions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved compositions"
  ON remotion_saved_compositions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved compositions"
  ON remotion_saved_compositions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Render Presets Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS remotion_render_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Preset info
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Settings
  settings JSONB NOT NULL DEFAULT '{
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "codec": "h264",
    "crf": 18,
    "format": "mp4"
  }',

  -- Use case
  category VARCHAR(100), -- 'social', 'youtube', 'marketing', etc.
  platform VARCHAR(100), -- 'instagram', 'tiktok', 'youtube', etc.

  -- Organization
  is_system BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE remotion_render_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presets"
  ON remotion_render_presets FOR SELECT
  USING (is_system = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create their own presets"
  ON remotion_render_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can update their own presets"
  ON remotion_render_presets FOR UPDATE
  USING (auth.uid() = user_id AND is_system = FALSE);

CREATE POLICY "Users can delete their own presets"
  ON remotion_render_presets FOR DELETE
  USING (auth.uid() = user_id AND is_system = FALSE);

-- ============================================================================
-- Insert System Templates
-- ============================================================================

INSERT INTO remotion_templates (name, description, category, composition_id, default_props, is_system, is_public) VALUES
-- Basic Templates
('Simple Text', 'Clean animated text slide', 'basic', 'TextSlide',
  '{"title": "Your Title Here", "subtitle": "Your subtitle", "backgroundColor": "#1a1a2e", "animation": "slide"}'::jsonb,
  TRUE, TRUE),

('Image Showcase', 'Beautiful image with Ken Burns effect', 'basic', 'ImageSlide',
  '{"animation": "kenBurns", "overlayColor": "rgba(0,0,0,0.2)"}'::jsonb,
  TRUE, TRUE),

-- Marketing Templates
('Logo Intro', 'Professional logo reveal animation', 'marketing', 'LogoReveal',
  '{"backgroundColor": "#000000", "animation": "scale"}'::jsonb,
  TRUE, TRUE),

('Product Feature', 'Showcase product with features list', 'marketing', 'ProductShowcase',
  '{"backgroundColor": "#ffffff"}'::jsonb,
  TRUE, TRUE),

('Call to Action', 'Compelling CTA with animated button', 'marketing', 'CallToAction',
  '{"backgroundColor": "#6366f1", "accentColor": "#ffffff"}'::jsonb,
  TRUE, TRUE),

-- Social Templates
('Testimonial', 'Customer testimonial with quote styling', 'social', 'SocialProof',
  '{"backgroundColor": "#f8f9fa"}'::jsonb,
  TRUE, TRUE),

('Countdown Timer', 'Animated countdown for events', 'social', 'Countdown',
  '{"backgroundColor": "#1a1a2e"}'::jsonb,
  TRUE, TRUE),

('Progress Update', 'Animated progress bar visualization', 'social', 'ProgressBar',
  '{"color": "#6366f1"}'::jsonb,
  TRUE, TRUE),

-- Full Video Templates
('Brand Intro', 'Logo reveal + title slide combo', 'full', 'IntroOutroVideo',
  '{"backgroundColor": "#1a1a2e"}'::jsonb,
  TRUE, TRUE),

('Promo Video', 'Complete promotional video with all sections', 'full', 'PromoVideo',
  '{"backgroundColor": "#1a1a2e", "accentColor": "#6366f1"}'::jsonb,
  TRUE, TRUE);

-- ============================================================================
-- Insert System Render Presets
-- ============================================================================

INSERT INTO remotion_render_presets (name, description, settings, category, platform, is_system) VALUES
-- YouTube
('YouTube 1080p', 'Standard HD for YouTube',
  '{"width": 1920, "height": 1080, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'youtube', 'youtube', TRUE),

('YouTube 4K', 'Ultra HD for YouTube',
  '{"width": 3840, "height": 2160, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'youtube', 'youtube', TRUE),

('YouTube Shorts', 'Vertical video for YouTube Shorts',
  '{"width": 1080, "height": 1920, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'youtube', TRUE),

-- Instagram
('Instagram Reels', 'Vertical video for Instagram Reels',
  '{"width": 1080, "height": 1920, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'instagram', TRUE),

('Instagram Post', 'Square video for Instagram feed',
  '{"width": 1080, "height": 1080, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'instagram', TRUE),

('Instagram Story', 'Full screen story format',
  '{"width": 1080, "height": 1920, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'instagram', TRUE),

-- TikTok
('TikTok', 'Optimized for TikTok',
  '{"width": 1080, "height": 1920, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'tiktok', TRUE),

-- Twitter/X
('Twitter Video', 'Landscape video for Twitter',
  '{"width": 1280, "height": 720, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'twitter', TRUE),

-- LinkedIn
('LinkedIn Video', 'Professional video for LinkedIn',
  '{"width": 1920, "height": 1080, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'marketing', 'linkedin', TRUE),

-- Facebook
('Facebook Feed', 'Standard video for Facebook feed',
  '{"width": 1280, "height": 720, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'facebook', TRUE),

('Facebook Story', 'Full screen Facebook story',
  '{"width": 1080, "height": 1920, "fps": 30, "codec": "h264", "crf": 18, "format": "mp4"}'::jsonb,
  'social', 'facebook', TRUE),

-- GIF
('GIF Small', 'Small optimized GIF',
  '{"width": 480, "height": 270, "fps": 15, "codec": "gif", "format": "gif"}'::jsonb,
  'web', 'web', TRUE),

('GIF Medium', 'Medium quality GIF',
  '{"width": 800, "height": 450, "fps": 15, "codec": "gif", "format": "gif"}'::jsonb,
  'web', 'web', TRUE);

-- ============================================================================
-- Utility Functions
-- ============================================================================

-- Function to update render job status
CREATE OR REPLACE FUNCTION update_render_job_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();

  -- Set started_at when transitioning from pending
  IF OLD.status = 'pending' AND NEW.status != 'pending' AND NEW.started_at IS NULL THEN
    NEW.started_at = NOW();
  END IF;

  -- Set completed_at when job finishes
  IF NEW.status IN ('completed', 'failed') AND NEW.completed_at IS NULL THEN
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_render_job_status
  BEFORE UPDATE ON remotion_render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_render_job_status();

-- Function to increment template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE remotion_templates
  SET use_count = use_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old render jobs (30 days)
CREATE OR REPLACE FUNCTION cleanup_old_render_jobs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM remotion_render_jobs
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND status IN ('completed', 'failed');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Views
-- ============================================================================

-- User render statistics
CREATE OR REPLACE VIEW user_render_stats AS
SELECT
  user_id,
  COUNT(*) as total_renders,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_renders,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_renders,
  COUNT(*) FILTER (WHERE status IN ('pending', 'bundling', 'rendering', 'encoding')) as active_renders,
  COUNT(DISTINCT composition_id) as unique_compositions,
  ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 2) as avg_render_time_seconds,
  MAX(created_at) as last_render_at
FROM remotion_render_jobs
GROUP BY user_id;

-- Popular compositions
CREATE OR REPLACE VIEW popular_compositions AS
SELECT
  composition_id,
  COUNT(*) as render_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE status = 'completed') as successful_renders,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::numeric /
    NULLIF(COUNT(*)::numeric, 0) * 100,
    2
  ) as success_rate
FROM remotion_render_jobs
GROUP BY composition_id
ORDER BY render_count DESC;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE remotion_render_jobs IS 'Tracks video render jobs created by users';
COMMENT ON TABLE remotion_templates IS 'Pre-configured video templates for quick rendering';
COMMENT ON TABLE remotion_saved_compositions IS 'User-saved composition configurations';
COMMENT ON TABLE remotion_render_presets IS 'Output format presets for different platforms';
