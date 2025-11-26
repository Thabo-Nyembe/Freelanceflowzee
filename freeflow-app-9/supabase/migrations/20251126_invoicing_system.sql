-- ============================================================================
-- Invoicing System - Production Database Schema
-- ============================================================================
-- Comprehensive invoicing and billing management with recurring invoices,
-- payment tracking, templates, and revenue analytics
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'cash', 'check', 'crypto');
CREATE TYPE billing_cycle AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE tax_type AS ENUM ('percentage', 'fixed');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_address TEXT,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_type discount_type,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,
  notes TEXT,
  terms TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recurring Invoices
CREATE TABLE recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  cycle billing_cycle NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  next_invoice_date DATE,
  occurrences INTEGER,
  current_occurrence INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  reference TEXT,
  paid_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Invoice Templates
CREATE TABLE invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  default_terms TEXT,
  default_notes TEXT,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Template Items
CREATE TABLE template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES invoice_templates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing Stats
CREATE TABLE billing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  overdue_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  average_invoice_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_invoices INTEGER NOT NULL DEFAULT 0,
  paid_invoices INTEGER NOT NULL DEFAULT 0,
  pending_invoices INTEGER NOT NULL DEFAULT 0,
  overdue_invoices INTEGER NOT NULL DEFAULT 0,
  cancelled_invoices INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Invoices indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_metadata ON invoices USING GIN(metadata);

-- Invoice Items indexes
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Recurring Invoices indexes
CREATE INDEX idx_recurring_invoices_invoice_id ON recurring_invoices(invoice_id);
CREATE INDEX idx_recurring_invoices_next_date ON recurring_invoices(next_invoice_date);
CREATE INDEX idx_recurring_invoices_enabled ON recurring_invoices(enabled) WHERE enabled = TRUE;

-- Payments indexes
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_paid_at ON payments(paid_at DESC);

-- Invoice Templates indexes
CREATE INDEX idx_invoice_templates_user_id ON invoice_templates(user_id);
CREATE INDEX idx_invoice_templates_is_default ON invoice_templates(is_default);

-- Template Items indexes
CREATE INDEX idx_template_items_template_id ON template_items(template_id);

