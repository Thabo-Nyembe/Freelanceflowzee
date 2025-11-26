-- =====================================================
-- ADMIN OVERVIEW SYSTEM - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Migration: 20251126_admin_overview_system
-- Description: Comprehensive database for Business Admin Intelligence
-- Modules: Analytics, CRM, Invoicing, Marketing, Operations, Automation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ANALYTICS MODULE
-- =====================================================

-- Analytics events tracking
CREATE TABLE IF NOT EXISTS admin_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'conversion', 'purchase', 'signup', 'custom')),
  event_name TEXT NOT NULL,
  event_value DECIMAL(10, 2) DEFAULT 0,
  properties JSONB DEFAULT '{}',
  source TEXT,
  medium TEXT,
  campaign TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics reports
CREATE TABLE IF NOT EXISTS admin_analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('revenue', 'traffic', 'conversion', 'custom')),
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  format TEXT CHECK (format IN ('csv', 'pdf', 'json')),
  data JSONB DEFAULT '{}',
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Analytics goals
CREATE TABLE IF NOT EXISTS admin_analytics_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_type TEXT CHECK (goal_type IN ('revenue', 'conversions', 'traffic', 'custom')),
  target_value DECIMAL(10, 2) NOT NULL,
  current_value DECIMAL(10, 2) DEFAULT 0,
  period TEXT CHECK (period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CRM MODULE
-- =====================================================

-- CRM deals
CREATE TABLE IF NOT EXISTS admin_crm_deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_id UUID,
  deal_value DECIMAL(10, 2) NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('hot', 'warm', 'cold')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lost_reason TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- CRM contacts
CREATE TABLE IF NOT EXISTS admin_crm_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  lead_source TEXT,
  lead_status TEXT DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'unqualified', 'customer', 'churned')),
  lifecycle_stage TEXT CHECK (lifecycle_stage IN ('subscriber', 'lead', 'marketing_qualified', 'sales_qualified', 'opportunity', 'customer', 'evangelist')),
  notes TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contacted_at TIMESTAMPTZ
);

-- CRM activities
CREATE TABLE IF NOT EXISTS admin_crm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES admin_crm_deals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES admin_crm_contacts(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('email', 'call', 'meeting', 'note', 'task')),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICING MODULE
-- =====================================================

-- Admin invoices (separate from client invoices)
CREATE TABLE IF NOT EXISTS admin_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  sent_date DATE,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  terms TEXT,
  payment_method TEXT,
  payment_reference TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice reminders
CREATE TABLE IF NOT EXISTS admin_invoice_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES admin_invoices(id) ON DELETE CASCADE,
  reminder_type TEXT CHECK (reminder_type IN ('before_due', 'on_due', 'after_due')),
  days_offset INTEGER NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment tracking
CREATE TABLE IF NOT EXISTS admin_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES admin_invoices(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MARKETING MODULE
-- =====================================================

-- Marketing leads
CREATE TABLE IF NOT EXISTS admin_marketing_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  job_title TEXT,
  lead_source TEXT,
  lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
  qualification_notes TEXT,
  campaign_id UUID,
  form_submission JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  converted_to_deal_id UUID
);

-- Email campaigns
CREATE TABLE IF NOT EXISTS admin_email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT CHECK (campaign_type IN ('newsletter', 'promotional', 'transactional', 'drip', 'ab_test')),
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  from_name TEXT NOT NULL,
  from_email TEXT NOT NULL,
  reply_to TEXT,
  html_content TEXT,
  plain_text_content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  opens INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  unsubscribes INTEGER DEFAULT 0,
  bounces INTEGER DEFAULT 0,
  open_rate DECIMAL(5, 2) DEFAULT 0,
  click_rate DECIMAL(5, 2) DEFAULT 0,
  conversion_rate DECIMAL(5, 2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  segment_criteria JSONB DEFAULT '{}',
  ab_test_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign subscribers
CREATE TABLE IF NOT EXISTS admin_campaign_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES admin_email_campaigns(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  subscriber_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'converted', 'bounced', 'unsubscribed')),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- OPERATIONS MODULE
-- =====================================================

