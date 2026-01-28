-- Migration: Fix team_members RLS infinite recursion
-- Date: January 28, 2026
-- Problem: The "team_members_select" policy queries team_members within itself, causing infinite recursion
-- Solution: Drop recursive policies and create simple auth.uid() based policies

-- ============================================================================
-- Step 1: Drop all problematic policies on team_members
-- ============================================================================

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies on team_members to start fresh
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'team_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- ============================================================================
-- Step 2: Create non-recursive RLS policies
-- ============================================================================

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- SELECT: Users can view team members where they are the owner or a member
-- Using direct column comparison, no subqueries on same table
CREATE POLICY "team_members_select_v2" ON team_members
    FOR SELECT USING (
        auth.uid() = user_id 
        OR auth.uid() = member_user_id
        OR team_owner_id = auth.uid()
    );

-- INSERT: Users can add members to their own teams
CREATE POLICY "team_members_insert_v2" ON team_members
    FOR INSERT WITH CHECK (
        auth.uid() = user_id 
        OR auth.uid() = team_owner_id
    );

-- UPDATE: Owners can update their team members
CREATE POLICY "team_members_update_v2" ON team_members
    FOR UPDATE USING (
        auth.uid() = user_id 
        OR auth.uid() = team_owner_id
    );

-- DELETE: Owners can remove team members
CREATE POLICY "team_members_delete_v2" ON team_members
    FOR DELETE USING (
        auth.uid() = user_id 
        OR auth.uid() = team_owner_id
    );

-- ============================================================================
-- Step 3: Add missing columns if needed for the policies to work
-- ============================================================================

DO $$
BEGIN
    -- team_owner_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'team_owner_id') THEN
        ALTER TABLE team_members ADD COLUMN team_owner_id UUID REFERENCES auth.users(id);
        -- Populate with user_id as default owner
        UPDATE team_members SET team_owner_id = user_id WHERE team_owner_id IS NULL;
    END IF;
    
    -- member_user_id column (the actual member being added)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'member_user_id') THEN
        ALTER TABLE team_members ADD COLUMN member_user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- ============================================================================
-- Step 4: Create index for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_owner_id ON team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_member_user_id ON team_members(member_user_id);

-- ============================================================================
-- Done
-- ============================================================================

SELECT 'Migration complete: Fixed team_members RLS recursion' AS status;
