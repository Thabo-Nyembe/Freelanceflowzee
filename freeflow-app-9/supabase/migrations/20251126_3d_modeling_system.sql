-- ============================================================================
-- 3D Modeling System - Production Database Schema
-- ============================================================================
-- Comprehensive 3D modeling studio with scene management, objects, materials,
-- lighting, camera controls, and rendering capabilities
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE object_type AS ENUM ('cube', 'sphere', 'cylinder', 'cone', 'plane', 'torus', 'pyramid', 'prism');
CREATE TYPE material_type AS ENUM ('standard', 'metallic', 'glass', 'plastic', 'fabric', 'wood', 'stone', 'emission');
CREATE TYPE light_type AS ENUM ('directional', 'point', 'spot', 'ambient', 'area');
CREATE TYPE tool_type AS ENUM ('select', 'move', 'rotate', 'scale', 'extrude', 'subdivide');
CREATE TYPE view_mode AS ENUM ('solid', 'wireframe', 'textured', 'rendered');
CREATE TYPE render_quality AS ENUM ('low', 'medium', 'high', 'ultra');
CREATE TYPE projection_type AS ENUM ('perspective', 'orthographic');
CREATE TYPE export_format AS ENUM ('obj', 'fbx', 'gltf', 'stl', 'dae', 'blend');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Projects
CREATE TABLE modeling_projects (
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
CREATE TABLE modeling_scenes (
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
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  locked BOOLEAN NOT NULL DEFAULT FALSE,
  parent_id UUID REFERENCES scene_objects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Materials
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lights
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
  cast_shadow BOOLEAN NOT NULL DEFAULT TRUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cameras
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
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Render Jobs
CREATE TABLE render_jobs (
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
CREATE TABLE export_jobs (
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
CREATE INDEX idx_modeling_projects_user_id ON modeling_projects(user_id);
CREATE INDEX idx_modeling_projects_is_public ON modeling_projects(is_public);
CREATE INDEX idx_modeling_projects_tags ON modeling_projects USING GIN(tags);
CREATE INDEX idx_modeling_projects_created_at ON modeling_projects(created_at DESC);

-- Scenes indexes
CREATE INDEX idx_modeling_scenes_project_id ON modeling_scenes(project_id);
CREATE INDEX idx_modeling_scenes_user_id ON modeling_scenes(user_id);

-- Scene Objects indexes
CREATE INDEX idx_scene_objects_scene_id ON scene_objects(scene_id);
CREATE INDEX idx_scene_objects_type ON scene_objects(type);
CREATE INDEX idx_scene_objects_material_id ON scene_objects(material_id);
CREATE INDEX idx_scene_objects_parent_id ON scene_objects(parent_id);
CREATE INDEX idx_scene_objects_visible ON scene_objects(visible);
CREATE INDEX idx_scene_objects_locked ON scene_objects(locked);

-- Materials indexes
CREATE INDEX idx_materials_scene_id ON materials(scene_id);
CREATE INDEX idx_materials_type ON materials(type);

-- Lights indexes
CREATE INDEX idx_lights_scene_id ON lights(scene_id);
CREATE INDEX idx_lights_type ON lights(type);
CREATE INDEX idx_lights_enabled ON lights(enabled);

-- Cameras indexes
CREATE INDEX idx_cameras_scene_id ON cameras(scene_id);
CREATE INDEX idx_cameras_is_active ON cameras(is_active);

-- Render Jobs indexes
CREATE INDEX idx_render_jobs_scene_id ON render_jobs(scene_id);
CREATE INDEX idx_render_jobs_user_id ON render_jobs(user_id);
CREATE INDEX idx_render_jobs_status ON render_jobs(status);
CREATE INDEX idx_render_jobs_created_at ON render_jobs(created_at DESC);

-- Export Jobs indexes
CREATE INDEX idx_export_jobs_scene_id ON export_jobs(scene_id);
CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);
CREATE INDEX idx_export_jobs_status ON export_jobs(status);

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
  position JSON,
  rotation JSON,
  scale JSON,
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
  position JSON
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
