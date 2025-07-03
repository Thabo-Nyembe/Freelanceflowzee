-- ============================================================================
-- FreeflowZee Video Infrastructure Setup Script - V3.0
-- ============================================================================
-- This script adds comprehensive video functionality inspired by Cap.so
-- to the existing FreeFlow database structure.
--
-- Features included:
-- - Video management with Mux integration
-- - AI transcription and analysis
-- - Video sharing with permissions
-- - Video analytics and comments
-- - Integration with existing projects system
-- ============================================================================

-- Enable necessary extensions for video functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- VIDEO CORE TABLES
-- ============================================================================

-- Videos table with Mux integration and Cap-style features
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Video',
  description TEXT,
  
  -- Ownership and project integration
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Mux integration
  mux_asset_id VARCHAR(255) UNIQUE,
  mux_playback_id VARCHAR(255),
  mux_upload_id VARCHAR(255),
  
  -- Video metadata
  duration_seconds INTEGER DEFAULT 0,
  aspect_ratio VARCHAR(20) DEFAULT '16:9',
  resolution VARCHAR(20),
  file_size_bytes BIGINT DEFAULT 0,
  thumbnail_url TEXT,
  preview_gif_url TEXT,
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  error_message TEXT,
  
  -- AI features
  transcript TEXT,
  ai_summary TEXT,
  ai_chapters JSONB DEFAULT '[]',
  ai_action_items JSONB DEFAULT '[]',
  ai_metadata JSONB DEFAULT '{}',
  
  -- Sharing and permissions
  is_public BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  sharing_settings JSONB DEFAULT '{"allowComments": true, "allowDownload": false, "trackViews": true}',
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  
  -- Search and categorization
  tags TEXT[],
  embedding vector(1536),
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}'
);

-- Video comments with timestamp support
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  
  -- Comment content
  content TEXT NOT NULL,
  timestamp_seconds DECIMAL(10,3), -- Allows precise timestamp linking
  
  -- Status and moderation
  is_resolved BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional data
  metadata JSONB DEFAULT '{}'
);

-- Video shares/access tracking
CREATE TABLE IF NOT EXISTS video_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Share details
  share_type VARCHAR(50) NOT NULL CHECK (share_type IN ('public_link', 'email', 'client_portal', 'embed')),
  recipient_email VARCHAR(255),
  access_level VARCHAR(50) DEFAULT 'view' CHECK (access_level IN ('view', 'comment', 'download')),
  
  -- Access control
  expires_at TIMESTAMP WITH TIME ZONE,
  password_protected BOOLEAN DEFAULT false,
  view_limit INTEGER,
  views_used INTEGER DEFAULT 0,
  
  -- Share metadata
  share_url TEXT,
  embed_settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Additional data
  metadata JSONB DEFAULT '{}'
);

-- Video analytics events
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Event details
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('view', 'play', 'pause', 'seek', 'complete', 'download', 'share')),
  timestamp_seconds DECIMAL(10,3),
  duration_watched_seconds DECIMAL(10,3),
  
  -- Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  location_data JSONB,
  
  -- Device info
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional data
  metadata JSONB DEFAULT '{}'
);

-- Video thumbnails for different sizes/types
CREATE TABLE IF NOT EXISTS video_thumbnails (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Thumbnail details
  thumbnail_type VARCHAR(50) NOT NULL CHECK (thumbnail_type IN ('auto', 'custom', 'animated')),
  size_variant VARCHAR(50) NOT NULL CHECK (size_variant IN ('small', 'medium', 'large', 'original')),
  url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size_bytes BIGINT,
  
  -- Status
  is_primary BOOLEAN DEFAULT false,
  processing_status VARCHAR(50) DEFAULT 'ready',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to prevent duplicates
  UNIQUE(video_id, thumbnail_type, size_variant)
);

-- ============================================================================
-- INTEGRATION WITH EXISTING PROJECTS SYSTEM
-- ============================================================================

