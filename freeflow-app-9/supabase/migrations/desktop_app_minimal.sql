-- Minimal Desktop App Schema
-- Additional features: desktop projects, builds, frameworks, distributions

-- ENUMS
DROP TYPE IF EXISTS desktop_os CASCADE;
DROP TYPE IF EXISTS desktop_category CASCADE;
DROP TYPE IF EXISTS framework_type CASCADE;
DROP TYPE IF EXISTS build_type CASCADE;
DROP TYPE IF EXISTS distribution_channel CASCADE;

CREATE TYPE desktop_os AS ENUM ('windows', 'macos', 'linux', 'cross_platform');
CREATE TYPE desktop_category AS ENUM ('laptop', 'desktop', 'workstation', 'all_in_one');
CREATE TYPE framework_type AS ENUM ('electron', 'tauri', 'flutter', 'native', 'pwa', 'qt', 'swing', 'wpf');
CREATE TYPE build_type AS ENUM ('development', 'production', 'beta', 'alpha', 'release_candidate');
CREATE TYPE distribution_channel AS ENUM ('app_store', 'microsoft_store', 'snap', 'homebrew', 'direct_download', 'enterprise');

-- TABLES
DROP TABLE IF EXISTS desktop_projects CASCADE;
DROP TABLE IF EXISTS desktop_builds CASCADE;
DROP TABLE IF EXISTS desktop_distributions CASCADE;
DROP TABLE IF EXISTS desktop_frameworks CASCADE;
DROP TABLE IF EXISTS desktop_analytics CASCADE;

CREATE TABLE desktop_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Details
  project_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,

  -- Target Platform
  target_os desktop_os NOT NULL,
  supported_versions TEXT[] DEFAULT ARRAY[]::TEXT[], -- OS versions

  -- Framework
  framework framework_type NOT NULL,
  framework_version TEXT,

  -- Configuration
  window_width INTEGER NOT NULL DEFAULT 1024,
  window_height INTEGER NOT NULL DEFAULT 768,
  resizable BOOLEAN NOT NULL DEFAULT true,
  fullscreen_capable BOOLEAN NOT NULL DEFAULT true,
  always_on_top BOOLEAN NOT NULL DEFAULT false,

  -- Window Settings
  min_width INTEGER,
  min_height INTEGER,
  max_width INTEGER,
  max_height INTEGER,
  transparent BOOLEAN NOT NULL DEFAULT false,
  frame BOOLEAN NOT NULL DEFAULT true, -- Show window frame/chrome

  -- App Configuration
  app_id TEXT NOT NULL, -- Bundle ID or package name
  version TEXT NOT NULL DEFAULT '1.0.0',
  license TEXT,

  -- Source
  source_url TEXT, -- Git repo or source location
  entry_point TEXT, -- Main file path

  -- Dependencies
  dependencies JSONB DEFAULT '{}'::JSONB,
  dev_dependencies JSONB DEFAULT '{}'::JSONB,

  -- Build Settings
  build_config JSONB DEFAULT '{}'::JSONB,

  -- Stats
  total_builds INTEGER NOT NULL DEFAULT 0,
  last_build_at TIMESTAMPTZ,

  -- Status
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, project_name)
);

CREATE TABLE desktop_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES desktop_projects(id) ON DELETE CASCADE,

  -- Build Details
  build_number TEXT NOT NULL,
  build_type build_type NOT NULL,
  version TEXT NOT NULL,

  -- Target
  target_os desktop_os NOT NULL,
  architecture TEXT NOT NULL, -- 'x64', 'arm64', 'x86', 'universal'

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'building', 'success', 'failed', 'cancelled'

  -- Output
  output_path TEXT,
  output_size BIGINT, -- File size in bytes
  installer_url TEXT, -- .exe, .dmg, .deb, .rpm, .AppImage, etc.
  portable_url TEXT, -- Portable/standalone version

  -- Code Signing
  is_signed BOOLEAN NOT NULL DEFAULT false,
  signing_certificate TEXT,
  signature_timestamp TIMESTAMPTZ,

  -- Build Process
  build_log TEXT,
  error_message TEXT,
  warnings TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Environment
  build_machine TEXT, -- Build machine identifier
  build_environment JSONB DEFAULT '{}'::JSONB, -- Environment variables, tools versions

  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, build_number)
);

