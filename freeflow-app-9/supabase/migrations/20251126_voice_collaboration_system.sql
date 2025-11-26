-- ========================================
-- VOICE COLLABORATION SYSTEM MIGRATION
-- ========================================
--
-- Comprehensive database schema for Voice Collaboration
--
-- Features:
-- - 10+ tables for complete voice room management
-- - 5+ enums for type safety
-- - 25+ indexes for performance
-- - 20+ RLS policies for security
-- - 5+ triggers for automation
-- - 3+ helper functions
--
-- Tables:
-- 1. voice_rooms - Main rooms table
-- 2. voice_participants - Participant tracking
-- 3. voice_recordings - Recording metadata
-- 4. voice_transcriptions - AI transcription results
-- 5. voice_room_settings - Per-room audio settings
-- 6. voice_room_invites - Room invitation system
-- 7. voice_analytics - Room analytics tracking
-- 8. voice_participant_stats - Speaking time, engagement
-- 9. voice_room_schedules - Scheduled rooms
-- 10. voice_room_reactions - Emoji reactions during calls
-- 11. voice_room_chat - Text chat within voice rooms
-- 12. voice_room_files - File sharing in rooms

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE room_type AS ENUM ('public', 'private', 'team', 'client', 'project', 'meeting');
CREATE TYPE room_status AS ENUM ('active', 'scheduled', 'ended', 'archived');
CREATE TYPE audio_quality AS ENUM ('low', 'medium', 'high', 'ultra');
CREATE TYPE participant_role AS ENUM ('host', 'moderator', 'speaker', 'listener');
CREATE TYPE participant_status AS ENUM ('speaking', 'muted', 'listening', 'away');
CREATE TYPE recording_status AS ENUM ('completed', 'processing', 'failed');
CREATE TYPE recording_format AS ENUM ('mp3', 'wav', 'ogg', 'flac');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'clap', 'thinking', 'celebrate');

-- ========================================
-- TABLES
-- ========================================

-- 1. Voice Rooms Table
CREATE TABLE voice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type room_type NOT NULL DEFAULT 'team',
  status room_status NOT NULL DEFAULT 'active',
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0 AND capacity <= 1000),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  quality audio_quality NOT NULL DEFAULT 'high',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  password_hash VARCHAR(255), -- Hashed password for locked rooms
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  is_recording BOOLEAN NOT NULL DEFAULT false,

  -- Features
  recording_enabled BOOLEAN NOT NULL DEFAULT true,
  transcription_enabled BOOLEAN NOT NULL DEFAULT false,
  spatial_audio_enabled BOOLEAN NOT NULL DEFAULT false,
  noise_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  echo_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_gain_control_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  category VARCHAR(100),
  tags TEXT[], -- Array of tags

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_scheduled_time CHECK (scheduled_time IS NULL OR scheduled_time > created_at),
  CONSTRAINT valid_capacity CHECK (current_participants <= capacity),
  CONSTRAINT locked_rooms_have_password CHECK (NOT is_locked OR password_hash IS NOT NULL)
);

-- 2. Voice Participants Table
CREATE TABLE voice_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role participant_role NOT NULL DEFAULT 'listener',
  status participant_status NOT NULL DEFAULT 'listening',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Session tracking
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
  speaking_time_seconds INTEGER DEFAULT 0 CHECK (speaking_time_seconds >= 0),

  -- Connection info
  connection_quality VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(100),
  ip_address INET,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(room_id, user_id), -- One user can only be in a room once at a time
  CONSTRAINT valid_speaking_time CHECK (speaking_time_seconds <= duration_seconds),
  CONSTRAINT valid_left_at CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- 3. Voice Recordings Table
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- File information
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  format recording_format NOT NULL DEFAULT 'mp3',
  quality audio_quality NOT NULL DEFAULT 'high',

  -- Audio metadata
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  bitrate INTEGER NOT NULL DEFAULT 192,
  channels INTEGER NOT NULL DEFAULT 2 CHECK (channels IN (1, 2)),

  -- Status
  status recording_status NOT NULL DEFAULT 'processing',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Transcription
  transcription_available BOOLEAN NOT NULL DEFAULT false,
  transcription_text TEXT,
  transcription_language VARCHAR(10),

  -- Statistics
  participant_count INTEGER NOT NULL DEFAULT 0 CHECK (participant_count >= 0),
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),

  -- Timestamps
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_end_time CHECK (end_time > start_time)
);

