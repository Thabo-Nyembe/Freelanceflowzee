-- ============================================
-- SUPABASE 2025 UPDATE: OAuth 2.0 Provider Capability
-- Migration: 20251216000004_oauth_provider_capability.sql
-- Features: "Sign in with KAZI" for third-party apps
-- OAuth 2.1 and OpenID Connect server support
-- ============================================

-- ============================================
-- OAUTH APPLICATIONS (Third-party apps using KAZI auth)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Application details
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    homepage_url TEXT,

    -- OAuth credentials
    client_id TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
    client_secret_hash TEXT NOT NULL, -- Hashed secret
    client_type TEXT NOT NULL DEFAULT 'confidential' CHECK (client_type IN ('confidential', 'public')),

    -- Redirect URIs (JSON array)
    redirect_uris TEXT[] NOT NULL DEFAULT '{}',
    allowed_origins TEXT[] DEFAULT '{}',

    -- Scopes this app can request
    allowed_scopes TEXT[] NOT NULL DEFAULT '{openid,profile,email}',

    -- Settings
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false, -- Verified by KAZI team
    is_first_party BOOLEAN DEFAULT false, -- Internal KAZI apps

    -- Rate limiting
    rate_limit_per_minute INTEGER DEFAULT 60,
    rate_limit_per_day INTEGER DEFAULT 10000,

    -- Token settings
    access_token_lifetime_seconds INTEGER DEFAULT 3600, -- 1 hour
    refresh_token_lifetime_seconds INTEGER DEFAULT 2592000, -- 30 days
    id_token_lifetime_seconds INTEGER DEFAULT 3600,

    -- PKCE settings
    require_pkce BOOLEAN DEFAULT true,

    -- Consent settings
    skip_consent BOOLEAN DEFAULT false, -- For first-party apps
    consent_screen_text TEXT,

    -- Stats
    total_users INTEGER DEFAULT 0,
    total_authorizations INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- ============================================
-- OAUTH AUTHORIZATION CODES
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Authorization code
    code TEXT UNIQUE NOT NULL,
    code_challenge TEXT, -- PKCE
    code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),

    -- Request details
    redirect_uri TEXT NOT NULL,
    scope TEXT[] NOT NULL DEFAULT '{openid}',
    state TEXT,
    nonce TEXT, -- For OpenID Connect

    -- Status
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- OAUTH ACCESS TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Token
    token_hash TEXT UNIQUE NOT NULL, -- Hashed token
    token_type TEXT NOT NULL DEFAULT 'Bearer',

    -- Scope
    scope TEXT[] NOT NULL DEFAULT '{openid}',

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Metadata
    ip_address INET,
    user_agent TEXT
);

-- ============================================
-- OAUTH REFRESH TOKENS
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token_id UUID REFERENCES oauth_access_tokens(id) ON DELETE SET NULL,

    -- Token
    token_hash TEXT UNIQUE NOT NULL,

    -- Rotation tracking
    previous_token_hash TEXT,
    rotation_count INTEGER DEFAULT 0,

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Expiry
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ
);

-- ============================================
-- USER OAUTH AUTHORIZATIONS (Consents)
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_user_authorizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,

    -- Authorized scopes
    scopes TEXT[] NOT NULL DEFAULT '{openid}',

    -- Status
    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMPTZ,

    -- Timestamps
    authorized_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ,

    -- Stats
    access_count INTEGER DEFAULT 0,

    UNIQUE(user_id, application_id)
);

