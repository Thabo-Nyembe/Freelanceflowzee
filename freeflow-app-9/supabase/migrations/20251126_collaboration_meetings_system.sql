-- =====================================================
-- COLLABORATION MEETINGS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive meeting management with video conferencing,
-- screen sharing, recording, participant controls, and analytics
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE meeting_type AS ENUM (
  'video',
  'voice',
  'screen-share'
);

CREATE TYPE meeting_status AS ENUM (
  'scheduled',
  'ongoing',
  'completed',
  'cancelled'
);

CREATE TYPE participant_role AS ENUM (
  'host',
  'co-host',
  'participant',
  'guest'
);

CREATE TYPE view_mode AS ENUM (
  'grid',
  'speaker',
  'sidebar',
  'fullscreen'
);

CREATE TYPE meeting_recurrence AS ENUM (
  'none',
  'daily',
  'weekly',
  'biweekly',
  'monthly'
);

CREATE TYPE recording_quality AS ENUM (
  'low',
  'medium',
  'high',
  'hd'
);

CREATE TYPE connection_quality AS ENUM (
  'excellent',
  'good',
  'fair',
  'poor'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60,
  type meeting_type NOT NULL DEFAULT 'video',
  status meeting_status NOT NULL DEFAULT 'scheduled',
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 25,
  meeting_link TEXT,
  passcode TEXT,
  recording_url TEXT,
  is_recording BOOLEAN NOT NULL DEFAULT false,
  recording_started_at TIMESTAMPTZ,
  recording_duration INTEGER,
  recurrence meeting_recurrence NOT NULL DEFAULT 'none',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  reminders INTEGER[] DEFAULT '{15,30,60}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Participants
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role participant_role NOT NULL DEFAULT 'participant',
  is_host BOOLEAN NOT NULL DEFAULT false,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_off BOOLEAN NOT NULL DEFAULT false,
  is_hand_raised BOOLEAN NOT NULL DEFAULT false,
  is_screen_sharing BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  total_duration INTEGER,
  connection_quality connection_quality DEFAULT 'good',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Recordings
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT NOT NULL DEFAULT 0,
  quality recording_quality NOT NULL DEFAULT 'medium',
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  transcript_url TEXT,
  highlights_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Analytics
CREATE TABLE meeting_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_participants INTEGER NOT NULL DEFAULT 0,
  peak_participants INTEGER NOT NULL DEFAULT 0,
  average_duration INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0,
  join_rate DECIMAL(5, 2) DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) DEFAULT 0,
  average_connection_quality TEXT,
  chat_messages INTEGER NOT NULL DEFAULT 0,
  hand_raises INTEGER NOT NULL DEFAULT 0,
  screen_shares INTEGER NOT NULL DEFAULT 0,
  recording_views INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Stats (aggregated statistics)
CREATE TABLE meeting_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_meetings INTEGER NOT NULL DEFAULT 0,
  upcoming_meetings INTEGER NOT NULL DEFAULT 0,
  ongoing_meetings INTEGER NOT NULL DEFAULT 0,
  completed_meetings INTEGER NOT NULL DEFAULT 0,
  cancelled_meetings INTEGER NOT NULL DEFAULT 0,
  total_hours DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_participants INTEGER NOT NULL DEFAULT 0,
  average_participants DECIMAL(10, 2) DEFAULT 0,
  total_recordings INTEGER NOT NULL DEFAULT 0,
  type_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Meeting Chat Messages
CREATE TABLE meeting_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT false,
  recipient_id UUID REFERENCES meeting_participants(id) ON DELETE SET NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting Polls
CREATE TABLE meeting_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES meeting_participants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  ends_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Meetings Indexes
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_type ON meetings(type);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_scheduled_date ON meetings(scheduled_date DESC);
CREATE INDEX idx_meetings_scheduled_time ON meetings(scheduled_time);
CREATE INDEX idx_meetings_recurrence ON meetings(recurrence);
CREATE INDEX idx_meetings_is_recording ON meetings(is_recording);
CREATE INDEX idx_meetings_title_search ON meetings USING GIN(to_tsvector('english', title));
CREATE INDEX idx_meetings_description_search ON meetings USING GIN(to_tsvector('english', description));
CREATE INDEX idx_meetings_settings ON meetings USING GIN(settings);
CREATE INDEX idx_meetings_created_at ON meetings(created_at DESC);

