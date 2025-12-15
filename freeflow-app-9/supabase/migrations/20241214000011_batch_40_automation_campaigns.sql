-- Batch 40: Automation & Campaigns
-- Tables: automation, automations, campaigns
-- Created: December 14, 2024

-- Note: 'automation' table for single automation rules
-- Note: 'automations' table for workflow automation sequences
-- Note: 'campaigns' table for marketing campaigns

-- ================================================
-- AUTOMATION TABLE (Single Rules)
-- ================================================
CREATE TABLE IF NOT EXISTS automation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Automation Details
  automation_name VARCHAR(500) NOT NULL,
  description TEXT,
  automation_type VARCHAR(50) NOT NULL DEFAULT 'trigger'
    CHECK (automation_type IN ('trigger', 'scheduled', 'conditional', 'event', 'webhook', 'api', 'manual', 'batch', 'realtime')),

  -- Trigger Configuration
  trigger_type VARCHAR(50) NOT NULL
    CHECK (trigger_type IN ('event', 'schedule', 'webhook', 'condition', 'manual', 'api_call', 'database', 'time_based', 'user_action')),
  trigger_event VARCHAR(200),
  trigger_conditions JSONB DEFAULT '{}'::jsonb,

  -- Schedule (for scheduled automations)
  schedule_type VARCHAR(50)
    CHECK (schedule_type IN ('once', 'recurring', 'cron', 'interval', 'daily', 'weekly', 'monthly')),
  schedule_expression VARCHAR(200),
  schedule_timezone VARCHAR(100) DEFAULT 'UTC',
  next_run_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,

  -- Action Configuration
  action_type VARCHAR(50) NOT NULL
    CHECK (action_type IN ('send_email', 'send_sms', 'create_task', 'update_record', 'send_notification', 'api_call', 'webhook', 'script', 'custom')),
  action_config JSONB DEFAULT '{}'::jsonb,
  action_parameters JSONB DEFAULT '{}'::jsonb,

  -- Status & Control
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'paused', 'running', 'failed', 'completed', 'disabled')),
  is_enabled BOOLEAN DEFAULT true,
  is_running BOOLEAN DEFAULT false,

  -- Execution Stats
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  last_error TEXT,

  -- Performance
  avg_execution_time_ms INTEGER,
  total_execution_time_ms BIGINT DEFAULT 0,

  -- Priority & Queue
  priority VARCHAR(20) DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical')),
  queue_name VARCHAR(100),

  -- Retry Configuration
  retry_enabled BOOLEAN DEFAULT true,
  max_retries INTEGER DEFAULT 3,
  retry_count INTEGER DEFAULT 0,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Timeout
  timeout_seconds INTEGER DEFAULT 300,

  -- Filtering
  filters JSONB DEFAULT '{}'::jsonb,
  conditions JSONB DEFAULT '{}'::jsonb,

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT automation_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_automation_user_id ON automation(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_status ON automation(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_trigger_type ON automation(trigger_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_next_run ON automation(next_run_at) WHERE deleted_at IS NULL AND is_enabled = true;

ALTER TABLE automation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own automation" ON automation FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own automation" ON automation FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automation" ON automation FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own automation" ON automation FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE automation;

-- ================================================
-- AUTOMATIONS TABLE (Workflow Sequences)
-- ================================================
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Workflow Details
  workflow_name VARCHAR(500) NOT NULL,
  description TEXT,
  workflow_type VARCHAR(50) NOT NULL DEFAULT 'sequential'
    CHECK (workflow_type IN ('sequential', 'parallel', 'conditional', 'branching', 'loop', 'hybrid')),

  -- Steps Configuration
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  step_count INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,

  -- Trigger
  trigger_config JSONB DEFAULT '{}'::jsonb,
  trigger_type VARCHAR(50),

  -- Status & Execution
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'running', 'paused', 'completed', 'failed', 'cancelled', 'archived')),
  is_enabled BOOLEAN DEFAULT false,
  is_running BOOLEAN DEFAULT false,

  -- Execution History
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  last_execution_at TIMESTAMPTZ,
  last_execution_status VARCHAR(50),
  last_execution_error TEXT,

  -- Performance Metrics
  avg_duration_seconds INTEGER,
  min_duration_seconds INTEGER,
  max_duration_seconds INTEGER,
  total_duration_seconds BIGINT DEFAULT 0,

  -- Version Control
  version INTEGER DEFAULT 1,
  version_notes TEXT,
  published_version INTEGER,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Variables & Context
  variables JSONB DEFAULT '{}'::jsonb,
  context_data JSONB DEFAULT '{}'::jsonb,

  -- Error Handling
  error_handling_strategy VARCHAR(50) DEFAULT 'stop'
    CHECK (error_handling_strategy IN ('stop', 'continue', 'retry', 'skip', 'fallback')),
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,

  -- Notifications
  notify_on_success BOOLEAN DEFAULT false,
  notify_on_failure BOOLEAN DEFAULT true,
  notification_config JSONB DEFAULT '{}'::jsonb,

  -- Scheduling
  is_scheduled BOOLEAN DEFAULT false,
  schedule_config JSONB DEFAULT '{}'::jsonb,
  next_scheduled_run TIMESTAMPTZ,

  -- Dependencies
  dependencies TEXT[],
  parent_workflow_id UUID REFERENCES automations(id),

  -- Tags & Organization
  tags TEXT[],
  category VARCHAR(100),
  folder VARCHAR(300),

  -- Approval Workflow
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT automations_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_automations_user_id ON automations(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_automations_status ON automations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_automations_enabled ON automations(is_enabled) WHERE deleted_at IS NULL;
CREATE INDEX idx_automations_scheduled ON automations(next_scheduled_run) WHERE deleted_at IS NULL AND is_enabled = true;

ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own automations" ON automations FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own automations" ON automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own automations" ON automations FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own automations" ON automations FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE automations;

-- ================================================
-- CAMPAIGNS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Campaign Details
  campaign_name VARCHAR(500) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(50) NOT NULL DEFAULT 'email'
    CHECK (campaign_type IN ('email', 'sms', 'social', 'display', 'search', 'video', 'influencer', 'affiliate', 'content', 'multi_channel')),

  -- Status & Phases
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'planned', 'scheduled', 'running', 'paused', 'completed', 'cancelled', 'archived')),
  phase VARCHAR(50) DEFAULT 'planning'
    CHECK (phase IN ('planning', 'setup', 'testing', 'launching', 'running', 'optimizing', 'analyzing', 'completed')),

  -- Timing
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  launched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_days INTEGER,

  -- Budget & Costs
  budget_total DECIMAL(15, 2) DEFAULT 0.00,
  budget_spent DECIMAL(15, 2) DEFAULT 0.00,
  budget_remaining DECIMAL(15, 2) DEFAULT 0.00,
  cost_per_lead DECIMAL(10, 2),
  cost_per_acquisition DECIMAL(10, 2),
  roi_percentage DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Goals & Targets
  goal_type VARCHAR(50)
    CHECK (goal_type IN ('awareness', 'engagement', 'leads', 'sales', 'retention', 'referral', 'custom')),
  target_audience VARCHAR(500),
  target_reach INTEGER,
  target_conversions INTEGER,
  target_revenue DECIMAL(15, 2),

  -- Audience & Segmentation
  audience_size INTEGER DEFAULT 0,
  segment_ids TEXT[],
  segment_criteria JSONB DEFAULT '{}'::jsonb,
  targeting_config JSONB DEFAULT '{}'::jsonb,

  -- Content & Creative
  content JSONB DEFAULT '{}'::jsonb,
  creative_assets JSONB DEFAULT '[]'::jsonb,
  landing_page_url TEXT,
  tracking_urls JSONB DEFAULT '{}'::jsonb,

  -- Channels & Distribution
  channels TEXT[],
  primary_channel VARCHAR(50),
  channel_config JSONB DEFAULT '{}'::jsonb,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  sales_generated INTEGER DEFAULT 0,
  revenue_generated DECIMAL(15, 2) DEFAULT 0.00,

  -- Engagement Metrics
  engagement_rate DECIMAL(5, 2),
  click_through_rate DECIMAL(5, 2),
  conversion_rate DECIMAL(5, 2),
  bounce_rate DECIMAL(5, 2),
  unsubscribe_rate DECIMAL(5, 2),

  -- Social Metrics
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  followers_gained INTEGER DEFAULT 0,

  -- Email Metrics (if email campaign)
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),

  -- A/B Testing
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_config JSONB DEFAULT '{}'::jsonb,
  winning_variant VARCHAR(50),

  -- Automation Integration
  is_automated BOOLEAN DEFAULT false,
  automation_id UUID REFERENCES automations(id),
  automation_config JSONB DEFAULT '{}'::jsonb,

  -- Team & Ownership
  owner_id UUID REFERENCES auth.users(id),
  team_members TEXT[],
  assigned_to UUID REFERENCES auth.users(id),

  -- Approval & Review
  requires_approval BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT false,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),

  -- Tags & Categories
  tags TEXT[],
  category VARCHAR(100),
  industry VARCHAR(100),
  product_ids TEXT[],

  -- External Integration
  external_campaign_id VARCHAR(200),
  external_platform VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Notes & Documentation
  notes TEXT,
  learnings TEXT,
  success_factors TEXT,

  -- Audit Trail
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT campaigns_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT campaigns_valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_status ON campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON campaigns(campaign_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date) WHERE deleted_at IS NULL;

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own campaigns" ON campaigns FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own campaigns" ON campaigns FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE campaigns;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_automation_updated_at BEFORE UPDATE ON automation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
