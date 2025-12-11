-- ============================================================================
-- Video Studio Tables - CLEAN INSTALL
-- This will drop existing tables and recreate them properly
-- ============================================================================

-- Drop existing tables in reverse order (to handle foreign keys)
DROP TABLE IF EXISTS video_templates CASCADE;
DROP TABLE IF EXISTS video_analytics CASCADE;
DROP TABLE IF EXISTS video_shares CASCADE;
DROP TABLE IF EXISTS render_jobs CASCADE;
DROP TABLE IF EXISTS timeline_clips CASCADE;
DROP TABLE IF EXISTS video_assets CASCADE;
DROP TABLE IF EXISTS video_projects CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_project_duration() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: video_projects
-- ============================================================================
CREATE TABLE video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  duration INTEGER DEFAULT 0,
  resolution TEXT DEFAULT '1920x1080',
  fps INTEGER DEFAULT 30,
  template TEXT,
  last_saved TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT video_projects_status_check CHECK (status IN ('draft', 'in_progress', 'completed', 'archived'))
);

CREATE INDEX idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX idx_video_projects_status ON video_projects(status);
CREATE INDEX idx_video_projects_updated_at ON video_projects(updated_at DESC);

-- ============================================================================
-- TABLE 2: video_assets
-- ============================================================================
CREATE TABLE video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  duration INTEGER,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT video_assets_type_check CHECK (type IN ('video', 'audio', 'image'))
);

CREATE INDEX idx_video_assets_project_id ON video_assets(project_id);
CREATE INDEX idx_video_assets_type ON video_assets(type);

-- ============================================================================
-- TABLE 3: timeline_clips
-- ============================================================================
CREATE TABLE timeline_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  track INTEGER NOT NULL DEFAULT 1,
  start_time NUMERIC(10,3) NOT NULL,
  end_time NUMERIC(10,3) NOT NULL,
  trim_start NUMERIC(10,3),
  trim_end NUMERIC(10,3),
  effects JSONB DEFAULT '[]',
  transitions JSONB DEFAULT '[]',
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_timeline_clips_project_id ON timeline_clips(project_id);
CREATE INDEX idx_timeline_clips_asset_id ON timeline_clips(asset_id);
CREATE INDEX idx_timeline_clips_position ON timeline_clips(position);

-- ============================================================================
-- TABLE 4: render_jobs
-- ============================================================================
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,
  format TEXT NOT NULL,
  quality TEXT NOT NULL,
  resolution TEXT NOT NULL,
  output_url TEXT,
  output_size BIGINT,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT render_jobs_status_check CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  CONSTRAINT render_jobs_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_render_jobs_project_id ON render_jobs(project_id);
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);

-- ============================================================================
-- TABLE 5: video_shares
-- ============================================================================
CREATE TABLE video_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  share_id TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_shares_project_id ON video_shares(project_id);
CREATE INDEX idx_video_shares_share_id ON video_shares(share_id);
CREATE INDEX idx_video_shares_expires_at ON video_shares(expires_at);

-- ============================================================================
-- TABLE 6: video_analytics
-- ============================================================================
CREATE TABLE video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE UNIQUE,
  views INTEGER DEFAULT 0,
  watch_time BIGINT DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  shares INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_analytics_project_id ON video_analytics(project_id);

-- ============================================================================
-- TABLE 7: video_templates
-- ============================================================================
CREATE TABLE video_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  resolution TEXT DEFAULT '1920x1080',
  fps INTEGER DEFAULT 30,
  template_data JSONB NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_templates_category ON video_templates(category);
CREATE INDEX idx_video_templates_usage_count ON video_templates(usage_count DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;

-- video_projects policies
CREATE POLICY "Users can view own projects"
  ON video_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON video_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON video_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON video_projects FOR DELETE
  USING (auth.uid() = user_id);

-- video_assets policies
CREATE POLICY "Users can view assets of own projects"
  ON video_assets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = video_assets.project_id
    AND video_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert assets to own projects"
  ON video_assets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = video_assets.project_id
    AND video_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete assets from own projects"
  ON video_assets FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = video_assets.project_id
    AND video_projects.user_id = auth.uid()
  ));

-- timeline_clips policies
CREATE POLICY "Users can manage clips in own projects"
  ON timeline_clips FOR ALL
  USING (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = timeline_clips.project_id
    AND video_projects.user_id = auth.uid()
  ));

-- render_jobs policies
CREATE POLICY "Users can view own render jobs"
  ON render_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create render jobs for own projects"
  ON render_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM video_projects
      WHERE video_projects.id = render_jobs.project_id
      AND video_projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own render jobs"
  ON render_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- video_shares policies
CREATE POLICY "Anyone can view active shares"
  ON video_shares FOR SELECT
  USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

CREATE POLICY "Users can create shares for own projects"
  ON video_shares FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = video_shares.project_id
    AND video_projects.user_id = auth.uid()
  ));

-- video_analytics policies
CREATE POLICY "Users can view analytics for own projects"
  ON video_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM video_projects
    WHERE video_projects.id = video_analytics.project_id
    AND video_projects.user_id = auth.uid()
  ));

CREATE POLICY "System can insert/update analytics"
  ON video_analytics FOR ALL
  USING (TRUE);

-- video_templates policies
CREATE POLICY "Anyone can view templates"
  ON video_templates FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can create templates"
  ON video_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

INSERT INTO video_templates (name, description, category, thumbnail_url, duration, template_data, usage_count)
VALUES
  ('Quick Intro', 'Modern intro template with animations', 'intro', '/templates/quick-intro.jpg', 5, '{"clips": [], "effects": []}', 150),
  ('Product Demo', 'Perfect for product showcases', 'product', '/templates/product-demo.jpg', 30, '{"clips": [], "effects": []}', 120),
  ('Tutorial Template', 'Screen recording tutorial template', 'tutorial', '/templates/tutorial.jpg', 60, '{"clips": [], "effects": []}', 95),
  ('Social Media Post', 'Optimized for Instagram/TikTok', 'social', '/templates/social.jpg', 15, '{"clips": [], "effects": []}', 200);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count tables created
SELECT 'Tables created successfully!' as message,
       COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('video_projects', 'video_assets', 'timeline_clips', 'render_jobs', 'video_shares', 'video_analytics', 'video_templates');
