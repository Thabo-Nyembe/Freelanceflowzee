-- Batch 39: Communication & Broadcasting
-- Tables: chat, announcements, broadcasts
-- Created: December 14, 2024

-- ================================================
-- CHAT TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Message Details
  message_type VARCHAR(50) NOT NULL DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'link', 'code', 'poll', 'system', 'reply', 'forward')),
  content TEXT NOT NULL,
  content_html TEXT,
  plain_text TEXT,

  -- Conversation Context
  conversation_id UUID,
  channel_id UUID,
  thread_id UUID,
  parent_message_id UUID REFERENCES chat(id),
  is_thread_starter BOOLEAN DEFAULT false,
  thread_replies_count INTEGER DEFAULT 0,

  -- Sender & Recipient
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(300),
  sender_avatar TEXT,
  recipient_id UUID REFERENCES auth.users(id),
  recipient_name VARCHAR(300),

  -- Group Chat
  is_group_message BOOLEAN DEFAULT false,
  group_id UUID,
  group_name VARCHAR(300),
  participant_ids TEXT[],
  participant_count INTEGER DEFAULT 0,

  -- Message Status
  status VARCHAR(50) NOT NULL DEFAULT 'sent'
    CHECK (status IN ('draft', 'sending', 'sent', 'delivered', 'read', 'failed', 'deleted', 'edited')),
  is_read BOOLEAN DEFAULT false,
  is_delivered BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Read Tracking
  read_at TIMESTAMPTZ,
  read_by TEXT[],
  delivered_at TIMESTAMPTZ,
  delivered_to TEXT[],

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  attachment_count INTEGER DEFAULT 0,
  file_urls TEXT[],

  -- Rich Content
  mentions TEXT[],
  hashtags TEXT[],
  links TEXT[],
  emojis TEXT[],
  reactions JSONB DEFAULT '[]'::jsonb,
  reaction_count INTEGER DEFAULT 0,

  -- Editing History
  edited_at TIMESTAMPTZ,
  edit_count INTEGER DEFAULT 0,
  edit_history JSONB DEFAULT '[]'::jsonb,
  original_content TEXT,

  -- Formatting
  is_formatted BOOLEAN DEFAULT false,
  formatting_type VARCHAR(50),
  text_format JSONB DEFAULT '{}'::jsonb,

  -- Priority & Urgency
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_urgent BOOLEAN DEFAULT false,
  requires_response BOOLEAN DEFAULT false,
  response_deadline TIMESTAMPTZ,

  -- Encryption
  is_encrypted BOOLEAN DEFAULT false,
  encryption_type VARCHAR(50),
  encryption_key VARCHAR(500),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  push_sent BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,

  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flagged_at TIMESTAMPTZ,
  flagged_by UUID REFERENCES auth.users(id),
  flag_reason TEXT,
  is_spam BOOLEAN DEFAULT false,
  moderation_status VARCHAR(50),

  -- Reply To
  reply_to_message_id UUID REFERENCES chat(id),
  reply_to_content TEXT,
  reply_to_sender VARCHAR(300),

  -- Forward Info
  is_forwarded BOOLEAN DEFAULT false,
  forwarded_from VARCHAR(300),
  forward_count INTEGER DEFAULT 0,

  -- Expiration
  expires_at TIMESTAMPTZ,
  is_ephemeral BOOLEAN DEFAULT false,
  auto_delete_after INTEGER,

  -- Location
  location JSONB DEFAULT '{}'::jsonb,
  has_location BOOLEAN DEFAULT false,

  -- Voice/Video
  duration_seconds INTEGER,
  call_id UUID,
  call_type VARCHAR(50),

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT chat_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT chat_sender_id_idx CHECK (sender_id IS NOT NULL)
);

