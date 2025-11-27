-- Minimal Financial Schema for Financial Hub
--
-- This schema creates tables for financial transactions and tracking.
-- Integrates with invoices table for comprehensive financial overview.

-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS financial_insights CASCADE;
DROP TABLE IF EXISTS financial_goals CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_category CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS insight_type CASCADE;
DROP TYPE IF EXISTS insight_impact CASCADE;

-- ENUMs
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE transaction_category AS ENUM (
  'project_payment',
  'consulting',
  'subscription',
  'software',
  'hardware',
  'marketing',
  'office_expenses',
  'professional_services',
  'taxes',
  'other'
);
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('bank_transfer', 'credit_card', 'paypal', 'platform', 'cash', 'crypto', 'check');
CREATE TYPE insight_type AS ENUM ('revenue_optimization', 'cash_flow', 'cost_reduction', 'risk_alert');
CREATE TYPE insight_impact AS ENUM ('high', 'medium', 'low');

-- Financial Transactions Table
CREATE TABLE financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction details
  type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Related entities
  client_id UUID,
  client_name TEXT,
  project_id UUID,
  project_name TEXT,
  vendor_name TEXT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  invoice_number TEXT,

  -- Payment information
  status transaction_status NOT NULL DEFAULT 'completed',
  payment_method payment_method_type NOT NULL,

  -- Recurring transactions
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT, -- monthly, quarterly, annually
  next_due_date DATE,

  -- Additional info
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT
);

-- Financial Insights Table (AI-generated insights)
CREATE TABLE financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact insight_impact NOT NULL,

  -- Value metrics
  potential_value DECIMAL(10, 2) DEFAULT 0,
  confidence DECIMAL(3, 2) DEFAULT 0, -- 0.00 to 1.00

  -- Actionable details
  is_actionable BOOLEAN DEFAULT TRUE,
  category TEXT NOT NULL,
  action_steps JSONB DEFAULT '[]',

  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'implemented', 'dismissed', 'archived')),
  implemented_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Goals Table
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Goal details
  name TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('monthly_revenue', 'quarterly_growth', 'profit_margin', 'client_acquisition', 'emergency_fund', 'custom')),

  -- Target and progress
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,

  -- Timeline
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'overdue')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Financial Transactions
CREATE INDEX idx_financial_transactions_user_id ON financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX idx_financial_transactions_status ON financial_transactions(status);
CREATE INDEX idx_financial_transactions_date ON financial_transactions(transaction_date DESC);
CREATE INDEX idx_financial_transactions_client ON financial_transactions(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_financial_transactions_project ON financial_transactions(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_financial_transactions_invoice ON financial_transactions(invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX idx_financial_transactions_recurring ON financial_transactions(is_recurring, next_due_date) WHERE is_recurring = TRUE;
CREATE INDEX idx_financial_transactions_created_at ON financial_transactions(created_at DESC);
CREATE INDEX idx_financial_transactions_tags ON financial_transactions USING GIN(tags);

-- Indexes for Financial Insights
CREATE INDEX idx_financial_insights_user_id ON financial_insights(user_id);
CREATE INDEX idx_financial_insights_type ON financial_insights(type);
CREATE INDEX idx_financial_insights_impact ON financial_insights(impact);
CREATE INDEX idx_financial_insights_status ON financial_insights(status);
CREATE INDEX idx_financial_insights_created_at ON financial_insights(created_at DESC);

-- Indexes for Financial Goals
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_financial_goals_status ON financial_goals(status);
CREATE INDEX idx_financial_goals_target_date ON financial_goals(target_date);
CREATE INDEX idx_financial_goals_type ON financial_goals(goal_type);

-- Helper function to get financial overview
CREATE OR REPLACE FUNCTION get_financial_overview(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  total_revenue DECIMAL,
  total_expenses DECIMAL,
  net_profit DECIMAL,
  profit_margin DECIMAL,
  transaction_count INTEGER
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Default to current month if dates not provided
  v_start_date := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);

  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::DECIMAL as total_revenue,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::DECIMAL as total_expenses,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END), 0)::DECIMAL as net_profit,
    CASE
      WHEN SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) > 0 THEN
        ROUND((SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END) /
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) * 100)::NUMERIC, 2)
      ELSE 0
    END::DECIMAL as profit_margin,
    COUNT(*)::INTEGER as transaction_count
  FROM financial_transactions
  WHERE user_id = p_user_id
    AND transaction_date BETWEEN v_start_date AND v_end_date
    AND status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Helper function to get transactions by category
CREATE OR REPLACE FUNCTION get_category_breakdown(
  p_user_id UUID,
  p_type transaction_type,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE (
  category transaction_category,
  total_amount DECIMAL,
  transaction_count INTEGER,
  percentage DECIMAL
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
  v_total DECIMAL;
BEGIN
  v_start_date := COALESCE(p_start_date, date_trunc('month', CURRENT_DATE)::DATE);
  v_end_date := COALESCE(p_end_date, CURRENT_DATE);

  -- Get total for percentage calculation
  SELECT COALESCE(SUM(amount), 0) INTO v_total
  FROM financial_transactions
  WHERE user_id = p_user_id
    AND type = p_type
    AND transaction_date BETWEEN v_start_date AND v_end_date
    AND status = 'completed';

  RETURN QUERY
  SELECT
    t.category,
    SUM(t.amount)::DECIMAL as total_amount,
    COUNT(*)::INTEGER as transaction_count,
    CASE
      WHEN v_total > 0 THEN ROUND((SUM(t.amount) / v_total * 100)::NUMERIC, 2)
      ELSE 0
    END::DECIMAL as percentage
  FROM financial_transactions t
  WHERE t.user_id = p_user_id
    AND t.type = p_type
    AND t.transaction_date BETWEEN v_start_date AND v_end_date
    AND t.status = 'completed'
  GROUP BY t.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get monthly trend
CREATE OR REPLACE FUNCTION get_monthly_trend(
  p_user_id UUID,
  p_months INTEGER DEFAULT 6
) RETURNS TABLE (
  month DATE,
  revenue DECIMAL,
  expenses DECIMAL,
  profit DECIMAL,
  profit_margin DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('month', t.transaction_date)::DATE as month,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::DECIMAL as revenue,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::DECIMAL as expenses,
    COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END), 0)::DECIMAL as profit,
    CASE
      WHEN SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) > 0 THEN
        ROUND((SUM(CASE WHEN t.type = 'income' THEN t.amount WHEN t.type = 'expense' THEN -t.amount ELSE 0 END) /
               SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END) * 100)::NUMERIC, 2)
      ELSE 0
    END::DECIMAL as profit_margin
  FROM financial_transactions t
  WHERE t.user_id = p_user_id
    AND t.transaction_date >= date_trunc('month', CURRENT_DATE - (p_months || ' months')::INTERVAL)::DATE
    AND t.status = 'completed'
  GROUP BY month
  ORDER BY month DESC;
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

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON financial_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_insights_updated_at BEFORE UPDATE ON financial_insights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  NEW.progress_percentage = CASE
    WHEN NEW.target_amount > 0 THEN
      ROUND((NEW.current_amount / NEW.target_amount * 100)::NUMERIC, 2)
    ELSE 0
  END;

  -- Auto-complete if target reached
  IF NEW.progress_percentage >= 100 AND NEW.status = 'active' THEN
    NEW.status = 'completed';
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_goal_progress_trigger BEFORE INSERT OR UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_goal_progress();