-- 4. Voice Transcriptions Table
CREATE TABLE voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES voice_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transcription data
  full_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  confidence_score DECIMAL(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Segments with timestamps
  segments JSONB, -- Array of { start, end, text, speaker }

  -- AI processing
  ai_model VARCHAR(100),
  processing_time_ms INTEGER,

  -- Features
  speakers_identified INTEGER DEFAULT 0,
  keywords TEXT[], -- Extracted keywords
  summary TEXT, -- AI-generated summary

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Voice Room Settings Table
CREATE TABLE voice_room_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Audio settings
  default_quality audio_quality NOT NULL DEFAULT 'high',
  max_bitrate INTEGER DEFAULT 320,
  sample_rate INTEGER DEFAULT 48000,

  -- Participant settings
  require_approval BOOLEAN NOT NULL DEFAULT false,
  allow_guest_join BOOLEAN NOT NULL DEFAULT true,
  mute_on_join BOOLEAN NOT NULL DEFAULT false,

  -- Recording settings
  auto_record BOOLEAN NOT NULL DEFAULT false,
  auto_transcribe BOOLEAN NOT NULL DEFAULT false,
  save_chat BOOLEAN NOT NULL DEFAULT true,

  -- Notifications
  notify_on_join BOOLEAN NOT NULL DEFAULT true,
  notify_on_leave BOOLEAN NOT NULL DEFAULT false,
  notify_on_recording_ready BOOLEAN NOT NULL DEFAULT true,

  -- Advanced features
  enable_virtual_background BOOLEAN NOT NULL DEFAULT false,
  enable_noise_suppression BOOLEAN NOT NULL DEFAULT true,
  enable_echo_cancellation BOOLEAN NOT NULL DEFAULT true,
  enable_auto_gain_control BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Voice Room Invites Table
CREATE TABLE voice_room_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255), -- For non-users

  status invite_status NOT NULL DEFAULT 'pending',
  invite_code VARCHAR(50) UNIQUE, -- For shareable links

  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT recipient_required CHECK (recipient_id IS NOT NULL OR recipient_email IS NOT NULL),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- 7. Voice Analytics Table
CREATE TABLE voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Engagement metrics
  total_participants INTEGER NOT NULL DEFAULT 0,
  max_concurrent_participants INTEGER NOT NULL DEFAULT 0,
  average_duration_seconds INTEGER,
  total_speaking_time_seconds INTEGER DEFAULT 0,

  -- Quality metrics
  average_connection_quality DECIMAL(3, 2),
  dropped_connections INTEGER DEFAULT 0,
  reconnections INTEGER DEFAULT 0,

  -- Recording metrics
  recordings_count INTEGER DEFAULT 0,
  total_recording_duration_seconds INTEGER DEFAULT 0,
  transcriptions_count INTEGER DEFAULT 0,

  -- Interaction metrics
  messages_sent INTEGER DEFAULT 0,
  files_shared INTEGER DEFAULT 0,
  reactions_sent INTEGER DEFAULT 0,

  -- Performance
  average_latency_ms INTEGER,
  packet_loss_percentage DECIMAL(5, 2),

  -- Timestamps
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_period CHECK (period_end > period_start)
);

-- 8. Voice Participant Stats Table
CREATE TABLE voice_participant_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES voice_participants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Speaking statistics
  total_speaking_time_seconds INTEGER NOT NULL DEFAULT 0,
  speaking_turns INTEGER NOT NULL DEFAULT 0,
  average_speaking_duration_seconds INTEGER,

  -- Engagement
  messages_sent INTEGER NOT NULL DEFAULT 0,
  reactions_sent INTEGER NOT NULL DEFAULT 0,
  files_shared INTEGER NOT NULL DEFAULT 0,

  -- Audio quality
  microphone_issues_count INTEGER DEFAULT 0,
  audio_dropouts INTEGER DEFAULT 0,

  -- Session info
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(participant_id, session_date)
);

