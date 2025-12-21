
  -- Trigger Settings
  trigger_type VARCHAR(50) DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'push', 'pull_request', 'schedule', 'tag', 'webhook', 'api')),
  trigger_branch VARCHAR(200),
  trigger_pattern VARCHAR(500),
  trigger_schedule VARCHAR(100),

  -- Execution
  last_run_at TIMESTAMPTZ,
  next_scheduled_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER,
  total_duration_seconds BIGINT DEFAULT 0,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'disabled', 'failed', 'archived')),
  last_status VARCHAR(50)
    CHECK (last_status IN ('success', 'failure', 'running', 'cancelled', 'skipped', 'pending')),
  is_running BOOLEAN DEFAULT false,

  -- Build Information
  last_build_number INTEGER,
  last_build_commit VARCHAR(100),
  last_build_branch VARCHAR(200),
  last_build_tag VARCHAR(200),

  -- Artifacts
  artifacts JSONB DEFAULT '[]'::jsonb,
  artifact_storage_path TEXT,
  artifact_retention_days INTEGER DEFAULT 30,

  -- Deployment
  deployment_target VARCHAR(100),
  deployment_environment VARCHAR(50),
  deployment_strategy VARCHAR(50),
  rollback_enabled BOOLEAN DEFAULT true,

  -- Testing
  test_coverage DECIMAL(5, 2),
  test_pass_rate DECIMAL(5, 2),
  total_tests INTEGER DEFAULT 0,
  passed_tests INTEGER DEFAULT 0,
  failed_tests INTEGER DEFAULT 0,

  -- Quality Gates
  quality_gates JSONB DEFAULT '[]'::jsonb,
  quality_score DECIMAL(5, 2),
  quality_passed BOOLEAN DEFAULT false,

  -- Notifications
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notification_channels JSONB DEFAULT '[]'::jsonb,

  -- Integration
  repository_url TEXT,
  repository_provider VARCHAR(50),
  integration_type VARCHAR(50),
  integration_config JSONB DEFAULT '{}'::jsonb,

  -- Logs
  logs_url TEXT,
  logs_retention_days INTEGER DEFAULT 90,
  last_log_size_bytes BIGINT,

  -- Performance
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  resource_usage JSONB DEFAULT '{}'::jsonb,

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT ci_cd_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: client_contacts
-- Source: 20241215000001_batch_72_clients_files_gallery.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: client_reviews
-- Source: V8_client_review_workflows_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Associations
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
    
    -- Review details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Workflow state
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft', 'in_review', 'approved', 'rejected', 'changes_requested', 'cancelled'
    )),
    current_stage UUID, -- References review_stages.id
    
    -- Timing
    deadline TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Configuration
    settings JSONB DEFAULT '{
        "allow_comments": true,
        "require_all_approvals": true,
        "auto_advance_stages": false,
        "send_notifications": true
    }',
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation
    CONSTRAINT valid_status_progression CHECK (
        (status = 'draft' AND started_at IS NULL) OR
        (status != 'draft' AND started_at IS NOT NULL)
    )
);


-- =====================================================
-- Table: client_satisfaction_metrics
-- Source: 20240327000001_freelancer_analytics.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_satisfaction_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
    quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
    timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: client_shares
-- Source: 20240326000001_enhanced_sharing.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS client_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    client_id UUID NOT NULL,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"view": true, "comment": true, "download": false}',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: cloud_storage
-- Source: 20241214000014_batch_43_cicd_storage_collab.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS cloud_storage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Details
  file_name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  file_path TEXT NOT NULL,
  full_path TEXT,

  -- File Properties
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  mime_type VARCHAR(200),
  extension VARCHAR(50),

  -- Storage
  storage_provider VARCHAR(50) DEFAULT 'supabase'
    CHECK (storage_provider IN ('supabase', 's3', 'gcs', 'azure', 'cloudinary', 'local')),
  storage_bucket VARCHAR(200),
  storage_region VARCHAR(100),
  storage_class VARCHAR(50),

  -- Access
  access_level VARCHAR(50) DEFAULT 'private'
    CHECK (access_level IN ('public', 'private', 'shared', 'restricted')),
  public_url TEXT,
  signed_url TEXT,
  signed_url_expires_at TIMESTAMPTZ,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[],
  share_token VARCHAR(200),
  share_expires_at TIMESTAMPTZ,
  share_link TEXT,

  -- Permissions
  permissions JSONB DEFAULT '{}'::jsonb,
  can_view BOOLEAN DEFAULT true,
  can_download BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,

  -- Versioning
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  is_latest_version BOOLEAN DEFAULT true,
  parent_version_id UUID REFERENCES cloud_storage(id),

  -- Content
  checksum VARCHAR(100),
  etag VARCHAR(200),
  content_hash VARCHAR(100),

  -- Media Metadata
  is_image BOOLEAN DEFAULT false,
  is_video BOOLEAN DEFAULT false,
  is_audio BOOLEAN DEFAULT false,
  is_document BOOLEAN DEFAULT false,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Processing
  processing_status VARCHAR(50) DEFAULT 'completed'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Optimization
  is_optimized BOOLEAN DEFAULT false,
  optimized_url TEXT,
  optimized_size BIGINT,
  compression_ratio DECIMAL(5, 2),

  -- Transcoding (for media)
  transcoding_status VARCHAR(50),
  transcoded_formats TEXT[],
  transcoded_urls JSONB DEFAULT '{}'::jsonb,

  -- Organization
  folder VARCHAR(500),
  category VARCHAR(100),
  tags TEXT[],
  labels JSONB DEFAULT '[]'::jsonb,

  -- Usage Tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  last_downloaded_at TIMESTAMPTZ,

  -- Backup
  is_backed_up BOOLEAN DEFAULT false,
  backup_location TEXT,
  last_backup_at TIMESTAMPTZ,

  -- Encryption
  is_encrypted BOOLEAN DEFAULT false,
  encryption_algorithm VARCHAR(50),
  encryption_key_id VARCHAR(200),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  exif_data JSONB DEFAULT '{}'::jsonb,
  custom_metadata JSONB DEFAULT '{}'::jsonb,

  -- Lifecycle
  expires_at TIMESTAMPTZ,
  auto_delete_after_days INTEGER,
  retention_period_days INTEGER,

  -- Source
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_from VARCHAR(100),
  upload_ip VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'archived', 'deleted', 'quarantined')),
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES auth.users(id),

  -- Virus Scan
  is_scanned BOOLEAN DEFAULT false,
  scan_status VARCHAR(50),
  scan_result VARCHAR(50),
  scanned_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT cloud_storage_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: collab_document_comments
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collab_document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE SET NULL,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Position in document
  position_type TEXT DEFAULT 'point', -- point, range, selection
  position_data JSONB, -- x, y, or selection range

  -- Annotations
  annotation_type TEXT, -- highlight, note, question, suggestion
  annotation_color TEXT,

  -- Threading
  parent_comment_id UUID REFERENCES collab_document_comments(id) ON DELETE CASCADE,
  thread_count INTEGER DEFAULT 0,

  -- Status
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,

  -- Reactions
  reactions JSONB DEFAULT '{}',

  -- Mentions
  mentions UUID[] DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: collaboration
