-- ============================================================================
-- AR COLLABORATION SYSTEM - SUPABASE MIGRATION
-- Complete augmented reality collaboration with spatial computing
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS ar_environment CASCADE;
CREATE TYPE ar_environment AS ENUM (
  'office',
  'studio',
  'park',
  'abstract',
  'conference',
  'zen'
);

DROP TYPE IF EXISTS device_type CASCADE;
CREATE TYPE device_type AS ENUM (
  'hololens',
  'quest',
  'arkit',
  'arcore',
  'webxr',
  'browser'
);

DROP TYPE IF EXISTS session_status CASCADE;
CREATE TYPE session_status AS ENUM (
  'active',
  'scheduled',
  'ended',
  'archived'
);

DROP TYPE IF EXISTS participant_status CASCADE;
CREATE TYPE participant_status AS ENUM (
  'connected',
  'away',
  'disconnected'
);

DROP TYPE IF EXISTS object_type CASCADE;
CREATE TYPE object_type AS ENUM (
  '3d-model',
  'annotation',
  'whiteboard',
  'screen',
  'marker',
  'portal'
);

DROP TYPE IF EXISTS interaction_type CASCADE;
CREATE TYPE interaction_type AS ENUM (
  'grab',
  'point',
  'gesture',
  'voice',
  'controller'
);

DROP TYPE IF EXISTS quality_level CASCADE;
CREATE TYPE quality_level AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- ============================================================================
-- TABLE: ar_sessions
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  host_name TEXT NOT NULL,
  environment ar_environment NOT NULL DEFAULT 'office',
  status session_status NOT NULL DEFAULT 'scheduled',
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 20,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration INTEGER,
  scheduled_time TIMESTAMPTZ,
  is_recording BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
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

