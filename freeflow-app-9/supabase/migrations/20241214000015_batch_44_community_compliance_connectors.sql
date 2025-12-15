-- Batch 44: Community, Compliance & Connectors
-- Tables: community, compliance, connectors
-- Created: December 14, 2024

-- ================================================
-- COMMUNITY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS community (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Community Details
  community_name VARCHAR(500) NOT NULL,
  description TEXT,
  community_type VARCHAR(50) NOT NULL DEFAULT 'public'
    CHECK (community_type IN ('public', 'private', 'invite_only', 'premium', 'enterprise', 'beta')),

  -- Membership
  member_count INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  pending_requests INTEGER DEFAULT 0,
  max_members INTEGER,
  allow_join_requests BOOLEAN DEFAULT true,
  require_approval BOOLEAN DEFAULT false,

  -- Posts & Content
  post_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  discussion_count INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  reaction_count INTEGER DEFAULT 0,
  engagement_score DECIMAL(10, 2) DEFAULT 0,
  engagement_rate DECIMAL(5, 2),

  -- Activity Tracking
  daily_active_users INTEGER DEFAULT 0,
  weekly_active_users INTEGER DEFAULT 0,
  monthly_active_users INTEGER DEFAULT 0,
  last_post_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,

  -- Moderation
  moderator_count INTEGER DEFAULT 0,
  moderators JSONB DEFAULT '[]'::jsonb,
  admin_count INTEGER DEFAULT 0,
  admins JSONB DEFAULT '[]'::jsonb,
  banned_users JSONB DEFAULT '[]'::jsonb,
  banned_count INTEGER DEFAULT 0,

  -- Rules & Guidelines
  rules JSONB DEFAULT '[]'::jsonb,
  guidelines TEXT,
  code_of_conduct TEXT,
  enforce_rules BOOLEAN DEFAULT true,

  -- Features
  enable_posts BOOLEAN DEFAULT true,
  enable_comments BOOLEAN DEFAULT true,
  enable_discussions BOOLEAN DEFAULT true,
  enable_polls BOOLEAN DEFAULT false,
  enable_events BOOLEAN DEFAULT false,
  enable_announcements BOOLEAN DEFAULT true,
  enable_reactions BOOLEAN DEFAULT true,
  enable_file_sharing BOOLEAN DEFAULT true,

  -- Content Moderation
  auto_moderation BOOLEAN DEFAULT false,
  moderation_queue_count INTEGER DEFAULT 0,
  flagged_content_count INTEGER DEFAULT 0,
  removed_content_count INTEGER DEFAULT 0,
  spam_filter_enabled BOOLEAN DEFAULT true,

  -- Privacy & Access
  is_public BOOLEAN DEFAULT true,
  is_searchable BOOLEAN DEFAULT true,
  is_indexed BOOLEAN DEFAULT true,
  require_verification BOOLEAN DEFAULT false,
  minimum_karma INTEGER DEFAULT 0,

  -- Gamification
  enable_points BOOLEAN DEFAULT false,
  enable_badges BOOLEAN DEFAULT false,
  enable_leaderboard BOOLEAN DEFAULT false,
  total_points_awarded BIGINT DEFAULT 0,

  -- Notifications
  notify_new_members BOOLEAN DEFAULT true,
  notify_new_posts BOOLEAN DEFAULT false,
  notify_mentions BOOLEAN DEFAULT true,
  notification_settings JSONB DEFAULT '{}'::jsonb,

  -- Analytics
  growth_rate DECIMAL(5, 2),
  retention_rate DECIMAL(5, 2),
  churn_rate DECIMAL(5, 2),
  avg_session_duration INTEGER,

  -- Categories & Tags
  category VARCHAR(100),
  tags TEXT[],
  topics JSONB DEFAULT '[]'::jsonb,

  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  theme JSONB DEFAULT '{}'::jsonb,
  custom_css TEXT,

  -- Contact & Links
  website_url TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  contact_email VARCHAR(500),

  -- Subscription & Premium
  is_premium BOOLEAN DEFAULT false,
  subscription_tier VARCHAR(50),
  subscription_price DECIMAL(10, 2),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'archived', 'suspended', 'deleted')),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Metadata
  settings JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT community_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_community_user_id ON community(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_type ON community(community_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_status ON community(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_community_public ON community(is_public) WHERE deleted_at IS NULL;

ALTER TABLE community ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own community" ON community FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own community" ON community FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own community" ON community FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own community" ON community FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE community;

-- ================================================
-- COMPLIANCE TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Compliance Details
  compliance_name VARCHAR(500) NOT NULL,
  description TEXT,
  compliance_type VARCHAR(50) NOT NULL DEFAULT 'regulatory'
    CHECK (compliance_type IN ('regulatory', 'legal', 'industry', 'internal', 'security', 'privacy', 'data_protection', 'financial')),

  -- Framework & Standards
  framework VARCHAR(100),
  standard VARCHAR(100),
  regulation_name VARCHAR(500),
  regulation_code VARCHAR(100),
  jurisdiction VARCHAR(200),

  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'compliant', 'non_compliant', 'partially_compliant', 'under_review', 'expired')),
  compliance_status VARCHAR(50),
  is_compliant BOOLEAN DEFAULT false,
  compliance_score DECIMAL(5, 2),
  compliance_percentage DECIMAL(5, 2),

  -- Requirements
  total_requirements INTEGER DEFAULT 0,
  met_requirements INTEGER DEFAULT 0,
  pending_requirements INTEGER DEFAULT 0,
  failed_requirements INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '[]'::jsonb,

  -- Audit & Review
  last_audit_date TIMESTAMPTZ,
  next_audit_date TIMESTAMPTZ,
  audit_frequency VARCHAR(50),
  audit_count INTEGER DEFAULT 0,
  audit_history JSONB DEFAULT '[]'::jsonb,

  -- Assessments
  last_assessment_date TIMESTAMPTZ,
  next_assessment_date TIMESTAMPTZ,
  assessment_score DECIMAL(5, 2),
  assessment_results JSONB DEFAULT '{}'::jsonb,

  -- Certifications
  certification_name VARCHAR(500),
  certification_number VARCHAR(200),
  certified_by VARCHAR(500),
  certification_date TIMESTAMPTZ,
  certification_expiry TIMESTAMPTZ,
  is_certified BOOLEAN DEFAULT false,
  recertification_required BOOLEAN DEFAULT false,

  -- Deadlines
  due_date TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  renewal_date TIMESTAMPTZ,
  days_until_expiry INTEGER,
  is_expired BOOLEAN DEFAULT false,
  is_expiring_soon BOOLEAN DEFAULT false,

  -- Documentation
  documentation_url TEXT,
  evidence_urls JSONB DEFAULT '[]'::jsonb,
  policy_document_url TEXT,
  procedure_document_url TEXT,
  documentation_complete BOOLEAN DEFAULT false,

  -- Responsible Party
  owner_id UUID REFERENCES auth.users(id),
  owner_name VARCHAR(500),
  assigned_to UUID REFERENCES auth.users(id),
  assigned_team VARCHAR(200),

  -- Risk Management
  risk_level VARCHAR(50) DEFAULT 'medium'
    CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_score DECIMAL(5, 2),
  impact_level VARCHAR(50),
  mitigation_plan TEXT,

  -- Controls
  control_count INTEGER DEFAULT 0,
  controls JSONB DEFAULT '[]'::jsonb,
  control_effectiveness DECIMAL(5, 2),

  -- Incidents & Violations
  violation_count INTEGER DEFAULT 0,
  violations JSONB DEFAULT '[]'::jsonb,
  incident_count INTEGER DEFAULT 0,
  incidents JSONB DEFAULT '[]'::jsonb,
  last_violation_date TIMESTAMPTZ,

  -- Remediation
  remediation_required BOOLEAN DEFAULT false,
  remediation_plan TEXT,
  remediation_status VARCHAR(50),
  remediation_deadline TIMESTAMPTZ,
  remediation_cost DECIMAL(12, 2),

  -- Penalties & Fines
  penalty_amount DECIMAL(12, 2),
  fine_amount DECIMAL(12, 2),
  total_penalties DECIMAL(12, 2) DEFAULT 0,

  -- Training
  training_required BOOLEAN DEFAULT false,
  training_completion_rate DECIMAL(5, 2),
  trained_employees INTEGER DEFAULT 0,
  total_employees INTEGER DEFAULT 0,

  -- Monitoring
  continuous_monitoring BOOLEAN DEFAULT false,
  monitoring_frequency VARCHAR(50),
  last_monitored_at TIMESTAMPTZ,
  monitoring_alerts INTEGER DEFAULT 0,

  -- Reporting
  reporting_frequency VARCHAR(50),
  last_report_date TIMESTAMPTZ,
  next_report_date TIMESTAMPTZ,
  report_submitted BOOLEAN DEFAULT false,

  -- Third Party
  vendor_compliance_required BOOLEAN DEFAULT false,
  vendor_count INTEGER DEFAULT 0,
  vendors JSONB DEFAULT '[]'::jsonb,

  -- Cost
  implementation_cost DECIMAL(12, 2),
  annual_cost DECIMAL(12, 2),
  total_cost DECIMAL(12, 2),

  -- Notifications
  notify_on_expiry BOOLEAN DEFAULT true,
  notify_on_violation BOOLEAN DEFAULT true,
  notification_days_before INTEGER DEFAULT 30,

  -- Metadata
  priority VARCHAR(50),
  category VARCHAR(100),
  tags TEXT[],
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT compliance_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_compliance_user_id ON compliance(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_type ON compliance(compliance_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_status ON compliance(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_compliance_expiry ON compliance(expiry_date) WHERE deleted_at IS NULL;

ALTER TABLE compliance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own compliance" ON compliance FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own compliance" ON compliance FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compliance" ON compliance FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own compliance" ON compliance FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE compliance;

-- ================================================
-- CONNECTORS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Connector Details
  connector_name VARCHAR(500) NOT NULL,
  description TEXT,
  connector_type VARCHAR(50) NOT NULL DEFAULT 'api'
    CHECK (connector_type IN ('api', 'webhook', 'oauth', 'database', 'cloud_service', 'saas', 'messaging', 'payment', 'analytics')),

  -- Provider Information
  provider_name VARCHAR(200) NOT NULL,
  provider_url TEXT,
  provider_category VARCHAR(100),

  -- Connection Details
  connection_type VARCHAR(50) DEFAULT 'rest_api'
    CHECK (connection_type IN ('rest_api', 'graphql', 'soap', 'grpc', 'websocket', 'webhook', 'database', 'ftp', 'sftp')),
  protocol VARCHAR(50),

  -- Endpoint Configuration
  base_url TEXT,
  api_endpoint TEXT,
  webhook_url TEXT,
  callback_url TEXT,

  -- Authentication
  auth_type VARCHAR(50) NOT NULL DEFAULT 'api_key'
    CHECK (auth_type IN ('api_key', 'oauth', 'oauth2', 'basic', 'bearer', 'jwt', 'custom', 'none')),
  api_key VARCHAR(500),
  api_secret VARCHAR(500),
  access_token VARCHAR(1000),
  refresh_token VARCHAR(1000),
  token_expires_at TIMESTAMPTZ,
  client_id VARCHAR(500),
  client_secret VARCHAR(500),

  -- Configuration
  config JSONB DEFAULT '{}'::jsonb,
  headers JSONB DEFAULT '{}'::jsonb,
  query_params JSONB DEFAULT '{}'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,

  -- Status & Health
  status VARCHAR(50) DEFAULT 'inactive'
    CHECK (status IN ('active', 'inactive', 'error', 'disabled', 'testing', 'deprecated')),
  is_active BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Health Monitoring
  health_status VARCHAR(50) DEFAULT 'unknown'
    CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
  last_health_check TIMESTAMPTZ,
  next_health_check TIMESTAMPTZ,
  health_check_frequency INTEGER DEFAULT 300,
  uptime_percentage DECIMAL(5, 2),

  -- Usage Tracking
  request_count BIGINT DEFAULT 0,
  success_count BIGINT DEFAULT 0,
  error_count BIGINT DEFAULT 0,
  last_request_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_error_at TIMESTAMPTZ,

  -- Rate Limiting
  rate_limit INTEGER,
  rate_limit_window VARCHAR(50),
  requests_today INTEGER DEFAULT 0,
  requests_this_month BIGINT DEFAULT 0,
  quota_limit BIGINT,
  quota_used BIGINT DEFAULT 0,
  quota_reset_at TIMESTAMPTZ,

  -- Performance
  avg_response_time INTEGER,
  min_response_time INTEGER,
  max_response_time INTEGER,
  total_response_time BIGINT DEFAULT 0,

  -- Reliability
  success_rate DECIMAL(5, 2),
  error_rate DECIMAL(5, 2),
  availability_percentage DECIMAL(5, 2),

  -- Error Handling
  retry_enabled BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  retry_delay INTEGER DEFAULT 1000,
  last_error TEXT,
  last_error_code VARCHAR(100),
  error_log JSONB DEFAULT '[]'::jsonb,

  -- Webhooks
  webhook_events TEXT[],
  webhook_secret VARCHAR(500),
  webhook_enabled BOOLEAN DEFAULT false,

  -- Sync & Data
  sync_enabled BOOLEAN DEFAULT false,
  sync_frequency VARCHAR(50),
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  sync_status VARCHAR(50),
  records_synced BIGINT DEFAULT 0,

  -- Mapping & Transformation
  field_mapping JSONB DEFAULT '{}'::jsonb,
  data_transformation JSONB DEFAULT '{}'::jsonb,

  -- Versioning
  api_version VARCHAR(50),
  connector_version VARCHAR(50),
  deprecated BOOLEAN DEFAULT false,
  deprecation_date TIMESTAMPTZ,

  -- Security
  encryption_enabled BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT true,
  certificate_url TEXT,
  certificate_expires_at TIMESTAMPTZ,
  ip_whitelist TEXT[],

  -- Logging
  logging_enabled BOOLEAN DEFAULT true,
  log_level VARCHAR(50) DEFAULT 'info',
  log_retention_days INTEGER DEFAULT 30,

  -- Notifications
  notify_on_error BOOLEAN DEFAULT true,
  notify_on_disconnect BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '[]'::jsonb,

  -- Billing
  is_paid BOOLEAN DEFAULT false,
  billing_tier VARCHAR(50),
  monthly_cost DECIMAL(10, 2),

  -- Environment
  environment VARCHAR(50) DEFAULT 'production'
    CHECK (environment IN ('development', 'staging', 'production', 'testing')),

  -- Dependencies
  dependencies JSONB DEFAULT '[]'::jsonb,
  depends_on TEXT[],

  -- Metadata
  category VARCHAR(100),
  tags TEXT[],
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT connectors_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_connectors_user_id ON connectors(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_connectors_type ON connectors(connector_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_connectors_provider ON connectors(provider_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_connectors_status ON connectors(status) WHERE deleted_at IS NULL;

ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own connectors" ON connectors FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own connectors" ON connectors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own connectors" ON connectors FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own connectors" ON connectors FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE connectors;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_community_updated_at BEFORE UPDATE ON community
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_updated_at BEFORE UPDATE ON compliance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connectors_updated_at BEFORE UPDATE ON connectors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
