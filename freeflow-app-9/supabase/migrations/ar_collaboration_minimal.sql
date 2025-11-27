-- Minimal AR Collaboration Schema
--
-- Augmented reality collaboration system:
-- - AR sessions with environments and settings
-- - Participants with spatial positioning
-- - Shared AR objects (3D models, annotations, whiteboards)
-- - Interactions and gestures tracking
-- - Recording and analytics

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS ar_environment CASCADE;
DROP TYPE IF EXISTS ar_device_type CASCADE;
DROP TYPE IF EXISTS ar_session_status CASCADE;
DROP TYPE IF EXISTS ar_participant_status CASCADE;
DROP TYPE IF EXISTS ar_object_type CASCADE;
DROP TYPE IF EXISTS ar_interaction_type CASCADE;
DROP TYPE IF EXISTS ar_quality_level CASCADE;

-- AR environments
CREATE TYPE ar_environment AS ENUM (
  'office',
  'studio',
  'park',
  'abstract',
  'conference',
  'zen'
);

-- Device types
CREATE TYPE ar_device_type AS ENUM (
  'hololens',
  'quest',
  'arkit',
  'arcore',
  'webxr',
  'browser'
);

-- Session status
CREATE TYPE ar_session_status AS ENUM (
  'active',
  'scheduled',
  'ended',
  'archived'
);

-- Participant status
CREATE TYPE ar_participant_status AS ENUM (
  'connected',
  'away',
  'disconnected'
);

-- AR object types
CREATE TYPE ar_object_type AS ENUM (
  '3d-model',
  'annotation',
  'whiteboard',
  'screen',
  'marker',
  'portal'
);

-- Interaction types
CREATE TYPE ar_interaction_type AS ENUM (
  'grab',
  'point',
  'gesture',
  'voice',
  'controller'
);

-- Quality levels
CREATE TYPE ar_quality_level AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ar_analytics CASCADE;
DROP TABLE IF EXISTS ar_recordings CASCADE;
DROP TABLE IF EXISTS ar_interactions CASCADE;
DROP TABLE IF EXISTS ar_objects CASCADE;
DROP TABLE IF EXISTS ar_participants CASCADE;
DROP TABLE IF EXISTS ar_sessions CASCADE;

-- AR Sessions
CREATE TABLE ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  environment ar_environment NOT NULL DEFAULT 'office',
  status ar_session_status NOT NULL DEFAULT 'scheduled',
  current_participants INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER NOT NULL DEFAULT 20,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  scheduled_time TIMESTAMPTZ,
  is_recording BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  password TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  features JSONB DEFAULT '{
    "spatialAudio": true,
    "whiteboard": true,
    "screenShare": true,
    "objects3D": true,
    "recording": true,
    "handTracking": false,
    "eyeTracking": false,
    "faceTracking": false,
    "roomMapping": true,
    "lightEstimation": true
  }'::JSONB,
  settings JSONB DEFAULT '{
    "audioQuality": "high",
    "videoQuality": "high",
    "renderQuality": "high",
    "networkOptimization": true,
    "autoReconnect": true
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR Participants
CREATE TABLE ar_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  device ar_device_type NOT NULL,
  status ar_participant_status NOT NULL DEFAULT 'connected',
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 1.5,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  scale DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_enabled BOOLEAN NOT NULL DEFAULT true,
  is_sharing_screen BOOLEAN NOT NULL DEFAULT false,
  is_hand_tracking_enabled BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  latency INTEGER DEFAULT 0,
  bandwidth INTEGER DEFAULT 0,
  fps INTEGER DEFAULT 60,
  quality ar_quality_level DEFAULT 'high',
  permissions JSONB DEFAULT '{
    "canAnnotate": true,
    "canPlace3D": true,
    "canControlWhiteboard": true,
    "canRecord": false
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR Objects (3D models, annotations, whiteboards)
CREATE TABLE ar_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type ar_object_type NOT NULL,
  name TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  scale_x DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_y DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_z DECIMAL(10, 4) NOT NULL DEFAULT 1,
  color TEXT DEFAULT '#FFFFFF',
  model_url TEXT,
  texture_url TEXT,
  data JSONB DEFAULT '{}'::JSONB,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_interactive BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR Interactions (user interactions with objects)
CREATE TABLE ar_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  object_id UUID REFERENCES ar_objects(id) ON DELETE SET NULL,
  type ar_interaction_type NOT NULL,
  position_x DECIMAL(10, 4),
  position_y DECIMAL(10, 4),
  position_z DECIMAL(10, 4),
  data JSONB DEFAULT '{}'::JSONB,
  duration INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR Recordings