-- Add video-related columns to existing projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS total_video_duration_seconds INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_settings JSONB DEFAULT '{"recordingEnabled": true, "clientAccessEnabled": true, "autoTranscription": true}';

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update video search vector
CREATE OR REPLACE FUNCTION update_video_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.transcript, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.ai_summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for video search vector updates
DROP TRIGGER IF EXISTS video_search_vector_update ON videos;
CREATE TRIGGER video_search_vector_update
BEFORE INSERT OR UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_video_search_vector();

-- Function to update video counts in projects
CREATE OR REPLACE FUNCTION update_project_video_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects 
    SET 
      video_count = video_count + 1,
      total_video_duration_seconds = total_video_duration_seconds + COALESCE(NEW.duration_seconds, 0),
      last_activity = NOW()
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.project_id IS DISTINCT FROM NEW.project_id THEN
      -- Video moved between projects
      IF OLD.project_id IS NOT NULL THEN
        UPDATE projects 
        SET 
          video_count = video_count - 1,
          total_video_duration_seconds = total_video_duration_seconds - COALESCE(OLD.duration_seconds, 0)
        WHERE id = OLD.project_id;
      END IF;
      IF NEW.project_id IS NOT NULL THEN
        UPDATE projects 
        SET 
          video_count = video_count + 1,
          total_video_duration_seconds = total_video_duration_seconds + COALESCE(NEW.duration_seconds, 0),
          last_activity = NOW()
        WHERE id = NEW.project_id;
      END IF;
    ELSIF OLD.duration_seconds IS DISTINCT FROM NEW.duration_seconds THEN
      -- Duration updated
      UPDATE projects 
      SET 
        total_video_duration_seconds = total_video_duration_seconds - COALESCE(OLD.duration_seconds, 0) + COALESCE(NEW.duration_seconds, 0),
        last_activity = NOW()
      WHERE id = NEW.project_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects 
    SET 
      video_count = video_count - 1,
      total_video_duration_seconds = total_video_duration_seconds - COALESCE(OLD.duration_seconds, 0)
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for project video stats updates
DROP TRIGGER IF EXISTS project_video_stats_update ON videos;
CREATE TRIGGER project_video_stats_update
AFTER INSERT OR UPDATE OR DELETE ON videos
FOR EACH ROW EXECUTE FUNCTION update_project_video_stats();

