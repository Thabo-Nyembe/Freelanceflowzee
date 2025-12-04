-- ============================================================================
-- CORE FUNCTIONS AND EXTENSIONS
-- ============================================================================
-- RUN THIS FIRST before any other chunks

-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ✅ Core functions ready. Next: Run CHUNK_01.sql through CHUNK_10.sql in order
-- ============================================================================
