-- ============================================
-- SUPABASE 2025 UPDATE: pgvector Extension & Semantic Search
-- Migration: 20251216000001_pgvector_semantic_search.sql
-- Features: Vector embeddings for AI-powered search
-- ============================================

-- Enable pgvector extension for vector operations
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- DOCUMENT EMBEDDINGS TABLE
-- Stores vector embeddings for files and documents
-- ============================================
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source reference
    source_type TEXT NOT NULL CHECK (source_type IN ('file', 'document', 'message', 'project', 'task', 'note')),
    source_id UUID NOT NULL,

    -- Content metadata
    content_hash TEXT NOT NULL, -- SHA256 hash to detect changes
    chunk_index INTEGER DEFAULT 0, -- For long documents split into chunks
    chunk_text TEXT, -- The text that was embedded

    -- Vector embedding (1536 dimensions for OpenAI ada-002, 3072 for text-embedding-3-large)
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    token_count INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure unique embedding per source chunk
    UNIQUE(source_type, source_id, chunk_index)
);

-- ============================================
-- CHAT MESSAGE EMBEDDINGS
-- For semantic search across conversations
-- ============================================
CREATE TABLE IF NOT EXISTS message_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    message_id UUID NOT NULL,
    chat_id UUID,

    -- Embedding
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Search optimization
    content_preview TEXT, -- First 500 chars for display

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(message_id)
);

-- ============================================
-- PROJECT EMBEDDINGS
-- For finding similar projects
-- ============================================
CREATE TABLE IF NOT EXISTS project_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL,

    -- Combined embedding of title + description
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- Metadata for filtering
    project_type TEXT,
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(project_id)
);

-- ============================================
-- AI CONTENT EMBEDDINGS
-- For AI-generated content similarity
-- ============================================
CREATE TABLE IF NOT EXISTS ai_content_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Source
    content_type TEXT NOT NULL CHECK (content_type IN ('ai_design', 'ai_text', 'ai_code', 'ai_image', 'ai_video')),
    content_id UUID NOT NULL,

    -- Embedding
    embedding vector(1536),
    embedding_model TEXT DEFAULT 'text-embedding-3-small',

    -- For recommendation engine
    style_tags TEXT[],
    prompt_embedding vector(1536), -- Embedding of the original prompt

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(content_type, content_id)
);

-- ============================================
-- SEMANTIC SEARCH QUERIES LOG
-- Track search patterns for optimization
-- ============================================
CREATE TABLE IF NOT EXISTS semantic_search_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Query details
    query_text TEXT NOT NULL,
    query_embedding vector(1536),

    -- Search parameters
    search_type TEXT NOT NULL, -- 'documents', 'messages', 'projects', 'ai_content', 'global'
    filters JSONB DEFAULT '{}',
    limit_count INTEGER DEFAULT 10,

    -- Results
    result_count INTEGER,
    result_ids UUID[],

    -- Performance
    search_duration_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VECTOR SIMILARITY INDEXES
-- HNSW indexes for fast approximate nearest neighbor search
-- ============================================

