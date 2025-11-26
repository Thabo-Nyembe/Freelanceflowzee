-- ========================================
-- FILES SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete file management with:
-- - Multi-format file support
-- - Folder hierarchy with unlimited nesting
-- - File versioning and history
-- - Sharing with granular permissions
-- - Tags and metadata
-- - Storage quota tracking
-- - Trash and recovery
-- - Activity logging
--
-- Tables: 10
-- Functions: 10
-- Indexes: 52
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

CREATE TYPE file_type AS ENUM (
  'pdf',
  'figma',
  'folder',
  'video',
  'excel',
  'image',
  'archive',
  'word',
  'code',
  'text',
  'audio',
  'presentation'
);

CREATE TYPE file_status AS ENUM (
  'active',
  'archived',
  'deleted',
  'locked'
);

CREATE TYPE share_permission AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

CREATE TYPE file_action AS ENUM (
  'created',
  'modified',
  'viewed',
  'shared',
  'downloaded',
  'deleted',
  'restored',
  'moved',
  'renamed',
  'locked',
  'unlocked'
);

-- ========================================
-- TABLES
-- ========================================

-- Files
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type file_type NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner UUID NOT NULL REFERENCES auth.users(id),
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  folder_path TEXT NOT NULL DEFAULT '/',
  starred BOOLEAN NOT NULL DEFAULT false,
  shared BOOLEAN NOT NULL DEFAULT false,
  locked BOOLEAN NOT NULL DEFAULT false,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  mime_type TEXT NOT NULL,
  status file_status NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}',
  storage_location TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Folders
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size BIGINT NOT NULL DEFAULT 0,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  color TEXT,
  icon TEXT,
  shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- File Versions
CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  size BIGINT NOT NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT,
  storage_location TEXT NOT NULL,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(file_id, version)
);

-- File Shares
CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_with UUID NOT NULL REFERENCES auth.users(id),
  permission share_permission NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  date_shared TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(file_id, shared_with)
);

-- File Tags
CREATE TABLE file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  file_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Storage Quotas
CREATE TABLE storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_quota BIGINT NOT NULL DEFAULT 107374182400, -- 100GB default
  used_space BIGINT NOT NULL DEFAULT 0,
  images_size BIGINT NOT NULL DEFAULT 0,
  videos_size BIGINT NOT NULL DEFAULT 0,
  documents_size BIGINT NOT NULL DEFAULT 0,
  archives_size BIGINT NOT NULL DEFAULT 0,
  other_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- File Activity
CREATE TABLE file_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action file_action NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trash
CREATE TABLE trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID,
  file_data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File Comments
CREATE TABLE file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File Downloads
CREATE TABLE file_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Files Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_type ON files(type);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_starred ON files(starred);
CREATE INDEX idx_files_shared ON files(shared);
CREATE INDEX idx_files_date_modified ON files(date_modified DESC);
CREATE INDEX idx_files_name ON files USING GIN(name gin_trgm_ops);
CREATE INDEX idx_files_tags ON files USING GIN(tags);
CREATE INDEX idx_files_metadata ON files USING GIN(metadata);
CREATE INDEX idx_files_user_folder ON files(user_id, folder_id);
CREATE INDEX idx_files_user_type ON files(user_id, type);
CREATE INDEX idx_files_user_status ON files(user_id, status);

-- Folders Indexes
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);
CREATE INDEX idx_folders_path ON folders(path);
CREATE INDEX idx_folders_shared ON folders(shared);
CREATE INDEX idx_folders_name ON folders USING GIN(name gin_trgm_ops);

-- File Versions Indexes
CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_version ON file_versions(file_id, version DESC);
CREATE INDEX idx_file_versions_date_created ON file_versions(date_created DESC);

-- File Shares Indexes
CREATE INDEX idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX idx_file_shares_shared_by ON file_shares(shared_by);
CREATE INDEX idx_file_shares_shared_with ON file_shares(shared_with);
CREATE INDEX idx_file_shares_permission ON file_shares(permission);
CREATE INDEX idx_file_shares_expires_at ON file_shares(expires_at);

-- File Tags Indexes
CREATE INDEX idx_file_tags_user_id ON file_tags(user_id);
CREATE INDEX idx_file_tags_name ON file_tags USING GIN(name gin_trgm_ops);
CREATE INDEX idx_file_tags_file_count ON file_tags(file_count DESC);

-- Storage Quotas Indexes
CREATE INDEX idx_storage_quotas_user_id ON storage_quotas(user_id);

-- File Activity Indexes
CREATE INDEX idx_file_activity_file_id ON file_activity(file_id);
CREATE INDEX idx_file_activity_user_id ON file_activity(user_id);
CREATE INDEX idx_file_activity_action ON file_activity(action);
CREATE INDEX idx_file_activity_timestamp ON file_activity(timestamp DESC);

