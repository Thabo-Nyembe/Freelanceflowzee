-- ============================================================================
-- CORE BUSINESS TABLES - RLS POLICIES MIGRATION
-- ============================================================================
-- Created: 2026-01-17
-- Purpose: Ensure all core business tables have proper, explicit RLS policies
--          for SELECT, INSERT, UPDATE, and DELETE operations
--
-- Tables covered:
--   - projects
--   - clients
--   - invoices
--   - tasks
-- ============================================================================

-- ============================================================================
-- PROJECTS TABLE RLS POLICIES
-- ============================================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with explicit operation-specific policies
DROP POLICY IF EXISTS "Users can manage own projects" ON projects;
DROP POLICY IF EXISTS "Team members can view shared projects" ON projects;
DROP POLICY IF EXISTS "projects_select_policy" ON projects;
DROP POLICY IF EXISTS "projects_insert_policy" ON projects;
DROP POLICY IF EXISTS "projects_update_policy" ON projects;
DROP POLICY IF EXISTS "projects_delete_policy" ON projects;

-- SELECT: Users can read their own projects
CREATE POLICY "projects_select_policy" ON projects
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can insert their own projects
CREATE POLICY "projects_insert_policy" ON projects
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own projects
CREATE POLICY "projects_update_policy" ON projects
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own projects
CREATE POLICY "projects_delete_policy" ON projects
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- CLIENTS TABLE RLS POLICIES
-- ============================================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with explicit operation-specific policies
DROP POLICY IF EXISTS "Users can manage own clients" ON clients;
DROP POLICY IF EXISTS "clients_select_policy" ON clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON clients;
DROP POLICY IF EXISTS "clients_update_policy" ON clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON clients;

-- SELECT: Users can read their own clients
CREATE POLICY "clients_select_policy" ON clients
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can insert their own clients
CREATE POLICY "clients_insert_policy" ON clients
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own clients
CREATE POLICY "clients_update_policy" ON clients
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own clients
CREATE POLICY "clients_delete_policy" ON clients
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- INVOICES TABLE RLS POLICIES
-- ============================================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with explicit operation-specific policies
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_select_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_policy" ON invoices;

-- SELECT: Users can read their own invoices
CREATE POLICY "invoices_select_policy" ON invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: Users can insert their own invoices
CREATE POLICY "invoices_insert_policy" ON invoices
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own invoices
CREATE POLICY "invoices_update_policy" ON invoices
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can delete their own invoices
CREATE POLICY "invoices_delete_policy" ON invoices
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TASKS TABLE RLS POLICIES
-- ============================================================================

-- Ensure RLS is enabled (idempotent)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate with explicit operation-specific policies
DROP POLICY IF EXISTS "tasks_user_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_select_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_update_policy" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_policy" ON tasks;

-- SELECT: Users can read their own tasks or tasks assigned to them
CREATE POLICY "tasks_select_policy" ON tasks
    FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = assigned_to);

-- INSERT: Users can insert their own tasks
CREATE POLICY "tasks_insert_policy" ON tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can update their own tasks or tasks assigned to them
CREATE POLICY "tasks_update_policy" ON tasks
    FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = assigned_to)
    WITH CHECK (auth.uid() = user_id OR auth.uid() = assigned_to);

-- DELETE: Users can delete their own tasks
CREATE POLICY "tasks_delete_policy" ON tasks
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO authenticated;

-- ============================================================================
-- COMPLETION NOTICE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Core business tables RLS policies applied successfully:';
    RAISE NOTICE '  - projects: SELECT, INSERT, UPDATE, DELETE policies created';
    RAISE NOTICE '  - clients: SELECT, INSERT, UPDATE, DELETE policies created';
    RAISE NOTICE '  - invoices: SELECT, INSERT, UPDATE, DELETE policies created';
    RAISE NOTICE '  - tasks: SELECT, INSERT, UPDATE, DELETE policies created';
END $$;
