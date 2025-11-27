-- System Insights - Complete System Monitoring & Performance Tracking
-- Track application health, API performance, errors, resource usage, and system metrics

-- ENUMS
DROP TYPE IF EXISTS metric_type CASCADE;
DROP TYPE IF EXISTS health_status CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS resource_type CASCADE;

CREATE TYPE metric_type AS ENUM (
  'api_response_time', 'database_query_time', 'page_load_time',
  'error_rate', 'request_count', 'memory_usage', 'cpu_usage',
  'storage_usage', 'bandwidth_usage', 'active_users', 'concurrent_sessions'
);

CREATE TYPE health_status AS ENUM ('healthy', 'degraded', 'unhealthy', 'critical');

CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');

CREATE TYPE resource_type AS ENUM ('database', 'storage', 'api', 'cdn', 'compute');

-- TABLES
DROP TABLE IF EXISTS system_metrics CASCADE;
DROP TABLE IF EXISTS performance_logs CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS system_health CASCADE;
DROP TABLE IF EXISTS resource_usage CASCADE;
DROP TABLE IF EXISTS api_performance CASCADE;
DROP TABLE IF EXISTS system_alerts CASCADE;

CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Metric Details
  metric_type metric_type NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12, 2) NOT NULL,
  metric_unit TEXT NOT NULL, -- 'ms', 'MB', 'GB', '%', 'count'

  -- Context
  endpoint TEXT,
  service TEXT,
  environment TEXT DEFAULT 'production',

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Performance Details
  operation TEXT NOT NULL,
  duration_ms DECIMAL(10, 2) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT true,

  -- Request Info
  endpoint TEXT,
  method TEXT,
  status_code INTEGER,

  -- Timing Breakdown
  network_time DECIMAL(10, 2),
  processing_time DECIMAL(10, 2),
  database_time DECIMAL(10, 2),

  -- Resource Usage
  memory_mb DECIMAL(10, 2),
  cpu_percent DECIMAL(5, 2),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Error Details
  error_id TEXT NOT NULL UNIQUE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  severity alert_severity NOT NULL DEFAULT 'error',

  -- Context
  endpoint TEXT,
  operation TEXT,
  file_path TEXT,
  line_number INTEGER,

  -- User Context
  browser TEXT,
  os TEXT,
  device TEXT,
  ip_address INET,

  -- Resolution
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE system_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Health Status
  status health_status NOT NULL,
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Component Health
  api_health health_status NOT NULL DEFAULT 'healthy',
  database_health health_status NOT NULL DEFAULT 'healthy',
  storage_health health_status NOT NULL DEFAULT 'healthy',
  cdn_health health_status NOT NULL DEFAULT 'healthy',

  -- Metrics Summary
  avg_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  error_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  uptime_percent DECIMAL(5, 2) NOT NULL DEFAULT 100,
  active_users INTEGER NOT NULL DEFAULT 0,

  -- Issues
  critical_issues INTEGER NOT NULL DEFAULT 0,
  warnings INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Resource Details
  resource_type resource_type NOT NULL,
  resource_name TEXT NOT NULL,

  -- Usage Metrics
  usage_current DECIMAL(12, 2) NOT NULL,
  usage_limit DECIMAL(12, 2) NOT NULL,
  usage_percent DECIMAL(5, 2) NOT NULL,

  -- Units
  unit TEXT NOT NULL, -- 'GB', 'MB', 'requests', 'queries'

  -- Trends
  usage_1h_ago DECIMAL(12, 2),
  usage_24h_ago DECIMAL(12, 2),
  usage_7d_ago DECIMAL(12, 2),

  -- Alerts
  alert_threshold DECIMAL(5, 2) DEFAULT 80,
  is_alerting BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE api_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- API Details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,

  -- Performance Metrics
  total_requests INTEGER NOT NULL DEFAULT 0,
  successful_requests INTEGER NOT NULL DEFAULT 0,
  failed_requests INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) NOT NULL DEFAULT 100,

  -- Response Times
  avg_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  max_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  p50_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  p95_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,
  p99_response_time DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert Details
  alert_type TEXT NOT NULL,
  severity alert_severity NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Source
  source TEXT NOT NULL, -- 'api', 'database', 'storage', 'monitoring'
  resource_type resource_type,
  resource_id TEXT,

  -- Metrics
  threshold_value DECIMAL(12, 2),
  current_value DECIMAL(12, 2),

  -- Status
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),

  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_system_metrics_user_id ON system_metrics(user_id);
CREATE INDEX idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX idx_system_metrics_timestamp ON system_metrics(timestamp DESC);
CREATE INDEX idx_system_metrics_tags ON system_metrics USING GIN(tags);

CREATE INDEX idx_performance_logs_user_id ON performance_logs(user_id);
CREATE INDEX idx_performance_logs_timestamp ON performance_logs(timestamp DESC);
CREATE INDEX idx_performance_logs_endpoint ON performance_logs(endpoint);
CREATE INDEX idx_performance_logs_success ON performance_logs(success);

CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX idx_error_logs_error_id ON error_logs(error_id);
CREATE INDEX idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX idx_error_logs_severity ON error_logs(severity);
CREATE INDEX idx_error_logs_resolved ON error_logs(resolved);

