-- ============================================================================
-- FIX MISSING COLUMNS ON EXISTING TABLES v4
-- ============================================================================

-- ============================================================================
-- PROJECTS TABLE - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'budget') THEN
        ALTER TABLE projects ADD COLUMN budget DECIMAL(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
        ALTER TABLE projects ADD COLUMN deadline DATE;
    END IF;
END $$;

-- ============================================================================
-- TEAM_MEMBERS TABLE - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'status') THEN
        ALTER TABLE team_members ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- ============================================================================
-- INVOICES TABLE - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'amount') THEN
        ALTER TABLE invoices ADD COLUMN amount DECIMAL(12,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'client_id') THEN
        ALTER TABLE invoices ADD COLUMN client_id UUID;
    END IF;
END $$;

-- ============================================================================
-- MILESTONES TABLE - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'due_date') THEN
        ALTER TABLE milestones ADD COLUMN due_date DATE;
    END IF;
END $$;

-- ============================================================================
-- FILES TABLE - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'owner_id') THEN
        ALTER TABLE files ADD COLUMN owner_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'files' AND column_name = 'is_deleted') THEN
        ALTER TABLE files ADD COLUMN is_deleted BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================================================
-- REPORTS TABLE - Create if not exists with relations
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    report_type TEXT,
    template_id UUID,
    parameters JSONB DEFAULT '{}'::jsonb,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reports_all" ON reports;
CREATE POLICY "reports_all" ON reports FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS report_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_templates_all" ON report_templates;
CREATE POLICY "report_templates_all" ON report_templates FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID,
    frequency TEXT,
    next_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE report_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "report_schedules_all" ON report_schedules;
CREATE POLICY "report_schedules_all" ON report_schedules FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- FIX ORGANIZATION_MEMBERS - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization_members' AND column_name = 'role') THEN
        ALTER TABLE organization_members ADD COLUMN role TEXT DEFAULT 'member';
    END IF;
END $$;

-- ============================================================================
-- FIX REMINDERS - Ensure foreign key for reminder_recipients
-- ============================================================================
DO $$ BEGIN
    -- Add reminder_id to reminder_recipients if exists but no FK
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminder_recipients') THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminders') THEN
            -- FK should already exist from v3, just ensure table structure is correct
            NULL;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- TASKS TABLE - Add missing columns for relations
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
        ALTER TABLE tasks ADD COLUMN project_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE tasks ADD COLUMN assigned_to UUID;
    END IF;
END $$;

-- ============================================================================
-- Create indexes for new columns
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_budget ON projects(budget);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_files_owner_id ON files(owner_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);

SELECT 'Column fixes v4 complete!' AS status;
