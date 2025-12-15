-- Batch 47: Dependencies, Desktop App & Docs
-- Migration for project dependencies, desktop application management, and documentation

-- =============================================
-- DEPENDENCIES TABLE
-- =============================================
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

-- Indexes for dependencies
CREATE INDEX idx_dependencies_user_id ON dependencies(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_dependencies_status ON dependencies(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_dependencies_type ON dependencies(dependency_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_dependencies_impact ON dependencies(impact_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_dependencies_critical_path ON dependencies(is_on_critical_path) WHERE deleted_at IS NULL;

-- RLS Policies for dependencies
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own dependencies"
  ON dependencies FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own dependencies"
  ON dependencies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dependencies"
  ON dependencies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dependencies"
  ON dependencies FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for dependencies
ALTER PUBLICATION supabase_realtime ADD TABLE dependencies;

-- =============================================
-- DESKTOP_APPS TABLE
-- =============================================
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

-- Indexes for desktop_apps
CREATE INDEX idx_desktop_apps_user_id ON desktop_apps(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_desktop_apps_platform ON desktop_apps(platform) WHERE deleted_at IS NULL;
CREATE INDEX idx_desktop_apps_status ON desktop_apps(build_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_desktop_apps_version ON desktop_apps(app_version) WHERE deleted_at IS NULL;

-- RLS Policies for desktop_apps
ALTER TABLE desktop_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own desktop apps"
  ON desktop_apps FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own desktop apps"
  ON desktop_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own desktop apps"
  ON desktop_apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own desktop apps"
  ON desktop_apps FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for desktop_apps
ALTER PUBLICATION supabase_realtime ADD TABLE desktop_apps;

-- =============================================
-- DOCS TABLE
-- =============================================
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

-- Indexes for docs
CREATE INDEX idx_docs_user_id ON docs(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_category ON docs(doc_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_status ON docs(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_slug ON docs(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_section ON docs(section) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_featured ON docs(is_featured) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_api_endpoint ON docs(api_endpoint) WHERE deleted_at IS NULL;

-- RLS Policies for docs
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own docs"
  ON docs FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own docs"
  ON docs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own docs"
  ON docs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own docs"
  ON docs FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for docs
ALTER PUBLICATION supabase_realtime ADD TABLE docs;
