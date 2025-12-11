-- =====================================================
-- KAZI Workflow Automation Engine - Complete Migration
-- Run this single file in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DROP EXISTING TABLES (if they have issues)
-- =====================================================
DROP TABLE IF EXISTS workflow_variables CASCADE;
DROP TABLE IF EXISTS workflow_event_subscriptions CASCADE;
DROP TABLE IF EXISTS workflow_webhooks CASCADE;
DROP TABLE IF EXISTS workflow_schedules CASCADE;
DROP TABLE IF EXISTS workflow_action_logs CASCADE;
DROP TABLE IF EXISTS workflow_executions CASCADE;
DROP TABLE IF EXISTS workflow_templates CASCADE;

-- =====================================================
-- CREATE TABLES
-- =====================================================

CREATE TABLE workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    run_once BOOLEAN DEFAULT false,
    max_runs INTEGER,
    cooldown_minutes INTEGER,
    run_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    triggered_by VARCHAR(50) NOT NULL,
    trigger_data JSONB DEFAULT '{}',
    context JSONB DEFAULT '{}',
    variables JSONB DEFAULT '{}',
    current_action_index INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    actions_completed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,
    result JSONB DEFAULT '{}',
    error_message TEXT,
    error_details JSONB,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    action_index INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    error_stack TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint_path VARCHAR(255) NOT NULL UNIQUE,
    secret_key VARCHAR(255) NOT NULL,
    allowed_ips TEXT[],
    require_signature BOOLEAN DEFAULT true,
    signature_header VARCHAR(100) DEFAULT 'X-Webhook-Signature',
    is_active BOOLEAN DEFAULT true,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    event_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    conditions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE workflow_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    value_type VARCHAR(20) NOT NULL,
    value TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    scope VARCHAR(20) DEFAULT 'user',
    workflow_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_workflow_templates_user_id ON workflow_templates(user_id);
CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_trigger ON workflow_templates(trigger_type);
CREATE INDEX idx_workflow_templates_active ON workflow_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(tags);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user ON workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_created ON workflow_executions(created_at DESC);

CREATE INDEX idx_action_logs_execution ON workflow_action_logs(execution_id);
CREATE INDEX idx_action_logs_status ON workflow_action_logs(status);

CREATE INDEX idx_workflow_schedules_workflow ON workflow_schedules(workflow_id);
CREATE INDEX idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE is_active = true;

CREATE INDEX idx_workflow_webhooks_workflow ON workflow_webhooks(workflow_id);
CREATE INDEX idx_workflow_webhooks_endpoint ON workflow_webhooks(endpoint_path);

CREATE INDEX idx_event_subs_workflow ON workflow_event_subscriptions(workflow_id);
CREATE INDEX idx_event_subs_event ON workflow_event_subscriptions(event_name);

CREATE INDEX idx_workflow_variables_user ON workflow_variables(user_id);
CREATE INDEX idx_workflow_variables_workflow ON workflow_variables(workflow_id);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_variables ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

CREATE POLICY "workflow_templates_all" ON workflow_templates FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workflow_executions_all" ON workflow_executions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "action_logs_select" ON workflow_action_logs FOR SELECT
    USING (execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid()));
CREATE POLICY "action_logs_insert" ON workflow_action_logs FOR INSERT
    WITH CHECK (execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid()));
CREATE POLICY "workflow_schedules_all" ON workflow_schedules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workflow_webhooks_all" ON workflow_webhooks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "event_subs_all" ON workflow_event_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "workflow_variables_all" ON workflow_variables FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON workflow_templates TO authenticated;
GRANT ALL ON workflow_executions TO authenticated;
GRANT ALL ON workflow_action_logs TO authenticated;
GRANT ALL ON workflow_schedules TO authenticated;
GRANT ALL ON workflow_webhooks TO authenticated;
GRANT ALL ON workflow_event_subscriptions TO authenticated;
GRANT ALL ON workflow_variables TO authenticated;

GRANT ALL ON workflow_templates TO service_role;
GRANT ALL ON workflow_executions TO service_role;
GRANT ALL ON workflow_action_logs TO service_role;
GRANT ALL ON workflow_schedules TO service_role;
GRANT ALL ON workflow_webhooks TO service_role;
GRANT ALL ON workflow_event_subscriptions TO service_role;
GRANT ALL ON workflow_variables TO service_role;
