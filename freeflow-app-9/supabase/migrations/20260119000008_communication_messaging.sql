-- ============================================================================
-- Phase 6: Communication & Messaging System
-- Slack-Level Real-Time Messaging with Channels, Threads, and Voice/Video
-- ============================================================================

-- ============================================================================
-- 1. CHANNELS
-- ============================================================================

CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Channel details
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  topic TEXT,

  -- Type and visibility
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct', 'group')),
  is_archived BOOLEAN DEFAULT false,
  is_general BOOLEAN DEFAULT false, -- Default channel for org

  -- Settings
  settings JSONB DEFAULT '{
    "allow_threads": true,
    "allow_reactions": true,
    "allow_files": true,
    "allow_voice": true,
    "allow_video": true,
    "message_retention_days": null,
    "notification_default": "all"
  }',

  -- For direct messages
  is_dm BOOLEAN DEFAULT false,
  dm_user_ids UUID[] DEFAULT '{}', -- For DM channels, store participant IDs

  -- Creator
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Stats (denormalized for performance)
  member_count INTEGER DEFAULT 0,
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, slug)
);

-- ============================================================================
-- 2. CHANNEL MEMBERS
-- ============================================================================

CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role and permissions
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),

  -- Notification preferences
  notification_preference TEXT DEFAULT 'all' CHECK (notification_preference IN ('all', 'mentions', 'none')),
  muted_until TIMESTAMPTZ,

  -- Read tracking
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_message_id UUID,
  unread_count INTEGER DEFAULT 0,
  unread_mentions INTEGER DEFAULT 0,

  -- Status
  is_starred BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  joined_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(channel_id, user_id)
);

-- ============================================================================
-- 3. MESSAGES
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Message content
  content TEXT NOT NULL,
  content_html TEXT, -- Rendered HTML with mentions, links, etc.

  -- Message type
  type TEXT DEFAULT 'message' CHECK (type IN (
    'message', 'system', 'bot', 'join', 'leave', 'call_started', 'call_ended',
    'channel_created', 'channel_renamed', 'user_added', 'user_removed',
    'pinned', 'unpinned', 'file_shared'
  )),

  -- Threading
  thread_id UUID REFERENCES messages(id) ON DELETE CASCADE, -- Parent message for thread
  reply_count INTEGER DEFAULT 0,
  thread_participants UUID[] DEFAULT '{}',
  last_reply_at TIMESTAMPTZ,

  -- Reply to specific message (quote)
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  -- Attachments
  attachments JSONB DEFAULT '[]', -- [{type, url, name, size, mime_type, thumbnail_url, metadata}]

  -- Mentions
  mentions UUID[] DEFAULT '{}', -- User IDs mentioned
  mention_everyone BOOLEAN DEFAULT false, -- @channel or @here

  -- Edit history
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  edit_history JSONB DEFAULT '[]', -- [{content, edited_at}]

  -- Status
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id),

  is_pinned BOOLEAN DEFAULT false,
  pinned_at TIMESTAMPTZ,
  pinned_by UUID REFERENCES auth.users(id),

  -- Metadata
  metadata JSONB DEFAULT '{}', -- For bot messages, integrations, etc.

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. MESSAGE REACTIONS
-- ============================================================================

CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  emoji TEXT NOT NULL, -- Unicode emoji or custom emoji code
  emoji_name TEXT, -- For custom emojis

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, user_id, emoji)
);

-- ============================================================================
-- 5. MESSAGE READ RECEIPTS
-- ============================================================================

CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  read_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(message_id, user_id)
);

-- ============================================================================
-- 6. CUSTOM EMOJIS
-- ============================================================================

CREATE TABLE custom_emojis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  code TEXT NOT NULL, -- :emoji_code:
  image_url TEXT NOT NULL,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, code)
);

-- ============================================================================
-- 7. USER PRESENCE
-- ============================================================================

CREATE TABLE user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Status
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'away', 'dnd', 'offline')),
  status_text TEXT,
  status_emoji TEXT,
  status_expiry TIMESTAMPTZ,

  -- Activity
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  current_channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,

  -- Device info
  device_type TEXT, -- 'desktop', 'mobile', 'web'
  is_mobile BOOLEAN DEFAULT false,

  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 8. VOICE/VIDEO CALLS
-- ============================================================================

