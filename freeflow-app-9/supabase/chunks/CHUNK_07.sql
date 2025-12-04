-- ============================================================================
-- Escrow & Secure Payment System - Complete Database Schema
-- ============================================================================
-- Description: Production-ready escrow payment system with milestone tracking
-- Features:
--   - Secure escrow deposit management
--   - Milestone-based payment releases
--   - Password-protected fund releases
--   - Dispute resolution system
--   - Multi-currency support
--   - Payment method integration
--   - Transaction history
--   - Contract management
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS escrow_status CASCADE;
CREATE TYPE escrow_status AS ENUM (
  'pending',
  'active',
  'completed',
  'disputed',
  'released',
  'refunded',
  'cancelled'
);

DROP TYPE IF EXISTS milestone_status CASCADE;
CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'disputed',
  'approved',
  'rejected'
);

DROP TYPE IF EXISTS payment_method CASCADE;
CREATE TYPE payment_method AS ENUM (
  'stripe',
  'paypal',
  'bank_transfer',
  'crypto',
  'wire_transfer',
  'credit_card'
);

DROP TYPE IF EXISTS currency_type CASCADE;
CREATE TYPE currency_type AS ENUM (
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF'
);

DROP TYPE IF EXISTS dispute_status CASCADE;
CREATE TYPE dispute_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'escalated',
  'closed'
);

DROP TYPE IF EXISTS transaction_type CASCADE;
CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'release',
  'refund',
  'fee',
  'chargeback',
  'adjustment'
);

DROP TYPE IF EXISTS transaction_status CASCADE;
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Escrow Deposits Table
CREATE TABLE IF NOT EXISTS escrow_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Project Info
  project_title TEXT NOT NULL,
  project_description TEXT,

  -- Client Info
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_avatar TEXT,

  -- Financial Info
  amount DECIMAL(12, 2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',

  -- Status & Progress
  status escrow_status NOT NULL DEFAULT 'pending',
  progress_percentage INTEGER DEFAULT 0,

  -- Security
  completion_password TEXT NOT NULL,

  -- Payment Info
  payment_method payment_method NOT NULL DEFAULT 'stripe',
  payment_id TEXT,

  -- Contract
  contract_url TEXT,
  contract_signed_at TIMESTAMPTZ,

  -- Dispute
  dispute_reason TEXT,
  dispute_status dispute_status,

  -- Notes
  notes TEXT,

  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  released_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount > 0),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_email CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Escrow Milestones Table
CREATE TABLE IF NOT EXISTS escrow_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,

  -- Milestone Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Financial
  amount DECIMAL(12, 2) NOT NULL,
  percentage DECIMAL(5, 2) NOT NULL,

  -- Status
  status milestone_status NOT NULL DEFAULT 'pending',

  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,

  -- Dependencies
  dependencies UUID[] DEFAULT ARRAY[]::UUID[],

  -- Deliverables
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Approval/Rejection
  approval_notes TEXT,
  rejection_reason TEXT,

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 0),
  CONSTRAINT valid_percentage CHECK (percentage >= 0 AND percentage <= 100)
);

-- Milestone Attachments Table
CREATE TABLE IF NOT EXISTS milestone_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id UUID NOT NULL REFERENCES escrow_milestones(id) ON DELETE CASCADE,

  -- File Info
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,

  -- Metadata
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT valid_size CHECK (size > 0)
);

-- Escrow Fees Table
CREATE TABLE IF NOT EXISTS escrow_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,

  -- Platform Fees
  platform_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  platform_percentage DECIMAL(5, 2) NOT NULL DEFAULT 3.0,

  -- Payment Processor Fees
  payment_fee DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_percentage DECIMAL(5, 2) NOT NULL DEFAULT 2.0,

  -- Withdrawal Fees
  withdrawal_fee DECIMAL(12, 2) NOT NULL DEFAULT 50,

  -- Total
  total_fees DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Currency
  currency currency_type NOT NULL DEFAULT 'USD',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_fees CHECK (
    platform_fee >= 0 AND
    payment_fee >= 0 AND
    withdrawal_fee >= 0 AND
    total_fees >= 0
  )
);

-- Escrow Transactions Table
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,

  -- Transaction Info
  type transaction_type NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency currency_type NOT NULL DEFAULT 'USD',
  status transaction_status NOT NULL DEFAULT 'pending',

  -- Payment Info
  payment_method payment_method NOT NULL,
  payment_id TEXT,

  -- Description
  description TEXT NOT NULL,

  -- Parties
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Fees
  fees DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2) NOT NULL,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 0),
  CONSTRAINT valid_fees CHECK (fees >= 0),
  CONSTRAINT valid_net_amount CHECK (net_amount >= 0)
);

-- Escrow Disputes Table
CREATE TABLE IF NOT EXISTS escrow_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES escrow_milestones(id) ON DELETE SET NULL,

  -- Raised By
  raised_by TEXT NOT NULL CHECK (raised_by IN ('client', 'freelancer')),
  raised_by_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raised_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Dispute Info
  status dispute_status NOT NULL DEFAULT 'open',
  reason TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Resolution
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Escalation
  escalated_at TIMESTAMPTZ,
  escalated_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dispute Evidence Table
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES escrow_disputes(id) ON DELETE CASCADE,

  -- Evidence Info
  type TEXT NOT NULL CHECK (type IN ('file', 'screenshot', 'message', 'contract', 'other')),
  url TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Metadata
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Escrow Contracts Table
CREATE TABLE IF NOT EXISTS escrow_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,

  -- Contract Info
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,

  -- Signatures
  signed_by_client BOOLEAN DEFAULT false,
  signed_by_freelancer BOOLEAN DEFAULT false,
  client_signed_at TIMESTAMPTZ,
  freelancer_signed_at TIMESTAMPTZ,

  -- Version
  version INTEGER DEFAULT 1,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_version CHECK (version > 0)
);

-- Contract Terms Table
CREATE TABLE IF NOT EXISTS contract_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES escrow_contracts(id) ON DELETE CASCADE,

  -- Term Info
  section TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,

  -- Requirements
  required BOOLEAN DEFAULT false,

  -- Agreement
  agreed_by_client BOOLEAN DEFAULT false,
  agreed_by_freelancer BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Release Requests Table
CREATE TABLE IF NOT EXISTS release_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES escrow_milestones(id) ON DELETE SET NULL,

  -- Request Info
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Approval
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  -- Rejection
  rejected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Amount
  amount DECIMAL(12, 2) NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount > 0)
);