-- Meeting Participants Indexes
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX idx_meeting_participants_role ON meeting_participants(role);
CREATE INDEX idx_meeting_participants_is_host ON meeting_participants(is_host);
CREATE INDEX idx_meeting_participants_joined_at ON meeting_participants(joined_at DESC);
CREATE INDEX idx_meeting_participants_connection_quality ON meeting_participants(connection_quality);
CREATE INDEX idx_meeting_participants_name_search ON meeting_participants USING GIN(to_tsvector('english', name));
CREATE INDEX idx_meeting_participants_created_at ON meeting_participants(created_at DESC);

-- Meeting Recordings Indexes
CREATE INDEX idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);
CREATE INDEX idx_meeting_recordings_user_id ON meeting_recordings(user_id);
CREATE INDEX idx_meeting_recordings_quality ON meeting_recordings(quality);
CREATE INDEX idx_meeting_recordings_started_at ON meeting_recordings(started_at DESC);
CREATE INDEX idx_meeting_recordings_duration ON meeting_recordings(duration DESC);
CREATE INDEX idx_meeting_recordings_file_size ON meeting_recordings(file_size DESC);
CREATE INDEX idx_meeting_recordings_view_count ON meeting_recordings(view_count DESC);
CREATE INDEX idx_meeting_recordings_title_search ON meeting_recordings USING GIN(to_tsvector('english', title));
CREATE INDEX idx_meeting_recordings_created_at ON meeting_recordings(created_at DESC);

-- Meeting Analytics Indexes
CREATE INDEX idx_meeting_analytics_meeting_id ON meeting_analytics(meeting_id);
CREATE INDEX idx_meeting_analytics_user_id ON meeting_analytics(user_id);
CREATE INDEX idx_meeting_analytics_total_participants ON meeting_analytics(total_participants DESC);
CREATE INDEX idx_meeting_analytics_peak_participants ON meeting_analytics(peak_participants DESC);
CREATE INDEX idx_meeting_analytics_created_at ON meeting_analytics(created_at DESC);

-- Meeting Stats Indexes
CREATE INDEX idx_meeting_stats_user_id ON meeting_stats(user_id);
CREATE INDEX idx_meeting_stats_date ON meeting_stats(date DESC);
CREATE INDEX idx_meeting_stats_total_meetings ON meeting_stats(total_meetings DESC);
CREATE INDEX idx_meeting_stats_total_hours ON meeting_stats(total_hours DESC);
CREATE INDEX idx_meeting_stats_created_at ON meeting_stats(created_at DESC);

-- Meeting Chat Messages Indexes
CREATE INDEX idx_meeting_chat_messages_meeting_id ON meeting_chat_messages(meeting_id);
CREATE INDEX idx_meeting_chat_messages_participant_id ON meeting_chat_messages(participant_id);
CREATE INDEX idx_meeting_chat_messages_is_private ON meeting_chat_messages(is_private);
CREATE INDEX idx_meeting_chat_messages_created_at ON meeting_chat_messages(created_at DESC);

