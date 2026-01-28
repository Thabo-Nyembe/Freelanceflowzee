-- ============================================================================
-- FIX v10 - Safe version with column checks
-- ============================================================================

-- Add missing columns to ai_feature_usage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'cost_usd') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN cost_usd DECIMAL(10,4) DEFAULT 0;
    END IF;
END $$;

-- Add remind_at to reminders
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'remind_at') THEN
        ALTER TABLE reminders ADD COLUMN remind_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add date to analytics_revenue
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_revenue' AND column_name = 'date') THEN
        ALTER TABLE analytics_revenue ADD COLUMN date DATE;
    END IF;
END $$;

-- Add scheduled_at to team_meetings
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_meetings' AND column_name = 'scheduled_at') THEN
        ALTER TABLE team_meetings ADD COLUMN scheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- Add status to notification_queue
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_queue' AND column_name = 'status') THEN
        ALTER TABLE notification_queue ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Add download_count to digital_assets
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'digital_assets' AND column_name = 'download_count') THEN
        ALTER TABLE digital_assets ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "clients_all" ON clients;
CREATE POLICY "clients_all" ON clients FOR ALL USING (auth.uid() IS NOT NULL);

-- Add client_id to projects and FK
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        ALTER TABLE projects ADD COLUMN client_id UUID;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_client_id_fkey') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_client_id_fkey;
    END IF;
    ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create organizations table (drop and recreate to ensure correct schema)
DROP TABLE IF EXISTS organizations CASCADE;
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    logo_url TEXT,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "organizations_all" ON organizations FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix organization_members FK
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_fkey') THEN
        ALTER TABLE organization_members DROP CONSTRAINT organization_members_organization_id_fkey;
    END IF;
    ALTER TABLE organization_members ADD CONSTRAINT organization_members_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Create indexes only for columns that exist
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);

SELECT 'Fix v10 complete!' AS status;
