-- =====================================================
-- KAZI Document Management System
-- Migration: 20251211000007_document_management_system.sql
--
-- Comprehensive document management with:
-- - File storage and organization
-- - Folder hierarchy
-- - Version control
-- - Sharing and permissions
-- - Activity tracking
-- - Full-text search support
-- =====================================================

-- =====================================================
-- FOLDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Folder info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color for folder icon
    icon VARCHAR(50), -- Icon identifier

    -- Hierarchy
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    path TEXT NOT NULL DEFAULT '/', -- Full path like /Documents/Projects/
    depth INTEGER DEFAULT 0,

    -- Organization
    is_starred BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false, -- For system folders like Trash, Shared

    -- Sharing
    is_shared BOOLEAN DEFAULT false,
    shared_with JSONB DEFAULT '[]', -- Array of user IDs or emails
    share_link UUID,
    share_link_expires_at TIMESTAMPTZ,
    share_permissions TEXT DEFAULT 'view', -- view, comment, edit

    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',

    -- Stats
    file_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_folder_name_per_parent UNIQUE(user_id, parent_id, name)
);

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- File info
    name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- File details
    file_type VARCHAR(100) NOT NULL, -- MIME type
    file_extension VARCHAR(20),
    file_size BIGINT NOT NULL,

    -- Storage
    storage_provider TEXT DEFAULT 'supabase', -- supabase, wasabi, s3, google, dropbox
    storage_path TEXT NOT NULL,
    storage_bucket TEXT,
    storage_url TEXT,
    thumbnail_url TEXT,
    preview_url TEXT,

    -- Version control
    version INTEGER DEFAULT 1,
    latest_version_id UUID, -- Self-reference to latest version
    is_latest BOOLEAN DEFAULT true,

    -- Organization
    is_starred BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_trashed BOOLEAN DEFAULT false,
    trashed_at TIMESTAMPTZ,

    -- Sharing
    is_shared BOOLEAN DEFAULT false,
    share_link UUID UNIQUE,
    share_link_expires_at TIMESTAMPTZ,
    share_password_hash TEXT,
    share_download_limit INTEGER,
    share_download_count INTEGER DEFAULT 0,
    share_permissions TEXT DEFAULT 'view',

    -- Access control
    visibility TEXT DEFAULT 'private', -- private, team, public
    allowed_users UUID[] DEFAULT '{}',
    allowed_teams UUID[] DEFAULT '{}',

    -- Content
    content_hash VARCHAR(64), -- SHA-256 hash for deduplication
    content_text TEXT, -- Extracted text for search

    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',

    -- AI/Analysis
    ai_summary TEXT,
    ai_tags TEXT[] DEFAULT '{}',
    ai_extracted_data JSONB DEFAULT '{}',

    -- Related entities
    project_id UUID,
    client_id UUID,
    invoice_id UUID,

    -- Stats
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ
);

-- =====================================================
-- DOCUMENT VERSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Version info
    version_number INTEGER NOT NULL,
    version_label VARCHAR(100), -- e.g., "Final Draft", "Client Review"
    change_summary TEXT,

    -- File details
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    content_hash VARCHAR(64),

    -- Diff info
    changes_from_previous JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_version_per_document UNIQUE(document_id, version_number)
);

-- =====================================================
-- DOCUMENT SHARES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,

    -- Share info
    shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shared_with_email TEXT,
    shared_with_team_id UUID,

    -- Permissions
    permission TEXT NOT NULL DEFAULT 'view', -- view, comment, edit, admin
    can_download BOOLEAN DEFAULT true,
    can_reshare BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,

    -- Expiration
    expires_at TIMESTAMPTZ,

    -- Status
    status TEXT DEFAULT 'active', -- active, revoked, expired
    accepted_at TIMESTAMPTZ,

    -- Notification
    notification_sent BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT share_has_target CHECK (
        document_id IS NOT NULL OR folder_id IS NOT NULL
    ),
    CONSTRAINT share_has_recipient CHECK (
        shared_with_user_id IS NOT NULL OR
        shared_with_email IS NOT NULL OR
        shared_with_team_id IS NOT NULL
    )
);

