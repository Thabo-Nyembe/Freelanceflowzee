-- ============================================================================
-- CLIENT ZONE SYSTEM - Complete Database Schema
-- ============================================================================
-- Description: Comprehensive schema for client portal functionality
-- Features: Projects, Messages, Files, Invoices, Payments, Analytics, Feedback
-- Created: 2025-11-26
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: client_projects
-- Description: Client projects with progress tracking and deliverables
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Details
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'review', 'completed', 'cancelled')) DEFAULT 'pending',
  phase TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),

  -- Financial
  budget DECIMAL(10, 2) DEFAULT 0,
  spent DECIMAL(10, 2) DEFAULT 0,

  -- Dates
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Metadata
  team_members UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  last_update TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: project_deliverables
-- Description: Individual deliverables within projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_deliverables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'review', 'completed', 'revision-requested')) DEFAULT 'pending',

  -- Dates
  due_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,

  -- Approval
  requires_approval BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  -- Files
  file_urls TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: revision_requests
-- Description: Revision requests for deliverables
-- ============================================================================
CREATE TABLE IF NOT EXISTS revision_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deliverable_id UUID REFERENCES project_deliverables(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  notes TEXT NOT NULL,
  status TEXT CHECK (status IN ('open', 'in-progress', 'completed', 'rejected')) DEFAULT 'open',

  -- Resolution
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_messages
-- Description: Messages between clients and freelancers
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  message TEXT NOT NULL,
  message_type TEXT CHECK (message_type IN ('text', 'system', 'notification')) DEFAULT 'text',

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  -- Threading
  reply_to UUID REFERENCES client_messages(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_files
-- Description: File repository for client projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- File Details
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,

  -- Storage
  storage_path TEXT NOT NULL,
  storage_bucket TEXT DEFAULT 'client-files',

  -- Metadata
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,

  -- Access
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_invoices
-- Description: Invoices for client projects
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invoice Details
  invoice_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,

  -- Financial
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,

  -- Payment
  status TEXT CHECK (status IN ('draft', 'sent', 'pending', 'paid', 'overdue', 'cancelled')) DEFAULT 'draft',
  payment_method TEXT,
  transaction_id TEXT,

  -- Dates
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,

  -- Line Items
  line_items JSONB DEFAULT '[]',

  -- Notes
  notes TEXT,
  terms TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: milestone_payments
-- Description: Milestone-based payment tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS milestone_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES client_invoices(id) ON DELETE SET NULL,

  -- Milestone Details
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'released', 'disputed')) DEFAULT 'pending',

  -- Escrow
  in_escrow BOOLEAN DEFAULT false,
  escrow_released_at TIMESTAMPTZ,

  -- Dates
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,

  -- Approval
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_feedback
-- Description: Client satisfaction and project feedback
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ratings (1-5 scale)
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),

  -- Feedback
  feedback_text TEXT,

  -- Public/Private
  is_public BOOLEAN DEFAULT false,
  is_testimonial BOOLEAN DEFAULT false,

  -- Follow-up
  would_recommend BOOLEAN,
  would_hire_again BOOLEAN,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_analytics
-- Description: Analytics and metrics tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  -- Metrics
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit TEXT,

  -- Dimensions
  dimension_1 TEXT,
  dimension_2 TEXT,
  dimension_3 TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_schedules
-- Description: Meetings and scheduled events
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,

  -- Event Details
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT CHECK (event_type IN ('meeting', 'call', 'review', 'presentation', 'deadline')) DEFAULT 'meeting',

  -- Participants
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_ids UUID[] DEFAULT '{}',

  -- Schedule
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  timezone TEXT DEFAULT 'UTC',

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',

  -- Meeting Details
  meeting_url TEXT,
  meeting_notes TEXT,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: client_notifications
-- Description: Notification preferences and history
-- ============================================================================
CREATE TABLE IF NOT EXISTS client_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification Details
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Related Entities
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  related_entity_type TEXT,
  related_entity_id UUID,

  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Delivery
  delivery_method TEXT[] DEFAULT '{in-app}',
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,

  -- Action
  action_url TEXT,
  action_label TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: ai_collaboration
