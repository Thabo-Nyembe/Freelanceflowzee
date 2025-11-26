-- ============================================================================
-- STORAGE MANAGEMENT SYSTEM - SUPABASE MIGRATION
-- Multi-cloud file storage and management
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE storage_provider AS ENUM (
  'aws',
  'google',
  'azure',
  'dropbox',
  'local'
);

CREATE TYPE file_type AS ENUM (
  'document',
  'image',
  'video',
  'audio',
  'archive',
  'code',
  'other'
);

CREATE TYPE file_status AS ENUM (
  'synced',
  'syncing',
  'error',
  'offline'
);

CREATE TYPE sharing_permission AS ENUM (
  'view',
  'edit',
  'admin'
);

-- ============================================================================
-- TABLE: storage_files
-- ============================================================================

CREATE TABLE storage_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type file_type NOT NULL DEFAULT 'other',
  size BIGINT NOT NULL,
  provider storage_provider NOT NULL DEFAULT 'local',
  status file_status NOT NULL DEFAULT 'synced',
  path TEXT NOT NULL,
  extension TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  checksum TEXT NOT NULL,
  thumbnail TEXT,
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  version INTEGER DEFAULT 1,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  modified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accessed_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: storage_folders
-- ============================================================================

CREATE TABLE storage_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  provider storage_provider NOT NULL DEFAULT 'local',
  parent_id UUID REFERENCES storage_folders(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: storage_shares
-- ============================================================================

CREATE TABLE storage_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with TEXT NOT NULL,
  permission sharing_permission NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: file_versions
-- ============================================================================

CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  size BIGINT NOT NULL,
  checksum TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(file_id, version)
);

-- ============================================================================
-- TABLE: storage_quotas
-- ============================================================================

CREATE TABLE storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_quota BIGINT NOT NULL DEFAULT 10737418240, -- 10GB default
  used_space BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: storage_providers
-- ============================================================================

CREATE TABLE storage_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider storage_provider NOT NULL,
  enabled BOOLEAN DEFAULT true,
  max_file_size BIGINT DEFAULT 104857600, -- 100MB default
  api_key TEXT,
  region TEXT,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- ============================================================================
-- TABLE: file_activity_log
-- ============================================================================

CREATE TABLE file_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: file_downloads
-- ============================================================================

CREATE TABLE file_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES storage_files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- storage_files indexes
CREATE INDEX idx_storage_files_user_id ON storage_files(user_id);
CREATE INDEX idx_storage_files_provider ON storage_files(provider);
CREATE INDEX idx_storage_files_type ON storage_files(type);
CREATE INDEX idx_storage_files_status ON storage_files(status);
CREATE INDEX idx_storage_files_is_public ON storage_files(is_public);
CREATE INDEX idx_storage_files_uploaded_at ON storage_files(uploaded_at DESC);
CREATE INDEX idx_storage_files_size ON storage_files(size DESC);
CREATE INDEX idx_storage_files_download_count ON storage_files(download_count DESC);
CREATE INDEX idx_storage_files_tags ON storage_files USING gin(tags);
CREATE INDEX idx_storage_files_name_trgm ON storage_files USING gin(name gin_trgm_ops);
CREATE INDEX idx_storage_files_path_trgm ON storage_files USING gin(path gin_trgm_ops);
CREATE INDEX idx_storage_files_user_provider ON storage_files(user_id, provider);
CREATE INDEX idx_storage_files_user_type ON storage_files(user_id, type);
CREATE INDEX idx_storage_files_checksum ON storage_files(checksum);

-- storage_folders indexes
CREATE INDEX idx_storage_folders_user_id ON storage_folders(user_id);
CREATE INDEX idx_storage_folders_provider ON storage_folders(provider);
CREATE INDEX idx_storage_folders_parent_id ON storage_folders(parent_id);
CREATE INDEX idx_storage_folders_path ON storage_folders(path);
CREATE INDEX idx_storage_folders_created_at ON storage_folders(created_at DESC);

