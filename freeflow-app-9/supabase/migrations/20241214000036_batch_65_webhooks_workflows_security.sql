-- Batch 65: Webhooks, Workflows, Security
-- Tables for webhooks-v2, workflows-v2, security-v2

-- =====================================================
-- WEBHOOKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_code VARCHAR(20) UNIQUE DEFAULT ('WHK-' || LPAD(nextval('webhooks_seq')::text, 6, '0')),

  -- Webhook Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  secret VARCHAR(100),

  -- Events
  events TEXT[] DEFAULT '{}',

  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, paused, failed, disabled

  -- Stats
  total_deliveries BIGINT DEFAULT 0,
  successful_deliveries BIGINT DEFAULT 0,
  failed_deliveries BIGINT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 100,
  avg_response_time_ms INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  consecutive_failures INTEGER DEFAULT 0,

  -- Configuration
  retry_count INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  timeout_ms INTEGER DEFAULT 30000,
  verify_ssl BOOLEAN DEFAULT true,

  -- Headers
  custom_headers JSONB DEFAULT '{}',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for webhook codes
CREATE SEQUENCE IF NOT EXISTS webhooks_seq START 1;

-- =====================================================
-- WEBHOOK DELIVERIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,

  -- Event Info
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(100),
  payload JSONB DEFAULT '{}',

  -- Delivery Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, success, failed, retrying
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Response
  response_status_code INTEGER,
  response_body TEXT,
  response_headers JSONB DEFAULT '{}',
  response_time_ms INTEGER,

  -- Timing
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,

  -- Error
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOK EVENT TYPES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS webhook_event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Event Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),

  -- Stats
  total_deliveries BIGINT DEFAULT 0,
  subscribers_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, name)
);

-- =====================================================
-- WORKFLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_code VARCHAR(20) UNIQUE DEFAULT ('WF-' || LPAD(nextval('workflows_seq')::text, 6, '0')),

  -- Workflow Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) DEFAULT 'approval', -- approval, review, processing, integration, notification, data-sync

  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, paused, completed, failed, archived
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent

  -- Steps
  total_steps INTEGER DEFAULT 0,
  current_step INTEGER DEFAULT 0,
  steps_config JSONB DEFAULT '[]',

  -- Approvals
  approvals_required INTEGER DEFAULT 0,
  approvals_received INTEGER DEFAULT 0,

  -- Progress
  completion_rate DECIMAL(5,2) DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ,
  estimated_completion TIMESTAMPTZ,
  actual_completion TIMESTAMPTZ,

  -- Assignment
  assigned_to TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Sequence for workflow codes
CREATE SEQUENCE IF NOT EXISTS workflows_seq START 1;

-- =====================================================
-- WORKFLOW STEPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,

  -- Step Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed, skipped

  -- Assignment
  assigned_to TEXT[] DEFAULT '{}',
  completed_by UUID REFERENCES auth.users(id),

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,

  -- Config
  action_type VARCHAR(50), -- approve, review, process, notify, wait
  action_config JSONB DEFAULT '{}',

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SECURITY SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Security Score
  security_score INTEGER DEFAULT 0,

  -- 2FA
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method VARCHAR(20), -- app, sms, email
  two_factor_verified_at TIMESTAMPTZ,

  -- Biometrics
  biometric_enabled BOOLEAN DEFAULT false,
  biometric_type VARCHAR(20), -- fingerprint, face_id

  -- Session Settings
  session_timeout_minutes INTEGER DEFAULT 60,
  max_active_sessions INTEGER DEFAULT 5,
  require_2fa_for_sensitive BOOLEAN DEFAULT true,

  -- IP Settings
  ip_whitelist_enabled BOOLEAN DEFAULT false,
  ip_whitelist TEXT[] DEFAULT '{}',
  ip_blacklist TEXT[] DEFAULT '{}',

  -- Password Policy
  password_min_length INTEGER DEFAULT 8,
  password_require_uppercase BOOLEAN DEFAULT true,
  password_require_numbers BOOLEAN DEFAULT true,
  password_require_special BOOLEAN DEFAULT true,
  password_expiry_days INTEGER DEFAULT 90,
  password_last_changed_at TIMESTAMPTZ,

  -- Login Settings
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- =====================================================
-- SECURITY EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event Info
  event_type VARCHAR(50) NOT NULL, -- failed_login, new_device, suspicious_activity, password_change, 2fa_enabled, session_terminated
  severity VARCHAR(20) DEFAULT 'info', -- info, low, medium, high, critical
  description TEXT,

  -- Source
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  location VARCHAR(255),

  -- Status
  is_blocked BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- Related
  related_session_id UUID,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ACTIVE SESSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Info
  session_token VARCHAR(255) UNIQUE,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- desktop, mobile, tablet
  browser VARCHAR(100),
  os VARCHAR(100),

  -- Location
  ip_address VARCHAR(45),
  location VARCHAR(255),
  country_code VARCHAR(2),

  -- Status
  is_current BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timing
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Webhooks indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhooks(status);
CREATE INDEX IF NOT EXISTS idx_webhooks_deleted ON webhooks(deleted_at) WHERE deleted_at IS NULL;

-- Webhook Deliveries indexes
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_scheduled ON webhook_deliveries(scheduled_at);