-- Source: 20241214000014_batch_43_cicd_storage_collab.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Details
  session_name VARCHAR(500) NOT NULL,
  description TEXT,
  session_type VARCHAR(50) NOT NULL DEFAULT 'document'
    CHECK (session_type IN ('document', 'whiteboard', 'code', 'design', 'video', 'audio', 'screen_share', 'meeting')),

  -- Participants
  host_id UUID NOT NULL REFERENCES auth.users(id),
  participants JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER DEFAULT 0,
  max_participants INTEGER DEFAULT 10,
  active_participants INTEGER DEFAULT 0,

  -- Access Control
  access_type VARCHAR(50) DEFAULT 'invite_only'
    CHECK (access_type IN ('public', 'invite_only', 'password_protected', 'restricted')),
  access_code VARCHAR(100),
  invite_link TEXT,
  password_hash VARCHAR(500),

  -- Permissions
  permissions JSONB DEFAULT '{}'::jsonb,
  default_role VARCHAR(50) DEFAULT 'viewer'
    CHECK (default_role IN ('owner', 'editor', 'commenter', 'viewer')),
  can_invite_others BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  can_comment BOOLEAN DEFAULT true,

  -- Real-time Features
  is_active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Presence
  active_users JSONB DEFAULT '[]'::jsonb,
  user_cursors JSONB DEFAULT '{}'::jsonb,
  user_selections JSONB DEFAULT '{}'::jsonb,

  -- Content
  content_type VARCHAR(50),
  content_id UUID,
  content_data JSONB DEFAULT '{}'::jsonb,
  content_url TEXT,

  -- Changes & History
  changes JSONB DEFAULT '[]'::jsonb,
  change_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,

  -- Comments & Annotations
  comments JSONB DEFAULT '[]'::jsonb,
  comment_count INTEGER DEFAULT 0,
  annotations JSONB DEFAULT '[]'::jsonb,
  annotation_count INTEGER DEFAULT 0,

  -- Chat
  chat_enabled BOOLEAN DEFAULT true,
  chat_messages JSONB DEFAULT '[]'::jsonb,
  message_count INTEGER DEFAULT 0,

  -- Video/Audio
  video_enabled BOOLEAN DEFAULT false,
  audio_enabled BOOLEAN DEFAULT false,
  screen_share_enabled BOOLEAN DEFAULT false,
  recording_enabled BOOLEAN DEFAULT false,

  -- Recording
  is_recording BOOLEAN DEFAULT false,
  recording_url TEXT,
  recording_duration_seconds INTEGER,
  recording_size_bytes BIGINT,

  -- Notifications
  notify_on_join BOOLEAN DEFAULT true,
  notify_on_change BOOLEAN DEFAULT false,
  notify_on_comment BOOLEAN DEFAULT true,
  notification_settings JSONB DEFAULT '{}'::jsonb,

  -- Activity Tracking
  last_activity_at TIMESTAMPTZ,
  activity_log JSONB DEFAULT '[]'::jsonb,
  total_edits INTEGER DEFAULT 0,
  total_comments INTEGER DEFAULT 0,

  -- Conflict Resolution
  conflict_resolution_strategy VARCHAR(50) DEFAULT 'last_write_wins',
  has_conflicts BOOLEAN DEFAULT false,
  conflicts JSONB DEFAULT '[]'::jsonb,

  -- Integration
  integrated_tools TEXT[],
  webhook_url TEXT,
  api_enabled BOOLEAN DEFAULT false,

  -- Scheduling
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  is_scheduled BOOLEAN DEFAULT false,

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'scheduled', 'in_progress', 'paused', 'ended', 'archived')),

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,
  theme VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en',

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT collaboration_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: collaboration_events
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE SET NULL,
  document_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_category TEXT, -- session, edit, comment, participant, system

  -- Event data
  event_data JSONB DEFAULT '{}',

  -- CRDT operation (if applicable)
  crdt_operation JSONB,
  vector_clock_before JSONB,
  vector_clock_after JSONB,

  -- Context
  participant_id UUID REFERENCES session_participants(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: collaboration_invites
-- Source: 20251211000002_collaboration_sessions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invite target (either user_id or email)
  invited_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_email TEXT,

  -- Invite details
  role participant_role NOT NULL DEFAULT 'editor',
  message TEXT,

  -- Token for email invites
  invite_token TEXT UNIQUE,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  -- Timestamps
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invites_target_check CHECK (
    (invited_user_id IS NOT NULL AND invited_email IS NULL) OR
    (invited_user_id IS NULL AND invited_email IS NOT NULL)
  ),
  CONSTRAINT invites_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'revoked'))
);


