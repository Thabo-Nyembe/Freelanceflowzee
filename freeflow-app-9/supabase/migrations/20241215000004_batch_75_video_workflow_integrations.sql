-- Batch 75: Video Studio, Workflow Builder, Integrations V2 Integration
-- Created: December 15, 2024

-- ============================================
-- VIDEO PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS video_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Video details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  video_url VARCHAR(500),

  -- Duration and size
  duration_seconds INTEGER DEFAULT 0,
  file_size_bytes BIGINT DEFAULT 0,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'ready', 'failed', 'archived')),

  -- Engagement metrics
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Tags and categories
  tags JSONB DEFAULT '[]',
  category VARCHAR(100),

  -- AI Analysis
  ai_analysis JSONB DEFAULT '{}',
  has_captions BOOLEAN DEFAULT false,
  has_thumbnail BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  rendered_at TIMESTAMPTZ
);

-- RLS for video projects
ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video projects" ON video_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own video projects" ON video_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video projects" ON video_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own video projects" ON video_projects
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- WORKFLOWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workflow details
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),

  -- Structure
  triggers_count INTEGER DEFAULT 0,
  actions_count INTEGER DEFAULT 0,

  -- Execution stats
  executions_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,

  -- Workflow definition
  trigger_config JSONB DEFAULT '{}',
  actions_config JSONB DEFAULT '[]',
  conditions_config JSONB DEFAULT '[]',

  -- Schedule
  is_scheduled BOOLEAN DEFAULT false,
  schedule_cron VARCHAR(100),
  next_run_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for workflows
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- WORKFLOW EXECUTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Execution details
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Results
  result JSONB DEFAULT '{}',
  error_message TEXT,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for workflow executions
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflow executions" ON workflow_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workflow executions" ON workflow_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Integration details
  name VARCHAR(100) NOT NULL,
  provider VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  category VARCHAR(50),

  -- Status
  is_connected BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),

  -- Credentials (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,

  -- Configuration
  config JSONB DEFAULT '{}',
  permissions JSONB DEFAULT '[]',

  -- Usage stats
  api_calls_count INTEGER DEFAULT 0,
  data_synced_count INTEGER DEFAULT 0,
  last_sync_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  connected_at TIMESTAMPTZ
);

-- RLS for integrations
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations" ON integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations" ON integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON integrations
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- VIDEO ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_project_id UUID REFERENCES video_projects(id) ON DELETE SET NULL,

  -- Asset details
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'video' CHECK (type IN ('video', 'audio', 'image', 'caption', 'effect', 'template')),
  file_url VARCHAR(500),
  thumbnail_url VARCHAR(500),

  -- File info
  file_size_bytes BIGINT DEFAULT 0,
  duration_seconds INTEGER,
  format VARCHAR(50),
  resolution VARCHAR(20),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for video assets
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own video assets" ON video_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own video assets" ON video_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video assets" ON video_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own video assets" ON video_assets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_video_projects_user_id ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON video_projects(status);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_is_connected ON integrations(is_connected);

CREATE INDEX IF NOT EXISTS idx_video_assets_user_id ON video_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_video_assets_video_project_id ON video_assets(video_project_id);
CREATE INDEX IF NOT EXISTS idx_video_assets_type ON video_assets(type);
