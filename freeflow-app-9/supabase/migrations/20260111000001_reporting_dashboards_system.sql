-- =====================================================
-- Reporting Dashboards System - Complete Migration
-- Tables for dashboard reporting, data sources, and worksheets
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- REPORTING DASHBOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reporting_dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail TEXT,
    widgets JSONB DEFAULT '[]'::jsonb,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    author VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- REPORTING WORKSHEETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reporting_worksheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    chart_type VARCHAR(50) DEFAULT 'bar',
    data_source VARCHAR(255),
    metrics TEXT[] DEFAULT '{}',
    dimensions TEXT[] DEFAULT '{}',
    filters JSONB DEFAULT '[]'::jsonb,
    author VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- REPORTING DATA SOURCES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reporting_data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'postgresql',
    host VARCHAR(255),
    database_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    last_sync TIMESTAMPTZ,
    tables INTEGER DEFAULT 0,
    row_count INTEGER DEFAULT 0,
    connection_string TEXT,
    credentials JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- =====================================================
-- SCHEDULED REPORTS TABLE (enhanced version)
-- Note: If scheduled_reports already exists from another migration,
-- this will add the missing columns
-- =====================================================

-- First, check if the table exists and add missing columns
DO $$
BEGIN
    -- Add columns to scheduled_reports if they don't exist
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'scheduled_reports') THEN
        -- Add name column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'name') THEN
            ALTER TABLE scheduled_reports ADD COLUMN name VARCHAR(255);
        END IF;

        -- Add dashboard_id column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'dashboard_id') THEN
            ALTER TABLE scheduled_reports ADD COLUMN dashboard_id UUID;
        END IF;

        -- Add dashboard_name column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'dashboard_name') THEN
            ALTER TABLE scheduled_reports ADD COLUMN dashboard_name VARCHAR(255);
        END IF;

        -- Add schedule column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'schedule') THEN
            ALTER TABLE scheduled_reports ADD COLUMN schedule VARCHAR(20) DEFAULT 'daily';
        END IF;

        -- Add next_run column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'next_run') THEN
            ALTER TABLE scheduled_reports ADD COLUMN next_run TIMESTAMPTZ;
        END IF;

        -- Add last_run column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'last_run') THEN
            ALTER TABLE scheduled_reports ADD COLUMN last_run TIMESTAMPTZ;
        END IF;

        -- Add recipients column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'recipients') THEN
            ALTER TABLE scheduled_reports ADD COLUMN recipients TEXT[] DEFAULT '{}';
        END IF;

        -- Add format column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'format') THEN
            ALTER TABLE scheduled_reports ADD COLUMN format VARCHAR(10) DEFAULT 'pdf';
        END IF;

        -- Add enabled column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'enabled') THEN
            ALTER TABLE scheduled_reports ADD COLUMN enabled BOOLEAN DEFAULT true;
        END IF;

        -- Add deleted_at column if not exists
        IF NOT EXISTS (SELECT FROM information_schema.columns
                       WHERE table_name = 'scheduled_reports' AND column_name = 'deleted_at') THEN
            ALTER TABLE scheduled_reports ADD COLUMN deleted_at TIMESTAMPTZ;
        END IF;
    ELSE
        -- Create the table if it doesn't exist
        CREATE TABLE scheduled_reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name VARCHAR(255),
            dashboard_id UUID,
            dashboard_name VARCHAR(255),
            schedule VARCHAR(20) DEFAULT 'daily',
            next_run TIMESTAMPTZ,
            last_run TIMESTAMPTZ,
            recipients TEXT[] DEFAULT '{}',
            format VARCHAR(10) DEFAULT 'pdf',
            enabled BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

-- =====================================================
-- INDEXES
-- =====================================================