-- Webhook Event Types indexes
CREATE INDEX IF NOT EXISTS idx_webhook_event_types_user ON webhook_event_types(user_id);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflows(type);
CREATE INDEX IF NOT EXISTS idx_workflows_priority ON workflows(priority);
CREATE INDEX IF NOT EXISTS idx_workflows_deleted ON workflows(deleted_at) WHERE deleted_at IS NULL;

-- Workflow Steps indexes
CREATE INDEX IF NOT EXISTS idx_workflow_steps_workflow ON workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_order ON workflow_steps(workflow_id, step_order);

-- Security Settings indexes
CREATE INDEX IF NOT EXISTS idx_security_settings_user ON security_settings(user_id);

-- Security Events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);

-- User Sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_event_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Webhooks policies
CREATE POLICY "Users can view own webhooks" ON webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own webhooks" ON webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhooks" ON webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhooks" ON webhooks FOR DELETE USING (auth.uid() = user_id);

-- Webhook Deliveries policies
CREATE POLICY "Users can view own webhook deliveries" ON webhook_deliveries FOR SELECT USING (
  EXISTS (SELECT 1 FROM webhooks WHERE webhooks.id = webhook_deliveries.webhook_id AND webhooks.user_id = auth.uid())
);

-- Webhook Event Types policies
CREATE POLICY "Users can manage own event types" ON webhook_event_types FOR ALL USING (auth.uid() = user_id);

-- Workflows policies
CREATE POLICY "Users can view own workflows" ON workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workflows" ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workflows" ON workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workflows" ON workflows FOR DELETE USING (auth.uid() = user_id);

-- Workflow Steps policies
CREATE POLICY "Users can manage own workflow steps" ON workflow_steps FOR ALL USING (
  EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_steps.workflow_id AND workflows.user_id = auth.uid())
);

-- Security Settings policies
CREATE POLICY "Users can view own security settings" ON security_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own security settings" ON security_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own security settings" ON security_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Security Events policies
CREATE POLICY "Users can view own security events" ON security_events FOR SELECT USING (auth.uid() = user_id);

-- User Sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhook_event_types_updated_at BEFORE UPDATE ON webhook_event_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON security_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update webhook stats on delivery
CREATE OR REPLACE FUNCTION update_webhook_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'success' THEN
    UPDATE webhooks
    SET
      total_deliveries = total_deliveries + 1,
      successful_deliveries = successful_deliveries + 1,
      last_delivery_at = NEW.delivered_at,
      last_success_at = NEW.delivered_at,
      consecutive_failures = 0,
      success_rate = (successful_deliveries + 1)::DECIMAL / (total_deliveries + 1) * 100
    WHERE id = NEW.webhook_id;
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' THEN
    UPDATE webhooks
    SET
      total_deliveries = total_deliveries + 1,
      failed_deliveries = failed_deliveries + 1,
      last_delivery_at = NOW(),
      last_failure_at = NOW(),
      consecutive_failures = consecutive_failures + 1,
      success_rate = successful_deliveries::DECIMAL / (total_deliveries + 1) * 100
    WHERE id = NEW.webhook_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_webhook_stats_on_delivery AFTER UPDATE ON webhook_deliveries
  FOR EACH ROW EXECUTE FUNCTION update_webhook_stats();

-- Update workflow progress
CREATE OR REPLACE FUNCTION update_workflow_progress()
RETURNS TRIGGER AS $$
DECLARE
  completed_steps INTEGER;
  total_steps INTEGER;
BEGIN
  SELECT COUNT(*) INTO completed_steps
  FROM workflow_steps
  WHERE workflow_id = NEW.workflow_id AND status = 'completed';

  SELECT COUNT(*) INTO total_steps
  FROM workflow_steps
  WHERE workflow_id = NEW.workflow_id;

  IF total_steps > 0 THEN
    UPDATE workflows
    SET
      current_step = completed_steps,
      total_steps = total_steps,
      completion_rate = (completed_steps::DECIMAL / total_steps) * 100,
      status = CASE
        WHEN completed_steps = total_steps THEN 'completed'
        WHEN completed_steps > 0 THEN 'active'
        ELSE status
      END,
      actual_completion = CASE
        WHEN completed_steps = total_steps THEN NOW()
        ELSE NULL
      END
    WHERE id = NEW.workflow_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_progress_on_step AFTER INSERT OR UPDATE ON workflow_steps
  FOR EACH ROW EXECUTE FUNCTION update_workflow_progress();

-- Calculate security score
CREATE OR REPLACE FUNCTION calculate_security_score()
RETURNS TRIGGER AS $$
DECLARE
  score INTEGER := 0;
BEGIN
  -- Base score
  score := 40;

  -- 2FA enabled (+20)
  IF NEW.two_factor_enabled THEN
    score := score + 20;
  END IF;

  -- Biometric enabled (+15)
  IF NEW.biometric_enabled THEN
    score := score + 15;
  END IF;

  -- IP whitelist enabled (+10)
  IF NEW.ip_whitelist_enabled THEN
    score := score + 10;
  END IF;

  -- Strong password policy (+15)
  IF NEW.password_min_length >= 12 AND NEW.password_require_uppercase AND NEW.password_require_numbers AND NEW.password_require_special THEN
    score := score + 15;
  END IF;

  NEW.security_score := LEAST(score, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_security_score_trigger BEFORE INSERT OR UPDATE ON security_settings
  FOR EACH ROW EXECUTE FUNCTION calculate_security_score();
