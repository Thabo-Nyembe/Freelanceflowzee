-- Minimal Collaboration Schema
--
-- This schema creates tables for general collaboration tools.
-- Supports channels, messages, teams, workspace files, and meetings.

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS collaboration_meeting_participants CASCADE;
DROP TABLE IF EXISTS collaboration_meetings CASCADE;
DROP TABLE IF EXISTS collaboration_file_shares CASCADE;
DROP TABLE IF EXISTS collaboration_workspace_files CASCADE;
DROP TABLE IF EXISTS collaboration_workspace_folders CASCADE;
DROP TABLE IF EXISTS collaboration_team_members CASCADE;
DROP TABLE IF EXISTS collaboration_teams CASCADE;
DROP TABLE IF EXISTS collaboration_channel_members CASCADE;
DROP TABLE IF EXISTS collaboration_messages CASCADE;
DROP TABLE IF EXISTS collaboration_channels CASCADE;
DROP TYPE IF EXISTS channel_type CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS channel_role CASCADE;
DROP TYPE IF EXISTS team_type CASCADE;
DROP TYPE IF EXISTS team_member_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS file_visibility CASCADE;
DROP TYPE IF EXISTS meeting_status CASCADE;

-- ENUMs
CREATE TYPE channel_type AS ENUM ('public', 'private', 'direct');
CREATE TYPE message_type AS ENUM ('text', 'file', 'system', 'call');
CREATE TYPE channel_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE team_type AS ENUM ('project', 'department', 'cross-functional');
CREATE TYPE team_member_role AS ENUM ('owner', 'lead', 'member', 'contributor');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'busy', 'away');
CREATE TYPE file_visibility AS ENUM ('private', 'team', 'public');
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- =====================================================
-- CHAT & COMMUNICATIONS MODULE
-- =====================================================

-- Channels (chat rooms)
CREATE TABLE collaboration_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel information
  name TEXT NOT NULL,
  description TEXT,
  type channel_type NOT NULL DEFAULT 'public',

  -- Owner/creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  is_archived BOOLEAN DEFAULT false,

  -- Metrics
  member_count INTEGER NOT NULL DEFAULT 0,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ,

  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Messages
CREATE TABLE collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',

  -- Attachments and reactions
  attachments JSONB DEFAULT '[]',
  reactions JSONB DEFAULT '{}',

  -- Message properties
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,

  -- Threading
  thread_count INTEGER DEFAULT 0,
  parent_message_id UUID REFERENCES collaboration_messages(id) ON DELETE CASCADE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Channel members
CREATE TABLE collaboration_channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES collaboration_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Member role
  role channel_role NOT NULL DEFAULT 'member',

  -- Member settings
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  settings JSONB DEFAULT '{}',

  -- Timestamps
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one membership per user per channel
  UNIQUE(channel_id, user_id)
);

-- =====================================================
-- TEAMS MODULE
-- =====================================================

-- Teams
CREATE TABLE collaboration_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Team information
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  team_type team_type NOT NULL DEFAULT 'project',

  -- Owner
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Status
  status TEXT CHECK (status IN ('active', 'archived')) DEFAULT 'active',
  is_favorite BOOLEAN DEFAULT false,

  -- Metrics
  member_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team members
CREATE TABLE collaboration_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Member role and status
  role team_member_role NOT NULL DEFAULT 'member',
  status member_status NOT NULL DEFAULT 'active',

  -- Performance metrics
  performance_score INTEGER DEFAULT 0 CHECK (performance_score >= 0 AND performance_score <= 100),
  tasks_completed INTEGER DEFAULT 0,

  -- Activity tracking
  last_active_at TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one membership per user per team
  UNIQUE(team_id, user_id)
);

-- =====================================================
-- WORKSPACE MODULE
-- =====================================================

-- Workspace folders
CREATE TABLE collaboration_workspace_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Folder information
  name TEXT NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE CASCADE,

  -- Owner/creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Properties
  is_favorite BOOLEAN DEFAULT false,
  color TEXT,
  icon TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workspace files
CREATE TABLE collaboration_workspace_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File information
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,

  -- Organization
  folder_id UUID REFERENCES collaboration_workspace_folders(id) ON DELETE SET NULL,

  -- Ownership
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Access control
  visibility file_visibility NOT NULL DEFAULT 'private',

  -- File properties
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',

  -- Version control
  version INTEGER DEFAULT 1,
  parent_file_id UUID REFERENCES collaboration_workspace_files(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File shares
CREATE TABLE collaboration_file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES collaboration_workspace_files(id) ON DELETE CASCADE,

  -- Share details
  shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_team_id UUID REFERENCES collaboration_teams(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Permissions
  can_edit BOOLEAN DEFAULT false,
  can_download BOOLEAN DEFAULT true,
  can_share BOOLEAN DEFAULT false,

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure share is either to user or team
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_team_id IS NOT NULL)
  )
);

