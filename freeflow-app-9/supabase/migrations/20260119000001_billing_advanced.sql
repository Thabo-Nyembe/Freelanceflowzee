-- Advanced Billing Schema Extension
-- Dunning management, tax configuration, multi-currency, proration, revenue analytics
-- Created: January 2026

-- =====================================================
-- ADDITIONAL ENUMS
-- =====================================================

DO $$ BEGIN
  CREATE TYPE failed_payment_status AS ENUM ('pending_retry', 'exhausted', 'recovered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE tax_type AS ENUM ('sales_tax', 'vat', 'gst', 'hst', 'pst', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE exemption_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- PLANS TABLE (Extended)
-- =====================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,

  -- Plan Details
  name TEXT NOT NULL,
  description TEXT,
  interval TEXT NOT NULL DEFAULT 'monthly' CHECK (interval IN ('monthly', 'yearly', 'quarterly')),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Features
  features JSONB DEFAULT '[]'::JSONB,
  limits JSONB DEFAULT '{}'::JSONB,

  -- Multi-currency pricing
  currency_prices JSONB DEFAULT '{}'::JSONB,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,

  -- Trial
  trial_days INTEGER DEFAULT 0,

  -- Stripe
  stripe_price_id TEXT,
  stripe_product_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- DUNNING MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS dunning_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,

  -- Settings
  enabled BOOLEAN NOT NULL DEFAULT true,
  max_retries INTEGER NOT NULL DEFAULT 4,
  retry_intervals INTEGER[] NOT NULL DEFAULT ARRAY[1, 3, 5, 7],
  grace_period_days INTEGER NOT NULL DEFAULT 14,
  cancel_after_failure BOOLEAN NOT NULL DEFAULT true,

  -- Email Templates
  email_templates JSONB DEFAULT '{
    "firstAttempt": "payment_failed_first",
    "retry": "payment_failed_retry",
    "finalWarning": "payment_final_warning",
    "cancelled": "subscription_cancelled_payment"
  }'::JSONB,

  -- Metadata
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS failed_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  invoice_id UUID,
  subscription_id UUID,
  customer_id UUID NOT NULL,
  payment_method_id UUID,

  -- Failure Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  failure_code TEXT,
  failure_message TEXT,

  -- Retry Management
  attempt_count INTEGER NOT NULL DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  last_retry_at TIMESTAMPTZ,

  -- Status
  status failed_payment_status NOT NULL DEFAULT 'pending_retry',

  -- Recovery
  recovered_at TIMESTAMPTZ,
  recovery_notes TEXT,
  recovered_by UUID,

  -- Skip
  skip_reason TEXT,
  skipped_at TIMESTAMPTZ,
  skipped_by UUID,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- TAX CONFIGURATION
-- =====================================================

CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,

  -- Location
  country TEXT NOT NULL,
  state TEXT,
  city TEXT,
  postal_code TEXT,

  -- Rate Details
  tax_type tax_type NOT NULL DEFAULT 'sales_tax',
  rate DECIMAL(5, 4) NOT NULL, -- e.g., 0.0825 for 8.25%
  name TEXT NOT NULL,
  description TEXT,

  -- Applicability
  applies_to TEXT[] DEFAULT ARRAY['all'],

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_inclusive BOOLEAN NOT NULL DEFAULT false,

  -- Effective Dates
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_until TIMESTAMPTZ,

  -- Stripe
  stripe_tax_rate_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  customer_id UUID NOT NULL,

  -- Exemption Details
  exemption_type TEXT NOT NULL,
  tax_id TEXT,
  tax_id_type TEXT,
  certificate_number TEXT,

  -- Document
  document_url TEXT,
  document_verified BOOLEAN NOT NULL DEFAULT false,

  -- Status
  status exemption_status NOT NULL DEFAULT 'pending',

  -- Jurisdiction
  jurisdiction TEXT NOT NULL,
  country TEXT NOT NULL,

  -- Validity
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,

  -- Verification
  verified_at TIMESTAMPTZ,
  verified_by UUID,
  rejection_reason TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- CUSTOMER CREDITS (Extended)
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  organization_id UUID,

  -- Credit Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  reason TEXT NOT NULL,

  -- Usage
  remaining_amount DECIMAL(10, 2),

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'expired', 'voided')),

  -- Expiry
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Initialize remaining_amount
CREATE OR REPLACE FUNCTION init_credit_remaining() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.remaining_amount IS NULL THEN
    NEW.remaining_amount = NEW.amount;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_init_credit_remaining ON customer_credits;
CREATE TRIGGER trigger_init_credit_remaining
  BEFORE INSERT ON customer_credits
  FOR EACH ROW EXECUTE FUNCTION init_credit_remaining();

