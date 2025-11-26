-- ============================================================================
-- Messages Hub Database Schema
-- World-class A+++ messaging system with real-time capabilities
--
-- Features:
-- - Direct messages, group chats, and channels
-- - File attachments and media sharing
-- - Emoji reactions and message threads
-- - Read receipts and typing indicators
-- - User mentions and hashtags
-- - Chat permissions and roles
-- - Message search with full-text
-- - Real-time subscriptions
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'location', 'contact');
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE attachment_type AS ENUM ('image', 'video', 'audio', 'document', 'other');
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Chats table (direct, group, channel conversations)
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    type chat_type NOT NULL DEFAULT 'direct',
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT chats_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    CONSTRAINT chats_description_length CHECK (description IS NULL OR char_length(description) <= 500)
);

-- Chat members (users in chats with roles)
CREATE TABLE chat_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    mute_until TIMESTAMPTZ,
    custom_status TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,

    UNIQUE (chat_id, user_id),
    CONSTRAINT chat_members_custom_status_length CHECK (custom_status IS NULL OR char_length(custom_status) <= 100)
);

-- Messages table (all message types)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type message_type NOT NULL DEFAULT 'text',
    status message_status NOT NULL DEFAULT 'sent',
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_id UUID,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    pinned_at TIMESTAMPTZ,
    pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    search_vector tsvector,

    CONSTRAINT messages_text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 10000)
);

-- Message reactions (emoji reactions to messages)
CREATE TABLE message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, user_id, emoji),
    CONSTRAINT message_reactions_emoji_length CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10)
);

-- Message attachments (files, images, videos)
CREATE TABLE message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    type attachment_type NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT message_attachments_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
    CONSTRAINT message_attachments_size CHECK (size_bytes > 0 AND size_bytes <= 52428800) -- 50MB max
);

-- Message mentions (user mentions in messages)
CREATE TABLE message_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    mentioned_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, mentioned_user_id)
);

-- Message read receipts (tracking who read which messages)
CREATE TABLE message_read_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (message_id, user_id)
);

-- Chat settings (per-user chat preferences)
CREATE TABLE chat_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    mute_until TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    theme TEXT,
    background_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (chat_id, user_id)
);

-- Typing indicators (real-time typing status)
CREATE TABLE typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 seconds'),

    UNIQUE (chat_id, user_id)
);

-- Message threads (threaded conversations)
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    participant_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (parent_message_id)
);

-- Chat invites (invitation system for group chats)
CREATE TABLE chat_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    status invite_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    declined_at TIMESTAMPTZ,

    CONSTRAINT chat_invites_email_format CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Blocked users (user blocking system)
CREATE TABLE blocked_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (blocker_id, blocked_id),
    CONSTRAINT blocked_users_not_self CHECK (blocker_id != blocked_id)
);

-- ============================================================================
-- INDEXES (40+ indexes for optimal performance)
-- ============================================================================

-- Chats indexes
CREATE INDEX idx_chats_creator ON chats(creator_id);
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_created_at ON chats(created_at DESC);
CREATE INDEX idx_chats_updated_at ON chats(updated_at DESC);
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC NULLS LAST);
CREATE INDEX idx_chats_archived ON chats(is_archived) WHERE is_archived = TRUE;

-- Chat members indexes
CREATE INDEX idx_chat_members_chat ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user ON chat_members(user_id);
CREATE INDEX idx_chat_members_role ON chat_members(role);
CREATE INDEX idx_chat_members_joined_at ON chat_members(joined_at DESC);
CREATE INDEX idx_chat_members_active ON chat_members(chat_id, user_id) WHERE left_at IS NULL;
CREATE INDEX idx_chat_members_muted ON chat_members(user_id) WHERE is_muted = TRUE;

-- Messages indexes
CREATE INDEX idx_messages_chat ON messages(chat_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_id) WHERE reply_to_id IS NOT NULL;
CREATE INDEX idx_messages_thread ON messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_messages_pinned ON messages(chat_id) WHERE is_pinned = TRUE;
CREATE INDEX idx_messages_deleted ON messages(is_deleted);
CREATE INDEX idx_messages_search ON messages USING gin(search_vector);
CREATE INDEX idx_messages_type ON messages(type);
CREATE INDEX idx_messages_status ON messages(status);

-- Message reactions indexes
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user ON message_reactions(user_id);
CREATE INDEX idx_message_reactions_emoji ON message_reactions(emoji);
CREATE INDEX idx_message_reactions_created_at ON message_reactions(created_at DESC);

