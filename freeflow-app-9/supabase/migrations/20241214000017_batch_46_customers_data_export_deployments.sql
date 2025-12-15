-- =====================================================================================
-- Batch 46: Customers, Data Export & Deployments Migration
-- =====================================================================================
-- This migration creates comprehensive tables for:
-- 1. Customers - Customer profiles, segmentation, and lifetime value
-- 2. Data Export - Export jobs, scheduling, and format management
-- 3. Deployments - Application deployment tracking and rollback management
-- =====================================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================================
-- Table: customers
-- Purpose: Customer profile management with segmentation and lifetime value tracking
-- =====================================================================================
CREATE TABLE IF NOT EXISTS customers (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Segmentation
  segment VARCHAR(50) DEFAULT 'active'
    CHECK (segment IN ('vip', 'active', 'new', 'inactive', 'churned', 'at_risk', 'prospect')),
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'suspended', 'deleted', 'pending', 'verified')),

  -- Personal information
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  gender VARCHAR(20),

  -- Contact preferences
  preferred_language VARCHAR(50) DEFAULT 'English',
  timezone VARCHAR(100),
  preferred_contact_method VARCHAR(50)
    CHECK (preferred_contact_method IN ('email', 'phone', 'sms', 'chat', 'whatsapp', 'none')),

  -- Location
  address_line1 VARCHAR(500),
  address_line2 VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  location_name VARCHAR(200),

  -- Financial metrics
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  lifetime_value DECIMAL(12, 2) DEFAULT 0,
  avg_order_value DECIMAL(10, 2) DEFAULT 0,
  first_order_value DECIMAL(10, 2),
  last_order_value DECIMAL(10, 2),

  -- Dates
  join_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_purchase_date TIMESTAMP WITH TIME ZONE,
  last_purchase_date TIMESTAMP WITH TIME ZONE,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  last_login_date TIMESTAMP WITH TIME ZONE,

  -- Engagement metrics
  email_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  sms_engagement_rate DECIMAL(5, 2) DEFAULT 0,
  login_count INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  session_count INTEGER DEFAULT 0,
  avg_session_duration_minutes DECIMAL(10, 2),

  -- Loyalty program
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier VARCHAR(50),
  referral_count INTEGER DEFAULT 0,
  referred_by_id UUID,

  -- Communication preferences
  email_opt_in BOOLEAN DEFAULT true,
  sms_opt_in BOOLEAN DEFAULT false,
  marketing_opt_in BOOLEAN DEFAULT true,
  newsletter_subscribed BOOLEAN DEFAULT false,

  -- Purchase behavior
  purchase_frequency_days DECIMAL(10, 2),
  days_since_last_purchase INTEGER,
  expected_next_purchase_date TIMESTAMP WITH TIME ZONE,
  churn_risk_score DECIMAL(5, 2) DEFAULT 0,

  -- Customer satisfaction
  satisfaction_score DECIMAL(3, 2),
  nps_score INTEGER,
  last_survey_date TIMESTAMP WITH TIME ZONE,
  review_count INTEGER DEFAULT 0,
  avg_review_rating DECIMAL(3, 2),

  -- Support metrics
  support_ticket_count INTEGER DEFAULT 0,
  open_ticket_count INTEGER DEFAULT 0,
  resolved_ticket_count INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10, 2),

  -- Tags and custom fields
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Social media
  facebook_url VARCHAR(500),
  twitter_url VARCHAR(500),
  instagram_url VARCHAR(500),
  linkedin_url VARCHAR(500),

  -- Company information (B2B)
  company_name VARCHAR(200),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  job_title VARCHAR(200),

  -- Integration
  external_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  shopify_customer_id VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for customers
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_lifetime_value ON customers(lifetime_value DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_customers_last_purchase ON customers(last_purchase_date DESC) WHERE deleted_at IS NULL;

-- Enable RLS for customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers
CREATE POLICY "Users can view their own customers"
  ON customers FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own customers"
  ON customers FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Table: data_exports
-- Purpose: Data export job management with scheduling and format support
-- =====================================================================================
CREATE TABLE IF NOT EXISTS data_exports (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  export_name VARCHAR(500) NOT NULL,
  description TEXT,

  -- Export configuration
  export_format VARCHAR(50) NOT NULL DEFAULT 'csv'
    CHECK (export_format IN ('csv', 'json', 'xml', 'pdf', 'xlsx', 'sql', 'parquet', 'avro')),
  export_type VARCHAR(50) NOT NULL DEFAULT 'manual'
    CHECK (export_type IN ('manual', 'scheduled', 'automated', 'api_triggered', 'webhook')),
  data_source VARCHAR(100) NOT NULL
    CHECK (data_source IN ('users', 'customers', 'transactions', 'analytics', 'inventory', 'logs', 'reports', 'orders', 'products', 'other')),

  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'scheduled', 'cancelled', 'expired')),
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Record metrics
  total_records INTEGER DEFAULT 0,
  processed_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  record_filter JSONB,

  -- File details
  file_size_bytes BIGINT DEFAULT 0,
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  file_path VARCHAR(1000),
  download_url VARCHAR(1000),
  cloud_storage_url VARCHAR(1000),

  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,

  -- Requestor information
  requested_by_name VARCHAR(200),
  requested_by_email VARCHAR(255),

  -- Security and compression
  is_encrypted BOOLEAN DEFAULT false,
  is_compressed BOOLEAN DEFAULT false,
  encryption_algorithm VARCHAR(50),
  compression_algorithm VARCHAR(50),
  password_protected BOOLEAN DEFAULT false,

  -- Scheduling
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(100),
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,

  -- Email delivery
  send_email_notification BOOLEAN DEFAULT false,
  email_recipients TEXT[],
  email_sent BOOLEAN DEFAULT false,

  -- Error handling
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Filters and options
  include_columns TEXT[],
  exclude_columns TEXT[],
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  custom_query TEXT,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  export_config JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for data_exports
CREATE INDEX IF NOT EXISTS idx_data_exports_user_id ON data_exports(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_data_exports_status ON data_exports(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_data_exports_format ON data_exports(export_format) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_data_exports_scheduled ON data_exports(scheduled_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_data_exports_expires ON data_exports(expires_at) WHERE deleted_at IS NULL;

-- Enable RLS for data_exports
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_exports
CREATE POLICY "Users can view their own exports"
  ON data_exports FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own exports"
  ON data_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports"
  ON data_exports FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own exports"
  ON data_exports FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Table: deployments
-- Purpose: Application deployment tracking with environment and rollback management
-- =====================================================================================
CREATE TABLE IF NOT EXISTS deployments (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deployment_name VARCHAR(500) NOT NULL,
  version VARCHAR(100) NOT NULL,

  -- Environment
  environment VARCHAR(50) NOT NULL DEFAULT 'development'
    CHECK (environment IN ('production', 'staging', 'development', 'testing', 'qa', 'sandbox', 'preview')),

  -- Status
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'rolled_back', 'cancelled', 'skipped')),
  deployment_state VARCHAR(50)
    CHECK (deployment_state IN ('queued', 'building', 'deploying', 'testing', 'verifying', 'completed', 'failed')),

  -- Git information
  branch VARCHAR(200),
  commit_hash VARCHAR(100),
  commit_message TEXT,
  commit_author VARCHAR(200),
  repository_url VARCHAR(500),

  -- Deployment details
  deploy_type VARCHAR(50)
    CHECK (deploy_type IN ('full', 'incremental', 'rollback', 'hotfix', 'canary', 'blue_green', 'rolling')),
  deployment_strategy VARCHAR(50)
    CHECK (deployment_strategy IN ('standard', 'blue_green', 'canary', 'rolling', 'recreate', 'custom')),

  -- Timing
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,

  -- Deployed by
  deployed_by_id UUID REFERENCES auth.users(id),
  deployed_by_name VARCHAR(200),
  deployed_by_email VARCHAR(255),

  -- Server and traffic metrics
  server_count INTEGER DEFAULT 0,
  healthy_servers INTEGER DEFAULT 0,
  unhealthy_servers INTEGER DEFAULT 0,
  traffic_percentage DECIMAL(5, 2) DEFAULT 100,
  target_instances INTEGER,
  active_instances INTEGER DEFAULT 0,

  -- Build information
  build_id VARCHAR(100),
  build_number INTEGER,
  build_url VARCHAR(500),
  artifact_url VARCHAR(500),
  docker_image VARCHAR(500),
  docker_tag VARCHAR(100),

  -- Health checks
  health_check_passed BOOLEAN,
  health_check_url VARCHAR(500),
  health_check_count INTEGER DEFAULT 0,
  last_health_check_at TIMESTAMP WITH TIME ZONE,

  -- Rollback information
  rollback_to_version VARCHAR(100),
  rollback_reason TEXT,
  can_rollback BOOLEAN DEFAULT true,
  auto_rollback_enabled BOOLEAN DEFAULT false,

  -- Error tracking
  error_message TEXT,
  error_code VARCHAR(50),
  error_logs TEXT,
  failed_steps TEXT[],

  -- Metrics
  request_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  error_rate DECIMAL(5, 2) DEFAULT 0,
  avg_response_time_ms DECIMAL(10, 2),
  cpu_usage_percentage DECIMAL(5, 2),
  memory_usage_percentage DECIMAL(5, 2),

  -- Notifications
  send_notifications BOOLEAN DEFAULT true,
  notification_channels TEXT[],
  notifications_sent BOOLEAN DEFAULT false,

  -- Approval workflow
  requires_approval BOOLEAN DEFAULT false,
  approved_by_id UUID REFERENCES auth.users(id),
  approved_by_name VARCHAR(200),
  approved_at TIMESTAMP WITH TIME ZONE,

  -- Environment variables
  environment_variables JSONB DEFAULT '{}'::jsonb,
  secrets_injected BOOLEAN DEFAULT false,

  -- Metadata
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  deployment_config JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for deployments
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_version ON deployments(version) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_branch ON deployments(branch) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deployments_started ON deployments(started_at DESC) WHERE deleted_at IS NULL;

-- Enable RLS for deployments
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployments
CREATE POLICY "Users can view their own deployments"
  ON deployments FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own deployments"
  ON deployments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deployments"
  ON deployments FOR UPDATE
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can soft delete their own deployments"
  ON deployments FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================================================
-- Enable Realtime
-- =====================================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE data_exports;
ALTER PUBLICATION supabase_realtime ADD TABLE deployments;