-- Billing Stats indexes
CREATE INDEX idx_billing_stats_user_id ON billing_stats(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_templates_updated_at
  BEFORE UPDATE ON invoice_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_stats_updated_at
  BEFORE UPDATE ON billing_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate item totals
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_invoice_item_total
  BEFORE INSERT OR UPDATE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

CREATE TRIGGER calculate_template_item_total
  BEFORE INSERT OR UPDATE ON template_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Auto-calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_subtotal DECIMAL(12, 2);
BEGIN
  -- Calculate subtotal from items
  SELECT COALESCE(SUM(total), 0)
  INTO v_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.id;

  NEW.subtotal = v_subtotal;
  NEW.tax_amount = (v_subtotal - NEW.discount) * (NEW.tax_rate / 100);
  NEW.total = v_subtotal + NEW.tax_amount - NEW.discount;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update billing stats
CREATE OR REPLACE FUNCTION update_billing_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO billing_stats (user_id)
  VALUES (COALESCE(NEW.user_id, OLD.user_id))
  ON CONFLICT (user_id) DO UPDATE SET
    total_revenue = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'paid'
    ),
    pending_amount = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status IN ('sent', 'viewed')
    ),
    overdue_amount = (
      SELECT COALESCE(SUM(total), 0)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'overdue'
    ),
    total_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id
    ),
    paid_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'paid'
    ),
    pending_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status IN ('sent', 'viewed')
    ),
    overdue_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'overdue'
    ),
    cancelled_invoices = (
      SELECT COUNT(*)
      FROM invoices
      WHERE user_id = EXCLUDED.user_id AND status = 'cancelled'
    ),
    average_invoice_value = (
      SELECT CASE WHEN COUNT(*) > 0
        THEN ROUND(COALESCE(SUM(total), 0) / COUNT(*), 2)
        ELSE 0
      END
      FROM invoices
      WHERE user_id = EXCLUDED.user_id
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_stats();

-- Auto-mark invoices as overdue
CREATE OR REPLACE FUNCTION mark_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue', updated_at = NOW()
  WHERE status IN ('sent', 'viewed')
    AND due_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get invoice totals
CREATE OR REPLACE FUNCTION get_invoice_totals(p_invoice_id UUID)
RETURNS TABLE(
  subtotal DECIMAL,
  tax_amount DECIMAL,
  total DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.subtotal, i.tax_amount, i.total
  FROM invoices i
  WHERE i.id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Get outstanding invoices
CREATE OR REPLACE FUNCTION get_outstanding_invoices(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  invoice_number TEXT,
  client_name TEXT,
  total DECIMAL,
  due_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.invoice_number, i.client_name, i.total, i.due_date
  FROM invoices i
  WHERE i.user_id = p_user_id
    AND i.status NOT IN ('paid', 'cancelled')
  ORDER BY i.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Calculate revenue for period
CREATE OR REPLACE FUNCTION calculate_revenue(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(12, 2) AS $$
DECLARE
  v_revenue DECIMAL(12, 2);
BEGIN
  SELECT COALESCE(SUM(total), 0)
  INTO v_revenue
  FROM invoices
  WHERE user_id = p_user_id
    AND status = 'paid'
    AND (p_start_date IS NULL OR paid_date >= p_start_date)
    AND (p_end_date IS NULL OR paid_date <= p_end_date);

  RETURN v_revenue;
END;
$$ LANGUAGE plpgsql;

-- Generate next invoice from recurring
CREATE OR REPLACE FUNCTION generate_recurring_invoice(p_recurring_id UUID)
RETURNS UUID AS $$
DECLARE
  v_original_invoice invoices%ROWTYPE;
  v_recurring recurring_invoices%ROWTYPE;
  v_new_invoice_id UUID;
  v_new_invoice_number TEXT;
BEGIN
  -- Get recurring config
  SELECT * INTO v_recurring FROM recurring_invoices WHERE id = p_recurring_id;

  IF NOT FOUND OR NOT v_recurring.enabled THEN
    RETURN NULL;
  END IF;

  -- Get original invoice
  SELECT * INTO v_original_invoice FROM invoices WHERE id = v_recurring.invoice_id;

  -- Generate new invoice number
  v_new_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY-MM-') || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');

  -- Create new invoice
  INSERT INTO invoices (
    user_id, invoice_number, client_id, client_name, client_email,
    client_address, tax_rate, discount, discount_type, currency,
    status, issue_date, due_date, notes, terms
  )
  VALUES (
    v_original_invoice.user_id, v_new_invoice_number, v_original_invoice.client_id,
    v_original_invoice.client_name, v_original_invoice.client_email,
    v_original_invoice.client_address, v_original_invoice.tax_rate,
    v_original_invoice.discount, v_original_invoice.discount_type,
    v_original_invoice.currency, 'draft', CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days', v_original_invoice.notes,
    v_original_invoice.terms
  )
  RETURNING id INTO v_new_invoice_id;

  -- Copy items
  INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
  SELECT v_new_invoice_id, description, quantity, unit_price
  FROM invoice_items
  WHERE invoice_id = v_recurring.invoice_id;

  -- Update recurring config
  UPDATE recurring_invoices
  SET
    current_occurrence = current_occurrence + 1,
    next_invoice_date = CASE v_recurring.cycle
      WHEN 'weekly' THEN next_invoice_date + INTERVAL '7 days'
      WHEN 'monthly' THEN next_invoice_date + INTERVAL '1 month'
      WHEN 'quarterly' THEN next_invoice_date + INTERVAL '3 months'
      WHEN 'yearly' THEN next_invoice_date + INTERVAL '1 year'
      ELSE next_invoice_date
    END,
    updated_at = NOW()
  WHERE id = p_recurring_id;

  RETURN v_new_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_stats ENABLE ROW LEVEL SECURITY;

-- Invoices policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own invoices"
  ON invoices FOR ALL
  USING (auth.uid() = user_id);

-- Invoice Items policies
CREATE POLICY "Users can view items of their invoices"
  ON invoice_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage items of their invoices"
  ON invoice_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = invoice_items.invoice_id AND user_id = auth.uid()
  ));

-- Recurring Invoices policies
CREATE POLICY "Users can manage their recurring invoices"
  ON recurring_invoices FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices WHERE id = recurring_invoices.invoice_id AND user_id = auth.uid()
  ));

-- Payments policies
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their payments"
  ON payments FOR ALL
  USING (auth.uid() = user_id);

-- Invoice Templates policies
CREATE POLICY "Users can manage their templates"
  ON invoice_templates FOR ALL
  USING (auth.uid() = user_id);

-- Template Items policies
CREATE POLICY "Users can manage their template items"
  ON template_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoice_templates WHERE id = template_items.template_id AND user_id = auth.uid()
  ));

-- Billing Stats policies
CREATE POLICY "Users can view their own stats"
  ON billing_stats FOR SELECT
  USING (auth.uid() = user_id);
