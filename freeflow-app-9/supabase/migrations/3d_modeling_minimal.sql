-- Minimal 3D Modeling Schema
--
-- Comprehensive 3D modeling studio:
-- - Projects and scenes management
-- - Scene objects with transforms (position, rotation, scale)
-- - Materials with PBR properties
-- - Lighting system
-- - Camera controls
-- - Render and export jobs

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS object_type CASCADE;
DROP TYPE IF EXISTS material_type CASCADE;
DROP TYPE IF EXISTS light_type CASCADE;
DROP TYPE IF EXISTS projection_type CASCADE;
DROP TYPE IF EXISTS render_quality CASCADE;
DROP TYPE IF EXISTS export_format CASCADE;
DROP TYPE IF EXISTS job_status CASCADE;

-- 3D object primitives
CREATE TYPE object_type AS ENUM (
  'cube',
  'sphere',
  'cylinder',
  'cone',
  'plane',
  'torus',
  'pyramid',
  'prism'
);

-- Material types
CREATE TYPE material_type AS ENUM (
  'standard',
  'metallic',
  'glass',
  'plastic',
  'fabric',
  'wood',
  'stone',
  'emission'
);

-- Light types
CREATE TYPE light_type AS ENUM (
  'directional',
  'point',
  'spot',
  'ambient',
  'area'
);

-- Camera projection
CREATE TYPE projection_type AS ENUM (
  'perspective',
  'orthographic'
);

-- Render quality presets
CREATE TYPE render_quality AS ENUM (
  'low',
  'medium',
  'high',
  'ultra'
);

-- Export formats
CREATE TYPE export_format AS ENUM (
  'obj',
  'fbx',
  'gltf',
  'stl',
  'dae',
  'blend'
);

-- Job status
CREATE TYPE job_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS export_jobs CASCADE;
DROP TABLE IF EXISTS render_jobs CASCADE;
DROP TABLE IF EXISTS cameras CASCADE;
DROP TABLE IF EXISTS lights CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS scene_objects CASCADE;
DROP TABLE IF EXISTS modeling_scenes CASCADE;
DROP TABLE IF EXISTS modeling_projects CASCADE;

-- 3D Modeling Projects
CREATE TABLE modeling_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  active_scene_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scenes (containers for 3D objects, materials, lights, etc.)
CREATE TABLE modeling_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES modeling_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  grid_size INTEGER NOT NULL DEFAULT 10,
  grid_divisions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3D Scene Objects (meshes with transforms)
CREATE TABLE scene_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type object_type NOT NULL,
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  scale_x DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_y DECIMAL(10, 4) NOT NULL DEFAULT 1,
  scale_z DECIMAL(10, 4) NOT NULL DEFAULT 1,
  material_id UUID,
  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES scene_objects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Materials (PBR materials with textures)
CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type material_type NOT NULL,
  color TEXT NOT NULL,
  roughness DECIMAL(3, 2) NOT NULL DEFAULT 0.5 CHECK (roughness >= 0 AND roughness <= 1),
  metallic DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK (metallic >= 0 AND metallic <= 1),
  emission DECIMAL(3, 2) NOT NULL DEFAULT 0 CHECK (emission >= 0 AND emission <= 1),
  opacity DECIMAL(3, 2) NOT NULL DEFAULT 1 CHECK (opacity >= 0 AND opacity <= 1),
  texture_url TEXT,
  normal_map_url TEXT,
  bump_map_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lights (scene lighting)
CREATE TABLE lights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type light_type NOT NULL,
  intensity INTEGER NOT NULL DEFAULT 50 CHECK (intensity >= 0 AND intensity <= 100),
  color TEXT NOT NULL DEFAULT '#FFFFFF',
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  rotation_x DECIMAL(10, 4) DEFAULT 0,
  rotation_y DECIMAL(10, 4) DEFAULT 0,
  rotation_z DECIMAL(10, 4) DEFAULT 0,
  cast_shadow BOOLEAN NOT NULL DEFAULT true,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cameras (viewpoint configuration)