-- Escrow Metadata Table
CREATE TABLE IF NOT EXISTS escrow_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deposit_id UUID NOT NULL REFERENCES escrow_deposits(id) ON DELETE CASCADE,

  -- Duration
  estimated_duration INTEGER, -- in days
  actual_duration INTEGER, -- in days

  -- Counts
  total_edits INTEGER DEFAULT 0,
  total_disputes INTEGER DEFAULT 0,
  total_releases INTEGER DEFAULT 0,

  -- Averages
  average_milestone_time DECIMAL(5, 2), -- in days

  -- Ratings
  client_rating INTEGER CHECK (client_rating >= 1 AND client_rating <= 5),
  freelancer_rating INTEGER CHECK (freelancer_rating >= 1 AND freelancer_rating <= 5),

  -- Tags & Category
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT unique_deposit UNIQUE (deposit_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Escrow Deposits Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_user_id ON escrow_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_client_id ON escrow_deposits(client_id);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_status ON escrow_deposits(status);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_created_at ON escrow_deposits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_amount ON escrow_deposits(amount DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_currency ON escrow_deposits(currency);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_payment_method ON escrow_deposits(payment_method);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_user_status ON escrow_deposits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_client_email ON escrow_deposits(client_email);
CREATE INDEX IF NOT EXISTS idx_escrow_deposits_dispute_status ON escrow_deposits(dispute_status) WHERE dispute_status IS NOT NULL;

-- Escrow Milestones Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_deposit_id ON escrow_milestones(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_status ON escrow_milestones(status);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_due_date ON escrow_milestones(due_date);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_created_at ON escrow_milestones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_milestones_deposit_status ON escrow_milestones(deposit_id, status);

-- Milestone Attachments Indexes
CREATE INDEX IF NOT EXISTS idx_milestone_attachments_milestone_id ON milestone_attachments(milestone_id);
CREATE INDEX IF NOT EXISTS idx_milestone_attachments_uploaded_at ON milestone_attachments(uploaded_at DESC);

-- Escrow Fees Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_fees_deposit_id ON escrow_fees(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_fees_currency ON escrow_fees(currency);

-- Escrow Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_deposit_id ON escrow_transactions(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_type ON escrow_transactions(type);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_created_at ON escrow_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_from_user_id ON escrow_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_to_user_id ON escrow_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_escrow_transactions_payment_id ON escrow_transactions(payment_id);

-- Escrow Disputes Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_deposit_id ON escrow_disputes(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_milestone_id ON escrow_disputes(milestone_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_status ON escrow_disputes(status);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_raised_by_id ON escrow_disputes(raised_by_id);
CREATE INDEX IF NOT EXISTS idx_escrow_disputes_raised_at ON escrow_disputes(raised_at DESC);

-- Dispute Evidence Indexes
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_uploaded_at ON dispute_evidence(uploaded_at DESC);

-- Escrow Contracts Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_deposit_id ON escrow_contracts(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_contracts_version ON escrow_contracts(version DESC);

-- Contract Terms Indexes
CREATE INDEX IF NOT EXISTS idx_contract_terms_contract_id ON contract_terms(contract_id);

-- Release Requests Indexes
CREATE INDEX IF NOT EXISTS idx_release_requests_deposit_id ON release_requests(deposit_id);
CREATE INDEX IF NOT EXISTS idx_release_requests_milestone_id ON release_requests(milestone_id);
CREATE INDEX IF NOT EXISTS idx_release_requests_status ON release_requests(status);
CREATE INDEX IF NOT EXISTS idx_release_requests_requested_by ON release_requests(requested_by);

-- Escrow Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_escrow_metadata_deposit_id ON escrow_metadata(deposit_id);
CREATE INDEX IF NOT EXISTS idx_escrow_metadata_category ON escrow_metadata(category);
CREATE INDEX IF NOT EXISTS idx_escrow_metadata_tags ON escrow_metadata USING gin(tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE escrow_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_metadata ENABLE ROW LEVEL SECURITY;

-- Escrow Deposits Policies
CREATE POLICY "Users can view own deposits"
  ON escrow_deposits FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can create own deposits"
  ON escrow_deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deposits"
  ON escrow_deposits FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = client_id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = client_id);

CREATE POLICY "Users can delete own deposits"
  ON escrow_deposits FOR DELETE
  USING (auth.uid() = user_id);

-- Escrow Milestones Policies
CREATE POLICY "Users can view milestones of their deposits"
  ON escrow_milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create milestones for own deposits"
  ON escrow_milestones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update milestones of own deposits"
  ON escrow_milestones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Milestone Attachments Policies
CREATE POLICY "Users can view attachments of their milestones"
  ON milestone_attachments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_milestones em
      JOIN escrow_deposits ed ON em.deposit_id = ed.id
      WHERE em.id = milestone_id
      AND (ed.user_id = auth.uid() OR ed.client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create attachments for own milestones"
  ON milestone_attachments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM escrow_milestones em
      JOIN escrow_deposits ed ON em.deposit_id = ed.id
      WHERE em.id = milestone_id AND ed.user_id = auth.uid()
    )
  );

-- Escrow Fees Policies
CREATE POLICY "Users can view fees for their deposits"
  ON escrow_fees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Escrow Transactions Policies
CREATE POLICY "Users can view their transactions"
  ON escrow_transactions FOR SELECT
  USING (
    from_user_id = auth.uid() OR
    to_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "System can create transactions"
  ON escrow_transactions FOR INSERT
  WITH CHECK (true);

-- Escrow Disputes Policies
CREATE POLICY "Users can view disputes for their deposits"
  ON escrow_disputes FOR SELECT
  USING (
    raised_by_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes for their deposits"
  ON escrow_disputes FOR INSERT
  WITH CHECK (
    raised_by_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Dispute Evidence Policies
CREATE POLICY "Users can view evidence for their disputes"
  ON dispute_evidence FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_disputes ed
      JOIN escrow_deposits dep ON ed.deposit_id = dep.id
      WHERE ed.id = dispute_id
      AND (dep.user_id = auth.uid() OR dep.client_id = auth.uid())
    )
  );

-- Escrow Contracts Policies
CREATE POLICY "Users can view contracts for their deposits"
  ON escrow_contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Contract Terms Policies
CREATE POLICY "Users can view terms for their contracts"
  ON contract_terms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_contracts ec
      JOIN escrow_deposits ed ON ec.deposit_id = ed.id
      WHERE ec.id = contract_id
      AND (ed.user_id = auth.uid() OR ed.client_id = auth.uid())
    )
  );

-- Release Requests Policies
CREATE POLICY "Users can view release requests for their deposits"
  ON release_requests FOR SELECT
  USING (
    requested_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Users can create release requests for their deposits"
  ON release_requests FOR INSERT
  WITH CHECK (
    requested_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Escrow Metadata Policies
CREATE POLICY "Users can view metadata for their deposits"
  ON escrow_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM escrow_deposits
      WHERE id = deposit_id
      AND (user_id = auth.uid() OR client_id = auth.uid())
    )
  );

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

CREATE TRIGGER update_escrow_deposits_updated_at BEFORE UPDATE ON escrow_deposits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_milestones_updated_at BEFORE UPDATE ON escrow_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_fees_updated_at BEFORE UPDATE ON escrow_fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_disputes_updated_at BEFORE UPDATE ON escrow_disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_contracts_updated_at BEFORE UPDATE ON escrow_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_metadata_updated_at BEFORE UPDATE ON escrow_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate deposit progress based on milestones
CREATE OR REPLACE FUNCTION calculate_deposit_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  progress INTEGER;
BEGIN
  -- Count total and completed milestones
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_milestones, completed_milestones
  FROM escrow_milestones
  WHERE deposit_id = NEW.deposit_id;

  -- Calculate progress percentage
  IF total_milestones > 0 THEN
    progress := ROUND((completed_milestones::DECIMAL / total_milestones) * 100);
  ELSE
    progress := 0;
  END IF;

  -- Update deposit progress
  UPDATE escrow_deposits
  SET progress_percentage = progress
  WHERE id = NEW.deposit_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_deposit_progress
  AFTER INSERT OR UPDATE OF status ON escrow_milestones
  FOR EACH ROW
  EXECUTE FUNCTION calculate_deposit_progress();

-- Auto-create fees record when deposit is created
CREATE OR REPLACE FUNCTION create_escrow_fees()
RETURNS TRIGGER AS $$
DECLARE
  platform_pct DECIMAL := 3.0;
  payment_pct DECIMAL := 2.0;
  withdrawal_amt DECIMAL := 50;
  platform_amt DECIMAL;
  payment_amt DECIMAL;
  total_amt DECIMAL;
BEGIN
  -- Adjust payment percentage based on payment method
  CASE NEW.payment_method
    WHEN 'stripe', 'credit_card' THEN payment_pct := 2.9;
    WHEN 'paypal' THEN payment_pct := 3.49;
    WHEN 'bank_transfer', 'wire_transfer' THEN payment_pct := 1.0;
    WHEN 'crypto' THEN payment_pct := 1.5;
    ELSE payment_pct := 2.0;
  END CASE;

  -- Calculate fees
  platform_amt := (NEW.amount * platform_pct) / 100;
  payment_amt := (NEW.amount * payment_pct) / 100;
  total_amt := platform_amt + payment_amt + withdrawal_amt;

  -- Insert fees record
  INSERT INTO escrow_fees (
    deposit_id,
    platform_fee,
    platform_percentage,
    payment_fee,
    payment_percentage,
    withdrawal_fee,
    total_fees,
    currency
  ) VALUES (
    NEW.id,
    platform_amt,
    platform_pct,
    payment_amt,
    payment_pct,
    withdrawal_amt,
    total_amt,
    NEW.currency
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_escrow_fees
  AFTER INSERT ON escrow_deposits
  FOR EACH ROW
  EXECUTE FUNCTION create_escrow_fees();

-- Auto-create metadata record when deposit is created
CREATE OR REPLACE FUNCTION create_escrow_metadata()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO escrow_metadata (deposit_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_escrow_metadata
  AFTER INSERT ON escrow_deposits
  FOR EACH ROW
  EXECUTE FUNCTION create_escrow_metadata();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's total escrow value
CREATE OR REPLACE FUNCTION get_total_escrow_value(
  user_uuid UUID
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM escrow_deposits
  WHERE user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get user's active deposits count
CREATE OR REPLACE FUNCTION get_active_deposits_count(
  user_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM escrow_deposits
  WHERE user_id = user_uuid
    AND status = 'active';
$$ LANGUAGE sql STABLE;

-- Get deposit completion percentage
CREATE OR REPLACE FUNCTION get_deposit_completion(
  deposit_uuid UUID
)
RETURNS INTEGER AS $$
  SELECT COALESCE(progress_percentage, 0)
  FROM escrow_deposits
  WHERE id = deposit_uuid;
$$ LANGUAGE sql STABLE;

-- Check if milestone dependencies are completed
CREATE OR REPLACE FUNCTION check_milestone_dependencies(
  milestone_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  deps UUID[];
  incomplete_count INTEGER;
BEGIN
  -- Get dependencies
  SELECT dependencies INTO deps
  FROM escrow_milestones
  WHERE id = milestone_uuid;

  -- If no dependencies, return true
  IF deps IS NULL OR array_length(deps, 1) IS NULL THEN
    RETURN true;
  END IF;

  -- Check if all dependencies are completed
  SELECT COUNT(*) INTO incomplete_count
  FROM escrow_milestones
  WHERE id = ANY(deps)
    AND status != 'completed';

  RETURN incomplete_count = 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get escrow statistics for user
CREATE OR REPLACE FUNCTION get_escrow_statistics(
  user_uuid UUID
)
RETURNS TABLE (
  total_deposits INTEGER,
  total_value DECIMAL,
  total_released DECIMAL,
  total_fees DECIMAL,
  active_deposits INTEGER,
  completed_deposits INTEGER,
  disputed_deposits INTEGER,
  average_project_value DECIMAL,
  success_rate DECIMAL
) AS $$
  SELECT
    COUNT(*)::INTEGER as total_deposits,
    COALESCE(SUM(ed.amount), 0) as total_value,
    COALESCE(SUM(CASE WHEN ed.status = 'released' THEN ed.amount ELSE 0 END), 0) as total_released,
    COALESCE(SUM(ef.total_fees), 0) as total_fees,
    COUNT(*) FILTER (WHERE ed.status = 'active')::INTEGER as active_deposits,
    COUNT(*) FILTER (WHERE ed.status = 'released')::INTEGER as completed_deposits,
    COUNT(*) FILTER (WHERE ed.status = 'disputed')::INTEGER as disputed_deposits,
    COALESCE(AVG(ed.amount), 0) as average_project_value,
    CASE
      WHEN COUNT(*) > 0 THEN
        (COUNT(*) FILTER (WHERE ed.status = 'released')::DECIMAL / COUNT(*)) * 100
      ELSE 0
    END as success_rate
  FROM escrow_deposits ed
  LEFT JOIN escrow_fees ef ON ed.id = ef.deposit_id
  WHERE ed.user_id = user_uuid;
$$ LANGUAGE sql STABLE;

-- Get pending milestones for deposit
CREATE OR REPLACE FUNCTION get_pending_milestones(
  deposit_uuid UUID
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  amount DECIMAL,
  due_date TIMESTAMPTZ
) AS $$
  SELECT
    id,
    title,
    amount,
    due_date
  FROM escrow_milestones
  WHERE deposit_id = deposit_uuid
    AND status = 'pending'
  ORDER BY due_date ASC NULLS LAST;
$$ LANGUAGE sql STABLE;

-- Verify completion password
CREATE OR REPLACE FUNCTION verify_completion_password(
  deposit_uuid UUID,
  password_input TEXT
)
RETURNS BOOLEAN AS $$
  SELECT completion_password = password_input
  FROM escrow_deposits
  WHERE id = deposit_uuid;
$$ LANGUAGE sql STABLE;

-- Get overdue milestones
CREATE OR REPLACE FUNCTION get_overdue_milestones()
RETURNS TABLE (
  deposit_id UUID,
  milestone_id UUID,
  title TEXT,
  due_date TIMESTAMPTZ,
  days_overdue INTEGER
) AS $$
  SELECT
    em.deposit_id,
    em.id as milestone_id,
    em.title,
    em.due_date,
    EXTRACT(DAY FROM (NOW() - em.due_date))::INTEGER as days_overdue
  FROM escrow_milestones em
  WHERE em.status IN ('pending', 'in_progress')
    AND em.due_date < NOW()
  ORDER BY em.due_date ASC;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE escrow_deposits IS 'Secure escrow deposits with milestone-based payments';
COMMENT ON TABLE escrow_milestones IS 'Project milestones for phased payment releases';
COMMENT ON TABLE milestone_attachments IS 'File attachments for milestone deliverables';
COMMENT ON TABLE escrow_fees IS 'Fee breakdown for escrow deposits';
COMMENT ON TABLE escrow_transactions IS 'Transaction history for escrow payments';
COMMENT ON TABLE escrow_disputes IS 'Dispute management for escrow deposits';
COMMENT ON TABLE dispute_evidence IS 'Evidence files for dispute resolution';
COMMENT ON TABLE escrow_contracts IS 'Contract documents for escrow agreements';
COMMENT ON TABLE contract_terms IS 'Individual terms within escrow contracts';
COMMENT ON TABLE release_requests IS 'Requests for fund release approval';
COMMENT ON TABLE escrow_metadata IS 'Additional metadata for escrow deposits';
-- ============================================================================
-- FILES HUB SYSTEM - COMPREHENSIVE DATABASE SCHEMA
-- Session 9: Multi-Cloud Storage Intelligence
-- Created: 2024-11-26
-- ============================================================================

-- Drop existing objects if they exist
DROP TRIGGER IF EXISTS trigger_update_file_updated_at ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_update_folder_updated_at ON folders CASCADE;
DROP TRIGGER IF EXISTS trigger_log_file_activity ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_update_folder_file_count ON files CASCADE;
DROP TRIGGER IF EXISTS trigger_generate_file_thumbnail ON files CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS log_file_activity CASCADE;
DROP FUNCTION IF EXISTS update_folder_file_count CASCADE;
DROP FUNCTION IF EXISTS generate_file_thumbnail CASCADE;
DROP FUNCTION IF EXISTS search_files CASCADE;

DROP TABLE IF EXISTS file_collaborators CASCADE;
DROP TABLE IF EXISTS file_backups CASCADE;
DROP TABLE IF EXISTS file_analytics CASCADE;
DROP TABLE IF EXISTS file_conversions CASCADE;
DROP TABLE IF EXISTS file_previews CASCADE;
DROP TABLE IF EXISTS file_thumbnails CASCADE;
DROP TABLE IF EXISTS file_locks CASCADE;
DROP TABLE IF EXISTS file_activities CASCADE;
DROP TABLE IF EXISTS file_comments CASCADE;
DROP TABLE IF EXISTS file_tags CASCADE;
DROP TABLE IF EXISTS file_shares CASCADE;
DROP TABLE IF EXISTS file_versions CASCADE;
DROP TABLE IF EXISTS files CASCADE;
DROP TABLE IF EXISTS folders CASCADE;

DROP TYPE IF EXISTS file_type CASCADE;
DROP TYPE IF EXISTS access_level CASCADE;
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS share_permission CASCADE;
DROP TYPE IF EXISTS file_status CASCADE;
DROP TYPE IF EXISTS storage_provider CASCADE;
DROP TYPE IF EXISTS conversion_status CASCADE;

-- ============================================================================
-- ENUMS
-- ============================================================================

-- File type categorization
DROP TYPE IF EXISTS file_type CASCADE;
CREATE TYPE file_type AS ENUM (
  'document',
  'image',
  'video',
  'audio',
  'archive',
  'code',
  'other'
);

-- Access level for file sharing
DROP TYPE IF EXISTS access_level CASCADE;
CREATE TYPE access_level AS ENUM (
  'private',
  'team',
  'public',
  'restricted'
);

-- Activity tracking types
DROP TYPE IF EXISTS activity_type CASCADE;
CREATE TYPE activity_type AS ENUM (
  'view',
  'download',
  'upload',
  'edit',
  'share',
  'delete',
  'restore',
  'comment',
  'move',
  'rename',
  'lock',
  'unlock',
  'star',
  'unstar',
  'archive',
  'unarchive'
);

-- Share permission levels
DROP TYPE IF EXISTS share_permission CASCADE;
CREATE TYPE share_permission AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

-- File status
DROP TYPE IF EXISTS file_status CASCADE;
CREATE TYPE file_status AS ENUM (
  'active',
  'archived',
  'deleted',
  'processing',
  'failed'
);

-- Storage provider for multi-cloud
DROP TYPE IF EXISTS storage_provider CASCADE;
CREATE TYPE storage_provider AS ENUM (
  'supabase',
  'wasabi',
  'aws-s3',
  'google-cloud',
  'azure'
);

-- Conversion status
DROP TYPE IF EXISTS conversion_status CASCADE;
CREATE TYPE conversion_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

-- ============================================================================
-- TABLE 1: FOLDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,

  -- Folder details
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),

  -- Metadata
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Permissions
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT true,
  can_share BOOLEAN DEFAULT true,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT folders_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  CONSTRAINT folders_path_check CHECK (char_length(path) >= 1)
);

-- Indexes for folders
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders(name);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders USING GIN(to_tsvector('english', path));
CREATE INDEX IF NOT EXISTS idx_folders_created_at ON folders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_folders_is_shared ON folders(is_shared) WHERE is_shared = true;

-- ============================================================================
-- TABLE 2: FILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

  -- File details
  name VARCHAR(500) NOT NULL,
  original_name VARCHAR(500),
  type file_type NOT NULL,
  extension VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL,

  -- Storage
  url TEXT NOT NULL,
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,
  checksum VARCHAR(64),

  -- Metadata
  mime_type VARCHAR(255),
  encoding VARCHAR(50),
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  page_count INTEGER,
  word_count INTEGER,
  compression VARCHAR(50),
  language VARCHAR(50),

  -- Content
  description TEXT,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Status
  status file_status DEFAULT 'active',
  access_level access_level DEFAULT 'private',

  -- Flags
  is_starred BOOLEAN DEFAULT false,
  is_shared BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,

  -- Analytics
  downloads INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,

  -- Timestamps
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT files_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 500),
  CONSTRAINT files_size_check CHECK (size >= 0),
  CONSTRAINT files_downloads_check CHECK (downloads >= 0),
  CONSTRAINT files_views_check CHECK (views >= 0),
  CONSTRAINT files_version_check CHECK (version >= 1)
);

-- Indexes for files
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_name ON files USING GIN(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_extension ON files(extension);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_storage_provider ON files(storage_provider);
CREATE INDEX IF NOT EXISTS idx_files_is_starred ON files(is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_files_is_shared ON files(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_files_is_locked ON files(is_locked) WHERE is_locked = true;
CREATE INDEX IF NOT EXISTS idx_files_is_archived ON files(is_archived) WHERE is_archived = true;
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_modified_at ON files(modified_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_last_accessed_at ON files(last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_size ON files(size DESC);
CREATE INDEX IF NOT EXISTS idx_files_downloads ON files(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_files_views ON files(views DESC);
CREATE INDEX IF NOT EXISTS idx_files_full_text_search ON files USING GIN(
  to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
);

-- ============================================================================
-- TABLE 3: FILE_VERSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Version details
  version_number INTEGER NOT NULL,
  name VARCHAR(500) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT,
  checksum VARCHAR(64),

  -- Metadata
  mime_type VARCHAR(255),
  change_description TEXT,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_versions_version_check CHECK (version_number >= 1),
  CONSTRAINT file_versions_size_check CHECK (size >= 0),
  UNIQUE(file_id, version_number)
);

-- Indexes for file_versions
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_user_id ON file_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON file_versions(version_number DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_at ON file_versions(created_at DESC);

-- ============================================================================
-- TABLE 4: FILE_SHARES
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Sharing details
  email VARCHAR(255),
  permission share_permission DEFAULT 'view',
  message TEXT,

  -- Access control
  can_download BOOLEAN DEFAULT true,
  can_comment BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_reshare BOOLEAN DEFAULT false,

  -- Expiration
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,
  accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_shares_email_or_user CHECK (
    (shared_with IS NOT NULL) OR (email IS NOT NULL)
  ),
  CONSTRAINT file_shares_access_count_check CHECK (access_count >= 0)
);

-- Indexes for file_shares
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON file_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_file_shares_email ON file_shares(email);
CREATE INDEX IF NOT EXISTS idx_file_shares_is_active ON file_shares(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_shares_created_at ON file_shares(created_at DESC);

-- ============================================================================
-- TABLE 5: FILE_TAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tag details
  tag VARCHAR(100) NOT NULL,
  color VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_tags_tag_check CHECK (char_length(tag) >= 1 AND char_length(tag) <= 100),
  UNIQUE(file_id, tag)
);

-- Indexes for file_tags
CREATE INDEX IF NOT EXISTS idx_file_tags_file_id ON file_tags(file_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_user_id ON file_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_tag ON file_tags(tag);
CREATE INDEX IF NOT EXISTS idx_file_tags_created_at ON file_tags(created_at DESC);

-- ============================================================================
-- TABLE 6: FILE_COMMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES file_comments(id) ON DELETE CASCADE,

  -- Comment details
  content TEXT NOT NULL,
  mentions UUID[] DEFAULT '{}',

  -- Status
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT file_comments_content_check CHECK (char_length(content) >= 1)
);

-- Indexes for file_comments
CREATE INDEX IF NOT EXISTS idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_user_id ON file_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_parent_id ON file_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_is_deleted ON file_comments(is_deleted) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_file_comments_created_at ON file_comments(created_at DESC);

-- ============================================================================
-- TABLE 7: FILE_ACTIVITIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Activity details
  activity activity_type NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Context
  ip_address INET,
  user_agent TEXT,
  device_type VARCHAR(50),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for file_activities
CREATE INDEX IF NOT EXISTS idx_file_activities_file_id ON file_activities(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_user_id ON file_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_file_activities_activity ON file_activities(activity);
CREATE INDEX IF NOT EXISTS idx_file_activities_created_at ON file_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_activities_metadata ON file_activities USING GIN(metadata);

-- ============================================================================
-- TABLE 8: FILE_LOCKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  locked_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lock details
  reason TEXT,
  expires_at TIMESTAMPTZ,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_locks_unique_active UNIQUE(file_id) WHERE is_active = true
);

-- Indexes for file_locks
CREATE INDEX IF NOT EXISTS idx_file_locks_file_id ON file_locks(file_id);
CREATE INDEX IF NOT EXISTS idx_file_locks_locked_by ON file_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_file_locks_is_active ON file_locks(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_file_locks_expires_at ON file_locks(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_file_locks_created_at ON file_locks(created_at DESC);

-- ============================================================================
-- TABLE 9: FILE_THUMBNAILS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_thumbnails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Thumbnail details
  url TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  size BIGINT NOT NULL,
  format VARCHAR(50) NOT NULL,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'completed',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_thumbnails_width_check CHECK (width > 0),
  CONSTRAINT file_thumbnails_height_check CHECK (height > 0),
  CONSTRAINT file_thumbnails_size_check CHECK (size > 0)
);

-- Indexes for file_thumbnails
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_file_id ON file_thumbnails(file_id);
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_status ON file_thumbnails(status);
CREATE INDEX IF NOT EXISTS idx_file_thumbnails_created_at ON file_thumbnails(created_at DESC);

-- ============================================================================
-- TABLE 10: FILE_PREVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Preview details
  url TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  size BIGINT NOT NULL,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'pending',
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT file_previews_size_check CHECK (size >= 0)
);

-- Indexes for file_previews
CREATE INDEX IF NOT EXISTS idx_file_previews_file_id ON file_previews(file_id);
CREATE INDEX IF NOT EXISTS idx_file_previews_status ON file_previews(status);
CREATE INDEX IF NOT EXISTS idx_file_previews_created_at ON file_previews(created_at DESC);

-- ============================================================================
-- TABLE 11: FILE_CONVERSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Conversion details
  source_format VARCHAR(50) NOT NULL,
  target_format VARCHAR(50) NOT NULL,
  output_url TEXT,
  output_size BIGINT,

  -- Storage
  storage_provider storage_provider DEFAULT 'supabase',
  storage_path TEXT,

  -- Status
  status conversion_status DEFAULT 'pending',
  error_message TEXT,
  progress INTEGER DEFAULT 0,

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_conversions_progress_check CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT file_conversions_output_size_check CHECK (output_size IS NULL OR output_size >= 0)
);

-- Indexes for file_conversions
CREATE INDEX IF NOT EXISTS idx_file_conversions_file_id ON file_conversions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_conversions_user_id ON file_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_file_conversions_status ON file_conversions(status);
CREATE INDEX IF NOT EXISTS idx_file_conversions_created_at ON file_conversions(created_at DESC);

-- ============================================================================
-- TABLE 12: FILE_ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Analytics data
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  -- Geographic data
  countries JSONB DEFAULT '{}',
  cities JSONB DEFAULT '{}',

  -- Device data
  devices JSONB DEFAULT '{}',
  browsers JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_analytics_unique_date UNIQUE(file_id, date),
  CONSTRAINT file_analytics_views_check CHECK (views >= 0),
  CONSTRAINT file_analytics_downloads_check CHECK (downloads >= 0),
  CONSTRAINT file_analytics_shares_check CHECK (shares >= 0),
  CONSTRAINT file_analytics_comments_check CHECK (comments >= 0)
);

-- Indexes for file_analytics
CREATE INDEX IF NOT EXISTS idx_file_analytics_file_id ON file_analytics(file_id);
CREATE INDEX IF NOT EXISTS idx_file_analytics_date ON file_analytics(date DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_views ON file_analytics(views DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_downloads ON file_analytics(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_file_analytics_created_at ON file_analytics(created_at DESC);

-- ============================================================================
-- TABLE 13: FILE_COLLABORATORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collaboration details
  permission share_permission DEFAULT 'edit',
  is_online BOOLEAN DEFAULT false,
  cursor_position JSONB,

  -- Timestamps
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_collaborators_unique UNIQUE(file_id, user_id)
);

-- Indexes for file_collaborators
CREATE INDEX IF NOT EXISTS idx_file_collaborators_file_id ON file_collaborators(file_id);
CREATE INDEX IF NOT EXISTS idx_file_collaborators_user_id ON file_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_file_collaborators_is_online ON file_collaborators(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_file_collaborators_last_seen_at ON file_collaborators(last_seen_at DESC);

-- ============================================================================
-- TABLE 14: FILE_BACKUPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS file_backups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

  -- Backup details
  backup_url TEXT NOT NULL,
  backup_size BIGINT NOT NULL,
  backup_checksum VARCHAR(64),

  -- Storage
  storage_provider storage_provider DEFAULT 'wasabi',
  storage_path TEXT,

  -- Metadata
  backup_type VARCHAR(50) DEFAULT 'automatic',
  retention_days INTEGER DEFAULT 90,

  -- Status
  status conversion_status DEFAULT 'completed',

  -- Timestamps
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT file_backups_size_check CHECK (backup_size > 0),
  CONSTRAINT file_backups_retention_check CHECK (retention_days > 0)
);

-- Indexes for file_backups
CREATE INDEX IF NOT EXISTS idx_file_backups_file_id ON file_backups(file_id);
CREATE INDEX IF NOT EXISTS idx_file_backups_status ON file_backups(status);
CREATE INDEX IF NOT EXISTS idx_file_backups_expires_at ON file_backups(expires_at);
CREATE INDEX IF NOT EXISTS idx_file_backups_created_at ON file_backups(created_at DESC);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log file activity
CREATE OR REPLACE FUNCTION log_file_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO file_activities (file_id, user_id, activity, description)
    VALUES (NEW.id, NEW.user_id, 'upload', 'File uploaded: ' || NEW.name);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id, 'rename', 'File renamed from ' || OLD.name || ' to ' || NEW.name);
    END IF;
    IF OLD.is_starred != NEW.is_starred THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_starred THEN 'star' ELSE 'unstar' END,
        CASE WHEN NEW.is_starred THEN 'File starred' ELSE 'File unstarred' END);
    END IF;
    IF OLD.is_locked != NEW.is_locked THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_locked THEN 'lock' ELSE 'unlock' END,
        CASE WHEN NEW.is_locked THEN 'File locked' ELSE 'File unlocked' END);
    END IF;
    IF OLD.is_archived != NEW.is_archived THEN
      INSERT INTO file_activities (file_id, user_id, activity, description)
      VALUES (NEW.id, NEW.user_id,
        CASE WHEN NEW.is_archived THEN 'archive' ELSE 'unarchive' END,
        CASE WHEN NEW.is_archived THEN 'File archived' ELSE 'File unarchived' END);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO file_activities (file_id, user_id, activity, description)
    VALUES (OLD.id, OLD.user_id, 'delete', 'File deleted: ' || OLD.name);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Update folder file count and size
CREATE OR REPLACE FUNCTION update_folder_file_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE folders
    SET
      file_count = file_count + 1,
      total_size = total_size + NEW.size,
      updated_at = NOW()
    WHERE id = NEW.folder_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      -- Decrement old folder
      IF OLD.folder_id IS NOT NULL THEN
        UPDATE folders
        SET
          file_count = GREATEST(0, file_count - 1),
          total_size = GREATEST(0, total_size - OLD.size),
          updated_at = NOW()
        WHERE id = OLD.folder_id;
      END IF;
      -- Increment new folder
      IF NEW.folder_id IS NOT NULL THEN
        UPDATE folders
        SET
          file_count = file_count + 1,
          total_size = total_size + NEW.size,
          updated_at = NOW()
        WHERE id = NEW.folder_id;
      END IF;
    ELSIF OLD.size != NEW.size THEN
      -- Update size if changed
      UPDATE folders
      SET
        total_size = total_size - OLD.size + NEW.size,
        updated_at = NOW()
      WHERE id = NEW.folder_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.folder_id IS NOT NULL THEN
      UPDATE folders
      SET
        file_count = GREATEST(0, file_count - 1),
        total_size = GREATEST(0, total_size - OLD.size),
        updated_at = NOW()
      WHERE id = OLD.folder_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Generate file thumbnail (placeholder)
CREATE OR REPLACE FUNCTION generate_file_thumbnail()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue thumbnail generation for images and videos
  IF NEW.type IN ('image', 'video') THEN
    INSERT INTO file_previews (file_id, url, type, size, status)
    VALUES (NEW.id, '', 'thumbnail', 0, 'pending');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Full-text search for files
CREATE OR REPLACE FUNCTION search_files(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL,
  file_type_filter file_type DEFAULT NULL,
  limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  type file_type,
  size BIGINT,
  uploaded_at TIMESTAMPTZ,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.name,
    f.type,
    f.size,
    f.uploaded_at,
    ts_rank(
      to_tsvector('english', coalesce(f.name, '') || ' ' || coalesce(f.description, '')),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM files f
  WHERE
    (user_uuid IS NULL OR f.user_id = user_uuid)
    AND (file_type_filter IS NULL OR f.type = file_type_filter)
    AND f.status = 'active'
    AND to_tsvector('english', coalesce(f.name, '') || ' ' || coalesce(f.description, '')) @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate storage stats
CREATE OR REPLACE FUNCTION calculate_storage_stats(user_uuid UUID)
RETURNS TABLE (
  total_files BIGINT,
  total_size BIGINT,
  supabase_files BIGINT,
  supabase_size BIGINT,
  wasabi_files BIGINT,
  wasabi_size BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_files,
    COALESCE(SUM(size), 0) AS total_size,
    COUNT(*) FILTER (WHERE storage_provider = 'supabase') AS supabase_files,
    COALESCE(SUM(size) FILTER (WHERE storage_provider = 'supabase'), 0) AS supabase_size,
    COUNT(*) FILTER (WHERE storage_provider = 'wasabi') AS wasabi_files,
    COALESCE(SUM(size) FILTER (WHERE storage_provider = 'wasabi'), 0) AS wasabi_size
  FROM files
  WHERE user_id = user_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on folders
CREATE TRIGGER trigger_update_folder_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on files
CREATE TRIGGER trigger_update_file_updated_at
  BEFORE UPDATE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Log file activities
CREATE TRIGGER trigger_log_file_activity
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION log_file_activity();

-- Trigger: Update folder file count
CREATE TRIGGER trigger_update_folder_file_count
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_file_count();

-- Trigger: Generate file thumbnail
CREATE TRIGGER trigger_generate_file_thumbnail
  AFTER INSERT ON files
  FOR EACH ROW
  EXECUTE FUNCTION generate_file_thumbnail();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_thumbnails ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_backups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for folders
CREATE POLICY folders_select_policy ON folders FOR SELECT USING (
  user_id = auth.uid() OR
  auth.uid() = ANY(shared_with)
);

CREATE POLICY folders_insert_policy ON folders FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY folders_update_policy ON folders FOR UPDATE USING (
  user_id = auth.uid() AND can_write = true
);

CREATE POLICY folders_delete_policy ON folders FOR DELETE USING (
  user_id = auth.uid() AND can_delete = true
);

-- RLS Policies for files
CREATE POLICY files_select_policy ON files FOR SELECT USING (
  user_id = auth.uid() OR
  is_shared = true OR
  EXISTS (
    SELECT 1 FROM file_shares
    WHERE file_shares.file_id = files.id
    AND (file_shares.shared_with = auth.uid() OR file_shares.email = auth.email())
    AND file_shares.is_active = true
  )
);

CREATE POLICY files_insert_policy ON files FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY files_update_policy ON files FOR UPDATE USING (
  user_id = auth.uid() AND is_locked = false
);

CREATE POLICY files_delete_policy ON files FOR DELETE USING (
  user_id = auth.uid() AND is_locked = false
);

-- RLS Policies for file_versions
CREATE POLICY file_versions_select_policy ON file_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_versions.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_versions_insert_policy ON file_versions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_versions.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_shares
CREATE POLICY file_shares_select_policy ON file_shares FOR SELECT USING (
  shared_by = auth.uid() OR
  shared_with = auth.uid() OR
  email = auth.email()
);

CREATE POLICY file_shares_insert_policy ON file_shares FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_shares.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_shares_update_policy ON file_shares FOR UPDATE USING (
  shared_by = auth.uid()
);

CREATE POLICY file_shares_delete_policy ON file_shares FOR DELETE USING (
  shared_by = auth.uid()
);

-- RLS Policies for file_tags
CREATE POLICY file_tags_select_policy ON file_tags FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_tags.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_tags_insert_policy ON file_tags FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_tags_delete_policy ON file_tags FOR DELETE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_comments
CREATE POLICY file_comments_select_policy ON file_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_comments.file_id AND files.user_id = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM file_shares
    WHERE file_shares.file_id = file_comments.file_id
    AND file_shares.shared_with = auth.uid()
    AND file_shares.can_comment = true
  )
);

CREATE POLICY file_comments_insert_policy ON file_comments FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_comments_update_policy ON file_comments FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY file_comments_delete_policy ON file_comments FOR DELETE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_activities
CREATE POLICY file_activities_select_policy ON file_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_activities.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_activities_insert_policy ON file_activities FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- RLS Policies for file_locks
CREATE POLICY file_locks_select_policy ON file_locks FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_locks.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_locks_insert_policy ON file_locks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_locks.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_locks_update_policy ON file_locks FOR UPDATE USING (
  locked_by = auth.uid()
);

-- RLS Policies for file_thumbnails
CREATE POLICY file_thumbnails_select_policy ON file_thumbnails FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_thumbnails.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_thumbnails_insert_policy ON file_thumbnails FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_thumbnails.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_previews
CREATE POLICY file_previews_select_policy ON file_previews FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_previews.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_previews_insert_policy ON file_previews FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_previews.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_conversions
CREATE POLICY file_conversions_select_policy ON file_conversions FOR SELECT USING (
  user_id = auth.uid()
);

CREATE POLICY file_conversions_insert_policy ON file_conversions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- RLS Policies for file_analytics
CREATE POLICY file_analytics_select_policy ON file_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_analytics.file_id AND files.user_id = auth.uid())
);

-- RLS Policies for file_collaborators
CREATE POLICY file_collaborators_select_policy ON file_collaborators FOR SELECT USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM files WHERE files.id = file_collaborators.file_id AND files.user_id = auth.uid())
);

CREATE POLICY file_collaborators_insert_policy ON file_collaborators FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY file_collaborators_update_policy ON file_collaborators FOR UPDATE USING (
  user_id = auth.uid()
);

-- RLS Policies for file_backups
CREATE POLICY file_backups_select_policy ON file_backups FOR SELECT USING (
  EXISTS (SELECT 1 FROM files WHERE files.id = file_backups.file_id AND files.user_id = auth.uid())
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE folders IS 'Hierarchical folder structure for file organization';
COMMENT ON TABLE files IS 'Main files table with comprehensive metadata and multi-cloud storage support';
COMMENT ON TABLE file_versions IS 'Version history for files with rollback capability';
COMMENT ON TABLE file_shares IS 'File sharing with granular permissions and expiration';
COMMENT ON TABLE file_tags IS 'Flexible tagging system for file categorization';
COMMENT ON TABLE file_comments IS 'Threaded comments on files with mentions';
COMMENT ON TABLE file_activities IS 'Complete audit log of all file operations';
COMMENT ON TABLE file_locks IS 'File locking system for collaborative editing';
COMMENT ON TABLE file_thumbnails IS 'Generated thumbnails for media files';
COMMENT ON TABLE file_previews IS 'File preview generation queue';
COMMENT ON TABLE file_conversions IS 'File format conversion tracking';
COMMENT ON TABLE file_analytics IS 'Daily analytics aggregation for file usage';
COMMENT ON TABLE file_collaborators IS 'Real-time collaboration tracking';
COMMENT ON TABLE file_backups IS 'Automated backup history with retention policies';

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Files Hub System Database Schema Created Successfully';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Tables Created: 14';
  RAISE NOTICE 'Indexes Created: 35+';
  RAISE NOTICE 'RLS Policies: 25+';
  RAISE NOTICE 'Triggers: 5';
  RAISE NOTICE 'Functions: 5';
  RAISE NOTICE 'Enums: 6';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Features:';
  RAISE NOTICE '- Multi-cloud storage (Supabase + Wasabi)';
  RAISE NOTICE '- Version control and rollback';
  RAISE NOTICE '- Granular file sharing permissions';
  RAISE NOTICE '- Real-time collaboration tracking';
  RAISE NOTICE '- Comprehensive activity logging';
  RAISE NOTICE '- File locking system';
  RAISE NOTICE '- Automated thumbnail generation';
  RAISE NOTICE '- File format conversion';
  RAISE NOTICE '- Usage analytics';
  RAISE NOTICE '- Automated backups';
  RAISE NOTICE '- Full-text search';
  RAISE NOTICE '- Row Level Security (RLS)';
  RAISE NOTICE '============================================================================';
END $$;
-- ========================================
-- FILES SYSTEM - PRODUCTION DATABASE
-- ========================================
--
-- Complete file management with:
-- - Multi-format file support
-- - Folder hierarchy with unlimited nesting
-- - File versioning and history
-- - Sharing with granular permissions
-- - Tags and metadata
-- - Storage quota tracking
-- - Trash and recovery
-- - Activity logging
--
-- Tables: 10
-- Functions: 10
-- Indexes: 52
-- RLS Policies: Full coverage
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ========================================
-- ENUMS
-- ========================================

DROP TYPE IF EXISTS file_type CASCADE;
CREATE TYPE file_type AS ENUM (
  'pdf',
  'figma',
  'folder',
  'video',
  'excel',
  'image',
  'archive',
  'word',
  'code',
  'text',
  'audio',
  'presentation'
);

DROP TYPE IF EXISTS file_status CASCADE;
CREATE TYPE file_status AS ENUM (
  'active',
  'archived',
  'deleted',
  'locked'
);

DROP TYPE IF EXISTS share_permission CASCADE;
CREATE TYPE share_permission AS ENUM (
  'view',
  'comment',
  'edit',
  'admin'
);

DROP TYPE IF EXISTS file_action CASCADE;
CREATE TYPE file_action AS ENUM (
  'created',
  'modified',
  'viewed',
  'shared',
  'downloaded',
  'deleted',
  'restored',
  'moved',
  'renamed',
  'locked',
  'unlocked'
);

-- ========================================
-- TABLES
-- ========================================

-- Files
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type file_type NOT NULL,
  size BIGINT NOT NULL DEFAULT 0,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  owner UUID NOT NULL REFERENCES auth.users(id),
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  folder_path TEXT NOT NULL DEFAULT '/',
  starred BOOLEAN NOT NULL DEFAULT false,
  shared BOOLEAN NOT NULL DEFAULT false,
  locked BOOLEAN NOT NULL DEFAULT false,
  thumbnail TEXT,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  mime_type TEXT NOT NULL,
  status file_status NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}',
  storage_location TEXT,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Folders
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  file_count INTEGER NOT NULL DEFAULT 0,
  total_size BIGINT NOT NULL DEFAULT 0,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_modified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  color TEXT,
  icon TEXT,
  shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, path)
);

-- File Versions
CREATE TABLE IF NOT EXISTS file_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  size BIGINT NOT NULL,
  date_created TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT,
  storage_location TEXT NOT NULL,
  checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(file_id, version)
);

-- File Shares
CREATE TABLE IF NOT EXISTS file_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  shared_with UUID NOT NULL REFERENCES auth.users(id),
  permission share_permission NOT NULL DEFAULT 'view',
  expires_at TIMESTAMPTZ,
  date_shared TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(file_id, shared_with)
);

-- File Tags
CREATE TABLE IF NOT EXISTS file_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'gray',
  file_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Storage Quotas
CREATE TABLE IF NOT EXISTS storage_quotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_quota BIGINT NOT NULL DEFAULT 107374182400, -- 100GB default
  used_space BIGINT NOT NULL DEFAULT 0,
  images_size BIGINT NOT NULL DEFAULT 0,
  videos_size BIGINT NOT NULL DEFAULT 0,
  documents_size BIGINT NOT NULL DEFAULT 0,
  archives_size BIGINT NOT NULL DEFAULT 0,
  other_size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- File Activity
CREATE TABLE IF NOT EXISTS file_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action file_action NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trash
CREATE TABLE IF NOT EXISTS trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID,
  file_data JSONB NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File Comments
CREATE TABLE IF NOT EXISTS file_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File Downloads
CREATE TABLE IF NOT EXISTS file_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

-- Files Indexes
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_type ON files(type);
CREATE INDEX IF NOT EXISTS idx_files_status ON files(status);
CREATE INDEX IF NOT EXISTS idx_files_folder_id ON files(folder_id);
CREATE INDEX IF NOT EXISTS idx_files_starred ON files(starred);
CREATE INDEX IF NOT EXISTS idx_files_shared ON files(shared);
CREATE INDEX IF NOT EXISTS idx_files_date_modified ON files(date_modified DESC);
CREATE INDEX IF NOT EXISTS idx_files_name ON files USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_files_tags ON files USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_files_metadata ON files USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_files_user_folder ON files(user_id, folder_id);
CREATE INDEX IF NOT EXISTS idx_files_user_type ON files(user_id, type);
CREATE INDEX IF NOT EXISTS idx_files_user_status ON files(user_id, status);

-- Folders Indexes
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);
CREATE INDEX IF NOT EXISTS idx_folders_shared ON folders(shared);
CREATE INDEX IF NOT EXISTS idx_folders_name ON folders USING GIN(name gin_trgm_ops);

-- File Versions Indexes
CREATE INDEX IF NOT EXISTS idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version ON file_versions(file_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_file_versions_date_created ON file_versions(date_created DESC);

-- File Shares Indexes
CREATE INDEX IF NOT EXISTS idx_file_shares_file_id ON file_shares(file_id);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_by ON file_shares(shared_by);
CREATE INDEX IF NOT EXISTS idx_file_shares_shared_with ON file_shares(shared_with);
CREATE INDEX IF NOT EXISTS idx_file_shares_permission ON file_shares(permission);
CREATE INDEX IF NOT EXISTS idx_file_shares_expires_at ON file_shares(expires_at);

-- File Tags Indexes
CREATE INDEX IF NOT EXISTS idx_file_tags_user_id ON file_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_file_tags_name ON file_tags USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_file_tags_file_count ON file_tags(file_count DESC);

-- Storage Quotas Indexes
CREATE INDEX IF NOT EXISTS idx_storage_quotas_user_id ON storage_quotas(user_id);

-- File Activity Indexes
CREATE INDEX IF NOT EXISTS idx_file_activity_file_id ON file_activity(file_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_user_id ON file_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_file_activity_action ON file_activity(action);
CREATE INDEX IF NOT EXISTS idx_file_activity_timestamp ON file_activity(timestamp DESC);

-- Trash Indexes
CREATE INDEX IF NOT EXISTS idx_trash_user_id ON trash(user_id);
CREATE INDEX IF NOT EXISTS idx_trash_expires_at ON trash(expires_at);
CREATE INDEX IF NOT EXISTS idx_trash_deleted_at ON trash(deleted_at DESC);

-- File Comments Indexes
CREATE INDEX IF NOT EXISTS idx_file_comments_file_id ON file_comments(file_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_user_id ON file_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_file_comments_timestamp ON file_comments(timestamp DESC);

-- File Downloads Indexes
CREATE INDEX IF NOT EXISTS idx_file_downloads_file_id ON file_downloads(file_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_downloads_downloaded_at ON file_downloads(downloaded_at DESC);

-- ========================================
-- TRIGGERS
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_shares_updated_at BEFORE UPDATE ON file_shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_tags_updated_at BEFORE UPDATE ON file_tags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storage_quotas_updated_at BEFORE UPDATE ON storage_quotas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_comments_updated_at BEFORE UPDATE ON file_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update folder statistics
CREATE OR REPLACE FUNCTION update_folder_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.folder_id IS NOT NULL THEN
      UPDATE folders
      SET file_count = (SELECT COUNT(*) FROM files WHERE folder_id = NEW.folder_id),
          total_size = (SELECT COALESCE(SUM(size), 0) FROM files WHERE folder_id = NEW.folder_id),
          date_modified = NOW()
      WHERE id = NEW.folder_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.folder_id IS DISTINCT FROM NEW.folder_id) THEN
    IF OLD.folder_id IS NOT NULL THEN
      UPDATE folders
      SET file_count = (SELECT COUNT(*) FROM files WHERE folder_id = OLD.folder_id),
          total_size = (SELECT COALESCE(SUM(size), 0) FROM files WHERE folder_id = OLD.folder_id),
          date_modified = NOW()
      WHERE id = OLD.folder_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_folder_statistics
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_folder_stats();

-- Update storage quota
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
DECLARE
  size_delta BIGINT := 0;
  file_category TEXT;
BEGIN
  -- Calculate size delta
  IF TG_OP = 'INSERT' THEN
    size_delta := NEW.size;
  ELSIF TG_OP = 'UPDATE' THEN
    size_delta := NEW.size - OLD.size;
  ELSIF TG_OP = 'DELETE' THEN
    size_delta := -OLD.size;
  END IF;

  -- Determine file category
  IF TG_OP = 'DELETE' THEN
    file_category := OLD.type::TEXT;
  ELSE
    file_category := NEW.type::TEXT;
  END IF;

  -- Update quota
  INSERT INTO storage_quotas (user_id, used_space, images_size, videos_size, documents_size, archives_size, other_size)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    size_delta,
    CASE WHEN file_category = 'image' THEN size_delta ELSE 0 END,
    CASE WHEN file_category = 'video' THEN size_delta ELSE 0 END,
    CASE WHEN file_category IN ('pdf', 'word', 'excel', 'presentation', 'text') THEN size_delta ELSE 0 END,
    CASE WHEN file_category = 'archive' THEN size_delta ELSE 0 END,
    CASE WHEN file_category NOT IN ('image', 'video', 'pdf', 'word', 'excel', 'presentation', 'text', 'archive') THEN size_delta ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    used_space = storage_quotas.used_space + size_delta,
    images_size = CASE WHEN file_category = 'image' THEN storage_quotas.images_size + size_delta ELSE storage_quotas.images_size END,
    videos_size = CASE WHEN file_category = 'video' THEN storage_quotas.videos_size + size_delta ELSE storage_quotas.videos_size END,
    documents_size = CASE WHEN file_category IN ('pdf', 'word', 'excel', 'presentation', 'text') THEN storage_quotas.documents_size + size_delta ELSE storage_quotas.documents_size END,
    archives_size = CASE WHEN file_category = 'archive' THEN storage_quotas.archives_size + size_delta ELSE storage_quotas.archives_size END,
    other_size = CASE WHEN file_category NOT IN ('image', 'video', 'pdf', 'word', 'excel', 'presentation', 'text', 'archive') THEN storage_quotas.other_size + size_delta ELSE storage_quotas.other_size END;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_storage_quota
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_quota();

-- Update tag counts
CREATE OR REPLACE FUNCTION update_tag_counts()
RETURNS TRIGGER AS $$
DECLARE
  tag TEXT;
  old_tags TEXT[];
  new_tags TEXT[];
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    new_tags := NEW.tags;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    old_tags := OLD.tags;
  END IF;

  -- Increment for new tags
  IF new_tags IS NOT NULL THEN
    FOREACH tag IN ARRAY new_tags
    LOOP
      IF old_tags IS NULL OR NOT tag = ANY(old_tags) THEN
        INSERT INTO file_tags (user_id, name, file_count)
        VALUES (NEW.user_id, tag, 1)
        ON CONFLICT (user_id, name)
        DO UPDATE SET file_count = file_tags.file_count + 1;
      END IF;
    END LOOP;
  END IF;

  -- Decrement for removed tags
  IF old_tags IS NOT NULL THEN
    FOREACH tag IN ARRAY old_tags
    LOOP
      IF new_tags IS NULL OR NOT tag = ANY(new_tags) THEN
        UPDATE file_tags
        SET file_count = GREATEST(file_count - 1, 0)
        WHERE user_id = OLD.user_id AND name = tag;
      END IF;
    END LOOP;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_file_tag_counts
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_counts();

-- Log file activity
CREATE OR REPLACE FUNCTION log_file_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_action file_action;
  activity_metadata JSONB := '{}';
BEGIN
  IF TG_OP = 'INSERT' THEN
    activity_action := 'created';
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.name != NEW.name THEN
      activity_action := 'renamed';
      activity_metadata := jsonb_build_object('old_name', OLD.name, 'new_name', NEW.name);
    ELSIF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
      activity_action := 'moved';
      activity_metadata := jsonb_build_object('from_folder', OLD.folder_path, 'to_folder', NEW.folder_path);
    ELSIF OLD.locked != NEW.locked THEN
      activity_action := CASE WHEN NEW.locked THEN 'locked' ELSE 'unlocked' END;
    ELSE
      activity_action := 'modified';
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    activity_action := 'deleted';
  END IF;

  INSERT INTO file_activity (file_id, user_id, action, metadata)
  VALUES (
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.user_id, OLD.user_id),
    activity_action,
    activity_metadata
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_file_changes
  AFTER INSERT OR UPDATE OR DELETE ON files
  FOR EACH ROW
  EXECUTE FUNCTION log_file_activity();

-- Auto-delete expired trash
CREATE OR REPLACE FUNCTION delete_expired_trash()
RETURNS void AS $$
BEGIN
  DELETE FROM trash WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Search files
CREATE OR REPLACE FUNCTION search_files(
  p_user_id UUID,
  p_search_term TEXT,
  p_file_type file_type DEFAULT NULL,
  p_folder_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS SETOF files AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM files
  WHERE user_id = p_user_id
    AND status = 'active'
    AND (
      p_search_term IS NULL
      OR name ILIKE '%' || p_search_term || '%'
      OR description ILIKE '%' || p_search_term || '%'
      OR p_search_term = ANY(tags)
    )
    AND (p_file_type IS NULL OR type = p_file_type)
    AND (p_folder_id IS NULL OR folder_id = p_folder_id)
  ORDER BY date_modified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get file stats
CREATE OR REPLACE FUNCTION get_file_stats(p_user_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'totalFiles', COUNT(*),
      'totalSize', COALESCE(SUM(size), 0),
      'starred', COUNT(*) FILTER (WHERE starred = true),
      'shared', COUNT(*) FILTER (WHERE shared = true),
      'locked', COUNT(*) FILTER (WHERE locked = true),
      'byType', (
        SELECT json_object_agg(type, count)
        FROM (
          SELECT type, COUNT(*) as count
          FROM files
          WHERE user_id = p_user_id AND status = 'active'
          GROUP BY type
        ) t
      )
    )
    FROM files
    WHERE user_id = p_user_id AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql;

-- Move file to trash
CREATE OR REPLACE FUNCTION move_to_trash(p_file_id UUID)
RETURNS JSON AS $$
DECLARE
  v_file files;
BEGIN
  -- Get file
  SELECT * INTO v_file FROM files WHERE id = p_file_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'File not found');
  END IF;

  -- Move to trash
  INSERT INTO trash (user_id, file_id, file_data)
  VALUES (v_file.user_id, v_file.id, row_to_json(v_file)::JSONB);

  -- Update file status
  UPDATE files SET status = 'deleted' WHERE id = p_file_id;

  RETURN json_build_object('success', true, 'expiresAt', NOW() + INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- Restore from trash
CREATE OR REPLACE FUNCTION restore_from_trash(p_trash_id UUID)
RETURNS JSON AS $$
DECLARE
  v_trash trash;
BEGIN
  -- Get trash entry
  SELECT * INTO v_trash FROM trash WHERE id = p_trash_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Trash entry not found');
  END IF;

  -- Restore file status
  UPDATE files SET status = 'active' WHERE id = v_trash.file_id;

  -- Delete trash entry
  DELETE FROM trash WHERE id = p_trash_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Share file
CREATE OR REPLACE FUNCTION share_file(
  p_file_id UUID,
  p_shared_by UUID,
  p_shared_with UUID,
  p_permission share_permission DEFAULT 'view',
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
  INSERT INTO file_shares (file_id, shared_by, shared_with, permission, expires_at)
  VALUES (p_file_id, p_shared_by, p_shared_with, p_permission, p_expires_at)
  ON CONFLICT (file_id, shared_with)
  DO UPDATE SET
    permission = p_permission,
    expires_at = p_expires_at,
    date_shared = NOW();

  -- Update file shared flag
  UPDATE files SET shared = true WHERE id = p_file_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;

-- Get storage quota
CREATE OR REPLACE FUNCTION get_storage_quota(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_quota storage_quotas;
BEGIN
  SELECT * INTO v_quota FROM storage_quotas WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'used', 0,
      'total', 107374182400,
      'percentage', 0,
      'breakdown', json_build_object(
        'images', 0,
        'videos', 0,
        'documents', 0,
        'archives', 0,
        'other', 0
      )
    );
  END IF;

  RETURN json_build_object(
    'used', v_quota.used_space,
    'total', v_quota.total_quota,
    'percentage', ROUND((v_quota.used_space::NUMERIC / v_quota.total_quota::NUMERIC) * 100),
    'breakdown', json_build_object(
      'images', v_quota.images_size,
      'videos', v_quota.videos_size,
      'documents', v_quota.documents_size,
      'archives', v_quota.archives_size,
      'other', v_quota.other_size
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Get recent files
CREATE OR REPLACE FUNCTION get_recent_files(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS SETOF files AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM files
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY date_modified DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Bulk move files
CREATE OR REPLACE FUNCTION bulk_move_files(
  p_file_ids UUID[],
  p_folder_id UUID,
  p_folder_path TEXT
)
RETURNS JSON AS $$
DECLARE
  v_moved_count INTEGER;
BEGIN
  UPDATE files
  SET folder_id = p_folder_id,
      folder_path = p_folder_path,
      date_modified = NOW()
  WHERE id = ANY(p_file_ids);

  GET DIAGNOSTICS v_moved_count = ROW_COUNT;

  RETURN json_build_object('success', true, 'movedCount', v_moved_count);
END;
$$ LANGUAGE plpgsql;

-- Record file view
CREATE OR REPLACE FUNCTION record_file_view(p_file_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO file_activity (file_id, user_id, action)
  VALUES (p_file_id, p_user_id, 'viewed');

  -- Update last accessed for shares
  UPDATE file_shares
  SET last_accessed = NOW()
  WHERE file_id = p_file_id AND shared_with = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Record file download
CREATE OR REPLACE FUNCTION record_file_download(
  p_file_id UUID,
  p_user_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO file_downloads (file_id, user_id, ip_address, user_agent)
  VALUES (p_file_id, p_user_id, p_ip_address, p_user_agent);

  INSERT INTO file_activity (file_id, user_id, action)
  VALUES (p_file_id, p_user_id, 'downloaded');
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE trash ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_downloads ENABLE ROW LEVEL SECURITY;

-- Files Policies
CREATE POLICY files_select ON files FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM file_shares WHERE file_id = files.id AND shared_with = auth.uid()));
CREATE POLICY files_insert ON files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY files_update ON files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY files_delete ON files FOR DELETE USING (auth.uid() = user_id);

-- Folders Policies
CREATE POLICY folders_select ON folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY folders_insert ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY folders_update ON folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY folders_delete ON folders FOR DELETE USING (auth.uid() = user_id);

-- File Versions Policies
CREATE POLICY file_versions_select ON file_versions FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_versions.file_id AND user_id = auth.uid()));
CREATE POLICY file_versions_insert ON file_versions FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM files WHERE id = file_versions.file_id AND user_id = auth.uid()));

-- File Shares Policies
CREATE POLICY file_shares_select ON file_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);
CREATE POLICY file_shares_insert ON file_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);
CREATE POLICY file_shares_update ON file_shares FOR UPDATE
  USING (auth.uid() = shared_by);
CREATE POLICY file_shares_delete ON file_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- File Tags Policies
CREATE POLICY file_tags_select ON file_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY file_tags_insert ON file_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY file_tags_update ON file_tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY file_tags_delete ON file_tags FOR DELETE USING (auth.uid() = user_id);

-- Storage Quotas Policies
CREATE POLICY storage_quotas_select ON storage_quotas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY storage_quotas_update ON storage_quotas FOR UPDATE USING (auth.uid() = user_id);

-- File Activity Policies
CREATE POLICY file_activity_select ON file_activity FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_activity.file_id AND user_id = auth.uid()));
CREATE POLICY file_activity_insert ON file_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trash Policies
CREATE POLICY trash_select ON trash FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY trash_insert ON trash FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY trash_delete ON trash FOR DELETE USING (auth.uid() = user_id);

-- File Comments Policies
CREATE POLICY file_comments_select ON file_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM files WHERE id = file_comments.file_id AND user_id = auth.uid()));
CREATE POLICY file_comments_insert ON file_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY file_comments_update ON file_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY file_comments_delete ON file_comments FOR DELETE USING (auth.uid() = user_id);

