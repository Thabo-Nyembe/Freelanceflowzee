-- Minimal Canvas Collaboration Schema
--
-- Real-time collaborative whiteboard with:
-- - Multi-user canvas projects
-- - Layer management
-- - Cursor tracking
-- - Version history
-- - Comments and annotations

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS canvas_comment_replies CASCADE;
DROP TABLE IF EXISTS canvas_comments CASCADE;
DROP TABLE IF EXISTS canvas_sessions CASCADE;
DROP TABLE IF EXISTS canvas_versions CASCADE;
DROP TABLE IF EXISTS canvas_templates CASCADE;
DROP TABLE IF EXISTS canvas_elements CASCADE;
DROP TABLE IF EXISTS canvas_layers CASCADE;
DROP TABLE IF EXISTS canvas_collaborators CASCADE;
DROP TABLE IF EXISTS canvas_projects CASCADE;
DROP TYPE IF EXISTS layer_type CASCADE;
DROP TYPE IF EXISTS canvas_status CASCADE;
DROP TYPE IF EXISTS collaborator_permission CASCADE;
DROP TYPE IF EXISTS tool_type CASCADE;

-- ENUMs
CREATE TYPE layer_type AS ENUM (
  'drawing',
  'text',
  'shape',
  'image',
  'group'
);

CREATE TYPE canvas_status AS ENUM (
  'active',
  'archived',
  'template'
);

CREATE TYPE collaborator_permission AS ENUM (
  'view',
  'edit',
  'admin'
);

CREATE TYPE tool_type AS ENUM (
  'select',
  'hand',
  'brush',
  'eraser',
  'text',
  'rectangle',
  'circle',
  'line',
  'arrow',
  'pen',
  'highlighter'
);

-- Canvas Projects
CREATE TABLE canvas_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project details
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,

  -- Canvas settings
  width INTEGER NOT NULL DEFAULT 1920,
  height INTEGER NOT NULL DEFAULT 1080,
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',

  -- Status and version
  status canvas_status NOT NULL DEFAULT 'active',
  is_public BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  last_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Layers
CREATE TABLE canvas_layers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,

  -- Layer details
  name TEXT NOT NULL,
  type layer_type NOT NULL,

  -- Visibility and locking
  visible BOOLEAN NOT NULL DEFAULT true,
  locked BOOLEAN NOT NULL DEFAULT false,

  -- Styling
  opacity INTEGER NOT NULL DEFAULT 100 CHECK (opacity >= 0 AND opacity <= 100),
  z_index INTEGER NOT NULL DEFAULT 0,
  blend_mode TEXT NOT NULL DEFAULT 'normal',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Elements (drawings, shapes, text on layers)
CREATE TABLE canvas_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layer_id UUID NOT NULL REFERENCES canvas_layers(id) ON DELETE CASCADE,

  -- Element details
  element_type TEXT NOT NULL,

  -- Drawing data
  points JSONB DEFAULT '[]',
  text_content TEXT,
  shape_type TEXT,

  -- Styling
  color TEXT NOT NULL DEFAULT '#000000',
  stroke_width INTEGER NOT NULL DEFAULT 2,
  opacity INTEGER NOT NULL DEFAULT 100,

  -- Position and transform
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  size JSONB,
  rotation DECIMAL(5, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Collaborators (real-time collaboration)
CREATE TABLE canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permissions
  permission collaborator_permission NOT NULL DEFAULT 'edit',

  -- Real-time state
  is_active BOOLEAN NOT NULL DEFAULT false,
  cursor_position JSONB,
  current_tool tool_type,
  color TEXT,

  -- Activity tracking
  last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one collaborator per user per canvas
  UNIQUE(canvas_id, user_id)
);

-- Canvas Versions (version history)
CREATE TABLE canvas_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,

  -- Version info
  version INTEGER NOT NULL,
  thumbnail TEXT,
  comment TEXT,

  -- Snapshot data
  canvas_data JSONB NOT NULL,

  -- Tracking
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique versions per canvas
  UNIQUE(canvas_id, version)
);

-- Canvas Templates (reusable templates)
CREATE TABLE canvas_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Template details
  name TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  category TEXT NOT NULL,

  -- Canvas dimensions
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,

  -- Template data
  canvas_data JSONB NOT NULL,

  -- Stats
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,

  -- Creator
  created_by UUID REFERENCES auth.users(id),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comments
CREATE TABLE canvas_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment details
  position JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}',
  text_content TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Comment Replies
CREATE TABLE canvas_comment_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES canvas_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reply content
  text_content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Canvas Sessions (active collaboration sessions)
CREATE TABLE canvas_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID NOT NULL REFERENCES canvas_projects(id) ON DELETE CASCADE,

  -- Session tracking
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Call features
  video_call_active BOOLEAN NOT NULL DEFAULT false,
  audio_call_active BOOLEAN NOT NULL DEFAULT false,
  active_users INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Canvas Projects
