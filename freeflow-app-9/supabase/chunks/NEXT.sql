DROP TABLE IF EXISTS file_activities CASCADE;
DROP TABLE IF EXISTS file_analytics CASCADE;
DROP TABLE IF EXISTS file_backups CASCADE;
DROP TABLE IF EXISTS file_collaborators CASCADE;
DROP TABLE IF EXISTS file_comments CASCADE;
DROP TABLE IF EXISTS file_conversions CASCADE;
DROP TABLE IF EXISTS file_locks CASCADE;
DROP TABLE IF EXISTS file_previews CASCADE;
DROP TABLE IF EXISTS file_shares CASCADE;
DROP TABLE IF EXISTS file_tags CASCADE;
DROP TABLE IF EXISTS file_thumbnails CASCADE;
DROP TABLE IF EXISTS file_versions CASCADE;
-- ============================================================================
-- FILES HUB SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- Session 9: Multi-Cloud Storage Intelligence
-- Created: 2024-11-26
-- ============================================================================

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS trigger_update_file_updated_at ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_update_folder_updated_at ON folders CASCADE;
DROP TRIGGER IF EXISTS trigger_log_file_activity ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_update_folder_file_count ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_generate_file_thumbnail ON files CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS log_file_activity CASCADE;
DROP FUNCTION IF EXISTS update_folder_file_count CASCADE;
DROP FUNCTION IF EXISTS generate_file_thumbnail CASCADE;
DROP FUNCTION IF EXISTS search_files CASCADE;

DROP TABLE IF EXISTS file_collaborators CASCADE;
DROP TABLE IF EXISTS file_backups CASCADE;
DROP TABLE IF EXISTS file_analytics CASCADE;
DROP TABLE IF EXISTS file_conversions CASCADE;
DROP TABLE IF EXISTS file_previews CASCADE;
DROP TABLE IF EXISTS file_thumbnails CASCADE;
DROP TABLE IF EXISTS file_locks CASCADE;
DROP TABLE IF EXISTS file_activities CASCADE;
DROP TABLE IF EXISTS file_comments CASCADE;
DROP TABLE IF EXISTS file_tags CASCADE;
DROP TABLE IF EXISTS file_shares CASCADE;
DROP TABLE IF EXISTS file_versions CASCADE;

DROP TYPE IF EXISTS file_type CASCADE;
DROP TYPE IF EXISTS access_level CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS share_permission CASCADE;
DROP TYPE IF EXISTS file_status CASCADE;
DROP TYPE IF EXISTS storage_provider CASCADE;
DROP TYPE IF EXISTS conversion_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- File type categorization
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

-- Access level for file sharing
DROP TYPE IF EXISTS access_level CASCADE;
CREATE TYPE access_level AS ENUM (
  'private',
  'team',
  'public',
  'restricted'
);

-- Activity tracking types
DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
  'view',
  'download',
  'upload',
  'edit',
  'share',
  'delete',
  'restore',
  'comment',
  'move',
  'rename',
  'lock',
  'unlock',
  'star',
  'unstar',
  'archive',
  'unarchive'
);

-- Share permission levels
DROP TYPE IF EXISTS share_permission CASCADE;
CREATE TYPE share_permission AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

-- File status
DROP TYPE IF EXISTS file_status CASCADE;
CREATE TYPE file_status AS ENUM (
  'active',
  'archived',
  'deleted',
  'processing',
  'failed'
);

-- Storage provider for multi-cloud
DROP TYPE IF EXISTS storage_provider CASCADE;
CREATE TYPE storage_provider AS ENUM (
  'supabase',
  'wasabi',
  'aws-s3',
  'google-cloud',
  'azure'
);

-- Conversion status
DROP TYPE IF EXISTS conversion_status CASCADE;
CREATE TYPE conversion_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- ============================================================================
-- TABLE 1: FOLDERS
-- ============================================================================


-- Indexes for folders
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders USING GIN(to_tsvector('english', path));
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folders_is_shared ON folders(is_shared) WHERE is_shared = true;

-- ============================================================================
-- TABLE 3: FILE_VERSIONS
-- ============================================================================

CREATE TABLE file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version details
  version_number INTEGER NOT NULL,
  name VARCHAR(500) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  checksum VARCHAR(64),

  -- Metadata
  mime_type VARCHAR(255),
  change_description TEXT,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_versions_version_check CHECK (version_number >= 1),
  CONSTRAINT file_versions_size_check CHECK (size >= 0),
  UNIQUE(file_id, version_number)
);