-- 9. Voice Room Schedules Table
CREATE TABLE voice_room_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',

  -- Recurrence
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  recurrence_end_date DATE,

  -- Reminders
  remind_before_minutes INTEGER DEFAULT 15,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,

  -- Status
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start)
);

-- 10. Voice Room Reactions Table
CREATE TABLE voice_room_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  reaction_type reaction_type NOT NULL,

  -- Context
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- React to specific participant
  timestamp_offset_seconds INTEGER, -- Position in recording/stream

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Voice Room Chat Table
CREATE TABLE voice_room_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'system', 'file'

  -- Reply threading
  reply_to_id UUID REFERENCES voice_room_chat(id) ON DELETE SET NULL,

  -- Attachments
  attachment_url TEXT,
  attachment_type VARCHAR(50),

  -- Status
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Voice Room Files Table
CREATE TABLE voice_room_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100),

  -- Access
  is_public BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  description TEXT,
  thumbnail_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Voice Rooms indexes
CREATE INDEX idx_voice_rooms_user_id ON voice_rooms(user_id);
CREATE INDEX idx_voice_rooms_host_id ON voice_rooms(host_id);
CREATE INDEX idx_voice_rooms_status ON voice_rooms(status);
CREATE INDEX idx_voice_rooms_type ON voice_rooms(type);
CREATE INDEX idx_voice_rooms_created_at ON voice_rooms(created_at DESC);
CREATE INDEX idx_voice_rooms_scheduled_time ON voice_rooms(scheduled_time) WHERE scheduled_time IS NOT NULL;
CREATE INDEX idx_voice_rooms_active ON voice_rooms(status, created_at DESC) WHERE status = 'active';

-- Voice Participants indexes
CREATE INDEX idx_voice_participants_room_id ON voice_participants(room_id);
CREATE INDEX idx_voice_participants_user_id ON voice_participants(user_id);
CREATE INDEX idx_voice_participants_joined_at ON voice_participants(joined_at DESC);
CREATE INDEX idx_voice_participants_active ON voice_participants(room_id, left_at) WHERE left_at IS NULL;

-- Voice Recordings indexes
CREATE INDEX idx_voice_recordings_room_id ON voice_recordings(room_id);
CREATE INDEX idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX idx_voice_recordings_status ON voice_recordings(status);
CREATE INDEX idx_voice_recordings_created_at ON voice_recordings(created_at DESC);
CREATE INDEX idx_voice_recordings_transcription ON voice_recordings(transcription_available) WHERE transcription_available = true;

-- Voice Transcriptions indexes
CREATE INDEX idx_voice_transcriptions_recording_id ON voice_transcriptions(recording_id);
CREATE INDEX idx_voice_transcriptions_user_id ON voice_transcriptions(user_id);
CREATE INDEX idx_voice_transcriptions_language ON voice_transcriptions(language);

-- Voice Room Invites indexes
CREATE INDEX idx_voice_room_invites_room_id ON voice_room_invites(room_id);
CREATE INDEX idx_voice_room_invites_recipient_id ON voice_room_invites(recipient_id);
CREATE INDEX idx_voice_room_invites_status ON voice_room_invites(status);
CREATE INDEX idx_voice_room_invites_expires_at ON voice_room_invites(expires_at);

-- Voice Analytics indexes
CREATE INDEX idx_voice_analytics_room_id ON voice_analytics(room_id);
CREATE INDEX idx_voice_analytics_user_id ON voice_analytics(user_id);
CREATE INDEX idx_voice_analytics_period ON voice_analytics(period_start, period_end);

