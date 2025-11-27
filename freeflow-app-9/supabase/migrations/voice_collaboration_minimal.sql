-- Minimal Voice Collaboration Schema
--
-- Real-time voice collaboration system:
-- - Voice rooms with audio settings
-- - Participants with roles and status
-- - Recordings with transcriptions
-- - Analytics and statistics

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS voice_room_type CASCADE;
DROP TYPE IF EXISTS voice_room_status CASCADE;
DROP TYPE IF EXISTS voice_audio_quality CASCADE;
DROP TYPE IF EXISTS voice_participant_role CASCADE;
DROP TYPE IF EXISTS voice_participant_status CASCADE;
DROP TYPE IF EXISTS voice_recording_status CASCADE;
DROP TYPE IF EXISTS voice_recording_format CASCADE;

-- Room types
CREATE TYPE voice_room_type AS ENUM (
  'public',
  'private',
  'team',
  'client',
  'project',
  'meeting'
);

-- Room status
CREATE TYPE voice_room_status AS ENUM (
  'active',
  'scheduled',
  'ended',
  'archived'
);

-- Audio quality
CREATE TYPE voice_audio_quality AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- Participant roles
CREATE TYPE voice_participant_role AS ENUM (
  'host',
  'moderator',
  'speaker',
  'listener'
);

-- Participant status
CREATE TYPE voice_participant_status AS ENUM (
  'speaking',
  'muted',
  'listening',
  'away'
);

-- Recording status
CREATE TYPE voice_recording_status AS ENUM (
  'processing',
  'completed',
  'failed'
);

-- Recording format
CREATE TYPE voice_recording_format AS ENUM (
  'mp3',
  'wav',
  'ogg',
  'flac'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS voice_analytics CASCADE;
DROP TABLE IF EXISTS voice_transcriptions CASCADE;
DROP TABLE IF EXISTS voice_recordings CASCADE;
DROP TABLE IF EXISTS voice_participants CASCADE;
DROP TABLE IF EXISTS voice_rooms CASCADE;

-- Voice Rooms
CREATE TABLE voice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type voice_room_type NOT NULL DEFAULT 'team',
  status voice_room_status NOT NULL DEFAULT 'active',
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0 AND capacity <= 1000),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  quality voice_audio_quality NOT NULL DEFAULT 'high',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  is_recording BOOLEAN NOT NULL DEFAULT false,
  recording_enabled BOOLEAN NOT NULL DEFAULT true,
  transcription_enabled BOOLEAN NOT NULL DEFAULT false,
  spatial_audio_enabled BOOLEAN NOT NULL DEFAULT false,
  noise_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  echo_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_gain_control_enabled BOOLEAN NOT NULL DEFAULT true,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_scheduled_time CHECK (scheduled_time IS NULL OR scheduled_time > created_at),
  CONSTRAINT valid_capacity CHECK (current_participants <= capacity)
);

-- Voice Participants
CREATE TABLE voice_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role voice_participant_role NOT NULL DEFAULT 'listener',
  status voice_participant_status NOT NULL DEFAULT 'listening',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_enabled BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
  speaking_time_seconds INTEGER DEFAULT 0 CHECK (speaking_time_seconds >= 0),
  connection_quality TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  device_type TEXT,
  browser TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id),
  CONSTRAINT valid_speaking_time CHECK (speaking_time_seconds <= duration_seconds),
  CONSTRAINT valid_left_at CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- Voice Recordings
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  format voice_recording_format NOT NULL DEFAULT 'mp3',
  quality voice_audio_quality NOT NULL DEFAULT 'high',
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  bitrate INTEGER NOT NULL DEFAULT 192,
  channels INTEGER NOT NULL DEFAULT 2 CHECK (channels IN (1, 2)),
  status voice_recording_status NOT NULL DEFAULT 'processing',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  has_transcription BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Transcriptions
CREATE TABLE voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES voice_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  confidence DECIMAL(5, 4) CHECK (confidence >= 0 AND confidence <= 1),
  language TEXT NOT NULL DEFAULT 'en',
  word_count INTEGER NOT NULL DEFAULT 0,
  speaker_labels JSONB DEFAULT '[]'::JSONB,
  timestamps JSONB DEFAULT '[]'::JSONB,
  processing_time_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Analytics
