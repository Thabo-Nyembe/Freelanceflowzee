-- ============================================================================
-- Secure File Delivery System with Escrow Integration
-- ============================================================================
-- Description: Gallery-style file delivery with payments, passwords & escrow
-- Features:
--   - Password-protected file access
--   - Escrow-based file release
--   - Wasabi S3 cost-optimized storage
--   - Gallery-style file organization
--   - Payment-gated downloads
--   - Trust & safety protection
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE file_delivery_status AS ENUM (
  'draft',              -- File uploaded, not yet sent
  'pending_payment',    -- Awaiting payment
  'escrowed',          -- Payment in escrow, file locked
  'released',          -- Payment released, file accessible
  'disputed',          -- Dispute raised
  'refunded',          -- Payment refunded, access revoked
  'expired'            -- Access period expired
);

CREATE TYPE file_access_type AS ENUM (
  'password',          -- Password-protected
  'payment',           -- Payment required
  'escrow',            -- Escrow payment required
  'public',            -- Public access
  'private'            -- Private (owner only)
);

CREATE TYPE storage_provider_type AS ENUM (
  'wasabi',            -- Wasabi S3 (cheapest)
  'supabase',          -- Supabase storage
  'google-drive',      -- Google Drive
  'dropbox',           -- Dropbox
  'onedrive',          -- OneDrive
  'local'              -- Local/custom
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Secure File Deliveries Table
CREATE TABLE IF NOT EXISTS secure_file_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner Info
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Recipient Info (optional - for targeted delivery)
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_email TEXT,
  recipient_name TEXT,

  -- File Info
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Storage Info
  storage_provider storage_provider_type NOT NULL DEFAULT 'wasabi',
  storage_path TEXT NOT NULL,
  storage_bucket TEXT,
  storage_region TEXT,

  -- Access Control
  access_type file_access_type NOT NULL DEFAULT 'password',
  password_hash TEXT,  -- bcrypt hash if password-protected
  access_code TEXT,    -- Simple access code (alternative to password)
  max_downloads INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,

  -- Payment & Escrow
  requires_payment BOOLEAN DEFAULT false,
  payment_amount DECIMAL(10, 2),
  payment_currency TEXT DEFAULT 'USD',
  escrow_deposit_id UUID REFERENCES escrow_deposits(id) ON DELETE SET NULL,
  milestone_id UUID,  -- Will reference escrow_milestones
  payment_received_at TIMESTAMPTZ,
  payment_released_at TIMESTAMPTZ,

  -- Delivery Status
  status file_delivery_status NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  -- Gallery & Organization
  gallery_title TEXT,
  gallery_description TEXT,
  gallery_category TEXT,
  gallery_tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,

  -- Trust & Safety
  requires_signature BOOLEAN DEFAULT false,
  signature_received BOOLEAN DEFAULT false,
  watermark_enabled BOOLEAN DEFAULT true,
  download_notification BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_payment CHECK (payment_amount IS NULL OR payment_amount >= 0),
  CONSTRAINT valid_downloads CHECK (max_downloads IS NULL OR max_downloads > 0),
  CONSTRAINT download_limit CHECK (download_count >= 0)
);

-- File Access Logs Table
CREATE TABLE IF NOT EXISTS file_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES secure_file_deliveries(id) ON DELETE CASCADE,

  -- Access Info
  accessed_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accessed_by_email TEXT,
  access_method TEXT, -- 'password', 'payment', 'escrow_release'

  -- Action
  action TEXT NOT NULL, -- 'view', 'download', 'preview'
  success BOOLEAN DEFAULT true,
  failure_reason TEXT,

  -- Context
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  location JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Delivery Recipients Table (for batch delivery)
CREATE TABLE IF NOT EXISTS file_delivery_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES secure_file_deliveries(id) ON DELETE CASCADE,

  -- Recipient
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Individual Access
  individual_password TEXT,
  individual_access_code TEXT,
  max_downloads INTEGER DEFAULT 1,
  download_count INTEGER DEFAULT 0,

  -- Status
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ,
  first_accessed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(delivery_id, recipient_email)
);

-- Gallery Collections Table
CREATE TABLE IF NOT EXISTS gallery_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection Info
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE,
  cover_image_url TEXT,

  -- Access Control
  is_public BOOLEAN DEFAULT false,
  requires_password BOOLEAN DEFAULT false,
  password_hash TEXT,

  -- Payment
  requires_payment BOOLEAN DEFAULT false,
  payment_amount DECIMAL(10, 2),
  payment_currency TEXT DEFAULT 'USD',

  -- Organization
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],

  -- Metadata
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_payment CHECK (payment_amount IS NULL OR payment_amount >= 0)
);

