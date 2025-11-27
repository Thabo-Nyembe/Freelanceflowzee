-- Minimal Mobile App Schema
-- Additional features: device testing, app builds, screen designs, templates

-- ENUMS
DROP TYPE IF EXISTS device_category CASCADE;
DROP TYPE IF EXISTS orientation_type CASCADE;
DROP TYPE IF EXISTS build_status CASCADE;
DROP TYPE IF EXISTS platform_type CASCADE;
DROP TYPE IF EXISTS template_category CASCADE;

CREATE TYPE device_category AS ENUM ('phone', 'tablet', 'wearable', 'tv', 'desktop');
CREATE TYPE orientation_type AS ENUM ('portrait', 'landscape', 'auto');
CREATE TYPE build_status AS ENUM ('pending', 'building', 'success', 'failed', 'cancelled');
CREATE TYPE platform_type AS ENUM ('ios', 'android', 'web', 'windows', 'macos', 'linux');
CREATE TYPE template_category AS ENUM ('social', 'ecommerce', 'finance', 'productivity', 'health', 'music', 'education', 'travel', 'food', 'news');

-- TABLES
DROP TABLE IF EXISTS mobile_devices CASCADE;
DROP TABLE IF EXISTS mobile_app_screens CASCADE;
DROP TABLE IF EXISTS mobile_app_builds CASCADE;
DROP TABLE IF EXISTS mobile_app_templates CASCADE;
DROP TABLE IF EXISTS mobile_app_testing CASCADE;

CREATE TABLE mobile_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Device Details
  device_name TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_category device_category NOT NULL,

  -- Screen Specs
  screen_width INTEGER NOT NULL,
  screen_height INTEGER NOT NULL,
  pixel_ratio DECIMAL(3, 2) NOT NULL DEFAULT 2.0,
  aspect_ratio TEXT NOT NULL, -- '16:9', '19.5:9', '4:3', etc.

  -- System Info
  platform platform_type NOT NULL,
  os_version TEXT,
  browser TEXT,
  browser_version TEXT,

  -- User Preferences
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  default_orientation orientation_type NOT NULL DEFAULT 'portrait',

  -- Usage Stats
  total_tests INTEGER NOT NULL DEFAULT 0,
  total_previews INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mobile_app_screens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Screen Details
  screen_name TEXT NOT NULL,
  screen_type TEXT NOT NULL, -- 'home', 'profile', 'settings', etc.
  component_name TEXT NOT NULL,

  -- Design
  background_color TEXT,
  theme TEXT NOT NULL DEFAULT 'light', -- 'light', 'dark', 'auto'
  layout_type TEXT, -- 'single-column', 'grid', 'tabs', 'list'

  -- Content
  elements JSONB DEFAULT '[]'::JSONB, -- UI elements, buttons, inputs, etc.
  navigation JSONB DEFAULT '{}'::JSONB, -- Navigation config
  data_binding JSONB DEFAULT '{}'::JSONB, -- Data sources and bindings

  -- Preview Settings
  preview_url TEXT,
  screenshot_url TEXT,
  orientation orientation_type NOT NULL DEFAULT 'portrait',

  -- Organization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,

  -- Stats
  preview_count INTEGER NOT NULL DEFAULT 0,
  export_count INTEGER NOT NULL DEFAULT 0,

  -- Status
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, screen_name)
);

CREATE TABLE mobile_app_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Build Details
  build_name TEXT NOT NULL,
  build_number TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',

  -- Platform
  platform platform_type NOT NULL,
  target_sdk TEXT,
  min_sdk TEXT,

  -- Configuration
  app_id TEXT NOT NULL, -- Bundle ID / Package name
  app_name TEXT NOT NULL,
  icon_url TEXT,
  splash_url TEXT,

  -- Screens
  included_screens UUID[] DEFAULT ARRAY[]::UUID[], -- References mobile_app_screens.id
  entry_screen UUID REFERENCES mobile_app_screens(id) ON DELETE SET NULL,

  -- Build Process
  build_status build_status NOT NULL DEFAULT 'pending',
  build_config JSONB DEFAULT '{}'::JSONB,

  -- Results
  build_output_url TEXT, -- APK, IPA, or ZIP download URL
  build_size BIGINT, -- File size in bytes
  build_log TEXT,
  error_message TEXT,

  -- Timing
  build_started_at TIMESTAMPTZ,
  build_completed_at TIMESTAMPTZ,
  build_duration_seconds INTEGER,

  -- Distribution
  is_distributed BOOLEAN NOT NULL DEFAULT false,
  distribution_url TEXT,
  qr_code_url TEXT,

  -- Stats
  download_count INTEGER NOT NULL DEFAULT 0,
  install_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, build_number)
);

