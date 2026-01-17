-- ============================================================================
-- RLS POLICIES FOR COLLABORATION TABLES
-- Created: 2026-01-17
-- Description: Comprehensive Row Level Security for all collaboration tables
-- ============================================================================

-- ============================================================================
-- MESSAGES SYSTEM RLS (messages_minimal.sql tables)
-- ============================================================================

-- Enable RLS on all message tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;

-- Chats Policies
DROP POLICY IF EXISTS "chats_select_policy" ON chats;
CREATE POLICY "chats_select_policy" ON chats FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chats_insert_policy" ON chats;
CREATE POLICY "chats_insert_policy" ON chats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "chats_update_policy" ON chats;
CREATE POLICY "chats_update_policy" ON chats FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "chats_delete_policy" ON chats;
CREATE POLICY "chats_delete_policy" ON chats FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Members Policies
DROP POLICY IF EXISTS "chat_members_select_policy" ON chat_members;
CREATE POLICY "chat_members_select_policy" ON chat_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "chat_members_insert_policy" ON chat_members;
CREATE POLICY "chat_members_insert_policy" ON chat_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_members.chat_id
      AND chats.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "chat_members_update_policy" ON chat_members;
CREATE POLICY "chat_members_update_policy" ON chat_members FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chat_members cm
      WHERE cm.chat_id = chat_members.chat_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "chat_members_delete_policy" ON chat_members;
CREATE POLICY "chat_members_delete_policy" ON chat_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = chat_members.chat_id
      AND chats.user_id = auth.uid()
    )
  );

-- Messages Policies
DROP POLICY IF EXISTS "messages_select_policy" ON messages;
CREATE POLICY "messages_select_policy" ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_insert_policy" ON messages;
CREATE POLICY "messages_insert_policy" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = messages.chat_id
      AND chat_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "messages_update_policy" ON messages;
CREATE POLICY "messages_update_policy" ON messages FOR UPDATE
  USING (auth.uid() = sender_id);

DROP POLICY IF EXISTS "messages_delete_policy" ON messages;
CREATE POLICY "messages_delete_policy" ON messages FOR DELETE
  USING (auth.uid() = sender_id);

-- Message Reactions Policies
DROP POLICY IF EXISTS "message_reactions_select_policy" ON message_reactions;
CREATE POLICY "message_reactions_select_policy" ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_reactions_insert_policy" ON message_reactions;
CREATE POLICY "message_reactions_insert_policy" ON message_reactions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_reactions.message_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_reactions_delete_policy" ON message_reactions;
CREATE POLICY "message_reactions_delete_policy" ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Message Attachments Policies
DROP POLICY IF EXISTS "message_attachments_select_policy" ON message_attachments;
CREATE POLICY "message_attachments_select_policy" ON message_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_attachments.message_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_attachments_insert_policy" ON message_attachments;
CREATE POLICY "message_attachments_insert_policy" ON message_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      WHERE m.id = message_attachments.message_id
      AND m.sender_id = auth.uid()
    )
  );

-- Message Read Receipts Policies
DROP POLICY IF EXISTS "message_read_receipts_select_policy" ON message_read_receipts;
CREATE POLICY "message_read_receipts_select_policy" ON message_read_receipts FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.id = message_read_receipts.message_id
      AND cm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "message_read_receipts_insert_policy" ON message_read_receipts;
CREATE POLICY "message_read_receipts_insert_policy" ON message_read_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- COLLABORATION TABLES RLS (collaboration_minimal.sql tables)
-- ============================================================================

-- Enable RLS on all collaboration tables
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

