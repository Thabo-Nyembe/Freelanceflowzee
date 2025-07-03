-- ============================================================================
-- FreeFlow Video Features Migration Script - V3.0
-- ============================================================================
-- Adds comprehensive video recording, sharing, and analytics capabilities
-- Inspired by Cap.so architecture but integrated with FreeFlow's project system
-- ============================================================================

-- Enable additional extensions for video functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- VIDEO CORE TABLES
-- ============================================================================

-- Videos table - Core video storage and metadata
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Video',
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Video file information
  file_path TEXT, -- Supabase Storage path
  file_size BIGINT, -- Size in bytes
  duration_seconds INTEGER, -- Video duration
  format VARCHAR(20) DEFAULT 'mp4', -- Video format
  resolution VARCHAR(20), -- e.g., "1920x1080"
  frame_rate DECIMAL(5,2), -- e.g., 30.00
  
  -- Processing status
  processing_status VARCHAR(20) DEFAULT 'uploaded' CHECK (processing_status IN ('uploading', 'uploaded', 'processing', 'ready', 'failed')),
  thumbnail_path TEXT, -- Generated thumbnail path
  preview_gif_path TEXT, -- Optional preview GIF
  
  -- Privacy and sharing
  is_public BOOLEAN DEFAULT false,
  password_hash TEXT, -- Encrypted password for protected videos
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT false,
  
  -- Analytics
  view_count INTEGER DEFAULT 0,
  unique_view_count INTEGER DEFAULT 0,
  total_watch_time_seconds INTEGER DEFAULT 0,
  
  -- AI-enhanced features
  transcript TEXT, -- Auto-generated transcript
  ai_summary TEXT, -- AI-generated summary
  ai_action_items JSONB DEFAULT '[]', -- Extracted action items
  ai_insights JSONB DEFAULT '{}', -- AI analysis insights
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Search and discovery
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  embedding vector(1536), -- For semantic search
  search_vector tsvector
);

-- Video shares table - Track sharing links and permissions
CREATE TABLE IF NOT EXISTS video_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  shared_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_type VARCHAR(20) DEFAULT 'link' CHECK (share_type IN ('link', 'email', 'embed', 'social')),
  
  -- Share configuration
  share_token VARCHAR(64) UNIQUE NOT NULL, -- Unique share identifier
  expires_at TIMESTAMP WITH TIME ZONE,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,
  
  -- Permissions
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT false,
  require_email BOOLEAN DEFAULT false,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  share_settings JSONB DEFAULT '{}'
);

-- Video comments table - Comments and feedback on videos
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Comment content
  content TEXT NOT NULL,
  timestamp_seconds DECIMAL(10,2), -- Comment timestamp in video
  
  -- Comment metadata
  author_name VARCHAR(255), -- For non-registered users
  author_email VARCHAR(255), -- For notifications
  is_internal BOOLEAN DEFAULT false, -- Internal team comments vs client comments
  
  -- Threading
  parent_comment_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  thread_depth INTEGER DEFAULT 0,
  
  -- Status
  is_resolved BOOLEAN DEFAULT false,
  resolved_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video analytics table - Detailed viewing analytics
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Viewer information
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL for anonymous
  viewer_ip_hash VARCHAR(64), -- Hashed IP for privacy
  viewer_user_agent TEXT,
  viewer_location JSONB, -- Country, city if available
  
  -- Viewing session
  session_id VARCHAR(64), -- Unique session identifier
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  watch_duration_seconds INTEGER DEFAULT 0,
  completion_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100%
  
  -- Engagement metrics
  pauses_count INTEGER DEFAULT 0,
  seeks_count INTEGER DEFAULT 0,
  replays_count INTEGER DEFAULT 0,
  dropped_at_seconds INTEGER, -- Where viewer stopped watching
  
  -- Source tracking
  referrer_url TEXT,
  source_platform VARCHAR(50), -- 'web', 'mobile', 'embed', etc.
  share_token VARCHAR(64), -- If accessed via share link
  
  -- Metadata
  analytics_data JSONB DEFAULT '{}'
);

-- Video templates table - Reusable video templates for different scenarios
CREATE TABLE IF NOT EXISTS video_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'proposal', 'update', 'tutorial', 'review', etc.
  
  -- Template content
  suggested_script TEXT,
  recommended_duration_seconds INTEGER,
  key_points JSONB DEFAULT '[]',
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Template metadata
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  thumbnail_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STORAGE BUCKETS (for Supabase Storage)
-- ============================================================================

