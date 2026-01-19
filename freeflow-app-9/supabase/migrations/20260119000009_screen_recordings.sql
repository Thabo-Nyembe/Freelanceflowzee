-- FreeFlow A+++ Implementation
-- Screen Recordings - Loom-style functionality
-- Migration: 20260119000009_screen_recordings.sql

-- =====================================================
-- Screen Recordings Table
-- =====================================================

CREATE TABLE IF NOT EXISTS screen_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Video asset link (if uploaded to Mux/storage)
  video_asset_id UUID REFERENCES video_assets(id) ON DELETE SET NULL,

  -- Recording metadata
  duration INTEGER NOT NULL DEFAULT 0, -- seconds
  file_size BIGINT NOT NULL DEFAULT 0, -- bytes
  mime_type VARCHAR(100) DEFAULT 'video/webm',
  resolution VARCHAR(20), -- e.g., "1920x1080"
  recording_type VARCHAR(20) NOT NULL DEFAULT 'screen', -- screen, webcam, both, audio

  -- Project association
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Sharing settings
  is_public BOOLEAN DEFAULT false,
  password VARCHAR(255), -- hashed password for protected recordings
  expires_at TIMESTAMPTZ, -- optional expiration

  -- Share URL
  share_id VARCHAR(50) UNIQUE NOT NULL,
  share_url TEXT,

  -- Thumbnail
  thumbnail_url TEXT,

  -- Transcription
  transcript_enabled BOOLEAN DEFAULT false,
  transcript_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  transcript_text TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Screen Recording Views (Analytics)
-- =====================================================

CREATE TABLE IF NOT EXISTS screen_recording_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES screen_recordings(id) ON DELETE CASCADE,

  -- Viewer info
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- null for anonymous
  viewer_ip VARCHAR(45), -- IPv4 or IPv6
  viewer_user_agent TEXT,
  viewer_country VARCHAR(2), -- ISO country code
  viewer_city VARCHAR(100),

  -- View details
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  watch_duration INTEGER DEFAULT 0, -- seconds
  completion_percentage INTEGER DEFAULT 0, -- 0-100

  -- Engagement
  paused_count INTEGER DEFAULT 0,
  seeked_count INTEGER DEFAULT 0,
  replayed_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Screen Recording Comments (Timestamped)
-- =====================================================

CREATE TABLE IF NOT EXISTS screen_recording_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES screen_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES screen_recording_comments(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,
  timestamp_ms INTEGER, -- millisecond in the video for timestamped comments

  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Screen Recording Reactions
-- =====================================================

CREATE TABLE IF NOT EXISTS screen_recording_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES screen_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  emoji VARCHAR(10) NOT NULL, -- emoji character
  timestamp_ms INTEGER, -- where in the video the reaction was left

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(recording_id, user_id, emoji, timestamp_ms)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_screen_recordings_user_id ON screen_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_project_id ON screen_recordings(project_id);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_share_id ON screen_recordings(share_id);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_is_public ON screen_recordings(is_public);
CREATE INDEX IF NOT EXISTS idx_screen_recordings_created_at ON screen_recordings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_screen_recording_views_recording_id ON screen_recording_views(recording_id);
CREATE INDEX IF NOT EXISTS idx_screen_recording_views_viewer_id ON screen_recording_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_screen_recording_views_started_at ON screen_recording_views(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_screen_recording_comments_recording_id ON screen_recording_comments(recording_id);
CREATE INDEX IF NOT EXISTS idx_screen_recording_comments_user_id ON screen_recording_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_screen_recording_comments_parent_id ON screen_recording_comments(parent_id);

CREATE INDEX IF NOT EXISTS idx_screen_recording_reactions_recording_id ON screen_recording_reactions(recording_id);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE screen_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_recording_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_recording_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE screen_recording_reactions ENABLE ROW LEVEL SECURITY;

-- Screen Recordings Policies
CREATE POLICY "Users can view own recordings"
  ON screen_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public recordings"
  ON screen_recordings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view recordings by share_id"
  ON screen_recordings FOR SELECT
  USING (share_id IS NOT NULL AND expires_at IS NULL OR expires_at > NOW());

CREATE POLICY "Users can insert own recordings"
  ON screen_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recordings"
  ON screen_recordings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recordings"
  ON screen_recordings FOR DELETE
  USING (auth.uid() = user_id);

-- Views Policies
CREATE POLICY "Recording owners can view analytics"
  ON screen_recording_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM screen_recordings
      WHERE screen_recordings.id = screen_recording_views.recording_id
      AND screen_recordings.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert view records"
  ON screen_recording_views FOR INSERT
  WITH CHECK (true);

-- Comments Policies
CREATE POLICY "Users can view comments on accessible recordings"
  ON screen_recording_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM screen_recordings
      WHERE screen_recordings.id = screen_recording_comments.recording_id
      AND (screen_recordings.user_id = auth.uid() OR screen_recordings.is_public = true)
    )
  );

CREATE POLICY "Authenticated users can insert comments"
  ON screen_recording_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON screen_recording_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON screen_recording_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions Policies
CREATE POLICY "Users can view reactions on accessible recordings"
  ON screen_recording_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM screen_recordings
      WHERE screen_recordings.id = screen_recording_reactions.recording_id
      AND (screen_recordings.user_id = auth.uid() OR screen_recordings.is_public = true)
    )
  );

CREATE POLICY "Authenticated users can insert reactions"
  ON screen_recording_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON screen_recording_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- Functions
-- =====================================================

-- Function to increment view count (called when someone views a recording)
CREATE OR REPLACE FUNCTION increment_recording_view_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update could trigger analytics aggregation if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for view tracking
CREATE TRIGGER on_recording_view_insert
  AFTER INSERT ON screen_recording_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_recording_view_count();

-- Function to update recording updated_at
CREATE OR REPLACE FUNCTION update_recording_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_screen_recordings_timestamp
  BEFORE UPDATE ON screen_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_recording_timestamp();

-- =====================================================
-- Sample Data for Development
-- =====================================================

-- Note: This will only run if users table has the demo user
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  -- Get demo user ID if exists
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'alex@freeflow.io'
  LIMIT 1;

  IF demo_user_id IS NOT NULL THEN
    -- Insert sample recordings
    INSERT INTO screen_recordings (user_id, title, description, duration, file_size, recording_type, is_public, share_id, share_url)
    VALUES
      (demo_user_id, 'Product Demo - Dashboard Features', 'Walkthrough of the new analytics dashboard', 185, 45000000, 'both', true, 'demo_prod_001', 'https://freeflow.app/share/demo_prod_001'),
      (demo_user_id, 'Bug Report - Login Issue on Safari', 'Reproducing the authentication bug', 67, 18000000, 'screen', false, 'demo_bug_001', 'https://freeflow.app/share/demo_bug_001'),
      (demo_user_id, 'Team Update - Sprint Review', 'Quick status update for the team', 120, 32000000, 'webcam', true, 'demo_team_001', 'https://freeflow.app/share/demo_team_001')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Screen recordings migration completed successfully';
END $$;
