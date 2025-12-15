-- =============================================
-- BATCH 51: Marketplace, Messaging & Media Library
-- =============================================
-- Tables: marketplace_apps, marketplace_reviews, conversations, direct_messages, media_files, media_folders
-- =============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- MARKETPLACE APPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS marketplace_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  app_name VARCHAR(200) NOT NULL,
  app_slug VARCHAR(200),
  description TEXT,
  short_description VARCHAR(500),

  -- Developer Info
  developer_name VARCHAR(200),
  developer_email VARCHAR(255),
  developer_website VARCHAR(500),
  developer_verified BOOLEAN DEFAULT false,

  -- Categorization
  category VARCHAR(50) DEFAULT 'productivity'
    CHECK (category IN ('productivity', 'analytics', 'marketing', 'security', 'collaboration', 'automation', 'communication', 'finance', 'design', 'development', 'other')),
  subcategory VARCHAR(100),
  tags TEXT[],

  -- Pricing
  pricing_model VARCHAR(20) DEFAULT 'paid'
    CHECK (pricing_model IN ('free', 'freemium', 'paid', 'subscription', 'usage_based')),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  monthly_price DECIMAL(10, 2),
  annual_price DECIMAL(10, 2),

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'suspended', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metrics
  total_downloads INTEGER DEFAULT 0,
  total_installs INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,

  -- Media
  icon_url TEXT,
  banner_url TEXT,
  screenshots TEXT[],
  video_url TEXT,

  -- Technical
  version VARCHAR(50),
  min_platform_version VARCHAR(50),
  permissions TEXT[],
  api_scopes TEXT[],
  webhook_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- MARKETPLACE REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES marketplace_apps(id) ON DELETE CASCADE,

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT,

  -- Reviewer Info
  reviewer_name VARCHAR(200),
  reviewer_avatar TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'flagged', 'removed')),
  is_featured BOOLEAN DEFAULT false,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,

  -- Developer Response
  developer_response TEXT,
  developer_responded_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- CONVERSATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversation Info
  conversation_name VARCHAR(200),
  conversation_type VARCHAR(20) DEFAULT 'direct'
    CHECK (conversation_type IN ('direct', 'group', 'channel', 'support', 'system')),

  -- Participants
  participant_ids UUID[],
  participant_emails TEXT[],
  participant_count INTEGER DEFAULT 2,

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'muted', 'blocked', 'deleted')),
  is_pinned BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,

  -- Last Message Info
  last_message_id UUID,
  last_message_preview VARCHAR(500),
  last_message_at TIMESTAMP WITH TIME ZONE,
  last_message_by VARCHAR(255),

  -- Unread Tracking
  unread_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMP WITH TIME ZONE,

  -- Settings
  notification_enabled BOOLEAN DEFAULT true,
  auto_archive_days INTEGER,

  -- Metadata
  avatar_url TEXT,
  color VARCHAR(50),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- DIRECT MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

  -- Message Content
  content TEXT NOT NULL,
  content_type VARCHAR(20) DEFAULT 'text'
    CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file', 'link', 'emoji', 'system')),

  -- Sender Info
  sender_id UUID NOT NULL,
  sender_name VARCHAR(200),
  sender_email VARCHAR(255),
  sender_avatar TEXT,

  -- Recipient Info
  recipient_id UUID,
  recipient_email VARCHAR(255),

  -- Status
  status VARCHAR(20) DEFAULT 'sent'
    CHECK (status IN ('sending', 'sent', 'delivered', 'read', 'failed', 'deleted')),
  is_edited BOOLEAN DEFAULT false,
  is_forwarded BOOLEAN DEFAULT false,
  is_reply BOOLEAN DEFAULT false,

  -- Reply Reference
  reply_to_id UUID REFERENCES direct_messages(id),
  reply_preview VARCHAR(200),

  -- Attachments
  attachments JSONB DEFAULT '[]',
  attachment_count INTEGER DEFAULT 0,

  -- Reactions
  reactions JSONB DEFAULT '{}',
  reaction_count INTEGER DEFAULT 0,

  -- Read Receipts
  read_by UUID[],
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- MEDIA FILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID,

  -- File Info
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  file_type VARCHAR(20) DEFAULT 'document'
    CHECK (file_type IN ('image', 'video', 'audio', 'document', 'archive', 'other')),
  mime_type VARCHAR(200),
  file_extension VARCHAR(20),

  -- Storage
  storage_path TEXT,
  storage_url TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,
  cdn_url TEXT,

  -- Dimensions & Size
  file_size BIGINT DEFAULT 0,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  page_count INTEGER,

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('uploading', 'processing', 'active', 'archived', 'deleted', 'quarantined')),
  is_public BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,

  -- Metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Access Control
  access_level VARCHAR(20) DEFAULT 'private'
    CHECK (access_level IN ('private', 'team', 'organization', 'public', 'link_only')),
  shared_with UUID[],
  password_protected BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,

  -- Technical Info
  checksum VARCHAR(64),
  encoding VARCHAR(50),
  bit_rate INTEGER,
  sample_rate INTEGER,
  color_space VARCHAR(50),

  -- AI/Processing
  alt_text TEXT,
  description TEXT,
  tags TEXT[],
  ai_tags TEXT[],
  transcription TEXT,
  extracted_text TEXT,

  -- Metadata
  exif_data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- MEDIA FOLDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS media_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,

  -- Folder Info
  folder_name VARCHAR(200) NOT NULL,
  folder_path TEXT,
  description TEXT,

  -- Status
  is_root BOOLEAN DEFAULT false,
  is_system BOOLEAN DEFAULT false,
  is_starred BOOLEAN DEFAULT false,

  -- Metrics
  file_count INTEGER DEFAULT 0,
  folder_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Access Control
  access_level VARCHAR(20) DEFAULT 'private'
    CHECK (access_level IN ('private', 'team', 'organization', 'public')),
  shared_with UUID[],

  -- Customization
  color VARCHAR(50),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES
