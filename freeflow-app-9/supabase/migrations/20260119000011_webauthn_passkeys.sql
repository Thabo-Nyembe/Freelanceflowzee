-- Migration: WebAuthn/Passkeys (Passwordless Authentication)
-- Phase 9.1 of A+++ Implementation
-- Created: January 2026

-- ============================================================================
-- USER PASSKEYS TABLE
-- Stores WebAuthn credentials for passwordless authentication
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_passkeys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    transports TEXT[] DEFAULT '{}',
    device_type VARCHAR(50) NOT NULL DEFAULT 'cross-platform' CHECK (device_type IN ('platform', 'cross-platform')),
    backed_up BOOLEAN NOT NULL DEFAULT false,
    name VARCHAR(255) NOT NULL DEFAULT 'My Passkey',
    aaguid TEXT, -- Authenticator Attestation GUID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    CONSTRAINT credential_id_format CHECK (length(credential_id) >= 20)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id ON user_passkeys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_credential_id ON user_passkeys(credential_id);
CREATE INDEX IF NOT EXISTS idx_user_passkeys_last_used ON user_passkeys(last_used_at DESC);

-- ============================================================================
-- WEBAUTHN CHALLENGES TABLE
-- Temporary storage for registration/authentication challenges
-- ============================================================================

CREATE TABLE IF NOT EXISTS webauthn_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('registration', 'authentication')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_user ON webauthn_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_challenges_expires ON webauthn_challenges(expires_at);

-- ============================================================================
-- USER BACKUP CODES TABLE
-- Recovery codes for account access
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_backup_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    codes TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_backup_codes_user ON user_backup_codes(user_id);

-- ============================================================================
-- USER SESSIONS TABLE
-- Track authenticated sessions for passkey auth
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auth_method VARCHAR(50) NOT NULL DEFAULT 'password' CHECK (auth_method IN ('password', 'passkey', 'sso', 'magic_link', 'oauth')),
    ip_address INET,
    user_agent TEXT,
    device_info JSONB DEFAULT '{}',
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id) WHERE revoked_at IS NULL;

-- ============================================================================
-- SECURITY EVENTS TABLE
-- Audit log for security-related actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    country_code VARCHAR(2),
    city VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for security event queries
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user_recent ON security_events(user_id, created_at DESC);

-- Partial index for critical events
CREATE INDEX IF NOT EXISTS idx_security_events_critical
ON security_events(created_at DESC)
WHERE severity IN ('warning', 'error', 'critical');

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE user_passkeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_backup_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

-- User Passkeys policies
CREATE POLICY "Users can view own passkeys"
ON user_passkeys FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own passkeys"
ON user_passkeys FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own passkeys"
ON user_passkeys FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own passkeys"
ON user_passkeys FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- WebAuthn Challenges policies (allow service role access)
CREATE POLICY "Users can view own challenges"
ON webauthn_challenges FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service can manage challenges"
ON webauthn_challenges FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- User Backup Codes policies
CREATE POLICY "Users can view own backup codes"
ON user_backup_codes FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own backup codes"
ON user_backup_codes FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- User Sessions policies
CREATE POLICY "Users can view own sessions"
ON user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can revoke own sessions"
ON user_sessions FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Security Events policies
CREATE POLICY "Users can view own security events"
ON security_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security events"
ON security_events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    )
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to clean up expired challenges
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webauthn_challenges
    WHERE expires_at < NOW();

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < NOW()
    OR revoked_at IS NOT NULL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to revoke all user sessions
CREATE OR REPLACE FUNCTION revoke_all_user_sessions(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    revoked_count INTEGER;
BEGIN
    UPDATE user_sessions
    SET revoked_at = NOW()
    WHERE user_id = target_user_id
    AND revoked_at IS NULL;

    GET DIAGNOSTICS revoked_count = ROW_COUNT;
    RETURN revoked_count;
END;
$$;

-- Function to get user's active sessions count
CREATE OR REPLACE FUNCTION get_active_sessions_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM user_sessions
        WHERE user_id = target_user_id
        AND expires_at > NOW()
        AND revoked_at IS NULL
    );
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger for backup codes
CREATE OR REPLACE FUNCTION update_backup_codes_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_backup_codes_timestamp
BEFORE UPDATE ON user_backup_codes
FOR EACH ROW
EXECUTE FUNCTION update_backup_codes_timestamp();

-- Log passkey events trigger
CREATE OR REPLACE FUNCTION log_passkey_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO security_events (user_id, event_type, metadata, severity)
        VALUES (
            NEW.user_id,
            'passkey_added',
            jsonb_build_object(
                'passkey_id', NEW.id,
                'device_type', NEW.device_type,
                'name', NEW.name
            ),
            'info'
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO security_events (user_id, event_type, metadata, severity)
        VALUES (
            OLD.user_id,
            'passkey_removed',
            jsonb_build_object(
                'passkey_id', OLD.id,
                'device_type', OLD.device_type,
                'name', OLD.name
            ),
            'warning'
        );
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER log_passkey_changes
AFTER INSERT OR DELETE ON user_passkeys
FOR EACH ROW
EXECUTE FUNCTION log_passkey_event();

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Note: In production, passkeys are registered by users through the WebAuthn flow
-- This sample data is for development testing only

COMMENT ON TABLE user_passkeys IS 'Stores WebAuthn/FIDO2 credentials for passwordless authentication';
COMMENT ON TABLE webauthn_challenges IS 'Temporary storage for WebAuthn registration/authentication challenges';
COMMENT ON TABLE user_backup_codes IS 'Recovery codes for account access when passkeys are unavailable';
COMMENT ON TABLE user_sessions IS 'Tracks authenticated user sessions across auth methods';
COMMENT ON TABLE security_events IS 'Audit log for security-related events and actions';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_passkeys TO authenticated;
GRANT ALL ON webauthn_challenges TO service_role;
GRANT ALL ON user_backup_codes TO authenticated;
GRANT SELECT, UPDATE ON user_sessions TO authenticated;
GRANT SELECT ON security_events TO authenticated;

-- Grant function execute permissions
GRANT EXECUTE ON FUNCTION cleanup_expired_challenges() TO service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO service_role;
GRANT EXECUTE ON FUNCTION revoke_all_user_sessions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_sessions_count(UUID) TO authenticated;