CREATE TABLE calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,

  -- Call details
  type TEXT NOT NULL CHECK (type IN ('voice', 'video', 'screen_share')),
  status TEXT DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'missed', 'declined')),

  -- Initiator
  initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Participants
  participants JSONB DEFAULT '[]', -- [{user_id, joined_at, left_at, is_muted, is_video_on, is_screen_sharing}]
  max_participants INTEGER,

  -- LiveKit integration
  livekit_room_id TEXT,
  livekit_token TEXT,

  -- Recording
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration INTEGER, -- seconds

  -- Timing
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration INTEGER, -- seconds

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. CALL PARTICIPANTS (for detailed tracking)
-- ============================================================================

CREATE TABLE call_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'ringing', 'joined', 'left', 'declined', 'missed')),

  -- State
  is_muted BOOLEAN DEFAULT false,
  is_video_on BOOLEAN DEFAULT true,
  is_screen_sharing BOOLEAN DEFAULT false,
  is_speaking BOOLEAN DEFAULT false,

  -- Timing
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,

  UNIQUE(call_id, user_id)
);

-- ============================================================================
-- 10. BOOKMARKED MESSAGES
-- ============================================================================

CREATE TABLE message_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,

  note TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, message_id)
);

-- ============================================================================
-- 11. SCHEDULED MESSAGES
-- ============================================================================

CREATE TABLE scheduled_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',

  scheduled_for TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  sent_at TIMESTAMPTZ,
  sent_message_id UUID REFERENCES messages(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 12. MESSAGE SEARCH INDEX
-- ============================================================================

CREATE TABLE message_search_index (
  message_id UUID PRIMARY KEY REFERENCES messages(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL,
  user_id UUID,

  -- Full-text search
  search_vector tsvector,

  -- Filters
  has_attachments BOOLEAN DEFAULT false,
  has_links BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL
);

-- ============================================================================
-- 13. CHANNEL INTEGRATIONS
-- ============================================================================

CREATE TABLE channel_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- 'webhook', 'bot', 'github', 'jira', 'slack', etc.
  name TEXT NOT NULL,

  -- Configuration
  config JSONB DEFAULT '{}',
  webhook_url TEXT,

  -- Bot user (for bot integrations)
  bot_user_id UUID REFERENCES auth.users(id),

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ,

  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 14. TYPING INDICATORS (ephemeral - use Redis in production)
-- ============================================================================

CREATE TABLE typing_indicators (
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES messages(id) ON DELETE CASCADE,

  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 seconds',

  PRIMARY KEY (channel_id, user_id, COALESCE(thread_id, '00000000-0000-0000-0000-000000000000'))
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Channels
CREATE INDEX idx_channels_organization ON channels(organization_id) WHERE NOT is_archived;
CREATE INDEX idx_channels_type ON channels(organization_id, type) WHERE NOT is_archived;
CREATE INDEX idx_channels_dm ON channels(dm_user_ids) WHERE is_dm;

-- Channel members
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_channel_members_unread ON channel_members(channel_id, user_id) WHERE unread_count > 0;

-- Messages
CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC) WHERE NOT is_deleted;
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at) WHERE thread_id IS NOT NULL AND NOT is_deleted;
CREATE INDEX idx_messages_user ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_pinned ON messages(channel_id) WHERE is_pinned AND NOT is_deleted;
CREATE INDEX idx_messages_mentions ON messages USING gin(mentions) WHERE array_length(mentions, 1) > 0;

-- Reactions
CREATE INDEX idx_reactions_message ON message_reactions(message_id);

-- Search
CREATE INDEX idx_message_search ON message_search_index USING gin(search_vector);
CREATE INDEX idx_message_search_channel ON message_search_index(channel_id, created_at DESC);

-- Presence
CREATE INDEX idx_presence_status ON user_presence(status) WHERE status != 'offline';

-- Calls
CREATE INDEX idx_calls_channel ON calls(channel_id, created_at DESC);
CREATE INDEX idx_calls_active ON calls(channel_id) WHERE status = 'active';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_emojis ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_integrations ENABLE ROW LEVEL SECURITY;

-- Channels: Members can view channels they're part of
CREATE POLICY "Users can view channels they're members of" ON channels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
    OR (type = 'public' AND NOT is_archived)
  );

