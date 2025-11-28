-- ============================================================================
-- STORAGE MANAGEMENT SYSTEM - SAFE MIGRATION
-- Multi-cloud file storage and management
-- This version uses DROP TYPE IF EXISTS to avoid conflicts
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS - Drop and recreate to ensure clean state
-- ============================================================================

DROP TYPE IF EXISTS storage_provider CASCADE;
CREATE TYPE storage_provider AS ENUM (
  'aws',
  'google',
  'azure',
  'dropbox',
  'local'
);

DROP TYPE IF EXISTS file_type CASCADE;
CREATE TYPE file_type AS ENUM (
  'document',
  'image',
  'video',
  'audio',
  'archive',
  'code',
  'other'
);

DROP TYPE IF EXISTS file_status CASCADE;
CREATE TYPE file_status AS ENUM (
  'synced',
  'syncing',
  'error',
  'offline'
);

DROP TYPE IF EXISTS sharing_permission CASCADE;
CREATE TYPE sharing_permission AS ENUM (
  'view',
  'edit',
  'admin'
);

-- ============================================================================
-- TABLE: storage_files
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES storage_folders(id) ON DELETE SET NULL,

  -- File Details
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type file_type NOT NULL DEFAULT 'other',
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,

  -- Storage
  storage_provider storage_provider NOT NULL DEFAULT 'local',
  storage_path TEXT NOT NULL,
  status file_status NOT NULL DEFAULT 'synced',

  -- Security
  is_public BOOLEAN DEFAULT false,
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key TEXT,

  -- Media
  thumbnail_url TEXT,

  -- Tracking
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Organization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: storage_folders
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES storage_folders(id) ON DELETE CASCADE,

  -- Folder Details
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  icon TEXT,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,

  -- Stats
  total_files INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: storage_shares
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID REFERENCES storage_files(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES storage_folders(id) ON DELETE CASCADE,

  -- Sharing Details
  shared_with_email TEXT NOT NULL,
  permission sharing_permission NOT NULL DEFAULT 'view',

  -- Expiry & Security
  expires_at TIMESTAMPTZ,
  password TEXT,

  -- Tracking
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure either file_id or folder_id is set
  CHECK (
    (file_id IS NOT NULL AND folder_id IS NULL) OR
    (file_id IS NULL AND folder_id IS NOT NULL)
  )
);

-- ============================================================================
-- TABLE: file_versions
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,

  -- Version Details
  version_number INTEGER NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  checksum TEXT NOT NULL,

  -- Tracking
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: storage_quotas
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Quota Details
  total_quota BIGINT NOT NULL DEFAULT 5368709120, -- 5GB default
  used_space BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,

  -- Tracking
  last_calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id)
);

-- ============================================================================
-- TABLE: storage_providers
-- ============================================================================