-- storage_shares indexes
CREATE INDEX idx_storage_shares_file_id ON storage_shares(file_id);
CREATE INDEX idx_storage_shares_shared_by ON storage_shares(shared_by);
CREATE INDEX idx_storage_shares_shared_with ON storage_shares(shared_with);
CREATE INDEX idx_storage_shares_expires_at ON storage_shares(expires_at);
CREATE INDEX idx_storage_shares_created_at ON storage_shares(created_at DESC);

-- file_versions indexes
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_version ON file_versions(version DESC);
CREATE INDEX idx_file_versions_uploaded_by ON file_versions(uploaded_by);
CREATE INDEX idx_file_versions_uploaded_at ON file_versions(uploaded_at DESC);

-- storage_quotas indexes
CREATE INDEX idx_storage_quotas_user_id ON storage_quotas(user_id);

-- storage_providers indexes
CREATE INDEX idx_storage_providers_user_id ON storage_providers(user_id);
CREATE INDEX idx_storage_providers_provider ON storage_providers(provider);
CREATE INDEX idx_storage_providers_enabled ON storage_providers(enabled);

-- file_activity_log indexes
CREATE INDEX idx_file_activity_log_file_id ON file_activity_log(file_id);
CREATE INDEX idx_file_activity_log_user_id ON file_activity_log(user_id);
CREATE INDEX idx_file_activity_log_action ON file_activity_log(action);
CREATE INDEX idx_file_activity_log_created_at ON file_activity_log(created_at DESC);

-- file_downloads indexes
CREATE INDEX idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX idx_file_downloads_downloaded_at ON file_downloads(downloaded_at DESC);

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

-- storage_files policies
CREATE POLICY "Users can view their own files"
  ON storage_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public files"
  ON storage_files FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view shared files"
  ON storage_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM storage_shares
    WHERE storage_shares.file_id = storage_files.id
    AND storage_shares.shared_with = (SELECT email FROM auth.users WHERE id = auth.uid())
  ));

CREATE POLICY "Users can create their own files"
  ON storage_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own files"
  ON storage_files FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON storage_files FOR DELETE
  USING (auth.uid() = user_id);

-- storage_folders policies
CREATE POLICY "Users can view their own folders"
  ON storage_folders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders"
  ON storage_folders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders"
  ON storage_folders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders"
  ON storage_folders FOR DELETE
  USING (auth.uid() = user_id);

-- storage_shares policies
CREATE POLICY "Users can view shares they created"
  ON storage_shares FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can view shares for their files"
  ON storage_shares FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM storage_files
    WHERE storage_files.id = storage_shares.file_id
    AND storage_files.user_id = auth.uid()
  ));

CREATE POLICY "Users can create shares for their files"
  ON storage_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

CREATE POLICY "Users can delete shares they created"
  ON storage_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- file_versions policies
CREATE POLICY "Users can view versions of accessible files"
  ON file_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM storage_files
    WHERE storage_files.id = file_versions.file_id
    AND (
      storage_files.user_id = auth.uid()
      OR storage_files.is_public = true
      OR EXISTS (
        SELECT 1 FROM storage_shares
        WHERE storage_shares.file_id = storage_files.id
        AND storage_shares.shared_with = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  ));

-- storage_quotas policies
CREATE POLICY "Users can view their own quota"
  ON storage_quotas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quota"
  ON storage_quotas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quota"
  ON storage_quotas FOR UPDATE
  USING (auth.uid() = user_id);

-- storage_providers policies
CREATE POLICY "Users can view their own providers"
  ON storage_providers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own providers"
  ON storage_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own providers"
  ON storage_providers FOR UPDATE
  USING (auth.uid() = user_id);

-- file_activity_log policies
CREATE POLICY "Users can view activity for their files"
  ON file_activity_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM storage_files
    WHERE storage_files.id = file_activity_log.file_id
    AND storage_files.user_id = auth.uid()
  ));

-- file_downloads policies
CREATE POLICY "Users can view downloads for their files"
  ON file_downloads FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM storage_files
    WHERE storage_files.id = file_downloads.file_id
    AND storage_files.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update modified_at timestamp
