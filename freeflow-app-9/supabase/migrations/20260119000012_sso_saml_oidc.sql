-- Migration: SSO/SAML/OIDC Integration
-- Phase 9.2 of A+++ Implementation
-- Created: January 2026

-- ============================================================================
-- IDENTITY PROVIDERS TABLE
-- Stores SAML and OIDC identity provider configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS identity_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('saml', 'oidc')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    config JSONB NOT NULL DEFAULT '{}',
    attribute_mapping JSONB NOT NULL DEFAULT '{}',
    group_mapping JSONB NOT NULL DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_config CHECK (
        (type = 'saml' AND config ? 'entity_id' AND config ? 'sso_url' AND config ? 'certificate') OR
        (type = 'oidc' AND config ? 'issuer' AND config ? 'client_id' AND config ? 'authorization_endpoint')
    )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_identity_providers_org ON identity_providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_identity_providers_type ON identity_providers(type);
CREATE INDEX IF NOT EXISTS idx_identity_providers_status ON identity_providers(status);
CREATE INDEX IF NOT EXISTS idx_identity_providers_entity_id ON identity_providers((config->>'entity_id')) WHERE type = 'saml';
CREATE INDEX IF NOT EXISTS idx_identity_providers_issuer ON identity_providers((config->>'issuer')) WHERE type = 'oidc';

-- ============================================================================
-- SSO CONNECTIONS TABLE
-- Links organizations to their SSO configurations
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    idp_id UUID NOT NULL REFERENCES identity_providers(id) ON DELETE CASCADE,
    domain VARCHAR(255), -- For email domain-based SSO routing
    is_default BOOLEAN DEFAULT false,
    enforce_sso BOOLEAN DEFAULT false, -- Require SSO for all users in org
    allow_password_login BOOLEAN DEFAULT true,
    auto_provision_users BOOLEAN DEFAULT true,
    default_role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_org_idp UNIQUE (organization_id, idp_id),
    CONSTRAINT unique_domain UNIQUE (domain)
);

CREATE INDEX IF NOT EXISTS idx_sso_connections_org ON sso_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_connections_idp ON sso_connections(idp_id);
CREATE INDEX IF NOT EXISTS idx_sso_connections_domain ON sso_connections(domain) WHERE domain IS NOT NULL;

-- ============================================================================
-- SSO SESSIONS TABLE
-- Tracks active SSO sessions for logout and session management
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idp_id UUID NOT NULL REFERENCES identity_providers(id) ON DELETE CASCADE,
    session_index TEXT, -- SAML SessionIndex for SLO
    name_id TEXT, -- SAML NameID for SLO
    attributes JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_sessions_user ON sso_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_idp ON sso_sessions(idp_id);
CREATE INDEX IF NOT EXISTS idx_sso_sessions_expires ON sso_sessions(expires_at);

-- ============================================================================
-- SSO REQUESTS TABLE
-- Stores pending SSO requests for validation
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_requests (
    id TEXT PRIMARY KEY,
    idp_id UUID REFERENCES identity_providers(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('authn', 'logout', 'oidc_auth')),
    relay_state TEXT,
    code_verifier TEXT, -- For OIDC PKCE
    redirect_uri TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_requests_idp ON sso_requests(idp_id);
CREATE INDEX IF NOT EXISTS idx_sso_requests_expires ON sso_requests(expires_at);

-- ============================================================================
-- USER IDP LINKS TABLE
-- Links users to their identity provider accounts
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_idp_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    idp_id UUID NOT NULL REFERENCES identity_providers(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL, -- User ID from IdP
    groups TEXT[] DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_idp UNIQUE (user_id, idp_id),
    CONSTRAINT unique_external_id UNIQUE (idp_id, external_id)
);

CREATE INDEX IF NOT EXISTS idx_user_idp_links_user ON user_idp_links(user_id);
CREATE INDEX IF NOT EXISTS idx_user_idp_links_idp ON user_idp_links(idp_id);
CREATE INDEX IF NOT EXISTS idx_user_idp_links_external ON user_idp_links(idp_id, external_id);

-- ============================================================================
-- SSO AUDIT LOG TABLE
-- Tracks SSO-related events for security and compliance
-- ============================================================================

CREATE TABLE IF NOT EXISTS sso_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idp_id UUID REFERENCES identity_providers(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'pending')),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sso_audit_log_idp ON sso_audit_log(idp_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_user ON sso_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_event ON sso_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_sso_audit_log_created ON sso_audit_log(created_at DESC);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE identity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_idp_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_audit_log ENABLE ROW LEVEL SECURITY;

-- Identity Providers policies
CREATE POLICY "Org admins can manage identity providers"
ON identity_providers FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = identity_providers.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('admin', 'owner')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = identity_providers.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('admin', 'owner')
    )
);

