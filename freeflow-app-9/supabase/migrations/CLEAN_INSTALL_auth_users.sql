-- ============================================================================
-- CLEAN INSTALL - Authentication Users Table
-- Run this if you get "already exists" errors
-- This will drop and recreate everything cleanly
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EVERYTHING (Clean Slate)
-- ============================================================================

-- Drop all policies first (they depend on tables)
DROP POLICY IF EXISTS users_insert_signup ON users;
DROP POLICY IF EXISTS users_admin_update ON users;
DROP POLICY IF EXISTS users_admin_select ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_service_all ON users;

DROP POLICY IF EXISTS user_profiles_insert_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_update_own ON user_profiles;
DROP POLICY IF EXISTS user_profiles_select_own ON user_profiles;

-- Drop triggers
DROP TRIGGER IF EXISTS prevent_self_escalation_trigger ON users;
DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
DROP TRIGGER IF EXISTS create_user_profile_trigger ON users;

-- Drop functions
DROP FUNCTION IF EXISTS prevent_self_privilege_escalation();
DROP FUNCTION IF EXISTS update_users_updated_at();
DROP FUNCTION IF EXISTS create_user_profile();
DROP FUNCTION IF EXISTS log_session_activity(UUID, TEXT, TEXT, TEXT, BOOLEAN, TEXT);

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS session_logs CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop types if they exist
DROP TYPE IF EXISTS user_role CASCADE;

-- ============================================================================
-- STEP 2: CREATE FRESH (No Conflicts)
-- ============================================================================

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified_at TIMESTAMPTZ,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'freelancer', 'client', 'admin', 'superadmin')),
  oauth_provider TEXT,
  oauth_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  banned_reason TEXT,
  banned_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id) WHERE deleted_at IS NULL;

-- Create trigger function for updated_at
CREATE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Create privilege escalation prevention
CREATE FUNCTION prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF current_setting('request.jwt.claims', true) IS NULL THEN
    RETURN NEW;
  END IF;

  IF current_setting('request.jwt.claims', true)::json->>'role' = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF OLD.id::text = current_setting('request.jwt.claims', true)::json->>'sub' THEN
    IF NEW.role != OLD.role THEN
      RAISE EXCEPTION 'Cannot change own role';
    END IF;
    IF NEW.is_active != OLD.is_active THEN
      RAISE EXCEPTION 'Cannot change own active status';
    END IF;
    IF NEW.is_banned != OLD.is_banned THEN
      RAISE EXCEPTION 'Cannot change own banned status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_self_escalation_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_privilege_escalation();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY users_select_own
  ON users FOR SELECT
  USING (auth.uid()::text = id::text OR role IN ('admin', 'superadmin'));

CREATE POLICY users_update_own
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY users_insert_signup
  ON users FOR INSERT
  WITH CHECK (true);

-- User profiles table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  company TEXT,
  job_title TEXT,
  industry TEXT,
  website TEXT,
  phone TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  linkedin_url TEXT,
  twitter_url TEXT,
  github_url TEXT,
  portfolio_url TEXT,
  language TEXT DEFAULT 'en',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  notifications_enabled BOOLEAN DEFAULT TRUE,
  marketing_emails_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_select_own
  ON user_profiles FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_update_own
  ON user_profiles FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY user_profiles_insert_own
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON email_verification_tokens(token);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);

-- Session logs
CREATE TABLE session_logs (
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

CREATE INDEX idx_session_logs_user_id ON session_logs(user_id);
CREATE INDEX idx_session_logs_created_at ON session_logs(created_at);

-- Auto-create profile trigger
CREATE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Session logging function
CREATE FUNCTION log_session_activity(
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

-- Grant permissions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
    GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL ON users TO service_role;
    GRANT ALL ON user_profiles TO service_role;
    GRANT ALL ON email_verification_tokens TO service_role;
    GRANT ALL ON password_reset_tokens TO service_role;
    GRANT ALL ON session_logs TO service_role;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  user_count INTEGER;
  profile_count INTEGER;
BEGIN
  -- Check for tables in the PUBLIC schema specifically
  SELECT COUNT(*) INTO user_count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'users';

  SELECT COUNT(*) INTO profile_count FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'user_profiles';

  IF user_count >= 1 AND profile_count >= 1 THEN
    RAISE NOTICE '✅ MIGRATION SUCCESSFUL!';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '  ✓ users';
    RAISE NOTICE '  ✓ user_profiles';
    RAISE NOTICE '  ✓ email_verification_tokens';
    RAISE NOTICE '  ✓ password_reset_tokens';
    RAISE NOTICE '  ✓ session_logs';
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '✨ Ready for authentication!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test it:';
    RAISE NOTICE '   Visit: http://localhost:9323/api/auth/test-db';
  ELSE
    RAISE NOTICE '⚠️ Tables may already exist or creation was skipped';
    RAISE NOTICE 'Users found: %', user_count;
    RAISE NOTICE 'Profiles found: %', profile_count;
  END IF;
END $$;
