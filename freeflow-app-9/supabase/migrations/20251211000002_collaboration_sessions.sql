-- ============================================================================
-- Real-Time Collaboration Sessions Migration
-- Created: 2025-12-11
-- Description: Tables for real-time collaboration with CRDT support
-- Includes: sessions, participants, comments, versions, and events
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_status') THEN
    CREATE TYPE session_status AS ENUM ('active', 'paused', 'ended');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role') THEN
    CREATE TYPE participant_role AS ENUM ('owner', 'editor', 'commenter', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_status') THEN
    CREATE TYPE participant_status AS ENUM ('connected', 'disconnected', 'idle', 'away');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_type') THEN
    CREATE TYPE document_type AS ENUM ('canvas', 'document', 'spreadsheet', 'presentation', 'code', 'video_project', 'design', 'other');
  END IF;
END $$;

-- ============================================================================
-- TABLE 1: collaboration_sessions (main session table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document reference
  document_id UUID NOT NULL,
  document_type document_type NOT NULL DEFAULT 'document',
  document_name TEXT,

  -- Session info
  name TEXT,
  description TEXT,
  status session_status NOT NULL DEFAULT 'active',

  -- Settings
  max_participants INTEGER DEFAULT 50,
  allow_anonymous BOOLEAN DEFAULT FALSE,
  require_approval BOOLEAN DEFAULT FALSE,
  auto_save_interval INTEGER DEFAULT 30000, -- milliseconds
  sync_frequency INTEGER DEFAULT 1000, -- milliseconds

  -- Access
  invite_code TEXT UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,

  -- Statistics
  participant_count INTEGER DEFAULT 0,
  peak_participants INTEGER DEFAULT 0,
  total_edits INTEGER DEFAULT 0,
  total_duration_seconds INTEGER DEFAULT 0,

  -- CRDT state
  crdt_state BYTEA,
  crdt_vector_clock JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,

  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_created_by ON collaboration_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_document_id ON collaboration_sessions(document_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_document_type ON collaboration_sessions(document_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_status ON collaboration_sessions(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_invite_code ON collaboration_sessions(invite_code) WHERE invite_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_created_at ON collaboration_sessions(created_at DESC);

-- ============================================================================
-- TABLE 2: session_participants (users in sessions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Participant info
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  color TEXT, -- assigned color for cursors/selections

  -- Role and status
  role participant_role NOT NULL DEFAULT 'editor',
  status participant_status NOT NULL DEFAULT 'connected',

  -- Permissions
  can_edit BOOLEAN DEFAULT TRUE,
  can_comment BOOLEAN DEFAULT TRUE,
  can_invite BOOLEAN DEFAULT FALSE,
  can_manage BOOLEAN DEFAULT FALSE,

  -- Activity tracking
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  last_cursor_position JSONB,
  last_selection JSONB,
  idle_since TIMESTAMPTZ,

  -- Connection info
  connection_id TEXT,
  connection_quality TEXT DEFAULT 'good',
  device_info JSONB DEFAULT '{}',

  -- Statistics
  edits_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  time_active_seconds INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_user_id ON session_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_session_participants_status ON session_participants(status);
CREATE INDEX IF NOT EXISTS idx_session_participants_role ON session_participants(role);
CREATE INDEX IF NOT EXISTS idx_session_participants_last_active ON session_participants(last_active_at DESC);

-- ============================================================================
-- TABLE 3: collaboration_comments (document comments)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collab_document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE SET NULL,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Position in document
  position_type TEXT DEFAULT 'point', -- point, range, selection
  position_data JSONB, -- x, y, or selection range

  -- Annotations
  annotation_type TEXT, -- highlight, note, question, suggestion
  annotation_color TEXT,

  -- Threading
  parent_comment_id UUID REFERENCES collab_document_comments(id) ON DELETE CASCADE,
  thread_count INTEGER DEFAULT 0,

  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  -- Reactions
  reactions JSONB DEFAULT '{}',

  -- Mentions
  mentions UUID[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_comments_session_id ON collab_document_comments(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collab_comments_document_id ON collab_document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_collab_comments_user_id ON collab_document_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_comments_parent_id ON collab_document_comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collab_comments_is_resolved ON collab_document_comments(is_resolved);
CREATE INDEX IF NOT EXISTS idx_collab_comments_created_at ON collab_document_comments(created_at DESC);

-- ============================================================================
-- TABLE 4: document_versions (version history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version info
  version_number INTEGER NOT NULL,
  label TEXT,
  description TEXT,

  -- Content snapshot
  content_snapshot JSONB NOT NULL,
  content_hash TEXT,
  content_size INTEGER,

  -- Delta from previous
  delta_from_previous JSONB,
  previous_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,

  -- CRDT state at this version
  crdt_state BYTEA,
  vector_clock JSONB,

  -- Type of version
  version_type TEXT DEFAULT 'auto', -- auto, manual, milestone, restore

  -- Restoration
  restored_from_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
  restored_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_session_id ON document_versions(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_document_versions_created_by ON document_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_document_versions_version_number ON document_versions(document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_type ON document_versions(version_type);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);

-- ============================================================================
-- TABLE 5: collaboration_events (audit trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collaboration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE SET NULL,
  document_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_category TEXT, -- session, edit, comment, participant, system

  -- Event data
  event_data JSONB DEFAULT '{}',

  -- CRDT operation (if applicable)
  crdt_operation JSONB,
  vector_clock_before JSONB,
  vector_clock_after JSONB,

  -- Context
  participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collaboration_events_session_id ON collaboration_events(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_events_document_id ON collaboration_events(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_events_user_id ON collaboration_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_events_type ON collaboration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_events_category ON collaboration_events(event_category) WHERE event_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_events_created_at ON collaboration_events(created_at DESC);

-- Partitioning hint: For production, consider partitioning this table by created_at

-- ============================================================================
-- TABLE 6: collaboration_invites (session invitations)
-- ============================================================================
CREATE TABLE IF NOT EXISTS collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invite target (either user_id or email)
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,

  -- Invite details
  role participant_role NOT NULL DEFAULT 'editor',
  message TEXT,

  -- Token for email invites
  invite_token TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  -- Timestamps
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invites_target_check CHECK (
    (invited_user_id IS NOT NULL AND invited_email IS NULL) OR
    (invited_user_id IS NULL AND invited_email IS NOT NULL)
  ),
  CONSTRAINT invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_collaboration_invites_session_id ON collaboration_invites(session_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_invited_user ON collaboration_invites(invited_user_id) WHERE invited_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_invited_email ON collaboration_invites(invited_email) WHERE invited_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_status ON collaboration_invites(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_invites_token ON collaboration_invites(invite_token) WHERE invite_token IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_invites ENABLE ROW LEVEL SECURITY;

-- Sessions policies
DROP POLICY IF EXISTS "Users can view sessions they created or participate in" ON collaboration_sessions;
CREATE POLICY "Users can view sessions they created or participate in"
  ON collaboration_sessions FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM session_participants
      WHERE session_participants.session_id = collaboration_sessions.id
      AND session_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create sessions" ON collaboration_sessions;
CREATE POLICY "Users can create sessions"
  ON collaboration_sessions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Session creators can update their sessions" ON collaboration_sessions;
CREATE POLICY "Session creators can update their sessions"
  ON collaboration_sessions FOR UPDATE
  USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Session creators can delete their sessions" ON collaboration_sessions;
CREATE POLICY "Session creators can delete their sessions"
  ON collaboration_sessions FOR DELETE
  USING (auth.uid() = created_by);

-- Participants policies
DROP POLICY IF EXISTS "Participants can view other participants in same session" ON session_participants;
CREATE POLICY "Participants can view other participants in same session"
  ON session_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = session_participants.session_id
      AND sp.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = session_participants.session_id
      AND cs.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can join sessions" ON session_participants;
CREATE POLICY "Users can join sessions"
  ON session_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Participants can update their own record" ON session_participants;
CREATE POLICY "Participants can update their own record"
  ON session_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Comments policies
DROP POLICY IF EXISTS "Session participants can view comments" ON collab_document_comments;
CREATE POLICY "Session participants can view comments"
  ON collab_document_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = collab_document_comments.session_id
      AND sp.user_id = auth.uid()
    )
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Authenticated users can create comments" ON collab_document_comments;
CREATE POLICY "Authenticated users can create comments"
  ON collab_document_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON collab_document_comments;
CREATE POLICY "Users can update own comments"
  ON collab_document_comments FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON collab_document_comments;
CREATE POLICY "Users can delete own comments"
  ON collab_document_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Versions policies
DROP POLICY IF EXISTS "Session participants can view versions" ON document_versions;
CREATE POLICY "Session participants can view versions"
  ON document_versions FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM session_participants sp
      WHERE sp.session_id = document_versions.session_id
      AND sp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create versions" ON document_versions;
CREATE POLICY "Authenticated users can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Invites policies
DROP POLICY IF EXISTS "Users can view invites for their sessions or to them" ON collaboration_invites;
CREATE POLICY "Users can view invites for their sessions or to them"
  ON collaboration_invites FOR SELECT
  USING (
    auth.uid() = invited_by
    OR auth.uid() = invited_user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = collaboration_invites.session_id
      AND cs.created_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Session owners can create invites" ON collaboration_invites;
CREATE POLICY "Session owners can create invites"
  ON collaboration_invites FOR INSERT
  WITH CHECK (
    auth.uid() = invited_by
    AND EXISTS (
      SELECT 1 FROM collaboration_sessions cs
      WHERE cs.id = collaboration_invites.session_id
      AND cs.created_by = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update sessions updated_at
DROP TRIGGER IF EXISTS update_collaboration_sessions_updated_at ON collaboration_sessions;
CREATE TRIGGER update_collaboration_sessions_updated_at
  BEFORE UPDATE ON collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update participants updated_at
DROP TRIGGER IF EXISTS update_session_participants_updated_at ON session_participants;
CREATE TRIGGER update_session_participants_updated_at
  BEFORE UPDATE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update comments updated_at
DROP TRIGGER IF EXISTS update_collab_comments_updated_at ON collab_document_comments;
CREATE TRIGGER update_collab_comments_updated_at
  BEFORE UPDATE ON collab_document_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update session participant count
CREATE OR REPLACE FUNCTION update_session_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collaboration_sessions
    SET
      participant_count = participant_count + 1,
      peak_participants = GREATEST(peak_participants, participant_count + 1)
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collaboration_sessions
    SET participant_count = GREATEST(0, participant_count - 1)
    WHERE id = OLD.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_session_participant_count_trigger ON session_participants;
CREATE TRIGGER update_session_participant_count_trigger
  AFTER INSERT OR DELETE ON session_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_session_participant_count();

-- Update comment thread count
CREATE OR REPLACE FUNCTION update_collab_comment_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
    UPDATE collab_document_comments
    SET thread_count = thread_count + 1
    WHERE id = NEW.parent_comment_id;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
    UPDATE collab_document_comments
    SET thread_count = thread_count - 1
    WHERE id = OLD.parent_comment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_collab_comment_thread_count_trigger ON collab_document_comments;
CREATE TRIGGER update_collab_comment_thread_count_trigger
  AFTER INSERT OR DELETE ON collab_document_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_collab_comment_thread_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get active sessions for a document
CREATE OR REPLACE FUNCTION get_document_active_sessions(p_document_id UUID)
RETURNS TABLE (
  session_id UUID,
  participant_count INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.participant_count,
    cs.created_at
  FROM collaboration_sessions cs
  WHERE cs.document_id = p_document_id
    AND cs.status = 'active'
  ORDER BY cs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  affected_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE collaboration_sessions
    SET status = 'ended', ended_at = NOW()
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO affected_count FROM updated;

  RETURN affected_count;
END;
$$ LANGUAGE plpgsql;
