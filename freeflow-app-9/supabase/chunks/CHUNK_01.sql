-- ============================================================================
-- 3D Modeling System - Production Database Schema
-- ============================================================================
-- Comprehensive 3D modeling studio with scene management, objects, materials,
-- lighting, camera controls, and rendering capabilities
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS object_type CASCADE;
CREATE TYPE object_type AS ENUM ('cube', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'pyramid', 'prism');
DROP TYPE IF EXISTS material_type CASCADE;
CREATE TYPE material_type AS ENUM ('standard', 'metallic', 'glass', 'plastic', 'fabric', 'wood', 'stone', 'emission');
DROP TYPE IF EXISTS light_type CASCADE;
CREATE TYPE light_type AS ENUM ('directional', 'point', 'spot', 'ambient', 'area');
DROP TYPE IF EXISTS tool_type CASCADE;
CREATE TYPE tool_type AS ENUM ('select', 'move', 'rotate', 'scale', 'extrude', 'subdivide');
DROP TYPE IF EXISTS view_mode CASCADE;
CREATE TYPE view_mode AS ENUM ('solid', 'wireframe', 'textured', 'rendered');
DROP TYPE IF EXISTS render_quality CASCADE;
CREATE TYPE render_quality AS ENUM ('low', 'medium', 'high', 'ultra');
DROP TYPE IF EXISTS projection_type CASCADE;
CREATE TYPE projection_type AS ENUM ('perspective', 'orthographic');
DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM ('obj', 'fbx', 'gltf', 'stl', 'dae', 'blend');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Projects
CREATE TABLE IF NOT EXISTS modeling_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  active_scene_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scenes
CREATE TABLE IF NOT EXISTS modeling_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES modeling_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  grid_size INTEGER NOT NULL DEFAULT 10,
  grid_divisions INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scene Objects