-- Reporting Dashboards indexes
CREATE INDEX IF NOT EXISTS idx_reporting_dashboards_user ON reporting_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_reporting_dashboards_published ON reporting_dashboards(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_reporting_dashboards_favorite ON reporting_dashboards(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_reporting_dashboards_deleted ON reporting_dashboards(deleted_at) WHERE deleted_at IS NULL;

-- Reporting Worksheets indexes
CREATE INDEX IF NOT EXISTS idx_reporting_worksheets_user ON reporting_worksheets(user_id);
CREATE INDEX IF NOT EXISTS idx_reporting_worksheets_deleted ON reporting_worksheets(deleted_at) WHERE deleted_at IS NULL;

-- Reporting Data Sources indexes
CREATE INDEX IF NOT EXISTS idx_reporting_data_sources_user ON reporting_data_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_reporting_data_sources_type ON reporting_data_sources(type);
CREATE INDEX IF NOT EXISTS idx_reporting_data_sources_status ON reporting_data_sources(status);
CREATE INDEX IF NOT EXISTS idx_reporting_data_sources_deleted ON reporting_data_sources(deleted_at) WHERE deleted_at IS NULL;

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE reporting_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporting_data_sources ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Reporting Dashboards policies
CREATE POLICY "Users can view own dashboards or published" ON reporting_dashboards FOR SELECT
    USING (user_id = auth.uid() OR is_published = true);

CREATE POLICY "Users can create own dashboards" ON reporting_dashboards FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own dashboards" ON reporting_dashboards FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own dashboards" ON reporting_dashboards FOR DELETE
    USING (user_id = auth.uid());

-- Reporting Worksheets policies
CREATE POLICY "Users can view own worksheets" ON reporting_worksheets FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own worksheets" ON reporting_worksheets FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own worksheets" ON reporting_worksheets FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own worksheets" ON reporting_worksheets FOR DELETE
    USING (user_id = auth.uid());

-- Reporting Data Sources policies
CREATE POLICY "Users can view own data sources" ON reporting_data_sources FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own data sources" ON reporting_data_sources FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own data sources" ON reporting_data_sources FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own data sources" ON reporting_data_sources FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- GRANTS
-- =====================================================

GRANT ALL ON reporting_dashboards TO authenticated;
GRANT ALL ON reporting_worksheets TO authenticated;
GRANT ALL ON reporting_data_sources TO authenticated;

GRANT ALL ON reporting_dashboards TO service_role;
GRANT ALL ON reporting_worksheets TO service_role;
GRANT ALL ON reporting_data_sources TO service_role;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_reporting_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reporting_dashboards_updated_at ON reporting_dashboards;
CREATE TRIGGER reporting_dashboards_updated_at
    BEFORE UPDATE ON reporting_dashboards
    FOR EACH ROW EXECUTE FUNCTION update_reporting_updated_at();

DROP TRIGGER IF EXISTS reporting_worksheets_updated_at ON reporting_worksheets;
CREATE TRIGGER reporting_worksheets_updated_at
    BEFORE UPDATE ON reporting_worksheets
    FOR EACH ROW EXECUTE FUNCTION update_reporting_updated_at();

DROP TRIGGER IF EXISTS reporting_data_sources_updated_at ON reporting_data_sources;
CREATE TRIGGER reporting_data_sources_updated_at
    BEFORE UPDATE ON reporting_data_sources
    FOR EACH ROW EXECUTE FUNCTION update_reporting_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get dashboard statistics for a user
CREATE OR REPLACE FUNCTION get_reporting_dashboard_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_dashboards', (
            SELECT COUNT(*) FROM reporting_dashboards
            WHERE user_id = p_user_id AND deleted_at IS NULL
        ),
        'published_dashboards', (
            SELECT COUNT(*) FROM reporting_dashboards
            WHERE user_id = p_user_id AND is_published = true AND deleted_at IS NULL
        ),
        'favorite_dashboards', (
            SELECT COUNT(*) FROM reporting_dashboards
            WHERE user_id = p_user_id AND is_favorite = true AND deleted_at IS NULL
        ),
        'total_views', (
            SELECT COALESCE(SUM(views), 0) FROM reporting_dashboards
            WHERE user_id = p_user_id AND deleted_at IS NULL
        ),
        'total_data_sources', (
            SELECT COUNT(*) FROM reporting_data_sources
            WHERE user_id = p_user_id AND deleted_at IS NULL
        ),
        'connected_sources', (
            SELECT COUNT(*) FROM reporting_data_sources
            WHERE user_id = p_user_id AND status = 'connected' AND deleted_at IS NULL
        ),
        'total_worksheets', (
            SELECT COUNT(*) FROM reporting_worksheets
            WHERE user_id = p_user_id AND deleted_at IS NULL
        ),
        'scheduled_reports', (
            SELECT COUNT(*) FROM scheduled_reports
            WHERE user_id = p_user_id AND enabled = true
            AND (deleted_at IS NULL OR deleted_at > NOW())
        )
    ) INTO v_stats;

    RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment dashboard views
CREATE OR REPLACE FUNCTION increment_dashboard_views(p_dashboard_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE reporting_dashboards
    SET views = views + 1
    WHERE id = p_dashboard_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (optional - for testing)
-- =====================================================
-- Uncomment to insert sample data for testing

-- INSERT INTO reporting_dashboards (user_id, name, description, is_published, tags)
-- SELECT
--     auth.uid(),
--     'Sample Dashboard',
--     'A sample dashboard for testing',
--     false,
--     ARRAY['sample', 'test']
-- WHERE NOT EXISTS (
--     SELECT 1 FROM reporting_dashboards WHERE name = 'Sample Dashboard'
-- );