-- =====================================================
-- REVENUE ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS revenue_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,

  -- Period
  period_date DATE NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'daily' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),

  -- Revenue Metrics
  mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  arr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  new_mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  expansion_mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  contraction_mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  churned_mrr DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_mrr_change DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Subscription Counts
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  new_subscriptions INTEGER NOT NULL DEFAULT 0,
  churned_subscriptions INTEGER NOT NULL DEFAULT 0,

  -- Customer Metrics
  total_customers INTEGER NOT NULL DEFAULT 0,
  new_customers INTEGER NOT NULL DEFAULT 0,
  churned_customers INTEGER NOT NULL DEFAULT 0,

  -- Rates
  churn_rate DECIMAL(5, 4) DEFAULT 0,
  expansion_rate DECIMAL(5, 4) DEFAULT 0,

  -- Averages
  arpu DECIMAL(10, 2) DEFAULT 0,
  ltv DECIMAL(12, 2) DEFAULT 0,

  -- Revenue
  total_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  refunded_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  net_revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, period_date, period_type)
);

CREATE TABLE IF NOT EXISTS cohort_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,

  -- Cohort Definition
  cohort_month DATE NOT NULL,
  month_number INTEGER NOT NULL, -- 0, 1, 2, ... (months since signup)

  -- Metrics
  customers_start INTEGER NOT NULL DEFAULT 0,
  customers_remaining INTEGER NOT NULL DEFAULT 0,
  retention_rate DECIMAL(5, 4) DEFAULT 0,

  -- Revenue
  revenue DECIMAL(12, 2) NOT NULL DEFAULT 0,
  revenue_per_customer DECIMAL(10, 2) DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(organization_id, cohort_month, month_number)
);

-- =====================================================
-- ADDONS
-- =====================================================

CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,

  -- Addon Details
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  interval TEXT DEFAULT 'monthly',

  -- Type
  addon_type TEXT NOT NULL DEFAULT 'recurring' CHECK (addon_type IN ('recurring', 'one_time', 'metered')),

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Stripe
  stripe_price_id TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL,
  addon_id UUID NOT NULL REFERENCES addons(id),

  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Dates
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  removed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- EMAIL QUEUE (for dunning notifications)
-- =====================================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  "to" TEXT NOT NULL,
  cc TEXT[],
  bcc TEXT[],

  -- Template
  template TEXT NOT NULL,
  data JSONB DEFAULT '{}'::JSONB,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error TEXT,

  -- Priority
  priority INTEGER NOT NULL DEFAULT 5,

  -- Retry
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID,
  organization_id UUID,
  customer_id UUID NOT NULL,

  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),

  -- Method
  payment_method_id UUID,

  -- Stripe
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,

  -- Error
  error_message TEXT,
  error_code TEXT,

  -- Dates
  processed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Plans
CREATE INDEX IF NOT EXISTS idx_plans_organization_id ON plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_plans_is_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_interval ON plans(interval);

-- Dunning
CREATE INDEX IF NOT EXISTS idx_dunning_settings_org ON dunning_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_org ON failed_payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_failed_payments_status ON failed_payments(status);
CREATE INDEX IF NOT EXISTS idx_failed_payments_next_retry ON failed_payments(next_retry_at);
CREATE INDEX IF NOT EXISTS idx_failed_payments_customer ON failed_payments(customer_id);

-- Tax
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON tax_rates(country);
CREATE INDEX IF NOT EXISTS idx_tax_rates_country_state ON tax_rates(country, state);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_customer ON tax_exemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_status ON tax_exemptions(status);

