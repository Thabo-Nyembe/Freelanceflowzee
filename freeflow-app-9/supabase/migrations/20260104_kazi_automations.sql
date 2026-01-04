-- Kazi Automations System
-- Rule-based automation engine with triggers, actions, and execution tracking

-- ENUMS (only if not exists)
DO $$ BEGIN
    CREATE TYPE automation_status AS ENUM ('active', 'paused', 'error', 'draft');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kazi_trigger_type AS ENUM ('manual', 'schedule', 'webhook', 'event', 'form', 'record-change');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE kazi_action_type AS ENUM (
        'email', 'notification', 'create-task', 'update-record', 'api-call',
        'delay', 'condition', 'create-project', 'send-invoice', 'send-sms',
        'slack-message', 'discord-message', 'create-event', 'update-status'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Automations table
CREATE TABLE IF NOT EXISTS automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status automation_status NOT NULL DEFAULT 'draft',

    -- Trigger configuration
    trigger_type kazi_trigger_type NOT NULL DEFAULT 'manual',
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Actions (array of action configs)
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Categorization
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    icon TEXT DEFAULT 'Zap',
    color TEXT DEFAULT 'blue',

    -- Execution tracking
    last_triggered_at TIMESTAMPTZ,
    next_scheduled_at TIMESTAMPTZ,
    run_count INTEGER NOT NULL DEFAULT 0,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    success_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
        CASE WHEN run_count > 0 THEN (success_count::DECIMAL / run_count * 100) ELSE 0 END
    ) STORED,

    -- Time saved (in minutes)
    time_saved INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Executions table
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'cancelled')),
    triggered_by TEXT,

    -- I/O data
    input JSONB,
    output JSONB,
    error_message TEXT,

    -- Metrics
    duration_ms INTEGER,
    actions_total INTEGER DEFAULT 0,
    actions_completed INTEGER DEFAULT 0,
    actions_failed INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Action Logs
CREATE TABLE IF NOT EXISTS automation_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES automation_executions(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    action_index INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),

    input JSONB,
    output JSONB,
    error_message TEXT,
    duration_ms INTEGER,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Templates
CREATE TABLE IF NOT EXISTS automation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general',
    icon TEXT DEFAULT 'Zap',
    color TEXT DEFAULT 'blue',

    -- Template configuration
    trigger_type kazi_trigger_type NOT NULL DEFAULT 'manual',
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Metadata
    tags TEXT[] DEFAULT '{}',
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Schedules (for scheduled triggers)
CREATE TABLE IF NOT EXISTS automation_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    cron_expression TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Webhooks (for webhook triggers)
CREATE TABLE IF NOT EXISTS automation_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID NOT NULL REFERENCES automations(id) ON DELETE CASCADE,
    webhook_url TEXT NOT NULL,
    secret_key TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    trigger_count INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_automations_user ON automations(user_id);
CREATE INDEX IF NOT EXISTS idx_automations_status ON automations(status);
CREATE INDEX IF NOT EXISTS idx_automations_trigger_type ON automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automations_category ON automations(category);
CREATE INDEX IF NOT EXISTS idx_automations_tags ON automations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_automations_next_scheduled ON automations(next_scheduled_at) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_status ON automation_executions(status);
CREATE INDEX IF NOT EXISTS idx_automation_executions_started ON automation_executions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_automation_action_logs_execution ON automation_action_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_automation_action_logs_status ON automation_action_logs(status);

