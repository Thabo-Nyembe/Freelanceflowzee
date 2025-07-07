-- Enhanced Sharing System Migration
-- This migration adds tables for advanced sharing features including:
-- - Granular sharing permissions
-- - Share tracking and analytics
-- - Team and client sharing

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create share_links table
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    title TEXT,
    description TEXT,
    access_code TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    permissions JSONB DEFAULT '{"download": false, "share": false, "comment": true}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create share_access_logs table
CREATE TABLE IF NOT EXISTS share_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
    accessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    user_agent TEXT,
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'comment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_shares table
CREATE TABLE IF NOT EXISTS team_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    team_id UUID NOT NULL,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"view": true, "edit": false, "share": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client_shares table
CREATE TABLE IF NOT EXISTS client_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'project', 'file', 'folder')),
    resource_id UUID NOT NULL,
    client_id UUID NOT NULL,
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"view": true, "comment": true, "download": false}',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create share_analytics table
CREATE TABLE IF NOT EXISTS share_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    average_view_duration INTEGER,
    locations JSONB DEFAULT '{}',
    devices JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(share_id, date)
);

-- Create indexes
CREATE INDEX idx_share_links_user_id ON share_links(user_id);
CREATE INDEX idx_share_links_resource ON share_links(resource_type, resource_id);
CREATE INDEX idx_share_access_logs_share_id ON share_access_logs(share_id);
CREATE INDEX idx_team_shares_team_id ON team_shares(team_id);
CREATE INDEX idx_team_shares_resource ON team_shares(resource_type, resource_id);
CREATE INDEX idx_client_shares_client_id ON client_shares(client_id);
CREATE INDEX idx_client_shares_resource ON client_shares(resource_type, resource_id);
CREATE INDEX idx_share_analytics_share_id ON share_analytics(share_id);
CREATE INDEX idx_share_analytics_date ON share_analytics(date);

-- Enable RLS
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own share links"
    ON share_links FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Share owners can view access logs"
    ON share_access_logs FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM share_links WHERE id = share_access_logs.share_id
        )
    );

CREATE POLICY "Team members can view team shares"
    ON team_shares FOR SELECT
    USING (
        auth.uid() IN (
            SELECT user_id FROM team_members WHERE team_id = team_shares.team_id
        )
    );

-- Add helpful comments
COMMENT ON TABLE share_links IS 'Stores public and private share links';
COMMENT ON TABLE share_access_logs IS 'Tracks all access to shared resources';
COMMENT ON TABLE team_shares IS 'Manages resource sharing within teams';
COMMENT ON TABLE client_shares IS 'Controls sharing with external clients';
COMMENT ON TABLE share_analytics IS 'Analytics for shared resource engagement'; 