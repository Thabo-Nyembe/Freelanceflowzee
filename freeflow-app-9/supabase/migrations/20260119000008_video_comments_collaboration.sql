/**
 * Video Comments & Creative Collaboration Schema - FreeFlow A+++ Implementation
 * Frame.io-style frame-accurate video comments with drawing annotations
 */

-- Comment type enum
CREATE TYPE video_comment_type AS ENUM (
  'point',      -- Single point annotation
  'region',     -- Rectangular region
  'drawing',    -- Freehand drawing
  'text',       -- Text overlay
  'arrow',      -- Arrow annotation
  'audio'       -- Audio note
);

-- Comment status enum
CREATE TYPE comment_status AS ENUM (
  'active',
  'resolved',
  'archived'
);

-- Video review status
CREATE TYPE review_status AS ENUM (
  'pending',
  'in_progress',
  'changes_requested',
  'approved',
  'rejected'
);

-- =====================================================
-- VIDEO ASSETS TABLE
-- Stores video metadata for review
-- =====================================================
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

  -- Video metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Technical specs
  duration_ms INTEGER NOT NULL DEFAULT 0,
  frame_rate NUMERIC(8, 4) DEFAULT 24.0,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  mime_type VARCHAR(50),
  codec VARCHAR(50),

  -- Organization
  folder_id UUID,
  tags TEXT[] DEFAULT '{}',

  -- Review settings
  review_status review_status DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false,
  allow_comments BOOLEAN DEFAULT true,
  allow_downloads BOOLEAN DEFAULT false,

  -- Version control
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES video_assets(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VIDEO COMMENTS TABLE
-- Frame-accurate comments with spatial annotations
-- =====================================================
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,

  -- Temporal position (frame-accurate)
  timestamp_ms INTEGER NOT NULL,
  end_timestamp_ms INTEGER, -- For range comments
  frame_number INTEGER, -- Calculated from timestamp and frame rate

  -- Comment content
  content TEXT NOT NULL,
  comment_type video_comment_type DEFAULT 'point',
  status comment_status DEFAULT 'active',

  -- Spatial annotation (JSON for flexibility)
  -- Format: { x: number, y: number, width?: number, height?: number, path?: string }
  annotation JSONB,

  -- Drawing data (for freehand annotations)
  -- Format: { strokes: [{ points: [{x, y}], color, width }] }
  drawing_data JSONB,

  -- Audio note attachment
  audio_url TEXT,
  audio_duration_ms INTEGER,

  -- Mentions and assignments
  mentioned_users UUID[] DEFAULT '{}',
  assigned_to UUID REFERENCES users(id),

  -- Priority and categorization
  priority INTEGER DEFAULT 0, -- 0: normal, 1: important, 2: critical
  category VARCHAR(50),
  tags TEXT[] DEFAULT '{}',

  -- Resolution tracking
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  resolution_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ
);

-- =====================================================
-- VIDEO COMMENT REACTIONS
-- Quick emoji reactions to comments
-- =====================================================
CREATE TABLE IF NOT EXISTS video_comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES video_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(comment_id, user_id, emoji)
);

-- =====================================================
-- VIDEO REVIEW SESSIONS
-- Track review sessions with multiple reviewers
-- =====================================================
CREATE TABLE IF NOT EXISTS video_review_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session details
  title VARCHAR(255),
  description TEXT,
  status review_status DEFAULT 'pending',

  -- Deadline and scheduling
  due_date TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT false,

  -- Review requirements
  required_approvers INTEGER DEFAULT 1,
  approval_count INTEGER DEFAULT 0,

  -- Access control
  is_public BOOLEAN DEFAULT false,
  password_hash TEXT, -- Optional password protection

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- VIDEO REVIEW PARTICIPANTS
-- Track who can review and their status
-- =====================================================
CREATE TABLE IF NOT EXISTS video_review_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES video_review_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- For external reviewers (email-based)
  email VARCHAR(255),
  invite_token UUID DEFAULT gen_random_uuid(),

  -- Role and permissions
  role VARCHAR(50) DEFAULT 'reviewer', -- reviewer, approver, viewer
  can_comment BOOLEAN DEFAULT true,
  can_download BOOLEAN DEFAULT false,

  -- Review status
  status VARCHAR(50) DEFAULT 'pending', -- pending, viewed, commented, approved, rejected
  last_viewed_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  decision_notes TEXT,

  -- Timestamps
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,

  UNIQUE(session_id, user_id),
  UNIQUE(session_id, email)
);