CREATE INDEX IF NOT EXISTS idx_automation_templates_category ON automation_templates(category);
CREATE INDEX IF NOT EXISTS idx_automation_templates_usage ON automation_templates(usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_automation_schedules_automation ON automation_schedules(automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_schedules_next_run ON automation_schedules(next_run_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_automation_webhooks_automation ON automation_webhooks(automation_id);

-- TRIGGERS

-- Update automation stats after execution
CREATE OR REPLACE FUNCTION update_automation_stats() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status != OLD.status AND NEW.status IN ('success', 'failed') THEN
        UPDATE automations
        SET
            run_count = run_count + 1,
            success_count = CASE WHEN NEW.status = 'success' THEN success_count + 1 ELSE success_count END,
            error_count = CASE WHEN NEW.status = 'failed' THEN error_count + 1 ELSE error_count END,
            last_triggered_at = NEW.completed_at,
            -- Estimate time saved (5 minutes per successful run)
            time_saved = CASE WHEN NEW.status = 'success' THEN time_saved + 5 ELSE time_saved END,
            updated_at = NOW()
        WHERE id = NEW.automation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_automation_stats ON automation_executions;
CREATE TRIGGER trigger_update_automation_stats
AFTER UPDATE ON automation_executions
FOR EACH ROW
EXECUTE FUNCTION update_automation_stats();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_automation_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_automation_timestamp ON automations;
CREATE TRIGGER trigger_automation_timestamp
BEFORE UPDATE ON automations
FOR EACH ROW
EXECUTE FUNCTION update_automation_timestamp();

-- HELPER FUNCTIONS

-- Get automation metrics for a user
CREATE OR REPLACE FUNCTION get_automation_metrics(p_user_id UUID)
RETURNS TABLE (
    total_automations BIGINT,
    active_automations BIGINT,
    total_executions BIGINT,
    success_rate DECIMAL,
    total_time_saved BIGINT,
    avg_execution_time BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT a.id)::BIGINT,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'active')::BIGINT,
        COUNT(e.id)::BIGINT,
        ROUND(AVG(a.success_rate), 2),
        COALESCE(SUM(a.time_saved), 0)::BIGINT,
        ROUND(AVG(e.duration_ms))::BIGINT
    FROM automations a
    LEFT JOIN automation_executions e ON e.automation_id = a.id
    WHERE a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get top performing automations
CREATE OR REPLACE FUNCTION get_top_automations(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    name TEXT,
    run_count INTEGER,
    success_rate DECIMAL,
    time_saved INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.run_count,
        a.success_rate,
        a.time_saved
    FROM automations a
    WHERE a.user_id = p_user_id AND a.run_count > 0
    ORDER BY a.success_rate DESC, a.run_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get execution history for an automation
CREATE OR REPLACE FUNCTION get_automation_history(p_automation_id UUID, p_limit INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status TEXT,
    duration_ms INTEGER,
    actions_completed INTEGER,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.id,
        e.started_at,
        e.completed_at,
        e.status,
        e.duration_ms,
        e.actions_completed,
        e.error_message
    FROM automation_executions e
    WHERE e.automation_id = p_automation_id
    ORDER BY e.started_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_action_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_webhooks ENABLE ROW LEVEL SECURITY;

-- Automations - users can only access their own
DROP POLICY IF EXISTS automations_select_own ON automations;
DROP POLICY IF EXISTS automations_insert_own ON automations;
DROP POLICY IF EXISTS automations_update_own ON automations;
DROP POLICY IF EXISTS automations_delete_own ON automations;

CREATE POLICY automations_select_own ON automations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY automations_insert_own ON automations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY automations_update_own ON automations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY automations_delete_own ON automations FOR DELETE USING (auth.uid() = user_id);

-- Automation executions - access through parent automation
DROP POLICY IF EXISTS automation_executions_all ON automation_executions;
CREATE POLICY automation_executions_all ON automation_executions FOR ALL USING (
    EXISTS (SELECT 1 FROM automations WHERE id = automation_executions.automation_id AND user_id = auth.uid())
);

-- Action logs - access through parent execution
DROP POLICY IF EXISTS automation_action_logs_all ON automation_action_logs;
CREATE POLICY automation_action_logs_all ON automation_action_logs FOR ALL USING (
    EXISTS (
        SELECT 1 FROM automation_executions e
        JOIN automations a ON a.id = e.automation_id
        WHERE e.id = automation_action_logs.execution_id AND a.user_id = auth.uid()
    )
);

-- Templates - public read, authenticated write
DROP POLICY IF EXISTS automation_templates_select_all ON automation_templates;
DROP POLICY IF EXISTS automation_templates_insert_auth ON automation_templates;
DROP POLICY IF EXISTS automation_templates_update_own ON automation_templates;
DROP POLICY IF EXISTS automation_templates_delete_own ON automation_templates;

CREATE POLICY automation_templates_select_all ON automation_templates FOR SELECT USING (true);
CREATE POLICY automation_templates_insert_auth ON automation_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY automation_templates_update_own ON automation_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY automation_templates_delete_own ON automation_templates FOR DELETE USING (auth.uid() = created_by);

-- Schedules - access through parent automation
DROP POLICY IF EXISTS automation_schedules_all ON automation_schedules;
CREATE POLICY automation_schedules_all ON automation_schedules FOR ALL USING (
    EXISTS (SELECT 1 FROM automations WHERE id = automation_schedules.automation_id AND user_id = auth.uid())
);

-- Webhooks - access through parent automation
DROP POLICY IF EXISTS automation_webhooks_all ON automation_webhooks;
CREATE POLICY automation_webhooks_all ON automation_webhooks FOR ALL USING (
    EXISTS (SELECT 1 FROM automations WHERE id = automation_webhooks.automation_id AND user_id = auth.uid())
);

-- Insert default templates
INSERT INTO automation_templates (name, description, category, icon, color, trigger_type, trigger_config, actions, tags, is_verified)
VALUES
    ('New Client Welcome', 'Send a welcome email when a new client is added', 'clients', 'UserPlus', 'blue', 'event', '{"event": "client.created"}'::jsonb, '[{"type": "email", "config": {"template": "welcome"}}]'::jsonb, ARRAY['onboarding', 'clients'], true),
    ('Invoice Reminder', 'Send reminder for overdue invoices', 'billing', 'Receipt', 'amber', 'schedule', '{"cron": "0 9 * * *"}'::jsonb, '[{"type": "condition", "config": {"field": "status", "operator": "equals", "value": "overdue"}}, {"type": "email", "config": {"template": "invoice-reminder"}}]'::jsonb, ARRAY['invoices', 'billing'], true),
    ('Task Assignment Notification', 'Notify team member when assigned to task', 'tasks', 'CheckSquare', 'green', 'event', '{"event": "task.assigned"}'::jsonb, '[{"type": "notification", "config": {"message": "You have been assigned a new task"}}]'::jsonb, ARRAY['tasks', 'notifications'], true),
    ('Project Completion', 'Update status and notify client when project is complete', 'projects', 'FolderCheck', 'purple', 'event', '{"event": "project.completed"}'::jsonb, '[{"type": "update-status", "config": {"status": "delivered"}}, {"type": "email", "config": {"template": "project-complete"}}]'::jsonb, ARRAY['projects', 'clients'], true),
    ('Daily Standup Reminder', 'Send daily standup reminder to team', 'team', 'Clock', 'indigo', 'schedule', '{"cron": "0 9 * * 1-5"}'::jsonb, '[{"type": "slack-message", "config": {"channel": "#general", "message": "Time for daily standup!"}}]'::jsonb, ARRAY['team', 'meetings'], true),
    ('Weekly Report', 'Generate and send weekly progress report', 'reports', 'BarChart', 'teal', 'schedule', '{"cron": "0 18 * * 5"}'::jsonb, '[{"type": "api-call", "config": {"action": "generate-report"}}, {"type": "email", "config": {"template": "weekly-report"}}]'::jsonb, ARRAY['reports', 'analytics'], true)
ON CONFLICT DO NOTHING;
