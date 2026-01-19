-- Migration: SCIM 2.0 Provisioning
-- Phase 9.4 of A+++ Implementation
-- Created: January 2026

-- ============================================================================
-- SCIM GROUPS TABLE
-- Stores SCIM-managed groups for user provisioning
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name VARCHAR(255) NOT NULL,
    external_id TEXT,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_group_name_per_org UNIQUE (organization_id, display_name)
);

CREATE INDEX IF NOT EXISTS idx_scim_groups_org ON scim_groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_groups_external_id ON scim_groups(external_id);
CREATE INDEX IF NOT EXISTS idx_scim_groups_display_name ON scim_groups(display_name);

-- ============================================================================
-- SCIM GROUP MEMBERS TABLE
-- Links users to SCIM groups
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES scim_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_scim_group_members_group ON scim_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_scim_group_members_user ON scim_group_members(user_id);

-- ============================================================================
-- SCIM RESOURCES TABLE
-- Maps internal IDs to external SCIM IDs
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('User', 'Group')),
    internal_id UUID NOT NULL,
    external_id TEXT NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_external_resource UNIQUE (organization_id, resource_type, external_id)
);

CREATE INDEX IF NOT EXISTS idx_scim_resources_internal ON scim_resources(internal_id);
CREATE INDEX IF NOT EXISTS idx_scim_resources_external ON scim_resources(external_id);
CREATE INDEX IF NOT EXISTS idx_scim_resources_type ON scim_resources(resource_type);

-- ============================================================================
-- SCIM TOKENS TABLE
-- Bearer tokens for SCIM API authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    scopes TEXT[] DEFAULT '{"users:read", "users:write", "groups:read", "groups:write"}',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scim_tokens_org ON scim_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_tokens_hash ON scim_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_scim_tokens_active ON scim_tokens(organization_id) WHERE is_active = true;

-- ============================================================================
-- SCIM SYNC LOGS TABLE
-- Audit trail for SCIM operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    details JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'partial')),
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scim_sync_logs_org ON scim_sync_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_scim_sync_logs_operation ON scim_sync_logs(operation);
CREATE INDEX IF NOT EXISTS idx_scim_sync_logs_created ON scim_sync_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scim_sync_logs_resource ON scim_sync_logs(resource_type, resource_id);

-- ============================================================================
-- SCIM ATTRIBUTE MAPPINGS TABLE
-- Custom attribute mappings per organization
-- ============================================================================

CREATE TABLE IF NOT EXISTS scim_attribute_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('User', 'Group')),
    scim_attribute TEXT NOT NULL,
    db_column TEXT NOT NULL,
    transform_function TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_attribute_mapping UNIQUE (organization_id, resource_type, scim_attribute)
);

