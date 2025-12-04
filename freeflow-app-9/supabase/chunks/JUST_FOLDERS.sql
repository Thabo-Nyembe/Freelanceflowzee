DROP TABLE IF EXISTS folders CASCADE;

CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,

  -- Folder details
  name VARCHAR(255) NOT NULL,
  path TEXT NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(50),

  -- Metadata
  file_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0,

  -- Permissions
  can_read BOOLEAN DEFAULT true,
  can_write BOOLEAN DEFAULT true,
  can_delete BOOLEAN DEFAULT true,
  can_share BOOLEAN DEFAULT true,

  -- Sharing
  is_shared BOOLEAN DEFAULT false,
  shared_with UUID[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT folders_name_check CHECK (char_length(name) >= 1 AND char_length(name) <= 255),
  CONSTRAINT folders_path_check CHECK (char_length(path) >= 1)
);

CREATE INDEX IF NOT EXISTS idx_folders_user ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent ON folders(parent_id);
