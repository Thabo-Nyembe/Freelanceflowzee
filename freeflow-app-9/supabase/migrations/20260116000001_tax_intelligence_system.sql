-- =====================================================
-- FreeFlow Tax Intelligence System - Database Schema
-- =====================================================
-- Created: 2026-01-16
-- Description: Comprehensive tax management system supporting
--              176+ countries with real-time tracking, AI-powered
--              deduction categorization, and tax education
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TAX CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE, -- "VAT", "GST", "Sales Tax", "Income Tax", "Corporation Tax"
  description TEXT,
  code VARCHAR(50), -- Short code for reference
  applicable_countries TEXT[], -- Array of country codes where applicable
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tax_categories_name ON tax_categories(name);
CREATE INDEX IF NOT EXISTS idx_tax_categories_active ON tax_categories(is_active);

-- =====================================================
-- 2. TAX RATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code
  state VARCHAR(100), -- State/province/region (if applicable)
  city VARCHAR(100), -- City (for US local taxes)
  zip_code VARCHAR(20), -- Postal code (for granular rates)
  name VARCHAR(255) NOT NULL, -- Display name
  tax_type VARCHAR(50) NOT NULL, -- "vat", "gst", "sales", "income", "withholding"
  category_id UUID REFERENCES tax_categories(id) ON DELETE SET NULL,
  rate DECIMAL(8,5) NOT NULL, -- e.g., 0.07250 for 7.25%
  rate_type VARCHAR(20) DEFAULT 'percentage', -- "percentage" or "flat"
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE, -- NULL means currently active
  priority INTEGER DEFAULT 0, -- For conflicting rates, higher priority wins
  applies_to JSONB DEFAULT '{}', -- Conditions: {"product_types": [], "service_types": []}
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_rate CHECK (rate >= 0 AND rate <= 1),
  CONSTRAINT valid_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tax_rates_country ON tax_rates(country);
