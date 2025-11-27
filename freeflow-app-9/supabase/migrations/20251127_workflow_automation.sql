-- Workflow Automation System
-- Visual workflow builder with triggers, actions, executions, and templates

-- ENUMS
CREATE TYPE trigger_type AS ENUM ('schedule', 'event', 'webhook', 'manual', 'form-submit', 'record-change');
CREATE TYPE action_type AS ENUM ('email', 'notification', 'create-task', 'update-record', 'api-call', 'delay', 'condition');
CREATE TYPE workflow_status AS ENUM ('draft', 'active', 'paused', 'error', 'completed');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'success', 'failed', 'skipped');
CREATE TYPE condition_operator AS ENUM ('equals', 'not-equals', 'contains', 'greater', 'less', 'exists', 'not-exists');
CREATE TYPE workflow_category AS ENUM ('sales', 'marketing', 'operations', 'support', 'hr', 'custom');

-- TABLES

-- Workflows
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status workflow_status NOT NULL DEFAULT 'draft',

  -- Trigger configuration
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  trigger_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Execution tracking
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  run_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) GENERATED ALWAYS AS (
    CASE WHEN run_count > 0 THEN (success_count::DECIMAL / run_count * 100) ELSE 0 END
  ) STORED,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  is_template BOOLEAN NOT NULL DEFAULT false,
  category workflow_category,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow Actions
CREATE TABLE workflow_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  action_type action_type NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Conditional logic
  conditions JSONB DEFAULT '[]'::jsonb,
  on_success_action_id UUID,
  on_failure_action_id UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status execution_status NOT NULL DEFAULT 'pending',
  triggered_by TEXT,

  -- I/O data
  input JSONB,
  output JSONB,
  error_message TEXT,

  -- Metrics
  duration_ms INTEGER,
  steps_total INTEGER DEFAULT 0,
  steps_completed INTEGER DEFAULT 0,
  steps_failed INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Execution Steps
CREATE TABLE execution_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES workflow_actions(id) ON DELETE CASCADE,
  action_type action_type NOT NULL,

  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status execution_status NOT NULL DEFAULT 'pending',

  -- I/O data
  input JSONB,
  output JSONB,
  error_message TEXT,
  duration_ms INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow Templates
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category workflow_category NOT NULL,
  icon TEXT,

  -- Template configuration
  trigger_type trigger_type NOT NULL,
  trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Workflow Logs
CREATE TABLE workflow_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES workflow_executions(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'debug')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_workflows_user ON workflows(user_id);
CREATE INDEX idx_workflows_status ON workflows(status);
CREATE INDEX idx_workflows_trigger_type ON workflows(trigger_type);
CREATE INDEX idx_workflows_next_run ON workflows(next_run_at) WHERE status = 'active';
CREATE INDEX idx_workflows_tags ON workflows USING GIN(tags);
CREATE INDEX idx_workflows_category ON workflows(category);

CREATE INDEX idx_workflow_actions_workflow ON workflow_actions(workflow_id);
CREATE INDEX idx_workflow_actions_type ON workflow_actions(action_type);
CREATE INDEX idx_workflow_actions_position ON workflow_actions(position);

CREATE INDEX idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX idx_workflow_executions_started ON workflow_executions(started_at DESC);

CREATE INDEX idx_execution_steps_execution ON execution_steps(execution_id);
CREATE INDEX idx_execution_steps_action ON execution_steps(action_id);
CREATE INDEX idx_execution_steps_status ON execution_steps(status);

CREATE INDEX idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX idx_workflow_templates_usage ON workflow_templates(usage_count DESC);
CREATE INDEX idx_workflow_templates_tags ON workflow_templates USING GIN(tags);

CREATE INDEX idx_workflow_logs_workflow ON workflow_logs(workflow_id);
CREATE INDEX idx_workflow_logs_execution ON workflow_logs(execution_id);
CREATE INDEX idx_workflow_logs_level ON workflow_logs(level);
CREATE INDEX idx_workflow_logs_created ON workflow_logs(created_at DESC);

-- TRIGGERS