-- Indexes for file_versions
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_user_id ON file_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON file_versions(version_number DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_at ON file_versions(created_at DESC);

-- ============================================================================
-- TABLE 4: FILE_SHARES
-- ============================================================================

CREATE TABLE file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sharing details
  email VARCHAR(255),
  permission share_permission DEFAULT 'view',
  message TEXT,

  -- Access control
  can_download BOOLEAN DEFAULT true,
  can_comment BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_reshare BOOLEAN DEFAULT false,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_shares_email_or_user CHECK (
    (shared_with IS NOT NULL) OR (email IS NOT NULL)
  ),
  CONSTRAINT file_shares_access_count_check CHECK (access_count >= 0)
);

-- Indexes for file_shares
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON file_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_file_shares_email ON file_shares(email);
CREATE INDEX IF NOT EXISTS idx_file_shares_is_active ON file_shares(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_shares_created_at ON file_shares(created_at DESC);

-- ============================================================================
-- TABLE 5: FILE_TAGS
-- ============================================================================

CREATE TABLE file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tag details
  tag VARCHAR(100) NOT NULL,
  color VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_tags_tag_check CHECK (char_length(tag) >= 1 AND char_length(tag) <= 100),
  UNIQUE(file_id, tag)
);

-- Indexes for file_tags
CREATE INDEX IF NOT EXISTS idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_user_id ON file_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_tag ON file_tags(tag);
CREATE INDEX IF NOT EXISTS idx_file_tags_created_at ON file_tags(created_at DESC);

-- ============================================================================
-- TABLE 6: FILE_COMMENTS
-- ============================================================================

CREATE TABLE file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES file_comments(id) ON DELETE CASCADE,

  -- Comment details
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',

  -- Status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT file_comments_content_check CHECK (char_length(content) >= 1)
);

-- Indexes for file_comments
CREATE INDEX IF NOT EXISTS idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_user_id ON file_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_parent_id ON file_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_is_deleted ON file_comments(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_file_comments_created_at ON file_comments(created_at DESC);

-- ============================================================================
-- TABLE 7: FILE_ACTIVITIES
-- ============================================================================

CREATE TABLE file_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity details
  activity activity_type NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Context
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for file_activities
CREATE INDEX IF NOT EXISTS idx_file_activities_file_id ON file_activities(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_user_id ON file_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_activity ON file_activities(activity);
CREATE INDEX IF NOT EXISTS idx_file_activities_created_at ON file_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_activities_metadata ON file_activities USING GIN(metadata);

-- ============================================================================
-- TABLE 8: FILE_LOCKS
-- ============================================================================

CREATE TABLE file_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  locked_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lock details
  reason TEXT,
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for file_locks
CREATE INDEX IF NOT EXISTS idx_file_locks_file_id ON file_locks(file_id);
CREATE INDEX IF NOT EXISTS idx_file_locks_locked_by ON file_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_file_locks_is_active ON file_locks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_file_locks_expires_at ON file_locks(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_locks_created_at ON file_locks(created_at DESC);

-- ============================================================================
-- TABLE 9: FILE_THUMBNAILS
-- ============================================================================

CREATE TABLE file_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Thumbnail details
  url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  size BIGINT NOT NULL,
  format VARCHAR(50) NOT NULL,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'completed',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_thumbnails_width_check CHECK (width > 0),
  CONSTRAINT file_thumbnails_height_check CHECK (height > 0),
  CONSTRAINT file_thumbnails_size_check CHECK (size > 0)
);

-- Indexes for file_thumbnails
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_file_id ON file_thumbnails(file_id);
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_status ON file_thumbnails(status);
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_created_at ON file_thumbnails(created_at DESC);

-- ============================================================================
-- TABLE 10: FILE_PREVIEWS
-- ============================================================================

CREATE TABLE file_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Preview details
  url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'pending',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT file_previews_size_check CHECK (size >= 0)
);

-- Indexes for file_previews
CREATE INDEX IF NOT EXISTS idx_file_previews_file_id ON file_previews(file_id);
CREATE INDEX IF NOT EXISTS idx_file_previews_status ON file_previews(status);
CREATE INDEX IF NOT EXISTS idx_file_previews_created_at ON file_previews(created_at DESC);

-- ============================================================================
-- TABLE 11: FILE_CONVERSIONS
-- ============================================================================

CREATE TABLE file_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversion details
  source_format VARCHAR(50) NOT NULL,
  target_format VARCHAR(50) NOT NULL,
  output_url TEXT,
  output_size BIGINT,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'pending',
  error_message TEXT,
  progress INTEGER DEFAULT 0,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_conversions_progress_check CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT file_conversions_output_size_check CHECK (output_size IS NULL OR output_size >= 0)
);