-- =====================================================
-- Table: community
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
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


-- =====================================================
-- Table: community_analytics
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    total_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    trending_tags TEXT[],
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);


-- =====================================================
-- Table: community_likes
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);


-- =====================================================
-- Table: community_shares
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS community_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: compliance
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
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


-- =====================================================
-- Table: compliance_checks
-- Source: 20241214000021_batch_50_logs_audit_permissions.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Check Details
  check_name VARCHAR(200) NOT NULL,
  framework VARCHAR(50) NOT NULL,
  requirement VARCHAR(200),
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('passing', 'failing', 'warning', 'pending', 'not_applicable')),
  score DECIMAL(5, 2) DEFAULT 0,
  max_score DECIMAL(5, 2) DEFAULT 100,

  -- Results
  issues_found INTEGER DEFAULT 0,
  critical_issues INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  passed_controls INTEGER DEFAULT 0,
  total_controls INTEGER DEFAULT 0,

  -- Evidence
  evidence JSONB,
  findings JSONB,
  recommendations JSONB,

  -- Remediation
  remediation_required BOOLEAN DEFAULT false,
  remediation_status VARCHAR(50),
  remediation_due_date DATE,
  remediation_assigned_to VARCHAR(255),

  -- Schedule
  check_frequency VARCHAR(20) DEFAULT 'daily',
  next_check_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  last_check_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: compliance_findings
-- Source: 20251127_audit_trail_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES compliance_reports(id) ON DELETE CASCADE,

  -- Finding Details
  category TEXT NOT NULL CHECK (category IN ('security', 'privacy', 'access', 'data_integrity')),
  severity severity_level NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,

  -- Affected Logs
  affected_log_ids UUID[] DEFAULT ARRAY[]::UUID[],
  affected_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: compliance_reports
-- Source: 20251127_audit_trail_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Report Details
  name TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metrics
  total_logs INTEGER NOT NULL DEFAULT 0,
  critical_events INTEGER NOT NULL DEFAULT 0,
  security_incidents INTEGER NOT NULL DEFAULT 0,
  data_changes INTEGER NOT NULL DEFAULT 0,
  user_logins INTEGER NOT NULL DEFAULT 0,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  export_activities INTEGER NOT NULL DEFAULT 0,
  permission_changes INTEGER NOT NULL DEFAULT 0,

  -- Compliance Score (0-100)
  compliance_score INTEGER NOT NULL DEFAULT 100 CHECK (compliance_score >= 0 AND compliance_score <= 100),

  -- Report Data
  summary JSONB DEFAULT '{}'::jsonb,
  findings_count INTEGER NOT NULL DEFAULT 0,

  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: connectors
-- Source: 20241214000015_batch_44_community_compliance_connectors.sql
-- =====================================================
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