-- Credits
CREATE INDEX IF NOT EXISTS idx_customer_credits_customer ON customer_credits(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_credits_status ON customer_credits(status);

-- Revenue
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_org_date ON revenue_metrics(organization_id, period_date);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_period_type ON revenue_metrics(period_type);
CREATE INDEX IF NOT EXISTS idx_cohort_data_org_month ON cohort_data(organization_id, cohort_month);

-- Addons
CREATE INDEX IF NOT EXISTS idx_addons_org ON addons(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_sub ON subscription_addons(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_addon ON subscription_addons(addon_id);

-- Email Queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_priority ON email_queue(priority, created_at);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamp trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to new tables
DROP TRIGGER IF EXISTS update_dunning_settings_updated_at ON dunning_settings;
CREATE TRIGGER update_dunning_settings_updated_at
  BEFORE UPDATE ON dunning_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_failed_payments_updated_at ON failed_payments;
CREATE TRIGGER update_failed_payments_updated_at
  BEFORE UPDATE ON failed_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_rates_updated_at ON tax_rates;
CREATE TRIGGER update_tax_rates_updated_at
  BEFORE UPDATE ON tax_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tax_exemptions_updated_at ON tax_exemptions;
CREATE TRIGGER update_tax_exemptions_updated_at
  BEFORE UPDATE ON tax_exemptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_credits_updated_at ON customer_credits;
CREATE TRIGGER update_customer_credits_updated_at
  BEFORE UPDATE ON customer_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_addons_updated_at ON addons;
CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON addons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SEED DATA: Default Tax Rates
-- =====================================================

INSERT INTO tax_rates (country, state, tax_type, rate, name, description) VALUES
-- US States
('US', 'CA', 'sales_tax', 0.0725, 'California Sales Tax', 'State base rate'),
('US', 'NY', 'sales_tax', 0.08, 'New York Sales Tax', 'State + city base rate'),
('US', 'TX', 'sales_tax', 0.0625, 'Texas Sales Tax', 'State base rate'),
('US', 'FL', 'sales_tax', 0.06, 'Florida Sales Tax', 'State base rate'),
('US', 'WA', 'sales_tax', 0.065, 'Washington Sales Tax', 'State base rate'),
-- Canada
('CA', 'ON', 'hst', 0.13, 'Ontario HST', 'Harmonized Sales Tax'),
('CA', 'BC', 'gst', 0.05, 'British Columbia GST', 'Federal GST'),
('CA', 'QC', 'gst', 0.05, 'Quebec GST', 'Federal GST'),
-- EU
('DE', NULL, 'vat', 0.19, 'Germany VAT', 'Standard VAT rate'),
('FR', NULL, 'vat', 0.20, 'France VAT', 'Standard VAT rate'),
('GB', NULL, 'vat', 0.20, 'UK VAT', 'Standard VAT rate'),
('IT', NULL, 'vat', 0.22, 'Italy VAT', 'Standard VAT rate'),
('ES', NULL, 'vat', 0.21, 'Spain VAT', 'Standard VAT rate'),
('NL', NULL, 'vat', 0.21, 'Netherlands VAT', 'Standard VAT rate'),
-- Australia
('AU', NULL, 'gst', 0.10, 'Australia GST', 'Goods and Services Tax'),
-- Singapore
('SG', NULL, 'gst', 0.08, 'Singapore GST', 'Goods and Services Tax')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SEED DATA: Default Plans
-- =====================================================

INSERT INTO plans (name, description, interval, price, features, limits, trial_days) VALUES
('Free', 'Get started with basic features', 'monthly', 0,
  '["3 Projects", "1 GB Storage", "Basic Analytics", "Community Support"]',
  '{"projects": 3, "storage_gb": 1, "api_calls": 1000, "ai_tokens": 1000}',
  0),
('Starter', 'For individuals and small teams', 'monthly', 19,
  '["10 Projects", "10 GB Storage", "Advanced Analytics", "Email Support", "API Access"]',
  '{"projects": 10, "storage_gb": 10, "api_calls": 10000, "ai_tokens": 50000, "team_members": 3}',
  14),
('Professional', 'For growing businesses', 'monthly', 49,
  '["Unlimited Projects", "100 GB Storage", "Advanced Analytics", "Priority Support", "Full API Access", "Custom Branding", "Team Collaboration"]',
  '{"projects": -1, "storage_gb": 100, "api_calls": 100000, "ai_tokens": 500000, "team_members": 10}',
  14),
('Enterprise', 'For large organizations', 'monthly', 199,
  '["Unlimited Everything", "Unlimited Storage", "Custom Analytics", "24/7 Support", "Unlimited API", "White Labeling", "SSO & SAML", "Custom SLA"]',
  '{"projects": -1, "storage_gb": -1, "api_calls": -1, "ai_tokens": -1, "team_members": -1}',
  30)
ON CONFLICT DO NOTHING;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE dunning_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohort_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Plans: Public read, admin write
DROP POLICY IF EXISTS plans_select ON plans;
CREATE POLICY plans_select ON plans FOR SELECT USING (is_public = true OR organization_id IS NULL);

-- Customer credits: Users can view their own
DROP POLICY IF EXISTS customer_credits_select ON customer_credits;
CREATE POLICY customer_credits_select ON customer_credits FOR SELECT USING (customer_id = auth.uid());

-- Tax exemptions: Users can view their own
DROP POLICY IF EXISTS tax_exemptions_select ON tax_exemptions;
CREATE POLICY tax_exemptions_select ON tax_exemptions FOR SELECT USING (customer_id = auth.uid());

-- Payments: Users can view their own
DROP POLICY IF EXISTS payments_select ON payments;
CREATE POLICY payments_select ON payments FOR SELECT USING (customer_id = auth.uid());

-- Tax rates: Public read
DROP POLICY IF EXISTS tax_rates_select ON tax_rates;
CREATE POLICY tax_rates_select ON tax_rates FOR SELECT USING (is_active = true);