-- Document embeddings index
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector
ON document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Message embeddings index
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector
ON message_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Project embeddings index
CREATE INDEX IF NOT EXISTS idx_project_embeddings_vector
ON project_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- AI content embeddings index
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_vector
ON ai_content_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- ============================================
-- HELPER INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_document_embeddings_user ON document_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_source ON document_embeddings(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_user ON message_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_message_embeddings_chat ON message_embeddings(chat_id);
CREATE INDEX IF NOT EXISTS idx_project_embeddings_user ON project_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_user ON ai_content_embeddings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_content_embeddings_type ON ai_content_embeddings(content_type);

-- ============================================
-- SEMANTIC SEARCH FUNCTIONS
-- ============================================

-- Search documents by vector similarity
CREATE OR REPLACE FUNCTION vector_search_documents(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filter_user_id UUID DEFAULT NULL,
    filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    source_type TEXT,
    source_id UUID,
    chunk_text TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        de.id,
        de.source_type,
        de.source_id,
        de.chunk_text,
        1 - (de.embedding <=> query_embedding) AS similarity,
        de.metadata
    FROM document_embeddings de
    WHERE
        (filter_user_id IS NULL OR de.user_id = filter_user_id)
        AND (filter_source_type IS NULL OR de.source_type = filter_source_type)
        AND 1 - (de.embedding <=> query_embedding) > match_threshold
    ORDER BY de.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Search messages by vector similarity
CREATE OR REPLACE FUNCTION vector_search_messages(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    filter_user_id UUID DEFAULT NULL,
    filter_chat_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    message_id UUID,
    chat_id UUID,
    content_preview TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        me.id,
        me.message_id,
        me.chat_id,
        me.content_preview,
        1 - (me.embedding <=> query_embedding) AS similarity
    FROM message_embeddings me
    WHERE
        (filter_user_id IS NULL OR me.user_id = filter_user_id)
        AND (filter_chat_id IS NULL OR me.chat_id = filter_chat_id)
        AND 1 - (me.embedding <=> query_embedding) > match_threshold
    ORDER BY me.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Find similar projects by vector
CREATE OR REPLACE FUNCTION vector_find_similar_projects(
    query_embedding vector(1536),
    match_count INT DEFAULT 5,
    filter_user_id UUID DEFAULT NULL,
    exclude_project_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    project_id UUID,
    similarity FLOAT,
    project_type TEXT,
    tags TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        pe.id,
        pe.project_id,
        1 - (pe.embedding <=> query_embedding) AS similarity,
        pe.project_type,
        pe.tags
    FROM project_embeddings pe
    WHERE
        (filter_user_id IS NULL OR pe.user_id = filter_user_id)
        AND (exclude_project_id IS NULL OR pe.project_id != exclude_project_id)
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Global vector semantic search across all content types
CREATE OR REPLACE FUNCTION vector_global_semantic_search(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 20,
    filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    content_type TEXT,
    content_id UUID,
    preview TEXT,
    similarity FLOAT,
    metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    (
        -- Search documents
        SELECT
            'document'::TEXT AS content_type,
            de.source_id AS content_id,
            LEFT(de.chunk_text, 200) AS preview,
            1 - (de.embedding <=> query_embedding) AS similarity,
            de.metadata
        FROM document_embeddings de
        WHERE (filter_user_id IS NULL OR de.user_id = filter_user_id)
        AND 1 - (de.embedding <=> query_embedding) > match_threshold
    )
    UNION ALL
    (
        -- Search messages
        SELECT
            'message'::TEXT AS content_type,
            me.message_id AS content_id,
            me.content_preview AS preview,
            1 - (me.embedding <=> query_embedding) AS similarity,
            jsonb_build_object('chat_id', me.chat_id) AS metadata
        FROM message_embeddings me
        WHERE (filter_user_id IS NULL OR me.user_id = filter_user_id)
        AND 1 - (me.embedding <=> query_embedding) > match_threshold
    )
    UNION ALL
    (
        -- Search projects
        SELECT
            'project'::TEXT AS content_type,
            pe.project_id AS content_id,
            NULL AS preview,
            1 - (pe.embedding <=> query_embedding) AS similarity,
            jsonb_build_object('type', pe.project_type, 'tags', pe.tags) AS metadata
        FROM project_embeddings pe
        WHERE (filter_user_id IS NULL OR pe.user_id = filter_user_id)
        AND 1 - (pe.embedding <=> query_embedding) > match_threshold
    )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_content_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_search_log ENABLE ROW LEVEL SECURITY;

-- Document embeddings policies
CREATE POLICY "Users can view own document embeddings"
ON document_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document embeddings"
ON document_embeddings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document embeddings"
ON document_embeddings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document embeddings"
ON document_embeddings FOR DELETE
USING (auth.uid() = user_id);

-- Message embeddings policies
CREATE POLICY "Users can view own message embeddings"
ON message_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message embeddings"
ON message_embeddings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Project embeddings policies
CREATE POLICY "Users can view own project embeddings"
ON project_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own project embeddings"
ON project_embeddings FOR ALL
USING (auth.uid() = user_id);

-- AI content embeddings policies
CREATE POLICY "Users can view own AI content embeddings"
ON ai_content_embeddings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own AI content embeddings"
ON ai_content_embeddings FOR ALL
USING (auth.uid() = user_id);

-- Search log policies
CREATE POLICY "Users can view own search logs"
ON semantic_search_log FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search logs"
ON semantic_search_log FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE document_embeddings IS 'Vector embeddings for document semantic search - Supabase 2025 Vector Buckets integration';
COMMENT ON TABLE message_embeddings IS 'Vector embeddings for chat message search';
COMMENT ON TABLE project_embeddings IS 'Vector embeddings for project similarity matching';
COMMENT ON TABLE ai_content_embeddings IS 'Vector embeddings for AI-generated content recommendations';
COMMENT ON FUNCTION vector_search_documents IS 'Semantic search across documents using cosine similarity';
COMMENT ON FUNCTION vector_global_semantic_search IS 'Global semantic search across all content types';