CREATE TABLE mobile_app_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Template Details
  template_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL,
  category template_category NOT NULL,

  -- Preview
  preview_image_url TEXT,
  preview_video_url TEXT,
  demo_url TEXT,

  -- Features
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  screens TEXT[] DEFAULT ARRAY[]::TEXT[], -- List of included screen types

  -- Configuration
  default_config JSONB DEFAULT '{}'::JSONB,
  color_scheme JSONB DEFAULT '{}'::JSONB,
  typography JSONB DEFAULT '{}'::JSONB,

  -- Platform Support
  supported_platforms platform_type[] DEFAULT ARRAY[]::platform_type[],

  -- Publishing
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  price DECIMAL(10, 2),

  -- Stats
  usage_count INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  author_name TEXT,
  license TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mobile_app_testing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Test Details
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL, -- 'ui', 'performance', 'compatibility', 'accessibility'

  -- Target
  screen_id UUID REFERENCES mobile_app_screens(id) ON DELETE CASCADE,
  device_id UUID REFERENCES mobile_devices(id) ON DELETE SET NULL,
  build_id UUID REFERENCES mobile_app_builds(id) ON DELETE CASCADE,

  -- Test Configuration
  test_config JSONB DEFAULT '{}'::JSONB,
  test_steps JSONB DEFAULT '[]'::JSONB,

  -- Results
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'passed', 'failed', 'skipped'
  result JSONB DEFAULT '{}'::JSONB,

  -- Metrics
  duration_ms INTEGER,
  passed_checks INTEGER NOT NULL DEFAULT 0,
  failed_checks INTEGER NOT NULL DEFAULT 0,
  warnings INTEGER NOT NULL DEFAULT 0,

  -- Screenshots
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,

  -- Errors
  errors JSONB DEFAULT '[]'::JSONB,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_mobile_devices_user_id ON mobile_devices(user_id);
CREATE INDEX idx_mobile_devices_device_category ON mobile_devices(device_category);
CREATE INDEX idx_mobile_devices_platform ON mobile_devices(platform);
CREATE INDEX idx_mobile_devices_is_favorite ON mobile_devices(is_favorite);
CREATE INDEX idx_mobile_devices_last_used_at ON mobile_devices(last_used_at DESC);
CREATE INDEX idx_mobile_app_screens_user_id ON mobile_app_screens(user_id);
CREATE INDEX idx_mobile_app_screens_screen_type ON mobile_app_screens(screen_type);
CREATE INDEX idx_mobile_app_screens_is_published ON mobile_app_screens(is_published);
CREATE INDEX idx_mobile_app_screens_is_template ON mobile_app_screens(is_template);
CREATE INDEX idx_mobile_app_screens_tags ON mobile_app_screens USING GIN(tags);
CREATE INDEX idx_mobile_app_builds_user_id ON mobile_app_builds(user_id);
CREATE INDEX idx_mobile_app_builds_platform ON mobile_app_builds(platform);
CREATE INDEX idx_mobile_app_builds_build_status ON mobile_app_builds(build_status);
CREATE INDEX idx_mobile_app_builds_is_distributed ON mobile_app_builds(is_distributed);
CREATE INDEX idx_mobile_app_builds_created_at ON mobile_app_builds(created_at DESC);
CREATE INDEX idx_mobile_app_templates_category ON mobile_app_templates(category);
CREATE INDEX idx_mobile_app_templates_is_published ON mobile_app_templates(is_published);
CREATE INDEX idx_mobile_app_templates_is_premium ON mobile_app_templates(is_premium);
CREATE INDEX idx_mobile_app_templates_usage_count ON mobile_app_templates(usage_count DESC);
CREATE INDEX idx_mobile_app_templates_rating ON mobile_app_templates(rating DESC);
CREATE INDEX idx_mobile_app_templates_supported_platforms ON mobile_app_templates USING GIN(supported_platforms);
CREATE INDEX idx_mobile_app_testing_user_id ON mobile_app_testing(user_id);
CREATE INDEX idx_mobile_app_testing_screen_id ON mobile_app_testing(screen_id);
CREATE INDEX idx_mobile_app_testing_device_id ON mobile_app_testing(device_id);
CREATE INDEX idx_mobile_app_testing_build_id ON mobile_app_testing(build_id);
CREATE INDEX idx_mobile_app_testing_test_type ON mobile_app_testing(test_type);
CREATE INDEX idx_mobile_app_testing_status ON mobile_app_testing(status);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_mobile_app_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mobile_devices_updated_at BEFORE UPDATE ON mobile_devices FOR EACH ROW EXECUTE FUNCTION update_mobile_app_updated_at();
CREATE TRIGGER trigger_mobile_app_screens_updated_at BEFORE UPDATE ON mobile_app_screens FOR EACH ROW EXECUTE FUNCTION update_mobile_app_updated_at();
CREATE TRIGGER trigger_mobile_app_builds_updated_at BEFORE UPDATE ON mobile_app_builds FOR EACH ROW EXECUTE FUNCTION update_mobile_app_updated_at();
CREATE TRIGGER trigger_mobile_app_templates_updated_at BEFORE UPDATE ON mobile_app_templates FOR EACH ROW EXECUTE FUNCTION update_mobile_app_updated_at();
CREATE TRIGGER trigger_mobile_app_testing_updated_at BEFORE UPDATE ON mobile_app_testing FOR EACH ROW EXECUTE FUNCTION update_mobile_app_updated_at();

