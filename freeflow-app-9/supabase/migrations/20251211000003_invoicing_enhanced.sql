-- ============================================================================
-- Enhanced Invoicing System Migration
-- Created: 2025-12-11
-- Description: Additional tables for comprehensive invoicing service
-- Includes: clients, invoice events, analytics, Stripe integration
-- ============================================================================

-- ============================================================================
-- TABLE 1: invoice_clients (client management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Client identification
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  vat_number TEXT,
  tax_id TEXT,

  -- Address
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',

  -- Billing address (if different)
  billing_address JSONB,

  -- Stripe integration
  stripe_customer_id TEXT,

  -- Default settings
  default_currency TEXT DEFAULT 'USD',
  default_payment_terms INTEGER DEFAULT 30,
  default_tax_rate DECIMAL(5, 2) DEFAULT 0,
  default_discount DECIMAL(10, 2) DEFAULT 0,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  is_archived BOOLEAN DEFAULT FALSE,

  -- Statistics
  total_invoiced DECIMAL(12, 2) DEFAULT 0,
  total_paid DECIMAL(12, 2) DEFAULT 0,
  total_outstanding DECIMAL(12, 2) DEFAULT 0,
  invoice_count INTEGER DEFAULT 0,
  average_payment_days INTEGER,
  last_invoice_at TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,

  -- Tags/categories
  tags TEXT[] DEFAULT '{}',
  category TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invoice_clients_status_check CHECK (status IN ('active', 'inactive', 'suspended'))
);

