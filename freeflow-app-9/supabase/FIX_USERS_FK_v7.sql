-- ============================================================================
-- FIX USERS FOREIGN KEY RELATIONS v7
-- Enable tasks -> users relation for PostgREST
-- ============================================================================

-- Add FK from tasks.assigned_to to users.id
DO $$ BEGIN
    -- Ensure assigned_to column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'assigned_to') THEN
        ALTER TABLE tasks ADD COLUMN assigned_to UUID;
    END IF;
    
    -- Drop existing FK if any
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'tasks_assigned_to_fkey' AND table_name = 'tasks') THEN
        ALTER TABLE tasks DROP CONSTRAINT tasks_assigned_to_fkey;
    END IF;
END $$;

-- Add FK constraint to users table (not auth.users)
ALTER TABLE tasks ADD CONSTRAINT tasks_assigned_to_fkey 
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);

SELECT 'Users FK v7 complete!' AS status;