-- =====================================================
-- Table: content
-- Source: 20241214000012_batch_41_content_studio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content Details
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  content_type VARCHAR(50) NOT NULL DEFAULT 'article'
    CHECK (content_type IN ('article', 'blog', 'page', 'post', 'video', 'audio', 'image', 'document', 'infographic', 'ebook', 'whitepaper', 'case_study')),

  -- Content Body
  body TEXT,
  body_html TEXT,
  excerpt VARCHAR(1000),
  description TEXT,

  -- Publishing
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_review', 'scheduled', 'published', 'archived', 'deleted')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,

  -- SEO
  meta_title VARCHAR(60),
  meta_description VARCHAR(160),
  meta_keywords TEXT[],
  canonical_url TEXT,
  og_title VARCHAR(95),
  og_description VARCHAR(200),
  og_image TEXT,
  twitter_card VARCHAR(50),

  -- Media
  featured_image TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  audio_url TEXT,
  gallery_images TEXT[],
  media_attachments JSONB DEFAULT '[]'::jsonb,

  -- Author & Attribution
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(300),
  contributors TEXT[],

  -- Categories & Tags
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[],
  topics TEXT[],

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  bookmark_count INTEGER DEFAULT 0,

  -- Reading Stats
  avg_read_time_seconds INTEGER,
  completion_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),

  -- Content Settings
  allow_comments BOOLEAN DEFAULT true,
  allow_sharing BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,

  -- Version Control
  version INTEGER DEFAULT 1,
  revision_notes TEXT,
  parent_content_id UUID REFERENCES content(id),

  -- Localization
  language VARCHAR(10) DEFAULT 'en',
  translations JSONB DEFAULT '{}'::jsonb,
  is_translated BOOLEAN DEFAULT false,

  -- Formatting
  text_format VARCHAR(50) DEFAULT 'html',
  table_of_contents JSONB DEFAULT '[]'::jsonb,
  word_count INTEGER,
  character_count INTEGER,

  -- Custom Fields
  custom_fields JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Workflow
  workflow_state VARCHAR(50),
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  approval_status VARCHAR(50),

  -- External Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT content_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: content_analytics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    title VARCHAR(500),
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_on_page NUMERIC(10,2),
    bounce_rate NUMERIC(5,2),
    engagement_rate NUMERIC(5,2),
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: content_studio
-- Source: 20241214000012_batch_41_content_studio.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS content_studio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Details
  project_name VARCHAR(500) NOT NULL,
  description TEXT,
  project_type VARCHAR(50) NOT NULL DEFAULT 'document'
    CHECK (project_type IN ('document', 'presentation', 'video', 'audio', 'design', 'animation', 'interactive', 'multi_media')),

  -- Content
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  raw_content TEXT,
  rendered_output TEXT,

  -- Canvas/Editor State
  canvas_state JSONB DEFAULT '{}'::jsonb,
  editor_state JSONB DEFAULT '{}'::jsonb,
  layers JSONB DEFAULT '[]'::jsonb,
  elements JSONB DEFAULT '[]'::jsonb,

  -- Dimensions & Settings
  width INTEGER,
  height INTEGER,
  aspect_ratio VARCHAR(20),
  resolution VARCHAR(20),
  background_color VARCHAR(20),
  theme VARCHAR(50),

  -- Assets & Media
  assets JSONB DEFAULT '[]'::jsonb,
  media_files TEXT[],
  fonts_used TEXT[],
  color_palette JSONB DEFAULT '[]'::jsonb,

  -- Templates & Presets
  template_id UUID,
  template_name VARCHAR(300),
  preset_id UUID,
  style_preset JSONB DEFAULT '{}'::jsonb,

  -- Collaboration
  collaborators TEXT[],
  shared_with TEXT[],
  permissions JSONB DEFAULT '{}'::jsonb,
  is_collaborative BOOLEAN DEFAULT false,

  -- Status & Progress
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'in_progress', 'review', 'approved', 'published', 'archived')),
  completion_percentage INTEGER DEFAULT 0,

  -- Version History
  version INTEGER DEFAULT 1,
  version_history JSONB DEFAULT '[]'::jsonb,
  auto_save_enabled BOOLEAN DEFAULT true,
  last_auto_saved_at TIMESTAMPTZ,

  -- Timeline & Scenes (for video/animation)
  timeline JSONB DEFAULT '[]'::jsonb,
  scenes JSONB DEFAULT '[]'::jsonb,
  duration_seconds INTEGER,
  frame_rate INTEGER,

  -- Audio Settings
  audio_tracks JSONB DEFAULT '[]'::jsonb,
  voice_over JSONB DEFAULT '{}'::jsonb,
  background_music TEXT,

  -- Effects & Transitions
  effects JSONB DEFAULT '[]'::jsonb,
  transitions JSONB DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '[]'::jsonb,

  -- Export Settings
  export_formats TEXT[],
  export_quality VARCHAR(50),
  export_settings JSONB DEFAULT '{}'::jsonb,
  last_exported_at TIMESTAMPTZ,

  -- AI Features
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_enhancements JSONB DEFAULT '{}'::jsonb,
  auto_generated_content TEXT,

  -- Tags & Organization
  tags TEXT[],
  category VARCHAR(100),
  folder VARCHAR(300),

  -- Custom Data
  custom_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT content_studio_user_id_idx CHECK (user_id IS NOT NULL)
);


