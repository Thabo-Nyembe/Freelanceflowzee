-- Minimal AI Voice Synthesis Schema
--
-- Comprehensive voice synthesis and text-to-speech:
-- - Voices library with accents and styles
-- - Syntheses with audio output tracking
-- - Projects for multi-voice scripts
-- - Voice Clones for custom voices
-- - Analytics with usage and cost tracking

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS voice_gender CASCADE;
DROP TYPE IF EXISTS voice_age CASCADE;
DROP TYPE IF EXISTS voice_style CASCADE;
DROP TYPE IF EXISTS audio_format CASCADE;
DROP TYPE IF EXISTS audio_quality CASCADE;
DROP TYPE IF EXISTS clone_status CASCADE;
DROP TYPE IF EXISTS project_status CASCADE;

-- Voice gender
CREATE TYPE voice_gender AS ENUM (
  'male',
  'female',
  'neutral'
);

-- Voice age
CREATE TYPE voice_age AS ENUM (
  'child',
  'young-adult',
  'adult',
  'senior'
);

-- Voice style
CREATE TYPE voice_style AS ENUM (
  'professional',
  'casual',
  'energetic',
  'calm',
  'dramatic',
  'friendly',
  'authoritative'
);

-- Audio format
CREATE TYPE audio_format AS ENUM (
  'mp3',
  'wav',
  'ogg',
  'flac'
);

-- Audio quality
CREATE TYPE audio_quality AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- Clone status
CREATE TYPE clone_status AS ENUM (
  'training',
  'ready',
  'failed'
);