CREATE POLICY "Service role can manage identity providers"
ON identity_providers FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SSO Connections policies
CREATE POLICY "Org admins can manage SSO connections"
ON sso_connections FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM organization_members
        WHERE organization_members.organization_id = sso_connections.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('admin', 'owner')
    )
);

-- SSO Sessions policies
CREATE POLICY "Users can view own SSO sessions"
ON sso_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own SSO sessions"
ON sso_sessions FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage SSO sessions"
ON sso_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SSO Requests policies (service role only)
CREATE POLICY "Service role can manage SSO requests"
ON sso_requests FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- User IdP Links policies
CREATE POLICY "Users can view own IdP links"
ON user_idp_links FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage IdP links"
ON user_idp_links FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- SSO Audit Log policies
CREATE POLICY "Org admins can view SSO audit logs"
ON sso_audit_log FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM identity_providers idp
        JOIN organization_members om ON om.organization_id = idp.organization_id
        WHERE idp.id = sso_audit_log.idp_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to get SSO connection for email domain
CREATE OR REPLACE FUNCTION get_sso_connection_for_domain(email_domain TEXT)
RETURNS TABLE (
    idp_id UUID,
    idp_type VARCHAR(20),
    enforce_sso BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sc.idp_id,
        ip.type,
        sc.enforce_sso
    FROM sso_connections sc
    JOIN identity_providers ip ON ip.id = sc.idp_id
    WHERE sc.domain = email_domain
    AND ip.status = 'active'
    LIMIT 1;
END;
$$;

-- Function to clean up expired SSO requests
CREATE OR REPLACE FUNCTION cleanup_expired_sso_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sso_requests WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to clean up expired SSO sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sso_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sso_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to log SSO event
CREATE OR REPLACE FUNCTION log_sso_event(
    p_idp_id UUID,
    p_user_id UUID,
    p_event_type VARCHAR(50),
    p_status VARCHAR(20),
    p_details JSONB DEFAULT '{}',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO sso_audit_log (idp_id, user_id, event_type, status, details, ip_address, user_agent)
    VALUES (p_idp_id, p_user_id, p_event_type, p_status, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_sso_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_identity_providers_timestamp
BEFORE UPDATE ON identity_providers
FOR EACH ROW EXECUTE FUNCTION update_sso_timestamp();

CREATE TRIGGER update_sso_connections_timestamp
BEFORE UPDATE ON sso_connections
FOR EACH ROW EXECUTE FUNCTION update_sso_timestamp();

CREATE TRIGGER update_user_idp_links_timestamp
BEFORE UPDATE ON user_idp_links
FOR EACH ROW EXECUTE FUNCTION update_sso_timestamp();

-- ============================================================================
-- SAMPLE DATA (Development Only)
-- ============================================================================

-- Note: In production, IdP configurations are added through the admin UI
-- This is example data showing supported configurations

COMMENT ON TABLE identity_providers IS 'SAML and OIDC identity provider configurations';
COMMENT ON TABLE sso_connections IS 'Links organizations to their SSO configurations';
COMMENT ON TABLE sso_sessions IS 'Active SSO sessions for logout and session management';
COMMENT ON TABLE sso_requests IS 'Pending SSO requests for validation';
COMMENT ON TABLE user_idp_links IS 'Links users to their identity provider accounts';
COMMENT ON TABLE sso_audit_log IS 'Audit trail for SSO-related events';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON identity_providers TO authenticated;
GRANT SELECT ON sso_connections TO authenticated;
GRANT SELECT, DELETE ON sso_sessions TO authenticated;
GRANT SELECT ON user_idp_links TO authenticated;
GRANT SELECT ON sso_audit_log TO authenticated;

-- Service role grants
GRANT ALL ON identity_providers TO service_role;
GRANT ALL ON sso_connections TO service_role;
GRANT ALL ON sso_sessions TO service_role;
GRANT ALL ON sso_requests TO service_role;
GRANT ALL ON user_idp_links TO service_role;
GRANT ALL ON sso_audit_log TO service_role;

-- Function grants
GRANT EXECUTE ON FUNCTION get_sso_connection_for_domain(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sso_requests() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_sso_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION log_sso_event(UUID, UUID, VARCHAR, VARCHAR, JSONB, INET, TEXT) TO service_role;
