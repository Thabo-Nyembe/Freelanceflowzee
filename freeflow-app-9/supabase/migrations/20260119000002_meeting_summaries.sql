-- Meeting Summaries Table - FreeFlow A+++ Implementation
-- AI-powered meeting intelligence storage

-- Create meeting_summaries table
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL,

  -- Summary content
  title TEXT NOT NULL,
  executive_summary TEXT NOT NULL,
  detailed_summary TEXT,
  bullet_points TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Extracted intelligence (JSONB for flexibility)
  action_items JSONB DEFAULT '[]'::JSONB,
  decisions JSONB DEFAULT '[]'::JSONB,
  topics JSONB DEFAULT '[]'::JSONB,
  questions JSONB DEFAULT '[]'::JSONB,
  follow_ups JSONB DEFAULT '[]'::JSONB,

  -- Analytics
  speaker_analytics JSONB DEFAULT '[]'::JSONB,
  sentiment JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  duration INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 1,
  language TEXT NOT NULL DEFAULT 'en',
  processing_time INTEGER NOT NULL DEFAULT 0,
  model TEXT NOT NULL DEFAULT 'gpt-4o',
  confidence DECIMAL(3, 2) NOT NULL DEFAULT 0.85,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_user_id
  ON meeting_summaries(user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_summaries_meeting_id
  ON meeting_summaries(meeting_id)
  WHERE meeting_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_meeting_summaries_created_at
  ON meeting_summaries(created_at DESC);

-- Full-text search on title and summaries
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_search
  ON meeting_summaries USING gin(
    to_tsvector('english', title || ' ' || COALESCE(executive_summary, '') || ' ' || COALESCE(detailed_summary, ''))
  );

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_meeting_summaries_action_items
  ON meeting_summaries USING gin(action_items);

CREATE INDEX IF NOT EXISTS idx_meeting_summaries_decisions
  ON meeting_summaries USING gin(decisions);

-- Enable RLS
ALTER TABLE meeting_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own meeting summaries"
  ON meeting_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting summaries"
  ON meeting_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting summaries"
  ON meeting_summaries
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting summaries"
  ON meeting_summaries
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_meeting_summaries_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_meeting_summaries_updated ON meeting_summaries;
CREATE TRIGGER trigger_meeting_summaries_updated
  BEFORE UPDATE ON meeting_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_summaries_timestamp();

-- Function to search meeting summaries
CREATE OR REPLACE FUNCTION search_meeting_summaries(
  search_query TEXT,
  user_id_param UUID,
  limit_param INTEGER DEFAULT 20
)
RETURNS SETOF meeting_summaries AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM meeting_summaries ms
  WHERE ms.user_id = user_id_param
    AND (
      to_tsvector('english', ms.title || ' ' || COALESCE(ms.executive_summary, '') || ' ' || COALESCE(ms.detailed_summary, ''))
      @@ plainto_tsquery('english', search_query)
    )
  ORDER BY ts_rank(
    to_tsvector('english', ms.title || ' ' || COALESCE(ms.executive_summary, '') || ' ' || COALESCE(ms.detailed_summary, '')),
    plainto_tsquery('english', search_query)
  ) DESC
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get pending action items
CREATE OR REPLACE FUNCTION get_pending_action_items(user_id_param UUID)
RETURNS TABLE (
  summary_id TEXT,
  summary_title TEXT,
  action_item JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ms.id AS summary_id,
    ms.title AS summary_title,
    ai AS action_item,
    ms.created_at
  FROM meeting_summaries ms,
       jsonb_array_elements(ms.action_items) AS ai
  WHERE ms.user_id = user_id_param
    AND (ai->>'status') = 'pending'
  ORDER BY
    CASE (ai->>'priority')
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      WHEN 'medium' THEN 3
      WHEN 'low' THEN 4
      ELSE 5
    END,
    ms.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get meeting analytics
CREATE OR REPLACE FUNCTION get_meeting_analytics(
  user_id_param UUID,
  days_param INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_meetings BIGINT,
  total_duration BIGINT,
  avg_duration NUMERIC,
  total_action_items BIGINT,
  total_decisions BIGINT,
  avg_sentiment NUMERIC,
  top_topics JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT AS total_meetings,
    SUM(ms.duration)::BIGINT AS total_duration,
    AVG(ms.duration)::NUMERIC AS avg_duration,
    SUM(jsonb_array_length(ms.action_items))::BIGINT AS total_action_items,
    SUM(jsonb_array_length(ms.decisions))::BIGINT AS total_decisions,
    AVG((ms.sentiment->>'score')::NUMERIC)::NUMERIC AS avg_sentiment,
    (
      SELECT jsonb_agg(DISTINCT topic_data)
      FROM (
        SELECT jsonb_array_elements(ms2.topics) AS topic_data
        FROM meeting_summaries ms2
        WHERE ms2.user_id = user_id_param
          AND ms2.created_at >= now() - (days_param || ' days')::INTERVAL
        LIMIT 10
      ) topics_subq
    ) AS top_topics
  FROM meeting_summaries ms
  WHERE ms.user_id = user_id_param
    AND ms.created_at >= now() - (days_param || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON meeting_summaries TO authenticated;
GRANT EXECUTE ON FUNCTION search_meeting_summaries TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_action_items TO authenticated;
GRANT EXECUTE ON FUNCTION get_meeting_analytics TO authenticated;

COMMENT ON TABLE meeting_summaries IS 'AI-generated meeting summaries with action items, decisions, and analytics';
