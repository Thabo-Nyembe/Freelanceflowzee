-- Migration: Add video AI features
-- Version: 5
-- Description: Add tables for video transcriptions, AI analysis, tags, and chapters

BEGIN;

-- Video Transcriptions Table
CREATE TABLE IF NOT EXISTS video_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  language VARCHAR(10),
  duration_seconds INTEGER,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  segments JSONB, -- Store timestamped segments
  format VARCHAR(20) DEFAULT 'text', -- text, srt, vtt, etc.
  processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  error_message TEXT,
  ai_model VARCHAR(50) DEFAULT 'whisper-1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_confidence_score CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  CONSTRAINT valid_processing_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Video AI Analysis Table
CREATE TABLE IF NOT EXISTS video_ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  transcription_id UUID REFERENCES video_transcriptions(id) ON DELETE SET NULL,
  
  -- Analysis results
  summary TEXT,
  main_topics TEXT[], -- Array of main topics
  category VARCHAR(50),
  difficulty VARCHAR(20), -- beginner, intermediate, advanced
  target_audience VARCHAR(100),
  key_insights TEXT[],
  action_items TEXT[],
  sentiment VARCHAR(20), -- positive, neutral, negative
  detected_language VARCHAR(10),
  estimated_watch_time VARCHAR(50),
  content_type VARCHAR(50),
  
  -- Metadata
  ai_model VARCHAR(50) DEFAULT 'gpt-4-turbo-preview',
  processing_status VARCHAR(20) DEFAULT 'pending',
  error_message TEXT,
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_difficulty CHECK (difficulty IS NULL OR difficulty IN ('beginner', 'intermediate', 'advanced')),
  CONSTRAINT valid_sentiment CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),
  CONSTRAINT valid_analysis_status CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'))
);

-- Video AI Tags Table  
CREATE TABLE IF NOT EXISTS video_ai_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES video_ai_analysis(id) ON DELETE SET NULL,
  
  -- Tag information
  tag VARCHAR(100) NOT NULL,
  category VARCHAR(50), -- technology, skill, industry, content_type, etc.
  confidence_score DECIMAL(3,2),
  source VARCHAR(50) DEFAULT 'ai_generated', -- ai_generated, manual, imported
  
  -- Metadata
  ai_model VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_tag_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  CONSTRAINT valid_tag_source CHECK (source IN ('ai_generated', 'manual', 'imported')),
  
  -- Unique constraint to prevent duplicate tags per video
  UNIQUE(video_id, tag)
);

