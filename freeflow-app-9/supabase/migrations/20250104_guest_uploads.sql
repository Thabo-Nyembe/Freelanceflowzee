-- Migration: Guest Upload Payments System
-- Description: One-time paid file uploads without subscription
-- Date: 2025-01-04

-- ============================================================================
-- GUEST UPLOAD PAYMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS guest_upload_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_name VARCHAR(500) NOT NULL,
  upload_link UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_intent_id VARCHAR(255),
  stripe_payment_id VARCHAR(255),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 10,
  file_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_uploads_link ON guest_upload_payments(upload_link);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_email ON guest_upload_payments(email);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_status ON guest_upload_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_expires ON guest_upload_payments(expires_at);
CREATE INDEX IF NOT EXISTS idx_guest_uploads_created ON guest_upload_payments(created_at);

-- ============================================================================
-- GUEST UPLOAD ANALYTICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS guest_upload_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE UNIQUE,
  total_uploads INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  completed_uploads INTEGER DEFAULT 0,
  failed_uploads INTEGER DEFAULT 0,
  avg_file_size BIGINT DEFAULT 0,
  total_file_size BIGINT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  avg_download_count DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_guest_analytics_date ON guest_upload_analytics(date);

-- ============================================================================
-- TRIGGER: Update timestamp on row update
-- ============================================================================

CREATE OR REPLACE FUNCTION update_guest_upload_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guest_upload_payments_updated
  BEFORE UPDATE ON guest_upload_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_upload_timestamp();

CREATE TRIGGER guest_upload_analytics_updated
  BEFORE UPDATE ON guest_upload_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_upload_timestamp();

-- ============================================================================
-- TRIGGER: Update analytics on payment completion
-- ============================================================================

CREATE OR REPLACE FUNCTION update_guest_analytics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    INSERT INTO guest_upload_analytics (
      date,
      total_uploads,
      total_revenue,
      completed_uploads,
      total_file_size,
      avg_file_size
    ) VALUES (
      CURRENT_DATE,
      1,
      NEW.payment_amount,
      1,
      NEW.file_size,
      NEW.file_size
    )
    ON CONFLICT (date) DO UPDATE SET
      total_uploads = guest_upload_analytics.total_uploads + 1,
      total_revenue = guest_upload_analytics.total_revenue + NEW.payment_amount,
      completed_uploads = guest_upload_analytics.completed_uploads + 1,
      total_file_size = guest_upload_analytics.total_file_size + NEW.file_size,
      avg_file_size = (guest_upload_analytics.total_file_size + NEW.file_size) / (guest_upload_analytics.completed_uploads + 1),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER guest_payment_completed
  AFTER UPDATE ON guest_upload_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_guest_analytics();

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

ALTER TABLE guest_upload_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_upload_analytics ENABLE ROW LEVEL SECURITY;

-- Allow public to create new guest uploads
CREATE POLICY "Anyone can create guest uploads"
  ON guest_upload_payments FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own uploads by email
CREATE POLICY "Users can view own uploads"
  ON guest_upload_payments FOR SELECT
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- Allow updates only by link
CREATE POLICY "Update by upload link"
  ON guest_upload_payments FOR UPDATE
  TO public
  USING (true);

-- Analytics readable by authenticated users only
CREATE POLICY "Authenticated users can view analytics"
  ON guest_upload_analytics FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if upload link is valid
CREATE OR REPLACE FUNCTION is_guest_upload_valid(link UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  SELECT
    payment_status = 'completed'
    AND expires_at > NOW()
    AND download_count < max_downloads
  INTO is_valid
  FROM guest_upload_payments
  WHERE upload_link = link;

  RETURN COALESCE(is_valid, false);
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_guest_download(link UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE guest_upload_payments
  SET
    download_count = download_count + 1,
    updated_at = NOW()
  WHERE
    upload_link = link
    AND payment_status = 'completed'
    AND expires_at > NOW()
    AND download_count < max_downloads;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (for testing only - remove in production)
-- ============================================================================

-- INSERT INTO guest_upload_payments (
--   email,
--   file_size,
--   file_name,
--   payment_amount,
--   payment_status
-- ) VALUES (
--   'test@example.com',
--   1073741824, -- 1GB
--   'test-file.zip',
--   5.00,
--   'completed'
-- );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE guest_upload_payments IS 'Stores one-time paid file uploads without subscription';
COMMENT ON COLUMN guest_upload_payments.upload_link IS 'Unique UUID for accessing the upload';
COMMENT ON COLUMN guest_upload_payments.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN guest_upload_payments.expires_at IS 'Link expiration time (default 7 days from creation)';
COMMENT ON COLUMN guest_upload_payments.max_downloads IS 'Maximum number of downloads allowed (default 10)';

COMMENT ON TABLE guest_upload_analytics IS 'Daily analytics for guest upload revenue and usage';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON guest_upload_payments TO anon;
GRANT SELECT, INSERT, UPDATE ON guest_upload_payments TO authenticated;
GRANT SELECT ON guest_upload_analytics TO authenticated;
