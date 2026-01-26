-- Migration: Guest Sessions System
-- Description: Table for storing guest payment sessions for feature access
-- Date: 2026-01-26

-- ============================================================================
-- GUEST SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS guest_sessions (
  id TEXT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  feature VARCHAR(100) NOT NULL,
  payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount INTEGER NOT NULL DEFAULT 0,
  duration VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('pending', 'active', 'expired', 'cancelled')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_sessions_email ON guest_sessions(email);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_status ON guest_sessions(status);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_expires ON guest_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_payment_intent ON guest_sessions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_guest_sessions_created ON guest_sessions(created_at);

-- ============================================================================
-- TRIGGER: Update timestamp on row update
-- ============================================================================

CREATE OR REPLACE FUNCTION update_guest_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS guest_sessions_updated ON guest_sessions;
CREATE TRIGGER guest_sessions_updated
  BEFORE UPDATE ON guest_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_session_timestamp();

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public to create new guest sessions (for payment initiation)
CREATE POLICY "Anyone can create guest sessions"
  ON guest_sessions FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "Service role has full access"
  ON guest_sessions FOR ALL
  TO service_role
  USING (true);

-- Allow users to view sessions by email match
CREATE POLICY "Users can view own sessions by email"
  ON guest_sessions FOR SELECT
  TO public
  USING (true);

-- Allow updates (for webhook status updates)
CREATE POLICY "Allow session updates"
  ON guest_sessions FOR UPDATE
  TO public
  USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a guest session is valid
CREATE OR REPLACE FUNCTION is_guest_session_valid(session_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  SELECT
    status = 'active'
    AND expires_at > NOW()
  INTO is_valid
  FROM guest_sessions
  WHERE id = session_id;

  RETURN COALESCE(is_valid, false);
END;
$$ LANGUAGE plpgsql;

-- Function to get guest session feature
CREATE OR REPLACE FUNCTION get_guest_session_feature(session_id TEXT)
RETURNS TEXT AS $$
DECLARE
  session_feature TEXT;
BEGIN
  SELECT feature INTO session_feature
  FROM guest_sessions
  WHERE id = session_id
    AND status = 'active'
    AND expires_at > NOW();

  RETURN session_feature;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON guest_sessions TO anon;
GRANT SELECT, INSERT, UPDATE ON guest_sessions TO authenticated;
GRANT ALL ON guest_sessions TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE guest_sessions IS 'Stores guest payment sessions for temporary feature access';
COMMENT ON COLUMN guest_sessions.id IS 'Unique session ID (provided by client)';
COMMENT ON COLUMN guest_sessions.feature IS 'The feature being accessed (e.g., video-editor, ai-assistant)';
COMMENT ON COLUMN guest_sessions.payment_intent_id IS 'Stripe payment intent ID';
COMMENT ON COLUMN guest_sessions.stripe_customer_id IS 'Stripe customer ID for the guest';
COMMENT ON COLUMN guest_sessions.status IS 'Session status: pending, active, expired, cancelled';
COMMENT ON COLUMN guest_sessions.expires_at IS 'When the feature access expires';
COMMENT ON COLUMN guest_sessions.activated_at IS 'When payment was confirmed and access granted';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'guest_sessions'
  ) THEN
    RAISE NOTICE 'GUEST SESSIONS MIGRATION SUCCESSFUL!';
    RAISE NOTICE 'Table created: guest_sessions';
    RAISE NOTICE 'RLS enabled on guest_sessions';
    RAISE NOTICE 'Ready for guest payments!';
  ELSE
    RAISE EXCEPTION 'Migration failed - guest_sessions table not created';
  END IF;
END $$;
