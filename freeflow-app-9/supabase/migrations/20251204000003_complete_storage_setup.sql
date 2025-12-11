-- Complete Cloud Storage Integration Setup
-- This migration consolidates all storage-related tables and ensures A+++ quality

-- ============================================================================
-- 1. OAUTH USER PROFILES (from 20251204000000_oauth_user_profiles.sql)
-- ============================================================================

-- OAuth User Profiles Table
CREATE TABLE IF NOT EXISTS oauth_user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'apple', 'facebook', 'twitter')),
  provider_user_id TEXT NOT NULL,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider),
  UNIQUE(provider, provider_user_id)
);

-- Enable RLS
ALTER TABLE oauth_user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for oauth_user_profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'oauth_user_profiles' AND policyname = 'Users can view own OAuth profiles'
  ) THEN
    CREATE POLICY "Users can view own OAuth profiles"
      ON oauth_user_profiles FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'oauth_user_profiles' AND policyname = 'Users can insert own OAuth profiles'
  ) THEN
    CREATE POLICY "Users can insert own OAuth profiles"
      ON oauth_user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'oauth_user_profiles' AND policyname = 'Users can update own OAuth profiles'
  ) THEN
    CREATE POLICY "Users can update own OAuth profiles"
      ON oauth_user_profiles FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'oauth_user_profiles' AND policyname = 'Users can delete own OAuth profiles'
  ) THEN
    CREATE POLICY "Users can delete own OAuth profiles"
      ON oauth_user_profiles FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for oauth_user_profiles
CREATE INDEX IF NOT EXISTS idx_oauth_user_profiles_user_id ON oauth_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_user_profiles_provider ON oauth_user_profiles(provider);

-- ============================================================================
-- 2. STORAGE CONNECTIONS (from 20251204000001_storage_connections.sql)
-- ============================================================================

-- Storage Connections Table
CREATE TABLE IF NOT EXISTS storage_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google-drive', 'dropbox', 'onedrive', 'box', 'icloud', 'local')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  account_email TEXT,
  account_name TEXT,
  total_space BIGINT DEFAULT 0,
  used_space BIGINT DEFAULT 0,
  connected BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Storage Files Cache Table
CREATE TABLE IF NOT EXISTS storage_files_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES storage_connections(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT,
  is_folder BOOLEAN DEFAULT false,
  parent_id TEXT,
  thumbnail_url TEXT,
  web_view_url TEXT,
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, file_id)
);

-- Enable RLS
ALTER TABLE storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storage_connections
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_connections' AND policyname = 'Users can view own storage connections'
  ) THEN
    CREATE POLICY "Users can view own storage connections"
      ON storage_connections FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_connections' AND policyname = 'Users can insert own storage connections'
  ) THEN
    CREATE POLICY "Users can insert own storage connections"
      ON storage_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_connections' AND policyname = 'Users can update own storage connections'
  ) THEN
    CREATE POLICY "Users can update own storage connections"
      ON storage_connections FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_connections' AND policyname = 'Users can delete own storage connections'
  ) THEN
    CREATE POLICY "Users can delete own storage connections"
      ON storage_connections FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for storage_files_cache
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_files_cache' AND policyname = 'Users can view own cached files'
  ) THEN
    CREATE POLICY "Users can view own cached files"
      ON storage_files_cache FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM storage_connections
          WHERE storage_connections.id = storage_files_cache.connection_id
          AND storage_connections.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_files_cache' AND policyname = 'Users can insert own cached files'
  ) THEN
    CREATE POLICY "Users can insert own cached files"
      ON storage_files_cache FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM storage_connections
          WHERE storage_connections.id = storage_files_cache.connection_id
          AND storage_connections.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_files_cache' AND policyname = 'Users can update own cached files'
  ) THEN
    CREATE POLICY "Users can update own cached files"
      ON storage_files_cache FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM storage_connections
          WHERE storage_connections.id = storage_files_cache.connection_id
          AND storage_connections.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'storage_files_cache' AND policyname = 'Users can delete own cached files'
  ) THEN
    CREATE POLICY "Users can delete own cached files"
      ON storage_files_cache FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM storage_connections
          WHERE storage_connections.id = storage_files_cache.connection_id
          AND storage_connections.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Indexes for storage_connections
