-- ============================================================================
-- CLIENT PORTAL SYSTEM - SUPABASE MIGRATION
-- Complete client relationship management with portal access
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE client_status AS ENUM (
  'active',
  'onboarding',
  'inactive',
  'churned'
);

CREATE TYPE client_tier AS ENUM (
  'basic',
  'standard',
  'premium',
  'enterprise'
);

CREATE TYPE portal_project_status AS ENUM (
  'planning',
  'active',
  'on-hold',
  'completed',
  'cancelled'
);

CREATE TYPE communication_type AS ENUM (
  'email',
  'call',
  'meeting',
  'message',
  'note'
);

CREATE TYPE file_category AS ENUM (
  'contract',
  'invoice',
  'proposal',
  'report',
  'deliverable',
  'other'
);

CREATE TYPE access_level AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

CREATE TYPE health_status AS ENUM (
  'excellent',
  'good',
  'warning',
  'critical'
);

CREATE TYPE risk_type AS ENUM (
  'budget',
  'timeline',
  'scope',
  'quality',
  'resource'
);

CREATE TYPE risk_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled'
);

-- ============================================================================
-- TABLE: portal_clients
-- ============================================================================

CREATE TABLE portal_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  status client_status NOT NULL DEFAULT 'active',
  tier client_tier NOT NULL DEFAULT 'basic',
  active_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  monthly_revenue DECIMAL(15, 2) DEFAULT 0,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  health_status health_status NOT NULL DEFAULT 'good',
  last_contact TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_follow_up TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  address TEXT,
  industry TEXT,
  company_size TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferred_contact communication_type DEFAULT 'email',
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  satisfaction_rating DECIMAL(3, 2) DEFAULT 0 CHECK (satisfaction_rating >= 0 AND satisfaction_rating <= 5),
  contract_start_date TIMESTAMPTZ,
  contract_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_projects
-- ============================================================================

CREATE TABLE portal_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status portal_project_status NOT NULL DEFAULT 'planning',
  budget DECIMAL(15, 2) DEFAULT 0,
  spent DECIMAL(15, 2) DEFAULT 0,
  remaining DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  team TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  priority TEXT DEFAULT 'medium',
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_starred BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_project_milestones
-- ============================================================================

CREATE TABLE portal_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_project_risks
-- ============================================================================

CREATE TABLE portal_project_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES portal_projects(id) ON DELETE CASCADE,
  type risk_type NOT NULL,
  severity risk_severity NOT NULL,
  description TEXT NOT NULL,
  mitigation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'mitigated', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_communications
-- ============================================================================

CREATE TABLE portal_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type communication_type NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  outcome TEXT,
  action_items TEXT[] DEFAULT ARRAY[]::TEXT[],
  attachments TEXT[] DEFAULT ARRAY[]::TEXT[],
  participants TEXT[] DEFAULT ARRAY[]::TEXT[],
  duration INTEGER,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL
);

-- ============================================================================
-- TABLE: portal_files
-- ============================================================================

CREATE TABLE portal_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES portal_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category file_category NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  url TEXT NOT NULL,
  access_level access_level NOT NULL DEFAULT 'view',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_shared BOOLEAN DEFAULT false,
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  download_count INTEGER DEFAULT 0,
  last_downloaded TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_file_versions
-- ============================================================================

CREATE TABLE portal_file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES portal_files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by TEXT NOT NULL,
  size BIGINT NOT NULL,
  changes TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_invoices
-- ============================================================================

CREATE TABLE portal_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  project_id UUID REFERENCES portal_projects(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount DECIMAL(15, 2) NOT NULL,
  tax DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_invoice_items
-- ============================================================================

CREATE TABLE portal_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES portal_invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  rate DECIMAL(15, 2) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_client_activities
-- ============================================================================

CREATE TABLE portal_client_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: portal_client_metrics
-- ============================================================================

CREATE TABLE portal_client_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES portal_clients(id) ON DELETE CASCADE UNIQUE,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  average_project_value DECIMAL(15, 2) DEFAULT 0,
  project_completion_rate DECIMAL(5, 2) DEFAULT 0,
  on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) DEFAULT 0,
  communication_frequency INTEGER DEFAULT 0,
  response_time DECIMAL(10, 2) DEFAULT 0,
  retention_score INTEGER DEFAULT 0,
  growth_rate DECIMAL(5, 2) DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- portal_clients indexes