-- Update workflow stats after execution
CREATE OR REPLACE FUNCTION update_workflow_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.status != OLD.status AND NEW.status IN ('success', 'failed') THEN
    UPDATE workflows
    SET
      run_count = run_count + 1,
      success_count = CASE WHEN NEW.status = 'success' THEN success_count + 1 ELSE success_count END,
      error_count = CASE WHEN NEW.status = 'failed' THEN error_count + 1 ELSE error_count END,
      last_run_at = NEW.completed_at
    WHERE id = NEW.workflow_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_workflow_stats
AFTER UPDATE ON workflow_executions
FOR EACH ROW
EXECUTE FUNCTION update_workflow_stats();

-- Update template usage count
CREATE OR REPLACE FUNCTION increment_template_usage() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_template = false AND NEW.category IS NOT NULL THEN
    -- Find matching template and increment
    UPDATE workflow_templates
    SET usage_count = usage_count + 1
    WHERE category = NEW.category;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_template_usage
AFTER INSERT ON workflows
FOR EACH ROW
EXECUTE FUNCTION increment_template_usage();

-- HELPER FUNCTIONS

-- Get workflow metrics
CREATE OR REPLACE FUNCTION get_workflow_metrics(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_workflows BIGINT,
  active_workflows BIGINT,
  total_executions BIGINT,
  success_rate DECIMAL,
  avg_execution_time BIGINT,
  automations_saved BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT w.id)::BIGINT,
    COUNT(DISTINCT w.id) FILTER (WHERE w.status = 'active')::BIGINT,
    COUNT(e.id)::BIGINT,
    ROUND(AVG(w.success_rate), 2),
    ROUND(AVG(e.duration_ms))::BIGINT,
    COUNT(e.id) FILTER (WHERE e.status = 'success')::BIGINT
  FROM workflows w
  LEFT JOIN workflow_executions e ON e.workflow_id = w.id
  WHERE p_user_id IS NULL OR w.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get failing workflows
CREATE OR REPLACE FUNCTION get_failing_workflows(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  error_rate DECIMAL,
  last_error TEXT,
  error_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    (w.error_count::DECIMAL / NULLIF(w.run_count, 0) * 100) as error_rate,
    e.error_message,
    w.error_count::BIGINT
  FROM workflows w
  LEFT JOIN LATERAL (
    SELECT error_message
    FROM workflow_executions
    WHERE workflow_id = w.id AND status = 'failed'
    ORDER BY started_at DESC
    LIMIT 1
  ) e ON true
  WHERE w.user_id = p_user_id AND w.error_count > 0
  ORDER BY error_rate DESC, w.error_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get execution timeline
CREATE OR REPLACE FUNCTION get_execution_timeline(p_workflow_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  executions BIGINT,
  successes BIGINT,
  failures BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(started_at) as date,
    COUNT(*)::BIGINT as executions,
    COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successes,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failures
  FROM workflow_executions
  WHERE workflow_id = p_workflow_id
    AND started_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(started_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;

-- Workflows - users can only access their own
CREATE POLICY workflows_select_own ON workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY workflows_insert_own ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY workflows_update_own ON workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY workflows_delete_own ON workflows FOR DELETE USING (auth.uid() = user_id);

-- Workflow actions - access through parent workflow
CREATE POLICY workflow_actions_all ON workflow_actions FOR ALL USING (
  EXISTS (SELECT 1 FROM workflows WHERE id = workflow_actions.workflow_id AND user_id = auth.uid())
);

-- Workflow executions - access through parent workflow
CREATE POLICY workflow_executions_all ON workflow_executions FOR ALL USING (
  EXISTS (SELECT 1 FROM workflows WHERE id = workflow_executions.workflow_id AND user_id = auth.uid())
);

-- Execution steps - access through parent execution
CREATE POLICY execution_steps_all ON execution_steps FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workflow_executions e
    JOIN workflows w ON w.id = e.workflow_id
    WHERE e.id = execution_steps.execution_id AND w.user_id = auth.uid()
  )
);

-- Templates - public read, verified creators can write
CREATE POLICY workflow_templates_select_all ON workflow_templates FOR SELECT USING (true);
CREATE POLICY workflow_templates_insert_verified ON workflow_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY workflow_templates_update_own ON workflow_templates FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY workflow_templates_delete_own ON workflow_templates FOR DELETE USING (auth.uid() = created_by);

-- Logs - access through parent workflow
CREATE POLICY workflow_logs_all ON workflow_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM workflows WHERE id = workflow_logs.workflow_id AND user_id = auth.uid())
);