CREATE OR REPLACE FUNCTION update_modified_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_storage_files_modified_at
  BEFORE UPDATE ON storage_files
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_storage_folders_updated_at
  BEFORE UPDATE ON storage_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at_column();

CREATE TRIGGER update_storage_providers_updated_at
  BEFORE UPDATE ON storage_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at_column();

-- Update download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE storage_files
  SET download_count = download_count + 1
  WHERE id = NEW.file_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON file_downloads
  FOR EACH ROW
  EXECUTE FUNCTION increment_download_count();

-- Update storage quota
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO storage_quotas (user_id, used_space, file_count)
    VALUES (NEW.user_id, NEW.size, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      used_space = storage_quotas.used_space + NEW.size,
      file_count = storage_quotas.file_count + 1,
      last_updated = now();
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE storage_quotas
    SET
      used_space = GREATEST(0, used_space - OLD.size),
      file_count = GREATEST(0, file_count - 1),
      last_updated = now()
    WHERE user_id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_storage_quota
  AFTER INSERT OR DELETE ON storage_files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_quota();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's files with stats
CREATE OR REPLACE FUNCTION get_user_files_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type file_type,
  size BIGINT,
  provider storage_provider,
  status file_status,
  download_count INTEGER,
  share_count BIGINT,
  version INTEGER,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.id,
    sf.name,
    sf.type,
    sf.size,
    sf.provider,
    sf.status,
    sf.download_count,
    COUNT(DISTINCT ss.id) as share_count,
    sf.version,
    sf.uploaded_at
  FROM storage_files sf
  LEFT JOIN storage_shares ss ON ss.file_id = sf.id
  WHERE sf.user_id = p_user_id
  GROUP BY sf.id
  ORDER BY sf.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search files
CREATE OR REPLACE FUNCTION search_user_files(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type file_type,
  size BIGINT,
  uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.id,
    sf.name,
    sf.type,
    sf.size,
    sf.uploaded_at
  FROM storage_files sf
  WHERE sf.user_id = p_user_id
    AND (
      sf.name ILIKE '%' || p_search_term || '%'
      OR sf.path ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(sf.tags)
    )
  ORDER BY sf.uploaded_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate storage usage
CREATE OR REPLACE FUNCTION calculate_storage_usage(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'totalFiles', COUNT(*),
    'totalSize', COALESCE(SUM(size), 0),
    'byProvider', json_build_object(
      'aws', COUNT(*) FILTER (WHERE provider = 'aws'),
      'google', COUNT(*) FILTER (WHERE provider = 'google'),
      'azure', COUNT(*) FILTER (WHERE provider = 'azure'),
      'dropbox', COUNT(*) FILTER (WHERE provider = 'dropbox'),
      'local', COUNT(*) FILTER (WHERE provider = 'local')
    ),
    'byType', json_build_object(
      'document', COUNT(*) FILTER (WHERE type = 'document'),
      'image', COUNT(*) FILTER (WHERE type = 'image'),
      'video', COUNT(*) FILTER (WHERE type = 'video'),
      'audio', COUNT(*) FILTER (WHERE type = 'audio'),
      'archive', COUNT(*) FILTER (WHERE type = 'archive'),
      'code', COUNT(*) FILTER (WHERE type = 'code'),
      'other', COUNT(*) FILTER (WHERE type = 'other')
    )
  ) INTO v_result
  FROM storage_files
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get popular files
CREATE OR REPLACE FUNCTION get_popular_files(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  download_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.id,
    sf.name,
    sf.download_count
  FROM storage_files sf
  WHERE sf.user_id = p_user_id
  ORDER BY sf.download_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get shared files
CREATE OR REPLACE FUNCTION get_shared_files(p_user_email TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type file_type,
  size BIGINT,
  shared_by_email TEXT,
  permission sharing_permission,
  shared_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sf.id,
    sf.name,
    sf.type,
    sf.size,
    (SELECT email FROM auth.users WHERE id = ss.shared_by) as shared_by_email,
    ss.permission,
    ss.created_at as shared_at
  FROM storage_files sf
  JOIN storage_shares ss ON ss.file_id = sf.id
  WHERE ss.shared_with = p_user_email
  ORDER BY ss.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