-- Create storage buckets for video files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', false, 1073741824, ARRAY['video/mp4', 'video/webm', 'video/quicktime']), -- 1GB limit
  ('video-thumbnails', 'video-thumbnails', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 10MB limit
  ('video-previews', 'video-previews', true, 52428800, ARRAY['image/gif', 'video/mp4']) -- 50MB limit for GIFs/previews
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all video tables
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;

-- Videos policies
CREATE POLICY "Users can view their own videos" ON videos
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view public videos" ON videos
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE USING (owner_id = auth.uid());

-- Video shares policies
CREATE POLICY "Users can view shares for their videos" ON video_shares
  FOR SELECT USING (
    video_id IN (SELECT id FROM videos WHERE owner_id = auth.uid())
    OR shared_by_user_id = auth.uid()
  );

CREATE POLICY "Users can create shares for their videos" ON video_shares
  FOR INSERT WITH CHECK (
    video_id IN (SELECT id FROM videos WHERE owner_id = auth.uid())
    AND shared_by_user_id = auth.uid()
  );

-- Video comments policies
CREATE POLICY "Users can view comments on accessible videos" ON video_comments
  FOR SELECT USING (
    video_id IN (
      SELECT id FROM videos 
      WHERE owner_id = auth.uid() OR is_public = true
    )
  );

CREATE POLICY "Authenticated users can comment" ON video_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Analytics policies (only video owners can see analytics)
CREATE POLICY "Video owners can view analytics" ON video_analytics
  FOR SELECT USING (
    video_id IN (SELECT id FROM videos WHERE owner_id = auth.uid())
  );

-- Templates policies
CREATE POLICY "Users can view public templates" ON video_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own templates" ON video_templates
  FOR SELECT USING (created_by_user_id = auth.uid());

-- Storage policies
CREATE POLICY "Users can upload their own videos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own videos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'videos' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public access to thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-thumbnails');

CREATE POLICY "Public access to previews" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-previews');

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
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for video search vector
DROP TRIGGER IF EXISTS video_search_vector_update ON videos;
CREATE TRIGGER video_search_vector_update
BEFORE INSERT OR UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_video_search_vector();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_video_view(
  p_video_id UUID,
  p_viewer_id UUID DEFAULT NULL,
  p_session_data JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  -- Update video view count
  UPDATE videos 
  SET 
    view_count = view_count + 1,
    last_activity = NOW()
  WHERE id = p_video_id;
  
  -- Record analytics entry
  INSERT INTO video_analytics (
    video_id,
    viewer_id,
    session_id,
    analytics_data
  ) VALUES (
    p_video_id,
    p_viewer_id,
    COALESCE((p_session_data->>'session_id')::text, gen_random_uuid()::text),
    p_session_data
  );
END;
$$ LANGUAGE plpgsql;

-- Function for semantic video search
CREATE OR REPLACE FUNCTION match_videos(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 10,
  user_filter UUID DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  similarity float,
  owner_id uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.title,
    v.description,
    1 - (v.embedding <=> query_embedding) as similarity,
    v.owner_id,
    v.created_at
  FROM videos v
  WHERE 
    v.embedding IS NOT NULL 
    AND 1 - (v.embedding <=> query_embedding) > match_threshold
    AND (user_filter IS NULL OR v.owner_id = user_filter OR v.is_public = true)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Video table indexes
CREATE INDEX IF NOT EXISTS videos_owner_id_idx ON videos (owner_id);
CREATE INDEX IF NOT EXISTS videos_project_id_idx ON videos (project_id);
CREATE INDEX IF NOT EXISTS videos_status_idx ON videos (processing_status);
CREATE INDEX IF NOT EXISTS videos_public_idx ON videos (is_public);
CREATE INDEX IF NOT EXISTS videos_created_at_idx ON videos (created_at DESC);
CREATE INDEX IF NOT EXISTS videos_search_vector_idx ON videos USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS videos_embedding_idx ON videos USING hnsw (embedding vector_cosine_ops);

-- Video shares indexes
CREATE INDEX IF NOT EXISTS video_shares_video_id_idx ON video_shares (video_id);
CREATE INDEX IF NOT EXISTS video_shares_token_idx ON video_shares (share_token);
CREATE INDEX IF NOT EXISTS video_shares_user_id_idx ON video_shares (shared_by_user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS video_comments_video_id_idx ON video_comments (video_id);
CREATE INDEX IF NOT EXISTS video_comments_user_id_idx ON video_comments (user_id);
CREATE INDEX IF NOT EXISTS video_comments_parent_idx ON video_comments (parent_comment_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS video_analytics_video_id_idx ON video_analytics (video_id);
CREATE INDEX IF NOT EXISTS video_analytics_viewer_id_idx ON video_analytics (viewer_id);
CREATE INDEX IF NOT EXISTS video_analytics_session_idx ON video_analytics (session_id);
CREATE INDEX IF NOT EXISTS video_analytics_date_idx ON video_analytics (started_at DESC);

-- Templates indexes
CREATE INDEX IF NOT EXISTS video_templates_category_idx ON video_templates (category);
CREATE INDEX IF NOT EXISTS video_templates_public_idx ON video_templates (is_public);
CREATE INDEX IF NOT EXISTS video_templates_usage_idx ON video_templates (usage_count DESC);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'FreeFlow Video Features Migration V3.0 Complete!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'Added comprehensive video functionality:';
  RAISE NOTICE '- Video storage and processing pipeline';
  RAISE NOTICE '- Advanced sharing and permissions system';
  RAISE NOTICE '- Comment and feedback system';
  RAISE NOTICE '- Detailed analytics and insights';
  RAISE NOTICE '- AI-powered transcription and analysis';
  RAISE NOTICE '- Video templates for freelancer workflows';
  RAISE NOTICE '- Semantic search capabilities';
  RAISE NOTICE '- Production-ready security policies';
END $$; 