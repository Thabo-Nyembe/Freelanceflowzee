-- ============================================================================
-- Video Studio Enhanced Tables Migration
-- Created: 2025-12-11
-- Description: Additional tables for comprehensive video studio service
-- Includes: captions, views, comments, encoding jobs, and enhanced analytics
-- ============================================================================

-- ============================================================================
-- TABLE 1: videos (main video table for Mux integration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Video identification
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,

  -- Mux integration
  mux_asset_id TEXT,
  mux_playback_id TEXT,
  mux_upload_id TEXT,

  -- Video properties
  status TEXT NOT NULL DEFAULT 'pending',
  duration NUMERIC(10,3),
  file_size BIGINT,
  original_filename TEXT,
  mime_type TEXT,

  -- Visual
  thumbnail_url TEXT,
  poster_url TEXT,
  animated_thumbnail_url TEXT,

  -- Quality/encoding
  resolution TEXT,
  fps NUMERIC(5,2),
  bitrate INTEGER,
  codec TEXT,
  aspect_ratio TEXT,

  -- Access control
  visibility TEXT NOT NULL DEFAULT 'private',
  password_protected BOOLEAN DEFAULT FALSE,
  password_hash TEXT,
  allow_download BOOLEAN DEFAULT FALSE,

  -- Organization
  folder_id UUID,
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',

  -- Processing
  processing_status TEXT DEFAULT 'pending',
  processing_progress INTEGER DEFAULT 0,
  processing_error TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  custom_data JSONB DEFAULT '{}',

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT videos_status_check CHECK (status IN ('pending', 'uploading', 'processing', 'ready', 'error', 'deleted')),
  CONSTRAINT videos_visibility_check CHECK (visibility IN ('private', 'unlisted', 'public', 'password'))
);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_visibility ON videos(visibility);
CREATE INDEX IF NOT EXISTS idx_videos_mux_asset_id ON videos(mux_asset_id) WHERE mux_asset_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_mux_playback_id ON videos(mux_playback_id) WHERE mux_playback_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_videos_tags ON videos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);

-- ============================================================================
-- TABLE 2: video_captions (subtitles/captions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Caption info
  language TEXT NOT NULL DEFAULT 'en',
  language_name TEXT,
  label TEXT,

  -- Content
  format TEXT NOT NULL DEFAULT 'vtt',
  content TEXT,
  file_url TEXT,

  -- Generation
  source TEXT NOT NULL DEFAULT 'manual',
  ai_model TEXT,
  accuracy_score NUMERIC(5,2),

  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  word_count INTEGER,
  duration_covered NUMERIC(10,3),
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT video_captions_format_check CHECK (format IN ('vtt', 'srt', 'txt', 'json')),
  CONSTRAINT video_captions_source_check CHECK (source IN ('manual', 'auto', 'ai', 'imported'))
);

CREATE INDEX IF NOT EXISTS idx_video_captions_video_id ON video_captions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_captions_language ON video_captions(language);
CREATE INDEX IF NOT EXISTS idx_video_captions_is_default ON video_captions(is_default) WHERE is_default = TRUE;

