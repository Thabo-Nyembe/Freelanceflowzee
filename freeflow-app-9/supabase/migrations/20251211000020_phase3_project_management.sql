-- ============================================================================
-- KAZI Platform - Phase 3: Project Management System
-- Comprehensive migration for world-class project management
-- ============================================================================

-- ============================================================================
-- COMMENTS SYSTEM
-- ============================================================================

-- Comments table for multi-entity commenting
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- project, task, file, document, deliverable, invoice, milestone
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_html TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived', 'deleted')),
  visibility VARCHAR(20) DEFAULT 'team' CHECK (visibility IN ('public', 'team', 'private', 'client')),
  is_pinned BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_note TEXT,
  position JSONB, -- For annotations: {type, x, y, page, etc.}
  mentions UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  reaction_counts JSONB DEFAULT '{}',
  reply_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

-- Comment reactions
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type VARCHAR(20) NOT NULL, -- like, love, celebrate, insightful, curious, support, custom
  emoji VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- ============================================================================
-- PROJECT TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'other',
  visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public', 'marketplace')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  cover_image TEXT,
  estimated_duration_days INTEGER DEFAULT 30,
  estimated_budget_min DECIMAL(12,2),
  estimated_budget_max DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  default_tasks JSONB DEFAULT '[]',
  milestones JSONB DEFAULT '[]',
  phases JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  use_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template ratings
CREATE TABLE IF NOT EXISTS template_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES project_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, user_id)
);

-- ============================================================================
-- PROJECT PHASES
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#3B82F6',
  position INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MILESTONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'approved', 'rejected', 'cancelled')),
  position INTEGER DEFAULT 0,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  deliverables JSONB DEFAULT '[]',
  payment_amount DECIMAL(12,2),
  payment_percentage DECIMAL(5,2),
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'invoiced', 'paid', 'partial')),
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  requires_approval BOOLEAN DEFAULT true,
  notification_sent BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PROJECT BASELINES (for timeline comparison)
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_baselines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot JSONB NOT NULL, -- Contains project, tasks, milestones state
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- UPLOAD SESSIONS (for chunked uploads)
-- ============================================================================

CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(255),
  chunk_size INTEGER DEFAULT 5242880, -- 5MB default
  total_chunks INTEGER NOT NULL,
  uploaded_chunks INTEGER[] DEFAULT '{}',
  chunks_received INTEGER DEFAULT 0,
  storage_provider VARCHAR(20) DEFAULT 'wasabi',
  storage_path TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  checksum VARCHAR(64),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'processing', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- Upload chunks tracking
CREATE TABLE IF NOT EXISTS upload_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES upload_sessions(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  checksum VARCHAR(64),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, chunk_index)
);

-- ============================================================================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Add milestone_id to tasks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'milestone_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add phase_id to tasks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'phase_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add project_id to files if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'files' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE files ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add milestone_id to invoices if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'milestone_id'
  ) THEN
    ALTER TABLE invoices ADD COLUMN milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at DESC);

-- Comment reactions indexes
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_user ON comment_reactions(user_id);

-- Project templates indexes
CREATE INDEX IF NOT EXISTS idx_project_templates_user ON project_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_visibility ON project_templates(visibility);
CREATE INDEX IF NOT EXISTS idx_project_templates_featured ON project_templates(is_featured) WHERE is_featured = true;

-- Project phases indexes
CREATE INDEX IF NOT EXISTS idx_project_phases_project ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_position ON project_phases(project_id, position);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_due_date ON milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_milestones_position ON milestones(project_id, position);

-- Project baselines indexes
CREATE INDEX IF NOT EXISTS idx_project_baselines_project ON project_baselines(project_id);

-- Upload sessions indexes
CREATE INDEX IF NOT EXISTS idx_upload_sessions_user ON upload_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX IF NOT EXISTS idx_upload_sessions_expires ON upload_sessions(expires_at);