-- File Downloads Policies
CREATE POLICY file_downloads_select ON file_downloads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY file_downloads_insert ON file_downloads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- COMMENTS
-- ========================================

COMMENT ON TABLE files IS 'User files with versioning and metadata';
COMMENT ON TABLE folders IS 'Hierarchical folder structure';
COMMENT ON TABLE file_versions IS 'File version history';
COMMENT ON TABLE file_shares IS 'File sharing with permissions';
COMMENT ON TABLE file_tags IS 'User-defined file tags';
COMMENT ON TABLE storage_quotas IS 'User storage quota tracking';
COMMENT ON TABLE file_activity IS 'File activity logging';
COMMENT ON TABLE trash IS 'Deleted files with 30-day recovery';
COMMENT ON TABLE file_comments IS 'Comments on files';
COMMENT ON TABLE file_downloads IS 'File download tracking';
-- ============================================================================
-- FINANCIAL HUB SYSTEM - DATABASE MIGRATION
-- ============================================================================
-- Complete database schema for Financial Hub with transactions, invoices,
-- reports, and financial categories
-- ============================================================================

-- ============================================================================
-- FINANCIAL CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'circle',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add default categories
INSERT INTO financial_categories (name, type, color, icon, description, user_id, is_active) VALUES
  ('project_payment', 'income', '#10B981', 'briefcase', 'Client project payments', NULL, true),
  ('consulting', 'income', '#3B82F6', 'users', 'Consulting services', NULL, true),
  ('product_sales', 'income', '#8B5CF6', 'shopping-cart', 'Digital product sales', NULL, true),
  ('software', 'expense', '#EF4444', 'code', 'Software subscriptions', NULL, true),
  ('marketing', 'expense', '#F59E0B', 'megaphone', 'Marketing and advertising', NULL, true),
  ('operations', 'expense', '#6B7280', 'settings', 'Operational expenses', NULL, true),
  ('equipment', 'expense', '#EC4899', 'monitor', 'Equipment and hardware', NULL, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Core transaction data
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed', 'cancelled')),

  -- Payment information
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer', 'credit_card', 'paypal', 'platform', 'cash', 'other')),

  -- Related entities
  client_id UUID,
  project_id UUID,
  invoice_id UUID,
  vendor TEXT,

  -- Recurring transaction data
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_due_date DATE,

  -- Additional data
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  receipt_url TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_amount CHECK (amount >= 0),
  CONSTRAINT valid_recurring CHECK (
    (is_recurring = false) OR
    (is_recurring = true AND recurring_frequency IS NOT NULL)
  )
);

