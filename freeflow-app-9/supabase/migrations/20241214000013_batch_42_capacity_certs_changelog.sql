-- Batch 42: Capacity, Certifications & Changelog
-- Tables: capacity, certifications, changelog
-- Created: December 14, 2024

-- ================================================
-- CAPACITY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS capacity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Resource Details
  resource_name VARCHAR(500) NOT NULL,
  resource_type VARCHAR(50) NOT NULL DEFAULT 'team_member'
    CHECK (resource_type IN ('team_member', 'equipment', 'room', 'vehicle', 'tool', 'service', 'workspace')),

  -- Capacity Metrics
  total_capacity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  available_capacity DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  allocated_capacity DECIMAL(10, 2) DEFAULT 0.00,
  utilization_percentage DECIMAL(5, 2) DEFAULT 0.00,

  -- Time Settings
  capacity_unit VARCHAR(50) DEFAULT 'hours'
    CHECK (capacity_unit IN ('hours', 'days', 'percentage', 'units', 'slots')),
  time_period VARCHAR(50) DEFAULT 'week'
    CHECK (time_period IN ('day', 'week', 'month', 'quarter', 'year')),

  -- Working Hours
  working_hours_per_day DECIMAL(4, 2) DEFAULT 8.00,
  working_days_per_week INTEGER DEFAULT 5,
  start_time TIME,
  end_time TIME,

  -- Allocation
  current_allocation JSONB DEFAULT '[]'::jsonb,
  upcoming_allocation JSONB DEFAULT '[]'::jsonb,
  allocation_history JSONB DEFAULT '[]'::jsonb,

  -- Availability
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  unavailable_dates JSONB DEFAULT '[]'::jsonb,
  blackout_periods JSONB DEFAULT '[]'::jsonb,

  -- Skills & Attributes
  skills JSONB DEFAULT '[]'::jsonb,
  certifications TEXT[],
  attributes JSONB DEFAULT '{}'::jsonb,

  -- Costing
  cost_per_hour DECIMAL(10, 2),
  cost_per_day DECIMAL(10, 2),
  total_cost DECIMAL(15, 2) DEFAULT 0.00,

  -- Planning
  planned_capacity DECIMAL(10, 2),
  forecast_capacity DECIMAL(10, 2),
  capacity_buffer DECIMAL(5, 2) DEFAULT 10.00,

  -- Utilization Tracking
  peak_utilization DECIMAL(5, 2),
  avg_utilization DECIMAL(5, 2),
  min_utilization DECIMAL(5, 2),
  utilization_trend VARCHAR(50),

  -- Overallocation
  is_overallocated BOOLEAN DEFAULT false,
  overallocation_percentage DECIMAL(5, 2),
  overallocation_alerts JSONB DEFAULT '[]'::jsonb,

  -- Efficiency
  efficiency_score DECIMAL(5, 2),
  productivity_score DECIMAL(5, 2),
  quality_score DECIMAL(5, 2),

  -- Scheduling
  schedule JSONB DEFAULT '{}'::jsonb,
  recurring_schedule JSONB DEFAULT '{}'::jsonb,
  exceptions JSONB DEFAULT '[]'::jsonb,

  -- Assignments
  assigned_to TEXT[],
  assigned_projects TEXT[],
  assigned_tasks TEXT[],

  -- Location
  location VARCHAR(300),
  zone VARCHAR(100),
  region VARCHAR(100),

  -- Status
  status VARCHAR(50) DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'maintenance', 'unavailable', 'retired')),
  availability_status VARCHAR(50) DEFAULT 'available'
    CHECK (availability_status IN ('available', 'partially_available', 'fully_booked', 'unavailable')),

  -- Constraints
  max_concurrent_assignments INTEGER DEFAULT 1,
  max_daily_hours DECIMAL(4, 2),
  requires_approval BOOLEAN DEFAULT false,

  -- Notifications
  notify_on_low_capacity BOOLEAN DEFAULT true,
  notify_on_overallocation BOOLEAN DEFAULT true,
  low_capacity_threshold DECIMAL(5, 2) DEFAULT 20.00,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  priority VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT capacity_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_capacity_user_id ON capacity(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_capacity_type ON capacity(resource_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_capacity_status ON capacity(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_capacity_utilization ON capacity(utilization_percentage DESC) WHERE deleted_at IS NULL;

ALTER TABLE capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own capacity" ON capacity FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own capacity" ON capacity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own capacity" ON capacity FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own capacity" ON capacity FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE capacity;

-- ================================================
-- CERTIFICATIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Certification Details
  certification_name VARCHAR(500) NOT NULL,
  certification_code VARCHAR(100),
  certification_type VARCHAR(50) NOT NULL DEFAULT 'professional'
    CHECK (certification_type IN ('professional', 'technical', 'compliance', 'safety', 'quality', 'industry', 'vendor', 'educational')),

  -- Issuing Body
  issuing_organization VARCHAR(500),
  issuing_authority VARCHAR(300),
  accreditation_body VARCHAR(300),

  -- Dates
  issue_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  last_renewed_at TIMESTAMPTZ,
  next_renewal_due TIMESTAMPTZ,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'pending', 'expired', 'suspended', 'revoked', 'in_renewal', 'archived')),
  verification_status VARCHAR(50) DEFAULT 'unverified'
    CHECK (verification_status IN ('verified', 'unverified', 'pending_verification', 'failed_verification')),

  -- Validity
  is_valid BOOLEAN DEFAULT true,
  is_expired BOOLEAN DEFAULT false,
  days_until_expiry INTEGER,
  requires_renewal BOOLEAN DEFAULT false,

  -- Levels & Scope
  level VARCHAR(100),
  grade VARCHAR(50),
  scope TEXT,
  specializations TEXT[],

  -- Holder Information
  holder_name VARCHAR(300),
  holder_id VARCHAR(200),
  holder_email VARCHAR(300),

  -- Requirements
  prerequisites TEXT[],
  requirements_met JSONB DEFAULT '[]'::jsonb,
  continuing_education_hours DECIMAL(6, 2),
  required_ce_hours DECIMAL(6, 2),

  -- Verification
  verification_method VARCHAR(100),
  verification_url TEXT,
  verification_code VARCHAR(200),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),

  -- Documents
  certificate_url TEXT,
  certificate_number VARCHAR(200),
  digital_badge_url TEXT,
  supporting_documents TEXT[],

  -- Compliance
  compliance_area VARCHAR(200),
  regulatory_body VARCHAR(300),
  compliance_standard VARCHAR(200),
  audit_trail JSONB DEFAULT '[]'::jsonb,

  -- Renewal Process
  renewal_process TEXT,
  renewal_cost DECIMAL(10, 2),
  renewal_requirements TEXT[],
  auto_renew BOOLEAN DEFAULT false,

  -- Notifications
  notify_before_expiry BOOLEAN DEFAULT true,
  notification_days INTEGER DEFAULT 30,
  last_notification_sent TIMESTAMPTZ,

  -- Training & Exams
  training_completed BOOLEAN DEFAULT false,
  exam_passed BOOLEAN DEFAULT false,
  exam_score DECIMAL(5, 2),
  passing_score DECIMAL(5, 2),
  exam_date DATE,

  -- Associated Items
  associated_skills TEXT[],
  associated_roles TEXT[],
  associated_projects TEXT[],

  -- Value & Impact
  certification_value VARCHAR(50),
  business_impact TEXT,
  career_impact TEXT,

  -- Metadata
  tags TEXT[],
  category VARCHAR(100),
  industry VARCHAR(100),
  region VARCHAR(100),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT certifications_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_certifications_user_id ON certifications(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_type ON certifications(certification_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_status ON certifications(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_certifications_expiry ON certifications(expiry_date ASC) WHERE deleted_at IS NULL;

ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certifications" ON certifications FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own certifications" ON certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certifications" ON certifications FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own certifications" ON certifications FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE certifications;

-- ================================================
-- CHANGELOG TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS changelog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Change Details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  change_type VARCHAR(50) NOT NULL DEFAULT 'feature'
    CHECK (change_type IN ('feature', 'improvement', 'bug_fix', 'security', 'performance', 'breaking_change', 'deprecated', 'removed', 'documentation')),

  -- Version
  version VARCHAR(50) NOT NULL,
  version_major INTEGER,
  version_minor INTEGER,
  version_patch INTEGER,
  version_tag VARCHAR(50),

  -- Release
  release_name VARCHAR(300),
  release_date DATE,
  release_status VARCHAR(50) DEFAULT 'draft'
    CHECK (release_status IN ('draft', 'scheduled', 'released', 'archived')),

  -- Change Content
  summary VARCHAR(1000),
  details TEXT,
  technical_details TEXT,
  migration_notes TEXT,

  -- Impact
  impact_level VARCHAR(50) DEFAULT 'minor'
    CHECK (impact_level IN ('critical', 'major', 'minor', 'patch', 'none')),
  breaking_change BOOLEAN DEFAULT false,
  requires_migration BOOLEAN DEFAULT false,
  requires_downtime BOOLEAN DEFAULT false,

  -- Categories
  category VARCHAR(100),
  component VARCHAR(200),
  affected_modules TEXT[],
  affected_apis TEXT[],

  -- Users & Teams
  author_id UUID REFERENCES auth.users(id),
  author_name VARCHAR(300),
  contributors TEXT[],
  reviewers TEXT[],

  -- Links & References
  pr_url TEXT,
  issue_url TEXT,
  documentation_url TEXT,
  demo_url TEXT,
  related_changes TEXT[],

  -- Code References
  commit_hash VARCHAR(100),
  branch_name VARCHAR(200),
  repository VARCHAR(300),
  pull_request_number INTEGER,

  -- Tracking
  ticket_id VARCHAR(100),
  jira_key VARCHAR(100),
  epic_id VARCHAR(100),
  sprint_id VARCHAR(100),

  -- Visibility
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  show_in_changelog BOOLEAN DEFAULT true,
  visibility VARCHAR(50) DEFAULT 'public'
    CHECK (visibility IN ('public', 'internal', 'private', 'beta_only')),

  -- Targeting
  target_audience TEXT[],
  applies_to_versions TEXT[],
  platform TEXT[],
  environment VARCHAR(50),

  -- Rollout
  rollout_percentage DECIMAL(5, 2) DEFAULT 100.00,
  rollout_start_date TIMESTAMPTZ,
  rollout_end_date TIMESTAMPTZ,
  rollout_status VARCHAR(50),

  -- Metrics
  adoption_rate DECIMAL(5, 2),
  satisfaction_score DECIMAL(3, 2),
  issue_count INTEGER DEFAULT 0,
  feedback_count INTEGER DEFAULT 0,

  -- Deprecation
  is_deprecated BOOLEAN DEFAULT false,
  deprecated_at TIMESTAMPTZ,
  deprecation_reason TEXT,
  alternative_solution TEXT,
  removal_date DATE,

  -- Media
  screenshots TEXT[],
  videos TEXT[],
  demo_images TEXT[],

  -- Engagement
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,

  -- SEO
  slug VARCHAR(500),
  meta_description VARCHAR(300),
  keywords TEXT[],

  -- Publishing
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  last_published_at TIMESTAMPTZ,

  -- Notifications
  notify_users BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,

  -- Metadata
  tags TEXT[],
  priority VARCHAR(50),
  severity VARCHAR(50),
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT changelog_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_changelog_user_id ON changelog(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_changelog_type ON changelog(change_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_changelog_version ON changelog(version DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_changelog_release_date ON changelog(release_date DESC) WHERE deleted_at IS NULL;

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own changelog" ON changelog FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own changelog" ON changelog FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own changelog" ON changelog FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own changelog" ON changelog FOR DELETE USING (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE changelog;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE TRIGGER update_capacity_updated_at BEFORE UPDATE ON capacity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_changelog_updated_at BEFORE UPDATE ON changelog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