-- ============================================================================
-- TABLE 3: video_views (view tracking and analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,

  -- Viewer info
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_hash TEXT,

  -- Device/location
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,

  -- View metrics
  watch_duration NUMERIC(10,3) DEFAULT 0,
  total_duration NUMERIC(10,3),
  completion_rate NUMERIC(5,2) DEFAULT 0,
  max_position NUMERIC(10,3) DEFAULT 0,

  -- Engagement
  pauses INTEGER DEFAULT 0,
  seeks INTEGER DEFAULT 0,
  replays INTEGER DEFAULT 0,
  fullscreen_time NUMERIC(10,3) DEFAULT 0,

  -- Quality
  quality_changes INTEGER DEFAULT 0,
  average_quality TEXT,
  buffering_events INTEGER DEFAULT 0,
  buffering_duration NUMERIC(10,3) DEFAULT 0,

  -- Source
  referrer TEXT,
  embed_url TEXT,
  share_id UUID,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_views_video_id ON video_views(video_id);
CREATE INDEX IF NOT EXISTS idx_video_views_viewer_id ON video_views(viewer_id) WHERE viewer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_views_created_at ON video_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_views_session_id ON video_views(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_views_country ON video_views(country) WHERE country IS NOT NULL;

-- ============================================================================
-- TABLE 4: video_comments (timestamped comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,
  timestamp_seconds NUMERIC(10,3),

  -- Threading
  parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  thread_count INTEGER DEFAULT 0,

  -- Status
  is_pinned BOOLEAN DEFAULT FALSE,
  is_resolved BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,

  -- Reactions
  likes_count INTEGER DEFAULT 0,
  reactions JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON video_comments(video_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user_id ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_parent_id ON video_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_comments_timestamp ON video_comments(timestamp_seconds) WHERE timestamp_seconds IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_comments_is_pinned ON video_comments(is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX IF NOT EXISTS idx_video_comments_created_at ON video_comments(created_at DESC);

-- ============================================================================
-- TABLE 5: video_encoding_jobs (transcoding/encoding queue)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_encoding_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Job info
  job_type TEXT NOT NULL DEFAULT 'transcode',
  priority INTEGER DEFAULT 5,

  -- Status
  status TEXT NOT NULL DEFAULT 'queued',
  progress INTEGER DEFAULT 0,

  -- Input/Output
  input_url TEXT,
  output_url TEXT,
  output_format TEXT,
  output_quality TEXT,
  output_resolution TEXT,

  -- Processing
  worker_id TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Error handling
  error_code TEXT,
  error_message TEXT,
  error_details JSONB,

  -- Performance
  file_size_input BIGINT,
  file_size_output BIGINT,
  processing_time_ms INTEGER,

  -- Settings
  encoding_settings JSONB DEFAULT '{}',

  -- Timestamps
  queued_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT video_encoding_jobs_type_check CHECK (job_type IN ('transcode', 'thumbnail', 'caption', 'preview', 'watermark')),
  CONSTRAINT video_encoding_jobs_status_check CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  CONSTRAINT video_encoding_jobs_progress_check CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX IF NOT EXISTS idx_video_encoding_jobs_video_id ON video_encoding_jobs(video_id);
CREATE INDEX IF NOT EXISTS idx_video_encoding_jobs_user_id ON video_encoding_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_video_encoding_jobs_status ON video_encoding_jobs(status);
CREATE INDEX IF NOT EXISTS idx_video_encoding_jobs_priority ON video_encoding_jobs(priority DESC, queued_at ASC) WHERE status = 'queued';

-- ============================================================================
-- TABLE 6: video_usage_logs (audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',

  -- Context
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_usage_logs_video_id ON video_usage_logs(video_id) WHERE video_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_usage_logs_user_id ON video_usage_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_usage_logs_event_type ON video_usage_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_video_usage_logs_created_at ON video_usage_logs(created_at DESC);

-- ============================================================================
-- TABLE 7: video_events (Mux webhook events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Event source
  source TEXT NOT NULL DEFAULT 'mux',
  event_id TEXT,
  event_type TEXT NOT NULL,

  -- Related entities
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  mux_asset_id TEXT,
  mux_upload_id TEXT,

  -- Payload
  payload JSONB NOT NULL DEFAULT '{}',

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_events_source ON video_events(source);
CREATE INDEX IF NOT EXISTS idx_video_events_event_type ON video_events(event_type);
CREATE INDEX IF NOT EXISTS idx_video_events_video_id ON video_events(video_id) WHERE video_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_events_mux_asset_id ON video_events(mux_asset_id) WHERE mux_asset_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_events_processed ON video_events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_video_events_received_at ON video_events(received_at DESC);

-- ============================================================================
-- TABLE 8: video_folders (organization)
-- ============================================================================
CREATE TABLE IF NOT EXISTS video_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Folder info
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,

  -- Hierarchy
  parent_folder_id UUID REFERENCES video_folders(id) ON DELETE CASCADE,
  path TEXT,
  depth INTEGER DEFAULT 0,

  -- Counts
  video_count INTEGER DEFAULT 0,
  subfolder_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_folders_user_id ON video_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_video_folders_parent_id ON video_folders(parent_folder_id) WHERE parent_folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_video_folders_path ON video_folders(path);

-- Add folder_id foreign key to videos table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'videos_folder_id_fkey'
    AND table_name = 'videos'
  ) THEN
    ALTER TABLE videos
    ADD CONSTRAINT videos_folder_id_fkey
    FOREIGN KEY (folder_id) REFERENCES video_folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_encoding_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_folders ENABLE ROW LEVEL SECURITY;

-- Videos policies
DROP POLICY IF EXISTS "Users can view own videos" ON videos;
CREATE POLICY "Users can view own videos"
  ON videos FOR SELECT
  USING (auth.uid() = user_id OR visibility = 'public');

DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
CREATE POLICY "Users can insert own videos"
  ON videos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own videos" ON videos;
CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  USING (auth.uid() = user_id);

-- Captions policies
DROP POLICY IF EXISTS "Users can manage captions for own videos" ON video_captions;
CREATE POLICY "Users can manage captions for own videos"
  ON video_captions FOR ALL
  USING (auth.uid() = user_id);

-- Views policies (allow inserts for analytics)
DROP POLICY IF EXISTS "Anyone can insert views" ON video_views;
CREATE POLICY "Anyone can insert views"
  ON video_views FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Users can view analytics for own videos" ON video_views;
CREATE POLICY "Users can view analytics for own videos"
  ON video_views FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM videos WHERE videos.id = video_views.video_id AND videos.user_id = auth.uid()
  ));

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view comments on public videos" ON video_comments;
CREATE POLICY "Anyone can view comments on public videos"
  ON video_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM videos WHERE videos.id = video_comments.video_id
    AND (videos.visibility = 'public' OR videos.user_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Authenticated users can comment" ON video_comments;
CREATE POLICY "Authenticated users can comment"
  ON video_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON video_comments;
CREATE POLICY "Users can update own comments"
  ON video_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON video_comments;
CREATE POLICY "Users can delete own comments"
  ON video_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Encoding jobs policies
DROP POLICY IF EXISTS "Users can view own encoding jobs" ON video_encoding_jobs;
CREATE POLICY "Users can view own encoding jobs"
  ON video_encoding_jobs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create encoding jobs for own videos" ON video_encoding_jobs;
CREATE POLICY "Users can create encoding jobs for own videos"
  ON video_encoding_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Folders policies
DROP POLICY IF EXISTS "Users can manage own folders" ON video_folders;
CREATE POLICY "Users can manage own folders"
  ON video_folders FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update video updated_at
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update captions updated_at
DROP TRIGGER IF EXISTS update_video_captions_updated_at ON video_captions;
CREATE TRIGGER update_video_captions_updated_at
  BEFORE UPDATE ON video_captions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update comments updated_at
DROP TRIGGER IF EXISTS update_video_comments_updated_at ON video_comments;
CREATE TRIGGER update_video_comments_updated_at
  BEFORE UPDATE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update folders updated_at
DROP TRIGGER IF EXISTS update_video_folders_updated_at ON video_folders;
CREATE TRIGGER update_video_folders_updated_at
  BEFORE UPDATE ON video_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update comment thread count
CREATE OR REPLACE FUNCTION update_comment_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE video_comments
    SET thread_count = thread_count + 1
    WHERE id = NEW.parent_comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE video_comments
    SET thread_count = thread_count - 1
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_comment_thread_count_trigger ON video_comments;
CREATE TRIGGER update_comment_thread_count_trigger
  AFTER INSERT OR DELETE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_thread_count();

-- Update folder video count
CREATE OR REPLACE FUNCTION update_folder_video_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.folder_id IS NOT NULL THEN
    UPDATE video_folders
    SET video_count = video_count + 1
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' AND OLD.folder_id IS NOT NULL THEN
    UPDATE video_folders
    SET video_count = video_count - 1
    WHERE id = OLD.folder_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      IF OLD.folder_id IS NOT NULL THEN
        UPDATE video_folders
        SET video_count = video_count - 1
        WHERE id = OLD.folder_id;
      END IF;
      IF NEW.folder_id IS NOT NULL THEN
        UPDATE video_folders
        SET video_count = video_count + 1
        WHERE id = NEW.folder_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_folder_video_count_trigger ON videos;
CREATE TRIGGER update_folder_video_count_trigger
  AFTER INSERT OR DELETE OR UPDATE OF folder_id ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_video_count();
