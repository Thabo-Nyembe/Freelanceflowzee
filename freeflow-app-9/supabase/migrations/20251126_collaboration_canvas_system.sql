-- =====================================================
-- COLLABORATION CANVAS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive collaborative whiteboard with drawing tools,
-- shapes, layers, real-time collaboration, and version control
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE tool_type AS ENUM (
  'select',
  'pen',
  'eraser',
  'shape',
  'text',
  'move',
  'image'
);

CREATE TYPE shape_type AS ENUM (
  'rectangle',
  'circle',
  'triangle',
  'line',
  'arrow',
  'star',
  'polygon'
);

CREATE TYPE layer_type AS ENUM (
  'drawing',
  'shape',
  'text',
  'image',
  'group'
);

CREATE TYPE canvas_template AS ENUM (
  'blank',
  'grid',
  'wireframe',
  'flowchart',
  'mindmap',
  'diagram'
);

CREATE TYPE collaborator_role AS ENUM (
  'owner',
  'editor',
  'viewer'
);

CREATE TYPE export_format AS ENUM (
  'png',
  'jpg',
  'svg',
  'pdf'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Canvas Projects
CREATE TABLE canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template canvas_template NOT NULL DEFAULT 'blank',
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  background_color TEXT NOT NULL DEFAULT '#ffffff',
  created_by TEXT NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  share_link TEXT UNIQUE,
  thumbnail TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  fork_count INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Collaborators
CREATE TABLE canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT,
  role collaborator_role NOT NULL DEFAULT 'viewer',
  color TEXT NOT NULL,
  cursor_x DECIMAL(10, 2),
  cursor_y DECIMAL(10, 2),
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(canvas_id, user_id)
);

-- Canvas Layers
CREATE TABLE canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  type layer_type NOT NULL,
  name TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  x DECIMAL(10, 2) NOT NULL DEFAULT 0,
  y DECIMAL(10, 2) NOT NULL DEFAULT 0,
  width DECIMAL(10, 2) NOT NULL DEFAULT 100,
  height DECIMAL(10, 2) NOT NULL DEFAULT 100,
  rotation DECIMAL(5, 2) NOT NULL DEFAULT 0,
  scale_x DECIMAL(5, 2) NOT NULL DEFAULT 1,
  scale_y DECIMAL(5, 2) NOT NULL DEFAULT 1,
  opacity DECIMAL(5, 2) NOT NULL DEFAULT 100,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  z_index INTEGER NOT NULL DEFAULT 0,
  group_id UUID REFERENCES canvas_layers(id) ON DELETE SET NULL,
  style JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Versions
CREATE TABLE canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT,
  description TEXT,
  snapshot TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comments
CREATE TABLE canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  x DECIMAL(10, 2) NOT NULL,
  y DECIMAL(10, 2) NOT NULL,
  text TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comment Replies
CREATE TABLE canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  text TEXT NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Stats (aggregated statistics)
CREATE TABLE canvas_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_projects INTEGER NOT NULL DEFAULT 0,
  shared_projects INTEGER NOT NULL DEFAULT 0,
  active_collaborators INTEGER NOT NULL DEFAULT 0,
  total_layers INTEGER NOT NULL DEFAULT 0,
  total_drawings INTEGER NOT NULL DEFAULT 0,
  total_versions INTEGER NOT NULL DEFAULT 0,
  total_comments INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0,
  template_breakdown JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Canvas Projects Indexes
CREATE INDEX idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX idx_canvas_projects_template ON canvas_projects(template);
CREATE INDEX idx_canvas_projects_is_shared ON canvas_projects(is_shared);
CREATE INDEX idx_canvas_projects_share_link ON canvas_projects(share_link) WHERE share_link IS NOT NULL;
CREATE INDEX idx_canvas_projects_version ON canvas_projects(version);
CREATE INDEX idx_canvas_projects_view_count ON canvas_projects(view_count DESC);
CREATE INDEX idx_canvas_projects_fork_count ON canvas_projects(fork_count DESC);
CREATE INDEX idx_canvas_projects_tags ON canvas_projects USING GIN(tags);
CREATE INDEX idx_canvas_projects_name_search ON canvas_projects USING GIN(to_tsvector('english', name));
CREATE INDEX idx_canvas_projects_description_search ON canvas_projects USING GIN(to_tsvector('english', description));
CREATE INDEX idx_canvas_projects_created_at ON canvas_projects(created_at DESC);
CREATE INDEX idx_canvas_projects_updated_at ON canvas_projects(updated_at DESC);

