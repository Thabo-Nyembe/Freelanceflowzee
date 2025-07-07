-- Storage Optimization System Migration
-- This migration adds tables for optimizing storage across providers:
-- - Multi-cloud storage management
-- - Storage tier optimization
-- - File metadata and caching
-- - Storage analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create storage_providers table
CREATE TABLE IF NOT EXISTS storage_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('supabase', 'wasabi', 's3', 'cloudflare')),
    credentials JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage_tiers table
CREATE TABLE IF NOT EXISTS storage_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    cost_per_gb DECIMAL(10,4) NOT NULL,
    min_storage_days INTEGER,
    max_storage_days INTEGER,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_metadata table
CREATE TABLE IF NOT EXISTS file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    hash TEXT NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    storage_tier_id UUID REFERENCES storage_tiers(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_versions table
CREATE TABLE IF NOT EXISTS file_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    size_bytes BIGINT NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(file_id, version_number)
);

-- Create file_cache table
CREATE TABLE IF NOT EXISTS file_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID NOT NULL,
    cache_key TEXT NOT NULL UNIQUE,
    size_bytes BIGINT NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage_analytics table
CREATE TABLE IF NOT EXISTS storage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    provider_id UUID NOT NULL REFERENCES storage_providers(id) ON DELETE CASCADE,
    total_files INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    files_added INTEGER DEFAULT 0,
    files_deleted INTEGER DEFAULT 0,
    bandwidth_used_bytes BIGINT DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, provider_id)
);

-- Create storage_optimization_jobs table
CREATE TABLE IF NOT EXISTS storage_optimization_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL CHECK (job_type IN ('tier_migration', 'deduplication', 'compression', 'cleanup')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    files_processed INTEGER DEFAULT 0,
    bytes_saved BIGINT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_file_metadata_file_id ON file_metadata(file_id);
CREATE INDEX idx_file_metadata_provider_id ON file_metadata(provider_id);
CREATE INDEX idx_file_metadata_storage_tier_id ON file_metadata(storage_tier_id);
CREATE INDEX idx_file_metadata_hash ON file_metadata(hash);

CREATE INDEX idx_file_versions_file_id ON file_versions(file_id);
CREATE INDEX idx_file_versions_provider_id ON file_versions(provider_id);

CREATE INDEX idx_file_cache_file_id ON file_cache(file_id);
CREATE INDEX idx_file_cache_expires_at ON file_cache(expires_at);

CREATE INDEX idx_storage_analytics_date ON storage_analytics(date);
CREATE INDEX idx_storage_analytics_provider_id ON storage_analytics(provider_id);

CREATE INDEX idx_storage_optimization_jobs_status ON storage_optimization_jobs(status);
CREATE INDEX idx_storage_optimization_jobs_job_type ON storage_optimization_jobs(job_type);

-- Enable RLS
ALTER TABLE storage_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_optimization_jobs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage storage providers"
    ON storage_providers FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Admins can manage storage tiers"
    ON storage_tiers FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Users can view their own file metadata"
    ON file_metadata FOR SELECT
    USING (auth.uid() IN (SELECT owner_id FROM files WHERE id = file_metadata.file_id));

-- Add helpful comments
COMMENT ON TABLE storage_providers IS 'Available storage providers configuration';
COMMENT ON TABLE storage_tiers IS 'Storage tier definitions and pricing';
COMMENT ON TABLE file_metadata IS 'Extended metadata for stored files';
COMMENT ON TABLE file_versions IS 'Version history for files';
COMMENT ON TABLE file_cache IS 'Temporary file cache entries';
COMMENT ON TABLE storage_analytics IS 'Storage usage analytics per provider';
COMMENT ON TABLE storage_optimization_jobs IS 'Storage optimization job tracking'; 