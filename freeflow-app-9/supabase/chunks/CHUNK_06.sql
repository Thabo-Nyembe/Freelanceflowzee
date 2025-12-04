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

DROP TYPE IF EXISTS crypto_currency CASCADE;
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

DROP TYPE IF EXISTS payment_status CASCADE;
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

DROP TYPE IF EXISTS transaction_type CASCADE;
CREATE TYPE transaction_type AS ENUM (
  'payment',
  'withdrawal',
  'refund',
  'fee',
  'transfer',
  'stake',
  'unstake'
);

DROP TYPE IF EXISTS wallet_type CASCADE;
CREATE TYPE wallet_type AS ENUM (
  'hot',
  'cold',
  'exchange',
  'hardware',
  'custodial'
);

DROP TYPE IF EXISTS network_type CASCADE;
CREATE TYPE network_type AS ENUM (
  'mainnet',
  'testnet'
);

-- ============================================================================
-- TABLE: crypto_wallets
-- ============================================================================

CREATE TABLE IF NOT EXISTS crypto_wallets (
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

CREATE TABLE IF NOT EXISTS crypto_transactions (
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

CREATE TABLE IF NOT EXISTS crypto_prices (
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

CREATE TABLE IF NOT EXISTS payment_links (
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

CREATE TABLE IF NOT EXISTS recurring_payments (
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

CREATE TABLE IF NOT EXISTS exchange_rates (
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

CREATE TABLE IF NOT EXISTS transaction_fees (
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

CREATE TABLE IF NOT EXISTS wallet_analytics (
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

CREATE TABLE IF NOT EXISTS crypto_addresses (
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

CREATE TABLE IF NOT EXISTS transaction_webhooks (
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
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_user_id ON crypto_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_currency ON crypto_wallets(currency);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_type ON crypto_wallets(type);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_is_active ON crypto_wallets(is_active);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_is_primary ON crypto_wallets(is_primary);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_address ON crypto_wallets(address);
CREATE INDEX IF NOT EXISTS idx_crypto_wallets_tags ON crypto_wallets USING gin(tags);

-- crypto_transactions indexes
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_user_id ON crypto_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_wallet_id ON crypto_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_type ON crypto_transactions(type);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_currency ON crypto_transactions(currency);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_status ON crypto_transactions(status);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_tx_hash ON crypto_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_to_address ON crypto_transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_from_address ON crypto_transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_created_at ON crypto_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_confirmations ON crypto_transactions(confirmations);
CREATE INDEX IF NOT EXISTS idx_crypto_transactions_expires_at ON crypto_transactions(expires_at);

-- crypto_prices indexes
CREATE INDEX IF NOT EXISTS idx_crypto_prices_currency ON crypto_prices(currency);
CREATE INDEX IF NOT EXISTS idx_crypto_prices_last_updated ON crypto_prices(last_updated DESC);

-- payment_links indexes
CREATE INDEX IF NOT EXISTS idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_url ON payment_links(url);
CREATE INDEX IF NOT EXISTS idx_payment_links_is_active ON payment_links(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_links_expires_at ON payment_links(expires_at);

-- recurring_payments indexes
CREATE INDEX IF NOT EXISTS idx_recurring_payments_user_id ON recurring_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_wallet_id ON recurring_payments(wallet_id);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_is_active ON recurring_payments(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_payments_next_payment_date ON recurring_payments(next_payment_date);

-- exchange_rates indexes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_to ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_updated ON exchange_rates(last_updated DESC);

-- transaction_fees indexes
CREATE INDEX IF NOT EXISTS idx_transaction_fees_currency_network ON transaction_fees(currency, network);

-- wallet_analytics indexes
CREATE INDEX IF NOT EXISTS idx_wallet_analytics_wallet_id ON wallet_analytics(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_analytics_period ON wallet_analytics(period);
CREATE INDEX IF NOT EXISTS idx_wallet_analytics_period_start ON wallet_analytics(period_start DESC);

-- crypto_addresses indexes
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_wallet_id ON crypto_addresses(wallet_id);
CREATE INDEX IF NOT EXISTS idx_crypto_addresses_address ON crypto_addresses(address);

-- transaction_webhooks indexes
CREATE INDEX IF NOT EXISTS idx_transaction_webhooks_transaction_id ON transaction_webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transaction_webhooks_status ON transaction_webhooks(status);

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
-- =====================================================
-- CV PORTFOLIO SYSTEM MIGRATION
-- World-Class A+++ Professional Portfolio Platform
-- =====================================================
-- Features:
-- - 11 comprehensive tables
-- - 5 custom enums
-- - 35+ indexes for performance
-- - 25+ RLS policies for security
-- - 6+ triggers for automation
-- - Public portfolio URLs
-- - Analytics tracking
-- - Full-text search
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CUSTOM ENUMS
-- =====================================================

DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM ('draft', 'published', 'featured', 'archived');
DROP TYPE IF EXISTS skill_category CASCADE;
CREATE TYPE skill_category AS ENUM ('Technical', 'Soft', 'Languages', 'Tools');
DROP TYPE IF EXISTS employment_type CASCADE;
CREATE TYPE employment_type AS ENUM ('full-time', 'part-time', 'contract', 'freelance');
DROP TYPE IF EXISTS availability_status CASCADE;
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'unavailable');
DROP TYPE IF EXISTS theme_mode CASCADE;
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'auto');
DROP TYPE IF EXISTS testimonial_relationship CASCADE;
CREATE TYPE testimonial_relationship AS ENUM ('colleague', 'manager', 'client', 'mentor');
DROP TYPE IF EXISTS contact_preference CASCADE;
CREATE TYPE contact_preference AS ENUM ('email', 'phone', 'linkedin');

-- =====================================================
-- PORTFOLIOS TABLE
-- Main portfolio configuration and profile data
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,

  -- Profile Information
  title TEXT NOT NULL,
  subtitle TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,

  -- Contact Information
  email TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  website TEXT,
  timezone TEXT,
  availability availability_status DEFAULT 'available',
  preferred_contact contact_preference DEFAULT 'email',

  -- Social Links
  github_url TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  behance_url TEXT,
  dribbble_url TEXT,
  medium_url TEXT,
  stackoverflow_url TEXT,
  youtube_url TEXT,
  instagram_url TEXT,
  facebook_url TEXT,

  -- Settings
  is_public BOOLEAN DEFAULT true,
  show_contact BOOLEAN DEFAULT true,
  show_social BOOLEAN DEFAULT true,
  show_analytics BOOLEAN DEFAULT true,
  allow_download BOOLEAN DEFAULT true,
  allow_share BOOLEAN DEFAULT true,
  watermark BOOLEAN DEFAULT false,
  theme theme_mode DEFAULT 'auto',
  custom_domain TEXT,

  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_published_at TIMESTAMPTZ,

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9-]+$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_public ON portfolios(is_public);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at DESC);

-- =====================================================
-- PORTFOLIO PROJECTS TABLE
-- Showcase projects and work samples
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Project Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  status project_status DEFAULT 'draft',

  -- Links
  live_url TEXT,
  github_url TEXT,
  demo_url TEXT,

  -- Technologies
  technologies TEXT[] DEFAULT '{}',

  -- Project Info
  duration TEXT,
  role TEXT,
  team_size INTEGER,
  highlights TEXT[] DEFAULT '{}',

  -- Engagement
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_display_order CHECK (display_order >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_portfolio_id ON portfolio_projects(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_status ON portfolio_projects(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON portfolio_projects(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_category ON portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON portfolio_projects(display_order);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_views ON portfolio_projects(views DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_created_at ON portfolio_projects(created_at DESC);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_search ON portfolio_projects
  USING gin(to_tsvector('english', title || ' ' || description));

-- =====================================================
-- PORTFOLIO SKILLS TABLE
-- Skills and expertise tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Skill Details
  name TEXT NOT NULL,
  category skill_category NOT NULL,
  proficiency INTEGER NOT NULL CHECK (proficiency >= 1 AND proficiency <= 5),

  -- Experience
  years_of_experience DECIMAL(3,1) DEFAULT 0,
  last_used TEXT,

  -- Social Proof
  endorsed BOOLEAN DEFAULT false,
  endorsement_count INTEGER DEFAULT 0,
  trending BOOLEAN DEFAULT false,

  -- Related Projects
  related_project_ids UUID[] DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_portfolio_id ON portfolio_skills(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_category ON portfolio_skills(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_proficiency ON portfolio_skills(proficiency DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_endorsements ON portfolio_skills(endorsement_count DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_skills_trending ON portfolio_skills(trending);

-- =====================================================
-- PORTFOLIO EXPERIENCE TABLE
-- Work history and professional experience
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Company Information
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  industry TEXT,
  company_size TEXT,

  -- Position Details
  position TEXT NOT NULL,
  employment_type employment_type NOT NULL,
  location TEXT NOT NULL,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  -- Description
  description TEXT NOT NULL,
  responsibilities TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',

  -- Technologies
  technologies TEXT[] DEFAULT '{}',

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_experience_portfolio_id ON portfolio_experience(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_experience_is_current ON portfolio_experience(is_current);
CREATE INDEX IF NOT EXISTS idx_portfolio_experience_start_date ON portfolio_experience(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_experience_order ON portfolio_experience(display_order);

-- =====================================================
-- PORTFOLIO EDUCATION TABLE
-- Educational background and qualifications
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Institution
  institution_name TEXT NOT NULL,
  institution_logo_url TEXT,
  location TEXT NOT NULL,

  -- Degree
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT false,

  -- Academic Details
  gpa TEXT,
  honors TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  coursework TEXT[] DEFAULT '{}',
  thesis TEXT,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_education_portfolio_id ON portfolio_education(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_education_is_current ON portfolio_education(is_current);
CREATE INDEX IF NOT EXISTS idx_portfolio_education_start_date ON portfolio_education(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_education_order ON portfolio_education(display_order);

-- =====================================================
-- PORTFOLIO CERTIFICATIONS TABLE
-- Professional certifications and awards
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Certification Details
  title TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issuer_logo_url TEXT,

  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,

  -- Credentials
  credential_id TEXT,
  credential_url TEXT,
  verified BOOLEAN DEFAULT false,

  -- Details
  description TEXT,
  skills TEXT[] DEFAULT '{}',

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_certifications_portfolio_id ON portfolio_certifications(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_certifications_issue_date ON portfolio_certifications(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_certifications_verified ON portfolio_certifications(verified);
CREATE INDEX IF NOT EXISTS idx_portfolio_certifications_expiry ON portfolio_certifications(expiry_date);

-- =====================================================
-- PORTFOLIO TESTIMONIALS TABLE
-- Client and colleague testimonials
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Author Information
  author_name TEXT NOT NULL,
  author_title TEXT,
  author_company TEXT,
  author_avatar_url TEXT,

  -- Testimonial
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  relationship testimonial_relationship NOT NULL,

  -- Status
  featured BOOLEAN DEFAULT false,
  approved BOOLEAN DEFAULT true,

  -- Display
  display_order INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_portfolio_id ON portfolio_testimonials(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_featured ON portfolio_testimonials(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_approved ON portfolio_testimonials(approved);
CREATE INDEX IF NOT EXISTS idx_portfolio_testimonials_rating ON portfolio_testimonials(rating DESC);

-- =====================================================
-- PORTFOLIO ANALYTICS TABLE
-- Track portfolio views and engagement
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- View Tracking
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  project_views INTEGER DEFAULT 0,

  -- Engagement
  contact_clicks INTEGER DEFAULT 0,
  social_clicks INTEGER DEFAULT 0,
  cv_downloads INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,

  -- Time Tracking
  avg_time_on_page INTEGER DEFAULT 0, -- in seconds
  bounce_rate DECIMAL(5,2) DEFAULT 0,

  -- Top Content
  top_projects TEXT[] DEFAULT '{}',
  top_skills TEXT[] DEFAULT '{}',

  -- Geographic Data
  visitor_countries JSONB DEFAULT '{}',

  -- Metadata
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_total_views ON portfolio_analytics(total_views DESC);

-- =====================================================
-- PORTFOLIO VIEW EVENTS TABLE
-- Detailed view tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Visitor Info
  visitor_id UUID, -- Anonymous visitor tracking
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Location
  country TEXT,
  city TEXT,

  -- View Details
  page_url TEXT,
  session_duration INTEGER, -- in seconds

  -- Metadata
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_view_events_portfolio_id ON portfolio_view_events(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_view_events_viewed_at ON portfolio_view_events(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_view_events_country ON portfolio_view_events(country);

-- =====================================================
-- PORTFOLIO THEMES TABLE
-- Custom theme configurations
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Theme Details
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT false,

  -- Colors
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,

  -- Typography
  font_family TEXT,
  heading_font TEXT,
  body_font TEXT,

  -- Layout
  layout_style TEXT, -- 'modern', 'classic', 'creative', 'minimal'
  sidebar_position TEXT, -- 'left', 'right', 'none'

  -- Custom CSS
  custom_css TEXT,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_themes_portfolio_id ON portfolio_themes(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_themes_is_active ON portfolio_themes(is_active);

-- =====================================================
-- PORTFOLIO SHARES TABLE
-- Track portfolio shares
-- =====================================================

CREATE TABLE IF NOT EXISTS portfolio_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Share Details
  platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'email', 'link', etc.
  share_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,

  -- Analytics
  click_count INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_portfolio_id ON portfolio_shares(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_token ON portfolio_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_portfolio_shares_platform ON portfolio_shares(platform);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_skills_updated_at
  BEFORE UPDATE ON portfolio_skills
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_experience_updated_at
  BEFORE UPDATE ON portfolio_experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_education_updated_at
  BEFORE UPDATE ON portfolio_education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_certifications_updated_at
  BEFORE UPDATE ON portfolio_certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to increment project views
CREATE OR REPLACE FUNCTION increment_project_views(project_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE portfolio_projects
  SET views = views + 1
  WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment portfolio views
CREATE OR REPLACE FUNCTION increment_portfolio_views(p_portfolio_id UUID, p_visitor_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Update analytics
  UPDATE portfolio_analytics
  SET
    total_views = total_views + 1,
    last_updated = NOW()
  WHERE portfolio_id = p_portfolio_id;

  -- If no analytics record exists, create one
  IF NOT FOUND THEN
    INSERT INTO portfolio_analytics (portfolio_id, total_views)
    VALUES (p_portfolio_id, 1);
  END IF;

  -- Log view event
  INSERT INTO portfolio_view_events (portfolio_id, visitor_id, viewed_at)
  VALUES (p_portfolio_id, p_visitor_id, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get portfolio statistics
CREATE OR REPLACE FUNCTION get_portfolio_stats(p_portfolio_id UUID)
RETURNS TABLE (
  total_projects BIGINT,
  featured_projects BIGINT,
  total_skills BIGINT,
  total_experience BIGINT,
  total_certifications BIGINT,
  total_views BIGINT,
  avg_project_views NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id AND status = 'published'),
    (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id AND featured = true),
    (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id),
    (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id),
    (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id),
    (SELECT COALESCE(total_views, 0) FROM portfolio_analytics WHERE portfolio_id = p_portfolio_id),
    (SELECT COALESCE(AVG(views), 0) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate completeness score
CREATE OR REPLACE FUNCTION calculate_completeness_score(p_portfolio_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  portfolio_rec RECORD;
BEGIN
  SELECT * INTO portfolio_rec FROM portfolios WHERE id = p_portfolio_id;

  -- Profile (20%)
  IF portfolio_rec.bio IS NOT NULL AND LENGTH(portfolio_rec.bio) >= 100 THEN
    score := score + 10;
  END IF;
  IF portfolio_rec.avatar_url IS NOT NULL THEN
    score := score + 5;
  END IF;
  IF portfolio_rec.cover_image_url IS NOT NULL THEN
    score := score + 5;
  END IF;

  -- Experience (25%)
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_experience WHERE portfolio_id = p_portfolio_id AND array_length(achievements, 1) > 0) > 0 THEN
    score := score + 5;
  END IF;

  -- Education (15%)
  IF (SELECT COUNT(*) FROM portfolio_education WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 10;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_education WHERE portfolio_id = p_portfolio_id AND array_length(achievements, 1) > 0) > 0 THEN
    score := score + 5;
  END IF;

  -- Skills (15%)
  IF (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id) >= 5 THEN
    score := score + 8;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_skills WHERE portfolio_id = p_portfolio_id) >= 10 THEN
    score := score + 7;
  END IF;

  -- Projects (15%)
  IF (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 8;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_projects WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 7;
  END IF;

  -- Certifications (10%)
  IF (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id) >= 1 THEN
    score := score + 5;
  END IF;
  IF (SELECT COUNT(*) FROM portfolio_certifications WHERE portfolio_id = p_portfolio_id) >= 3 THEN
    score := score + 5;
  END IF;

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique slug
CREATE OR REPLACE FUNCTION generate_unique_slug(base_slug TEXT)
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  counter INTEGER := 0;
BEGIN
  new_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM portfolios WHERE slug = new_slug) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_view_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_shares ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PORTFOLIOS POLICIES
-- =====================================================

-- Public can view public portfolios
CREATE POLICY "Public portfolios are viewable by everyone"
  ON portfolios FOR SELECT
  USING (is_public = true);

-- Users can view their own portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own portfolios
CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own portfolios
CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- PORTFOLIO PROJECTS POLICIES
-- =====================================================

-- Public can view published projects of public portfolios
CREATE POLICY "Public projects are viewable"
  ON portfolio_projects FOR SELECT
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.is_public = true
    )
  );

-- Users can view their own projects
CREATE POLICY "Users can view own projects"
  ON portfolio_projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Users can manage their own projects
CREATE POLICY "Users can manage own projects"
  ON portfolio_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_projects.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO SKILLS POLICIES
-- =====================================================

CREATE POLICY "Public skills are viewable"
  ON portfolio_skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_skills.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own skills"
  ON portfolio_skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_skills.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO EXPERIENCE POLICIES
-- =====================================================

CREATE POLICY "Public experience is viewable"
  ON portfolio_experience FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_experience.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own experience"
  ON portfolio_experience FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_experience.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO EDUCATION POLICIES
-- =====================================================

CREATE POLICY "Public education is viewable"
  ON portfolio_education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_education.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own education"
  ON portfolio_education FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_education.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO CERTIFICATIONS POLICIES
-- =====================================================

CREATE POLICY "Public certifications are viewable"
  ON portfolio_certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_certifications.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own certifications"
  ON portfolio_certifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_certifications.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO TESTIMONIALS POLICIES
-- =====================================================

CREATE POLICY "Approved testimonials are viewable"
  ON portfolio_testimonials FOR SELECT
  USING (
    approved = true AND
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_testimonials.portfolio_id
      AND portfolios.is_public = true
    )
  );

CREATE POLICY "Users can manage own testimonials"
  ON portfolio_testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_testimonials.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO ANALYTICS POLICIES
-- =====================================================

CREATE POLICY "Users can view own analytics"
  ON portfolio_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own analytics"
  ON portfolio_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_analytics.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO VIEW EVENTS POLICIES
-- =====================================================

-- Anyone can insert view events
CREATE POLICY "Anyone can log view events"
  ON portfolio_view_events FOR INSERT
  WITH CHECK (true);

-- Only owners can view their analytics
CREATE POLICY "Users can view own view events"
  ON portfolio_view_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_view_events.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO THEMES POLICIES
-- =====================================================

CREATE POLICY "Users can manage own themes"
  ON portfolio_themes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_themes.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- PORTFOLIO SHARES POLICIES
-- =====================================================

-- Anyone can view shares by token
CREATE POLICY "Shares are viewable by token"
  ON portfolio_shares FOR SELECT
  USING (true);

-- Users can manage own shares
CREATE POLICY "Users can manage own shares"
  ON portfolio_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_shares.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant access to tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE portfolios IS 'Main portfolio configuration and profile data';
COMMENT ON TABLE portfolio_projects IS 'Showcase projects and work samples';
COMMENT ON TABLE portfolio_skills IS 'Skills and expertise tracking';
COMMENT ON TABLE portfolio_experience IS 'Work history and professional experience';
COMMENT ON TABLE portfolio_education IS 'Educational background and qualifications';
COMMENT ON TABLE portfolio_certifications IS 'Professional certifications and awards';
COMMENT ON TABLE portfolio_testimonials IS 'Client and colleague testimonials';
COMMENT ON TABLE portfolio_analytics IS 'Portfolio views and engagement metrics';
COMMENT ON TABLE portfolio_view_events IS 'Detailed view tracking for analytics';
COMMENT ON TABLE portfolio_themes IS 'Custom theme configurations';
COMMENT ON TABLE portfolio_shares IS 'Portfolio share tracking and tokens';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
-- ============================================================================
-- MAIN DASHBOARD SYSTEM - SUPABASE MIGRATION
-- Complete dashboard overview with analytics and insights
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
  'project',
  'payment',
  'feedback',
  'message',
  'system',
  'action',
  'client'
);

DROP TYPE IF EXISTS activity_status CASCADE;
CREATE TYPE activity_status AS ENUM (
  'success',
  'info',
  'warning',
  'error'
);

DROP TYPE IF EXISTS activity_impact CASCADE;
CREATE TYPE activity_impact AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

DROP TYPE IF EXISTS project_status CASCADE;
CREATE TYPE project_status AS ENUM (
  'Not Started',
  'In Progress',
  'Review',
  'Completed',
  'On Hold',
  'Cancelled'
);

DROP TYPE IF EXISTS project_priority CASCADE;
CREATE TYPE project_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

DROP TYPE IF EXISTS project_category CASCADE;
CREATE TYPE project_category AS ENUM (
  'design',
  'development',
  'marketing',
  'content',
  'consulting',
  'other'
);

DROP TYPE IF EXISTS insight_type CASCADE;
CREATE TYPE insight_type AS ENUM (
  'revenue',
  'productivity',
  'client',
  'performance',
  'trend',
  'opportunity',
  'risk'
);

DROP TYPE IF EXISTS insight_impact CASCADE;
CREATE TYPE insight_impact AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

DROP TYPE IF EXISTS quick_action_category CASCADE;
CREATE TYPE quick_action_category AS ENUM (
  'project',
  'client',
  'financial',
  'communication',
  'ai',
  'content'
);

DROP TYPE IF EXISTS metric_trend CASCADE;
CREATE TYPE metric_trend AS ENUM (
  'up',
  'down',
  'stable'
);

DROP TYPE IF EXISTS notification_priority CASCADE;
CREATE TYPE notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

DROP TYPE IF EXISTS goal_status CASCADE;
CREATE TYPE goal_status AS ENUM (
  'on-track',
  'at-risk',
  'off-track',
  'completed'
);

-- ============================================================================
-- TABLE: dashboard_activities
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type activity_type NOT NULL,
  message TEXT NOT NULL,
  description TEXT,
  time TIMESTAMPTZ NOT NULL DEFAULT now(),
  status activity_status NOT NULL DEFAULT 'info',
  impact activity_impact NOT NULL DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::JSONB,
  related_id TEXT,
  related_type TEXT,
  action_url TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client TEXT NOT NULL,
  client_id UUID,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status project_status NOT NULL DEFAULT 'Not Started',
  value DECIMAL(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  priority project_priority NOT NULL DEFAULT 'medium',
  category project_category NOT NULL DEFAULT 'other',
  ai_automation BOOLEAN DEFAULT false,
  collaboration INTEGER DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  estimated_completion TEXT,
  description TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_starred BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  completed_tasks INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  hours_logged DECIMAL(10, 2) DEFAULT 0,
  hours_estimated DECIMAL(10, 2) DEFAULT 0,
  budget DECIMAL(12, 2) DEFAULT 0,
  spent DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_insights
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type insight_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  impact insight_impact NOT NULL DEFAULT 'medium',
  action TEXT NOT NULL,
  action_url TEXT,
  confidence INTEGER DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 100),
  acted_upon BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::JSONB,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  category TEXT NOT NULL,
  related_metrics TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_ai_generated BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value DECIMAL(15, 2) NOT NULL,
  previous_value DECIMAL(15, 2) DEFAULT 0,
  change DECIMAL(15, 2) DEFAULT 0,
  change_percent DECIMAL(10, 2) DEFAULT 0,
  trend metric_trend NOT NULL DEFAULT 'stable',
  unit TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_positive BOOLEAN DEFAULT true,
  target DECIMAL(15, 2),
  target_progress INTEGER,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_quick_actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_quick_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  category quick_action_category NOT NULL,
  url TEXT NOT NULL,
  shortcut TEXT,
  is_premium BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  estimated_time TEXT,
  complexity TEXT DEFAULT 'simple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_url TEXT,
  action_label TEXT,
  priority notification_priority NOT NULL DEFAULT 'normal'
);

-- ============================================================================
-- TABLE: dashboard_goals
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target DECIMAL(15, 2) NOT NULL,
  current DECIMAL(15, 2) DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  unit TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status goal_status NOT NULL DEFAULT 'on-track',
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_goal_milestones
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_goal_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES dashboard_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target DECIMAL(15, 2) NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_timeline_events
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  type activity_type NOT NULL,
  status activity_status NOT NULL DEFAULT 'info',
  related_id TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: dashboard_stats
-- ============================================================================

CREATE TABLE IF NOT EXISTS dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  earnings DECIMAL(15, 2) DEFAULT 0,
  earnings_trend DECIMAL(10, 2) DEFAULT 0,
  active_projects INTEGER DEFAULT 0,
  active_projects_trend DECIMAL(10, 2) DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  completed_projects_trend DECIMAL(10, 2) DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  total_clients_trend DECIMAL(10, 2) DEFAULT 0,
  hours_this_month DECIMAL(10, 2) DEFAULT 0,
  hours_this_month_trend DECIMAL(10, 2) DEFAULT 0,
  revenue_this_month DECIMAL(15, 2) DEFAULT 0,
  revenue_this_month_trend DECIMAL(10, 2) DEFAULT 0,
  average_project_value DECIMAL(15, 2) DEFAULT 0,
  average_project_value_trend DECIMAL(10, 2) DEFAULT 0,
  client_satisfaction DECIMAL(3, 2) DEFAULT 0,
  client_satisfaction_trend DECIMAL(10, 2) DEFAULT 0,
  productivity_score INTEGER DEFAULT 0,
  productivity_score_trend DECIMAL(10, 2) DEFAULT 0,
  pending_tasks INTEGER DEFAULT 0,
  overdue_tasks INTEGER DEFAULT 0,
  upcoming_meetings INTEGER DEFAULT 0,
  unread_messages INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- dashboard_activities indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_user_id ON dashboard_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_type ON dashboard_activities(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_status ON dashboard_activities(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_impact ON dashboard_activities(impact);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_is_read ON dashboard_activities(is_read);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_time ON dashboard_activities(time DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_activities_related ON dashboard_activities(related_id, related_type);

-- dashboard_projects indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_user_id ON dashboard_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_status ON dashboard_projects(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_priority ON dashboard_projects(priority);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_category ON dashboard_projects(category);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_client_id ON dashboard_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_deadline ON dashboard_projects(deadline);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_is_starred ON dashboard_projects(is_starred);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_is_pinned ON dashboard_projects(is_pinned);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_tags ON dashboard_projects USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_progress ON dashboard_projects(progress DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_projects_value ON dashboard_projects(value DESC);

-- dashboard_insights indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_user_id ON dashboard_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_type ON dashboard_insights(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_impact ON dashboard_insights(impact);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_acted_upon ON dashboard_insights(acted_upon);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_priority ON dashboard_insights(priority DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_confidence ON dashboard_insights(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_created_at ON dashboard_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_expires_at ON dashboard_insights(expires_at);

-- dashboard_metrics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_user_id ON dashboard_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_category ON dashboard_metrics(category);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_name ON dashboard_metrics(name);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_last_updated ON dashboard_metrics(last_updated DESC);

-- dashboard_quick_actions indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_quick_actions_user_id ON dashboard_quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_quick_actions_category ON dashboard_quick_actions(category);
CREATE INDEX IF NOT EXISTS idx_dashboard_quick_actions_usage_count ON dashboard_quick_actions(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_quick_actions_is_new ON dashboard_quick_actions(is_new);

-- dashboard_notifications indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_user_id ON dashboard_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_is_read ON dashboard_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_priority ON dashboard_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_dashboard_notifications_created_at ON dashboard_notifications(created_at DESC);

-- dashboard_goals indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_goals_user_id ON dashboard_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_goals_status ON dashboard_goals(status);
CREATE INDEX IF NOT EXISTS idx_dashboard_goals_deadline ON dashboard_goals(deadline);
CREATE INDEX IF NOT EXISTS idx_dashboard_goals_category ON dashboard_goals(category);

-- dashboard_goal_milestones indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_goal_milestones_goal_id ON dashboard_goal_milestones(goal_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_goal_milestones_completed ON dashboard_goal_milestones(completed);

-- dashboard_timeline_events indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_timeline_events_user_id ON dashboard_timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_timeline_events_type ON dashboard_timeline_events(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_timeline_events_timestamp ON dashboard_timeline_events(timestamp DESC);

-- dashboard_stats indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_user_id ON dashboard_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_stats_last_updated ON dashboard_stats(last_updated DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE dashboard_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;

-- dashboard_activities policies
CREATE POLICY "Users can view their own activities"
  ON dashboard_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities"
  ON dashboard_activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities"
  ON dashboard_activities FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_projects policies
CREATE POLICY "Users can view their own projects"
  ON dashboard_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON dashboard_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON dashboard_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON dashboard_projects FOR DELETE
  USING (auth.uid() = user_id);

-- dashboard_insights policies
CREATE POLICY "Users can view their own insights"
  ON dashboard_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insights"
  ON dashboard_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON dashboard_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_metrics policies
CREATE POLICY "Users can view their own metrics"
  ON dashboard_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own metrics"
  ON dashboard_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metrics"
  ON dashboard_metrics FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_quick_actions policies
CREATE POLICY "Users can view quick actions"
  ON dashboard_quick_actions FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can track their own action usage"
  ON dashboard_quick_actions FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_notifications policies
CREATE POLICY "Users can view their own notifications"
  ON dashboard_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON dashboard_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- dashboard_goals policies
CREATE POLICY "Users can manage their own goals"
  ON dashboard_goals FOR ALL
  USING (auth.uid() = user_id);

-- dashboard_goal_milestones policies
CREATE POLICY "Users can manage milestones for their goals"
  ON dashboard_goal_milestones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM dashboard_goals
    WHERE dashboard_goals.id = dashboard_goal_milestones.goal_id
    AND dashboard_goals.user_id = auth.uid()
  ));

-- dashboard_timeline_events policies
CREATE POLICY "Users can view their own timeline events"
  ON dashboard_timeline_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own timeline events"
  ON dashboard_timeline_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- dashboard_stats policies
CREATE POLICY "Users can view their own stats"
  ON dashboard_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON dashboard_stats FOR ALL
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

CREATE TRIGGER update_dashboard_projects_updated_at
  BEFORE UPDATE ON dashboard_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_insights_updated_at
  BEFORE UPDATE ON dashboard_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_quick_actions_updated_at
  BEFORE UPDATE ON dashboard_quick_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_goals_updated_at
  BEFORE UPDATE ON dashboard_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update project progress based on completed tasks
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_tasks > 0 THEN
    NEW.progress := ROUND((NEW.completed_tasks::DECIMAL / NEW.total_tasks::DECIMAL) * 100);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_progress
  BEFORE INSERT OR UPDATE OF completed_tasks, total_tasks ON dashboard_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_progress();

-- Update goal progress based on current value
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target > 0 THEN
    NEW.progress := LEAST(100, ROUND((NEW.current::DECIMAL / NEW.target::DECIMAL) * 100));
  END IF;

  -- Update goal status based on progress and deadline
  IF NEW.progress >= 100 THEN
    NEW.status := 'completed';
  ELSIF NEW.deadline < now() AND NEW.progress < 100 THEN
    NEW.status := 'off-track';
  ELSIF NEW.progress < 50 AND (NEW.deadline - now()) < INTERVAL '7 days' THEN
    NEW.status := 'at-risk';
  ELSE
    NEW.status := 'on-track';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_goal_progress
  BEFORE INSERT OR UPDATE OF current, target, deadline ON dashboard_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();

-- Track quick action usage
CREATE OR REPLACE FUNCTION track_quick_action_usage()
RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count := NEW.usage_count + 1;
  NEW.last_used := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user dashboard overview
CREATE OR REPLACE FUNCTION get_dashboard_overview(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'activities', (
        SELECT json_agg(row_to_json(a))
        FROM (
          SELECT * FROM dashboard_activities
          WHERE user_id = p_user_id
          ORDER BY time DESC
          LIMIT 10
        ) a
      ),
      'projects', (
        SELECT json_agg(row_to_json(p))
        FROM (
          SELECT * FROM dashboard_projects
          WHERE user_id = p_user_id
          AND status = 'In Progress'
          ORDER BY deadline ASC
          LIMIT 5
        ) p
      ),
      'insights', (
        SELECT json_agg(row_to_json(i))
        FROM (
          SELECT * FROM dashboard_insights
          WHERE user_id = p_user_id
          AND acted_upon = false
          ORDER BY priority DESC, confidence DESC
          LIMIT 5
        ) i
      ),
      'stats', (
        SELECT row_to_json(s)
        FROM dashboard_stats s
        WHERE s.user_id = p_user_id
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate and update dashboard statistics
CREATE OR REPLACE FUNCTION calculate_dashboard_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_earnings DECIMAL(15, 2);
  v_active_projects INTEGER;
  v_completed_projects INTEGER;
  v_total_clients INTEGER;
  v_hours_this_month DECIMAL(10, 2);
BEGIN
  -- Calculate earnings from completed projects
  SELECT COALESCE(SUM(value), 0)
  INTO v_earnings
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'Completed';

  -- Count active projects
  SELECT COUNT(*)
  INTO v_active_projects
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'In Progress';

  -- Count completed projects
  SELECT COUNT(*)
  INTO v_completed_projects
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND status = 'Completed';

  -- Count unique clients
  SELECT COUNT(DISTINCT client_id)
  INTO v_total_clients
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND client_id IS NOT NULL;

  -- Sum hours this month
  SELECT COALESCE(SUM(hours_logged), 0)
  INTO v_hours_this_month
  FROM dashboard_projects
  WHERE user_id = p_user_id
  AND created_at >= date_trunc('month', now());

  -- Upsert stats
  INSERT INTO dashboard_stats (
    user_id,
    earnings,
    active_projects,
    completed_projects,
    total_clients,
    hours_this_month,
    last_updated
  ) VALUES (
    p_user_id,
    v_earnings,
    v_active_projects,
    v_completed_projects,
    v_total_clients,
    v_hours_this_month,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    earnings = EXCLUDED.earnings,
    active_projects = EXCLUDED.active_projects,
    completed_projects = EXCLUDED.completed_projects,
    total_clients = EXCLUDED.total_clients,
    hours_this_month = EXCLUDED.hours_this_month,
    last_updated = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get high-impact unread activities
CREATE OR REPLACE FUNCTION get_high_impact_activities(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  type activity_type,
  message TEXT,
  time TIMESTAMPTZ,
  impact activity_impact
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.type,
    a.message,
    a.time,
    a.impact
  FROM dashboard_activities a
  WHERE a.user_id = p_user_id
  AND a.is_read = false
  AND a.impact IN ('high', 'critical')
  ORDER BY
    CASE a.impact
      WHEN 'critical' THEN 1
      WHEN 'high' THEN 2
      ELSE 3
    END,
    a.time DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get projects at risk
CREATE OR REPLACE FUNCTION get_projects_at_risk(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  client TEXT,
  progress INTEGER,
  deadline TIMESTAMPTZ,
  risk_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.client,
    p.progress,
    p.deadline,
    CASE
      WHEN p.deadline < now() AND p.status != 'Completed' THEN 100
      WHEN p.deadline < now() + INTERVAL '7 days' AND p.progress < 80 THEN 75
      WHEN p.deadline < now() + INTERVAL '14 days' AND p.progress < 50 THEN 50
      ELSE 25
    END as risk_score
  FROM dashboard_projects p
  WHERE p.user_id = p_user_id
  AND p.status IN ('In Progress', 'Not Started', 'Review')
  ORDER BY risk_score DESC, p.deadline ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search across dashboard content
CREATE OR REPLACE FUNCTION search_dashboard(
  p_user_id UUID,
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'projects', (
        SELECT json_agg(row_to_json(p))
        FROM (
          SELECT id, name, client, status, progress
          FROM dashboard_projects
          WHERE user_id = p_user_id
          AND (
            name ILIKE '%' || p_search_term || '%'
            OR client ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
            OR p_search_term = ANY(tags)
          )
          LIMIT p_limit
        ) p
      ),
      'activities', (
        SELECT json_agg(row_to_json(a))
        FROM (
          SELECT id, type, message, time
          FROM dashboard_activities
          WHERE user_id = p_user_id
          AND (
            message ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
          )
          ORDER BY time DESC
          LIMIT p_limit
        ) a
      ),
      'insights', (
        SELECT json_agg(row_to_json(i))
        FROM (
          SELECT id, type, title, description
          FROM dashboard_insights
          WHERE user_id = p_user_id
          AND (
            title ILIKE '%' || p_search_term || '%'
            OR description ILIKE '%' || p_search_term || '%'
          )
          LIMIT p_limit
        ) i
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- ============================================================================
-- Email Agent Setup System - Production Database Schema
-- ============================================================================
-- Comprehensive setup wizard management for email agent integrations including
-- email providers, AI, calendar, payments, SMS, and CRM systems
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS setup_step CASCADE;
CREATE TYPE setup_step AS ENUM ('welcome', 'email', 'ai', 'calendar', 'payments', 'sms', 'crm', 'review', 'complete');
DROP TYPE IF EXISTS integration_type CASCADE;
CREATE TYPE integration_type AS ENUM ('email', 'ai', 'calendar', 'payment', 'sms', 'crm');
DROP TYPE IF EXISTS integration_status CASCADE;
CREATE TYPE integration_status AS ENUM ('not_configured', 'configuring', 'testing', 'connected', 'error', 'disconnected');
DROP TYPE IF EXISTS email_provider CASCADE;
CREATE TYPE email_provider AS ENUM ('gmail', 'outlook', 'imap', 'resend', 'sendgrid');
DROP TYPE IF EXISTS ai_provider CASCADE;
CREATE TYPE ai_provider AS ENUM ('openai', 'anthropic', 'both', 'google', 'cohere');
DROP TYPE IF EXISTS calendar_provider CASCADE;
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple', 'none');
DROP TYPE IF EXISTS payment_provider CASCADE;
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'square', 'none');
DROP TYPE IF EXISTS sms_provider CASCADE;
CREATE TYPE sms_provider AS ENUM ('twilio', 'vonage', 'messagebird', 'none');
DROP TYPE IF EXISTS crm_provider CASCADE;
CREATE TYPE crm_provider AS ENUM ('hubspot', 'salesforce', 'pipedrive', 'zoho', 'none');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Setup Progress
CREATE TABLE IF NOT EXISTS setup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step setup_step NOT NULL DEFAULT 'welcome',
  completed_steps setup_step[] DEFAULT '{}',
  total_steps INTEGER NOT NULL DEFAULT 9,
  percentage INTEGER NOT NULL DEFAULT 0 CHECK (percentage >= 0 AND percentage <= 100),
  required_integrations INTEGER NOT NULL DEFAULT 2,
  configured_integrations INTEGER NOT NULL DEFAULT 0,
  optional_integrations INTEGER NOT NULL DEFAULT 4,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'not_configured',
  required BOOLEAN NOT NULL DEFAULT FALSE,
  icon TEXT NOT NULL,
  description TEXT,
  error TEXT,
  connected_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Integration Config
CREATE TABLE IF NOT EXISTS integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE UNIQUE,
  provider TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}',
  settings JSONB NOT NULL DEFAULT '{}',
  webhook_url TEXT,
  api_endpoint TEXT,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Test Results
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  success BOOLEAN NOT NULL,
  latency INTEGER, -- milliseconds
  error TEXT,
  details JSONB DEFAULT '{}',
  tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Configs
CREATE TABLE IF NOT EXISTS email_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider email_provider NOT NULL,
  email TEXT,
  api_key TEXT,
  password TEXT, -- encrypted
  host TEXT,
  port INTEGER,
  secure BOOLEAN DEFAULT TRUE,
  auto_reply BOOLEAN DEFAULT FALSE,
  forward_to TEXT,
  signature TEXT,
  max_emails_per_day INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Configs
CREATE TABLE IF NOT EXISTS ai_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider ai_provider NOT NULL,
  api_key TEXT NOT NULL, -- encrypted
  model TEXT,
  temperature DECIMAL(3, 2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
  max_tokens INTEGER DEFAULT 2000,
  enable_sentiment_analysis BOOLEAN DEFAULT TRUE,
  enable_auto_response BOOLEAN DEFAULT TRUE,
  response_style TEXT DEFAULT 'professional' CHECK (response_style IN ('professional', 'friendly', 'casual')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar Configs
CREATE TABLE IF NOT EXISTS calendar_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider calendar_provider NOT NULL,
  credentials JSONB DEFAULT '{}',
  default_duration INTEGER DEFAULT 60, -- minutes
  buffer_time INTEGER DEFAULT 15, -- minutes
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment Configs
CREATE TABLE IF NOT EXISTS payment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider payment_provider NOT NULL,
  api_key TEXT, -- encrypted
  secret_key TEXT, -- encrypted
  webhook_secret TEXT, -- encrypted
  currency TEXT DEFAULT 'USD',
  accepted_methods TEXT[] DEFAULT ARRAY['card'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SMS Configs
CREATE TABLE IF NOT EXISTS sms_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider sms_provider NOT NULL,
  account_sid TEXT, -- encrypted
  auth_token TEXT, -- encrypted
  phone_number TEXT,
  enable_whatsapp BOOLEAN DEFAULT FALSE,
  default_country_code TEXT DEFAULT '+1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM Configs
CREATE TABLE IF NOT EXISTS crm_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  provider crm_provider NOT NULL,
  api_key TEXT, -- encrypted
  domain TEXT,
  sync_interval INTEGER DEFAULT 3600, -- seconds
  auto_create_contacts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Provider Templates (read-only reference data)
CREATE TABLE IF NOT EXISTS provider_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type integration_type NOT NULL,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  recommended BOOLEAN NOT NULL DEFAULT FALSE,
  features TEXT[] DEFAULT '{}',
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  estimated_time INTEGER NOT NULL, -- minutes
  requirements TEXT[] DEFAULT '{}',
  pricing_tier TEXT CHECK (pricing_tier IN ('free', 'paid', 'freemium')),
  starting_price TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(type, provider)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Setup Progress indexes
CREATE INDEX IF NOT EXISTS idx_setup_progress_user_id ON setup_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_setup_progress_current_step ON setup_progress(current_step);
CREATE INDEX IF NOT EXISTS idx_setup_progress_is_complete ON setup_progress(is_complete);

-- Integrations indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_provider ON integrations(provider);
CREATE INDEX IF NOT EXISTS idx_integrations_required ON integrations(required);
CREATE INDEX IF NOT EXISTS idx_integrations_user_type ON integrations(user_id, type);
CREATE INDEX IF NOT EXISTS idx_integrations_user_status ON integrations(user_id, status);

-- Integration Config indexes
CREATE INDEX IF NOT EXISTS idx_integration_config_integration_id ON integration_config(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_config_enabled ON integration_config(enabled);

-- Test Results indexes
CREATE INDEX IF NOT EXISTS idx_test_results_integration_id ON test_results(integration_id);
CREATE INDEX IF NOT EXISTS idx_test_results_success ON test_results(success);
CREATE INDEX IF NOT EXISTS idx_test_results_tested_at ON test_results(tested_at DESC);

-- Email Configs indexes
CREATE INDEX IF NOT EXISTS idx_email_configs_user_id ON email_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_configs_provider ON email_configs(provider);

-- AI Configs indexes
CREATE INDEX IF NOT EXISTS idx_ai_configs_user_id ON ai_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_configs_provider ON ai_configs(provider);

-- Calendar Configs indexes
CREATE INDEX IF NOT EXISTS idx_calendar_configs_user_id ON calendar_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_configs_provider ON calendar_configs(provider);

-- Payment Configs indexes
CREATE INDEX IF NOT EXISTS idx_payment_configs_user_id ON payment_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_configs_provider ON payment_configs(provider);

-- SMS Configs indexes
CREATE INDEX IF NOT EXISTS idx_sms_configs_user_id ON sms_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_configs_provider ON sms_configs(provider);

-- CRM Configs indexes
CREATE INDEX IF NOT EXISTS idx_crm_configs_user_id ON crm_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_crm_configs_provider ON crm_configs(provider);

-- Provider Templates indexes
CREATE INDEX IF NOT EXISTS idx_provider_templates_type ON provider_templates(type);
CREATE INDEX IF NOT EXISTS idx_provider_templates_provider ON provider_templates(provider);
CREATE INDEX IF NOT EXISTS idx_provider_templates_recommended ON provider_templates(recommended);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_setup_progress_updated_at
  BEFORE UPDATE ON setup_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_config_updated_at
  BEFORE UPDATE ON integration_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_configs_updated_at
  BEFORE UPDATE ON email_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_configs_updated_at
  BEFORE UPDATE ON ai_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_configs_updated_at
  BEFORE UPDATE ON calendar_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_configs_updated_at
  BEFORE UPDATE ON payment_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sms_configs_updated_at
  BEFORE UPDATE ON sms_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_configs_updated_at
  BEFORE UPDATE ON crm_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-update setup progress percentage
CREATE OR REPLACE FUNCTION update_setup_percentage()
RETURNS TRIGGER AS $$
DECLARE
  v_required_configured INTEGER;
  v_optional_configured INTEGER;
  v_required_total INTEGER;
  v_optional_total INTEGER;
BEGIN
  -- Count configured integrations
  SELECT
    COUNT(*) FILTER (WHERE required = TRUE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = FALSE AND status = 'connected'),
    COUNT(*) FILTER (WHERE required = TRUE),
    COUNT(*) FILTER (WHERE required = FALSE)
  INTO v_required_configured, v_optional_configured, v_required_total, v_optional_total
  FROM integrations
  WHERE user_id = NEW.user_id;

  -- Update setup progress
  UPDATE setup_progress
  SET
    configured_integrations = v_required_configured,
    percentage = CASE
      WHEN v_required_total > 0 THEN
        FLOOR(
          (v_required_configured::DECIMAL / v_required_total * 70) +
          (CASE WHEN v_optional_total > 0 THEN v_optional_configured::DECIMAL / v_optional_total * 30 ELSE 0 END)
        )
      ELSE 0
    END,
    is_complete = (v_required_configured = v_required_total),
    completed_at = CASE
      WHEN (v_required_configured = v_required_total) AND completed_at IS NULL THEN NOW()
      ELSE completed_at
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_setup_percentage
  AFTER INSERT OR UPDATE OF status ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_setup_percentage();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get setup progress for user
CREATE OR REPLACE FUNCTION get_setup_progress(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_progress JSON;
BEGIN
  SELECT json_build_object(
    'currentStep', sp.current_step,
    'completedSteps', sp.completed_steps,
    'totalSteps', sp.total_steps,
    'percentage', sp.percentage,
    'integrations', json_build_object(
      'required', sp.required_integrations,
      'configured', sp.configured_integrations,
      'optional', sp.optional_integrations
    ),
    'isComplete', sp.is_complete,
    'startedAt', sp.started_at,
    'completedAt', sp.completed_at
  )
  INTO v_progress
  FROM setup_progress sp
  WHERE sp.user_id = p_user_id;

  RETURN v_progress;
END;
$$ LANGUAGE plpgsql;

-- Get integrations by status
CREATE OR REPLACE FUNCTION get_integrations_by_status(p_user_id UUID, p_status integration_status)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status,
  required BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status, i.required
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.status = p_status
  ORDER BY i.required DESC, i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Get required integrations
CREATE OR REPLACE FUNCTION get_required_integrations(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type integration_type,
  provider TEXT,
  status integration_status
) AS $$
BEGIN
  RETURN QUERY
  SELECT i.id, i.name, i.type, i.provider, i.status
  FROM integrations i
  WHERE i.user_id = p_user_id AND i.required = TRUE
  ORDER BY i.created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Check if setup is complete
CREATE OR REPLACE FUNCTION is_setup_complete(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_complete BOOLEAN;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1
    FROM integrations
    WHERE user_id = p_user_id
      AND required = TRUE
      AND status != 'connected'
  )
  INTO v_complete;

  RETURN v_complete;
END;
$$ LANGUAGE plpgsql;

-- Get integration config
CREATE OR REPLACE FUNCTION get_integration_config(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_config JSON;
BEGIN
  SELECT json_build_object(
    'provider', ic.provider,
    'credentials', ic.credentials,
    'settings', ic.settings,
    'webhookUrl', ic.webhook_url,
    'apiEndpoint', ic.api_endpoint,
    'enabled', ic.enabled
  )
  INTO v_config
  FROM integration_config ic
  WHERE ic.integration_id = p_integration_id;

  RETURN v_config;
END;
$$ LANGUAGE plpgsql;

-- Get test results for integration
CREATE OR REPLACE FUNCTION get_latest_test_results(p_integration_id UUID)
RETURNS JSON AS $$
DECLARE
  v_results JSON;
BEGIN
  SELECT json_build_object(
    'success', tr.success,
    'latency', tr.latency,
    'error', tr.error,
    'details', tr.details,
    'testedAt', tr.tested_at
  )
  INTO v_results
  FROM test_results tr
  WHERE tr.integration_id = p_integration_id
  ORDER BY tr.tested_at DESC
  LIMIT 1;

  RETURN v_results;
END;
$$ LANGUAGE plpgsql;

-- Get recommended providers for integration type
CREATE OR REPLACE FUNCTION get_recommended_providers(p_type integration_type)
RETURNS TABLE(
  provider TEXT,
  name TEXT,
  icon TEXT,
  color TEXT,
  features TEXT[],
  difficulty TEXT,
  estimated_time INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.provider,
    pt.name,
    pt.icon,
    pt.color,
    pt.features,
    pt.difficulty,
    pt.estimated_time
  FROM provider_templates pt
  WHERE pt.type = p_type AND pt.recommended = TRUE
  ORDER BY pt.estimated_time ASC;
END;
$$ LANGUAGE plpgsql;

-- Estimate total setup time
CREATE OR REPLACE FUNCTION estimate_setup_time(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_time INTEGER;
BEGIN
  SELECT COALESCE(SUM(pt.estimated_time), 0)
  INTO v_total_time
  FROM integrations i
  JOIN provider_templates pt ON pt.type = i.type AND pt.provider = LOWER(i.provider)
  WHERE i.user_id = p_user_id
    AND i.status != 'connected';

  RETURN v_total_time;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE setup_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_templates ENABLE ROW LEVEL SECURITY;

-- Setup Progress policies
CREATE POLICY "Users can view their own setup progress"
  ON setup_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup progress"
  ON setup_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup progress"
  ON setup_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Integrations policies
CREATE POLICY "Users can view their own integrations"
  ON integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Integration Config policies
CREATE POLICY "Users can view config for their integrations"
  ON integration_config FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create config for their integrations"
  ON integration_config FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update config for their integrations"
  ON integration_config FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = integration_config.integration_id AND user_id = auth.uid()
  ));

-- Test Results policies
CREATE POLICY "Users can view test results for their integrations"
  ON test_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create test results for their integrations"
  ON test_results FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM integrations
    WHERE id = test_results.integration_id AND user_id = auth.uid()
  ));

-- Config tables policies (same pattern for all)
CREATE POLICY "Users can view their own email config"
  ON email_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email config"
  ON email_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own AI config"
  ON ai_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own AI config"
  ON ai_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own calendar config"
  ON calendar_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own calendar config"
  ON calendar_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own payment config"
  ON payment_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own payment config"
  ON payment_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own SMS config"
  ON sms_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own SMS config"
  ON sms_configs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own CRM config"
  ON crm_configs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own CRM config"
  ON crm_configs FOR ALL
  USING (auth.uid() = user_id);

-- Provider Templates policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view provider templates"
  ON provider_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- SEED DATA (Provider Templates)
-- ============================================================================

-- Email Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('email', 'gmail', 'Gmail', 'Mail', 'bg-red-500', true,
   ARRAY['OAuth 2.0', 'High deliverability', 'Free tier', 'Easy setup'],
   'easy', 5, ARRAY['Google Account', 'OAuth consent screen'], 'free'),
  ('email', 'outlook', 'Outlook', 'Mail', 'bg-blue-500', true,
   ARRAY['Microsoft Graph API', 'Enterprise ready', 'Office 365 integration'],
   'easy', 5, ARRAY['Microsoft Account', 'Azure AD app'], 'free'),
  ('email', 'resend', 'Resend', 'Mail', 'bg-purple-500', false,
   ARRAY['Developer-first', 'API-based', 'Analytics', 'High deliverability'],
   'easy', 2, ARRAY['Resend account', 'API key', 'Domain verification'], 'freemium'),
  ('email', 'sendgrid', 'SendGrid', 'Mail', 'bg-cyan-500', false,
   ARRAY['Enterprise scale', 'Advanced analytics', 'Template engine'],
   'medium', 10, ARRAY['SendGrid account', 'API key', 'Sender authentication'], 'freemium');

-- AI Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('ai', 'openai', 'OpenAI', 'Brain', 'bg-green-500', true,
   ARRAY['GPT-4', 'Function calling', 'Vision', 'Most popular'],
   'easy', 2, ARRAY['OpenAI account', 'API key'], 'paid', '$0.03/1K tokens'),
  ('ai', 'anthropic', 'Anthropic', 'Brain', 'bg-orange-500', true,
   ARRAY['Claude 3.5', 'Long context', 'Safer outputs', 'Code generation'],
   'easy', 2, ARRAY['Anthropic account', 'API key'], 'paid', '$0.25/1M tokens'),
  ('ai', 'google', 'Google AI', 'Brain', 'bg-blue-500', false,
   ARRAY['Gemini Pro', 'Multimodal', 'Free tier', 'Google integration'],
   'medium', 5, ARRAY['Google Cloud account', 'API key', 'Project setup'], 'freemium', 'Free tier available');

-- Calendar Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier)
VALUES
  ('calendar', 'google', 'Google Calendar', 'Calendar', 'bg-blue-500', true,
   ARRAY['Easy integration', 'Free', 'Most popular', 'Mobile sync'],
   'easy', 5, ARRAY['Google account', 'OAuth setup'], 'free'),
  ('calendar', 'outlook', 'Outlook Calendar', 'Calendar', 'bg-indigo-500', true,
   ARRAY['Office 365', 'Enterprise features', 'Teams integration'],
   'easy', 5, ARRAY['Microsoft account', 'Graph API access'], 'free');

-- Payment Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('payment', 'stripe', 'Stripe', 'CreditCard', 'bg-purple-500', true,
   ARRAY['Most popular', 'Global', 'Low fees', 'Great docs'],
   'medium', 10, ARRAY['Stripe account', 'API keys', 'Webhook setup'], 'paid', '2.9% + $0.30/transaction');

-- SMS Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('sms', 'twilio', 'Twilio', 'MessageSquare', 'bg-red-500', true,
   ARRAY['SMS + WhatsApp', 'Global coverage', 'Reliable', 'Programmable'],
   'medium', 10, ARRAY['Twilio account', 'Phone number', 'API credentials'], 'paid', '$0.0075/SMS');

-- CRM Providers
INSERT INTO provider_templates (type, provider, name, icon, color, recommended, features, difficulty, estimated_time, requirements, pricing_tier, starting_price)
VALUES
  ('crm', 'hubspot', 'HubSpot', 'Users', 'bg-orange-500', true,
   ARRAY['Free tier', 'Full CRM', 'Marketing tools', 'Easy API'],
   'easy', 5, ARRAY['HubSpot account', 'API key'], 'freemium', 'Free tier available'),
  ('crm', 'salesforce', 'Salesforce', 'Users', 'bg-blue-500', false,
   ARRAY['Enterprise grade', 'Customizable', 'Industry leader'],
   'hard', 20, ARRAY['Salesforce account', 'Connected app', 'OAuth setup'], 'paid', '$25/user/month');
-- ============================================================================
-- Email Agent System - Production Database Schema
-- ============================================================================
-- Comprehensive email automation and intelligence with AI-powered analysis,
-- automatic responses, quotation generation, booking management, and workflows
-- ============================================================================

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

DROP TYPE IF EXISTS email_intent CASCADE;
CREATE TYPE email_intent AS ENUM ('quote_request', 'inquiry', 'booking', 'complaint', 'follow_up', 'support', 'payment', 'general');
DROP TYPE IF EXISTS email_sentiment CASCADE;
CREATE TYPE email_sentiment AS ENUM ('positive', 'neutral', 'negative', 'urgent');
DROP TYPE IF EXISTS email_priority CASCADE;
CREATE TYPE email_priority AS ENUM ('critical', 'high', 'medium', 'low');
DROP TYPE IF EXISTS email_category CASCADE;
CREATE TYPE email_category AS ENUM ('sales', 'booking', 'support', 'billing', 'general', 'spam');
DROP TYPE IF EXISTS email_status CASCADE;
CREATE TYPE email_status AS ENUM ('pending', 'processing', 'processed', 'responded', 'archived', 'flagged');
DROP TYPE IF EXISTS approval_status CASCADE;
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'expired');
DROP TYPE IF EXISTS approval_type CASCADE;
CREATE TYPE approval_type AS ENUM ('response', 'quotation', 'booking', 'refund', 'discount');
DROP TYPE IF EXISTS response_tone CASCADE;
CREATE TYPE response_tone AS ENUM ('professional', 'friendly', 'formal', 'casual');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Email Messages
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  html_body TEXT,
  received_at TIMESTAMPTZ NOT NULL,
  read_at TIMESTAMPTZ,
  status email_status NOT NULL DEFAULT 'pending',
  has_response BOOLEAN NOT NULL DEFAULT FALSE,
  has_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  has_booking BOOLEAN NOT NULL DEFAULT FALSE,
  thread_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Analysis
CREATE TABLE IF NOT EXISTS email_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE UNIQUE,
  intent email_intent NOT NULL,
  sentiment email_sentiment NOT NULL,
  priority email_priority NOT NULL,
  category email_category NOT NULL,
  summary TEXT NOT NULL,
  key_points TEXT[] DEFAULT '{}',
  extracted_name TEXT,
  extracted_company TEXT,
  extracted_phone TEXT,
  extracted_deadline TEXT,
  extracted_budget TEXT,
  extracted_requirements TEXT[] DEFAULT '{}',
  requires_quotation BOOLEAN NOT NULL DEFAULT FALSE,
  requires_booking BOOLEAN NOT NULL DEFAULT FALSE,
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  confidence_score DECIMAL(5, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  processing_time INTEGER NOT NULL, -- milliseconds
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Responses
CREATE TABLE IF NOT EXISTS email_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tone response_tone NOT NULL DEFAULT 'professional',
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_name TEXT NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  valid_until DATE NOT NULL,
  terms TEXT[] DEFAULT '{}',
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  service_type TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- minutes
  notes TEXT,
  status approval_status NOT NULL DEFAULT 'pending',
  confirmed_date DATE,
  confirmed_time TIME,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Email Attachments
CREATE TABLE IF NOT EXISTS email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL, -- bytes
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Approval Workflows
CREATE TABLE IF NOT EXISTS approval_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type approval_type NOT NULL,
  status approval_status NOT NULL DEFAULT 'pending',
  priority email_priority NOT NULL DEFAULT 'medium',
  email_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
  item_id UUID NOT NULL,
  item_data JSONB NOT NULL DEFAULT '{}',
  requested_by TEXT NOT NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agent Configuration
CREATE TABLE IF NOT EXISTS agent_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  auto_respond BOOLEAN NOT NULL DEFAULT FALSE,
  require_approval BOOLEAN NOT NULL DEFAULT TRUE,
  auto_approve_threshold DECIMAL(5, 2) NOT NULL DEFAULT 90 CHECK (auto_approve_threshold >= 0 AND auto_approve_threshold <= 100),
  response_template TEXT,
  quotation_template TEXT,
  working_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  working_hours_start TIME DEFAULT '09:00:00',
  working_hours_end TIME DEFAULT '17:00:00',
  working_hours_timezone TEXT DEFAULT 'UTC',
  blocked_senders TEXT[] DEFAULT '{}',
  blocked_domains TEXT[] DEFAULT '{}',
  filter_keywords TEXT[] DEFAULT '{}',
  integration_email BOOLEAN NOT NULL DEFAULT TRUE,
  integration_calendar BOOLEAN NOT NULL DEFAULT FALSE,
  integration_payment BOOLEAN NOT NULL DEFAULT FALSE,
  integration_crm BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Email Messages indexes
CREATE INDEX IF NOT EXISTS idx_email_messages_user_id ON email_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_status ON email_messages(status);
CREATE INDEX IF NOT EXISTS idx_email_messages_received_at ON email_messages(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_thread_id ON email_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_email_messages_from ON email_messages(from_address);
CREATE INDEX IF NOT EXISTS idx_email_messages_user_status ON email_messages(user_id, status);

-- Email Analysis indexes
CREATE INDEX IF NOT EXISTS idx_email_analysis_email_id ON email_analysis(email_id);
CREATE INDEX IF NOT EXISTS idx_email_analysis_intent ON email_analysis(intent);
CREATE INDEX IF NOT EXISTS idx_email_analysis_priority ON email_analysis(priority);
CREATE INDEX IF NOT EXISTS idx_email_analysis_category ON email_analysis(category);
CREATE INDEX IF NOT EXISTS idx_email_analysis_requires_review ON email_analysis(requires_human_review);

-- Email Responses indexes
CREATE INDEX IF NOT EXISTS idx_email_responses_email_id ON email_responses(email_id);
CREATE INDEX IF NOT EXISTS idx_email_responses_status ON email_responses(status);
CREATE INDEX IF NOT EXISTS idx_email_responses_generated_at ON email_responses(generated_at DESC);

-- Quotations indexes
CREATE INDEX IF NOT EXISTS idx_quotations_email_id ON quotations(email_id);
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_valid_until ON quotations(valid_until);

-- Quotation Items indexes
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_items_sort_order ON quotation_items(quotation_id, sort_order);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_email_id ON bookings(email_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmed_date ON bookings(confirmed_date);

-- Email Attachments indexes
CREATE INDEX IF NOT EXISTS idx_email_attachments_email_id ON email_attachments(email_id);

-- Approval Workflows indexes
CREATE INDEX IF NOT EXISTS idx_approval_workflows_user_id ON approval_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_status ON approval_workflows(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_type ON approval_workflows(type);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_priority ON approval_workflows(priority);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_email_id ON approval_workflows(email_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_expires_at ON approval_workflows(expires_at);

-- Agent Configuration indexes
CREATE INDEX IF NOT EXISTS idx_agent_configuration_user_id ON agent_configuration(user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON email_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configuration_updated_at
  BEFORE UPDATE ON agent_configuration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate quotation total
CREATE OR REPLACE FUNCTION calculate_quotation_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.subtotal + NEW.tax - NEW.discount;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_quotation_total_trigger
  BEFORE INSERT OR UPDATE OF subtotal, tax, discount ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION calculate_quotation_total();

-- Auto-calculate quotation item total
CREATE OR REPLACE FUNCTION calculate_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total = NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_item_total_trigger
  BEFORE INSERT OR UPDATE OF quantity, unit_price ON quotation_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_total();

-- Auto-expire approvals
CREATE OR REPLACE FUNCTION check_approval_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.status = 'pending' THEN
    NEW.status = 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_approval_expiration_trigger
  BEFORE UPDATE ON approval_workflows
  FOR EACH ROW
  EXECUTE FUNCTION check_approval_expiration();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get email statistics
CREATE OR REPLACE FUNCTION get_email_statistics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'totalEmailsReceived', COUNT(*),
    'totalEmailsProcessed', COUNT(*) FILTER (WHERE status != 'pending'),
    'responsesGenerated', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id),
    'responsesSent', (SELECT COUNT(*) FROM email_responses er JOIN email_messages em ON er.email_id = em.id WHERE em.user_id = p_user_id AND er.sent_at IS NOT NULL),
    'quotationsGenerated', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id),
    'quotationsSent', (SELECT COUNT(*) FROM quotations WHERE user_id = p_user_id AND sent_at IS NOT NULL),
    'bookingsCreated', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id),
    'bookingsConfirmed', (SELECT COUNT(*) FROM bookings WHERE user_id = p_user_id AND confirmed_date IS NOT NULL),
    'approvalsPending', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'pending'),
    'approvalsApproved', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'approved'),
    'approvalsRejected', (SELECT COUNT(*) FROM approval_workflows WHERE user_id = p_user_id AND status = 'rejected'),
    'avgResponseTime', (
      SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (read_at - received_at)) / 60), 0)::INTEGER
      FROM email_messages
      WHERE user_id = p_user_id AND read_at IS NOT NULL
    ),
    'avgConfidenceScore', (
      SELECT COALESCE(AVG(ea.confidence_score), 0)::INTEGER
      FROM email_analysis ea
      JOIN email_messages em ON ea.email_id = em.id
      WHERE em.user_id = p_user_id
    )
  )
  INTO v_stats
  FROM email_messages
  WHERE user_id = p_user_id;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- Search emails
CREATE OR REPLACE FUNCTION search_emails(p_user_id UUID, p_query TEXT)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  status email_status,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, em.status, em.received_at
  FROM email_messages em
  WHERE em.user_id = p_user_id
    AND (
      em.from_address ILIKE '%' || p_query || '%'
      OR em.subject ILIKE '%' || p_query || '%'
      OR em.body ILIKE '%' || p_query || '%'
    )
  ORDER BY em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get pending approvals
CREATE OR REPLACE FUNCTION get_pending_approvals(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  type approval_type,
  priority email_priority,
  email_subject TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT aw.id, aw.type, aw.priority, em.subject, aw.created_at
  FROM approval_workflows aw
  JOIN email_messages em ON aw.email_id = em.id
  WHERE aw.user_id = p_user_id AND aw.status = 'pending'
  ORDER BY aw.priority, aw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get emails requiring review
CREATE OR REPLACE FUNCTION get_emails_requiring_review(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  from_address TEXT,
  subject TEXT,
  priority email_priority,
  received_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT em.id, em.from_address, em.subject, ea.priority, em.received_at
  FROM email_messages em
  JOIN email_analysis ea ON em.id = ea.email_id
  WHERE em.user_id = p_user_id
    AND ea.requires_human_review = TRUE
    AND em.status = 'processing'
  ORDER BY ea.priority, em.received_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get quotation total with items
CREATE OR REPLACE FUNCTION get_quotation_total(p_quotation_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_items_total DECIMAL;
  v_quotation quotations%ROWTYPE;
BEGIN
  SELECT SUM(total) INTO v_items_total
  FROM quotation_items
  WHERE quotation_id = p_quotation_id;

  SELECT * INTO v_quotation
  FROM quotations
  WHERE id = p_quotation_id;

  RETURN COALESCE(v_items_total, 0) + v_quotation.tax - v_quotation.discount;
END;
$$ LANGUAGE plpgsql;

-- Update email status based on activity
CREATE OR REPLACE FUNCTION update_email_status(p_email_id UUID)
RETURNS VOID AS $$
DECLARE
  v_has_response BOOLEAN;
  v_has_quotation BOOLEAN;
  v_has_booking BOOLEAN;
BEGIN
  SELECT
    EXISTS(SELECT 1 FROM email_responses WHERE email_id = p_email_id AND sent_at IS NOT NULL),
    EXISTS(SELECT 1 FROM quotations WHERE email_id = p_email_id),
    EXISTS(SELECT 1 FROM bookings WHERE email_id = p_email_id)
  INTO v_has_response, v_has_quotation, v_has_booking;

  UPDATE email_messages
  SET
    has_response = v_has_response,
    has_quotation = v_has_quotation,
    has_booking = v_has_booking,
    status = CASE
      WHEN v_has_response THEN 'responded'::email_status
      WHEN status = 'pending' THEN 'processing'::email_status
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_email_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configuration ENABLE ROW LEVEL SECURITY;

-- Email Messages policies
CREATE POLICY "Users can view their own email messages"
  ON email_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email messages"
  ON email_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email messages"
  ON email_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email messages"
  ON email_messages FOR DELETE
  USING (auth.uid() = user_id);

-- Email Analysis policies
CREATE POLICY "Users can view analysis for their emails"
  ON email_analysis FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage analysis for their emails"
  ON email_analysis FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_analysis.email_id AND user_id = auth.uid()
  ));

-- Email Responses policies (same pattern)
CREATE POLICY "Users can view responses for their emails"
  ON email_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage responses for their emails"
  ON email_responses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_responses.email_id AND user_id = auth.uid()
  ));

-- Quotations policies
CREATE POLICY "Users can view their own quotations"
  ON quotations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own quotations"
  ON quotations FOR ALL
  USING (auth.uid() = user_id);

-- Quotation Items policies
CREATE POLICY "Users can view items for their quotations"
  ON quotation_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage items for their quotations"
  ON quotation_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM quotations
    WHERE id = quotation_items.quotation_id AND user_id = auth.uid()
  ));

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookings"
  ON bookings FOR ALL
  USING (auth.uid() = user_id);

-- Email Attachments policies
CREATE POLICY "Users can view attachments for their emails"
  ON email_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage attachments for their emails"
  ON email_attachments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM email_messages
    WHERE id = email_attachments.email_id AND user_id = auth.uid()
  ));

-- Approval Workflows policies
CREATE POLICY "Users can view their own approval workflows"
  ON approval_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own approval workflows"
  ON approval_workflows FOR ALL
  USING (auth.uid() = user_id);

-- Agent Configuration policies
CREATE POLICY "Users can view their own agent configuration"
  ON agent_configuration FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own agent configuration"
  ON agent_configuration FOR ALL
  USING (auth.uid() = user_id);
