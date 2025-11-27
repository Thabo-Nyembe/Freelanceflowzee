-- Minimal Billing Settings Schema
-- Subscriptions, payment methods, invoices, transactions, usage tracking

-- ENUMS
DROP TYPE IF EXISTS plan_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS payment_method_type CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS billing_interval CASCADE;

CREATE TYPE plan_type AS ENUM ('free', 'professional', 'enterprise', 'custom');
CREATE TYPE subscription_status AS ENUM ('active', 'past_due', 'canceled', 'paused', 'trialing', 'expired');
CREATE TYPE payment_method_type AS ENUM ('card', 'bank_account', 'paypal', 'crypto', 'other');
CREATE TYPE invoice_status AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible', 'overdue');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed');
CREATE TYPE billing_interval AS ENUM ('monthly', 'quarterly', 'annual', 'lifetime');

-- TABLES
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payment_methods CASCADE;
DROP TABLE IF EXISTS billing_addresses CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS subscription_usage CASCADE;
DROP TABLE IF EXISTS billing_credits CASCADE;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Plan Details
  plan_type plan_type NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  billing_interval billing_interval NOT NULL DEFAULT 'monthly',

  -- Pricing
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Billing Cycle
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Cancellation
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  cancellation_reason TEXT,

  -- External IDs
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Method Details
  method_type payment_method_type NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,

  -- Card Details
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank Details
  bank_name TEXT,
  bank_last4 TEXT,

  -- Status
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- External IDs
  stripe_payment_method_id TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE billing_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Address Details
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,

  -- Tax Info
  tax_id TEXT,
  tax_id_type TEXT,

  -- Flags
  is_default BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

  -- Invoice Details
  invoice_number TEXT NOT NULL UNIQUE,
  status invoice_status NOT NULL DEFAULT 'draft',

  -- Amounts
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
  amount_due DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Dates
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Items
  line_items JSONB DEFAULT '[]'::JSONB,

  -- External IDs
  stripe_invoice_id TEXT,

  -- Files
  invoice_pdf_url TEXT,

  -- Metadata
  description TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,

  -- Transaction Details
  status transaction_status NOT NULL DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',

  -- Type
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'dispute', 'adjustment')),

  -- Dates
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Error Handling
  error_message TEXT,
  error_code TEXT,

  -- External IDs
  stripe_charge_id TEXT,
  stripe_payment_intent_id TEXT,

  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,

  -- Usage Period
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  -- Usage Metrics
  projects_used INTEGER NOT NULL DEFAULT 0,
  storage_used BIGINT NOT NULL DEFAULT 0,
  ai_requests_used INTEGER NOT NULL DEFAULT 0,
  collaborators_used INTEGER NOT NULL DEFAULT 0,
  video_minutes_used INTEGER NOT NULL DEFAULT 0,

  -- Limits
  projects_limit INTEGER NOT NULL DEFAULT 5,
  storage_limit BIGINT NOT NULL DEFAULT 10737418240, -- 10GB in bytes
  ai_requests_limit INTEGER NOT NULL DEFAULT 100,
  collaborators_limit INTEGER NOT NULL DEFAULT 3,
  video_minutes_limit INTEGER NOT NULL DEFAULT 60,

  -- Flags
  is_current_period BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE billing_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Credit Details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,

  -- Usage
  balance DECIMAL(10, 2) NOT NULL,
  used_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Expiry
  expires_at TIMESTAMPTZ,

  -- Source
  source TEXT,
  promo_code TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX idx_billing_addresses_user_id ON billing_addresses(user_id);
CREATE INDEX idx_billing_addresses_is_default ON billing_addresses(is_default);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX idx_subscription_usage_subscription_id ON subscription_usage(subscription_id);
CREATE INDEX idx_subscription_usage_is_current_period ON subscription_usage(is_current_period);
CREATE INDEX idx_billing_credits_user_id ON billing_credits(user_id);
CREATE INDEX idx_billing_credits_expires_at ON billing_credits(expires_at);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_billing_settings_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();
CREATE TRIGGER trigger_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();
CREATE TRIGGER trigger_billing_addresses_updated_at BEFORE UPDATE ON billing_addresses FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();
CREATE TRIGGER trigger_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();
CREATE TRIGGER trigger_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();
CREATE TRIGGER trigger_billing_credits_updated_at BEFORE UPDATE ON billing_credits FOR EACH ROW EXECUTE FUNCTION update_billing_settings_updated_at();

CREATE OR REPLACE FUNCTION deactivate_other_default_payment_methods() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE payment_methods
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_default_payment_methods AFTER INSERT OR UPDATE ON payment_methods FOR EACH ROW EXECUTE FUNCTION deactivate_other_default_payment_methods();

CREATE OR REPLACE FUNCTION deactivate_other_default_addresses() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE billing_addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deactivate_other_default_addresses AFTER INSERT OR UPDATE ON billing_addresses FOR EACH ROW EXECUTE FUNCTION deactivate_other_default_addresses();

CREATE OR REPLACE FUNCTION calculate_invoice_totals() RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.subtotal + NEW.tax - NEW.discount;
  NEW.amount_due = NEW.total - NEW.amount_paid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_totals BEFORE INSERT OR UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

CREATE OR REPLACE FUNCTION mark_invoice_paid() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    NEW.paid_at = now();
    NEW.amount_paid = NEW.total;
    NEW.amount_due = 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_invoice_paid BEFORE UPDATE OF status ON invoices FOR EACH ROW EXECUTE FUNCTION mark_invoice_paid();

CREATE OR REPLACE FUNCTION update_credit_balance() RETURNS TRIGGER AS $$
BEGIN
  NEW.balance = NEW.amount - NEW.used_amount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_credit_balance BEFORE INSERT OR UPDATE ON billing_credits FOR EACH ROW EXECUTE FUNCTION update_credit_balance();

CREATE OR REPLACE FUNCTION check_subscription_expiry() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_period_end < now() AND NEW.status = 'active' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_subscription_expiry BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION check_subscription_expiry();
