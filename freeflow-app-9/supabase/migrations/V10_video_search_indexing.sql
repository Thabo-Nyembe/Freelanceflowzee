-- Enable the pg_trgm extension for text search similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add transcript and search vector columns to videos table
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS transcript TEXT,
ADD COLUMN IF NOT EXISTS search_vector tsvector GENERATED ALWAYS AS (
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(transcript, '')), 'C')
) STORED;

-- Create GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS videos_search_vector_idx ON videos USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS videos_title_trgm_idx ON videos USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS videos_description_trgm_idx ON videos USING GIN (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS videos_transcript_trgm_idx ON videos USING GIN (transcript gin_trgm_ops);

-- Create a function to search videos
CREATE OR REPLACE FUNCTION search_videos(
  search_query TEXT,
  max_results INTEGER DEFAULT 20
) RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  view_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  project_id UUID,
  status TEXT,
  is_public BOOLEAN,
  mux_playback_id TEXT,
  mux_asset_id TEXT,
  transcript TEXT,
  search_rank FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.*,
    ts_rank(v.search_vector, websearch_to_tsquery('english', search_query)) +
    similarity(v.title, search_query) * 0.5 +
    similarity(v.description, search_query) * 0.3 +
    similarity(v.transcript, search_query) * 0.2 AS search_rank
  FROM videos v
  WHERE
    v.search_vector @@ websearch_to_tsquery('english', search_query) OR
    v.title % search_query OR
    v.description % search_query OR
    v.transcript % search_query
  ORDER BY search_rank DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to extract timestamps from transcript
CREATE OR REPLACE FUNCTION extract_transcript_timestamps(
  video_id UUID,
  search_query TEXT
) RETURNS TABLE (
  timestamp_start FLOAT,
  timestamp_end FLOAT,
  text TEXT,
  similarity FLOAT
) AS $$
DECLARE
  segment RECORD;
BEGIN
  FOR segment IN
    SELECT
      (regexp_matches(transcript, '\{("start":\s*(\d+\.?\d*),\s*"end":\s*(\d+\.?\d*),\s*"text":\s*"([^"]*)")}', 'g'))[2:4] AS parts
    FROM videos
    WHERE id = video_id
  LOOP
    IF similarity(segment.parts[3], search_query) > 0.3 THEN
      timestamp_start := segment.parts[1]::FLOAT;
      timestamp_end := segment.parts[2]::FLOAT;
      text := segment.parts[3];
      similarity := similarity(text, search_query);
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql; 