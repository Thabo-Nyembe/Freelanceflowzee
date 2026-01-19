-- =============================================================================
-- AUTOMATION RECIPE BUILDER MODULE
-- Competing with: Zapier, Make (Integromat), n8n, Pipedream
-- =============================================================================

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Automation Recipes (Visual Workflows)
CREATE TABLE IF NOT EXISTS automation_recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Recipe Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'general',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    icon VARCHAR(50) DEFAULT 'Workflow',
    color VARCHAR(20) DEFAULT 'blue',

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'error', 'archived')),
    version INTEGER DEFAULT 1,

    -- Settings (JSONB)
    settings JSONB DEFAULT '{
        "timezone": "UTC",
        "errorHandling": "stop",
        "maxRetries": 3,
        "retryDelay": 60,
        "concurrency": 1,
        "logging": "errors",
        "notifications": {
            "onSuccess": false,
            "onError": true
        }
    }'::JSONB,

    -- Statistics
    total_runs INTEGER DEFAULT 0,
    successful_runs INTEGER DEFAULT 0,
    failed_runs INTEGER DEFAULT 0,
    average_duration INTEGER DEFAULT 0, -- milliseconds
    total_time_saved INTEGER DEFAULT 0, -- seconds

    -- Timestamps
    last_run_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Recipe Nodes (Triggers and Actions)
CREATE TABLE IF NOT EXISTS recipe_nodes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,

    -- Node Type
    node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('trigger', 'action', 'condition', 'loop', 'transform', 'delay')),
    trigger_type VARCHAR(50), -- For trigger nodes
    action_type VARCHAR(50), -- For action nodes

    -- Node Information
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Configuration
    config JSONB DEFAULT '{}'::JSONB,

    -- Position in Visual Builder
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{
        "icon": "Circle",
        "color": "gray",
        "retryOnError": false,
        "maxRetries": 0,
        "timeout": 30000
    }'::JSONB,

    -- Ordering
    sort_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Edges (Connections between nodes)
CREATE TABLE IF NOT EXISTS recipe_edges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,

    -- Connection
    source_node_id UUID NOT NULL REFERENCES recipe_nodes(id) ON DELETE CASCADE,
    target_node_id UUID NOT NULL REFERENCES recipe_nodes(id) ON DELETE CASCADE,

    -- Handles for multi-output nodes
    source_handle VARCHAR(50),
    target_handle VARCHAR(50),

    -- Conditional Edge
    condition JSONB, -- { field, operator, value }
    label VARCHAR(100),

    -- Edge styling
    edge_type VARCHAR(20) DEFAULT 'default',
    animated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(recipe_id, source_node_id, target_node_id, source_handle, target_handle)
);

-- Recipe Variables
CREATE TABLE IF NOT EXISTS recipe_variables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    var_type VARCHAR(20) NOT NULL CHECK (var_type IN ('string', 'number', 'boolean', 'array', 'object', 'date')),
    default_value JSONB,
    is_required BOOLEAN DEFAULT FALSE,
    description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(recipe_id, name)
);

-- Recipe Execution History
CREATE TABLE IF NOT EXISTS recipe_executions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Execution Status
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'success', 'error', 'partial', 'cancelled')),

    -- Trigger Data
    trigger_data JSONB,

    -- Results
    outputs JSONB DEFAULT '{}'::JSONB,
    nodes_executed INTEGER DEFAULT 0,

    -- Error Information
    error_node_id UUID REFERENCES recipe_nodes(id),
    error_message TEXT,
    error_stack TEXT,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration INTEGER, -- milliseconds

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Execution Logs
CREATE TABLE IF NOT EXISTS recipe_execution_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    execution_id UUID NOT NULL REFERENCES recipe_executions(id) ON DELETE CASCADE,
    node_id UUID REFERENCES recipe_nodes(id) ON DELETE SET NULL,

    log_level VARCHAR(10) NOT NULL CHECK (log_level IN ('debug', 'info', 'warn', 'error')),
    message TEXT NOT NULL,
    data JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe Templates (Pre-built recipes)
