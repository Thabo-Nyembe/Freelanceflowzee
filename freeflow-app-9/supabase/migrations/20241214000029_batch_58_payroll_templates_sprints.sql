-- Batch 58: Payroll, Templates, Sprints V2 Pages
-- Payroll management, template library, and sprint tracking

-- =====================================================
-- PAYROLL TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_code VARCHAR(50) NOT NULL,
  period VARCHAR(100) NOT NULL,
  pay_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'draft',
  total_employees INTEGER DEFAULT 0,
  total_amount DECIMAL(15,2) DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  pending_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  department VARCHAR(100),
  approved_by VARCHAR(200),
  approved_date TIMESTAMP WITH TIME ZONE,
  currency VARCHAR(10) DEFAULT 'USD',
  notes TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Employee payroll records
CREATE TABLE IF NOT EXISTS employee_payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_code VARCHAR(50) NOT NULL,
  employee_name VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  role VARCHAR(200),
  status VARCHAR(30) DEFAULT 'active',
  base_salary DECIMAL(12,2) DEFAULT 0,
  bonuses DECIMAL(12,2) DEFAULT 0,
  deductions DECIMAL(12,2) DEFAULT 0,
  taxes DECIMAL(12,2) DEFAULT 0,
  net_pay DECIMAL(12,2) DEFAULT 0,
  payment_method VARCHAR(50) DEFAULT 'direct-deposit',
  tax_rate DECIMAL(5,2) DEFAULT 0,
  bank_account VARCHAR(100),
  payment_status VARCHAR(30) DEFAULT 'pending',
  payment_date TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEMPLATES TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_code VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'document',
  status VARCHAR(30) DEFAULT 'draft',
  access_level VARCHAR(30) DEFAULT 'private',
  creator_name VARCHAR(200),
  department VARCHAR(100),
  version VARCHAR(20) DEFAULT '1.0',
  usage_count INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  content TEXT,
  template_data JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Template usage tracking
CREATE TABLE IF NOT EXISTS template_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_name VARCHAR(200),
  department VARCHAR(100),
  action VARCHAR(50) DEFAULT 'used',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SPRINTS TABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_code VARCHAR(50) NOT NULL,
  name VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'planning',
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  in_progress_tasks INTEGER DEFAULT 0,
  blocked_tasks INTEGER DEFAULT 0,
  velocity INTEGER DEFAULT 0,
  team_name VARCHAR(200),
  scrum_master VARCHAR(200),
  capacity INTEGER DEFAULT 0,
  committed INTEGER DEFAULT 0,
  burned INTEGER DEFAULT 0,
  goal TEXT,
  retrospective TEXT,
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Sprint tasks table
CREATE TABLE IF NOT EXISTS sprint_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sprint_id UUID NOT NULL REFERENCES sprints(id) ON DELETE CASCADE,
  task_code VARCHAR(50) NOT NULL,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  status VARCHAR(30) DEFAULT 'todo',
  priority VARCHAR(20) DEFAULT 'medium',
  assignee_name VARCHAR(200),
  assignee_email VARCHAR(200),
  story_points INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  estimated_hours DECIMAL(6,2) DEFAULT 0,
  actual_hours DECIMAL(6,2) DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  labels TEXT[] DEFAULT '{}',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payroll_runs_user_id ON payroll_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_status ON payroll_runs(status);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_pay_date ON payroll_runs(pay_date);
CREATE INDEX IF NOT EXISTS idx_employee_payroll_user_id ON employee_payroll(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_payroll_run_id ON employee_payroll(run_id);
CREATE INDEX IF NOT EXISTS idx_employee_payroll_status ON employee_payroll(payment_status);

CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_status ON templates(status);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_access_level ON templates(access_level);
CREATE INDEX IF NOT EXISTS idx_template_usage_user_id ON template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template_id ON template_usage(template_id);

CREATE INDEX IF NOT EXISTS idx_sprints_user_id ON sprints(user_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_sprints_start_date ON sprints(start_date);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_user_id ON sprint_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_sprint_id ON sprint_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_status ON sprint_tasks(status);
CREATE INDEX IF NOT EXISTS idx_sprint_tasks_priority ON sprint_tasks(priority);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprint_tasks ENABLE ROW LEVEL SECURITY;

-- Payroll runs policies
CREATE POLICY "Users can view their own payroll runs" ON payroll_runs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own payroll runs" ON payroll_runs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own payroll runs" ON payroll_runs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own payroll runs" ON payroll_runs
  FOR DELETE USING (auth.uid() = user_id);

-- Employee payroll policies
CREATE POLICY "Users can view their own employee payroll" ON employee_payroll
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own employee payroll" ON employee_payroll
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employee payroll" ON employee_payroll
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employee payroll" ON employee_payroll
  FOR DELETE USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view their own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);

-- Template usage policies
CREATE POLICY "Users can view their own template usage" ON template_usage
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own template usage" ON template_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Sprints policies
CREATE POLICY "Users can view their own sprints" ON sprints
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sprints" ON sprints
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sprints" ON sprints
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sprints" ON sprints
  FOR DELETE USING (auth.uid() = user_id);

-- Sprint tasks policies
CREATE POLICY "Users can view their own sprint tasks" ON sprint_tasks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sprint tasks" ON sprint_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sprint tasks" ON sprint_tasks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sprint tasks" ON sprint_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
DROP TRIGGER IF EXISTS update_payroll_runs_updated_at ON payroll_runs;
CREATE TRIGGER update_payroll_runs_updated_at
  BEFORE UPDATE ON payroll_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employee_payroll_updated_at ON employee_payroll;
CREATE TRIGGER update_employee_payroll_updated_at
  BEFORE UPDATE ON employee_payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprints_updated_at ON sprints;
CREATE TRIGGER update_sprints_updated_at
  BEFORE UPDATE ON sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sprint_tasks_updated_at ON sprint_tasks;
CREATE TRIGGER update_sprint_tasks_updated_at
  BEFORE UPDATE ON sprint_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE payroll_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE employee_payroll;
ALTER PUBLICATION supabase_realtime ADD TABLE templates;
ALTER PUBLICATION supabase_realtime ADD TABLE template_usage;
ALTER PUBLICATION supabase_realtime ADD TABLE sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE sprint_tasks;