-- ============================================================================
-- COLLABORATION CHANNELS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_channels_select_policy" ON collaboration_channels;
CREATE POLICY "collab_channels_select_policy" ON collaboration_channels FOR SELECT
  USING (
    auth.uid() = user_id
    OR type = 'public'
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members
      WHERE collaboration_channel_members.channel_id = collaboration_channels.id
      AND collaboration_channel_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_channels_insert_policy" ON collaboration_channels;
CREATE POLICY "collab_channels_insert_policy" ON collaboration_channels FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collab_channels_update_policy" ON collaboration_channels;
CREATE POLICY "collab_channels_update_policy" ON collaboration_channels FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members
      WHERE collaboration_channel_members.channel_id = collaboration_channels.id
      AND collaboration_channel_members.user_id = auth.uid()
      AND collaboration_channel_members.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "collab_channels_delete_policy" ON collaboration_channels;
CREATE POLICY "collab_channels_delete_policy" ON collaboration_channels FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- ============================================================================
-- COLLABORATION CHANNEL MEMBERS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_channel_members_select_policy" ON collaboration_channel_members;
CREATE POLICY "collab_channel_members_select_policy" ON collaboration_channel_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members cm
      WHERE cm.channel_id = collaboration_channel_members.channel_id
      AND cm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_channels
      WHERE collaboration_channels.id = collaboration_channel_members.channel_id
      AND collaboration_channels.type = 'public'
    )
  );

DROP POLICY IF EXISTS "collab_channel_members_insert_policy" ON collaboration_channel_members;
CREATE POLICY "collab_channel_members_insert_policy" ON collaboration_channel_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_channels
      WHERE collaboration_channels.id = collaboration_channel_members.channel_id
      AND collaboration_channels.type = 'public'
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members cm
      WHERE cm.channel_id = collaboration_channel_members.channel_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "collab_channel_members_update_policy" ON collaboration_channel_members;
CREATE POLICY "collab_channel_members_update_policy" ON collaboration_channel_members FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members cm
      WHERE cm.channel_id = collaboration_channel_members.channel_id
      AND cm.user_id = auth.uid()
      AND cm.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "collab_channel_members_delete_policy" ON collaboration_channel_members;
CREATE POLICY "collab_channel_members_delete_policy" ON collaboration_channel_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_channels
      WHERE collaboration_channels.id = collaboration_channel_members.channel_id
      AND (collaboration_channels.user_id = auth.uid() OR collaboration_channels.created_by = auth.uid())
    )
  );

-- ============================================================================
-- COLLABORATION MESSAGES Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_messages_select_policy" ON collaboration_messages;
CREATE POLICY "collab_messages_select_policy" ON collaboration_messages FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_channel_members
      WHERE collaboration_channel_members.channel_id = collaboration_messages.channel_id
      AND collaboration_channel_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_messages_insert_policy" ON collaboration_messages;
CREATE POLICY "collab_messages_insert_policy" ON collaboration_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM collaboration_channel_members
      WHERE collaboration_channel_members.channel_id = collaboration_messages.channel_id
      AND collaboration_channel_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_messages_update_policy" ON collaboration_messages;
CREATE POLICY "collab_messages_update_policy" ON collaboration_messages FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "collab_messages_delete_policy" ON collaboration_messages;
CREATE POLICY "collab_messages_delete_policy" ON collaboration_messages FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COLLABORATION TEAMS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_teams_select_policy" ON collaboration_teams;
CREATE POLICY "collab_teams_select_policy" ON collaboration_teams FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members
      WHERE collaboration_team_members.team_id = collaboration_teams.id
      AND collaboration_team_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_teams_insert_policy" ON collaboration_teams;
CREATE POLICY "collab_teams_insert_policy" ON collaboration_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collab_teams_update_policy" ON collaboration_teams;
CREATE POLICY "collab_teams_update_policy" ON collaboration_teams FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = owner_id
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members
      WHERE collaboration_team_members.team_id = collaboration_teams.id
      AND collaboration_team_members.user_id = auth.uid()
      AND collaboration_team_members.role IN ('owner', 'lead')
    )
  );

DROP POLICY IF EXISTS "collab_teams_delete_policy" ON collaboration_teams;
CREATE POLICY "collab_teams_delete_policy" ON collaboration_teams FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = owner_id);

