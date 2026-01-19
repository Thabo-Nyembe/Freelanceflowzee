-- Tax Automation Migration
-- Phase 10.3: Complete tax system with TaxJar/Avalara integration
-- Supports: Multi-jurisdiction calculations, economic nexus tracking,
-- exemption certificates, transaction recording for filing

-- ============================================================================
-- TAX RATES TABLE (Enhanced)
-- ============================================================================

-- Add new columns to existing tax_rates table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_rates' AND column_name = 'jurisdiction_level') THEN
    ALTER TABLE tax_rates ADD COLUMN jurisdiction_level TEXT DEFAULT 'state';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_rates' AND column_name = 'tax_provider') THEN
    ALTER TABLE tax_rates ADD COLUMN tax_provider TEXT DEFAULT 'manual';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_rates' AND column_name = 'product_tax_code') THEN
    ALTER TABLE tax_rates ADD COLUMN product_tax_code TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tax_rates' AND column_name = 'freight_taxable') THEN
    ALTER TABLE tax_rates ADD COLUMN freight_taxable BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- TAX CALCULATIONS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('invoice', 'expense', 'payment', 'refund')),
  transaction_date DATE NOT NULL,

  -- Origin address
  origin_country TEXT,
  origin_state TEXT,
  origin_city TEXT,
  origin_postal_code TEXT,

  -- Destination address
  destination_country TEXT NOT NULL,
  destination_state TEXT,
  destination_city TEXT,
  destination_postal_code TEXT,

  -- Amounts (in cents)
  subtotal BIGINT NOT NULL,
  shipping_amount BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,

  -- Tax details
  tax_type TEXT NOT NULL,
  tax_rate DECIMAL(10, 6) NOT NULL,
  tax_amount BIGINT NOT NULL,
  total_amount BIGINT NOT NULL,

  -- Breakdown and metadata
  breakdown JSONB DEFAULT '{}',
  jurisdictions JSONB DEFAULT '[]',
  line_item_taxes JSONB DEFAULT '[]',

  -- Provider info
  calculation_method TEXT NOT NULL,
  provider TEXT,
  provider_transaction_id TEXT,
  api_response JSONB,

  -- Status
  has_nexus BOOLEAN DEFAULT FALSE,
  is_taxable BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'calculated' CHECK (status IN ('calculated', 'recorded', 'filed', 'deleted')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAX NEXUS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_nexus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  has_nexus BOOLEAN DEFAULT TRUE,
  nexus_type TEXT NOT NULL CHECK (nexus_type IN ('physical', 'economic', 'both')),
  effective_date DATE NOT NULL,

  -- Thresholds
  sales_threshold BIGINT,  -- In cents
  transaction_threshold INTEGER,

  -- Tracking
  current_year_sales BIGINT DEFAULT 0,
  current_year_transactions INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, state, country)
);

