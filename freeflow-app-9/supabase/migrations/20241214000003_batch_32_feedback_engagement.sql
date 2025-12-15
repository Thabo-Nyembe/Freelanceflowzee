-- =====================================================
-- Batch 32: Feedback & Engagement Migration
-- Created: December 14, 2024
-- Tables: feedback, forms, polls
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- FEEDBACK TABLE
-- User feedback collection and management
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Feedback Source
  submitted_by_user_id UUID REFERENCES auth.users(id),
  submitted_by_name VARCHAR(255),
  submitted_by_email VARCHAR(255),

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  feedback_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (feedback_type IN ('bug', 'feature-request', 'improvement', 'complaint', 'praise', 'question', 'general', 'other')),

  -- Status & Priority
  status VARCHAR(50) NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'reviewing', 'planned', 'in-progress', 'completed', 'declined', 'duplicate', 'archived')),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),

  -- Categorization
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags JSONB DEFAULT '[]'::jsonb,

  -- Ratings & Sentiment
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 10),

  -- Related Info
  related_feature VARCHAR(255),
  related_url VARCHAR(500),
  related_version VARCHAR(50),

  -- Engagement
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,

  -- Response
  response_status VARCHAR(50) DEFAULT 'pending'
    CHECK (response_status IN ('pending', 'acknowledged', 'in-review', 'responded', 'resolved')),
  responded_at TIMESTAMPTZ,
  responded_by UUID REFERENCES auth.users(id),
  response_text TEXT,

  -- Internal Notes
  internal_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,

  -- Flags
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  screenshots JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  browser_info JSONB,
  device_info JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- FORMS TABLE
-- Dynamic form builder and submissions
-- =====================================================