CREATE INDEX IF NOT EXISTS idx_canvas_projects_user_id ON canvas_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_status ON canvas_projects(status);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_last_modified ON canvas_projects(last_modified DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_is_public ON canvas_projects(is_public);
CREATE INDEX IF NOT EXISTS idx_canvas_projects_tags ON canvas_projects USING GIN(tags);

-- Indexes for Canvas Layers
CREATE INDEX IF NOT EXISTS idx_canvas_layers_canvas_id ON canvas_layers(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_type ON canvas_layers(type);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_visible ON canvas_layers(visible);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_z_index ON canvas_layers(z_index);
CREATE INDEX IF NOT EXISTS idx_canvas_layers_canvas_z_index ON canvas_layers(canvas_id, z_index);

-- Indexes for Canvas Elements
CREATE INDEX IF NOT EXISTS idx_canvas_elements_layer_id ON canvas_elements(layer_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_element_type ON canvas_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_position ON canvas_elements USING GIN(position);

-- Indexes for Canvas Collaborators
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_canvas_id ON canvas_collaborators(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_user_id ON canvas_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_is_active ON canvas_collaborators(is_active);
CREATE INDEX IF NOT EXISTS idx_canvas_collaborators_last_seen ON canvas_collaborators(last_seen DESC);

-- Indexes for Canvas Versions
CREATE INDEX IF NOT EXISTS idx_canvas_versions_canvas_id ON canvas_versions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_version ON canvas_versions(canvas_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_by ON canvas_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_at ON canvas_versions(created_at DESC);

-- Indexes for Canvas Templates
CREATE INDEX IF NOT EXISTS idx_canvas_templates_category ON canvas_templates(category);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_downloads ON canvas_templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_rating ON canvas_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_canvas_templates_is_verified ON canvas_templates(is_verified);

-- Indexes for Canvas Comments
CREATE INDEX IF NOT EXISTS idx_canvas_comments_canvas_id ON canvas_comments(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_user_id ON canvas_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_resolved ON canvas_comments(resolved);
CREATE INDEX IF NOT EXISTS idx_canvas_comments_created_at ON canvas_comments(created_at DESC);

-- Indexes for Canvas Comment Replies
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_comment_id ON canvas_comment_replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_canvas_comment_replies_user_id ON canvas_comment_replies(user_id);

-- Indexes for Canvas Sessions
CREATE INDEX IF NOT EXISTS idx_canvas_sessions_canvas_id ON canvas_sessions(canvas_id);
CREATE INDEX IF NOT EXISTS idx_canvas_sessions_last_activity ON canvas_sessions(last_activity DESC);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_projects_updated_at
  BEFORE UPDATE ON canvas_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_layers_updated_at
  BEFORE UPDATE ON canvas_layers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_elements_updated_at
  BEFORE UPDATE ON canvas_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_collaborators_updated_at
  BEFORE UPDATE ON canvas_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_templates_updated_at
  BEFORE UPDATE ON canvas_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_comments_updated_at
  BEFORE UPDATE ON canvas_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_canvas_sessions_updated_at
  BEFORE UPDATE ON canvas_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update last_modified on canvas when elements change
CREATE OR REPLACE FUNCTION update_canvas_last_modified()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_projects
  SET last_modified = NOW()
  WHERE id = (
    SELECT canvas_id FROM canvas_layers
    WHERE id = COALESCE(NEW.layer_id, OLD.layer_id)
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_canvas_on_element_change
  AFTER INSERT OR UPDATE OR DELETE ON canvas_elements
  FOR EACH ROW
  EXECUTE FUNCTION update_canvas_last_modified();

-- Trigger to update active users count
CREATE OR REPLACE FUNCTION update_session_active_users()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE canvas_sessions
  SET active_users = (
    SELECT COUNT(*)
    FROM canvas_collaborators
    WHERE canvas_id = COALESCE(NEW.canvas_id, OLD.canvas_id)
      AND is_active = true
  ),
  last_activity = NOW()
  WHERE canvas_id = COALESCE(NEW.canvas_id, OLD.canvas_id);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_active_users_count
  AFTER INSERT OR UPDATE OR DELETE ON canvas_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_session_active_users();

-- Helper function to join canvas session
CREATE OR REPLACE FUNCTION join_canvas_session(
  p_canvas_id UUID,
  p_user_id UUID,
  p_permission collaborator_permission DEFAULT 'edit'
)
RETURNS JSON AS $$
BEGIN
  -- Create or get session
  INSERT INTO canvas_sessions (canvas_id)
  VALUES (p_canvas_id)
  ON CONFLICT DO NOTHING;

  -- Add or update collaborator
  INSERT INTO canvas_collaborators (canvas_id, user_id, permission, is_active)
  VALUES (p_canvas_id, p_user_id, p_permission, true)
  ON CONFLICT (canvas_id, user_id)
  DO UPDATE SET
    is_active = true,
    last_seen = NOW();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Helper function to leave canvas session
CREATE OR REPLACE FUNCTION leave_canvas_session(
  p_canvas_id UUID,
  p_user_id UUID
)
RETURNS JSON AS $$
BEGIN
  UPDATE canvas_collaborators
  SET is_active = false,
      cursor_position = NULL,
      last_seen = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Helper function to update cursor position
CREATE OR REPLACE FUNCTION update_cursor_position(
  p_canvas_id UUID,
  p_user_id UUID,
  p_x INTEGER,
  p_y INTEGER,
  p_tool tool_type DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE canvas_collaborators
  SET cursor_position = jsonb_build_object('x', p_x, 'y', p_y),
      current_tool = COALESCE(p_tool, current_tool),
      last_seen = NOW()
  WHERE canvas_id = p_canvas_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get active collaborators
CREATE OR REPLACE FUNCTION get_active_collaborators(p_canvas_id UUID)
RETURNS TABLE(
  user_id UUID,
  cursor_position JSONB,
  current_tool tool_type,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.user_id,
    c.cursor_position,
    c.current_tool,
    c.color
  FROM canvas_collaborators c
  WHERE c.canvas_id = p_canvas_id AND c.is_active = true;
END;
$$ LANGUAGE plpgsql;
