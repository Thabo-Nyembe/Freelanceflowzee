-- Minimal Integration Setup Schema
-- Wizard sessions, step tracking, validation, onboarding progress

-- ENUMS
DROP TYPE IF EXISTS setup_status CASCADE;
DROP TYPE IF EXISTS validation_status CASCADE;
DROP TYPE IF EXISTS onboarding_stage CASCADE;

CREATE TYPE setup_status AS ENUM ('not_started', 'in_progress', 'completed', 'failed', 'skipped');
CREATE TYPE validation_status AS ENUM ('pending', 'validating', 'valid', 'invalid', 'expired');
CREATE TYPE onboarding_stage AS ENUM ('welcome', 'select_integrations', 'configure', 'test', 'complete');

-- TABLES
DROP TABLE IF EXISTS integration_setup_sessions CASCADE;
DROP TABLE IF EXISTS integration_setup_steps CASCADE;
DROP TABLE IF EXISTS integration_validation_results CASCADE;
DROP TABLE IF EXISTS integration_onboarding_progress CASCADE;
DROP TABLE IF EXISTS integration_setup_errors CASCADE;

CREATE TABLE integration_setup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session Details
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL, -- 'first_time', 'reconnect', 'upgrade', 'migration'

  -- Progress
  current_step INTEGER NOT NULL DEFAULT 1,
  total_steps INTEGER NOT NULL,
  completed_steps INTEGER NOT NULL DEFAULT 0,
  status setup_status NOT NULL DEFAULT 'not_started',

  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,

  -- Configuration
  config_snapshot JSONB DEFAULT '{}'::JSONB,
  user_selections JSONB DEFAULT '{}'::JSONB,

  -- Context
  referrer TEXT,
  device_type TEXT,
  browser TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_setup_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES integration_setup_sessions(id) ON DELETE CASCADE,

  -- Step Details
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL, -- 'oauth', 'api_key', 'manual_config', 'test', 'review'

  -- Status
  status setup_status NOT NULL DEFAULT 'not_started',

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,

  -- Data
  step_data JSONB DEFAULT '{}'::JSONB,
  validation_errors TEXT[],

  -- Help
  help_accessed BOOLEAN NOT NULL DEFAULT false,
  skip_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(session_id, step_number)
);