CREATE TABLE IF NOT EXISTS storage_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Provider Details
  provider storage_provider NOT NULL,
  provider_name TEXT NOT NULL,

  -- Credentials (encrypted)
  access_key TEXT NOT NULL,
  secret_key TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  region TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: file_activity_log
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,

  -- Activity Details
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE: file_downloads
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Download Details
  download_time INTEGER, -- milliseconds

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_storage_files_user_id ON storage_files(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_folder_id ON storage_files(folder_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_file_type ON storage_files(file_type);
CREATE INDEX IF NOT EXISTS idx_storage_files_storage_provider ON storage_files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_storage_files_tags ON storage_files USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_storage_folders_user_id ON storage_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_folders_parent_id ON storage_folders(parent_id);

CREATE INDEX IF NOT EXISTS idx_storage_shares_file_id ON storage_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_storage_shares_folder_id ON storage_shares(folder_id);
CREATE INDEX IF NOT EXISTS idx_storage_shares_user_id ON storage_shares(user_id);

CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);

CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON storage_quotas(user_id);

CREATE INDEX IF NOT EXISTS idx_storage_providers_user_id ON storage_providers(user_id);

CREATE INDEX IF NOT EXISTS idx_file_activity_log_file_id ON file_activity_log(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_log_user_id ON file_activity_log(user_id);

CREATE INDEX IF NOT EXISTS idx_file_downloads_file_id ON file_downloads(file_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE storage_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;

-- Storage Files Policies
CREATE POLICY "Users can view their own files" ON storage_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own files" ON storage_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own files" ON storage_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own files" ON storage_files FOR DELETE USING (auth.uid() = user_id);

-- Storage Folders Policies
CREATE POLICY "Users can view their own folders" ON storage_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own folders" ON storage_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders" ON storage_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders" ON storage_folders FOR DELETE USING (auth.uid() = user_id);

-- Storage Shares Policies
CREATE POLICY "Users can view their own shares" ON storage_shares FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create shares" ON storage_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own shares" ON storage_shares FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own shares" ON storage_shares FOR DELETE USING (auth.uid() = user_id);

-- File Versions Policies
CREATE POLICY "Users can view versions of their files" ON file_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM storage_files WHERE storage_files.id = file_versions.file_id AND storage_files.user_id = auth.uid())
);
CREATE POLICY "Users can create versions" ON file_versions FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can delete versions" ON file_versions FOR DELETE USING (auth.uid() = created_by);

-- Storage Quotas Policies
CREATE POLICY "Users can view their own quota" ON storage_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own quota" ON storage_quotas FOR UPDATE USING (auth.uid() = user_id);

-- Storage Providers Policies
CREATE POLICY "Users can manage their own providers" ON storage_providers FOR ALL USING (auth.uid() = user_id);

-- File Activity Log Policies
CREATE POLICY "Users can view their own activity" ON file_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can log activity" ON file_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- File Downloads Policies
CREATE POLICY "Users can view download logs" ON file_downloads FOR SELECT USING (
  EXISTS (SELECT 1 FROM storage_files WHERE storage_files.id = file_downloads.file_id AND storage_files.user_id = auth.uid())
);
CREATE POLICY "Anyone can log downloads" ON file_downloads FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update folder stats
CREATE OR REPLACE FUNCTION update_folder_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE storage_folders
    SET
      total_files = total_files + 1,
      total_size = total_size + NEW.size
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storage_folders
    SET
      total_files = total_files - 1,
      total_size = total_size - OLD.size
    WHERE id = OLD.folder_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.folder_id != OLD.folder_id THEN
    -- Remove from old folder
    UPDATE storage_folders
    SET
      total_files = total_files - 1,
      total_size = total_size - OLD.size
    WHERE id = OLD.folder_id;
    -- Add to new folder
    UPDATE storage_folders
    SET
      total_files = total_files + 1,
      total_size = total_size + NEW.size
    WHERE id = NEW.folder_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for folder stats
DROP TRIGGER IF EXISTS trigger_update_folder_stats ON storage_files;
CREATE TRIGGER trigger_update_folder_stats
AFTER INSERT OR UPDATE OR DELETE ON storage_files
FOR EACH ROW EXECUTE FUNCTION update_folder_stats();

-- Function to initialize user quota
CREATE OR REPLACE FUNCTION initialize_user_quota()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO storage_quotas (user_id, total_quota, used_space, file_count)
  VALUES (NEW.id, 5368709120, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create quota for new users
DROP TRIGGER IF EXISTS trigger_initialize_user_quota ON auth.users;
CREATE TRIGGER trigger_initialize_user_quota
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION initialize_user_quota();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE storage_files IS 'File records with multi-cloud storage support';
COMMENT ON TABLE storage_folders IS 'Folder hierarchy for organizing files';
COMMENT ON TABLE storage_shares IS 'File and folder sharing with permissions';
COMMENT ON TABLE file_versions IS 'File version history tracking';
COMMENT ON TABLE storage_quotas IS 'User storage quota management';
COMMENT ON TABLE storage_providers IS 'Cloud storage provider configurations';
COMMENT ON TABLE file_activity_log IS 'Audit log for file activities';
COMMENT ON TABLE file_downloads IS 'Download tracking and analytics';