-- Voice Room Chat indexes
CREATE INDEX idx_voice_room_chat_room_id ON voice_room_chat(room_id, created_at DESC);
CREATE INDEX idx_voice_room_chat_user_id ON voice_room_chat(user_id);
CREATE INDEX idx_voice_room_chat_reply_to ON voice_room_chat(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Voice Room Files indexes
CREATE INDEX idx_voice_room_files_room_id ON voice_room_files(room_id);
CREATE INDEX idx_voice_room_files_user_id ON voice_room_files(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_participant_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_files ENABLE ROW LEVEL SECURITY;

-- Voice Rooms policies
CREATE POLICY "Users can view public rooms"
  ON voice_rooms FOR SELECT
  USING (type = 'public' OR user_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Users can create rooms"
  ON voice_rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room owners can update their rooms"
  ON voice_rooms FOR UPDATE
  USING (user_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Room owners can delete their rooms"
  ON voice_rooms FOR DELETE
  USING (user_id = auth.uid());

-- Voice Participants policies
CREATE POLICY "Users can view participants in their rooms"
  ON voice_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_participants.room_id
      AND (voice_rooms.user_id = auth.uid() OR voice_rooms.host_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can join rooms as participants"
  ON voice_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON voice_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Voice Recordings policies
CREATE POLICY "Users can view recordings from their rooms"
  ON voice_recordings FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_recordings.room_id
      AND (voice_rooms.user_id = auth.uid() OR voice_rooms.host_id = auth.uid())
    )
  );

CREATE POLICY "Room hosts can create recordings"
  ON voice_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = room_id
      AND voice_rooms.host_id = auth.uid()
    )
  );

CREATE POLICY "Recording owners can update recordings"
  ON voice_recordings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Recording owners can delete recordings"
  ON voice_recordings FOR DELETE
  USING (user_id = auth.uid());

-- Voice Transcriptions policies
CREATE POLICY "Users can view transcriptions of accessible recordings"
  ON voice_transcriptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_recordings
      WHERE voice_recordings.id = voice_transcriptions.recording_id
      AND voice_recordings.user_id = auth.uid()
    )
  );

-- Voice Room Settings policies
CREATE POLICY "Room owners can manage settings"
  ON voice_room_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_room_settings.room_id
      AND voice_rooms.user_id = auth.uid()
    )
  );

-- Voice Room Invites policies
CREATE POLICY "Users can view their invites"
  ON voice_room_invites FOR SELECT
  USING (recipient_id = auth.uid() OR sender_id = auth.uid());

CREATE POLICY "Room hosts can send invites"
  ON voice_room_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = room_id
      AND voice_rooms.host_id = auth.uid()
    )
  );

CREATE POLICY "Recipients can update invite status"
  ON voice_room_invites FOR UPDATE
  USING (recipient_id = auth.uid());

-- Voice Analytics policies
CREATE POLICY "Users can view analytics for their rooms"
  ON voice_analytics FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_analytics.room_id
      AND voice_rooms.user_id = auth.uid()
    )
  );

-- Voice Room Chat policies
CREATE POLICY "Participants can view room chat"
  ON voice_room_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_chat.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON voice_room_chat FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_chat.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON voice_room_chat FOR UPDATE
  USING (user_id = auth.uid());

-- Voice Room Files policies
CREATE POLICY "Participants can view room files"
  ON voice_room_files FOR SELECT
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_files.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can upload files"
  ON voice_room_files FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_files.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_voice_rooms_updated_at BEFORE UPDATE ON voice_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_participants_updated_at BEFORE UPDATE ON voice_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_recordings_updated_at BEFORE UPDATE ON voice_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_transcriptions_updated_at BEFORE UPDATE ON voice_transcriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_room_settings_updated_at BEFORE UPDATE ON voice_room_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update room participant count
CREATE OR REPLACE FUNCTION update_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE voice_rooms
    SET current_participants = current_participants + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE voice_rooms
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.room_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE voice_rooms
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = NEW.room_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON voice_participants
  FOR EACH ROW EXECUTE FUNCTION update_room_participant_count();