-- Canvas Collaborators Indexes
CREATE INDEX idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX idx_canvas_collaborators_role ON canvas_collaborators(role);
CREATE INDEX idx_canvas_collaborators_is_active ON canvas_collaborators(is_active);
CREATE INDEX idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);
CREATE INDEX idx_canvas_collaborators_created_at ON canvas_collaborators(created_at DESC);

-- Canvas Layers Indexes
CREATE INDEX idx_canvas_layers_canvas_id ON canvas_layers(canvas_id);
CREATE INDEX idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX idx_canvas_layers_group_id ON canvas_layers(group_id);
CREATE INDEX idx_canvas_layers_z_index ON canvas_layers(z_index);
CREATE INDEX idx_canvas_layers_is_visible ON canvas_layers(is_visible);
CREATE INDEX idx_canvas_layers_is_locked ON canvas_layers(is_locked);
CREATE INDEX idx_canvas_layers_data ON canvas_layers USING GIN(data);
CREATE INDEX idx_canvas_layers_style ON canvas_layers USING GIN(style);
CREATE INDEX idx_canvas_layers_created_at ON canvas_layers(created_at DESC);

-- Canvas Versions Indexes
CREATE INDEX idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX idx_canvas_versions_version ON canvas_versions(version);
CREATE INDEX idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- Canvas Comments Indexes
CREATE INDEX idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- Canvas Comment Replies Indexes
CREATE INDEX idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);
CREATE INDEX idx_canvas_comment_replies_created_at ON canvas_comment_replies(created_at DESC);

-- Canvas Stats Indexes
CREATE INDEX idx_canvas_stats_user_id ON canvas_stats(user_id);
CREATE INDEX idx_canvas_stats_date ON canvas_stats(date DESC);
CREATE INDEX idx_canvas_stats_total_projects ON canvas_stats(total_projects DESC);
CREATE INDEX idx_canvas_stats_storage_used ON canvas_stats(storage_used DESC);
CREATE INDEX idx_canvas_stats_created_at ON canvas_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_collaborators_updated_at
  BEFORE UPDATE ON canvas_collaborators
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

CREATE TRIGGER update_canvas_stats_updated_at
  BEFORE UPDATE ON canvas_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Increment version on project update
CREATE OR REPLACE FUNCTION increment_canvas_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_canvas_version
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  WHEN (OLD.updated_at < NEW.updated_at)
  EXECUTE FUNCTION increment_canvas_version();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get canvas statistics
