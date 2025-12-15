-- =====================================================================================
-- Batch 45: Courses, CRM & Customer Success Migration
-- =====================================================================================
-- This migration creates comprehensive tables for:
-- 1. Courses - Educational content management and student tracking
-- 2. CRM Contacts - Customer relationship management
-- 3. Customer Success - Health scores and retention tracking
-- =====================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- Table: courses
-- Purpose: Educational course management with student enrollment and progress tracking
-- =====================================================================================
CREATE TABLE IF NOT EXISTS courses (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Course categorization
  course_category VARCHAR(100) NOT NULL DEFAULT 'development'
    CHECK (course_category IN ('development', 'business', 'design', 'marketing', 'data-science', 'finance', 'healthcare', 'education', 'technology', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived', 'under_review', 'suspended', 'deleted')),
  level VARCHAR(50) DEFAULT 'beginner'
    CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert', 'all_levels')),

  -- Instructor information
  instructor_name VARCHAR(200),
  instructor_email VARCHAR(255),
  instructor_bio TEXT,

  -- Course structure
  lecture_count INTEGER DEFAULT 0,
  module_count INTEGER DEFAULT 0,
  quiz_count INTEGER DEFAULT 0,
  assignment_count INTEGER DEFAULT 0,
  total_duration_hours DECIMAL(10, 2) DEFAULT 0,

  -- Enrollment and students
  student_count INTEGER DEFAULT 0,
  enrolled_count INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  completed_students INTEGER DEFAULT 0,
  dropped_students INTEGER DEFAULT 0,

  -- Ratings and reviews
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  five_star_count INTEGER DEFAULT 0,
  four_star_count INTEGER DEFAULT 0,
  three_star_count INTEGER DEFAULT 0,
  two_star_count INTEGER DEFAULT 0,
  one_star_count INTEGER DEFAULT 0,

  -- Completion and engagement metrics
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_completion_time_hours DECIMAL(10, 2),
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  video_watch_rate DECIMAL(5, 2) DEFAULT 0,
  quiz_pass_rate DECIMAL(5, 2) DEFAULT 0,
  assignment_submission_rate DECIMAL(5, 2) DEFAULT 0,

  -- Pricing and revenue
  price DECIMAL(10, 2) DEFAULT 0,
  original_price DECIMAL(10, 2),
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  avg_revenue_per_student DECIMAL(10, 2) DEFAULT 0,

  -- Content details
  language VARCHAR(50) DEFAULT 'English',
  subtitle_languages TEXT[], -- Array of supported subtitle languages
  has_certificates BOOLEAN DEFAULT false,
  has_downloadable_resources BOOLEAN DEFAULT false,
  has_lifetime_access BOOLEAN DEFAULT true,
  has_mobile_access BOOLEAN DEFAULT true,

  -- Prerequisites and requirements
  prerequisites TEXT[],
  requirements TEXT[],
  learning_outcomes TEXT[],
  target_audience TEXT,

  -- Publishing and visibility
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  last_content_update TIMESTAMP WITH TIME ZONE,

  -- Access control
  access_type VARCHAR(50) DEFAULT 'public'
    CHECK (access_type IN ('public', 'private', 'restricted', 'enterprise', 'invitation_only')),
  enrollment_capacity INTEGER,
  enrollment_deadline TIMESTAMP WITH TIME ZONE,
  course_start_date TIMESTAMP WITH TIME ZONE,
  course_end_date TIMESTAMP WITH TIME ZONE,

  -- Certification
  certificate_template_id UUID,
  certificate_criteria JSONB,
  certification_pass_percentage DECIMAL(5, 2) DEFAULT 80,

  -- Social proof
  testimonial_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Marketing
  promotional_video_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  preview_url VARCHAR(500),
  syllabus_url VARCHAR(500),

  -- SEO and metadata
  slug VARCHAR(500) UNIQUE,
  meta_title VARCHAR(200),
  meta_description TEXT,
  keywords TEXT[],

  -- Analytics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_time_on_page_seconds INTEGER DEFAULT 0,

  -- Support and communication
  has_discussion_forum BOOLEAN DEFAULT true,
  has_qa_support BOOLEAN DEFAULT true,
  has_live_sessions BOOLEAN DEFAULT false,
  instructor_response_time_hours DECIMAL(10, 2),

  -- Content protection
  drm_enabled BOOLEAN DEFAULT false,
  download_limit INTEGER,
  watermark_enabled BOOLEAN DEFAULT false,

  -- Compliance
  compliance_certifications TEXT[],
  age_restriction INTEGER,
  content_warnings TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[],

  -- Indexes
  CONSTRAINT courses_user_id_idx UNIQUE NULLS NOT DISTINCT (user_id, course_name, deleted_at)
);

-- Create indexes for courses
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(course_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_rating ON courses(rating DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_courses_students ON courses(student_count DESC) WHERE deleted_at IS NULL;

-- Enable RLS for courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Users can view their own courses"
  ON courses FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own courses"
  ON courses FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Table: crm_contacts
-- Purpose: Customer relationship management with deal tracking and communication history
-- =====================================================================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Company information
  company_name VARCHAR(200),
  company_website VARCHAR(500),
  company_size VARCHAR(50)
    CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+', 'unknown')),
  industry VARCHAR(100),

  -- Contact details
  job_title VARCHAR(200),
  department VARCHAR(100),
  location VARCHAR(200),
  timezone VARCHAR(100),

  -- Contact classification
  contact_type VARCHAR(50) DEFAULT 'lead'
    CHECK (contact_type IN ('lead', 'prospect', 'customer', 'partner', 'vendor', 'competitor', 'other')),
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'vip', 'churned', 'new', 'qualified', 'unqualified', 'blocked')),
  lead_source VARCHAR(100)
    CHECK (lead_source IN ('website', 'referral', 'social_media', 'email', 'phone', 'event', 'partner', 'advertisement', 'organic', 'other')),

  -- Deal and pipeline
  deal_stage VARCHAR(100)
    CHECK (deal_stage IN ('prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
  deal_value DECIMAL(12, 2) DEFAULT 0,
  expected_close_date TIMESTAMP WITH TIME ZONE,
  probability_percentage DECIMAL(5, 2) DEFAULT 0,
  pipeline_name VARCHAR(100),

  -- Financial metrics
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  total_purchases DECIMAL(12, 2) DEFAULT 0,
  avg_purchase_value DECIMAL(10, 2) DEFAULT 0,
  purchase_count INTEGER DEFAULT 0,
  outstanding_balance DECIMAL(12, 2) DEFAULT 0,
  credit_limit DECIMAL(12, 2),

  -- Engagement metrics
  last_contact_date TIMESTAMP WITH TIME ZONE,
  last_contact_type VARCHAR(50)
    CHECK (last_contact_type IN ('email', 'phone', 'meeting', 'chat', 'social_media', 'other')),
  next_followup_date TIMESTAMP WITH TIME ZONE,
  email_count INTEGER DEFAULT 0,
  call_count INTEGER DEFAULT 0,
  meeting_count INTEGER DEFAULT 0,

  -- Communication preferences
  preferred_contact_method VARCHAR(50)
    CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'chat', 'social_media', 'none')),
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  do_not_contact BOOLEAN DEFAULT false,

  -- Relationship and ownership
  account_owner_id UUID REFERENCES auth.users(id),
  account_owner_name VARCHAR(200),
  assigned_to_id UUID REFERENCES auth.users(id),
  assigned_to_name VARCHAR(200),

  -- Social media
  linkedin_url VARCHAR(500),
  twitter_url VARCHAR(500),
  facebook_url VARCHAR(500),

  -- Scoring and qualification
  lead_score INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2) DEFAULT 0,
  qualification_status VARCHAR(50)
    CHECK (qualification_status IN ('qualified', 'unqualified', 'pending', 'nurturing', 'disqualified')),

  -- Notes and activities
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Conversion tracking
  conversion_date TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(12, 2),
  time_to_conversion_days INTEGER,

  -- Customer satisfaction
  satisfaction_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_survey_date TIMESTAMP WITH TIME ZONE,

  -- Address information
  address_line1 VARCHAR(500),
  address_line2 VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  -- Integration IDs
  salesforce_id VARCHAR(100),
  hubspot_id VARCHAR(100),
  external_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for crm_contacts
CREATE INDEX IF NOT EXISTS idx_crm_contacts_user_id ON crm_contacts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_status ON crm_contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_type ON crm_contacts(contact_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_email ON crm_contacts(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_company ON crm_contacts(company_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_deal_value ON crm_contacts(deal_value DESC) WHERE deleted_at IS NULL;

-- Enable RLS for crm_contacts
ALTER TABLE crm_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crm_contacts
CREATE POLICY "Users can view their own CRM contacts"
  ON crm_contacts FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own CRM contacts"
  ON crm_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CRM contacts"
  ON crm_contacts FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own CRM contacts"
  ON crm_contacts FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Table: customer_success
-- Purpose: Customer health monitoring, retention tracking, and success metrics
-- =====================================================================================
CREATE TABLE IF NOT EXISTS customer_success (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID,
  customer_name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),

  -- Health scoring
  health_score INTEGER DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  health_status VARCHAR(50) DEFAULT 'healthy'
    CHECK (health_status IN ('healthy', 'at_risk', 'critical', 'churned', 'onboarding', 'inactive')),
  previous_health_score INTEGER,
  health_trend VARCHAR(20)
    CHECK (health_trend IN ('improving', 'stable', 'declining', 'unknown')),

  -- Account information
  account_tier VARCHAR(50) DEFAULT 'starter'
    CHECK (account_tier IN ('enterprise', 'business', 'professional', 'starter', 'trial', 'freemium')),
  account_status VARCHAR(50) DEFAULT 'active'
    CHECK (account_status IN ('active', 'inactive', 'suspended', 'churned', 'trial', 'onboarding')),

  -- Financial metrics
  mrr DECIMAL(12, 2) DEFAULT 0, -- Monthly Recurring Revenue
  arr DECIMAL(12, 2) DEFAULT 0, -- Annual Recurring Revenue
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,

  -- Contract details
  contract_start_date TIMESTAMP WITH TIME ZONE,
  contract_end_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  days_to_renewal INTEGER,
  contract_term_months INTEGER,
  auto_renewal BOOLEAN DEFAULT false,

  -- Engagement metrics
  engagement_level VARCHAR(50) DEFAULT 'medium'
    CHECK (engagement_level IN ('high', 'medium', 'low', 'inactive', 'dormant')),
  product_usage_percentage DECIMAL(5, 2) DEFAULT 0,
  feature_adoption_count INTEGER DEFAULT 0,
  total_features_available INTEGER DEFAULT 0,
  feature_adoption_rate DECIMAL(5, 2) DEFAULT 0,

  -- Activity tracking
  last_login_date TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  logins_last_30_days INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10, 2),
  total_time_spent_hours DECIMAL(12, 2) DEFAULT 0,

  -- Support metrics
  support_ticket_count INTEGER DEFAULT 0,
  open_ticket_count INTEGER DEFAULT 0,
  closed_ticket_count INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10, 2),
  escalation_count INTEGER DEFAULT 0,

  -- Customer satisfaction
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  csat_score DECIMAL(3, 2) CHECK (csat_score >= 0 AND csat_score <= 5),
  last_survey_date TIMESTAMP WITH TIME ZONE,
  survey_response_count INTEGER DEFAULT 0,

  -- CSM assignment
  csm_id UUID REFERENCES auth.users(id),
  csm_name VARCHAR(200),
  csm_email VARCHAR(255),
  last_csm_contact TIMESTAMP WITH TIME ZONE,
  next_check_in TIMESTAMP WITH TIME ZONE,

  -- Onboarding
  onboarding_status VARCHAR(50)
    CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed', 'delayed', 'blocked')),
  onboarding_progress_percentage DECIMAL(5, 2) DEFAULT 0,
  onboarding_completed_date TIMESTAMP WITH TIME ZONE,
  time_to_value_days INTEGER,

  -- Expansion opportunities
  expansion_opportunity BOOLEAN DEFAULT false,
  upsell_potential DECIMAL(12, 2) DEFAULT 0,
  cross_sell_opportunities TEXT[],
  expansion_notes TEXT,

  -- Churn risk
  churn_risk_score DECIMAL(5, 2) DEFAULT 0,
  churn_probability DECIMAL(5, 2) DEFAULT 0,
  churn_reasons TEXT[],
  at_risk_since TIMESTAMP WITH TIME ZONE,
  retention_actions TEXT[],

  -- Goals and objectives
  customer_goals TEXT[],
  success_milestones JSONB,
  milestones_achieved INTEGER DEFAULT 0,
  total_milestones INTEGER DEFAULT 0,

  -- QBR (Quarterly Business Review)
  last_qbr_date TIMESTAMP WITH TIME ZONE,
  next_qbr_date TIMESTAMP WITH TIME ZONE,
  qbr_count INTEGER DEFAULT 0,
  qbr_notes TEXT,

  -- Advocacy
  is_reference_customer BOOLEAN DEFAULT false,
  is_case_study BOOLEAN DEFAULT false,
  testimonial_provided BOOLEAN DEFAULT false,
  referral_count INTEGER DEFAULT 0,

  -- Product feedback
  feature_request_count INTEGER DEFAULT 0,
  bug_report_count INTEGER DEFAULT 0,
  product_feedback_submissions INTEGER DEFAULT 0,

  -- Training and enablement
  training_sessions_completed INTEGER DEFAULT 0,
  certification_achieved BOOLEAN DEFAULT false,
  resource_downloads INTEGER DEFAULT 0,

  -- Communication
  email_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  webinar_attendance_count INTEGER DEFAULT 0,
  community_participation_score DECIMAL(5, 2) DEFAULT 0,

  -- Alerts and notifications
  alert_level VARCHAR(50) DEFAULT 'none'
    CHECK (alert_level IN ('none', 'low', 'medium', 'high', 'critical')),
  alert_reasons TEXT[],
  last_alert_date TIMESTAMP WITH TIME ZONE,

  -- Notes and actions
  notes TEXT,
  action_items TEXT[],
  tags TEXT[],

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for customer_success
CREATE INDEX IF NOT EXISTS idx_customer_success_user_id ON customer_success(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customer_success_health_status ON customer_success(health_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customer_success_health_score ON customer_success(health_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customer_success_account_tier ON customer_success(account_tier) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customer_success_arr ON customer_success(arr DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customer_success_renewal ON customer_success(renewal_date) WHERE deleted_at IS NULL;

-- Enable RLS for customer_success
ALTER TABLE customer_success ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_success
CREATE POLICY "Users can view their own customer success data"
  ON customer_success FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own customer success data"
  ON customer_success FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer success data"
  ON customer_success FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own customer success data"
  ON customer_success FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Enable Realtime
-- =====================================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE courses;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_success;