CREATE TABLE ar_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  file_url TEXT,
  file_size BIGINT,
  format TEXT NOT NULL DEFAULT 'mp4',
  quality ar_quality_level NOT NULL DEFAULT 'high',
  thumbnail_url TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AR Analytics
CREATE TABLE ar_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sessions INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  total_objects_created INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  avg_session_duration INTEGER DEFAULT 0,
  avg_participants_per_session DECIMAL(5, 2) DEFAULT 0,
  device_usage JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- ar_sessions indexes
CREATE INDEX IF NOT EXISTS idx_ar_sessions_user_id ON ar_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_host_id ON ar_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_status ON ar_sessions(status);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_environment ON ar_sessions(environment);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_scheduled_time ON ar_sessions(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_created_at ON ar_sessions(created_at DESC);

-- ar_participants indexes
CREATE INDEX IF NOT EXISTS idx_ar_participants_user_id ON ar_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_session_id ON ar_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_status ON ar_participants(status);
CREATE INDEX IF NOT EXISTS idx_ar_participants_device ON ar_participants(device);
CREATE INDEX IF NOT EXISTS idx_ar_participants_joined_at ON ar_participants(joined_at);

-- ar_objects indexes
CREATE INDEX IF NOT EXISTS idx_ar_objects_session_id ON ar_objects(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_user_id ON ar_objects(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_type ON ar_objects(type);
CREATE INDEX IF NOT EXISTS idx_ar_objects_is_visible ON ar_objects(is_visible);
CREATE INDEX IF NOT EXISTS idx_ar_objects_created_at ON ar_objects(created_at DESC);

-- ar_interactions indexes
CREATE INDEX IF NOT EXISTS idx_ar_interactions_session_id ON ar_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_user_id ON ar_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_object_id ON ar_interactions(object_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_type ON ar_interactions(type);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_created_at ON ar_interactions(created_at DESC);

-- ar_recordings indexes
CREATE INDEX IF NOT EXISTS idx_ar_recordings_session_id ON ar_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_user_id ON ar_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_is_public ON ar_recordings(is_public);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_created_at ON ar_recordings(created_at DESC);

-- ar_analytics indexes
CREATE INDEX IF NOT EXISTS idx_ar_analytics_user_id ON ar_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_analytics_date ON ar_analytics(date DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_ar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ar_sessions_updated_at
  BEFORE UPDATE ON ar_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

CREATE TRIGGER trigger_ar_participants_updated_at
  BEFORE UPDATE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

CREATE TRIGGER trigger_ar_objects_updated_at
  BEFORE UPDATE ON ar_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

CREATE TRIGGER trigger_ar_recordings_updated_at
  BEFORE UPDATE ON ar_recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

CREATE TRIGGER trigger_ar_analytics_updated_at
  BEFORE UPDATE ON ar_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_updated_at();

-- Auto-set start_time when session status changes to active
CREATE OR REPLACE FUNCTION set_ar_session_start_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD.status IS NULL OR OLD.status != 'active') THEN
    NEW.start_time = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ar_session_start_time
  BEFORE UPDATE ON ar_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_ar_session_start_time();

-- Auto-set end_time and calculate duration when session ends
CREATE OR REPLACE FUNCTION set_ar_session_end_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND (OLD.status IS NULL OR OLD.status != 'ended') THEN
    NEW.end_time = now();
    IF NEW.start_time IS NOT NULL THEN
      NEW.duration = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ar_session_end_time
  BEFORE UPDATE ON ar_sessions
  FOR EACH ROW
  EXECUTE FUNCTION set_ar_session_end_time();

-- Auto-set left_at when participant disconnects
CREATE OR REPLACE FUNCTION set_ar_participant_left_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'disconnected' AND (OLD.status IS NULL OR OLD.status != 'disconnected') THEN
    NEW.left_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_ar_participant_left_at
  BEFORE UPDATE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION set_ar_participant_left_at();

-- Auto-update session participant count
CREATE OR REPLACE FUNCTION update_ar_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ar_sessions
  SET current_participants = (
    SELECT COUNT(*)
    FROM ar_participants
    WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)
    AND status = 'connected'
  ),
  updated_at = now()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_participant_count_insert
  AFTER INSERT ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_session_participant_count();

CREATE TRIGGER trigger_update_participant_count_update
  AFTER UPDATE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_session_participant_count();

CREATE TRIGGER trigger_update_participant_count_delete
  AFTER DELETE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_ar_session_participant_count();