-- =============================================

-- Marketplace Apps Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_user_id ON marketplace_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_status ON marketplace_apps(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_category ON marketplace_apps(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_featured ON marketplace_apps(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_rating ON marketplace_apps(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_downloads ON marketplace_apps(total_downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_created_at ON marketplace_apps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_apps_deleted_at ON marketplace_apps(deleted_at) WHERE deleted_at IS NULL;

-- Marketplace Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_user_id ON marketplace_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_app_id ON marketplace_reviews(app_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_created_at ON marketplace_reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_reviews_deleted_at ON marketplace_reviews(deleted_at) WHERE deleted_at IS NULL;

-- Conversations Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_conversations_deleted_at ON conversations(deleted_at) WHERE deleted_at IS NULL;

-- Direct Messages Indexes
CREATE INDEX IF NOT EXISTS idx_direct_messages_user_id ON direct_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_status ON direct_messages(status);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sent_at ON direct_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_deleted_at ON direct_messages(deleted_at) WHERE deleted_at IS NULL;

-- Media Files Indexes
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_folder_id ON media_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_files_file_type ON media_files(file_type);
CREATE INDEX IF NOT EXISTS idx_media_files_status ON media_files(status);
CREATE INDEX IF NOT EXISTS idx_media_files_starred ON media_files(is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_media_files_public ON media_files(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_deleted_at ON media_files(deleted_at) WHERE deleted_at IS NULL;

-- Media Folders Indexes
CREATE INDEX IF NOT EXISTS idx_media_folders_user_id ON media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON media_folders(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_folders_deleted_at ON media_folders(deleted_at) WHERE deleted_at IS NULL;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE marketplace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;

-- Marketplace Apps Policies
CREATE POLICY "Users can view published apps" ON marketplace_apps
  FOR SELECT USING (status = 'published' OR user_id = auth.uid());

CREATE POLICY "Users can manage their own apps" ON marketplace_apps
  FOR ALL USING (user_id = auth.uid());

-- Marketplace Reviews Policies
CREATE POLICY "Users can view approved reviews" ON marketplace_reviews
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can manage their own reviews" ON marketplace_reviews
  FOR ALL USING (user_id = auth.uid());

-- Conversations Policies
CREATE POLICY "Users can view their conversations" ON conversations
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() = ANY(participant_ids));

CREATE POLICY "Users can manage their own conversations" ON conversations
  FOR ALL USING (user_id = auth.uid());

-- Direct Messages Policies
CREATE POLICY "Users can view their messages" ON direct_messages
  FOR SELECT USING (user_id = auth.uid() OR sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can manage their own messages" ON direct_messages
  FOR ALL USING (user_id = auth.uid());

-- Media Files Policies
CREATE POLICY "Users can view their own and public files" ON media_files
  FOR SELECT USING (user_id = auth.uid() OR is_public = true OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can manage their own files" ON media_files
  FOR ALL USING (user_id = auth.uid());

-- Media Folders Policies
CREATE POLICY "Users can view their own and shared folders" ON media_folders
  FOR SELECT USING (user_id = auth.uid() OR auth.uid() = ANY(shared_with));

CREATE POLICY "Users can manage their own folders" ON media_folders
  FOR ALL USING (user_id = auth.uid());

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_marketplace_apps_updated_at ON marketplace_apps;
CREATE TRIGGER update_marketplace_apps_updated_at
  BEFORE UPDATE ON marketplace_apps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_marketplace_reviews_updated_at ON marketplace_reviews;
CREATE TRIGGER update_marketplace_reviews_updated_at
  BEFORE UPDATE ON marketplace_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
CREATE TRIGGER update_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_folders_updated_at ON media_folders;
CREATE TRIGGER update_media_folders_updated_at
  BEFORE UPDATE ON media_folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- REALTIME SUBSCRIPTIONS
-- =============================================

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_apps;
ALTER PUBLICATION supabase_realtime ADD TABLE marketplace_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE direct_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE media_files;
ALTER PUBLICATION supabase_realtime ADD TABLE media_folders;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE marketplace_apps IS 'App marketplace listings with pricing, reviews, and metrics';
COMMENT ON TABLE marketplace_reviews IS 'User reviews for marketplace apps';
COMMENT ON TABLE conversations IS 'Message threads and group conversations';
COMMENT ON TABLE direct_messages IS 'Individual messages within conversations';
COMMENT ON TABLE media_files IS 'Media library files including images, videos, audio, documents';
COMMENT ON TABLE media_folders IS 'Folder organization for media files';
