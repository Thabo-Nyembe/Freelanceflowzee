-- ============================================================================
-- FINANCIAL HUB SYSTEM - DATABASE MIGRATION
-- ============================================================================
-- Complete database schema for Financial Hub with transactions, invoices,
-- reports, and financial categories
-- ============================================================================

-- ============================================================================
-- FINANCIAL CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'circle',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default categories
INSERT INTO financial_categories (name, type, color, icon, description, user_id, is_active) VALUES
  ('project_payment', 'income', '#10B981', 'briefcase', 'Client project payments', NULL, true),
  ('consulting', 'income', '#3B82F6', 'users', 'Consulting services', NULL, true),
  ('product_sales', 'income', '#8B5CF6', 'shopping-cart', 'Digital product sales', NULL, true),
  ('software', 'expense', '#EF4444', 'code', 'Software subscriptions', NULL, true),
  ('marketing', 'expense', '#F59E0B', 'megaphone', 'Marketing and advertising', NULL, true),
  ('operations', 'expense', '#6B7280', 'settings', 'Operational expenses', NULL, true),
  ('equipment', 'expense', '#EC4899', 'monitor', 'Equipment and hardware', NULL, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core transaction data
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'cancelled')),

  -- Payment information
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'credit_card', 'paypal', 'platform', 'cash', 'other')),

  -- Related entities
  client_id UUID,
  project_id UUID,
  invoice_id UUID,
  vendor TEXT,

  -- Recurring transaction data
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_due_date DATE,

  -- Additional data
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 0),
  CONSTRAINT valid_recurring CHECK (
    (is_recurring = false) OR
    (is_recurring = true AND recurring_frequency IS NOT NULL)
  )
);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Invoice identification
  invoice_number TEXT NOT NULL UNIQUE,

  -- Client information
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,

  -- Project information
  project_id UUID,
  project_name TEXT NOT NULL,

  -- Financial data
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5, 2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  discount DECIMAL(12, 2) DEFAULT 0 CHECK (discount >= 0),

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

  -- Payment tracking
  paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0 AND paid_amount <= amount),

  -- Line items (JSONB for flexibility)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ description, quantity, rate, amount }]

  -- Terms and notes
  payment_terms TEXT DEFAULT 'Net 30',
  notes TEXT,
  terms_and_conditions TEXT,

  -- Files
  pdf_url TEXT,

  -- Email tracking
  last_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_due_date CHECK (due_date >= issue_date),
  CONSTRAINT valid_paid_date CHECK (paid_date IS NULL OR paid_date >= issue_date),
  CONSTRAINT valid_paid_status CHECK (
    (status != 'paid') OR
    (status = 'paid' AND paid_date IS NOT NULL AND paid_amount >= amount)
  )
);

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Report information
  report_type TEXT NOT NULL CHECK (report_type IN (
    'profit_loss', 'cash_flow', 'tax_summary', 'expense_report',
    'revenue_analysis', 'client_report', 'custom'
  )),
  title TEXT NOT NULL,

  -- Date range
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,

  -- Generation info
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed')),

  -- File information
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'xlsx', 'json', 'html')),
  file_url TEXT,
  file_size INTEGER,

  -- Report data (stored as JSONB for quick access)
  data JSONB DEFAULT '{}'::jsonb,

  -- Report parameters
  parameters JSONB DEFAULT '{}'::jsonb,

  -- Error information
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_to >= date_from),
  CONSTRAINT valid_ready_status CHECK (
    (status != 'ready') OR
    (status = 'ready' AND file_url IS NOT NULL)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON transactions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN(metadata);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date ON invoices(paid_date DESC);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(date_from, date_to);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON financial_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON financial_categories(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies (global categories visible to all, personal categories only to owner)
CREATE POLICY "Users can view categories" ON financial_categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create own categories" ON financial_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON financial_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON financial_categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON financial_categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON financial_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update invoice status based on due date and payment
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If fully paid, set status to paid
  IF NEW.paid_amount >= NEW.amount AND NEW.status != 'paid' THEN
    NEW.status := 'paid';
    NEW.paid_date := COALESCE(NEW.paid_date, CURRENT_DATE);
  END IF;

  -- If past due date and not paid, set to overdue
  IF NEW.due_date < CURRENT_DATE
     AND NEW.status NOT IN ('paid', 'cancelled')
     AND NEW.paid_amount < NEW.amount THEN
    NEW.status := 'overdue';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_status_trigger ON invoices;
CREATE TRIGGER update_invoice_status_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- Auto-generate invoice number if not provided
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' ||
                          TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1;

DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON invoices;
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate total revenue for a user in date range
CREATE OR REPLACE FUNCTION calculate_revenue(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND status = 'completed'
    AND date >= p_start_date
    AND date <= p_end_date;
$$ LANGUAGE SQL;

-- Calculate total expenses for a user in date range
CREATE OR REPLACE FUNCTION calculate_expenses(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND status = 'completed'
    AND date >= p_start_date
    AND date <= p_end_date;
$$ LANGUAGE SQL;

-- Get outstanding invoice amount for a user
CREATE OR REPLACE FUNCTION calculate_outstanding_invoices(p_user_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount - paid_amount), 0)
  FROM invoices
  WHERE user_id = p_user_id
    AND status NOT IN ('paid', 'cancelled');
$$ LANGUAGE SQL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE transactions IS 'Stores all financial transactions (income and expenses)';
COMMENT ON TABLE invoices IS 'Stores client invoices with line items and payment tracking';
COMMENT ON TABLE reports IS 'Stores generated financial reports with metadata';
COMMENT ON TABLE financial_categories IS 'Categories for organizing transactions';

COMMENT ON COLUMN transactions.metadata IS 'Additional flexible data stored as JSON';
COMMENT ON COLUMN invoices.line_items IS 'Invoice line items: [{ description, quantity, rate, amount }]';
COMMENT ON COLUMN reports.data IS 'Report data stored as JSON for quick access';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE invoice_number_seq TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