CREATE OR REPLACE FUNCTION get_canvas_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalProjects', COUNT(*),
    'sharedProjects', COUNT(*) FILTER (WHERE is_shared = true),
    'totalLayers', (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    'totalDrawings', (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id AND cl.type = 'drawing'
    ),
    'totalVersions', SUM(version),
    'byTemplate', (
      SELECT json_object_agg(template, cnt)
      FROM (
        SELECT template, COUNT(*) as cnt
        FROM canvas_projects
        WHERE user_id = p_user_id
        GROUP BY template
      ) template_counts
    )
  ) INTO v_stats
  FROM canvas_projects
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search canvas projects
CREATE OR REPLACE FUNCTION search_canvas_projects(
  p_user_id UUID,
  p_search_term TEXT,
  p_template canvas_template DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  template canvas_template,
  modified_at TIMESTAMPTZ,
  view_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.template,
    cp.updated_at as modified_at,
    cp.view_count,
    ts_rank(
      to_tsvector('english', cp.name || ' ' || COALESCE(cp.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM canvas_projects cp
  WHERE cp.user_id = p_user_id
    AND (p_template IS NULL OR cp.template = p_template)
    AND (
      p_search_term = '' OR
      to_tsvector('english', cp.name || ' ' || COALESCE(cp.description, '')) @@ plainto_tsquery('english', p_search_term) OR
      p_search_term = ANY(cp.tags)
    )
  ORDER BY relevance DESC, cp.updated_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Add collaborator
CREATE OR REPLACE FUNCTION add_collaborator(
  p_canvas_id UUID,
  p_user_id UUID,
  p_name TEXT,
  p_email TEXT,
  p_role collaborator_role,
  p_color TEXT
)
RETURNS UUID AS $$
DECLARE
  v_collaborator_id UUID;
BEGIN
  INSERT INTO canvas_collaborators (
    canvas_id, user_id, name, email, role, color
  )
  VALUES (
    p_canvas_id, p_user_id, p_name, p_email, p_role, p_color
  )
  ON CONFLICT (canvas_id, user_id)
  DO UPDATE SET
    role = EXCLUDED.role,
    is_active = true,
    last_seen = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_collaborator_id;

  RETURN v_collaborator_id;
END;
$$ LANGUAGE plpgsql;

-- Update collaborator cursor
CREATE OR REPLACE FUNCTION update_collaborator_cursor(
  p_canvas_id UUID,
  p_user_id UUID,
  p_cursor_x DECIMAL,
  p_cursor_y DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE canvas_collaborators
  SET
    cursor_x = p_cursor_x,
    cursor_y = p_cursor_y,
    is_active = true,
    last_seen = NOW(),
    updated_at = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create version snapshot
CREATE OR REPLACE FUNCTION create_version_snapshot(
  p_canvas_id UUID,
  p_name TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT 'System'
)
RETURNS UUID AS $$
DECLARE
  v_version_id UUID;
  v_current_version INTEGER;
  v_canvas_data JSONB;
BEGIN
  -- Get current version
  SELECT version INTO v_current_version
  FROM canvas_projects
  WHERE id = p_canvas_id;

  -- Get all layers
  SELECT json_agg(row_to_json(cl.*)) INTO v_canvas_data
  FROM canvas_layers cl
  WHERE cl.canvas_id = p_canvas_id;

  -- Create version
  INSERT INTO canvas_versions (
    canvas_id, version, name, description, data, created_by
  )
  VALUES (
    p_canvas_id,
    v_current_version + 1,
    COALESCE(p_name, 'Version ' || (v_current_version + 1)),
    p_description,
    COALESCE(v_canvas_data, '[]'::jsonb),
    p_created_by
  )
  RETURNING id INTO v_version_id;

  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql;

-- Get canvas with layers
CREATE OR REPLACE FUNCTION get_canvas_with_layers(p_canvas_id UUID)
RETURNS JSON AS $$
DECLARE
  v_canvas JSON;
BEGIN
  SELECT json_build_object(
    'project', row_to_json(cp.*),
    'layers', (
      SELECT json_agg(row_to_json(cl.*) ORDER BY cl.z_index)
      FROM canvas_layers cl
      WHERE cl.canvas_id = p_canvas_id
    ),
    'collaborators', (
      SELECT json_agg(row_to_json(cc.*))
      FROM canvas_collaborators cc
      WHERE cc.canvas_id = p_canvas_id
    ),
    'comments', (
      SELECT json_agg(
        json_build_object(
          'comment', row_to_json(cmt.*),
          'replies', (
            SELECT json_agg(row_to_json(r.*) ORDER BY r.created_at)
            FROM canvas_comment_replies r
            WHERE r.comment_id = cmt.id
          )
        )
      )
      FROM canvas_comments cmt
      WHERE cmt.canvas_id = p_canvas_id
    )
  ) INTO v_canvas
  FROM canvas_projects cp
  WHERE cp.id = p_canvas_id;

  RETURN v_canvas;
END;
$$ LANGUAGE plpgsql;

-- Fork canvas project
CREATE OR REPLACE FUNCTION fork_canvas_project(
  p_canvas_id UUID,
  p_user_id UUID,
  p_new_name TEXT
)
RETURNS UUID AS $$
DECLARE
  v_new_canvas_id UUID;
  v_original canvas_projects%ROWTYPE;
BEGIN
  -- Get original project
  SELECT * INTO v_original FROM canvas_projects WHERE id = p_canvas_id;

  -- Create new project
  INSERT INTO canvas_projects (
    user_id, name, description, template, width, height,
    background_color, created_by, tags
  )
  VALUES (
    p_user_id,
    p_new_name,
    'Forked from: ' || v_original.name,
    v_original.template,
    v_original.width,
    v_original.height,
    v_original.background_color,
    (SELECT email FROM auth.users WHERE id = p_user_id),
    v_original.tags
  )
  RETURNING id INTO v_new_canvas_id;

  -- Copy layers
  INSERT INTO canvas_layers (
    canvas_id, type, name, data, x, y, width, height,
    rotation, scale_x, scale_y, opacity, is_visible, z_index, style
  )
  SELECT
    v_new_canvas_id, type, name, data, x, y, width, height,
    rotation, scale_x, scale_y, opacity, is_visible, z_index, style
  FROM canvas_layers
  WHERE canvas_id = p_canvas_id;

  -- Increment fork count
  UPDATE canvas_projects
  SET fork_count = fork_count + 1
  WHERE id = p_canvas_id;

  RETURN v_new_canvas_id;
END;
$$ LANGUAGE plpgsql;

-- Update canvas stats daily
CREATE OR REPLACE FUNCTION update_canvas_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO canvas_stats (
    user_id,
    date,
    total_projects,
    shared_projects,
    active_collaborators,
    total_layers,
    total_drawings,
    total_versions,
    total_comments,
    storage_used,
    template_breakdown
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE is_shared = true),
    (
      SELECT COUNT(DISTINCT user_id)
      FROM canvas_collaborators cc
      JOIN canvas_projects cp ON cp.id = cc.canvas_id
      WHERE cp.user_id = p_user_id AND cc.is_active = true
    ),
    (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    (
      SELECT COUNT(*)
      FROM canvas_layers cl
      JOIN canvas_projects cp ON cp.id = cl.canvas_id
      WHERE cp.user_id = p_user_id AND cl.type = 'drawing'
    ),
    COALESCE(SUM(version), 0),
    (
      SELECT COUNT(*)
      FROM canvas_comments cc
      JOIN canvas_projects cp ON cp.id = cc.canvas_id
      WHERE cp.user_id = p_user_id
    ),
    0,
    (SELECT get_canvas_stats(p_user_id)->>'byTemplate')::jsonb
  FROM canvas_projects
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_projects = EXCLUDED.total_projects,
    shared_projects = EXCLUDED.shared_projects,
    active_collaborators = EXCLUDED.active_collaborators,
    total_layers = EXCLUDED.total_layers,
    total_drawings = EXCLUDED.total_drawings,
    total_versions = EXCLUDED.total_versions,
    total_comments = EXCLUDED.total_comments,
    template_breakdown = EXCLUDED.template_breakdown,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE canvas_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_layers ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_comment_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_stats ENABLE ROW LEVEL SECURITY;

-- Canvas Projects Policies
CREATE POLICY canvas_projects_select_policy ON canvas_projects
  FOR SELECT USING (
    auth.uid() = user_id OR
    is_shared = true OR
    EXISTS (
      SELECT 1 FROM canvas_collaborators cc
      WHERE cc.canvas_id = id AND cc.user_id = auth.uid()
    )
  );

CREATE POLICY canvas_projects_insert_policy ON canvas_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY canvas_projects_update_policy ON canvas_projects
  FOR UPDATE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM canvas_collaborators cc
      WHERE cc.canvas_id = id AND cc.user_id = auth.uid() AND cc.role IN ('owner', 'editor')
    )
  );

CREATE POLICY canvas_projects_delete_policy ON canvas_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Canvas Collaborators Policies
CREATE POLICY canvas_collaborators_select_policy ON canvas_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (cp.user_id = auth.uid() OR cp.is_shared = true)
    )
  );

CREATE POLICY canvas_collaborators_insert_policy ON canvas_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND cp.user_id = auth.uid()
    )
  );