-- =====================================================
-- DOCUMENT COMMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES document_comments(id) ON DELETE CASCADE,

    -- Comment content
    content TEXT NOT NULL,

    -- Position (for inline comments)
    page_number INTEGER,
    position_x FLOAT,
    position_y FLOAT,
    selection_start INTEGER,
    selection_end INTEGER,
    highlighted_text TEXT,

    -- Status
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,

    -- Reactions
    reactions JSONB DEFAULT '{}',

    -- Mentions
    mentions UUID[] DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT ACTIVITY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Activity info
    action TEXT NOT NULL, -- created, viewed, downloaded, edited, shared, commented, moved, renamed, deleted, restored
    action_details JSONB DEFAULT '{}',

    -- Context
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system templates

    -- Template info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category TEXT, -- contract, invoice, proposal, report, etc.

    -- File
    file_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    thumbnail_url TEXT,

    -- Variables
    variables JSONB DEFAULT '[]', -- [{name, type, default, required}]

    -- Settings
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,

    -- Stats
    use_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DOCUMENT REQUESTS TABLE
-- For requesting files from clients
-- =====================================================
CREATE TABLE IF NOT EXISTS document_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Request info
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Recipient
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    client_id UUID,

    -- Request details
    requested_files JSONB DEFAULT '[]', -- [{name, description, required, file_types}]
    folder_id UUID REFERENCES folders(id), -- Where to store uploaded files

    -- Access
    access_token UUID UNIQUE DEFAULT gen_random_uuid(),
    password_hash TEXT,

    -- Expiration
    expires_at TIMESTAMPTZ,
    max_file_size BIGINT DEFAULT 104857600, -- 100MB default
    max_files INTEGER DEFAULT 10,

    -- Status
    status TEXT DEFAULT 'pending', -- pending, partial, completed, expired, cancelled

    -- Stats
    files_received INTEGER DEFAULT 0,

    -- Notifications
    reminder_sent_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- =====================================================
-- STORAGE QUOTAS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS storage_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Quota settings
    total_quota_bytes BIGINT DEFAULT 5368709120, -- 5GB default
    used_bytes BIGINT DEFAULT 0,

    -- Per-type limits
    max_file_size_bytes BIGINT DEFAULT 104857600, -- 100MB default

    -- Plan info
    plan_type TEXT DEFAULT 'free', -- free, pro, business, enterprise

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_folders_path ON folders(path);
CREATE INDEX IF NOT EXISTS idx_folders_starred ON folders(user_id, is_starred) WHERE is_starred = true;

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_folder_id ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_starred ON documents(user_id, is_starred) WHERE is_starred = true;
CREATE INDEX IF NOT EXISTS idx_documents_shared ON documents(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_documents_share_link ON documents(share_link) WHERE share_link IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documents_search ON documents USING GIN(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content_text, '')));

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_id);

CREATE INDEX IF NOT EXISTS idx_document_shares_document ON document_shares(document_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_folder ON document_shares(folder_id);
CREATE INDEX IF NOT EXISTS idx_document_shares_user ON document_shares(shared_with_user_id);

CREATE INDEX IF NOT EXISTS idx_document_comments_document ON document_comments(document_id);
CREATE INDEX IF NOT EXISTS idx_document_comments_user ON document_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_document_activity_document ON document_activity(document_id);
CREATE INDEX IF NOT EXISTS idx_document_activity_user ON document_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_document_activity_created ON document_activity(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_requests_user ON document_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_token ON document_requests(access_token);

-- =====================================================
-- ENABLE RLS
-- =====================================================
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_quotas ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Folders
DROP POLICY IF EXISTS "folders_select" ON folders;
CREATE POLICY "folders_select" ON folders FOR SELECT USING (
    auth.uid() = user_id OR is_shared = true
);

DROP POLICY IF EXISTS "folders_insert" ON folders;
CREATE POLICY "folders_insert" ON folders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "folders_update" ON folders;
CREATE POLICY "folders_update" ON folders FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "folders_delete" ON folders;
CREATE POLICY "folders_delete" ON folders FOR DELETE USING (auth.uid() = user_id);

-- Documents
DROP POLICY IF EXISTS "documents_select" ON documents;
CREATE POLICY "documents_select" ON documents FOR SELECT USING (
    auth.uid() = user_id OR
    is_shared = true OR
    auth.uid() = ANY(allowed_users) OR
    visibility = 'public'
);

DROP POLICY IF EXISTS "documents_insert" ON documents;
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "documents_update" ON documents;
CREATE POLICY "documents_update" ON documents FOR UPDATE USING (
    auth.uid() = user_id OR auth.uid() = ANY(allowed_users)
);

DROP POLICY IF EXISTS "documents_delete" ON documents;
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (auth.uid() = user_id);

-- Document versions
DROP POLICY IF EXISTS "versions_select" ON document_versions;
CREATE POLICY "versions_select" ON document_versions FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND (user_id = auth.uid() OR is_shared = true))
);