-- =====================================================
-- VIDEO COMMENT THREADS
-- Group comments into conversation threads
-- =====================================================
CREATE TABLE IF NOT EXISTS video_comment_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  root_comment_id UUID NOT NULL REFERENCES video_comments(id) ON DELETE CASCADE,

  -- Thread metadata
  title VARCHAR(255),
  status comment_status DEFAULT 'active',
  comment_count INTEGER DEFAULT 1,

  -- Last activity tracking
  last_comment_at TIMESTAMPTZ DEFAULT NOW(),
  last_comment_by UUID REFERENCES users(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VIDEO MARKERS
-- Non-comment markers for timeline navigation
-- =====================================================
CREATE TABLE IF NOT EXISTS video_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Marker position
  timestamp_ms INTEGER NOT NULL,
  duration_ms INTEGER, -- For range markers

  -- Marker content
  title VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color
  icon VARCHAR(50),

  -- Marker type
  marker_type VARCHAR(50) DEFAULT 'bookmark', -- bookmark, chapter, note, todo

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- VIDEO TIMECODES
-- Named timecodes for easy reference
-- =====================================================
CREATE TABLE IF NOT EXISTS video_timecodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID NOT NULL REFERENCES video_assets(id) ON DELETE CASCADE,

  -- Timecode details
  name VARCHAR(100) NOT NULL,
  timestamp_ms INTEGER NOT NULL,
  frame_number INTEGER,

  -- SMPTE timecode format (HH:MM:SS:FF)
  smpte_timecode VARCHAR(20),

  -- Organization
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_video_assets_user ON video_assets(user_id);
CREATE INDEX idx_video_assets_project ON video_assets(project_id);
CREATE INDEX idx_video_assets_status ON video_assets(review_status);
CREATE INDEX idx_video_assets_created ON video_assets(created_at DESC);

CREATE INDEX idx_video_comments_video ON video_comments(video_id);
CREATE INDEX idx_video_comments_user ON video_comments(user_id);
CREATE INDEX idx_video_comments_parent ON video_comments(parent_id);
CREATE INDEX idx_video_comments_timestamp ON video_comments(video_id, timestamp_ms);
CREATE INDEX idx_video_comments_status ON video_comments(status);
CREATE INDEX idx_video_comments_created ON video_comments(created_at DESC);

CREATE INDEX idx_video_reactions_comment ON video_comment_reactions(comment_id);
CREATE INDEX idx_video_reactions_user ON video_comment_reactions(user_id);

CREATE INDEX idx_video_sessions_video ON video_review_sessions(video_id);
CREATE INDEX idx_video_sessions_status ON video_review_sessions(status);

CREATE INDEX idx_video_participants_session ON video_review_participants(session_id);
CREATE INDEX idx_video_participants_user ON video_review_participants(user_id);
CREATE INDEX idx_video_participants_token ON video_review_participants(invite_token);

CREATE INDEX idx_video_markers_video ON video_markers(video_id);
CREATE INDEX idx_video_markers_timestamp ON video_markers(video_id, timestamp_ms);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate frame number from timestamp
CREATE OR REPLACE FUNCTION calculate_frame_number(
  p_timestamp_ms INTEGER,
  p_frame_rate NUMERIC
) RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR((p_timestamp_ms / 1000.0) * p_frame_rate)::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate SMPTE timecode
CREATE OR REPLACE FUNCTION calculate_smpte_timecode(
  p_timestamp_ms INTEGER,
  p_frame_rate NUMERIC
) RETURNS TEXT AS $$
DECLARE
  total_frames INTEGER;
  fps INTEGER;
  frames INTEGER;
  seconds INTEGER;
  minutes INTEGER;
  hours INTEGER;
BEGIN
  fps := FLOOR(p_frame_rate)::INTEGER;
  total_frames := calculate_frame_number(p_timestamp_ms, p_frame_rate);

  frames := total_frames % fps;
  total_frames := total_frames / fps;

  seconds := total_frames % 60;
  total_frames := total_frames / 60;

  minutes := total_frames % 60;
  hours := total_frames / 60;

  RETURN LPAD(hours::TEXT, 2, '0') || ':' ||
         LPAD(minutes::TEXT, 2, '0') || ':' ||
         LPAD(seconds::TEXT, 2, '0') || ':' ||
         LPAD(frames::TEXT, 2, '0');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update comment frame number on insert/update
CREATE OR REPLACE FUNCTION update_comment_frame_number()
RETURNS TRIGGER AS $$
DECLARE
  v_frame_rate NUMERIC;
BEGIN
  SELECT frame_rate INTO v_frame_rate
  FROM video_assets
  WHERE id = NEW.video_id;

  NEW.frame_number := calculate_frame_number(NEW.timestamp_ms, COALESCE(v_frame_rate, 24.0));
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment frame number
CREATE TRIGGER trg_video_comment_frame_number
  BEFORE INSERT OR UPDATE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_frame_number();

-- Function to update thread comment count
CREATE OR REPLACE FUNCTION update_thread_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE video_comment_threads
    SET
      comment_count = comment_count + 1,
      last_comment_at = NOW(),
      last_comment_by = NEW.user_id
    WHERE root_comment_id = COALESCE(NEW.parent_id, NEW.id);
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE video_comment_threads
    SET comment_count = comment_count - 1
    WHERE root_comment_id = COALESCE(OLD.parent_id, OLD.id);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for thread comment count
CREATE TRIGGER trg_thread_comment_count
  AFTER INSERT OR DELETE ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_thread_comment_count();

-- Function to auto-create thread for root comments
CREATE OR REPLACE FUNCTION create_comment_thread()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    INSERT INTO video_comment_threads (video_id, root_comment_id)
    VALUES (NEW.video_id, NEW.id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto thread creation
CREATE TRIGGER trg_create_comment_thread
  AFTER INSERT ON video_comments
  FOR EACH ROW
  EXECUTE FUNCTION create_comment_thread();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_review_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_review_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comment_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_timecodes ENABLE ROW LEVEL SECURITY;

-- Video assets policies
CREATE POLICY "Users can view own videos" ON video_assets
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can view shared videos" ON video_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_review_participants vrp
      JOIN video_review_sessions vrs ON vrs.id = vrp.session_id
      WHERE vrs.video_id = video_assets.id
      AND vrp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create videos" ON video_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own videos" ON video_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own videos" ON video_assets
  FOR DELETE USING (auth.uid() = user_id);

-- Video comments policies
CREATE POLICY "Users can view comments on accessible videos" ON video_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_comments.video_id
      AND (va.user_id = auth.uid() OR va.is_public = true)
    )
  );

