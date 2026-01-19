-- Migration: Directory Sync
-- Phase 9.5 of A+++ Implementation
-- Created: January 2026

-- ============================================================================
-- DIRECTORY CONNECTIONS TABLE
-- Stores connections to identity providers for directory sync
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('azure_ad', 'google_workspace', 'okta', 'onelogin', 'ldap')),
    name VARCHAR(255) NOT NULL,
    config JSONB NOT NULL DEFAULT '{}',
    sync_options JSONB NOT NULL DEFAULT '{
        "autoProvision": true,
        "autoDeprovision": false,
        "syncGroups": true,
        "syncInterval": 3600
    }',
    is_active BOOLEAN NOT NULL DEFAULT true,
    sync_status VARCHAR(20) DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
    last_sync_started_at TIMESTAMPTZ,
    last_sync_completed_at TIMESTAMPTZ,
    last_sync_error TEXT,
    delta_link TEXT,
    total_users_synced INTEGER DEFAULT 0,
    total_groups_synced INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_org_provider UNIQUE (organization_id, provider, name)
);

CREATE INDEX IF NOT EXISTS idx_directory_connections_org ON directory_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_directory_connections_provider ON directory_connections(provider);
CREATE INDEX IF NOT EXISTS idx_directory_connections_active ON directory_connections(organization_id) WHERE is_active = true;

-- ============================================================================
-- DIRECTORY SYNC LOGS TABLE
-- Audit trail for directory sync operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID REFERENCES directory_connections(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    job_id UUID,
    operation VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial', 'in_progress')),
    users_synced INTEGER DEFAULT 0,
    users_created INTEGER DEFAULT 0,
    users_updated INTEGER DEFAULT 0,
    users_deprovisioned INTEGER DEFAULT 0,
    groups_synced INTEGER DEFAULT 0,
    groups_created INTEGER DEFAULT 0,
    groups_updated INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_sync_logs_connection ON directory_sync_logs(connection_id);
CREATE INDEX IF NOT EXISTS idx_directory_sync_logs_org ON directory_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_directory_sync_logs_job ON directory_sync_logs(job_id);
CREATE INDEX IF NOT EXISTS idx_directory_sync_logs_created ON directory_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_directory_sync_logs_status ON directory_sync_logs(status);

-- ============================================================================
-- DIRECTORY ATTRIBUTE MAPPINGS TABLE
-- Custom attribute mappings between IdP and FreeFlow
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_attribute_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES directory_connections(id) ON DELETE CASCADE,
    source_attribute TEXT NOT NULL,
    target_attribute VARCHAR(100) NOT NULL,
    transform TEXT,
    is_required BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_mapping UNIQUE (connection_id, target_attribute)
);

CREATE INDEX IF NOT EXISTS idx_directory_mappings_connection ON directory_attribute_mappings(connection_id);