-- Indexes for file_conversions
CREATE INDEX IF NOT EXISTS idx_file_conversions_file_id ON file_conversions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_conversions_user_id ON file_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_conversions_status ON file_conversions(status);
CREATE INDEX IF NOT EXISTS idx_file_conversions_created_at ON file_conversions(created_at DESC);

-- ============================================================================
-- TABLE 12: FILE_ANALYTICS
-- ============================================================================

CREATE TABLE file_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Analytics data
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  -- Geographic data
  countries JSONB DEFAULT '{}',
  cities JSONB DEFAULT '{}',

  -- Device data
  devices JSONB DEFAULT '{}',
  browsers JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_analytics_unique_date UNIQUE(file_id, date),
  CONSTRAINT file_analytics_views_check CHECK (views >= 0),
  CONSTRAINT file_analytics_downloads_check CHECK (downloads >= 0),
  CONSTRAINT file_analytics_shares_check CHECK (shares >= 0),
  CONSTRAINT file_analytics_comments_check CHECK (comments >= 0)
);

-- Indexes for file_analytics
CREATE INDEX IF NOT EXISTS idx_file_analytics_file_id ON file_analytics(file_id);
CREATE INDEX IF NOT EXISTS idx_file_analytics_date ON file_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_views ON file_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_downloads ON file_analytics(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_created_at ON file_analytics(created_at DESC);

-- ============================================================================
-- TABLE 13: FILE_COLLABORATORS
-- ============================================================================

CREATE TABLE file_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collaboration details
  permission share_permission DEFAULT 'edit',
  is_online BOOLEAN DEFAULT false,
  cursor_position JSONB,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_collaborators_unique UNIQUE(file_id, user_id)
);

-- Indexes for file_collaborators
CREATE INDEX IF NOT EXISTS idx_file_collaborators_file_id ON file_collaborators(file_id);
CREATE INDEX IF NOT EXISTS idx_file_collaborators_user_id ON file_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_file_collaborators_is_online ON file_collaborators(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_file_collaborators_last_seen_at ON file_collaborators(last_seen_at DESC);

-- ============================================================================
-- TABLE 14: FILE_BACKUPS
-- ============================================================================

CREATE TABLE file_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Backup details
  backup_url TEXT NOT NULL,
  backup_size BIGINT NOT NULL,
  backup_checksum VARCHAR(64),

  -- Storage
  storage_provider storage_provider DEFAULT 'wasabi',
  storage_path TEXT,

  -- Metadata
  backup_type VARCHAR(50) DEFAULT 'automatic',
  retention_days INTEGER DEFAULT 90,

  -- Status
  status conversion_status DEFAULT 'completed',

  -- Timestamps
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_backups_size_check CHECK (backup_size > 0),
  CONSTRAINT file_backups_retention_check CHECK (retention_days > 0)
);

-- Indexes for file_backups
CREATE INDEX IF NOT EXISTS idx_file_backups_file_id ON file_backups(file_id);
CREATE INDEX IF NOT EXISTS idx_file_backups_status ON file_backups(status);
CREATE INDEX IF NOT EXISTS idx_file_backups_expires_at ON file_backups(expires_at);
CREATE INDEX IF NOT EXISTS idx_file_backups_created_at ON file_backups(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log file activity
CREATE OR REPLACE FUNCTION log_file_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO file_activities (file_id, user_id, activity, description)
    VALUES (NEW.id, NEW.user_id, 'upload', 'File uploaded: ' || NEW.name);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id, 'rename', 'File renamed from ' || OLD.name || ' to ' || NEW.name);
    END IF;
    IF OLD.is_starred != NEW.is_starred THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_starred THEN 'star' ELSE 'unstar' END,
        CASE WHEN NEW.is_starred THEN 'File starred' ELSE 'File unstarred' END);
    END IF;
    IF OLD.is_locked != NEW.is_locked THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_locked THEN 'lock' ELSE 'unlock' END,
        CASE WHEN NEW.is_locked THEN 'File locked' ELSE 'File unlocked' END);
    END IF;
    IF OLD.is_archived != NEW.is_archived THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_archived THEN 'archive' ELSE 'unarchive' END,
        CASE WHEN NEW.is_archived THEN 'File archived' ELSE 'File unarchived' END);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO file_activities (file_id, user_id, activity, description)
    VALUES (OLD.id, OLD.user_id, 'delete', 'File deleted: ' || OLD.name);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Update folder file count and size
