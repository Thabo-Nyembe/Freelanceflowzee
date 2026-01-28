-- ============================================================================
-- COMPREHENSIVE FIX: RLS Recursion + Missing Tables
-- Run this in Supabase Dashboard > SQL Editor
-- Date: January 28, 2026
-- ============================================================================

-- ============================================================================
-- PART 1: FIX TEAM_MEMBERS RLS INFINITE RECURSION
-- ============================================================================

-- Drop all existing policies on team_members
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'team_members'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON team_members', policy_record.policyname);
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Add missing columns for policies to work
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'team_owner_id') THEN
        ALTER TABLE team_members ADD COLUMN team_owner_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_members' AND column_name = 'member_user_id') THEN
        ALTER TABLE team_members ADD COLUMN member_user_id UUID;
    END IF;
END $$;

-- Update team_owner_id with user_id where null
UPDATE team_members SET team_owner_id = user_id WHERE team_owner_id IS NULL AND user_id IS NOT NULL;

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Create non-recursive policies
CREATE POLICY "team_members_select_v2" ON team_members
    FOR SELECT USING (
        auth.uid() = user_id 
        OR auth.uid() = member_user_id
        OR auth.uid() = team_owner_id
        OR auth.uid() IS NOT NULL  -- Allow authenticated users to view team members
    );

CREATE POLICY "team_members_insert_v2" ON team_members
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = team_owner_id);

CREATE POLICY "team_members_update_v2" ON team_members
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = team_owner_id);

CREATE POLICY "team_members_delete_v2" ON team_members
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() = team_owner_id);

-- ============================================================================
-- PART 2: CREATE MISSING TABLES
-- ============================================================================

-- reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    reminder_time TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);

-- scheduling_preferences table
CREATE TABLE IF NOT EXISTS scheduling_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    timezone TEXT DEFAULT 'UTC',
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,
    available_days JSONB DEFAULT '["monday","tuesday","wednesday","thursday","friday"]'::jsonb,
    buffer_time INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduling_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own scheduling preferences" ON scheduling_preferences;
CREATE POLICY "Users can manage own scheduling preferences" ON scheduling_preferences FOR ALL USING (auth.uid() = user_id);

-- conversion_funnels table
CREATE TABLE IF NOT EXISTS conversion_funnels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    stages JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversion_funnels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own conversion funnels" ON conversion_funnels;
CREATE POLICY "Users can manage own conversion funnels" ON conversion_funnels FOR ALL USING (auth.uid() = user_id);

-- conversion_goals table
CREATE TABLE IF NOT EXISTS conversion_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_value DECIMAL(12,2),
    current_value DECIMAL(12,2) DEFAULT 0,
    deadline DATE,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE conversion_goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own conversion goals" ON conversion_goals;
CREATE POLICY "Users can manage own conversion goals" ON conversion_goals FOR ALL USING (auth.uid() = user_id);

-- cohorts table
CREATE TABLE IF NOT EXISTS cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cohort_date DATE NOT NULL,
    size INTEGER DEFAULT 0,
    metrics JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own cohorts" ON cohorts;
CREATE POLICY "Users can manage own cohorts" ON cohorts FOR ALL USING (auth.uid() = user_id);

-- growth_experiments table
CREATE TABLE IF NOT EXISTS growth_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    hypothesis TEXT,
    status TEXT DEFAULT 'draft',
    start_date DATE,
    end_date DATE,
    results JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE growth_experiments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own growth experiments" ON growth_experiments;
CREATE POLICY "Users can manage own growth experiments" ON growth_experiments FOR ALL USING (auth.uid() = user_id);

-- certification_courses table
CREATE TABLE IF NOT EXISTS certification_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    provider TEXT,
    duration_hours INTEGER,
    difficulty TEXT DEFAULT 'intermediate',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE certification_courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view certification courses" ON certification_courses;
CREATE POLICY "Anyone can view certification courses" ON certification_courses FOR SELECT USING (true);

-- organization_members table
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their organization memberships" ON organization_members;
CREATE POLICY "Users can view their organization memberships" ON organization_members FOR SELECT USING (auth.uid() = user_id);

-- coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);

-- thread_participants table
CREATE TABLE IF NOT EXISTS thread_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their thread participations" ON thread_participants;
CREATE POLICY "Users can view their thread participations" ON thread_participants FOR SELECT USING (auth.uid() = user_id);

-- mentions table
CREATE TABLE IF NOT EXISTS mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_id UUID NOT NULL,
    content_type TEXT NOT NULL,
    mentioned_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    mentioner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content_preview TEXT,
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE mentions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their mentions" ON mentions;
CREATE POLICY "Users can view their mentions" ON mentions FOR SELECT USING (auth.uid() = mentioned_user_id);

-- phone_numbers table
CREATE TABLE IF NOT EXISTS phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    number TEXT NOT NULL,
    type TEXT DEFAULT 'mobile',
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE phone_numbers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own phone numbers" ON phone_numbers;
CREATE POLICY "Users can manage own phone numbers" ON phone_numbers FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_owner_id ON team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduling_preferences_user_id ON scheduling_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_funnels_user_id ON conversion_funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_goals_user_id ON conversion_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_cohorts_user_id ON cohorts(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_experiments_user_id ON growth_experiments(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_mentions_mentioned_user_id ON mentions(mentioned_user_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_user_id ON phone_numbers(user_id);

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Migration complete! Fixed RLS recursion and created missing tables.' AS status;