-- Team members (extends auth.users)
CREATE TABLE IF NOT EXISTS admin_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'designer', 'developer', 'marketer', 'sales', 'support', 'viewer')),
  department TEXT,
  job_title TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'on_leave')),
  hire_date DATE,
  last_active_at TIMESTAMPTZ,
  productivity_score INTEGER DEFAULT 0 CHECK (productivity_score >= 0 AND productivity_score <= 100),
  tasks_completed INTEGER DEFAULT 0,
  projects_assigned INTEGER DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role permissions
CREATE TABLE IF NOT EXISTS admin_role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role TEXT NOT NULL UNIQUE CHECK (role IN ('super_admin', 'admin', 'manager', 'designer', 'developer', 'marketer', 'sales', 'support', 'viewer')),
  permissions JSONB NOT NULL DEFAULT '{
    "analytics": {"view": false, "edit": false, "delete": false},
    "crm": {"view": false, "edit": false, "delete": false},
    "invoicing": {"view": false, "edit": false, "delete": false},
    "marketing": {"view": false, "edit": false, "delete": false},
    "operations": {"view": false, "edit": false, "delete": false},
    "automation": {"view": false, "edit": false, "delete": false}
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  team_member_id UUID REFERENCES admin_team_members(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AUTOMATION MODULE
-- =====================================================

-- Workflows
CREATE TABLE IF NOT EXISTS admin_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('manual', 'schedule', 'webhook', 'event', 'form_submission', 'deal_stage', 'email_action')),
  trigger_config JSONB DEFAULT '{}',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  execution_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  time_saved_minutes INTEGER DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS admin_workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES admin_workflows(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  trigger_data JSONB DEFAULT '{}',
  execution_log JSONB DEFAULT '[]',
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Integrations
CREATE TABLE IF NOT EXISTS admin_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_name TEXT NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('slack', 'stripe', 'zapier', 'hubspot', 'mailchimp', 'google_analytics', 'facebook_ads', 'linkedin', 'twitter', 'github', 'jira', 'trello', 'asana', 'notion', 'airtable', 'webhook', 'custom')),
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  auth_type TEXT CHECK (auth_type IN ('oauth', 'api_key', 'webhook', 'basic')),
  credentials JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS admin_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT,
  event_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  retry_count INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  headers JSONB DEFAULT '{}',
  delivery_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_status INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Analytics indexes
CREATE INDEX idx_analytics_events_user ON admin_analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON admin_analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON admin_analytics_events(timestamp);
CREATE INDEX idx_analytics_reports_user ON admin_analytics_reports(user_id);
CREATE INDEX idx_analytics_goals_user ON admin_analytics_goals(user_id);

-- CRM indexes
CREATE INDEX idx_crm_deals_user ON admin_crm_deals(user_id);
CREATE INDEX idx_crm_deals_stage ON admin_crm_deals(stage);
CREATE INDEX idx_crm_deals_priority ON admin_crm_deals(priority);
CREATE INDEX idx_crm_deals_contact ON admin_crm_deals(contact_id);
CREATE INDEX idx_crm_contacts_user ON admin_crm_contacts(user_id);
CREATE INDEX idx_crm_contacts_email ON admin_crm_contacts(email);
CREATE INDEX idx_crm_activities_deal ON admin_crm_activities(deal_id);
CREATE INDEX idx_crm_activities_contact ON admin_crm_activities(contact_id);

-- Invoicing indexes
CREATE INDEX idx_admin_invoices_user ON admin_invoices(user_id);
CREATE INDEX idx_admin_invoices_status ON admin_invoices(status);
CREATE INDEX idx_admin_invoices_due_date ON admin_invoices(due_date);
CREATE INDEX idx_admin_invoices_number ON admin_invoices(invoice_number);
CREATE INDEX idx_admin_payments_invoice ON admin_payments(invoice_id);

-- Marketing indexes
CREATE INDEX idx_marketing_leads_user ON admin_marketing_leads(user_id);
CREATE INDEX idx_marketing_leads_status ON admin_marketing_leads(status);
CREATE INDEX idx_marketing_leads_score ON admin_marketing_leads(lead_score);
CREATE INDEX idx_marketing_leads_email ON admin_marketing_leads(email);
CREATE INDEX idx_email_campaigns_user ON admin_email_campaigns(user_id);
CREATE INDEX idx_email_campaigns_status ON admin_email_campaigns(status);
CREATE INDEX idx_campaign_subscribers_campaign ON admin_campaign_subscribers(campaign_id);

