-- =====================================================
-- Batch 31: Announcements & Communications Migration
-- Created: December 14, 2024
-- Tables: announcements, broadcasts, surveys
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ANNOUNCEMENTS TABLE
-- Company announcements and updates
-- =====================================================

CREATE TABLE IF NOT EXISTS announcements (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (announcement_type IN ('general', 'urgent', 'update', 'policy', 'event', 'maintenance', 'achievement', 'alert')),

  -- Status & Priority
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived', 'cancelled')),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Targeting
  target_audience VARCHAR(50) DEFAULT 'all'
    CHECK (target_audience IN ('all', 'employees', 'customers', 'partners', 'admins', 'specific')),
  target_groups JSONB DEFAULT '[]'::jsonb,
  target_users JSONB DEFAULT '[]'::jsonb,

  -- Engagement Metrics
  views_count INTEGER DEFAULT 0,
  reads_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Display Settings
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  show_banner BOOLEAN DEFAULT FALSE,
  banner_color VARCHAR(50),
  icon VARCHAR(100),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  media_urls JSONB DEFAULT '[]'::jsonb,

  -- Notifications
  send_email BOOLEAN DEFAULT FALSE,
  send_push BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  push_sent_at TIMESTAMPTZ,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- BROADCASTS TABLE
-- Mass communication broadcasts
-- =====================================================

CREATE TABLE IF NOT EXISTS broadcasts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  broadcast_type VARCHAR(50) NOT NULL DEFAULT 'email'
    CHECK (broadcast_type IN ('email', 'sms', 'push', 'in-app', 'webhook', 'multi-channel')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled', 'paused')),

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Recipients
  recipient_type VARCHAR(50) NOT NULL DEFAULT 'all'
    CHECK (recipient_type IN ('all', 'segment', 'custom', 'tags', 'individual')),
  recipient_count INTEGER DEFAULT 0,
  recipient_list JSONB DEFAULT '[]'::jsonb,
  recipient_filters JSONB DEFAULT '{}'::jsonb,

  -- Delivery Settings
  sender_name VARCHAR(255),
  sender_email VARCHAR(255),
  reply_to VARCHAR(255),
  subject VARCHAR(500),

  -- Content
  html_content TEXT,
  plain_text_content TEXT,
  template_id UUID,
  variables JSONB DEFAULT '{}'::jsonb,

  -- Delivery Metrics
  delivered_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,

  -- Engagement Rates
  open_rate DECIMAL(5,2) DEFAULT 0.00,
  click_rate DECIMAL(5,2) DEFAULT 0.00,
  bounce_rate DECIMAL(5,2) DEFAULT 0.00,

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT FALSE,
  ab_test_variants JSONB DEFAULT '[]'::jsonb,
  winning_variant VARCHAR(10),

  -- Tracking
  track_opens BOOLEAN DEFAULT TRUE,
  track_clicks BOOLEAN DEFAULT TRUE,
  tracking_domain VARCHAR(255),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Cost & Budget
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- SURVEYS TABLE
-- Survey creation and analysis
-- =====================================================

CREATE TABLE IF NOT EXISTS surveys (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT,
  survey_type VARCHAR(50) NOT NULL DEFAULT 'feedback'
    CHECK (survey_type IN ('feedback', 'satisfaction', 'nps', 'quiz', 'poll', 'research', 'assessment', 'evaluation')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived', 'deleted')),

  -- Timing
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  duration_minutes INTEGER,

  -- Questions
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  question_count INTEGER DEFAULT 0,

  -- Response Settings
  allow_anonymous BOOLEAN DEFAULT FALSE,
  allow_multiple_submissions BOOLEAN DEFAULT FALSE,
  require_login BOOLEAN DEFAULT FALSE,
  one_response_per_user BOOLEAN DEFAULT TRUE,

  -- Display Settings
  show_progress_bar BOOLEAN DEFAULT TRUE,
  show_question_numbers BOOLEAN DEFAULT TRUE,
  randomize_questions BOOLEAN DEFAULT FALSE,
  randomize_options BOOLEAN DEFAULT FALSE,

  -- Completion Settings
  thank_you_message TEXT,
  redirect_url VARCHAR(500),
  show_results_after BOOLEAN DEFAULT FALSE,

  -- Targeting
  target_audience VARCHAR(50) DEFAULT 'all'
    CHECK (target_audience IN ('all', 'customers', 'employees', 'partners', 'segment', 'custom')),
  target_criteria JSONB DEFAULT '{}'::jsonb,

  -- Response Metrics
  total_responses INTEGER DEFAULT 0,
  complete_responses INTEGER DEFAULT 0,
  incomplete_responses INTEGER DEFAULT 0,
  average_completion_time INTEGER DEFAULT 0,

  -- Engagement Metrics
  views_count INTEGER DEFAULT 0,
  started_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  drop_off_rate DECIMAL(5,2) DEFAULT 0.00,

  -- NPS Specific (if survey_type = 'nps')
  nps_score DECIMAL(5,2),
  promoters_count INTEGER DEFAULT 0,
  passives_count INTEGER DEFAULT 0,
  detractors_count INTEGER DEFAULT 0,

  -- Satisfaction Specific
  average_satisfaction DECIMAL(3,2),
  satisfaction_distribution JSONB DEFAULT '{}'::jsonb,

  -- Distribution
  distribution_channels JSONB DEFAULT '[]'::jsonb,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,

  -- Access Control
  is_public BOOLEAN DEFAULT FALSE,
  password_protected BOOLEAN DEFAULT FALSE,
  access_code VARCHAR(100),

  -- Branding
  logo_url VARCHAR(500),
  theme_color VARCHAR(50),
  custom_css TEXT,

  -- Results & Analysis
  results_summary JSONB DEFAULT '{}'::jsonb,
  analyzed_at TIMESTAMPTZ,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Announcements Indexes
CREATE INDEX idx_announcements_user_id ON announcements(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_status ON announcements(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_type ON announcements(announcement_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_published ON announcements(published_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_scheduled ON announcements(scheduled_for) WHERE deleted_at IS NULL;
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned) WHERE is_pinned = TRUE AND deleted_at IS NULL;

-- Broadcasts Indexes
CREATE INDEX idx_broadcasts_user_id ON broadcasts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_status ON broadcasts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_type ON broadcasts(broadcast_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_scheduled ON broadcasts(scheduled_for) WHERE deleted_at IS NULL;
CREATE INDEX idx_broadcasts_sent ON broadcasts(sent_at) WHERE deleted_at IS NULL;

-- Surveys Indexes
CREATE INDEX idx_surveys_user_id ON surveys(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_status ON surveys(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_type ON surveys(survey_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_active ON surveys(status) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_surveys_public ON surveys(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- Announcements Policies
CREATE POLICY "Users can view their own announcements"
  ON announcements FOR SELECT
  USING (auth.uid() = user_id OR target_audience = 'all');

CREATE POLICY "Users can insert their own announcements"
  ON announcements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own announcements"
  ON announcements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own announcements"
  ON announcements FOR DELETE
  USING (auth.uid() = user_id);

-- Broadcasts Policies
CREATE POLICY "Users can view their own broadcasts"
  ON broadcasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own broadcasts"
  ON broadcasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own broadcasts"
  ON broadcasts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own broadcasts"
  ON broadcasts FOR DELETE
  USING (auth.uid() = user_id);

-- Surveys Policies
CREATE POLICY "Users can view their own surveys or public surveys"
  ON surveys FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own surveys"
  ON surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own surveys"
  ON surveys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own surveys"
  ON surveys FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for auto-updating timestamps
-- =====================================================

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Announcements Trigger
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Broadcasts Trigger
CREATE TRIGGER update_broadcasts_updated_at
  BEFORE UPDATE ON broadcasts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Surveys Trigger
CREATE TRIGGER update_surveys_updated_at
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- Enable real-time for all tables
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE surveys;

-- =====================================================
-- SAMPLE DATA (Optional - Uncomment to use)
-- =====================================================

/*
-- Sample Announcements
INSERT INTO announcements (user_id, title, content, announcement_type, status, priority, published_at, target_audience) VALUES
  (auth.uid(), 'Welcome to the Platform', 'We are excited to have you here!', 'general', 'published', 'normal', NOW(), 'all'),
  (auth.uid(), 'System Maintenance Scheduled', 'Scheduled maintenance on Saturday 2AM-4AM', 'maintenance', 'scheduled', 'high', NOW() + INTERVAL '2 days', 'all'),
  (auth.uid(), 'New Feature Launch', 'Check out our new dashboard analytics!', 'update', 'published', 'normal', NOW(), 'customers');

-- Sample Broadcasts
INSERT INTO broadcasts (user_id, title, message, broadcast_type, status, recipient_type, recipient_count, subject) VALUES
  (auth.uid(), 'Monthly Newsletter', 'Here are your monthly updates...', 'email', 'sent', 'all', 1000, 'Your Monthly Update'),
  (auth.uid(), 'Flash Sale Alert', 'Limited time offer - 50% off!', 'multi-channel', 'scheduled', 'segment', 500, 'Flash Sale - 50% Off'),
  (auth.uid(), 'Product Update', 'New features available now', 'push', 'sent', 'all', 2500, 'New Features Available');

-- Sample Surveys
INSERT INTO surveys (user_id, title, description, survey_type, status, question_count, questions) VALUES
  (auth.uid(), 'Customer Satisfaction Survey', 'Help us improve our service', 'satisfaction', 'active', 5, '[{"id": 1, "text": "How satisfied are you?", "type": "rating"}]'::jsonb),
  (auth.uid(), 'Product Feedback', 'Share your thoughts on our new product', 'feedback', 'active', 8, '[{"id": 1, "text": "What do you like most?", "type": "text"}]'::jsonb),
  (auth.uid(), 'Employee Engagement', 'Annual employee survey', 'evaluation', 'draft', 12, '[]'::jsonb);
*/

-- =====================================================
-- END OF MIGRATION
-- =====================================================