CREATE OR REPLACE FUNCTION update_device_usage_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE mobile_devices
    SET total_tests = total_tests + 1,
        last_used_at = now()
    WHERE id = NEW.device_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_usage_stats AFTER INSERT ON mobile_app_testing FOR EACH ROW EXECUTE FUNCTION update_device_usage_stats();

CREATE OR REPLACE FUNCTION increment_screen_preview_count() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.preview_count > OLD.preview_count THEN
    -- Preview count manually incremented, no action needed
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_screen_preview_count BEFORE UPDATE ON mobile_app_screens FOR EACH ROW EXECUTE FUNCTION increment_screen_preview_count();

CREATE OR REPLACE FUNCTION calculate_build_duration() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.build_status = 'success' OR NEW.build_status = 'failed' THEN
    IF NEW.build_started_at IS NOT NULL AND NEW.build_completed_at IS NULL THEN
      NEW.build_completed_at = now();
      NEW.build_duration_seconds = EXTRACT(EPOCH FROM (NEW.build_completed_at - NEW.build_started_at))::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_build_duration BEFORE UPDATE ON mobile_app_builds FOR EACH ROW EXECUTE FUNCTION calculate_build_duration();

CREATE OR REPLACE FUNCTION increment_template_usage() RETURNS TRIGGER AS $$
BEGIN
  -- When a new screen is created from a template (check metadata for template_id)
  IF NEW.metadata->>'template_id' IS NOT NULL THEN
    UPDATE mobile_app_templates
    SET usage_count = usage_count + 1
    WHERE id = (NEW.metadata->>'template_id')::UUID;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_template_usage AFTER INSERT ON mobile_app_screens FOR EACH ROW EXECUTE FUNCTION increment_template_usage();

CREATE OR REPLACE FUNCTION increment_build_downloads() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.download_count > OLD.download_count THEN
    -- Download count manually incremented, potentially update distribution flag
    IF NOT OLD.is_distributed THEN
      NEW.is_distributed = true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_build_downloads BEFORE UPDATE ON mobile_app_builds FOR EACH ROW EXECUTE FUNCTION increment_build_downloads();

CREATE OR REPLACE FUNCTION update_test_metrics() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'passed' OR NEW.status = 'failed' THEN
    IF NEW.started_at IS NOT NULL AND NEW.completed_at IS NULL THEN
      NEW.completed_at = now();
      NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER * 1000;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_test_metrics BEFORE UPDATE ON mobile_app_testing FOR EACH ROW EXECUTE FUNCTION update_test_metrics();
