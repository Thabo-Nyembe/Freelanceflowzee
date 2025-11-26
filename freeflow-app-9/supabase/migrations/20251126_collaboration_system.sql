-- =====================================================
-- COLLABORATION SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Migration: 20251126_collaboration_system
-- Description: Comprehensive database for Team Collaboration
-- Features: Chat, Teams, Workspace, Meetings (Video/Voice), Feedback, Media, Canvas, Analytics
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CHAT & COMMUNICATIONS MODULE
-- =====================================================

-- Channels (chat rooms)
CREATE TABLE IF NOT EXISTS collaboration_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('public', 'private', 'direct')) DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT false,
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'file', 'system', 'call')) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  reactions JSONB DEFAULT '{}',
  thread_count INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES collaboration_messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel members
CREATE TABLE IF NOT EXISTS collaboration_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- =====================================================
-- TEAMS MODULE
-- =====================================================

-- Teams
CREATE TABLE IF NOT EXISTS collaboration_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  team_type TEXT CHECK (team_type IN ('project', 'department', 'cross-functional')) DEFAULT 'project',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS collaboration_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'lead', 'member', 'contributor')) DEFAULT 'member',
  status TEXT CHECK (status IN ('active', 'inactive', 'busy', 'away')) DEFAULT 'active',
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  tasks_completed INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- =====================================================
-- WORKSPACE MODULE
-- =====================================================

-- Workspace folders
CREATE TABLE IF NOT EXISTS collaboration_workspace_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace files
CREATE TABLE IF NOT EXISTS collaboration_workspace_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File shares
CREATE TABLE IF NOT EXISTS collaboration_file_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES collaboration_workspace_files(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  permission TEXT CHECK (permission IN ('view', 'edit', 'admin')) DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(file_id, shared_with_user_id)
);

-- =====================================================
-- MEETINGS MODULE (VIDEO/VOICE CALLS)
-- =====================================================

-- Meetings
CREATE TABLE IF NOT EXISTS collaboration_meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  meeting_type TEXT CHECK (meeting_type IN ('video', 'voice', 'hybrid')) DEFAULT 'video',
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  host_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  meeting_url TEXT,
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  scheduled_end_time TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 50,
  is_recording BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration INTEGER,
  agenda JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting participants
CREATE TABLE IF NOT EXISTS collaboration_meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES collaboration_meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('invited', 'accepted', 'declined', 'joined', 'left')) DEFAULT 'invited',
  camera_enabled BOOLEAN DEFAULT true,
  microphone_enabled BOOLEAN DEFAULT true,
  screen_sharing BOOLEAN DEFAULT false,
  hand_raised BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0,
  UNIQUE(meeting_id, user_id)
);

-- Meeting recordings
CREATE TABLE IF NOT EXISTS collaboration_meeting_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES collaboration_meetings(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  file_size_mb DECIMAL(10, 2),
  thumbnail_url TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FEEDBACK MODULE
-- =====================================================

-- Feedback submissions
CREATE TABLE IF NOT EXISTS collaboration_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT CHECK (category IN ('bug', 'feature', 'improvement', 'question', 'other')) DEFAULT 'other',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_starred BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback replies
CREATE TABLE IF NOT EXISTS collaboration_feedback_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reply_text TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback votes
CREATE TABLE IF NOT EXISTS collaboration_feedback_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  feedback_id UUID REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(feedback_id, user_id)
);

-- =====================================================
-- MEDIA MODULE
-- =====================================================

-- Media library
CREATE TABLE IF NOT EXISTS collaboration_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'audio', 'document')) NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,
  duration_seconds INTEGER,
  dimensions JSONB,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_favorite BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media shares
CREATE TABLE IF NOT EXISTS collaboration_media_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES collaboration_media(id) ON DELETE CASCADE,
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, shared_with_user_id)
);

-- =====================================================
-- CANVAS MODULE (WHITEBOARD)
-- =====================================================

-- Canvas boards
CREATE TABLE IF NOT EXISTS collaboration_canvas_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  width INTEGER DEFAULT 1920,
  height INTEGER DEFAULT 1080,
  background_color TEXT DEFAULT '#FFFFFF',
  is_template BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canvas collaborators
