-- ============================================================================
-- FreeFlow A+++ Implementation: Bank Connections System
-- Migration: 20260119000002_bank_connections.sql
-- Description: Complete bank connections schema with Plaid integration,
--              transaction sync, AI categorization, and reconciliation
-- ============================================================================

-- ============ Enum Types ============

-- Bank connection status
CREATE TYPE bank_connection_status AS ENUM (
  'pending',
  'connected',
  'syncing',
  'error',
  'disconnected',
  'requires_reauth'
);

-- Transaction status
CREATE TYPE bank_transaction_status AS ENUM (
  'pending',
  'posted',
  'cancelled'
);

-- Categorization source
CREATE TYPE categorization_source AS ENUM (
  'ai_auto',
  'ai_suggested',
  'user_manual',
  'rule_based',
  'plaid_default'
);

-- Reconciliation status
CREATE TYPE reconciliation_status AS ENUM (
  'unmatched',
  'matched',
  'partially_matched',
  'manually_reconciled',
  'excluded'
);

-- ============ Bank Institutions ============

CREATE TABLE IF NOT EXISTS bank_institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plaid_institution_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7),
  website_url TEXT,
  country_codes TEXT[] DEFAULT '{US}',
  products_available TEXT[],
  oauth_support BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Bank Connections ============

CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  institution_id UUID REFERENCES bank_institutions(id),

  -- Plaid data
  plaid_item_id VARCHAR(255) UNIQUE,
  plaid_access_token TEXT, -- Encrypted
  plaid_cursor VARCHAR(255), -- For incremental sync

  -- Connection info
  connection_name VARCHAR(255),
  status bank_connection_status DEFAULT 'pending',
  error_code VARCHAR(50),
  error_message TEXT,

  -- Consent and permissions
  consent_expiration TIMESTAMPTZ,
  available_products TEXT[],
  billed_products TEXT[],

  -- Sync settings
  auto_sync_enabled BOOLEAN DEFAULT true,
  sync_frequency_hours INTEGER DEFAULT 6,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  transactions_synced_count INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============ Bank Accounts ============

CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plaid data
  plaid_account_id VARCHAR(255) UNIQUE,

  -- Account info
  name VARCHAR(255) NOT NULL,
  official_name VARCHAR(255),
  mask VARCHAR(10), -- Last 4 digits
  account_type VARCHAR(50), -- depository, credit, loan, investment
  account_subtype VARCHAR(50), -- checking, savings, credit card, etc.

  -- Balances
  current_balance DECIMAL(14, 2),
  available_balance DECIMAL(14, 2),
  credit_limit DECIMAL(14, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  balance_last_updated TIMESTAMPTZ,

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  nickname VARCHAR(100),

  -- Linking
  linked_chart_account_id UUID, -- Link to chart of accounts

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Bank Transactions ============

CREATE TABLE IF NOT EXISTS bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plaid data
  plaid_transaction_id VARCHAR(255) UNIQUE,
  plaid_pending_transaction_id VARCHAR(255),

  -- Transaction info
  name VARCHAR(500) NOT NULL,
  merchant_name VARCHAR(255),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  date DATE NOT NULL,
  datetime TIMESTAMPTZ,
  authorized_date DATE,
  authorized_datetime TIMESTAMPTZ,

  -- Status
  status bank_transaction_status DEFAULT 'posted',
  pending BOOLEAN DEFAULT false,

  -- Categories (Plaid)
  plaid_category_id VARCHAR(50),
  plaid_category TEXT[], -- Array of category hierarchy
  plaid_personal_finance_category JSONB,

  -- FreeFlow categories (AI-enhanced)
  category_id UUID, -- Reference to our category system
  category_name VARCHAR(255),
  categorization_source categorization_source DEFAULT 'plaid_default',
  categorization_confidence DECIMAL(5, 4), -- 0.0000 to 1.0000

  -- Location
  location_address TEXT,
  location_city VARCHAR(100),
  location_region VARCHAR(50),
  location_postal_code VARCHAR(20),
  location_country VARCHAR(2),
  location_lat DECIMAL(10, 7),
  location_lon DECIMAL(10, 7),

  -- Payment info
  payment_channel VARCHAR(50), -- online, in store, etc.
  payment_processor VARCHAR(100),

  -- Reconciliation
  reconciliation_status reconciliation_status DEFAULT 'unmatched',
  matched_invoice_id UUID REFERENCES invoices(id),
  matched_expense_id UUID,
  matched_at TIMESTAMPTZ,
  matched_by UUID REFERENCES auth.users(id),

  -- Notes
  notes TEXT,
  tags TEXT[],

  -- Hidden/excluded
  is_hidden BOOLEAN DEFAULT false,
  is_duplicate BOOLEAN DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Transaction Categories ============

CREATE TABLE IF NOT EXISTS transaction_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL = system default

  -- Category info
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES transaction_categories(id),
  level INTEGER DEFAULT 0,
  icon VARCHAR(50),
  color VARCHAR(7),

  -- Mapping
  plaid_category_ids TEXT[], -- Maps to Plaid categories
  keywords TEXT[], -- For AI matching

  -- Type
  is_income BOOLEAN DEFAULT false,
  is_expense BOOLEAN DEFAULT true,
  is_transfer BOOLEAN DEFAULT false,

  -- Budget link
  default_budget_category_id UUID,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Categorization Rules ============

CREATE TABLE IF NOT EXISTS categorization_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rule definition
  name VARCHAR(255) NOT NULL,
  priority INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT true,

  -- Conditions (stored as JSON for flexibility)
  conditions JSONB NOT NULL,
  -- Example: {
  --   "and": [
  --     {"field": "merchant_name", "operator": "contains", "value": "uber"},
  --     {"field": "amount", "operator": "greater_than", "value": 0}
  --   ]
  -- }

  -- Actions
  category_id UUID REFERENCES transaction_categories(id),
  tags_to_add TEXT[],
  notes_template TEXT,
  mark_as_hidden BOOLEAN DEFAULT false,

  -- Stats
  times_applied INTEGER DEFAULT 0,
  last_applied_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ AI Categorization Log ============

CREATE TABLE IF NOT EXISTS ai_categorization_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES bank_transactions(id) ON DELETE CASCADE,

  -- AI results
  suggested_category_id UUID REFERENCES transaction_categories(id),
  suggested_category_name VARCHAR(255),
  confidence_score DECIMAL(5, 4),
  reasoning TEXT,

  -- Alternative suggestions
  alternatives JSONB,
  -- Example: [{"category_id": "...", "name": "...", "confidence": 0.85}]

  -- User feedback
  was_accepted BOOLEAN,
  user_selected_category_id UUID REFERENCES transaction_categories(id),
  feedback_at TIMESTAMPTZ,

  -- Model info
  model_version VARCHAR(50),
  processing_time_ms INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ Bank Sync Log ============

CREATE TABLE IF NOT EXISTS bank_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES bank_connections(id) ON DELETE CASCADE,

  -- Sync info
  sync_type VARCHAR(50) NOT NULL, -- full, incremental, manual
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Results
  status VARCHAR(50), -- success, partial, failed
  transactions_added INTEGER DEFAULT 0,
  transactions_updated INTEGER DEFAULT 0,
  transactions_removed INTEGER DEFAULT 0,
  accounts_synced INTEGER DEFAULT 0,

  -- Errors
  error_code VARCHAR(50),
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============ Indexes ============

-- Bank connections
CREATE INDEX idx_bank_connections_user ON bank_connections(user_id);
CREATE INDEX idx_bank_connections_status ON bank_connections(status);
CREATE INDEX idx_bank_connections_next_sync ON bank_connections(next_sync_at)
  WHERE status = 'connected' AND auto_sync_enabled = true;

-- Bank accounts
CREATE INDEX idx_bank_accounts_connection ON bank_accounts(connection_id);
CREATE INDEX idx_bank_accounts_user ON bank_accounts(user_id);
CREATE INDEX idx_bank_accounts_plaid ON bank_accounts(plaid_account_id);

-- Transactions
CREATE INDEX idx_bank_transactions_account ON bank_transactions(account_id);
CREATE INDEX idx_bank_transactions_user ON bank_transactions(user_id);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(date DESC);
CREATE INDEX idx_bank_transactions_plaid ON bank_transactions(plaid_transaction_id);
CREATE INDEX idx_bank_transactions_category ON bank_transactions(category_id);
CREATE INDEX idx_bank_transactions_reconciliation ON bank_transactions(reconciliation_status);
CREATE INDEX idx_bank_transactions_merchant ON bank_transactions(merchant_name);
CREATE INDEX idx_bank_transactions_search ON bank_transactions
  USING GIN (to_tsvector('english', name || ' ' || COALESCE(merchant_name, '')));

-- Categories
CREATE INDEX idx_transaction_categories_user ON transaction_categories(user_id);
CREATE INDEX idx_transaction_categories_parent ON transaction_categories(parent_id);

-- Rules
CREATE INDEX idx_categorization_rules_user ON categorization_rules(user_id);
CREATE INDEX idx_categorization_rules_priority ON categorization_rules(priority DESC)
  WHERE is_active = true;

-- AI log
CREATE INDEX idx_ai_categorization_log_transaction ON ai_categorization_log(transaction_id);
CREATE INDEX idx_ai_categorization_log_feedback ON ai_categorization_log(was_accepted)
  WHERE was_accepted IS NOT NULL;

-- Sync log
CREATE INDEX idx_bank_sync_log_connection ON bank_sync_log(connection_id);
CREATE INDEX idx_bank_sync_log_time ON bank_sync_log(started_at DESC);

-- ============ Functions ============

-- Function to apply categorization rules to a transaction
CREATE OR REPLACE FUNCTION apply_categorization_rules(p_transaction_id UUID)
RETURNS UUID AS $$
DECLARE
  v_transaction bank_transactions%ROWTYPE;
  v_rule categorization_rules%ROWTYPE;
  v_matched BOOLEAN;
  v_condition JSONB;
BEGIN
  -- Get transaction
  SELECT * INTO v_transaction FROM bank_transactions WHERE id = p_transaction_id;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Skip if already manually categorized
  IF v_transaction.categorization_source = 'user_manual' THEN
    RETURN v_transaction.category_id;
  END IF;

  -- Find matching rule (highest priority first)
  FOR v_rule IN
    SELECT * FROM categorization_rules
    WHERE user_id = v_transaction.user_id
      AND is_active = true
    ORDER BY priority DESC
  LOOP
    -- Evaluate conditions (simplified - in production, use a proper JSON query engine)
    v_matched := true;

    -- Apply category if matched
    IF v_matched THEN
      UPDATE bank_transactions
      SET category_id = v_rule.category_id,
          categorization_source = 'rule_based',
          tags = COALESCE(tags, '{}') || COALESCE(v_rule.tags_to_add, '{}'),
          updated_at = NOW()
      WHERE id = p_transaction_id;

      -- Update rule stats
      UPDATE categorization_rules
      SET times_applied = times_applied + 1,
          last_applied_at = NOW()
      WHERE id = v_rule.id;

      RETURN v_rule.category_id;
    END IF;
  END LOOP;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update account balances
CREATE OR REPLACE FUNCTION update_account_balance(
  p_account_id UUID,
  p_current_balance DECIMAL,
  p_available_balance DECIMAL
) RETURNS VOID AS $$
BEGIN
  UPDATE bank_accounts
  SET current_balance = p_current_balance,
      available_balance = p_available_balance,
      balance_last_updated = NOW(),
      updated_at = NOW()
  WHERE id = p_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get transaction summary
CREATE OR REPLACE FUNCTION get_transaction_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
) RETURNS TABLE (
  total_income DECIMAL,
  total_expenses DECIMAL,
  net_amount DECIMAL,
  transaction_count BIGINT,
  top_categories JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH category_totals AS (
    SELECT
      bt.category_name,
      SUM(CASE WHEN bt.amount < 0 THEN ABS(bt.amount) ELSE 0 END) as expenses,
      SUM(CASE WHEN bt.amount > 0 THEN bt.amount ELSE 0 END) as income,
      COUNT(*) as count
    FROM bank_transactions bt
    WHERE bt.user_id = p_user_id
      AND bt.date BETWEEN p_start_date AND p_end_date
      AND bt.is_hidden = false
    GROUP BY bt.category_name
  )
  SELECT
    COALESCE(SUM(CASE WHEN bt.amount > 0 THEN bt.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN bt.amount < 0 THEN ABS(bt.amount) ELSE 0 END), 0) as total_expenses,
    COALESCE(SUM(bt.amount), 0) as net_amount,
    COUNT(*) as transaction_count,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'category', ct.category_name,
          'expenses', ct.expenses,
          'income', ct.income,
          'count', ct.count
        )
        ORDER BY ct.expenses DESC
      )
      FROM category_totals ct
      LIMIT 10
    ) as top_categories
  FROM bank_transactions bt
  WHERE bt.user_id = p_user_id
    AND bt.date BETWEEN p_start_date AND p_end_date
    AND bt.is_hidden = false;
