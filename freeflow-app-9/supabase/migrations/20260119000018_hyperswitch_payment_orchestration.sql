-- =============================================
-- Hyperswitch Payment Orchestration Migration
-- Multi-processor payment routing and management
-- =============================================

-- Payment Customers Table (links users to Hyperswitch)
CREATE TABLE IF NOT EXISTS payment_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hyperswitch_customer_id TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  phone TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Payment Intents Table
CREATE TABLE IF NOT EXISTS payment_intents (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id TEXT REFERENCES payment_customers(hyperswitch_customer_id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'requires_payment_method',
  description TEXT,
  metadata JSONB DEFAULT '{}',
  client_secret TEXT,
  capture_method TEXT DEFAULT 'automatic',
  connector TEXT,
  connector_transaction_id TEXT,
  payment_method_type TEXT,
  error_code TEXT,
  error_message TEXT,
  processing_time_ms INTEGER,
  captured_amount INTEGER,
  refunded_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES payment_customers(hyperswitch_customer_id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- card, bank_transfer, wallet, etc.
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  bank_name TEXT,
  wallet_type TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Refunds Table
CREATE TABLE IF NOT EXISTS payment_refunds (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  connector TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Disputes Table
CREATE TABLE IF NOT EXISTS payment_disputes (
  id TEXT PRIMARY KEY,
  payment_id TEXT NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'opened',
  reason TEXT,
  evidence JSONB DEFAULT '{}',
  due_date TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Routing Rules Table
CREATE TABLE IF NOT EXISTS payment_routing_rules (
  id TEXT PRIMARY KEY DEFAULT 'rule_' || gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  algorithm TEXT NOT NULL, -- volume_split, priority, round_robin, cost_based, success_rate
  connectors JSONB NOT NULL, -- Array of connector configs
  conditions JSONB DEFAULT '[]', -- Conditions for when to apply rule
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Webhook Events Table
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payment_id TEXT,
  refund_id TEXT,
  dispute_id TEXT,
  content JSONB NOT NULL,
  merchant_id TEXT,
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Analytics Table
CREATE TABLE IF NOT EXISTS payment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT,
  user_id UUID,
  event_type TEXT NOT NULL,
  amount INTEGER,
  currency TEXT,
  connector TEXT,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Payouts Table (connector settlements)
CREATE TABLE IF NOT EXISTS payment_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT DEFAULT 'received',
  metadata JSONB DEFAULT '{}',
  received_at TIMESTAMPTZ DEFAULT NOW()
);

-- Supported Connectors Table
CREATE TABLE IF NOT EXISTS payment_connectors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  supported_currencies TEXT[] DEFAULT ARRAY['USD'],
  supported_payment_methods TEXT[] DEFAULT ARRAY['card'],
  supported_countries TEXT[] DEFAULT ARRAY['US'],
  is_enabled BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_payment_customers_user_id ON payment_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_customer_id ON payment_intents(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created_at ON payment_intents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_connector ON payment_intents(connector);
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON payment_refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_refunds_user_id ON payment_refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_payment_id ON payment_disputes(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_payment_id ON payment_webhook_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_events_processed ON payment_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_payment_id ON payment_analytics(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_user_id ON payment_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_analytics_timestamp ON payment_analytics(timestamp DESC);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE payment_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_analytics ENABLE ROW LEVEL SECURITY;

-- Payment Customers Policies
CREATE POLICY "Users can view own payment customer" ON payment_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payment customer" ON payment_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment customer" ON payment_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Intents Policies
CREATE POLICY "Users can view own payments" ON payment_intents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own payments" ON payment_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payment_intents
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Methods Policies
CREATE POLICY "Users can view own payment methods" ON payment_methods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_customers pc
      WHERE pc.hyperswitch_customer_id = payment_methods.customer_id
      AND pc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own payment methods" ON payment_methods
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM payment_customers pc
      WHERE pc.hyperswitch_customer_id = payment_methods.customer_id
      AND pc.user_id = auth.uid()
    )
  );

-- Payment Refunds Policies
CREATE POLICY "Users can view own refunds" ON payment_refunds
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own refunds" ON payment_refunds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment Disputes Policies
CREATE POLICY "Users can view own disputes" ON payment_disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM payment_intents pi
      WHERE pi.id = payment_disputes.payment_id
      AND pi.user_id = auth.uid()
    )
  );

-- Routing Rules: Admin only via service role
CREATE POLICY "Admins can manage routing rules" ON payment_routing_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Analytics: Users see own, admins see all
CREATE POLICY "Users can view own analytics" ON payment_analytics
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- =============================================
-- Functions
-- =============================================

-- Get payment summary for a user
CREATE OR REPLACE FUNCTION get_payment_summary(p_user_id UUID, p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days', p_end_date TIMESTAMPTZ DEFAULT NOW())
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_payments', COUNT(*),
    'successful_payments', COUNT(*) FILTER (WHERE status IN ('succeeded', 'captured')),
    'failed_payments', COUNT(*) FILTER (WHERE status = 'failed'),
    'total_volume_cents', COALESCE(SUM(amount) FILTER (WHERE status IN ('succeeded', 'captured')), 0),
    'avg_transaction_cents', COALESCE(AVG(amount) FILTER (WHERE status IN ('succeeded', 'captured')), 0)::INTEGER,
    'success_rate', CASE
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status IN ('succeeded', 'captured'))::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0
    END,
    'refunded_amount_cents', COALESCE(SUM(refunded_amount), 0),
    'disputed_count', COUNT(*) FILTER (WHERE status = 'disputed')
  ) INTO result
  FROM payment_intents
  WHERE user_id = p_user_id
  AND created_at BETWEEN p_start_date AND p_end_date;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get connector performance metrics
CREATE OR REPLACE FUNCTION get_connector_performance(p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days', p_end_date TIMESTAMPTZ DEFAULT NOW())
RETURNS TABLE (
  connector TEXT,
  total_payments BIGINT,
  successful_payments BIGINT,
  failed_payments BIGINT,
  total_volume_cents BIGINT,
  success_rate NUMERIC,
  avg_processing_time_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pi.connector,
    COUNT(*)::BIGINT as total_payments,
    COUNT(*) FILTER (WHERE pi.status IN ('succeeded', 'captured'))::BIGINT as successful_payments,
    COUNT(*) FILTER (WHERE pi.status = 'failed')::BIGINT as failed_payments,
    COALESCE(SUM(pi.amount) FILTER (WHERE pi.status IN ('succeeded', 'captured')), 0)::BIGINT as total_volume_cents,
    CASE
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE pi.status IN ('succeeded', 'captured'))::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0
    END as success_rate,
    COALESCE(AVG(pi.processing_time_ms)::NUMERIC, 0) as avg_processing_time_ms
  FROM payment_intents pi
  WHERE pi.created_at BETWEEN p_start_date AND p_end_date
  AND pi.connector IS NOT NULL
  GROUP BY pi.connector
  ORDER BY total_volume_cents DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get daily payment trends
CREATE OR REPLACE FUNCTION get_daily_payment_trends(p_user_id UUID DEFAULT NULL, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  payment_count BIGINT,
  success_count BIGINT,
  volume_cents BIGINT,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(created_at) as date,
    COUNT(*)::BIGINT as payment_count,
    COUNT(*) FILTER (WHERE status IN ('succeeded', 'captured'))::BIGINT as success_count,
    COALESCE(SUM(amount) FILTER (WHERE status IN ('succeeded', 'captured')), 0)::BIGINT as volume_cents,
    CASE
      WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status IN ('succeeded', 'captured'))::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0
    END as success_rate
  FROM payment_intents
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
  AND (p_user_id IS NULL OR user_id = p_user_id)
  GROUP BY DATE(created_at)
  ORDER BY date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Seed Default Connectors
-- =============================================

INSERT INTO payment_connectors (id, name, display_name, supported_currencies, supported_payment_methods, supported_countries, priority)
VALUES
  ('stripe', 'stripe', 'Stripe', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'HKD', 'SGD', 'NZD', 'DKK', 'NOK', 'SEK', 'PLN', 'CZK', 'MXN', 'BRL'], ARRAY['card', 'bank_transfer', 'klarna', 'afterpay', 'apple_pay', 'google_pay'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK'], 100),
  ('adyen', 'adyen', 'Adyen', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'KRW', 'BRL', 'MXN', 'AED', 'SAR', 'ZAR'], ARRAY['card', 'bank_transfer', 'klarna', 'ideal', 'sofort', 'giropay', 'apple_pay', 'google_pay', 'alipay', 'wechat_pay'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK', 'CN', 'IN', 'KR', 'BR', 'MX', 'AE', 'SA', 'ZA'], 90),
  ('checkout', 'checkout', 'Checkout.com', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'HKD', 'SGD', 'AED', 'SAR'], ARRAY['card', 'apple_pay', 'google_pay', 'ideal', 'sofort', 'giropay', 'klarna', 'fawry'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'SG', 'HK', 'AE', 'SA', 'EG'], 85),
  ('braintree', 'braintree', 'Braintree (PayPal)', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD'], ARRAY['card', 'paypal', 'venmo', 'apple_pay', 'google_pay'], ARRAY['US', 'CA', 'GB', 'EU', 'AU'], 80),
  ('paypal', 'paypal', 'PayPal', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'BRL', 'MXN', 'INR', 'PHP', 'THB'], ARRAY['paypal', 'card', 'venmo', 'pay_later'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK', 'BR', 'MX', 'IN', 'PH', 'TH'], 75),
  ('square', 'square', 'Square', ARRAY['USD', 'CAD', 'GBP', 'AUD', 'JPY', 'EUR'], ARRAY['card', 'apple_pay', 'google_pay', 'cash_app', 'afterpay'], ARRAY['US', 'CA', 'GB', 'AU', 'JP', 'IE', 'FR', 'ES'], 70),
  ('mollie', 'mollie', 'Mollie', ARRAY['EUR', 'GBP', 'USD', 'CHF', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'], ARRAY['card', 'ideal', 'bancontact', 'sofort', 'giropay', 'eps', 'przelewy24', 'klarna', 'apple_pay'], ARRAY['NL', 'BE', 'DE', 'AT', 'CH', 'FR', 'ES', 'IT', 'PT', 'GB', 'IE', 'PL', 'CZ', 'HU', 'SE', 'NO', 'DK', 'FI'], 65),
  ('razorpay', 'razorpay', 'Razorpay', ARRAY['INR', 'USD'], ARRAY['card', 'upi', 'netbanking', 'wallet', 'emi'], ARRAY['IN'], 60),
  ('payu', 'payu', 'PayU', ARRAY['PLN', 'CZK', 'EUR', 'BRL', 'COP', 'MXN', 'ARS', 'CLP', 'PEN', 'INR', 'ZAR', 'TRY'], ARRAY['card', 'bank_transfer', 'blik', 'przelewy24', 'pix', 'oxxo', 'boleto'], ARRAY['PL', 'CZ', 'BR', 'CO', 'MX', 'AR', 'CL', 'PE', 'IN', 'ZA', 'TR'], 55),
  ('worldpay', 'worldpay', 'Worldpay', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'SGD', 'HKD'], ARRAY['card', 'apple_pay', 'google_pay', 'alipay', 'wechat_pay', 'klarna'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK', 'CN', 'IN'], 50),
  ('cybersource', 'cybersource', 'CyberSource', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'MXN', 'BRL'], ARRAY['card', 'apple_pay', 'google_pay', 'visa_checkout'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK', 'MX', 'BR'], 45),
  ('globalpay', 'globalpay', 'Global Payments', ARRAY['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD'], ARRAY['card', 'apple_pay', 'google_pay', 'click_to_pay'], ARRAY['US', 'CA', 'GB', 'IE', 'EU', 'AU', 'NZ', 'SG', 'HK'], 40),
  ('nmi', 'nmi', 'NMI', ARRAY['USD', 'CAD'], ARRAY['card', 'ach', 'apple_pay', 'google_pay'], ARRAY['US', 'CA'], 35),
  ('authorizedotnet', 'authorizedotnet', 'Authorize.net', ARRAY['USD', 'CAD', 'GBP', 'EUR', 'AUD'], ARRAY['card', 'ach', 'apple_pay', 'visa_checkout'], ARRAY['US', 'CA', 'GB', 'EU', 'AU'], 30),
  ('gocardless', 'gocardless', 'GoCardless', ARRAY['EUR', 'GBP', 'USD', 'SEK', 'DKK', 'AUD', 'NZD', 'CAD'], ARRAY['sepa_debit', 'bacs_debit', 'ach_debit', 'becs_debit', 'pad_debit', 'autogiro'], ARRAY['GB', 'EU', 'US', 'AU', 'NZ', 'CA', 'SE', 'DK'], 25),
  ('wise', 'wise', 'Wise (TransferWise)', ARRAY['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF', 'INR', 'BRL', 'MXN', 'PHP', 'THB', 'MYR', 'IDR'], ARRAY['bank_transfer'], ARRAY['US', 'CA', 'GB', 'EU', 'AU', 'NZ', 'JP', 'SG', 'HK', 'IN', 'BR', 'MX', 'PH', 'TH', 'MY', 'ID'], 20)
ON CONFLICT (id) DO UPDATE SET
  supported_currencies = EXCLUDED.supported_currencies,
  supported_payment_methods = EXCLUDED.supported_payment_methods,
  supported_countries = EXCLUDED.supported_countries,
  priority = EXCLUDED.priority,
  updated_at = NOW();

-- Create default routing rule
INSERT INTO payment_routing_rules (id, name, description, algorithm, connectors, conditions, priority, is_active)
VALUES (
  'default_priority_routing',
  'Default Priority Routing',
  'Route payments to connectors based on priority, with automatic failover',
  'priority',
  '[
    {"connector": "stripe", "weight": 100},
    {"connector": "adyen", "weight": 90},
    {"connector": "checkout", "weight": 80},
    {"connector": "braintree", "weight": 70}
  ]'::jsonb,
  '[]'::jsonb,
  100,
  true
)
ON CONFLICT (id) DO NOTHING;
