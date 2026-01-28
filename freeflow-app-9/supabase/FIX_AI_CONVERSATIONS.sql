-- ============================================================================
-- FIX: Add missing deleted_at column to ai_conversations
-- ============================================================================

-- Add deleted_at column to ai_conversations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_conversations' AND column_name = 'deleted_at') THEN
        ALTER TABLE ai_conversations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END $$;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_ai_conversations_deleted_at ON ai_conversations(deleted_at) WHERE deleted_at IS NULL;

SELECT 'ai_conversations deleted_at column added!' AS status;