-- Task milestone/phase indexes
CREATE INDEX IF NOT EXISTS idx_tasks_milestone ON tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Comments RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on accessible entities"
  ON comments FOR SELECT
  USING (
    visibility IN ('public', 'team') OR
    user_id = auth.uid() OR
    entity_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR visibility = 'public'
    )
  );

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- Comment reactions RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all reactions"
  ON comment_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON comment_reactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove own reactions"
  ON comment_reactions FOR DELETE
  USING (user_id = auth.uid());

-- Project templates RLS
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view accessible templates"
  ON project_templates FOR SELECT
  USING (
    visibility IN ('public', 'marketplace') OR
    user_id = auth.uid()
  );

CREATE POLICY "Users can create templates"
  ON project_templates FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON project_templates FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON project_templates FOR DELETE
  USING (user_id = auth.uid());

-- Project phases RLS
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view phases of accessible projects"
  ON project_phases FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR visibility = 'public'
    )
  );

CREATE POLICY "Project owners can manage phases"
  ON project_phases FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Milestones RLS
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view milestones of accessible projects"
  ON milestones FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR visibility = 'public'
    )
  );

CREATE POLICY "Project owners can manage milestones"
  ON milestones FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Project baselines RLS
ALTER TABLE project_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view baselines of own projects"
  ON project_baselines FOR SELECT
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Project owners can manage baselines"
  ON project_baselines FOR ALL
  USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

-- Upload sessions RLS
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own upload sessions"
  ON upload_sessions FOR ALL
  USING (user_id = auth.uid());

-- Upload chunks RLS
ALTER TABLE upload_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage chunks of own sessions"
  ON upload_chunks FOR ALL
  USING (
    session_id IN (SELECT id FROM upload_sessions WHERE user_id = auth.uid())
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment reply count
CREATE OR REPLACE FUNCTION increment_reply_count(comment_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE comments
  SET reply_count = reply_count + 1
  WHERE id = comment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment reaction counts
CREATE OR REPLACE FUNCTION update_comment_reaction_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE comments
    SET reaction_counts = (
      SELECT jsonb_object_agg(reaction_type, cnt)
      FROM (
        SELECT reaction_type, COUNT(*) as cnt
        FROM comment_reactions
        WHERE comment_id = NEW.comment_id
        GROUP BY reaction_type
      ) counts
    )
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE comments
    SET reaction_counts = COALESCE(
      (
        SELECT jsonb_object_agg(reaction_type, cnt)
        FROM (
          SELECT reaction_type, COUNT(*) as cnt
          FROM comment_reactions
          WHERE comment_id = OLD.comment_id
          GROUP BY reaction_type
        ) counts
      ),
      '{}'::jsonb
    )
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for reaction count updates
DROP TRIGGER IF EXISTS trg_update_reaction_counts ON comment_reactions;
CREATE TRIGGER trg_update_reaction_counts
AFTER INSERT OR DELETE ON comment_reactions
FOR EACH ROW
EXECUTE FUNCTION update_comment_reaction_counts();

-- Function to clean up expired upload sessions
CREATE OR REPLACE FUNCTION cleanup_expired_upload_sessions()
RETURNS VOID AS $$
BEGIN
  UPDATE upload_sessions
  SET status = 'failed', error_message = 'Session expired'
  WHERE expires_at < NOW() AND status IN ('pending', 'uploading');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON comments TO authenticated;
GRANT ALL ON comment_reactions TO authenticated;
GRANT ALL ON project_templates TO authenticated;
GRANT ALL ON template_ratings TO authenticated;
GRANT ALL ON project_phases TO authenticated;
GRANT ALL ON milestones TO authenticated;
GRANT ALL ON project_baselines TO authenticated;
GRANT ALL ON upload_sessions TO authenticated;
GRANT ALL ON upload_chunks TO authenticated;

GRANT EXECUTE ON FUNCTION increment_reply_count TO authenticated;
GRANT EXECUTE ON FUNCTION update_comment_reaction_counts TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_upload_sessions TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Phase 3: Project Management migration completed successfully!';
  RAISE NOTICE 'Created tables: comments, comment_reactions, project_templates, template_ratings, project_phases, milestones, project_baselines, upload_sessions, upload_chunks';
END $$;