-- ============================================
-- OAUTH SCOPES DEFINITION
-- ============================================
CREATE TABLE IF NOT EXISTS oauth_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Scope details
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Categorization
    category TEXT NOT NULL DEFAULT 'user' CHECK (category IN ('openid', 'user', 'account', 'data', 'admin')),
    is_sensitive BOOLEAN DEFAULT false,
    requires_consent BOOLEAN DEFAULT true,

    -- What this scope grants access to
    claims TEXT[] DEFAULT '{}', -- OpenID Connect claims
    permissions TEXT[] DEFAULT '{}', -- API permissions

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INSERT DEFAULT OAUTH SCOPES
-- ============================================
INSERT INTO oauth_scopes (name, display_name, description, category, claims, permissions)
VALUES
    ('openid', 'OpenID', 'Verify your identity', 'openid', '{sub}', '{}'),
    ('profile', 'Profile Information', 'Access your name and profile picture', 'user', '{name,preferred_username,picture,profile}', '{read:profile}'),
    ('email', 'Email Address', 'Access your email address', 'user', '{email,email_verified}', '{read:email}'),
    ('phone', 'Phone Number', 'Access your phone number', 'user', '{phone_number,phone_number_verified}', '{read:phone}'),
    ('address', 'Address', 'Access your address', 'user', '{address}', '{read:address}'),
    ('offline_access', 'Offline Access', 'Access your data when you''re not using the app', 'account', '{}', '{offline_access}'),
    ('projects:read', 'Read Projects', 'View your projects', 'data', '{}', '{read:projects}'),
    ('projects:write', 'Write Projects', 'Create and edit your projects', 'data', '{}', '{write:projects}'),
    ('files:read', 'Read Files', 'View your files', 'data', '{}', '{read:files}'),
    ('files:write', 'Write Files', 'Upload and manage files', 'data', '{}', '{write:files}'),
    ('invoices:read', 'Read Invoices', 'View your invoices', 'data', '{}', '{read:invoices}'),
    ('invoices:write', 'Write Invoices', 'Create and edit invoices', 'data', '{}', '{write:invoices}'),
    ('messages:read', 'Read Messages', 'View your messages', 'data', '{}', '{read:messages}'),
    ('messages:write', 'Write Messages', 'Send messages', 'data', '{}', '{write:messages}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- OAUTH HELPER FUNCTIONS
-- ============================================

-- Create a new OAuth application
CREATE OR REPLACE FUNCTION create_oauth_application(
    p_owner_id UUID,
    p_name TEXT,
    p_redirect_uris TEXT[],
    p_description TEXT DEFAULT NULL,
    p_allowed_scopes TEXT[] DEFAULT '{openid,profile,email}'
)
RETURNS TABLE (
    client_id TEXT,
    client_secret TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_secret TEXT;
    v_client_id TEXT;
BEGIN
    -- Generate client secret
    v_client_secret := encode(gen_random_bytes(48), 'hex');
    v_client_id := encode(gen_random_bytes(32), 'hex');

    INSERT INTO oauth_applications (
        owner_id, name, description, redirect_uris, allowed_scopes, client_id, client_secret_hash
    )
    VALUES (
        p_owner_id, p_name, p_description, p_redirect_uris, p_allowed_scopes,
        v_client_id, crypt(v_client_secret, gen_salt('bf'))
    );

    -- Return credentials (secret only shown once!)
    RETURN QUERY SELECT v_client_id, v_client_secret;
END;
$$;

-- Verify client credentials
CREATE OR REPLACE FUNCTION verify_oauth_client(
    p_client_id TEXT,
    p_client_secret TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_app_id UUID;
    v_secret_hash TEXT;
BEGIN
    SELECT id, client_secret_hash INTO v_app_id, v_secret_hash
    FROM oauth_applications
    WHERE client_id = p_client_id AND is_active = true;

    IF v_app_id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Verify secret
    IF v_secret_hash = crypt(p_client_secret, v_secret_hash) THEN
        RETURN v_app_id;
    END IF;

    RETURN NULL;
END;
$$;

-- Create authorization code
CREATE OR REPLACE FUNCTION create_authorization_code(
    p_app_id UUID,
    p_user_id UUID,
    p_redirect_uri TEXT,
    p_scope TEXT[],
    p_state TEXT DEFAULT NULL,
    p_nonce TEXT DEFAULT NULL,
    p_code_challenge TEXT DEFAULT NULL,
    p_code_challenge_method TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code TEXT;
BEGIN
    v_code := encode(gen_random_bytes(32), 'hex');

    INSERT INTO oauth_authorization_codes (
        application_id, user_id, code, redirect_uri, scope,
        state, nonce, code_challenge, code_challenge_method
    )
    VALUES (
        p_app_id, p_user_id, v_code, p_redirect_uri, p_scope,
        p_state, p_nonce, p_code_challenge, p_code_challenge_method
    );

    RETURN v_code;
END;
$$;

-- Exchange authorization code for tokens
CREATE OR REPLACE FUNCTION exchange_authorization_code(
    p_code TEXT,
    p_client_id TEXT,
    p_redirect_uri TEXT,
    p_code_verifier TEXT DEFAULT NULL
)
RETURNS TABLE (
    access_token TEXT,
    refresh_token TEXT,
    token_type TEXT,
    expires_in INTEGER,
    scope TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_auth_code RECORD;
    v_app RECORD;
    v_access_token TEXT;
    v_refresh_token TEXT;
    v_access_token_id UUID;
BEGIN
    -- Get and validate authorization code
    SELECT ac.*, oa.access_token_lifetime_seconds, oa.refresh_token_lifetime_seconds
    INTO v_auth_code
    FROM oauth_authorization_codes ac
    JOIN oauth_applications oa ON oa.id = ac.application_id
    WHERE ac.code = p_code
    AND oa.client_id = p_client_id
    AND ac.redirect_uri = p_redirect_uri
    AND ac.is_used = false
    AND ac.expires_at > NOW();

    IF v_auth_code IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired authorization code';
    END IF;

    -- Verify PKCE if required
    IF v_auth_code.code_challenge IS NOT NULL THEN
        IF p_code_verifier IS NULL THEN
            RAISE EXCEPTION 'Code verifier required';
        END IF;

        IF v_auth_code.code_challenge_method = 'S256' THEN
            IF v_auth_code.code_challenge != encode(sha256(p_code_verifier::bytea), 'base64url') THEN
                RAISE EXCEPTION 'Invalid code verifier';
            END IF;
        ELSE
            IF v_auth_code.code_challenge != p_code_verifier THEN
                RAISE EXCEPTION 'Invalid code verifier';
            END IF;
        END IF;
    END IF;

    -- Mark code as used
    UPDATE oauth_authorization_codes
    SET is_used = true, used_at = NOW()
    WHERE code = p_code;

    -- Generate tokens
    v_access_token := encode(gen_random_bytes(48), 'hex');
    v_refresh_token := encode(gen_random_bytes(48), 'hex');

    -- Store access token
    INSERT INTO oauth_access_tokens (
        application_id, user_id, token_hash, scope, expires_at
    )
    VALUES (
        v_auth_code.application_id,
        v_auth_code.user_id,
        crypt(v_access_token, gen_salt('bf')),
        v_auth_code.scope,
        NOW() + (v_auth_code.access_token_lifetime_seconds || ' seconds')::INTERVAL
    )
    RETURNING id INTO v_access_token_id;

    -- Store refresh token
    INSERT INTO oauth_refresh_tokens (
        application_id, user_id, access_token_id, token_hash, expires_at
    )
    VALUES (
        v_auth_code.application_id,
        v_auth_code.user_id,
        v_access_token_id,
        crypt(v_refresh_token, gen_salt('bf')),
        NOW() + (v_auth_code.refresh_token_lifetime_seconds || ' seconds')::INTERVAL
    );

    -- Update app stats
    UPDATE oauth_applications
    SET
        total_authorizations = total_authorizations + 1,
        last_used_at = NOW()
    WHERE id = v_auth_code.application_id;

    -- Return tokens
    RETURN QUERY SELECT
        v_access_token,
        v_refresh_token,
        'Bearer'::TEXT,
        v_auth_code.access_token_lifetime_seconds,
        array_to_string(v_auth_code.scope, ' ');
END;
$$;

-- Revoke user authorization for an app
CREATE OR REPLACE FUNCTION revoke_oauth_authorization(
    p_user_id UUID,
    p_app_id UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Revoke authorization
    UPDATE oauth_user_authorizations
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;

    -- Revoke all tokens
    UPDATE oauth_access_tokens
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;

    UPDATE oauth_refresh_tokens
    SET is_revoked = true, revoked_at = NOW()
    WHERE user_id = p_user_id AND application_id = p_app_id;
END;
$$;

-- Get user's authorized applications
CREATE OR REPLACE FUNCTION get_user_authorized_apps(p_user_id UUID)
RETURNS TABLE (
    app_id UUID,
    app_name TEXT,
    app_logo TEXT,
    scopes TEXT[],
    authorized_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        oa.id,
        oa.name,
        oa.logo_url,
        oua.scopes,
        oua.authorized_at,
        oua.last_used_at
    FROM oauth_user_authorizations oua
    JOIN oauth_applications oa ON oa.id = oua.application_id
    WHERE oua.user_id = p_user_id
    AND oua.is_revoked = false
    ORDER BY oua.last_used_at DESC NULLS LAST;
END;
$$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_oauth_apps_owner ON oauth_applications(owner_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_client_id ON oauth_applications(client_id);
CREATE INDEX IF NOT EXISTS idx_oauth_apps_active ON oauth_applications(is_active);

CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_code ON oauth_authorization_codes(code);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_expires ON oauth_authorization_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_hash ON oauth_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user ON oauth_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_expires ON oauth_access_tokens(expires_at);

CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_hash ON oauth_refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_user ON oauth_refresh_tokens(user_id);

CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_user ON oauth_user_authorizations(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_authorizations_app ON oauth_user_authorizations(application_id);

-- ============================================
-- CLEANUP EXPIRED TOKENS (Run periodically)
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Delete expired authorization codes
    DELETE FROM oauth_authorization_codes WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Delete expired access tokens
    DELETE FROM oauth_access_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Delete expired refresh tokens
    DELETE FROM oauth_refresh_tokens WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    RETURN deleted_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE oauth_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_user_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_scopes ENABLE ROW LEVEL SECURITY;

-- Applications - owners can manage their own
CREATE POLICY "Owners manage own OAuth apps"
ON oauth_applications FOR ALL
USING (auth.uid() = owner_id);

-- Users can view active apps for authorization
CREATE POLICY "Users view active OAuth apps"
ON oauth_applications FOR SELECT
USING (is_active = true);

-- Authorization codes - service role only
CREATE POLICY "Service role manages auth codes"
ON oauth_authorization_codes FOR ALL
USING (false); -- Only via RPC functions

-- Access tokens - users can view their own
CREATE POLICY "Users view own access tokens"
ON oauth_access_tokens FOR SELECT
USING (auth.uid() = user_id);

-- Users can revoke their own tokens
CREATE POLICY "Users revoke own access tokens"
ON oauth_access_tokens FOR UPDATE
USING (auth.uid() = user_id);

-- Refresh tokens - similar to access tokens
CREATE POLICY "Users view own refresh tokens"
ON oauth_refresh_tokens FOR SELECT
USING (auth.uid() = user_id);

-- User authorizations - users manage their own
CREATE POLICY "Users manage own authorizations"
ON oauth_user_authorizations FOR ALL
USING (auth.uid() = user_id);

-- Scopes - public read
CREATE POLICY "Public read OAuth scopes"
ON oauth_scopes FOR SELECT
USING (is_active = true);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE oauth_applications IS 'Third-party apps using KAZI OAuth - Supabase 2025 OAuth Provider';
COMMENT ON TABLE oauth_authorization_codes IS 'OAuth 2.1 authorization codes with PKCE support';
COMMENT ON TABLE oauth_access_tokens IS 'OAuth access tokens for API access';
COMMENT ON TABLE oauth_refresh_tokens IS 'OAuth refresh tokens with rotation support';
COMMENT ON TABLE oauth_user_authorizations IS 'User consents for OAuth applications';
COMMENT ON TABLE oauth_scopes IS 'Available OAuth scopes and OpenID Connect claims';
COMMENT ON FUNCTION create_oauth_application IS 'Create a new OAuth application (returns credentials)';
COMMENT ON FUNCTION exchange_authorization_code IS 'Exchange auth code for access/refresh tokens';