CREATE INDEX IF NOT EXISTS idx_tax_rates_country_state ON tax_rates(country, state);
CREATE INDEX IF NOT EXISTS idx_tax_rates_type ON tax_rates(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_rates_active ON tax_rates(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_rates_dates ON tax_rates(effective_from, effective_to);

-- =====================================================
-- 3. USER TAX PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tax_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  -- Primary tax residence
  primary_country VARCHAR(2) NOT NULL, -- ISO country code
  primary_state VARCHAR(100),
  primary_city VARCHAR(100),
  postal_code VARCHAR(20),
  tax_residence VARCHAR(100), -- Full jurisdiction name

  -- Business structure
  business_structure VARCHAR(50), -- "sole_proprietor", "llc", "s_corp", "c_corp", "partnership"
  business_name VARCHAR(255),
  business_registration_date DATE,

  -- Tax identification
  tax_id_number VARCHAR(100), -- VAT/GST/EIN/SSN (encrypted)
  tax_id_type VARCHAR(50), -- "EIN", "VAT", "GST", "SSN", "ABN", etc.
  tax_id_country VARCHAR(2),

  -- Filing information
  fiscal_year_end VARCHAR(5) DEFAULT '12-31', -- MM-DD format (e.g., "12-31", "06-30")
  tax_filing_frequency VARCHAR(20) DEFAULT 'annual', -- "quarterly", "monthly", "annual"
  estimated_annual_income DECIMAL(15,2),

  -- US-specific: Economic nexus tracking
  nexus_states JSONB DEFAULT '[]', -- ["CA", "NY", "TX"]
  nexus_threshold_met JSONB DEFAULT '{}', -- {"CA": true, "NY": false}

  -- Multi-country operations
  additional_tax_jurisdictions JSONB DEFAULT '[]', -- For digital nomads

  -- Preferences
  auto_calculate_tax BOOLEAN DEFAULT true,
  include_tax_in_prices BOOLEAN DEFAULT false, -- Tax-inclusive pricing
  default_tax_display VARCHAR(20) DEFAULT 'separate', -- "separate", "inclusive"
  reminder_days_before_deadline INTEGER DEFAULT 14,

  -- Professional support
  has_accountant BOOLEAN DEFAULT false,
  accountant_email VARCHAR(255),
  accountant_name VARCHAR(255),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tax_profiles_user ON user_tax_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tax_profiles_country ON user_tax_profiles(primary_country);

-- =====================================================
-- 4. TAXES TABLE (User's Tax Obligations)
-- =====================================================
CREATE TABLE IF NOT EXISTS taxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  tax_type VARCHAR(50) NOT NULL, -- "income", "vat", "gst", "sales", "payroll"
  jurisdiction VARCHAR(100) NOT NULL, -- "United States - California", "United Kingdom"
  jurisdiction_level VARCHAR(20), -- "federal", "state", "local", "national"

  name VARCHAR(255) NOT NULL, -- "Federal Income Tax", "California Sales Tax"
  code VARCHAR(50), -- Tax code/reference

  registration_number VARCHAR(100), -- VAT number, sales tax permit
  registration_date DATE,

  filing_frequency VARCHAR(20), -- "monthly", "quarterly", "annual"
  next_filing_date DATE,
  next_payment_date DATE,

  is_active BOOLEAN DEFAULT true,
  is_registered BOOLEAN DEFAULT false,

  threshold_amount DECIMAL(15,2), -- Registration threshold (e.g., $100k for economic nexus)
  current_year_revenue DECIMAL(15,2) DEFAULT 0,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_taxes_user ON taxes(user_id);
CREATE INDEX IF NOT EXISTS idx_taxes_type ON taxes(tax_type);
CREATE INDEX IF NOT EXISTS idx_taxes_jurisdiction ON taxes(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_taxes_active ON taxes(is_active);

-- =====================================================
-- 5. TAX CALCULATIONS TABLE (Transaction-Level)
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Transaction reference
  transaction_id UUID NOT NULL, -- Invoice, expense, payment ID
  transaction_type VARCHAR(50) NOT NULL, -- "invoice", "expense", "payment", "refund"
  transaction_date DATE NOT NULL,

  -- Location details
  origin_country VARCHAR(2),
  origin_state VARCHAR(100),
  origin_city VARCHAR(100),
  origin_postal_code VARCHAR(20),

  destination_country VARCHAR(2) NOT NULL,
  destination_state VARCHAR(100),
  destination_city VARCHAR(100),
  destination_postal_code VARCHAR(20),

  -- Tax calculation
  subtotal DECIMAL(15,2) NOT NULL,
  shipping_amount DECIMAL(15,2) DEFAULT 0,
  discount_amount DECIMAL(15,2) DEFAULT 0,

  tax_type VARCHAR(50) NOT NULL, -- "vat", "gst", "sales", "use"
  tax_rate DECIMAL(8,5) NOT NULL,
  tax_amount DECIMAL(15,2) NOT NULL,

  total_amount DECIMAL(15,2) NOT NULL,

  -- Detailed breakdown (multi-jurisdiction)
  breakdown JSONB DEFAULT '{}', -- {"federal": 5.5, "state": 2.5, "local": 1.0}

  -- API source
  calculation_method VARCHAR(50) DEFAULT 'manual', -- "manual", "taxjar", "avalara", "internal"
  api_response JSONB, -- Full API response for audit

  -- Nexus and compliance
  has_nexus BOOLEAN DEFAULT false,
  is_taxable BOOLEAN DEFAULT true,
  exemption_reason TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'calculated', -- "calculated", "applied", "overridden", "voided"
  override_reason TEXT,

  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_calc_user ON tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calc_transaction ON tax_calculations(transaction_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_tax_calc_date ON tax_calculations(transaction_date);
CREATE INDEX IF NOT EXISTS idx_tax_calc_country ON tax_calculations(destination_country);
CREATE INDEX IF NOT EXISTS idx_tax_calc_type ON tax_calculations(tax_type);

-- =====================================================
-- 6. TAX DEDUCTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_deductions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Linked expense
  expense_id UUID, -- REFERENCES expenses(id) - will add FK when expenses table confirmed

  -- Deduction details
  category VARCHAR(100) NOT NULL, -- "home_office", "equipment", "travel", "marketing", "health_insurance"
  subcategory VARCHAR(100), -- "mileage", "meals", "lodging"

  description TEXT NOT NULL,

  -- Amount details
  expense_amount DECIMAL(15,2) NOT NULL,
  deduction_percentage DECIMAL(5,2) DEFAULT 100.00, -- Business use percentage
  deductible_amount DECIMAL(15,2) NOT NULL,

  -- Date information
  expense_date DATE NOT NULL,
  tax_year INTEGER NOT NULL,

  -- Supporting documentation
  receipt_url TEXT,
  documentation JSONB DEFAULT '{}', -- {"invoice": "url", "receipt": "url", "notes": "..."}

  -- AI categorization
  ai_suggested BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ai_category_suggestion VARCHAR(100),

  -- Approval workflow
  status VARCHAR(20) DEFAULT 'pending', -- "pending", "approved", "rejected", "flagged"
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID, -- References users(id) for accountant approval
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Special deductions (US-specific examples)
  is_section_179 BOOLEAN DEFAULT false, -- Immediate equipment expensing
  is_bonus_depreciation BOOLEAN DEFAULT false,
  depreciation_schedule JSONB,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_percentage CHECK (deduction_percentage >= 0 AND deduction_percentage <= 100),
  CONSTRAINT valid_confidence CHECK (ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_deductions_user ON tax_deductions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_expense ON tax_deductions(expense_id);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_category ON tax_deductions(category);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_year ON tax_deductions(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_deductions_status ON tax_deductions(status);

-- =====================================================
-- 7. TAX FILINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,

  -- Filing period
  filing_period VARCHAR(20) NOT NULL, -- "Q1-2026", "2026", "Jan-2026"
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  tax_year INTEGER NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- "pending", "in_progress", "filed", "paid", "overdue"

  -- Financial summary
  total_revenue DECIMAL(15,2) DEFAULT 0,
  total_expenses DECIMAL(15,2) DEFAULT 0,
  total_deductions DECIMAL(15,2) DEFAULT 0,
  taxable_income DECIMAL(15,2) DEFAULT 0,

  total_tax_owed DECIMAL(15,2) DEFAULT 0,
  tax_paid DECIMAL(15,2) DEFAULT 0,
  tax_withheld DECIMAL(15,2) DEFAULT 0,
  amount_due DECIMAL(15,2) DEFAULT 0,
  refund_amount DECIMAL(15,2) DEFAULT 0,

  -- Deadlines
  due_date DATE NOT NULL,
  extended_due_date DATE,

  -- Filing information
  filed_date DATE,
  filed_by VARCHAR(100), -- "user", "accountant", "tax_software"
  filing_method VARCHAR(50), -- "e-file", "mail", "in_person"
  confirmation_number VARCHAR(100),

  -- Payment information
  payment_date DATE,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),

  -- Document storage
  filing_document_url TEXT,
  supporting_documents JSONB DEFAULT '[]', -- Array of document URLs

  -- Preparation data
  filing_data JSONB DEFAULT '{}', -- Complete filing information for export
  estimated_tax_payments JSONB DEFAULT '[]', -- Quarterly estimated payments

  -- Penalties and interest
  penalty_amount DECIMAL(15,2) DEFAULT 0,
  interest_amount DECIMAL(15,2) DEFAULT 0,
  penalty_reason TEXT,

  -- Audit trail
  preparation_notes TEXT,
  accountant_notes TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_filing_dates CHECK (period_end >= period_start)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_filings_user ON tax_filings(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_filings_tax ON tax_filings(tax_id);
CREATE INDEX IF NOT EXISTS idx_tax_filings_year ON tax_filings(tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_filings_status ON tax_filings(status);
CREATE INDEX IF NOT EXISTS idx_tax_filings_due_date ON tax_filings(due_date);

-- =====================================================
-- 8. TAX EXEMPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Entity being exempted
  entity_type VARCHAR(50) NOT NULL, -- "user", "client", "project", "product"
  entity_id UUID NOT NULL,

  -- Tax exemption details
  tax_id UUID REFERENCES taxes(id) ON DELETE SET NULL,
  exemption_type VARCHAR(100) NOT NULL, -- "resale", "nonprofit", "government", "export"

  -- Certificate information
  certificate_number VARCHAR(100),
  certificate_issuer VARCHAR(255),
  certificate_url TEXT,

  -- Validity
  status VARCHAR(20) DEFAULT 'active', -- "active", "expired", "revoked", "pending"
  valid_from DATE NOT NULL,
  valid_until DATE,

  -- Geographic scope
  applicable_countries TEXT[], -- Array of country codes
  applicable_states TEXT[], -- Array of state codes

  -- Documentation
  documentation JSONB DEFAULT '{}',
  verification_status VARCHAR(20) DEFAULT 'unverified', -- "unverified", "verified", "rejected"
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,

  -- Notes
  notes TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_exemption_dates CHECK (valid_until IS NULL OR valid_until >= valid_from)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_user ON tax_exemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_entity ON tax_exemptions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_status ON tax_exemptions(status);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_tax ON tax_exemptions(tax_id);

-- =====================================================
-- 9. TAX EDUCATION PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_education_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Lesson identification
  lesson_id VARCHAR(100) NOT NULL, -- Unique lesson identifier
  lesson_category VARCHAR(50), -- "deductions", "filing", "compliance", "international"
  lesson_title VARCHAR(255) NOT NULL,

  -- Progress tracking
  status VARCHAR(20) DEFAULT 'not_started', -- "not_started", "in_progress", "completed"
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  -- Assessment
  quiz_attempted BOOLEAN DEFAULT false,
  quiz_score INTEGER CHECK (quiz_score IS NULL OR (quiz_score >= 0 AND quiz_score <= 100)),
  quiz_passed BOOLEAN DEFAULT false,
  passing_score INTEGER DEFAULT 80,

  -- Time tracking
  time_spent_seconds INTEGER DEFAULT 0, -- Total time in lesson
  last_position VARCHAR(50), -- Bookmark position

  -- Completion
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Certification
  certificate_earned BOOLEAN DEFAULT false,
  certificate_id VARCHAR(100),
  certificate_url TEXT,

  -- Engagement metrics
  video_watched BOOLEAN DEFAULT false,
  interactive_completed BOOLEAN DEFAULT false,
  resources_downloaded BOOLEAN DEFAULT false,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one progress record per user per lesson
  UNIQUE(user_id, lesson_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_edu_user ON tax_education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_edu_category ON tax_education_progress(lesson_category);
CREATE INDEX IF NOT EXISTS idx_tax_edu_status ON tax_education_progress(status);

-- =====================================================
-- 10. TAX INSIGHTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Insight classification
  insight_type VARCHAR(50) NOT NULL, -- "deduction_opportunity", "filing_reminder", "rate_change", "nexus_alert", "savings_tip"
  category VARCHAR(50), -- "action_required", "informational", "optimization", "compliance"

  -- Content
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,

  -- Priority and urgency
  priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high", "urgent"
  severity VARCHAR(20), -- "info", "warning", "critical"

  -- Action
  action_required BOOLEAN DEFAULT false,
  action_label VARCHAR(100), -- "Review Deduction", "File Now", "Update Profile"
  action_url VARCHAR(500),

  -- Financial impact
  estimated_savings DECIMAL(15,2), -- Potential savings
  potential_penalty DECIMAL(15,2), -- Potential cost of ignoring

  -- Metadata
  related_entity_type VARCHAR(50), -- "deduction", "filing", "tax_rate"
  related_entity_id UUID,

  -- Display rules
  display_locations TEXT[], -- ["dashboard", "tax_page", "notification"]
  icon VARCHAR(50), -- Icon identifier

  -- Lifecycle
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,

  is_dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE,

  is_actioned BOOLEAN DEFAULT false,
  actioned_at TIMESTAMP WITH TIME ZONE,

  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  is_expired BOOLEAN DEFAULT false, -- Calculate in queries: (expires_at < NOW())

  -- AI-generated insights
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_insights_user ON tax_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_insights_type ON tax_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_tax_insights_priority ON tax_insights(priority);
CREATE INDEX IF NOT EXISTS idx_tax_insights_active ON tax_insights(is_dismissed, is_expired);

-- =====================================================
-- 11. TAX RULES TABLE (Rules Engine)
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Jurisdiction
  country VARCHAR(2) NOT NULL,
  state VARCHAR(100),

  -- Rule classification
  tax_type VARCHAR(50) NOT NULL, -- "income", "vat", "gst", "sales"
  rule_type VARCHAR(50) NOT NULL, -- "rate", "threshold", "exemption", "deduction", "nexus"
  rule_name VARCHAR(255) NOT NULL,

  -- Rule configuration (flexible JSONB)
  rule_config JSONB NOT NULL,
  /* Example structures:
     Threshold: {"amount": 100000, "period": "annual", "triggers": "registration"}
     Rate: {"base_rate": 0.07, "brackets": [...]}
     Exemption: {"categories": ["nonprofit", "export"], "requirements": [...]}
     Deduction: {"max_amount": 25000, "percentage": 1.0, "conditions": [...]}
  */

  -- Priority (for conflicting rules)
  priority INTEGER DEFAULT 0,

  -- Validity
  is_active BOOLEAN DEFAULT true,
  effective_from DATE NOT NULL,
  effective_to DATE,

  -- Source and authority
  source VARCHAR(255), -- "IRS", "HMRC", "ATO", etc.
  source_url TEXT,
  last_verified_date DATE,

  -- Documentation
  description TEXT,
  notes TEXT,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_rule_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_rules_country ON tax_rules(country);
CREATE INDEX IF NOT EXISTS idx_tax_rules_type ON tax_rules(tax_type, rule_type);
CREATE INDEX IF NOT EXISTS idx_tax_rules_active ON tax_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_rules_dates ON tax_rules(effective_from, effective_to);

-- =====================================================
-- 12. TAX API LOGS TABLE (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS tax_api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- API details
  api_provider VARCHAR(50) NOT NULL, -- "taxjar", "avalara", "stripe_tax"
  api_endpoint VARCHAR(255) NOT NULL,
  api_method VARCHAR(10) NOT NULL, -- "GET", "POST"

  -- Request
  request_payload JSONB,
  request_headers JSONB,

  -- Response
  response_status INTEGER,
  response_payload JSONB,
  response_time_ms INTEGER,

  -- Error handling
  is_error BOOLEAN DEFAULT false,
  error_message TEXT,
  error_code VARCHAR(50),

  -- Cost tracking (if applicable)
  api_cost DECIMAL(10,4), -- Cost per API call

  -- Timing
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_api_logs_user ON tax_api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_api_logs_provider ON tax_api_logs(api_provider);
CREATE INDEX IF NOT EXISTS idx_tax_api_logs_date ON tax_api_logs(requested_at);
CREATE INDEX IF NOT EXISTS idx_tax_api_logs_error ON tax_api_logs(is_error);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_tax_categories_updated_at BEFORE UPDATE ON tax_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_rates_updated_at BEFORE UPDATE ON tax_rates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_tax_profiles_updated_at BEFORE UPDATE ON user_tax_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_taxes_updated_at BEFORE UPDATE ON taxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_calculations_updated_at BEFORE UPDATE ON tax_calculations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_deductions_updated_at BEFORE UPDATE ON tax_deductions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_filings_updated_at BEFORE UPDATE ON tax_filings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_exemptions_updated_at BEFORE UPDATE ON tax_exemptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_education_progress_updated_at BEFORE UPDATE ON tax_education_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_insights_updated_at BEFORE UPDATE ON tax_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_rules_updated_at BEFORE UPDATE ON tax_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tax_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_education_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_api_logs ENABLE ROW LEVEL SECURITY;

-- Tax categories and rates are public (read-only)
CREATE POLICY "Tax categories are viewable by everyone" ON tax_categories FOR SELECT USING (true);
CREATE POLICY "Tax rates are viewable by everyone" ON tax_rates FOR SELECT USING (true);
CREATE POLICY "Tax rules are viewable by everyone" ON tax_rules FOR SELECT USING (true);

-- User-specific policies
CREATE POLICY "Users can view own tax profile" ON user_tax_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tax profile" ON user_tax_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tax profile" ON user_tax_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own taxes" ON taxes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own taxes" ON taxes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tax calculations" ON tax_calculations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own tax calculations" ON tax_calculations FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own deductions" ON tax_deductions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own deductions" ON tax_deductions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own filings" ON tax_filings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own filings" ON tax_filings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own exemptions" ON tax_exemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exemptions" ON tax_exemptions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own education progress" ON tax_education_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own education progress" ON tax_education_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON tax_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON tax_insights FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own API logs" ON tax_api_logs FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS (Documentation)
-- =====================================================

COMMENT ON TABLE tax_categories IS 'Tax category definitions (VAT, GST, Sales Tax, Income Tax, etc.)';
COMMENT ON TABLE tax_rates IS 'Tax rates by jurisdiction, including historical rates and future changes';
COMMENT ON TABLE user_tax_profiles IS 'User tax configuration, residence, business structure, and preferences';
COMMENT ON TABLE taxes IS 'User-specific tax obligations and registrations';
COMMENT ON TABLE tax_calculations IS 'Transaction-level tax calculations with full audit trail';
COMMENT ON TABLE tax_deductions IS 'Tax-deductible expenses with AI categorization and approval workflow';
COMMENT ON TABLE tax_filings IS 'Tax filing records, deadlines, and completion status';
COMMENT ON TABLE tax_exemptions IS 'Tax exemption certificates and eligibility';
COMMENT ON TABLE tax_education_progress IS 'User progress through tax education modules';
COMMENT ON TABLE tax_insights IS 'AI-generated and system-generated tax insights and recommendations';
COMMENT ON TABLE tax_rules IS 'Tax rules engine for country-specific compliance logic';
COMMENT ON TABLE tax_api_logs IS 'Audit log for external tax API calls';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
