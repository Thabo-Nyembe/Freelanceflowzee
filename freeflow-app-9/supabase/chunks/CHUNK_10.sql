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

CREATE TABLE IF NOT EXISTS storage_folders (
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

CREATE TABLE IF NOT EXISTS storage_shares (
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

CREATE TABLE IF NOT EXISTS file_versions (
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

CREATE TABLE IF NOT EXISTS storage_quotas (
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

CREATE TABLE IF NOT EXISTS storage_providers (
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

CREATE TABLE IF NOT EXISTS file_activity_log (
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

CREATE TABLE IF NOT EXISTS file_downloads (
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
CREATE INDEX IF NOT EXISTS idx_storage_files_user_id ON storage_files(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_files_provider ON storage_files(provider);
CREATE INDEX IF NOT EXISTS idx_storage_files_type ON storage_files(type);
CREATE INDEX IF NOT EXISTS idx_storage_files_status ON storage_files(status);
CREATE INDEX IF NOT EXISTS idx_storage_files_is_public ON storage_files(is_public);
CREATE INDEX IF NOT EXISTS idx_storage_files_uploaded_at ON storage_files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_storage_files_size ON storage_files(size DESC);
CREATE INDEX IF NOT EXISTS idx_storage_files_download_count ON storage_files(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_storage_files_tags ON storage_files USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_storage_files_name_trgm ON storage_files USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_storage_files_path_trgm ON storage_files USING gin(path gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_storage_files_user_provider ON storage_files(user_id, provider);
CREATE INDEX IF NOT EXISTS idx_storage_files_user_type ON storage_files(user_id, type);
CREATE INDEX IF NOT EXISTS idx_storage_files_checksum ON storage_files(checksum);

-- storage_folders indexes
CREATE INDEX IF NOT EXISTS idx_storage_folders_user_id ON storage_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_folders_provider ON storage_folders(provider);
CREATE INDEX IF NOT EXISTS idx_storage_folders_parent_id ON storage_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_storage_folders_path ON storage_folders(path);
CREATE INDEX IF NOT EXISTS idx_storage_folders_created_at ON storage_folders(created_at DESC);

-- storage_shares indexes
CREATE INDEX IF NOT EXISTS idx_storage_shares_file_id ON storage_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_storage_shares_shared_by ON storage_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_storage_shares_shared_with ON storage_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_storage_shares_expires_at ON storage_shares(expires_at);
CREATE INDEX IF NOT EXISTS idx_storage_shares_created_at ON storage_shares(created_at DESC);

-- file_versions indexes
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version ON file_versions(version DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_uploaded_by ON file_versions(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_file_versions_uploaded_at ON file_versions(uploaded_at DESC);

-- storage_quotas indexes
CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON storage_quotas(user_id);

-- storage_providers indexes
CREATE INDEX IF NOT EXISTS idx_storage_providers_user_id ON storage_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_providers_provider ON storage_providers(provider);
CREATE INDEX IF NOT EXISTS idx_storage_providers_enabled ON storage_providers(enabled);

-- file_activity_log indexes
CREATE INDEX IF NOT EXISTS idx_file_activity_log_file_id ON file_activity_log(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_log_user_id ON file_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_log_action ON file_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_file_activity_log_created_at ON file_activity_log(created_at DESC);

-- file_downloads indexes
CREATE INDEX IF NOT EXISTS idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_downloaded_at ON file_downloads(downloaded_at DESC);

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
-- =====================================================
-- TEAM HUB SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive team management with member profiles,
-- departments, meetings, performance tracking, and analytics
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS member_status CASCADE;
CREATE TYPE member_status AS ENUM (
  'online',
  'offline',
  'away',
  'busy',
  'dnd'
);

DROP TYPE IF EXISTS department_type CASCADE;
CREATE TYPE department_type AS ENUM (
  'design',
  'development',
  'management',
  'marketing',
  'qa',
  'sales',
  'hr',
  'finance',
  'operations',
  'support'
);

DROP TYPE IF EXISTS role_level CASCADE;
CREATE TYPE role_level AS ENUM (
  'intern',
  'junior',
  'mid',
  'senior',
  'lead',
  'principal',
  'director',
  'vp',
  'c-level'
);

DROP TYPE IF EXISTS availability_status CASCADE;
CREATE TYPE availability_status AS ENUM (
  'available',
  'in-meeting',
  'on-break',
  'off-sick',
  'on-leave',
  'business-trip'
);

DROP TYPE IF EXISTS meeting_status CASCADE;
CREATE TYPE meeting_status AS ENUM (
  'scheduled',
  'in-progress',
  'completed',
  'cancelled'
);

DROP TYPE IF EXISTS review_period CASCADE;
CREATE TYPE review_period AS ENUM (
  'monthly',
  'quarterly',
  'bi-annual',
  'annual'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Team Members
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  role_level role_level NOT NULL DEFAULT 'mid',
  department department_type NOT NULL,
  status member_status NOT NULL DEFAULT 'offline',
  availability availability_status NOT NULL DEFAULT 'available',
  avatar TEXT,
  bio TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  start_date DATE,
  skills TEXT[] DEFAULT '{}',
  projects_count INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type department_type NOT NULL,
  description TEXT,
  head_member_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  member_count INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  budget DECIMAL(15, 2),
  location TEXT,
  goals TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Team Projects
CREATE TABLE IF NOT EXISTS team_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15, 2),
  team_size INTEGER NOT NULL DEFAULT 0,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Meetings
CREATE TABLE IF NOT EXISTS team_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status meeting_status NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  location TEXT,
  meeting_link TEXT,
  organizer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  attendees UUID[] DEFAULT '{}',
  agenda TEXT[] DEFAULT '{}',
  notes TEXT,
  recording_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  period review_period NOT NULL,
  review_date DATE NOT NULL,
  overall_rating DECIMAL(2, 1) NOT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  technical_rating DECIMAL(2, 1) CHECK (technical_rating >= 0 AND technical_rating <= 5),
  communication_rating DECIMAL(2, 1) CHECK (communication_rating >= 0 AND communication_rating <= 5),
  teamwork_rating DECIMAL(2, 1) CHECK (teamwork_rating >= 0 AND teamwork_rating <= 5),
  leadership_rating DECIMAL(2, 1) CHECK (leadership_rating >= 0 AND leadership_rating <= 5),
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  comments TEXT,
  action_items TEXT[] DEFAULT '{}',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Announcements
CREATE TABLE IF NOT EXISTS team_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  author_id UUID REFERENCES team_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  target_departments department_type[] DEFAULT '{}',
  target_members UUID[] DEFAULT '{}',
  read_by UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Team Stats (aggregated statistics)
CREATE TABLE IF NOT EXISTS team_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_members INTEGER NOT NULL DEFAULT 0,
  online_members INTEGER NOT NULL DEFAULT 0,
  active_projects INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  department_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  top_skills JSONB DEFAULT '[]'::jsonb,
  productivity_score DECIMAL(5, 2),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Team Members Indexes
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_user_id ON team_members(member_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON team_members(availability);
CREATE INDEX IF NOT EXISTS idx_team_members_role_level ON team_members(role_level);
CREATE INDEX IF NOT EXISTS idx_team_members_rating ON team_members(rating DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_projects_count ON team_members(projects_count DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_tasks_completed ON team_members(tasks_completed DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_team_members_name_search ON team_members USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_team_members_email_search ON team_members USING GIN(to_tsvector('english', email));
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_last_seen ON team_members(last_seen DESC);

-- Departments Indexes
CREATE INDEX IF NOT EXISTS idx_departments_user_id ON departments(user_id);
CREATE INDEX IF NOT EXISTS idx_departments_type ON departments(type);
CREATE INDEX IF NOT EXISTS idx_departments_head_member_id ON departments(head_member_id);
CREATE INDEX IF NOT EXISTS idx_departments_member_count ON departments(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_departments_active_projects ON departments(active_projects DESC);
CREATE INDEX IF NOT EXISTS idx_departments_name_search ON departments USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_departments_created_at ON departments(created_at DESC);

-- Team Projects Indexes
CREATE INDEX IF NOT EXISTS idx_team_projects_user_id ON team_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_department_id ON team_projects(department_id);
CREATE INDEX IF NOT EXISTS idx_team_projects_status ON team_projects(status);
CREATE INDEX IF NOT EXISTS idx_team_projects_priority ON team_projects(priority);
CREATE INDEX IF NOT EXISTS idx_team_projects_progress ON team_projects(progress DESC);
CREATE INDEX IF NOT EXISTS idx_team_projects_start_date ON team_projects(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_team_projects_end_date ON team_projects(end_date);
CREATE INDEX IF NOT EXISTS idx_team_projects_team_size ON team_projects(team_size DESC);
CREATE INDEX IF NOT EXISTS idx_team_projects_name_search ON team_projects USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_team_projects_created_at ON team_projects(created_at DESC);

-- Team Meetings Indexes
CREATE INDEX IF NOT EXISTS idx_team_meetings_user_id ON team_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_team_meetings_department_id ON team_meetings(department_id);
CREATE INDEX IF NOT EXISTS idx_team_meetings_project_id ON team_meetings(project_id);
CREATE INDEX IF NOT EXISTS idx_team_meetings_status ON team_meetings(status);
CREATE INDEX IF NOT EXISTS idx_team_meetings_organizer_id ON team_meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_team_meetings_scheduled_at ON team_meetings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_meetings_attendees ON team_meetings USING GIN(attendees);
CREATE INDEX IF NOT EXISTS idx_team_meetings_title_search ON team_meetings USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_team_meetings_created_at ON team_meetings(created_at DESC);

-- Performance Reviews Indexes
CREATE INDEX IF NOT EXISTS idx_performance_reviews_user_id ON performance_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_member_id ON performance_reviews(member_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_reviewer_id ON performance_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_period ON performance_reviews(period);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_review_date ON performance_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_overall_rating ON performance_reviews(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_created_at ON performance_reviews(created_at DESC);

-- Team Announcements Indexes
CREATE INDEX IF NOT EXISTS idx_team_announcements_user_id ON team_announcements(user_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_department_id ON team_announcements(department_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_author_id ON team_announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_team_announcements_type ON team_announcements(type);
CREATE INDEX IF NOT EXISTS idx_team_announcements_priority ON team_announcements(priority);
CREATE INDEX IF NOT EXISTS idx_team_announcements_is_pinned ON team_announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_team_announcements_published_at ON team_announcements(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_announcements_target_departments ON team_announcements USING GIN(target_departments);
CREATE INDEX IF NOT EXISTS idx_team_announcements_target_members ON team_announcements USING GIN(target_members);
CREATE INDEX IF NOT EXISTS idx_team_announcements_read_by ON team_announcements USING GIN(read_by);
CREATE INDEX IF NOT EXISTS idx_team_announcements_title_search ON team_announcements USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_team_announcements_created_at ON team_announcements(created_at DESC);

-- Team Stats Indexes
CREATE INDEX IF NOT EXISTS idx_team_stats_user_id ON team_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_team_stats_date ON team_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_team_stats_total_members ON team_stats(total_members DESC);
CREATE INDEX IF NOT EXISTS idx_team_stats_productivity_score ON team_stats(productivity_score DESC);
CREATE INDEX IF NOT EXISTS idx_team_stats_created_at ON team_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_projects_updated_at
  BEFORE UPDATE ON team_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_meetings_updated_at
  BEFORE UPDATE ON team_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
  BEFORE UPDATE ON performance_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_announcements_updated_at
  BEFORE UPDATE ON team_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_stats_updated_at
  BEFORE UPDATE ON team_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update department member count
CREATE OR REPLACE FUNCTION update_department_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE departments
    SET member_count = member_count + 1
    WHERE type = NEW.department AND user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE departments
    SET member_count = GREATEST(0, member_count - 1)
    WHERE type = OLD.department AND user_id = OLD.user_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.department != NEW.department THEN
    UPDATE departments
    SET member_count = GREATEST(0, member_count - 1)
    WHERE type = OLD.department AND user_id = OLD.user_id;
    UPDATE departments
    SET member_count = member_count + 1
    WHERE type = NEW.department AND user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_department_member_count
  AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_department_member_count();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get team statistics
CREATE OR REPLACE FUNCTION get_team_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalMembers', COUNT(*),
    'onlineMembers', COUNT(*) FILTER (WHERE status IN ('online', 'busy')),
    'activeProjects', SUM(projects_count),
    'completedTasks', SUM(tasks_completed),
    'averageRating', ROUND(AVG(rating), 2),
    'byDepartment', (
      SELECT json_object_agg(department, cnt)
      FROM (
        SELECT department, COUNT(*) as cnt
        FROM team_members
        WHERE user_id = p_user_id
        GROUP BY department
      ) dept_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM team_members
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    )
  ) INTO v_stats
  FROM team_members
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search team members
CREATE OR REPLACE FUNCTION search_team_members(
  p_user_id UUID,
  p_search_term TEXT,
  p_department department_type DEFAULT NULL,
  p_status member_status DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  department department_type,
  status member_status,
  rating DECIMAL,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.name,
    tm.email,
    tm.role,
    tm.department,
    tm.status,
    tm.rating,
    ts_rank(
      to_tsvector('english', tm.name || ' ' || tm.email || ' ' || tm.role),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM team_members tm
  WHERE tm.user_id = p_user_id
    AND (p_department IS NULL OR tm.department = p_department)
    AND (p_status IS NULL OR tm.status = p_status)
    AND (
      p_search_term = '' OR
      to_tsvector('english', tm.name || ' ' || tm.email || ' ' || tm.role) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, tm.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get department overview
CREATE OR REPLACE FUNCTION get_department_overview(
  p_user_id UUID,
  p_department_type department_type
)
RETURNS JSON AS $$
DECLARE
  v_overview JSON;
BEGIN
  SELECT json_build_object(
    'department', d.name,
    'type', d.type,
    'memberCount', d.member_count,
    'activeProjects', d.active_projects,
    'budget', d.budget,
    'headMember', (
      SELECT json_build_object('id', tm.id, 'name', tm.name, 'role', tm.role)
      FROM team_members tm
      WHERE tm.id = d.head_member_id
    ),
    'topPerformers', (
      SELECT json_agg(
        json_build_object('id', tm.id, 'name', tm.name, 'rating', tm.rating)
        ORDER BY tm.rating DESC
      )
      FROM (
        SELECT id, name, rating
        FROM team_members
        WHERE user_id = p_user_id AND department = p_department_type
        ORDER BY rating DESC
        LIMIT 5
      ) tm
    )
  ) INTO v_overview
  FROM departments d
  WHERE d.user_id = p_user_id AND d.type = p_department_type;

  RETURN v_overview;
END;
$$ LANGUAGE plpgsql;

-- Get upcoming meetings
CREATE OR REPLACE FUNCTION get_upcoming_meetings(
  p_user_id UUID,
  p_member_id UUID DEFAULT NULL,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  type TEXT,
  attendee_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.id,
    tm.title,
    tm.scheduled_at,
    tm.duration_minutes,
    tm.type,
    COALESCE(array_length(tm.attendees, 1), 0) as attendee_count
  FROM team_meetings tm
  WHERE tm.user_id = p_user_id
    AND tm.status = 'scheduled'
    AND tm.scheduled_at BETWEEN NOW() AND NOW() + (p_days_ahead || ' days')::INTERVAL
    AND (p_member_id IS NULL OR p_member_id = ANY(tm.attendees))
  ORDER BY tm.scheduled_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate productivity score
CREATE OR REPLACE FUNCTION calculate_productivity_score(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL AS $$
DECLARE
  v_score DECIMAL;
BEGIN
  -- Productivity score based on:
  -- - Tasks completed (40%)
  -- - Project progress (30%)
  -- - Team rating (20%)
  -- - Meeting attendance (10%)
  SELECT
    (
      (COALESCE(SUM(tasks_completed), 0) * 0.4) +
      (COALESCE(AVG(projects_count), 0) * 10 * 0.3) +
      (COALESCE(AVG(rating), 0) * 20 * 0.2) +
      (10 * 0.1)  -- Simplified meeting score
    ) INTO v_score
  FROM team_members
  WHERE user_id = p_user_id;

  RETURN ROUND(LEAST(v_score, 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Update team stats
CREATE OR REPLACE FUNCTION update_team_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO team_stats (
    user_id,
    date,
    total_members,
    online_members,
    active_projects,
    completed_tasks,
    average_rating,
    department_breakdown,
    status_breakdown,
    productivity_score
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status IN ('online', 'busy')),
    SUM(projects_count),
    SUM(tasks_completed),
    ROUND(AVG(rating), 2),
    (SELECT get_team_stats(p_user_id)->>'byDepartment')::jsonb,
    (SELECT get_team_stats(p_user_id)->>'byStatus')::jsonb,
    calculate_productivity_score(p_user_id)
  FROM team_members
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_members = EXCLUDED.total_members,
    online_members = EXCLUDED.online_members,
    active_projects = EXCLUDED.active_projects,
    completed_tasks = EXCLUDED.completed_tasks,
    average_rating = EXCLUDED.average_rating,
    department_breakdown = EXCLUDED.department_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    productivity_score = EXCLUDED.productivity_score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_stats ENABLE ROW LEVEL SECURITY;

-- Team Members Policies
CREATE POLICY team_members_select_policy ON team_members
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = member_user_id);

CREATE POLICY team_members_insert_policy ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_members_update_policy ON team_members
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = member_user_id);

CREATE POLICY team_members_delete_policy ON team_members
  FOR DELETE USING (auth.uid() = user_id);

-- Departments Policies
CREATE POLICY departments_select_policy ON departments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY departments_insert_policy ON departments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY departments_update_policy ON departments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY departments_delete_policy ON departments
  FOR DELETE USING (auth.uid() = user_id);

-- Team Projects Policies
CREATE POLICY team_projects_select_policy ON team_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_projects_insert_policy ON team_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_projects_update_policy ON team_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_projects_delete_policy ON team_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Team Meetings Policies
CREATE POLICY team_meetings_select_policy ON team_meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_meetings_insert_policy ON team_meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_meetings_update_policy ON team_meetings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_meetings_delete_policy ON team_meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Performance Reviews Policies
CREATE POLICY performance_reviews_select_policy ON performance_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY performance_reviews_insert_policy ON performance_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY performance_reviews_update_policy ON performance_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY performance_reviews_delete_policy ON performance_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Team Announcements Policies
CREATE POLICY team_announcements_select_policy ON team_announcements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_announcements_insert_policy ON team_announcements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_announcements_update_policy ON team_announcements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_announcements_delete_policy ON team_announcements
  FOR DELETE USING (auth.uid() = user_id);

-- Team Stats Policies
CREATE POLICY team_stats_select_policy ON team_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY team_stats_insert_policy ON team_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY team_stats_update_policy ON team_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY team_stats_delete_policy ON team_stats
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all team members by department
-- SELECT * FROM team_members WHERE user_id = 'user-id' AND department = 'development' ORDER BY rating DESC;

-- Example: Search team members
-- SELECT * FROM search_team_members('user-id', 'John', 'development', 'online', 20);

-- Example: Get team statistics
-- SELECT * FROM get_team_stats('user-id');

-- Example: Get department overview
-- SELECT * FROM get_department_overview('user-id', 'development');

-- Example: Get upcoming meetings
-- SELECT * FROM get_upcoming_meetings('user-id', NULL, 7);

-- Example: Update daily team stats
-- SELECT update_team_stats_daily('user-id');

-- =====================================================
-- END OF TEAM HUB SYSTEM SCHEMA
-- =====================================================
-- ============================================
-- TEAM MANAGEMENT SYSTEM MIGRATION
-- ============================================
-- Comprehensive database schema for team collaboration with:
-- - Team member profiles and roles
-- - Real-time availability tracking
-- - Performance metrics and ratings
-- - Skill management and matching
-- - Project assignments and tracking
-- - Communication and messaging
-- - Time tracking and schedules
-- - Permission management
-- - Team analytics and insights
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DROP TYPE IF EXISTS member_status CASCADE;
CREATE TYPE member_status AS ENUM ('online', 'busy', 'away', 'offline');
DROP TYPE IF EXISTS member_role CASCADE;
CREATE TYPE member_role AS ENUM ('Lead Designer', 'Frontend Developer', 'Backend Developer', 'Project Manager', 'QA Engineer', 'Marketing Specialist', 'Content Writer', 'DevOps Engineer', 'UI/UX Designer', 'Data Analyst', 'Team Member');
DROP TYPE IF EXISTS department_type CASCADE;
CREATE TYPE department_type AS ENUM ('Design', 'Development', 'Management', 'Marketing', 'Quality Assurance', 'Content', 'Operations', 'Analytics', 'Sales', 'Support');
DROP TYPE IF EXISTS permission_level CASCADE;
CREATE TYPE permission_level AS ENUM ('owner', 'admin', 'write', 'read');
DROP TYPE IF EXISTS timezone_type CASCADE;
CREATE TYPE timezone_type AS ENUM ('PST', 'MST', 'CST', 'EST', 'UTC', 'GMT', 'CET', 'IST', 'JST', 'AEST');
DROP TYPE IF EXISTS availability_status CASCADE;
CREATE TYPE availability_status AS ENUM ('Available', 'Busy', 'In Meeting', 'On Break', 'Offline', 'On Leave', 'Pending');
DROP TYPE IF EXISTS invitation_status CASCADE;
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on-hold', 'completed', 'cancelled');
DROP TYPE IF EXISTS task_status CASCADE;
CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'review', 'completed', 'blocked');
DROP TYPE IF EXISTS task_priority CASCADE;
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
DROP TYPE IF EXISTS meeting_status CASCADE;
CREATE TYPE meeting_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');
DROP TYPE IF EXISTS communication_type CASCADE;
CREATE TYPE communication_type AS ENUM ('message', 'email', 'video-call', 'announcement');
DROP TYPE IF EXISTS skill_category CASCADE;
CREATE TYPE skill_category AS ENUM ('technical', 'soft', 'tool', 'language', 'domain');

-- ============================================
-- TEAM MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role member_role NOT NULL,
    department department_type NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    location TEXT,
    avatar TEXT,
    status member_status DEFAULT 'offline',
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    projects_count INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5.0),
    skills TEXT[] DEFAULT '{}',
    availability availability_status DEFAULT 'Offline',
    work_hours TEXT,
    timezone timezone_type DEFAULT 'UTC',
    permissions permission_level DEFAULT 'read',
    bio TEXT,
    linkedin TEXT,
    github TEXT,
    portfolio TEXT,
    certifications TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    years_of_experience INTEGER,
    hourly_rate DECIMAL(10, 2),
    preferred_projects TEXT[] DEFAULT '{}',
    last_active TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for team members
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_availability ON team_members(availability);
CREATE INDEX IF NOT EXISTS idx_team_members_rating ON team_members(rating DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_skills ON team_members USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_team_members_join_date ON team_members(join_date DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_metadata ON team_members USING GIN(metadata);

-- Full-text search for team members
CREATE INDEX IF NOT EXISTS idx_team_members_search ON team_members USING GIN(
    to_tsvector('english', name || ' ' || email || ' ' || COALESCE(bio, ''))
);

-- ============================================
-- TEAM INVITATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    role member_role NOT NULL,
    department department_type NOT NULL,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status invitation_status DEFAULT 'pending',
    message TEXT,
    token TEXT NOT NULL UNIQUE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    declined_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for invitations
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_invited_by ON team_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);

-- ============================================
-- TEAM PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    start_date DATE NOT NULL,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_team_projects_status ON team_projects(status);
CREATE INDEX IF NOT EXISTS idx_team_projects_created_by ON team_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_team_projects_start_date ON team_projects(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_team_projects_metadata ON team_projects USING GIN(metadata);

-- Full-text search for projects
CREATE INDEX IF NOT EXISTS idx_team_projects_search ON team_projects USING GIN(
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- ============================================
-- PROJECT MEMBERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    role TEXT,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    UNIQUE(project_id, member_id)
);

-- Indexes for project members
CREATE INDEX IF NOT EXISTS idx_team_project_members_project_id ON team_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_team_project_members_member_id ON team_project_members(member_id);

-- ============================================
-- TEAM TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES team_members(id) ON DELETE SET NULL,
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_team_tasks_project_id ON team_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_team_tasks_assigned_to ON team_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_team_tasks_status ON team_tasks(status);
CREATE INDEX IF NOT EXISTS idx_team_tasks_priority ON team_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_team_tasks_due_date ON team_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_team_tasks_metadata ON team_tasks USING GIN(metadata);

-- Full-text search for tasks
CREATE INDEX IF NOT EXISTS idx_team_tasks_search ON team_tasks USING GIN(
    to_tsvector('english', title || ' ' || COALESCE(description, ''))
);

-- ============================================
-- PERFORMANCE METRICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    period TEXT NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    average_task_time DECIMAL(10, 2),
    on_time_delivery DECIMAL(5, 2),
    quality_score DECIMAL(2, 1),
    collaboration_score DECIMAL(2, 1),
    client_satisfaction DECIMAL(2, 1),
    skill_growth DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_team_performance_metrics_member_id ON team_performance_metrics(member_id);
CREATE INDEX IF NOT EXISTS idx_team_performance_metrics_period ON team_performance_metrics(period);
CREATE INDEX IF NOT EXISTS idx_team_performance_metrics_period_dates ON team_performance_metrics(period_start, period_end);

-- ============================================
-- TEAM MEETINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    meeting_link TEXT,
    agenda TEXT[] DEFAULT '{}',
    notes TEXT,
    status meeting_status DEFAULT 'scheduled',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for meetings
CREATE INDEX IF NOT EXISTS idx_team_meetings_organizer_id ON team_meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_team_meetings_status ON team_meetings(status);
CREATE INDEX IF NOT EXISTS idx_team_meetings_start_time ON team_meetings(start_time);

-- ============================================
-- MEETING ATTENDEES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_meeting_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id UUID NOT NULL REFERENCES team_meetings(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    response TEXT CHECK (response IN ('accepted', 'declined', 'tentative', 'pending')),
    attended BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, member_id)
);

-- Indexes for meeting attendees
CREATE INDEX IF NOT EXISTS idx_team_meeting_attendees_meeting_id ON team_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_team_meeting_attendees_member_id ON team_meeting_attendees(member_id);

-- ============================================
-- TEAM COMMUNICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type communication_type NOT NULL,
    from_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    attachments TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for communications
CREATE INDEX IF NOT EXISTS idx_team_communications_from_member_id ON team_communications(from_member_id);
CREATE INDEX IF NOT EXISTS idx_team_communications_type ON team_communications(type);
CREATE INDEX IF NOT EXISTS idx_team_communications_read ON team_communications(read);
CREATE INDEX IF NOT EXISTS idx_team_communications_created_at ON team_communications(created_at DESC);

-- ============================================
-- COMMUNICATION RECIPIENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_communication_recipients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    communication_id UUID NOT NULL REFERENCES team_communications(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for communication recipients
CREATE INDEX IF NOT EXISTS idx_team_communication_recipients_communication_id ON team_communication_recipients(communication_id);
CREATE INDEX IF NOT EXISTS idx_team_communication_recipients_member_id ON team_communication_recipients(member_id);
CREATE INDEX IF NOT EXISTS idx_team_communication_recipients_read ON team_communication_recipients(read);

-- ============================================
-- TEAM SKILLS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    skill TEXT NOT NULL,
    category skill_category NOT NULL,
    proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
    years_of_experience DECIMAL(3, 1),
    certifications TEXT[] DEFAULT '{}',
    last_used DATE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for skills
CREATE INDEX IF NOT EXISTS idx_team_skills_member_id ON team_skills(member_id);
CREATE INDEX IF NOT EXISTS idx_team_skills_skill ON team_skills(skill);
CREATE INDEX IF NOT EXISTS idx_team_skills_category ON team_skills(category);
CREATE INDEX IF NOT EXISTS idx_team_skills_proficiency ON team_skills(proficiency DESC);

-- ============================================
-- TIME TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_time_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES team_projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES team_tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    hours_worked DECIMAL(10, 2) NOT NULL,
    description TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for time tracking
CREATE INDEX IF NOT EXISTS idx_team_time_tracking_member_id ON team_time_tracking(member_id);
CREATE INDEX IF NOT EXISTS idx_team_time_tracking_project_id ON team_time_tracking(project_id);
CREATE INDEX IF NOT EXISTS idx_team_time_tracking_task_id ON team_time_tracking(task_id);
CREATE INDEX IF NOT EXISTS idx_team_time_tracking_date ON team_time_tracking(date DESC);
CREATE INDEX IF NOT EXISTS idx_team_time_tracking_billable ON team_time_tracking(billable);

-- ============================================
-- TEAM PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    resource TEXT NOT NULL,
    actions TEXT[] NOT NULL,
    level permission_level NOT NULL,
    granted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for permissions
CREATE INDEX IF NOT EXISTS idx_team_permissions_member_id ON team_permissions(member_id);
CREATE INDEX IF NOT EXISTS idx_team_permissions_resource ON team_permissions(resource);
CREATE INDEX IF NOT EXISTS idx_team_permissions_level ON team_permissions(level);

-- ============================================
-- TEAM ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS team_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period TEXT NOT NULL CHECK (period IN ('week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_members INTEGER DEFAULT 0,
    active_members INTEGER DEFAULT 0,
    online_members INTEGER DEFAULT 0,
    total_projects INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    average_rating DECIMAL(2, 1),
    average_response_time DECIMAL(10, 2),
    utilization_rate DECIMAL(5, 2),
    retention_rate DECIMAL(5, 2),
    skill_coverage JSONB DEFAULT '{}',
    department_distribution JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_team_analytics_period ON team_analytics(period);
CREATE INDEX IF NOT EXISTS idx_team_analytics_period_dates ON team_analytics(period_start, period_end);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update team member statistics on task completion
CREATE OR REPLACE FUNCTION update_team_member_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE team_members
        SET completed_tasks = completed_tasks + 1
        WHERE id = NEW.assigned_to;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_team_member_stats
    AFTER INSERT OR UPDATE OF status ON team_tasks
    FOR EACH ROW
    WHEN (NEW.assigned_to IS NOT NULL)
    EXECUTE FUNCTION update_team_member_stats();

-- Update project progress based on tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'completed')
    INTO total_tasks, completed_tasks
    FROM team_tasks
    WHERE project_id = COALESCE(NEW.project_id, OLD.project_id);

    IF total_tasks > 0 THEN
        new_progress := (completed_tasks * 100 / total_tasks);
        UPDATE team_projects
        SET progress = new_progress, updated_at = NOW()
        WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
    AFTER INSERT OR UPDATE OR DELETE ON team_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_progress();

-- Update last active timestamp
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE team_members
    SET last_active = NOW()
    WHERE id = NEW.member_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_last_active_communication
    AFTER INSERT ON team_communications
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_active();

CREATE TRIGGER trigger_update_member_last_active_time
    AFTER INSERT ON team_time_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_member_last_active();

-- Auto-expire invitations
CREATE OR REPLACE FUNCTION auto_expire_invitations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
        NEW.status := 'expired';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_expire_invitations
    BEFORE UPDATE ON team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION auto_expire_invitations();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_projects_updated_at
    BEFORE UPDATE ON team_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_tasks_updated_at
    BEFORE UPDATE ON team_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_meetings_updated_at
    BEFORE UPDATE ON team_meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_skills_updated_at
    BEFORE UPDATE ON team_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meeting_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_analytics ENABLE ROW LEVEL SECURITY;

-- Team members policies
CREATE POLICY "Users can view all team members"
    ON team_members FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile"
    ON team_members FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all members"
    ON team_members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Invitations policies
CREATE POLICY "Admins can manage invitations"
    ON team_invitations FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

CREATE POLICY "Users can view invitations sent to them"
    ON team_invitations FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Projects policies
CREATE POLICY "Team members can view projects"
    ON team_projects FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Project creators and admins can manage projects"
    ON team_projects FOR ALL
    USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Tasks policies
CREATE POLICY "Team members can view tasks"
    ON team_tasks FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Assigned members can update their tasks"
    ON team_tasks FOR UPDATE
    USING (
        assigned_to IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage all tasks"
    ON team_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM team_members
            WHERE user_id = auth.uid()
            AND permissions IN ('admin', 'owner')
        )
    );

-- Communications policies
CREATE POLICY "Users can view communications they sent or received"
    ON team_communications FOR SELECT
    USING (
        from_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM team_communication_recipients
            WHERE communication_id = team_communications.id
            AND member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Users can create communications"
    ON team_communications FOR INSERT
    WITH CHECK (
        from_member_id IN (SELECT id FROM team_members WHERE user_id = auth.uid())
    );

-- Other policies follow similar patterns...

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get team statistics
CREATE OR REPLACE FUNCTION get_team_statistics()
RETURNS TABLE (
    total_members BIGINT,
    online_members BIGINT,
    active_projects BIGINT,
    completed_tasks BIGINT,
    average_rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_members,
        COUNT(*) FILTER (WHERE status = 'online')::BIGINT as online_members,
        SUM(projects_count)::BIGINT as active_projects,
        SUM(completed_tasks)::BIGINT as completed_tasks,
        AVG(rating) as average_rating
    FROM team_members;
END;
$$ LANGUAGE plpgsql;

-- Search team members
CREATE OR REPLACE FUNCTION search_team_members(search_query TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    department department_type,
    email TEXT,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.department,
        tm.email,
        ts_rank(
            to_tsvector('english', tm.name || ' ' || tm.email || ' ' || COALESCE(tm.bio, '')),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM team_members tm
    WHERE to_tsvector('english', tm.name || ' ' || tm.email || ' ' || COALESCE(tm.bio, '')) @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Get member workload
CREATE OR REPLACE FUNCTION get_member_workload(member_uuid UUID)
RETURNS TABLE (
    total_tasks BIGINT,
    todo_tasks BIGINT,
    in_progress_tasks BIGINT,
    review_tasks BIGINT,
    completed_tasks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_tasks,
        COUNT(*) FILTER (WHERE status = 'todo')::BIGINT as todo_tasks,
        COUNT(*) FILTER (WHERE status = 'in-progress')::BIGINT as in_progress_tasks,
        COUNT(*) FILTER (WHERE status = 'review')::BIGINT as review_tasks,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_tasks
    FROM team_tasks
    WHERE assigned_to = member_uuid;
END;
$$ LANGUAGE plpgsql;

-- Get available members
CREATE OR REPLACE FUNCTION get_available_members()
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    department department_type,
    availability availability_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.department,
        tm.availability
    FROM team_members tm
    WHERE tm.status = 'online'
        AND tm.availability = 'Available'
    ORDER BY tm.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- Get department distribution
CREATE OR REPLACE FUNCTION get_department_distribution()
RETURNS TABLE (
    department department_type,
    member_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.department,
        COUNT(*)::BIGINT as member_count
    FROM team_members tm
    GROUP BY tm.department
    ORDER BY member_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Find members by skill
CREATE OR REPLACE FUNCTION find_members_by_skill(skill_name TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    role member_role,
    skills TEXT[],
    rating DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tm.id,
        tm.name,
        tm.role,
        tm.skills,
        tm.rating
    FROM team_members tm
    WHERE skill_name = ANY(tm.skills)
    ORDER BY tm.rating DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE team_members IS 'Team member profiles with roles, skills, and availability';
COMMENT ON TABLE team_invitations IS 'Pending team member invitations';
COMMENT ON TABLE team_projects IS 'Team projects and their status';
COMMENT ON TABLE team_tasks IS 'Tasks assigned to team members';
COMMENT ON TABLE team_performance_metrics IS 'Performance tracking for team members';
COMMENT ON TABLE team_meetings IS 'Team meetings and schedules';
COMMENT ON TABLE team_communications IS 'Team communications and messages';
COMMENT ON TABLE team_skills IS 'Individual skills with proficiency levels';
COMMENT ON TABLE team_time_tracking IS 'Time tracking for projects and tasks';
-- ============================================
-- TIME TRACKING SYSTEM MIGRATION
-- ============================================
-- Comprehensive database schema for time tracking with:
-- - Real-time timer tracking
-- - Manual time entries
-- - Project and task allocation
-- - Billable vs non-billable hours
-- - Time reports and analytics
-- - Budget tracking
-- - Team time tracking
-- - Invoice integration
-- - Productivity insights
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

DROP TYPE IF EXISTS entry_status CASCADE;
CREATE TYPE entry_status AS ENUM ('running', 'stopped', 'paused');
DROP TYPE IF EXISTS entry_type CASCADE;
CREATE TYPE entry_type AS ENUM ('timer', 'manual', 'imported');
DROP TYPE IF EXISTS rounding_mode CASCADE;
CREATE TYPE rounding_mode AS ENUM ('none', '15min', '30min', '1hour');
DROP TYPE IF EXISTS budget_type CASCADE;
CREATE TYPE budget_type AS ENUM ('hours', 'amount');
DROP TYPE IF EXISTS time_range_type CASCADE;
CREATE TYPE time_range_type AS ENUM ('today', 'yesterday', 'this-week', 'last-week', 'this-month', 'last-month', 'custom');
DROP TYPE IF EXISTS report_format CASCADE;
CREATE TYPE report_format AS ENUM ('csv', 'pdf', 'json', 'excel');

-- ============================================
-- TIME ENTRIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,
    project_name TEXT NOT NULL,
    task_id UUID NOT NULL,
    task_name TEXT NOT NULL,
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER NOT NULL DEFAULT 0, -- in seconds
    is_running BOOLEAN DEFAULT FALSE,
    is_paused BOOLEAN DEFAULT FALSE,
    status entry_status DEFAULT 'stopped',
    type entry_type DEFAULT 'timer',
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    tags TEXT[] DEFAULT '{}',
    client TEXT,
    location TEXT,
    device TEXT,
    pause_duration INTEGER DEFAULT 0,
    pause_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_status ON time_entries(status);
CREATE INDEX IF NOT EXISTS idx_time_entries_billable ON time_entries(billable);
CREATE INDEX IF NOT EXISTS idx_time_entries_tags ON time_entries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries((start_time::date));
CREATE INDEX IF NOT EXISTS idx_time_entries_running ON time_entries(user_id, is_running) WHERE is_running = TRUE;

-- Full-text search for time entries
CREATE INDEX IF NOT EXISTS idx_time_entries_search ON time_entries USING GIN(
    to_tsvector('english', description || ' ' || project_name || ' ' || task_name)
);

-- ============================================
-- TIME TRACKING PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_tracking_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    client TEXT,
    billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    budget DECIMAL(10, 2),
    budget_type budget_type,
    archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX IF NOT EXISTS idx_time_tracking_projects_user_id ON time_tracking_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_projects_archived ON time_tracking_projects(archived);
CREATE INDEX IF NOT EXISTS idx_time_tracking_projects_billable ON time_tracking_projects(billable);

-- ============================================
-- TIME TRACKING TASKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_tracking_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES time_tracking_projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_hours DECIMAL(10, 2),
    spent_hours DECIMAL(10, 2) DEFAULT 0,
    status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for tasks
CREATE INDEX IF NOT EXISTS idx_time_tracking_tasks_project_id ON time_tracking_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_time_tracking_tasks_status ON time_tracking_tasks(status);

-- ============================================
-- TIMER SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS timer_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    auto_start BOOLEAN DEFAULT FALSE,
    auto_stop BOOLEAN DEFAULT TRUE,
    idle_detection BOOLEAN DEFAULT TRUE,
    idle_threshold INTEGER DEFAULT 5, -- minutes
    reminder_enabled BOOLEAN DEFAULT TRUE,
    reminder_interval INTEGER DEFAULT 30, -- minutes
    rounding_mode rounding_mode DEFAULT 'none',
    week_start TEXT CHECK (week_start IN ('monday', 'sunday')) DEFAULT 'monday',
    time_format TEXT CHECK (time_format IN ('12h', '24h')) DEFAULT '12h',
    default_billable BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for timer settings
CREATE INDEX IF NOT EXISTS idx_timer_settings_user_id ON timer_settings(user_id);

-- ============================================
-- TIME REPORTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    format report_format,
    total_duration INTEGER,
    billable_duration INTEGER,
    total_amount DECIMAL(10, 2),
    project_breakdown JSONB DEFAULT '[]',
    task_breakdown JSONB DEFAULT '[]',
    daily_summary JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for reports
CREATE INDEX IF NOT EXISTS idx_time_reports_user_id ON time_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_time_reports_date_range ON time_reports(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_reports_generated_at ON time_reports(generated_at DESC);

-- ============================================
-- TIME ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period time_range_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    productive_hours DECIMAL(10, 2) DEFAULT 0,
    average_hours_per_day DECIMAL(10, 2) DEFAULT 0,
    most_productive_day TEXT,
    most_productive_hour INTEGER,
    top_projects JSONB DEFAULT '[]',
    top_tasks JSONB DEFAULT '[]',
    trends JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_time_analytics_user_id ON time_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_time_analytics_period ON time_analytics(period);
CREATE INDEX IF NOT EXISTS idx_time_analytics_date_range ON time_analytics(period_start, period_end);

-- ============================================
-- WEEKLY SUMMARIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    daily_hours DECIMAL(10, 2)[] DEFAULT '{}',
    comparison_hours DECIMAL(10, 2),
    comparison_percentage DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for weekly summaries
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_id ON weekly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_week_start ON weekly_summaries(week_start DESC);

-- ============================================
-- MONTHLY SUMMARIES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS monthly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_hours DECIMAL(10, 2) DEFAULT 0,
    billable_hours DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    working_days INTEGER DEFAULT 0,
    average_hours_per_day DECIMAL(10, 2) DEFAULT 0,
    top_projects JSONB DEFAULT '[]',
    comparison_hours DECIMAL(10, 2),
    comparison_percentage DECIMAL(5, 2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for monthly summaries
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_user_id ON monthly_summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summaries_year_month ON monthly_summaries(year DESC, month DESC);

-- ============================================
-- EDIT HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS time_entry_edits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
    edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for edit history
CREATE INDEX IF NOT EXISTS idx_time_entry_edits_entry_id ON time_entry_edits(entry_id);
CREATE INDEX IF NOT EXISTS idx_time_entry_edits_edited_by ON time_entry_edits(edited_by);
CREATE INDEX IF NOT EXISTS idx_time_entry_edits_edited_at ON time_entry_edits(edited_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update task spent hours when time entry is added/updated
CREATE OR REPLACE FUNCTION update_task_spent_hours()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE time_tracking_tasks
    SET spent_hours = (
        SELECT COALESCE(SUM(duration) / 3600.0, 0)
        FROM time_entries
        WHERE task_id = NEW.task_id
    )
    WHERE id = NEW.task_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_spent_hours
    AFTER INSERT OR UPDATE OF duration ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_task_spent_hours();

-- Prevent multiple running timers per user
CREATE OR REPLACE FUNCTION prevent_multiple_running_timers()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_running = TRUE THEN
        -- Stop all other running timers for this user
        UPDATE time_entries
        SET is_running = FALSE, status = 'stopped'
        WHERE user_id = NEW.user_id
            AND id != NEW.id
            AND is_running = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_prevent_multiple_running_timers
    BEFORE INSERT OR UPDATE OF is_running ON time_entries
    FOR EACH ROW
    WHEN (NEW.is_running = TRUE)
    EXECUTE FUNCTION prevent_multiple_running_timers();

-- Auto-calculate duration on end_time update
CREATE OR REPLACE FUNCTION auto_calculate_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_calculate_duration
    BEFORE INSERT OR UPDATE OF end_time ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION auto_calculate_duration();

-- Log time entry edits
CREATE OR REPLACE FUNCTION log_time_entry_edits()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.description != NEW.description THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'description', OLD.description, NEW.description);
    END IF;

    IF OLD.duration != NEW.duration THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'duration', OLD.duration::TEXT, NEW.duration::TEXT);
    END IF;

    IF OLD.billable != NEW.billable THEN
        INSERT INTO time_entry_edits (entry_id, edited_by, field, old_value, new_value)
        VALUES (NEW.id, NEW.user_id, 'billable', OLD.billable::TEXT, NEW.billable::TEXT);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_time_entry_edits
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION log_time_entry_edits();

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_entries_updated_at
    BEFORE UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_projects_updated_at
    BEFORE UPDATE ON time_tracking_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_tracking_tasks_updated_at
    BEFORE UPDATE ON time_tracking_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timer_settings_updated_at
    BEFORE UPDATE ON timer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_tracking_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entry_edits ENABLE ROW LEVEL SECURITY;

-- Time entries policies
CREATE POLICY "Users can view their own time entries"
    ON time_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own time entries"
    ON time_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries"
    ON time_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries"
    ON time_entries FOR DELETE
    USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can manage their own projects"
    ON time_tracking_projects FOR ALL
    USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage tasks in their projects"
    ON time_tracking_tasks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM time_tracking_projects
            WHERE id = time_tracking_tasks.project_id
            AND user_id = auth.uid()
        )
    );

-- Timer settings policies
CREATE POLICY "Users can manage their own timer settings"
    ON timer_settings FOR ALL
    USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can manage their own reports"
    ON time_reports FOR ALL
    USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
    ON time_analytics FOR SELECT
    USING (auth.uid() = user_id);

-- Summaries policies
CREATE POLICY "Users can view their own weekly summaries"
    ON weekly_summaries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own monthly summaries"
    ON monthly_summaries FOR SELECT
    USING (auth.uid() = user_id);

-- Edit history policies
CREATE POLICY "Users can view edit history of their entries"
    ON time_entry_edits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM time_entries
            WHERE id = time_entry_edits.entry_id
            AND user_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get total duration for user
CREATE OR REPLACE FUNCTION get_total_duration(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_seconds INTEGER;
BEGIN
    SELECT COALESCE(SUM(duration), 0)
    INTO total_seconds
    FROM time_entries
    WHERE user_id = user_uuid
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_seconds / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- Get billable duration
CREATE OR REPLACE FUNCTION get_billable_duration(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_seconds INTEGER;
BEGIN
    SELECT COALESCE(SUM(duration), 0)
    INTO total_seconds
    FROM time_entries
    WHERE user_id = user_uuid
        AND billable = TRUE
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_seconds / 3600.0;
END;
$$ LANGUAGE plpgsql;

-- Get total amount earned
CREATE OR REPLACE FUNCTION get_total_amount(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS DECIMAL AS $$
DECLARE
    total_amount DECIMAL(10, 2);
BEGIN
    SELECT COALESCE(SUM((duration / 3600.0) * hourly_rate), 0)
    INTO total_amount
    FROM time_entries
    WHERE user_id = user_uuid
        AND billable = TRUE
        AND hourly_rate IS NOT NULL
        AND start_time::date BETWEEN start_date AND end_date;

    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- Get project breakdown
CREATE OR REPLACE FUNCTION get_project_breakdown(
    user_uuid UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    project_id UUID,
    project_name TEXT,
    duration DECIMAL,
    billable_duration DECIMAL,
    amount DECIMAL,
    entry_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.project_id,
        te.project_name,
        SUM(te.duration) / 3600.0 as duration,
        SUM(CASE WHEN te.billable THEN te.duration ELSE 0 END) / 3600.0 as billable_duration,
        COALESCE(SUM(CASE WHEN te.billable AND te.hourly_rate IS NOT NULL
            THEN (te.duration / 3600.0) * te.hourly_rate
            ELSE 0 END), 0) as amount,
        COUNT(*)::BIGINT as entry_count
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND te.start_time::date BETWEEN start_date AND end_date
    GROUP BY te.project_id, te.project_name
    ORDER BY duration DESC;
END;
$$ LANGUAGE plpgsql;

-- Get running timer for user
CREATE OR REPLACE FUNCTION get_running_timer(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_name TEXT,
    task_name TEXT,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    elapsed_seconds INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.id,
        te.project_name,
        te.task_name,
        te.description,
        te.start_time,
        EXTRACT(EPOCH FROM (NOW() - te.start_time))::INTEGER as elapsed_seconds
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND te.is_running = TRUE
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Get project budget status
CREATE OR REPLACE FUNCTION get_project_budget_status(project_uuid UUID)
RETURNS TABLE (
    spent DECIMAL,
    budget DECIMAL,
    remaining DECIMAL,
    percentage DECIMAL,
    over_budget BOOLEAN
) AS $$
DECLARE
    project_record RECORD;
    spent_value DECIMAL;
BEGIN
    SELECT * INTO project_record
    FROM time_tracking_projects
    WHERE id = project_uuid;

    IF project_record.budget_type = 'hours' THEN
        SELECT COALESCE(SUM(duration) / 3600.0, 0)
        INTO spent_value
        FROM time_entries
        WHERE project_id = project_uuid;
    ELSE
        SELECT COALESCE(SUM((duration / 3600.0) * hourly_rate), 0)
        INTO spent_value
        FROM time_entries
        WHERE project_id = project_uuid
            AND billable = TRUE
            AND hourly_rate IS NOT NULL;
    END IF;

    RETURN QUERY
    SELECT
        spent_value as spent,
        project_record.budget as budget,
        GREATEST(project_record.budget - spent_value, 0) as remaining,
        CASE
            WHEN project_record.budget > 0 THEN (spent_value / project_record.budget) * 100
            ELSE 0
        END as percentage,
        spent_value > project_record.budget as over_budget;
END;
$$ LANGUAGE plpgsql;

-- Search time entries
CREATE OR REPLACE FUNCTION search_time_entries(
    user_uuid UUID,
    search_query TEXT
)
RETURNS TABLE (
    id UUID,
    project_name TEXT,
    task_name TEXT,
    description TEXT,
    duration INTEGER,
    start_time TIMESTAMP WITH TIME ZONE,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        te.id,
        te.project_name,
        te.task_name,
        te.description,
        te.duration,
        te.start_time,
        ts_rank(
            to_tsvector('english', te.description || ' ' || te.project_name || ' ' || te.task_name),
            plainto_tsquery('english', search_query)
        ) as rank
    FROM time_entries te
    WHERE te.user_id = user_uuid
        AND to_tsvector('english', te.description || ' ' || te.project_name || ' ' || te.task_name)
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC, te.start_time DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE time_entries IS 'Individual time tracking entries with timer support';
COMMENT ON TABLE time_tracking_projects IS 'Projects for organizing time entries';
COMMENT ON TABLE time_tracking_tasks IS 'Tasks within projects for detailed tracking';
COMMENT ON TABLE timer_settings IS 'User preferences for timer behavior';
COMMENT ON TABLE time_reports IS 'Generated time reports with summaries';
COMMENT ON TABLE time_analytics IS 'Analytics and insights on time usage';
COMMENT ON TABLE weekly_summaries IS 'Weekly time tracking summaries';
COMMENT ON TABLE monthly_summaries IS 'Monthly time tracking summaries';
COMMENT ON TABLE time_entry_edits IS 'Audit log of changes to time entries';
-- =====================================================
-- VIDEO STUDIO SYSTEM MIGRATION
-- =====================================================
-- Session 8: Video Studio Comprehensive Database Schema
-- Created: 2024-11-26
--
-- Tables: 14
-- Enums: 8
-- Indexes: 35+
-- RLS Policies: 28+
-- Triggers: 10+
-- Helper Functions: 6+
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS video_status CASCADE;
CREATE TYPE video_status AS ENUM ('draft', 'processing', 'ready', 'published', 'archived');
DROP TYPE IF EXISTS video_quality CASCADE;
CREATE TYPE video_quality AS ENUM ('low', 'medium', 'high', 'ultra', '4k', '8k');
DROP TYPE IF EXISTS asset_type CASCADE;
CREATE TYPE asset_type AS ENUM ('video', 'audio', 'image', 'font', 'transition', 'effect', 'overlay');
DROP TYPE IF EXISTS recording_type CASCADE;
CREATE TYPE recording_type AS ENUM ('screen', 'webcam', 'both', 'audio');
DROP TYPE IF EXISTS export_format CASCADE;
CREATE TYPE export_format AS ENUM ('mp4', 'mov', 'webm', 'avi', 'mkv');
DROP TYPE IF EXISTS timeline_item_type CASCADE;
CREATE TYPE timeline_item_type AS ENUM ('video', 'audio', 'image', 'text', 'transition', 'effect');
DROP TYPE IF EXISTS caption_format CASCADE;
CREATE TYPE caption_format AS ENUM ('srt', 'vtt', 'ass', 'json');
DROP TYPE IF EXISTS transcription_status CASCADE;
CREATE TYPE transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- =====================================================
-- TABLES
-- =====================================================

-- Video Projects Table
CREATE TABLE IF NOT EXISTS video_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL DEFAULT 0, -- in seconds
  resolution TEXT NOT NULL DEFAULT '1920x1080',
  format export_format NOT NULL DEFAULT 'mp4',
  file_size BIGINT DEFAULT 0, -- in bytes
  file_path TEXT,
  thumbnail_path TEXT,
  status video_status NOT NULL DEFAULT 'draft',

  -- Engagement metrics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Video metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,

  -- Full-text search
  search_vector tsvector
);

-- Video Templates Table
CREATE TABLE IF NOT EXISTS video_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  resolution TEXT NOT NULL DEFAULT '1920x1080',
  thumbnail_path TEXT,
  preview_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10, 2),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0.0,
  reviews_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Video Assets Table
CREATE TABLE IF NOT EXISTS video_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type asset_type NOT NULL,
  duration INTEGER, -- in seconds (null for images/fonts)
  file_size BIGINT NOT NULL,
  format TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Timeline Items Table
CREATE TABLE IF NOT EXISTS video_timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES video_assets(id) ON DELETE SET NULL,
  type timeline_item_type NOT NULL,
  layer INTEGER NOT NULL DEFAULT 0,
  start_time INTEGER NOT NULL, -- in milliseconds
  end_time INTEGER NOT NULL, -- in milliseconds
  duration INTEGER NOT NULL, -- in milliseconds
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Effects Table
CREATE TABLE IF NOT EXISTS video_effects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  timeline_item_id UUID REFERENCES video_timeline_items(id) ON DELETE CASCADE,
  effect_type TEXT NOT NULL, -- 'color', 'blur', 'sharpen', 'transition', etc.
  effect_name TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  start_time INTEGER, -- in milliseconds
  end_time INTEGER, -- in milliseconds
  intensity DECIMAL(3, 2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Annotations Table
CREATE TABLE IF NOT EXISTS video_annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp INTEGER NOT NULL, -- in milliseconds
  annotation_type TEXT NOT NULL CHECK (annotation_type IN ('drawing', 'text', 'arrow', 'shape')),
  data JSONB NOT NULL, -- SVG data, text content, coordinates, etc.
  color TEXT DEFAULT '#FF0000',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Transcripts Table
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  status transcription_status NOT NULL DEFAULT 'pending',
  language TEXT NOT NULL DEFAULT 'en',
  text TEXT,
  timestamps JSONB DEFAULT '[]', -- Array of {start, end, text} objects
  confidence DECIMAL(3, 2), -- 0.00 to 1.00
  ai_provider TEXT, -- 'openai', 'deepgram', etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Video Captions Table
CREATE TABLE IF NOT EXISTS video_captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  format caption_format NOT NULL DEFAULT 'srt',
  file_path TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Video Analytics Table
CREATE TABLE IF NOT EXISTS video_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,

  -- View metrics
  watch_duration INTEGER NOT NULL, -- in seconds
  completion_percentage DECIMAL(5, 2),
  is_completed BOOLEAN DEFAULT false,

  -- Engagement
  liked BOOLEAN DEFAULT false,
  disliked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  downloaded BOOLEAN DEFAULT false,

  -- Context
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  browser TEXT,
  country TEXT,
  referrer TEXT,

  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Comments Table
CREATE TABLE IF NOT EXISTS video_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES video_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  timestamp INTEGER, -- in milliseconds (for timestamp-specific comments)
  likes INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Shares Table
CREATE TABLE IF NOT EXISTS video_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform TEXT NOT NULL, -- 'email', 'twitter', 'facebook', 'linkedin', etc.
  share_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Exports Table
CREATE TABLE IF NOT EXISTS video_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format export_format NOT NULL,
  quality video_quality NOT NULL,
  resolution TEXT NOT NULL,
  file_size BIGINT,
  file_path TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  error_message TEXT,
  progress INTEGER DEFAULT 0, -- 0-100
  export_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Video Collaborators Table
CREATE TABLE IF NOT EXISTS video_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer', 'commenter')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Video Versions Table
CREATE TABLE IF NOT EXISTS video_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES video_projects(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title TEXT,
  description TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  duration INTEGER NOT NULL,
  thumbnail_path TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, version_number)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- video_projects indexes
CREATE INDEX IF NOT EXISTS idx_video_projects_user ON video_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_client ON video_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_project ON video_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_video_projects_status ON video_projects(status);
CREATE INDEX IF NOT EXISTS idx_video_projects_category ON video_projects(category);
CREATE INDEX IF NOT EXISTS idx_video_projects_created ON video_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_projects_views ON video_projects(views DESC);
CREATE INDEX IF NOT EXISTS idx_video_projects_search ON video_projects USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_video_projects_tags ON video_projects USING GIN(tags);

-- video_templates indexes
CREATE INDEX IF NOT EXISTS idx_video_templates_category ON video_templates(category);
CREATE INDEX IF NOT EXISTS idx_video_templates_premium ON video_templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_video_templates_rating ON video_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_video_templates_usage ON video_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_video_templates_tags ON video_templates USING GIN(tags);

-- video_assets indexes
CREATE INDEX IF NOT EXISTS idx_video_assets_user ON video_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_video_assets_type ON video_assets(type);
CREATE INDEX IF NOT EXISTS idx_video_assets_category ON video_assets(category);
CREATE INDEX IF NOT EXISTS idx_video_assets_created ON video_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_assets_tags ON video_assets USING GIN(tags);

-- video_timeline_items indexes
CREATE INDEX IF NOT EXISTS idx_video_timeline_project ON video_timeline_items(project_id);
CREATE INDEX IF NOT EXISTS idx_video_timeline_asset ON video_timeline_items(asset_id);
CREATE INDEX IF NOT EXISTS idx_video_timeline_type ON video_timeline_items(type);
CREATE INDEX IF NOT EXISTS idx_video_timeline_layer ON video_timeline_items(layer);

-- video_effects indexes
CREATE INDEX IF NOT EXISTS idx_video_effects_project ON video_effects(project_id);
CREATE INDEX IF NOT EXISTS idx_video_effects_timeline_item ON video_effects(timeline_item_id);
CREATE INDEX IF NOT EXISTS idx_video_effects_type ON video_effects(effect_type);

-- video_annotations indexes
CREATE INDEX IF NOT EXISTS idx_video_annotations_project ON video_annotations(project_id);
CREATE INDEX IF NOT EXISTS idx_video_annotations_user ON video_annotations(user_id);
CREATE INDEX IF NOT EXISTS idx_video_annotations_timestamp ON video_annotations(timestamp);

-- video_transcripts indexes
CREATE INDEX IF NOT EXISTS idx_video_transcripts_project ON video_transcripts(project_id);
CREATE INDEX IF NOT EXISTS idx_video_transcripts_status ON video_transcripts(status);
CREATE INDEX IF NOT EXISTS idx_video_transcripts_language ON video_transcripts(language);

-- video_captions indexes
CREATE INDEX IF NOT EXISTS idx_video_captions_project ON video_captions(project_id);
CREATE INDEX IF NOT EXISTS idx_video_captions_language ON video_captions(language);

-- video_analytics indexes
CREATE INDEX IF NOT EXISTS idx_video_analytics_project ON video_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_user ON video_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analytics_created ON video_analytics(created_at DESC);

-- video_comments indexes
CREATE INDEX IF NOT EXISTS idx_video_comments_project ON video_comments(project_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_user ON video_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_video_comments_parent ON video_comments(parent_id);

-- video_shares indexes
CREATE INDEX IF NOT EXISTS idx_video_shares_project ON video_shares(project_id);
CREATE INDEX IF NOT EXISTS idx_video_shares_platform ON video_shares(platform);

-- video_exports indexes
CREATE INDEX IF NOT EXISTS idx_video_exports_project ON video_exports(project_id);
CREATE INDEX IF NOT EXISTS idx_video_exports_user ON video_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_video_exports_status ON video_exports(status);

-- video_collaborators indexes
CREATE INDEX IF NOT EXISTS idx_video_collaborators_project ON video_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_video_collaborators_user ON video_collaborators(user_id);

-- video_versions indexes
CREATE INDEX IF NOT EXISTS idx_video_versions_project ON video_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_video_versions_created ON video_versions(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_templates_updated_at
  BEFORE UPDATE ON video_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_assets_updated_at
  BEFORE UPDATE ON video_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_timeline_items_updated_at
  BEFORE UPDATE ON video_timeline_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_effects_updated_at
  BEFORE UPDATE ON video_effects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_annotations_updated_at
  BEFORE UPDATE ON video_annotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_transcripts_updated_at
  BEFORE UPDATE ON video_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_captions_updated_at
  BEFORE UPDATE ON video_captions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_exports_updated_at
  BEFORE UPDATE ON video_exports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Search vector trigger
CREATE OR REPLACE FUNCTION update_video_projects_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.title, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(array_to_string(NEW.tags, ' '), '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_projects_search_vector_update
  BEFORE INSERT OR UPDATE ON video_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_video_projects_search_vector();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE video_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_captions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_versions ENABLE ROW LEVEL SECURITY;

-- video_projects policies
CREATE POLICY video_projects_select ON video_projects FOR SELECT
  USING (
    user_id = auth.uid() OR
    status = 'published' OR
    EXISTS (
      SELECT 1 FROM video_collaborators vc
      WHERE vc.project_id = video_projects.id
      AND vc.user_id = auth.uid()
    )
  );

CREATE POLICY video_projects_insert ON video_projects FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY video_projects_update ON video_projects FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM video_collaborators vc
      WHERE vc.project_id = video_projects.id
      AND vc.user_id = auth.uid()
      AND vc.role IN ('owner', 'editor')
    )
  );

CREATE POLICY video_projects_delete ON video_projects FOR DELETE
  USING (user_id = auth.uid());

-- video_templates policies (public read, admin write)
CREATE POLICY video_templates_select ON video_templates FOR SELECT
  USING (true);

-- video_assets policies
CREATE POLICY video_assets_select ON video_assets FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY video_assets_insert ON video_assets FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY video_assets_delete ON video_assets FOR DELETE
  USING (user_id = auth.uid());

-- video_timeline_items policies
CREATE POLICY video_timeline_items_all ON video_timeline_items
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_timeline_items.project_id
      AND (
        vp.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM video_collaborators vc
          WHERE vc.project_id = vp.id
          AND vc.user_id = auth.uid()
          AND vc.role IN ('owner', 'editor')
        )
      )
    )
  );

-- video_effects policies
CREATE POLICY video_effects_all ON video_effects
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_effects.project_id
      AND (
        vp.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM video_collaborators vc
          WHERE vc.project_id = vp.id
          AND vc.user_id = auth.uid()
          AND vc.role IN ('owner', 'editor')
        )
      )
    )
  );

-- video_annotations policies
CREATE POLICY video_annotations_select ON video_annotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_annotations.project_id
      AND (
        vp.user_id = auth.uid() OR
        vp.status = 'published' OR
        EXISTS (
          SELECT 1 FROM video_collaborators vc
          WHERE vc.project_id = vp.id
          AND vc.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY video_annotations_insert ON video_annotations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- video_transcripts policies
CREATE POLICY video_transcripts_select ON video_transcripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_transcripts.project_id
      AND (vp.user_id = auth.uid() OR vp.status = 'published')
    )
  );

-- video_captions policies
CREATE POLICY video_captions_select ON video_captions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_captions.project_id
      AND (vp.user_id = auth.uid() OR vp.status = 'published')
    )
  );

-- video_analytics policies
CREATE POLICY video_analytics_insert ON video_analytics FOR INSERT
  WITH CHECK (true); -- Anyone can create analytics

CREATE POLICY video_analytics_select ON video_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_analytics.project_id
      AND vp.user_id = auth.uid()
    )
  );

-- video_comments policies
CREATE POLICY video_comments_select ON video_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_comments.project_id
      AND (vp.status = 'published' OR vp.user_id = auth.uid())
    )
  );

CREATE POLICY video_comments_insert ON video_comments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY video_comments_update ON video_comments FOR UPDATE
  USING (user_id = auth.uid());

-- video_shares policies
CREATE POLICY video_shares_insert ON video_shares FOR INSERT
  WITH CHECK (true);

-- video_exports policies
CREATE POLICY video_exports_select ON video_exports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY video_exports_insert ON video_exports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- video_collaborators policies
CREATE POLICY video_collaborators_select ON video_collaborators FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_collaborators.project_id
      AND vp.user_id = auth.uid()
    )
  );

CREATE POLICY video_collaborators_insert ON video_collaborators FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_collaborators.project_id
      AND vp.user_id = auth.uid()
    )
  );

-- video_versions policies
CREATE POLICY video_versions_select ON video_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM video_projects vp
      WHERE vp.id = video_versions.project_id
      AND (
        vp.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM video_collaborators vc
          WHERE vc.project_id = vp.id
          AND vc.user_id = auth.uid()
        )
      )
    )
  );

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get project analytics summary
CREATE OR REPLACE FUNCTION get_video_project_analytics(p_project_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(*),
    'unique_views', COUNT(DISTINCT user_id),
    'average_watch_time', AVG(watch_duration),
    'completion_rate', AVG(completion_percentage),
    'total_likes', SUM(CASE WHEN liked THEN 1 ELSE 0 END),
    'total_shares', SUM(CASE WHEN shared THEN 1 ELSE 0 END),
    'total_downloads', SUM(CASE WHEN downloaded THEN 1 ELSE 0 END)
  ) INTO v_result
  FROM video_analytics
  WHERE project_id = p_project_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update project view count
CREATE OR REPLACE FUNCTION increment_video_views(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE video_projects
  SET views = views + 1
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's video statistics
CREATE OR REPLACE FUNCTION get_user_video_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_projects', COUNT(*),
    'total_views', COALESCE(SUM(views), 0),
    'total_likes', COALESCE(SUM(likes), 0),
    'total_duration', COALESCE(SUM(duration), 0),
    'total_storage', COALESCE(SUM(file_size), 0),
    'published_count', COUNT(*) FILTER (WHERE status = 'published'),
    'draft_count', COUNT(*) FILTER (WHERE status = 'draft')
  ) INTO v_result
  FROM video_projects
  WHERE user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 14
-- Enums created: 8
-- Indexes created: 40+
-- RLS policies: 28+
-- Triggers: 11
-- Helper functions: 3
-- =====================================================
-- ========================================
-- VOICE COLLABORATION SYSTEM MIGRATION
-- ========================================
--
-- Comprehensive database schema for Voice Collaboration
--
-- Features:
-- - 10+ tables for complete voice room management
-- - 5+ enums for type safety
-- - 25+ indexes for performance
-- - 20+ RLS policies for security
-- - 5+ triggers for automation
-- - 3+ helper functions
--
-- Tables:
-- 1. voice_rooms - Main rooms table
-- 2. voice_participants - Participant tracking
-- 3. voice_recordings - Recording metadata
-- 4. voice_transcriptions - AI transcription results
-- 5. voice_room_settings - Per-room audio settings
-- 6. voice_room_invites - Room invitation system
-- 7. voice_analytics - Room analytics tracking
-- 8. voice_participant_stats - Speaking time, engagement
-- 9. voice_room_schedules - Scheduled rooms
-- 10. voice_room_reactions - Emoji reactions during calls
-- 11. voice_room_chat - Text chat within voice rooms
-- 12. voice_room_files - File sharing in rooms

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS room_type CASCADE;
CREATE TYPE room_type AS ENUM ('public', 'private', 'team', 'client', 'project', 'meeting');
DROP TYPE IF EXISTS room_status CASCADE;
CREATE TYPE room_status AS ENUM ('active', 'scheduled', 'ended', 'archived');
DROP TYPE IF EXISTS audio_quality CASCADE;
CREATE TYPE audio_quality AS ENUM ('low', 'medium', 'high', 'ultra');
DROP TYPE IF EXISTS participant_role CASCADE;
CREATE TYPE participant_role AS ENUM ('host', 'moderator', 'speaker', 'listener');
DROP TYPE IF EXISTS participant_status CASCADE;
CREATE TYPE participant_status AS ENUM ('speaking', 'muted', 'listening', 'away');
DROP TYPE IF EXISTS recording_status CASCADE;
CREATE TYPE recording_status AS ENUM ('completed', 'processing', 'failed');
DROP TYPE IF EXISTS recording_format CASCADE;
CREATE TYPE recording_format AS ENUM ('mp3', 'wav', 'ogg', 'flac');
DROP TYPE IF EXISTS invite_status CASCADE;
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
DROP TYPE IF EXISTS reaction_type CASCADE;
CREATE TYPE reaction_type AS ENUM ('like', 'love', 'laugh', 'clap', 'thinking', 'celebrate');

-- ========================================
-- TABLES
-- ========================================

-- 1. Voice Rooms Table
CREATE TABLE IF NOT EXISTS voice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type room_type NOT NULL DEFAULT 'team',
  status room_status NOT NULL DEFAULT 'active',
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capacity INTEGER NOT NULL DEFAULT 10 CHECK (capacity > 0 AND capacity <= 1000),
  current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
  quality audio_quality NOT NULL DEFAULT 'high',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  password_hash VARCHAR(255), -- Hashed password for locked rooms
  scheduled_time TIMESTAMPTZ,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  is_recording BOOLEAN NOT NULL DEFAULT false,

  -- Features
  recording_enabled BOOLEAN NOT NULL DEFAULT true,
  transcription_enabled BOOLEAN NOT NULL DEFAULT false,
  spatial_audio_enabled BOOLEAN NOT NULL DEFAULT false,
  noise_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  echo_cancellation_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_gain_control_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Metadata
  category VARCHAR(100),
  tags TEXT[], -- Array of tags

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_scheduled_time CHECK (scheduled_time IS NULL OR scheduled_time > created_at),
  CONSTRAINT valid_capacity CHECK (current_participants <= capacity),
  CONSTRAINT locked_rooms_have_password CHECK (NOT is_locked OR password_hash IS NOT NULL)
);

-- 2. Voice Participants Table
CREATE TABLE IF NOT EXISTS voice_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role participant_role NOT NULL DEFAULT 'listener',
  status participant_status NOT NULL DEFAULT 'listening',
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_video_enabled BOOLEAN NOT NULL DEFAULT false,

  -- Session tracking
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER DEFAULT 0 CHECK (duration_seconds >= 0),
  speaking_time_seconds INTEGER DEFAULT 0 CHECK (speaking_time_seconds >= 0),

  -- Connection info
  connection_quality VARCHAR(50), -- 'excellent', 'good', 'fair', 'poor'
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  device_type VARCHAR(50), -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(100),
  ip_address INET,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(room_id, user_id), -- One user can only be in a room once at a time
  CONSTRAINT valid_speaking_time CHECK (speaking_time_seconds <= duration_seconds),
  CONSTRAINT valid_left_at CHECK (left_at IS NULL OR left_at >= joined_at)
);

-- 3. Voice Recordings Table
CREATE TABLE IF NOT EXISTS voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- File information
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
  format recording_format NOT NULL DEFAULT 'mp3',
  quality audio_quality NOT NULL DEFAULT 'high',

  -- Audio metadata
  sample_rate INTEGER NOT NULL DEFAULT 44100,
  bitrate INTEGER NOT NULL DEFAULT 192,
  channels INTEGER NOT NULL DEFAULT 2 CHECK (channels IN (1, 2)),

  -- Status
  status recording_status NOT NULL DEFAULT 'processing',
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Transcription
  transcription_available BOOLEAN NOT NULL DEFAULT false,
  transcription_text TEXT,
  transcription_language VARCHAR(10),

  -- Statistics
  participant_count INTEGER NOT NULL DEFAULT 0 CHECK (participant_count >= 0),
  download_count INTEGER NOT NULL DEFAULT 0 CHECK (download_count >= 0),
  view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0),

  -- Timestamps
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_end_time CHECK (end_time > start_time)
);

-- 4. Voice Transcriptions Table
CREATE TABLE IF NOT EXISTS voice_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES voice_recordings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transcription data
  full_text TEXT NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  confidence_score DECIMAL(5, 4) CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Segments with timestamps
  segments JSONB, -- Array of { start, end, text, speaker }

  -- AI processing
  ai_model VARCHAR(100),
  processing_time_ms INTEGER,

  -- Features
  speakers_identified INTEGER DEFAULT 0,
  keywords TEXT[], -- Extracted keywords
  summary TEXT, -- AI-generated summary

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Voice Room Settings Table
CREATE TABLE IF NOT EXISTS voice_room_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Audio settings
  default_quality audio_quality NOT NULL DEFAULT 'high',
  max_bitrate INTEGER DEFAULT 320,
  sample_rate INTEGER DEFAULT 48000,

  -- Participant settings
  require_approval BOOLEAN NOT NULL DEFAULT false,
  allow_guest_join BOOLEAN NOT NULL DEFAULT true,
  mute_on_join BOOLEAN NOT NULL DEFAULT false,

  -- Recording settings
  auto_record BOOLEAN NOT NULL DEFAULT false,
  auto_transcribe BOOLEAN NOT NULL DEFAULT false,
  save_chat BOOLEAN NOT NULL DEFAULT true,

  -- Notifications
  notify_on_join BOOLEAN NOT NULL DEFAULT true,
  notify_on_leave BOOLEAN NOT NULL DEFAULT false,
  notify_on_recording_ready BOOLEAN NOT NULL DEFAULT true,

  -- Advanced features
  enable_virtual_background BOOLEAN NOT NULL DEFAULT false,
  enable_noise_suppression BOOLEAN NOT NULL DEFAULT true,
  enable_echo_cancellation BOOLEAN NOT NULL DEFAULT true,
  enable_auto_gain_control BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Voice Room Invites Table
CREATE TABLE IF NOT EXISTS voice_room_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_email VARCHAR(255), -- For non-users

  status invite_status NOT NULL DEFAULT 'pending',
  invite_code VARCHAR(50) UNIQUE, -- For shareable links

  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT recipient_required CHECK (recipient_id IS NOT NULL OR recipient_email IS NOT NULL),
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- 7. Voice Analytics Table
CREATE TABLE IF NOT EXISTS voice_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Engagement metrics
  total_participants INTEGER NOT NULL DEFAULT 0,
  max_concurrent_participants INTEGER NOT NULL DEFAULT 0,
  average_duration_seconds INTEGER,
  total_speaking_time_seconds INTEGER DEFAULT 0,

  -- Quality metrics
  average_connection_quality DECIMAL(3, 2),
  dropped_connections INTEGER DEFAULT 0,
  reconnections INTEGER DEFAULT 0,

  -- Recording metrics
  recordings_count INTEGER DEFAULT 0,
  total_recording_duration_seconds INTEGER DEFAULT 0,
  transcriptions_count INTEGER DEFAULT 0,

  -- Interaction metrics
  messages_sent INTEGER DEFAULT 0,
  files_shared INTEGER DEFAULT 0,
  reactions_sent INTEGER DEFAULT 0,

  -- Performance
  average_latency_ms INTEGER,
  packet_loss_percentage DECIMAL(5, 2),

  -- Timestamps
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_period CHECK (period_end > period_start)
);

-- 8. Voice Participant Stats Table
CREATE TABLE IF NOT EXISTS voice_participant_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES voice_participants(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Speaking statistics
  total_speaking_time_seconds INTEGER NOT NULL DEFAULT 0,
  speaking_turns INTEGER NOT NULL DEFAULT 0,
  average_speaking_duration_seconds INTEGER,

  -- Engagement
  messages_sent INTEGER NOT NULL DEFAULT 0,
  reactions_sent INTEGER NOT NULL DEFAULT 0,
  files_shared INTEGER NOT NULL DEFAULT 0,

  -- Audio quality
  microphone_issues_count INTEGER DEFAULT 0,
  audio_dropouts INTEGER DEFAULT 0,

  -- Session info
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(participant_id, session_date)
);

-- 9. Voice Room Schedules Table
CREATE TABLE IF NOT EXISTS voice_room_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,

  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(100) NOT NULL DEFAULT 'UTC',

  -- Recurrence
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurrence_pattern VARCHAR(50), -- 'daily', 'weekly', 'monthly'
  recurrence_end_date DATE,

  -- Reminders
  remind_before_minutes INTEGER DEFAULT 15,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,

  -- Status
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_schedule CHECK (scheduled_end > scheduled_start)
);

-- 10. Voice Room Reactions Table
CREATE TABLE IF NOT EXISTS voice_room_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  reaction_type reaction_type NOT NULL,

  -- Context
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- React to specific participant
  timestamp_offset_seconds INTEGER, -- Position in recording/stream

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Voice Room Chat Table
CREATE TABLE IF NOT EXISTS voice_room_chat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type VARCHAR(50) NOT NULL DEFAULT 'text', -- 'text', 'system', 'file'

  -- Reply threading
  reply_to_id UUID REFERENCES voice_room_chat(id) ON DELETE SET NULL,

  -- Attachments
  attachment_url TEXT,
  attachment_type VARCHAR(50),

  -- Status
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Voice Room Files Table
CREATE TABLE IF NOT EXISTS voice_room_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100),

  -- Access
  is_public BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  description TEXT,
  thumbnail_url TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Voice Rooms indexes
CREATE INDEX IF NOT EXISTS idx_voice_rooms_user_id ON voice_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_host_id ON voice_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_status ON voice_rooms(status);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_type ON voice_rooms(type);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_created_at ON voice_rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_scheduled_time ON voice_rooms(scheduled_time) WHERE scheduled_time IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_rooms_active ON voice_rooms(status, created_at DESC) WHERE status = 'active';

-- Voice Participants indexes
CREATE INDEX IF NOT EXISTS idx_voice_participants_room_id ON voice_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_participants_user_id ON voice_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_participants_joined_at ON voice_participants(joined_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_participants_active ON voice_participants(room_id, left_at) WHERE left_at IS NULL;

-- Voice Recordings indexes
CREATE INDEX IF NOT EXISTS idx_voice_recordings_room_id ON voice_recordings(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_user_id ON voice_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_status ON voice_recordings(status);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_created_at ON voice_recordings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_recordings_transcription ON voice_recordings(transcription_available) WHERE transcription_available = true;

-- Voice Transcriptions indexes
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_recording_id ON voice_transcriptions(recording_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_user_id ON voice_transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_transcriptions_language ON voice_transcriptions(language);

-- Voice Room Invites indexes
CREATE INDEX IF NOT EXISTS idx_voice_room_invites_room_id ON voice_room_invites(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_invites_recipient_id ON voice_room_invites(recipient_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_invites_status ON voice_room_invites(status);
CREATE INDEX IF NOT EXISTS idx_voice_room_invites_expires_at ON voice_room_invites(expires_at);

-- Voice Analytics indexes
CREATE INDEX IF NOT EXISTS idx_voice_analytics_room_id ON voice_analytics(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_user_id ON voice_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_analytics_period ON voice_analytics(period_start, period_end);

-- Voice Room Chat indexes
CREATE INDEX IF NOT EXISTS idx_voice_room_chat_room_id ON voice_room_chat(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_room_chat_user_id ON voice_room_chat(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_chat_reply_to ON voice_room_chat(reply_to_id) WHERE reply_to_id IS NOT NULL;

-- Voice Room Files indexes
CREATE INDEX IF NOT EXISTS idx_voice_room_files_room_id ON voice_room_files(room_id);
CREATE INDEX IF NOT EXISTS idx_voice_room_files_user_id ON voice_room_files(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_participant_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_room_files ENABLE ROW LEVEL SECURITY;

-- Voice Rooms policies
CREATE POLICY "Users can view public rooms"
  ON voice_rooms FOR SELECT
  USING (type = 'public' OR user_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Users can create rooms"
  ON voice_rooms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Room owners can update their rooms"
  ON voice_rooms FOR UPDATE
  USING (user_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "Room owners can delete their rooms"
  ON voice_rooms FOR DELETE
  USING (user_id = auth.uid());

-- Voice Participants policies
CREATE POLICY "Users can view participants in their rooms"
  ON voice_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_participants.room_id
      AND (voice_rooms.user_id = auth.uid() OR voice_rooms.host_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Users can join rooms as participants"
  ON voice_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON voice_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Voice Recordings policies
CREATE POLICY "Users can view recordings from their rooms"
  ON voice_recordings FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_recordings.room_id
      AND (voice_rooms.user_id = auth.uid() OR voice_rooms.host_id = auth.uid())
    )
  );

CREATE POLICY "Room hosts can create recordings"
  ON voice_recordings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = room_id
      AND voice_rooms.host_id = auth.uid()
    )
  );

CREATE POLICY "Recording owners can update recordings"
  ON voice_recordings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Recording owners can delete recordings"
  ON voice_recordings FOR DELETE
  USING (user_id = auth.uid());

-- Voice Transcriptions policies
CREATE POLICY "Users can view transcriptions of accessible recordings"
  ON voice_transcriptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_recordings
      WHERE voice_recordings.id = voice_transcriptions.recording_id
      AND voice_recordings.user_id = auth.uid()
    )
  );

-- Voice Room Settings policies
CREATE POLICY "Room owners can manage settings"
  ON voice_room_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_room_settings.room_id
      AND voice_rooms.user_id = auth.uid()
    )
  );

-- Voice Room Invites policies
CREATE POLICY "Users can view their invites"
  ON voice_room_invites FOR SELECT
  USING (recipient_id = auth.uid() OR sender_id = auth.uid());

CREATE POLICY "Room hosts can send invites"
  ON voice_room_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = room_id
      AND voice_rooms.host_id = auth.uid()
    )
  );

CREATE POLICY "Recipients can update invite status"
  ON voice_room_invites FOR UPDATE
  USING (recipient_id = auth.uid());

-- Voice Analytics policies
CREATE POLICY "Users can view analytics for their rooms"
  ON voice_analytics FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM voice_rooms
      WHERE voice_rooms.id = voice_analytics.room_id
      AND voice_rooms.user_id = auth.uid()
    )
  );

-- Voice Room Chat policies
CREATE POLICY "Participants can view room chat"
  ON voice_room_chat FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_chat.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON voice_room_chat FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_chat.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON voice_room_chat FOR UPDATE
  USING (user_id = auth.uid());

-- Voice Room Files policies
CREATE POLICY "Participants can view room files"
  ON voice_room_files FOR SELECT
  USING (
    is_public = true
    OR EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_files.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can upload files"
  ON voice_room_files FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM voice_participants
      WHERE voice_participants.room_id = voice_room_files.room_id
      AND voice_participants.user_id = auth.uid()
    )
  );

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_voice_rooms_updated_at BEFORE UPDATE ON voice_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_participants_updated_at BEFORE UPDATE ON voice_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_recordings_updated_at BEFORE UPDATE ON voice_recordings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_transcriptions_updated_at BEFORE UPDATE ON voice_transcriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_room_settings_updated_at BEFORE UPDATE ON voice_room_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update room participant count
CREATE OR REPLACE FUNCTION update_room_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE voice_rooms
    SET current_participants = current_participants + 1
    WHERE id = NEW.room_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE voice_rooms
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = OLD.room_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE voice_rooms
    SET current_participants = GREATEST(current_participants - 1, 0)
    WHERE id = NEW.room_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_room_participant_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON voice_participants
  FOR EACH ROW EXECUTE FUNCTION update_room_participant_count();

-- Trigger to update recording view count
CREATE OR REPLACE FUNCTION increment_recording_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_recordings
  SET view_count = view_count + 1
  WHERE id = NEW.recording_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-archive old rooms
CREATE OR REPLACE FUNCTION auto_archive_old_rooms()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND NEW.end_time < (NOW() - INTERVAL '30 days') THEN
    NEW.status = 'archived';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_archive_rooms_trigger
  BEFORE UPDATE ON voice_rooms
  FOR EACH ROW EXECUTE FUNCTION auto_archive_old_rooms();

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to get active participants in a room
CREATE OR REPLACE FUNCTION get_active_participants(room_uuid UUID)
RETURNS TABLE (
  participant_id UUID,
  user_id UUID,
  role participant_role,
  status participant_status,
  is_muted BOOLEAN,
  joined_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vp.id,
    vp.user_id,
    vp.role,
    vp.status,
    vp.is_muted,
    vp.joined_at
  FROM voice_participants vp
  WHERE vp.room_id = room_uuid
    AND vp.left_at IS NULL
  ORDER BY vp.joined_at;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate room analytics
CREATE OR REPLACE FUNCTION calculate_room_analytics(room_uuid UUID, start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE (
  total_participants BIGINT,
  max_concurrent_participants INTEGER,
  avg_duration_seconds NUMERIC,
  total_speaking_time NUMERIC,
  total_messages BIGINT,
  total_reactions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT vp.user_id)::BIGINT,
    (SELECT MAX(current_participants) FROM voice_rooms WHERE id = room_uuid)::INTEGER,
    AVG(vp.duration_seconds)::NUMERIC,
    SUM(vp.speaking_time_seconds)::NUMERIC,
    (SELECT COUNT(*) FROM voice_room_chat WHERE room_id = room_uuid AND created_at BETWEEN start_date AND end_date)::BIGINT,
    (SELECT COUNT(*) FROM voice_room_reactions WHERE room_id = room_uuid AND created_at BETWEEN start_date AND end_date)::BIGINT
  FROM voice_participants vp
  WHERE vp.room_id = room_uuid
    AND vp.joined_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's voice statistics
CREATE OR REPLACE FUNCTION get_user_voice_stats(user_uuid UUID)
RETURNS TABLE (
  total_rooms_joined BIGINT,
  total_time_spent_seconds NUMERIC,
  total_speaking_time_seconds NUMERIC,
  average_session_duration_seconds NUMERIC,
  rooms_hosted BIGINT,
  recordings_created BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT vp.room_id)::BIGINT,
    SUM(vp.duration_seconds)::NUMERIC,
    SUM(vp.speaking_time_seconds)::NUMERIC,
    AVG(vp.duration_seconds)::NUMERIC,
    (SELECT COUNT(*) FROM voice_rooms WHERE host_id = user_uuid)::BIGINT,
    (SELECT COUNT(*) FROM voice_recordings WHERE user_id = user_uuid)::BIGINT
  FROM voice_participants vp
  WHERE vp.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE voice_rooms IS 'Main table for voice collaboration rooms';
COMMENT ON TABLE voice_participants IS 'Tracks participants in voice rooms with engagement metrics';
COMMENT ON TABLE voice_recordings IS 'Stores metadata for voice room recordings';
COMMENT ON TABLE voice_transcriptions IS 'AI-generated transcriptions of voice recordings';
COMMENT ON TABLE voice_room_settings IS 'Per-room configuration and preferences';
COMMENT ON TABLE voice_room_invites IS 'Invitation system for voice rooms';
COMMENT ON TABLE voice_analytics IS 'Analytics and metrics for voice rooms';
COMMENT ON TABLE voice_participant_stats IS 'Detailed statistics per participant session';
COMMENT ON TABLE voice_room_schedules IS 'Scheduled voice rooms with recurrence support';
COMMENT ON TABLE voice_room_reactions IS 'Emoji reactions during voice calls';
COMMENT ON TABLE voice_room_chat IS 'Text chat within voice rooms';
COMMENT ON TABLE voice_room_files IS 'File sharing within voice rooms';

-- ========================================
-- MIGRATION COMPLETE
-- ========================================
-- =====================================================
-- WIDGETS SYSTEM - PRODUCTION DATABASE SCHEMA
-- =====================================================
-- Comprehensive widget management with dashboard customization,
-- templates, analytics, and real-time data visualization
-- =====================================================

-- =====================================================
-- ENUMS
-- =====================================================

DROP TYPE IF EXISTS widget_type CASCADE;
CREATE TYPE widget_type AS ENUM (
  'metric',
  'chart',
  'table',
  'activity',
  'quick-actions',
  'calendar'
);

DROP TYPE IF EXISTS widget_size CASCADE;
CREATE TYPE widget_size AS ENUM (
  'small',
  'medium',
  'large',
  'full'
);

DROP TYPE IF EXISTS widget_category CASCADE;
CREATE TYPE widget_category AS ENUM (
  'analytics',
  'productivity',
  'finance',
  'social',
  'custom'
);

DROP TYPE IF EXISTS widget_status CASCADE;
CREATE TYPE widget_status AS ENUM (
  'active',
  'inactive',
  'error',
  'loading'
);

DROP TYPE IF EXISTS chart_type CASCADE;
CREATE TYPE chart_type AS ENUM (
  'line',
  'bar',
  'pie',
  'doughnut',
  'area',
  'scatter'
);

-- =====================================================
-- TABLES
-- =====================================================

-- Widgets
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type widget_type NOT NULL,
  category widget_category NOT NULL,
  size widget_size NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL,
  description TEXT,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  "position" JSONB NOT NULL DEFAULT '{"x": 0, "y": 0}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  status widget_status NOT NULL DEFAULT 'active',
  data JSONB,
  last_refreshed TIMESTAMPTZ,
  usage_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Widget Templates
CREATE TABLE IF NOT EXISTS widget_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type widget_type NOT NULL,
  category widget_category NOT NULL,
  size widget_size NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL,
  thumbnail TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT true,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(2, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Dashboards
CREATE TABLE IF NOT EXISTS dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  share_token TEXT UNIQUE,
  theme TEXT DEFAULT 'light',
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Dashboard Widgets (junction table)
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(dashboard_id, widget_id)
);

-- Widget Data (historical data storage)
CREATE TABLE IF NOT EXISTS widget_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widgets(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  status widget_status NOT NULL DEFAULT 'active',
  error_message TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Widget Analytics
CREATE TABLE IF NOT EXISTS widget_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_id UUID REFERENCES widgets(id) ON DELETE CASCADE,
  dashboard_id UUID REFERENCES dashboards(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Widget Stats (aggregated statistics)
CREATE TABLE IF NOT EXISTS widget_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_widgets INTEGER NOT NULL DEFAULT 0,
  active_widgets INTEGER NOT NULL DEFAULT 0,
  category_breakdown JSONB DEFAULT '{}'::jsonb,
  type_breakdown JSONB DEFAULT '{}'::jsonb,
  size_breakdown JSONB DEFAULT '{}'::jsonb,
  status_breakdown JSONB DEFAULT '{}'::jsonb,
  total_usage INTEGER NOT NULL DEFAULT 0,
  average_refresh_rate DECIMAL(10, 2),
  most_used_widget_id UUID REFERENCES widgets(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Widgets Indexes
CREATE INDEX IF NOT EXISTS idx_widgets_user_id ON widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_widgets_type ON widgets(type);
CREATE INDEX IF NOT EXISTS idx_widgets_category ON widgets(category);
CREATE INDEX IF NOT EXISTS idx_widgets_size ON widgets(size);
CREATE INDEX IF NOT EXISTS idx_widgets_status ON widgets(status);
CREATE INDEX IF NOT EXISTS idx_widgets_is_visible ON widgets(is_visible);
CREATE INDEX IF NOT EXISTS idx_widgets_is_locked ON widgets(is_locked);
CREATE INDEX IF NOT EXISTS idx_widgets_usage_count ON widgets(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_last_refreshed ON widgets(last_refreshed DESC);
CREATE INDEX IF NOT EXISTS idx_widgets_name_search ON widgets USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_widgets_description_search ON widgets USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_widgets_config ON widgets USING GIN(config);
CREATE INDEX IF NOT EXISTS idx_widgets_data ON widgets USING GIN(data);
CREATE INDEX IF NOT EXISTS idx_widgets_created_at ON widgets(created_at DESC);

-- Widget Templates Indexes
CREATE INDEX IF NOT EXISTS idx_widget_templates_type ON widget_templates(type);
CREATE INDEX IF NOT EXISTS idx_widget_templates_category ON widget_templates(category);
CREATE INDEX IF NOT EXISTS idx_widget_templates_is_premium ON widget_templates(is_premium);
CREATE INDEX IF NOT EXISTS idx_widget_templates_is_public ON widget_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_widget_templates_downloads ON widget_templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_widget_templates_rating ON widget_templates(rating DESC);
CREATE INDEX IF NOT EXISTS idx_widget_templates_tags ON widget_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_widget_templates_created_by ON widget_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_widget_templates_name_search ON widget_templates USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_widget_templates_created_at ON widget_templates(created_at DESC);

-- Dashboards Indexes
CREATE INDEX IF NOT EXISTS idx_dashboards_user_id ON dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_default ON dashboards(is_default);
CREATE INDEX IF NOT EXISTS idx_dashboards_is_shared ON dashboards(is_shared);
CREATE INDEX IF NOT EXISTS idx_dashboards_share_token ON dashboards(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dashboards_theme ON dashboards(theme);
CREATE INDEX IF NOT EXISTS idx_dashboards_name_search ON dashboards USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_dashboards_created_at ON dashboards(created_at DESC);

-- Dashboard Widgets Indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_widget_id ON dashboard_widgets(widget_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_order_index ON dashboard_widgets(order_index);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_is_visible ON dashboard_widgets(is_visible);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_created_at ON dashboard_widgets(created_at DESC);

-- Widget Data Indexes
CREATE INDEX IF NOT EXISTS idx_widget_data_widget_id ON widget_data(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_data_status ON widget_data(status);
CREATE INDEX IF NOT EXISTS idx_widget_data_timestamp ON widget_data(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_widget_data_data ON widget_data USING GIN(data);

-- Widget Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_widget_analytics_user_id ON widget_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_widget_id ON widget_analytics(widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_dashboard_id ON widget_analytics(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_type ON widget_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_timestamp ON widget_analytics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_widget_analytics_event_data ON widget_analytics USING GIN(event_data);

-- Widget Stats Indexes
CREATE INDEX IF NOT EXISTS idx_widget_stats_user_id ON widget_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_stats_date ON widget_stats(date DESC);
CREATE INDEX IF NOT EXISTS idx_widget_stats_total_widgets ON widget_stats(total_widgets DESC);
CREATE INDEX IF NOT EXISTS idx_widget_stats_active_widgets ON widget_stats(active_widgets DESC);
CREATE INDEX IF NOT EXISTS idx_widget_stats_most_used_widget_id ON widget_stats(most_used_widget_id);
CREATE INDEX IF NOT EXISTS idx_widget_stats_created_at ON widget_stats(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE TRIGGER update_widgets_updated_at
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_templates_updated_at
  BEFORE UPDATE ON widget_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at
  BEFORE UPDATE ON dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_stats_updated_at
  BEFORE UPDATE ON widget_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Track widget usage
CREATE OR REPLACE FUNCTION track_widget_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_refreshed IS DISTINCT FROM OLD.last_refreshed THEN
    NEW.usage_count = OLD.usage_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_widget_usage
  BEFORE UPDATE ON widgets
  FOR EACH ROW
  EXECUTE FUNCTION track_widget_usage();

-- Track template downloads
CREATE OR REPLACE FUNCTION track_template_download()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE widget_templates
  SET downloads = downloads + 1
  WHERE id = NEW.metadata->>'template_id';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_template_download
  AFTER INSERT ON widgets
  FOR EACH ROW
  WHEN (NEW.metadata->>'template_id' IS NOT NULL)
  EXECUTE FUNCTION track_template_download();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get widget statistics
CREATE OR REPLACE FUNCTION get_widget_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalWidgets', COUNT(*),
    'activeWidgets', COUNT(*) FILTER (WHERE status = 'active'),
    'byCategory', (
      SELECT json_object_agg(category, cnt)
      FROM (
        SELECT category, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY category
      ) cat_counts
    ),
    'byType', (
      SELECT json_object_agg(type, cnt)
      FROM (
        SELECT type, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY type
      ) type_counts
    ),
    'bySize', (
      SELECT json_object_agg(size, cnt)
      FROM (
        SELECT size, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY size
      ) size_counts
    ),
    'byStatus', (
      SELECT json_object_agg(status, cnt)
      FROM (
        SELECT status, COUNT(*) as cnt
        FROM widgets
        WHERE user_id = p_user_id
        GROUP BY status
      ) status_counts
    ),
    'totalUsage', COALESCE(SUM(usage_count), 0),
    'mostUsed', (
      SELECT json_build_object('name', name, 'usageCount', usage_count)
      FROM widgets
      WHERE user_id = p_user_id
      ORDER BY usage_count DESC
      LIMIT 1
    )
  ) INTO v_stats
  FROM widgets
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search widgets
CREATE OR REPLACE FUNCTION search_widgets(
  p_user_id UUID,
  p_search_term TEXT,
  p_category widget_category DEFAULT NULL,
  p_type widget_type DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type widget_type,
  category widget_category,
  status widget_status,
  usage_count INTEGER,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    w.id,
    w.name,
    w.type,
    w.category,
    w.status,
    w.usage_count,
    ts_rank(
      to_tsvector('english', w.name || ' ' || COALESCE(w.description, '')),
      plainto_tsquery('english', p_search_term)
    ) as relevance
  FROM widgets w
  WHERE w.user_id = p_user_id
    AND (p_category IS NULL OR w.category = p_category)
    AND (p_type IS NULL OR w.type = p_type)
    AND (
      p_search_term = '' OR
      to_tsvector('english', w.name || ' ' || COALESCE(w.description, '')) @@ plainto_tsquery('english', p_search_term)
    )
  ORDER BY relevance DESC, w.usage_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Refresh widget data
CREATE OR REPLACE FUNCTION refresh_widget(p_widget_id UUID)
RETURNS JSON AS $$
DECLARE
  v_widget widgets%ROWTYPE;
BEGIN
  UPDATE widgets
  SET
    last_refreshed = NOW(),
    status = 'active',
    error_message = NULL,
    updated_at = NOW()
  WHERE id = p_widget_id
  RETURNING * INTO v_widget;

  -- Store historical data
  INSERT INTO widget_data (widget_id, data, status)
  VALUES (p_widget_id, v_widget.data, v_widget.status);

  RETURN json_build_object(
    'success', true,
    'widgetId', v_widget.id,
    'lastRefreshed', v_widget.last_refreshed
  );
END;
$$ LANGUAGE plpgsql;

-- Duplicate widget
CREATE OR REPLACE FUNCTION duplicate_widget(p_widget_id UUID, p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_widget_id UUID;
  v_original widgets%ROWTYPE;
BEGIN
  SELECT * INTO v_original FROM widgets WHERE id = p_widget_id;

  INSERT INTO widgets (
    user_id, name, type, category, size, icon, description,
    is_visible, is_locked, position, config, status
  )
  VALUES (
    p_user_id,
    v_original.name || ' (Copy)',
    v_original.type,
    v_original.category,
    v_original.size,
    v_original.icon,
    v_original.description,
    v_original.is_visible,
    false,
    jsonb_build_object(
      'x', (v_original.position->>'x')::int + 50,
      'y', (v_original.position->>'y')::int + 50
    ),
    v_original.config,
    'inactive'
  )
  RETURNING id INTO v_new_widget_id;

  RETURN v_new_widget_id;
END;
$$ LANGUAGE plpgsql;

-- Create widget from template
CREATE OR REPLACE FUNCTION create_widget_from_template(
  p_template_id UUID,
  p_user_id UUID,
  p_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_template widget_templates%ROWTYPE;
  v_new_widget_id UUID;
BEGIN
  SELECT * INTO v_template FROM widget_templates WHERE id = p_template_id;

  INSERT INTO widgets (
    user_id, name, type, category, size, icon, description,
    config, metadata
  )
  VALUES (
    p_user_id,
    COALESCE(p_name, v_template.name),
    v_template.type,
    v_template.category,
    v_template.size,
    v_template.icon,
    v_template.description,
    v_template.config,
    jsonb_build_object('template_id', p_template_id)
  )
  RETURNING id INTO v_new_widget_id;

  RETURN v_new_widget_id;
END;
$$ LANGUAGE plpgsql;

-- Get dashboard with widgets
CREATE OR REPLACE FUNCTION get_dashboard_with_widgets(p_dashboard_id UUID)
RETURNS JSON AS $$
DECLARE
  v_dashboard JSON;
BEGIN
  SELECT json_build_object(
    'dashboard', row_to_json(d.*),
    'widgets', (
      SELECT json_agg(
        json_build_object(
          'widget', row_to_json(w.*),
          'position', json_build_object(
            'x', dw.position_x,
            'y', dw.position_y,
            'width', dw.width,
            'height', dw.height
          ),
          'orderIndex', dw.order_index,
          'isVisible', dw.is_visible
        )
        ORDER BY dw.order_index
      )
      FROM dashboard_widgets dw
      JOIN widgets w ON w.id = dw.widget_id
      WHERE dw.dashboard_id = p_dashboard_id
    )
  ) INTO v_dashboard
  FROM dashboards d
  WHERE d.id = p_dashboard_id;

  RETURN v_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Update widget stats daily
CREATE OR REPLACE FUNCTION update_widget_stats_daily(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO widget_stats (
    user_id,
    date,
    total_widgets,
    active_widgets,
    category_breakdown,
    type_breakdown,
    size_breakdown,
    status_breakdown,
    total_usage,
    average_refresh_rate,
    most_used_widget_id
  )
  SELECT
    p_user_id,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'active'),
    (SELECT get_widget_stats(p_user_id)->>'byCategory')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'byType')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'bySize')::jsonb,
    (SELECT get_widget_stats(p_user_id)->>'byStatus')::jsonb,
    COALESCE(SUM(usage_count), 0),
    ROUND(AVG(EXTRACT(EPOCH FROM (NOW() - last_refreshed))), 2),
    (SELECT id FROM widgets WHERE user_id = p_user_id ORDER BY usage_count DESC LIMIT 1)
  FROM widgets
  WHERE user_id = p_user_id
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_widgets = EXCLUDED.total_widgets,
    active_widgets = EXCLUDED.active_widgets,
    category_breakdown = EXCLUDED.category_breakdown,
    type_breakdown = EXCLUDED.type_breakdown,
    size_breakdown = EXCLUDED.size_breakdown,
    status_breakdown = EXCLUDED.status_breakdown,
    total_usage = EXCLUDED.total_usage,
    average_refresh_rate = EXCLUDED.average_refresh_rate,
    most_used_widget_id = EXCLUDED.most_used_widget_id,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_stats ENABLE ROW LEVEL SECURITY;

-- Widgets Policies
CREATE POLICY widgets_select_policy ON widgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widgets_insert_policy ON widgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widgets_update_policy ON widgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY widgets_delete_policy ON widgets
  FOR DELETE USING (auth.uid() = user_id);

-- Widget Templates Policies
CREATE POLICY widget_templates_select_policy ON widget_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY widget_templates_insert_policy ON widget_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY widget_templates_update_policy ON widget_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY widget_templates_delete_policy ON widget_templates
  FOR DELETE USING (auth.uid() = created_by);

-- Dashboards Policies
CREATE POLICY dashboards_select_policy ON dashboards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY dashboards_insert_policy ON dashboards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY dashboards_update_policy ON dashboards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY dashboards_delete_policy ON dashboards
  FOR DELETE USING (auth.uid() = user_id);

-- Dashboard Widgets Policies
CREATE POLICY dashboard_widgets_select_policy ON dashboard_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_insert_policy ON dashboard_widgets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_update_policy ON dashboard_widgets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY dashboard_widgets_delete_policy ON dashboard_widgets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

-- Widget Data Policies
CREATE POLICY widget_data_select_policy ON widget_data
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM widgets w
      WHERE w.id = widget_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY widget_data_insert_policy ON widget_data
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM widgets w
      WHERE w.id = widget_id AND w.user_id = auth.uid()
    )
  );

-- Widget Analytics Policies
CREATE POLICY widget_analytics_select_policy ON widget_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_analytics_insert_policy ON widget_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Widget Stats Policies
CREATE POLICY widget_stats_select_policy ON widget_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY widget_stats_insert_policy ON widget_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY widget_stats_update_policy ON widget_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- SAMPLE DATA QUERIES
-- =====================================================

-- Example: Get all widgets by category
-- SELECT * FROM widgets WHERE user_id = 'user-id' AND category = 'analytics' ORDER BY usage_count DESC;

-- Example: Search widgets
-- SELECT * FROM search_widgets('user-id', 'revenue', 'analytics', NULL, 20);

-- Example: Get widget statistics
-- SELECT * FROM get_widget_stats('user-id');

-- Example: Refresh widget
-- SELECT * FROM refresh_widget('widget-id');

-- Example: Duplicate widget
-- SELECT duplicate_widget('widget-id', 'user-id');

-- Example: Create widget from template
-- SELECT create_widget_from_template('template-id', 'user-id', 'My Custom Widget');

-- Example: Get dashboard with widgets
-- SELECT * FROM get_dashboard_with_widgets('dashboard-id');

-- Example: Update daily widget stats
-- SELECT update_widget_stats_daily('user-id');

-- =====================================================
-- END OF WIDGETS SYSTEM SCHEMA
-- =====================================================