CREATE INDEX IF NOT EXISTS idx_invoice_clients_user_id ON invoice_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_clients_email ON invoice_clients(email);
CREATE INDEX IF NOT EXISTS idx_invoice_clients_company ON invoice_clients(company) WHERE company IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_clients_stripe_customer ON invoice_clients(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_clients_status ON invoice_clients(status);
CREATE INDEX IF NOT EXISTS idx_invoice_clients_tags ON invoice_clients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_invoice_clients_created_at ON invoice_clients(created_at DESC);

-- Add client_id foreign key to invoices table if it doesn't exist and update it
DO $$
BEGIN
  -- First check if client_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices'
    AND column_name = 'client_id'
  ) THEN
    -- Add foreign key if not exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE constraint_name = 'invoices_client_id_fkey'
      AND table_name = 'invoices'
    ) THEN
      ALTER TABLE invoices
      ADD CONSTRAINT invoices_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES invoice_clients(id) ON DELETE SET NULL;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- TABLE 2: invoice_line_items (detailed line items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

  -- Item details
  description TEXT NOT NULL,
  quantity DECIMAL(10, 4) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 4) NOT NULL,
  unit TEXT DEFAULT 'unit',

  -- Calculations
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,

  -- Categorization
  item_type TEXT DEFAULT 'service',
  category TEXT,
  sku TEXT,

  -- Project/task reference
  project_id UUID,
  task_id UUID,
  time_entry_id UUID,

  -- Date range (for time-based billing)
  service_date_start DATE,
  service_date_end DATE,

  -- Order
  position INTEGER NOT NULL DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT invoice_line_items_type_check CHECK (item_type IN ('service', 'product', 'expense', 'discount', 'tax', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_type ON invoice_line_items(item_type);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_project ON invoice_line_items(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_position ON invoice_line_items(invoice_id, position);

-- ============================================================================
-- TABLE 3: invoice_events (audit trail and activity log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Event info
  event_type TEXT NOT NULL,
  event_category TEXT,

  -- Event details
  description TEXT,
  event_data JSONB DEFAULT '{}',

  -- Previous/new values for changes
  previous_value JSONB,
  new_value JSONB,

  -- Context
  ip_address TEXT,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_events_invoice_id ON invoice_events(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_events_user_id ON invoice_events(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_events_type ON invoice_events(event_type);
CREATE INDEX IF NOT EXISTS idx_invoice_events_category ON invoice_events(event_category) WHERE event_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoice_events_created_at ON invoice_events(created_at DESC);

-- ============================================================================
-- TABLE 4: invoice_payment_links (payment link management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Link info
  link_id TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,

  -- Stripe integration
  stripe_payment_link_id TEXT,
  stripe_price_id TEXT,

  -- Settings
  allow_partial_payment BOOLEAN DEFAULT FALSE,
  minimum_payment DECIMAL(12, 2),
  suggested_amounts JSONB DEFAULT '[]',

  -- Expiry
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  use_count INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_links_invoice_id ON invoice_payment_links(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_link_id ON invoice_payment_links(link_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_stripe_id ON invoice_payment_links(stripe_payment_link_id) WHERE stripe_payment_link_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_links_is_active ON invoice_payment_links(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TABLE 5: recurring_invoices (recurring invoice configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recurring_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES invoice_clients(id) ON DELETE SET NULL,

  -- Template info
  name TEXT NOT NULL,
  description TEXT,

  -- Invoice template data
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  discount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,

  -- Schedule
  frequency TEXT NOT NULL DEFAULT 'monthly',
  interval_count INTEGER DEFAULT 1,
  day_of_month INTEGER,
  day_of_week INTEGER,
  start_date DATE NOT NULL,
  end_date DATE,
  next_run_date DATE,

  -- Auto-send settings
  auto_send BOOLEAN DEFAULT TRUE,
  send_days_before INTEGER DEFAULT 0,
  payment_terms INTEGER DEFAULT 30,

  -- Status
  status TEXT NOT NULL DEFAULT 'active',
  is_paused BOOLEAN DEFAULT FALSE,
  paused_at TIMESTAMPTZ,

  -- Statistics
  invoices_generated INTEGER DEFAULT 0,
  total_invoiced DECIMAL(12, 2) DEFAULT 0,
  last_generated_at TIMESTAMPTZ,
  last_invoice_id UUID,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT recurring_frequency_check CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
  CONSTRAINT recurring_status_check CHECK (status IN ('active', 'paused', 'completed', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_recurring_invoices_user_id ON recurring_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_client_id ON recurring_invoices(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_status ON recurring_invoices(status);
CREATE INDEX IF NOT EXISTS idx_recurring_invoices_next_run ON recurring_invoices(next_run_date) WHERE status = 'active';

-- ============================================================================
-- TABLE 6: invoice_analytics_daily (daily aggregated analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoice_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Invoice counts
  invoices_created INTEGER DEFAULT 0,
  invoices_sent INTEGER DEFAULT 0,
  invoices_viewed INTEGER DEFAULT 0,
  invoices_paid INTEGER DEFAULT 0,
  invoices_overdue INTEGER DEFAULT 0,

  -- Financial metrics (in cents for precision)
  total_invoiced BIGINT DEFAULT 0,
  total_collected BIGINT DEFAULT 0,
  total_outstanding BIGINT DEFAULT 0,
  total_overdue BIGINT DEFAULT 0,

  -- Payment metrics
  payments_received INTEGER DEFAULT 0,
  average_payment_days NUMERIC(5, 2),

  -- Client metrics
  new_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,

  -- Currency
  currency TEXT DEFAULT 'USD',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, date, currency)
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_user_date ON invoice_analytics_daily(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON invoice_analytics_daily(date DESC);

-- ============================================================================
-- TABLE 7: stripe_webhook_events (Stripe webhook processing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Stripe event info
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  api_version TEXT,

  -- Payload
  payload JSONB NOT NULL,

  -- Related entities
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_id UUID,
  customer_id TEXT,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_stripe_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_invoice_id ON stripe_webhook_events(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_webhook_events(processed) WHERE processed = FALSE;
CREATE INDEX IF NOT EXISTS idx_stripe_events_received_at ON stripe_webhook_events(received_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE invoice_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Clients policies
DROP POLICY IF EXISTS "Users can manage own clients" ON invoice_clients;
CREATE POLICY "Users can manage own clients"
  ON invoice_clients FOR ALL
  USING (auth.uid() = user_id);

-- Line items policies
DROP POLICY IF EXISTS "Users can manage line items for own invoices" ON invoice_line_items;
CREATE POLICY "Users can manage line items for own invoices"
  ON invoice_line_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_line_items.invoice_id
    AND invoices.user_id = auth.uid()
  ));

-- Events policies
DROP POLICY IF EXISTS "Users can view events for own invoices" ON invoice_events;
CREATE POLICY "Users can view events for own invoices"
  ON invoice_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM invoices
    WHERE invoices.id = invoice_events.invoice_id
    AND invoices.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "System can insert events" ON invoice_events;
CREATE POLICY "System can insert events"
  ON invoice_events FOR INSERT
  WITH CHECK (TRUE);

-- Payment links policies
DROP POLICY IF EXISTS "Users can manage own payment links" ON invoice_payment_links;
CREATE POLICY "Users can manage own payment links"
  ON invoice_payment_links FOR ALL
  USING (auth.uid() = user_id);

-- Recurring invoices policies
DROP POLICY IF EXISTS "Users can manage own recurring invoices" ON recurring_invoices;
CREATE POLICY "Users can manage own recurring invoices"
  ON recurring_invoices FOR ALL
  USING (auth.uid() = user_id);

-- Analytics policies
DROP POLICY IF EXISTS "Users can view own analytics" ON invoice_analytics_daily;
CREATE POLICY "Users can view own analytics"
  ON invoice_analytics_daily FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can manage analytics" ON invoice_analytics_daily;
CREATE POLICY "System can manage analytics"
  ON invoice_analytics_daily FOR ALL
  USING (TRUE);

-- Stripe events policies (service role only for writes)
DROP POLICY IF EXISTS "Users can view related stripe events" ON stripe_webhook_events;
CREATE POLICY "Users can view related stripe events"
  ON stripe_webhook_events FOR SELECT
  USING (
    invoice_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = stripe_webhook_events.invoice_id
      AND invoices.user_id = auth.uid()
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update clients updated_at
DROP TRIGGER IF EXISTS update_invoice_clients_updated_at ON invoice_clients;
CREATE TRIGGER update_invoice_clients_updated_at
  BEFORE UPDATE ON invoice_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update recurring invoices updated_at
DROP TRIGGER IF EXISTS update_recurring_invoices_updated_at ON recurring_invoices;
CREATE TRIGGER update_recurring_invoices_updated_at
  BEFORE UPDATE ON recurring_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update analytics updated_at
DROP TRIGGER IF EXISTS update_analytics_daily_updated_at ON invoice_analytics_daily;
CREATE TRIGGER update_analytics_daily_updated_at
  BEFORE UPDATE ON invoice_analytics_daily
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update client statistics when invoice changes
CREATE OR REPLACE FUNCTION update_client_invoice_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Get client_id from either NEW or OLD record
  v_client_id := COALESCE(NEW.client_id, OLD.client_id);

  IF v_client_id IS NOT NULL THEN
    UPDATE invoice_clients
    SET
      invoice_count = (
        SELECT COUNT(*) FROM invoices WHERE client_id = v_client_id
      ),
      total_invoiced = (
        SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = v_client_id
      ),
      total_paid = (
        SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = v_client_id AND status = 'paid'
      ),
      total_outstanding = (
        SELECT COALESCE(SUM(total), 0) FROM invoices WHERE client_id = v_client_id AND status IN ('sent', 'viewed', 'overdue')
      ),
      last_invoice_at = (
        SELECT MAX(created_at) FROM invoices WHERE client_id = v_client_id
      ),
      last_payment_at = (
        SELECT MAX(paid_date) FROM invoices WHERE client_id = v_client_id AND paid_date IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = v_client_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_client_stats_on_invoice_change ON invoices;
CREATE TRIGGER update_client_stats_on_invoice_change
  AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_client_invoice_stats();

-- Log invoice events automatically
CREATE OR REPLACE FUNCTION log_invoice_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO invoice_events (invoice_id, user_id, event_type, event_category, description, new_value)
    VALUES (NEW.id, NEW.user_id, 'invoice_created', 'lifecycle', 'Invoice created', to_jsonb(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO invoice_events (invoice_id, user_id, event_type, event_category, description, previous_value, new_value)
      VALUES (
        NEW.id,
        NEW.user_id,
        'status_changed',
        'lifecycle',
        'Invoice status changed from ' || OLD.status || ' to ' || NEW.status,
        jsonb_build_object('status', OLD.status),
        jsonb_build_object('status', NEW.status)
      );
    END IF;

    -- Log when sent
    IF OLD.sent_at IS NULL AND NEW.sent_at IS NOT NULL THEN
      INSERT INTO invoice_events (invoice_id, user_id, event_type, event_category, description)
      VALUES (NEW.id, NEW.user_id, 'invoice_sent', 'lifecycle', 'Invoice sent to client');
    END IF;

    -- Log when viewed
    IF OLD.viewed_at IS NULL AND NEW.viewed_at IS NOT NULL THEN
      INSERT INTO invoice_events (invoice_id, event_type, event_category, description)
      VALUES (NEW.id, 'invoice_viewed', 'lifecycle', 'Invoice viewed by client');
    END IF;

    -- Log when paid
    IF OLD.status != 'paid' AND NEW.status = 'paid' THEN
      INSERT INTO invoice_events (invoice_id, user_id, event_type, event_category, description)
      VALUES (NEW.id, NEW.user_id, 'invoice_paid', 'payment', 'Invoice marked as paid');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_invoice_events_trigger ON invoices;
CREATE TRIGGER log_invoice_events_trigger
  AFTER INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_invoice_event();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate client lifetime value
CREATE OR REPLACE FUNCTION calculate_client_ltv(p_client_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_ltv DECIMAL;
BEGIN
  SELECT COALESCE(SUM(total), 0)
  INTO v_ltv
  FROM invoices
  WHERE client_id = p_client_id
    AND status = 'paid';

  RETURN v_ltv;
END;
$$ LANGUAGE plpgsql;

-- Get invoice summary for a period
CREATE OR REPLACE FUNCTION get_invoice_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_invoiced DECIMAL,
  total_paid DECIMAL,
  total_outstanding DECIMAL,
  invoice_count INTEGER,
  paid_count INTEGER,
  overdue_count INTEGER,
  average_invoice_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(i.total), 0)::DECIMAL as total_invoiced,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0)::DECIMAL as total_paid,
    COALESCE(SUM(CASE WHEN i.status IN ('sent', 'viewed', 'overdue') THEN i.total ELSE 0 END), 0)::DECIMAL as total_outstanding,
    COUNT(*)::INTEGER as invoice_count,
    COUNT(CASE WHEN i.status = 'paid' THEN 1 END)::INTEGER as paid_count,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END)::INTEGER as overdue_count,
    COALESCE(AVG(i.total), 0)::DECIMAL as average_invoice_value
  FROM invoices i
  WHERE i.user_id = p_user_id
    AND i.issue_date >= p_start_date
    AND i.issue_date <= p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Get aging report
CREATE OR REPLACE FUNCTION get_aging_report(p_user_id UUID)
RETURNS TABLE (
  period TEXT,
  invoice_count INTEGER,
  total_amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN due_date >= CURRENT_DATE THEN 'Current'
      WHEN CURRENT_DATE - due_date <= 30 THEN '1-30 days'
      WHEN CURRENT_DATE - due_date <= 60 THEN '31-60 days'
      WHEN CURRENT_DATE - due_date <= 90 THEN '61-90 days'
      ELSE '90+ days'
    END as period,
    COUNT(*)::INTEGER as invoice_count,
    COALESCE(SUM(total), 0)::DECIMAL as total_amount
  FROM invoices
  WHERE user_id = p_user_id
    AND status IN ('sent', 'viewed', 'overdue')
  GROUP BY
    CASE
      WHEN due_date >= CURRENT_DATE THEN 'Current'
      WHEN CURRENT_DATE - due_date <= 30 THEN '1-30 days'
      WHEN CURRENT_DATE - due_date <= 60 THEN '31-60 days'
      WHEN CURRENT_DATE - due_date <= 90 THEN '61-90 days'
      ELSE '90+ days'
    END
  ORDER BY
    CASE
      WHEN due_date >= CURRENT_DATE THEN 1
      WHEN CURRENT_DATE - due_date <= 30 THEN 2
      WHEN CURRENT_DATE - due_date <= 60 THEN 3
      WHEN CURRENT_DATE - due_date <= 90 THEN 4
      ELSE 5
    END;
END;
$$ LANGUAGE plpgsql;