-- =====================================================
-- Table: contracts
-- Source: 20241214000005_batch_34_business_finance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS contracts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  client_id UUID,
  project_id UUID,

  -- Contract Details
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  contract_type VARCHAR(50) NOT NULL DEFAULT 'service'
    CHECK (contract_type IN ('service', 'product', 'employment', 'nda', 'partnership', 'license', 'lease', 'custom')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending-review', 'pending-signature', 'active', 'completed', 'cancelled', 'expired', 'terminated', 'renewed')),

  -- Financial Terms
  contract_value DECIMAL(15, 2) DEFAULT 0.00,
  payment_schedule VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  signed_date DATE,
  effective_date DATE,
  termination_date DATE,
  renewal_date DATE,

  -- Parties
  party_a_name VARCHAR(255),
  party_a_email VARCHAR(255),
  party_a_address TEXT,
  party_a_signature VARCHAR(500),
  party_a_signed_at TIMESTAMPTZ,

  party_b_name VARCHAR(255),
  party_b_email VARCHAR(255),
  party_b_address TEXT,
  party_b_signature VARCHAR(500),
  party_b_signed_at TIMESTAMPTZ,

  -- Contract Terms
  terms TEXT NOT NULL,
  clauses JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Renewal & Termination
  is_auto_renewable BOOLEAN DEFAULT FALSE,
  renewal_notice_period_days INTEGER DEFAULT 30,
  termination_notice_period_days INTEGER DEFAULT 30,
  termination_clause TEXT,

  -- Tracking
  is_template BOOLEAN DEFAULT FALSE,
  template_id UUID REFERENCES contracts(id),
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  has_attachments BOOLEAN DEFAULT FALSE,
  document_url VARCHAR(500),

  -- Compliance
  requires_legal_review BOOLEAN DEFAULT FALSE,
  legal_review_status VARCHAR(50),
  legal_reviewer_id UUID REFERENCES auth.users(id),
  legal_review_date DATE,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: cost_tracking
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS cost_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    service TEXT NOT NULL,
    usage_type TEXT NOT NULL,
    quantity DECIMAL(10,4) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(10,4) NOT NULL,
    billing_period DATE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: courses
-- Source: 20241215000005_batch_76_faq_learning_widgets.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  instructor VARCHAR(255),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  format VARCHAR(20) DEFAULT 'video' CHECK (format IN ('video', 'text', 'interactive', 'live', 'mixed')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  category VARCHAR(100),
  duration_minutes INTEGER DEFAULT 0,
  lessons_count INTEGER DEFAULT 0,
  total_enrolled INTEGER DEFAULT 0,
  completed_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0,
  certificate_available BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url VARCHAR(500),
  preview_url VARCHAR(500),
  syllabus JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: creator_profiles
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    expertise TEXT[],
    portfolio_urls TEXT[],
    social_links JSONB DEFAULT '{}',
    achievements TEXT[],
    rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: creator_reviews
-- Source: 20240326000000_community_hub.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS creator_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: crm_activities
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  priority priority_level NOT NULL DEFAULT 'medium',
  status activity_status NOT NULL DEFAULT 'pending',
  duration INTEGER DEFAULT 0,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_contacts
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type contact_type NOT NULL DEFAULT 'lead',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  avatar TEXT,
  lead_status lead_status DEFAULT 'new',
  lead_source lead_source DEFAULT 'other',
  lead_score INTEGER NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  address JSONB DEFAULT '{}'::JSONB,
  social_profiles JSONB DEFAULT '{}'::JSONB,
  last_contacted_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_deals INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  lifetime_value DECIMAL(15, 2) DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_deal_products
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_deal_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES crm_deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  tax DECIMAL(5, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_deals
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  value DECIMAL(15, 2) NOT NULL DEFAULT 0,
  probability INTEGER NOT NULL DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  priority priority_level NOT NULL DEFAULT 'medium',
  description TEXT,
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::JSONB,
  lost_reason TEXT,
  won_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_leads
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status lead_status NOT NULL DEFAULT 'new',
  source lead_source NOT NULL DEFAULT 'other',
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  temperature TEXT NOT NULL DEFAULT 'cold' CHECK (temperature IN ('cold', 'warm', 'hot')),
  priority priority_level NOT NULL DEFAULT 'medium',
  estimated_value DECIMAL(15, 2) DEFAULT 0,
  estimated_close_date DATE,
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  notes TEXT[] DEFAULT ARRAY[]::TEXT[],
  assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: crm_notes
-- Source: crm_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES crm_deals(id) ON DELETE CASCADE,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: customer_ltv
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS customer_ltv (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_id VARCHAR(255) NOT NULL,
    segment VARCHAR(100),
    total_revenue NUMERIC(12,2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    first_purchase_date DATE,
    last_purchase_date DATE,
    predicted_ltv NUMERIC(12,2),
    ltv_score INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: customer_success
-- Source: 20241214000016_batch_45_courses_crm_customer_success.sql
-- =====================================================
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


-- =====================================================
-- Table: customers
-- Source: 20241214000017_batch_46_customers_data_export_deployments.sql
-- =====================================================
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


-- =====================================================
-- Table: daily_analytics
-- Source: 20240326000002_analytics_tracking.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_storage_used BIGINT DEFAULT 0,
    total_bandwidth_used BIGINT DEFAULT 0,
    total_processing_time INTEGER DEFAULT 0,
    total_cost DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);


-- =====================================================
-- Table: data_exports
-- Source: 20241214000017_batch_46_customers_data_export_deployments.sql
-- =====================================================
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


-- =====================================================
-- Table: dependencies
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  dependency_name VARCHAR(500) NOT NULL,
  predecessor_task VARCHAR(500) NOT NULL,
  successor_task VARCHAR(500) NOT NULL,

  -- Dependency Configuration
  dependency_type VARCHAR(50) DEFAULT 'finish-to-start'
    CHECK (dependency_type IN ('finish-to-start', 'start-to-start', 'finish-to-finish', 'start-to-finish')),
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'resolved', 'blocked', 'cancelled')),
  impact_level VARCHAR(50) DEFAULT 'medium'
    CHECK (impact_level IN ('critical', 'high', 'medium', 'low')),

  -- Assignment
  owner VARCHAR(200),
  team VARCHAR(100),
  assigned_to VARCHAR(200),

  -- Progress Tracking
  predecessor_progress DECIMAL(5, 2) DEFAULT 0,
  successor_progress DECIMAL(5, 2) DEFAULT 0,
  overall_progress DECIMAL(5, 2) DEFAULT 0,

  -- Timeline
  created_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  resolution_date TIMESTAMPTZ,
  days_remaining INTEGER DEFAULT 0,
  blocked_days INTEGER DEFAULT 0,
  total_duration_days INTEGER DEFAULT 0,

  -- Resolution
  resolution TEXT,
  blocker_reason TEXT,
  resolution_notes TEXT,

  -- Critical Path
  is_on_critical_path BOOLEAN DEFAULT false,
  critical_path_order INTEGER,
  slack_days INTEGER DEFAULT 0,

  -- Impact Analysis
  affected_tasks INTEGER DEFAULT 0,
  affected_teams INTEGER DEFAULT 0,
  estimated_delay_days INTEGER DEFAULT 0,
  risk_score DECIMAL(5, 2) DEFAULT 0,

  -- Metadata
  priority VARCHAR(50) DEFAULT 'medium',
  tags TEXT[],
  notes TEXT,
  external_reference VARCHAR(200),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: deployments
-- Source: 20241214000024_batch_53_products_releases_roadmap.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Deployment Details
  environment VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'success', 'failed', 'cancelled', 'rolled_back')),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_minutes DECIMAL(6, 2),

  -- Infrastructure
  servers_count INTEGER DEFAULT 0,
  health_percentage DECIMAL(5, 2) DEFAULT 100,

  -- Logs
  logs TEXT,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: desktop_apps
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS desktop_apps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  app_name VARCHAR(500) NOT NULL,
  app_version VARCHAR(100) NOT NULL,
  build_number VARCHAR(100),

  -- Platform Configuration
  platform VARCHAR(50) DEFAULT 'all'
    CHECK (platform IN ('all', 'windows', 'macos', 'linux', 'cross-platform')),
  supported_os TEXT[] DEFAULT ARRAY['windows', 'macos', 'linux'],
  minimum_os_version VARCHAR(100),

  -- Installation Metrics
  total_installs INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  windows_installs INTEGER DEFAULT 0,
  macos_installs INTEGER DEFAULT 0,
  linux_installs INTEGER DEFAULT 0,

  -- Version Management
  current_version VARCHAR(100),
  latest_version VARCHAR(100),
  previous_version VARCHAR(100),
  update_rate DECIMAL(5, 2) DEFAULT 0,
  auto_update_enabled BOOLEAN DEFAULT true,

  -- Performance Metrics
  performance_score DECIMAL(5, 2) DEFAULT 0,
  startup_time_ms INTEGER DEFAULT 0,
  memory_usage_mb DECIMAL(10, 2) DEFAULT 0,
  cpu_usage_percent DECIMAL(5, 2) DEFAULT 0,
  crash_rate DECIMAL(5, 4) DEFAULT 0,

  -- Build Information
  build_status VARCHAR(50) DEFAULT 'pending'
    CHECK (build_status IN ('pending', 'building', 'testing', 'stable', 'beta', 'deprecated', 'failed')),
  build_date TIMESTAMPTZ,
  release_date TIMESTAMPTZ,
  deployment_date TIMESTAMPTZ,

  -- Distribution
  download_url TEXT,
  checksum VARCHAR(200),
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  installer_type VARCHAR(50),

  -- Feature Flags
  offline_sync_enabled BOOLEAN DEFAULT false,
  auto_backup_enabled BOOLEAN DEFAULT false,
  telemetry_enabled BOOLEAN DEFAULT true,
  analytics_enabled BOOLEAN DEFAULT true,

  -- User Satisfaction
  user_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  helpful_rating_percent DECIMAL(5, 2) DEFAULT 0,
  nps_score INTEGER DEFAULT 0,

  -- Issue Tracking
  known_issues INTEGER DEFAULT 0,
  critical_bugs INTEGER DEFAULT 0,
  bug_fix_rate DECIMAL(5, 2) DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,

  -- Adoption Metrics
  adoption_rate DECIMAL(5, 2) DEFAULT 0,
  retention_rate DECIMAL(5, 2) DEFAULT 0,
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  daily_active_users INTEGER DEFAULT 0,
  monthly_active_users INTEGER DEFAULT 0,

  -- Update Management
  update_channel VARCHAR(50) DEFAULT 'stable',
  force_update BOOLEAN DEFAULT false,
  rollback_available BOOLEAN DEFAULT false,
  rollback_version VARCHAR(100),

  -- Security
  security_score DECIMAL(5, 2) DEFAULT 0,
  last_security_audit TIMESTAMPTZ,
  vulnerability_count INTEGER DEFAULT 0,
  code_signing_enabled BOOLEAN DEFAULT false,

  -- Metadata
  description TEXT,
  release_notes TEXT,
  changelog TEXT,
  tags TEXT[],
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: digital_assets
-- Source: 20241214000023_batch_52_assets_orders_performance.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS digital_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID,

  -- Basic Info
  asset_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'brand'
    CHECK (category IN ('brand', 'design', 'code', 'templates', 'media', 'documents', 'other')),
  subcategory VARCHAR(100),

  -- File Details
  file_count INTEGER DEFAULT 1,
  total_size BIGINT DEFAULT 0,
  format VARCHAR(100),
  file_types TEXT[],

  -- Pricing & License
  license_type VARCHAR(50) DEFAULT 'premium'
    CHECK (license_type IN ('free', 'premium', 'commercial', 'mit', 'apache', 'gpl', 'proprietary', 'custom')),
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Status
  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,

  -- Metrics
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  estimated_value DECIMAL(12, 2) DEFAULT 0,

  -- Tags & Search
  tags TEXT[],
  keywords TEXT[],

  -- Storage
  storage_path TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- Table: direct_messages
