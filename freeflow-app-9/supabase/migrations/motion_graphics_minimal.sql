-- Minimal Motion Graphics Schema
-- Animation and motion design system with projects, layers, animations, exports

-- ENUMS
DROP TYPE IF EXISTS layer_type CASCADE;
DROP TYPE IF EXISTS animation_type CASCADE;
DROP TYPE IF EXISTS easing_function CASCADE;
DROP TYPE IF EXISTS export_status CASCADE;

CREATE TYPE layer_type AS ENUM ('shape', 'text', 'image', 'video', 'solid', 'group');
CREATE TYPE animation_type AS ENUM ('fade', 'slide', 'scale', 'rotate', 'bounce', 'elastic', 'custom');
CREATE TYPE easing_function AS ENUM ('linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier');
CREATE TYPE export_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- TABLES
DROP TABLE IF EXISTS motion_exports CASCADE;
DROP TABLE IF EXISTS motion_animations CASCADE;
DROP TABLE IF EXISTS motion_layers CASCADE;
DROP TABLE IF EXISTS motion_projects CASCADE;

CREATE TABLE motion_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  frame_rate INTEGER NOT NULL DEFAULT 30,
  duration_seconds INTEGER NOT NULL DEFAULT 10,
  background_color TEXT NOT NULL DEFAULT '#000000',
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE motion_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES motion_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type layer_type NOT NULL,
  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  opacity DECIMAL(3, 2) NOT NULL DEFAULT 1.0 CHECK (opacity >= 0 AND opacity <= 1),
  position_x DECIMAL(10, 2) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 2) NOT NULL DEFAULT 0,
  scale_x DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  scale_y DECIMAL(10, 4) NOT NULL DEFAULT 1.0,
  rotation DECIMAL(10, 2) NOT NULL DEFAULT 0,
  blend_mode TEXT DEFAULT 'normal',
  start_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  end_time DECIMAL(10, 2) NOT NULL DEFAULT 10,
  layer_order INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES motion_layers(id) ON DELETE SET NULL,
  properties JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE motion_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID NOT NULL REFERENCES motion_layers(id) ON DELETE CASCADE,
  property TEXT NOT NULL,
  type animation_type NOT NULL,
  easing easing_function NOT NULL DEFAULT 'ease-in-out',
  start_time DECIMAL(10, 2) NOT NULL,
  end_time DECIMAL(10, 2) NOT NULL,
  start_value JSONB NOT NULL,
  end_value JSONB NOT NULL,
  keyframes JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE motion_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES motion_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'mp4',
  quality TEXT NOT NULL DEFAULT 'high',
  status export_status NOT NULL DEFAULT 'pending',
  file_url TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_motion_projects_user_id ON motion_projects(user_id);
CREATE INDEX idx_motion_projects_is_public ON motion_projects(is_public);
CREATE INDEX idx_motion_layers_project_id ON motion_layers(project_id);
CREATE INDEX idx_motion_layers_type ON motion_layers(type);
CREATE INDEX idx_motion_layers_order ON motion_layers(layer_order);
CREATE INDEX idx_motion_animations_layer_id ON motion_animations(layer_id);
CREATE INDEX idx_motion_exports_project_id ON motion_exports(project_id);
CREATE INDEX idx_motion_exports_user_id ON motion_exports(user_id);
CREATE INDEX idx_motion_exports_status ON motion_exports(status);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_motion_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_motion_projects_updated_at BEFORE UPDATE ON motion_projects FOR EACH ROW EXECUTE FUNCTION update_motion_updated_at();
CREATE TRIGGER trigger_motion_layers_updated_at BEFORE UPDATE ON motion_layers FOR EACH ROW EXECUTE FUNCTION update_motion_updated_at();
CREATE TRIGGER trigger_motion_animations_updated_at BEFORE UPDATE ON motion_animations FOR EACH ROW EXECUTE FUNCTION update_motion_updated_at();
CREATE TRIGGER trigger_motion_exports_updated_at BEFORE UPDATE ON motion_exports FOR EACH ROW EXECUTE FUNCTION update_motion_updated_at();

CREATE OR REPLACE FUNCTION set_export_started_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN NEW.started_at = now(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_export_started_at BEFORE UPDATE ON motion_exports FOR EACH ROW EXECUTE FUNCTION set_export_started_at();

CREATE OR REPLACE FUNCTION set_export_completed_at() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN NEW.completed_at = now(); END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_export_completed_at BEFORE UPDATE ON motion_exports FOR EACH ROW EXECUTE FUNCTION set_export_completed_at();
