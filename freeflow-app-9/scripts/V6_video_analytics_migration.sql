-- V6_video_analytics_migration.sql

-- Drop existing tables and types if they exist, for a clean setup
DROP TABLE IF EXISTS video_views CASCADE;
DROP TABLE IF EXISTS video_watch_time CASCADE;
DROP TABLE IF EXISTS video_engagement_events CASCADE;
DROP TABLE IF EXISTS video_daily_analytics CASCADE;
DROP TABLE IF EXISTS video_analytics_summary CASCADE;
DROP TYPE IF EXISTS engagement_event_type;

-- Create a custom type for engagement events
CREATE TYPE engagement_event_type AS ENUM (
  'play', 'pause', 'seek', 'ended', 'like', 'share', 'comment', 'replay'
);

-- Table to track individual video views
CREATE TABLE video_views (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  country TEXT,
  referrer TEXT,
  
  UNIQUE (video_id, user_id, ip_address, viewed_at)
);
COMMENT ON TABLE video_views IS 'Tracks individual views for each video, including anonymous and authenticated users.';

-- Table to store detailed watch time data
CREATE TABLE video_watch_time (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  view_id BIGINT NOT NULL REFERENCES video_views(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  start_time_seconds INT NOT NULL,
  end_time_seconds INT NOT NULL,
  duration_watched_seconds INT GENERATED ALWAYS AS (end_time_seconds - start_time_seconds) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE video_watch_time IS 'Stores detailed watch time segments for each video view.';

-- Table to track specific engagement events
CREATE TABLE video_engagement_events (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  view_id BIGINT NOT NULL REFERENCES video_views(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type engagement_event_type NOT NULL,
  event_timestamp_seconds INT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
COMMENT ON TABLE video_engagement_events IS 'Tracks user engagement events like plays, pauses, likes, and shares.';

-- Table for pre-aggregated daily analytics
CREATE TABLE video_daily_analytics (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  analytics_date DATE NOT NULL,
  total_views INT DEFAULT 0,
  unique_viewers INT DEFAULT 0,
  total_watch_time_seconds INT DEFAULT 0,
  average_view_duration_seconds INT DEFAULT 0,
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,
  
  UNIQUE (video_id, analytics_date)
);
COMMENT ON TABLE video_daily_analytics IS 'Pre-aggregated daily analytics for faster dashboard loading.';

-- Table for overall video analytics summary
CREATE TABLE video_analytics_summary (
  video_id UUID PRIMARY KEY REFERENCES videos(id) ON DELETE CASCADE,
  total_views BIGINT DEFAULT 0,
  total_watch_time_seconds BIGINT DEFAULT 0,
  average_watch_time_seconds NUMERIC(10, 2) DEFAULT 0,
  completion_rate NUMERIC(5, 2) DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_shares BIGINT DEFAULT 0,
  total_comments BIGINT DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE video_analytics_summary IS 'Overall summary of analytics for each video.';

-- Add new analytics columns to the videos table
ALTER TABLE videos
  ADD COLUMN IF NOT EXISTS total_views INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_likes INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_shares INT DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_video_views_video_id ON video_views(video_id);
CREATE INDEX idx_video_views_user_id ON video_views(user_id);
CREATE INDEX idx_video_watch_time_video_id ON video_watch_time(video_id);
CREATE INDEX idx_video_engagement_events_video_id ON video_engagement_events(video_id);
CREATE INDEX idx_video_engagement_events_event_type ON video_engagement_events(event_type);
CREATE INDEX idx_video_daily_analytics_video_id_date ON video_daily_analytics(video_id, analytics_date);

-- Utility function to track a video view
CREATE OR REPLACE FUNCTION track_video_view(
  p_video_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  v_view_id BIGINT;
BEGIN
  INSERT INTO video_views (video_id, user_id, ip_address, user_agent, country, referrer)
  VALUES (p_video_id, p_user_id, p_ip_address, p_user_agent, p_country, p_referrer)
  RETURNING id INTO v_view_id;
  
  -- Update summary table
  UPDATE video_analytics_summary
  SET total_views = total_views + 1
  WHERE video_id = p_video_id;

  -- If no summary exists, create one
  IF NOT FOUND THEN
    INSERT INTO video_analytics_summary (video_id, total_views)
    VALUES (p_video_id, 1);
  END IF;

  RETURN v_view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Utility function to record watch time
CREATE OR REPLACE FUNCTION record_watch_time(
  p_view_id BIGINT,
  p_start_time INT,
  p_end_time INT
) RETURNS VOID AS $$
DECLARE
  v_video_id UUID;
BEGIN
  SELECT video_id INTO v_video_id FROM video_views WHERE id = p_view_id;

  INSERT INTO video_watch_time (view_id, video_id, user_id, start_time_seconds, end_time_seconds)
  SELECT p_view_id, v_video_id, user_id, p_start_time, p_end_time FROM video_views WHERE id = p_view_id;

  -- Update summary table
  UPDATE video_analytics_summary
  SET total_watch_time_seconds = total_watch_time_seconds + (p_end_time - p_start_time)
  WHERE video_id = v_video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row-Level Security Policies
ALTER TABLE video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_watch_time ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_daily_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to see their own analytics data
CREATE POLICY "Allow individual user access to their own analytics"
ON video_views FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow video owners to see all analytics for their videos
CREATE POLICY "Allow video owner to see all analytics"
ON video_views FOR SELECT
USING (EXISTS (
  SELECT 1 FROM videos WHERE videos.id = video_views.video_id AND videos.user_id = auth.uid()
));

-- Replicate similar policies for other analytics tables
CREATE POLICY "Allow individual user access to their own watch time"
ON video_watch_time FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow video owner to see all watch time"
ON video_watch_time FOR SELECT USING (EXISTS (
  SELECT 1 FROM videos WHERE videos.id = video_watch_time.video_id AND videos.user_id = auth.uid()
));

CREATE POLICY "Allow individual user access to their own engagement events"
ON video_engagement_events FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow video owner to see all engagement events"
ON video_engagement_events FOR SELECT USING (EXISTS (
  SELECT 1 FROM videos WHERE videos.id = video_engagement_events.video_id AND videos.user_id = auth.uid()
));

-- Grant usage on the new type
GRANT USAGE ON TYPE engagement_event_type TO authenticated, service_role;
GRANT ALL ON TABLE video_views TO authenticated, service_role;
GRANT ALL ON TABLE video_watch_time TO authenticated, service_role;
GRANT ALL ON TABLE video_engagement_events TO authenticated, service_role;
GRANT ALL ON TABLE video_daily_analytics TO authenticated, service_role;
GRANT ALL ON TABLE video_analytics_summary TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION track_video_view(UUID, UUID, INET, TEXT, TEXT, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_watch_time(BIGINT, INT, INT) TO authenticated, service_role;
