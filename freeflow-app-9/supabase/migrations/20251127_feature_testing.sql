-- Feature Testing & Quality Assurance System
-- Track test runs, results, issues, coverage, and QA metrics

-- ENUMS
DROP TYPE IF EXISTS test_status CASCADE;
DROP TYPE IF EXISTS test_category CASCADE;
DROP TYPE IF EXISTS issue_severity CASCADE;
DROP TYPE IF EXISTS test_result CASCADE;

CREATE TYPE test_status AS ENUM ('pending', 'testing', 'passed', 'failed', 'warning', 'skipped');

CREATE TYPE test_category AS ENUM (
  'core-business', 'ai-tools', 'creative-tools', 'collaboration',
  'client-management', 'admin', 'integration', 'performance', 'security'
);

CREATE TYPE issue_severity AS ENUM ('critical', 'high', 'medium', 'low', 'info');

CREATE TYPE test_result AS ENUM ('pass', 'fail', 'warning', 'skip', 'error');

-- TABLES
DROP TABLE IF EXISTS feature_tests CASCADE;
DROP TABLE IF EXISTS test_runs CASCADE;
DROP TABLE IF EXISTS test_results CASCADE;
DROP TABLE IF EXISTS test_issues CASCADE;
DROP TABLE IF EXISTS test_coverage CASCADE;
DROP TABLE IF EXISTS test_suites CASCADE;
DROP TABLE IF EXISTS test_dependencies CASCADE;

CREATE TABLE feature_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test Info
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  category test_category NOT NULL,
  description TEXT NOT NULL,

  -- Current Status
  status test_status NOT NULL DEFAULT 'pending',
  last_tested_at TIMESTAMPTZ,
  last_result test_result,

  -- Test Configuration
  timeout_ms INTEGER DEFAULT 30000,
  retry_count INTEGER DEFAULT 3,
  is_critical BOOLEAN NOT NULL DEFAULT false,
  is_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Statistics
  total_runs INTEGER NOT NULL DEFAULT 0,
  passed_runs INTEGER NOT NULL DEFAULT 0,
  failed_runs INTEGER NOT NULL DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  avg_duration_ms INTEGER DEFAULT 0,

  -- Metadata
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Suite Info
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category test_category NOT NULL,

  -- Configuration
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  run_parallel BOOLEAN NOT NULL DEFAULT false,
  max_parallel INTEGER DEFAULT 5,

  -- Statistics
  total_tests INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  last_result test_result,
  success_rate DECIMAL(5, 2) DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES feature_tests(id) ON DELETE CASCADE,

  -- Dependency Info
  depends_on_test_id UUID REFERENCES feature_tests(id) ON DELETE CASCADE,
  dependency_name TEXT NOT NULL, -- Service name (e.g., 'OpenAI API', 'Supabase')
  dependency_type TEXT CHECK (dependency_type IN ('test', 'service', 'api', 'database', 'external')),

  -- Configuration
  is_required BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES feature_tests(id) ON DELETE CASCADE,
  suite_id UUID REFERENCES test_suites(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Run Info
  result test_result NOT NULL,
  duration_ms INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,

  -- Environment
  environment TEXT CHECK (environment IN ('local', 'development', 'staging', 'production')) DEFAULT 'development',
  browser TEXT,
  os TEXT,

  -- Details
  error_message TEXT,
  stack_trace TEXT,
  screenshots JSONB DEFAULT '[]'::jsonb,
  logs JSONB DEFAULT '[]'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
  test_id UUID NOT NULL REFERENCES feature_tests(id) ON DELETE CASCADE,

  -- Step-by-step Results
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  result test_result NOT NULL,
  duration_ms INTEGER NOT NULL,

  -- Details
  expected_value TEXT,
  actual_value TEXT,
  error_message TEXT,
  screenshot_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES feature_tests(id) ON DELETE CASCADE,
  run_id UUID REFERENCES test_runs(id) ON DELETE SET NULL,

  -- Issue Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity issue_severity NOT NULL DEFAULT 'medium',

  -- Status
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,

  -- Occurrence
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_count INTEGER NOT NULL DEFAULT 1,

  -- Classification
  error_type TEXT,
  error_code TEXT,
  affected_browsers TEXT[] DEFAULT ARRAY[]::TEXT[],
  affected_os TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  stack_trace TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE test_coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES feature_tests(id) ON DELETE CASCADE,

  -- Coverage Info
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category test_category NOT NULL,

  -- Metrics
  total_features INTEGER NOT NULL DEFAULT 0,
  tested_features INTEGER NOT NULL DEFAULT 0,
  passed_features INTEGER NOT NULL DEFAULT 0,
  failed_features INTEGER NOT NULL DEFAULT 0,
  coverage_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,

  -- Quality Metrics
  avg_test_duration_ms INTEGER DEFAULT 0,
  total_issues INTEGER NOT NULL DEFAULT 0,
  critical_issues INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(date, category)
);

