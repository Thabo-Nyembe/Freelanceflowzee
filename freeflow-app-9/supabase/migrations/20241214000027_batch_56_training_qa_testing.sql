-- Batch 56: Training, QA, Testing V2 Pages
-- Training programs, QA test cases, and test execution runs

-- =====================================================
-- TRAINING PROGRAMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_code VARCHAR(50) NOT NULL,
  program_name VARCHAR(300) NOT NULL,
  description TEXT,
  program_type VARCHAR(50) DEFAULT 'skills',
  status VARCHAR(30) DEFAULT 'scheduled',
  trainer_name VARCHAR(200),
  trainer_email VARCHAR(200),
  max_capacity INTEGER DEFAULT 30,
  enrolled_count INTEGER DEFAULT 0,
  duration_days INTEGER DEFAULT 1,
  session_count INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  avg_score DECIMAL(5,2) DEFAULT 0,
  location VARCHAR(200),
  format VARCHAR(50) DEFAULT 'in-person',
  materials_url TEXT,
  prerequisites TEXT,
  objectives TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Training enrollments table
CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  trainee_name VARCHAR(200) NOT NULL,
  trainee_email VARCHAR(200),
  enrollment_status VARCHAR(30) DEFAULT 'enrolled',
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percent DECIMAL(5,2) DEFAULT 0,
  score DECIMAL(5,2),
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QA TEST CASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS qa_test_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_code VARCHAR(50) NOT NULL,
  test_name VARCHAR(300) NOT NULL,
  description TEXT,
  test_type VARCHAR(50) DEFAULT 'functional',
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  last_run_at TIMESTAMP WITH TIME ZONE,
  duration_seconds DECIMAL(10,2) DEFAULT 0,
  execution_count INTEGER DEFAULT 0,
  pass_rate DECIMAL(5,2) DEFAULT 0,
  is_automated BOOLEAN DEFAULT FALSE,
  environment VARCHAR(100),
  build_version VARCHAR(50),
  preconditions TEXT,
  test_steps JSONB DEFAULT '[]',
  expected_result TEXT,
  actual_result TEXT,
  attachments JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- QA test executions table
CREATE TABLE IF NOT EXISTS qa_test_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_case_id UUID NOT NULL REFERENCES qa_test_cases(id) ON DELETE CASCADE,
  execution_status VARCHAR(30) DEFAULT 'pending',
  executed_by VARCHAR(200),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds DECIMAL(10,2) DEFAULT 0,
  environment VARCHAR(100),
  build_version VARCHAR(50),
  result VARCHAR(30),
  error_message TEXT,
  logs TEXT,
  screenshots JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEST RUNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_code VARCHAR(50) NOT NULL,
  run_name VARCHAR(300) NOT NULL,
  description TEXT,
  suite_type VARCHAR(50) DEFAULT 'integration',
  status VARCHAR(30) DEFAULT 'pending',
  triggered_by VARCHAR(200),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER DEFAULT 0,
  passed_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  coverage_percent DECIMAL(5,2) DEFAULT 0,
  branch_name VARCHAR(200),
  commit_hash VARCHAR(100),
  environment VARCHAR(100),
  ci_platform VARCHAR(100),
  build_url TEXT,
  report_url TEXT,
  logs TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test run results table (individual test results within a run)
CREATE TABLE IF NOT EXISTS test_run_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_run_id UUID NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
  test_name VARCHAR(300) NOT NULL,
  test_file VARCHAR(500),
  suite_name VARCHAR(200),
  status VARCHAR(30) DEFAULT 'pending',
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  screenshots JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_training_programs_user_id ON training_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_training_programs_status ON training_programs(status);
CREATE INDEX IF NOT EXISTS idx_training_programs_type ON training_programs(program_type);
CREATE INDEX IF NOT EXISTS idx_training_programs_start_date ON training_programs(start_date);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_user_id ON training_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_program_id ON training_enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_status ON training_enrollments(enrollment_status);

CREATE INDEX IF NOT EXISTS idx_qa_test_cases_user_id ON qa_test_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_qa_test_cases_status ON qa_test_cases(status);
CREATE INDEX IF NOT EXISTS idx_qa_test_cases_type ON qa_test_cases(test_type);
CREATE INDEX IF NOT EXISTS idx_qa_test_cases_priority ON qa_test_cases(priority);
CREATE INDEX IF NOT EXISTS idx_qa_test_executions_user_id ON qa_test_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_qa_test_executions_test_case_id ON qa_test_executions(test_case_id);

CREATE INDEX IF NOT EXISTS idx_test_runs_user_id ON test_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_suite_type ON test_runs(suite_type);
CREATE INDEX IF NOT EXISTS idx_test_runs_start_time ON test_runs(start_time);
CREATE INDEX IF NOT EXISTS idx_test_run_results_user_id ON test_run_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_run_results_test_run_id ON test_run_results(test_run_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_test_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_run_results ENABLE ROW LEVEL SECURITY;

-- Training programs policies
CREATE POLICY "Users can view their own training programs" ON training_programs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own training programs" ON training_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own training programs" ON training_programs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own training programs" ON training_programs
  FOR DELETE USING (auth.uid() = user_id);

-- Training enrollments policies
CREATE POLICY "Users can view their own training enrollments" ON training_enrollments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own training enrollments" ON training_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own training enrollments" ON training_enrollments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own training enrollments" ON training_enrollments
  FOR DELETE USING (auth.uid() = user_id);

-- QA test cases policies
CREATE POLICY "Users can view their own QA test cases" ON qa_test_cases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own QA test cases" ON qa_test_cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own QA test cases" ON qa_test_cases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own QA test cases" ON qa_test_cases
  FOR DELETE USING (auth.uid() = user_id);

-- QA test executions policies
CREATE POLICY "Users can view their own QA test executions" ON qa_test_executions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own QA test executions" ON qa_test_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own QA test executions" ON qa_test_executions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own QA test executions" ON qa_test_executions
  FOR DELETE USING (auth.uid() = user_id);

-- Test runs policies
CREATE POLICY "Users can view their own test runs" ON test_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own test runs" ON test_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test runs" ON test_runs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own test runs" ON test_runs
  FOR DELETE USING (auth.uid() = user_id);

-- Test run results policies
CREATE POLICY "Users can view their own test run results" ON test_run_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own test run results" ON test_run_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own test run results" ON test_run_results
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own test run results" ON test_run_results
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_training_programs_updated_at ON training_programs;
CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON training_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_enrollments_updated_at ON training_enrollments;
CREATE TRIGGER update_training_enrollments_updated_at
  BEFORE UPDATE ON training_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_qa_test_cases_updated_at ON qa_test_cases;
CREATE TRIGGER update_qa_test_cases_updated_at
  BEFORE UPDATE ON qa_test_cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_test_runs_updated_at ON test_runs;
CREATE TRIGGER update_test_runs_updated_at
  BEFORE UPDATE ON test_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE training_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE training_enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE qa_test_cases;
ALTER PUBLICATION supabase_realtime ADD TABLE qa_test_executions;
ALTER PUBLICATION supabase_realtime ADD TABLE test_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE test_run_results;
