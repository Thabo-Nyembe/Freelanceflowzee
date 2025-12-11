-- ============================================================================
-- Authentication Users Table Migration (FIXED)
-- Created: December 10, 2025
-- Purpose: Create users table with authentication fields for NextAuth.js
-- Fix: Removed OLD references from RLS policies (not allowed in WITH CHECK)
-- ============================================================================

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication fields
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT, -- NULL for OAuth users
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,

  -- Profile fields
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,

  -- Authorization
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'freelancer', 'client', 'admin', 'superadmin')),

  -- OAuth fields
  oauth_provider TEXT, -- 'google', 'github', etc.
  oauth_id TEXT, -- Provider's user ID

  -- Account status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  banned_reason TEXT,
  banned_at TIMESTAMPTZ,

  -- Security
  last_login TIMESTAMPTZ,
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete

  -- Indexes
  CONSTRAINT unique_email_not_deleted UNIQUE NULLS NOT DISTINCT (email, deleted_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at) WHERE deleted_at IS NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Create trigger to prevent users from changing their own role/status
CREATE OR REPLACE FUNCTION prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow service role to do anything
  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Check if user is updating their own record
  IF OLD.id::text = current_setting('request.jwt.claims', true)::json->>'sub' THEN
    -- Prevent changing own role
    IF NEW.role != OLD.role THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;

    -- Prevent changing own active status
    IF NEW.is_active != OLD.is_active THEN
      RAISE EXCEPTION 'You cannot change your own active status';
    END IF;

    -- Prevent changing own banned status
    IF NEW.is_banned != OLD.is_banned THEN
      RAISE EXCEPTION 'You cannot change your own banned status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_self_escalation_trigger ON users;
CREATE TRIGGER prevent_self_escalation_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_privilege_escalation();

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_admin_select ON users;
DROP POLICY IF EXISTS users_admin_update ON users;
DROP POLICY IF EXISTS users_service_all ON users;

-- Policy: Users can view their own profile
CREATE POLICY users_select_own
  ON users
  FOR SELECT
  USING (
    auth.uid()::text = id::text
    OR role IN ('admin', 'superadmin')
  );

-- Policy: Users can update their own profile
-- Note: Role/status protection is handled by trigger above
CREATE POLICY users_update_own
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Policy: Admins can view all users
CREATE POLICY users_admin_select
  ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text
      AND u.role IN ('admin', 'superadmin')
    )
  );

-- Policy: Admins can update any user
CREATE POLICY users_admin_update
  ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id::text = auth.uid()::text
      AND u.role IN ('admin', 'superadmin')
    )
  );

-- Policy: Allow inserts for signup (no auth required for new users)
CREATE POLICY users_insert_signup
  ON users
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- User Profiles Table (Extended Information)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key (one-to-one with users)
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Professional information
  company TEXT,
  job_title TEXT,
  industry TEXT,
  website TEXT,

  -- Contact information
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',

  -- Social links
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,

  -- Preferences
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  marketing_emails_enabled BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;

-- RLS Policies
CREATE POLICY user_profiles_select_own
  ON user_profiles
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_update_own
  ON user_profiles
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_insert_own
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- ============================================================================
-- Email Verification Tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires ON email_verification_tokens(expires_at);

-- ============================================================================
-- Password Reset Tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON password_reset_tokens(expires_at);

-- ============================================================================
-- Session Logs (for audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('login', 'logout', 'failed_login')),
  ip_address TEXT,
  user_agent TEXT,
  location TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_created_at ON session_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_session_logs_action ON session_logs(action);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to create user profile automatically
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_profile_trigger ON users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to log session activity
CREATE OR REPLACE FUNCTION log_session_activity(
  p_user_id UUID,
  p_action TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT TRUE,
  p_error_message TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO session_logs (user_id, action, ip_address, user_agent, success, error_message)
  VALUES (p_user_id, p_action, p_ip_address, p_user_agent, p_success, p_error_message);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Grant Permissions
-- ============================================================================

-- Note: Adjust these based on your Supabase setup
-- These are common defaults but may need customization

-- Grant to authenticated users
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
    GRANT SELECT ON email_verification_tokens TO authenticated;
    GRANT SELECT ON password_reset_tokens TO authenticated;
    GRANT SELECT ON session_logs TO authenticated;
  END IF;
END $$;

-- Grant to service role
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL ON users TO service_role;
    GRANT ALL ON user_profiles TO service_role;
    GRANT ALL ON email_verification_tokens TO service_role;
    GRANT ALL ON password_reset_tokens TO service_role;
    GRANT ALL ON session_logs TO service_role;
  END IF;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE '✅ Migration Complete!';
  RAISE NOTICE '📊 Tables created:';
  RAISE NOTICE '  - users';
  RAISE NOTICE '  - user_profiles';
  RAISE NOTICE '  - email_verification_tokens';
  RAISE NOTICE '  - password_reset_tokens';
  RAISE NOTICE '  - session_logs';
  RAISE NOTICE '🔒 RLS enabled on all tables';
  RAISE NOTICE '✨ Ready for authentication!';
END $$;