CREATE TABLE IF NOT EXISTS scene_objects (
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
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id UUID REFERENCES scene_objects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lights
CREATE TABLE IF NOT EXISTS lights (
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
  cast_shadow BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cameras
CREATE TABLE IF NOT EXISTS cameras (
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
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Render Jobs
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quality render_quality NOT NULL DEFAULT 'medium',
  resolution_width INTEGER NOT NULL DEFAULT 1280,
  resolution_height INTEGER NOT NULL DEFAULT 720,
  samples INTEGER NOT NULL DEFAULT 64,
  max_bounces INTEGER NOT NULL DEFAULT 8,
  enable_shadows BOOLEAN NOT NULL DEFAULT TRUE,
  enable_reflections BOOLEAN NOT NULL DEFAULT TRUE,
  enable_ambient_occlusion BOOLEAN NOT NULL DEFAULT FALSE,
  background_color TEXT NOT NULL DEFAULT '#1a1a1a',
  output_format TEXT NOT NULL DEFAULT 'png',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  output_url TEXT,
  error_message TEXT,
  estimated_time INTEGER, -- seconds
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scene_id UUID NOT NULL REFERENCES modeling_scenes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  include_textures BOOLEAN NOT NULL DEFAULT TRUE,
  include_materials BOOLEAN NOT NULL DEFAULT TRUE,
  include_lights BOOLEAN NOT NULL DEFAULT TRUE,
  include_camera BOOLEAN NOT NULL DEFAULT TRUE,
  scale DECIMAL(10, 4) NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  output_url TEXT,
  error_message TEXT,
  file_size INTEGER, -- bytes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_modeling_projects_user_id ON modeling_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_is_public ON modeling_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_tags ON modeling_projects USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_modeling_projects_created_at ON modeling_projects(created_at DESC);

-- Scenes indexes
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_project_id ON modeling_scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_modeling_scenes_user_id ON modeling_scenes(user_id);

-- Scene Objects indexes
CREATE INDEX IF NOT EXISTS idx_scene_objects_scene_id ON scene_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_type ON scene_objects(type);
CREATE INDEX IF NOT EXISTS idx_scene_objects_material_id ON scene_objects(material_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_parent_id ON scene_objects(parent_id);
CREATE INDEX IF NOT EXISTS idx_scene_objects_visible ON scene_objects(visible);
CREATE INDEX IF NOT EXISTS idx_scene_objects_locked ON scene_objects(locked);

-- Materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_scene_id ON materials(scene_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);

-- Lights indexes
CREATE INDEX IF NOT EXISTS idx_lights_scene_id ON lights(scene_id);
CREATE INDEX IF NOT EXISTS idx_lights_type ON lights(type);
CREATE INDEX IF NOT EXISTS idx_lights_enabled ON lights(enabled);

-- Cameras indexes
CREATE INDEX IF NOT EXISTS idx_cameras_scene_id ON cameras(scene_id);
CREATE INDEX IF NOT EXISTS idx_cameras_is_active ON cameras(is_active);

-- Render Jobs indexes
CREATE INDEX IF NOT EXISTS idx_render_jobs_scene_id ON render_jobs(scene_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_render_jobs_status ON render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- Export Jobs indexes
CREATE INDEX IF NOT EXISTS idx_export_jobs_scene_id ON export_jobs(scene_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_status ON export_jobs(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_modeling_projects_updated_at
  BEFORE UPDATE ON modeling_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modeling_scenes_updated_at
  BEFORE UPDATE ON modeling_scenes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scene_objects_updated_at
  BEFORE UPDATE ON scene_objects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lights_updated_at
  BEFORE UPDATE ON lights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cameras_updated_at
  BEFORE UPDATE ON cameras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_render_jobs_updated_at
  BEFORE UPDATE ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-set job completion timestamps
CREATE OR REPLACE FUNCTION set_job_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_render_job_completed_at
  BEFORE UPDATE OF status ON render_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_completed_at();

CREATE TRIGGER set_export_job_completed_at
  BEFORE UPDATE OF status ON export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_completed_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get project stats
CREATE OR REPLACE FUNCTION get_project_stats(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalScenes', COUNT(DISTINCT ms.id),
    'totalObjects', (
      SELECT COUNT(*)
      FROM scene_objects so
      JOIN modeling_scenes ms ON so.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    ),
    'totalMaterials', (
      SELECT COUNT(*)
      FROM materials m
      JOIN modeling_scenes ms ON m.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    ),
    'totalLights', (
      SELECT COUNT(*)
      FROM lights l
      JOIN modeling_scenes ms ON l.scene_id = ms.id
      WHERE ms.project_id = p_project_id
    )
  )
  INTO v_stats
  FROM modeling_scenes ms
  WHERE ms.project_id = p_project_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Get scene bounds
CREATE OR REPLACE FUNCTION get_scene_bounds(p_scene_id UUID)
RETURNS JSON AS $$
DECLARE
  v_bounds JSON;
BEGIN
  SELECT json_build_object(
    'min', json_build_object(
      'x', MIN(position_x - scale_x),
      'y', MIN(position_y - scale_y),
      'z', MIN(position_z - scale_z)
    ),
    'max', json_build_object(
      'x', MAX(position_x + scale_x),
      'y', MAX(position_y + scale_y),
      'z', MAX(position_z + scale_z)
    ),
    'center', json_build_object(
      'x', (MIN(position_x - scale_x) + MAX(position_x + scale_x)) / 2,
      'y', (MIN(position_y - scale_y) + MAX(position_y + scale_y)) / 2,
      'z', (MIN(position_z - scale_z) + MAX(position_z + scale_z)) / 2
    )
  )
  INTO v_bounds
  FROM scene_objects
  WHERE scene_id = p_scene_id AND visible = TRUE;

  RETURN v_bounds;
END;
$$ LANGUAGE plpgsql;

-- Get objects by type
CREATE OR REPLACE FUNCTION get_objects_by_type(p_scene_id UUID, p_type object_type)
RETURNS TABLE(
  id UUID,
  name TEXT,
  "position" JSON,
  "rotation" JSON,
  "scale" JSON,
  material_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    so.id,
    so.name,
    json_build_object('x', so.position_x, 'y', so.position_y, 'z', so.position_z) AS position,
    json_build_object('x', so.rotation_x, 'y', so.rotation_y, 'z', so.rotation_z) AS rotation,
    json_build_object('x', so.scale_x, 'y', so.scale_y, 'z', so.scale_z) AS scale,
    so.material_id
  FROM scene_objects so
  WHERE so.scene_id = p_scene_id AND so.type = p_type AND so.visible = TRUE
  ORDER BY so.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get enabled lights
CREATE OR REPLACE FUNCTION get_enabled_lights(p_scene_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type light_type,
  intensity INTEGER,
  color TEXT,
  "position" JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.id,
    l.name,
    l.type,
    l.intensity,
    l.color,
    json_build_object('x', l.position_x, 'y', l.position_y, 'z', l.position_z) AS position
  FROM lights l
  WHERE l.scene_id = p_scene_id AND l.enabled = TRUE
  ORDER BY l.intensity DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate total light intensity
CREATE OR REPLACE FUNCTION calculate_light_intensity(p_scene_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total INTEGER;
BEGIN
  SELECT COALESCE(SUM(intensity), 0)
  INTO v_total
  FROM lights
  WHERE scene_id = p_scene_id AND enabled = TRUE;

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Search scene objects
CREATE OR REPLACE FUNCTION search_scene_objects(p_scene_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type object_type,
  visible BOOLEAN,
  locked BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT so.id, so.name, so.type, so.visible, so.locked
  FROM scene_objects so
  WHERE so.scene_id = p_scene_id
    AND (
      so.name ILIKE '%' || p_query || '%'
      OR so.type::TEXT ILIKE '%' || p_query || '%'
    )
  ORDER BY so.name ASC;
END;
$$ LANGUAGE plpgsql;

-- Estimate render time
CREATE OR REPLACE FUNCTION estimate_render_time(
  p_quality render_quality,
  p_object_count INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_base_time INTEGER := 1;
  v_quality_factor DECIMAL;
  v_object_factor DECIMAL;
  v_total INTEGER;
BEGIN
  v_quality_factor := CASE p_quality
    WHEN 'low' THEN 0.5
    WHEN 'medium' THEN 1.0
    WHEN 'high' THEN 2.0
    WHEN 'ultra' THEN 4.0
  END;

  v_object_factor := p_object_count::DECIMAL / 10;

  v_total := CEIL(v_base_time * v_quality_factor * v_object_factor);

  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Duplicate scene object
CREATE OR REPLACE FUNCTION duplicate_object(p_object_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_id UUID;
  v_object scene_objects%ROWTYPE;
BEGIN
  SELECT * INTO v_object FROM scene_objects WHERE id = p_object_id;

  INSERT INTO scene_objects (
    scene_id, name, type,
    position_x, position_y, position_z,
    rotation_x, rotation_y, rotation_z,
    scale_x, scale_y, scale_z,
    material_id, visible, locked
  )
  VALUES (
    v_object.scene_id,
    v_object.name || ' Copy',
    v_object.type,
    v_object.position_x + 1,
    v_object.position_y,
    v_object.position_z + 1,
    v_object.rotation_x,
    v_object.rotation_y,
    v_object.rotation_z,
    v_object.scale_x,
    v_object.scale_y,
    v_object.scale_z,
    v_object.material_id,
    v_object.visible,
    FALSE
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE modeling_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE modeling_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scene_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE lights ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_jobs ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects"
  ON modeling_projects FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can create their own projects"
  ON modeling_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON modeling_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON modeling_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Scenes policies
CREATE POLICY "Users can view scenes from their projects or public projects"
  ON modeling_scenes FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM modeling_projects
      WHERE id = modeling_scenes.project_id AND is_public = TRUE
    )
  );

CREATE POLICY "Users can create scenes in their projects"
  ON modeling_scenes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes"
  ON modeling_scenes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes"
  ON modeling_scenes FOR DELETE
  USING (auth.uid() = user_id);

-- Scene Objects policies
CREATE POLICY "Users can view objects from accessible scenes"
  ON scene_objects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = scene_objects.scene_id
      AND (
        user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects
          WHERE id = modeling_scenes.project_id AND is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage objects in their scenes"
  ON scene_objects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = scene_objects.scene_id AND user_id = auth.uid()
  ));

-- Materials policies (same pattern as objects)
CREATE POLICY "Users can view materials from accessible scenes"
  ON materials FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = materials.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage materials in their scenes"
  ON materials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = materials.scene_id AND user_id = auth.uid()
  ));

-- Lights policies
CREATE POLICY "Users can view lights from accessible scenes"
  ON lights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = lights.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage lights in their scenes"
  ON lights FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = lights.scene_id AND user_id = auth.uid()
  ));

-- Cameras policies
CREATE POLICY "Users can view cameras from accessible scenes"
  ON cameras FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes ms
    WHERE ms.id = cameras.scene_id
      AND (
        ms.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM modeling_projects mp
          WHERE mp.id = ms.project_id AND mp.is_public = TRUE
        )
      )
  ));

CREATE POLICY "Users can manage cameras in their scenes"
  ON cameras FOR ALL
  USING (EXISTS (
    SELECT 1 FROM modeling_scenes
    WHERE id = cameras.scene_id AND user_id = auth.uid()
  ));

-- Render Jobs policies
CREATE POLICY "Users can view their own render jobs"
  ON render_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create render jobs for their scenes"
  ON render_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM modeling_scenes
      WHERE id = render_jobs.scene_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own render jobs"
  ON render_jobs FOR UPDATE
  USING (auth.uid() = user_id);

-- Export Jobs policies
CREATE POLICY "Users can view their own export jobs"
  ON export_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create export jobs for their scenes"
  ON export_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM modeling_scenes
      WHERE id = export_jobs.scene_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own export jobs"
  ON export_jobs FOR UPDATE
  USING (auth.uid() = user_id);
-- ========================================
-- A-PLUS SHOWCASE SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete component showcase platform with:
-- - Component library with code examples
-- - Multiple categories and difficulty levels
-- - Code syntax highlighting support
-- - Downloads and views tracking
-- - Favorites and collections
-- - Reviews and ratings
-- - Version management
--
-- Tables: 8
-- Functions: 7
-- Indexes: 40
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS component_category CASCADE;
CREATE TYPE component_category AS ENUM (
  'ui',
  'layout',
  'animation',
  'data-display',
  'navigation',
  'feedback',
  'forms',
  'utilities'
);

DROP TYPE IF EXISTS difficulty_level CASCADE;
CREATE TYPE difficulty_level AS ENUM (
  'beginner',
  'intermediate',
  'advanced',
  'expert'
);

DROP TYPE IF EXISTS code_language CASCADE;
CREATE TYPE code_language AS ENUM (
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'css',
  'html',
  'json'
);

-- ========================================
-- TABLES
-- ========================================

-- Component Showcases
CREATE TABLE IF NOT EXISTS component_showcases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category component_category NOT NULL,
  difficulty difficulty_level NOT NULL,
  code TEXT NOT NULL,
  preview TEXT,
  language code_language NOT NULL,
  tags TEXT[] DEFAULT '{}',
  popularity INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',
  dependencies TEXT[] DEFAULT '{}',
  license TEXT NOT NULL DEFAULT 'MIT',
  repository TEXT,
  documentation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Examples
CREATE TABLE IF NOT EXISTS component_examples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  preview TEXT,
  language code_language NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Versions
CREATE TABLE IF NOT EXISTS component_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changes TEXT[] DEFAULT '{}',
  code TEXT NOT NULL,
  breaking BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, version)
);

-- Component Favorites
CREATE TABLE IF NOT EXISTS component_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, component_id)
);

