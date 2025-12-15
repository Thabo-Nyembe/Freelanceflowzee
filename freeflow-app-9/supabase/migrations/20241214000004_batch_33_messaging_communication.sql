-- =====================================================
-- Batch 33: Messaging & Communication Migration
-- Created: December 14, 2024
-- Tables: messages, notifications, chat
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- MESSAGES TABLE
-- Direct messaging between users
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Message Details
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  recipient_id UUID NOT NULL REFERENCES auth.users(id),
  thread_id UUID,
  parent_message_id UUID REFERENCES messages(id),

  -- Content
  subject VARCHAR(500),
  body TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'direct'
    CHECK (message_type IN ('direct', 'group', 'broadcast', 'system', 'automated')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'sent'
    CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'archived', 'deleted', 'failed')),

  -- Priority
  priority VARCHAR(20) NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

  -- Tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Attachments & Media
  attachments JSONB DEFAULT '[]'::jsonb,
  has_attachments BOOLEAN DEFAULT FALSE,
  attachment_count INTEGER DEFAULT 0,

  -- Features
  is_pinned BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,

  -- Reply & Forward
  reply_to_message_id UUID REFERENCES messages(id),
  forwarded_from_message_id UUID REFERENCES messages(id),
  is_forwarded BOOLEAN DEFAULT FALSE,

  -- Labels & Categories
  labels JSONB DEFAULT '[]'::jsonb,
  category VARCHAR(100),
  folder VARCHAR(100) DEFAULT 'inbox',

  -- Recipients (for group messages)
  recipients JSONB DEFAULT '[]'::jsonb,
  cc_recipients JSONB DEFAULT '[]'::jsonb,
  bcc_recipients JSONB DEFAULT '[]'::jsonb,

  -- Reactions & Engagement
  reactions JSONB DEFAULT '{}'::jsonb,
  reaction_count INTEGER DEFAULT 0,

  -- Encryption & Security
  is_encrypted BOOLEAN DEFAULT FALSE,
  encryption_key_id VARCHAR(255),

  -- Scheduled Messages
  scheduled_for TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT FALSE,

  -- Auto-expire
  expires_at TIMESTAMPTZ,
  auto_delete_after_days INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  ip_address VARCHAR(45),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- System notifications and alerts
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Notification Details
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  notification_type VARCHAR(50) NOT NULL DEFAULT 'info'
    CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'system', 'user', 'task', 'message', 'reminder', 'alert')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'unread'
    CHECK (status IN ('unread', 'read', 'dismissed', 'archived', 'deleted')),

  -- Priority
  priority VARCHAR(20) NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),

  -- Tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,

  -- Action & Link
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  action_type VARCHAR(50),
  related_entity_type VARCHAR(100),
  related_entity_id UUID,

  -- Display Settings
  icon VARCHAR(100),
  color VARCHAR(50),
  badge VARCHAR(50),
  image_url VARCHAR(500),

  -- Delivery Channels
  send_email BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  send_push BOOLEAN DEFAULT FALSE,
  push_sent_at TIMESTAMPTZ,
  send_sms BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ,
  send_in_app BOOLEAN DEFAULT TRUE,

  -- Grouping
  group_key VARCHAR(255),
  is_grouped BOOLEAN DEFAULT FALSE,

  -- Expiry
  expires_at TIMESTAMPTZ,
  auto_delete_after_days INTEGER DEFAULT 30,

  -- User Preferences
  is_silent BOOLEAN DEFAULT FALSE,
  requires_action BOOLEAN DEFAULT FALSE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- CHAT TABLE
-- Real-time chat messages
-- =====================================================

CREATE TABLE IF NOT EXISTS chat (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Chat Room/Thread
  room_id UUID NOT NULL,
  room_name VARCHAR(255),
  room_type VARCHAR(50) NOT NULL DEFAULT 'direct'
    CHECK (room_type IN ('direct', 'group', 'channel', 'team', 'support', 'public', 'private')),

  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(255),
  sender_avatar VARCHAR(500),

  -- Message Content
  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'link', 'code', 'system', 'deleted')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed', 'deleted', 'edited')),

  -- Tracking
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  read_by JSONB DEFAULT '[]'::jsonb,
  delivered_to JSONB DEFAULT '[]'::jsonb,

  -- Attachments & Media
  attachments JSONB DEFAULT '[]'::jsonb,
  media_url VARCHAR(500),
  media_type VARCHAR(50),
  file_size INTEGER,
  thumbnail_url VARCHAR(500),

  -- Reply & Thread
  reply_to_message_id UUID REFERENCES chat(id),
  is_reply BOOLEAN DEFAULT FALSE,
  thread_message_count INTEGER DEFAULT 0,

  -- Reactions & Engagement
  reactions JSONB DEFAULT '{}'::jsonb,
  reaction_count INTEGER DEFAULT 0,
  mentioned_users JSONB DEFAULT '[]'::jsonb,
  has_mentions BOOLEAN DEFAULT FALSE,

  -- Editing
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  edit_history JSONB DEFAULT '[]'::jsonb,

  -- Features
  is_pinned BOOLEAN DEFAULT FALSE,
  is_important BOOLEAN DEFAULT FALSE,
  is_system_message BOOLEAN DEFAULT FALSE,

  -- Formatting
  is_formatted BOOLEAN DEFAULT FALSE,
  formatting JSONB DEFAULT '{}'::jsonb,

  -- Auto-delete
  is_ephemeral BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  auto_delete_after_seconds INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  client_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Messages Indexes
CREATE INDEX idx_messages_user_id ON messages(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_sender_id ON messages(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_thread_id ON messages(thread_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_status ON messages(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created ON messages(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_is_read ON messages(is_read) WHERE deleted_at IS NULL;

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_status ON notifications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_type ON notifications(notification_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_priority ON notifications(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_notifications_group_key ON notifications(group_key) WHERE group_key IS NOT NULL;

-- Chat Indexes
CREATE INDEX idx_chat_user_id ON chat(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_room_id ON chat(room_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_sender_id ON chat(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_created ON chat(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_is_read ON chat(is_read) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_reply_to ON chat(reply_to_message_id) WHERE reply_to_message_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Policies
CREATE POLICY "Users can view chat in their rooms"
  ON chat FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages"
  ON chat FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own chat messages"
  ON chat FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat messages"
  ON chat FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for auto-updating timestamps
-- =====================================================

-- Messages Trigger
CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Notifications Trigger
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Chat Trigger
CREATE TRIGGER update_chat_updated_at
  BEFORE UPDATE ON chat
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- Enable real-time for all tables
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE chat;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