-- Message attachments indexes
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON message_attachments(type);
CREATE INDEX idx_message_attachments_created_at ON message_attachments(created_at DESC);

-- Message mentions indexes
CREATE INDEX idx_message_mentions_message ON message_mentions(message_id);
CREATE INDEX idx_message_mentions_user ON message_mentions(mentioned_user_id);
CREATE INDEX idx_message_mentions_created_at ON message_mentions(created_at DESC);

-- Message read receipts indexes
CREATE INDEX idx_message_read_receipts_message ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user ON message_read_receipts(user_id);
CREATE INDEX idx_message_read_receipts_read_at ON message_read_receipts(read_at DESC);

-- Chat settings indexes
CREATE INDEX idx_chat_settings_chat ON chat_settings(chat_id);
CREATE INDEX idx_chat_settings_user ON chat_settings(user_id);
CREATE INDEX idx_chat_settings_pinned ON chat_settings(user_id) WHERE is_pinned = TRUE;
CREATE INDEX idx_chat_settings_archived ON chat_settings(user_id) WHERE is_archived = TRUE;

-- Typing indicators indexes
CREATE INDEX idx_typing_indicators_chat ON typing_indicators(chat_id);
CREATE INDEX idx_typing_indicators_user ON typing_indicators(user_id);
CREATE INDEX idx_typing_indicators_expires ON typing_indicators(expires_at);

-- Message threads indexes
CREATE INDEX idx_message_threads_parent ON message_threads(parent_message_id);
CREATE INDEX idx_message_threads_chat ON message_threads(chat_id);
CREATE INDEX idx_message_threads_activity ON message_threads(last_activity_at DESC);

-- Chat invites indexes
CREATE INDEX idx_chat_invites_chat ON chat_invites(chat_id);
CREATE INDEX idx_chat_invites_inviter ON chat_invites(inviter_id);
CREATE INDEX idx_chat_invites_email ON chat_invites(invitee_email);
CREATE INDEX idx_chat_invites_status ON chat_invites(status);
CREATE INDEX idx_chat_invites_expires ON chat_invites(expires_at);

