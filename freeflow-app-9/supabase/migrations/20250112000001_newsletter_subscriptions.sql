-- Newsletter Subscriptions Table
-- Stores email subscriptions to the KAZI newsletter
-- Version: 1.0.0
-- Created: 2025-01-12

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'website',
  subscription_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);
CREATE INDEX IF NOT EXISTS idx_newsletter_token ON newsletter_subscriptions(subscription_token);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- Enable RLS
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (public can subscribe, only authenticated users can view)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscriptions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own subscription"
  ON newsletter_subscriptions
  FOR SELECT
  TO authenticated
  USING (email = auth.email());

CREATE POLICY "Service role can manage all subscriptions"
  ON newsletter_subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- Add comments for documentation
COMMENT ON TABLE newsletter_subscriptions IS 'Stores newsletter email subscriptions';
COMMENT ON COLUMN newsletter_subscriptions.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN newsletter_subscriptions.status IS 'Subscription status: active, unsubscribed, or bounced';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Where the subscription came from (website, api, etc)';
COMMENT ON COLUMN newsletter_subscriptions.subscription_token IS 'Unique token for managing subscription';
COMMENT ON COLUMN newsletter_subscriptions.metadata IS 'Additional metadata (referrer, campaign, preferences, etc)';
