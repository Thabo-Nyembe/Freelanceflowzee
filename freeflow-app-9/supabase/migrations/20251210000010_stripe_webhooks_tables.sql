-- ============================================================================
-- Stripe Webhooks & Payments Database Schema
-- Production-ready tables for handling Stripe payments and subscriptions
-- ============================================================================

-- ============================================================================
-- DROP EXISTING TABLES (Clean Install)
-- ============================================================================

DROP TABLE IF EXISTS project_access CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;

-- ============================================================================
-- STRIPE WEBHOOK EVENTS (Audit Trail & Idempotency)
-- ============================================================================

CREATE TABLE stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  data JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_stripe_event_id ON stripe_webhook_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON stripe_webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at ON stripe_webhook_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed ON stripe_webhook_events(processed) WHERE NOT processed;

COMMENT ON TABLE stripe_webhook_events IS 'Audit trail for all Stripe webhook events, enables idempotency';
COMMENT ON COLUMN stripe_webhook_events.stripe_event_id IS 'Unique event ID from Stripe (e.g., evt_xxx)';
COMMENT ON COLUMN stripe_webhook_events.processed IS 'Whether the event has been successfully processed';

-- ============================================================================
-- PAYMENTS (One-time Payments)
-- ============================================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY payments_select_own
  ON payments FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Only service role can insert/update (webhooks)
CREATE POLICY payments_service_all
  ON payments FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

COMMENT ON TABLE payments IS 'One-time payment records from Stripe';

-- ============================================================================
-- SUBSCRIPTIONS (Recurring Payments)
-- ============================================================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscriptions
CREATE POLICY subscriptions_select_own
  ON subscriptions FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Only service role can modify
CREATE POLICY subscriptions_service_all
  ON subscriptions FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

COMMENT ON TABLE subscriptions IS 'Recurring subscription records from Stripe';

-- ============================================================================
-- INVOICES (Subscription Billing)
-- ============================================================================

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  amount_paid INTEGER NOT NULL,
  amount_due INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void', 'payment_failed')),
  error_message TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_subscription_id ON invoices(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Users can view invoices for their subscriptions
CREATE POLICY invoices_select_own
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE subscriptions.stripe_customer_id = invoices.stripe_customer_id
      AND subscriptions.user_id::text = auth.uid()::text
    )
  );

-- Only service role can modify
CREATE POLICY invoices_service_all
  ON invoices FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

COMMENT ON TABLE invoices IS 'Invoice records from Stripe subscriptions';

-- ============================================================================
-- PROJECT ACCESS (Granted via Payments)
-- ============================================================================

CREATE TABLE project_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('free', 'paid', 'trial', 'promotional')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_project_access_user_id ON project_access(user_id);
CREATE INDEX IF NOT EXISTS idx_project_access_project_id ON project_access(project_id);
CREATE INDEX IF NOT EXISTS idx_project_access_access_type ON project_access(access_type);
CREATE INDEX IF NOT EXISTS idx_project_access_expires_at ON project_access(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE project_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own access grants
CREATE POLICY project_access_select_own
  ON project_access FOR SELECT
  USING (auth.uid()::text = user_id::text AND NOT revoked);

-- Only service role can modify
CREATE POLICY project_access_service_all
  ON project_access FOR ALL
  USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

COMMENT ON TABLE project_access IS 'User access to projects (granted via payments or promotional)';

-- ============================================================================
-- ADD STRIPE CUSTOMER ID TO USERS TABLE
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
    CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
  END IF;
END $$;

COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for subscription management';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at for payments
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_updated_at_trigger ON payments;
CREATE TRIGGER payments_updated_at_trigger
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_payments_updated_at();

-- Auto-update updated_at for subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subscriptions_updated_at_trigger ON subscriptions;
CREATE TRIGGER subscriptions_updated_at_trigger
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Mark webhook event as processed
CREATE OR REPLACE FUNCTION mark_webhook_processed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.processed = TRUE AND OLD.processed = FALSE THEN
    NEW.processed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS webhook_processed_trigger ON stripe_webhook_events;
CREATE TRIGGER webhook_processed_trigger
  BEFORE UPDATE ON stripe_webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION mark_webhook_processed();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT SELECT ON stripe_webhook_events TO authenticated;
    GRANT SELECT ON payments TO authenticated;
    GRANT SELECT ON subscriptions TO authenticated;
    GRANT SELECT ON invoices TO authenticated;
    GRANT SELECT ON project_access TO authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL ON stripe_webhook_events TO service_role;
    GRANT ALL ON payments TO service_role;
    GRANT ALL ON subscriptions TO service_role;
    GRANT ALL ON invoices TO service_role;
    GRANT ALL ON project_access TO service_role;
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_name IN (
    'stripe_webhook_events',
    'payments',
    'subscriptions',
    'invoices',
    'project_access'
  );

  IF table_count = 5 THEN
    RAISE NOTICE '✅ STRIPE WEBHOOK SCHEMA MIGRATION SUCCESSFUL!';
    RAISE NOTICE '📊 Tables created:';
    RAISE NOTICE '  ✓ stripe_webhook_events (audit trail & idempotency)';
    RAISE NOTICE '  ✓ payments (one-time payments)';
    RAISE NOTICE '  ✓ subscriptions (recurring billing)';
    RAISE NOTICE '  ✓ invoices (subscription invoices)';
    RAISE NOTICE '  ✓ project_access (payment-gated content)';
    RAISE NOTICE '🔒 RLS enabled on all tables';
    RAISE NOTICE '✨ Ready for Stripe webhooks!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Get webhook secret from Stripe Dashboard';
    RAISE NOTICE '   2. Add STRIPE_WEBHOOK_SECRET to .env.local';
    RAISE NOTICE '   3. Test webhook: http://localhost:9323/api/payments/webhooks';
  ELSE
    RAISE EXCEPTION 'Migration failed - expected 5 tables, found %', table_count;
  END IF;
END $$;
