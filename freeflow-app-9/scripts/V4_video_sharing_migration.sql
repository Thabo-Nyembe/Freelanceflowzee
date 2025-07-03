-- Migration: Add video sharing columns
-- Version: 4
-- Description: Add columns for video sharing, privacy, and embedding features

BEGIN;

-- Add sharing-related columns to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS allow_embedding BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_download BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS password VARCHAR(255) DEFAULT NULL;

-- Create index for public videos for faster sharing queries
CREATE INDEX IF NOT EXISTS idx_videos_public_status 
ON videos(is_public, status) 
WHERE is_public = true AND status = 'ready';

-- Create index for embedding-allowed videos
CREATE INDEX IF NOT EXISTS idx_videos_embedding 
ON videos(allow_embedding, is_public) 
WHERE allow_embedding = true AND is_public = true;

-- Update existing videos to have sensible defaults
UPDATE videos 
SET 
  allow_embedding = true,
  allow_download = false
WHERE 
  allow_embedding IS NULL 
  OR allow_download IS NULL;

-- Add RLS policies for public video sharing
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON videos;
CREATE POLICY "Public videos are viewable by everyone"
ON videos FOR SELECT
USING (is_public = true AND status = 'ready');

-- Add RLS policy for embedding
DROP POLICY IF EXISTS "Embeddable videos are accessible for embedding" ON videos;
CREATE POLICY "Embeddable videos are accessible for embedding"
ON videos FOR SELECT
USING (is_public = true AND allow_embedding = true AND status = 'ready');

-- Create a function to safely get public video info (without sensitive data)
CREATE OR REPLACE FUNCTION get_public_video_info(video_uuid UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  mux_playback_id TEXT,
  duration_seconds INTEGER,
  view_count INTEGER,
  status video_status,
  created_at TIMESTAMPTZ,
  owner_name TEXT,
  allow_embedding BOOLEAN
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.title,
    v.description,
    v.thumbnail_url,
    v.mux_playback_id,
    v.duration_seconds,
    v.view_count,
    v.status,
    v.created_at,
    p.full_name,
    v.allow_embedding
  FROM videos v
  LEFT JOIN profiles p ON v.owner_id = p.id
  WHERE v.id = video_uuid 
    AND v.is_public = true 
    AND v.status = 'ready';
END;
$$;

-- Create a function to increment view count safely
CREATE OR REPLACE FUNCTION increment_video_view_count(video_uuid UUID)
RETURNS void
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE videos 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = video_uuid 
    AND is_public = true 
    AND status = 'ready';
END;
$$;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION get_public_video_info(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_video_view_count(UUID) TO anon, authenticated;

-- Add helpful comments
COMMENT ON COLUMN videos.allow_embedding IS 'Whether this video can be embedded on external websites';
COMMENT ON COLUMN videos.allow_download IS 'Whether viewers can download this video';
COMMENT ON COLUMN videos.password IS 'Password for password-protected videos (hashed)';

COMMIT; 