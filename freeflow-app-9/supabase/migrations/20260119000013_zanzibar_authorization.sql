-- Migration: Zanzibar-style Fine-Grained Authorization
-- Phase 9.3 of A+++ Implementation
-- Created: January 2026

-- ============================================================================
-- PERMISSION NAMESPACES TABLE
-- Defines object types and their relations (like Zanzibar namespace configs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_namespaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    relations JSONB NOT NULL DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for namespace lookups
CREATE INDEX IF NOT EXISTS idx_permission_namespaces_name ON permission_namespaces(name);

-- ============================================================================
-- PERMISSION TUPLES TABLE
-- Core Zanzibar tuple storage: (namespace, object_id, relation, subject)
-- Format: namespace:object_id#relation@subject_namespace:subject_id[#subject_relation]
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_tuples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    namespace VARCHAR(100) NOT NULL,
    object_id TEXT NOT NULL,
    relation VARCHAR(100) NOT NULL,
    subject_namespace VARCHAR(100) NOT NULL,
    subject_id TEXT NOT NULL,
    subject_relation VARCHAR(100), -- For userset references (e.g., group#member)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Unique constraint on the full tuple
    CONSTRAINT unique_tuple UNIQUE (namespace, object_id, relation, subject_namespace, subject_id, subject_relation)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_permission_tuples_object
ON permission_tuples(namespace, object_id);

CREATE INDEX IF NOT EXISTS idx_permission_tuples_object_relation
ON permission_tuples(namespace, object_id, relation);

CREATE INDEX IF NOT EXISTS idx_permission_tuples_subject
ON permission_tuples(subject_namespace, subject_id);

CREATE INDEX IF NOT EXISTS idx_permission_tuples_subject_relation
ON permission_tuples(subject_namespace, subject_id, subject_relation)
WHERE subject_relation IS NOT NULL;

-- Composite index for full tuple checks
CREATE INDEX IF NOT EXISTS idx_permission_tuples_full
ON permission_tuples(namespace, object_id, relation, subject_namespace, subject_id);

-- ============================================================================
-- PERMISSION AUDIT LOG TABLE
-- Tracks all permission changes for compliance and debugging
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL DEFAULT '{}',
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_event
ON permission_audit_log(event_type);

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_created
ON permission_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_permission_audit_log_actor
ON permission_audit_log(actor_id);

-- ============================================================================
-- PERMISSION CHECK CACHE TABLE (Optional - for persistent caching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS permission_check_cache (
    cache_key TEXT PRIMARY KEY,
    result BOOLEAN NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_permission_cache_expires
ON permission_check_cache(expires_at);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE permission_namespaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_tuples ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_check_cache ENABLE ROW LEVEL SECURITY;

-- Namespace policies (read-only for users, full access for service role)
CREATE POLICY "Users can read namespaces"
ON permission_namespaces FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can manage namespaces"
ON permission_namespaces FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Tuple policies
CREATE POLICY "Users can read tuples for objects they can access"
ON permission_tuples FOR SELECT
TO authenticated
USING (
    -- User can see tuples for objects where they have any permission
    EXISTS (
        SELECT 1 FROM permission_tuples pt
        WHERE pt.namespace = permission_tuples.namespace
        AND pt.object_id = permission_tuples.object_id
        AND pt.subject_namespace = 'user'
        AND pt.subject_id = auth.uid()::text
    )
);

CREATE POLICY "Service role can manage tuples"
ON permission_tuples FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Audit log policies
CREATE POLICY "Users can read own audit logs"
ON permission_audit_log FOR SELECT
TO authenticated
USING (actor_id = auth.uid());

CREATE POLICY "Service role can manage audit logs"
ON permission_audit_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Cache policies (service role only)
CREATE POLICY "Service role can manage cache"
ON permission_check_cache FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to check direct tuple existence
CREATE OR REPLACE FUNCTION check_direct_permission(
    p_namespace TEXT,
    p_object_id TEXT,
    p_relation TEXT,
    p_subject_namespace TEXT,
    p_subject_id TEXT,
    p_subject_relation TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM permission_tuples
        WHERE namespace = p_namespace
        AND object_id = p_object_id
        AND relation = p_relation
        AND subject_namespace = p_subject_namespace
        AND subject_id = p_subject_id
        AND (
            (p_subject_relation IS NULL AND subject_relation IS NULL) OR
            (subject_relation = p_subject_relation)
        )
    );
END;
$$;

-- Function to get all subjects with a specific relation to an object
CREATE OR REPLACE FUNCTION get_subjects_with_relation(
    p_namespace TEXT,
    p_object_id TEXT,
    p_relation TEXT
)
RETURNS TABLE (
    subject_namespace TEXT,
    subject_id TEXT,
    subject_relation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pt.subject_namespace::TEXT,
        pt.subject_id::TEXT,
        pt.subject_relation::TEXT
    FROM permission_tuples pt
    WHERE pt.namespace = p_namespace
    AND pt.object_id = p_object_id
    AND pt.relation = p_relation;
END;
$$;

-- Function to get all objects a subject has access to
CREATE OR REPLACE FUNCTION get_subject_permissions(
    p_subject_namespace TEXT,
    p_subject_id TEXT,
    p_object_namespace TEXT DEFAULT NULL,
    p_relation TEXT DEFAULT NULL
)
RETURNS TABLE (
    namespace TEXT,
    object_id TEXT,
    relation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        pt.namespace::TEXT,
        pt.object_id::TEXT,
        pt.relation::TEXT
    FROM permission_tuples pt
    WHERE pt.subject_namespace = p_subject_namespace
    AND pt.subject_id = p_subject_id
    AND (p_object_namespace IS NULL OR pt.namespace = p_object_namespace)
    AND (p_relation IS NULL OR pt.relation = p_relation);
END;
$$;

-- Function to cleanup expired cache entries
CREATE OR REPLACE FUNCTION cleanup_permission_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM permission_check_cache
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to invalidate cache for an object
CREATE OR REPLACE FUNCTION invalidate_permission_cache(
    p_namespace TEXT,
    p_object_id TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM permission_check_cache
    WHERE cache_key LIKE p_namespace || ':' || p_object_id || '#%';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to write a tuple with validation
CREATE OR REPLACE FUNCTION write_permission_tuple(
    p_namespace TEXT,
    p_object_id TEXT,
    p_relation TEXT,
    p_subject_namespace TEXT,
    p_subject_id TEXT,
    p_subject_relation TEXT DEFAULT NULL,
    p_created_by UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tuple_id UUID;
BEGIN
    -- Insert tuple
    INSERT INTO permission_tuples (
        namespace, object_id, relation,
        subject_namespace, subject_id, subject_relation,
        created_by
    )
    VALUES (
        p_namespace, p_object_id, p_relation,
        p_subject_namespace, p_subject_id, p_subject_relation,
        p_created_by
    )
    ON CONFLICT (namespace, object_id, relation, subject_namespace, subject_id, subject_relation)
    DO NOTHING
    RETURNING id INTO tuple_id;

    -- If tuple was created, invalidate cache
    IF tuple_id IS NOT NULL THEN
        PERFORM invalidate_permission_cache(p_namespace, p_object_id);
    END IF;

    RETURN tuple_id;
END;
$$;

-- Function to delete a tuple
CREATE OR REPLACE FUNCTION delete_permission_tuple(
    p_namespace TEXT,
    p_object_id TEXT,
    p_relation TEXT,
    p_subject_namespace TEXT,
    p_subject_id TEXT,
    p_subject_relation TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted BOOLEAN;
BEGIN
    DELETE FROM permission_tuples
    WHERE namespace = p_namespace
    AND object_id = p_object_id
    AND relation = p_relation
    AND subject_namespace = p_subject_namespace
    AND subject_id = p_subject_id
    AND (
        (p_subject_relation IS NULL AND subject_relation IS NULL) OR
        (subject_relation = p_subject_relation)
    );

    deleted := FOUND;

    IF deleted THEN
        PERFORM invalidate_permission_cache(p_namespace, p_object_id);
    END IF;

    RETURN deleted;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update timestamp for namespaces
CREATE OR REPLACE FUNCTION update_namespace_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_permission_namespaces_timestamp
BEFORE UPDATE ON permission_namespaces
FOR EACH ROW EXECUTE FUNCTION update_namespace_timestamp();

-- Log tuple changes
CREATE OR REPLACE FUNCTION log_tuple_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO permission_audit_log (event_type, data, actor_id)
        VALUES (
            'tuple_created',
            jsonb_build_object(
                'tuple_id', NEW.id,
                'namespace', NEW.namespace,
                'object_id', NEW.object_id,
                'relation', NEW.relation,
                'subject', NEW.subject_namespace || ':' || NEW.subject_id ||
                    COALESCE('#' || NEW.subject_relation, '')
            ),
            NEW.created_by
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO permission_audit_log (event_type, data)
        VALUES (
            'tuple_deleted',
            jsonb_build_object(
                'tuple_id', OLD.id,
                'namespace', OLD.namespace,
                'object_id', OLD.object_id,
                'relation', OLD.relation,
                'subject', OLD.subject_namespace || ':' || OLD.subject_id ||
                    COALESCE('#' || OLD.subject_relation, '')
            )
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER log_permission_tuple_changes
AFTER INSERT OR DELETE ON permission_tuples
FOR EACH ROW EXECUTE FUNCTION log_tuple_change();

-- ============================================================================
-- INSERT DEFAULT NAMESPACES
-- ============================================================================

INSERT INTO permission_namespaces (name, description, relations) VALUES
(
    'user',
    'User entities',
    '[]'::jsonb
),
(
    'organization',
    'Organization entities',
    '[
        {"name": "owner", "direct_types": ["user"]},
        {"name": "admin", "direct_types": ["user"]},
        {"name": "member", "direct_types": ["user"]},
        {"name": "can_manage", "union": [{"relation": "owner"}, {"relation": "admin"}]},
        {"name": "can_view", "union": [{"relation": "can_manage"}, {"relation": "member"}]}
    ]'::jsonb
),
(
    'project',
    'Project entities',
    '[
        {"name": "organization", "direct_types": ["organization"]},
        {"name": "owner", "direct_types": ["user"]},
        {"name": "editor", "direct_types": ["user"]},
        {"name": "viewer", "direct_types": ["user"]},
        {"name": "can_delete", "union": [{"relation": "owner"}]},
        {"name": "can_edit", "union": [{"relation": "can_delete"}, {"relation": "editor"}]},
        {"name": "can_view", "union": [{"relation": "can_edit"}, {"relation": "viewer"}]}
    ]'::jsonb
),
(
    'document',
    'Document entities',
    '[
        {"name": "project", "direct_types": ["project"]},
        {"name": "owner", "direct_types": ["user"]},
        {"name": "editor", "direct_types": ["user"]},
        {"name": "viewer", "direct_types": ["user"]},
        {"name": "commenter", "direct_types": ["user"]},
        {"name": "can_delete", "union": [{"relation": "owner"}]},
        {"name": "can_edit", "union": [{"relation": "can_delete"}, {"relation": "editor"}]},
        {"name": "can_comment", "union": [{"relation": "can_edit"}, {"relation": "commenter"}]},
        {"name": "can_view", "union": [{"relation": "can_comment"}, {"relation": "viewer"}]}
    ]'::jsonb
),
(
    'invoice',
    'Invoice entities',
    '[
        {"name": "organization", "direct_types": ["organization"]},
        {"name": "owner", "direct_types": ["user"]},
        {"name": "viewer", "direct_types": ["user"]},
        {"name": "can_edit", "union": [{"relation": "owner"}]},
        {"name": "can_view", "union": [{"relation": "can_edit"}, {"relation": "viewer"}]}
    ]'::jsonb
)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE permission_namespaces IS 'Defines object types and their relations (Zanzibar namespace configs)';
COMMENT ON TABLE permission_tuples IS 'Core Zanzibar tuple storage: (namespace, object_id, relation, subject)';
COMMENT ON TABLE permission_audit_log IS 'Audit trail for all permission changes';
COMMENT ON TABLE permission_check_cache IS 'Optional persistent cache for permission checks';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON permission_namespaces TO authenticated;
GRANT SELECT ON permission_tuples TO authenticated;
GRANT SELECT ON permission_audit_log TO authenticated;

GRANT ALL ON permission_namespaces TO service_role;
GRANT ALL ON permission_tuples TO service_role;
GRANT ALL ON permission_audit_log TO service_role;
GRANT ALL ON permission_check_cache TO service_role;

GRANT EXECUTE ON FUNCTION check_direct_permission(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subjects_with_relation(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_subject_permissions(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_permission_cache() TO service_role;
GRANT EXECUTE ON FUNCTION invalidate_permission_cache(TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION write_permission_tuple(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION delete_permission_tuple(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
