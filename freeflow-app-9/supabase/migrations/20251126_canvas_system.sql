-- ============================================================================
-- CANVAS COLLABORATION SYSTEM - SUPABASE MIGRATION
-- Complete design and prototyping workspace
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE canvas_status AS ENUM (
  'in-progress',
  'completed',
  'archived',
  'shared'
);

CREATE TYPE canvas_template AS ENUM (
  'blank',
  'ui-design',
  'wireframe',
  'illustration',
  'presentation',
  'infographic',
  'social-media',
  'logo-design'
);

CREATE TYPE export_format AS ENUM (
  'png',
  'svg',
  'pdf',
  'figma',
  'sketch',
  'jpg',
  'webp'
);

CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer',
  'commenter'
);

CREATE TYPE layer_type AS ENUM (
  'shape',
  'text',
  'image',
  'group',
  'frame',
  'vector'
);

CREATE TYPE blend_mode AS ENUM (
  'normal',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten'
);

-- ============================================================================
-- TABLE: canvas_projects
-- ============================================================================

CREATE TABLE canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  template canvas_template NOT NULL DEFAULT 'blank',
  status canvas_status NOT NULL DEFAULT 'in-progress',
  total_layers INTEGER DEFAULT 0,
  size_mb DECIMAL(10, 2) DEFAULT 0,
  version INTEGER DEFAULT 1,
  is_starred BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  last_modified_by TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_artboards
-- ============================================================================

CREATE TABLE canvas_artboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  x INTEGER DEFAULT 0,
  y INTEGER DEFAULT 0,
  is_prototype BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_layers
-- ============================================================================

CREATE TABLE canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artboard_id UUID NOT NULL REFERENCES canvas_artboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type layer_type NOT NULL DEFAULT 'shape',
  visible BOOLEAN DEFAULT true,
  locked BOOLEAN DEFAULT false,
  opacity DECIMAL(5, 2) DEFAULT 100 CHECK (opacity >= 0 AND opacity <= 100),
  blend_mode blend_mode DEFAULT 'normal',
  z_index INTEGER DEFAULT 0,
  x DECIMAL(10, 2) DEFAULT 0,
  y DECIMAL(10, 2) DEFAULT 0,
  width DECIMAL(10, 2) DEFAULT 100,
  height DECIMAL(10, 2) DEFAULT 100,
  rotation DECIMAL(10, 2) DEFAULT 0,
  properties JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_collaborators
-- ============================================================================

CREATE TABLE canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  color TEXT NOT NULL DEFAULT '#3B82F6',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(canvas_id, user_id)
);

-- ============================================================================
-- TABLE: canvas_versions
-- ============================================================================

CREATE TABLE canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT NOT NULL,
  size_mb DECIMAL(10, 2) NOT NULL,
  snapshot JSONB NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(canvas_id, version)
);

-- ============================================================================
-- TABLE: canvas_comments
-- ============================================================================

CREATE TABLE canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  artboard_id UUID REFERENCES canvas_artboards(id) ON DELETE CASCADE,
  layer_id UUID REFERENCES canvas_layers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  x DECIMAL(10, 2),
  y DECIMAL(10, 2),
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_comment_replies
-- ============================================================================

CREATE TABLE canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: canvas_exports
-- ============================================================================

CREATE TABLE canvas_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  quality TEXT NOT NULL DEFAULT 'high',
  file_url TEXT,
  file_size BIGINT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: canvas_activity_log
-- ============================================================================

CREATE TABLE canvas_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- canvas_projects indexes
CREATE INDEX idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX idx_canvas_projects_status ON canvas_projects(status);
CREATE INDEX idx_canvas_projects_template ON canvas_projects(template);
CREATE INDEX idx_canvas_projects_is_starred ON canvas_projects(is_starred);
CREATE INDEX idx_canvas_projects_is_shared ON canvas_projects(is_shared);
CREATE INDEX idx_canvas_projects_is_public ON canvas_projects(is_public);
CREATE INDEX idx_canvas_projects_tags ON canvas_projects USING gin(tags);
CREATE INDEX idx_canvas_projects_created_at ON canvas_projects(created_at DESC);
CREATE INDEX idx_canvas_projects_updated_at ON canvas_projects(updated_at DESC);
CREATE INDEX idx_canvas_projects_name_trgm ON canvas_projects USING gin(name gin_trgm_ops);
CREATE INDEX idx_canvas_projects_user_status ON canvas_projects(user_id, status);
CREATE INDEX idx_canvas_projects_user_template ON canvas_projects(user_id, template);

-- canvas_artboards indexes
CREATE INDEX idx_canvas_artboards_canvas_id ON canvas_artboards(canvas_id);
CREATE INDEX idx_canvas_artboards_order_index ON canvas_artboards(order_index);
CREATE INDEX idx_canvas_artboards_canvas_order ON canvas_artboards(canvas_id, order_index);