CREATE POLICY "Users can create channels in their org" ON channels
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = channels.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel owners/admins can update" ON channels
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
      AND channel_members.role IN ('owner', 'admin')
    )
  );

-- Channel members
CREATE POLICY "Users can view members of their channels" ON channel_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members cm
      WHERE cm.channel_id = channel_members.channel_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join public channels" ON channel_members
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_members.channel_id
      AND channels.type = 'public'
    )
  );

CREATE POLICY "Users can leave channels" ON channel_members
  FOR DELETE USING (user_id = auth.uid());

-- Messages
CREATE POLICY "Users can view messages in their channels" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their channels" ON messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages" ON messages
  FOR UPDATE USING (user_id = auth.uid());

-- Reactions
CREATE POLICY "Users can view reactions in their channels" ON message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = message_reactions.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- User presence
CREATE POLICY "Users can view presence" ON user_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update own presence" ON user_presence
  FOR ALL USING (user_id = auth.uid());

-- Calls
CREATE POLICY "Users can view calls in their channels" ON calls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = calls.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

-- Bookmarks
CREATE POLICY "Users can manage their bookmarks" ON message_bookmarks
  FOR ALL USING (user_id = auth.uid());

-- Scheduled messages
CREATE POLICY "Users can manage their scheduled messages" ON scheduled_messages
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update channel stats when a message is sent
CREATE OR REPLACE FUNCTION update_channel_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels
    SET
      message_count = message_count + 1,
      last_message_at = NEW.created_at,
      updated_at = NOW()
    WHERE id = NEW.channel_id;

    -- Update unread counts for all members except sender
    UPDATE channel_members
    SET unread_count = unread_count + 1
    WHERE channel_id = NEW.channel_id
    AND user_id != NEW.user_id;

    -- Update unread mentions
    IF array_length(NEW.mentions, 1) > 0 THEN
      UPDATE channel_members
      SET unread_mentions = unread_mentions + 1
      WHERE channel_id = NEW.channel_id
      AND user_id = ANY(NEW.mentions);
    END IF;

    -- Update thread stats if this is a reply
    IF NEW.thread_id IS NOT NULL THEN
      UPDATE messages
      SET
        reply_count = reply_count + 1,
        last_reply_at = NEW.created_at,
        thread_participants = array_append(
          CASE WHEN NEW.user_id = ANY(thread_participants)
               THEN thread_participants
               ELSE thread_participants
          END,
          NEW.user_id
        )
      WHERE id = NEW.thread_id
      AND NOT NEW.user_id = ANY(thread_participants);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_channel_stats
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_channel_stats();