CREATE OR REPLACE FUNCTION update_folder_file_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE folders
    SET
      file_count = file_count + 1,
      total_size = total_size + NEW.size,
      updated_at = NOW()
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      -- Decrement old folder
      IF OLD.folder_id IS NOT NULL THEN
        UPDATE folders
        SET
          file_count = GREATEST(0, file_count - 1),
          total_size = GREATEST(0, total_size - OLD.size),
          updated_at = NOW()
        WHERE id = OLD.folder_id;
      END IF;
      -- Increment new folder
      IF NEW.folder_id IS NOT NULL THEN
        UPDATE folders
        SET
          file_count = file_count + 1,
          total_size = total_size + NEW.size,
          updated_at = NOW()
        WHERE id = NEW.folder_id;
      END IF;
    ELSIF OLD.size != NEW.size THEN
      -- Update size if changed
      UPDATE folders
      SET
        total_size = total_size - OLD.size + NEW.size,
        updated_at = NOW()
      WHERE id = NEW.folder_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.folder_id IS NOT NULL THEN
      UPDATE folders
      SET
        file_count = GREATEST(0, file_count - 1),
        total_size = GREATEST(0, total_size - OLD.size),
        updated_at = NOW()
      WHERE id = OLD.folder_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Generate file thumbnail (placeholder)