-- Component Reviews
CREATE TABLE IF NOT EXISTS component_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  helpful INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, user_id)
);

-- Component Downloads
CREATE TABLE IF NOT EXISTS component_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Collections
CREATE TABLE IF NOT EXISTS component_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  component_ids UUID[] DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Component Analytics
CREATE TABLE IF NOT EXISTS component_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES component_showcases(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  favorites INTEGER NOT NULL DEFAULT 0,
  copies INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(component_id, date)
);

-- ========================================
-- INDEXES
-- ========================================

-- Component Showcases Indexes
CREATE INDEX IF NOT EXISTS idx_component_showcases_user_id ON component_showcases(user_id);
CREATE INDEX IF NOT EXISTS idx_component_showcases_category ON component_showcases(category);
CREATE INDEX IF NOT EXISTS idx_component_showcases_difficulty ON component_showcases(difficulty);
CREATE INDEX IF NOT EXISTS idx_component_showcases_language ON component_showcases(language);
CREATE INDEX IF NOT EXISTS idx_component_showcases_popularity ON component_showcases(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_component_showcases_downloads ON component_showcases(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_component_showcases_views ON component_showcases(views DESC);
CREATE INDEX IF NOT EXISTS idx_component_showcases_is_premium ON component_showcases(is_premium);
CREATE INDEX IF NOT EXISTS idx_component_showcases_is_verified ON component_showcases(is_verified);
CREATE INDEX IF NOT EXISTS idx_component_showcases_created_at ON component_showcases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_component_showcases_updated_at ON component_showcases(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_component_showcases_name ON component_showcases USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_component_showcases_description ON component_showcases USING GIN(description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_component_showcases_tags ON component_showcases USING GIN(tags);

-- Component Examples Indexes
CREATE INDEX IF NOT EXISTS idx_component_examples_component_id ON component_examples(component_id);
CREATE INDEX IF NOT EXISTS idx_component_examples_order_index ON component_examples(component_id, order_index);

-- Component Versions Indexes
CREATE INDEX IF NOT EXISTS idx_component_versions_component_id ON component_versions(component_id);
CREATE INDEX IF NOT EXISTS idx_component_versions_version ON component_versions(component_id, version);
CREATE INDEX IF NOT EXISTS idx_component_versions_release_date ON component_versions(release_date DESC);

-- Component Favorites Indexes
CREATE INDEX IF NOT EXISTS idx_component_favorites_user_id ON component_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_component_favorites_component_id ON component_favorites(component_id);
CREATE INDEX IF NOT EXISTS idx_component_favorites_created_at ON component_favorites(created_at DESC);

-- Component Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_component_reviews_component_id ON component_reviews(component_id);
CREATE INDEX IF NOT EXISTS idx_component_reviews_user_id ON component_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_component_reviews_rating ON component_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_component_reviews_created_at ON component_reviews(created_at DESC);

-- Component Downloads Indexes
CREATE INDEX IF NOT EXISTS idx_component_downloads_component_id ON component_downloads(component_id);
CREATE INDEX IF NOT EXISTS idx_component_downloads_user_id ON component_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_component_downloads_downloaded_at ON component_downloads(downloaded_at DESC);

-- Component Collections Indexes
CREATE INDEX IF NOT EXISTS idx_component_collections_user_id ON component_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_component_collections_is_public ON component_collections(is_public);

-- Component Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_component_analytics_component_id ON component_analytics(component_id);
CREATE INDEX IF NOT EXISTS idx_component_analytics_date ON component_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_component_analytics_component_date ON component_analytics(component_id, date DESC);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_component_showcases_updated_at BEFORE UPDATE ON component_showcases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_examples_updated_at BEFORE UPDATE ON component_examples
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_reviews_updated_at BEFORE UPDATE ON component_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_collections_updated_at BEFORE UPDATE ON component_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_analytics_updated_at BEFORE UPDATE ON component_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update download count
CREATE OR REPLACE FUNCTION update_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE component_showcases
  SET downloads = downloads + 1
  WHERE id = NEW.component_id;

  -- Update daily analytics
  INSERT INTO component_analytics (component_id, date, downloads)
  VALUES (NEW.component_id, CURRENT_DATE, 1)
  ON CONFLICT (component_id, date)
  DO UPDATE SET downloads = component_analytics.downloads + 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_download_count
  AFTER INSERT ON component_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_download_count();

-- Update popularity on favorites
CREATE OR REPLACE FUNCTION update_popularity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE component_showcases
    SET popularity = popularity + 10
    WHERE id = NEW.component_id;

    -- Update daily analytics
    INSERT INTO component_analytics (component_id, date, favorites)
    VALUES (NEW.component_id, CURRENT_DATE, 1)
    ON CONFLICT (component_id, date)
    DO UPDATE SET favorites = component_analytics.favorites + 1;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE component_showcases
    SET popularity = GREATEST(popularity - 10, 0)
    WHERE id = OLD.component_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_popularity_on_favorite
  AFTER INSERT OR DELETE ON component_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_popularity();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search components
CREATE OR REPLACE FUNCTION search_components(
  p_search_term TEXT,
  p_category component_category DEFAULT NULL,
  p_difficulty difficulty_level DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM component_showcases
  WHERE (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_category IS NULL OR category = p_category)
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY popularity DESC, downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get component stats
CREATE OR REPLACE FUNCTION get_component_stats()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalComponents', COUNT(*),
      'totalDownloads', COALESCE(SUM(downloads), 0),
      'totalViews', COALESCE(SUM(views), 0),
      'premiumComponents', COUNT(*) FILTER (WHERE is_premium = true),
      'verifiedComponents', COUNT(*) FILTER (WHERE is_verified = true),
      'averagePopularity', COALESCE(AVG(popularity), 0),
      'byCategory', (
        SELECT json_object_agg(category, count)
        FROM (
          SELECT category, COUNT(*) as count
          FROM component_showcases
          GROUP BY category
        ) t
      ),
      'byDifficulty', (
        SELECT json_object_agg(difficulty, count)
        FROM (
          SELECT difficulty, COUNT(*) as count
          FROM component_showcases
          GROUP BY difficulty
        ) t
      )
    )
    FROM component_showcases
  );
END;
$$ LANGUAGE plpgsql;

-- Record component view
CREATE OR REPLACE FUNCTION record_component_view(
  p_component_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE component_showcases
  SET views = views + 1
  WHERE id = p_component_id;

  -- Update daily analytics
  INSERT INTO component_analytics (component_id, date, views)
  VALUES (p_component_id, CURRENT_DATE, 1)
  ON CONFLICT (component_id, date)
  DO UPDATE SET views = component_analytics.views + 1;
END;
$$ LANGUAGE plpgsql;

-- Toggle favorite
CREATE OR REPLACE FUNCTION toggle_component_favorite(
  p_user_id UUID,
  p_component_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM component_favorites
    WHERE user_id = p_user_id AND component_id = p_component_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM component_favorites
    WHERE user_id = p_user_id AND component_id = p_component_id;
    RETURN json_build_object('favorited', false);
  ELSE
    INSERT INTO component_favorites (user_id, component_id)
    VALUES (p_user_id, p_component_id);
    RETURN json_build_object('favorited', true);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get trending components
CREATE OR REPLACE FUNCTION get_trending_components(
  p_days INTEGER DEFAULT 30,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM component_showcases c
  WHERE c.created_at >= CURRENT_DATE - p_days
  ORDER BY c.popularity DESC, c.downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get user favorites
CREATE OR REPLACE FUNCTION get_user_favorites(p_user_id UUID)
RETURNS SETOF component_showcases AS $$
BEGIN
  RETURN QUERY
  SELECT c.*
  FROM component_showcases c
  JOIN component_favorites f ON c.id = f.component_id
  WHERE f.user_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create component version
CREATE OR REPLACE FUNCTION create_component_version(
  p_component_id UUID,
  p_version TEXT,
  p_changes TEXT[],
  p_breaking BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
  v_code TEXT;
BEGIN
  -- Get current code
  SELECT code INTO v_code
  FROM component_showcases
  WHERE id = p_component_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Component not found');
  END IF;

  -- Create version
  INSERT INTO component_versions (component_id, version, changes, code, breaking)
  VALUES (p_component_id, p_version, p_changes, v_code, p_breaking);

  -- Update component version
  UPDATE component_showcases
  SET version = p_version
  WHERE id = p_component_id;

  RETURN json_build_object('success', true, 'version', p_version);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE component_showcases ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_analytics ENABLE ROW LEVEL SECURITY;

-- Component Showcases Policies
CREATE POLICY component_showcases_select ON component_showcases FOR SELECT USING (true);
CREATE POLICY component_showcases_insert ON component_showcases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_showcases_update ON component_showcases FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_showcases_delete ON component_showcases FOR DELETE USING (auth.uid() = user_id);

-- Component Examples Policies
CREATE POLICY component_examples_select ON component_examples FOR SELECT USING (true);
CREATE POLICY component_examples_insert ON component_examples FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));
CREATE POLICY component_examples_update ON component_examples FOR UPDATE
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));
CREATE POLICY component_examples_delete ON component_examples FOR DELETE
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_examples.component_id AND user_id = auth.uid()));

-- Component Versions Policies
CREATE POLICY component_versions_select ON component_versions FOR SELECT USING (true);
CREATE POLICY component_versions_insert ON component_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_versions.component_id AND user_id = auth.uid()));

