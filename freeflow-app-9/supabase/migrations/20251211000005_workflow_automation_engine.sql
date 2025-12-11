-- =====================================================
-- KAZI Workflow Automation Engine Migration
-- Version: 1.0.0
-- Date: 2025-12-11
-- Description: Complete workflow automation system with
--              triggers, actions, conditions, and execution tracking
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- WORKFLOW TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN (
        'client_management', 'project_management', 'invoicing',
        'communication', 'team', 'file_management', 'custom'
    )),

    -- Trigger Configuration
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'event', 'schedule', 'webhook', 'manual', 'condition'
    )),
    trigger_config JSONB NOT NULL DEFAULT '{}',
    -- For event: { event_name, resource_type, conditions }
    -- For schedule: { cron, timezone }
    -- For webhook: { endpoint, secret }
    -- For condition: { field, operator, value }

    -- Actions
    actions JSONB NOT NULL DEFAULT '[]',
    -- Array of: { type, config, order, conditions }
    -- Types: send_email, create_task, update_record, send_notification,
    --        webhook, delay, condition, create_invoice, assign_team_member

    -- Settings
    is_active BOOLEAN DEFAULT true,
    run_once BOOLEAN DEFAULT false,
    max_runs INTEGER,
    cooldown_minutes INTEGER,

    -- Stats
    run_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,

    -- Tags
    tags TEXT[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for workflow templates
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_templates_user_id ON workflow_templates(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger ON workflow_templates(trigger_type); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active) WHERE is_active = true; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(tags); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW EXECUTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Execution Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled', 'paused'
    )),

    -- Trigger Info
    triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN (
        'event', 'schedule', 'webhook', 'manual', 'api'
    )),
    trigger_data JSONB DEFAULT '{}',

    -- Execution Context
    context JSONB DEFAULT '{}',
    variables JSONB DEFAULT '{}',

    -- Progress
    current_action_index INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    actions_completed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,

    -- Results
    result JSONB DEFAULT '{}',
    error_message TEXT,
    error_details JSONB,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Retry
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for workflow executions
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_executions_user ON workflow_executions(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_executions_created ON workflow_executions(created_at DESC); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_executions_pending ON workflow_executions(status, created_at) WHERE status = 'pending'; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW ACTION LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,

    -- Action Info
    action_index INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB DEFAULT '{}',

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    )),

    -- Input/Output
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',

    -- Error Handling
    error_message TEXT,
    error_stack TEXT,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for action logs
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_action_logs_execution ON workflow_action_logs(execution_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_action_logs_status ON workflow_action_logs(status); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW SCHEDULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Schedule Config
    cron_expression VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',

    -- Status
    is_active BOOLEAN DEFAULT true,
    next_run_at TIMESTAMPTZ,
    last_run_at TIMESTAMPTZ,

    -- Stats
    run_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for schedules
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_schedules_workflow ON workflow_schedules(workflow_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE is_active = true; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW WEBHOOKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Webhook Config
    endpoint_path VARCHAR(255) NOT NULL UNIQUE,
    secret_key VARCHAR(255) NOT NULL,
    allowed_ips TEXT[],

    -- Validation
    require_signature BOOLEAN DEFAULT true,
    signature_header VARCHAR(100) DEFAULT 'X-Webhook-Signature',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Stats
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for webhooks
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_workflow ON workflow_webhooks(workflow_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_endpoint ON workflow_webhooks(endpoint_path); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW EVENT SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_event_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Event Config
    event_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    conditions JSONB DEFAULT '{}',

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Stats
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for event subscriptions
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_event_subs_workflow ON workflow_event_subscriptions(workflow_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_event_subs_event ON workflow_event_subscriptions(event_name); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_event_subs_active ON workflow_event_subscriptions(is_active, event_name) WHERE is_active = true; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- WORKFLOW VARIABLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Variable Info
    name VARCHAR(100) NOT NULL,
    description TEXT,
    value_type VARCHAR(20) NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'secret')),
    value TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,

    -- Scope
    scope VARCHAR(20) DEFAULT 'user' CHECK (scope IN ('user', 'workflow', 'global')),
    workflow_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_variable_name_per_scope UNIQUE(user_id, name, scope, workflow_id)
);

-- Indexes for variables
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_variables_user ON workflow_variables(user_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN CREATE INDEX IF NOT EXISTS idx_workflow_variables_workflow ON workflow_variables(workflow_id); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_variables ENABLE ROW LEVEL SECURITY;

-- Workflow templates
DROP POLICY IF EXISTS "workflow_templates_select" ON workflow_templates;
CREATE POLICY "workflow_templates_select" ON workflow_templates FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_templates_insert" ON workflow_templates;
CREATE POLICY "workflow_templates_insert" ON workflow_templates FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_templates_update" ON workflow_templates;
CREATE POLICY "workflow_templates_update" ON workflow_templates FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_templates_delete" ON workflow_templates;
CREATE POLICY "workflow_templates_delete" ON workflow_templates FOR DELETE USING (auth.uid() = user_id);

-- Workflow executions
DROP POLICY IF EXISTS "workflow_executions_select" ON workflow_executions;
CREATE POLICY "workflow_executions_select" ON workflow_executions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_executions_insert" ON workflow_executions;
CREATE POLICY "workflow_executions_insert" ON workflow_executions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_executions_update" ON workflow_executions;
CREATE POLICY "workflow_executions_update" ON workflow_executions FOR UPDATE USING (auth.uid() = user_id);

-- Action logs (via execution)
DROP POLICY IF EXISTS "action_logs_select" ON workflow_action_logs;
CREATE POLICY "action_logs_select" ON workflow_action_logs FOR SELECT
    USING (execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "action_logs_insert" ON workflow_action_logs;
CREATE POLICY "action_logs_insert" ON workflow_action_logs FOR INSERT
    WITH CHECK (execution_id IN (SELECT id FROM workflow_executions WHERE user_id = auth.uid()));

-- Schedules
DROP POLICY IF EXISTS "workflow_schedules_select" ON workflow_schedules;
CREATE POLICY "workflow_schedules_select" ON workflow_schedules FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_schedules_all" ON workflow_schedules;
CREATE POLICY "workflow_schedules_all" ON workflow_schedules FOR ALL USING (auth.uid() = user_id);

-- Webhooks
DROP POLICY IF EXISTS "workflow_webhooks_select" ON workflow_webhooks;
CREATE POLICY "workflow_webhooks_select" ON workflow_webhooks FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_webhooks_all" ON workflow_webhooks;
CREATE POLICY "workflow_webhooks_all" ON workflow_webhooks FOR ALL USING (auth.uid() = user_id);

-- Event subscriptions
DROP POLICY IF EXISTS "event_subs_select" ON workflow_event_subscriptions;
CREATE POLICY "event_subs_select" ON workflow_event_subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "event_subs_all" ON workflow_event_subscriptions;
CREATE POLICY "event_subs_all" ON workflow_event_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Variables
DROP POLICY IF EXISTS "workflow_variables_select" ON workflow_variables;
CREATE POLICY "workflow_variables_select" ON workflow_variables FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workflow_variables_all" ON workflow_variables;
CREATE POLICY "workflow_variables_all" ON workflow_variables FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Create workflow execution
CREATE OR REPLACE FUNCTION create_workflow_execution(
    p_workflow_id UUID,
    p_triggered_by VARCHAR(50),
    p_trigger_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_execution_id UUID;
    v_workflow workflow_templates%ROWTYPE;
BEGIN
    -- Get workflow
    SELECT * INTO v_workflow FROM workflow_templates WHERE id = p_workflow_id;

    IF v_workflow.id IS NULL THEN
        RAISE EXCEPTION 'Workflow not found';
    END IF;

    IF NOT v_workflow.is_active THEN
        RAISE EXCEPTION 'Workflow is not active';
    END IF;

    -- Create execution
    INSERT INTO workflow_executions (
        workflow_id,
        user_id,
        status,
        triggered_by,
        trigger_data,
        total_actions
    ) VALUES (
        p_workflow_id,
        v_workflow.user_id,
        'pending',
        p_triggered_by,
        p_trigger_data,
        jsonb_array_length(v_workflow.actions)
    )
    RETURNING id INTO v_execution_id;

    -- Update workflow stats
    UPDATE workflow_templates
    SET run_count = run_count + 1,
        last_run_at = NOW()
    WHERE id = p_workflow_id;

    RETURN v_execution_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Complete workflow execution
CREATE OR REPLACE FUNCTION complete_workflow_execution(
    p_execution_id UUID,
    p_status VARCHAR(20),
    p_result JSONB DEFAULT '{}',
    p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_execution workflow_executions%ROWTYPE;
    v_duration INTEGER;
BEGIN
    SELECT * INTO v_execution FROM workflow_executions WHERE id = p_execution_id;

    IF v_execution.id IS NULL THEN
        RETURN false;
    END IF;

    -- Calculate duration
    v_duration := EXTRACT(EPOCH FROM (NOW() - v_execution.started_at)) * 1000;

    -- Update execution
    UPDATE workflow_executions
    SET status = p_status,
        result = p_result,
        error_message = p_error_message,
        completed_at = NOW(),
        duration_ms = v_duration
    WHERE id = p_execution_id;

    -- Update workflow stats
    IF p_status = 'completed' THEN
        UPDATE workflow_templates
        SET last_success_at = NOW()
        WHERE id = v_execution.workflow_id;
    ELSIF p_status = 'failed' THEN
        UPDATE workflow_templates
        SET last_failure_at = NOW()
        WHERE id = v_execution.workflow_id;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workflows triggered by event
CREATE OR REPLACE FUNCTION get_workflows_for_event(
    p_event_name VARCHAR(100),
    p_resource_type VARCHAR(100) DEFAULT NULL,
    p_event_data JSONB DEFAULT '{}'
)
RETURNS TABLE(
    workflow_id UUID,
    user_id UUID,
    workflow_name VARCHAR(255),
    actions JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wt.id as workflow_id,
        wt.user_id,
        wt.name as workflow_name,
        wt.actions
    FROM workflow_templates wt
    JOIN workflow_event_subscriptions wes ON wes.workflow_id = wt.id
    WHERE wes.event_name = p_event_name
    AND wes.is_active = true
    AND wt.is_active = true
    AND (wes.resource_type IS NULL OR wes.resource_type = p_resource_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pending scheduled workflows
CREATE OR REPLACE FUNCTION get_pending_scheduled_workflows()
RETURNS TABLE(
    schedule_id UUID,
    workflow_id UUID,
    user_id UUID,
    cron_expression VARCHAR(100),
    timezone VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ws.id as schedule_id,
        ws.workflow_id,
        ws.user_id,
        ws.cron_expression,
        ws.timezone
    FROM workflow_schedules ws
    JOIN workflow_templates wt ON wt.id = ws.workflow_id
    WHERE ws.is_active = true
    AND wt.is_active = true
    AND (ws.next_run_at IS NULL OR ws.next_run_at <= NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update schedule next run
CREATE OR REPLACE FUNCTION update_schedule_next_run(
    p_schedule_id UUID,
    p_next_run_at TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE workflow_schedules
    SET next_run_at = p_next_run_at,
        last_run_at = NOW(),
        run_count = run_count + 1,
        updated_at = NOW()
    WHERE id = p_schedule_id;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get workflow statistics
CREATE OR REPLACE FUNCTION get_workflow_statistics(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_workflows', (SELECT COUNT(*) FROM workflow_templates WHERE user_id = p_user_id),
        'active_workflows', (SELECT COUNT(*) FROM workflow_templates WHERE user_id = p_user_id AND is_active = true),
        'total_executions', (
            SELECT COUNT(*) FROM workflow_executions
            WHERE user_id = p_user_id
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'successful_executions', (
            SELECT COUNT(*) FROM workflow_executions
            WHERE user_id = p_user_id
            AND status = 'completed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'failed_executions', (
            SELECT COUNT(*) FROM workflow_executions
            WHERE user_id = p_user_id
            AND status = 'failed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'avg_duration_ms', (
            SELECT COALESCE(AVG(duration_ms), 0)::INTEGER FROM workflow_executions
            WHERE user_id = p_user_id
            AND status = 'completed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'by_trigger', (
            SELECT jsonb_object_agg(triggered_by, cnt)
            FROM (
                SELECT triggered_by, COUNT(*) as cnt
                FROM workflow_executions
                WHERE user_id = p_user_id
                AND created_at > NOW() - (p_days || ' days')::INTERVAL
                GROUP BY triggered_by
            ) sub
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at trigger
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS workflow_templates_updated_at ON workflow_templates;
CREATE TRIGGER workflow_templates_updated_at
    BEFORE UPDATE ON workflow_templates
    FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();

DROP TRIGGER IF EXISTS workflow_schedules_updated_at ON workflow_schedules;
CREATE TRIGGER workflow_schedules_updated_at
    BEFORE UPDATE ON workflow_schedules
    FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();

DROP TRIGGER IF EXISTS workflow_webhooks_updated_at ON workflow_webhooks;
CREATE TRIGGER workflow_webhooks_updated_at
    BEFORE UPDATE ON workflow_webhooks
    FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();

DROP TRIGGER IF EXISTS workflow_variables_updated_at ON workflow_variables;
CREATE TRIGGER workflow_variables_updated_at
    BEFORE UPDATE ON workflow_variables
    FOR EACH ROW EXECUTE FUNCTION update_workflow_updated_at();

-- =====================================================
-- GRANTS
-- =====================================================

DO $$ BEGIN GRANT ALL ON workflow_templates TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_executions TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_action_logs TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_schedules TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_webhooks TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_event_subscriptions TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_variables TO authenticated; EXCEPTION WHEN OTHERS THEN NULL; END $$;

DO $$ BEGIN GRANT ALL ON workflow_templates TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_executions TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_action_logs TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_schedules TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_webhooks TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_event_subscriptions TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN GRANT ALL ON workflow_variables TO service_role; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- =====================================================
-- SEED DATA: WORKFLOW TEMPLATES
-- =====================================================

-- Note: These are example templates that users can clone
-- They would be created with a system user_id or as global templates