-- Video Chapters Table
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  transcription_id UUID REFERENCES video_transcriptions(id) ON DELETE SET NULL,
  
  -- Chapter information
  title VARCHAR(200) NOT NULL,
  description TEXT,
  start_time DECIMAL(10,3) NOT NULL, -- Seconds with millisecond precision
  end_time DECIMAL(10,3), -- NULL for the last chapter
  chapter_order INTEGER NOT NULL,
  
  -- AI generation metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(50),
  confidence_score DECIMAL(3,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_chapter_times CHECK (start_time >= 0 AND (end_time IS NULL OR end_time > start_time)),
  CONSTRAINT valid_chapter_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
  
  -- Unique constraint for chapter order per video
  UNIQUE(video_id, chapter_order)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_video_id ON video_transcriptions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_status ON video_transcriptions(processing_status);
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_language ON video_transcriptions(language);

CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_video_id ON video_ai_analysis(video_id);
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_status ON video_ai_analysis(processing_status);
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_category ON video_ai_analysis(category);
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_difficulty ON video_ai_analysis(difficulty);

CREATE INDEX IF NOT EXISTS idx_video_ai_tags_video_id ON video_ai_tags(video_id);
CREATE INDEX IF NOT EXISTS idx_video_ai_tags_tag ON video_ai_tags(tag);
CREATE INDEX IF NOT EXISTS idx_video_ai_tags_category ON video_ai_tags(category);
CREATE INDEX IF NOT EXISTS idx_video_ai_tags_source ON video_ai_tags(source);

CREATE INDEX IF NOT EXISTS idx_video_chapters_video_id ON video_chapters(video_id);
CREATE INDEX IF NOT EXISTS idx_video_chapters_order ON video_chapters(video_id, chapter_order);
CREATE INDEX IF NOT EXISTS idx_video_chapters_times ON video_chapters(video_id, start_time);

-- GIN indexes for array and JSONB columns
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_topics ON video_ai_analysis USING GIN (main_topics);
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_insights ON video_ai_analysis USING GIN (key_insights);
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_segments ON video_transcriptions USING GIN (segments);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_video_transcriptions_text_search ON video_transcriptions USING GIN (to_tsvector('english', text));
CREATE INDEX IF NOT EXISTS idx_video_ai_analysis_summary_search ON video_ai_analysis USING GIN (to_tsvector('english', summary));

-- Add AI-related columns to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS ai_processing_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_processing_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS has_transcription BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_ai_analysis BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_ai_tags BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_ai_chapters BOOLEAN DEFAULT false;

-- Add constraint for AI processing status
ALTER TABLE videos 
ADD CONSTRAINT IF NOT EXISTS valid_ai_processing_status 
CHECK (ai_processing_status IN ('pending', 'processing', 'completed', 'failed', 'disabled'));

-- Create index for AI processing status
CREATE INDEX IF NOT EXISTS idx_videos_ai_processing_status ON videos(ai_processing_status);

-- RLS Policies for AI tables

-- Video Transcriptions - Users can see transcriptions for their own videos and public videos
ALTER TABLE video_transcriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transcriptions for their videos"
ON video_transcriptions FOR SELECT
USING (
  video_id IN (
    SELECT id FROM videos 
    WHERE owner_id = auth.uid() 
    OR (is_public = true AND status = 'ready')
  )
);

CREATE POLICY "Users can manage transcriptions for their videos"
ON video_transcriptions FOR ALL
USING (
  video_id IN (
    SELECT id FROM videos WHERE owner_id = auth.uid()
  )
);

-- Video AI Analysis - Same access pattern as transcriptions
ALTER TABLE video_ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI analysis for accessible videos"
ON video_ai_analysis FOR SELECT
USING (
  video_id IN (
    SELECT id FROM videos 
    WHERE owner_id = auth.uid() 
    OR (is_public = true AND status = 'ready')
  )
);

CREATE POLICY "Users can manage AI analysis for their videos"
ON video_ai_analysis FOR ALL
USING (
  video_id IN (
    SELECT id FROM videos WHERE owner_id = auth.uid()
  )
);

-- Video AI Tags - Same access pattern
ALTER TABLE video_ai_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view AI tags for accessible videos"
ON video_ai_tags FOR SELECT
USING (
  video_id IN (
    SELECT id FROM videos 
    WHERE owner_id = auth.uid() 
    OR (is_public = true AND status = 'ready')
  )
);

CREATE POLICY "Users can manage AI tags for their videos"
ON video_ai_tags FOR ALL
USING (
  video_id IN (
    SELECT id FROM videos WHERE owner_id = auth.uid()
  )
);

-- Video Chapters - Same access pattern
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chapters for accessible videos"
ON video_chapters FOR SELECT
USING (
  video_id IN (
    SELECT id FROM videos 
    WHERE owner_id = auth.uid() 
    OR (is_public = true AND status = 'ready')
  )
);

CREATE POLICY "Users can manage chapters for their videos"
ON video_chapters FOR ALL
USING (
  video_id IN (
    SELECT id FROM videos WHERE owner_id = auth.uid()
  )
);

-- Utility functions for AI processing

-- Function to get video transcription with search capability
CREATE OR REPLACE FUNCTION search_video_transcriptions(
  search_query TEXT,
  user_id_param UUID DEFAULT NULL,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
  video_id UUID,
  video_title TEXT,
  transcription_text TEXT,
  language VARCHAR(10),
  confidence_score DECIMAL(3,2),
  rank REAL
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vt.video_id,
    v.title,
    vt.text,
    vt.language,
    vt.confidence_score,
    ts_rank(to_tsvector('english', vt.text), plainto_tsquery('english', search_query)) as rank
  FROM video_transcriptions vt
  JOIN videos v ON vt.video_id = v.id
  WHERE 
    vt.processing_status = 'completed'
    AND to_tsvector('english', vt.text) @@ plainto_tsquery('english', search_query)
    AND (
      user_id_param IS NULL 
      OR v.owner_id = user_id_param 
      OR (v.is_public = true AND v.status = 'ready')
    )
  ORDER BY rank DESC
  LIMIT limit_param;
END;
$$;

-- Function to get AI insights summary for a user's videos
CREATE OR REPLACE FUNCTION get_user_ai_insights(user_id_param UUID)
RETURNS TABLE (
  total_videos INTEGER,
  transcribed_videos INTEGER,
  analyzed_videos INTEGER,
  top_categories TEXT[],
  top_tags TEXT[],
  avg_confidence DECIMAL(3,2)
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT v.id)::INTEGER as total_videos,
    COUNT(DISTINCT vt.video_id)::INTEGER as transcribed_videos,
    COUNT(DISTINCT va.video_id)::INTEGER as analyzed_videos,
    ARRAY(
      SELECT va2.category 
      FROM video_ai_analysis va2 
      JOIN videos v2 ON va2.video_id = v2.id 
      WHERE v2.owner_id = user_id_param 
        AND va2.category IS NOT NULL 
      GROUP BY va2.category 
      ORDER BY COUNT(*) DESC 
      LIMIT 5
    ) as top_categories,
    ARRAY(
      SELECT vt2.tag 
      FROM video_ai_tags vt2 
      JOIN videos v3 ON vt2.video_id = v3.id 
      WHERE v3.owner_id = user_id_param 
        AND vt2.source = 'ai_generated' 
      GROUP BY vt2.tag 
      ORDER BY COUNT(*) DESC 
      LIMIT 10
    ) as top_tags,
    AVG(va3.confidence_score) as avg_confidence
  FROM videos v
  LEFT JOIN video_transcriptions vt ON v.id = vt.video_id AND vt.processing_status = 'completed'
  LEFT JOIN video_ai_analysis va ON v.id = va.video_id AND va.processing_status = 'completed'
  LEFT JOIN video_ai_analysis va3 ON v.id = va3.video_id AND va3.processing_status = 'completed'
  WHERE v.owner_id = user_id_param;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION search_video_transcriptions(TEXT, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_ai_insights(UUID) TO authenticated;

-- Add helpful comments
COMMENT ON TABLE video_transcriptions IS 'Stores AI-generated transcriptions for videos';
COMMENT ON TABLE video_ai_analysis IS 'Stores AI-generated content analysis and insights';
COMMENT ON TABLE video_ai_tags IS 'Stores AI-generated and manual tags for videos';
COMMENT ON TABLE video_chapters IS 'Stores video chapters, both AI-generated and manual';

COMMENT ON COLUMN videos.ai_processing_status IS 'Overall AI processing status for the video';
COMMENT ON COLUMN videos.has_transcription IS 'Whether the video has a completed transcription';
COMMENT ON COLUMN videos.has_ai_analysis IS 'Whether the video has completed AI analysis';

COMMIT; 