CREATE TABLE desktop_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_id UUID NOT NULL REFERENCES desktop_builds(id) ON DELETE CASCADE,

  -- Distribution Details
  channel distribution_channel NOT NULL,
  channel_url TEXT, -- Store link or download URL

  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'reviewing', 'approved', 'rejected', 'published'

  -- Submission
  submitted_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,

  -- Publishing
  published_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT false,

  -- Version Management
  version TEXT NOT NULL,
  release_notes TEXT,
  changelog TEXT,

  -- Metadata
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  promotional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  app_description TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Requirements
  minimum_os_version TEXT,
  required_disk_space BIGINT, -- Bytes
  required_ram BIGINT, -- Bytes

  -- Stats
  total_downloads INTEGER NOT NULL DEFAULT 0,
  total_installs INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,

  -- Rating
  average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE desktop_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Framework Details
  framework_name framework_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  official_url TEXT,
  documentation_url TEXT,

  -- Version
  latest_version TEXT NOT NULL,
  stable_version TEXT NOT NULL,
  min_version TEXT,

  -- Capabilities
  supported_os desktop_os[] DEFAULT ARRAY[]::desktop_os[],
  features TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Requirements
  requires_node BOOLEAN NOT NULL DEFAULT false,
  requires_rust BOOLEAN NOT NULL DEFAULT false,
  requires_python BOOLEAN NOT NULL DEFAULT false,
  min_node_version TEXT,
  min_rust_version TEXT,

  -- Templates
  starter_templates JSONB DEFAULT '[]'::JSONB,

  -- Stats
  usage_count INTEGER NOT NULL DEFAULT 0,
  project_count INTEGER NOT NULL DEFAULT 0,

  -- Community
  github_stars INTEGER,
  npm_downloads INTEGER,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_recommended BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE desktop_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES desktop_projects(id) ON DELETE CASCADE,
  build_id UUID REFERENCES desktop_builds(id) ON DELETE SET NULL,

  -- Event Details
  event_type TEXT NOT NULL, -- 'app_launch', 'app_close', 'feature_used', 'error', 'crash'
  event_name TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::JSONB,

  -- Session
  session_id UUID,
  session_duration_seconds INTEGER,

  -- User Context
  os_version TEXT,
  app_version TEXT,
  architecture TEXT,

  -- System Info
  cpu_model TEXT,
  total_ram BIGINT,
  screen_resolution TEXT,

  -- Location
  country TEXT,
  city TEXT,
  timezone TEXT,

  -- Timestamp
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_desktop_projects_user_id ON desktop_projects(user_id);
CREATE INDEX idx_desktop_projects_target_os ON desktop_projects(target_os);
CREATE INDEX idx_desktop_projects_framework ON desktop_projects(framework);
CREATE INDEX idx_desktop_projects_is_archived ON desktop_projects(is_archived);
CREATE INDEX idx_desktop_projects_is_template ON desktop_projects(is_template);
CREATE INDEX idx_desktop_projects_tags ON desktop_projects USING GIN(tags);
CREATE INDEX idx_desktop_builds_user_id ON desktop_builds(user_id);
CREATE INDEX idx_desktop_builds_project_id ON desktop_builds(project_id);
CREATE INDEX idx_desktop_builds_status ON desktop_builds(status);
CREATE INDEX idx_desktop_builds_target_os ON desktop_builds(target_os);
CREATE INDEX idx_desktop_builds_build_type ON desktop_builds(build_type);
CREATE INDEX idx_desktop_builds_created_at ON desktop_builds(created_at DESC);
CREATE INDEX idx_desktop_distributions_user_id ON desktop_distributions(user_id);
CREATE INDEX idx_desktop_distributions_build_id ON desktop_distributions(build_id);
CREATE INDEX idx_desktop_distributions_channel ON desktop_distributions(channel);
CREATE INDEX idx_desktop_distributions_status ON desktop_distributions(status);
CREATE INDEX idx_desktop_distributions_is_active ON desktop_distributions(is_active);
CREATE INDEX idx_desktop_distributions_published_at ON desktop_distributions(published_at DESC);
CREATE INDEX idx_desktop_frameworks_framework_name ON desktop_frameworks(framework_name);
CREATE INDEX idx_desktop_frameworks_is_active ON desktop_frameworks(is_active);
CREATE INDEX idx_desktop_frameworks_is_recommended ON desktop_frameworks(is_recommended);
CREATE INDEX idx_desktop_frameworks_usage_count ON desktop_frameworks(usage_count DESC);
CREATE INDEX idx_desktop_frameworks_supported_os ON desktop_frameworks USING GIN(supported_os);
CREATE INDEX idx_desktop_analytics_user_id ON desktop_analytics(user_id);
CREATE INDEX idx_desktop_analytics_project_id ON desktop_analytics(project_id);
CREATE INDEX idx_desktop_analytics_build_id ON desktop_analytics(build_id);
CREATE INDEX idx_desktop_analytics_event_type ON desktop_analytics(event_type);
CREATE INDEX idx_desktop_analytics_session_id ON desktop_analytics(session_id);
CREATE INDEX idx_desktop_analytics_event_timestamp ON desktop_analytics(event_timestamp DESC);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_desktop_app_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_desktop_projects_updated_at BEFORE UPDATE ON desktop_projects FOR EACH ROW EXECUTE FUNCTION update_desktop_app_updated_at();
CREATE TRIGGER trigger_desktop_builds_updated_at BEFORE UPDATE ON desktop_builds FOR EACH ROW EXECUTE FUNCTION update_desktop_app_updated_at();
CREATE TRIGGER trigger_desktop_distributions_updated_at BEFORE UPDATE ON desktop_distributions FOR EACH ROW EXECUTE FUNCTION update_desktop_app_updated_at();
CREATE TRIGGER trigger_desktop_frameworks_updated_at BEFORE UPDATE ON desktop_frameworks FOR EACH ROW EXECUTE FUNCTION update_desktop_app_updated_at();