-- ============================================================================
-- COLLABORATION TEAM MEMBERS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_team_members_select_policy" ON collaboration_team_members;
CREATE POLICY "collab_team_members_select_policy" ON collaboration_team_members FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members tm
      WHERE tm.team_id = collaboration_team_members.team_id
      AND tm.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_teams
      WHERE collaboration_teams.id = collaboration_team_members.team_id
      AND (collaboration_teams.user_id = auth.uid() OR collaboration_teams.owner_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "collab_team_members_insert_policy" ON collaboration_team_members;
CREATE POLICY "collab_team_members_insert_policy" ON collaboration_team_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_teams
      WHERE collaboration_teams.id = collaboration_team_members.team_id
      AND (collaboration_teams.user_id = auth.uid() OR collaboration_teams.owner_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members tm
      WHERE tm.team_id = collaboration_team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'lead')
    )
  );

DROP POLICY IF EXISTS "collab_team_members_update_policy" ON collaboration_team_members;
CREATE POLICY "collab_team_members_update_policy" ON collaboration_team_members FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_teams
      WHERE collaboration_teams.id = collaboration_team_members.team_id
      AND (collaboration_teams.user_id = auth.uid() OR collaboration_teams.owner_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members tm
      WHERE tm.team_id = collaboration_team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('owner', 'lead')
    )
  );

DROP POLICY IF EXISTS "collab_team_members_delete_policy" ON collaboration_team_members;
CREATE POLICY "collab_team_members_delete_policy" ON collaboration_team_members FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_teams
      WHERE collaboration_teams.id = collaboration_team_members.team_id
      AND (collaboration_teams.user_id = auth.uid() OR collaboration_teams.owner_id = auth.uid())
    )
  );

-- ============================================================================
-- COLLABORATION WORKSPACE FOLDERS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_workspace_folders_select_policy" ON collaboration_workspace_folders;
CREATE POLICY "collab_workspace_folders_select_policy" ON collaboration_workspace_folders FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members tm
      JOIN collaboration_teams t ON t.id = tm.team_id
      WHERE t.user_id = collaboration_workspace_folders.user_id
      AND tm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_workspace_folders_insert_policy" ON collaboration_workspace_folders;
CREATE POLICY "collab_workspace_folders_insert_policy" ON collaboration_workspace_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collab_workspace_folders_update_policy" ON collaboration_workspace_folders;
CREATE POLICY "collab_workspace_folders_update_policy" ON collaboration_workspace_folders FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "collab_workspace_folders_delete_policy" ON collaboration_workspace_folders;
CREATE POLICY "collab_workspace_folders_delete_policy" ON collaboration_workspace_folders FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = created_by);

-- ============================================================================
-- COLLABORATION WORKSPACE FILES Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_workspace_files_select_policy" ON collaboration_workspace_files;
CREATE POLICY "collab_workspace_files_select_policy" ON collaboration_workspace_files FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = uploaded_by
    OR visibility = 'public'
    -- Team visibility: team members can see
    OR (
      visibility = 'team'
      AND EXISTS (
        SELECT 1 FROM collaboration_team_members tm
        JOIN collaboration_teams t ON t.id = tm.team_id
        WHERE t.user_id = collaboration_workspace_files.user_id
        AND tm.user_id = auth.uid()
      )
    )
    -- Direct file share
    OR EXISTS (
      SELECT 1 FROM collaboration_file_shares
      WHERE collaboration_file_shares.file_id = collaboration_workspace_files.id
      AND collaboration_file_shares.shared_with_user_id = auth.uid()
      AND (collaboration_file_shares.expires_at IS NULL OR collaboration_file_shares.expires_at > NOW())
    )
    -- Team file share
    OR EXISTS (
      SELECT 1 FROM collaboration_file_shares fs
      JOIN collaboration_team_members tm ON tm.team_id = fs.shared_with_team_id
      WHERE fs.file_id = collaboration_workspace_files.id
      AND tm.user_id = auth.uid()
      AND (fs.expires_at IS NULL OR fs.expires_at > NOW())
    )
  );

DROP POLICY IF EXISTS "collab_workspace_files_insert_policy" ON collaboration_workspace_files;
CREATE POLICY "collab_workspace_files_insert_policy" ON collaboration_workspace_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "collab_workspace_files_update_policy" ON collaboration_workspace_files;
CREATE POLICY "collab_workspace_files_update_policy" ON collaboration_workspace_files FOR UPDATE
  USING (
    auth.uid() = user_id
    OR auth.uid() = uploaded_by
    -- File share with edit permission
    OR EXISTS (
      SELECT 1 FROM collaboration_file_shares
      WHERE collaboration_file_shares.file_id = collaboration_workspace_files.id
      AND collaboration_file_shares.shared_with_user_id = auth.uid()
      AND collaboration_file_shares.can_edit = TRUE
      AND (collaboration_file_shares.expires_at IS NULL OR collaboration_file_shares.expires_at > NOW())
    )
  );

