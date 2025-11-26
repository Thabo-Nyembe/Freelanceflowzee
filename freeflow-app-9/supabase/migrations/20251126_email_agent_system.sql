-- ============================================================================
-- Email Agent System - Production Database Schema
-- ============================================================================
-- Comprehensive email automation and intelligence with AI-powered analysis,
-- automatic responses, quotation generation, booking management, and workflows
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE email_intent AS ENUM ('quote_request', 'inquiry', 'booking', 'complaint', 'follow_up', 'support', 'payment', 'general');
CREATE TYPE email_sentiment AS ENUM ('positive', 'neutral', 'negative', 'urgent');
CREATE TYPE email_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE email_category AS ENUM ('sales', 'booking', 'support', 'billing', 'general', 'spam');
CREATE TYPE email_status AS ENUM ('pending', 'processing', 'processed', 'responded', 'archived', 'flagged');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
CREATE TYPE approval_type AS ENUM ('response', 'quotation', 'booking', 'refund', 'discount');
CREATE TYPE response_tone AS ENUM ('professional', 'friendly', 'formal', 'casual');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Email Messages
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  status email_status NOT NULL DEFAULT 'pending',
  has_response BOOLEAN NOT NULL DEFAULT FALSE,
  has_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  has_booking BOOLEAN NOT NULL DEFAULT FALSE,
  thread_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Analysis
CREATE TABLE email_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE UNIQUE,
  intent email_intent NOT NULL,
  sentiment email_sentiment NOT NULL,
  priority email_priority NOT NULL,
  category email_category NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  extracted_name TEXT,
  extracted_company TEXT,
  extracted_phone TEXT,
  extracted_deadline TEXT,
  extracted_budget TEXT,
  extracted_requirements TEXT[] DEFAULT '{}',
  requires_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  requires_booking BOOLEAN NOT NULL DEFAULT FALSE,
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_time INTEGER NOT NULL, -- milliseconds
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Responses
CREATE TABLE email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tone response_tone NOT NULL DEFAULT 'professional',
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotations
CREATE TABLE quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  valid_until DATE NOT NULL,
  terms TEXT[] DEFAULT '{}',
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotation Items
CREATE TABLE quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  confirmed_date DATE,
  confirmed_time TIME,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Attachments
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL, -- bytes
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval Workflows
CREATE TABLE approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type approval_type NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_data JSONB NOT NULL DEFAULT '{}',
  requested_by TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Configuration
CREATE TABLE agent_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_respond BOOLEAN NOT NULL DEFAULT FALSE,
  require_approval BOOLEAN NOT NULL DEFAULT TRUE,
  auto_approve_threshold DECIMAL(5, 2) NOT NULL DEFAULT 90 CHECK (auto_approve_threshold >= 0 AND auto_approve_threshold <= 100),
  response_template TEXT,
  quotation_template TEXT,
  working_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  working_hours_timezone TEXT DEFAULT 'UTC',
  blocked_senders TEXT[] DEFAULT '{}',
  blocked_domains TEXT[] DEFAULT '{}',
  filter_keywords TEXT[] DEFAULT '{}',
  integration_email BOOLEAN NOT NULL DEFAULT TRUE,
  integration_calendar BOOLEAN NOT NULL DEFAULT FALSE,
  integration_payment BOOLEAN NOT NULL DEFAULT FALSE,
  integration_crm BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Email Messages indexes
CREATE INDEX idx_email_messages_user_id ON email_messages(user_id);
CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_received_at ON email_messages(received_at DESC);
CREATE INDEX idx_email_messages_thread_id ON email_messages(thread_id);
CREATE INDEX idx_email_messages_from ON email_messages(from_address);
CREATE INDEX idx_email_messages_user_status ON email_messages(user_id, status);

-- Email Analysis indexes
CREATE INDEX idx_email_analysis_email_id ON email_analysis(email_id);
CREATE INDEX idx_email_analysis_intent ON email_analysis(intent);
CREATE INDEX idx_email_analysis_priority ON email_analysis(priority);
CREATE INDEX idx_email_analysis_category ON email_analysis(category);
CREATE INDEX idx_email_analysis_requires_review ON email_analysis(requires_human_review);

-- Email Responses indexes
CREATE INDEX idx_email_responses_email_id ON email_responses(email_id);
CREATE INDEX idx_email_responses_status ON email_responses(status);
CREATE INDEX idx_email_responses_generated_at ON email_responses(generated_at DESC);

-- Quotations indexes
CREATE INDEX idx_quotations_email_id ON quotations(email_id);
CREATE INDEX idx_quotations_user_id ON quotations(user_id);
CREATE INDEX idx_quotations_status ON quotations(status);
CREATE INDEX idx_quotations_valid_until ON quotations(valid_until);

-- Quotation Items indexes
CREATE INDEX idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX idx_quotation_items_sort_order ON quotation_items(quotation_id, sort_order);

