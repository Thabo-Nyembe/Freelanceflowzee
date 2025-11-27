-- Minimal Messages Schema for Messages Hub Page

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS message_read_receipts CASCADE;
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS message_attachments CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_members CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TYPE IF EXISTS chat_type CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;

-- ENUMs
CREATE TYPE chat_type AS ENUM ('direct', 'group', 'channel');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'voice', 'video', 'location', 'contact');
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member');

-- Chats Table (direct, group, channel conversations)
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  type chat_type NOT NULL DEFAULT 'direct',

  is_pinned BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  last_message_at TIMESTAMPTZ,
  unread_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chat Members Table (users in chats with roles)
CREATE TABLE chat_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role member_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,

  UNIQUE (chat_id, user_id)
);

-- Messages Table (all message types)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  text TEXT NOT NULL,
  type message_type NOT NULL DEFAULT 'text',
  status message_status NOT NULL DEFAULT 'sent',

  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT messages_text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 10000)
);

-- Message Reactions Table (emoji reactions to messages)
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (message_id, user_id, emoji)
);

-- Message Attachments Table (files, images, videos)
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,

  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT message_attachments_size CHECK (size_bytes > 0 AND size_bytes <= 52428800)
);

-- Message Read Receipts Table (tracking who read which messages)
CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (message_id, user_id)
);

-- Indexes for Chats
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_type ON chats(type);
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);
CREATE INDEX idx_chats_user_pinned ON chats(user_id, is_pinned);
CREATE INDEX idx_chats_user_archived ON chats(user_id, is_archived);

-- Indexes for Chat Members
CREATE INDEX idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX idx_chat_members_user_id ON chat_members(user_id);

-- Indexes for Messages
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON messages(reply_to_id);

-- Indexes for Reactions
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);

-- Indexes for Attachments
CREATE INDEX idx_message_attachments_message_id ON message_attachments(message_id);
CREATE INDEX idx_message_attachments_type ON message_attachments(type);

-- Indexes for Read Receipts
CREATE INDEX idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON message_read_receipts(user_id);