DROP POLICY IF EXISTS "collab_workspace_files_delete_policy" ON collaboration_workspace_files;
CREATE POLICY "collab_workspace_files_delete_policy" ON collaboration_workspace_files FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = uploaded_by);

-- ============================================================================
-- COLLABORATION FILE SHARES Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_file_shares_select_policy" ON collaboration_file_shares;
CREATE POLICY "collab_file_shares_select_policy" ON collaboration_file_shares FOR SELECT
  USING (
    auth.uid() = shared_by
    OR auth.uid() = shared_with_user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members
      WHERE collaboration_team_members.team_id = collaboration_file_shares.shared_with_team_id
      AND collaboration_team_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_file_shares_insert_policy" ON collaboration_file_shares;
CREATE POLICY "collab_file_shares_insert_policy" ON collaboration_file_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by
    AND EXISTS (
      SELECT 1 FROM collaboration_workspace_files
      WHERE collaboration_workspace_files.id = collaboration_file_shares.file_id
      AND (
        collaboration_workspace_files.user_id = auth.uid()
        OR collaboration_workspace_files.uploaded_by = auth.uid()
        -- User has share permission from existing share
        OR EXISTS (
          SELECT 1 FROM collaboration_file_shares fs
          WHERE fs.file_id = collaboration_file_shares.file_id
          AND fs.shared_with_user_id = auth.uid()
          AND fs.can_share = TRUE
        )
      )
    )
  );

DROP POLICY IF EXISTS "collab_file_shares_update_policy" ON collaboration_file_shares;
CREATE POLICY "collab_file_shares_update_policy" ON collaboration_file_shares FOR UPDATE
  USING (auth.uid() = shared_by);

DROP POLICY IF EXISTS "collab_file_shares_delete_policy" ON collaboration_file_shares;
CREATE POLICY "collab_file_shares_delete_policy" ON collaboration_file_shares FOR DELETE
  USING (
    auth.uid() = shared_by
    OR auth.uid() = shared_with_user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_workspace_files
      WHERE collaboration_workspace_files.id = collaboration_file_shares.file_id
      AND collaboration_workspace_files.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COLLABORATION MEETINGS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_meetings_select_policy" ON collaboration_meetings;
CREATE POLICY "collab_meetings_select_policy" ON collaboration_meetings FOR SELECT
  USING (
    auth.uid() = user_id
    OR auth.uid() = host_id
    OR EXISTS (
      SELECT 1 FROM collaboration_meeting_participants
      WHERE collaboration_meeting_participants.meeting_id = collaboration_meetings.id
      AND collaboration_meeting_participants.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_meetings_insert_policy" ON collaboration_meetings;
CREATE POLICY "collab_meetings_insert_policy" ON collaboration_meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id AND auth.uid() = host_id);

DROP POLICY IF EXISTS "collab_meetings_update_policy" ON collaboration_meetings;
CREATE POLICY "collab_meetings_update_policy" ON collaboration_meetings FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = host_id);

DROP POLICY IF EXISTS "collab_meetings_delete_policy" ON collaboration_meetings;
CREATE POLICY "collab_meetings_delete_policy" ON collaboration_meetings FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = host_id);

-- ============================================================================
-- COLLABORATION MEETING PARTICIPANTS Policies
-- ============================================================================

