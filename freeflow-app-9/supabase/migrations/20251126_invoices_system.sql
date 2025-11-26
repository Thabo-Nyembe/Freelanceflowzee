-- SESSION_14: INVOICES SYSTEM - Production Database Schema
-- World-class invoicing and billing with templates, payments, recurring invoices

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('bank_transfer', 'credit_card', 'paypal', 'stripe', 'cash', 'check', 'crypto', 'other');
CREATE TYPE template_layout AS ENUM ('modern', 'classic', 'minimal', 'professional', 'creative');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');

-- TABLES
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address JSONB,
  project_id UUID,
  project_name TEXT,
  subtotal NUMERIC(12,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  discount_rate NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  issue_date TIMESTAMPTZ NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  paid_date TIMESTAMPTZ,
  status invoice_status DEFAULT 'draft',
  payment_method payment_method,
  description TEXT,
  notes TEXT,
  terms TEXT,
  template_id UUID,
  views INTEGER DEFAULT 0,
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  rate NUMERIC(12,2) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  taxable BOOLEAN DEFAULT TRUE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout template_layout DEFAULT 'professional',
  colors JSONB NOT NULL,
  logo TEXT,
  header_text TEXT,
  footer_text TEXT,
  show_logo BOOLEAN DEFAULT TRUE,
  show_header BOOLEAN DEFAULT TRUE,
  show_footer BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method payment_method NOT NULL,
  transaction_id TEXT,
  paid_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_invoice_id UUID NOT NULL REFERENCES invoices(id),
  client_id UUID,
  frequency recurring_frequency NOT NULL,
  interval INTEGER DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  next_invoice_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  generated_count INTEGER DEFAULT 0,
  max_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_client_name ON invoices(client_name);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_recurring_user_id ON recurring_invoices(user_id);

-- RLS POLICIES
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own invoices" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own invoices" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own invoices" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users view own items" ON invoice_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own items" ON invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);

CREATE POLICY "Users view own templates" ON invoice_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own templates" ON invoice_templates FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage own payments" ON payments FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users view own recurring" ON recurring_invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recurring" ON recurring_invoices FOR ALL USING (auth.uid() = user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoice_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_updated_at();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION get_invoice_analytics(user_uuid UUID)
RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'total_invoices', COUNT(*),
    'paid_amount', COALESCE(SUM(CASE WHEN status = 'paid' THEN total ELSE 0 END), 0),
    'pending_amount', COALESCE(SUM(CASE WHEN status IN ('pending','sent') THEN total ELSE 0 END), 0),
    'overdue_amount', COALESCE(SUM(CASE WHEN status = 'overdue' THEN total ELSE 0 END), 0)
  ) INTO result FROM invoices WHERE user_id = user_uuid;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE invoices IS 'Invoices with comprehensive tracking';
COMMENT ON TABLE invoice_templates IS 'Customizable invoice templates';
COMMENT ON TABLE payments IS 'Payment records linked to invoices';
COMMENT ON TABLE recurring_invoices IS 'Automated recurring invoice generation';
