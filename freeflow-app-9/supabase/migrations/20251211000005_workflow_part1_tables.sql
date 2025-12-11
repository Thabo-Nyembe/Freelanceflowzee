-- =====================================================
-- KAZI Workflow Automation Engine - Part 1: Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- WORKFLOW TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN (
        'client_management', 'project_management', 'invoicing',
        'communication', 'team', 'file_management', 'custom'
    )),
    trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
        'event', 'schedule', 'webhook', 'manual', 'condition'
    )),
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

-- =====================================================
-- WORKFLOW EXECUTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES workflow_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'cancelled', 'paused'
    )),
    triggered_by VARCHAR(50) NOT NULL CHECK (triggered_by IN (
        'event', 'schedule', 'webhook', 'manual', 'api'
    )),
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

-- =====================================================
-- WORKFLOW ACTION LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_action_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    action_index INTEGER NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_config JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'completed', 'failed', 'skipped'
    )),
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',
    error_message TEXT,
    error_stack TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WORKFLOW SCHEDULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_schedules (
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

-- =====================================================
-- WORKFLOW WEBHOOKS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_webhooks (
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

-- =====================================================
-- WORKFLOW EVENT SUBSCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_event_subscriptions (
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

-- =====================================================
-- WORKFLOW VARIABLES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS workflow_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    value_type VARCHAR(20) NOT NULL CHECK (value_type IN ('string', 'number', 'boolean', 'json', 'secret')),
    value TEXT NOT NULL,
    is_encrypted BOOLEAN DEFAULT false,
    scope VARCHAR(20) DEFAULT 'user' CHECK (scope IN ('user', 'workflow', 'global')),
    workflow_id UUID REFERENCES workflow_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_variable_name_per_scope UNIQUE(user_id, name, scope, workflow_id)
);
