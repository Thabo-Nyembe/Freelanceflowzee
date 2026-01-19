-- ============================================
-- Lago Usage-Based Billing Migration
-- Phase 10.1: Enterprise-grade usage metering
-- ============================================

-- Billing customers (synced to Lago)
CREATE TABLE IF NOT EXISTS billing_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  lago_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  billing_configuration JSONB DEFAULT '{}'::jsonb,
  tax_identification_number TEXT,
  metadata JSONB DEFAULT '[]'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(organization_id)
);

-- Billing plans (synced from Lago)
CREATE TABLE IF NOT EXISTS billing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  interval TEXT NOT NULL CHECK (interval IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  amount_currency TEXT DEFAULT 'USD',
  trial_period INTEGER DEFAULT 0,
  pay_in_advance BOOLEAN DEFAULT false,
  charges JSONB DEFAULT '[]'::jsonb,
  minimum_commitment_cents INTEGER,
  tax_codes TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billable metrics (synced from Lago)
CREATE TABLE IF NOT EXISTS billable_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  aggregation_type TEXT NOT NULL CHECK (aggregation_type IN ('count_agg', 'sum_agg', 'max_agg', 'unique_count_agg', 'recurring_count_agg', 'weighted_sum_agg', 'custom_agg')),
  field_name TEXT,
  recurring BOOLEAN DEFAULT false,
  filters JSONB DEFAULT '[]'::jsonb,
  group_config JSONB,
  is_active BOOLEAN DEFAULT true,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing subscriptions
CREATE TABLE IF NOT EXISTS billing_subscriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL REFERENCES billing_plans(code),
  lago_subscription_id TEXT,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'canceled', 'terminated')),
  billing_time TEXT DEFAULT 'anniversary' CHECK (billing_time IN ('calendar', 'anniversary')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ending_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage events (local cache of Lago events)
CREATE TABLE IF NOT EXISTS billing_usage_events (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES billing_subscriptions(id),
  metric_code TEXT NOT NULL,
  units NUMERIC NOT NULL DEFAULT 1,
  amount_cents INTEGER,
  properties JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_to_lago BOOLEAN DEFAULT false,
  lago_event_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing invoices (synced from Lago)
CREATE TABLE IF NOT EXISTS billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lago_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  sequential_id INTEGER,
  number TEXT NOT NULL,
  issuing_date DATE NOT NULL,
  payment_due_date DATE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'finalized', 'voided', 'payment_dispute_lost')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'succeeded', 'failed', 'refunded')),
  amount_cents INTEGER NOT NULL DEFAULT 0,
  vat_amount_cents INTEGER DEFAULT 0,
  credit_amount_cents INTEGER DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  file_url TEXT,
  fees JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing wallets (prepaid credits)
CREATE TABLE IF NOT EXISTS billing_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lago_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  consumed_credits NUMERIC DEFAULT 0,
  credits_balance NUMERIC DEFAULT 0,
  rate_amount NUMERIC DEFAULT 1.0,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'terminated')),
  expiration_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet transactions
CREATE TABLE IF NOT EXISTS billing_wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES billing_wallets(id) ON DELETE CASCADE,
  lago_id TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('inbound', 'outbound')),
  amount NUMERIC NOT NULL,
  credit_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'settled',
  settled_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applied coupons
CREATE TABLE IF NOT EXISTS billing_applied_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lago_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  amount_cents INTEGER,
  amount_currency TEXT,
  percentage_rate NUMERIC,
  frequency TEXT CHECK (frequency IN ('once', 'recurring', 'forever')),
  frequency_duration INTEGER,
  expiration_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing webhook events (for idempotency)
CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT NOT NULL UNIQUE,
  webhook_type TEXT NOT NULL,
  object_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage aggregations (for quick reporting)