CREATE TABLE IF NOT EXISTS recipe_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Template Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    icon VARCHAR(50) DEFAULT 'Workflow',
    color VARCHAR(20) DEFAULT 'blue',

    -- Popularity
    popularity INTEGER DEFAULT 0,
    use_count INTEGER DEFAULT 0,

    -- Template Data
    nodes JSONB NOT NULL DEFAULT '[]'::JSONB,
    edges JSONB NOT NULL DEFAULT '[]'::JSONB,
    variables JSONB NOT NULL DEFAULT '[]'::JSONB,

    -- Required Integrations
    required_integrations TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Status
    is_featured BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connected Integrations (OAuth tokens, API keys)
CREATE TABLE IF NOT EXISTS recipe_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Integration Info
    integration_id VARCHAR(100) NOT NULL, -- e.g., 'slack', 'google', 'stripe'
    integration_name VARCHAR(255) NOT NULL,

    -- Authentication
    auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('oauth2', 'api_key', 'basic', 'none')),
    access_token TEXT,
    refresh_token TEXT,
    api_key TEXT,
    token_expires_at TIMESTAMPTZ,

    -- Additional Config
    config JSONB DEFAULT '{}'::JSONB,

    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, integration_id)
);

-- Webhook Endpoints
CREATE TABLE IF NOT EXISTS recipe_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES recipe_nodes(id) ON DELETE CASCADE,

    -- Webhook URL Key
    webhook_key VARCHAR(100) UNIQUE NOT NULL,

    -- Configuration
    secret_key VARCHAR(100),
    allowed_methods TEXT[] DEFAULT ARRAY['POST']::TEXT[],
    allowed_ips TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Rate Limiting
    rate_limit INTEGER DEFAULT 100, -- per minute
    rate_limit_window INTEGER DEFAULT 60, -- seconds

    -- Statistics
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    last_request_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Triggers
CREATE TABLE IF NOT EXISTS recipe_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID NOT NULL REFERENCES automation_recipes(id) ON DELETE CASCADE,
    node_id UUID NOT NULL REFERENCES recipe_nodes(id) ON DELETE CASCADE,

    -- Schedule Configuration
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('cron', 'interval', 'once')),
    cron_expression VARCHAR(100),
    interval_minutes INTEGER,
    run_at TIMESTAMPTZ, -- For 'once' type

    -- Timezone
    timezone VARCHAR(100) DEFAULT 'UTC',

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Recipes
CREATE INDEX IF NOT EXISTS idx_automation_recipes_user ON automation_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_recipes_status ON automation_recipes(status);
CREATE INDEX IF NOT EXISTS idx_automation_recipes_category ON automation_recipes(category);
CREATE INDEX IF NOT EXISTS idx_automation_recipes_tags ON automation_recipes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_automation_recipes_created ON automation_recipes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_recipes_deleted ON automation_recipes(deleted_at) WHERE deleted_at IS NULL;

-- Nodes
CREATE INDEX IF NOT EXISTS idx_recipe_nodes_recipe ON recipe_nodes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_nodes_type ON recipe_nodes(node_type);
CREATE INDEX IF NOT EXISTS idx_recipe_nodes_trigger ON recipe_nodes(trigger_type) WHERE trigger_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recipe_nodes_action ON recipe_nodes(action_type) WHERE action_type IS NOT NULL;

