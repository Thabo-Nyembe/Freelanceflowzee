-- Minimal Integrations Management Schema
-- Additional features: templates, marketplace, rate limiting, health monitoring

-- ENUMS
DROP TYPE IF EXISTS template_type CASCADE;
DROP TYPE IF EXISTS marketplace_status CASCADE;
DROP TYPE IF EXISTS health_status CASCADE;
DROP TYPE IF EXISTS rate_limit_period CASCADE;

CREATE TYPE template_type AS ENUM ('quickstart', 'advanced', 'custom', 'community', 'official');
CREATE TYPE marketplace_status AS ENUM ('published', 'draft', 'pending', 'approved', 'rejected', 'deprecated');
CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'unknown');
CREATE TYPE rate_limit_period AS ENUM ('minute', 'hour', 'day', 'month');

-- TABLES
DROP TABLE IF EXISTS integration_templates CASCADE;
DROP TABLE IF EXISTS integration_marketplace CASCADE;
DROP TABLE IF EXISTS integration_rate_limits CASCADE;
DROP TABLE IF EXISTS integration_health_checks CASCADE;
DROP TABLE IF EXISTS integration_dependencies CASCADE;

CREATE TABLE integration_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Template Details
  template_name TEXT NOT NULL,
  template_type template_type NOT NULL,
  description TEXT NOT NULL,

  -- Integration Config
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  config_template JSONB NOT NULL,
  default_settings JSONB DEFAULT '{}'::JSONB,

  -- Variables
  required_variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  optional_variables TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  category integration_category NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty setup_difficulty NOT NULL DEFAULT 'medium',

  -- Usage
  usage_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,

  -- Publishing
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL DEFAULT '1.0.0',

  -- Documentation
  setup_guide TEXT,
  video_url TEXT,
  examples JSONB DEFAULT '[]'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_name, version)
);

CREATE TABLE integration_marketplace (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Listing Details
  listing_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,

  -- Marketplace Status
  status marketplace_status NOT NULL DEFAULT 'draft',

  -- Integration Info
  integration_category integration_category NOT NULL,
  supported_platforms TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Pricing
  is_free BOOLEAN NOT NULL DEFAULT true,
  price DECIMAL(10, 2),
  pricing_model TEXT, -- 'one-time', 'monthly', 'yearly', 'usage-based'

  -- Media
  logo_url TEXT,
  screenshots TEXT[] DEFAULT ARRAY[]::TEXT[],
  video_url TEXT,

  -- Stats
  total_installs INTEGER NOT NULL DEFAULT 0,
  active_users INTEGER NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,

  -- Developer Info
  developer_name TEXT NOT NULL,
  developer_website TEXT,
  support_email TEXT,
  documentation_url TEXT,

  -- Publishing
  published_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rate Limit Details
  endpoint TEXT,
  limit_period rate_limit_period NOT NULL,
  max_requests INTEGER NOT NULL,

  -- Current Usage
  current_requests INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  period_end TIMESTAMPTZ NOT NULL,

  -- Throttling
  is_throttled BOOLEAN NOT NULL DEFAULT false,
  throttled_until TIMESTAMPTZ,

  -- Reset
  auto_reset BOOLEAN NOT NULL DEFAULT true,
  last_reset_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(integration_id, user_id, endpoint, limit_period)
);

CREATE TABLE integration_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,

  -- Health Status
  health_status health_status NOT NULL DEFAULT 'unknown',

  -- Metrics
  response_time_ms INTEGER,
  uptime_percentage DECIMAL(5, 2),
  error_rate DECIMAL(5, 2),

  -- Check Details
  last_check_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_check_at TIMESTAMPTZ,
  check_interval_minutes INTEGER NOT NULL DEFAULT 5,

  -- Results
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  consecutive_failures INTEGER NOT NULL DEFAULT 0,

  -- Error Details
  last_error_message TEXT,
  last_error_code TEXT,

  -- Alerts
  alert_threshold INTEGER NOT NULL DEFAULT 3,
  alert_sent BOOLEAN NOT NULL DEFAULT false,
  alert_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(integration_id)
);

CREATE TABLE integration_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  depends_on_integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,

  -- Dependency Details
  dependency_type TEXT NOT NULL, -- 'required', 'optional', 'recommended'
  description TEXT,

  -- Version
  min_version TEXT,
  max_version TEXT,

  -- Status
  is_satisfied BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (integration_id != depends_on_integration_id)
);