CREATE INDEX IF NOT EXISTS idx_scim_mappings_org ON scim_attribute_mappings(organization_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE scim_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scim_attribute_mappings ENABLE ROW LEVEL SECURITY;

-- SCIM Groups policies
CREATE POLICY "Org members can view groups"
ON scim_groups FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Org admins can manage groups"
ON scim_groups FOR ALL
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

CREATE POLICY "Service role can manage groups"
ON scim_groups FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Group Members policies
CREATE POLICY "Members can view group memberships"
ON scim_group_members FOR SELECT
TO authenticated
USING (
    group_id IN (
        SELECT id FROM scim_groups
        WHERE organization_id IN (
            SELECT organization_id FROM organization_members
            WHERE user_id = auth.uid()
        )
    )
);

CREATE POLICY "Service role can manage memberships"
ON scim_group_members FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SCIM Resources policies
CREATE POLICY "Service role can manage resources"
ON scim_resources FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SCIM Tokens policies
CREATE POLICY "Org admins can view tokens"
ON scim_tokens FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Org admins can manage tokens"
ON scim_tokens FOR ALL
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

CREATE POLICY "Service role can manage tokens"
ON scim_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SCIM Sync Logs policies
CREATE POLICY "Org admins can view sync logs"
ON scim_sync_logs FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Service role can manage sync logs"
ON scim_sync_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Attribute Mappings policies
CREATE POLICY "Org admins can view mappings"
ON scim_attribute_mappings FOR SELECT
TO authenticated
USING (
    organization_id IN (
        SELECT organization_id FROM organization_members
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
);

CREATE POLICY "Service role can manage mappings"
ON scim_attribute_mappings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get user's SCIM groups
CREATE OR REPLACE FUNCTION get_user_scim_groups(target_user_id UUID)
RETURNS TABLE (
    group_id UUID,
    group_name TEXT,
    organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        g.id,
        g.display_name::TEXT,
        g.organization_id
    FROM scim_group_members gm
    JOIN scim_groups g ON g.id = gm.group_id
    WHERE gm.user_id = target_user_id;
END;
$$;

-- Function to add user to SCIM group
CREATE OR REPLACE FUNCTION add_user_to_scim_group(
    p_group_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO scim_group_members (group_id, user_id)
    VALUES (p_group_id, p_user_id)
    ON CONFLICT (group_id, user_id) DO NOTHING;

    RETURN FOUND;
END;
$$;

-- Function to remove user from SCIM group
CREATE OR REPLACE FUNCTION remove_user_from_scim_group(
    p_group_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM scim_group_members
    WHERE group_id = p_group_id
    AND user_id = p_user_id;

    RETURN FOUND;
END;
$$;

-- Function to get SCIM sync statistics
CREATE OR REPLACE FUNCTION get_scim_sync_stats(
    p_organization_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_operations BIGINT,
    successful_operations BIGINT,
    failed_operations BIGINT,
    user_creates BIGINT,
    user_updates BIGINT,
    user_deletes BIGINT,
    group_creates BIGINT,
    group_updates BIGINT,
    group_deletes BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_operations,
        COUNT(*) FILTER (WHERE status = 'success')::BIGINT as successful_operations,
        COUNT(*) FILTER (WHERE status = 'failure')::BIGINT as failed_operations,
        COUNT(*) FILTER (WHERE operation = 'user_created')::BIGINT as user_creates,
        COUNT(*) FILTER (WHERE operation = 'user_updated' OR operation = 'user_patched')::BIGINT as user_updates,
        COUNT(*) FILTER (WHERE operation = 'user_deleted')::BIGINT as user_deletes,
        COUNT(*) FILTER (WHERE operation = 'group_created')::BIGINT as group_creates,
        COUNT(*) FILTER (WHERE operation = 'group_updated' OR operation = 'group_patched')::BIGINT as group_updates,
        COUNT(*) FILTER (WHERE operation = 'group_deleted')::BIGINT as group_deletes
    FROM scim_sync_logs
    WHERE organization_id = p_organization_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$;

-- Function to cleanup old sync logs
CREATE OR REPLACE FUNCTION cleanup_scim_sync_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM scim_sync_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for scim_groups
CREATE OR REPLACE FUNCTION update_scim_groups_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_scim_groups_timestamp
BEFORE UPDATE ON scim_groups
FOR EACH ROW EXECUTE FUNCTION update_scim_groups_timestamp();

-- Update timestamp trigger for scim_resources
CREATE TRIGGER update_scim_resources_timestamp
BEFORE UPDATE ON scim_resources
FOR EACH ROW EXECUTE FUNCTION update_scim_groups_timestamp();

-- Update timestamp trigger for scim_attribute_mappings
CREATE TRIGGER update_scim_mappings_timestamp
BEFORE UPDATE ON scim_attribute_mappings
FOR EACH ROW EXECUTE FUNCTION update_scim_groups_timestamp();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE scim_groups IS 'SCIM-managed groups for automated user provisioning';
COMMENT ON TABLE scim_group_members IS 'User membership in SCIM groups';
COMMENT ON TABLE scim_resources IS 'Mapping between internal and external SCIM resource IDs';
COMMENT ON TABLE scim_tokens IS 'Bearer tokens for SCIM API authentication';
COMMENT ON TABLE scim_sync_logs IS 'Audit trail for all SCIM provisioning operations';
COMMENT ON TABLE scim_attribute_mappings IS 'Custom SCIM attribute to database column mappings';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON scim_groups TO authenticated;
GRANT SELECT ON scim_group_members TO authenticated;
GRANT SELECT ON scim_tokens TO authenticated;
GRANT SELECT ON scim_sync_logs TO authenticated;
GRANT SELECT ON scim_attribute_mappings TO authenticated;

GRANT ALL ON scim_groups TO service_role;
GRANT ALL ON scim_group_members TO service_role;
GRANT ALL ON scim_resources TO service_role;
GRANT ALL ON scim_tokens TO service_role;
GRANT ALL ON scim_sync_logs TO service_role;
GRANT ALL ON scim_attribute_mappings TO service_role;

GRANT EXECUTE ON FUNCTION get_user_scim_groups(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_user_to_scim_group(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION remove_user_from_scim_group(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_scim_sync_stats(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_scim_sync_logs(INTEGER) TO service_role;
