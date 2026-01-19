-- ============================================================================
-- FreeFlow A+++ Implementation: Recurring Invoices System
-- Migration: 20260119000001_recurring_invoices.sql
-- Description: Complete recurring invoices schema with templates, schedules,
--              auto-generation, and execution history
-- ============================================================================

-- ============ Enum Types ============

-- Frequency type for recurring schedules
CREATE TYPE recurring_frequency AS ENUM (
  'daily',
  'weekly',
  'biweekly',
  'monthly',
  'quarterly',
  'biannually',
  'annually',
  'custom'
);

-- Status for recurring invoice templates
CREATE TYPE recurring_template_status AS ENUM (
  'active',
  'paused',
  'completed',
  'cancelled'
);

-- Execution status for generated invoices
CREATE TYPE recurring_execution_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'skipped'
);

-- ============ Recurring Invoice Templates ============

CREATE TABLE IF NOT EXISTS recurring_invoice_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Template identification
  template_name VARCHAR(255) NOT NULL,
  template_code VARCHAR(50),
  description TEXT,

  -- Client association
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_address TEXT,

  -- Schedule configuration
  frequency recurring_frequency NOT NULL DEFAULT 'monthly',
  custom_interval_days INTEGER, -- For custom frequency

  -- Date configuration
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = no end date
  next_run_date DATE NOT NULL,
  last_run_date DATE,

  -- Day of week/month for scheduling
  day_of_week INTEGER, -- 0-6 (Sunday-Saturday) for weekly
  day_of_month INTEGER, -- 1-31 for monthly
  month_of_year INTEGER, -- 1-12 for annual

  -- Invoice details
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  currency VARCHAR(3) DEFAULT 'USD',
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) DEFAULT 0,

  -- Payment terms
  payment_terms_days INTEGER DEFAULT 30,
  late_fee_enabled BOOLEAN DEFAULT false,
  late_fee_percentage DECIMAL(5, 2) DEFAULT 0,
  late_fee_grace_days INTEGER DEFAULT 0,

  -- Amounts (calculated from line items)
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Delivery options
  auto_send BOOLEAN DEFAULT false,
  send_days_before INTEGER DEFAULT 0, -- Days before due date to send
  cc_emails TEXT[], -- Additional email recipients
  bcc_emails TEXT[],

  -- Email customization
  email_subject_template TEXT,
  email_body_template TEXT,

  -- Notes and terms
  notes TEXT,
  terms_and_conditions TEXT,

  -- Stripe integration
  stripe_price_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),

  -- Status and metadata
  status recurring_template_status DEFAULT 'active',
  total_invoices_generated INTEGER DEFAULT 0,
  total_amount_invoiced DECIMAL(14, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  CONSTRAINT valid_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  CONSTRAINT valid_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  CONSTRAINT valid_month_of_year CHECK (month_of_year IS NULL OR (month_of_year >= 1 AND month_of_year <= 12)),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============ Recurring Invoice Line Items ============

CREATE TABLE IF NOT EXISTS recurring_invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES recurring_invoice_templates(id) ON DELETE CASCADE,

  -- Item details
  item_name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Pricing
  quantity DECIMAL(10, 3) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  unit VARCHAR(50), -- 'hour', 'unit', 'project', etc.

  -- Tax
  taxable BOOLEAN DEFAULT true,
  tax_rate DECIMAL(5, 2),

  -- Discount
  discount_type VARCHAR(20), -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) DEFAULT 0,

  -- Calculated amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,

  -- Ordering
  sort_order INTEGER DEFAULT 0,

  -- Service/product reference
  service_id UUID,
  product_id UUID,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Recurring Invoice Executions ============

CREATE TABLE IF NOT EXISTS recurring_invoice_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES recurring_invoice_templates(id) ON DELETE CASCADE,

  -- Execution details
  scheduled_date DATE NOT NULL,
  executed_at TIMESTAMPTZ,

  -- Status
  status recurring_execution_status DEFAULT 'pending',

  -- Generated invoice reference
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50),

  -- Amounts at time of generation
  subtotal DECIMAL(12, 2),
  tax_amount DECIMAL(12, 2),
  discount_amount DECIMAL(12, 2),
  total_amount DECIMAL(12, 2),

  -- Delivery status
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMPTZ,
  email_recipients TEXT[],

  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Recurring Invoice Modifications ============