CREATE TABLE integration_validation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES integration_setup_sessions(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Validation Details
  validation_type TEXT NOT NULL, -- 'oauth_token', 'api_key', 'webhook', 'connection', 'permissions'
  validation_status validation_status NOT NULL DEFAULT 'pending',

  -- Test Details
  test_endpoint TEXT,
  test_request JSONB,
  test_response JSONB,

  -- Results
  is_valid BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  error_code TEXT,
  warnings TEXT[],

  -- Metrics
  response_time_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  -- Timestamps
  validated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Progress
  current_stage onboarding_stage NOT NULL DEFAULT 'welcome',
  completed_stages onboarding_stage[] DEFAULT ARRAY[]::onboarding_stage[],

  -- Integrations
  total_integrations_available INTEGER NOT NULL DEFAULT 0,
  required_integrations_completed INTEGER NOT NULL DEFAULT 0,
  optional_integrations_completed INTEGER NOT NULL DEFAULT 0,

  -- Completion
  is_complete BOOLEAN NOT NULL DEFAULT false,
  completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_at TIMESTAMPTZ,

  -- Preferences
  skipped_optional BOOLEAN NOT NULL DEFAULT false,
  selected_integrations TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  onboarding_metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE integration_setup_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES integration_setup_sessions(id) ON DELETE CASCADE,
  step_id UUID REFERENCES integration_setup_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Error Details
  error_type TEXT NOT NULL, -- 'validation', 'network', 'authentication', 'permission', 'configuration', 'timeout'
  error_code TEXT,
  error_message TEXT NOT NULL,

  -- Context
  occurred_at_step INTEGER,
  integration_id UUID REFERENCES integrations(id) ON DELETE SET NULL,

  -- Stack Trace
  stack_trace TEXT,
  request_data JSONB,
  response_data JSONB,

  -- Resolution
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  -- User Action
  user_action TEXT, -- 'retry', 'skip', 'abort', 'contact_support'

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_integration_setup_sessions_user_id ON integration_setup_sessions(user_id);
CREATE INDEX idx_integration_setup_sessions_integration_id ON integration_setup_sessions(integration_id);
CREATE INDEX idx_integration_setup_sessions_status ON integration_setup_sessions(status);
CREATE INDEX idx_integration_setup_sessions_started_at ON integration_setup_sessions(started_at DESC);
CREATE INDEX idx_integration_setup_steps_session_id ON integration_setup_steps(session_id);
CREATE INDEX idx_integration_setup_steps_status ON integration_setup_steps(status);
CREATE INDEX idx_integration_validation_results_session_id ON integration_validation_results(session_id);
CREATE INDEX idx_integration_validation_results_integration_id ON integration_validation_results(integration_id);
CREATE INDEX idx_integration_validation_results_user_id ON integration_validation_results(user_id);
CREATE INDEX idx_integration_validation_results_validation_status ON integration_validation_results(validation_status);
CREATE INDEX idx_integration_onboarding_progress_user_id ON integration_onboarding_progress(user_id);
CREATE INDEX idx_integration_onboarding_progress_current_stage ON integration_onboarding_progress(current_stage);
CREATE INDEX idx_integration_onboarding_progress_is_complete ON integration_onboarding_progress(is_complete);
CREATE INDEX idx_integration_setup_errors_session_id ON integration_setup_errors(session_id);
CREATE INDEX idx_integration_setup_errors_user_id ON integration_setup_errors(user_id);
CREATE INDEX idx_integration_setup_errors_error_type ON integration_setup_errors(error_type);
CREATE INDEX idx_integration_setup_errors_is_resolved ON integration_setup_errors(is_resolved);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_integration_setup_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_integration_setup_sessions_updated_at BEFORE UPDATE ON integration_setup_sessions FOR EACH ROW EXECUTE FUNCTION update_integration_setup_updated_at();
CREATE TRIGGER trigger_integration_setup_steps_updated_at BEFORE UPDATE ON integration_setup_steps FOR EACH ROW EXECUTE FUNCTION update_integration_setup_updated_at();
CREATE TRIGGER trigger_integration_onboarding_progress_updated_at BEFORE UPDATE ON integration_onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_integration_setup_updated_at();

CREATE OR REPLACE FUNCTION update_session_progress() RETURNS TRIGGER AS $$
BEGIN
  -- Update completed_steps count
  UPDATE integration_setup_sessions
  SET
    completed_steps = (
      SELECT COUNT(*)
      FROM integration_setup_steps
      WHERE session_id = NEW.session_id
      AND status = 'completed'
    ),
    current_step = NEW.step_number
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_progress AFTER UPDATE ON integration_setup_steps FOR EACH ROW WHEN (NEW.status = 'completed') EXECUTE FUNCTION update_session_progress();

CREATE OR REPLACE FUNCTION complete_session_when_all_steps_done() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_steps >= NEW.total_steps AND NEW.status != 'completed' THEN
    NEW.status = 'completed';
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_complete_session_when_all_steps_done BEFORE UPDATE ON integration_setup_sessions FOR EACH ROW EXECUTE FUNCTION complete_session_when_all_steps_done();

CREATE OR REPLACE FUNCTION update_onboarding_completion() RETURNS TRIGGER AS $$
BEGIN
  -- Calculate completion percentage
  IF NEW.total_integrations_available > 0 THEN
    NEW.completion_percentage = ROUND(
      ((NEW.required_integrations_completed::NUMERIC / NEW.total_integrations_available::NUMERIC) * 100)::NUMERIC,
      0
    )::INTEGER;
  END IF;

  -- Mark as complete if all required integrations are done
  IF NEW.required_integrations_completed >= NEW.total_integrations_available AND NEW.is_complete = false THEN
    NEW.is_complete = true;
    NEW.completed_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_onboarding_completion BEFORE UPDATE ON integration_onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_onboarding_completion();

CREATE OR REPLACE FUNCTION track_step_time() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.started_at IS NOT NULL THEN
    NEW.time_spent_seconds = EXTRACT(EPOCH FROM (now() - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_step_time BEFORE UPDATE ON integration_setup_steps FOR EACH ROW EXECUTE FUNCTION track_step_time();

CREATE OR REPLACE FUNCTION track_session_time() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.started_at IS NOT NULL THEN
    NEW.time_spent_seconds = EXTRACT(EPOCH FROM (now() - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_session_time BEFORE UPDATE ON integration_setup_sessions FOR EACH ROW EXECUTE FUNCTION track_session_time();

CREATE OR REPLACE FUNCTION increment_retry_count_on_validation() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validation_status = 'validating' AND OLD.validation_status IN ('invalid', 'pending') THEN
    NEW.retry_count = NEW.retry_count + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_retry_count_on_validation BEFORE UPDATE ON integration_validation_results FOR EACH ROW EXECUTE FUNCTION increment_retry_count_on_validation();