-- Meeting Polls Indexes
CREATE INDEX idx_meeting_polls_meeting_id ON meeting_polls(meeting_id);
CREATE INDEX idx_meeting_polls_created_by ON meeting_polls(created_by);
CREATE INDEX idx_meeting_polls_created_at ON meeting_polls(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_participants_updated_at
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_recordings_updated_at
  BEFORE UPDATE ON meeting_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_analytics_updated_at
  BEFORE UPDATE ON meeting_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_stats_updated_at
  BEFORE UPDATE ON meeting_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meeting_polls_updated_at
  BEFORE UPDATE ON meeting_polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track participant duration
CREATE OR REPLACE FUNCTION track_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    NEW.total_duration = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_participant_duration
  BEFORE UPDATE ON meeting_participants
  FOR EACH ROW
  EXECUTE FUNCTION track_participant_duration();

-- Track recording duration
CREATE OR REPLACE FUNCTION track_recording_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_recording_duration
  BEFORE UPDATE ON meeting_recordings
  FOR EACH ROW
  EXECUTE FUNCTION track_recording_duration();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get meeting statistics
CREATE OR REPLACE FUNCTION get_meeting_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalMeetings', COUNT(*),
    'upcomingMeetings', COUNT(*) FILTER (WHERE status = 'scheduled'),
    'ongoingMeetings', COUNT(*) FILTER (WHERE status = 'ongoing'),
    'completedMeetings', COUNT(*) FILTER (WHERE status = 'completed'),
    'cancelledMeetings', COUNT(*) FILTER (WHERE status = 'cancelled'),
    'totalHours', ROUND(SUM(duration) / 60.0, 2),
    'totalRecordings', COUNT(*) FILTER (WHERE recording_url IS NOT NULL),
    'byType', (
      SELECT json_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) as cnt
        FROM meetings
        WHERE user_id = p_user_id
        GROUP BY type
      ) type_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM meetings
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    )
  ) INTO v_stats
  FROM meetings
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search meetings
CREATE OR REPLACE FUNCTION search_meetings(
  p_user_id UUID,
  p_search_term TEXT,
  p_type meeting_type DEFAULT NULL,
  p_status meeting_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  type meeting_type,
  status meeting_status,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.scheduled_date,
    m.scheduled_time,
    m.type,
    m.status,
    ts_rank(
      to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM meetings m
  WHERE m.user_id = p_user_id
    AND (p_type IS NULL OR m.type = p_type)
    AND (p_status IS NULL OR m.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', m.title || ' ' || COALESCE(m.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, m.scheduled_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Start meeting
CREATE OR REPLACE FUNCTION start_meeting(p_meeting_id UUID)
RETURNS JSON AS $$
DECLARE
  v_meeting meetings%ROWTYPE;
BEGIN
  UPDATE meetings
  SET
    status = 'ongoing',
    updated_at = NOW()
  WHERE id = p_meeting_id
  RETURNING * INTO v_meeting;

  RETURN json_build_object(
    'success', true,
    'meetingId', v_meeting.id,
    'meetingLink', v_meeting.meeting_link
  );
END;
$$ LANGUAGE plpgsql;

-- End meeting
CREATE OR REPLACE FUNCTION end_meeting(p_meeting_id UUID)
RETURNS JSON AS $$
BEGIN
  UPDATE meetings
  SET
    status = 'completed',
    is_recording = false,
    updated_at = NOW()
  WHERE id = p_meeting_id;

  -- Mark all participants as left
  UPDATE meeting_participants
  SET
    left_at = NOW(),
    updated_at = NOW()
  WHERE meeting_id = p_meeting_id AND left_at IS NULL;

  RETURN json_build_object('success', true, 'meetingId', p_meeting_id);
END;
$$ LANGUAGE plpgsql;

-- Add participant
CREATE OR REPLACE FUNCTION add_participant(
  p_meeting_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role participant_role DEFAULT 'participant'
)
RETURNS UUID AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  INSERT INTO meeting_participants (
    meeting_id, user_id, name, email, role,
    is_host, joined_at
  )
  VALUES (
    p_meeting_id, p_user_id, p_name, p_email, p_role,
    (p_role = 'host'), NOW()
  )
  RETURNING id INTO v_participant_id;

  RETURN v_participant_id;
END;
$$ LANGUAGE plpgsql;

-- Get meeting analytics
CREATE OR REPLACE FUNCTION get_meeting_analytics(p_meeting_id UUID)
RETURNS JSON AS $$
DECLARE
  v_analytics JSON;
BEGIN
  SELECT json_build_object(
    'totalParticipants', COUNT(DISTINCT mp.id),
    'peakParticipants', (
      SELECT COUNT(*)
      FROM meeting_participants
      WHERE meeting_id = p_meeting_id
      AND joined_at IS NOT NULL
    ),
    'averageDuration', ROUND(AVG(mp.total_duration), 2),
    'totalDuration', SUM(mp.total_duration),
    'chatMessages', (
      SELECT COUNT(*) FROM meeting_chat_messages WHERE meeting_id = p_meeting_id
    ),
    'handRaises', COUNT(*) FILTER (WHERE mp.is_hand_raised),
    'screenShares', COUNT(*) FILTER (WHERE mp.is_screen_sharing)
  ) INTO v_analytics
  FROM meeting_participants mp
  WHERE mp.meeting_id = p_meeting_id;

  RETURN v_analytics;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings
CREATE OR REPLACE FUNCTION get_upcoming_meetings(
  p_user_id UUID,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_date DATE,
  scheduled_time TIME,
  duration INTEGER,
  participants_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.title,
    m.scheduled_date,
    m.scheduled_time,
    m.duration,
    COUNT(mp.id) as participants_count
  FROM meetings m
  LEFT JOIN meeting_participants mp ON mp.meeting_id = m.id
  WHERE m.user_id = p_user_id
    AND m.status = 'scheduled'
    AND m.scheduled_date BETWEEN CURRENT_DATE AND CURRENT_DATE + p_days_ahead
  GROUP BY m.id, m.title, m.scheduled_date, m.scheduled_time, m.duration
  ORDER BY m.scheduled_date, m.scheduled_time;
END;
$$ LANGUAGE plpgsql;

-- Update meeting stats daily
CREATE OR REPLACE FUNCTION update_meeting_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO meeting_stats (
    user_id,
    date,
    total_meetings,
    upcoming_meetings,
    ongoing_meetings,
    completed_meetings,
    cancelled_meetings,
    total_hours,
    total_participants,
    average_participants,
    total_recordings,
    type_breakdown,
    status_breakdown
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'scheduled'),
    COUNT(*) FILTER (WHERE status = 'ongoing'),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'cancelled'),
    ROUND(SUM(duration) / 60.0, 2),
    (SELECT COUNT(*) FROM meeting_participants mp JOIN meetings m ON m.id = mp.meeting_id WHERE m.user_id = p_user_id),
    ROUND((SELECT COUNT(*) FROM meeting_participants mp JOIN meetings m ON m.id = mp.meeting_id WHERE m.user_id = p_user_id)::DECIMAL / GREATEST(COUNT(*), 1), 2),
    COUNT(*) FILTER (WHERE recording_url IS NOT NULL),
    (SELECT get_meeting_stats(p_user_id)->>'byType')::jsonb,
    (SELECT get_meeting_stats(p_user_id)->>'byStatus')::jsonb
  FROM meetings
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_meetings = EXCLUDED.total_meetings,
    upcoming_meetings = EXCLUDED.upcoming_meetings,
    ongoing_meetings = EXCLUDED.ongoing_meetings,
    completed_meetings = EXCLUDED.completed_meetings,
    cancelled_meetings = EXCLUDED.cancelled_meetings,
    total_hours = EXCLUDED.total_hours,
    total_participants = EXCLUDED.total_participants,
    average_participants = EXCLUDED.average_participants,
    total_recordings = EXCLUDED.total_recordings,
    type_breakdown = EXCLUDED.type_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_polls ENABLE ROW LEVEL SECURITY;

-- Meetings Policies
CREATE POLICY meetings_select_policy ON meetings
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE POLICY meetings_insert_policy ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY meetings_update_policy ON meetings
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = host_id);

CREATE POLICY meetings_delete_policy ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Meeting Participants Policies
CREATE POLICY meeting_participants_select_policy ON meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_participants_insert_policy ON meeting_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_participants_update_policy ON meeting_participants
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- Meeting Recordings Policies
CREATE POLICY meeting_recordings_select_policy ON meeting_recordings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY meeting_recordings_insert_policy ON meeting_recordings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY meeting_recordings_update_policy ON meeting_recordings
  FOR UPDATE USING (auth.uid() = user_id);

-- Meeting Analytics Policies
CREATE POLICY meeting_analytics_select_policy ON meeting_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Meeting Stats Policies
CREATE POLICY meeting_stats_select_policy ON meeting_stats
  FOR SELECT USING (auth.uid() = user_id);

-- Meeting Chat Messages Policies
CREATE POLICY meeting_chat_messages_select_policy ON meeting_chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

CREATE POLICY meeting_chat_messages_insert_policy ON meeting_chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- Meeting Polls Policies
CREATE POLICY meeting_polls_select_policy ON meeting_polls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings m
      WHERE m.id = meeting_id AND (m.user_id = auth.uid() OR m.host_id = auth.uid())
    )
  );

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all upcoming meetings
-- SELECT * FROM get_upcoming_meetings('user-id', 7);

-- Example: Search meetings
-- SELECT * FROM search_meetings('user-id', 'standup', NULL, 'scheduled', 20);

-- Example: Get meeting statistics
-- SELECT * FROM get_meeting_stats('user-id');

-- Example: Start meeting
-- SELECT * FROM start_meeting('meeting-id');

-- Example: End meeting
-- SELECT * FROM end_meeting('meeting-id');

-- Example: Add participant
-- SELECT add_participant('meeting-id', 'user-id', 'John Doe', 'john@example.com', 'participant');

-- Example: Get meeting analytics
-- SELECT * FROM get_meeting_analytics('meeting-id');

-- Example: Update daily meeting stats
-- SELECT update_meeting_stats_daily('user-id');

-- =====================================================
-- END OF COLLABORATION MEETINGS SYSTEM SCHEMA
-- =====================================================
