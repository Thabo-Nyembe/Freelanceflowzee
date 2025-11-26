-- ============================================================================
-- CRYPTO PAYMENTS SYSTEM - SUPABASE MIGRATION
-- Complete cryptocurrency payment processing with multi-currency support
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE crypto_currency AS ENUM (
  'BTC',
  'ETH',
  'USDT',
  'USDC',
  'BNB',
  'SOL',
  'ADA',
  'DOGE',
  'XRP',
  'MATIC'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'confirming',
  'confirmed',
  'completed',
  'failed',
  'cancelled',
  'refunded',
  'expired'
);

CREATE TYPE transaction_type AS ENUM (
  'payment',
  'withdrawal',
  'refund',
  'fee',
  'transfer',
  'stake',
  'unstake'
);

CREATE TYPE wallet_type AS ENUM (
  'hot',
  'cold',
  'exchange',
  'hardware',
  'custodial'
);

CREATE TYPE network_type AS ENUM (
  'mainnet',
  'testnet'
);

-- ============================================================================
-- TABLE: crypto_wallets
-- ============================================================================

CREATE TABLE crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  currency crypto_currency NOT NULL,
  address TEXT NOT NULL,
  balance DECIMAL(30, 18) DEFAULT 0,
  locked_balance DECIMAL(30, 18) DEFAULT 0,
  available_balance DECIMAL(30, 18) GENERATED ALWAYS AS (balance - locked_balance) STORED,
  usd_value DECIMAL(15, 2) DEFAULT 0,
  type wallet_type NOT NULL DEFAULT 'hot',
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  network TEXT NOT NULL,
  network_type network_type DEFAULT 'mainnet',
  derivation_path TEXT,
  public_key TEXT,
  last_activity TIMESTAMPTZ,
  transaction_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, currency, address)
);

-- ============================================================================
-- TABLE: crypto_transactions
-- ============================================================================

CREATE TABLE crypto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(30, 18) NOT NULL,
  currency crypto_currency NOT NULL,
  usd_amount DECIMAL(15, 2) NOT NULL,
  fee DECIMAL(30, 18) DEFAULT 0,
  fee_usd DECIMAL(15, 2) DEFAULT 0,
  net_amount DECIMAL(30, 18) GENERATED ALWAYS AS (amount - fee) STORED,
  status payment_status NOT NULL DEFAULT 'pending',
  from_address TEXT,
  to_address TEXT NOT NULL,
  tx_hash TEXT UNIQUE,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  required_confirmations INTEGER DEFAULT 1,
  network TEXT NOT NULL,
  gas_price DECIMAL(30, 18),
  gas_used INTEGER,
  nonce INTEGER,
  description TEXT,
  memo TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- ============================================================================
-- TABLE: crypto_prices
-- ============================================================================

CREATE TABLE crypto_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency crypto_currency NOT NULL UNIQUE,
  usd DECIMAL(15, 8) NOT NULL,
  eur DECIMAL(15, 8) NOT NULL,
  gbp DECIMAL(15, 8) NOT NULL,
  change_24h DECIMAL(15, 8) DEFAULT 0,
  change_percent_24h DECIMAL(10, 4) DEFAULT 0,
  market_cap DECIMAL(20, 2) DEFAULT 0,
  volume_24h DECIMAL(20, 2) DEFAULT 0,
  high_24h DECIMAL(15, 8) DEFAULT 0,
  low_24h DECIMAL(15, 8) DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: payment_links
-- ============================================================================

CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(30, 18) NOT NULL,
  currency crypto_currency NOT NULL,
  fixed_amount BOOLEAN DEFAULT true,
  url TEXT NOT NULL UNIQUE,
  qr_code TEXT,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  redirect_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: recurring_payments
-- ============================================================================

CREATE TABLE recurring_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(30, 18) NOT NULL,
  currency crypto_currency NOT NULL,
  to_address TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_payment_date TIMESTAMPTZ NOT NULL,
  last_payment_date TIMESTAMPTZ,
  total_payments INTEGER DEFAULT 0,
  remaining_payments INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: exchange_rates
-- ============================================================================

CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency crypto_currency NOT NULL,
  to_currency crypto_currency NOT NULL,
  rate DECIMAL(30, 18) NOT NULL,
  inverse_rate DECIMAL(30, 18) NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- ============================================================================
-- TABLE: transaction_fees
-- ============================================================================

CREATE TABLE transaction_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency crypto_currency NOT NULL,
  network TEXT NOT NULL,
  slow_fee DECIMAL(30, 18) NOT NULL,
  slow_usd DECIMAL(15, 2) NOT NULL,
  slow_time TEXT NOT NULL,
  standard_fee DECIMAL(30, 18) NOT NULL,
  standard_usd DECIMAL(15, 2) NOT NULL,
  standard_time TEXT NOT NULL,
  fast_fee DECIMAL(30, 18) NOT NULL,
  fast_usd DECIMAL(15, 2) NOT NULL,
  fast_time TEXT NOT NULL,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(currency, network)
);