-- Source: 20241214000022_batch_51_marketplace_messaging_media.sql
-- =====================================================
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


-- =====================================================
-- Table: docs
-- Source: 20241214000018_batch_47_dependencies_desktop_docs.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  doc_title VARCHAR(500) NOT NULL,
  doc_category VARCHAR(100) DEFAULT 'guides'
    CHECK (doc_category IN ('guides', 'api', 'sdk', 'tutorials', 'reference', 'examples')),
  doc_type VARCHAR(50) DEFAULT 'article'
    CHECK (doc_type IN ('article', 'guide', 'reference', 'tutorial', 'example', 'changelog')),

  -- Content
  content TEXT,
  summary TEXT,
  slug VARCHAR(500),

  -- Organization
  section VARCHAR(200),
  subsection VARCHAR(200),
  parent_doc_id UUID REFERENCES docs(id),
  order_index INTEGER DEFAULT 0,

  -- Visibility & Status
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'published', 'archived', 'deprecated')),
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal', 'authenticated')),
  is_featured BOOLEAN DEFAULT false,

  -- Engagement Metrics
  total_views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  monthly_views INTEGER DEFAULT 0,
  weekly_views INTEGER DEFAULT 0,
  daily_views INTEGER DEFAULT 0,

  -- User Feedback
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  helpful_rating_percent DECIMAL(5, 2) DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Code Examples
  has_code_examples BOOLEAN DEFAULT false,
  code_language VARCHAR(50),
  code_copy_count INTEGER DEFAULT 0,
  code_run_count INTEGER DEFAULT 0,

  -- API Documentation
  api_endpoint VARCHAR(500),
  http_method VARCHAR(20),
  api_version VARCHAR(50),
  request_count INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  -- SDK Documentation
  sdk_version VARCHAR(100),
  sdk_language VARCHAR(50),
  download_count INTEGER DEFAULT 0,
  installation_count INTEGER DEFAULT 0,

  -- Search & Discovery
  search_keywords TEXT[],
  tags TEXT[],
  search_rank DECIMAL(5, 2) DEFAULT 0,
  search_appearances INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,

  -- Authoring
  author VARCHAR(200),
  contributors TEXT[],
  technical_reviewer VARCHAR(200),
  editor VARCHAR(200),

  -- Versioning
  version VARCHAR(50),
  previous_version_id UUID,
  is_latest_version BOOLEAN DEFAULT true,
  version_notes TEXT,

  -- Reading Metrics
  avg_read_time_seconds INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  scroll_depth_percent DECIMAL(5, 2) DEFAULT 0,

  -- Related Content
  related_docs UUID[],
  prerequisites UUID[],
  next_steps UUID[],

  -- Maintenance
  last_reviewed_at TIMESTAMPTZ,
  last_updated_by VARCHAR(200),
  needs_review BOOLEAN DEFAULT false,
  is_outdated BOOLEAN DEFAULT false,

  -- Metadata
  meta_title VARCHAR(200),
  meta_description TEXT,
  canonical_url TEXT,
  external_references TEXT[],

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: documentation
-- Source: 20241215000011_batch_82_tickets_docs_themes.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'archived')),
  doc_type VARCHAR(30) DEFAULT 'guide' CHECK (doc_type IN ('guide', 'api-reference', 'tutorial', 'concept', 'quickstart', 'troubleshooting')),
  category VARCHAR(30) DEFAULT 'getting-started' CHECK (category IN ('getting-started', 'features', 'integrations', 'api', 'sdk', 'advanced')),
  author VARCHAR(100),
  version VARCHAR(20) DEFAULT 'v1.0',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  contributors_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: email_agent_approvals
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  response_id UUID REFERENCES email_agent_responses(id) ON DELETE CASCADE,
  message_id UUID REFERENCES email_agent_messages(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_config
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_respond BOOLEAN NOT NULL DEFAULT false,
  require_approval BOOLEAN NOT NULL DEFAULT true,
  response_tone TEXT NOT NULL DEFAULT 'professional',
  signature TEXT,
  working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::JSONB,
  email_provider TEXT,
  ai_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_messages
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_email TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status email_status NOT NULL DEFAULT 'pending',
  intent email_intent,
  sentiment email_sentiment,
  priority email_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  summary TEXT,
  requires_quotation BOOLEAN NOT NULL DEFAULT false,
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  analyzed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: email_agent_responses
-- Source: email_agent_minimal.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS email_agent_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES email_agent_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type response_type NOT NULL DEFAULT 'ai-generated',
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =====================================================
-- Table: employee_payroll
-- Source: 20241214000029_batch_58_payroll_templates_sprints.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS employee_payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  role VARCHAR(200),
  status VARCHAR(30) DEFAULT 'active',
  base_salary DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  taxes DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'direct-deposit',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  bank_account VARCHAR(100),
  payment_status VARCHAR(30) DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: employees
-- Source: 20241214000019_batch_48_documents_employees_expenses.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  employee_name VARCHAR(200) NOT NULL,
  employee_id VARCHAR(100) UNIQUE,
  email VARCHAR(200),
  phone VARCHAR(50),
  avatar_url TEXT,

  -- Position & Department
  position VARCHAR(200),
  job_title VARCHAR(200),
  department VARCHAR(100),
  team VARCHAR(100),
  level VARCHAR(50),
  employment_type VARCHAR(50) DEFAULT 'full-time'
    CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern', 'temporary')),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated', 'suspended')),
  is_remote BOOLEAN DEFAULT false,

  -- Reporting Structure
  manager_id UUID REFERENCES employees(id),
  manager_name VARCHAR(200),
  direct_reports INTEGER DEFAULT 0,
  reports_to VARCHAR(200),

  -- Location
  office_location VARCHAR(200),
  work_location VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  timezone VARCHAR(50),

  -- Compensation
  salary DECIMAL(12, 2) DEFAULT 0,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  bonus_eligible BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5, 2) DEFAULT 0,

  -- Benefits
  health_insurance BOOLEAN DEFAULT false,
  retirement_plan BOOLEAN DEFAULT false,
  stock_options INTEGER DEFAULT 0,
  pto_days INTEGER DEFAULT 0,
  sick_days INTEGER DEFAULT 0,
  used_pto_days INTEGER DEFAULT 0,
  used_sick_days INTEGER DEFAULT 0,

  -- Employment Dates
  hire_date DATE,
  start_date DATE,
  termination_date DATE,
  probation_end_date DATE,
  last_promotion_date DATE,

  -- Performance
  performance_rating DECIMAL(3, 2) DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  last_review_date DATE,
  next_review_date DATE,
  goals_completed INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,

  -- Work Metrics
  projects_count INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  hours_logged DECIMAL(10, 2) DEFAULT 0,
  productivity_score DECIMAL(5, 2) DEFAULT 0,

  -- Skills & Certifications
  skills TEXT[],
  certifications TEXT[],
  languages TEXT[],
  education_level VARCHAR(100),

  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),

  -- Documents
  contract_url TEXT,
  resume_url TEXT,
  id_document_url TEXT,
  photo_url TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_progress INTEGER DEFAULT 0,
  orientation_date DATE,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: engagement_metrics
