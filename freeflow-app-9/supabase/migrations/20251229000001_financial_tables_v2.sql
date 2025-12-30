-- ============================================================================
-- FINANCIAL TABLES V2 - Comprehensive Budgets & Transactions
-- Created: December 29, 2025
-- Purpose: Create properly structured budgets and transactions tables
-- ============================================================================

-- Drop existing tables if they exist (to ensure clean schema)
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;

-- ============================================================================
-- BUDGETS TABLE
-- ============================================================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Core budget data
  budget_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  budget_type TEXT NOT NULL DEFAULT 'monthly',

  -- Amounts
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  allocated_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  committed_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  available_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  utilization_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  allocation_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status and period
  status TEXT NOT NULL DEFAULT 'active',
  period_type TEXT NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  fiscal_year INTEGER,
  fiscal_quarter INTEGER,

  -- Categorization
  category TEXT,
  subcategory TEXT,
  department TEXT,
  cost_center TEXT,
  project_id UUID,

  -- Detailed breakdown
  line_items JSONB DEFAULT '[]'::jsonb,
  breakdown JSONB DEFAULT '{}'::jsonb,

  -- Thresholds and alerts
  alert_threshold DECIMAL(5, 2) NOT NULL DEFAULT 90,
  warning_threshold DECIMAL(5, 2) NOT NULL DEFAULT 75,
  is_exceeded BOOLEAN NOT NULL DEFAULT false,
  exceeded_at TIMESTAMP WITH TIME ZONE,
  alerts_enabled BOOLEAN NOT NULL DEFAULT true,

  -- Approval workflow
  submitted_by UUID,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,

  -- Ownership
  owner_id UUID,
  manager_id UUID,
  stakeholders UUID[] DEFAULT '{}',

  -- Review schedule
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  next_review_date DATE,
  review_frequency TEXT,

  -- Rollover settings
  allows_rollover BOOLEAN NOT NULL DEFAULT false,
  rollover_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  previous_budget_id UUID,

  -- Additional data
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- External integrations
  external_id TEXT,
  external_source TEXT,
  sync_status TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,

  -- Core transaction data
  transaction_number TEXT NOT NULL UNIQUE,
  transaction_type TEXT NOT NULL DEFAULT 'expense',
  title TEXT NOT NULL,
  description TEXT,

  -- Amounts
  amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate DECIMAL(10, 6),
  base_amount DECIMAL(15, 2),
  fee_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(15, 2),

  -- Status
  status TEXT NOT NULL DEFAULT 'completed',
  processing_status TEXT,
  error_code TEXT,
  error_message TEXT,

  -- Payment details
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  payment_gateway TEXT,
  gateway_transaction_id TEXT,

  -- Card details (if applicable)
  card_last4 TEXT,
  card_brand TEXT,
  card_type TEXT,

  -- Bank details (if applicable)
  bank_name TEXT,
  account_last4 TEXT,
  routing_number TEXT,

  -- Payer information
  payer_id UUID,
  payer_name TEXT,
  payer_email TEXT,

  -- Payee information
  payee_id UUID,
  payee_name TEXT,
  payee_email TEXT,

  -- Related entities
  invoice_id UUID,
  order_id UUID,
  contract_id UUID,
  subscription_id UUID,
  budget_id UUID,
  category_id UUID,
  category_name TEXT,
  account_id UUID,
  account_name TEXT,

  -- Dates
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  settled_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,

  -- Receipt data
  receipt_url TEXT,
  receipt_number TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Risk assessment
  risk_score INTEGER,
  risk_level TEXT,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flagged_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,

  -- Reconciliation
  is_reconciled BOOLEAN NOT NULL DEFAULT false,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  reconciled_by UUID,

  -- Additional data
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,

  -- External integrations
  external_id TEXT,
  external_source TEXT,
  sync_status TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Budgets indexes
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_budget_type ON budgets(budget_type);
CREATE INDEX idx_budgets_start_date ON budgets(start_date);
CREATE INDEX idx_budgets_category ON budgets(category);
CREATE INDEX idx_budgets_deleted_at ON budgets(deleted_at);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_budget_id ON transactions(budget_id);
CREATE INDEX idx_transactions_category_name ON transactions(category_name);
CREATE INDEX idx_transactions_deleted_at ON transactions(deleted_at);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Budgets policies
CREATE POLICY "Users can view their own budgets"
  ON budgets FOR SELECT
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

CREATE POLICY "Users can create their own budgets"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own budgets"
  ON budgets FOR UPDATE
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

CREATE POLICY "Users can delete their own budgets"
  ON budgets FOR DELETE
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

-- Transactions policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

CREATE POLICY "Users can create their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id OR user_id::text = 'demo-user-001');

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_budgets_updated_at ON budgets;
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON budgets TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON budgets TO anon;
GRANT ALL ON transactions TO anon;