CREATE TABLE IF NOT EXISTS forms (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  title VARCHAR(255) NOT NULL,
  description TEXT,
  form_type VARCHAR(50) NOT NULL DEFAULT 'custom'
    CHECK (form_type IN ('contact', 'registration', 'application', 'survey', 'quiz', 'order', 'feedback', 'custom')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Form Structure
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  field_count INTEGER DEFAULT 0,
  sections JSONB DEFAULT '[]'::jsonb,

  -- Settings
  allow_multiple_submissions BOOLEAN DEFAULT FALSE,
  require_authentication BOOLEAN DEFAULT FALSE,
  allow_save_draft BOOLEAN DEFAULT TRUE,
  show_progress_bar BOOLEAN DEFAULT TRUE,

  -- Validation
  validation_rules JSONB DEFAULT '{}'::jsonb,
  required_fields JSONB DEFAULT '[]'::jsonb,

  -- Submission Settings
  max_submissions INTEGER,
  submission_deadline TIMESTAMPTZ,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,

  -- Response Handling
  confirmation_message TEXT,
  redirect_url VARCHAR(500),
  send_confirmation_email BOOLEAN DEFAULT TRUE,
  email_template_id UUID,
  notification_emails JSONB DEFAULT '[]'::jsonb,

  -- Submissions Tracking
  total_submissions INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_started INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_completion_time INTEGER DEFAULT 0,

  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  password_protected BOOLEAN DEFAULT FALSE,
  access_code VARCHAR(100),
  allowed_domains JSONB DEFAULT '[]'::jsonb,

  -- Appearance
  theme VARCHAR(50) DEFAULT 'default',
  custom_css TEXT,
  logo_url VARCHAR(500),
  background_image_url VARCHAR(500),
  primary_color VARCHAR(50),

  -- Integration
  webhook_url VARCHAR(500),
  webhook_events JSONB DEFAULT '[]'::jsonb,
  integration_settings JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  analytics_enabled BOOLEAN DEFAULT TRUE,
  track_source BOOLEAN DEFAULT TRUE,
  track_location BOOLEAN DEFAULT FALSE,

  -- Metadata
  tags JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- POLLS TABLE
-- Poll creation and voting
-- =====================================================

CREATE TABLE IF NOT EXISTS polls (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,

  -- Core Fields
  question TEXT NOT NULL,
  description TEXT,
  poll_type VARCHAR(50) NOT NULL DEFAULT 'single-choice'
    CHECK (poll_type IN ('single-choice', 'multiple-choice', 'rating', 'ranking', 'open-ended')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'closed', 'archived')),

  -- Options
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  option_count INTEGER DEFAULT 0,
  allow_custom_options BOOLEAN DEFAULT FALSE,
  randomize_options BOOLEAN DEFAULT FALSE,

  -- Voting Settings
  allow_multiple_votes BOOLEAN DEFAULT FALSE,
  require_authentication BOOLEAN DEFAULT TRUE,
  allow_anonymous BOOLEAN DEFAULT FALSE,
  show_results_before_voting BOOLEAN DEFAULT FALSE,
  show_results_after_voting BOOLEAN DEFAULT TRUE,

  -- Timing
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  duration_hours INTEGER,

  -- Voting Results
  total_votes INTEGER DEFAULT 0,
  total_voters INTEGER DEFAULT 0,
  results JSONB DEFAULT '{}'::jsonb,
  winner_option_id VARCHAR(100),

  -- Engagement
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Display Settings
  display_mode VARCHAR(50) DEFAULT 'standard'
    CHECK (display_mode IN ('standard', 'compact', 'card', 'banner')),
  show_vote_count BOOLEAN DEFAULT TRUE,
  show_percentage BOOLEAN DEFAULT TRUE,
  show_voter_names BOOLEAN DEFAULT FALSE,

  -- Access Control
  is_public BOOLEAN DEFAULT TRUE,
  target_audience VARCHAR(50) DEFAULT 'all'
    CHECK (target_audience IN ('all', 'members', 'followers', 'custom')),
  allowed_voters JSONB DEFAULT '[]'::jsonb,

  -- Location & Context
  embedded_in_page VARCHAR(255),
  location VARCHAR(255),
  context JSONB DEFAULT '{}'::jsonb,

  -- Features
  enable_comments BOOLEAN DEFAULT TRUE,
  enable_sharing BOOLEAN DEFAULT TRUE,
  enable_notifications BOOLEAN DEFAULT TRUE,

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

-- Feedback Indexes
CREATE INDEX idx_feedback_user_id ON feedback(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_status ON feedback(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_type ON feedback(feedback_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_priority ON feedback(priority) WHERE deleted_at IS NULL;
CREATE INDEX idx_feedback_created ON feedback(created_at DESC) WHERE deleted_at IS NULL;

-- Forms Indexes
CREATE INDEX idx_forms_user_id ON forms(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_status ON forms(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_type ON forms(form_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_forms_public ON forms(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;

-- Polls Indexes
CREATE INDEX idx_polls_user_id ON polls(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_polls_status ON polls(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_polls_type ON polls(poll_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_polls_active ON polls(status) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_polls_public ON polls(is_public) WHERE is_public = TRUE AND deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

-- Feedback Policies
CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON feedback FOR DELETE
  USING (auth.uid() = user_id);

-- Forms Policies
CREATE POLICY "Users can view their own forms or public forms"
  ON forms FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own forms"
  ON forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
  ON forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
  ON forms FOR DELETE
  USING (auth.uid() = user_id);

-- Polls Policies
CREATE POLICY "Users can view their own polls or public polls"
  ON polls FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert their own polls"
  ON polls FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own polls"
  ON polls FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls"
  ON polls FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for auto-updating timestamps
-- =====================================================

-- Feedback Trigger
CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Forms Trigger
CREATE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Polls Trigger
CREATE TRIGGER update_polls_updated_at
  BEFORE UPDATE ON polls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- Enable real-time for all tables
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE forms;
ALTER PUBLICATION supabase_realtime ADD TABLE polls;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
