/**
 * Storage Connections Migration
 * Creates tables for unified storage integration across multiple providers
 * Supports: Google Drive, Dropbox, OneDrive, Box, iCloud
 */

-- Drop existing tables if they exist (for clean re-run)
DROP TABLE IF EXISTS storage_connections CASCADE;
DROP TABLE IF EXISTS storage_files_cache CASCADE;

-- Create storage_connections table
CREATE TABLE storage_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google-drive', 'dropbox', 'onedrive', 'box', 'icloud', 'local')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  account_email TEXT,
  account_name TEXT,
  total_space BIGINT DEFAULT 0,
  used_space BIGINT DEFAULT 0,
  connected BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Create storage_files_cache table (for faster browsing)
CREATE TABLE storage_files_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id UUID NOT NULL REFERENCES storage_connections(id) ON DELETE CASCADE,
  file_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT,
  is_folder BOOLEAN DEFAULT false,
  parent_id TEXT,
  thumbnail_url TEXT,
  web_view_url TEXT,
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  modified_at TIMESTAMPTZ DEFAULT NOW(),
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(connection_id, file_id)
);

-- Create indexes for performance
CREATE INDEX idx_storage_connections_user_id ON storage_connections(user_id);
CREATE INDEX idx_storage_connections_provider ON storage_connections(provider);
CREATE INDEX idx_storage_connections_connected ON storage_connections(connected);

CREATE INDEX idx_storage_files_cache_connection_id ON storage_files_cache(connection_id);
CREATE INDEX idx_storage_files_cache_file_name ON storage_files_cache(file_name);
CREATE INDEX idx_storage_files_cache_parent_id ON storage_files_cache(parent_id);
CREATE INDEX idx_storage_files_cache_is_folder ON storage_files_cache(is_folder);

-- Full text search index for file names
CREATE INDEX idx_storage_files_cache_file_name_search ON storage_files_cache USING GIN(to_tsvector('english', file_name));

-- Enable RLS (Row Level Security)
ALTER TABLE storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_files_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for storage_connections

-- Users can view their own storage connections
CREATE POLICY "Users can view own storage connections"
  ON storage_connections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own storage connections
CREATE POLICY "Users can insert own storage connections"
  ON storage_connections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own storage connections
CREATE POLICY "Users can update own storage connections"
  ON storage_connections
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own storage connections
CREATE POLICY "Users can delete own storage connections"
  ON storage_connections
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for storage_files_cache

-- Users can view files from their connected storages
CREATE POLICY "Users can view own storage files"
  ON storage_files_cache
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM storage_connections
      WHERE storage_connections.id = storage_files_cache.connection_id
      AND storage_connections.user_id = auth.uid()
    )
  );

-- Users can insert files into their cache
CREATE POLICY "Users can insert own storage files"
  ON storage_files_cache
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM storage_connections
      WHERE storage_connections.id = storage_files_cache.connection_id
      AND storage_connections.user_id = auth.uid()
    )
  );

-- Users can update their cached files
CREATE POLICY "Users can update own storage files"
  ON storage_files_cache
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM storage_connections
      WHERE storage_connections.id = storage_files_cache.connection_id
      AND storage_connections.user_id = auth.uid()
    )
  );

-- Users can delete their cached files
CREATE POLICY "Users can delete own storage files"
  ON storage_files_cache
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM storage_connections
      WHERE storage_connections.id = storage_files_cache.connection_id
      AND storage_connections.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_storage_connections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER storage_connections_updated_at
  BEFORE UPDATE ON storage_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_connections_updated_at();

-- Add comments for documentation
COMMENT ON TABLE storage_connections IS 'Stores OAuth connections to external storage providers (Google Drive, Dropbox, OneDrive, Box, iCloud)';
COMMENT ON TABLE storage_files_cache IS 'Caches file listings from external storage providers for faster browsing';

COMMENT ON COLUMN storage_connections.user_id IS 'References auth.users.id - the authenticated user';
COMMENT ON COLUMN storage_connections.provider IS 'Storage provider name (google-drive, dropbox, onedrive, box, icloud, local)';
COMMENT ON COLUMN storage_connections.access_token IS 'OAuth access token for API calls';
COMMENT ON COLUMN storage_connections.refresh_token IS 'OAuth refresh token for renewing access';
COMMENT ON COLUMN storage_connections.expires_at IS 'When the access token expires';
COMMENT ON COLUMN storage_connections.total_space IS 'Total storage space in bytes';
COMMENT ON COLUMN storage_connections.used_space IS 'Used storage space in bytes';
COMMENT ON COLUMN storage_connections.connected IS 'Whether the connection is active';
COMMENT ON COLUMN storage_connections.last_sync IS 'Last time files were synced from this provider';

COMMENT ON COLUMN storage_files_cache.connection_id IS 'References storage_connections.id';
COMMENT ON COLUMN storage_files_cache.file_id IS 'Unique file ID from the storage provider';
COMMENT ON COLUMN storage_files_cache.file_name IS 'Name of the file';
COMMENT ON COLUMN storage_files_cache.file_path IS 'Full path to the file';
COMMENT ON COLUMN storage_files_cache.file_size IS 'File size in bytes';
COMMENT ON COLUMN storage_files_cache.is_folder IS 'Whether this is a folder';
COMMENT ON COLUMN storage_files_cache.cached_at IS 'When this file was cached';