-- Component Favorites Policies
CREATE POLICY component_favorites_select ON component_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY component_favorites_insert ON component_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_favorites_delete ON component_favorites FOR DELETE USING (auth.uid() = user_id);

-- Component Reviews Policies
CREATE POLICY component_reviews_select ON component_reviews FOR SELECT USING (true);
CREATE POLICY component_reviews_insert ON component_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_reviews_update ON component_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_reviews_delete ON component_reviews FOR DELETE USING (auth.uid() = user_id);

-- Component Downloads Policies
CREATE POLICY component_downloads_select ON component_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY component_downloads_insert ON component_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Component Collections Policies
CREATE POLICY component_collections_select ON component_collections FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY component_collections_insert ON component_collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY component_collections_update ON component_collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY component_collections_delete ON component_collections FOR DELETE USING (auth.uid() = user_id);

-- Component Analytics Policies
CREATE POLICY component_analytics_select ON component_analytics FOR SELECT
  USING (EXISTS (SELECT 1 FROM component_showcases WHERE id = component_analytics.component_id AND user_id = auth.uid()));

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE component_showcases IS 'Component showcase library with code examples';
COMMENT ON TABLE component_examples IS 'Multiple examples for each component';
COMMENT ON TABLE component_versions IS 'Component version history';
COMMENT ON TABLE component_favorites IS 'User favorite components';
COMMENT ON TABLE component_reviews IS 'Component reviews and ratings';
COMMENT ON TABLE component_downloads IS 'Component download tracking';
COMMENT ON TABLE component_collections IS 'User-created component collections';
COMMENT ON TABLE component_analytics IS 'Daily component analytics';
-- ============================================================================
-- Admin Analytics System - Production Database Schema
-- ============================================================================
-- Comprehensive analytics and reporting with revenue tracking, conversion funnels,
-- traffic analysis, ROI calculations, and business intelligence
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS date_range CASCADE;
CREATE TYPE date_range AS ENUM ('7d', '30d', '90d', '365d', 'custom');
DROP TYPE IF EXISTS metric_type CASCADE;
CREATE TYPE metric_type AS ENUM ('revenue', 'conversion', 'traffic', 'roi', 'aov', 'ltv');
DROP TYPE IF EXISTS trend_direction CASCADE;
CREATE TYPE trend_direction AS ENUM ('up', 'down', 'stable');
DROP TYPE IF EXISTS traffic_source CASCADE;
CREATE TYPE traffic_source AS ENUM ('organic', 'direct', 'social', 'referral', 'paid', 'email');
DROP TYPE IF EXISTS conversion_stage CASCADE;
CREATE TYPE conversion_stage AS ENUM ('visitor', 'lead', 'qualified', 'proposal', 'customer');
DROP TYPE IF EXISTS insight_type CASCADE;
CREATE TYPE insight_type AS ENUM ('opportunity', 'warning', 'success', 'info');
DROP TYPE IF EXISTS insight_priority CASCADE;
CREATE TYPE insight_priority AS ENUM ('high', 'medium', 'low');
DROP TYPE IF EXISTS report_type CASCADE;
CREATE TYPE report_type AS ENUM ('revenue', 'conversion', 'traffic', 'full');
DROP TYPE IF EXISTS report_format CASCADE;
CREATE TYPE report_format AS ENUM ('pdf', 'csv', 'xlsx', 'json');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Revenue Data
CREATE TABLE IF NOT EXISTS revenue_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  transactions INTEGER NOT NULL DEFAULT 0,
  average_order_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  refunds DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Conversion Funnel
CREATE TABLE IF NOT EXISTS conversion_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  stage conversion_stage NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, stage)
);

-- Traffic Sources
CREATE TABLE IF NOT EXISTS traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  source traffic_source NOT NULL,
  visitors INTEGER NOT NULL DEFAULT 0,
  sessions INTEGER NOT NULL DEFAULT 0,
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  avg_session_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, source)
);

-- Analytics Insights
CREATE TABLE IF NOT EXISTS analytics_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  priority insight_priority NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  metric metric_type NOT NULL,
  impact TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Metrics
CREATE TABLE IF NOT EXISTS metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  type metric_type NOT NULL,
  value DECIMAL(12, 2) NOT NULL,
  previous_value DECIMAL(12, 2) NOT NULL,
  change DECIMAL(12, 2) NOT NULL,
  change_percentage DECIMAL(5, 2) NOT NULL,
  trend trend_direction NOT NULL,
  goal DECIMAL(12, 2),
  unit TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date, type)
);

-- Analytics Reports
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type report_type NOT NULL,
  date_range date_range NOT NULL,
  format report_format NOT NULL,
  custom_start_date DATE,
  custom_end_date DATE,
  data JSONB NOT NULL DEFAULT '{}',
  file_url TEXT,
  file_size INTEGER, -- bytes
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_pageviews INTEGER NOT NULL DEFAULT 0,
  avg_session_duration INTEGER NOT NULL DEFAULT 0, -- seconds
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  top_pages JSONB DEFAULT '[]',
  devices JSONB DEFAULT '[]',
  locations JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Revenue Data indexes