-- Description: AI-powered design options and preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_collaboration (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- AI Details
  ai_type TEXT CHECK (ai_type IN ('design-option', 'content-suggestion', 'layout-variant', 'color-scheme')) NOT NULL,

  -- Content
  prompt TEXT,
  generated_content JSONB NOT NULL,

  -- Preferences
  selected BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  -- Generation Metadata
  model_used TEXT,
  generation_time_ms INTEGER,
  tokens_used INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Projects
CREATE INDEX idx_client_projects_user ON client_projects(user_id);
CREATE INDEX idx_client_projects_client ON client_projects(client_id);
CREATE INDEX idx_client_projects_status ON client_projects(status);
CREATE INDEX idx_client_projects_due_date ON client_projects(due_date);

-- Deliverables
CREATE INDEX idx_deliverables_project ON project_deliverables(project_id);
CREATE INDEX idx_deliverables_status ON project_deliverables(status);

-- Revision Requests
CREATE INDEX idx_revision_requests_deliverable ON revision_requests(deliverable_id);
CREATE INDEX idx_revision_requests_project ON revision_requests(project_id);
CREATE INDEX idx_revision_requests_status ON revision_requests(status);

-- Messages
CREATE INDEX idx_client_messages_project ON client_messages(project_id);
CREATE INDEX idx_client_messages_sender ON client_messages(sender_id);
CREATE INDEX idx_client_messages_recipient ON client_messages(recipient_id);
CREATE INDEX idx_client_messages_unread ON client_messages(read) WHERE read = false;

-- Files
CREATE INDEX idx_client_files_project ON client_files(project_id);
CREATE INDEX idx_client_files_uploaded_by ON client_files(uploaded_by);
CREATE INDEX idx_client_files_type ON client_files(file_type);

-- Invoices
CREATE INDEX idx_client_invoices_project ON client_invoices(project_id);
CREATE INDEX idx_client_invoices_client ON client_invoices(client_id);
CREATE INDEX idx_client_invoices_status ON client_invoices(status);
CREATE INDEX idx_client_invoices_number ON client_invoices(invoice_number);

-- Milestone Payments
CREATE INDEX idx_milestone_payments_project ON milestone_payments(project_id);
CREATE INDEX idx_milestone_payments_status ON milestone_payments(status);

-- Feedback
CREATE INDEX idx_client_feedback_project ON client_feedback(project_id);
CREATE INDEX idx_client_feedback_client ON client_feedback(client_id);
CREATE INDEX idx_client_feedback_freelancer ON client_feedback(freelancer_id);

-- Analytics
CREATE INDEX idx_client_analytics_user ON client_analytics(user_id);
CREATE INDEX idx_client_analytics_project ON client_analytics(project_id);
CREATE INDEX idx_client_analytics_type ON client_analytics(metric_type);
CREATE INDEX idx_client_analytics_recorded ON client_analytics(recorded_at);

-- Schedules
CREATE INDEX idx_client_schedules_project ON client_schedules(project_id);
CREATE INDEX idx_client_schedules_organizer ON client_schedules(organizer_id);
CREATE INDEX idx_client_schedules_start_time ON client_schedules(start_time);

-- Notifications
CREATE INDEX idx_client_notifications_user ON client_notifications(user_id);
CREATE idx_client_notifications_project ON client_notifications(project_id);
CREATE INDEX idx_client_notifications_unread ON client_notifications(read) WHERE read = false;

-- AI Collaboration
CREATE INDEX idx_ai_collaboration_project ON ai_collaboration(project_id);
CREATE INDEX idx_ai_collaboration_user ON ai_collaboration(user_id);
CREATE INDEX idx_ai_collaboration_type ON ai_collaboration(ai_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE revision_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_collaboration ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: client_projects
-- ============================================================================

-- Freelancers can view their own projects
CREATE POLICY "Freelancers can view own projects"
  ON client_projects FOR SELECT
  USING (auth.uid() = user_id);

-- Clients can view their projects
CREATE POLICY "Clients can view their projects"
  ON client_projects FOR SELECT
  USING (auth.uid() = client_id);

-- Freelancers can create projects
CREATE POLICY "Freelancers can create projects"
  ON client_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Freelancers can update their own projects
CREATE POLICY "Freelancers can update own projects"
  ON client_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Clients can update their projects (limited fields)
CREATE POLICY "Clients can update their projects"
  ON client_projects FOR UPDATE
  USING (auth.uid() = client_id);

-- ============================================================================
-- RLS POLICIES: project_deliverables
-- ============================================================================

CREATE POLICY "Users can view project deliverables"
  ON project_deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can manage deliverables"
  ON project_deliverables FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can approve deliverables"
  ON project_deliverables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = project_deliverables.project_id
      AND client_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: revision_requests
-- ============================================================================

CREATE POLICY "Users can view revision requests"
  ON revision_requests FOR SELECT
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = revision_requests.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create revision requests"
  ON revision_requests FOR INSERT
  WITH CHECK (requested_by = auth.uid());

CREATE POLICY "Freelancers can update revision requests"
  ON revision_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = revision_requests.project_id
      AND user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: client_messages
-- ============================================================================

CREATE POLICY "Users can view their messages"
  ON client_messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON client_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can mark messages as read"
  ON client_messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_files
-- ============================================================================

CREATE POLICY "Users can view project files"
  ON client_files FOR SELECT
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_files.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload files"
  ON client_files FOR INSERT
  WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_files.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- ============================================================================
-- RLS POLICIES: client_invoices
-- ============================================================================

CREATE POLICY "Clients can view their invoices"
  ON client_invoices FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Freelancers can view their invoices"
  ON client_invoices FOR SELECT
  USING (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can create invoices"
  ON client_invoices FOR INSERT
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Freelancers can update their invoices"
  ON client_invoices FOR UPDATE
  USING (freelancer_id = auth.uid());

CREATE POLICY "Clients can update invoice status"
  ON client_invoices FOR UPDATE
  USING (client_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: milestone_payments
-- ============================================================================

CREATE POLICY "Users can view milestone payments"
  ON milestone_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Freelancers can create milestones"
  ON milestone_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can approve milestones"
  ON milestone_payments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = milestone_payments.project_id
      AND client_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS POLICIES: client_feedback
-- ============================================================================

CREATE POLICY "Public feedback is viewable"
  ON client_feedback FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their feedback"
  ON client_feedback FOR SELECT
  USING (client_id = auth.uid() OR freelancer_id = auth.uid());

CREATE POLICY "Clients can create feedback"
  ON client_feedback FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their feedback"
  ON client_feedback FOR UPDATE
  USING (client_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_analytics
-- ============================================================================

CREATE POLICY "Users can view their analytics"
  ON client_analytics FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = client_analytics.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "System can insert analytics"
  ON client_analytics FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: client_schedules
-- ============================================================================

CREATE POLICY "Users can view their schedules"
  ON client_schedules FOR SELECT
  USING (
    organizer_id = auth.uid() OR
    auth.uid() = ANY(participant_ids)
  );

CREATE POLICY "Organizers can manage schedules"
  ON client_schedules FOR ALL
  USING (organizer_id = auth.uid());

-- ============================================================================
-- RLS POLICIES: client_notifications
-- ============================================================================

CREATE POLICY "Users can view their notifications"
  ON client_notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications"
  ON client_notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON client_notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: ai_collaboration
-- ============================================================================

CREATE POLICY "Users can view AI collaboration"
  ON ai_collaboration FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = ai_collaboration.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create AI collaboration"
  ON ai_collaboration FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM client_projects
      WHERE id = ai_collaboration.project_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can update AI collaboration"
  ON ai_collaboration FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_client_projects_updated_at BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_deliverables_updated_at BEFORE UPDATE ON project_deliverables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revision_requests_updated_at BEFORE UPDATE ON revision_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_messages_updated_at BEFORE UPDATE ON client_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_files_updated_at BEFORE UPDATE ON client_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_invoices_updated_at BEFORE UPDATE ON client_invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestone_payments_updated_at BEFORE UPDATE ON milestone_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_feedback_updated_at BEFORE UPDATE ON client_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_schedules_updated_at BEFORE UPDATE ON client_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_collaboration_updated_at BEFORE UPDATE ON ai_collaboration
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS for Common Queries
-- ============================================================================

-- Active Projects Overview
CREATE OR REPLACE VIEW active_projects_overview AS
SELECT
  p.*,
  COUNT(DISTINCT d.id) as total_deliverables,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'completed') as completed_deliverables,
  COUNT(DISTINCT m.id) as total_messages,
  COUNT(DISTINCT f.id) as total_files
FROM client_projects p
LEFT JOIN project_deliverables d ON p.id = d.project_id
LEFT JOIN client_messages m ON p.id = m.project_id
LEFT JOIN client_files f ON p.id = f.project_id
WHERE p.status IN ('in-progress', 'review')
GROUP BY p.id;

-- Client Dashboard Stats
CREATE OR REPLACE VIEW client_dashboard_stats AS
SELECT
  client_id,
  COUNT(DISTINCT id) as total_projects,
  COUNT(DISTINCT id) FILTER (WHERE status = 'in-progress') as active_projects,
  COUNT(DISTINCT id) FILTER (WHERE status = 'completed') as completed_projects,
  SUM(budget) as total_investment,
  AVG((SELECT AVG(overall_rating) FROM client_feedback WHERE project_id = client_projects.id)) as avg_satisfaction
FROM client_projects
GROUP BY client_id;

-- ============================================================================
-- INITIAL DATA / SEED (Optional)
-- ============================================================================

-- This section can be used to insert sample data for testing
-- Uncomment if needed for development

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
