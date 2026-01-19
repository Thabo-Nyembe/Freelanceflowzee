-- FreeFlow A+++ Implementation
-- Document Suggestions - Track Changes/Suggestions Mode
-- Migration: 20260119000010_document_suggestions.sql

-- =====================================================
-- Document Suggestions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS document_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Suggestion type
  suggestion_type VARCHAR(20) NOT NULL CHECK (suggestion_type IN ('insertion', 'deletion', 'replacement', 'formatting')),

  -- Content
  original_content TEXT, -- For deletion/replacement - the original text
  suggested_content TEXT, -- For insertion/replacement - the new text

  -- Position in document
  position_from INTEGER NOT NULL,
  position_to INTEGER NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Suggestion Comments Table
-- =====================================================

CREATE TABLE IF NOT EXISTS suggestion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES document_suggestions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  content TEXT NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Suggestion Reactions Table
-- =====================================================

CREATE TABLE IF NOT EXISTS suggestion_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES document_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  emoji VARCHAR(10) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(suggestion_id, user_id, emoji)
);

-- =====================================================
-- Document Versions Table (for version history)
-- =====================================================

CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,

  -- Author info
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Content snapshot
  content JSONB NOT NULL, -- Full document content at this version
  content_text TEXT, -- Plain text for full-text search

  -- Diff from previous version
  diff_from_previous JSONB, -- JSON diff operations

  -- Metadata
  title VARCHAR(255), -- Version title/description
  is_named_version BOOLEAN DEFAULT false, -- User named this version
  is_autosave BOOLEAN DEFAULT false,
  file_size INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(document_id, version_number)
);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_document_suggestions_document_id ON document_suggestions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_suggestions_author_id ON document_suggestions(author_id);
CREATE INDEX IF NOT EXISTS idx_document_suggestions_status ON document_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_document_suggestions_created_at ON document_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_suggestion_comments_suggestion_id ON suggestion_comments(suggestion_id);
CREATE INDEX IF NOT EXISTS idx_suggestion_comments_author_id ON suggestion_comments(author_id);

CREATE INDEX IF NOT EXISTS idx_suggestion_reactions_suggestion_id ON suggestion_reactions(suggestion_id);

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_author_id ON document_versions(author_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_is_named ON document_versions(document_id, is_named_version) WHERE is_named_version = true;

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE document_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Document Suggestions Policies
CREATE POLICY "Users can view suggestions on accessible documents"
  ON document_suggestions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_suggestions.document_id
      AND (documents.owner_id = auth.uid() OR documents.is_public = true)
    )
  );

CREATE POLICY "Authenticated users can create suggestions on accessible documents"
  ON document_suggestions FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_suggestions.document_id
      AND (documents.owner_id = auth.uid() OR documents.is_public = true)
    )
  );

CREATE POLICY "Document owners can update suggestions"
  ON document_suggestions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_suggestions.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete own suggestions"
  ON document_suggestions FOR DELETE
  USING (auth.uid() = author_id);

-- Suggestion Comments Policies
CREATE POLICY "Users can view comments on accessible suggestions"
  ON suggestion_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM document_suggestions ds
      JOIN documents d ON d.id = ds.document_id
      WHERE ds.id = suggestion_comments.suggestion_id
      AND (d.owner_id = auth.uid() OR d.is_public = true)
    )
  );

CREATE POLICY "Authenticated users can add comments"
  ON suggestion_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON suggestion_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON suggestion_comments FOR DELETE
  USING (auth.uid() = author_id);

-- Suggestion Reactions Policies
CREATE POLICY "Users can view reactions"
  ON suggestion_reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add reactions"
  ON suggestion_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
  ON suggestion_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Document Versions Policies
CREATE POLICY "Users can view versions of accessible documents"
  ON document_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND (documents.owner_id = auth.uid() OR documents.is_public = true)
    )
  );

CREATE POLICY "Document owners can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can update versions"
  ON document_versions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND documents.owner_id = auth.uid()
    )
  );

CREATE POLICY "Document owners can delete versions"
  ON document_versions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_versions.document_id
      AND documents.owner_id = auth.uid()
    )
  );

-- =====================================================
-- Functions
-- =====================================================

-- Function to auto-create version on document save
CREATE OR REPLACE FUNCTION create_document_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1
  INTO next_version
  FROM document_versions
  WHERE document_id = NEW.id;

  -- Create version record
  INSERT INTO document_versions (
    document_id,
    version_number,
    author_id,
    content,
    content_text,
    is_autosave
  ) VALUES (
    NEW.id,
    next_version,
    NEW.owner_id,
    NEW.content,
    NEW.content::TEXT,
    true
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update suggestion timestamps
CREATE OR REPLACE FUNCTION update_suggestion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_document_suggestions_timestamp
  BEFORE UPDATE ON document_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_suggestion_timestamp();

CREATE TRIGGER update_suggestion_comments_timestamp
  BEFORE UPDATE ON suggestion_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_suggestion_timestamp();

-- =====================================================
-- CSS for track changes (stored for reference)
-- =====================================================

COMMENT ON TABLE document_suggestions IS 'CSS for suggestions:
.track-changes-insertion {
  background-color: rgba(34, 197, 94, 0.2);
  border-bottom: 2px solid #22c55e;
  text-decoration: underline;
  text-decoration-color: #22c55e;
}
.track-changes-deletion {
  background-color: rgba(239, 68, 68, 0.2);
  border-bottom: 2px solid #ef4444;
  text-decoration: line-through;
  text-decoration-color: #ef4444;
}
.track-changes-replacement {
  background-color: rgba(59, 130, 246, 0.2);
  border-bottom: 2px solid #3b82f6;
}';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Document suggestions migration completed successfully';
END $$;
