-- Minimal Invoicing Schema for Invoice & Billing Management
--
-- This schema creates tables for invoices, payments, templates, and reminders.
-- Supports full invoicing workflow: draft → sent → paid

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS invoice_reminders CASCADE;
DROP TABLE IF EXISTS invoice_payments CASCADE;
DROP TABLE IF EXISTS invoice_templates CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- ENUMs
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'paypal', 'stripe', 'crypto', 'cash', 'check');

-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL,

  -- Client information
  client_id UUID, -- Can be NULL for ad-hoc clients
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address JSONB DEFAULT '{}',

  -- Invoice items (stored as JSON array)
  items JSONB NOT NULL DEFAULT '[]',

  -- Financial details
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Status and dates
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,

  -- Payment information
  payment_method payment_method,
  payment_reference TEXT,

  -- Additional info
  notes TEXT,
  terms TEXT,
  pdf_url TEXT,

  -- Recurring configuration
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_config JSONB DEFAULT '{}',

  -- Metadata
  reminders_sent INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Invoice Payments Table (for tracking payments on invoices)
CREATE TABLE invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'completed',

  -- Transaction details
  transaction_id TEXT,
  processing_fee DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,

  -- Payment tracking
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,

  -- Refund details
  refund_id TEXT,
  refund_amount DECIMAL(10, 2),
  refund_reason TEXT,
  refund_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Templates Table (for reusable invoice templates)
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,

  -- Template items (stored as JSON array)
  items JSONB NOT NULL DEFAULT '[]',

  -- Default values
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  terms TEXT,
  notes TEXT,

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Reminders Table (for automated payment reminders)
CREATE TABLE invoice_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reminder type and timing
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('before_due', 'on_due', 'after_due')),
  days_offset INTEGER NOT NULL, -- Days before/after due date

  -- Reminder status
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ,
  opened BOOLEAN DEFAULT FALSE,
  opened_at TIMESTAMPTZ,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Invoices
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_client_name ON invoices(client_name);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_total ON invoices(total DESC);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);

-- Indexes for Invoice Payments
CREATE INDEX idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX idx_invoice_payments_user_id ON invoice_payments(user_id);
CREATE INDEX idx_invoice_payments_status ON invoice_payments(status);
CREATE INDEX idx_invoice_payments_payment_date ON invoice_payments(payment_date DESC);
CREATE INDEX idx_invoice_payments_created_at ON invoice_payments(created_at DESC);

-- Indexes for Invoice Templates
CREATE INDEX idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_invoice_templates_name ON invoice_templates(name);
CREATE INDEX idx_invoice_templates_usage_count ON invoice_templates(usage_count DESC);
CREATE INDEX idx_invoice_templates_created_at ON invoice_templates(created_at DESC);

-- Indexes for Invoice Reminders
CREATE INDEX idx_invoice_reminders_invoice_id ON invoice_reminders(invoice_id);
CREATE INDEX idx_invoice_reminders_user_id ON invoice_reminders(user_id);
CREATE INDEX idx_invoice_reminders_status ON invoice_reminders(status);
CREATE INDEX idx_invoice_reminders_sent ON invoice_reminders(sent);

-- Helper function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(
  p_user_id UUID,
  p_prefix TEXT DEFAULT 'INV'
) RETURNS TEXT AS $$
DECLARE
  v_count INTEGER;
  v_year TEXT;
  v_invoice_number TEXT;
BEGIN
  -- Get current year
  v_year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Get count of invoices for this user this year
  SELECT COUNT(*) INTO v_count
  FROM invoices
  WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

  -- Generate invoice number: PREFIX-YYYY-NNNN
  v_invoice_number := p_prefix || '-' || v_year || '-' || LPAD((v_count + 1)::TEXT, 4, '0');

  RETURN v_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Helper function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_total(
  p_subtotal DECIMAL,
  p_tax_rate DECIMAL,
  p_discount DECIMAL
) RETURNS JSONB AS $$
DECLARE
  v_tax_amount DECIMAL;
  v_total DECIMAL;
BEGIN
  -- Calculate tax amount
  v_tax_amount := ROUND((p_subtotal * p_tax_rate / 100)::NUMERIC, 2);

  -- Calculate total
  v_total := ROUND((p_subtotal + v_tax_amount - p_discount)::NUMERIC, 2);

  RETURN jsonb_build_object(
    'taxAmount', v_tax_amount,
    'total', v_total
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to get overdue invoices
CREATE OR REPLACE FUNCTION get_overdue_invoices(
  p_user_id UUID
) RETURNS TABLE (
  invoice_id UUID,
  invoice_number TEXT,
  client_name TEXT,
  total DECIMAL,
  due_date DATE,
  days_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.id,
    i.invoice_number,
    i.client_name,
    i.total,
    i.due_date,
    (CURRENT_DATE - i.due_date)::INTEGER as days_overdue
  FROM invoices i
  WHERE i.user_id = p_user_id
    AND i.status IN ('sent', 'viewed', 'overdue')
    AND i.due_date < CURRENT_DATE
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_payments_updated_at BEFORE UPDATE ON invoice_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON invoice_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-update invoice status to overdue
CREATE OR REPLACE FUNCTION update_invoice_overdue_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update invoices to overdue if due date has passed
  UPDATE invoices
  SET status = 'overdue'
  WHERE status IN ('sent', 'viewed')
    AND due_date < CURRENT_DATE;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (this would ideally run on a schedule via pg_cron or external job)
-- For now, it updates on any invoice insert/update
CREATE TRIGGER check_invoice_overdue_on_write
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_invoice_overdue_status();