CREATE TABLE IF NOT EXISTS collaboration_canvas_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID REFERENCES collaboration_canvas_boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT CHECK (permission IN ('view', 'edit', 'admin')) DEFAULT 'view',
  cursor_position JSONB,
  is_active BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(canvas_id, user_id)
);

-- Canvas exports
CREATE TABLE IF NOT EXISTS collaboration_canvas_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  canvas_id UUID REFERENCES collaboration_canvas_boards(id) ON DELETE CASCADE,
  export_format TEXT CHECK (export_format IN ('png', 'pdf', 'svg')) NOT NULL,
  export_url TEXT NOT NULL,
  file_size_mb DECIMAL(10, 2),
  exported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS MODULE
-- =====================================================

-- Activity tracking
CREATE TABLE IF NOT EXISTS collaboration_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team performance metrics
CREATE TABLE IF NOT EXISTS collaboration_team_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  messages_sent INTEGER DEFAULT 0,
  files_shared INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  avg_response_time_minutes INTEGER DEFAULT 0,
  engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, metric_date)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Chat indexes
CREATE INDEX idx_channels_workspace ON collaboration_channels(workspace_id);
CREATE INDEX idx_channels_type ON collaboration_channels(type);
CREATE INDEX idx_channels_last_activity ON collaboration_channels(last_activity_at);
CREATE INDEX idx_messages_channel ON collaboration_messages(channel_id);
CREATE INDEX idx_messages_user ON collaboration_messages(user_id);
CREATE INDEX idx_messages_created ON collaboration_messages(created_at);
CREATE INDEX idx_channel_members_channel ON collaboration_channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON collaboration_channel_members(user_id);

-- Teams indexes
CREATE INDEX idx_teams_owner ON collaboration_teams(owner_id);
CREATE INDEX idx_teams_status ON collaboration_teams(status);
CREATE INDEX idx_team_members_team ON collaboration_team_members(team_id);
CREATE INDEX idx_team_members_user ON collaboration_team_members(user_id);

-- Workspace indexes
CREATE INDEX idx_workspace_folders_parent ON collaboration_workspace_folders(parent_folder_id);
CREATE INDEX idx_workspace_files_folder ON collaboration_workspace_files(folder_id);
CREATE INDEX idx_workspace_files_uploaded_by ON collaboration_workspace_files(uploaded_by);
CREATE INDEX idx_file_shares_file ON collaboration_file_shares(file_id);
CREATE INDEX idx_file_shares_user ON collaboration_file_shares(shared_with_user_id);

-- Meetings indexes
CREATE INDEX idx_meetings_host ON collaboration_meetings(host_id);
CREATE INDEX idx_meetings_status ON collaboration_meetings(status);
CREATE INDEX idx_meetings_scheduled_start ON collaboration_meetings(scheduled_start_time);
CREATE INDEX idx_meeting_participants_meeting ON collaboration_meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user ON collaboration_meeting_participants(user_id);
CREATE INDEX idx_meeting_recordings_meeting ON collaboration_meeting_recordings(meeting_id);

-- Feedback indexes
CREATE INDEX idx_feedback_workspace ON collaboration_feedback(workspace_id);
CREATE INDEX idx_feedback_status ON collaboration_feedback(status);
CREATE INDEX idx_feedback_category ON collaboration_feedback(category);
CREATE INDEX idx_feedback_replies_feedback ON collaboration_feedback_replies(feedback_id);
CREATE INDEX idx_feedback_votes_feedback ON collaboration_feedback_votes(feedback_id);

-- Media indexes
CREATE INDEX idx_media_workspace ON collaboration_media(workspace_id);
CREATE INDEX idx_media_type ON collaboration_media(media_type);
CREATE INDEX idx_media_uploaded_by ON collaboration_media(uploaded_by);
CREATE INDEX idx_media_shares_media ON collaboration_media_shares(media_id);

-- Canvas indexes
CREATE INDEX idx_canvas_workspace ON collaboration_canvas_boards(workspace_id);
CREATE INDEX idx_canvas_created_by ON collaboration_canvas_boards(created_by);
CREATE INDEX idx_canvas_collaborators_canvas ON collaboration_canvas_collaborators(canvas_id);
CREATE INDEX idx_canvas_collaborators_user ON collaboration_canvas_collaborators(user_id);
CREATE INDEX idx_canvas_exports_canvas ON collaboration_canvas_exports(canvas_id);