CREATE TABLE cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type projection_type NOT NULL DEFAULT 'perspective',
  position_x DECIMAL(10, 4) NOT NULL DEFAULT 5,
  position_y DECIMAL(10, 4) NOT NULL DEFAULT 5,
  position_z DECIMAL(10, 4) NOT NULL DEFAULT 5,
  target_x DECIMAL(10, 4) NOT NULL DEFAULT 0,
  target_y DECIMAL(10, 4) NOT NULL DEFAULT 0,
  target_z DECIMAL(10, 4) NOT NULL DEFAULT 0,
  fov INTEGER NOT NULL DEFAULT 75 CHECK (fov >= 1 AND fov <= 180),
  near_plane DECIMAL(10, 4) NOT NULL DEFAULT 0.1,
  far_plane DECIMAL(10, 4) NOT NULL DEFAULT 1000,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Render Jobs (scene rendering)
CREATE TABLE render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality render_quality NOT NULL DEFAULT 'medium',
  resolution_width INTEGER NOT NULL DEFAULT 1280,
  resolution_height INTEGER NOT NULL DEFAULT 720,
  samples INTEGER NOT NULL DEFAULT 64,
  max_bounces INTEGER NOT NULL DEFAULT 8,
  enable_shadows BOOLEAN NOT NULL DEFAULT true,
  enable_reflections BOOLEAN NOT NULL DEFAULT true,
  enable_ambient_occlusion BOOLEAN NOT NULL DEFAULT false,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  output_format TEXT NOT NULL DEFAULT 'png',
  status job_status NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,
  error_message TEXT,
  estimated_time INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Export Jobs (3D file export)
CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  include_textures BOOLEAN NOT NULL DEFAULT true,
  include_materials BOOLEAN NOT NULL DEFAULT true,
  include_lights BOOLEAN NOT NULL DEFAULT true,
  include_camera BOOLEAN NOT NULL DEFAULT true,
  scale DECIMAL(10, 4) NOT NULL DEFAULT 1,
  status job_status NOT NULL DEFAULT 'pending',
  output_url TEXT,
  error_message TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- modeling_projects indexes
CREATE INDEX IF NOT EXISTS idx_modeling_projects_user_id ON modeling_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_is_public ON modeling_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_tags ON modeling_projects USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_created_at ON modeling_projects(created_at DESC);

-- modeling_scenes indexes
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_project_id ON modeling_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_user_id ON modeling_scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_created_at ON modeling_scenes(created_at DESC);

-- scene_objects indexes
CREATE INDEX IF NOT EXISTS idx_scene_objects_scene_id ON scene_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_type ON scene_objects(type);
CREATE INDEX IF NOT EXISTS idx_scene_objects_material_id ON scene_objects(material_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_parent_id ON scene_objects(parent_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_visible ON scene_objects(visible);
CREATE INDEX IF NOT EXISTS idx_scene_objects_locked ON scene_objects(locked);

-- materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_scene_id ON materials(scene_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);

-- lights indexes
CREATE INDEX IF NOT EXISTS idx_lights_scene_id ON lights(scene_id);
CREATE INDEX IF NOT EXISTS idx_lights_type ON lights(type);
CREATE INDEX IF NOT EXISTS idx_lights_enabled ON lights(enabled);

-- cameras indexes
CREATE INDEX IF NOT EXISTS idx_cameras_scene_id ON cameras(scene_id);
CREATE INDEX IF NOT EXISTS idx_cameras_is_active ON cameras(is_active);

-- render_jobs indexes
CREATE INDEX IF NOT EXISTS idx_render_jobs_scene_id ON render_jobs(scene_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- export_jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_scene_id ON export_jobs(scene_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);
CREATE INDEX IF NOT EXISTS idx_export_jobs_created_at ON export_jobs(created_at DESC);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_modeling_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_modeling_projects_updated_at
  BEFORE UPDATE ON modeling_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_modeling_scenes_updated_at
  BEFORE UPDATE ON modeling_scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_scene_objects_updated_at
  BEFORE UPDATE ON scene_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_lights_updated_at
  BEFORE UPDATE ON lights
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_cameras_updated_at
  BEFORE UPDATE ON cameras
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

CREATE TRIGGER trigger_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_modeling_updated_at();

-- Auto-set started_at when render job status changes to processing
CREATE OR REPLACE FUNCTION set_render_started_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND (OLD.status IS NULL OR OLD.status != 'processing') THEN
    NEW.started_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_render_started_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_render_started_at();

-- Auto-set completed_at when render job status changes to completed
CREATE OR REPLACE FUNCTION set_render_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_render_completed_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_render_completed_at();

-- Auto-set completed_at when export job status changes to completed
CREATE OR REPLACE FUNCTION set_export_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_export_completed_at
  BEFORE UPDATE ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_export_completed_at();