CREATE TABLE IF NOT EXISTS recurring_invoice_modifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES recurring_invoice_templates(id) ON DELETE CASCADE,

  -- Modification details
  modification_type VARCHAR(50) NOT NULL, -- 'pause', 'resume', 'update', 'skip', etc.
  effective_date DATE,

  -- Previous values (for audit)
  previous_values JSONB,
  new_values JSONB,

  -- User who made the change
  modified_by UUID REFERENCES auth.users(id),
  reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Indexes ============

-- Template indexes
CREATE INDEX idx_recurring_templates_user ON recurring_invoice_templates(user_id);
CREATE INDEX idx_recurring_templates_client ON recurring_invoice_templates(client_id);
CREATE INDEX idx_recurring_templates_status ON recurring_invoice_templates(status);
CREATE INDEX idx_recurring_templates_next_run ON recurring_invoice_templates(next_run_date)
  WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_recurring_templates_frequency ON recurring_invoice_templates(frequency);

-- Line items indexes
CREATE INDEX idx_recurring_line_items_template ON recurring_invoice_line_items(template_id);
CREATE INDEX idx_recurring_line_items_sort ON recurring_invoice_line_items(template_id, sort_order);

-- Executions indexes
CREATE INDEX idx_recurring_executions_template ON recurring_invoice_executions(template_id);
CREATE INDEX idx_recurring_executions_status ON recurring_invoice_executions(status);
CREATE INDEX idx_recurring_executions_scheduled ON recurring_invoice_executions(scheduled_date);
CREATE INDEX idx_recurring_executions_pending ON recurring_invoice_executions(status, scheduled_date)
  WHERE status = 'pending';

-- Modifications indexes
CREATE INDEX idx_recurring_modifications_template ON recurring_invoice_modifications(template_id);
CREATE INDEX idx_recurring_modifications_date ON recurring_invoice_modifications(created_at);

-- ============ Functions ============

-- Function to calculate next run date based on frequency
CREATE OR REPLACE FUNCTION calculate_next_run_date(
  p_current_date DATE,
  p_frequency recurring_frequency,
  p_custom_interval INTEGER DEFAULT NULL,
  p_day_of_week INTEGER DEFAULT NULL,
  p_day_of_month INTEGER DEFAULT NULL,
  p_month_of_year INTEGER DEFAULT NULL
) RETURNS DATE AS $$
DECLARE
  v_next_date DATE;