CREATE INDEX IF NOT EXISTS idx_storage_connections_user_id ON storage_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_connections_provider ON storage_connections(provider);
CREATE INDEX IF NOT EXISTS idx_storage_connections_connected ON storage_connections(connected);

-- Indexes for storage_files_cache
CREATE INDEX IF NOT EXISTS idx_storage_files_cache_connection_id ON storage_files_cache(connection_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_cache_file_name ON storage_files_cache(file_name);
CREATE INDEX IF NOT EXISTS idx_storage_files_cache_parent_id ON storage_files_cache(parent_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_cache_is_folder ON storage_files_cache(is_folder);

-- Full-text search on file names
CREATE INDEX IF NOT EXISTS idx_storage_files_cache_file_name_trgm ON storage_files_cache USING gin (file_name gin_trgm_ops);

-- ============================================================================
-- 3. USER PREFERENCES (from 20251204000002_user_preferences.sql)
-- ============================================================================

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_onboarding_completed BOOLEAN DEFAULT false,
  storage_onboarding_completed_at TIMESTAMPTZ,
  storage_onboarding_skipped BOOLEAN DEFAULT false,
  files_view_mode TEXT DEFAULT 'grid' CHECK (files_view_mode IN ('grid', 'list')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  auto_sync_enabled BOOLEAN DEFAULT true,
  cache_files_locally BOOLEAN DEFAULT true,
  show_hidden_files BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view own preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences"
      ON user_preferences FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can insert own preferences'
  ) THEN
    CREATE POLICY "Users can insert own preferences"
      ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update own preferences'
  ) THEN
    CREATE POLICY "Users can update own preferences"
      ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can delete own preferences'
  ) THEN
    CREATE POLICY "Users can delete own preferences"
      ON user_preferences FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================================
-- 4. UTILITY FUNCTIONS
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_oauth_user_profiles_updated_at ON oauth_user_profiles;
CREATE TRIGGER trigger_update_oauth_user_profiles_updated_at
  BEFORE UPDATE ON oauth_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_storage_connections_updated_at ON storage_connections;
CREATE TRIGGER trigger_update_storage_connections_updated_at
  BEFORE UPDATE ON storage_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE oauth_user_profiles IS 'Stores OAuth authentication profiles for third-party providers';
COMMENT ON TABLE storage_connections IS 'Stores cloud storage provider connections with OAuth tokens';
COMMENT ON TABLE storage_files_cache IS 'Caches file metadata from cloud storage providers for performance';
COMMENT ON TABLE user_preferences IS 'Stores user preferences and onboarding completion status';

COMMENT ON COLUMN storage_connections.provider IS 'Cloud storage provider: google-drive, dropbox, onedrive, box, icloud, or local';
COMMENT ON COLUMN storage_connections.access_token IS 'OAuth access token for API access';
COMMENT ON COLUMN storage_connections.refresh_token IS 'OAuth refresh token for renewing access';
COMMENT ON COLUMN storage_connections.connected IS 'Whether the connection is currently active';
COMMENT ON COLUMN storage_connections.last_sync IS 'Timestamp of last successful file sync';

COMMENT ON COLUMN user_preferences.storage_onboarding_completed IS 'Whether user has completed storage onboarding wizard';
COMMENT ON COLUMN user_preferences.storage_onboarding_skipped IS 'Whether user skipped the onboarding wizard';
COMMENT ON COLUMN user_preferences.files_view_mode IS 'Preferred view mode for file browsing (grid or list)';
COMMENT ON COLUMN user_preferences.auto_sync_enabled IS 'Whether to automatically sync files from cloud providers';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