-- Collection Files Junction Table
CREATE TABLE IF NOT EXISTS collection_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES gallery_collections(id) ON DELETE CASCADE,
  delivery_id UUID NOT NULL REFERENCES secure_file_deliveries(id) ON DELETE CASCADE,

  -- Display
  display_order INTEGER DEFAULT 0,
  caption TEXT,

  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(collection_id, delivery_id)
);

-- Wasabi S3 Configuration Table
CREATE TABLE IF NOT EXISTS wasabi_storage_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Wasabi Credentials
  access_key_id TEXT NOT NULL,
  secret_access_key_encrypted TEXT NOT NULL,  -- Encrypted
  bucket_name TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'us-east-1',
  endpoint TEXT,

  -- Stats
  total_storage_used BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  monthly_cost DECIMAL(10, 2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- File Download Transactions Table (links to escrow)
CREATE TABLE IF NOT EXISTS file_download_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES secure_file_deliveries(id) ON DELETE CASCADE,

  -- Buyer/Downloader
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_email TEXT NOT NULL,

  -- Payment
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT,
  payment_provider TEXT,
  payment_id TEXT,  -- External payment ID (Stripe, PayPal, etc.)

  -- Escrow Integration
  escrow_deposit_id UUID REFERENCES escrow_deposits(id) ON DELETE SET NULL,
  escrow_released BOOLEAN DEFAULT false,
  escrow_released_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, refunded, failed
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,

  -- Download
  download_granted BOOLEAN DEFAULT false,
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT positive_amount CHECK (amount > 0)
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE secure_file_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_delivery_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE wasabi_storage_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_download_transactions ENABLE ROW LEVEL SECURITY;

-- Secure File Deliveries Policies
CREATE POLICY "Users can view own deliveries"
  ON secure_file_deliveries FOR SELECT
  USING (auth.uid() = owner_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create deliveries"
  ON secure_file_deliveries FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own deliveries"
  ON secure_file_deliveries FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own deliveries"
  ON secure_file_deliveries FOR DELETE
  USING (auth.uid() = owner_id);

-- File Access Logs Policies
CREATE POLICY "Users can view own access logs"
  ON file_access_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM secure_file_deliveries
      WHERE secure_file_deliveries.id = file_access_logs.delivery_id
      AND secure_file_deliveries.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert access logs"
  ON file_access_logs FOR INSERT
  WITH CHECK (true);

-- Gallery Collections Policies
CREATE POLICY "Users can view public collections or own collections"
  ON gallery_collections FOR SELECT
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Users can create collections"
  ON gallery_collections FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own collections"
  ON gallery_collections FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own collections"
  ON gallery_collections FOR DELETE
  USING (auth.uid() = owner_id);

-- Wasabi Storage Config Policies
CREATE POLICY "Users can view own storage config"
  ON wasabi_storage_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own storage config"
  ON wasabi_storage_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage config"
  ON wasabi_storage_config FOR UPDATE
  USING (auth.uid() = user_id);

-- File Download Transactions Policies
CREATE POLICY "Users can view own transactions"
  ON file_download_transactions FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    EXISTS (
      SELECT 1 FROM secure_file_deliveries
      WHERE secure_file_deliveries.id = file_download_transactions.delivery_id
      AND secure_file_deliveries.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can create transactions"
  ON file_download_transactions FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Secure File Deliveries Indexes
CREATE INDEX idx_secure_file_deliveries_owner ON secure_file_deliveries(owner_id);
CREATE INDEX idx_secure_file_deliveries_recipient ON secure_file_deliveries(recipient_id);
CREATE INDEX idx_secure_file_deliveries_status ON secure_file_deliveries(status);
CREATE INDEX idx_secure_file_deliveries_escrow ON secure_file_deliveries(escrow_deposit_id);
CREATE INDEX idx_secure_file_deliveries_expires ON secure_file_deliveries(expires_at);
CREATE INDEX idx_secure_file_deliveries_gallery ON secure_file_deliveries(gallery_category);

-- File Access Logs Indexes
CREATE INDEX idx_file_access_logs_delivery ON file_access_logs(delivery_id);
CREATE INDEX idx_file_access_logs_user ON file_access_logs(accessed_by_id);
CREATE INDEX idx_file_access_logs_timestamp ON file_access_logs(accessed_at DESC);
CREATE INDEX idx_file_access_logs_action ON file_access_logs(action);

-- Gallery Collections Indexes
CREATE INDEX idx_gallery_collections_owner ON gallery_collections(owner_id);
CREATE INDEX idx_gallery_collections_slug ON gallery_collections(slug);
CREATE INDEX idx_gallery_collections_public ON gallery_collections(is_public) WHERE is_public = true;
CREATE INDEX idx_gallery_collections_featured ON gallery_collections(is_featured) WHERE is_featured = true;

-- Collection Files Indexes
CREATE INDEX idx_collection_files_collection ON collection_files(collection_id);
CREATE INDEX idx_collection_files_delivery ON collection_files(delivery_id);

-- File Download Transactions Indexes
CREATE INDEX idx_file_download_transactions_delivery ON file_download_transactions(delivery_id);
CREATE INDEX idx_file_download_transactions_buyer ON file_download_transactions(buyer_id);
CREATE INDEX idx_file_download_transactions_escrow ON file_download_transactions(escrow_deposit_id);
CREATE INDEX idx_file_download_transactions_status ON file_download_transactions(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_download_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'download' AND NEW.success = true THEN
    UPDATE secure_file_deliveries
    SET download_count = download_count + 1,
        last_accessed_at = NOW()
    WHERE id = NEW.delivery_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update collection stats
CREATE OR REPLACE FUNCTION update_collection_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gallery_collections
  SET file_count = (
    SELECT COUNT(*)
    FROM collection_files
    WHERE collection_id = NEW.collection_id
  ),
  updated_at = NOW()
  WHERE id = NEW.collection_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check download limit
CREATE OR REPLACE FUNCTION check_download_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_max_downloads INTEGER;
  v_download_count INTEGER;
BEGIN
  SELECT max_downloads, download_count
  INTO v_max_downloads, v_download_count
  FROM secure_file_deliveries
  WHERE id = NEW.delivery_id;

  IF v_max_downloads IS NOT NULL AND v_download_count >= v_max_downloads THEN
    RAISE EXCEPTION 'Download limit reached for this file';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS trigger_update_secure_file_deliveries_updated_at ON secure_file_deliveries;
CREATE TRIGGER trigger_update_secure_file_deliveries_updated_at
  BEFORE UPDATE ON secure_file_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_gallery_collections_updated_at ON gallery_collections;
CREATE TRIGGER trigger_update_gallery_collections_updated_at
  BEFORE UPDATE ON gallery_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_wasabi_storage_config_updated_at ON wasabi_storage_config;
CREATE TRIGGER trigger_update_wasabi_storage_config_updated_at
  BEFORE UPDATE ON wasabi_storage_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_file_download_transactions_updated_at ON file_download_transactions;
CREATE TRIGGER trigger_update_file_download_transactions_updated_at
  BEFORE UPDATE ON file_download_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Download count trigger
DROP TRIGGER IF EXISTS trigger_increment_download_count ON file_access_logs;
CREATE TRIGGER trigger_increment_download_count
  AFTER INSERT ON file_access_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_download_count();

-- Collection stats trigger
DROP TRIGGER IF EXISTS trigger_update_collection_stats ON collection_files;
CREATE TRIGGER trigger_update_collection_stats
  AFTER INSERT OR DELETE ON collection_files
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_stats();

-- Download limit check trigger
DROP TRIGGER IF EXISTS trigger_check_download_limit ON file_access_logs;
CREATE TRIGGER trigger_check_download_limit
  BEFORE INSERT ON file_access_logs
  FOR EACH ROW
  WHEN (NEW.action = 'download')
  EXECUTE FUNCTION check_download_limit();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE secure_file_deliveries IS 'Secure file delivery system with password protection, payments, and escrow';
COMMENT ON TABLE file_access_logs IS 'Audit log of all file access attempts';
COMMENT ON TABLE gallery_collections IS 'Gallery-style file collections for portfolio/showcase';
COMMENT ON TABLE wasabi_storage_config IS 'Wasabi S3 storage configuration for cost optimization';
COMMENT ON TABLE file_download_transactions IS 'Payment transactions for file downloads with escrow integration';

COMMENT ON COLUMN secure_file_deliveries.storage_provider IS 'Storage provider: wasabi (cheapest), supabase, google-drive, dropbox, onedrive';
COMMENT ON COLUMN secure_file_deliveries.access_type IS 'Access control type: password, payment, escrow, public, private';
COMMENT ON COLUMN secure_file_deliveries.watermark_enabled IS 'Apply watermark to previews for protection';
COMMENT ON COLUMN wasabi_storage_config.secret_access_key_encrypted IS 'Encrypted Wasabi secret key (use pgcrypto)';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