-- ============================================================================
-- TAX EXEMPTIONS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL,
  exemption_type TEXT NOT NULL,
  issuing_state TEXT NOT NULL,

  -- Validity
  valid_from DATE NOT NULL,
  valid_until DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'pending')),

  -- Documentation
  document_url TEXT,
  document_filename TEXT,

  -- Customer info (for B2B)
  customer_id UUID,
  customer_name TEXT,
  customer_tax_id TEXT,

  -- Audit
  verified_at TIMESTAMPTZ,
  verified_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAX REFUNDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_transaction_id TEXT NOT NULL,
  refund_transaction_id TEXT NOT NULL,
  refund_date DATE NOT NULL,

  -- Amounts (in cents)
  amount BIGINT NOT NULL,
  tax_amount BIGINT NOT NULL,

  -- Provider info
  provider TEXT,
  provider_refund_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'recorded', 'filed')),

  -- Metadata
  reason TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAX DEDUCTIONS TABLE (Enhanced)
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,

  -- Category
  category TEXT NOT NULL,
  subcategory TEXT,

  -- Amounts (in cents)
  expense_amount BIGINT NOT NULL,
  deductible_amount BIGINT NOT NULL,
  deduction_percentage DECIMAL(5, 2) DEFAULT 100.00,

  -- Source
  expense_id UUID,
  expense_date DATE,
  description TEXT,

  -- Documentation
  receipt_url TEXT,
  documentation_urls JSONB DEFAULT '[]',

  -- AI suggestions
  ai_category_suggestion TEXT,
  ai_confidence DECIMAL(5, 2),
  ai_requirements JSONB DEFAULT '[]',

  -- Approval
  is_approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TAX FILINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tax_year INTEGER NOT NULL,
  filing_type TEXT NOT NULL CHECK (filing_type IN ('annual', 'quarterly', 'monthly')),
  period TEXT,  -- e.g., 'Q1', 'Q2', 'January'

  -- Jurisdiction
  country TEXT NOT NULL DEFAULT 'US',
  state TEXT,

  -- Amounts (in cents)
  gross_income BIGINT DEFAULT 0,
  total_deductions BIGINT DEFAULT 0,
  taxable_income BIGINT DEFAULT 0,
  tax_collected BIGINT DEFAULT 0,
  tax_paid BIGINT DEFAULT 0,
  tax_owed BIGINT DEFAULT 0,

  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'filed', 'accepted', 'rejected')),

  -- Filing details
  filing_date DATE,
  confirmation_number TEXT,
  provider TEXT,  -- 'taxjar', 'avalara', 'manual'

  -- Documents
  filed_return_url TEXT,
  supporting_docs JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, tax_year, filing_type, period, state)
);