CREATE INDEX idx_portal_clients_user_id ON portal_clients(user_id);
CREATE INDEX idx_portal_clients_status ON portal_clients(status);
CREATE INDEX idx_portal_clients_tier ON portal_clients(tier);
CREATE INDEX idx_portal_clients_health_status ON portal_clients(health_status);
CREATE INDEX idx_portal_clients_health_score ON portal_clients(health_score DESC);
CREATE INDEX idx_portal_clients_total_revenue ON portal_clients(total_revenue DESC);
CREATE INDEX idx_portal_clients_last_contact ON portal_clients(last_contact DESC);
CREATE INDEX idx_portal_clients_next_follow_up ON portal_clients(next_follow_up);
CREATE INDEX idx_portal_clients_tags ON portal_clients USING gin(tags);
CREATE INDEX idx_portal_clients_company_name_trgm ON portal_clients USING gin(company_name gin_trgm_ops);

-- portal_projects indexes
CREATE INDEX idx_portal_projects_client_id ON portal_projects(client_id);
CREATE INDEX idx_portal_projects_user_id ON portal_projects(user_id);
CREATE INDEX idx_portal_projects_status ON portal_projects(status);
CREATE INDEX idx_portal_projects_priority ON portal_projects(priority);
CREATE INDEX idx_portal_projects_deadline ON portal_projects(deadline);
CREATE INDEX idx_portal_projects_is_starred ON portal_projects(is_starred);
CREATE INDEX idx_portal_projects_progress ON portal_projects(progress);
CREATE INDEX idx_portal_projects_tags ON portal_projects USING gin(tags);

-- portal_project_milestones indexes
CREATE INDEX idx_portal_project_milestones_project_id ON portal_project_milestones(project_id);
CREATE INDEX idx_portal_project_milestones_due_date ON portal_project_milestones(due_date);
CREATE INDEX idx_portal_project_milestones_completed ON portal_project_milestones(completed);

-- portal_project_risks indexes
CREATE INDEX idx_portal_project_risks_project_id ON portal_project_risks(project_id);
CREATE INDEX idx_portal_project_risks_severity ON portal_project_risks(severity);
CREATE INDEX idx_portal_project_risks_status ON portal_project_risks(status);

-- portal_communications indexes
CREATE INDEX idx_portal_communications_client_id ON portal_communications(client_id);
CREATE INDEX idx_portal_communications_user_id ON portal_communications(user_id);
CREATE INDEX idx_portal_communications_type ON portal_communications(type);
CREATE INDEX idx_portal_communications_created_at ON portal_communications(created_at DESC);

-- portal_files indexes
CREATE INDEX idx_portal_files_client_id ON portal_files(client_id);
CREATE INDEX idx_portal_files_project_id ON portal_files(project_id);
CREATE INDEX idx_portal_files_user_id ON portal_files(user_id);
CREATE INDEX idx_portal_files_category ON portal_files(category);
CREATE INDEX idx_portal_files_access_level ON portal_files(access_level);
CREATE INDEX idx_portal_files_is_shared ON portal_files(is_shared);

-- portal_file_versions indexes
CREATE INDEX idx_portal_file_versions_file_id ON portal_file_versions(file_id);
CREATE INDEX idx_portal_file_versions_version ON portal_file_versions(version DESC);

-- portal_invoices indexes
CREATE INDEX idx_portal_invoices_client_id ON portal_invoices(client_id);
CREATE INDEX idx_portal_invoices_project_id ON portal_invoices(project_id);
CREATE INDEX idx_portal_invoices_user_id ON portal_invoices(user_id);
CREATE INDEX idx_portal_invoices_status ON portal_invoices(status);
CREATE INDEX idx_portal_invoices_due_date ON portal_invoices(due_date);
CREATE INDEX idx_portal_invoices_issue_date ON portal_invoices(issue_date DESC);

-- portal_invoice_items indexes
CREATE INDEX idx_portal_invoice_items_invoice_id ON portal_invoice_items(invoice_id);

-- portal_client_activities indexes
CREATE INDEX idx_portal_client_activities_client_id ON portal_client_activities(client_id);
CREATE INDEX idx_portal_client_activities_user_id ON portal_client_activities(user_id);
CREATE INDEX idx_portal_client_activities_type ON portal_client_activities(type);
CREATE INDEX idx_portal_client_activities_timestamp ON portal_client_activities(timestamp DESC);

-- portal_client_metrics indexes
CREATE INDEX idx_portal_client_metrics_client_id ON portal_client_metrics(client_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_project_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_client_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_client_metrics ENABLE ROW LEVEL SECURITY;

-- portal_clients policies
CREATE POLICY "Users can view their own clients"
  ON portal_clients FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clients"
  ON portal_clients FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
  ON portal_clients FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
  ON portal_clients FOR DELETE
  USING (auth.uid() = user_id);

-- portal_projects policies
CREATE POLICY "Users can view projects for their clients"
  ON portal_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects"
  ON portal_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their projects"
  ON portal_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their projects"
  ON portal_projects FOR DELETE
  USING (auth.uid() = user_id);

-- portal_project_milestones policies
CREATE POLICY "Users can manage milestones for their projects"
  ON portal_project_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_projects
    WHERE portal_projects.id = portal_project_milestones.project_id
    AND portal_projects.user_id = auth.uid()
  ));