CREATE OR REPLACE FUNCTION increment_project_builds() RETURNS TRIGGER AS $$
BEGIN
  UPDATE desktop_projects
  SET total_builds = total_builds + 1,
      last_build_at = now()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_project_builds AFTER INSERT ON desktop_builds FOR EACH ROW EXECUTE FUNCTION increment_project_builds();

CREATE OR REPLACE FUNCTION calculate_build_duration() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('success', 'failed', 'cancelled') THEN
    IF NEW.started_at IS NOT NULL AND NEW.completed_at IS NULL THEN
      NEW.completed_at = now();
      NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_build_duration BEFORE UPDATE ON desktop_builds FOR EACH ROW EXECUTE FUNCTION calculate_build_duration();

CREATE OR REPLACE FUNCTION update_distribution_stats() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_downloads > OLD.total_downloads THEN
    -- Update build download count
    UPDATE desktop_builds
    SET download_count = download_count + (NEW.total_downloads - OLD.total_downloads)
    WHERE id = NEW.build_id;
  END IF;

  IF NEW.total_installs > OLD.total_installs THEN
    -- Update build install count
    UPDATE desktop_builds
    SET install_count = install_count + (NEW.total_installs - OLD.total_installs)
    WHERE id = NEW.build_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_distribution_stats AFTER UPDATE ON desktop_distributions FOR EACH ROW EXECUTE FUNCTION update_distribution_stats();

CREATE OR REPLACE FUNCTION set_distribution_published_timestamp() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = now();
    NEW.is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_distribution_published_timestamp BEFORE UPDATE OF status ON desktop_distributions FOR EACH ROW EXECUTE FUNCTION set_distribution_published_timestamp();

CREATE OR REPLACE FUNCTION increment_framework_usage() RETURNS TRIGGER AS $$
BEGIN
  UPDATE desktop_frameworks
  SET usage_count = usage_count + 1,
      project_count = project_count + 1
  WHERE framework_name = NEW.framework;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_framework_usage AFTER INSERT ON desktop_projects FOR EACH ROW EXECUTE FUNCTION increment_framework_usage();

CREATE OR REPLACE FUNCTION decrement_framework_usage() RETURNS TRIGGER AS $$
BEGIN
  UPDATE desktop_frameworks
  SET project_count = GREATEST(0, project_count - 1)
  WHERE framework_name = OLD.framework;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_framework_usage AFTER DELETE ON desktop_projects FOR EACH ROW EXECUTE FUNCTION decrement_framework_usage();