-- canvas_layers indexes
CREATE INDEX idx_canvas_layers_artboard_id ON canvas_layers(artboard_id);
CREATE INDEX idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX idx_canvas_layers_z_index ON canvas_layers(z_index DESC);
CREATE INDEX idx_canvas_layers_visible ON canvas_layers(visible);
CREATE INDEX idx_canvas_layers_locked ON canvas_layers(locked);
CREATE INDEX idx_canvas_layers_artboard_z_index ON canvas_layers(artboard_id, z_index);

-- canvas_collaborators indexes
CREATE INDEX idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX idx_canvas_collaborators_role ON canvas_collaborators(role);
CREATE INDEX idx_canvas_collaborators_is_online ON canvas_collaborators(is_online);
CREATE INDEX idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);

-- canvas_versions indexes
CREATE INDEX idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX idx_canvas_versions_version ON canvas_versions(version DESC);
CREATE INDEX idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- canvas_comments indexes
CREATE INDEX idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX idx_canvas_comments_artboard_id ON canvas_comments(artboard_id);
CREATE INDEX idx_canvas_comments_layer_id ON canvas_comments(layer_id);
CREATE INDEX idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- canvas_comment_replies indexes
CREATE INDEX idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);
CREATE INDEX idx_canvas_comment_replies_created_at ON canvas_comment_replies(created_at DESC);

-- canvas_exports indexes
CREATE INDEX idx_canvas_exports_canvas_id ON canvas_exports(canvas_id);
CREATE INDEX idx_canvas_exports_user_id ON canvas_exports(user_id);
CREATE INDEX idx_canvas_exports_format ON canvas_exports(format);
CREATE INDEX idx_canvas_exports_status ON canvas_exports(status);
CREATE INDEX idx_canvas_exports_created_at ON canvas_exports(created_at DESC);

-- canvas_activity_log indexes
CREATE INDEX idx_canvas_activity_log_canvas_id ON canvas_activity_log(canvas_id);
CREATE INDEX idx_canvas_activity_log_user_id ON canvas_activity_log(user_id);
CREATE INDEX idx_canvas_activity_log_action ON canvas_activity_log(action);
CREATE INDEX idx_canvas_activity_log_created_at ON canvas_activity_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_artboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_activity_log ENABLE ROW LEVEL SECURITY;

-- canvas_projects policies
CREATE POLICY "Users can view their own canvases"
  ON canvas_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view canvases they collaborate on"
  ON canvas_projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_collaborators
    WHERE canvas_collaborators.canvas_id = canvas_projects.id
    AND canvas_collaborators.user_id = auth.uid()
  ));

CREATE POLICY "Users can view public canvases"
  ON canvas_projects FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can create their own canvases"
  ON canvas_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own canvases"
  ON canvas_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Editors can update canvases they collaborate on"
  ON canvas_projects FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM canvas_collaborators
    WHERE canvas_collaborators.canvas_id = canvas_projects.id
    AND canvas_collaborators.user_id = auth.uid()
    AND canvas_collaborators.role IN ('owner', 'editor')
  ));

CREATE POLICY "Users can delete their own canvases"
  ON canvas_projects FOR DELETE
  USING (auth.uid() = user_id);

-- canvas_artboards policies
CREATE POLICY "Users can view artboards of accessible canvases"
  ON canvas_artboards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_artboards.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR canvas_projects.is_public = true
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can modify artboards of owned canvases"
  ON canvas_artboards FOR ALL
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_artboards.canvas_id
    AND canvas_projects.user_id = auth.uid()
  ));

-- canvas_layers policies
CREATE POLICY "Users can view layers of accessible artboards"
  ON canvas_layers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_artboards
    JOIN canvas_projects ON canvas_projects.id = canvas_artboards.canvas_id
    WHERE canvas_artboards.id = canvas_layers.artboard_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR canvas_projects.is_public = true
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

-- canvas_collaborators policies
CREATE POLICY "Users can view collaborators of accessible canvases"
  ON canvas_collaborators FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_collaborators.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators c2
        WHERE c2.canvas_id = canvas_projects.id
        AND c2.user_id = auth.uid()
      )
    )
  ));

-- canvas_versions policies
CREATE POLICY "Users can view versions of accessible canvases"
  ON canvas_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_versions.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

-- canvas_comments policies
CREATE POLICY "Users can view comments on accessible canvases"
  ON canvas_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_comments.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create comments on accessible canvases"
  ON canvas_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON canvas_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON canvas_comments FOR DELETE
  USING (auth.uid() = user_id);