-- INDEXES
CREATE INDEX idx_feature_tests_status ON feature_tests(status);
CREATE INDEX idx_feature_tests_category ON feature_tests(category);
CREATE INDEX idx_feature_tests_path ON feature_tests(path);
CREATE INDEX idx_feature_tests_critical ON feature_tests(is_critical) WHERE is_critical = true;
CREATE INDEX idx_feature_tests_enabled ON feature_tests(is_enabled) WHERE is_enabled = true;
CREATE INDEX idx_feature_tests_tags ON feature_tests USING GIN(tags);

CREATE INDEX idx_test_suites_category ON test_suites(category);
CREATE INDEX idx_test_suites_enabled ON test_suites(is_enabled) WHERE is_enabled = true;

CREATE INDEX idx_test_dependencies_test ON test_dependencies(test_id);
CREATE INDEX idx_test_dependencies_depends ON test_dependencies(depends_on_test_id);

CREATE INDEX idx_test_runs_test ON test_runs(test_id);
CREATE INDEX idx_test_runs_suite ON test_runs(suite_id);
CREATE INDEX idx_test_runs_result ON test_runs(result);
CREATE INDEX idx_test_runs_environment ON test_runs(environment);
CREATE INDEX idx_test_runs_started ON test_runs(started_at DESC);

CREATE INDEX idx_test_results_run ON test_results(run_id);
CREATE INDEX idx_test_results_test ON test_results(test_id);
CREATE INDEX idx_test_results_result ON test_results(result);

CREATE INDEX idx_test_issues_test ON test_issues(test_id);
CREATE INDEX idx_test_issues_run ON test_issues(run_id);
CREATE INDEX idx_test_issues_severity ON test_issues(severity);
CREATE INDEX idx_test_issues_resolved ON test_issues(is_resolved);
CREATE INDEX idx_test_issues_first_seen ON test_issues(first_seen_at DESC);