-- Trigger to update recording view count
CREATE OR REPLACE FUNCTION increment_recording_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_recordings
  SET view_count = view_count + 1
  WHERE id = NEW.recording_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-archive old rooms
CREATE OR REPLACE FUNCTION auto_archive_old_rooms()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND NEW.end_time < (NOW() - INTERVAL '30 days') THEN
    NEW.status = 'archived';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_archive_rooms_trigger
  BEFORE UPDATE ON voice_rooms
  FOR EACH ROW EXECUTE FUNCTION auto_archive_old_rooms();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get active participants in a room
CREATE OR REPLACE FUNCTION get_active_participants(room_uuid UUID)
RETURNS TABLE (
  participant_id UUID,
  user_id UUID,
  role participant_role,
  status participant_status,
  is_muted BOOLEAN,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.id,
    vp.user_id,
    vp.role,
    vp.status,
    vp.is_muted,
    vp.joined_at
  FROM voice_participants vp
  WHERE vp.room_id = room_uuid
    AND vp.left_at IS NULL
  ORDER BY vp.joined_at;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate room analytics
CREATE OR REPLACE FUNCTION calculate_room_analytics(room_uuid UUID, start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE (
  total_participants BIGINT,
  max_concurrent_participants INTEGER,
  avg_duration_seconds NUMERIC,
  total_speaking_time NUMERIC,
  total_messages BIGINT,
  total_reactions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT vp.user_id)::BIGINT,
    (SELECT MAX(current_participants) FROM voice_rooms WHERE id = room_uuid)::INTEGER,
    AVG(vp.duration_seconds)::NUMERIC,
    SUM(vp.speaking_time_seconds)::NUMERIC,
    (SELECT COUNT(*) FROM voice_room_chat WHERE room_id = room_uuid AND created_at BETWEEN start_date AND end_date)::BIGINT,
    (SELECT COUNT(*) FROM voice_room_reactions WHERE room_id = room_uuid AND created_at BETWEEN start_date AND end_date)::BIGINT
  FROM voice_participants vp
  WHERE vp.room_id = room_uuid
    AND vp.joined_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's voice statistics
CREATE OR REPLACE FUNCTION get_user_voice_stats(user_uuid UUID)
RETURNS TABLE (
  total_rooms_joined BIGINT,
  total_time_spent_seconds NUMERIC,
  total_speaking_time_seconds NUMERIC,
  average_session_duration_seconds NUMERIC,
  rooms_hosted BIGINT,
  recordings_created BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT vp.room_id)::BIGINT,
    SUM(vp.duration_seconds)::NUMERIC,
    SUM(vp.speaking_time_seconds)::NUMERIC,
    AVG(vp.duration_seconds)::NUMERIC,
    (SELECT COUNT(*) FROM voice_rooms WHERE host_id = user_uuid)::BIGINT,
    (SELECT COUNT(*) FROM voice_recordings WHERE user_id = user_uuid)::BIGINT
  FROM voice_participants vp
  WHERE vp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE voice_rooms IS 'Main table for voice collaboration rooms';
COMMENT ON TABLE voice_participants IS 'Tracks participants in voice rooms with engagement metrics';
COMMENT ON TABLE voice_recordings IS 'Stores metadata for voice room recordings';
COMMENT ON TABLE voice_transcriptions IS 'AI-generated transcriptions of voice recordings';
COMMENT ON TABLE voice_room_settings IS 'Per-room configuration and preferences';
COMMENT ON TABLE voice_room_invites IS 'Invitation system for voice rooms';
COMMENT ON TABLE voice_analytics IS 'Analytics and metrics for voice rooms';
COMMENT ON TABLE voice_participant_stats IS 'Detailed statistics per participant session';
COMMENT ON TABLE voice_room_schedules IS 'Scheduled voice rooms with recurrence support';
COMMENT ON TABLE voice_room_reactions IS 'Emoji reactions during voice calls';
COMMENT ON TABLE voice_room_chat IS 'Text chat within voice rooms';
COMMENT ON TABLE voice_room_files IS 'File sharing within voice rooms';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