CREATE TABLE voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_rooms INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,
  total_recordings INTEGER DEFAULT 0,
  avg_room_duration_seconds INTEGER DEFAULT 0,
  avg_participants_per_room DECIMAL(5, 2) DEFAULT 0,
  peak_concurrent_rooms INTEGER DEFAULT 0,
  room_type_usage JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- voice_rooms indexes
CREATE INDEX IF NOT EXISTS idx_voice_rooms_user_id ON voice_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_host_id ON voice_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_status ON voice_rooms(status);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_type ON voice_rooms(type);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_scheduled_time ON voice_rooms(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_created_at ON voice_rooms(created_at DESC);

-- voice_participants indexes
CREATE INDEX IF NOT EXISTS idx_voice_participants_room_id ON voice_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_participants_user_id ON voice_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_participants_status ON voice_participants(status);
CREATE INDEX IF NOT EXISTS idx_voice_participants_role ON voice_participants(role);
CREATE INDEX IF NOT EXISTS idx_voice_participants_joined_at ON voice_participants(joined_at);

-- voice_recordings indexes
CREATE INDEX IF NOT EXISTS idx_voice_recordings_room_id ON voice_recordings(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_status ON voice_recordings(status);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_is_public ON voice_recordings(is_public);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_created_at ON voice_recordings(created_at DESC);

-- voice_transcriptions indexes
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_recording_id ON voice_transcriptions(recording_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_user_id ON voice_transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_language ON voice_transcriptions(language);

-- voice_analytics indexes
CREATE INDEX IF NOT EXISTS idx_voice_analytics_user_id ON voice_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_date ON voice_analytics(date DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_voice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_voice_rooms_updated_at
  BEFORE UPDATE ON voice_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_participants_updated_at
  BEFORE UPDATE ON voice_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_recordings_updated_at
  BEFORE UPDATE ON voice_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_transcriptions_updated_at
  BEFORE UPDATE ON voice_transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_analytics_updated_at
  BEFORE UPDATE ON voice_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

-- Auto-set start_time when room becomes active
CREATE OR REPLACE FUNCTION set_voice_room_start_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    NEW.start_time = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_voice_room_start_time
  BEFORE UPDATE ON voice_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_voice_room_start_time();

-- Auto-set end_time and calculate duration when room ends
CREATE OR REPLACE FUNCTION set_voice_room_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND (OLD.status IS NULL OR OLD.status != 'ended') THEN
    NEW.end_time = now();
    IF NEW.start_time IS NOT NULL THEN
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_voice_room_end_time
  BEFORE UPDATE ON voice_rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_voice_room_end_time();

-- Auto-update room participant count
CREATE OR REPLACE FUNCTION update_voice_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_rooms
  SET current_participants = (
    SELECT COUNT(*)
    FROM voice_participants
    WHERE room_id = COALESCE(NEW.room_id, OLD.room_id)
    AND left_at IS NULL
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_count_insert
  AFTER INSERT ON voice_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_room_participant_count();

CREATE TRIGGER trigger_update_participant_count_update
  AFTER UPDATE ON voice_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_room_participant_count();

CREATE TRIGGER trigger_update_participant_count_delete
  AFTER DELETE ON voice_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_room_participant_count();

-- Auto-calculate participant duration on leave
CREATE OR REPLACE FUNCTION calculate_participant_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.left_at IS NOT NULL AND NEW.duration_seconds = 0 THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.left_at - NEW.joined_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_participant_duration
  BEFORE UPDATE ON voice_participants
  FOR EACH ROW
  EXECUTE FUNCTION calculate_participant_duration();

-- Auto-set processing completed timestamp
CREATE OR REPLACE FUNCTION set_recording_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.processing_completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_recording_completed_at
  BEFORE UPDATE ON voice_recordings
  FOR EACH ROW
  EXECUTE FUNCTION set_recording_completed_at();