-- ============================================================================
-- INVOICES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Invoice identification
  invoice_number TEXT NOT NULL UNIQUE,

  -- Client information
  client_id UUID,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,

  -- Project information
  project_id UUID,
  project_name TEXT NOT NULL,

  -- Financial data
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  tax_rate DECIMAL(5, 2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  discount DECIMAL(12, 2) DEFAULT 0 CHECK (discount >= 0),

  -- Dates
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  paid_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),

  -- Payment tracking
  paid_amount DECIMAL(12, 2) DEFAULT 0 CHECK (paid_amount >= 0 AND paid_amount <= amount),

  -- Line items (JSONB for flexibility)
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [{ description, quantity, rate, amount }]

  -- Terms and notes
  payment_terms TEXT DEFAULT 'Net 30',
  notes TEXT,
  terms_and_conditions TEXT,

  -- Files
  pdf_url TEXT,

  -- Email tracking
  last_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_due_date CHECK (due_date >= issue_date),
  CONSTRAINT valid_paid_date CHECK (paid_date IS NULL OR paid_date >= issue_date),
  CONSTRAINT valid_paid_status CHECK (
    (status != 'paid') OR
    (status = 'paid' AND paid_date IS NOT NULL AND paid_amount >= amount)
  )
);

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Report information
  report_type TEXT NOT NULL CHECK (report_type IN (
    'profit_loss', 'cash_flow', 'tax_summary', 'expense_report',
    'revenue_analysis', 'client_report', 'custom'
  )),
  title TEXT NOT NULL,

  -- Date range
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,

  -- Generation info
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'failed')),

  -- File information
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'csv', 'xlsx', 'json', 'html')),
  file_url TEXT,
  file_size INTEGER,

  -- Report data (stored as JSONB for quick access)
  data JSONB DEFAULT '{}'::jsonb,

  -- Report parameters
  parameters JSONB DEFAULT '{}'::jsonb,

  -- Error information
  error_message TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (date_to >= date_from),
  CONSTRAINT valid_ready_status CHECK (
    (status != 'ready') OR
    (status = 'ready' AND file_url IS NOT NULL)
  )
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Transactions indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tags ON transactions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_transactions_metadata ON transactions USING GIN(metadata);

-- Invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date ON invoices(paid_date DESC);

-- Reports indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_date_range ON reports(date_from, date_to);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON financial_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON financial_categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_active ON financial_categories(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports" ON reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON reports
  FOR DELETE USING (auth.uid() = user_id);

-- Categories policies (global categories visible to all, personal categories only to owner)
CREATE POLICY "Users can view categories" ON financial_categories
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create own categories" ON financial_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON financial_categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON financial_categories
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON financial_categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON financial_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update invoice status based on due date and payment
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If fully paid, set status to paid
  IF NEW.paid_amount >= NEW.amount AND NEW.status != 'paid' THEN
    NEW.status := 'paid';
    NEW.paid_date := COALESCE(NEW.paid_date, CURRENT_DATE);
  END IF;

  -- If past due date and not paid, set to overdue
  IF NEW.due_date < CURRENT_DATE
     AND NEW.status NOT IN ('paid', 'cancelled')
     AND NEW.paid_amount < NEW.amount THEN
    NEW.status := 'overdue';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_status_trigger ON invoices;
CREATE TRIGGER update_invoice_status_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_status();

-- Auto-generate invoice number if not provided
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := 'INV-' ||
                          TO_CHAR(NOW(), 'YYYY') || '-' ||
                          LPAD(NEXTVAL('invoice_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1;

DROP TRIGGER IF EXISTS generate_invoice_number_trigger ON invoices;
CREATE TRIGGER generate_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Calculate total revenue for a user in date range
CREATE OR REPLACE FUNCTION calculate_revenue(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'income'
    AND status = 'completed'
    AND date >= p_start_date
    AND date <= p_end_date;
$$ LANGUAGE SQL;

-- Calculate total expenses for a user in date range
CREATE OR REPLACE FUNCTION calculate_expenses(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM transactions
  WHERE user_id = p_user_id
    AND type = 'expense'
    AND status = 'completed'
    AND date >= p_start_date
    AND date <= p_end_date;
$$ LANGUAGE SQL;

-- Get outstanding invoice amount for a user
CREATE OR REPLACE FUNCTION calculate_outstanding_invoices(p_user_id UUID)
RETURNS DECIMAL AS $$
  SELECT COALESCE(SUM(amount - paid_amount), 0)
  FROM invoices
  WHERE user_id = p_user_id
    AND status NOT IN ('paid', 'cancelled');
$$ LANGUAGE SQL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE transactions IS 'Stores all financial transactions (income and expenses)';
COMMENT ON TABLE invoices IS 'Stores client invoices with line items and payment tracking';
COMMENT ON TABLE reports IS 'Stores generated financial reports with metadata';
COMMENT ON TABLE financial_categories IS 'Categories for organizing transactions';

COMMENT ON COLUMN transactions.metadata IS 'Additional flexible data stored as JSON';
COMMENT ON COLUMN invoices.line_items IS 'Invoice line items: [{ description, quantity, rate, amount }]';
COMMENT ON COLUMN reports.data IS 'Report data stored as JSON for quick access';

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON SEQUENCE invoice_number_seq TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- ============================================================================
-- SESSION_12: GALLERY SYSTEM - Production Database Schema
-- ============================================================================
-- World-class media gallery with comprehensive features:
-- - Image and video management
-- - Album organization
-- - Tag system with categories
-- - Sharing and permissions
-- - Comments and reactions
-- - View tracking and analytics
-- - Edit history and versions
-- - AI metadata and auto-tagging
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- ENUMS
-- ============================================================================

DROP TYPE IF EXISTS image_type CASCADE;
CREATE TYPE image_type AS ENUM ('image', 'video', 'audio', 'document');
DROP TYPE IF EXISTS image_category CASCADE;
CREATE TYPE image_category AS ENUM (
  'branding',
  'web-design',
  'mobile',
  'social',
  'print',
  'video',
  'photography',
  'illustration',
  '3d',
  'animation',
  'ai-generated',
  'other'
);
DROP TYPE IF EXISTS album_privacy CASCADE;
CREATE TYPE album_privacy AS ENUM ('private', 'unlisted', 'public');
DROP TYPE IF EXISTS share_permission CASCADE;
CREATE TYPE share_permission AS ENUM ('view', 'download', 'comment', 'edit');
DROP TYPE IF EXISTS processing_status CASCADE;
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
DROP TYPE IF EXISTS edit_type CASCADE;
CREATE TYPE edit_type AS ENUM ('crop', 'resize', 'filter', 'adjustment', 'text', 'rotate', 'flip', 'other');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Gallery Images Table
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic metadata
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,

  -- URLs
  url TEXT NOT NULL, -- Full resolution URL
  thumbnail TEXT, -- Thumbnail URL

  -- Classification
  type image_type NOT NULL DEFAULT 'image',
  category image_category NOT NULL DEFAULT 'other',

  -- Organization
  album_id UUID REFERENCES gallery_albums(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  processing_status processing_status DEFAULT 'completed',

  -- Project context
  client TEXT,
  project TEXT,

  -- Engagement metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  -- Extended metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}', -- Camera, lens, location, etc.
  exif_data JSONB DEFAULT '{}', -- EXIF data from photos
  color_palette TEXT[] DEFAULT '{}', -- Extracted color hex values

  -- AI features
  ai_generated BOOLEAN DEFAULT FALSE,
  source_prompt TEXT, -- AI generation prompt if applicable
  ai_tags TEXT[] DEFAULT '{}', -- Auto-generated tags

  -- Sharing
  share_url TEXT UNIQUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0),
  CONSTRAINT valid_file_size CHECK (file_size > 0)
);

-- Albums Table
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT, -- URL to cover image

  -- Privacy
  privacy album_privacy NOT NULL DEFAULT 'private',
  password TEXT, -- For password-protected albums
  share_url TEXT UNIQUE,

  -- Organization
  parent_album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE, -- Nested albums
  tags TEXT[] DEFAULT '{}',

  -- Statistics
  image_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0, -- Total bytes of all images
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags Table
CREATE TABLE IF NOT EXISTS gallery_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tag info
  name TEXT NOT NULL,
  color TEXT, -- Hex color for UI
  category TEXT, -- Tag category (e.g., 'Design', 'Media', 'Art')

  -- Statistics
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique per user
  UNIQUE(user_id, name)
);

-- Image-Tags Junction Table
CREATE TABLE IF NOT EXISTS gallery_image_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES gallery_tags(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(image_id, tag_id)
);

-- Collections Table (Curated collections like "Featured", "Best of 2024", etc.)
CREATE TABLE IF NOT EXISTS gallery_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection info
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,

  -- Configuration
  is_auto_generated BOOLEAN DEFAULT FALSE, -- Smart collections based on rules
  rules JSONB DEFAULT '{}', -- Rules for smart collections

  -- Statistics
  image_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection Images Junction Table
CREATE TABLE IF NOT EXISTS gallery_collection_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES gallery_collections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- Ordering
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(collection_id, image_id)
);

-- Shares Table (Public sharing links)
CREATE TABLE IF NOT EXISTS gallery_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Share configuration
  share_url TEXT UNIQUE NOT NULL,
  password TEXT, -- Optional password protection
  expires_at TIMESTAMPTZ, -- Optional expiration
  permissions share_permission[] DEFAULT ARRAY['view']::share_permission[],

  -- Statistics
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Either image or album, not both
  CONSTRAINT image_or_album CHECK (
    (image_id IS NOT NULL AND album_id IS NULL) OR
    (image_id IS NULL AND album_id IS NOT NULL)
  )
);