CREATE INDEX idx_chat_user_id ON chat(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_sender_id ON chat(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_recipient_id ON chat(recipient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_conversation ON chat(conversation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_channel ON chat(channel_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_status ON chat(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_chat_created_at ON chat(created_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own chat messages" ON chat FOR SELECT USING (auth.uid() = user_id OR auth.uid() = sender_id OR auth.uid() = recipient_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own chat messages" ON chat FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = sender_id);
CREATE POLICY "Users can update own chat messages" ON chat FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = sender_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own chat messages" ON chat FOR DELETE USING (auth.uid() = user_id OR auth.uid() = sender_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat;

-- ================================================
-- ANNOUNCEMENTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Announcement Details
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  content_html TEXT,
  excerpt VARCHAR(500),
  announcement_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (announcement_type IN ('general', 'urgent', 'maintenance', 'feature', 'update', 'event', 'news', 'alert', 'reminder', 'celebration')),

  -- Author
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_name VARCHAR(300),
  author_role VARCHAR(100),
  author_avatar TEXT,

  -- Status & Visibility
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived', 'expired', 'cancelled')),
  visibility VARCHAR(50) DEFAULT 'all'
    CHECK (visibility IN ('all', 'team', 'department', 'role', 'specific', 'public', 'private')),

  -- Targeting
  target_audience VARCHAR(100),
  target_departments TEXT[],
  target_roles TEXT[],
  target_teams TEXT[],
  target_users TEXT[],

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_pinned BOOLEAN DEFAULT false,
  pin_expires_at TIMESTAMPTZ,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  is_urgent BOOLEAN DEFAULT false,
  requires_acknowledgment BOOLEAN DEFAULT false,

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  acknowledgment_count INTEGER DEFAULT 0,
  acknowledgment_required_count INTEGER DEFAULT 0,

  -- Viewers Tracking
  viewed_by TEXT[],
  liked_by TEXT[],
  acknowledged_by TEXT[],
  shared_by TEXT[],

  -- Attachments
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,
  attachment_count INTEGER DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  file_urls TEXT[],

  -- Rich Content
  banner_image TEXT,
  banner_color VARCHAR(20),
  icon VARCHAR(50),
  emoji VARCHAR(10),
  cover_image TEXT,

  -- Categories & Tags
  category VARCHAR(100),
  tags TEXT[],
  topic VARCHAR(100),

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  email_notification BOOLEAN DEFAULT false,
  push_notification BOOLEAN DEFAULT false,
  sms_notification BOOLEAN DEFAULT false,

  -- Feedback
  allow_comments BOOLEAN DEFAULT true,
  allow_reactions BOOLEAN DEFAULT true,
  allow_sharing BOOLEAN DEFAULT true,
  reactions JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,

  -- Call to Action
  has_cta BOOLEAN DEFAULT false,
  cta_text VARCHAR(100),
  cta_url TEXT,
  cta_type VARCHAR(50),

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT,

  -- Analytics
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT announcements_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_announcements_user_id ON announcements(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_author ON announcements(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_status ON announcements(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_published ON announcements(published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_priority ON announcements(priority) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view announcements" ON announcements FOR SELECT USING (auth.uid() = user_id OR status = 'published' AND deleted_at IS NULL);
CREATE POLICY "Users can create own announcements" ON announcements FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = author_id);
CREATE POLICY "Users can update own announcements" ON announcements FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = author_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own announcements" ON announcements FOR DELETE USING (auth.uid() = user_id OR auth.uid() = author_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE announcements;

-- ================================================
-- BROADCASTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Broadcast Details
  broadcast_name VARCHAR(500) NOT NULL,
  title VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  message_html TEXT,
  broadcast_type VARCHAR(50) NOT NULL DEFAULT 'email'
    CHECK (broadcast_type IN ('email', 'sms', 'push', 'in_app', 'webhook', 'slack', 'teams', 'discord', 'multi_channel')),

  -- Sender
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_name VARCHAR(300),
  sender_email VARCHAR(300),
  reply_to_email VARCHAR(300),

  -- Audience
  audience_type VARCHAR(50) DEFAULT 'all'
    CHECK (audience_type IN ('all', 'segment', 'list', 'role', 'department', 'team', 'custom', 'filter')),
  target_audience VARCHAR(100),
  recipient_count INTEGER DEFAULT 0,
  recipient_list TEXT[],
  segment_id UUID,
  segment_name VARCHAR(300),

  -- Filters
  audience_filters JSONB DEFAULT '{}'::jsonb,
  exclude_filters JSONB DEFAULT '{}'::jsonb,
  include_users TEXT[],
  exclude_users TEXT[],

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed', 'completed')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  send_at TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT false,
  timezone VARCHAR(100) DEFAULT 'UTC',

  -- Sending Progress
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Content
  subject VARCHAR(500),
  preheader VARCHAR(300),
  template_id UUID,
  template_name VARCHAR(300),
  has_attachments BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Personalization
  is_personalized BOOLEAN DEFAULT false,
  personalization_fields JSONB DEFAULT '{}'::jsonb,
  dynamic_content JSONB DEFAULT '{}'::jsonb,

  -- Tracking
  track_opens BOOLEAN DEFAULT true,
  track_clicks BOOLEAN DEFAULT true,
  track_conversions BOOLEAN DEFAULT false,
  tracking_domain VARCHAR(300),

  -- URLs & Links
  has_links BOOLEAN DEFAULT false,
  link_count INTEGER DEFAULT 0,
  links JSONB DEFAULT '[]'::jsonb,

  -- Testing
  is_test BOOLEAN DEFAULT false,
  test_recipients TEXT[],
  ab_test_id UUID,
  is_ab_test BOOLEAN DEFAULT false,

  -- Priority
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  send_immediately BOOLEAN DEFAULT false,

  -- Channels
  channels TEXT[],
  primary_channel VARCHAR(50),
  fallback_channel VARCHAR(50),

  -- Email Specific
  from_name VARCHAR(300),
  from_email VARCHAR(300),
  cc_emails TEXT[],
  bcc_emails TEXT[],

  -- SMS Specific
  from_number VARCHAR(50),
  message_parts INTEGER,

  -- Push Specific
  push_title VARCHAR(200),
  push_body TEXT,
  push_icon TEXT,
  push_image TEXT,
  push_url TEXT,
  push_data JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),
  unsubscribe_rate DECIMAL(5, 2),
  engagement_score DECIMAL(5, 2),

  -- Costs
  cost_per_message DECIMAL(10, 4),
  total_cost DECIMAL(15, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approval_notes TEXT,

  -- Compliance
  gdpr_compliant BOOLEAN DEFAULT true,
  can_spam_compliant BOOLEAN DEFAULT true,
  unsubscribe_link TEXT,
  preference_center_link TEXT,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  campaign_id UUID,
  campaign_name VARCHAR(300),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,
  provider VARCHAR(100),
  provider_id VARCHAR(200),

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT broadcasts_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_broadcasts_user_id ON broadcasts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_sender ON broadcasts(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_status ON broadcasts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_scheduled ON broadcasts(scheduled_for) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_type ON broadcasts(broadcast_type) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own broadcasts" ON broadcasts FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own broadcasts" ON broadcasts FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = sender_id);
CREATE POLICY "Users can update own broadcasts" ON broadcasts FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own broadcasts" ON broadcasts FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_chat_updated_at BEFORE UPDATE ON chat
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_broadcasts_updated_at BEFORE UPDATE ON broadcasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
