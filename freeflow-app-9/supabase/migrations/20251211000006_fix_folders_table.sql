-- =====================================================
-- FIX: Add missing columns to folders table
-- Run this BEFORE the document management migration
-- =====================================================

-- Add missing columns to folders table if it exists
DO $$
BEGIN
    -- Add is_starred if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'is_starred'
    ) THEN
        ALTER TABLE folders ADD COLUMN is_starred BOOLEAN DEFAULT false;
    END IF;

    -- Add is_archived if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'is_archived'
    ) THEN
        ALTER TABLE folders ADD COLUMN is_archived BOOLEAN DEFAULT false;
    END IF;

    -- Add is_system if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'is_system'
    ) THEN
        ALTER TABLE folders ADD COLUMN is_system BOOLEAN DEFAULT false;
    END IF;

    -- Add description if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'description'
    ) THEN
        ALTER TABLE folders ADD COLUMN description TEXT;
    END IF;

    -- Add color if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'color'
    ) THEN
        ALTER TABLE folders ADD COLUMN color VARCHAR(7);
    END IF;

    -- Add icon if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'icon'
    ) THEN
        ALTER TABLE folders ADD COLUMN icon VARCHAR(50);
    END IF;

    -- Add depth if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'depth'
    ) THEN
        ALTER TABLE folders ADD COLUMN depth INTEGER DEFAULT 0;
    END IF;

    -- Add is_shared if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'is_shared'
    ) THEN
        ALTER TABLE folders ADD COLUMN is_shared BOOLEAN DEFAULT false;
    END IF;

    -- Add shared_with if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'shared_with'
    ) THEN
        ALTER TABLE folders ADD COLUMN shared_with JSONB DEFAULT '[]';
    END IF;

    -- Add share_link if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'share_link'
    ) THEN
        ALTER TABLE folders ADD COLUMN share_link UUID;
    END IF;

    -- Add share_link_expires_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'share_link_expires_at'
    ) THEN
        ALTER TABLE folders ADD COLUMN share_link_expires_at TIMESTAMPTZ;
    END IF;

    -- Add share_permissions if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'share_permissions'
    ) THEN
        ALTER TABLE folders ADD COLUMN share_permissions TEXT DEFAULT 'view';
    END IF;

    -- Add metadata if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'metadata'
    ) THEN
        ALTER TABLE folders ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;

    -- Add tags if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'tags'
    ) THEN
        ALTER TABLE folders ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- Add file_count if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'file_count'
    ) THEN
        ALTER TABLE folders ADD COLUMN file_count INTEGER DEFAULT 0;
    END IF;

    -- Add total_size_bytes if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'total_size_bytes'
    ) THEN
        ALTER TABLE folders ADD COLUMN total_size_bytes BIGINT DEFAULT 0;
    END IF;

    -- Add path if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'folders' AND column_name = 'path'
    ) THEN
        ALTER TABLE folders ADD COLUMN path TEXT DEFAULT '/';
    END IF;
END $$;

-- Also add missing columns to documents if needed
DO $$
BEGIN
    -- Add is_starred if missing
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'is_starred'
        ) THEN
            ALTER TABLE documents ADD COLUMN is_starred BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'is_archived'
        ) THEN
            ALTER TABLE documents ADD COLUMN is_archived BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'is_trashed'
        ) THEN
            ALTER TABLE documents ADD COLUMN is_trashed BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'trashed_at'
        ) THEN
            ALTER TABLE documents ADD COLUMN trashed_at TIMESTAMPTZ;
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'documents' AND column_name = 'content_text'
        ) THEN
            ALTER TABLE documents ADD COLUMN content_text TEXT;
        END IF;
    END IF;
END $$;

-- Now create the indexes for folders (documents indexes will be created in the main migration)
CREATE INDEX IF NOT EXISTS idx_folders_starred ON folders(user_id, is_starred) WHERE is_starred = true;

-- Only create documents index if the table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents') THEN
        EXECUTE 'CREATE INDEX IF NOT EXISTS idx_documents_starred ON documents(user_id, is_starred) WHERE is_starred = true';
    END IF;
END $$;