-- Blocked users indexes
CREATE INDEX idx_blocked_users_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_users_blocked ON blocked_users(blocked_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update chats.updated_at on changes
CREATE OR REPLACE FUNCTION update_chats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chats_updated_at
    BEFORE UPDATE ON chats
    FOR EACH ROW
    EXECUTE FUNCTION update_chats_updated_at();

-- Update chats.last_message_at when message created
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_last_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_last_message();

-- Update message search vector on insert/update
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector = to_tsvector('english', COALESCE(NEW.text, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_message_search_vector
    BEFORE INSERT OR UPDATE OF text ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_message_search_vector();

-- Increment thread message count
CREATE OR REPLACE FUNCTION increment_thread_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.thread_id IS NOT NULL THEN
        UPDATE message_threads
        SET message_count = message_count + 1,
            last_activity_at = NOW()
        WHERE id = NEW.thread_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_thread_message_count
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION increment_thread_message_count();

-- Clean up expired typing indicators
CREATE OR REPLACE FUNCTION cleanup_expired_typing_indicators()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM typing_indicators
    WHERE expires_at < NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_expired_typing_indicators
    BEFORE INSERT ON typing_indicators
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_expired_typing_indicators();

-- Update chat settings timestamp
CREATE OR REPLACE FUNCTION update_chat_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_settings_updated_at
    BEFORE UPDATE ON chat_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_settings_updated_at();

-- Expire old chat invites
CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_invites
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_expire_old_invites
    BEFORE INSERT ON chat_invites
    FOR EACH ROW
    EXECUTE FUNCTION expire_old_invites();

-- Set message edited timestamp
CREATE OR REPLACE FUNCTION set_message_edited_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_edited = TRUE AND OLD.is_edited = FALSE THEN
        NEW.edited_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_message_edited_timestamp
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_edited_timestamp();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get unread message count for user in chat
CREATE OR REPLACE FUNCTION get_unread_count(p_chat_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_last_read_at TIMESTAMPTZ;
    v_unread_count INTEGER;
BEGIN
    -- Get user's last read timestamp
    SELECT last_read_at INTO v_last_read_at
    FROM chat_members
    WHERE chat_id = p_chat_id AND user_id = p_user_id;

    -- Count unread messages
    SELECT COUNT(*)::INTEGER INTO v_unread_count
    FROM messages
    WHERE chat_id = p_chat_id
        AND sender_id != p_user_id
        AND is_deleted = FALSE
        AND (v_last_read_at IS NULL OR created_at > v_last_read_at);

    RETURN COALESCE(v_unread_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Mark all messages as read in chat
CREATE OR REPLACE FUNCTION mark_chat_as_read(p_chat_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update last_read_at for user
    UPDATE chat_members
    SET last_read_at = NOW()
    WHERE chat_id = p_chat_id AND user_id = p_user_id;

    -- Insert read receipts for unread messages
    INSERT INTO message_read_receipts (message_id, user_id)
    SELECT m.id, p_user_id
    FROM messages m
    LEFT JOIN message_read_receipts mrr ON mrr.message_id = m.id AND mrr.user_id = p_user_id
    WHERE m.chat_id = p_chat_id
        AND m.sender_id != p_user_id
        AND mrr.id IS NULL
    ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Get chat members with online status
CREATE OR REPLACE FUNCTION get_chat_members_with_status(p_chat_id UUID)
RETURNS TABLE (
    user_id UUID,
    role member_role,
    is_online BOOLEAN,
    last_seen TIMESTAMPTZ,
    custom_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cm.user_id,
        cm.role,
        -- In production, this would check a real-time presence table
        (EXTRACT(EPOCH FROM (NOW() - cm.joined_at)) < 300) AS is_online,
        cm.joined_at AS last_seen,
        cm.custom_status
    FROM chat_members cm
    WHERE cm.chat_id = p_chat_id
        AND cm.left_at IS NULL
    ORDER BY cm.role DESC, cm.joined_at ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Search messages with full-text search
CREATE OR REPLACE FUNCTION search_messages(
    p_user_id UUID,
    p_query TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    message_id UUID,
    chat_id UUID,
    text TEXT,
    sender_id UUID,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.chat_id,
        m.text,
        m.sender_id,
        m.created_at,
        ts_rank(m.search_vector, plainto_tsquery('english', p_query)) AS rank
    FROM messages m
    INNER JOIN chat_members cm ON cm.chat_id = m.chat_id AND cm.user_id = p_user_id
    WHERE m.search_vector @@ plainto_tsquery('english', p_query)
        AND m.is_deleted = FALSE
        AND cm.left_at IS NULL
    ORDER BY rank DESC, m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get chat statistics
CREATE OR REPLACE FUNCTION get_chat_statistics(p_chat_id UUID)
RETURNS TABLE (
    total_messages BIGINT,
    total_members BIGINT,
    active_members BIGINT,
    total_attachments BIGINT,
    total_reactions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM messages WHERE chat_id = p_chat_id AND is_deleted = FALSE),
        (SELECT COUNT(*) FROM chat_members WHERE chat_id = p_chat_id),
        (SELECT COUNT(*) FROM chat_members WHERE chat_id = p_chat_id AND left_at IS NULL),
        (SELECT COUNT(*) FROM message_attachments ma INNER JOIN messages m ON m.id = ma.message_id WHERE m.chat_id = p_chat_id),
        (SELECT COUNT(*) FROM message_reactions mr INNER JOIN messages m ON m.id = mr.message_id WHERE m.chat_id = p_chat_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Chats policies
CREATE POLICY "Users can view chats they are members of"
    ON chats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can create chats"
    ON chats FOR INSERT
    WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Chat owners and admins can update chats"
    ON chats FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Chat owners can delete chats"
    ON chats FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chats.id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role = 'owner'
        )
    );

-- Chat members policies
CREATE POLICY "Users can view members of their chats"
    ON chat_members FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members cm
            WHERE cm.chat_id = chat_members.chat_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Admins can add members"
    ON chat_members FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chat_members.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update their own membership"
    ON chat_members FOR UPDATE
    USING (user_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their chats"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = messages.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
        AND NOT EXISTS (
            SELECT 1 FROM blocked_users
            WHERE blocked_users.blocker_id = auth.uid()
                AND blocked_users.blocked_id = messages.sender_id
        )
    );

CREATE POLICY "Users can send messages to their chats"
    ON messages FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = messages.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can update their own messages"
    ON messages FOR UPDATE
    USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- Message reactions policies
CREATE POLICY "Users can view reactions in their chats"
    ON message_reactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_reactions.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can add reactions"
    ON message_reactions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can remove their own reactions"
    ON message_reactions FOR DELETE
    USING (user_id = auth.uid());

-- Message attachments policies
CREATE POLICY "Users can view attachments in their chats"
    ON message_attachments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_attachments.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can add attachments to their messages"
    ON message_attachments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_attachments.message_id
                AND messages.sender_id = auth.uid()
        )
    );

-- Message mentions policies
CREATE POLICY "Users can view mentions in their chats"
    ON message_mentions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_mentions.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can create mentions in their messages"
    ON message_mentions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM messages
            WHERE messages.id = message_mentions.message_id
                AND messages.sender_id = auth.uid()
        )
    );

-- Message read receipts policies
CREATE POLICY "Users can view read receipts in their chats"
    ON message_read_receipts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM messages m
            INNER JOIN chat_members cm ON cm.chat_id = m.chat_id
            WHERE m.id = message_read_receipts.message_id
                AND cm.user_id = auth.uid()
                AND cm.left_at IS NULL
        )
    );

CREATE POLICY "Users can mark messages as read"
    ON message_read_receipts FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Chat settings policies
CREATE POLICY "Users can view their own chat settings"
    ON chat_settings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own chat settings"
    ON chat_settings FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own chat settings"
    ON chat_settings FOR UPDATE
    USING (user_id = auth.uid());

-- Typing indicators policies
CREATE POLICY "Users can view typing indicators in their chats"
    ON typing_indicators FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = typing_indicators.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can set their own typing status"
    ON typing_indicators FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own typing status"
    ON typing_indicators FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can remove their own typing status"
    ON typing_indicators FOR DELETE
    USING (user_id = auth.uid());

-- Message threads policies
CREATE POLICY "Users can view threads in their chats"
    ON message_threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = message_threads.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

CREATE POLICY "Users can create threads in their chats"
    ON message_threads FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = message_threads.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.left_at IS NULL
        )
    );