-- ============================================================================
-- TABLE: ar_participants
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,
  device device_type NOT NULL,
  status participant_status NOT NULL DEFAULT 'connected',
  position_x DECIMAL(10, 4) DEFAULT 0,
  position_y DECIMAL(10, 4) DEFAULT 1.5,
  position_z DECIMAL(10, 4) DEFAULT 0,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  scale DECIMAL(10, 4) DEFAULT 1.0,
  is_muted BOOLEAN DEFAULT false,
  is_video_enabled BOOLEAN DEFAULT true,
  is_sharing_screen BOOLEAN DEFAULT false,
  is_hand_tracking_enabled BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  left_at TIMESTAMPTZ,
  latency INTEGER DEFAULT 0,
  bandwidth INTEGER DEFAULT 0,
  fps INTEGER DEFAULT 60,
  quality quality_level DEFAULT 'high',
  permissions JSONB DEFAULT '{
    "canAnnotate": true,
    "canPlace3D": true,
    "canControlWhiteboard": true,
    "canRecord": false
  }'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_objects
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  type object_type NOT NULL,
  name TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  scale DECIMAL(10, 4) DEFAULT 1.0,
  color TEXT,
  texture TEXT,
  model_url TEXT,
  is_interactive BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{
    "canMove": true,
    "canRotate": true,
    "canScale": true,
    "canDelete": true
  }'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_annotations
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  object_id UUID REFERENCES ar_objects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  color TEXT DEFAULT '#000000',
  size DECIMAL(10, 2) DEFAULT 1.0,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'drawing', 'marker', 'highlight')),
  stroke_width DECIMAL(10, 2),
  points JSONB DEFAULT '[]'::JSONB,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_whiteboards
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_whiteboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL,
  position_y DECIMAL(10, 4) NOT NULL,
  position_z DECIMAL(10, 4) NOT NULL,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  width DECIMAL(10, 2) DEFAULT 2.0,
  height DECIMAL(10, 2) DEFAULT 1.5,
  content TEXT,
  is_locked BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_whiteboard_strokes
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_whiteboard_strokes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whiteboard_id UUID NOT NULL REFERENCES ar_whiteboards(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points JSONB NOT NULL,
  color TEXT NOT NULL DEFAULT '#000000',
  width DECIMAL(10, 2) DEFAULT 2.0,
  opacity DECIMAL(3, 2) DEFAULT 1.0,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_recordings
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  file_size BIGINT NOT NULL,
  format TEXT DEFAULT 'mp4' CHECK (format IN ('mp4', 'webm', 'glb')),
  quality quality_level DEFAULT 'high',
  thumbnail TEXT,
  url TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_session_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_session_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  total_participants INTEGER DEFAULT 0,
  peak_participants INTEGER DEFAULT 0,
  average_participants DECIMAL(10, 2) DEFAULT 0,
  duration INTEGER DEFAULT 0,
  objects_created INTEGER DEFAULT 0,
  annotations_created INTEGER DEFAULT 0,
  messages_exchanged INTEGER DEFAULT 0,
  data_transferred BIGINT DEFAULT 0,
  average_latency DECIMAL(10, 2) DEFAULT 0,
  average_fps DECIMAL(10, 2) DEFAULT 0,
  disconnections INTEGER DEFAULT 0,
  reconnections INTEGER DEFAULT 0,
  quality_audio INTEGER DEFAULT 0,
  quality_video INTEGER DEFAULT 0,
  quality_network INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: ar_interactions
-- ============================================================================

CREATE TABLE IF NOT EXISTS ar_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ar_sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES ar_participants(id) ON DELETE CASCADE,
  object_id UUID REFERENCES ar_objects(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  action TEXT NOT NULL,
  position_x DECIMAL(10, 4),
  position_y DECIMAL(10, 4),
  position_z DECIMAL(10, 4),
  metadata JSONB DEFAULT '{}'::JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
CREATE INDEX IF NOT EXISTS idx_ar_sessions_start_time ON ar_sessions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_is_recording ON ar_sessions(is_recording);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_is_locked ON ar_sessions(is_locked);
CREATE INDEX IF NOT EXISTS idx_ar_sessions_tags ON ar_sessions USING gin(tags);

-- ar_participants indexes
CREATE INDEX IF NOT EXISTS idx_ar_participants_user_id ON ar_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_session_id ON ar_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_participants_device ON ar_participants(device);
CREATE INDEX IF NOT EXISTS idx_ar_participants_status ON ar_participants(status);
CREATE INDEX IF NOT EXISTS idx_ar_participants_joined_at ON ar_participants(joined_at DESC);

-- ar_objects indexes
CREATE INDEX IF NOT EXISTS idx_ar_objects_session_id ON ar_objects(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_type ON ar_objects(type);
CREATE INDEX IF NOT EXISTS idx_ar_objects_owner_id ON ar_objects(owner_id);
CREATE INDEX IF NOT EXISTS idx_ar_objects_is_visible ON ar_objects(is_visible);

-- ar_annotations indexes
CREATE INDEX IF NOT EXISTS idx_ar_annotations_session_id ON ar_annotations(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_object_id ON ar_annotations(object_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_author_id ON ar_annotations(author_id);
CREATE INDEX IF NOT EXISTS idx_ar_annotations_created_at ON ar_annotations(created_at DESC);

-- ar_whiteboards indexes
CREATE INDEX IF NOT EXISTS idx_ar_whiteboards_session_id ON ar_whiteboards(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_whiteboards_created_by ON ar_whiteboards(created_by);

-- ar_whiteboard_strokes indexes
CREATE INDEX IF NOT EXISTS idx_ar_whiteboard_strokes_whiteboard_id ON ar_whiteboard_strokes(whiteboard_id);
CREATE INDEX IF NOT EXISTS idx_ar_whiteboard_strokes_author_id ON ar_whiteboard_strokes(author_id);

-- ar_recordings indexes
CREATE INDEX IF NOT EXISTS idx_ar_recordings_session_id ON ar_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_user_id ON ar_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_ar_recordings_start_time ON ar_recordings(start_time DESC);

-- ar_session_metrics indexes
CREATE INDEX IF NOT EXISTS idx_ar_session_metrics_session_id ON ar_session_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_session_metrics_period ON ar_session_metrics(period);

-- ar_interactions indexes
CREATE INDEX IF NOT EXISTS idx_ar_interactions_session_id ON ar_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_participant_id ON ar_interactions(participant_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_object_id ON ar_interactions(object_id);
CREATE INDEX IF NOT EXISTS idx_ar_interactions_timestamp ON ar_interactions(timestamp DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE ar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_whiteboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_whiteboard_strokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_session_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ar_interactions ENABLE ROW LEVEL SECURITY;

-- ar_sessions policies
CREATE POLICY "Users can view sessions they created or joined"
  ON ar_sessions FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = host_id
    OR EXISTS (
      SELECT 1 FROM ar_participants
      WHERE ar_participants.session_id = ar_sessions.id
      AND ar_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions"
  ON ar_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Hosts can update their sessions"
  ON ar_sessions FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions"
  ON ar_sessions FOR DELETE
  USING (auth.uid() = host_id);

-- ar_participants policies
CREATE POLICY "Users can view participants in sessions they're part of"
  ON ar_participants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_participants.session_id
    AND (
      ar_sessions.user_id = auth.uid()
      OR ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants p2
        WHERE p2.session_id = ar_sessions.id
        AND p2.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can join sessions"
  ON ar_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ar_objects policies
CREATE POLICY "Users can view objects in sessions they're part of"
  ON ar_objects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_objects.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create objects"
  ON ar_objects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their objects"
  ON ar_objects FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their objects"
  ON ar_objects FOR DELETE
  USING (auth.uid() = owner_id);

-- ar_annotations policies
CREATE POLICY "Users can view annotations in sessions they're part of"
  ON ar_annotations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_annotations.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create annotations"
  ON ar_annotations FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ar_whiteboards policies
CREATE POLICY "Users can view whiteboards in sessions they're part of"
  ON ar_whiteboards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_whiteboards.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can create whiteboards"
  ON ar_whiteboards FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- ar_whiteboard_strokes policies
CREATE POLICY "Users can view whiteboard strokes"
  ON ar_whiteboard_strokes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_whiteboards wb
    JOIN ar_sessions s ON s.id = wb.session_id
    WHERE wb.id = ar_whiteboard_strokes.whiteboard_id
    AND (
      s.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = s.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can add strokes"
  ON ar_whiteboard_strokes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- ar_recordings policies
CREATE POLICY "Users can view recordings of sessions they participated in"
  ON ar_recordings FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM ar_sessions
      WHERE ar_sessions.id = ar_recordings.session_id
      AND ar_sessions.host_id = auth.uid()
    )
  );

CREATE POLICY "Users can create recordings"
  ON ar_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ar_session_metrics policies
CREATE POLICY "Hosts can view metrics for their sessions"
  ON ar_session_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_session_metrics.session_id
    AND ar_sessions.host_id = auth.uid()
  ));

-- ar_interactions policies
CREATE POLICY "Users can view interactions in sessions they're part of"
  ON ar_interactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM ar_sessions
    WHERE ar_sessions.id = ar_interactions.session_id
    AND (
      ar_sessions.host_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM ar_participants
        WHERE ar_participants.session_id = ar_sessions.id
        AND ar_participants.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Participants can log interactions"
  ON ar_interactions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM ar_participants
    WHERE ar_participants.id = ar_interactions.participant_id
    AND ar_participants.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ar_sessions_updated_at
  BEFORE UPDATE ON ar_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ar_objects_updated_at
  BEFORE UPDATE ON ar_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ar_whiteboards_updated_at
  BEFORE UPDATE ON ar_whiteboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE ar_sessions
    SET current_participants = current_participants + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE ar_sessions
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.session_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_participant_count
  AFTER INSERT OR DELETE ON ar_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get session statistics
CREATE OR REPLACE FUNCTION get_ar_session_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id),
      'active_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND status = 'active'),
      'scheduled_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND status = 'scheduled'),
      'total_participants', (SELECT COALESCE(SUM(current_participants), 0) FROM ar_sessions WHERE user_id = p_user_id),
      'recording_sessions', (SELECT COUNT(*) FROM ar_sessions WHERE user_id = p_user_id AND is_recording = true)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate distance between positions
CREATE OR REPLACE FUNCTION calculate_distance(
  x1 DECIMAL, y1 DECIMAL, z1 DECIMAL,
  x2 DECIMAL, y2 DECIMAL, z2 DECIMAL
)
RETURNS DECIMAL AS $$
BEGIN
  RETURN SQRT(
    POWER(x2 - x1, 2) +
    POWER(y2 - y1, 2) +
    POWER(z2 - z1, 2)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Get nearby participants
CREATE OR REPLACE FUNCTION get_nearby_participants(
  p_session_id UUID,
  p_x DECIMAL,
  p_y DECIMAL,
  p_z DECIMAL,
  p_max_distance DECIMAL DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    calculate_distance(p_x, p_y, p_z, p.position_x, p.position_y, p.position_z) as distance
  FROM ar_participants p
  WHERE p.session_id = p_session_id
  AND p.status = 'connected'
  AND calculate_distance(p_x, p_y, p_z, p.position_x, p.position_y, p.position_z) <= p_max_distance
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
