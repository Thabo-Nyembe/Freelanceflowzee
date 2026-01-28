-- ============================================================================
-- COMPREHENSIVE FIX v8 - All remaining column and FK issues
-- ============================================================================

-- ============================================================================
-- PART 1: ADD MISSING COLUMNS
-- ============================================================================

-- ai_feature_usage: add cost_usd column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'cost_usd') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN cost_usd DECIMAL(10,4) DEFAULT 0;
    END IF;
END $$;

-- reminders: add remind_at column (alias for reminder_time)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminders' AND column_name = 'remind_at') THEN
        ALTER TABLE reminders ADD COLUMN remind_at TIMESTAMPTZ;
        UPDATE reminders SET remind_at = reminder_time WHERE remind_at IS NULL;
    END IF;
END $$;

-- analytics_revenue: add date column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_revenue' AND column_name = 'date') THEN
        ALTER TABLE analytics_revenue ADD COLUMN date DATE;
        UPDATE analytics_revenue SET date = recorded_date WHERE date IS NULL;
    END IF;
END $$;

-- team_meetings: add scheduled_at column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_meetings' AND column_name = 'scheduled_at') THEN
        ALTER TABLE team_meetings ADD COLUMN scheduled_at TIMESTAMPTZ;
        UPDATE team_meetings SET scheduled_at = start_time WHERE scheduled_at IS NULL;
    END IF;
END $$;

-- notification_queue: add status column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_queue' AND column_name = 'status') THEN
        ALTER TABLE notification_queue ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- digital_assets: add download_count column
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'digital_assets' AND column_name = 'download_count') THEN
        ALTER TABLE digital_assets ADD COLUMN download_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- PART 2: CREATE CLIENTS TABLE IF NOT EXISTS AND ADD FK
-- ============================================================================

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

-- Add FK from projects.client_id to clients.id
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        ALTER TABLE projects ADD COLUMN client_id UUID;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'projects_client_id_fkey' AND table_name = 'projects') THEN
        ALTER TABLE projects DROP CONSTRAINT projects_client_id_fkey;
    END IF;
END $$;

ALTER TABLE projects ADD CONSTRAINT projects_client_id_fkey 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL;

-- ============================================================================
-- PART 3: CREATE ORGANIZATIONS TABLE AND FIX FK
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    logo_url TEXT,
    owner_id UUID,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "organizations_all" ON organizations;
CREATE POLICY "organizations_all" ON organizations FOR ALL USING (auth.uid() IS NOT NULL);

-- Fix organization_members FK
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'organization_members_organization_id_fkey' AND table_name = 'organization_members') THEN
        ALTER TABLE organization_members DROP CONSTRAINT organization_members_organization_id_fkey;
    END IF;
END $$;

ALTER TABLE organization_members ADD CONSTRAINT organization_members_organization_id_fkey 
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- ============================================================================
-- PART 4: FIX REPORTS FK RELATIONS
-- ============================================================================

-- Ensure report_templates and report_schedules exist with proper structure
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_templates') THEN
        CREATE TABLE report_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            template_type TEXT,
            config JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "report_templates_all" ON report_templates FOR SELECT USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_schedules') THEN
        CREATE TABLE report_schedules (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            report_id UUID,
            frequency TEXT,
            next_run_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "report_schedules_all" ON report_schedules FOR ALL USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Re-add FK constraints for reports
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reports_template_id_fkey' AND table_name = 'reports') THEN
        ALTER TABLE reports DROP CONSTRAINT reports_template_id_fkey;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'report_schedules_report_id_fkey' AND table_name = 'report_schedules') THEN
        ALTER TABLE report_schedules DROP CONSTRAINT report_schedules_report_id_fkey;
    END IF;
END $$;

ALTER TABLE reports ADD CONSTRAINT reports_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE SET NULL;

ALTER TABLE report_schedules ADD CONSTRAINT report_schedules_report_id_fkey 
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;

-- ============================================================================
-- PART 5: CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON organization_members(organization_id);

SELECT 'All remaining fixes v8 complete!' AS status;