-- ============================================================================
-- TABLE: wallet_analytics
-- ============================================================================

CREATE TABLE wallet_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  period TEXT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_received DECIMAL(30, 18) DEFAULT 0,
  total_sent DECIMAL(30, 18) DEFAULT 0,
  total_fees DECIMAL(30, 18) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  average_transaction_size DECIMAL(30, 18) DEFAULT 0,
  largest_transaction DECIMAL(30, 18) DEFAULT 0,
  profit_loss DECIMAL(30, 18) DEFAULT 0,
  profit_loss_percent DECIMAL(10, 4) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: crypto_addresses
-- ============================================================================

CREATE TABLE crypto_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES crypto_wallets(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  label TEXT,
  is_change_address BOOLEAN DEFAULT false,
  index INTEGER,
  used_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wallet_id, address)
);

-- ============================================================================
-- TABLE: transaction_webhooks
-- ============================================================================

CREATE TABLE transaction_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id UUID NOT NULL REFERENCES crypto_transactions(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  retry_count INTEGER DEFAULT 0,
  response_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- crypto_wallets indexes
CREATE INDEX idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX idx_crypto_wallets_currency ON crypto_wallets(currency);
CREATE INDEX idx_crypto_wallets_type ON crypto_wallets(type);
CREATE INDEX idx_crypto_wallets_is_active ON crypto_wallets(is_active);
CREATE INDEX idx_crypto_wallets_is_primary ON crypto_wallets(is_primary);
CREATE INDEX idx_crypto_wallets_address ON crypto_wallets(address);
CREATE INDEX idx_crypto_wallets_tags ON crypto_wallets USING gin(tags);

-- crypto_transactions indexes
CREATE INDEX idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_wallet_id ON crypto_transactions(wallet_id);
CREATE INDEX idx_crypto_transactions_type ON crypto_transactions(type);
CREATE INDEX idx_crypto_transactions_currency ON crypto_transactions(currency);
CREATE INDEX idx_crypto_transactions_status ON crypto_transactions(status);
CREATE INDEX idx_crypto_transactions_tx_hash ON crypto_transactions(tx_hash);
CREATE INDEX idx_crypto_transactions_to_address ON crypto_transactions(to_address);
CREATE INDEX idx_crypto_transactions_from_address ON crypto_transactions(from_address);
CREATE INDEX idx_crypto_transactions_created_at ON crypto_transactions(created_at DESC);
CREATE INDEX idx_crypto_transactions_confirmations ON crypto_transactions(confirmations);
CREATE INDEX idx_crypto_transactions_expires_at ON crypto_transactions(expires_at);

-- crypto_prices indexes
CREATE INDEX idx_crypto_prices_currency ON crypto_prices(currency);
CREATE INDEX idx_crypto_prices_last_updated ON crypto_prices(last_updated DESC);

-- payment_links indexes
CREATE INDEX idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX idx_payment_links_url ON payment_links(url);
CREATE INDEX idx_payment_links_is_active ON payment_links(is_active);
CREATE INDEX idx_payment_links_expires_at ON payment_links(expires_at);

-- recurring_payments indexes
CREATE INDEX idx_recurring_payments_user_id ON recurring_payments(user_id);
CREATE INDEX idx_recurring_payments_wallet_id ON recurring_payments(wallet_id);
CREATE INDEX idx_recurring_payments_is_active ON recurring_payments(is_active);
CREATE INDEX idx_recurring_payments_next_payment_date ON recurring_payments(next_payment_date);

-- exchange_rates indexes
CREATE INDEX idx_exchange_rates_from_to ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);

-- transaction_fees indexes
CREATE INDEX idx_transaction_fees_currency_network ON transaction_fees(currency, network);

-- wallet_analytics indexes
CREATE INDEX idx_wallet_analytics_wallet_id ON wallet_analytics(wallet_id);
CREATE INDEX idx_wallet_analytics_period ON wallet_analytics(period);
CREATE INDEX idx_wallet_analytics_period_start ON wallet_analytics(period_start DESC);

-- crypto_addresses indexes
CREATE INDEX idx_crypto_addresses_wallet_id ON crypto_addresses(wallet_id);
CREATE INDEX idx_crypto_addresses_address ON crypto_addresses(address);