BEGIN
  CASE p_frequency
    WHEN 'daily' THEN
      v_next_date := p_current_date + INTERVAL '1 day';

    WHEN 'weekly' THEN
      v_next_date := p_current_date + INTERVAL '1 week';
      IF p_day_of_week IS NOT NULL THEN
        v_next_date := v_next_date + (p_day_of_week - EXTRACT(DOW FROM v_next_date))::INTEGER;
        IF v_next_date <= p_current_date THEN
          v_next_date := v_next_date + INTERVAL '1 week';
        END IF;
      END IF;

    WHEN 'biweekly' THEN
      v_next_date := p_current_date + INTERVAL '2 weeks';

    WHEN 'monthly' THEN
      v_next_date := p_current_date + INTERVAL '1 month';
      IF p_day_of_month IS NOT NULL THEN
        v_next_date := DATE_TRUNC('month', v_next_date) + (p_day_of_month - 1) * INTERVAL '1 day';
        -- Handle months with fewer days
        IF EXTRACT(DAY FROM v_next_date) != p_day_of_month THEN
          v_next_date := DATE_TRUNC('month', v_next_date) + INTERVAL '1 month' - INTERVAL '1 day';
        END IF;
      END IF;

    WHEN 'quarterly' THEN
      v_next_date := p_current_date + INTERVAL '3 months';

    WHEN 'biannually' THEN
      v_next_date := p_current_date + INTERVAL '6 months';

    WHEN 'annually' THEN
      v_next_date := p_current_date + INTERVAL '1 year';
      IF p_month_of_year IS NOT NULL AND p_day_of_month IS NOT NULL THEN
        v_next_date := MAKE_DATE(
          EXTRACT(YEAR FROM v_next_date)::INTEGER,
          p_month_of_year,
          LEAST(p_day_of_month,
            EXTRACT(DAY FROM (DATE_TRUNC('month', MAKE_DATE(EXTRACT(YEAR FROM v_next_date)::INTEGER, p_month_of_year, 1)) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER
          )
        );
      END IF;

    WHEN 'custom' THEN
      IF p_custom_interval IS NOT NULL THEN
        v_next_date := p_current_date + (p_custom_interval || ' days')::INTERVAL;
      ELSE
        v_next_date := p_current_date + INTERVAL '1 month';
      END IF;

    ELSE
      v_next_date := p_current_date + INTERVAL '1 month';
  END CASE;

  RETURN v_next_date;
END;
$$ LANGUAGE plpgsql;

-- Function to update template totals from line items
CREATE OR REPLACE FUNCTION update_recurring_template_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recurring_invoice_templates
  SET
    subtotal = COALESCE((
      SELECT SUM(subtotal)
      FROM recurring_invoice_line_items
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ), 0),
    tax_amount = COALESCE((
      SELECT SUM(tax_amount)
      FROM recurring_invoice_line_items
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ), 0),
    discount_amount = COALESCE((
      SELECT SUM(discount_amount)
      FROM recurring_invoice_line_items
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ), 0),
    total_amount = COALESCE((
      SELECT SUM(total)
      FROM recurring_invoice_line_items
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ), 0),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for line item changes
CREATE TRIGGER trigger_update_recurring_totals
  AFTER INSERT OR UPDATE OR DELETE ON recurring_invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION update_recurring_template_totals();

-- Function to update template after successful execution
CREATE OR REPLACE FUNCTION update_template_after_execution()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE recurring_invoice_templates
    SET
      last_run_date = NEW.scheduled_date,
      next_run_date = calculate_next_run_date(
        NEW.scheduled_date,
        frequency,
        custom_interval_days,
        day_of_week,
        day_of_month,
        month_of_year
      ),
      total_invoices_generated = total_invoices_generated + 1,
      total_amount_invoiced = total_amount_invoiced + COALESCE(NEW.total_amount, 0),
      updated_at = NOW()
    WHERE id = NEW.template_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for execution completion
CREATE TRIGGER trigger_update_template_on_execution
  AFTER UPDATE ON recurring_invoice_executions
  FOR EACH ROW
  EXECUTE FUNCTION update_template_after_execution();

-- ============ Row Level Security ============

ALTER TABLE recurring_invoice_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoice_modifications ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Users can view own templates"
  ON recurring_invoice_templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates"
  ON recurring_invoice_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON recurring_invoice_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON recurring_invoice_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Line items policies (inherit from template)
CREATE POLICY "Users can view own line items"
  ON recurring_invoice_line_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own line items"
  ON recurring_invoice_line_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own line items"
  ON recurring_invoice_line_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own line items"
  ON recurring_invoice_line_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

-- Executions policies
CREATE POLICY "Users can view own executions"
  ON recurring_invoice_executions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

-- Modifications policies
CREATE POLICY "Users can view own modifications"
  ON recurring_invoice_modifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recurring_invoice_templates t
    WHERE t.id = template_id AND t.user_id = auth.uid()
  ));

-- ============ Service Role Policies ============

CREATE POLICY "Service role full access to templates"
  ON recurring_invoice_templates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to line items"
  ON recurring_invoice_line_items FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to executions"
  ON recurring_invoice_executions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to modifications"
  ON recurring_invoice_modifications FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============ Comments ============

COMMENT ON TABLE recurring_invoice_templates IS 'Templates for recurring invoices with scheduling configuration';
COMMENT ON TABLE recurring_invoice_line_items IS 'Line items for recurring invoice templates';
COMMENT ON TABLE recurring_invoice_executions IS 'Execution history for recurring invoice generation';
COMMENT ON TABLE recurring_invoice_modifications IS 'Audit log for template modifications';

COMMENT ON FUNCTION calculate_next_run_date IS 'Calculates the next execution date based on frequency settings';
COMMENT ON FUNCTION update_recurring_template_totals IS 'Trigger function to update template totals when line items change';
COMMENT ON FUNCTION update_template_after_execution IS 'Trigger function to update template stats after successful execution';
