-- =====================================================
-- KAZI Workflow Automation Engine - Part 3: Functions
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
    SELECT * INTO v_workflow FROM workflow_templates WHERE id = p_workflow_id;

    IF v_workflow.id IS NULL THEN
        RAISE EXCEPTION 'Workflow not found';
    END IF;

    IF NOT v_workflow.is_active THEN
        RAISE EXCEPTION 'Workflow is not active';
    END IF;

    INSERT INTO workflow_executions (
        workflow_id, user_id, status, triggered_by, trigger_data, total_actions
    ) VALUES (
        p_workflow_id, v_workflow.user_id, 'pending', p_triggered_by, p_trigger_data,
        jsonb_array_length(v_workflow.actions)
    )
    RETURNING id INTO v_execution_id;

    UPDATE workflow_templates
    SET run_count = run_count + 1, last_run_at = NOW()
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

    v_duration := EXTRACT(EPOCH FROM (NOW() - v_execution.started_at)) * 1000;

    UPDATE workflow_executions
    SET status = p_status, result = p_result, error_message = p_error_message,
        completed_at = NOW(), duration_ms = v_duration
    WHERE id = p_execution_id;

    IF p_status = 'completed' THEN
        UPDATE workflow_templates SET last_success_at = NOW() WHERE id = v_execution.workflow_id;
    ELSIF p_status = 'failed' THEN
        UPDATE workflow_templates SET last_failure_at = NOW() WHERE id = v_execution.workflow_id;
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
    SELECT wt.id, wt.user_id, wt.name, wt.actions
    FROM workflow_templates wt
    JOIN workflow_event_subscriptions wes ON wes.workflow_id = wt.id
    WHERE wes.event_name = p_event_name
    AND wes.is_active = true AND wt.is_active = true
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
    SELECT ws.id, ws.workflow_id, ws.user_id, ws.cron_expression, ws.timezone
    FROM workflow_schedules ws
    JOIN workflow_templates wt ON wt.id = ws.workflow_id
    WHERE ws.is_active = true AND wt.is_active = true
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
    SET next_run_at = p_next_run_at, last_run_at = NOW(),
        run_count = run_count + 1, updated_at = NOW()
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
            WHERE user_id = p_user_id AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'successful_executions', (
            SELECT COUNT(*) FROM workflow_executions
            WHERE user_id = p_user_id AND status = 'completed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'failed_executions', (
            SELECT COUNT(*) FROM workflow_executions
            WHERE user_id = p_user_id AND status = 'failed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        ),
        'avg_duration_ms', (
            SELECT COALESCE(AVG(duration_ms), 0)::INTEGER FROM workflow_executions
            WHERE user_id = p_user_id AND status = 'completed'
            AND created_at > NOW() - (p_days || ' days')::INTERVAL
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

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