-- portal_project_risks policies
CREATE POLICY "Users can manage risks for their projects"
  ON portal_project_risks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_projects
    WHERE portal_projects.id = portal_project_risks.project_id
    AND portal_projects.user_id = auth.uid()
  ));

-- portal_communications policies
CREATE POLICY "Users can view communications for their clients"
  ON portal_communications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create communications"
  ON portal_communications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- portal_files policies
CREATE POLICY "Users can manage files for their clients"
  ON portal_files FOR ALL
  USING (auth.uid() = user_id);

-- portal_file_versions policies
CREATE POLICY "Users can view file versions"
  ON portal_file_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM portal_files
    WHERE portal_files.id = portal_file_versions.file_id
    AND portal_files.user_id = auth.uid()
  ));

-- portal_invoices policies
CREATE POLICY "Users can manage invoices for their clients"
  ON portal_invoices FOR ALL
  USING (auth.uid() = user_id);

-- portal_invoice_items policies
CREATE POLICY "Users can manage invoice items"
  ON portal_invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM portal_invoices
    WHERE portal_invoices.id = portal_invoice_items.invoice_id
    AND portal_invoices.user_id = auth.uid()
  ));

-- portal_client_activities policies
CREATE POLICY "Users can view activities for their clients"
  ON portal_client_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activities"
  ON portal_client_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- portal_client_metrics policies
CREATE POLICY "Users can view metrics for their clients"
  ON portal_client_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM portal_clients
    WHERE portal_clients.id = portal_client_metrics.client_id
    AND portal_clients.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portal_clients_updated_at
  BEFORE UPDATE ON portal_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_projects_updated_at
  BEFORE UPDATE ON portal_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_project_risks_updated_at
  BEFORE UPDATE ON portal_project_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portal_invoices_updated_at
  BEFORE UPDATE ON portal_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update project remaining budget
CREATE OR REPLACE FUNCTION update_project_remaining()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remaining := NEW.budget - NEW.spent;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_remaining
  BEFORE INSERT OR UPDATE OF budget, spent ON portal_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_remaining();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate client health score
CREATE OR REPLACE FUNCTION calculate_client_health(p_client_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_client RECORD;
  v_score INTEGER := 100;
  v_days_since_contact INTEGER;
BEGIN
  SELECT * INTO v_client FROM portal_clients WHERE id = p_client_id;

  -- Revenue check
  IF v_client.monthly_revenue < 1000 THEN
    v_score := v_score - 20;
  END IF;

  -- Communication frequency
  v_days_since_contact := EXTRACT(DAY FROM (now() - v_client.last_contact));
  IF v_days_since_contact > 30 THEN
    v_score := v_score - 15;
  END IF;

  -- Active projects
  IF v_client.active_projects = 0 THEN
    v_score := v_score - 25;
  END IF;

  -- Satisfaction rating
  IF v_client.satisfaction_rating < 3.5 THEN
    v_score := v_score - 20;
  END IF;

  RETURN GREATEST(0, v_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get portal statistics
CREATE OR REPLACE FUNCTION get_portal_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id),
      'active_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id AND status = 'active'),
      'total_revenue', (SELECT COALESCE(SUM(total_revenue), 0) FROM portal_clients WHERE user_id = p_user_id),
      'monthly_revenue', (SELECT COALESCE(SUM(monthly_revenue), 0) FROM portal_clients WHERE user_id = p_user_id),
      'total_projects', (SELECT COUNT(*) FROM portal_projects WHERE user_id = p_user_id),
      'active_projects', (SELECT COUNT(*) FROM portal_projects WHERE user_id = p_user_id AND status = 'active'),
      'at_risk_clients', (SELECT COUNT(*) FROM portal_clients WHERE user_id = p_user_id AND health_status IN ('warning', 'critical'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search clients
CREATE OR REPLACE FUNCTION search_portal_clients(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  status client_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.company_name,
    c.contact_person,
    c.email,
    c.status
  FROM portal_clients c
  WHERE c.user_id = p_user_id
  AND (
    c.company_name ILIKE '%' || p_search_term || '%'
    OR c.contact_person ILIKE '%' || p_search_term || '%'
    OR c.email ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(c.tags)
  )
  ORDER BY c.total_revenue DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
