-- Analytics Events Table
-- Tracks all user interactions for marketing analytics

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert events (for anonymous tracking)
CREATE POLICY "Anyone can insert analytics events"
  ON analytics_events FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Users can view their own events
CREATE POLICY "Users can view own analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function: Get popular pages
CREATE OR REPLACE FUNCTION get_popular_pages(days INT DEFAULT 7)
RETURNS TABLE (
  page TEXT,
  views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    properties->>'pathname' AS page,
    COUNT(*) AS views
  FROM analytics_events
  WHERE event_name = 'page_view'
    AND created_at >= NOW() - (days || ' days')::INTERVAL
    AND properties->>'pathname' IS NOT NULL
  GROUP BY properties->>'pathname'
  ORDER BY views DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get conversion funnel
CREATE OR REPLACE FUNCTION get_conversion_funnel(days INT DEFAULT 7)
RETURNS TABLE (
  step TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    event_name AS step,
    COUNT(DISTINCT session_id) AS count
  FROM analytics_events
  WHERE event_name IN ('page_view', 'signup_start', 'signup_complete', 'trial_start', 'checkout_complete')
    AND created_at >= NOW() - (days || ' days')::INTERVAL
  GROUP BY event_name
  ORDER BY
    CASE event_name
      WHEN 'page_view' THEN 1
      WHEN 'signup_start' THEN 2
      WHEN 'signup_complete' THEN 3
      WHEN 'trial_start' THEN 4
      WHEN 'checkout_complete' THEN 5
      ELSE 6
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get real-time stats
CREATE OR REPLACE FUNCTION get_realtime_stats()
RETURNS JSON AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'active_users_24h', (
      SELECT COUNT(DISTINCT session_id)
      FROM analytics_events
      WHERE created_at >= NOW() - INTERVAL '24 hours'
    ),
    'events_today', (
      SELECT COUNT(*)
      FROM analytics_events
      WHERE DATE(created_at) = CURRENT_DATE
    ),
    'signups_today', (
      SELECT COUNT(DISTINCT session_id)
      FROM analytics_events
      WHERE event_name = 'signup_complete'
        AND DATE(created_at) = CURRENT_DATE
    ),
    'top_event_today', (
      SELECT event_name
      FROM analytics_events
      WHERE DATE(created_at) = CURRENT_DATE
      GROUP BY event_name
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  ) INTO stats;

  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old events (90 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_analytics_events()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments
COMMENT ON TABLE analytics_events IS 'Marketing and user interaction analytics';
COMMENT ON COLUMN analytics_events.event_name IS 'Type of event (page_view, button_click, etc.)';
COMMENT ON COLUMN analytics_events.session_id IS 'Anonymous session identifier';
COMMENT ON COLUMN analytics_events.properties IS 'Event metadata (pathname, referrer, etc.)';
