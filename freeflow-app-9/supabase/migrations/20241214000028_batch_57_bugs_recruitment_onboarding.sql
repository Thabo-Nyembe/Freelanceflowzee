-- Batch 57: Bugs, Recruitment, Onboarding V2 Pages
-- Bug tracking, job recruitment, and employee onboarding

-- =====================================================
-- BUGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS bugs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bug_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  severity VARCHAR(30) DEFAULT 'medium',
  status VARCHAR(30) DEFAULT 'open',
  priority VARCHAR(10) DEFAULT 'P2',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  reporter_name VARCHAR(200),
  reporter_email VARCHAR(200),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  resolved_date TIMESTAMP WITH TIME ZONE,
  affected_version VARCHAR(50),
  target_version VARCHAR(50),
  category VARCHAR(100),
  is_reproducible BOOLEAN DEFAULT TRUE,
  votes INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  environment_details JSONB DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  related_bugs JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Bug comments table
CREATE TABLE IF NOT EXISTS bug_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bug_id UUID NOT NULL REFERENCES bugs(id) ON DELETE CASCADE,
  commenter_name VARCHAR(200) NOT NULL,
  commenter_email VARCHAR(200),
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RECRUITMENT TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  department VARCHAR(100),
  location VARCHAR(200),
  job_type VARCHAR(50) DEFAULT 'full-time',
  status VARCHAR(30) DEFAULT 'draft',
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  salary_currency VARCHAR(10) DEFAULT 'USD',
  posted_date TIMESTAMP WITH TIME ZONE,
  closing_date TIMESTAMP WITH TIME ZONE,
  applications_count INTEGER DEFAULT 0,
  shortlisted_count INTEGER DEFAULT 0,
  interviews_count INTEGER DEFAULT 0,
  offers_count INTEGER DEFAULT 0,
  hired_count INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  hiring_manager VARCHAR(200),
  recruiter VARCHAR(200),
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
  application_code VARCHAR(50) NOT NULL,
  candidate_name VARCHAR(200) NOT NULL,
  candidate_email VARCHAR(200),
  candidate_phone VARCHAR(50),
  status VARCHAR(30) DEFAULT 'new',
  stage VARCHAR(100) DEFAULT 'Application Received',
  experience_years INTEGER DEFAULT 0,
  match_score DECIMAL(5,2) DEFAULT 0,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  screening_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  offer_date TIMESTAMP WITH TIME ZONE,
  hired_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  interviewer_notes JSONB DEFAULT '[]',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ONBOARDING TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS onboarding_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_code VARCHAR(50) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  employee_email VARCHAR(200),
  role VARCHAR(200),
  department VARCHAR(100),
  employee_type VARCHAR(50) DEFAULT 'full-time',
  status VARCHAR(30) DEFAULT 'pending',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  days_remaining INTEGER DEFAULT 30,
  buddy_name VARCHAR(200),
  buddy_email VARCHAR(200),
  manager_name VARCHAR(200),
  manager_email VARCHAR(200),
  welcome_email_sent BOOLEAN DEFAULT FALSE,
  equipment_provided BOOLEAN DEFAULT FALSE,
  access_granted BOOLEAN DEFAULT FALSE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Onboarding tasks table
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES onboarding_programs(id) ON DELETE CASCADE,
  task_code VARCHAR(50) NOT NULL,
  task_name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  status VARCHAR(30) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_to VARCHAR(200),
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_bugs_user_id ON bugs(user_id);
CREATE INDEX IF NOT EXISTS idx_bugs_status ON bugs(status);
CREATE INDEX IF NOT EXISTS idx_bugs_severity ON bugs(severity);
CREATE INDEX IF NOT EXISTS idx_bugs_priority ON bugs(priority);
CREATE INDEX IF NOT EXISTS idx_bugs_created_date ON bugs(created_date);
CREATE INDEX IF NOT EXISTS idx_bug_comments_user_id ON bug_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_comments_bug_id ON bug_comments(bug_id);

CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

CREATE INDEX IF NOT EXISTS idx_onboarding_programs_user_id ON onboarding_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_programs_status ON onboarding_programs(status);
CREATE INDEX IF NOT EXISTS idx_onboarding_programs_start_date ON onboarding_programs(start_date);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_user_id ON onboarding_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_program_id ON onboarding_tasks(program_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_status ON onboarding_tasks(status);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE bugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE bug_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- Bugs policies
CREATE POLICY "Users can view their own bugs" ON bugs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bugs" ON bugs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bugs" ON bugs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bugs" ON bugs
  FOR DELETE USING (auth.uid() = user_id);

-- Bug comments policies
CREATE POLICY "Users can view their own bug comments" ON bug_comments
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bug comments" ON bug_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bug comments" ON bug_comments
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bug comments" ON bug_comments
  FOR DELETE USING (auth.uid() = user_id);

-- Job postings policies
CREATE POLICY "Users can view their own job postings" ON job_postings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job postings" ON job_postings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job postings" ON job_postings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job postings" ON job_postings
  FOR DELETE USING (auth.uid() = user_id);

-- Job applications policies
CREATE POLICY "Users can view their own job applications" ON job_applications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job applications" ON job_applications
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job applications" ON job_applications
  FOR DELETE USING (auth.uid() = user_id);

-- Onboarding programs policies
CREATE POLICY "Users can view their own onboarding programs" ON onboarding_programs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own onboarding programs" ON onboarding_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own onboarding programs" ON onboarding_programs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own onboarding programs" ON onboarding_programs
  FOR DELETE USING (auth.uid() = user_id);

-- Onboarding tasks policies
CREATE POLICY "Users can view their own onboarding tasks" ON onboarding_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own onboarding tasks" ON onboarding_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own onboarding tasks" ON onboarding_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own onboarding tasks" ON onboarding_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_bugs_updated_at ON bugs;
CREATE TRIGGER update_bugs_updated_at
  BEFORE UPDATE ON bugs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bug_comments_updated_at ON bug_comments;
CREATE TRIGGER update_bug_comments_updated_at
  BEFORE UPDATE ON bug_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_postings_updated_at ON job_postings;
CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON job_postings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_programs_updated_at ON onboarding_programs;
CREATE TRIGGER update_onboarding_programs_updated_at
  BEFORE UPDATE ON onboarding_programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_tasks_updated_at ON onboarding_tasks;
CREATE TRIGGER update_onboarding_tasks_updated_at
  BEFORE UPDATE ON onboarding_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE bugs;
ALTER PUBLICATION supabase_realtime ADD TABLE bug_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE job_postings;
ALTER PUBLICATION supabase_realtime ADD TABLE job_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE onboarding_programs;
ALTER PUBLICATION supabase_realtime ADD TABLE onboarding_tasks;
