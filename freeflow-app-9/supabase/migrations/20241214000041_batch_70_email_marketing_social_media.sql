-- Batch 70: Email Marketing & Social Media Tables
-- Migration for email-marketing-v2, social-media-v2

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS email_campaign_seq START 1;
CREATE SEQUENCE IF NOT EXISTS social_post_seq START 1;

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_code TEXT NOT NULL DEFAULT ('EMAIL-' || LPAD(nextval('email_campaign_seq')::text, 6, '0')),
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  content_html TEXT,
  content_text TEXT,
  template_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  campaign_type TEXT DEFAULT 'newsletter',
  sender_name TEXT,
  sender_email TEXT,
  reply_to TEXT,
  list_ids TEXT[],
  segment_ids TEXT[],
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  complained_count INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  unsubscribe_rate DECIMAL(5, 2) DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags TEXT[],
  ab_test_enabled BOOLEAN DEFAULT false,
  ab_test_config JSONB DEFAULT '{}',
  tracking_enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- EMAIL SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced', 'complained', 'pending')),
  source TEXT,
  ip_address TEXT,
  list_ids TEXT[],
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  last_open_at TIMESTAMPTZ,
  last_click_at TIMESTAMPTZ,
  total_opens INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL LISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  subscriber_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  double_optin BOOLEAN DEFAULT false,
  welcome_email_enabled BOOLEAN DEFAULT false,
  welcome_email_id UUID,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  subject TEXT,
  content_html TEXT,
  content_text TEXT,
  thumbnail_url TEXT,
  is_default BOOLEAN DEFAULT false,
  variables TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_code TEXT NOT NULL DEFAULT ('SOC-' || LPAD(nextval('social_post_seq')::text, 6, '0')),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'video', 'carousel', 'story', 'reel', 'link')),
  platforms TEXT[] NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed', 'deleted')),
  author TEXT,
  media_urls TEXT[],
  thumbnail_url TEXT,
  link_url TEXT,
  link_preview JSONB DEFAULT '{}',
  hashtags TEXT[],
  mentions TEXT[],
  tags TEXT[],
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  engagement DECIMAL(5, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  platform_post_ids JSONB DEFAULT '{}',
  is_trending BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- SOCIAL ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'linkedin', 'tiktok', 'youtube', 'pinterest', 'threads')),
  account_name TEXT NOT NULL,
  account_id TEXT NOT NULL,
  account_username TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  permissions TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SOCIAL ANALYTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  followers INTEGER DEFAULT 0,
  followers_change INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2) DEFAULT 0,
  profile_views INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_email_campaigns_user ON email_campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_lists_user ON email_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_email_templates_user ON email_templates(user_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_platforms ON social_posts USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_analytics_user ON social_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_date ON social_analytics(date);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;

-- Email Campaigns Policies
CREATE POLICY "Users can view own email campaigns" ON email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email campaigns" ON email_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email campaigns" ON email_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email campaigns" ON email_campaigns FOR DELETE USING (auth.uid() = user_id);

-- Email Subscribers Policies
CREATE POLICY "Users can view own email subscribers" ON email_subscribers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email subscribers" ON email_subscribers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email subscribers" ON email_subscribers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email subscribers" ON email_subscribers FOR DELETE USING (auth.uid() = user_id);

-- Email Lists Policies
CREATE POLICY "Users can view own email lists" ON email_lists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email lists" ON email_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email lists" ON email_lists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email lists" ON email_lists FOR DELETE USING (auth.uid() = user_id);

-- Email Templates Policies
CREATE POLICY "Users can view own email templates" ON email_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own email templates" ON email_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own email templates" ON email_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own email templates" ON email_templates FOR DELETE USING (auth.uid() = user_id);

-- Social Posts Policies
CREATE POLICY "Users can view own social posts" ON social_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social posts" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social posts" ON social_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social posts" ON social_posts FOR DELETE USING (auth.uid() = user_id);

-- Social Accounts Policies
CREATE POLICY "Users can view own social accounts" ON social_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social accounts" ON social_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social accounts" ON social_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social accounts" ON social_accounts FOR DELETE USING (auth.uid() = user_id);

-- Social Analytics Policies
CREATE POLICY "Users can view own social analytics" ON social_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own social analytics" ON social_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social analytics" ON social_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social analytics" ON social_analytics FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
  BEFORE UPDATE ON email_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_subscribers_updated_at ON email_subscribers;
CREATE TRIGGER update_email_subscribers_updated_at
  BEFORE UPDATE ON email_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_lists_updated_at ON email_lists;
CREATE TRIGGER update_email_lists_updated_at
  BEFORE UPDATE ON email_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_posts_updated_at ON social_posts;
CREATE TRIGGER update_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