DROP POLICY IF EXISTS "versions_insert" ON document_versions;
CREATE POLICY "versions_insert" ON document_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document shares
DROP POLICY IF EXISTS "shares_select" ON document_shares;
CREATE POLICY "shares_select" ON document_shares FOR SELECT USING (
    auth.uid() = shared_by OR auth.uid() = shared_with_user_id
);

DROP POLICY IF EXISTS "shares_all" ON document_shares;
CREATE POLICY "shares_all" ON document_shares FOR ALL USING (auth.uid() = shared_by);

-- Document comments
DROP POLICY IF EXISTS "comments_select" ON document_comments;
CREATE POLICY "comments_select" ON document_comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND (user_id = auth.uid() OR is_shared = true))
);

DROP POLICY IF EXISTS "comments_insert" ON document_comments;
CREATE POLICY "comments_insert" ON document_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_update" ON document_comments;
CREATE POLICY "comments_update" ON document_comments FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete" ON document_comments;
CREATE POLICY "comments_delete" ON document_comments FOR DELETE USING (auth.uid() = user_id);

-- Document activity
DROP POLICY IF EXISTS "activity_select" ON document_activity;
CREATE POLICY "activity_select" ON document_activity FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM documents WHERE id = document_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "activity_insert" ON document_activity;
CREATE POLICY "activity_insert" ON document_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document templates
DROP POLICY IF EXISTS "templates_select" ON document_templates;
CREATE POLICY "templates_select" ON document_templates FOR SELECT USING (
    user_id IS NULL OR user_id = auth.uid() OR is_public = true
);

DROP POLICY IF EXISTS "templates_all" ON document_templates;
CREATE POLICY "templates_all" ON document_templates FOR ALL USING (auth.uid() = user_id);

-- Document requests
DROP POLICY IF EXISTS "requests_all" ON document_requests;
CREATE POLICY "requests_all" ON document_requests FOR ALL USING (auth.uid() = user_id);

-- Storage quotas
DROP POLICY IF EXISTS "quotas_all" ON storage_quotas;
CREATE POLICY "quotas_all" ON storage_quotas FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update folder stats when documents change
CREATE OR REPLACE FUNCTION update_folder_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE folders
        SET file_count = file_count + 1,
            total_size_bytes = total_size_bytes + NEW.file_size,
            updated_at = NOW()
        WHERE id = NEW.folder_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE folders
        SET file_count = file_count - 1,
            total_size_bytes = total_size_bytes - OLD.file_size,
            updated_at = NOW()
        WHERE id = OLD.folder_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
        -- Moving between folders
        UPDATE folders
        SET file_count = file_count - 1,
            total_size_bytes = total_size_bytes - OLD.file_size,
            updated_at = NOW()
        WHERE id = OLD.folder_id;

        UPDATE folders
        SET file_count = file_count + 1,
            total_size_bytes = total_size_bytes + NEW.file_size,
            updated_at = NOW()
        WHERE id = NEW.folder_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_folder_stats ON documents;
CREATE TRIGGER documents_folder_stats
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_folder_stats();

-- Update storage quota
CREATE OR REPLACE FUNCTION update_storage_quota()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO storage_quotas (user_id, used_bytes)
        VALUES (NEW.user_id, NEW.file_size)
        ON CONFLICT (user_id) DO UPDATE
        SET used_bytes = storage_quotas.used_bytes + NEW.file_size,
            updated_at = NOW();
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE storage_quotas
        SET used_bytes = GREATEST(0, used_bytes - OLD.file_size),
            updated_at = NOW()
        WHERE user_id = OLD.user_id;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS documents_storage_quota ON documents;