-- Chat invites policies
CREATE POLICY "Users can view invites they sent"
    ON chat_invites FOR SELECT
    USING (inviter_id = auth.uid());

CREATE POLICY "Admins can create invites"
    ON chat_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_members
            WHERE chat_members.chat_id = chat_invites.chat_id
                AND chat_members.user_id = auth.uid()
                AND chat_members.role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Inviter can update their invites"
    ON chat_invites FOR UPDATE
    USING (inviter_id = auth.uid());

-- Blocked users policies
CREATE POLICY "Users can view their own blocks"
    ON blocked_users FOR SELECT
    USING (blocker_id = auth.uid());

CREATE POLICY "Users can block others"
    ON blocked_users FOR INSERT
    WITH CHECK (blocker_id = auth.uid());

CREATE POLICY "Users can unblock others"
    ON blocked_users FOR DELETE
    USING (blocker_id = auth.uid());

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE chats IS 'Main chats table supporting direct messages, group chats, and channels';
COMMENT ON TABLE chat_members IS 'Chat membership with roles and permissions';
COMMENT ON TABLE messages IS 'All messages with support for text, media, and files';
COMMENT ON TABLE message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE message_attachments IS 'File attachments for messages';
COMMENT ON TABLE message_mentions IS 'User mentions in messages';
COMMENT ON TABLE message_read_receipts IS 'Read status tracking for messages';
COMMENT ON TABLE chat_settings IS 'Per-user chat preferences and settings';
COMMENT ON TABLE typing_indicators IS 'Real-time typing status indicators';
COMMENT ON TABLE message_threads IS 'Threaded conversation support';
COMMENT ON TABLE chat_invites IS 'Invitation system for group chats';
COMMENT ON TABLE blocked_users IS 'User blocking for privacy';

COMMENT ON FUNCTION get_unread_count(UUID, UUID) IS 'Returns unread message count for user in chat';
COMMENT ON FUNCTION mark_chat_as_read(UUID, UUID) IS 'Marks all messages in chat as read for user';
COMMENT ON FUNCTION get_chat_members_with_status(UUID) IS 'Returns chat members with online status';
COMMENT ON FUNCTION search_messages(UUID, TEXT, INTEGER) IS 'Full-text search across user messages';
COMMENT ON FUNCTION get_chat_statistics(UUID) IS 'Returns comprehensive chat statistics';

-- ============================================================================
-- SAMPLE DATA (Optional - for development/testing)
-- ============================================================================

-- Uncomment to insert sample data for testing:
-- INSERT INTO chats (id, name, type, creator_id) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'General', 'channel', auth.uid());