-- Source: 20251211000001_phase5_ai_features.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS engagement_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    saves INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2),
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    platform VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================================
-- Table: event_registrations
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Registration details
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  webinar_id UUID REFERENCES webinars(id) ON DELETE CASCADE,
  registration_type VARCHAR(50) CHECK (registration_type IN ('event', 'webinar')),

  -- Registrant info
  registrant_name VARCHAR(255) NOT NULL,
  registrant_email VARCHAR(255) NOT NULL,
  registrant_phone VARCHAR(50),
  company VARCHAR(255),
  job_title VARCHAR(255),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'attended', 'no-show', 'cancelled', 'waitlist')),

  -- Tickets
  ticket_type VARCHAR(50) CHECK (ticket_type IN ('free', 'paid', 'vip', 'speaker', 'sponsor', 'press')),
  ticket_price DECIMAL(10,2),
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'refunded', 'cancelled')),

  -- Attendance
  checked_in_at TIMESTAMPTZ,
  attendance_duration INTEGER,

  -- Communication
  confirmation_sent BOOLEAN DEFAULT FALSE,
  reminder_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_registration CHECK (
    (event_id IS NOT NULL AND webinar_id IS NULL AND registration_type = 'event') OR
    (webinar_id IS NOT NULL AND event_id IS NULL AND registration_type = 'webinar')
  )
);