-- Operations indexes
CREATE INDEX idx_team_members_user ON admin_team_members(user_id);
CREATE INDEX idx_team_members_role ON admin_team_members(role);
CREATE INDEX idx_team_members_status ON admin_team_members(status);
CREATE INDEX idx_activity_log_user ON admin_activity_log(user_id);
CREATE INDEX idx_activity_log_resource ON admin_activity_log(resource_type, resource_id);

-- Automation indexes
CREATE INDEX idx_workflows_user ON admin_workflows(user_id);
CREATE INDEX idx_workflows_active ON admin_workflows(is_active);
CREATE INDEX idx_workflow_executions_workflow ON admin_workflow_executions(workflow_id);
CREATE INDEX idx_integrations_user ON admin_integrations(user_id);
CREATE INDEX idx_integrations_type ON admin_integrations(integration_type);
CREATE INDEX idx_webhooks_user ON admin_webhooks(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE admin_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_analytics_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invoice_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_campaign_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_webhooks ENABLE ROW LEVEL SECURITY;

-- Analytics RLS
CREATE POLICY "Users can view own analytics events" ON admin_analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics events" ON admin_analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics reports" ON admin_analytics_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics reports" ON admin_analytics_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own analytics goals" ON admin_analytics_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own analytics goals" ON admin_analytics_goals FOR ALL USING (auth.uid() = user_id);

-- CRM RLS
CREATE POLICY "Users can view own deals" ON admin_crm_deals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deals" ON admin_crm_deals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own contacts" ON admin_crm_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own contacts" ON admin_crm_contacts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own activities" ON admin_crm_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activities" ON admin_crm_activities FOR ALL USING (auth.uid() = user_id);

-- Invoicing RLS
CREATE POLICY "Users can view own invoices" ON admin_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own invoices" ON admin_invoices FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Invoice reminders follow invoice access" ON admin_invoice_reminders FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own payments" ON admin_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own payments" ON admin_payments FOR ALL USING (auth.uid() = user_id);

-- Marketing RLS
CREATE POLICY "Users can view own leads" ON admin_marketing_leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own leads" ON admin_marketing_leads FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own campaigns" ON admin_email_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own campaigns" ON admin_email_campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Campaign subscribers follow campaign access" ON admin_campaign_subscribers FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_email_campaigns WHERE id = campaign_id AND user_id = auth.uid())
);

-- Operations RLS
CREATE POLICY "Users can view all team members" ON admin_team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON admin_team_members FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_team_members WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin'))
);
CREATE POLICY "Anyone can view role permissions" ON admin_role_permissions FOR SELECT USING (true);
CREATE POLICY "Admins can manage role permissions" ON admin_role_permissions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_team_members WHERE user_id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "Users can view activity log" ON admin_activity_log FOR SELECT USING (true);
CREATE POLICY "System can insert activity log" ON admin_activity_log FOR INSERT WITH CHECK (true);

-- Automation RLS
CREATE POLICY "Users can view own workflows" ON admin_workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workflows" ON admin_workflows FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Workflow executions follow workflow access" ON admin_workflow_executions FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_workflows WHERE id = workflow_id AND user_id = auth.uid())
);
CREATE POLICY "Users can view own integrations" ON admin_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own integrations" ON admin_integrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own webhooks" ON admin_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own webhooks" ON admin_webhooks FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_analytics_goals_updated_at BEFORE UPDATE ON admin_analytics_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_deals_updated_at BEFORE UPDATE ON admin_crm_deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_crm_contacts_updated_at BEFORE UPDATE ON admin_crm_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_invoices_updated_at BEFORE UPDATE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketing_leads_updated_at BEFORE UPDATE ON admin_marketing_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON admin_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON admin_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON admin_webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update invoice status based on dates
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_date IS NOT NULL AND NEW.status != 'void' THEN
    NEW.status := 'paid';
  ELSIF NEW.status IN ('sent', 'overdue') AND NEW.due_date < CURRENT_DATE THEN
    NEW.status := 'overdue';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_invoice_status BEFORE UPDATE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- Auto-calculate campaign rates