CREATE INDEX idx_test_coverage_date ON test_coverage(date DESC);
CREATE INDEX idx_test_coverage_category ON test_coverage(category);
CREATE INDEX idx_test_coverage_test ON test_coverage(test_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_test_statistics() RETURNS TRIGGER AS $$
BEGIN
  -- Update feature_tests statistics
  UPDATE feature_tests
  SET
    total_runs = total_runs + 1,
    passed_runs = passed_runs + CASE WHEN NEW.result = 'pass' THEN 1 ELSE 0 END,
    failed_runs = failed_runs + CASE WHEN NEW.result = 'fail' THEN 1 ELSE 0 END,
    last_tested_at = NEW.completed_at,
    last_result = NEW.result,
    success_rate = ROUND(
      ((passed_runs + CASE WHEN NEW.result = 'pass' THEN 1 ELSE 0 END)::DECIMAL /
       (total_runs + 1)::DECIMAL * 100), 2
    ),
    avg_duration_ms = ROUND(
      ((avg_duration_ms * total_runs + NEW.duration_ms)::DECIMAL /
       (total_runs + 1)::DECIMAL)::INTEGER
    ),
    updated_at = now()
  WHERE id = NEW.test_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_test_statistics
AFTER INSERT ON test_runs
FOR EACH ROW
EXECUTE FUNCTION update_test_statistics();

CREATE OR REPLACE FUNCTION update_test_status() RETURNS TRIGGER AS $$
BEGIN
  -- Auto-update test status based on result
  UPDATE feature_tests
  SET
    status = CASE
      WHEN NEW.result = 'pass' THEN 'passed'::test_status
      WHEN NEW.result = 'fail' THEN 'failed'::test_status
      WHEN NEW.result = 'warning' THEN 'warning'::test_status
      WHEN NEW.result = 'skip' THEN 'skipped'::test_status
      ELSE 'pending'::test_status
    END
  WHERE id = NEW.test_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_test_status
AFTER INSERT ON test_runs
FOR EACH ROW
EXECUTE FUNCTION update_test_status();

CREATE OR REPLACE FUNCTION track_issue_occurrence() RETURNS TRIGGER AS $$
DECLARE
  existing_issue UUID;
BEGIN
  -- Check if similar issue exists
  SELECT id INTO existing_issue
  FROM test_issues
  WHERE test_id = NEW.test_id
    AND is_resolved = false
    AND title = NEW.title
  LIMIT 1;

  IF existing_issue IS NOT NULL THEN
    -- Update existing issue
    UPDATE test_issues
    SET
      occurrence_count = occurrence_count + 1,
      last_seen_at = now(),
      updated_at = now()
    WHERE id = existing_issue;

    RETURN NULL; -- Don't insert duplicate
  ELSE
    RETURN NEW; -- Insert new issue
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_issue_occurrence
BEFORE INSERT ON test_issues
FOR EACH ROW
EXECUTE FUNCTION track_issue_occurrence();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION run_feature_test(
  p_test_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_suite_id UUID DEFAULT NULL,
  p_environment TEXT DEFAULT 'development'
) RETURNS UUID AS $$
DECLARE
  run_id UUID;
BEGIN
  -- Create test run
  INSERT INTO test_runs (
    test_id,
    user_id,
    suite_id,
    result,
    duration_ms,
    started_at,
    completed_at,
    environment
  ) VALUES (
    p_test_id,
    p_user_id,
    p_suite_id,
    'pass', -- Will be updated by actual test execution
    0, -- Will be updated by actual test execution
    now(),
    now(),
    p_environment
  ) RETURNING id INTO run_id;

  -- Update test status to testing
  UPDATE feature_tests
  SET status = 'testing'
  WHERE id = p_test_id;

  RETURN run_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_test_statistics(
  p_category test_category DEFAULT NULL,
  p_days INTEGER DEFAULT 7
) RETURNS TABLE (
  total_tests BIGINT,
  passed_tests BIGINT,
  failed_tests BIGINT,
  pending_tests BIGINT,
  success_rate DECIMAL,
  total_runs BIGINT,
  avg_duration_ms BIGINT,
  critical_issues BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    COUNT(*) FILTER (WHERE ft.status = 'passed')::BIGINT,
    COUNT(*) FILTER (WHERE ft.status = 'failed')::BIGINT,
    COUNT(*) FILTER (WHERE ft.status = 'pending')::BIGINT,
    ROUND(AVG(ft.success_rate), 2),
    SUM(ft.total_runs)::BIGINT,
    ROUND(AVG(ft.avg_duration_ms))::BIGINT,
    (SELECT COUNT(*) FROM test_issues ti
     WHERE ti.test_id = ANY(ARRAY_AGG(ft.id))
       AND ti.severity IN ('critical', 'high')
       AND ti.is_resolved = false)::BIGINT
  FROM feature_tests ft
  WHERE (p_category IS NULL OR ft.category = p_category)
    AND ft.last_tested_at >= now() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_failing_tests(
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  test_id UUID,
  test_name TEXT,
  fail_count BIGINT,
  last_error TEXT,
  last_failed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ft.id,
    ft.name,
    ft.failed_runs::BIGINT,
    (SELECT error_message FROM test_runs
     WHERE test_id = ft.id AND result = 'fail'
     ORDER BY completed_at DESC LIMIT 1),
    ft.last_tested_at
  FROM feature_tests ft
  WHERE ft.status = 'failed'
  ORDER BY ft.failed_runs DESC, ft.last_tested_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_test_health_score() RETURNS INTEGER AS $$
DECLARE
  health_score INTEGER := 100;
  failed_critical INTEGER;
  total_critical INTEGER;
  overall_success DECIMAL;
BEGIN
  -- Get critical test failures
  SELECT COUNT(*) INTO failed_critical
  FROM feature_tests
  WHERE is_critical = true AND status = 'failed';

  SELECT COUNT(*) INTO total_critical
  FROM feature_tests
  WHERE is_critical = true;

  -- Deduct 10 points per failed critical test
  health_score := health_score - (failed_critical * 10);

  -- Get overall success rate
  SELECT AVG(success_rate) INTO overall_success
  FROM feature_tests
  WHERE total_runs > 0;

  -- Deduct based on overall success rate
  IF overall_success < 95 THEN
    health_score := health_score - ROUND((95 - overall_success) / 2);
  END IF;

  -- Ensure score is between 0 and 100
  health_score := GREATEST(0, LEAST(100, health_score));

  RETURN health_score;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE feature_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_coverage ENABLE ROW LEVEL SECURITY;

-- All users can view tests and results
CREATE POLICY feature_tests_select_all ON feature_tests
  FOR SELECT USING (true);

CREATE POLICY test_suites_select_all ON test_suites
  FOR SELECT USING (true);

CREATE POLICY test_dependencies_select_all ON test_dependencies
  FOR SELECT USING (true);

CREATE POLICY test_runs_select_all ON test_runs
  FOR SELECT USING (true);

CREATE POLICY test_results_select_all ON test_results
  FOR SELECT USING (true);

CREATE POLICY test_issues_select_all ON test_issues
  FOR SELECT USING (true);

CREATE POLICY test_coverage_select_all ON test_coverage
  FOR SELECT USING (true);

-- Authenticated users can create test runs and issues
CREATE POLICY test_runs_create_authenticated ON test_runs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY test_issues_create_authenticated ON test_issues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