-- Edges
CREATE INDEX IF NOT EXISTS idx_recipe_edges_recipe ON recipe_edges(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_edges_source ON recipe_edges(source_node_id);
CREATE INDEX IF NOT EXISTS idx_recipe_edges_target ON recipe_edges(target_node_id);

-- Executions
CREATE INDEX IF NOT EXISTS idx_recipe_executions_recipe ON recipe_executions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_user ON recipe_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_status ON recipe_executions(status);
CREATE INDEX IF NOT EXISTS idx_recipe_executions_started ON recipe_executions(started_at DESC);

-- Logs
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution ON recipe_execution_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON recipe_execution_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_execution_logs_created ON recipe_execution_logs(created_at DESC);

-- Templates
CREATE INDEX IF NOT EXISTS idx_recipe_templates_category ON recipe_templates(category);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_tags ON recipe_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_recipe_templates_featured ON recipe_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_recipe_templates_popularity ON recipe_templates(popularity DESC);

-- Integrations
CREATE INDEX IF NOT EXISTS idx_recipe_integrations_user ON recipe_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_integrations_type ON recipe_integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_recipe_integrations_status ON recipe_integrations(status);

-- Webhooks
CREATE INDEX IF NOT EXISTS idx_recipe_webhooks_recipe ON recipe_webhooks(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_webhooks_key ON recipe_webhooks(webhook_key);
CREATE INDEX IF NOT EXISTS idx_recipe_webhooks_active ON recipe_webhooks(is_active) WHERE is_active = TRUE;

-- Schedules
CREATE INDEX IF NOT EXISTS idx_recipe_schedules_recipe ON recipe_schedules(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_schedules_next_run ON recipe_schedules(next_run_at) WHERE is_active = TRUE;

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Update recipe statistics after execution
CREATE OR REPLACE FUNCTION update_recipe_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('success', 'error', 'partial') AND OLD.status = 'running' THEN
        UPDATE automation_recipes
        SET
            total_runs = total_runs + 1,
            successful_runs = successful_runs + CASE WHEN NEW.status = 'success' THEN 1 ELSE 0 END,
            failed_runs = failed_runs + CASE WHEN NEW.status = 'error' THEN 1 ELSE 0 END,
            last_run_at = NEW.completed_at,
            last_success_at = CASE WHEN NEW.status = 'success' THEN NEW.completed_at ELSE last_success_at END,
            last_error_at = CASE WHEN NEW.status = 'error' THEN NEW.completed_at ELSE last_error_at END,
            average_duration = (
                SELECT AVG(duration)::INTEGER
                FROM recipe_executions
                WHERE recipe_id = NEW.recipe_id
                AND status IN ('success', 'partial')
                AND duration IS NOT NULL
            ),
            updated_at = NOW()
        WHERE id = NEW.recipe_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate next scheduled run
CREATE OR REPLACE FUNCTION calculate_next_scheduled_run(
    p_schedule_type VARCHAR,
    p_cron_expression VARCHAR,
    p_interval_minutes INTEGER,
    p_timezone VARCHAR,
    p_last_run TIMESTAMPTZ
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
    next_run TIMESTAMPTZ;
BEGIN
    IF p_schedule_type = 'interval' THEN
        -- Simple interval calculation
        next_run := COALESCE(p_last_run, NOW()) + (p_interval_minutes || ' minutes')::INTERVAL;
    ELSIF p_schedule_type = 'cron' THEN
        -- For cron, use pg_cron extension if available, otherwise estimate
        -- This is a simplified version - in production use proper cron parsing
        next_run := NOW() + INTERVAL '1 hour';
    ELSE
        next_run := NULL;
    END IF;

    RETURN next_run;
END;
$$ LANGUAGE plpgsql;

-- Get recipe with full details
CREATE OR REPLACE FUNCTION get_recipe_full(p_recipe_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'recipe', to_jsonb(r),
        'nodes', COALESCE(
            (SELECT jsonb_agg(to_jsonb(n) ORDER BY n.sort_order)
             FROM recipe_nodes n WHERE n.recipe_id = r.id),
            '[]'::JSONB
        ),
        'edges', COALESCE(
            (SELECT jsonb_agg(to_jsonb(e))
             FROM recipe_edges e WHERE e.recipe_id = r.id),
            '[]'::JSONB
        ),
        'variables', COALESCE(
            (SELECT jsonb_agg(to_jsonb(v))
             FROM recipe_variables v WHERE v.recipe_id = r.id),
            '[]'::JSONB
        ),
        'recent_executions', COALESCE(
            (SELECT jsonb_agg(to_jsonb(ex) ORDER BY ex.started_at DESC)
             FROM (
                SELECT * FROM recipe_executions
                WHERE recipe_id = r.id
                ORDER BY started_at DESC
                LIMIT 10
             ) ex),
            '[]'::JSONB
        )
    ) INTO result
    FROM automation_recipes r
    WHERE r.id = p_recipe_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Clone a recipe
CREATE OR REPLACE FUNCTION clone_recipe(
    p_recipe_id UUID,
    p_user_id UUID,
    p_new_name VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_recipe_id UUID;
    old_node RECORD;
    node_mapping JSONB := '{}'::JSONB;
    new_node_id UUID;
BEGIN
    -- Create new recipe
    INSERT INTO automation_recipes (
        user_id, name, description, category, tags, icon, color,
        settings, status
    )
    SELECT
        p_user_id,
        COALESCE(p_new_name, name || ' (Copy)'),
        description,
        category,
        tags,
        icon,
        color,
        settings,
        'draft'
    FROM automation_recipes
    WHERE id = p_recipe_id
    RETURNING id INTO new_recipe_id;

    -- Clone nodes and build mapping
    FOR old_node IN
        SELECT * FROM recipe_nodes WHERE recipe_id = p_recipe_id
    LOOP
        new_node_id := gen_random_uuid();
        node_mapping := node_mapping || jsonb_build_object(old_node.id::TEXT, new_node_id::TEXT);

        INSERT INTO recipe_nodes (
            id, recipe_id, node_type, trigger_type, action_type,
            name, description, config, position_x, position_y,
            metadata, sort_order
        )
        VALUES (
            new_node_id, new_recipe_id, old_node.node_type, old_node.trigger_type, old_node.action_type,
            old_node.name, old_node.description, old_node.config, old_node.position_x, old_node.position_y,
            old_node.metadata, old_node.sort_order
        );
    END LOOP;

    -- Clone edges with new node IDs
    INSERT INTO recipe_edges (
        recipe_id, source_node_id, target_node_id,
        source_handle, target_handle, condition, label, edge_type, animated
    )
    SELECT
        new_recipe_id,
        (node_mapping->>source_node_id::TEXT)::UUID,
        (node_mapping->>target_node_id::TEXT)::UUID,
        source_handle,
        target_handle,
        condition,
        label,
        edge_type,
        animated
    FROM recipe_edges
    WHERE recipe_id = p_recipe_id;

    -- Clone variables
    INSERT INTO recipe_variables (
        recipe_id, name, var_type, default_value, is_required, description
    )
    SELECT
        new_recipe_id, name, var_type, default_value, is_required, description
    FROM recipe_variables
    WHERE recipe_id = p_recipe_id;

    RETURN new_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- Create recipe from template
CREATE OR REPLACE FUNCTION create_recipe_from_template(
    p_template_id UUID,
    p_user_id UUID,
    p_name VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    template RECORD;
    new_recipe_id UUID;
    node_record JSONB;
    edge_record JSONB;
    var_record JSONB;
    node_mapping JSONB := '{}'::JSONB;
    old_node_id TEXT;
    new_node_id UUID;
BEGIN
    -- Get template
    SELECT * INTO template FROM recipe_templates WHERE id = p_template_id;

    IF template IS NULL THEN
        RAISE EXCEPTION 'Template not found';
    END IF;

    -- Create recipe
    INSERT INTO automation_recipes (
        user_id, name, description, category, tags, icon, color, status
    )
    VALUES (
        p_user_id,
        COALESCE(p_name, template.name),
        template.description,
        template.category,
        template.tags,
        template.icon,
        template.color,
        'draft'
    )
    RETURNING id INTO new_recipe_id;

    -- Create nodes and build mapping
    FOR node_record IN SELECT * FROM jsonb_array_elements(template.nodes)
    LOOP
        old_node_id := node_record->>'id';
        new_node_id := gen_random_uuid();
        node_mapping := node_mapping || jsonb_build_object(old_node_id, new_node_id::TEXT);

        INSERT INTO recipe_nodes (
            id, recipe_id, node_type, trigger_type, action_type,
            name, description, config, position_x, position_y, metadata
        )
        VALUES (
            new_node_id,
            new_recipe_id,
            node_record->>'type',
            node_record->>'triggerType',
            node_record->>'actionType',
            COALESCE(node_record->>'name', 'Node'),
            node_record->>'description',
            COALESCE(node_record->'config', '{}'::JSONB),
            COALESCE((node_record->'position'->>'x')::INTEGER, 0),
            COALESCE((node_record->'position'->>'y')::INTEGER, 0),
            node_record->'metadata'
        );
    END LOOP;

    -- Create edges with new node IDs
    FOR edge_record IN SELECT * FROM jsonb_array_elements(template.edges)
    LOOP
        INSERT INTO recipe_edges (
            recipe_id, source_node_id, target_node_id,
            source_handle, target_handle, condition, label
        )
        VALUES (
            new_recipe_id,
            (node_mapping->>(edge_record->>'source'))::UUID,
            (node_mapping->>(edge_record->>'target'))::UUID,
            edge_record->>'sourceHandle',
            edge_record->>'targetHandle',
            edge_record->'condition',
            edge_record->>'label'
        );
    END LOOP;

    -- Create variables
    FOR var_record IN SELECT * FROM jsonb_array_elements(template.variables)
    LOOP
        INSERT INTO recipe_variables (
            recipe_id, name, var_type, default_value, is_required, description
        )
        VALUES (
            new_recipe_id,
            var_record->>'name',
            var_record->>'type',
            var_record->'defaultValue',
            COALESCE((var_record->>'required')::BOOLEAN, FALSE),
            var_record->>'description'
        );
    END LOOP;

    -- Increment template use count
    UPDATE recipe_templates
    SET use_count = use_count + 1
    WHERE id = p_template_id;

    RETURN new_recipe_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Update recipe stats after execution completes
DROP TRIGGER IF EXISTS trigger_update_recipe_stats ON recipe_executions;
CREATE TRIGGER trigger_update_recipe_stats
    AFTER UPDATE ON recipe_executions
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_stats();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_automation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_recipe_timestamp ON automation_recipes;
CREATE TRIGGER trigger_update_recipe_timestamp
    BEFORE UPDATE ON automation_recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_timestamp();

DROP TRIGGER IF EXISTS trigger_update_node_timestamp ON recipe_nodes;
CREATE TRIGGER trigger_update_node_timestamp
    BEFORE UPDATE ON recipe_nodes
    FOR EACH ROW
    EXECUTE FUNCTION update_automation_timestamp();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE automation_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_schedules ENABLE ROW LEVEL SECURITY;

-- Recipes: Users can manage their own
CREATE POLICY recipes_select ON automation_recipes FOR SELECT
    USING (user_id = auth.uid() OR auth.uid() IN (
        SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
    ));

CREATE POLICY recipes_insert ON automation_recipes FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY recipes_update ON automation_recipes FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY recipes_delete ON automation_recipes FOR DELETE
    USING (user_id = auth.uid());

-- Nodes: Access through recipe ownership
CREATE POLICY nodes_select ON recipe_nodes FOR SELECT
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY nodes_insert ON recipe_nodes FOR INSERT
    WITH CHECK (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY nodes_update ON recipe_nodes FOR UPDATE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY nodes_delete ON recipe_nodes FOR DELETE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

-- Edges: Access through recipe ownership
CREATE POLICY edges_select ON recipe_edges FOR SELECT
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY edges_insert ON recipe_edges FOR INSERT
    WITH CHECK (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY edges_update ON recipe_edges FOR UPDATE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY edges_delete ON recipe_edges FOR DELETE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

-- Variables: Access through recipe ownership
CREATE POLICY variables_select ON recipe_variables FOR SELECT
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY variables_insert ON recipe_variables FOR INSERT
    WITH CHECK (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY variables_update ON recipe_variables FOR UPDATE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY variables_delete ON recipe_variables FOR DELETE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

-- Executions: Users see their own
CREATE POLICY executions_select ON recipe_executions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY executions_insert ON recipe_executions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Execution Logs: Access through execution ownership
CREATE POLICY exec_logs_select ON recipe_execution_logs FOR SELECT
    USING (execution_id IN (SELECT id FROM recipe_executions WHERE user_id = auth.uid()));

-- Integrations: Users manage their own
CREATE POLICY integrations_select ON recipe_integrations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY integrations_insert ON recipe_integrations FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY integrations_update ON recipe_integrations FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY integrations_delete ON recipe_integrations FOR DELETE
    USING (user_id = auth.uid());

-- Webhooks: Access through recipe ownership
CREATE POLICY webhooks_select ON recipe_webhooks FOR SELECT
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY webhooks_insert ON recipe_webhooks FOR INSERT
    WITH CHECK (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY webhooks_update ON recipe_webhooks FOR UPDATE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

-- Schedules: Access through recipe ownership
CREATE POLICY schedules_select ON recipe_schedules FOR SELECT
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY schedules_insert ON recipe_schedules FOR INSERT
    WITH CHECK (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

CREATE POLICY schedules_update ON recipe_schedules FOR UPDATE
    USING (recipe_id IN (SELECT id FROM automation_recipes WHERE user_id = auth.uid()));

-- Templates: Public read
CREATE POLICY templates_select ON recipe_templates FOR SELECT
    USING (TRUE);

-- =============================================================================
-- SEED DATA: Popular Templates
-- =============================================================================

INSERT INTO recipe_templates (name, description, category, tags, icon, color, popularity, nodes, edges, variables, required_integrations, is_featured) VALUES
(
    'Welcome New Client',
    'Automatically send a welcome email and create onboarding tasks when a new client is added',
    'client-management',
    ARRAY['onboarding', 'email', 'tasks'],
    'UserPlus',
    'green',
    95,
    '[
        {"id": "trigger-1", "type": "trigger", "triggerType": "new_client", "name": "New Client Added", "config": {}, "position": {"x": 100, "y": 100}},
        {"id": "action-1", "type": "action", "actionType": "send_email", "name": "Send Welcome Email", "config": {"subject": "Welcome!", "template_id": "welcome-client"}, "position": {"x": 100, "y": 250}},
        {"id": "action-2", "type": "action", "actionType": "create_task", "name": "Create Onboarding Tasks", "config": {"title": "Client Onboarding", "priority": "high"}, "position": {"x": 100, "y": 400}}
    ]'::JSONB,
    '[
        {"id": "e1", "source": "trigger-1", "target": "action-1"},
        {"id": "e2", "source": "action-1", "target": "action-2"}
    ]'::JSONB,
    '[]'::JSONB,
    ARRAY['freeflow'],
    TRUE
),
(
    'Invoice Payment Reminder',
    'Send automatic reminders for overdue invoices',
    'billing',
    ARRAY['invoices', 'reminders', 'email'],
    'FileText',
    'amber',
    88,
    '[
        {"id": "trigger-1", "type": "trigger", "triggerType": "schedule", "name": "Daily Check", "config": {"time": "09:00"}, "position": {"x": 100, "y": 100}},
        {"id": "action-1", "type": "action", "actionType": "database_query", "name": "Find Overdue Invoices", "config": {"table": "invoices", "filter": {"status": "pending"}}, "position": {"x": 100, "y": 250}},
        {"id": "action-2", "type": "action", "actionType": "loop", "name": "For Each Invoice", "config": {}, "position": {"x": 100, "y": 400}},
        {"id": "action-3", "type": "action", "actionType": "send_email", "name": "Send Reminder", "config": {"template_id": "invoice-reminder"}, "position": {"x": 100, "y": 550}}
    ]'::JSONB,
    '[
        {"id": "e1", "source": "trigger-1", "target": "action-1"},
        {"id": "e2", "source": "action-1", "target": "action-2"},
        {"id": "e3", "source": "action-2", "target": "action-3"}
    ]'::JSONB,
    '[{"name": "reminder_days", "type": "number", "defaultValue": 7, "required": false, "description": "Days after due date"}]'::JSONB,
    ARRAY['freeflow', 'schedule'],
    TRUE
),
(
    'Project Completion Notification',
    'Notify stakeholders and create invoice when a project is completed',
    'project-management',
    ARRAY['projects', 'notifications', 'invoicing'],
    'CheckCircle',
    'blue',
    82,
    '[
        {"id": "trigger-1", "type": "trigger", "triggerType": "project_status", "name": "Project Completed", "config": {"status_filter": "completed"}, "position": {"x": 200, "y": 100}},
        {"id": "action-1", "type": "action", "actionType": "send_slack", "name": "Notify Team", "config": {"channel": "#project-updates"}, "position": {"x": 100, "y": 250}},
        {"id": "action-2", "type": "action", "actionType": "send_email", "name": "Email Client", "config": {"template_id": "project-complete"}, "position": {"x": 300, "y": 250}},
        {"id": "action-3", "type": "action", "actionType": "create_invoice", "name": "Create Final Invoice", "config": {"due_days": 30}, "position": {"x": 200, "y": 400}}
    ]'::JSONB,
    '[
        {"id": "e1", "source": "trigger-1", "target": "action-1"},
        {"id": "e2", "source": "trigger-1", "target": "action-2"},
        {"id": "e3", "source": "action-1", "target": "action-3"},
        {"id": "e4", "source": "action-2", "target": "action-3"}
    ]'::JSONB,
    '[]'::JSONB,
    ARRAY['freeflow', 'slack'],
    TRUE
),
(
    'Payment Thank You',
    'Send a thank you email and receipt when payment is received',
    'billing',
    ARRAY['payments', 'email', 'receipts'],
    'DollarSign',
    'green',
    76,
    '[
        {"id": "trigger-1", "type": "trigger", "triggerType": "payment_received", "name": "Payment Received", "config": {}, "position": {"x": 100, "y": 100}},
        {"id": "action-1", "type": "action", "actionType": "send_email", "name": "Send Thank You", "config": {"template_id": "payment-thank-you"}, "position": {"x": 100, "y": 250}},
        {"id": "action-2", "type": "action", "actionType": "generate_pdf", "name": "Generate Receipt", "config": {"template": "receipt"}, "position": {"x": 100, "y": 400}}
    ]'::JSONB,
    '[
        {"id": "e1", "source": "trigger-1", "target": "action-1"},
        {"id": "e2", "source": "action-1", "target": "action-2"}
    ]'::JSONB,
    '[]'::JSONB,
    ARRAY['freeflow'],
    FALSE
),
(
    'Lead Nurture Sequence',
    'Automated email sequence for new leads with delays',
    'marketing',
    ARRAY['leads', 'email', 'sequences'],
    'Target',
    'purple',
    71,
    '[
        {"id": "trigger-1", "type": "trigger", "triggerType": "form_submission", "name": "Lead Form Submitted", "config": {"form_id": "lead-capture"}, "position": {"x": 100, "y": 100}},
        {"id": "action-1", "type": "action", "actionType": "send_email", "name": "Welcome Email", "config": {"template_id": "lead-welcome"}, "position": {"x": 100, "y": 250}},
        {"id": "action-2", "type": "action", "actionType": "delay", "name": "Wait 2 Days", "config": {"duration": 172800}, "position": {"x": 100, "y": 400}},
        {"id": "action-3", "type": "action", "actionType": "send_email", "name": "Follow Up Email", "config": {"template_id": "lead-followup"}, "position": {"x": 100, "y": 550}},
        {"id": "action-4", "type": "action", "actionType": "delay", "name": "Wait 5 Days", "config": {"duration": 432000}, "position": {"x": 100, "y": 700}},
        {"id": "action-5", "type": "action", "actionType": "send_email", "name": "Case Study Email", "config": {"template_id": "lead-case-study"}, "position": {"x": 100, "y": 850}}
    ]'::JSONB,
    '[
        {"id": "e1", "source": "trigger-1", "target": "action-1"},
        {"id": "e2", "source": "action-1", "target": "action-2"},
        {"id": "e3", "source": "action-2", "target": "action-3"},
        {"id": "e4", "source": "action-3", "target": "action-4"},
        {"id": "e5", "source": "action-4", "target": "action-5"}
    ]'::JSONB,
    '[]'::JSONB,
    ARRAY['freeflow', 'schedule'],
    TRUE
)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE automation_recipes IS 'Visual workflow automation recipes competing with Zapier/Make/n8n';
COMMENT ON TABLE recipe_nodes IS 'Nodes (triggers/actions) in automation recipes';
COMMENT ON TABLE recipe_edges IS 'Connections between nodes in recipes';
COMMENT ON TABLE recipe_variables IS 'Variables available in recipe execution context';
COMMENT ON TABLE recipe_executions IS 'History of recipe executions';
COMMENT ON TABLE recipe_execution_logs IS 'Detailed logs from recipe executions';
COMMENT ON TABLE recipe_templates IS 'Pre-built recipe templates for quick setup';
COMMENT ON TABLE recipe_integrations IS 'Third-party service integrations (OAuth, API keys)';
COMMENT ON TABLE recipe_webhooks IS 'Webhook endpoints for triggering recipes';
COMMENT ON TABLE recipe_schedules IS 'Scheduled triggers for recipes';