-- Project status
CREATE TYPE project_status AS ENUM (
  'draft',
  'processing',
  'completed'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS voice_analytics CASCADE;
DROP TABLE IF EXISTS voice_scripts CASCADE;
DROP TABLE IF EXISTS voice_projects CASCADE;
DROP TABLE IF EXISTS voice_clones CASCADE;
DROP TABLE IF EXISTS voice_syntheses CASCADE;
DROP TABLE IF EXISTS voices CASCADE;

-- Voices
CREATE TABLE voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  language TEXT NOT NULL,
  language_code TEXT NOT NULL,
  gender voice_gender NOT NULL,
  age voice_age NOT NULL,
  accent TEXT,
  description TEXT NOT NULL,
  preview_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_new BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  popularity INTEGER NOT NULL DEFAULT 0,
  usage_count INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Syntheses
CREATE TABLE voice_syntheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voice_id UUID NOT NULL REFERENCES voices(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  audio_url TEXT,
  style voice_style,
  speed DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (speed >= 0.5 AND speed <= 2.0),
  pitch DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (pitch >= 0.5 AND pitch <= 2.0),
  volume INTEGER NOT NULL DEFAULT 80 CHECK (volume >= 0 AND volume <= 100),
  format audio_format NOT NULL DEFAULT 'mp3',
  quality audio_quality NOT NULL DEFAULT 'high',
  duration INTEGER DEFAULT 0,
  file_size BIGINT DEFAULT 0,
  character_count INTEGER NOT NULL DEFAULT 0,
  processing_time INTEGER DEFAULT 0,
  cost DECIMAL(10, 4) DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Clones
CREATE TABLE voice_clones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL,
  sample_count INTEGER NOT NULL DEFAULT 0,
  status clone_status NOT NULL DEFAULT 'training',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Voice Projects
CREATE TABLE voice_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'draft',
  total_duration INTEGER NOT NULL DEFAULT 0,
  script_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Scripts
CREATE TABLE voice_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES voice_projects(id) ON DELETE CASCADE,
  voice_id UUID NOT NULL REFERENCES voices(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  style voice_style,
  speed DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  pitch DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
  volume INTEGER NOT NULL DEFAULT 80,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration INTEGER DEFAULT 0,
  audio_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Voice Analytics
CREATE TABLE voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_syntheses INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0,
  total_cost DECIMAL(10, 4) DEFAULT 0,
  voice_usage JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- voices indexes
CREATE INDEX IF NOT EXISTS idx_voices_user_id ON voices(user_id);
CREATE INDEX IF NOT EXISTS idx_voices_language ON voices(language);
CREATE INDEX IF NOT EXISTS idx_voices_gender ON voices(gender);
CREATE INDEX IF NOT EXISTS idx_voices_is_premium ON voices(is_premium);
CREATE INDEX IF NOT EXISTS idx_voices_is_public ON voices(is_public);
CREATE INDEX IF NOT EXISTS idx_voices_popularity ON voices(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_voices_usage_count ON voices(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_voices_tags ON voices USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_voices_created_at ON voices(created_at DESC);

-- voice_syntheses indexes
CREATE INDEX IF NOT EXISTS idx_voice_syntheses_user_id ON voice_syntheses(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_syntheses_voice_id ON voice_syntheses(voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_syntheses_is_favorite ON voice_syntheses(is_favorite);
CREATE INDEX IF NOT EXISTS idx_voice_syntheses_created_at ON voice_syntheses(created_at DESC);

-- voice_clones indexes
CREATE INDEX IF NOT EXISTS idx_voice_clones_user_id ON voice_clones(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_clones_status ON voice_clones(status);
CREATE INDEX IF NOT EXISTS idx_voice_clones_created_at ON voice_clones(created_at DESC);

-- voice_projects indexes
CREATE INDEX IF NOT EXISTS idx_voice_projects_user_id ON voice_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_projects_status ON voice_projects(status);
CREATE INDEX IF NOT EXISTS idx_voice_projects_created_at ON voice_projects(created_at DESC);

-- voice_scripts indexes
CREATE INDEX IF NOT EXISTS idx_voice_scripts_project_id ON voice_scripts(project_id);
CREATE INDEX IF NOT EXISTS idx_voice_scripts_voice_id ON voice_scripts(voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_scripts_order_index ON voice_scripts(order_index);

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

CREATE TRIGGER trigger_voices_updated_at
  BEFORE UPDATE ON voices
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_syntheses_updated_at
  BEFORE UPDATE ON voice_syntheses
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_clones_updated_at
  BEFORE UPDATE ON voice_clones
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_projects_updated_at
  BEFORE UPDATE ON voice_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_scripts_updated_at
  BEFORE UPDATE ON voice_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

CREATE TRIGGER trigger_voice_analytics_updated_at
  BEFORE UPDATE ON voice_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_updated_at();

-- Auto-set completed_at when clone status changes to ready
CREATE OR REPLACE FUNCTION set_clone_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ready' AND (OLD.status IS NULL OR OLD.status != 'ready') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_clone_completed_at
  BEFORE UPDATE ON voice_clones
  FOR EACH ROW
  EXECUTE FUNCTION set_clone_completed_at();

-- Auto-increment voice usage count on synthesis
CREATE OR REPLACE FUNCTION increment_voice_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voices
  SET usage_count = usage_count + 1
  WHERE id = NEW.voice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_voice_usage
  AFTER INSERT ON voice_syntheses
  FOR EACH ROW
  EXECUTE FUNCTION increment_voice_usage();

-- Auto-update project stats from scripts
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_projects
  SET
    script_count = (
      SELECT COUNT(*)
      FROM voice_scripts
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    total_duration = (
      SELECT COALESCE(SUM(duration), 0)
      FROM voice_scripts
      WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.project_id, OLD.project_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_stats_insert
  AFTER INSERT ON voice_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_project_stats();

CREATE TRIGGER trigger_update_project_stats_update
  AFTER UPDATE ON voice_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_project_stats();

CREATE TRIGGER trigger_update_project_stats_delete
  AFTER DELETE ON voice_scripts
  FOR EACH ROW
  EXECUTE FUNCTION update_project_stats();
