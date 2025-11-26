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

CREATE TYPE escrow_status AS ENUM (
  'pending',
  'active',
  'completed',
  'disputed',
  'released',
  'refunded',
  'cancelled'
);

CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'disputed',
  'approved',
  'rejected'
);

CREATE TYPE payment_method AS ENUM (
  'stripe',
  'paypal',
  'bank_transfer',
  'crypto',
  'wire_transfer',
  'credit_card'
);

CREATE TYPE currency_type AS ENUM (
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'JPY',
  'CHF'
);

CREATE TYPE dispute_status AS ENUM (
  'open',
  'under_review',
  'resolved',
  'escalated',
  'closed'
);

CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'release',
  'refund',
  'fee',
  'chargeback',
  'adjustment'
);

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
CREATE TABLE escrow_deposits (
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
CREATE TABLE escrow_milestones (
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
CREATE TABLE milestone_attachments (
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
CREATE TABLE escrow_fees (
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
CREATE TABLE escrow_transactions (
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
CREATE TABLE escrow_disputes (
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
CREATE TABLE dispute_evidence (
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
CREATE TABLE escrow_contracts (
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
CREATE TABLE contract_terms (
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
CREATE TABLE release_requests (
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
CREATE TABLE escrow_metadata (
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
CREATE INDEX idx_escrow_deposits_user_id ON escrow_deposits(user_id);
CREATE INDEX idx_escrow_deposits_client_id ON escrow_deposits(client_id);
CREATE INDEX idx_escrow_deposits_status ON escrow_deposits(status);
CREATE INDEX idx_escrow_deposits_created_at ON escrow_deposits(created_at DESC);
CREATE INDEX idx_escrow_deposits_amount ON escrow_deposits(amount DESC);
CREATE INDEX idx_escrow_deposits_currency ON escrow_deposits(currency);
CREATE INDEX idx_escrow_deposits_payment_method ON escrow_deposits(payment_method);
CREATE INDEX idx_escrow_deposits_user_status ON escrow_deposits(user_id, status);
CREATE INDEX idx_escrow_deposits_client_email ON escrow_deposits(client_email);
CREATE INDEX idx_escrow_deposits_dispute_status ON escrow_deposits(dispute_status) WHERE dispute_status IS NOT NULL;

-- Escrow Milestones Indexes
CREATE INDEX idx_escrow_milestones_deposit_id ON escrow_milestones(deposit_id);
CREATE INDEX idx_escrow_milestones_status ON escrow_milestones(status);
CREATE INDEX idx_escrow_milestones_due_date ON escrow_milestones(due_date);
CREATE INDEX idx_escrow_milestones_created_at ON escrow_milestones(created_at DESC);
CREATE INDEX idx_escrow_milestones_deposit_status ON escrow_milestones(deposit_id, status);

-- Milestone Attachments Indexes
CREATE INDEX idx_milestone_attachments_milestone_id ON milestone_attachments(milestone_id);
CREATE INDEX idx_milestone_attachments_uploaded_at ON milestone_attachments(uploaded_at DESC);

-- Escrow Fees Indexes
CREATE INDEX idx_escrow_fees_deposit_id ON escrow_fees(deposit_id);
CREATE INDEX idx_escrow_fees_currency ON escrow_fees(currency);

-- Escrow Transactions Indexes
CREATE INDEX idx_escrow_transactions_deposit_id ON escrow_transactions(deposit_id);
CREATE INDEX idx_escrow_transactions_type ON escrow_transactions(type);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_created_at ON escrow_transactions(created_at DESC);
CREATE INDEX idx_escrow_transactions_from_user_id ON escrow_transactions(from_user_id);
CREATE INDEX idx_escrow_transactions_to_user_id ON escrow_transactions(to_user_id);
CREATE INDEX idx_escrow_transactions_payment_id ON escrow_transactions(payment_id);

-- Escrow Disputes Indexes
CREATE INDEX idx_escrow_disputes_deposit_id ON escrow_disputes(deposit_id);
CREATE INDEX idx_escrow_disputes_milestone_id ON escrow_disputes(milestone_id);
CREATE INDEX idx_escrow_disputes_status ON escrow_disputes(status);
CREATE INDEX idx_escrow_disputes_raised_by_id ON escrow_disputes(raised_by_id);
CREATE INDEX idx_escrow_disputes_raised_at ON escrow_disputes(raised_at DESC);

-- Dispute Evidence Indexes
CREATE INDEX idx_dispute_evidence_dispute_id ON dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_evidence_uploaded_at ON dispute_evidence(uploaded_at DESC);

-- Escrow Contracts Indexes
CREATE INDEX idx_escrow_contracts_deposit_id ON escrow_contracts(deposit_id);
CREATE INDEX idx_escrow_contracts_version ON escrow_contracts(version DESC);

-- Contract Terms Indexes
CREATE INDEX idx_contract_terms_contract_id ON contract_terms(contract_id);

-- Release Requests Indexes
CREATE INDEX idx_release_requests_deposit_id ON release_requests(deposit_id);
CREATE INDEX idx_release_requests_milestone_id ON release_requests(milestone_id);
CREATE INDEX idx_release_requests_status ON release_requests(status);
CREATE INDEX idx_release_requests_requested_by ON release_requests(requested_by);

-- Escrow Metadata Indexes
CREATE INDEX idx_escrow_metadata_deposit_id ON escrow_metadata(deposit_id);
CREATE INDEX idx_escrow_metadata_category ON escrow_metadata(category);
CREATE INDEX idx_escrow_metadata_tags ON escrow_metadata USING gin(tags);

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