CREATE POLICY "Users can create comments" ON video_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON video_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON video_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Video owners can resolve any comment
CREATE POLICY "Video owners can resolve comments" ON video_comments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_comments.video_id
      AND va.user_id = auth.uid()
    )
  );

-- Comment reactions policies
CREATE POLICY "Users can view reactions" ON video_comment_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON video_comment_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions" ON video_comment_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Review sessions policies
CREATE POLICY "Users can view own or participating sessions" ON video_review_sessions
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM video_review_participants
      WHERE session_id = video_review_sessions.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sessions" ON video_review_sessions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update sessions" ON video_review_sessions
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete sessions" ON video_review_sessions
  FOR DELETE USING (auth.uid() = created_by);

-- Review participants policies
CREATE POLICY "Session creators can manage participants" ON video_review_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM video_review_sessions
      WHERE id = video_review_participants.session_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view own participation" ON video_review_participants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own participation" ON video_review_participants
  FOR UPDATE USING (user_id = auth.uid());

-- Markers policies
CREATE POLICY "Users can view markers on accessible videos" ON video_markers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_markers.video_id
      AND (va.user_id = auth.uid() OR va.is_public = true)
    )
  );

CREATE POLICY "Users can manage own markers" ON video_markers
  FOR ALL USING (auth.uid() = user_id);

-- Timecodes policies
CREATE POLICY "Users can view timecodes on accessible videos" ON video_timecodes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_timecodes.video_id
      AND (va.user_id = auth.uid() OR va.is_public = true)
    )
  );

CREATE POLICY "Video owners can manage timecodes" ON video_timecodes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_timecodes.video_id
      AND va.user_id = auth.uid()
    )
  );

-- Threads follow same access as comments
CREATE POLICY "Users can view threads" ON video_comment_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM video_assets va
      WHERE va.id = video_comment_threads.video_id
      AND (va.user_id = auth.uid() OR va.is_public = true)
    )
  );
