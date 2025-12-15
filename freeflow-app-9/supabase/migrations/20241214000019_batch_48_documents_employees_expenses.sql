-- Batch 48: Documents, Employees & Expenses
-- Migration for document management, HR/employee tracking, and expense reporting

-- =============================================
-- DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  document_title VARCHAR(500) NOT NULL,
  document_type VARCHAR(50) DEFAULT 'other'
    CHECK (document_type IN ('contract', 'proposal', 'report', 'policy', 'invoice', 'presentation', 'spreadsheet', 'other')),
  status VARCHAR(50) DEFAULT 'draft'
    CHECK (status IN ('draft', 'review', 'approved', 'archived', 'rejected', 'published')),

  -- Access & Security
  access_level VARCHAR(50) DEFAULT 'internal'
    CHECK (access_level IN ('public', 'internal', 'confidential', 'restricted', 'secret')),
  is_encrypted BOOLEAN DEFAULT false,
  encryption_key VARCHAR(200),

  -- Ownership
  owner VARCHAR(200),
  department VARCHAR(100),
  created_by VARCHAR(200),
  last_modified_by VARCHAR(200),

  -- File Information
  file_path TEXT,
  file_url TEXT,
  file_name VARCHAR(500),
  file_extension VARCHAR(20),
  file_size_bytes BIGINT DEFAULT 0,
  file_size_mb DECIMAL(10, 2) DEFAULT 0,
  mime_type VARCHAR(100),

  -- Version Control
  version VARCHAR(50) DEFAULT '1.0',
  version_number INTEGER DEFAULT 1,
  previous_version_id UUID,
  is_latest_version BOOLEAN DEFAULT true,
  version_notes TEXT,

  -- Approval Workflow
  approved_by VARCHAR(200),
  approved_at TIMESTAMPTZ,
  reviewed_by VARCHAR(200),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Engagement Metrics
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  -- Collaboration
  collaborators TEXT[],
  shared_with TEXT[],
  permissions JSONB,

  -- Tags & Organization
  tags TEXT[],
  categories TEXT[],
  folder_path TEXT,
  parent_folder_id UUID,

  -- Expiration & Retention
  expires_at TIMESTAMPTZ,
  retention_period_days INTEGER,
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  notes TEXT,
  checksum VARCHAR(200),
  language VARCHAR(50),
  keywords TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for documents
CREATE INDEX idx_documents_user_id ON documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_type ON documents(document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status ON documents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_access_level ON documents(access_level) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_owner ON documents(owner) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_department ON documents(department) WHERE deleted_at IS NULL;

-- RLS Policies for documents
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for documents
ALTER PUBLICATION supabase_realtime ADD TABLE documents;

-- =============================================
-- EMPLOYEES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  employee_name VARCHAR(200) NOT NULL,
  employee_id VARCHAR(100) UNIQUE,
  email VARCHAR(200),
  phone VARCHAR(50),
  avatar_url TEXT,

  -- Position & Department
  position VARCHAR(200),
  job_title VARCHAR(200),
  department VARCHAR(100),
  team VARCHAR(100),
  level VARCHAR(50),
  employment_type VARCHAR(50) DEFAULT 'full-time'
    CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'intern', 'temporary')),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'on-leave', 'terminated', 'suspended')),
  is_remote BOOLEAN DEFAULT false,

  -- Reporting Structure
  manager_id UUID REFERENCES employees(id),
  manager_name VARCHAR(200),
  direct_reports INTEGER DEFAULT 0,
  reports_to VARCHAR(200),

  -- Location
  office_location VARCHAR(200),
  work_location VARCHAR(200),
  country VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(100),
  timezone VARCHAR(50),

  -- Compensation
  salary DECIMAL(12, 2) DEFAULT 0,
  hourly_rate DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'USD',
  bonus_eligible BOOLEAN DEFAULT false,
  commission_rate DECIMAL(5, 2) DEFAULT 0,

  -- Benefits
  health_insurance BOOLEAN DEFAULT false,
  retirement_plan BOOLEAN DEFAULT false,
  stock_options INTEGER DEFAULT 0,
  pto_days INTEGER DEFAULT 0,
  sick_days INTEGER DEFAULT 0,
  used_pto_days INTEGER DEFAULT 0,
  used_sick_days INTEGER DEFAULT 0,

  -- Employment Dates
  hire_date DATE,
  start_date DATE,
  termination_date DATE,
  probation_end_date DATE,
  last_promotion_date DATE,

  -- Performance
  performance_rating DECIMAL(3, 2) DEFAULT 0,
  performance_score INTEGER DEFAULT 0,
  last_review_date DATE,
  next_review_date DATE,
  goals_completed INTEGER DEFAULT 0,
  goals_total INTEGER DEFAULT 0,

  -- Work Metrics
  projects_count INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  hours_logged DECIMAL(10, 2) DEFAULT 0,
  productivity_score DECIMAL(5, 2) DEFAULT 0,

  -- Skills & Certifications
  skills TEXT[],
  certifications TEXT[],
  languages TEXT[],
  education_level VARCHAR(100),

  -- Emergency Contact
  emergency_contact_name VARCHAR(200),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),

  -- Documents
  contract_url TEXT,
  resume_url TEXT,
  id_document_url TEXT,
  photo_url TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_progress INTEGER DEFAULT 0,
  orientation_date DATE,

  -- Metadata
  notes TEXT,
  tags TEXT[],
  custom_fields JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for employees
