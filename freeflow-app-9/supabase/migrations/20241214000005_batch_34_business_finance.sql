-- =====================================================
-- Batch 34: Business & Finance Migration
-- Created: December 14, 2024
-- Tables: invoices, contracts, billing
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INVOICES TABLE
-- Invoice creation and management
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  client_id UUID,
  project_id UUID,

  -- Invoice Details
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled', 'refunded')),

  -- Financial Details
  subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) DEFAULT 0.00,
  tax_amount DECIMAL(15, 2) DEFAULT 0.00,
  discount_amount DECIMAL(15, 2) DEFAULT 0.00,
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  amount_paid DECIMAL(15, 2) DEFAULT 0.00,
  amount_due DECIMAL(15, 2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Line Items
  items JSONB DEFAULT '[]'::jsonb,
  item_count INTEGER DEFAULT 0,

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  sent_date DATE,
  paid_date DATE,
  viewed_date DATE,

  -- Payment Terms
  payment_terms VARCHAR(255),
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  late_fee_percentage DECIMAL(5, 2) DEFAULT 0.00,

  -- Client Information
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_address TEXT,
  client_phone VARCHAR(50),

  -- Billing Information
  billing_address TEXT,
  shipping_address TEXT,

  -- Notes
  notes TEXT,
  terms_and_conditions TEXT,
  internal_notes TEXT,

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  has_attachments BOOLEAN DEFAULT FALSE,

  -- Tracking
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_schedule VARCHAR(50),
  parent_invoice_id UUID REFERENCES invoices(id),

  -- Reminders
  reminder_sent_count INTEGER DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- CONTRACTS TABLE
-- Contract management and tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS contracts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  client_id UUID,
  project_id UUID,

  -- Contract Details
  contract_number VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  contract_type VARCHAR(50) NOT NULL DEFAULT 'service'
    CHECK (contract_type IN ('service', 'product', 'employment', 'nda', 'partnership', 'license', 'lease', 'custom')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending-review', 'pending-signature', 'active', 'completed', 'cancelled', 'expired', 'terminated', 'renewed')),

  -- Financial Terms
  contract_value DECIMAL(15, 2) DEFAULT 0.00,
  payment_schedule VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  signed_date DATE,
  effective_date DATE,
  termination_date DATE,
  renewal_date DATE,

  -- Parties
  party_a_name VARCHAR(255),
  party_a_email VARCHAR(255),
  party_a_address TEXT,
  party_a_signature VARCHAR(500),
  party_a_signed_at TIMESTAMPTZ,

  party_b_name VARCHAR(255),
  party_b_email VARCHAR(255),
  party_b_address TEXT,
  party_b_signature VARCHAR(500),
  party_b_signed_at TIMESTAMPTZ,

  -- Contract Terms
  terms TEXT NOT NULL,
  clauses JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  milestones JSONB DEFAULT '[]'::jsonb,

  -- Renewal & Termination
  is_auto_renewable BOOLEAN DEFAULT FALSE,
  renewal_notice_period_days INTEGER DEFAULT 30,
  termination_notice_period_days INTEGER DEFAULT 30,
  termination_clause TEXT,

  -- Tracking
  is_template BOOLEAN DEFAULT FALSE,
  template_id UUID REFERENCES contracts(id),
  version INTEGER DEFAULT 1,
  parent_contract_id UUID REFERENCES contracts(id),

  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  has_attachments BOOLEAN DEFAULT FALSE,
  document_url VARCHAR(500),

  -- Compliance
  requires_legal_review BOOLEAN DEFAULT FALSE,
  legal_review_status VARCHAR(50),
  legal_reviewer_id UUID REFERENCES auth.users(id),
  legal_review_date DATE,

  -- Notes
  notes TEXT,
  internal_notes TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- BILLING TABLE
-- Billing and payment tracking
-- =====================================================

CREATE TABLE IF NOT EXISTS billing (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID,
  customer_id UUID,
  invoice_id UUID REFERENCES invoices(id),

  -- Transaction Details
  transaction_id VARCHAR(255) UNIQUE,
  transaction_type VARCHAR(50) NOT NULL DEFAULT 'charge'
    CHECK (transaction_type IN ('charge', 'payment', 'refund', 'adjustment', 'credit', 'debit')),

  -- Status
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'disputed')),

  -- Financial Details
  amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  fee_amount DECIMAL(15, 2) DEFAULT 0.00,
  net_amount DECIMAL(15, 2),
  tax_amount DECIMAL(15, 2) DEFAULT 0.00,

  -- Payment Method
  payment_method VARCHAR(50) NOT NULL DEFAULT 'card'
    CHECK (payment_method IN ('card', 'bank-transfer', 'paypal', 'stripe', 'cash', 'check', 'crypto', 'other')),
  payment_provider VARCHAR(50),

  -- Card Details (if applicable)
  card_last4 VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Bank Details (if applicable)
  bank_name VARCHAR(255),
  account_last4 VARCHAR(4),

  -- Billing Information
  billing_name VARCHAR(255),
  billing_email VARCHAR(255),
  billing_address TEXT,
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),

  -- Transaction Details
  description TEXT,
  notes TEXT,
  internal_notes TEXT,

  -- Dates
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_date TIMESTAMPTZ,
  refunded_date TIMESTAMPTZ,

  -- Receipt & Invoice
  receipt_number VARCHAR(100),
  receipt_url VARCHAR(500),
  invoice_number VARCHAR(100),

  -- Subscription (if applicable)
  subscription_id VARCHAR(255),
  subscription_period_start DATE,
  subscription_period_end DATE,

  -- Dispute & Refund
  dispute_reason TEXT,
  dispute_date TIMESTAMPTZ,
  refund_reason TEXT,
  refund_amount DECIMAL(15, 2),

  -- Provider Response
  provider_response JSONB,
  error_code VARCHAR(100),
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Invoices Indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_client_id ON invoices(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_status ON invoices(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC) WHERE deleted_at IS NULL;

-- Contracts Indexes
CREATE INDEX idx_contracts_user_id ON contracts(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_client_id ON contracts(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_status ON contracts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_type ON contracts(contract_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_number ON contracts(contract_number);
CREATE INDEX idx_contracts_end_date ON contracts(end_date) WHERE deleted_at IS NULL;

-- Billing Indexes
CREATE INDEX idx_billing_user_id ON billing(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_billing_customer_id ON billing(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_billing_status ON billing(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_billing_transaction_id ON billing(transaction_id);
CREATE INDEX idx_billing_invoice_id ON billing(invoice_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_billing_created ON billing(created_at DESC) WHERE deleted_at IS NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing ENABLE ROW LEVEL SECURITY;

-- Invoices Policies
CREATE POLICY "Users can view their own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
  ON invoices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
  ON invoices FOR DELETE
  USING (auth.uid() = user_id);

-- Contracts Policies
CREATE POLICY "Users can view their own contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
  ON contracts FOR DELETE
  USING (auth.uid() = user_id);

-- Billing Policies
CREATE POLICY "Users can view their own billing"
  ON billing FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing"
  ON billing FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own billing"
  ON billing FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own billing"
  ON billing FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS for auto-updating timestamps
-- =====================================================

-- Invoices Trigger
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Contracts Trigger
CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Billing Trigger
CREATE TRIGGER update_billing_updated_at
  BEFORE UPDATE ON billing
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REAL-TIME SUBSCRIPTIONS
-- Enable real-time for all tables
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE billing;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