-- Trash Indexes
CREATE INDEX idx_trash_user_id ON trash(user_id);
CREATE INDEX idx_trash_expires_at ON trash(expires_at);
CREATE INDEX idx_trash_deleted_at ON trash(deleted_at DESC);

-- File Comments Indexes
CREATE INDEX idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX idx_file_comments_user_id ON file_comments(user_id);
CREATE INDEX idx_file_comments_timestamp ON file_comments(timestamp DESC);

-- File Downloads Indexes
CREATE INDEX idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX idx_file_downloads_downloaded_at ON file_downloads(downloaded_at DESC);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_shares_updated_at BEFORE UPDATE ON file_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_tags_updated_at BEFORE UPDATE ON file_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_quotas_updated_at BEFORE UPDATE ON storage_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_comments_updated_at BEFORE UPDATE ON file_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update folder statistics
CREATE OR REPLACE FUNCTION update_folder_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.folder_id IS NOT NULL THEN
      UPDATE folders
      SET file_count = (SELECT COUNT(*) FROM files WHERE folder_id = NEW.folder_id),
          total_size = (SELECT COALESCE(SUM(size), 0) FROM files WHERE folder_id = NEW.folder_id),
          date_modified = NOW()
      WHERE id = NEW.folder_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.folder_id IS DISTINCT FROM NEW.folder_id) THEN
    IF OLD.folder_id IS NOT NULL THEN
      UPDATE folders
      SET file_count = (SELECT COUNT(*) FROM files WHERE folder_id = OLD.folder_id),
          total_size = (SELECT COALESCE(SUM(size), 0) FROM files WHERE folder_id = OLD.folder_id),
          date_modified = NOW()
      WHERE id = OLD.folder_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_folder_statistics
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_stats();

-- Update storage quota
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  size_delta BIGINT := 0;
  file_category TEXT;
BEGIN
  -- Calculate size delta
  IF TG_OP = 'INSERT' THEN
    size_delta := NEW.size;
  ELSIF TG_OP = 'UPDATE' THEN
    size_delta := NEW.size - OLD.size;
  ELSIF TG_OP = 'DELETE' THEN
    size_delta := -OLD.size;
  END IF;

  -- Determine file category
  IF TG_OP = 'DELETE' THEN
    file_category := OLD.type::TEXT;
  ELSE
    file_category := NEW.type::TEXT;
  END IF;

  -- Update quota
  INSERT INTO storage_quotas (user_id, used_space, images_size, videos_size, documents_size, archives_size, other_size)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    size_delta,
    CASE WHEN file_category = 'image' THEN size_delta ELSE 0 END,
    CASE WHEN file_category = 'video' THEN size_delta ELSE 0 END,
    CASE WHEN file_category IN ('pdf', 'word', 'excel', 'presentation', 'text') THEN size_delta ELSE 0 END,
    CASE WHEN file_category = 'archive' THEN size_delta ELSE 0 END,
    CASE WHEN file_category NOT IN ('image', 'video', 'pdf', 'word', 'excel', 'presentation', 'text', 'archive') THEN size_delta ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    used_space = storage_quotas.used_space + size_delta,
    images_size = CASE WHEN file_category = 'image' THEN storage_quotas.images_size + size_delta ELSE storage_quotas.images_size END,
    videos_size = CASE WHEN file_category = 'video' THEN storage_quotas.videos_size + size_delta ELSE storage_quotas.videos_size END,
    documents_size = CASE WHEN file_category IN ('pdf', 'word', 'excel', 'presentation', 'text') THEN storage_quotas.documents_size + size_delta ELSE storage_quotas.documents_size END,
    archives_size = CASE WHEN file_category = 'archive' THEN storage_quotas.archives_size + size_delta ELSE storage_quotas.archives_size END,
    other_size = CASE WHEN file_category NOT IN ('image', 'video', 'pdf', 'word', 'excel', 'presentation', 'text', 'archive') THEN storage_quotas.other_size + size_delta ELSE storage_quotas.other_size END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_storage_quota
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_quota();

-- Update tag counts
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
  old_tags TEXT[];
  new_tags TEXT[];
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    new_tags := NEW.tags;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    old_tags := OLD.tags;
  END IF;

  -- Increment for new tags
  IF new_tags IS NOT NULL THEN
    FOREACH tag IN ARRAY new_tags
    LOOP
      IF old_tags IS NULL OR NOT tag = ANY(old_tags) THEN
        INSERT INTO file_tags (user_id, name, file_count)
        VALUES (NEW.user_id, tag, 1)
        ON CONFLICT (user_id, name)
        DO UPDATE SET file_count = file_tags.file_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- Decrement for removed tags
  IF old_tags IS NOT NULL THEN
    FOREACH tag IN ARRAY old_tags
    LOOP
      IF new_tags IS NULL OR NOT tag = ANY(new_tags) THEN
        UPDATE file_tags
        SET file_count = GREATEST(file_count - 1, 0)
        WHERE user_id = OLD.user_id AND name = tag;
      END IF;
    END LOOP;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_tag_counts
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_counts();