CREATE TRIGGER documents_storage_quota
    AFTER INSERT OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_storage_quota();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS folders_updated_at ON folders;
CREATE TRIGGER folders_updated_at BEFORE UPDATE ON folders
    FOR EACH ROW EXECUTE FUNCTION update_document_updated_at();

DROP TRIGGER IF EXISTS documents_updated_at ON documents;
CREATE TRIGGER documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_document_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get folder path
CREATE OR REPLACE FUNCTION get_folder_path(p_folder_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_path TEXT := '';
    v_current_id UUID := p_folder_id;
    v_folder RECORD;
BEGIN
    WHILE v_current_id IS NOT NULL LOOP
        SELECT id, name, parent_id INTO v_folder
        FROM folders WHERE id = v_current_id;

        IF v_folder.id IS NULL THEN EXIT; END IF;

        v_path := '/' || v_folder.name || v_path;
        v_current_id := v_folder.parent_id;
    END LOOP;

    RETURN COALESCE(NULLIF(v_path, ''), '/');
END;
$$ LANGUAGE plpgsql;

-- Search documents
CREATE OR REPLACE FUNCTION search_documents(
    p_user_id UUID,
    p_query TEXT,
    p_file_types TEXT[] DEFAULT NULL,
    p_folder_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    name VARCHAR(255),
    file_type VARCHAR(100),
    file_size BIGINT,
    folder_id UUID,
    created_at TIMESTAMPTZ,
    relevance FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.name,
        d.file_type,
        d.file_size,
        d.folder_id,
        d.created_at,
        ts_rank(
            to_tsvector('english', coalesce(d.name, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce(d.content_text, '')),
            plainto_tsquery('english', p_query)
        ) as relevance
    FROM documents d
    WHERE d.user_id = p_user_id
    AND d.is_trashed = false
    AND (p_file_types IS NULL OR d.file_type = ANY(p_file_types))
    AND (p_folder_id IS NULL OR d.folder_id = p_folder_id)
    AND (
        to_tsvector('english', coalesce(d.name, '') || ' ' || coalesce(d.description, '') || ' ' || coalesce(d.content_text, ''))
        @@ plainto_tsquery('english', p_query)
        OR d.name ILIKE '%' || p_query || '%'
    )
    ORDER BY relevance DESC, d.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get storage stats
CREATE OR REPLACE FUNCTION get_storage_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_files', COUNT(*),
        'total_size_bytes', COALESCE(SUM(file_size), 0),
        'by_type', (
            SELECT jsonb_object_agg(file_type, cnt)
            FROM (
                SELECT file_type, COUNT(*) as cnt
                FROM documents
                WHERE user_id = p_user_id AND is_trashed = false
                GROUP BY file_type
            ) sub
        ),
        'quota', (
            SELECT jsonb_build_object(
                'total_bytes', total_quota_bytes,
                'used_bytes', used_bytes,
                'available_bytes', total_quota_bytes - used_bytes,
                'usage_percent', ROUND((used_bytes::FLOAT / total_quota_bytes) * 100, 2)
            )
            FROM storage_quotas WHERE user_id = p_user_id
        )
    ) INTO v_result
    FROM documents
    WHERE user_id = p_user_id AND is_trashed = false;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON folders TO authenticated;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON document_versions TO authenticated;
GRANT ALL ON document_shares TO authenticated;
GRANT ALL ON document_comments TO authenticated;
GRANT ALL ON document_activity TO authenticated;
GRANT ALL ON document_templates TO authenticated;
GRANT ALL ON document_requests TO authenticated;
GRANT ALL ON storage_quotas TO authenticated;

GRANT ALL ON folders TO service_role;
GRANT ALL ON documents TO service_role;
GRANT ALL ON document_versions TO service_role;
GRANT ALL ON document_shares TO service_role;
GRANT ALL ON document_comments TO service_role;
GRANT ALL ON document_activity TO service_role;
GRANT ALL ON document_templates TO service_role;
GRANT ALL ON document_requests TO service_role;
GRANT ALL ON storage_quotas TO service_role;