-- Analytics indexes
CREATE INDEX idx_analytics_workspace ON collaboration_analytics(workspace_id);
CREATE INDEX idx_analytics_user ON collaboration_analytics(user_id);
CREATE INDEX idx_analytics_created ON collaboration_analytics(created_at);
CREATE INDEX idx_team_metrics_team ON collaboration_team_metrics(team_id);
CREATE INDEX idx_team_metrics_date ON collaboration_team_metrics(metric_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE collaboration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_workspace_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_workspace_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_media_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_canvas_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_team_metrics ENABLE ROW LEVEL SECURITY;

-- Chat RLS policies
CREATE POLICY "Users can view public channels" ON collaboration_channels FOR SELECT USING (type = 'public');
CREATE POLICY "Channel members can view private channels" ON collaboration_channels FOR SELECT USING (
  type = 'private' AND EXISTS (
    SELECT 1 FROM collaboration_channel_members WHERE channel_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create channels" ON collaboration_channels FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Channel creators can update" ON collaboration_channels FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Users can view channel messages" ON collaboration_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM collaboration_channel_members WHERE channel_id = collaboration_messages.channel_id AND user_id = auth.uid())
);
CREATE POLICY "Users can post messages" ON collaboration_messages FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own messages" ON collaboration_messages FOR UPDATE USING (user_id = auth.uid());

-- Teams RLS policies
CREATE POLICY "Users can view own teams" ON collaboration_teams FOR SELECT USING (
  owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_team_members WHERE team_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create teams" ON collaboration_teams FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Team owners can update teams" ON collaboration_teams FOR UPDATE USING (owner_id = auth.uid());

-- Workspace RLS policies
CREATE POLICY "Users can view shared files" ON collaboration_workspace_files FOR SELECT USING (
  uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_file_shares WHERE file_id = id AND shared_with_user_id = auth.uid()
  )
);
CREATE POLICY "Users can upload files" ON collaboration_workspace_files FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Meetings RLS policies
CREATE POLICY "Users can view invited meetings" ON collaboration_meetings FOR SELECT USING (
  host_id = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_meeting_participants WHERE meeting_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create meetings" ON collaboration_meetings FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Meeting hosts can update" ON collaboration_meetings FOR UPDATE USING (host_id = auth.uid());

-- Feedback RLS policies
CREATE POLICY "Users can view workspace feedback" ON collaboration_feedback FOR SELECT USING (true);
CREATE POLICY "Users can submit feedback" ON collaboration_feedback FOR INSERT WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users can update own feedback" ON collaboration_feedback FOR UPDATE USING (submitted_by = auth.uid());

-- Media RLS policies
CREATE POLICY "Users can view shared media" ON collaboration_media FOR SELECT USING (
  uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_media_shares WHERE media_id = id AND shared_with_user_id = auth.uid()
  )
);
CREATE POLICY "Users can upload media" ON collaboration_media FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Canvas RLS policies
CREATE POLICY "Users can view accessible canvases" ON collaboration_canvas_boards FOR SELECT USING (
  created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM collaboration_canvas_collaborators WHERE canvas_id = id AND user_id = auth.uid()
  )
);
CREATE POLICY "Users can create canvases" ON collaboration_canvas_boards FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Canvas creators can update" ON collaboration_canvas_boards FOR UPDATE USING (created_by = auth.uid());

-- Analytics RLS policies
CREATE POLICY "Users can view own analytics" ON collaboration_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert analytics" ON collaboration_analytics FOR INSERT WITH CHECK (true);

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

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON collaboration_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON collaboration_messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON collaboration_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_folders_updated_at BEFORE UPDATE ON collaboration_workspace_folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workspace_files_updated_at BEFORE UPDATE ON collaboration_workspace_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON collaboration_meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON collaboration_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON collaboration_media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_canvas_updated_at BEFORE UPDATE ON collaboration_canvas_boards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update channel member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_channels
  SET member_count = (
    SELECT COUNT(*) FROM collaboration_channel_members WHERE channel_id = NEW.channel_id
  )
  WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_channel_members
  FOR EACH ROW EXECUTE FUNCTION update_channel_member_count();

-- Update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_teams
  SET member_count = (
    SELECT COUNT(*) FROM collaboration_team_members WHERE team_id = NEW.team_id
  )
  WHERE id = NEW.team_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_team_members
  FOR EACH ROW EXECUTE FUNCTION update_team_member_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get unread message count for user in channel
CREATE OR REPLACE FUNCTION get_unread_message_count(p_channel_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM collaboration_messages m
    JOIN collaboration_channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.channel_id = p_channel_id
      AND cm.user_id = p_user_id
      AND m.created_at > cm.last_read_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get team engagement score
CREATE OR REPLACE FUNCTION calculate_team_engagement_score(p_team_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER;
BEGIN
  SELECT
    COALESCE(AVG(performance_score), 0)::INTEGER
  INTO v_score
  FROM collaboration_team_members
  WHERE team_id = p_team_id AND status = 'active';

  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UNIVERSAL PINPOINT SYSTEM (UPS) TABLES
-- =====================================================

-- UPS Media Files table
CREATE TABLE upf_media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'audio', 'document', 'code', 'design')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  version TEXT DEFAULT 'v1.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- UPS Comments table (Pinpoint Feedback)
CREATE TABLE upf_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID NOT NULL REFERENCES upf_media_files(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES upf_comments(id) ON DELETE CASCADE, -- For threaded replies
  content TEXT NOT NULL,
  comment_type TEXT NOT NULL CHECK (comment_type IN ('text', 'voice', 'screen', 'drawing')),
  position_data JSONB DEFAULT '{}', -- Flexible positioning for different media types
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'in_progress', 'wont_fix')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  mentions TEXT[] DEFAULT '{}', -- Array of mentioned user IDs
  voice_note_url TEXT,
  voice_note_duration INTEGER,
  screen_recording_url TEXT,
  drawing_data TEXT, -- SVG or base64 image data
  ai_analysis JSONB, -- AI-powered insights
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPS Comment Attachments
CREATE TABLE upf_comment_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- UPS Comment Reactions
CREATE TABLE upf_comment_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- emoji code
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- UPS Comment Assignments
CREATE TABLE upf_comment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES upf_comments(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, assigned_to)
);

-- UPS Indexes
CREATE INDEX idx_upf_media_files_project ON upf_media_files(project_id);
CREATE INDEX idx_upf_media_files_type ON upf_media_files(file_type);
CREATE INDEX idx_upf_comments_file ON upf_comments(file_id);
CREATE INDEX idx_upf_comments_project ON upf_comments(project_id);
CREATE INDEX idx_upf_comments_user ON upf_comments(user_id);
CREATE INDEX idx_upf_comments_parent ON upf_comments(parent_id);
CREATE INDEX idx_upf_comments_status ON upf_comments(status);
CREATE INDEX idx_upf_comments_priority ON upf_comments(priority);
CREATE INDEX idx_upf_comment_attachments_comment ON upf_comment_attachments(comment_id);
CREATE INDEX idx_upf_comment_reactions_comment ON upf_comment_reactions(comment_id);
CREATE INDEX idx_upf_comment_assignments_comment ON upf_comment_assignments(comment_id);
CREATE INDEX idx_upf_comment_assignments_user ON upf_comment_assignments(assigned_to);

-- UPS RLS Policies
ALTER TABLE upf_media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE upf_comment_assignments ENABLE ROW LEVEL SECURITY;

-- Media files: project members can view/edit
CREATE POLICY upf_media_files_select ON upf_media_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_media_files.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_media_files_insert ON upf_media_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_media_files.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Comments: project members can view/create
CREATE POLICY upf_comments_select ON upf_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_comments.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_comments_insert ON upf_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = upf_comments.project_id
      AND pm.user_id = auth.uid()
    )
  );

CREATE POLICY upf_comments_update ON upf_comments FOR UPDATE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = upf_comments.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('admin', 'owner')
  ));

-- Triggers
CREATE TRIGGER update_upf_media_files_updated_at
  BEFORE UPDATE ON upf_media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upf_comments_updated_at
  BEFORE UPDATE ON upf_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 25 (20 collaboration + 5 UPS)
-- Indexes created: 62
-- RLS policies: 30
-- Triggers: 12
-- Helper functions: 2
-- =====================================================