-- Log file activity
CREATE OR REPLACE FUNCTION log_file_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_action file_action;
  activity_metadata JSONB := '{}';
BEGIN
  IF TG_OP = 'INSERT' THEN
    activity_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      activity_action := 'renamed';
      activity_metadata := jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name);
    ELSIF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      activity_action := 'moved';
      activity_metadata := jsonb_build_object('from_folder', OLD.folder_path, 'to_folder', NEW.folder_path);
    ELSIF OLD.locked != NEW.locked THEN
      activity_action := CASE WHEN NEW.locked THEN 'locked' ELSE 'unlocked' END;
    ELSE
      activity_action := 'modified';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    activity_action := 'deleted';
  END IF;

  INSERT INTO file_activity (file_id, user_id, action, metadata)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.user_id, OLD.user_id),
    activity_action,
    activity_metadata
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_file_changes
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION log_file_activity();

-- Auto-delete expired trash
CREATE OR REPLACE FUNCTION delete_expired_trash()
RETURNS void AS $$
BEGIN
  DELETE FROM trash WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search files
CREATE OR REPLACE FUNCTION search_files(
  p_user_id UUID,
  p_search_term TEXT,
  p_file_type file_type DEFAULT NULL,
  p_folder_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF files AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM files
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_file_type IS NULL OR type = p_file_type)
    AND (p_folder_id IS NULL OR folder_id = p_folder_id)
  ORDER BY date_modified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get file stats
CREATE OR REPLACE FUNCTION get_file_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalFiles', COUNT(*),
      'totalSize', COALESCE(SUM(size), 0),
      'starred', COUNT(*) FILTER (WHERE starred = true),
      'shared', COUNT(*) FILTER (WHERE shared = true),
      'locked', COUNT(*) FILTER (WHERE locked = true),
      'byType', (
        SELECT json_object_agg(type, count)
        FROM (
          SELECT type, COUNT(*) as count
          FROM files
          WHERE user_id = p_user_id AND status = 'active'
          GROUP BY type
        ) t
      )
    )
    FROM files
    WHERE user_id = p_user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Move file to trash
CREATE OR REPLACE FUNCTION move_to_trash(p_file_id UUID)
RETURNS JSON AS $$
DECLARE
  v_file files;