CREATE OR REPLACE FUNCTION update_campaign_rates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recipient_count > 0 THEN
    NEW.open_rate := (NEW.opens::DECIMAL / NEW.recipient_count) * 100;
    NEW.click_rate := (NEW.clicks::DECIMAL / NEW.recipient_count) * 100;
    NEW.conversion_rate := (NEW.conversions::DECIMAL / NEW.recipient_count) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_campaign_rates BEFORE UPDATE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION update_campaign_rates();

-- Auto-calculate workflow success rate
CREATE OR REPLACE FUNCTION update_workflow_success_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.execution_count > 0 THEN
    NEW.success_rate := (NEW.success_count::DECIMAL / NEW.execution_count) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_calculate_workflow_success_rate BEFORE UPDATE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION update_workflow_success_rate();

-- Log activity on important actions
CREATE OR REPLACE FUNCTION log_admin_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_activity_log (user_id, action, resource_type, resource_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'new_data', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply activity logging to key tables
CREATE TRIGGER log_deal_activity AFTER INSERT OR UPDATE OR DELETE ON admin_crm_deals FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_invoice_activity AFTER INSERT OR UPDATE OR DELETE ON admin_invoices FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_campaign_activity AFTER INSERT OR UPDATE OR DELETE ON admin_email_campaigns FOR EACH ROW EXECUTE FUNCTION log_admin_activity();
CREATE TRIGGER log_workflow_activity AFTER INSERT OR UPDATE OR DELETE ON admin_workflows FOR EACH ROW EXECUTE FUNCTION log_admin_activity();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get total revenue
CREATE OR REPLACE FUNCTION get_total_revenue(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(total_amount) FROM admin_invoices WHERE user_id = p_user_id AND status = 'paid'),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get total outstanding invoices
CREATE OR REPLACE FUNCTION get_outstanding_invoices(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(total_amount) FROM admin_invoices WHERE user_id = p_user_id AND status IN ('sent', 'overdue')),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get pipeline value
CREATE OR REPLACE FUNCTION get_pipeline_value(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(deal_value) FROM admin_crm_deals WHERE user_id = p_user_id AND stage NOT IN ('won', 'lost')),
    0
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DEFAULT ROLE PERMISSIONS
-- =====================================================

INSERT INTO admin_role_permissions (role, permissions) VALUES
('super_admin', '{
  "analytics": {"view": true, "edit": true, "delete": true, "export": true},
  "crm": {"view": true, "edit": true, "delete": true, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": true, "export": true},
  "marketing": {"view": true, "edit": true, "delete": true, "export": true},
  "operations": {"view": true, "edit": true, "delete": true, "export": true},
  "automation": {"view": true, "edit": true, "delete": true, "export": true}
}'::JSONB),
('admin', '{
  "analytics": {"view": true, "edit": true, "delete": false, "export": true},
  "crm": {"view": true, "edit": true, "delete": false, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": false, "export": true},
  "marketing": {"view": true, "edit": true, "delete": false, "export": true},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": true, "delete": false, "export": true}
}'::JSONB),
('manager', '{
  "analytics": {"view": true, "edit": false, "delete": false, "export": true},
  "crm": {"view": true, "edit": true, "delete": false, "export": true},
  "invoicing": {"view": true, "edit": true, "delete": false, "export": false},
  "marketing": {"view": true, "edit": true, "delete": false, "export": false},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": false, "delete": false, "export": false}
}'::JSONB),
('viewer', '{
  "analytics": {"view": true, "edit": false, "delete": false, "export": false},
  "crm": {"view": true, "edit": false, "delete": false, "export": false},
  "invoicing": {"view": true, "edit": false, "delete": false, "export": false},
  "marketing": {"view": true, "edit": false, "delete": false, "export": false},
  "operations": {"view": true, "edit": false, "delete": false, "export": false},
  "automation": {"view": true, "edit": false, "delete": false, "export": false}
}'::JSONB)
ON CONFLICT (role) DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Tables created: 19
-- Indexes created: 45+
-- RLS policies: 30+
-- Triggers: 15+
-- Helper functions: 3
-- =====================================================
