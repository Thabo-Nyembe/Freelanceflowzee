-- Batch 35: Financial Management
-- Tables: financial, transactions, budgets
-- Created: December 14, 2024

-- ================================================
-- FINANCIAL RECORDS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS financial (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Financial Record Details
  record_number VARCHAR(100) UNIQUE NOT NULL,
  record_type VARCHAR(50) NOT NULL DEFAULT 'general'
    CHECK (record_type IN ('general', 'revenue', 'expense', 'investment', 'loan', 'grant', 'tax', 'payroll', 'dividend', 'asset', 'liability', 'equity')),
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Amount Details
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
  base_amount DECIMAL(15, 2),

  -- Status & Classification
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'processed', 'completed', 'cancelled', 'on_hold', 'under_review')),
  priority VARCHAR(20) DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  -- Dates
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),
  fiscal_month INTEGER CHECK (fiscal_month BETWEEN 1 AND 12),

  -- Accounting Details
  account_code VARCHAR(50),
  cost_center VARCHAR(100),
  department VARCHAR(100),
  project_id UUID,
  gl_account VARCHAR(100),

  -- Payment & Banking
  payment_method VARCHAR(50)
    CHECK (payment_method IN ('cash', 'check', 'wire_transfer', 'ach', 'credit_card', 'debit_card', 'paypal', 'stripe', 'crypto', 'other')),
  bank_account VARCHAR(100),
  transaction_reference VARCHAR(200),

  -- Tax Information
  is_taxable BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5, 2),
  tax_amount DECIMAL(15, 2),
  tax_category VARCHAR(100),

  -- Approval & Audit
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Documentation
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT financial_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_financial_user_id ON financial(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_record_type ON financial(record_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_status ON financial(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_record_date ON financial(record_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_category ON financial(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_financial_fiscal_year ON financial(fiscal_year) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE financial ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own financial records" ON financial FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own financial records" ON financial FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own financial records" ON financial FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own financial records" ON financial FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE financial;

-- ================================================
-- TRANSACTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction Details
  transaction_number VARCHAR(100) UNIQUE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'payment'
    CHECK (transaction_type IN ('payment', 'refund', 'transfer', 'deposit', 'withdrawal', 'charge', 'credit', 'debit', 'adjustment', 'fee', 'reversal', 'settlement')),
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Amount Details
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6) DEFAULT 1.000000,
  base_amount DECIMAL(15, 2),
  fee_amount DECIMAL(15, 2) DEFAULT 0.00,
  net_amount DECIMAL(15, 2),

  -- Status & Processing
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed', 'on_hold', 'authorized', 'captured', 'voided')),
  processing_status VARCHAR(50),
  error_code VARCHAR(50),
  error_message TEXT,

  -- Payment Details
  payment_method VARCHAR(50) NOT NULL
    CHECK (payment_method IN ('cash', 'check', 'wire_transfer', 'ach', 'credit_card', 'debit_card', 'paypal', 'stripe', 'square', 'venmo', 'crypto', 'other')),
  payment_gateway VARCHAR(100),
  gateway_transaction_id VARCHAR(200),

  -- Card Details (if applicable)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  card_type VARCHAR(50),

  -- Bank Details
  bank_name VARCHAR(200),
  account_last4 VARCHAR(4),
  routing_number VARCHAR(20),

  -- Parties Involved
  payer_id UUID REFERENCES auth.users(id),
  payer_name VARCHAR(300),
  payer_email VARCHAR(300),
  payee_id UUID REFERENCES auth.users(id),
  payee_name VARCHAR(300),
  payee_email VARCHAR(300),

  -- Related Records
  invoice_id UUID,
  order_id UUID,
  contract_id UUID,
  subscription_id UUID,

  -- Dates & Timing
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Receipt & Documentation
  receipt_url TEXT,
  receipt_number VARCHAR(100),
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Risk & Security
  risk_score DECIMAL(5, 2),
  risk_level VARCHAR(20) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  is_flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  ip_address INET,
  user_agent TEXT,

  -- Reconciliation
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES auth.users(id),

  -- Notes & Tags
  notes TEXT,
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT transactions_user_id_idx CHECK (user_id IS NOT NULL)
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_type ON transactions(transaction_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_status ON transactions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_payment_method ON transactions(payment_method) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_gateway_id ON transactions(gateway_transaction_id) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;

-- ================================================
-- BUDGETS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Budget Details
  budget_number VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  budget_type VARCHAR(50) NOT NULL DEFAULT 'operational'
    CHECK (budget_type IN ('operational', 'project', 'department', 'campaign', 'capital', 'discretionary', 'emergency', 'annual', 'quarterly', 'monthly')),

  -- Amount & Allocation
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  allocated_amount DECIMAL(15, 2) DEFAULT 0.00,
  spent_amount DECIMAL(15, 2) DEFAULT 0.00,
  remaining_amount DECIMAL(15, 2) DEFAULT 0.00,
  committed_amount DECIMAL(15, 2) DEFAULT 0.00,
  available_amount DECIMAL(15, 2) DEFAULT 0.00,

  -- Percentages
  utilization_percent DECIMAL(5, 2) DEFAULT 0.00,
  allocation_percent DECIMAL(5, 2) DEFAULT 0.00,

  -- Currency
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_approval', 'approved', 'active', 'on_hold', 'exceeded', 'closed', 'cancelled')),

  -- Period
  period_type VARCHAR(50) NOT NULL DEFAULT 'annual'
    CHECK (period_type IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'multi_year', 'project_based', 'ongoing')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER CHECK (fiscal_quarter BETWEEN 1 AND 4),

  -- Organization
  category VARCHAR(100),
  subcategory VARCHAR(100),
  department VARCHAR(100),
  cost_center VARCHAR(100),
  project_id UUID,

  -- Line Items & Breakdown
  line_items JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,

  -- Alerts & Thresholds
  alert_threshold DECIMAL(5, 2) DEFAULT 80.00,
  warning_threshold DECIMAL(5, 2) DEFAULT 90.00,
  is_exceeded BOOLEAN DEFAULT false,
  exceeded_at TIMESTAMPTZ,
  alerts_enabled BOOLEAN DEFAULT true,

  -- Approval Workflow
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,

  -- Ownership & Access
  owner_id UUID REFERENCES auth.users(id),
  manager_id UUID REFERENCES auth.users(id),
  stakeholders UUID[],

  -- Tracking & Reporting
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE,
  review_frequency VARCHAR(50),

  -- Rollover & Carryforward
  allows_rollover BOOLEAN DEFAULT false,
  rollover_amount DECIMAL(15, 2) DEFAULT 0.00,
  previous_budget_id UUID REFERENCES budgets(id),

  -- Notes & Documentation
  notes TEXT,
  tags TEXT[],
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Integration
  external_id VARCHAR(200),
  external_source VARCHAR(100),
  sync_status VARCHAR(50),
  last_synced_at TIMESTAMPTZ,

  -- Audit Trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT budgets_user_id_idx CHECK (user_id IS NOT NULL),
  CONSTRAINT budgets_date_range CHECK (end_date >= start_date)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_type ON budgets(budget_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_status ON budgets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_period ON budgets(start_date, end_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year) WHERE deleted_at IS NULL;
CREATE INDEX idx_budgets_category ON budgets(category) WHERE deleted_at IS NULL;

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can create own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id AND deleted_at IS NULL);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE budgets;

-- ================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_financial_updated_at BEFORE UPDATE ON financial
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