CREATE INDEX idx_system_health_status ON system_health(status);
CREATE INDEX idx_system_health_checked_at ON system_health(checked_at DESC);

CREATE INDEX idx_resource_usage_user_id ON resource_usage(user_id);
CREATE INDEX idx_resource_usage_type ON resource_usage(resource_type);
CREATE INDEX idx_resource_usage_alerting ON resource_usage(is_alerting);
CREATE INDEX idx_resource_usage_timestamp ON resource_usage(timestamp DESC);

CREATE INDEX idx_api_performance_endpoint ON api_performance(endpoint);
CREATE INDEX idx_api_performance_period ON api_performance(period_start, period_end);

CREATE INDEX idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX idx_system_alerts_acknowledged ON system_alerts(acknowledged);
CREATE INDEX idx_system_alerts_resolved ON system_alerts(resolved);
CREATE INDEX idx_system_alerts_triggered_at ON system_alerts(triggered_at DESC);

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION log_metric(
  p_user_id UUID,
  p_metric_type metric_type,
  p_metric_name TEXT,
  p_metric_value DECIMAL,
  p_metric_unit TEXT,
  p_endpoint TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO system_metrics (
    user_id,
    metric_type,
    metric_name,
    metric_value,
    metric_unit,
    endpoint,
    metadata
  ) VALUES (
    p_user_id,
    p_metric_type,
    p_metric_name,
    p_metric_value,
    p_metric_unit,
    p_endpoint,
    p_metadata
  ) RETURNING id INTO metric_id;

  RETURN metric_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION log_error(
  p_user_id UUID,
  p_error_id TEXT,
  p_error_type TEXT,
  p_error_message TEXT,
  p_severity alert_severity DEFAULT 'error',
  p_endpoint TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO error_logs (
    user_id,
    error_id,
    error_type,
    error_message,
    severity,
    endpoint,
    metadata
  ) VALUES (
    p_user_id,
    p_error_id,
    p_error_type,
    p_error_message,
    p_severity,
    p_endpoint,
    p_metadata
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_system_health_score() RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 100;
  error_count INTEGER;
  avg_response DECIMAL;
  resource_alerts INTEGER;
BEGIN
  -- Check recent errors (last hour)
  SELECT COUNT(*) INTO error_count
  FROM error_logs
  WHERE timestamp > now() - interval '1 hour'
  AND severity IN ('error', 'critical');

  -- Deduct points for errors
  score := score - LEAST(error_count * 5, 30);

  -- Check average response time (last hour)
  SELECT AVG(duration_ms) INTO avg_response
  FROM performance_logs
  WHERE timestamp > now() - interval '1 hour';

  -- Deduct points for slow responses
  IF avg_response > 1000 THEN
    score := score - 20;
  ELSIF avg_response > 500 THEN
    score := score - 10;
  END IF;

  -- Check resource alerts
  SELECT COUNT(*) INTO resource_alerts
  FROM resource_usage
  WHERE is_alerting = true
  AND timestamp > now() - interval '1 hour';

  -- Deduct points for resource alerts
  score := score - LEAST(resource_alerts * 10, 30);

  RETURN GREATEST(score, 0);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_system_health() RETURNS health_status AS $$
DECLARE
  score INTEGER;
  status health_status;
BEGIN
  score := get_system_health_score();

  IF score >= 90 THEN
    status := 'healthy';
  ELSIF score >= 70 THEN
    status := 'degraded';
  ELSIF score >= 50 THEN
    status := 'unhealthy';
  ELSE
    status := 'critical';
  END IF;

  RETURN status;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_metrics_summary(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ := COALESCE(p_start_date, now() - interval '24 hours');
  end_date TIMESTAMPTZ := COALESCE(p_end_date, now());
BEGIN
  SELECT jsonb_build_object(
    'total_metrics', COUNT(*),
    'by_type', (
      SELECT jsonb_object_agg(metric_type, count)
      FROM (
        SELECT metric_type, COUNT(*) as count
        FROM system_metrics
        WHERE (user_id = p_user_id OR p_user_id IS NULL)
        AND timestamp BETWEEN start_date AND end_date
        GROUP BY metric_type
      ) t
    ),
    'avg_values', (
      SELECT jsonb_object_agg(metric_type, avg_value)
      FROM (
        SELECT metric_type, AVG(metric_value) as avg_value
        FROM system_metrics
        WHERE (user_id = p_user_id OR p_user_id IS NULL)
        AND timestamp BETWEEN start_date AND end_date
        GROUP BY metric_type
      ) t
    )
  ) INTO result
  FROM system_metrics
  WHERE (user_id = p_user_id OR p_user_id IS NULL)
  AND timestamp BETWEEN start_date AND end_date;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;

-- Policies: Users can see their own metrics
CREATE POLICY system_metrics_user_policy ON system_metrics
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY performance_logs_user_policy ON performance_logs
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY error_logs_user_policy ON error_logs
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- System-wide health is visible to all authenticated users
CREATE POLICY system_health_policy ON system_health
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY resource_usage_user_policy ON resource_usage
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY api_performance_policy ON api_performance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY system_alerts_policy ON system_alerts
  FOR ALL USING (auth.role() = 'authenticated');