CREATE INDEX IF NOT EXISTS idx_revenue_data_user_id ON revenue_data(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_data_date ON revenue_data(date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_data_user_date ON revenue_data(user_id, date DESC);

-- Conversion Funnel indexes
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_user_id ON conversion_funnel(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_date ON conversion_funnel(date DESC);
CREATE INDEX IF NOT EXISTS idx_conversion_funnel_stage ON conversion_funnel(stage);

-- Traffic Sources indexes
CREATE INDEX IF NOT EXISTS idx_traffic_sources_user_id ON traffic_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_date ON traffic_sources(date DESC);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_source ON traffic_sources(source);

-- Analytics Insights indexes
CREATE INDEX IF NOT EXISTS idx_analytics_insights_user_id ON analytics_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_type ON analytics_insights(type);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_priority ON analytics_insights(priority);
CREATE INDEX IF NOT EXISTS idx_analytics_insights_dismissed ON analytics_insights(dismissed_at) WHERE dismissed_at IS NULL;

-- Metrics indexes
CREATE INDEX IF NOT EXISTS idx_metrics_user_id ON metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_metrics_date ON metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_type ON metrics(type);

-- Analytics Reports indexes
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_generated_at ON analytics_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_type ON analytics_reports(type);

-- User Analytics indexes
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_analytics_updated_at
  BEFORE UPDATE ON user_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate net revenue
CREATE OR REPLACE FUNCTION calculate_net_revenue()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_revenue = NEW.revenue - NEW.refunds;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_net_revenue_trigger
  BEFORE INSERT OR UPDATE OF revenue, refunds ON revenue_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_net_revenue();

-- Auto-calculate average order value
CREATE OR REPLACE FUNCTION calculate_aov()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transactions > 0 THEN
    NEW.average_order_value = NEW.revenue / NEW.transactions;
  ELSE
    NEW.average_order_value = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_aov_trigger
  BEFORE INSERT OR UPDATE OF revenue, transactions ON revenue_data
  FOR EACH ROW
  EXECUTE FUNCTION calculate_aov();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get analytics summary
CREATE OR REPLACE FUNCTION get_analytics_summary(p_user_id UUID, p_date_range date_range)
RETURNS JSON AS $$
DECLARE
  v_days INTEGER;
  v_start_date DATE;
  v_summary JSON;
BEGIN
  v_days := CASE p_date_range
    WHEN '7d' THEN 7
    WHEN '30d' THEN 30
    WHEN '90d' THEN 90
    WHEN '365d' THEN 365
    ELSE 30
  END;
  v_start_date := CURRENT_DATE - v_days;

  SELECT json_build_object(
    'totalRevenue', COALESCE(SUM(revenue), 0),
    'totalTransactions', COALESCE(SUM(transactions), 0),
    'averageOrderValue', CASE WHEN SUM(transactions) > 0 THEN SUM(revenue) / SUM(transactions) ELSE 0 END,
    'netRevenue', COALESCE(SUM(net_revenue), 0),
    'totalRefunds', COALESCE(SUM(refunds), 0)
  )
  INTO v_summary
  FROM revenue_data
  WHERE user_id = p_user_id AND date >= v_start_date;

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql;

-- Get conversion funnel for period
CREATE OR REPLACE FUNCTION get_conversion_funnel_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  stage conversion_stage,
  total_count BIGINT,
  avg_conversion_rate DECIMAL,
  avg_dropoff_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cf.stage,
    SUM(cf.count)::BIGINT,
    AVG(cf.conversion_rate),
    AVG(cf.dropoff_rate)
  FROM conversion_funnel cf
  WHERE cf.user_id = p_user_id
    AND cf.date >= CURRENT_DATE - p_days
  GROUP BY cf.stage
  ORDER BY CASE cf.stage
    WHEN 'visitor' THEN 1
    WHEN 'lead' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'proposal' THEN 4
    WHEN 'customer' THEN 5
  END;
END;
$$ LANGUAGE plpgsql;

-- Get top traffic sources
CREATE OR REPLACE FUNCTION get_top_traffic_sources(p_user_id UUID, p_days INTEGER DEFAULT 30, p_limit INTEGER DEFAULT 5)
RETURNS TABLE(
  source traffic_source,
  total_visitors BIGINT,
  total_conversions BIGINT,
  avg_conversion_rate DECIMAL,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ts.source,
    SUM(ts.visitors)::BIGINT,
    SUM(ts.conversions)::BIGINT,
    AVG(ts.conversion_rate),
    SUM(ts.revenue)
  FROM traffic_sources ts
  WHERE ts.user_id = p_user_id
    AND ts.date >= CURRENT_DATE - p_days
  GROUP BY ts.source
  ORDER BY SUM(ts.visitors) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get active insights
CREATE OR REPLACE FUNCTION get_active_insights(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type insight_type,
  priority insight_priority,
  title TEXT,
  description TEXT,
  impact TEXT,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ai.id, ai.type, ai.priority, ai.title, ai.description, ai.impact, ai.recommendation
  FROM analytics_insights ai
  WHERE ai.user_id = p_user_id
    AND ai.dismissed_at IS NULL
  ORDER BY
    CASE ai.priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
    END,
    ai.detected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Calculate ROI
CREATE OR REPLACE FUNCTION calculate_roi(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS DECIMAL AS $$
DECLARE
  v_total_revenue DECIMAL;
  v_total_spent DECIMAL;
  v_roi DECIMAL;
BEGIN
  SELECT COALESCE(SUM(revenue), 0)
  INTO v_total_revenue
  FROM revenue_data
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days;

  SELECT COALESCE(SUM(visitors * 2), 0)
  INTO v_total_spent
  FROM traffic_sources
  WHERE user_id = p_user_id AND date >= CURRENT_DATE - p_days;

  IF v_total_spent > 0 THEN
    v_roi := ((v_total_revenue - v_total_spent) / v_total_spent) * 100;
  ELSE
    v_roi := 0;
  END IF;

  RETURN ROUND(v_roi, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE revenue_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_funnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Revenue Data policies
CREATE POLICY "Users can view their own revenue data"
  ON revenue_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own revenue data"
  ON revenue_data FOR ALL
  USING (auth.uid() = user_id);

-- Similar policies for other tables
CREATE POLICY "Users can view their own conversion funnel"
  ON conversion_funnel FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conversion funnel"
  ON conversion_funnel FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own traffic sources"
  ON traffic_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own traffic sources"
  ON traffic_sources FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights"
  ON analytics_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own insights"
  ON analytics_insights FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own metrics"
  ON metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own metrics"
  ON metrics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
  ON analytics_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own reports"
  ON analytics_reports FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own user analytics"
  ON user_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own user analytics"
  ON user_analytics FOR ALL
  USING (auth.uid() = user_id);
-- =====================================================
-- ADMIN MARKETING SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive marketing management with leads, campaigns,
-- email automation, analytics, and ROI tracking
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS lead_status CASCADE;
CREATE TYPE lead_status AS ENUM (
  'new',
  'contacted',
  'qualified',
  'proposal',
  'negotiation',
  'won',
  'lost'
);

DROP TYPE IF EXISTS lead_score CASCADE;
CREATE TYPE lead_score AS ENUM (
  'cold',
  'warm',
  'hot'
);

DROP TYPE IF EXISTS lead_source CASCADE;
CREATE TYPE lead_source AS ENUM (
  'website',
  'referral',
  'social',
  'email',
  'event',
  'manual',
  'advertising'
);

DROP TYPE IF EXISTS campaign_status CASCADE;
CREATE TYPE campaign_status AS ENUM (
  'draft',
  'scheduled',
  'active',
  'paused',
  'completed',
  'archived'
);

DROP TYPE IF EXISTS campaign_type CASCADE;
CREATE TYPE campaign_type AS ENUM (
  'email',
  'social',
  'content',
  'ppc',
  'seo',
  'event',
  'partnership'
);

DROP TYPE IF EXISTS email_campaign_status CASCADE;
CREATE TYPE email_campaign_status AS ENUM (
  'draft',
  'scheduled',
  'sending',
  'sent'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Marketing Leads
CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  score lead_score NOT NULL DEFAULT 'cold',
  score_value INTEGER NOT NULL DEFAULT 0 CHECK (score_value >= 0 AND score_value <= 100),
  source lead_source NOT NULL,
  interests TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  engagement_level INTEGER NOT NULL DEFAULT 5 CHECK (engagement_level >= 1 AND engagement_level <= 10),
  last_contact TIMESTAMPTZ,
  next_follow_up TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  estimated_value DECIMAL(12, 2),
  notes TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'draft',
  budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  target_audience TEXT[] DEFAULT '{}',
  channels TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Goals
CREATE TABLE IF NOT EXISTS campaign_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target INTEGER NOT NULL,
  current INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ctr DECIMAL(5, 2) NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  roi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_per_lead DECIMAL(10, 2) NOT NULL DEFAULT 0,
  cost_per_conversion DECIMAL(10, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT NOT NULL,
  recipients INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL DEFAULT 0,
  delivered INTEGER NOT NULL DEFAULT 0,
  opened INTEGER NOT NULL DEFAULT 0,
  clicked INTEGER NOT NULL DEFAULT 0,
  bounced INTEGER NOT NULL DEFAULT 0,
  unsubscribed INTEGER NOT NULL DEFAULT 0,
  open_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  click_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  bounce_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  status email_campaign_status NOT NULL DEFAULT 'draft',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Stats (aggregated)
CREATE TABLE IF NOT EXISTS marketing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_leads INTEGER NOT NULL DEFAULT 0,
  new_leads INTEGER NOT NULL DEFAULT 0,
  qualified_leads INTEGER NOT NULL DEFAULT 0,
  hot_leads INTEGER NOT NULL DEFAULT 0,
  conversion_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  total_campaigns INTEGER NOT NULL DEFAULT 0,
  active_campaigns INTEGER NOT NULL DEFAULT 0,
  total_budget DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  roi DECIMAL(10, 2) NOT NULL DEFAULT 0,
  average_lead_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Marketing Leads Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_leads_user_id ON marketing_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_status ON marketing_leads(status);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_score ON marketing_leads(score);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_source ON marketing_leads(source);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_score_value ON marketing_leads(score_value DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_assigned_to ON marketing_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_next_follow_up ON marketing_leads(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_tags ON marketing_leads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_name_search ON marketing_leads USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_marketing_leads_email_search ON marketing_leads USING GIN(to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS idx_marketing_leads_created_at ON marketing_leads(created_at DESC);

-- Marketing Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_user_id ON marketing_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_start_date ON marketing_campaigns(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_by ON marketing_campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_tags ON marketing_campaigns USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_name_search ON marketing_campaigns USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_created_at ON marketing_campaigns(created_at DESC);

-- Campaign Goals Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_goals_campaign_id ON campaign_goals(campaign_id);

-- Campaign Metrics Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics(date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_roi ON campaign_metrics(roi DESC);

-- Email Campaigns Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_campaign_id ON email_campaigns(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user_id ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled_at ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);

-- Marketing Stats Indexes
CREATE INDEX IF NOT EXISTS idx_marketing_stats_user_id ON marketing_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_stats_date ON marketing_stats(date DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_marketing_leads_updated_at
  BEFORE UPDATE ON marketing_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at
  BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_goals_updated_at
  BEFORE UPDATE ON campaign_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_metrics_updated_at
  BEFORE UPDATE ON campaign_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_stats_updated_at
  BEFORE UPDATE ON marketing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get marketing statistics
CREATE OR REPLACE FUNCTION get_marketing_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalLeads', COUNT(*),
    'qualifiedLeads', COUNT(*) FILTER (WHERE status = 'qualified'),
    'hotLeads', COUNT(*) FILTER (WHERE score = 'hot'),
    'conversionRate', ROUND(
      (COUNT(*) FILTER (WHERE status = 'won')::DECIMAL / GREATEST(COUNT(*), 1)) * 100,
      2
    ),
    'averageLeadScore', ROUND(AVG(score_value), 2),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM marketing_leads
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'bySource', (
      SELECT json_object_agg(source, cnt)
      FROM (
        SELECT source, COUNT(*) as cnt
        FROM marketing_leads
        WHERE user_id = p_user_id
        GROUP BY source
      ) source_counts
    )
  ) INTO v_stats
  FROM marketing_leads
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search leads
CREATE OR REPLACE FUNCTION search_marketing_leads(
  p_user_id UUID,
  p_search_term TEXT,
  p_status lead_status DEFAULT NULL,
  p_score lead_score DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  company TEXT,
  status lead_status,
  score lead_score,
  score_value INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ml.id,
    ml.name,
    ml.email,
    ml.company,
    ml.status,
    ml.score,
    ml.score_value,
    ts_rank(
      to_tsvector('english', ml.name || ' ' || ml.email || ' ' || COALESCE(ml.company, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM marketing_leads ml
  WHERE ml.user_id = p_user_id
    AND (p_status IS NULL OR ml.status = p_status)
    AND (p_score IS NULL OR ml.score = p_score)
    AND (
      p_search_term = '' OR
      to_tsvector('english', ml.name || ' ' || ml.email || ' ' || COALESCE(ml.company, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, ml.score_value DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Update campaign metrics
CREATE OR REPLACE FUNCTION update_campaign_metrics(
  p_campaign_id UUID,
  p_impressions INTEGER,
  p_clicks INTEGER,
  p_conversions INTEGER,
  p_revenue DECIMAL
)
RETURNS VOID AS $$
DECLARE
  v_campaign marketing_campaigns%ROWTYPE;
  v_ctr DECIMAL;
  v_conversion_rate DECIMAL;
  v_roi DECIMAL;
BEGIN
  SELECT * INTO v_campaign FROM marketing_campaigns WHERE id = p_campaign_id;

  v_ctr := CASE WHEN p_impressions > 0 THEN (p_clicks::DECIMAL / p_impressions) * 100 ELSE 0 END;
  v_conversion_rate := CASE WHEN p_clicks > 0 THEN (p_conversions::DECIMAL / p_clicks) * 100 ELSE 0 END;
  v_roi := CASE WHEN v_campaign.spent > 0 THEN ((p_revenue - v_campaign.spent) / v_campaign.spent) * 100 ELSE 0 END;

  INSERT INTO campaign_metrics (
    campaign_id, impressions, clicks, conversions, revenue,
    ctr, conversion_rate, roi,
    cost_per_lead, cost_per_conversion
  )
  VALUES (
    p_campaign_id, p_impressions, p_clicks, p_conversions, p_revenue,
    v_ctr, v_conversion_rate, v_roi,
    CASE WHEN p_conversions > 0 THEN v_campaign.spent / p_conversions ELSE 0 END,
    CASE WHEN p_conversions > 0 THEN v_campaign.spent / p_conversions ELSE 0 END
  )
  ON CONFLICT (campaign_id, date)
  DO UPDATE SET
    impressions = EXCLUDED.impressions,
    clicks = EXCLUDED.clicks,
    conversions = EXCLUDED.conversions,
    revenue = EXCLUDED.revenue,
    ctr = EXCLUDED.ctr,
    conversion_rate = EXCLUDED.conversion_rate,
    roi = EXCLUDED.roi,
    cost_per_lead = EXCLUDED.cost_per_lead,
    cost_per_conversion = EXCLUDED.cost_per_conversion,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Update marketing stats daily
CREATE OR REPLACE FUNCTION update_marketing_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO marketing_stats (
    user_id, date,
    total_leads, new_leads, qualified_leads, hot_leads,
    conversion_rate, total_campaigns, active_campaigns,
    total_budget, total_spent, total_revenue, roi, average_lead_score
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND DATE(created_at) >= DATE_TRUNC('month', CURRENT_DATE)),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND status = 'qualified'),
    (SELECT COUNT(*) FROM marketing_leads WHERE user_id = p_user_id AND score = 'hot'),
    (SELECT get_marketing_stats(p_user_id)->>'conversionRate')::DECIMAL,
    (SELECT COUNT(*) FROM marketing_campaigns WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM marketing_campaigns WHERE user_id = p_user_id AND status = 'active'),
    COALESCE((SELECT SUM(budget) FROM marketing_campaigns WHERE user_id = p_user_id), 0),
    COALESCE((SELECT SUM(spent) FROM marketing_campaigns WHERE user_id = p_user_id), 0),
    COALESCE((SELECT SUM(revenue) FROM campaign_metrics cm JOIN marketing_campaigns mc ON mc.id = cm.campaign_id WHERE mc.user_id = p_user_id), 0),
    0,
    COALESCE((SELECT AVG(score_value) FROM marketing_leads WHERE user_id = p_user_id), 0)
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_leads = EXCLUDED.total_leads,
    new_leads = EXCLUDED.new_leads,
    qualified_leads = EXCLUDED.qualified_leads,
    hot_leads = EXCLUDED.hot_leads,
    conversion_rate = EXCLUDED.conversion_rate,
    total_campaigns = EXCLUDED.total_campaigns,
    active_campaigns = EXCLUDED.active_campaigns,
    total_budget = EXCLUDED.total_budget,
    total_spent = EXCLUDED.total_spent,
    total_revenue = EXCLUDED.total_revenue,
    average_lead_score = EXCLUDED.average_lead_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY marketing_leads_policy ON marketing_leads
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY marketing_campaigns_policy ON marketing_campaigns
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY campaign_goals_policy ON campaign_goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM marketing_campaigns WHERE id = campaign_id AND user_id = auth.uid())
  );

CREATE POLICY campaign_metrics_policy ON campaign_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM marketing_campaigns WHERE id = campaign_id AND user_id = auth.uid())
  );

CREATE POLICY email_campaigns_policy ON email_campaigns
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY marketing_stats_policy ON marketing_stats
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- END OF ADMIN MARKETING SYSTEM SCHEMA
-- =====================================================
-- =====================================================
-- ADMIN OVERVIEW SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Migration: 20251126_admin_overview_system
-- Description: Comprehensive database for Business Admin Intelligence
-- Modules: Analytics, CRM, Invoicing, Marketing, Operations, Automation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ANALYTICS MODULE
-- =====================================================

-- Analytics events tracking
CREATE TABLE IF NOT EXISTS admin_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'conversion', 'purchase', 'signup', 'custom')),
  event_name TEXT NOT NULL,
  event_value DECIMAL(10, 2) DEFAULT 0,
  properties JSONB DEFAULT '{}',
  source TEXT,
  medium TEXT,
  campaign TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics reports
CREATE TABLE IF NOT EXISTS admin_analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('revenue', 'traffic', 'conversion', 'custom')),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  format TEXT CHECK (format IN ('csv', 'pdf', 'json')),
  data JSONB DEFAULT '{}',
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Analytics goals
CREATE TABLE IF NOT EXISTS admin_analytics_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('revenue', 'conversions', 'traffic', 'custom')),
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CRM MODULE
-- =====================================================

-- CRM deals
CREATE TABLE IF NOT EXISTS admin_crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_id UUID,
  deal_value DECIMAL(10, 2) NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('hot', 'warm', 'cold')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lost_reason TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM contacts
CREATE TABLE IF NOT EXISTS admin_crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  lead_source TEXT,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified', 'customer', 'churned')),
  lifecycle_stage TEXT CHECK (lifecycle_stage IN ('subscriber', 'lead', 'marketing_qualified', 'sales_qualified', 'opportunity', 'customer', 'evangelist')),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- CRM activities
CREATE TABLE IF NOT EXISTS admin_crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES admin_crm_deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES admin_crm_contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'task')),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICING MODULE
-- =====================================================

-- Admin invoices (separate from client invoices)
CREATE TABLE IF NOT EXISTS admin_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  sent_date DATE,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice reminders
CREATE TABLE IF NOT EXISTS admin_invoice_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES admin_invoices(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('before_due', 'on_due', 'after_due')),
  days_offset INTEGER NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE IF NOT EXISTS admin_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES admin_invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETING MODULE
-- =====================================================

-- Marketing leads
CREATE TABLE IF NOT EXISTS admin_marketing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  lead_source TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  qualification_notes TEXT,
  campaign_id UUID,
  form_submission JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS admin_email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('newsletter', 'promotional', 'transactional', 'drip', 'ab_test')),
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  html_content TEXT,
  plain_text_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  segment_criteria JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign subscribers
CREATE TABLE IF NOT EXISTS admin_campaign_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES admin_email_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  subscriber_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'converted', 'bounced', 'unsubscribed')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- OPERATIONS MODULE
-- =====================================================

-- Team members (extends auth.users)
CREATE TABLE IF NOT EXISTS admin_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'designer', 'developer', 'marketer', 'sales', 'support', 'viewer')),
  department TEXT,
  job_title TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'on_leave')),
  hire_date DATE,
  last_active_at TIMESTAMPTZ,
  productivity_score INTEGER DEFAULT 0 CHECK (productivity_score >= 0 AND productivity_score <= 100),
  tasks_completed INTEGER DEFAULT 0,
  projects_assigned INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL UNIQUE CHECK (role IN ('super_admin', 'admin', 'manager', 'designer', 'developer', 'marketer', 'sales', 'support', 'viewer')),
  permissions JSONB NOT NULL DEFAULT '{
    "analytics": {"view": false, "edit": false, "delete": false},
    "crm": {"view": false, "edit": false, "delete": false},
    "invoicing": {"view": false, "edit": false, "delete": false},
    "marketing": {"view": false, "edit": false, "delete": false},
    "operations": {"view": false, "edit": false, "delete": false},
    "automation": {"view": false, "edit": false, "delete": false}
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES admin_team_members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUTOMATION MODULE
-- =====================================================

-- Workflows
CREATE TABLE IF NOT EXISTS admin_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event', 'form_submission', 'deal_stage', 'email_action')),
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS admin_workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES admin_workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  trigger_data JSONB DEFAULT '{}',
  execution_log JSONB DEFAULT '[]',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Integrations
CREATE TABLE IF NOT EXISTS admin_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('slack', 'stripe', 'zapier', 'hubspot', 'mailchimp', 'google_analytics', 'facebook_ads', 'linkedin', 'twitter', 'github', 'jira', 'trello', 'asana', 'notion', 'airtable', 'webhook', 'custom')),
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  auth_type TEXT CHECK (auth_type IN ('oauth', 'api_key', 'webhook', 'basic')),
  credentials JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS admin_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT,
  event_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}',
  delivery_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON admin_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON admin_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON admin_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_reports_user ON admin_analytics_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_goals_user ON admin_analytics_goals(user_id);

-- CRM indexes
CREATE INDEX IF NOT EXISTS idx_crm_deals_user ON admin_crm_deals(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON admin_crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_priority ON admin_crm_deals(priority);
CREATE INDEX IF NOT EXISTS idx_crm_deals_contact ON admin_crm_deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user ON admin_crm_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON admin_crm_contacts(email);
CREATE INDEX IF NOT EXISTS idx_crm_activities_deal ON admin_crm_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_contact ON admin_crm_activities(contact_id);

-- Invoicing indexes
CREATE INDEX IF NOT EXISTS idx_admin_invoices_user ON admin_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_invoices_status ON admin_invoices(status);
CREATE INDEX IF NOT EXISTS idx_admin_invoices_due_date ON admin_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_admin_invoices_number ON admin_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_admin_payments_invoice ON admin_payments(invoice_id);

-- Marketing indexes
CREATE INDEX IF NOT EXISTS idx_marketing_leads_user ON admin_marketing_leads(user_id);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_status ON admin_marketing_leads(status);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_score ON admin_marketing_leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_marketing_leads_email ON admin_marketing_leads(email);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user ON admin_email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON admin_email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_subscribers_campaign ON admin_campaign_subscribers(campaign_id);

-- Operations indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user ON admin_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON admin_team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON admin_team_members(status);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON admin_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_resource ON admin_activity_log(resource_type, resource_id);

-- Automation indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user ON admin_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_active ON admin_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON admin_workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_integrations_user ON admin_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON admin_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON admin_webhooks(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invoice_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_campaign_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_webhooks ENABLE ROW LEVEL SECURITY;

-- Analytics RLS
CREATE POLICY "Users can view own analytics events" ON admin_analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics events" ON admin_analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics reports" ON admin_analytics_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics reports" ON admin_analytics_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics goals" ON admin_analytics_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics goals" ON admin_analytics_goals FOR ALL USING (auth.uid() = user_id);

-- CRM RLS
CREATE POLICY "Users can view own deals" ON admin_crm_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deals" ON admin_crm_deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own contacts" ON admin_crm_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contacts" ON admin_crm_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activities" ON admin_crm_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activities" ON admin_crm_activities FOR ALL USING (auth.uid() = user_id);

-- Invoicing RLS
CREATE POLICY "Users can view own invoices" ON admin_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own invoices" ON admin_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Invoice reminders follow invoice access" ON admin_invoice_reminders FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own payments" ON admin_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payments" ON admin_payments FOR ALL USING (auth.uid() = user_id);

-- Marketing RLS
CREATE POLICY "Users can view own leads" ON admin_marketing_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own leads" ON admin_marketing_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own campaigns" ON admin_email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own campaigns" ON admin_email_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Campaign subscribers follow campaign access" ON admin_campaign_subscribers FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_email_campaigns WHERE id = campaign_id AND user_id = auth.uid())
);

-- Operations RLS
CREATE POLICY "Users can view all team members" ON admin_team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON admin_team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_team_members WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
);
CREATE POLICY "Anyone can view role permissions" ON admin_role_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage role permissions" ON admin_role_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_team_members WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can view activity log" ON admin_activity_log FOR SELECT USING (true);
CREATE POLICY "System can insert activity log" ON admin_activity_log FOR INSERT WITH CHECK (true);

-- Automation RLS
CREATE POLICY "Users can view own workflows" ON admin_workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workflows" ON admin_workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Workflow executions follow workflow access" ON admin_workflow_executions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_workflows WHERE id = workflow_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own integrations" ON admin_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own integrations" ON admin_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own webhooks" ON admin_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own webhooks" ON admin_webhooks FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_goals_updated_at BEFORE UPDATE ON admin_analytics_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON admin_crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON admin_crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_invoices_updated_at BEFORE UPDATE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_leads_updated_at BEFORE UPDATE ON admin_marketing_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON admin_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON admin_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON admin_webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update invoice status based on dates
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_date IS NOT NULL AND NEW.status != 'void' THEN
    NEW.status := 'paid';
  ELSIF NEW.status IN ('sent', 'overdue') AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_invoice_status BEFORE UPDATE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- Auto-calculate campaign rates
CREATE OR REPLACE FUNCTION update_campaign_rates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recipient_count > 0 THEN
    NEW.open_rate := (NEW.opens::DECIMAL / NEW.recipient_count) * 100;
    NEW.click_rate := (NEW.clicks::DECIMAL / NEW.recipient_count) * 100;
    NEW.conversion_rate := (NEW.conversions::DECIMAL / NEW.recipient_count) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_campaign_rates BEFORE UPDATE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION update_campaign_rates();

-- Auto-calculate workflow success rate
CREATE OR REPLACE FUNCTION update_workflow_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.execution_count > 0 THEN
    NEW.success_rate := (NEW.success_count::DECIMAL / NEW.execution_count) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_workflow_success_rate BEFORE UPDATE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION update_workflow_success_rate();

-- Log activity on important actions
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_activity_log (user_id, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'new_data', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to key tables
CREATE TRIGGER log_deal_activity AFTER INSERT OR UPDATE OR DELETE ON admin_crm_deals FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_invoice_activity AFTER INSERT OR UPDATE OR DELETE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_campaign_activity AFTER INSERT OR UPDATE OR DELETE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_workflow_activity AFTER INSERT OR UPDATE OR DELETE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get total revenue
CREATE OR REPLACE FUNCTION get_total_revenue(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(total_amount) FROM admin_invoices WHERE user_id = p_user_id AND status = 'paid'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get total outstanding invoices
CREATE OR REPLACE FUNCTION get_outstanding_invoices(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(total_amount) FROM admin_invoices WHERE user_id = p_user_id AND status IN ('sent', 'overdue')),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pipeline value
CREATE OR REPLACE FUNCTION get_pipeline_value(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(deal_value) FROM admin_crm_deals WHERE user_id = p_user_id AND stage NOT IN ('won', 'lost')),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DEFAULT ROLE PERMISSIONS
-- =====================================================

INSERT INTO admin_role_permissions (role, permissions) VALUES
('super_admin', '{
  "analytics": {"view": true, "edit": true, "delete": true, "export": true},
  "crm": {"view": true, "edit": true, "delete": true, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": true, "export": true},
  "marketing": {"view": true, "edit": true, "delete": true, "export": true},
  "operations": {"view": true, "edit": true, "delete": true, "export": true},
  "automation": {"view": true, "edit": true, "delete": true, "export": true}
}'::JSONB),
('admin', '{
  "analytics": {"view": true, "edit": true, "delete": false, "export": true},
  "crm": {"view": true, "edit": true, "delete": false, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": false, "export": true},
  "marketing": {"view": true, "edit": true, "delete": false, "export": true},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": true, "delete": false, "export": true}
}'::JSONB),
('manager', '{
  "analytics": {"view": true, "edit": false, "delete": false, "export": true},
  "crm": {"view": true, "edit": true, "delete": false, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": false, "export": false},
  "marketing": {"view": true, "edit": true, "delete": false, "export": false},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": false, "delete": false, "export": false}
}'::JSONB),
('viewer', '{
  "analytics": {"view": true, "edit": false, "delete": false, "export": false},
  "crm": {"view": true, "edit": false, "delete": false, "export": false},
  "invoicing": {"view": true, "edit": false, "delete": false, "export": false},
  "marketing": {"view": true, "edit": false, "delete": false, "export": false},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": false, "delete": false, "export": false}
}'::JSONB)
ON CONFLICT (role) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 19
-- Indexes created: 45+
-- RLS policies: 30+
-- Triggers: 15+
-- Helper functions: 3
-- =====================================================