-- canvas_exports policies
CREATE POLICY "Users can view their own exports"
  ON canvas_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create exports"
  ON canvas_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- canvas_activity_log policies
CREATE POLICY "Users can view activity for accessible canvases"
  ON canvas_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM canvas_projects
    WHERE canvas_projects.id = canvas_activity_log.canvas_id
    AND (
      canvas_projects.user_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM canvas_collaborators
        WHERE canvas_collaborators.canvas_id = canvas_projects.id
        AND canvas_collaborators.user_id = auth.uid()
      )
    )
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

CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_artboards_updated_at
  BEFORE UPDATE ON canvas_artboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at
  BEFORE UPDATE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at
  BEFORE UPDATE ON canvas_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update total_layers count when layers change
CREATE OR REPLACE FUNCTION update_canvas_layer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_projects
  SET total_layers = (
    SELECT COUNT(*)
    FROM canvas_layers l
    JOIN canvas_artboards a ON a.id = l.artboard_id
    WHERE a.canvas_id = (
      SELECT canvas_id FROM canvas_artboards WHERE id = COALESCE(NEW.artboard_id, OLD.artboard_id)
    )
  )
  WHERE id = (
    SELECT canvas_id FROM canvas_artboards WHERE id = COALESCE(NEW.artboard_id, OLD.artboard_id)
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_canvas_layer_count
  AFTER INSERT OR UPDATE OR DELETE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_layer_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's canvases with stats
CREATE OR REPLACE FUNCTION get_user_canvases_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  status canvas_status,
  template canvas_template,
  artboard_count BIGINT,
  layer_count INTEGER,
  collaborator_count BIGINT,
  size_mb DECIMAL,
  is_starred BOOLEAN,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.status,
    cp.template,
    COUNT(DISTINCT ca.id) as artboard_count,
    cp.total_layers as layer_count,
    COUNT(DISTINCT cc.id) as collaborator_count,
    cp.size_mb,
    cp.is_starred,
    cp.updated_at
  FROM canvas_projects cp
  LEFT JOIN canvas_artboards ca ON ca.canvas_id = cp.id
  LEFT JOIN canvas_collaborators cc ON cc.canvas_id = cp.id
  WHERE cp.user_id = p_user_id
  GROUP BY cp.id
  ORDER BY cp.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get canvas with full details
CREATE OR REPLACE FUNCTION get_canvas_details(p_canvas_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'canvas', row_to_json(cp),
      'artboards', (
        SELECT json_agg(json_build_object(
          'artboard', row_to_json(ca),
          'layers', (
            SELECT json_agg(row_to_json(cl))
            FROM canvas_layers cl
            WHERE cl.artboard_id = ca.id
            ORDER BY cl.z_index DESC
          )
        ))
        FROM canvas_artboards ca
        WHERE ca.canvas_id = cp.id
        ORDER BY ca.order_index
      ),
      'collaborators', (
        SELECT json_agg(row_to_json(cc))
        FROM canvas_collaborators cc
        WHERE cc.canvas_id = cp.id
      )
    )
    FROM canvas_projects cp
    WHERE cp.id = p_canvas_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search canvases
CREATE OR REPLACE FUNCTION search_canvases(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  thumbnail TEXT,
  status canvas_status,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.description,
    cp.thumbnail,
    cp.status,
    cp.updated_at
  FROM canvas_projects cp
  WHERE cp.user_id = p_user_id
    AND (
      cp.name ILIKE '%' || p_search_term || '%'
      OR cp.description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(cp.tags)
    )
  ORDER BY cp.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate storage used by user
CREATE OR REPLACE FUNCTION calculate_user_canvas_storage(p_user_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_storage DECIMAL;
BEGIN
  SELECT COALESCE(SUM(size_mb), 0)
  INTO total_storage
  FROM canvas_projects
  WHERE user_id = p_user_id;

  RETURN total_storage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get canvas activity log
CREATE OR REPLACE FUNCTION get_canvas_activity(
  p_canvas_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  action TEXT,
  user_name TEXT,
  details JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cal.action,
    u.email as user_name,
    cal.details,
    cal.created_at
  FROM canvas_activity_log cal
  JOIN auth.users u ON u.id = cal.user_id
  WHERE cal.canvas_id = p_canvas_id
  ORDER BY cal.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent collaborators
CREATE OR REPLACE FUNCTION get_recent_collaborators(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  avatar TEXT,
  last_seen TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    cc.user_id,
    cc.name,
    cc.email,
    cc.avatar,
    cc.last_seen
  FROM canvas_collaborators cc
  JOIN canvas_projects cp ON cp.id = cc.canvas_id
  WHERE cp.user_id = p_user_id
  ORDER BY cc.last_seen DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