-- Comments Table
CREATE TABLE IF NOT EXISTS gallery_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  text TEXT NOT NULL,

  -- Threading
  parent_comment_id UUID REFERENCES gallery_comments(id) ON DELETE CASCADE,

  -- Engagement
  likes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT non_empty_text CHECK (LENGTH(TRIM(text)) > 0)
);

-- Likes Table
CREATE TABLE IF NOT EXISTS gallery_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint - one like per user per image
  UNIQUE(image_id, user_id)
);

-- Views Table (Analytics)
CREATE TABLE IF NOT EXISTS gallery_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,

  -- Viewer info (nullable for anonymous views)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Context
  referrer TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Either image or album, not both
  CONSTRAINT image_or_album_view CHECK (
    (image_id IS NOT NULL AND album_id IS NULL) OR
    (image_id IS NULL AND album_id IS NOT NULL)
  )
);

-- Downloads Table (Tracking)
CREATE TABLE IF NOT EXISTS gallery_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- Downloader info (nullable for anonymous downloads)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,

  -- Download info
  file_format TEXT,
  file_size BIGINT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Edits Table (Version history)
CREATE TABLE IF NOT EXISTS gallery_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Edit details
  edit_type edit_type NOT NULL,
  parameters JSONB DEFAULT '{}', -- Edit parameters (e.g., crop coordinates, filter settings)

  -- Version info
  thumbnail TEXT, -- Thumbnail of edited version
  result_url TEXT, -- URL to edited image

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Metadata Table (AI-generated content metadata)
CREATE TABLE IF NOT EXISTS gallery_ai_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- AI generation details
  model TEXT, -- AI model used (e.g., "DALL-E 3", "Midjourney")
  prompt TEXT, -- Generation prompt
  negative_prompt TEXT, -- Negative prompt
  parameters JSONB DEFAULT '{}', -- Generation parameters

  -- Auto-tagging
  auto_tags TEXT[] DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}', -- Confidence scores for auto-tags

  -- Object detection
  detected_objects JSONB DEFAULT '{}', -- Detected objects with bounding boxes

  -- Content moderation
  moderation_labels TEXT[] DEFAULT '{}',
  is_safe_content BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Gallery Images Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_images_type ON gallery_images(type);
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_favorite ON gallery_images(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_is_public ON gallery_images(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_gallery_images_views ON gallery_images(views DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_likes ON gallery_images(likes DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_downloads ON gallery_images(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_images_processing_status ON gallery_images(processing_status) WHERE processing_status != 'completed';
CREATE INDEX IF NOT EXISTS idx_gallery_images_ai_generated ON gallery_images(ai_generated) WHERE ai_generated = TRUE;

-- Array and JSONB indexes
CREATE INDEX IF NOT EXISTS idx_gallery_images_tags ON gallery_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_gallery_images_metadata ON gallery_images USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_gallery_images_exif_data ON gallery_images USING GIN(exif_data);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_gallery_images_title_search ON gallery_images USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_gallery_images_description_search ON gallery_images USING GIN(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_gallery_images_client_search ON gallery_images USING GIN(to_tsvector('english', COALESCE(client, '')));

-- Albums Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_albums_user_id ON gallery_albums(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_parent_id ON gallery_albums(parent_album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_privacy ON gallery_albums(privacy);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_created_at ON gallery_albums(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_image_count ON gallery_albums(image_count DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_views ON gallery_albums(views DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_tags ON gallery_albums USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_gallery_albums_name_search ON gallery_albums USING GIN(to_tsvector('english', name));

-- Tags Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_tags_user_id ON gallery_tags(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_tags_name ON gallery_tags(name);
CREATE INDEX IF NOT EXISTS idx_gallery_tags_category ON gallery_tags(category);
CREATE INDEX IF NOT EXISTS idx_gallery_tags_usage_count ON gallery_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_tags_name_search ON gallery_tags USING GIN(to_tsvector('english', name));

-- Junction Tables Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_image_id ON gallery_image_tags(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_image_tags_tag_id ON gallery_image_tags(tag_id);

-- Collections Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_collections_user_id ON gallery_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_is_auto ON gallery_collections(is_auto_generated);
CREATE INDEX IF NOT EXISTS idx_gallery_collections_created_at ON gallery_collections(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_collection_images_collection_id ON gallery_collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collection_images_image_id ON gallery_collection_images(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_collection_images_display_order ON gallery_collection_images(collection_id, display_order);

-- Shares Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_shares_image_id ON gallery_shares(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_shares_album_id ON gallery_shares(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_shares_created_by ON gallery_shares(created_by);
CREATE INDEX IF NOT EXISTS idx_gallery_shares_share_url ON gallery_shares(share_url);
CREATE INDEX IF NOT EXISTS idx_gallery_shares_expires_at ON gallery_shares(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gallery_shares_permissions ON gallery_shares USING GIN(permissions);

-- Comments Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_comments_image_id ON gallery_comments(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_user_id ON gallery_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_parent_id ON gallery_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_created_at ON gallery_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_comments_likes ON gallery_comments(likes DESC);

-- Likes Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_likes_image_id ON gallery_likes(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_user_id ON gallery_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_likes_created_at ON gallery_likes(created_at DESC);

-- Views Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_views_image_id ON gallery_views(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_views_album_id ON gallery_views(album_id);
CREATE INDEX IF NOT EXISTS idx_gallery_views_user_id ON gallery_views(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_views_created_at ON gallery_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_views_ip_address ON gallery_views(ip_address);

-- Downloads Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_downloads_image_id ON gallery_downloads(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_downloads_user_id ON gallery_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_downloads_created_at ON gallery_downloads(created_at DESC);

-- Edits Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_edits_image_id ON gallery_edits(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_edits_user_id ON gallery_edits(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_edits_edit_type ON gallery_edits(edit_type);
CREATE INDEX IF NOT EXISTS idx_gallery_edits_created_at ON gallery_edits(created_at DESC);

-- AI Metadata Indexes
CREATE INDEX IF NOT EXISTS idx_gallery_ai_metadata_image_id ON gallery_ai_metadata(image_id);
CREATE INDEX IF NOT EXISTS idx_gallery_ai_metadata_model ON gallery_ai_metadata(model);
CREATE INDEX IF NOT EXISTS idx_gallery_ai_metadata_is_safe ON gallery_ai_metadata(is_safe_content);
CREATE INDEX IF NOT EXISTS idx_gallery_ai_metadata_auto_tags ON gallery_ai_metadata USING GIN(auto_tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_ai_metadata ENABLE ROW LEVEL SECURITY;

-- Gallery Images Policies
CREATE POLICY "Users can view their own images"
  ON gallery_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public images"
  ON gallery_images FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert their own images"
  ON gallery_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON gallery_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON gallery_images FOR DELETE
  USING (auth.uid() = user_id);

-- Albums Policies
CREATE POLICY "Users can view their own albums"
  ON gallery_albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public albums"
  ON gallery_albums FOR SELECT
  USING (privacy = 'public');

CREATE POLICY "Users can view unlisted albums with link"
  ON gallery_albums FOR SELECT
  USING (privacy = 'unlisted' AND share_url IS NOT NULL);

CREATE POLICY "Users can insert their own albums"
  ON gallery_albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
  ON gallery_albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON gallery_albums FOR DELETE
  USING (auth.uid() = user_id);

-- Tags Policies
CREATE POLICY "Users can view their own tags"
  ON gallery_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON gallery_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON gallery_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON gallery_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Image-Tags Policies
CREATE POLICY "Users can view image-tag relationships for their images"
  ON gallery_image_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert image-tag relationships for their images"
  ON gallery_image_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete image-tag relationships for their images"
  ON gallery_image_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- Collections Policies
CREATE POLICY "Users can view their own collections"
  ON gallery_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON gallery_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON gallery_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON gallery_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection Images Policies
CREATE POLICY "Users can view collection images for their collections"
  ON gallery_collection_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert collection images for their collections"
  ON gallery_collection_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete collection images for their collections"
  ON gallery_collection_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Shares Policies
CREATE POLICY "Users can view their own shares"
  ON gallery_shares FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view public shares"
  ON gallery_shares FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create shares for their content"
  ON gallery_shares FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shares"
  ON gallery_shares FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shares"
  ON gallery_shares FOR DELETE
  USING (auth.uid() = created_by);

-- Comments Policies
CREATE POLICY "Users can view comments on images they can view"
  ON gallery_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Authenticated users can insert comments"
  ON gallery_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON gallery_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON gallery_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes Policies
CREATE POLICY "Users can view likes on images they can view"
  ON gallery_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Authenticated users can insert likes"
  ON gallery_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON gallery_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Views Policies (Public - for analytics)
CREATE POLICY "Anyone can insert views"
  ON gallery_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view analytics for their content"
  ON gallery_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM gallery_albums
      WHERE id = album_id AND user_id = auth.uid()
    )
  );

-- Downloads Policies
CREATE POLICY "Anyone can insert downloads"
  ON gallery_downloads FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view download analytics for their images"
  ON gallery_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- Edits Policies
CREATE POLICY "Users can view edit history for their images"
  ON gallery_edits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert edits for their images"
  ON gallery_edits FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- AI Metadata Policies
CREATE POLICY "Users can view AI metadata for their images"
  ON gallery_ai_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI metadata"
  ON gallery_ai_metadata FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update AI metadata"
  ON gallery_ai_metadata FOR UPDATE
  USING (TRUE);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_collections_updated_at
  BEFORE UPDATE ON gallery_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_comments_updated_at
  BEFORE UPDATE ON gallery_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_ai_metadata_updated_at
  BEFORE UPDATE ON gallery_ai_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update album statistics when image is added/removed
CREATE OR REPLACE FUNCTION update_album_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update new album if exists
    IF NEW.album_id IS NOT NULL THEN
      UPDATE gallery_albums
      SET
        image_count = (
          SELECT COUNT(*) FROM gallery_images WHERE album_id = NEW.album_id
        ),
        total_size = (
          SELECT COALESCE(SUM(file_size), 0) FROM gallery_images WHERE album_id = NEW.album_id
        ),
        updated_at = NOW()
      WHERE id = NEW.album_id;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Update old album if exists and changed
    IF OLD.album_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.album_id != NEW.album_id) THEN
      UPDATE gallery_albums
      SET
        image_count = (
          SELECT COUNT(*) FROM gallery_images WHERE album_id = OLD.album_id
        ),
        total_size = (
          SELECT COALESCE(SUM(file_size), 0) FROM gallery_images WHERE album_id = OLD.album_id
        ),
        updated_at = NOW()
      WHERE id = OLD.album_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_statistics
  AFTER INSERT OR UPDATE OR DELETE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_album_statistics();

-- Update image likes count
CREATE OR REPLACE FUNCTION update_image_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_images
    SET likes = likes + 1
    WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_images
    SET likes = likes - 1
    WHERE id = OLD.image_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_likes_count
  AFTER INSERT OR DELETE ON gallery_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_image_likes_count();

-- Update image comments count
CREATE OR REPLACE FUNCTION update_image_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_images
    SET comments = comments + 1
    WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_images
    SET comments = comments - 1
    WHERE id = OLD.image_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_comments_count
  AFTER INSERT OR DELETE ON gallery_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_image_comments_count();

-- Update image views count
CREATE OR REPLACE FUNCTION update_image_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_id IS NOT NULL THEN
    UPDATE gallery_images
    SET views = views + 1
    WHERE id = NEW.image_id;
  ELSIF NEW.album_id IS NOT NULL THEN
    UPDATE gallery_albums
    SET views = views + 1
    WHERE id = NEW.album_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_views_count
  AFTER INSERT ON gallery_views
  FOR EACH ROW
  EXECUTE FUNCTION update_image_views_count();

-- Update image downloads count
CREATE OR REPLACE FUNCTION update_image_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gallery_images
  SET downloads = downloads + 1
  WHERE id = NEW.image_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_downloads_count
  AFTER INSERT ON gallery_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_image_downloads_count();

-- Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_tags
    SET usage_count = usage_count - 1
    WHERE id = OLD.tag_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_count
  AFTER INSERT OR DELETE ON gallery_image_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Update collection image count
CREATE OR REPLACE FUNCTION update_collection_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_collections
    SET
      image_count = image_count + 1,
      updated_at = NOW()
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_collections
    SET
      image_count = image_count - 1,
      updated_at = NOW()
    WHERE id = OLD.collection_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_image_count
  AFTER INSERT OR DELETE ON gallery_collection_images
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_image_count();

-- Update share statistics
CREATE OR REPLACE FUNCTION update_share_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_id IS NOT NULL THEN
    UPDATE gallery_images
    SET shares = shares + 1
    WHERE id = NEW.image_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_share_statistics
  AFTER INSERT ON gallery_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_share_statistics();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Full-text search for images
CREATE OR REPLACE FUNCTION search_gallery_images(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL
)
RETURNS SETOF gallery_images AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM gallery_images
  WHERE
    (user_uuid IS NULL OR user_id = user_uuid OR is_public = TRUE)
    AND (
      to_tsvector('english', title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(description, '')) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(client, '')) @@ plainto_tsquery('english', search_query)
      OR search_query = ANY(tags)
    )
  ORDER BY
    ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', search_query)) DESC,
    created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get similar images based on tags and category
CREATE OR REPLACE FUNCTION get_similar_images(
  target_image_id UUID,
  similarity_limit INTEGER DEFAULT 5
)
RETURNS SETOF gallery_images AS $$
DECLARE
  target_image gallery_images;
BEGIN
  -- Get target image
  SELECT * INTO target_image FROM gallery_images WHERE id = target_image_id;

  IF target_image IS NULL THEN
    RETURN;
  END IF;

  -- Find similar images
  RETURN QUERY
  SELECT gi.*
  FROM gallery_images gi
  WHERE
    gi.id != target_image_id
    AND gi.user_id = target_image.user_id
    AND (
      gi.category = target_image.category
      OR gi.tags && target_image.tags -- Array overlap operator
    )
  ORDER BY
    -- Prioritize same category
    CASE WHEN gi.category = target_image.category THEN 1 ELSE 0 END DESC,
    -- Count matching tags
    (SELECT COUNT(*) FROM unnest(gi.tags) tag WHERE tag = ANY(target_image.tags)) DESC,
    -- Popularity
    gi.views DESC
  LIMIT similarity_limit;
END;
$$ LANGUAGE plpgsql;

-- Get image analytics
CREATE OR REPLACE FUNCTION get_image_analytics(
  target_image_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(DISTINCT v.id),
    'unique_users', COUNT(DISTINCT v.user_id),
    'total_downloads', (SELECT COUNT(*) FROM gallery_downloads WHERE image_id = target_image_id),
    'total_likes', (SELECT COUNT(*) FROM gallery_likes WHERE image_id = target_image_id),
    'total_comments', (SELECT COUNT(*) FROM gallery_comments WHERE image_id = target_image_id),
    'views_by_day', (
      SELECT json_agg(day_stats)
      FROM (
        SELECT
          DATE(created_at) as date,
          COUNT(*) as views
        FROM gallery_views
        WHERE image_id = target_image_id
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      ) day_stats
    )
  ) INTO result
  FROM gallery_views v
  WHERE v.image_id = target_image_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get trending images (most viewed in last N days)
CREATE OR REPLACE FUNCTION get_trending_images(
  days INTEGER DEFAULT 7,
  result_limit INTEGER DEFAULT 10,
  user_uuid UUID DEFAULT NULL
)
RETURNS SETOF gallery_images AS $$
BEGIN
  RETURN QUERY
  SELECT gi.*
  FROM gallery_images gi
  WHERE
    (user_uuid IS NULL OR gi.user_id = user_uuid OR gi.is_public = TRUE)
    AND gi.created_at >= NOW() - (days || ' days')::INTERVAL
  ORDER BY
    gi.views DESC,
    gi.likes DESC,
    gi.downloads DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM gallery_shares
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Comments
COMMENT ON TABLE gallery_images IS 'Gallery images and videos with comprehensive metadata';
COMMENT ON TABLE gallery_albums IS 'Albums for organizing gallery media';
COMMENT ON TABLE gallery_tags IS 'User-defined tags for categorizing media';
COMMENT ON TABLE gallery_collections IS 'Curated collections of media (manual or smart)';
COMMENT ON TABLE gallery_shares IS 'Public sharing links for images and albums';
COMMENT ON TABLE gallery_comments IS 'Comments on gallery images';
COMMENT ON TABLE gallery_likes IS 'Like tracking for gallery images';
COMMENT ON TABLE gallery_views IS 'View analytics for images and albums';
COMMENT ON TABLE gallery_downloads IS 'Download tracking for gallery images';
COMMENT ON TABLE gallery_edits IS 'Edit history and version tracking';
COMMENT ON TABLE gallery_ai_metadata IS 'AI-generated metadata and content moderation';

-- ============================================================================
-- SAMPLE QUERIES FOR PRODUCTION API
-- ============================================================================

/*
-- Get user's images with filters
SELECT * FROM gallery_images
WHERE user_id = auth.uid()
  AND category = 'branding'
  AND is_favorite = TRUE
ORDER BY created_at DESC
LIMIT 20;

-- Get images in album
SELECT gi.* FROM gallery_images gi
JOIN gallery_albums ga ON gi.album_id = ga.id
WHERE ga.id = 'album-uuid'
  AND (ga.user_id = auth.uid() OR ga.privacy = 'public')
ORDER BY gi.created_at DESC;

-- Search images
SELECT * FROM search_gallery_images('logo design', auth.uid())
LIMIT 20;

-- Get trending images
SELECT * FROM get_trending_images(7, 10, auth.uid());

-- Get similar images
SELECT * FROM get_similar_images('image-uuid', 5);

-- Get image analytics
SELECT get_image_analytics('image-uuid');

-- Get user's collections
SELECT * FROM gallery_collections
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Get images with specific tags
SELECT * FROM gallery_images
WHERE tags && ARRAY['logo', 'branding']
  AND user_id = auth.uid()
ORDER BY created_at DESC;

-- Get top performing images
SELECT * FROM gallery_images
WHERE user_id = auth.uid()
ORDER BY (views * 0.4 + likes * 0.3 + downloads * 0.3) DESC
LIMIT 10;
*/