CREATE INDEX idx_employees_user_id ON employees(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_department ON employees(department) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_status ON employees(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_manager_id ON employees(manager_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_position ON employees(position) WHERE deleted_at IS NULL;

-- RLS Policies for employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employees"
  ON employees FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own employees"
  ON employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees"
  ON employees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees"
  ON employees FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for employees
ALTER PUBLICATION supabase_realtime ADD TABLE employees;

-- =============================================
-- EXPENSES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  expense_title VARCHAR(500) NOT NULL,
  description TEXT,
  expense_category VARCHAR(50) DEFAULT 'other'
    CHECK (expense_category IN ('travel', 'meals', 'supplies', 'software', 'entertainment', 'accommodation', 'transportation', 'communication', 'training', 'other')),

  -- Amount
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Status
  status VARCHAR(50) DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'reimbursed', 'cancelled', 'under-review')),

  -- Submission Details
  submitted_by VARCHAR(200),
  submitted_by_id UUID,
  submitted_at TIMESTAMPTZ,
  expense_date DATE,

  -- Approval Workflow
  approved_by VARCHAR(200),
  approved_by_id UUID,
  approved_at TIMESTAMPTZ,
  reviewed_by VARCHAR(200),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Payment Information
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  reimbursement_method VARCHAR(100),
  reimbursed BOOLEAN DEFAULT false,
  reimbursed_at TIMESTAMPTZ,
  reimbursed_amount DECIMAL(12, 2) DEFAULT 0,

  -- Receipt & Documentation
  has_receipt BOOLEAN DEFAULT false,
  receipt_url TEXT,
  receipt_urls TEXT[],
  attachment_count INTEGER DEFAULT 0,
  invoice_number VARCHAR(100),

  -- Merchant Information
  merchant_name VARCHAR(200),
  merchant_category VARCHAR(100),
  merchant_location VARCHAR(200),

  -- Trip/Project Association
  trip_id UUID,
  trip_name VARCHAR(200),
  project_id UUID,
  project_name VARCHAR(200),
  cost_center VARCHAR(100),
  department VARCHAR(100),

  -- Mileage (for travel expenses)
  distance_miles DECIMAL(10, 2) DEFAULT 0,
  mileage_rate DECIMAL(10, 4) DEFAULT 0,
  start_location VARCHAR(200),
  end_location VARCHAR(200),

  -- Billable
  is_billable BOOLEAN DEFAULT false,
  client_id UUID,
  client_name VARCHAR(200),
  billed_to_client BOOLEAN DEFAULT false,

  -- Policy Compliance
  is_policy_compliant BOOLEAN DEFAULT true,
  policy_violations TEXT[],
  requires_justification BOOLEAN DEFAULT false,
  justification TEXT,

  -- Audit Trail
  audit_notes TEXT,
  approval_notes TEXT,
  internal_notes TEXT,

  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_frequency VARCHAR(50),
  recurrence_end_date DATE,

  -- Tags & Categories
  tags TEXT[],
  custom_fields JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Indexes for expenses
CREATE INDEX idx_expenses_user_id ON expenses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_category ON expenses(expense_category) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_status ON expenses(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_submitted_by ON expenses(submitted_by_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_expenses_department ON expenses(department) WHERE deleted_at IS NULL;

-- RLS Policies for expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses"
  ON expenses FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create their own expenses"
  ON expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses FOR DELETE
  USING (auth.uid() = user_id);

-- Enable realtime for expenses
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