CREATE TABLE IF NOT EXISTS billing_usage_aggregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  metric_code TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_units NUMERIC NOT NULL DEFAULT 0,
  total_amount_cents INTEGER NOT NULL DEFAULT 0,
  event_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_code, period_start)
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_billing_customers_user ON billing_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_customers_org ON billing_customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_user ON billing_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_usage_events_user ON billing_usage_events(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_usage_events_metric ON billing_usage_events(metric_code);
CREATE INDEX IF NOT EXISTS idx_billing_usage_events_timestamp ON billing_usage_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_user ON billing_invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX IF NOT EXISTS idx_billing_wallets_user ON billing_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_aggregations_user_period ON billing_usage_aggregations(user_id, period_start, period_end);

-- ============================================
-- Functions
-- ============================================

-- Get usage summary for a user
CREATE OR REPLACE FUNCTION get_billing_usage_summary(
  p_user_id UUID,
  p_start_date DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_code TEXT,
  total_units NUMERIC,
  total_amount_cents INTEGER,
  event_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bue.metric_code,
    SUM(bue.units) as total_units,
    COALESCE(SUM(bue.amount_cents), 0)::INTEGER as total_amount_cents,
    COUNT(*) as event_count
  FROM billing_usage_events bue
  WHERE bue.user_id = p_user_id
    AND bue.timestamp >= p_start_date
    AND bue.timestamp < p_end_date + INTERVAL '1 day'
  GROUP BY bue.metric_code
  ORDER BY total_units DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get subscription billing summary
CREATE OR REPLACE FUNCTION get_subscription_billing_summary(
  p_user_id UUID
)
RETURNS TABLE (
  subscription_id TEXT,
  plan_code TEXT,
  plan_name TEXT,
  status TEXT,
  amount_cents INTEGER,
  currency TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  usage_total_cents INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.id as subscription_id,
    bs.plan_code,
    bp.name as plan_name,
    bs.status,
    bp.amount_cents,
    bp.amount_currency as currency,
    bs.current_period_start,
    bs.current_period_end,
    COALESCE((
      SELECT SUM(amount_cents)::INTEGER
      FROM billing_usage_events
      WHERE user_id = p_user_id
        AND timestamp >= bs.current_period_start
        AND timestamp < COALESCE(bs.current_period_end, CURRENT_TIMESTAMP)
    ), 0) as usage_total_cents
  FROM billing_subscriptions bs
  JOIN billing_plans bp ON bs.plan_code = bp.code
  WHERE bs.user_id = p_user_id
    AND bs.status = 'active'
  ORDER BY bs.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggregate usage for period
CREATE OR REPLACE FUNCTION aggregate_billing_usage(
  p_user_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO billing_usage_aggregations (
    user_id,
    metric_code,
    period_start,
    period_end,
    total_units,
    total_amount_cents,
    event_count
  )
  SELECT
    p_user_id,
    metric_code,
    p_period_start,
    p_period_end,
    SUM(units),
    COALESCE(SUM(amount_cents), 0)::INTEGER,
    COUNT(*)::INTEGER
  FROM billing_usage_events
  WHERE user_id = p_user_id
    AND timestamp >= p_period_start
    AND timestamp < p_period_end + INTERVAL '1 day'
  GROUP BY metric_code
  ON CONFLICT (user_id, metric_code, period_start)
  DO UPDATE SET
    total_units = EXCLUDED.total_units,
    total_amount_cents = EXCLUDED.total_amount_cents,
    event_count = EXCLUDED.event_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get invoice summary
CREATE OR REPLACE FUNCTION get_billing_invoice_summary(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  invoice_id UUID,
  lago_id TEXT,
  number TEXT,
  issuing_date DATE,
  status TEXT,
  payment_status TEXT,
  total_amount_cents INTEGER,
  currency TEXT,
  file_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bi.id as invoice_id,
    bi.lago_id,
    bi.number,
    bi.issuing_date,
    bi.status,
    bi.payment_status,
    bi.total_amount_cents,
    bi.currency,
    bi.file_url
  FROM billing_invoices bi
  WHERE bi.user_id = p_user_id
  ORDER BY bi.issuing_date DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get wallet balance
CREATE OR REPLACE FUNCTION get_billing_wallet_balance(
  p_user_id UUID
)
RETURNS TABLE (
  wallet_id UUID,
  name TEXT,
  balance_cents INTEGER,
  credits_balance NUMERIC,
  currency TEXT,
  status TEXT,
  expiration_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bw.id as wallet_id,
    bw.name,
    bw.balance_cents,
    bw.credits_balance,
    bw.currency,
    bw.status,
    bw.expiration_at
  FROM billing_wallets bw
  WHERE bw.user_id = p_user_id
    AND bw.status = 'active'
  ORDER BY bw.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE billing_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE billable_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_applied_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_usage_aggregations ENABLE ROW LEVEL SECURITY;

-- Users can view their own billing data
CREATE POLICY "Users can view own billing customer" ON billing_customers
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view billing plans" ON billing_plans
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view billable metrics" ON billable_metrics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own subscriptions" ON billing_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own usage events" ON billing_usage_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own invoices" ON billing_invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own wallets" ON billing_wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own wallet transactions" ON billing_wallet_transactions
  FOR SELECT USING (
    wallet_id IN (
      SELECT id FROM billing_wallets WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own applied coupons" ON billing_applied_coupons
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own usage aggregations" ON billing_usage_aggregations
  FOR SELECT USING (user_id = auth.uid());

-- Service role can do everything
CREATE POLICY "Service role full access billing_customers" ON billing_customers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_plans" ON billing_plans
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billable_metrics" ON billable_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_subscriptions" ON billing_subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_usage_events" ON billing_usage_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_invoices" ON billing_invoices
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_wallets" ON billing_wallets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_wallet_transactions" ON billing_wallet_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_applied_coupons" ON billing_applied_coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_webhook_events" ON billing_webhook_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access billing_usage_aggregations" ON billing_usage_aggregations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- Seed Default Plans
-- ============================================

INSERT INTO billing_plans (code, name, description, interval, amount_cents, amount_currency, trial_period, charges) VALUES
  ('free', 'Free', 'Perfect for getting started', 'monthly', 0, 'USD', 0, '[{"metric": "api_calls", "free_units": 1000}, {"metric": "storage_gb", "free_units": 5}]'::jsonb),
  ('starter', 'Starter', 'For freelancers and small teams', 'monthly', 2900, 'USD', 14, '[{"metric": "api_calls", "free_units": 10000}, {"metric": "storage_gb", "free_units": 50}, {"metric": "video_minutes", "free_units": 60}]'::jsonb),
  ('professional', 'Professional', 'For growing businesses', 'monthly', 7900, 'USD', 14, '[{"metric": "api_calls", "free_units": 100000}, {"metric": "storage_gb", "free_units": 250}, {"metric": "video_minutes", "free_units": 300}]'::jsonb),
  ('enterprise', 'Enterprise', 'For large organizations', 'monthly', 29900, 'USD', 0, '[{"metric": "api_calls", "free_units": 1000000}, {"metric": "storage_gb", "free_units": 1000}, {"metric": "video_minutes", "free_units": 1000}]'::jsonb)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  amount_cents = EXCLUDED.amount_cents,
  charges = EXCLUDED.charges,
  updated_at = NOW();

-- Seed Default Billable Metrics
INSERT INTO billable_metrics (code, name, description, aggregation_type, field_name) VALUES
  ('api_calls', 'API Calls', 'Number of API calls made', 'count_agg', NULL),
  ('storage_gb', 'Storage (GB)', 'Storage used in gigabytes', 'max_agg', 'gb_used'),
  ('video_minutes', 'Video Processing Minutes', 'Minutes of video processed', 'sum_agg', 'minutes'),
  ('ai_tokens', 'AI Tokens Used', 'AI tokens consumed', 'sum_agg', 'tokens'),
  ('team_members', 'Team Members', 'Number of team members', 'unique_count_agg', 'user_id'),
  ('projects', 'Active Projects', 'Number of active projects', 'unique_count_agg', 'project_id'),
  ('invoices_sent', 'Invoices Sent', 'Number of invoices sent', 'count_agg', NULL),
  ('contracts_created', 'Contracts Created', 'Number of contracts created', 'count_agg', NULL),
  ('bandwidth_gb', 'Bandwidth (GB)', 'Bandwidth used in gigabytes', 'sum_agg', 'gb_transferred'),
  ('messages_sent', 'Messages Sent', 'Number of messages sent', 'count_agg', NULL)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  aggregation_type = EXCLUDED.aggregation_type,
  field_name = EXCLUDED.field_name,
  updated_at = NOW();