-- INDEXES
CREATE INDEX idx_integration_templates_user_id ON integration_templates(user_id);
CREATE INDEX idx_integration_templates_template_type ON integration_templates(template_type);
CREATE INDEX idx_integration_templates_category ON integration_templates(category);
CREATE INDEX idx_integration_templates_is_published ON integration_templates(is_published);
CREATE INDEX idx_integration_templates_is_featured ON integration_templates(is_featured);
CREATE INDEX idx_integration_templates_usage_count ON integration_templates(usage_count DESC);
CREATE INDEX idx_integration_marketplace_developer_user_id ON integration_marketplace(developer_user_id);
CREATE INDEX idx_integration_marketplace_status ON integration_marketplace(status);
CREATE INDEX idx_integration_marketplace_category ON integration_marketplace(integration_category);
CREATE INDEX idx_integration_marketplace_total_installs ON integration_marketplace(total_installs DESC);
CREATE INDEX idx_integration_marketplace_average_rating ON integration_marketplace(average_rating DESC);
CREATE INDEX idx_integration_rate_limits_integration_id ON integration_rate_limits(integration_id);
CREATE INDEX idx_integration_rate_limits_user_id ON integration_rate_limits(user_id);
CREATE INDEX idx_integration_rate_limits_period_end ON integration_rate_limits(period_end);
CREATE INDEX idx_integration_rate_limits_is_throttled ON integration_rate_limits(is_throttled);
CREATE INDEX idx_integration_health_checks_integration_id ON integration_health_checks(integration_id);
CREATE INDEX idx_integration_health_checks_health_status ON integration_health_checks(health_status);
CREATE INDEX idx_integration_health_checks_next_check_at ON integration_health_checks(next_check_at);
CREATE INDEX idx_integration_dependencies_integration_id ON integration_dependencies(integration_id);
CREATE INDEX idx_integration_dependencies_depends_on_id ON integration_dependencies(depends_on_integration_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_integrations_management_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_integration_templates_updated_at BEFORE UPDATE ON integration_templates FOR EACH ROW EXECUTE FUNCTION update_integrations_management_updated_at();
CREATE TRIGGER trigger_integration_marketplace_updated_at BEFORE UPDATE ON integration_marketplace FOR EACH ROW EXECUTE FUNCTION update_integrations_management_updated_at();
CREATE TRIGGER trigger_integration_rate_limits_updated_at BEFORE UPDATE ON integration_rate_limits FOR EACH ROW EXECUTE FUNCTION update_integrations_management_updated_at();
CREATE TRIGGER trigger_integration_health_checks_updated_at BEFORE UPDATE ON integration_health_checks FOR EACH ROW EXECUTE FUNCTION update_integrations_management_updated_at();

CREATE OR REPLACE FUNCTION increment_template_usage() RETURNS TRIGGER AS $$
BEGIN
  UPDATE integration_templates
  SET usage_count = usage_count + 1
  WHERE id = NEW.integration_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_template_usage AFTER INSERT ON integrations FOR EACH ROW WHEN (NEW.config->>'template_id' IS NOT NULL) EXECUTE FUNCTION increment_template_usage();

CREATE OR REPLACE FUNCTION reset_rate_limit_if_expired() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.period_end <= now() AND NEW.auto_reset = true THEN
    NEW.current_requests = 0;
    NEW.period_start = now();

    -- Calculate new period_end based on limit_period
    NEW.period_end = CASE
      WHEN NEW.limit_period = 'minute' THEN now() + INTERVAL '1 minute'
      WHEN NEW.limit_period = 'hour' THEN now() + INTERVAL '1 hour'
      WHEN NEW.limit_period = 'day' THEN now() + INTERVAL '1 day'
      WHEN NEW.limit_period = 'month' THEN now() + INTERVAL '1 month'
    END;

    NEW.is_throttled = false;
    NEW.throttled_until = NULL;
    NEW.last_reset_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reset_rate_limit_if_expired BEFORE UPDATE ON integration_rate_limits FOR EACH ROW EXECUTE FUNCTION reset_rate_limit_if_expired();

CREATE OR REPLACE FUNCTION check_rate_limit_exceeded() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_requests >= NEW.max_requests THEN
    NEW.is_throttled = true;
    NEW.throttled_until = NEW.period_end;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_rate_limit_exceeded BEFORE UPDATE ON integration_rate_limits FOR EACH ROW EXECUTE FUNCTION check_rate_limit_exceeded();

CREATE OR REPLACE FUNCTION update_health_check_schedule() RETURNS TRIGGER AS $$
BEGIN
  NEW.next_check_at = now() + (NEW.check_interval_minutes || ' minutes')::INTERVAL;

  -- Update consecutive failures
  IF NEW.health_status IN ('degraded', 'unhealthy') THEN
    NEW.consecutive_failures = NEW.consecutive_failures + 1;
  ELSE
    NEW.consecutive_failures = 0;
  END IF;

  -- Send alert if threshold reached
  IF NEW.consecutive_failures >= NEW.alert_threshold AND NEW.alert_sent = false THEN
    NEW.alert_sent = true;
    NEW.alert_sent_at = now();
  END IF;

  -- Reset alert flag when health recovers
  IF NEW.health_status = 'healthy' AND NEW.alert_sent = true THEN
    NEW.alert_sent = false;
    NEW.alert_sent_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_health_check_schedule BEFORE UPDATE ON integration_health_checks FOR EACH ROW EXECUTE FUNCTION update_health_check_schedule();

CREATE OR REPLACE FUNCTION increment_marketplace_installs() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'connected' AND OLD.status != 'connected' THEN
    UPDATE integration_marketplace
    SET total_installs = total_installs + 1,
        active_users = active_users + 1
    WHERE listing_name = NEW.name;
  ELSIF NEW.status != 'connected' AND OLD.status = 'connected' THEN
    UPDATE integration_marketplace
    SET active_users = GREATEST(0, active_users - 1)
    WHERE listing_name = NEW.name;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_marketplace_installs AFTER UPDATE OF status ON integrations FOR EACH ROW EXECUTE FUNCTION increment_marketplace_installs();

CREATE OR REPLACE FUNCTION set_marketplace_published_timestamp() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = now();
  ELSIF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    NEW.approved_at = now();
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    NEW.rejected_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_marketplace_published_timestamp BEFORE UPDATE OF status ON integration_marketplace FOR EACH ROW EXECUTE FUNCTION set_marketplace_published_timestamp();