-- Function for semantic video search
CREATE OR REPLACE FUNCTION match_videos ( 
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid DEFAULT NULL,
  filter_project_id uuid DEFAULT NULL
)
RETURNS TABLE ( 
  id uuid,
  title text,
  description text,
  project_id uuid,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.description,
    v.project_id,
    1 - (v.embedding <=> query_embedding) as similarity
  FROM videos v
  WHERE v.embedding IS NOT NULL 
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
    AND (filter_user_id IS NULL OR v.owner_id = filter_user_id)
    AND (filter_project_id IS NULL OR v.project_id = filter_project_id)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_video_view(video_uuid uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE videos 
  SET view_count = view_count + 1
  WHERE id = video_uuid;
END;
$$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Video search and filtering indexes
CREATE INDEX IF NOT EXISTS videos_search_vector_idx ON videos USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS videos_embedding_idx ON videos USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS videos_owner_id_idx ON videos (owner_id);
CREATE INDEX IF NOT EXISTS videos_project_id_idx ON videos (project_id);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos (status);
CREATE INDEX IF NOT EXISTS videos_mux_asset_id_idx ON videos (mux_asset_id);
CREATE INDEX IF NOT EXISTS videos_mux_playback_id_idx ON videos (mux_playback_id);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos (created_at DESC);
CREATE INDEX IF NOT EXISTS videos_published_at_idx ON videos (published_at DESC);
CREATE INDEX IF NOT EXISTS videos_is_public_idx ON videos (is_public);

-- Video comments indexes
CREATE INDEX IF NOT EXISTS video_comments_video_id_idx ON video_comments (video_id);
CREATE INDEX IF NOT EXISTS video_comments_user_id_idx ON video_comments (user_id);
CREATE INDEX IF NOT EXISTS video_comments_timestamp_idx ON video_comments (timestamp_seconds);
CREATE INDEX IF NOT EXISTS video_comments_created_at_idx ON video_comments (created_at DESC);

-- Video shares indexes
CREATE INDEX IF NOT EXISTS video_shares_video_id_idx ON video_shares (video_id);
CREATE INDEX IF NOT EXISTS video_shares_shared_by_user_id_idx ON video_shares (shared_by_user_id);
CREATE INDEX IF NOT EXISTS video_shares_share_type_idx ON video_shares (share_type);
CREATE INDEX IF NOT EXISTS video_shares_expires_at_idx ON video_shares (expires_at);

-- Video analytics indexes
CREATE INDEX IF NOT EXISTS video_analytics_video_id_idx ON video_analytics (video_id);
CREATE INDEX IF NOT EXISTS video_analytics_user_id_idx ON video_analytics (user_id);
CREATE INDEX IF NOT EXISTS video_analytics_event_type_idx ON video_analytics (event_type);
CREATE INDEX IF NOT EXISTS video_analytics_created_at_idx ON video_analytics (created_at DESC);
CREATE INDEX IF NOT EXISTS video_analytics_session_id_idx ON video_analytics (session_id);

-- Video thumbnails indexes
CREATE INDEX IF NOT EXISTS video_thumbnails_video_id_idx ON video_thumbnails (video_id);
CREATE INDEX IF NOT EXISTS video_thumbnails_is_primary_idx ON video_thumbnails (is_primary);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all video tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_thumbnails ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can view public videos" ON videos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (auth.uid() = owner_id);

-- Video comments policies
CREATE POLICY "Users can view comments on accessible videos" ON video_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_comments.video_id 
      AND (v.owner_id = auth.uid() OR v.is_public = true)
    )
  );

CREATE POLICY "Users can insert comments on accessible videos" ON video_comments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_comments.video_id 
      AND (v.owner_id = auth.uid() OR v.is_public = true)
    )
  );

CREATE POLICY "Users can update their own comments" ON video_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON video_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Video shares policies
CREATE POLICY "Users can view shares they created" ON video_shares
  FOR SELECT USING (auth.uid() = shared_by_user_id);

CREATE POLICY "Video owners can view all shares of their videos" ON video_shares
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_shares.video_id 
      AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shares for their videos" ON video_shares
  FOR INSERT WITH CHECK (
    auth.uid() = shared_by_user_id AND
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_shares.video_id 
      AND v.owner_id = auth.uid()
    )
  );

-- Video analytics policies (more permissive for tracking)
CREATE POLICY "Video owners can view analytics for their videos" ON video_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_analytics.video_id 
      AND v.owner_id = auth.uid()
    )
  );

CREATE POLICY "Analytics can be inserted for any accessible video" ON video_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_analytics.video_id 
      AND (v.owner_id = auth.uid() OR v.is_public = true)
    )
  );

-- Video thumbnails policies
CREATE POLICY "Users can view thumbnails for accessible videos" ON video_thumbnails
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_thumbnails.video_id 
      AND (v.owner_id = auth.uid() OR v.is_public = true)
    )
  );

CREATE POLICY "Video owners can manage thumbnails" ON video_thumbnails
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM videos v 
      WHERE v.id = video_thumbnails.video_id 
      AND v.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'FreeflowZee Video Infrastructure V3.0 Setup Complete!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'Video features now available:';
  RAISE NOTICE '- Mux integration for video processing';
  RAISE NOTICE '- AI transcription and analysis';
  RAISE NOTICE '- Video sharing with permissions';
  RAISE NOTICE '- Real-time analytics and comments';
  RAISE NOTICE '- Integration with projects system';
  RAISE NOTICE '- Semantic video search';
  RAISE NOTICE '- Row-level security enabled';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Mux API keys in your environment';
  RAISE NOTICE '2. Set up video API endpoints';
  RAISE NOTICE '3. Implement video upload and playback components';
END $$; 