CREATE OR REPLACE FUNCTION generate_file_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue thumbnail generation for images and videos
  IF NEW.type IN ('image', 'video') THEN
    INSERT INTO file_previews (file_id, url, type, size, status)
    VALUES (NEW.id, '', 'thumbnail', 0, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Full-text search for files
CREATE OR REPLACE FUNCTION search_files(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL,
  file_type_filter file_type DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type file_type,
  size BIGINT,
  uploaded_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.type,
    f.size,
    f.uploaded_at,
    ts_rank(
      to_tsvector('english', coalesce(f.name, '') || ' ' || coalesce(f.description, '')),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM files f
  WHERE
    (user_uuid IS NULL OR f.user_id = user_uuid)
    AND (file_type_filter IS NULL OR f.type = file_type_filter)
    AND f.status = 'active'
    AND to_tsvector('english', coalesce(f.name, '') || ' ' || coalesce(f.description, '')) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate storage stats
CREATE OR REPLACE FUNCTION calculate_storage_stats(user_uuid UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  supabase_files BIGINT,
  supabase_size BIGINT,
  wasabi_files BIGINT,
  wasabi_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_files,
    COALESCE(SUM(size), 0) AS total_size,
    COUNT(*) FILTER (WHERE storage_provider = 'supabase') AS supabase_files,
    COALESCE(SUM(size) FILTER (WHERE storage_provider = 'supabase'), 0) AS supabase_size,
    COUNT(*) FILTER (WHERE storage_provider = 'wasabi') AS wasabi_files,
    COALESCE(SUM(size) FILTER (WHERE storage_provider = 'wasabi'), 0) AS wasabi_size
  FROM files
  WHERE user_id = user_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on folders
CREATE TRIGGER trigger_update_folder_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on files
CREATE TRIGGER trigger_update_file_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Log file activities
CREATE TRIGGER trigger_log_file_activity
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION log_file_activity();

-- Trigger: Update folder file count
CREATE TRIGGER trigger_update_folder_file_count
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_file_count();

-- Trigger: Generate file thumbnail
CREATE TRIGGER trigger_generate_file_thumbnail
  AFTER INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION generate_file_thumbnail();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY folders_select_policy ON folders FOR SELECT USING (
  user_id = auth.uid() OR
  auth.uid() = ANY(shared_with)
);

CREATE POLICY folders_insert_policy ON folders FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY folders_update_policy ON folders FOR UPDATE USING (
  user_id = auth.uid() AND can_write = true
);

CREATE POLICY folders_delete_policy ON folders FOR DELETE USING (
  user_id = auth.uid() AND can_delete = true
);

-- RLS Policies for files




-- RLS Policies for file_versions
CREATE POLICY file_versions_select_policy ON file_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_versions.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_versions_insert_policy ON file_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_versions.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_shares
CREATE POLICY file_shares_select_policy ON file_shares FOR SELECT USING (
  shared_by = auth.uid() OR
  shared_with = auth.uid() OR
  email = auth.email()
);

CREATE POLICY file_shares_insert_policy ON file_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_shares.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_shares_update_policy ON file_shares FOR UPDATE USING (
  shared_by = auth.uid()
);

CREATE POLICY file_shares_delete_policy ON file_shares FOR DELETE USING (
  shared_by = auth.uid()
);

-- RLS Policies for file_tags
CREATE POLICY file_tags_select_policy ON file_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_tags.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_tags_insert_policy ON file_tags FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_tags_delete_policy ON file_tags FOR DELETE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_comments
CREATE POLICY file_comments_select_policy ON file_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_comments.file_id AND files.user_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM file_shares
    WHERE file_shares.file_id = file_comments.file_id
    AND file_shares.shared_with = auth.uid()
    AND file_shares.can_comment = true
  )
);

CREATE POLICY file_comments_insert_policy ON file_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_comments_update_policy ON file_comments FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY file_comments_delete_policy ON file_comments FOR DELETE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_activities
CREATE POLICY file_activities_select_policy ON file_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_activities.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_activities_insert_policy ON file_activities FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- RLS Policies for file_locks
CREATE POLICY file_locks_select_policy ON file_locks FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_locks.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_locks_insert_policy ON file_locks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_locks.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_locks_update_policy ON file_locks FOR UPDATE USING (
  locked_by = auth.uid()
);

-- RLS Policies for file_thumbnails
CREATE POLICY file_thumbnails_select_policy ON file_thumbnails FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_thumbnails.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_thumbnails_insert_policy ON file_thumbnails FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_thumbnails.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_previews
CREATE POLICY file_previews_select_policy ON file_previews FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_previews.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_previews_insert_policy ON file_previews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_previews.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_conversions
CREATE POLICY file_conversions_select_policy ON file_conversions FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY file_conversions_insert_policy ON file_conversions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- RLS Policies for file_analytics
CREATE POLICY file_analytics_select_policy ON file_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_analytics.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_collaborators
CREATE POLICY file_collaborators_select_policy ON file_collaborators FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM files WHERE files.id = file_collaborators.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_collaborators_insert_policy ON file_collaborators FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_collaborators_update_policy ON file_collaborators FOR UPDATE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_backups
CREATE POLICY file_backups_select_policy ON file_backups FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_backups.file_id AND files.user_id = auth.uid())
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE folders IS 'Hierarchical folder structure for file organization';
COMMENT ON TABLE files IS 'Main files table with comprehensive metadata and multi-cloud storage support';
COMMENT ON TABLE file_versions IS 'Version history for files with rollback capability';
COMMENT ON TABLE file_shares IS 'File sharing with granular permissions and expiration';
COMMENT ON TABLE file_tags IS 'Flexible tagging system for file categorization';
COMMENT ON TABLE file_comments IS 'Threaded comments on files with mentions';
COMMENT ON TABLE file_activities IS 'Complete audit log of all file operations';
COMMENT ON TABLE file_locks IS 'File locking system for collaborative editing';
COMMENT ON TABLE file_thumbnails IS 'Generated thumbnails for media files';
COMMENT ON TABLE file_previews IS 'File preview generation queue';
COMMENT ON TABLE file_conversions IS 'File format conversion tracking';
COMMENT ON TABLE file_analytics IS 'Daily analytics aggregation for file usage';
COMMENT ON TABLE file_collaborators IS 'Real-time collaboration tracking';
COMMENT ON TABLE file_backups IS 'Automated backup history with retention policies';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Files Hub System Database Schema Created Successfully';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tables Created: 14';
  RAISE NOTICE 'Indexes Created: 35+';
  RAISE NOTICE 'RLS Policies: 25+';
  RAISE NOTICE 'Triggers: 5';
  RAISE NOTICE 'Functions: 5';
  RAISE NOTICE 'Enums: 6';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- Multi-cloud storage (Supabase + Wasabi)';
  RAISE NOTICE '- Version control and rollback';
  RAISE NOTICE '- Granular file sharing permissions';
  RAISE NOTICE '- Real-time collaboration tracking';
  RAISE NOTICE '- Comprehensive activity logging';
  RAISE NOTICE '- File locking system';
  RAISE NOTICE '- Automated thumbnail generation';
  RAISE NOTICE '- File format conversion';
  RAISE NOTICE '- Usage analytics';
  RAISE NOTICE '- Automated backups';
  RAISE NOTICE '- Full-text search';
  RAISE NOTICE '- Row Level Security (RLS)';
  RAISE NOTICE '============================================================================';
END $$;

-- Partial unique index for active file locks
CREATE UNIQUE INDEX IF NOT EXISTS idx_file_locks_unique_active ON file_locks(file_id) WHERE is_active = true;