DROP POLICY IF EXISTS "collab_meeting_participants_select_policy" ON collaboration_meeting_participants;
CREATE POLICY "collab_meeting_participants_select_policy" ON collaboration_meeting_participants FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_meetings
      WHERE collaboration_meetings.id = collaboration_meeting_participants.meeting_id
      AND (collaboration_meetings.user_id = auth.uid() OR collaboration_meetings.host_id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM collaboration_meeting_participants mp
      WHERE mp.meeting_id = collaboration_meeting_participants.meeting_id
      AND mp.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "collab_meeting_participants_insert_policy" ON collaboration_meeting_participants;
CREATE POLICY "collab_meeting_participants_insert_policy" ON collaboration_meeting_participants FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_meetings
      WHERE collaboration_meetings.id = collaboration_meeting_participants.meeting_id
      AND (collaboration_meetings.user_id = auth.uid() OR collaboration_meetings.host_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "collab_meeting_participants_update_policy" ON collaboration_meeting_participants;
CREATE POLICY "collab_meeting_participants_update_policy" ON collaboration_meeting_participants FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_meetings
      WHERE collaboration_meetings.id = collaboration_meeting_participants.meeting_id
      AND (collaboration_meetings.user_id = auth.uid() OR collaboration_meetings.host_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "collab_meeting_participants_delete_policy" ON collaboration_meeting_participants;
CREATE POLICY "collab_meeting_participants_delete_policy" ON collaboration_meeting_participants FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM collaboration_meetings
      WHERE collaboration_meetings.id = collaboration_meeting_participants.meeting_id
      AND (collaboration_meetings.user_id = auth.uid() OR collaboration_meetings.host_id = auth.uid())
    )
  );

-- ============================================================================
-- ENHANCED FILES TABLE POLICIES (for team/project collaboration)
-- ============================================================================

-- Drop existing limited policies and create enhanced ones
DROP POLICY IF EXISTS "files_select" ON files;
CREATE POLICY "files_select_enhanced" ON files FOR SELECT
  USING (
    auth.uid() = user_id
    -- User has file shared with them
    OR EXISTS (
      SELECT 1 FROM file_shares
      WHERE file_shares.file_id = files.id
      AND file_shares.shared_with = auth.uid()
      AND (file_shares.expires_at IS NULL OR file_shares.expires_at > NOW())
    )
    -- Team members can view files from team workspace
    OR EXISTS (
      SELECT 1 FROM collaboration_team_members tm
      JOIN collaboration_teams t ON t.id = tm.team_id
      WHERE t.user_id = files.user_id
      AND tm.user_id = auth.uid()
      AND files.shared = TRUE
    )
    -- Project collaborators can access project files
    OR EXISTS (
      SELECT 1 FROM collaboration_workspace_files cwf
      JOIN collaboration_file_shares cfs ON cfs.file_id = cwf.id
      WHERE cwf.metadata->>'linked_file_id' = files.id::TEXT
      AND (
        cfs.shared_with_user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM collaboration_team_members ctm
          WHERE ctm.team_id = cfs.shared_with_team_id
          AND ctm.user_id = auth.uid()
        )
      )
    )
  );

-- Keep the insert/update/delete policies as owner-only
DROP POLICY IF EXISTS "files_update" ON files;
CREATE POLICY "files_update_enhanced" ON files FOR UPDATE
  USING (
    auth.uid() = user_id
    -- Users with edit permission from file share
    OR EXISTS (
      SELECT 1 FROM file_shares
      WHERE file_shares.file_id = files.id
      AND file_shares.shared_with = auth.uid()
      AND file_shares.permission IN ('edit', 'admin')
      AND (file_shares.expires_at IS NULL OR file_shares.expires_at > NOW())
    )
  );

-- ============================================================================
-- GRANT EXECUTE on functions used in policies
-- ============================================================================

-- Ensure authenticated users can access auth.uid()
GRANT USAGE ON SCHEMA auth TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON POLICY "chats_select_policy" ON chats IS 'Users can view chats they created or are members of';
COMMENT ON POLICY "messages_select_policy" ON messages IS 'Users can view messages in chats they are members of';
COMMENT ON POLICY "collab_teams_select_policy" ON collaboration_teams IS 'Users can view teams they own or are members of';
COMMENT ON POLICY "collab_workspace_files_select_policy" ON collaboration_workspace_files IS 'Users can view files based on ownership, visibility, or sharing';
COMMENT ON POLICY "files_select_enhanced" ON files IS 'Enhanced file access including team members and project collaborators';

-- ============================================================================
-- END OF RLS POLICIES MIGRATION
-- ============================================================================