-- Canvas Layers Policies
CREATE POLICY canvas_layers_select_policy ON canvas_layers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (
        cp.user_id = auth.uid() OR
        cp.is_shared = true OR
        EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = cp.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY canvas_layers_insert_policy ON canvas_layers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      JOIN canvas_collaborators cc ON cc.canvas_id = cp.id
      WHERE cp.id = canvas_id AND cc.user_id = auth.uid() AND cc.role IN ('owner', 'editor')
    )
  );

-- Canvas Versions Policies
CREATE POLICY canvas_versions_select_policy ON canvas_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND cp.user_id = auth.uid()
    )
  );

-- Canvas Comments Policies
CREATE POLICY canvas_comments_select_policy ON canvas_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM canvas_projects cp
      WHERE cp.id = canvas_id AND (
        cp.user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM canvas_collaborators WHERE canvas_id = cp.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY canvas_comments_insert_policy ON canvas_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Canvas Stats Policies
CREATE POLICY canvas_stats_select_policy ON canvas_stats
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all canvas projects
-- SELECT * FROM canvas_projects WHERE user_id = 'user-id' ORDER BY updated_at DESC;

-- Example: Search canvas projects
-- SELECT * FROM search_canvas_projects('user-id', 'wireframe', NULL, 20);

-- Example: Get canvas statistics
-- SELECT * FROM get_canvas_stats('user-id');

-- Example: Add collaborator
-- SELECT add_collaborator('canvas-id', 'user-id', 'John Doe', 'john@example.com', 'editor', '#FF6B6B');

-- Example: Update cursor
-- SELECT update_collaborator_cursor('canvas-id', 'user-id', 150.5, 200.3);

-- Example: Create version snapshot
-- SELECT create_version_snapshot('canvas-id', 'Design v2', 'Added new components', 'user@example.com');

-- Example: Get canvas with layers
-- SELECT * FROM get_canvas_with_layers('canvas-id');

-- Example: Fork canvas project
-- SELECT fork_canvas_project('canvas-id', 'user-id', 'My Fork of Wireframe');

-- Example: Update daily canvas stats
-- SELECT update_canvas_stats_daily('user-id');

-- =====================================================
-- END OF COLLABORATION CANVAS SYSTEM SCHEMA
-- =====================================================