-- =====================================================
-- Table: events
-- Source: 20241214000001_batch_30_events_webinars.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Event details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('conference', 'workshop', 'meetup', 'training', 'seminar', 'networking', 'launch', 'other')),
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled', 'postponed')),

  -- Schedule
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  duration_minutes INTEGER,

  -- Location
  location_type VARCHAR(50) CHECK (location_type IN ('in-person', 'virtual', 'hybrid')),
  venue_name VARCHAR(255),
  venue_address TEXT,
  virtual_link TEXT,

  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  waitlist_count INTEGER DEFAULT 0,

  -- Engagement
  registrations INTEGER DEFAULT 0,
  attendance_rate DECIMAL(5,2),
  satisfaction_score DECIMAL(3,2),

  -- Meta
  tags TEXT[],
  image_url TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_capacity CHECK (current_attendees <= max_attendees OR max_attendees IS NULL)
);


-- =====================================================
-- Table: export_presets
-- Source: V9_video_export_system_migration.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS export_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format video_export_format NOT NULL,
  quality video_export_quality NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);


-- =====================================================
-- Table: extensions
-- Source: 20241215000008_batch_79_knowledge_extensions_plugins.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  developer VARCHAR(255),
  category VARCHAR(50) DEFAULT 'utility' CHECK (category IN ('browser', 'desktop', 'mobile', 'api', 'workflow', 'integration', 'utility', 'enhancement')),
  extension_type VARCHAR(50) DEFAULT 'third-party' CHECK (extension_type IN ('official', 'verified', 'third-party', 'experimental', 'legacy')),
  status VARCHAR(20) DEFAULT 'disabled' CHECK (status IN ('enabled', 'disabled', 'installing', 'updating', 'error')),
  users_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  size VARCHAR(20),
  platform VARCHAR(100),
  permissions TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon_url VARCHAR(500),
  download_url VARCHAR(500),
  documentation_url VARCHAR(500),
  release_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: faqs
-- Source: 20241215000005_batch_76_faq_learning_widgets.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'review', 'archived')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  searches_count INTEGER DEFAULT 0,
  related_faqs UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  author VARCHAR(255),
  average_read_time DECIMAL(4,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: features
-- Source: 20241214000020_batch_49_features_inventory_knowledge.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  feature_name VARCHAR(500) NOT NULL,
  feature_key VARCHAR(200) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'disabled'
    CHECK (status IN ('enabled', 'disabled', 'rollout', 'testing', 'archived')),
  is_enabled BOOLEAN DEFAULT false,

  -- Environment
  environments TEXT[] DEFAULT ARRAY['development'],
  production_enabled BOOLEAN DEFAULT false,
  staging_enabled BOOLEAN DEFAULT false,
  development_enabled BOOLEAN DEFAULT false,

  -- Rollout Configuration
  rollout_percentage DECIMAL(5, 2) DEFAULT 0,
  rollout_type VARCHAR(50) DEFAULT 'percentage'
    CHECK (rollout_type IN ('percentage', 'gradual', 'targeted', 'full', 'off')),
  target_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,

  -- Targeting
  target_segments TEXT[],
  target_user_ids TEXT[],
  target_groups TEXT[],
  targeting_rules JSONB,

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_variants JSONB,
  ab_test_traffic JSONB,
  ab_test_conversion JSONB,
  ab_test_winner VARCHAR(200),
  ab_test_sample_size INTEGER DEFAULT 0,

  -- Metrics
  total_requests INTEGER DEFAULT 0,
  successful_requests INTEGER DEFAULT 0,
  failed_requests INTEGER DEFAULT 0,
  avg_response_time_ms INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  -- Rollback
  can_rollback BOOLEAN DEFAULT true,
  last_rollback_at TIMESTAMPTZ,
  rollback_reason TEXT,

  -- Metadata
  created_by VARCHAR(200),
  updated_by VARCHAR(200),
  tags TEXT[],
  category VARCHAR(100),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  enabled_at TIMESTAMPTZ,
  disabled_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);


-- =====================================================
-- Table: feedback
-- Source: 20241214000003_batch_32_feedback_engagement.sql
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
-- Table: file_activity
-- Source: 20251126_files_system.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action file_action NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =====================================================
-- Table: file_cache
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    cache_key TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: file_metadata
-- Source: 20240326000003_storage_optimization.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    hash TEXT NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    storage_tier_id UUID REFERENCES storage_tiers(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- =====================================================
-- Table: financial
-- Source: 20241214000006_batch_35_financial_management.sql
-- =====================================================
CREATE TABLE IF NOT EXISTS financial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
