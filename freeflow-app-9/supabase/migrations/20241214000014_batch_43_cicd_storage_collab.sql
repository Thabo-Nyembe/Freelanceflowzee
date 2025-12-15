-- Batch 43: CI/CD, Cloud Storage & Collaboration
-- Tables: ci_cd, cloud_storage, collaboration
-- Created: December 14, 2024

-- ================================================
-- CI/CD TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS ci_cd (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Pipeline Details
  pipeline_name VARCHAR(500) NOT NULL,
  description TEXT,
  pipeline_type VARCHAR(50) NOT NULL DEFAULT 'deployment'
    CHECK (pipeline_type IN ('deployment', 'build', 'test', 'release', 'integration', 'delivery', 'quality')),

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  variables JSONB DEFAULT '{}'::jsonb,
  secrets JSONB DEFAULT '{}'::jsonb,
  environment_variables JSONB DEFAULT '{}'::jsonb,

  -- Stages & Steps
  stages JSONB DEFAULT '[]'::jsonb,
  steps JSONB DEFAULT '[]'::jsonb,
  stage_count INTEGER DEFAULT 0,
  step_count INTEGER DEFAULT 0,

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

CREATE INDEX idx_ci_cd_user_id ON ci_cd(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ci_cd_type ON ci_cd(pipeline_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_ci_cd_status ON ci_cd(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_ci_cd_last_run ON ci_cd(last_run_at DESC) WHERE deleted_at IS NULL;

ALTER TABLE ci_cd ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ci_cd" ON ci_cd FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own ci_cd" ON ci_cd FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ci_cd" ON ci_cd FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own ci_cd" ON ci_cd FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE ci_cd;

-- ================================================
-- CLOUD STORAGE TABLE
-- ================================================
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

CREATE INDEX idx_cloud_storage_user_id ON cloud_storage(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cloud_storage_file_name ON cloud_storage(file_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_cloud_storage_file_type ON cloud_storage(file_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_cloud_storage_folder ON cloud_storage(folder) WHERE deleted_at IS NULL;

ALTER TABLE cloud_storage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cloud_storage" ON cloud_storage FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own cloud_storage" ON cloud_storage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cloud_storage" ON cloud_storage FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own cloud_storage" ON cloud_storage FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE cloud_storage;

-- ================================================
-- COLLABORATION TABLE
-- ================================================
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

CREATE INDEX idx_collaboration_user_id ON collaboration(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_collaboration_type ON collaboration(session_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_collaboration_status ON collaboration(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_collaboration_active ON collaboration(is_active) WHERE deleted_at IS NULL;

ALTER TABLE collaboration ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own collaboration" ON collaboration FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own collaboration" ON collaboration FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own collaboration" ON collaboration FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own collaboration" ON collaboration FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE collaboration;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_ci_cd_updated_at BEFORE UPDATE ON ci_cd
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_storage_updated_at BEFORE UPDATE ON cloud_storage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_updated_at BEFORE UPDATE ON collaboration
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