-- =====================================================
-- MEETINGS MODULE
-- =====================================================

-- Meetings
CREATE TABLE collaboration_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Meeting information
  title TEXT NOT NULL,
  description TEXT,
  meeting_url TEXT,

  -- Scheduling
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,

  -- Status
  status meeting_status NOT NULL DEFAULT 'scheduled',

  -- Host
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Settings
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  max_participants INTEGER,
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,

  -- Metadata
  agenda JSONB DEFAULT '[]',
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Meeting participants
CREATE TABLE collaboration_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES collaboration_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Participation
  status TEXT CHECK (status IN ('invited', 'accepted', 'declined', 'tentative', 'attended')) DEFAULT 'invited',
  is_required BOOLEAN DEFAULT false,

  -- Activity
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one participation per user per meeting
  UNIQUE(meeting_id, user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Channels indexes
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON collaboration_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_type ON collaboration_channels(type);
CREATE INDEX IF NOT EXISTS idx_channels_created_by ON collaboration_channels(created_by) WHERE created_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_channels_is_archived ON collaboration_channels(is_archived);
CREATE INDEX IF NOT EXISTS idx_channels_last_activity ON collaboration_channels(last_activity_at DESC);

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON collaboration_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON collaboration_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON collaboration_messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON collaboration_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_pinned ON collaboration_messages(is_pinned) WHERE is_pinned = true;

-- Channel members indexes
CREATE INDEX IF NOT EXISTS idx_channel_members_channel_id ON collaboration_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_user_id ON collaboration_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_role ON collaboration_channel_members(role);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON collaboration_teams(user_id);
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON collaboration_teams(owner_id) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_teams_type ON collaboration_teams(team_type);
CREATE INDEX IF NOT EXISTS idx_teams_status ON collaboration_teams(status);

-- Team members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON collaboration_team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON collaboration_team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON collaboration_team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON collaboration_team_members(status);

-- Workspace folders indexes
CREATE INDEX IF NOT EXISTS idx_workspace_folders_user_id ON collaboration_workspace_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_folders_parent ON collaboration_workspace_folders(parent_folder_id) WHERE parent_folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_folders_created_by ON collaboration_workspace_folders(created_by) WHERE created_by IS NOT NULL;

-- Workspace files indexes
CREATE INDEX IF NOT EXISTS idx_workspace_files_user_id ON collaboration_workspace_files(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_files_folder_id ON collaboration_workspace_files(folder_id) WHERE folder_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_files_uploaded_by ON collaboration_workspace_files(uploaded_by) WHERE uploaded_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workspace_files_visibility ON collaboration_workspace_files(visibility);
CREATE INDEX IF NOT EXISTS idx_workspace_files_tags ON collaboration_workspace_files USING GIN(tags);

-- File shares indexes
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON collaboration_file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_user_id ON collaboration_file_shares(shared_with_user_id) WHERE shared_with_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_shares_team_id ON collaboration_file_shares(shared_with_team_id) WHERE shared_with_team_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON collaboration_file_shares(shared_by);

-- Meetings indexes
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON collaboration_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON collaboration_meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON collaboration_meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_start ON collaboration_meetings(scheduled_start);

-- Meeting participants indexes
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON collaboration_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON collaboration_meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_status ON collaboration_meeting_participants(status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Update updated_at timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON collaboration_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON collaboration_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON collaboration_teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_folders_updated_at
  BEFORE UPDATE ON collaboration_workspace_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspace_files_updated_at
  BEFORE UPDATE ON collaboration_workspace_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON collaboration_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update channel member count trigger
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collaboration_channels
    SET member_count = member_count + 1
    WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collaboration_channels
    SET member_count = member_count - 1
    WHERE id = OLD.channel_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_channel_members
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_member_count();

-- Update team member count trigger
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collaboration_teams
    SET member_count = member_count + 1
    WHERE id = NEW.team_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collaboration_teams
    SET member_count = member_count - 1
    WHERE id = OLD.team_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_member_count_trigger
  AFTER INSERT OR DELETE ON collaboration_team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_count();

-- Update message count trigger
CREATE OR REPLACE FUNCTION update_channel_message_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE collaboration_channels
    SET
      message_count = message_count + 1,
      last_activity_at = NOW()
    WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE collaboration_channels
    SET message_count = message_count - 1
    WHERE id = OLD.channel_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channel_message_count_trigger
  AFTER INSERT OR DELETE ON collaboration_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_channel_message_count();
