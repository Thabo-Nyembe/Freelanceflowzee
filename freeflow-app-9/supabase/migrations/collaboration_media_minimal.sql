-- Minimal Collaboration Media Schema
--
-- Media sharing for collaboration workspaces:
-- - Image/video/audio/document uploads
-- - Favorites and view tracking
-- - Media sharing with users
-- - Tags and metadata

-- Drop existing tables if they exist
DROP TABLE IF EXISTS collaboration_media_shares CASCADE;
DROP TABLE IF EXISTS collaboration_media CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;

-- ENUMs
CREATE TYPE media_type AS ENUM ('image', 'video', 'audio', 'document');

-- Collaboration Media (images, videos, files shared in workspaces)
CREATE TABLE collaboration_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Media details
  name TEXT NOT NULL,
  media_type media_type NOT NULL,

  -- File info
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT NOT NULL,

  -- Media-specific metadata
  duration_seconds INTEGER, -- For video/audio
  dimensions JSONB, -- For images/videos: {"width": 1920, "height": 1080}

  -- Engagement
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,

  -- Organization
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media Shares (share media with other users)
CREATE TABLE collaboration_media_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID NOT NULL REFERENCES collaboration_media(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one share per user per media
  UNIQUE(media_id, shared_with_user_id)
);

-- Indexes for Collaboration Media
CREATE INDEX IF NOT EXISTS idx_collaboration_media_user_id ON collaboration_media(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_type ON collaboration_media(media_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_is_favorite ON collaboration_media(is_favorite);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_created_at ON collaboration_media(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_tags ON collaboration_media USING GIN(tags);

-- Indexes for Media Shares
CREATE INDEX IF NOT EXISTS idx_collaboration_media_shares_media_id ON collaboration_media_shares(media_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_shares_shared_with ON collaboration_media_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_media_shares_shared_by ON collaboration_media_shares(shared_by);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collaboration_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collaboration_media_updated_at
  BEFORE UPDATE ON collaboration_media
  FOR EACH ROW
  EXECUTE FUNCTION update_collaboration_media_updated_at();

-- Trigger to increment view count
CREATE OR REPLACE FUNCTION increment_media_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE collaboration_media
  SET view_count = view_count + 1
  WHERE id = NEW.media_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: View tracking would be via a separate views table if needed
-- For now, views can be incremented via UPDATE queries
