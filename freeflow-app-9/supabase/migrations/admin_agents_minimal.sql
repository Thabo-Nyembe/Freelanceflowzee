-- Admin Agents System - Minimal Schema
-- Agent management, coordination, monitoring, and reporting

-- ENUMS
DROP TYPE IF EXISTS agent_type CASCADE;
DROP TYPE IF EXISTS agent_status CASCADE;
DROP TYPE IF EXISTS execution_status CASCADE;
DROP TYPE IF EXISTS log_level CASCADE;

CREATE TYPE agent_type AS ENUM ('ai_update', 'bug_testing', 'coordinator', 'optimizer', 'test_runner', 'custom');
CREATE TYPE agent_status AS ENUM ('active', 'paused', 'stopped', 'error', 'initializing');
CREATE TYPE execution_status AS ENUM ('running', 'completed', 'failed', 'cancelled', 'pending');
CREATE TYPE log_level AS ENUM ('debug', 'info', 'warn', 'error', 'critical');

-- TABLES
DROP TABLE IF EXISTS admin_agents CASCADE;
DROP TABLE IF EXISTS agent_executions CASCADE;
DROP TABLE IF EXISTS agent_logs CASCADE;
DROP TABLE IF EXISTS agent_metrics CASCADE;
DROP TABLE IF EXISTS agent_configurations CASCADE;

CREATE TABLE admin_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Agent Details
  agent_name TEXT NOT NULL UNIQUE,
  agent_type agent_type NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',

  -- Status
  status agent_status NOT NULL DEFAULT 'initializing',
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_critical BOOLEAN NOT NULL DEFAULT false,

  -- Configuration
  config JSONB DEFAULT '{}'::JSONB,
  execution_interval INTEGER, -- Seconds between runs
  max_concurrent_executions INTEGER DEFAULT 1,
  timeout_seconds INTEGER DEFAULT 300,
  retry_count INTEGER DEFAULT 3,

  -- Health & Monitoring
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  last_health_check_at TIMESTAMPTZ,
  error_message TEXT,

  -- Execution Stats
  total_executions INTEGER NOT NULL DEFAULT 0,
  successful_executions INTEGER NOT NULL DEFAULT 0,
  failed_executions INTEGER NOT NULL DEFAULT 0,
  average_duration_ms BIGINT DEFAULT 0,

  -- Scheduling
  next_execution_at TIMESTAMPTZ,
  last_execution_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_name)
);

CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES admin_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Execution Details
  execution_status execution_status NOT NULL DEFAULT 'pending',
  trigger_type TEXT NOT NULL, -- 'scheduled', 'manual', 'event', 'coordinator'
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_ms BIGINT,

  -- Results
  result JSONB DEFAULT '{}'::JSONB,
  output_data JSONB DEFAULT '{}'::JSONB,
  error_message TEXT,
  stack_trace TEXT,

  -- Resource Usage
  cpu_usage_percent DECIMAL(5, 2),
  memory_usage_mb BIGINT,

  -- Context
  context JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES admin_agents(id) ON DELETE CASCADE,
  execution_id UUID REFERENCES agent_executions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Log Details
  log_level log_level NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}'::JSONB,

  -- Context
  function_name TEXT,
  line_number INTEGER,
  file_path TEXT,
  stack_trace TEXT,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES admin_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metric Details
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12, 4) NOT NULL,
  metric_unit TEXT,
  metric_type TEXT NOT NULL, -- 'counter', 'gauge', 'histogram', 'summary'

  -- Dimensions
  dimensions JSONB DEFAULT '{}'::JSONB,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES admin_agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Configuration Details
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  config_type TEXT NOT NULL, -- 'string', 'number', 'boolean', 'object', 'array'
  is_secret BOOLEAN NOT NULL DEFAULT false,

  -- Validation
  is_required BOOLEAN NOT NULL DEFAULT false,
  default_value JSONB,
  validation_schema JSONB,

  -- Versioning
  version INTEGER NOT NULL DEFAULT 1,
  previous_value JSONB,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, config_key)
);

-- INDEXES
CREATE INDEX idx_admin_agents_user_id ON admin_agents(user_id);
CREATE INDEX idx_admin_agents_agent_type ON admin_agents(agent_type);
CREATE INDEX idx_admin_agents_status ON admin_agents(status);
CREATE INDEX idx_admin_agents_is_enabled ON admin_agents(is_enabled);
CREATE INDEX idx_admin_agents_next_execution_at ON admin_agents(next_execution_at);
CREATE INDEX idx_admin_agents_health_score ON admin_agents(health_score);
CREATE INDEX idx_admin_agents_tags ON admin_agents USING GIN(tags);

CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_user_id ON agent_executions(user_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(execution_status);
CREATE INDEX idx_agent_executions_trigger_type ON agent_executions(trigger_type);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at DESC);
CREATE INDEX idx_agent_executions_started_at ON agent_executions(started_at DESC);

CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id);
CREATE INDEX idx_agent_logs_execution_id ON agent_logs(execution_id);
CREATE INDEX idx_agent_logs_user_id ON agent_logs(user_id);
CREATE INDEX idx_agent_logs_log_level ON agent_logs(log_level);
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp DESC);
CREATE INDEX idx_agent_logs_tags ON agent_logs USING GIN(tags);

CREATE INDEX idx_agent_metrics_agent_id ON agent_metrics(agent_id);
CREATE INDEX idx_agent_metrics_user_id ON agent_metrics(user_id);
CREATE INDEX idx_agent_metrics_metric_name ON agent_metrics(metric_name);
CREATE INDEX idx_agent_metrics_timestamp ON agent_metrics(timestamp DESC);
CREATE INDEX idx_agent_metrics_tags ON agent_metrics USING GIN(tags);

CREATE INDEX idx_agent_configurations_agent_id ON agent_configurations(agent_id);
CREATE INDEX idx_agent_configurations_user_id ON agent_configurations(user_id);
CREATE INDEX idx_agent_configurations_config_key ON agent_configurations(config_key);
CREATE INDEX idx_agent_configurations_tags ON agent_configurations USING GIN(tags);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_admin_agents_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_admin_agents_updated_at BEFORE UPDATE ON admin_agents FOR EACH ROW EXECUTE FUNCTION update_admin_agents_updated_at();
CREATE TRIGGER trigger_agent_executions_updated_at BEFORE UPDATE ON agent_executions FOR EACH ROW EXECUTE FUNCTION update_admin_agents_updated_at();
CREATE TRIGGER trigger_agent_configurations_updated_at BEFORE UPDATE ON agent_configurations FOR EACH ROW EXECUTE FUNCTION update_admin_agents_updated_at();

CREATE OR REPLACE FUNCTION increment_agent_executions() RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_agents
  SET total_executions = total_executions + 1,
      last_execution_at = now()
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_agent_executions AFTER INSERT ON agent_executions FOR EACH ROW EXECUTE FUNCTION increment_agent_executions();

CREATE OR REPLACE FUNCTION update_agent_execution_stats() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.execution_status = 'completed' AND OLD.execution_status != 'completed' THEN
    NEW.completed_at = now();
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;

    UPDATE admin_agents
    SET successful_executions = successful_executions + 1,
        last_success_at = now(),
        average_duration_ms = (average_duration_ms * successful_executions + NEW.duration_ms) / (successful_executions + 1)
    WHERE id = NEW.agent_id;

  ELSIF NEW.execution_status = 'failed' AND OLD.execution_status != 'failed' THEN
    NEW.completed_at = now();
    NEW.duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;

    UPDATE admin_agents
    SET failed_executions = failed_executions + 1,
        last_failure_at = now(),
        error_message = NEW.error_message
    WHERE id = NEW.agent_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_execution_stats BEFORE UPDATE OF execution_status ON agent_executions FOR EACH ROW EXECUTE FUNCTION update_agent_execution_stats();

CREATE OR REPLACE FUNCTION start_agent_execution() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.execution_status = 'running' AND OLD.execution_status = 'pending' THEN
    NEW.started_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_start_agent_execution BEFORE UPDATE OF execution_status ON agent_executions FOR EACH ROW EXECUTE FUNCTION start_agent_execution();

CREATE OR REPLACE FUNCTION calculate_agent_health() RETURNS TRIGGER AS $$
DECLARE
  health INTEGER;
  success_rate DECIMAL;
BEGIN
  IF NEW.total_executions > 0 THEN
    success_rate = (NEW.successful_executions::DECIMAL / NEW.total_executions) * 100;
    health = success_rate::INTEGER;

    -- Deduct for failures
    IF NEW.failed_executions > 5 THEN
      health = health - 10;
    END IF;

    -- Deduct for errors
    IF NEW.error_message IS NOT NULL THEN
      health = health - 20;
    END IF;

    -- Bonus for long uptime
    IF NEW.status = 'active' THEN
      health = health + 5;
    END IF;

    NEW.health_score = GREATEST(0, LEAST(100, health));
  END IF;

  NEW.last_health_check_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_agent_health BEFORE UPDATE ON admin_agents FOR EACH ROW EXECUTE FUNCTION calculate_agent_health();

CREATE OR REPLACE FUNCTION track_config_changes() RETURNS TRIGGER AS $$
BEGIN
  NEW.previous_value = OLD.config_value;
  NEW.changed_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_config_changes BEFORE UPDATE OF config_value ON agent_configurations FOR EACH ROW EXECUTE FUNCTION track_config_changes();