-- Bookings indexes
CREATE INDEX idx_bookings_email_id ON bookings(email_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_confirmed_date ON bookings(confirmed_date);

-- Email Attachments indexes
CREATE INDEX idx_email_attachments_email_id ON email_attachments(email_id);

-- Approval Workflows indexes
CREATE INDEX idx_approval_workflows_user_id ON approval_workflows(user_id);
CREATE INDEX idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX idx_approval_workflows_type ON approval_workflows(type);
CREATE INDEX idx_approval_workflows_priority ON approval_workflows(priority);
CREATE INDEX idx_approval_workflows_email_id ON approval_workflows(email_id);
CREATE INDEX idx_approval_workflows_expires_at ON approval_workflows(expires_at);

-- Agent Configuration indexes
CREATE INDEX idx_agent_configuration_user_id ON agent_configuration(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON email_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configuration_updated_at
  BEFORE UPDATE ON agent_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate quotation total
CREATE OR REPLACE FUNCTION calculate_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.subtotal + NEW.tax - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quotation_total_trigger
  BEFORE INSERT OR UPDATE OF subtotal, tax, discount ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quotation_total();

-- Auto-calculate quotation item total
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_item_total_trigger
  BEFORE INSERT OR UPDATE OF quantity, unit_price ON quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Auto-expire approvals
CREATE OR REPLACE FUNCTION check_approval_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_approval_expiration_trigger
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION check_approval_expiration();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get email statistics
CREATE OR REPLACE FUNCTION get_email_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalEmailsReceived', COUNT(*),
    'totalEmailsProcessed', COUNT(*) FILTER (WHERE status != 'pending'),
    'responsesGenerated', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id),
    'responsesSent', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id AND er.sent_at IS NOT NULL),
    'quotationsGenerated', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id),
    'quotationsSent', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id AND sent_at IS NOT NULL),
    'bookingsCreated', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id),
    'bookingsConfirmed', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id AND confirmed_date IS NOT NULL),
    'approvalsPending', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'pending'),
    'approvalsApproved', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'approved'),
    'approvalsRejected', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'rejected'),
    'avgResponseTime', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (read_at - received_at)) / 60), 0)::INTEGER
      FROM email_messages
      WHERE user_id = p_user_id AND read_at IS NOT NULL
    ),
    'avgConfidenceScore', (
      SELECT COALESCE(AVG(ea.confidence_score), 0)::INTEGER
      FROM email_analysis ea
      JOIN email_messages em ON ea.email_id = em.id
      WHERE em.user_id = p_user_id
    )
  )
  INTO v_stats
  FROM email_messages
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search emails
CREATE OR REPLACE FUNCTION search_emails(p_user_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  status email_status,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, em.status, em.received_at
  FROM email_messages em
  WHERE em.user_id = p_user_id
    AND (
      em.from_address ILIKE '%' || p_query || '%'
      OR em.subject ILIKE '%' || p_query || '%'
      OR em.body ILIKE '%' || p_query || '%'
    )
  ORDER BY em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get pending approvals
CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type approval_type,
  priority email_priority,
  email_subject TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT aw.id, aw.type, aw.priority, em.subject, aw.created_at
  FROM approval_workflows aw
  JOIN email_messages em ON aw.email_id = em.id
  WHERE aw.user_id = p_user_id AND aw.status = 'pending'
  ORDER BY aw.priority, aw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get emails requiring review
CREATE OR REPLACE FUNCTION get_emails_requiring_review(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  priority email_priority,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, ea.priority, em.received_at
  FROM email_messages em
  JOIN email_analysis ea ON em.id = ea.email_id
  WHERE em.user_id = p_user_id
    AND ea.requires_human_review = TRUE
    AND em.status = 'processing'
  ORDER BY ea.priority, em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get quotation total with items
CREATE OR REPLACE FUNCTION get_quotation_total(p_quotation_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_items_total DECIMAL;
  v_quotation quotations%ROWTYPE;
BEGIN
  SELECT SUM(total) INTO v_items_total
  FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  RETURN COALESCE(v_items_total, 0) + v_quotation.tax - v_quotation.discount;
END;
$$ LANGUAGE plpgsql;

-- Update email status based on activity
CREATE OR REPLACE FUNCTION update_email_status(p_email_id UUID)
RETURNS VOID AS $$
DECLARE
  v_has_response BOOLEAN;
  v_has_quotation BOOLEAN;
  v_has_booking BOOLEAN;
BEGIN
  SELECT
    EXISTS(SELECT 1 FROM email_responses WHERE email_id = p_email_id AND sent_at IS NOT NULL),
    EXISTS(SELECT 1 FROM quotations WHERE email_id = p_email_id),
    EXISTS(SELECT 1 FROM bookings WHERE email_id = p_email_id)
  INTO v_has_response, v_has_quotation, v_has_booking;

  UPDATE email_messages
  SET
    has_response = v_has_response,
    has_quotation = v_has_quotation,
    has_booking = v_has_booking,
    status = CASE
      WHEN v_has_response THEN 'responded'::email_status
      WHEN status = 'pending' THEN 'processing'::email_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configuration ENABLE ROW LEVEL SECURITY;

-- Email Messages policies
CREATE POLICY "Users can view their own email messages"
  ON email_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email messages"
  ON email_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email messages"
  ON email_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email messages"
  ON email_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Email Analysis policies
CREATE POLICY "Users can view analysis for their emails"
  ON email_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage analysis for their emails"
  ON email_analysis FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

-- Email Responses policies (same pattern)
CREATE POLICY "Users can view responses for their emails"
  ON email_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage responses for their emails"
  ON email_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

-- Quotations policies
CREATE POLICY "Users can view their own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotations"
  ON quotations FOR ALL
  USING (auth.uid() = user_id);

-- Quotation Items policies
CREATE POLICY "Users can view items for their quotations"
  ON quotation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage items for their quotations"
  ON quotation_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Email Attachments policies
CREATE POLICY "Users can view attachments for their emails"
  ON email_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage attachments for their emails"
  ON email_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

-- Approval Workflows policies
CREATE POLICY "Users can view their own approval workflows"
  ON approval_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own approval workflows"
  ON approval_workflows FOR ALL
  USING (auth.uid() = user_id);

-- Agent Configuration policies
CREATE POLICY "Users can view their own agent configuration"
  ON agent_configuration FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent configuration"
  ON agent_configuration FOR ALL
  USING (auth.uid() = user_id);