-- transaction_webhooks indexes
CREATE INDEX idx_transaction_webhooks_transaction_id ON transaction_webhooks(transaction_id);
CREATE INDEX idx_transaction_webhooks_status ON transaction_webhooks(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_webhooks ENABLE ROW LEVEL SECURITY;

-- crypto_wallets policies
CREATE POLICY "Users can view their own wallets"
  ON crypto_wallets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallets"
  ON crypto_wallets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallets"
  ON crypto_wallets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wallets"
  ON crypto_wallets FOR DELETE
  USING (auth.uid() = user_id);

-- crypto_transactions policies
CREATE POLICY "Users can view their own transactions"
  ON crypto_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create transactions"
  ON crypto_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON crypto_transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- crypto_prices policies
CREATE POLICY "Anyone can view crypto prices"
  ON crypto_prices FOR SELECT
  TO authenticated
  USING (true);

-- payment_links policies
CREATE POLICY "Users can manage their own payment links"
  ON payment_links FOR ALL
  USING (auth.uid() = user_id);

-- recurring_payments policies
CREATE POLICY "Users can manage their own recurring payments"
  ON recurring_payments FOR ALL
  USING (auth.uid() = user_id);

-- exchange_rates policies
CREATE POLICY "Anyone can view exchange rates"
  ON exchange_rates FOR SELECT
  TO authenticated
  USING (true);

-- transaction_fees policies
CREATE POLICY "Anyone can view transaction fees"
  ON transaction_fees FOR SELECT
  TO authenticated
  USING (true);

-- wallet_analytics policies
CREATE POLICY "Users can view analytics for their wallets"
  ON wallet_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = wallet_analytics.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  ));

-- crypto_addresses policies
CREATE POLICY "Users can view addresses for their wallets"
  ON crypto_addresses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM crypto_wallets
    WHERE crypto_wallets.id = crypto_addresses.wallet_id
    AND crypto_wallets.user_id = auth.uid()
  ));

-- transaction_webhooks policies
CREATE POLICY "Users can view webhooks for their transactions"
  ON transaction_webhooks FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crypto_wallets_updated_at
  BEFORE UPDATE ON crypto_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crypto_transactions_updated_at
  BEFORE UPDATE ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_payments_updated_at
  BEFORE UPDATE ON recurring_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update wallet transaction count
CREATE OR REPLACE FUNCTION update_wallet_transaction_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE crypto_wallets
  SET
    transaction_count = transaction_count + 1,
    last_activity = now()
  WHERE id = NEW.wallet_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_transaction_count
  AFTER INSERT ON crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_transaction_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get portfolio statistics
CREATE OR REPLACE FUNCTION get_portfolio_statistics(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_wallets', (SELECT COUNT(*) FROM crypto_wallets WHERE user_id = p_user_id),
      'active_wallets', (SELECT COUNT(*) FROM crypto_wallets WHERE user_id = p_user_id AND is_active = true),
      'total_value_usd', (SELECT COALESCE(SUM(usd_value), 0) FROM crypto_wallets WHERE user_id = p_user_id),
      'total_transactions', (SELECT COUNT(*) FROM crypto_transactions WHERE user_id = p_user_id),
      'pending_transactions', (SELECT COUNT(*) FROM crypto_transactions WHERE user_id = p_user_id AND status IN ('pending', 'confirming'))
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate transaction fees
CREATE OR REPLACE FUNCTION calculate_transaction_fee(
  p_currency crypto_currency,
  p_network TEXT,
  p_speed TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_fee RECORD;
BEGIN
  SELECT * INTO v_fee
  FROM transaction_fees
  WHERE currency = p_currency
  AND network = p_network;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Fee not found');
  END IF;

  RETURN CASE p_speed
    WHEN 'slow' THEN jsonb_build_object(
      'fee', v_fee.slow_fee,
      'usd', v_fee.slow_usd,
      'time', v_fee.slow_time
    )
    WHEN 'fast' THEN jsonb_build_object(
      'fee', v_fee.fast_fee,
      'usd', v_fee.fast_usd,
      'time', v_fee.fast_time
    )
    ELSE jsonb_build_object(
      'fee', v_fee.standard_fee,
      'usd', v_fee.standard_usd,
      'time', v_fee.standard_time
    )
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Convert between cryptocurrencies
CREATE OR REPLACE FUNCTION convert_currency(
  p_amount DECIMAL,
  p_from crypto_currency,
  p_to crypto_currency
)
RETURNS DECIMAL AS $$
DECLARE
  v_from_price DECIMAL;
  v_to_price DECIMAL;
  v_usd_value DECIMAL;
BEGIN
  SELECT usd INTO v_from_price FROM crypto_prices WHERE currency = p_from;
  SELECT usd INTO v_to_price FROM crypto_prices WHERE currency = p_to;

  IF v_from_price IS NULL OR v_to_price IS NULL THEN
    RETURN 0;
  END IF;

  v_usd_value := p_amount * v_from_price;
  RETURN v_usd_value / v_to_price;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get transaction history
CREATE OR REPLACE FUNCTION get_transaction_history(
  p_user_id UUID,
  p_currency crypto_currency DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  amount DECIMAL,
  currency crypto_currency,
  status payment_status,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.amount,
    t.currency,
    t.status,
    t.created_at
  FROM crypto_transactions t
  WHERE t.user_id = p_user_id
  AND (p_currency IS NULL OR t.currency = p_currency)
  ORDER BY t.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