-- ============================================================================
-- DIRECTORY USER MAPPINGS TABLE
-- Links IdP user IDs to FreeFlow user IDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_user_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES directory_connections(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_email TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN ('active', 'pending', 'suspended', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_mapping UNIQUE (connection_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_directory_user_mappings_connection ON directory_user_mappings(connection_id);
CREATE INDEX IF NOT EXISTS idx_directory_user_mappings_user ON directory_user_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_directory_user_mappings_external ON directory_user_mappings(external_id);

-- ============================================================================
-- DIRECTORY GROUP MAPPINGS TABLE
-- Links IdP group IDs to FreeFlow team/group IDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_group_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES directory_connections(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    team_id UUID,
    external_name TEXT,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sync_status VARCHAR(20) DEFAULT 'active' CHECK (sync_status IN ('active', 'pending', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_group_mapping UNIQUE (connection_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_directory_group_mappings_connection ON directory_group_mappings(connection_id);
CREATE INDEX IF NOT EXISTS idx_directory_group_mappings_team ON directory_group_mappings(team_id);
CREATE INDEX IF NOT EXISTS idx_directory_group_mappings_external ON directory_group_mappings(external_id);

-- ============================================================================
-- DIRECTORY SYNC QUEUE TABLE
-- Queue for scheduled sync jobs
-- ============================================================================

CREATE TABLE IF NOT EXISTS directory_sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES directory_connections(id) ON DELETE CASCADE,
    sync_type VARCHAR(20) NOT NULL CHECK (sync_type IN ('full', 'incremental')),
    priority INTEGER DEFAULT 0,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_sync_queue_connection ON directory_sync_queue(connection_id);
CREATE INDEX IF NOT EXISTS idx_directory_sync_queue_scheduled ON directory_sync_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_directory_sync_queue_status ON directory_sync_queue(status);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE directory_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_attribute_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_group_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_sync_queue ENABLE ROW LEVEL SECURITY;

-- Directory Connections policies
CREATE POLICY "Org admins can view connections"
ON directory_connections FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Org admins can manage connections"
ON directory_connections FOR ALL
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
)
WITH CHECK (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Service role can manage connections"
ON directory_connections FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Directory Sync Logs policies
CREATE POLICY "Org admins can view sync logs"
ON directory_sync_logs FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Service role can manage sync logs"
ON directory_sync_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Attribute Mappings policies
CREATE POLICY "Org admins can view mappings"
ON directory_attribute_mappings FOR SELECT
TO authenticated
USING (
    connection_id IN (
        SELECT id FROM directory_connections
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    )
);

CREATE POLICY "Org admins can manage mappings"
ON directory_attribute_mappings FOR ALL
TO authenticated
USING (
    connection_id IN (
        SELECT id FROM directory_connections
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    )
)
WITH CHECK (
    connection_id IN (
        SELECT id FROM directory_connections
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'owner')
        )
    )
);

CREATE POLICY "Service role can manage mappings"
ON directory_attribute_mappings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- User Mappings policies
CREATE POLICY "Service role can manage user mappings"
ON directory_user_mappings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Group Mappings policies
CREATE POLICY "Service role can manage group mappings"
ON directory_group_mappings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Sync Queue policies
CREATE POLICY "Service role can manage sync queue"
ON directory_sync_queue FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get directory sync statistics
CREATE OR REPLACE FUNCTION get_directory_sync_stats(
    p_connection_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_syncs BIGINT,
    successful_syncs BIGINT,
    failed_syncs BIGINT,
    total_users_synced BIGINT,
    total_users_created BIGINT,
    total_users_updated BIGINT,
    total_users_deprovisioned BIGINT,
    total_groups_synced BIGINT,
    avg_duration_ms NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_syncs,
        COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_syncs,
        COUNT(*) FILTER (WHERE status = 'failure')::BIGINT as failed_syncs,
        COALESCE(SUM(users_synced), 0)::BIGINT as total_users_synced,
        COALESCE(SUM(users_created), 0)::BIGINT as total_users_created,
        COALESCE(SUM(users_updated), 0)::BIGINT as total_users_updated,
        COALESCE(SUM(users_deprovisioned), 0)::BIGINT as total_users_deprovisioned,
        COALESCE(SUM(groups_synced), 0)::BIGINT as total_groups_synced,
        COALESCE(AVG(duration_ms), 0)::NUMERIC as avg_duration_ms
    FROM directory_sync_logs
    WHERE connection_id = p_connection_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND operation LIKE '%sync%';
END;
$$;

-- Function to get pending sync jobs
CREATE OR REPLACE FUNCTION get_pending_sync_jobs(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    job_id UUID,
    connection_id UUID,
    sync_type VARCHAR(20),
    scheduled_at TIMESTAMPTZ,
    attempts INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        q.id,
        q.connection_id,
        q.sync_type,
        q.scheduled_at,
        q.attempts
    FROM directory_sync_queue q
    JOIN directory_connections c ON c.id = q.connection_id
    WHERE q.status = 'pending'
    AND q.scheduled_at <= NOW()
    AND q.attempts < q.max_attempts
    AND c.is_active = true
    ORDER BY q.priority DESC, q.scheduled_at ASC
    LIMIT p_limit;
END;
$$;

-- Function to mark sync job as started
CREATE OR REPLACE FUNCTION start_sync_job(p_job_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE directory_sync_queue
    SET
        status = 'running',
        started_at = NOW(),
        attempts = attempts + 1
    WHERE id = p_job_id
    AND status = 'pending';

    RETURN FOUND;
END;
$$;

-- Function to complete sync job
CREATE OR REPLACE FUNCTION complete_sync_job(
    p_job_id UUID,
    p_success BOOLEAN,
    p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE directory_sync_queue
    SET
        status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
        completed_at = NOW(),
        error_message = p_error
    WHERE id = p_job_id;
END;
$$;

-- Function to schedule next sync
CREATE OR REPLACE FUNCTION schedule_directory_sync(
    p_connection_id UUID,
    p_sync_type VARCHAR(20) DEFAULT 'incremental',
    p_delay_seconds INTEGER DEFAULT 0
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_job_id UUID;
BEGIN
    INSERT INTO directory_sync_queue (
        connection_id,
        sync_type,
        scheduled_at
    ) VALUES (
        p_connection_id,
        p_sync_type,
        NOW() + (p_delay_seconds || ' seconds')::INTERVAL
    )
    RETURNING id INTO v_job_id;

    RETURN v_job_id;
END;
$$;

-- Function to cleanup old sync logs
CREATE OR REPLACE FUNCTION cleanup_directory_sync_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM directory_sync_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to get user's directory connections
CREATE OR REPLACE FUNCTION get_user_directory_info(p_user_id UUID)
RETURNS TABLE (
    connection_id UUID,
    provider VARCHAR(50),
    external_id TEXT,
    sync_status VARCHAR(20),
    last_synced_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        um.connection_id,
        dc.provider,
        um.external_id,
        um.sync_status,
        um.last_synced_at
    FROM directory_user_mappings um
    JOIN directory_connections dc ON dc.id = um.connection_id
    WHERE um.user_id = p_user_id
    AND dc.is_active = true;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for directory_connections
CREATE OR REPLACE FUNCTION update_directory_connections_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_directory_connections_timestamp
BEFORE UPDATE ON directory_connections
FOR EACH ROW EXECUTE FUNCTION update_directory_connections_timestamp();

-- Update timestamp trigger for directory_attribute_mappings
CREATE TRIGGER update_directory_attribute_mappings_timestamp
BEFORE UPDATE ON directory_attribute_mappings
FOR EACH ROW EXECUTE FUNCTION update_directory_connections_timestamp();

-- Update timestamp trigger for directory_user_mappings
CREATE TRIGGER update_directory_user_mappings_timestamp
BEFORE UPDATE ON directory_user_mappings
FOR EACH ROW EXECUTE FUNCTION update_directory_connections_timestamp();

-- Update timestamp trigger for directory_group_mappings
CREATE TRIGGER update_directory_group_mappings_timestamp
BEFORE UPDATE ON directory_group_mappings
FOR EACH ROW EXECUTE FUNCTION update_directory_connections_timestamp();

-- Trigger to auto-schedule sync after connection creation
CREATE OR REPLACE FUNCTION auto_schedule_initial_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Schedule an initial full sync after connection is created
    PERFORM schedule_directory_sync(NEW.id, 'full', 60);
    RETURN NEW;
END;
$$;

CREATE TRIGGER auto_schedule_initial_sync
AFTER INSERT ON directory_connections
FOR EACH ROW
WHEN (NEW.is_active = true)
EXECUTE FUNCTION auto_schedule_initial_sync();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE directory_connections IS 'Directory/IdP connections for user provisioning';
COMMENT ON TABLE directory_sync_logs IS 'Audit log for directory sync operations';
COMMENT ON TABLE directory_attribute_mappings IS 'Custom attribute mappings between IdP and FreeFlow';
COMMENT ON TABLE directory_user_mappings IS 'Links external user IDs to FreeFlow users';
COMMENT ON TABLE directory_group_mappings IS 'Links external group IDs to FreeFlow teams';
COMMENT ON TABLE directory_sync_queue IS 'Queue for scheduled directory sync jobs';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON directory_connections TO authenticated;
GRANT SELECT ON directory_sync_logs TO authenticated;
GRANT SELECT ON directory_attribute_mappings TO authenticated;

GRANT ALL ON directory_connections TO service_role;
GRANT ALL ON directory_sync_logs TO service_role;
GRANT ALL ON directory_attribute_mappings TO service_role;
GRANT ALL ON directory_user_mappings TO service_role;
GRANT ALL ON directory_group_mappings TO service_role;
GRANT ALL ON directory_sync_queue TO service_role;

GRANT EXECUTE ON FUNCTION get_directory_sync_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_pending_sync_jobs(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION start_sync_job(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION complete_sync_job(UUID, BOOLEAN, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION schedule_directory_sync(UUID, VARCHAR, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_directory_sync_logs(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION get_user_directory_info(UUID) TO authenticated;
