-- =====================================================
-- KAZI Workflow Automation Engine - Part 2: Indexes & RLS
-- =====================================================

-- Indexes for workflow templates
CREATE INDEX IF NOT EXISTS idx_workflow_templates_user_id ON workflow_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_trigger ON workflow_templates(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_active ON workflow_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_workflow_templates_tags ON workflow_templates USING GIN(tags);

-- Indexes for workflow executions
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created ON workflow_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_pending ON workflow_executions(status, created_at) WHERE status = 'pending';

-- Indexes for action logs
CREATE INDEX IF NOT EXISTS idx_action_logs_execution ON workflow_action_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_status ON workflow_action_logs(status);

-- Indexes for schedules
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_workflow ON workflow_schedules(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_schedules_next_run ON workflow_schedules(next_run_at) WHERE is_active = true;

-- Indexes for webhooks
CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_workflow ON workflow_webhooks(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_webhooks_endpoint ON workflow_webhooks(endpoint_path);

-- Indexes for event subscriptions
CREATE INDEX IF NOT EXISTS idx_event_subs_workflow ON workflow_event_subscriptions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_event_subs_event ON workflow_event_subscriptions(event_name);
CREATE INDEX IF NOT EXISTS idx_event_subs_active ON workflow_event_subscriptions(is_active, event_name) WHERE is_active = true;

-- Indexes for variables
CREATE INDEX IF NOT EXISTS idx_workflow_variables_user ON workflow_variables(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_variables_workflow ON workflow_variables(workflow_id);

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
