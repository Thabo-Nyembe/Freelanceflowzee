-- ============================================================================
-- FINAL COLUMN FIXES
-- ============================================================================

-- Add scheduled_at to notification_queue (used by useNotificationQueue)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notification_queue' AND column_name = 'scheduled_at') THEN
        ALTER TABLE notification_queue ADD COLUMN scheduled_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ensure all columns exist on ai_feature_usage
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'user_id') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN user_id UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'feature_name') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN feature_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'usage_count') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN usage_count INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'cost_usd') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN cost_usd DECIMAL(10,4) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_feature_usage' AND column_name = 'last_used_at') THEN
        ALTER TABLE ai_feature_usage ADD COLUMN last_used_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ensure reports table has proper structure
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'template_id') THEN
        ALTER TABLE reports ADD COLUMN template_id UUID;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled_at ON notification_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_ai_feature_usage_user_id ON ai_feature_usage(user_id);

SELECT 'Final column fixes complete!' AS status;