-- ============================================================================
-- TAX API LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tax_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- API details
  api_provider TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  api_method TEXT DEFAULT 'POST',

  -- Request/Response
  request_payload JSONB,
  response_status INTEGER,
  response_payload JSONB,

  -- Error tracking
  is_error BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  error_code TEXT,

  -- Timing
  request_duration_ms INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- USER TAX PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_tax_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Business info
  business_type TEXT,  -- 'sole_proprietor', 'llc', 'corporation', etc.
  tax_id TEXT,  -- EIN or SSN
  tax_id_type TEXT,  -- 'ein', 'ssn', 'vat', etc.

  -- Primary location (determines physical nexus)
  primary_country TEXT DEFAULT 'US',
  primary_state TEXT,
  primary_city TEXT,
  primary_postal_code TEXT,

  -- Nexus states (US only)
  nexus_states TEXT[] DEFAULT '{}',

  -- Tax settings
  default_tax_rate DECIMAL(10, 6),
  auto_collect_tax BOOLEAN DEFAULT TRUE,
  tax_inclusive_pricing BOOLEAN DEFAULT FALSE,

  -- Provider preferences
  preferred_provider TEXT DEFAULT 'manual',
  taxjar_customer_id TEXT,
  avalara_company_code TEXT,

  -- Reporting
  fiscal_year_end TEXT DEFAULT '12-31',
  accounting_method TEXT DEFAULT 'cash',  -- 'cash' or 'accrual'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_date
  ON tax_calculations(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_transaction
  ON tax_calculations(user_id, transaction_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_status
  ON tax_calculations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_destination
  ON tax_calculations(destination_country, destination_state);

CREATE INDEX IF NOT EXISTS idx_tax_nexus_user
  ON tax_nexus(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_nexus_state
  ON tax_nexus(user_id, state, country);

CREATE INDEX IF NOT EXISTS idx_tax_exemptions_user
  ON tax_exemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_status
  ON tax_exemptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_validity
  ON tax_exemptions(user_id, valid_from, valid_until);

CREATE INDEX IF NOT EXISTS idx_tax_refunds_user
  ON tax_refunds(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_refunds_original
  ON tax_refunds(user_id, original_transaction_id);

CREATE INDEX IF NOT EXISTS idx_tax_deductions_user_year
  ON tax_deductions(user_id, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_category
  ON tax_deductions(user_id, tax_year, category);

CREATE INDEX IF NOT EXISTS idx_tax_filings_user_year
  ON tax_filings(user_id, tax_year);

CREATE INDEX IF NOT EXISTS idx_tax_api_logs_provider
  ON tax_api_logs(api_provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tax_api_logs_errors
  ON tax_api_logs(is_error, created_at DESC) WHERE is_error = TRUE;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_nexus ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tax_profiles ENABLE ROW LEVEL SECURITY;

-- Tax Calculations Policies
DROP POLICY IF EXISTS "Users can view own calculations" ON tax_calculations;
CREATE POLICY "Users can view own calculations" ON tax_calculations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own calculations" ON tax_calculations;
CREATE POLICY "Users can insert own calculations" ON tax_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own calculations" ON tax_calculations;
CREATE POLICY "Users can update own calculations" ON tax_calculations
  FOR UPDATE USING (auth.uid() = user_id);

-- Tax Nexus Policies
DROP POLICY IF EXISTS "Users can manage own nexus" ON tax_nexus;
CREATE POLICY "Users can manage own nexus" ON tax_nexus
  FOR ALL USING (auth.uid() = user_id);

-- Tax Exemptions Policies
DROP POLICY IF EXISTS "Users can manage own exemptions" ON tax_exemptions;
CREATE POLICY "Users can manage own exemptions" ON tax_exemptions
  FOR ALL USING (auth.uid() = user_id);

-- Tax Refunds Policies
DROP POLICY IF EXISTS "Users can manage own refunds" ON tax_refunds;
CREATE POLICY "Users can manage own refunds" ON tax_refunds
  FOR ALL USING (auth.uid() = user_id);

-- Tax Deductions Policies
DROP POLICY IF EXISTS "Users can manage own deductions" ON tax_deductions;
CREATE POLICY "Users can manage own deductions" ON tax_deductions
  FOR ALL USING (auth.uid() = user_id);

-- Tax Filings Policies
DROP POLICY IF EXISTS "Users can manage own filings" ON tax_filings;
CREATE POLICY "Users can manage own filings" ON tax_filings
  FOR ALL USING (auth.uid() = user_id);

-- Tax API Logs Policies
DROP POLICY IF EXISTS "Users can view own api logs" ON tax_api_logs;
CREATE POLICY "Users can view own api logs" ON tax_api_logs
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service can insert api logs" ON tax_api_logs;
CREATE POLICY "Service can insert api logs" ON tax_api_logs
  FOR INSERT WITH CHECK (TRUE);

-- User Tax Profiles Policies
DROP POLICY IF EXISTS "Users can manage own profile" ON user_tax_profiles;
CREATE POLICY "Users can manage own profile" ON user_tax_profiles
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to increment running tax total
CREATE OR REPLACE FUNCTION increment_tax_total(
  p_user_id UUID,
  p_tax_year INTEGER,
  p_tax_amount BIGINT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO tax_filings (user_id, tax_year, filing_type, tax_collected)
  VALUES (p_user_id, p_tax_year, 'annual', p_tax_amount)
  ON CONFLICT (user_id, tax_year, filing_type, period, state)
  DO UPDATE SET
    tax_collected = tax_filings.tax_collected + p_tax_amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tax summary for a year
CREATE OR REPLACE FUNCTION get_tax_summary(
  p_user_id UUID,
  p_year INTEGER
)
RETURNS TABLE (
  total_income BIGINT,
  total_expenses BIGINT,
  total_deductions BIGINT,
  total_tax_collected BIGINT,
  total_tax_paid BIGINT,
  transaction_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN tc.transaction_type IN ('invoice', 'payment') THEN tc.subtotal ELSE 0 END), 0)::BIGINT as total_income,
    COALESCE(SUM(CASE WHEN tc.transaction_type = 'expense' THEN tc.subtotal ELSE 0 END), 0)::BIGINT as total_expenses,
    COALESCE((SELECT SUM(deductible_amount) FROM tax_deductions WHERE user_id = p_user_id AND tax_year = p_year AND is_approved = TRUE), 0)::BIGINT as total_deductions,
    COALESCE(SUM(CASE WHEN tc.transaction_type IN ('invoice', 'payment') THEN tc.tax_amount ELSE 0 END), 0)::BIGINT as total_tax_collected,
    COALESCE(SUM(CASE WHEN tc.transaction_type = 'expense' THEN tc.tax_amount ELSE 0 END), 0)::BIGINT as total_tax_paid,
    COUNT(*)::INTEGER as transaction_count
  FROM tax_calculations tc
  WHERE tc.user_id = p_user_id
    AND tc.transaction_date >= (p_year || '-01-01')::DATE
    AND tc.transaction_date <= (p_year || '-12-31')::DATE
    AND tc.status != 'deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check economic nexus thresholds
CREATE OR REPLACE FUNCTION check_nexus_thresholds(
  p_user_id UUID,
  p_state TEXT,
  p_country TEXT DEFAULT 'US'
)
RETURNS TABLE (
  has_nexus BOOLEAN,
  sales_total BIGINT,
  transaction_count INTEGER,
  sales_threshold BIGINT,
  transaction_threshold INTEGER
) AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
  v_sales_threshold BIGINT;
  v_transaction_threshold INTEGER;
BEGIN
  -- Get state threshold (default to $100,000 / 200 transactions)
  SELECT
    COALESCE(tn.sales_threshold, 10000000),  -- $100,000 in cents
    COALESCE(tn.transaction_threshold, 200)
  INTO v_sales_threshold, v_transaction_threshold
  FROM tax_nexus tn
  WHERE tn.user_id = p_user_id AND tn.state = p_state AND tn.country = p_country;

  -- If no record exists, use defaults
  IF v_sales_threshold IS NULL THEN
    v_sales_threshold := 10000000;  -- $100,000 in cents
    v_transaction_threshold := 200;
  END IF;

  RETURN QUERY
  SELECT
    (COALESCE(SUM(tc.subtotal), 0) >= v_sales_threshold OR COUNT(*) >= v_transaction_threshold) as has_nexus,
    COALESCE(SUM(tc.subtotal), 0)::BIGINT as sales_total,
    COUNT(*)::INTEGER as transaction_count,
    v_sales_threshold as sales_threshold,
    v_transaction_threshold as transaction_threshold
  FROM tax_calculations tc
  WHERE tc.user_id = p_user_id
    AND tc.destination_state = p_state
    AND tc.destination_country = p_country
    AND tc.transaction_date >= (v_year || '-01-01')::DATE
    AND tc.transaction_type IN ('invoice', 'payment')
    AND tc.status != 'deleted';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED US STATE ECONOMIC NEXUS THRESHOLDS
-- ============================================================================

-- Insert default economic nexus thresholds for US states
INSERT INTO tax_rates (country, state, tax_type, rate, is_active, effective_from, priority, jurisdiction_level, freight_taxable)
VALUES
  -- States with sales tax
  ('US', 'AL', 'sales', 0.04, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'AZ', 'sales', 0.056, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'AR', 'sales', 0.065, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'CA', 'sales', 0.0725, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'CO', 'sales', 0.029, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'CT', 'sales', 0.0635, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'FL', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'GA', 'sales', 0.04, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'HI', 'sales', 0.04, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'ID', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'IL', 'sales', 0.0625, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'IN', 'sales', 0.07, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'IA', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'KS', 'sales', 0.065, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'KY', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'LA', 'sales', 0.0445, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'ME', 'sales', 0.055, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MD', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MA', 'sales', 0.0625, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MI', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MN', 'sales', 0.06875, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MS', 'sales', 0.07, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'MO', 'sales', 0.04225, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'NE', 'sales', 0.055, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'NV', 'sales', 0.0685, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'NJ', 'sales', 0.06625, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'NM', 'sales', 0.05125, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'NY', 'sales', 0.04, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'NC', 'sales', 0.0475, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'ND', 'sales', 0.05, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'OH', 'sales', 0.0575, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'OK', 'sales', 0.045, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'PA', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'RI', 'sales', 0.07, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'SC', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'SD', 'sales', 0.045, TRUE, '2024-01-01', 1, 'state', TRUE),
  ('US', 'TN', 'sales', 0.07, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'TX', 'sales', 0.0625, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'UT', 'sales', 0.061, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'VT', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'VA', 'sales', 0.053, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'WA', 'sales', 0.065, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'WV', 'sales', 0.06, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'WI', 'sales', 0.05, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'WY', 'sales', 0.04, TRUE, '2024-01-01', 1, 'state', FALSE),
  -- States without sales tax
  ('US', 'AK', 'sales', 0, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'DE', 'sales', 0, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'MT', 'sales', 0, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'NH', 'sales', 0, TRUE, '2024-01-01', 1, 'state', FALSE),
  ('US', 'OR', 'sales', 0, TRUE, '2024-01-01', 1, 'state', FALSE)
ON CONFLICT DO NOTHING;

-- Insert international VAT rates
INSERT INTO tax_rates (country, tax_type, rate, is_active, effective_from, priority, jurisdiction_level)
VALUES
  ('GB', 'vat', 0.20, TRUE, '2024-01-01', 1, 'country'),
  ('DE', 'vat', 0.19, TRUE, '2024-01-01', 1, 'country'),
  ('FR', 'vat', 0.20, TRUE, '2024-01-01', 1, 'country'),
  ('ES', 'vat', 0.21, TRUE, '2024-01-01', 1, 'country'),
  ('IT', 'vat', 0.22, TRUE, '2024-01-01', 1, 'country'),
  ('NL', 'vat', 0.21, TRUE, '2024-01-01', 1, 'country'),
  ('BE', 'vat', 0.21, TRUE, '2024-01-01', 1, 'country'),
  ('SE', 'vat', 0.25, TRUE, '2024-01-01', 1, 'country'),
  ('PL', 'vat', 0.23, TRUE, '2024-01-01', 1, 'country'),
  ('AT', 'vat', 0.20, TRUE, '2024-01-01', 1, 'country'),
  ('CA', 'gst', 0.05, TRUE, '2024-01-01', 1, 'country'),
  ('AU', 'gst', 0.10, TRUE, '2024-01-01', 1, 'country'),
  ('NZ', 'gst', 0.15, TRUE, '2024-01-01', 1, 'country'),
  ('IN', 'gst', 0.18, TRUE, '2024-01-01', 1, 'country'),
  ('SG', 'gst', 0.08, TRUE, '2024-01-01', 1, 'country'),
  ('JP', 'consumption', 0.10, TRUE, '2024-01-01', 1, 'country'),
  ('ZA', 'vat', 0.15, TRUE, '2024-01-01', 1, 'country')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_tax_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tax_calculations_updated_at ON tax_calculations;
CREATE TRIGGER update_tax_calculations_updated_at
  BEFORE UPDATE ON tax_calculations
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

DROP TRIGGER IF EXISTS update_tax_nexus_updated_at ON tax_nexus;
CREATE TRIGGER update_tax_nexus_updated_at
  BEFORE UPDATE ON tax_nexus
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

DROP TRIGGER IF EXISTS update_tax_exemptions_updated_at ON tax_exemptions;
CREATE TRIGGER update_tax_exemptions_updated_at
  BEFORE UPDATE ON tax_exemptions
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

DROP TRIGGER IF EXISTS update_tax_deductions_updated_at ON tax_deductions;
CREATE TRIGGER update_tax_deductions_updated_at
  BEFORE UPDATE ON tax_deductions
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

DROP TRIGGER IF EXISTS update_tax_filings_updated_at ON tax_filings;
CREATE TRIGGER update_tax_filings_updated_at
  BEFORE UPDATE ON tax_filings
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

DROP TRIGGER IF EXISTS update_user_tax_profiles_updated_at ON user_tax_profiles;
CREATE TRIGGER update_user_tax_profiles_updated_at
  BEFORE UPDATE ON user_tax_profiles
  FOR EACH ROW EXECUTE FUNCTION update_tax_updated_at();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT ALL ON tax_calculations TO authenticated;
GRANT ALL ON tax_nexus TO authenticated;
GRANT ALL ON tax_exemptions TO authenticated;
GRANT ALL ON tax_refunds TO authenticated;
GRANT ALL ON tax_deductions TO authenticated;
GRANT ALL ON tax_filings TO authenticated;
GRANT ALL ON tax_api_logs TO authenticated;
GRANT ALL ON user_tax_profiles TO authenticated;
