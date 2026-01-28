-- ============================================================================
-- FIX FOREIGN KEY RELATIONS v6
-- These enable PostgREST to resolve embedded queries like projects(title)
-- ============================================================================

-- ============================================================================
-- FIX TASKS -> PROJECTS RELATION
-- Query: tasks?select=*,projects(title)
-- ============================================================================
DO $$ BEGIN
    -- Ensure project_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'project_id') THEN
        ALTER TABLE tasks ADD COLUMN project_id UUID;
    END IF;
    
    -- Drop existing FK if any
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_project_id_fkey' AND table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_project_id_fkey;
    END IF;
END $$;

-- Add FK constraint (allows PostgREST to resolve the relation)
ALTER TABLE tasks ADD CONSTRAINT tasks_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;

-- ============================================================================
-- FIX REMINDERS -> REMINDER_RECIPIENTS RELATION
-- Query: reminders?select=*,reminder_recipients(count)
-- ============================================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminder_recipients') THEN
        -- Drop existing FK if any
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reminder_recipients_reminder_id_fkey' AND table_name = 'reminder_recipients') THEN
            ALTER TABLE reminder_recipients DROP CONSTRAINT reminder_recipients_reminder_id_fkey;
        END IF;
    END IF;
END $$;

-- Add FK to reminder_recipients
ALTER TABLE reminder_recipients ADD CONSTRAINT reminder_recipients_reminder_id_fkey 
    FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE;

-- ============================================================================
-- FIX REPORTS -> REPORT_TEMPLATES RELATION
-- Query: reports?select=*,report_templates(*),report_schedules(*)
-- ============================================================================
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports') THEN
        -- Drop existing FK if any
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'reports_template_id_fkey' AND table_name = 'reports') THEN
            ALTER TABLE reports DROP CONSTRAINT reports_template_id_fkey;
        END IF;
    END IF;
END $$;

-- Add FK to reports
ALTER TABLE reports ADD CONSTRAINT reports_template_id_fkey 
    FOREIGN KEY (template_id) REFERENCES report_templates(id) ON DELETE SET NULL;

-- Fix report_schedules -> reports relation
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'report_schedules') THEN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'report_schedules_report_id_fkey' AND table_name = 'report_schedules') THEN
            ALTER TABLE report_schedules DROP CONSTRAINT report_schedules_report_id_fkey;
        END IF;
    END IF;
END $$;

ALTER TABLE report_schedules ADD CONSTRAINT report_schedules_report_id_fkey 
    FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE;

-- ============================================================================
-- ADD USERS RELATION FOR TASKS (assigned_to)
-- Query: tasks?select=*,users!assigned_to(*)
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE tasks ADD COLUMN assigned_to UUID;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_assigned_to_fkey' AND table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_assigned_to_fkey;
    END IF;
END $$;

-- Note: Can't directly reference auth.users, need to use profiles or create a view
-- For now, just ensure the column exists - the query might need adjustment in frontend

-- ============================================================================
-- FIX PROJECTS TABLE - Ensure all columns used in queries exist
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deadline') THEN
        ALTER TABLE projects ADD COLUMN deadline TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deleted_at') THEN
        ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'client_id') THEN
        ALTER TABLE projects ADD COLUMN client_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress') THEN
        ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES FOR RELATIONS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_reminder_recipients_reminder_id ON reminder_recipients(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reports_template_id ON reports(template_id);
CREATE INDEX IF NOT EXISTS idx_report_schedules_report_id ON report_schedules(report_id);

SELECT 'Relations v6 complete!' AS status;