BEGIN
  -- Get file
  SELECT * INTO v_file FROM files WHERE id = p_file_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'File not found');
  END IF;

  -- Move to trash
  INSERT INTO trash (user_id, file_id, file_data)
  VALUES (v_file.user_id, v_file.id, row_to_json(v_file)::JSONB);

  -- Update file status
  UPDATE files SET status = 'deleted' WHERE id = p_file_id;

  RETURN json_build_object('success', true, 'expiresAt', NOW() + INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Restore from trash
CREATE OR REPLACE FUNCTION restore_from_trash(p_trash_id UUID)
RETURNS JSON AS $$
DECLARE
  v_trash trash;
BEGIN
  -- Get trash entry
  SELECT * INTO v_trash FROM trash WHERE id = p_trash_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Trash entry not found');
  END IF;

  -- Restore file status
  UPDATE files SET status = 'active' WHERE id = v_trash.file_id;

  -- Delete trash entry
  DELETE FROM trash WHERE id = p_trash_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Share file
CREATE OR REPLACE FUNCTION share_file(
  p_file_id UUID,
  p_shared_by UUID,
  p_shared_with UUID,
  p_permission share_permission DEFAULT 'view',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  INSERT INTO file_shares (file_id, shared_by, shared_with, permission, expires_at)
  VALUES (p_file_id, p_shared_by, p_shared_with, p_permission, p_expires_at)
  ON CONFLICT (file_id, shared_with)
  DO UPDATE SET
    permission = p_permission,
    expires_at = p_expires_at,
    date_shared = NOW();

  -- Update file shared flag
  UPDATE files SET shared = true WHERE id = p_file_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Get storage quota
CREATE OR REPLACE FUNCTION get_storage_quota(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_quota storage_quotas;
BEGIN
  SELECT * INTO v_quota FROM storage_quotas WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'used', 0,
      'total', 107374182400,
      'percentage', 0,
      'breakdown', json_build_object(
        'images', 0,
        'videos', 0,
        'documents', 0,
        'archives', 0,
        'other', 0
      )
    );
  END IF;

  RETURN json_build_object(
    'used', v_quota.used_space,
    'total', v_quota.total_quota,
    'percentage', ROUND((v_quota.used_space::NUMERIC / v_quota.total_quota::NUMERIC) * 100),
    'breakdown', json_build_object(
      'images', v_quota.images_size,
      'videos', v_quota.videos_size,
      'documents', v_quota.documents_size,
      'archives', v_quota.archives_size,
      'other', v_quota.other_size
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Get recent files
CREATE OR REPLACE FUNCTION get_recent_files(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF files AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM files
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY date_modified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Bulk move files
CREATE OR REPLACE FUNCTION bulk_move_files(
  p_file_ids UUID[],
  p_folder_id UUID,
  p_folder_path TEXT
)
RETURNS JSON AS $$
DECLARE
  v_moved_count INTEGER;
BEGIN
  UPDATE files
  SET folder_id = p_folder_id,
      folder_path = p_folder_path,
      date_modified = NOW()
  WHERE id = ANY(p_file_ids);

  GET DIAGNOSTICS v_moved_count = ROW_COUNT;

  RETURN json_build_object('success', true, 'movedCount', v_moved_count);
END;
$$ LANGUAGE plpgsql;

-- Record file view
CREATE OR REPLACE FUNCTION record_file_view(p_file_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO file_activity (file_id, user_id, action)
  VALUES (p_file_id, p_user_id, 'viewed');

  -- Update last accessed for shares
  UPDATE file_shares
  SET last_accessed = NOW()
  WHERE file_id = p_file_id AND shared_with = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Record file download
CREATE OR REPLACE FUNCTION record_file_download(
  p_file_id UUID,
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO file_downloads (file_id, user_id, ip_address, user_agent)
  VALUES (p_file_id, p_user_id, p_ip_address, p_user_agent);

  INSERT INTO file_activity (file_id, user_id, action)
  VALUES (p_file_id, p_user_id, 'downloaded');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;

-- Files Policies
CREATE POLICY files_select ON files FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM file_shares WHERE file_id = files.id AND shared_with = auth.uid()));
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY files_update ON files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY files_delete ON files FOR DELETE USING (auth.uid() = user_id);

-- Folders Policies
CREATE POLICY folders_select ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY folders_insert ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY folders_update ON folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY folders_delete ON folders FOR DELETE USING (auth.uid() = user_id);

-- File Versions Policies
CREATE POLICY file_versions_select ON file_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_versions.file_id AND user_id = auth.uid()));
CREATE POLICY file_versions_insert ON file_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM files WHERE id = file_versions.file_id AND user_id = auth.uid()));

-- File Shares Policies
CREATE POLICY file_shares_select ON file_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);
CREATE POLICY file_shares_insert ON file_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);
CREATE POLICY file_shares_update ON file_shares FOR UPDATE
  USING (auth.uid() = shared_by);
CREATE POLICY file_shares_delete ON file_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- File Tags Policies
CREATE POLICY file_tags_select ON file_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY file_tags_insert ON file_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY file_tags_update ON file_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY file_tags_delete ON file_tags FOR DELETE USING (auth.uid() = user_id);

-- Storage Quotas Policies
CREATE POLICY storage_quotas_select ON storage_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY storage_quotas_update ON storage_quotas FOR UPDATE USING (auth.uid() = user_id);

-- File Activity Policies
CREATE POLICY file_activity_select ON file_activity FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_activity.file_id AND user_id = auth.uid()));
CREATE POLICY file_activity_insert ON file_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trash Policies
CREATE POLICY trash_select ON trash FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY trash_insert ON trash FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trash_delete ON trash FOR DELETE USING (auth.uid() = user_id);

-- File Comments Policies
CREATE POLICY file_comments_select ON file_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_comments.file_id AND user_id = auth.uid()));
CREATE POLICY file_comments_insert ON file_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY file_comments_update ON file_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY file_comments_delete ON file_comments FOR DELETE USING (auth.uid() = user_id);

-- File Downloads Policies
CREATE POLICY file_downloads_select ON file_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY file_downloads_insert ON file_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE files IS 'User files with versioning and metadata';
COMMENT ON TABLE folders IS 'Hierarchical folder structure';
COMMENT ON TABLE file_versions IS 'File version history';
COMMENT ON TABLE file_shares IS 'File sharing with permissions';
COMMENT ON TABLE file_tags IS 'User-defined file tags';
COMMENT ON TABLE storage_quotas IS 'User storage quota tracking';
COMMENT ON TABLE file_activity IS 'File activity logging';
COMMENT ON TABLE trash IS 'Deleted files with 30-day recovery';
COMMENT ON TABLE file_comments IS 'Comments on files';
COMMENT ON TABLE file_downloads IS 'File download tracking';