-- Function to update member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels SET member_count = member_count + 1 WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels SET member_count = member_count - 1 WHERE id = OLD.channel_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_channel_member_count
AFTER INSERT OR DELETE ON channel_members
FOR EACH ROW EXECUTE FUNCTION update_channel_member_count();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_channel_read(p_channel_id UUID, p_user_id UUID, p_message_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE channel_members
  SET
    last_read_at = NOW(),
    last_read_message_id = p_message_id,
    unread_count = 0,
    unread_mentions = 0
  WHERE channel_id = p_channel_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create direct message channel
CREATE OR REPLACE FUNCTION get_or_create_dm_channel(p_user_ids UUID[])
RETURNS UUID AS $$
DECLARE
  v_channel_id UUID;
  v_sorted_ids UUID[];
BEGIN
  -- Sort user IDs for consistent lookup
  v_sorted_ids := (SELECT array_agg(id ORDER BY id) FROM unnest(p_user_ids) AS id);

  -- Check if DM channel already exists
  SELECT id INTO v_channel_id
  FROM channels
  WHERE is_dm = true AND dm_user_ids = v_sorted_ids;

  IF v_channel_id IS NULL THEN
    -- Create new DM channel
    INSERT INTO channels (name, slug, type, is_dm, dm_user_ids, created_by)
    VALUES (
      'Direct Message',
      'dm-' || gen_random_uuid(),
      'direct',
      true,
      v_sorted_ids,
      p_user_ids[1]
    )
    RETURNING id INTO v_channel_id;

    -- Add all users as members
    INSERT INTO channel_members (channel_id, user_id, role)
    SELECT v_channel_id, unnest(p_user_ids), 'member';
  END IF;

  RETURN v_channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search messages
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_channel_id UUID DEFAULT NULL,
  p_from_user_id UUID DEFAULT NULL,
  p_has_attachments BOOLEAN DEFAULT NULL,
  p_has_links BOOLEAN DEFAULT NULL,
  p_date_from TIMESTAMPTZ DEFAULT NULL,
  p_date_to TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  channel_id UUID,
  channel_name TEXT,
  user_id UUID,
  user_name TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.channel_id,
    c.name AS channel_name,
    m.user_id,
    u.raw_user_meta_data->>'name' AS user_name,
    m.content,
    m.created_at,
    ts_rank(msi.search_vector, websearch_to_tsquery('english', p_query)) AS rank
  FROM messages m
  JOIN message_search_index msi ON msi.message_id = m.id
  JOIN channels c ON c.id = m.channel_id
  JOIN auth.users u ON u.id = m.user_id
  JOIN channel_members cm ON cm.channel_id = m.channel_id AND cm.user_id = p_user_id
  WHERE
    msi.search_vector @@ websearch_to_tsquery('english', p_query)
    AND NOT m.is_deleted
    AND (p_channel_id IS NULL OR m.channel_id = p_channel_id)
    AND (p_from_user_id IS NULL OR m.user_id = p_from_user_id)
    AND (p_has_attachments IS NULL OR msi.has_attachments = p_has_attachments)
    AND (p_has_links IS NULL OR msi.has_links = p_has_links)
    AND (p_date_from IS NULL OR m.created_at >= p_date_from)
    AND (p_date_to IS NULL OR m.created_at <= p_date_to)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update search index
CREATE OR REPLACE FUNCTION update_message_search_index()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO message_search_index (
    message_id,
    channel_id,
    user_id,
    search_vector,
    has_attachments,
    has_links,
    is_pinned,
    created_at
  ) VALUES (
    NEW.id,
    NEW.channel_id,
    NEW.user_id,
    to_tsvector('english', NEW.content),
    jsonb_array_length(NEW.attachments) > 0,
    NEW.content ~ 'https?://[^\s]+',
    NEW.is_pinned,
    NEW.created_at
  )
  ON CONFLICT (message_id) DO UPDATE SET
    search_vector = to_tsvector('english', NEW.content),
    has_attachments = jsonb_array_length(NEW.attachments) > 0,
    has_links = NEW.content ~ 'https?://[^\s]+',
    is_pinned = NEW.is_pinned;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_search
AFTER INSERT OR UPDATE ON messages
FOR EACH ROW EXECUTE FUNCTION update_message_search_index();

-- Function to get channel with unread counts
CREATE OR REPLACE FUNCTION get_user_channels(p_user_id UUID)
RETURNS TABLE (
  channel_id UUID,
  channel_name TEXT,
  channel_type TEXT,
  is_dm BOOLEAN,
  unread_count INTEGER,
  unread_mentions INTEGER,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  member_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS channel_id,
    c.name AS channel_name,
    c.type AS channel_type,
    c.is_dm,
    COALESCE(cm.unread_count, 0) AS unread_count,
    COALESCE(cm.unread_mentions, 0) AS unread_mentions,
    c.last_message_at,
    (
      SELECT left(m.content, 100)
      FROM messages m
      WHERE m.channel_id = c.id AND NOT m.is_deleted
      ORDER BY m.created_at DESC
      LIMIT 1
    ) AS last_message_preview,
    c.member_count
  FROM channels c
  JOIN channel_members cm ON cm.channel_id = c.id AND cm.user_id = p_user_id
  WHERE NOT c.is_archived
  ORDER BY
    cm.is_pinned DESC,
    c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DEFAULT DATA
-- ============================================================================

-- Create a default #general channel for organizations
CREATE OR REPLACE FUNCTION create_default_channel_for_org()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO channels (organization_id, name, slug, description, type, is_general, created_by)
  VALUES (
    NEW.id,
    'general',
    'general',
    'General discussion for the organization',
    'public',
    true,
    NEW.created_by
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger assumes an organizations table exists
-- CREATE TRIGGER trigger_create_default_channel
-- AFTER INSERT ON organizations
-- FOR EACH ROW EXECUTE FUNCTION create_default_channel_for_org();

-- ============================================================================
-- CLEANUP FUNCTION
-- ============================================================================

-- Clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM typing_indicators WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-typing', '*/1 * * * *', 'SELECT cleanup_typing_indicators()');
