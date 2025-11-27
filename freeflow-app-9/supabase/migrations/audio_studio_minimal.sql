-- Minimal Audio Studio Schema
-- Professional audio editing and production system with projects, tracks, effects, recordings

-- ENUMS
DROP TYPE IF EXISTS audio_format CASCADE;
DROP TYPE IF EXISTS audio_quality CASCADE;
DROP TYPE IF EXISTS audio_effect CASCADE;
DROP TYPE IF EXISTS track_type CASCADE;
DROP TYPE IF EXISTS recording_status CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;

CREATE TYPE audio_format AS ENUM ('mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a');
CREATE TYPE audio_quality AS ENUM ('low', 'medium', 'high', 'lossless');
CREATE TYPE audio_effect AS ENUM ('reverb', 'delay', 'chorus', 'distortion', 'compressor', 'eq', 'limiter', 'noise-gate', 'pitch-shift', 'time-stretch', 'normalize', 'fade');
CREATE TYPE track_type AS ENUM ('audio', 'music', 'voice', 'sfx', 'midi');
CREATE TYPE recording_status AS ENUM ('recording', 'paused', 'stopped', 'processing', 'completed');
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- TABLES
DROP TABLE IF EXISTS audio_exports CASCADE;
DROP TABLE IF EXISTS audio_markers CASCADE;
DROP TABLE IF EXISTS audio_effects CASCADE;
DROP TABLE IF EXISTS audio_regions CASCADE;
DROP TABLE IF EXISTS audio_tracks CASCADE;
DROP TABLE IF EXISTS audio_recordings CASCADE;
DROP TABLE IF EXISTS audio_files CASCADE;
DROP TABLE IF EXISTS audio_projects CASCADE;

CREATE TABLE audio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  tempo INTEGER NOT NULL DEFAULT 120 CHECK (tempo >= 20 AND tempo <= 300),
  duration DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  format audio_format NOT NULL DEFAULT 'wav',
  quality audio_quality NOT NULL DEFAULT 'high',
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  format audio_format NOT NULL,
  duration DECIMAL(10, 2) NOT NULL DEFAULT 0,
  file_size BIGINT NOT NULL DEFAULT 0,
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  bit_rate INTEGER NOT NULL DEFAULT 128,
  channels INTEGER NOT NULL DEFAULT 2 CHECK (channels >= 1 AND channels <= 8),
  waveform JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES audio_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type track_type NOT NULL DEFAULT 'audio',
  audio_file_id UUID REFERENCES audio_files(id) ON DELETE SET NULL,
  volume DECIMAL(5, 2) NOT NULL DEFAULT 1.0 CHECK (volume >= 0 AND volume <= 2),
  pan DECIMAL(4, 2) NOT NULL DEFAULT 0 CHECK (pan >= -1 AND pan <= 1),
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_solo BOOLEAN NOT NULL DEFAULT false,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  track_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
  audio_file_id UUID NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  start_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  end_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  file_offset DECIMAL(10, 2) NOT NULL DEFAULT 0,
  fade_in DECIMAL(5, 2) NOT NULL DEFAULT 0,
  fade_out DECIMAL(5, 2) NOT NULL DEFAULT 0,
  volume DECIMAL(5, 2) NOT NULL DEFAULT 1.0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES audio_tracks(id) ON DELETE CASCADE,
  type audio_effect NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  parameters JSONB NOT NULL DEFAULT '{}'::JSONB,
  preset_name TEXT,
  effect_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES audio_projects(id) ON DELETE CASCADE,
  time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES audio_projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT,
  duration DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status recording_status NOT NULL DEFAULT 'stopped',
  format audio_format NOT NULL DEFAULT 'wav',
  quality audio_quality NOT NULL DEFAULT 'high',
  device_id TEXT,
  waveform JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audio_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES audio_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format audio_format NOT NULL DEFAULT 'mp3',
  quality audio_quality NOT NULL DEFAULT 'high',
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  bit_rate INTEGER NOT NULL DEFAULT 320,
  status export_status NOT NULL DEFAULT 'pending',
  file_url TEXT,
  file_size BIGINT,
  normalize BOOLEAN NOT NULL DEFAULT false,
  include_metadata BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_audio_projects_user_id ON audio_projects(user_id);
CREATE INDEX idx_audio_projects_is_public ON audio_projects(is_public);
CREATE INDEX idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX idx_audio_files_format ON audio_files(format);
CREATE INDEX idx_audio_tracks_project_id ON audio_tracks(project_id);
CREATE INDEX idx_audio_tracks_type ON audio_tracks(type);
CREATE INDEX idx_audio_tracks_order ON audio_tracks(track_order);
CREATE INDEX idx_audio_regions_track_id ON audio_regions(track_id);
CREATE INDEX idx_audio_regions_file_id ON audio_regions(audio_file_id);
CREATE INDEX idx_audio_effects_track_id ON audio_effects(track_id);
CREATE INDEX idx_audio_effects_type ON audio_effects(type);
CREATE INDEX idx_audio_markers_project_id ON audio_markers(project_id);
CREATE INDEX idx_audio_recordings_user_id ON audio_recordings(user_id);
CREATE INDEX idx_audio_recordings_project_id ON audio_recordings(project_id);
CREATE INDEX idx_audio_recordings_status ON audio_recordings(status);
CREATE INDEX idx_audio_exports_project_id ON audio_exports(project_id);
CREATE INDEX idx_audio_exports_user_id ON audio_exports(user_id);
CREATE INDEX idx_audio_exports_status ON audio_exports(status);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_audio_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audio_projects_updated_at BEFORE UPDATE ON audio_projects FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_tracks_updated_at BEFORE UPDATE ON audio_tracks FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_regions_updated_at BEFORE UPDATE ON audio_regions FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_effects_updated_at BEFORE UPDATE ON audio_effects FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_markers_updated_at BEFORE UPDATE ON audio_markers FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_recordings_updated_at BEFORE UPDATE ON audio_recordings FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();
CREATE TRIGGER trigger_audio_exports_updated_at BEFORE UPDATE ON audio_exports FOR EACH ROW EXECUTE FUNCTION update_audio_updated_at();

CREATE OR REPLACE FUNCTION set_audio_export_started_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN NEW.started_at = now(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_audio_export_started_at BEFORE UPDATE ON audio_exports FOR EACH ROW EXECUTE FUNCTION set_audio_export_started_at();

CREATE OR REPLACE FUNCTION set_audio_export_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN NEW.completed_at = now(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_audio_export_completed_at BEFORE UPDATE ON audio_exports FOR EACH ROW EXECUTE FUNCTION set_audio_export_completed_at();
