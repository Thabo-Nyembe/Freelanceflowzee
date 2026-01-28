-- ============================================================================
-- FINAL FIXES v5 - Remaining column and relation issues
-- ============================================================================

-- ============================================================================
-- FIX PROJECTS - Check what columns exist and add missing ones
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'title') THEN
        ALTER TABLE projects ADD COLUMN title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'name') THEN
        ALTER TABLE projects ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'deleted_at') THEN
        ALTER TABLE projects ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'progress') THEN
        ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- ============================================================================
-- FIX AI_FEATURE_USAGE - Add user_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'user_id') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX DIGITAL_ASSETS - Add missing columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'digital_assets' AND column_name = 'deleted_at') THEN
        ALTER TABLE digital_assets ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
END $$;

-- ============================================================================
-- FIX ANALYTICS_REVENUE - Add user_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_revenue' AND column_name = 'user_id') THEN
        ALTER TABLE analytics_revenue ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX NOTIFICATION_QUEUE - Add user_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_queue' AND column_name = 'user_id') THEN
        ALTER TABLE notification_queue ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX TEAM_MEETINGS - Add team_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'team_meetings' AND column_name = 'team_id') THEN
        ALTER TABLE team_meetings ADD COLUMN team_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX ORGANIZATION_MEMBERS - Add all needed columns
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organization_members' AND column_name = 'organization_id') THEN
        ALTER TABLE organization_members ADD COLUMN organization_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX MENTIONS TABLE - Ensure proper structure
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentions' AND column_name = 'mentioned_user_id') THEN
        ALTER TABLE mentions ADD COLUMN mentioned_user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX PHONE_NUMBERS - Add user_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phone_numbers' AND column_name = 'user_id') THEN
        ALTER TABLE phone_numbers ADD COLUMN user_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX THREAD_PARTICIPANTS - Add user_id if missing
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thread_participants' AND column_name = 'user_id') THEN
        ALTER TABLE thread_participants ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'thread_participants' AND column_name = 'thread_id') THEN
        ALTER TABLE thread_participants ADD COLUMN thread_id UUID;
    END IF;
END $$;

-- ============================================================================
-- FIX FILES - Add all needed columns
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
-- FIX REMINDERS - Add foreign key support
-- ============================================================================
-- Add reminder_id to reminder_recipients FK
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reminder_recipients') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reminder_recipients' AND column_name = 'reminder_id') THEN
            ALTER TABLE reminder_recipients ADD COLUMN reminder_id UUID;
        END IF;
    END IF;
END $$;

-- ============================================================================
-- FIX REPORTS - Add template_id for relations
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'template_id') THEN
        ALTER TABLE reports ADD COLUMN template_id UUID;
    END IF;
END $$;

-- ============================================================================
-- SEED EMPTY TABLES WITH DEFAULT DATA (fixes 406 errors)
-- ============================================================================

-- Only insert if table is empty
INSERT INTO growth_playbooks (user_id, name, description)
SELECT NULL, 'Default Playbook', 'Getting started guide'
WHERE NOT EXISTS (SELECT 1 FROM growth_playbooks LIMIT 1);

INSERT INTO user_metrics_aggregate (user_id, metric_type, metric_value)
SELECT NULL, 'default', 0
WHERE NOT EXISTS (SELECT 1 FROM user_metrics_aggregate LIMIT 1);

INSERT INTO analytics_platform_metrics (platform, metric_name, metric_value)
SELECT 'default', 'visits', 0
WHERE NOT EXISTS (SELECT 1 FROM analytics_platform_metrics LIMIT 1);

SELECT 'Final fixes v5 complete!' AS status;