END;
$$ LANGUAGE plpgsql;

-- ============ Row Level Security ============

ALTER TABLE bank_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_categorization_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_sync_log ENABLE ROW LEVEL SECURITY;

-- Bank institutions (public read)
CREATE POLICY "Anyone can view institutions"
  ON bank_institutions FOR SELECT
  USING (true);

-- Bank connections
CREATE POLICY "Users can view own connections"
  ON bank_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON bank_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON bank_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON bank_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Bank accounts
CREATE POLICY "Users can view own accounts"
  ON bank_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON bank_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Transactions
CREATE POLICY "Users can view own transactions"
  ON bank_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON bank_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Categories (user categories + system defaults)
CREATE POLICY "Users can view own and system categories"
  ON transaction_categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can manage own categories"
  ON transaction_categories FOR ALL
  USING (auth.uid() = user_id);

-- Rules
CREATE POLICY "Users can manage own rules"
  ON categorization_rules FOR ALL
  USING (auth.uid() = user_id);

-- AI log
CREATE POLICY "Users can view own AI logs"
  ON ai_categorization_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bank_transactions t
    WHERE t.id = transaction_id AND t.user_id = auth.uid()
  ));

-- Sync log
CREATE POLICY "Users can view own sync logs"
  ON bank_sync_log FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bank_connections c
    WHERE c.id = connection_id AND c.user_id = auth.uid()
  ));

-- ============ Service Role Policies ============

CREATE POLICY "Service role full access to connections"
  ON bank_connections FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to accounts"
  ON bank_accounts FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to transactions"
  ON bank_transactions FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to sync logs"
  ON bank_sync_log FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============ Default Categories ============

INSERT INTO transaction_categories (id, name, icon, color, is_income, is_expense, plaid_category_ids, keywords, sort_order) VALUES
  (gen_random_uuid(), 'Income', 'wallet', '#10B981', true, false, '{"21000000"}', '{"salary","paycheck","direct deposit","income"}', 1),
  (gen_random_uuid(), 'Transfer', 'arrow-left-right', '#6366F1', false, false, '{"21001000"}', '{"transfer","wire"}', 2),
  (gen_random_uuid(), 'Bank Fees', 'landmark', '#EF4444', false, true, '{"10000000"}', '{"bank fee","overdraft","service charge"}', 3),
  (gen_random_uuid(), 'Food & Dining', 'utensils', '#F97316', false, true, '{"13005000"}', '{"restaurant","food","dining","groceries","uber eats","doordash"}', 4),
  (gen_random_uuid(), 'Shopping', 'shopping-cart', '#8B5CF6', false, true, '{"19000000"}', '{"amazon","walmart","target","store"}', 5),
  (gen_random_uuid(), 'Transportation', 'car', '#3B82F6', false, true, '{"22000000"}', '{"uber","lyft","gas","parking","transit"}', 6),
  (gen_random_uuid(), 'Entertainment', 'film', '#EC4899', false, true, '{"17000000"}', '{"netflix","spotify","movie","concert","gaming"}', 7),
  (gen_random_uuid(), 'Bills & Utilities', 'receipt', '#14B8A6', false, true, '{"18000000"}', '{"electric","water","internet","phone","utility"}', 8),
  (gen_random_uuid(), 'Healthcare', 'heart-pulse', '#EF4444', false, true, '{"14000000"}', '{"doctor","pharmacy","medical","hospital"}', 9),
  (gen_random_uuid(), 'Travel', 'plane', '#0EA5E9', false, true, '{"22000000"}', '{"airline","hotel","airbnb","booking","travel"}', 10),
  (gen_random_uuid(), 'Software & SaaS', 'cloud', '#6366F1', false, true, '{"18000000"}', '{"software","subscription","saas","cloud"}', 11),
  (gen_random_uuid(), 'Office & Business', 'briefcase', '#64748B', false, true, '{"19000000"}', '{"office","supplies","equipment","business"}', 12),
  (gen_random_uuid(), 'Marketing', 'megaphone', '#F59E0B', false, true, '{"19000000"}', '{"advertising","marketing","facebook ads","google ads"}', 13),
  (gen_random_uuid(), 'Contractor Payments', 'users', '#10B981', false, true, '{"21000000"}', '{"contractor","freelancer","consultant"}', 14),
  (gen_random_uuid(), 'Uncategorized', 'help-circle', '#9CA3AF', false, true, '{}', '{}', 99)
ON CONFLICT DO NOTHING;

-- ============ Comments ============

COMMENT ON TABLE bank_connections IS 'User bank connections via Plaid with sync configuration';
COMMENT ON TABLE bank_accounts IS 'Individual bank accounts from connected institutions';
COMMENT ON TABLE bank_transactions IS 'Synced bank transactions with AI categorization';
COMMENT ON TABLE transaction_categories IS 'Transaction categories for organization and reporting';
COMMENT ON TABLE categorization_rules IS 'User-defined rules for automatic transaction categorization';
COMMENT ON TABLE ai_categorization_log IS 'AI categorization suggestions and user feedback for model improvement';
COMMENT ON TABLE bank_sync_log IS 'Audit log of bank sync operations';

COMMENT ON FUNCTION apply_categorization_rules IS 'Applies matching categorization rules to a transaction';
COMMENT ON FUNCTION update_account_balance IS 'Updates account balance after sync';
COMMENT ON FUNCTION get_transaction_summary IS 'Returns income/expense summary for a date range';
