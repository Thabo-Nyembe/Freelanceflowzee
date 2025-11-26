-- ============================================================================
-- SESSION_12: GALLERY SYSTEM - Production Database Schema
-- ============================================================================
-- World-class media gallery with comprehensive features:
-- - Image and video management
-- - Album organization
-- - Tag system with categories
-- - Sharing and permissions
-- - Comments and reactions
-- - View tracking and analytics
-- - Edit history and versions
-- - AI metadata and auto-tagging
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE image_type AS ENUM ('image', 'video', 'audio', 'document');
CREATE TYPE image_category AS ENUM (
  'branding',
  'web-design',
  'mobile',
  'social',
  'print',
  'video',
  'photography',
  'illustration',
  '3d',
  'animation',
  'ai-generated',
  'other'
);
CREATE TYPE album_privacy AS ENUM ('private', 'unlisted', 'public');
CREATE TYPE share_permission AS ENUM ('view', 'download', 'comment', 'edit');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE edit_type AS ENUM ('crop', 'resize', 'filter', 'adjustment', 'text', 'rotate', 'flip', 'other');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Gallery Images Table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic metadata
  title TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  format TEXT NOT NULL,

  -- URLs
  url TEXT NOT NULL, -- Full resolution URL
  thumbnail TEXT, -- Thumbnail URL

  -- Classification
  type image_type NOT NULL DEFAULT 'image',
  category image_category NOT NULL DEFAULT 'other',

  -- Organization
  album_id UUID REFERENCES gallery_albums(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',

  -- Flags
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  processing_status processing_status DEFAULT 'completed',

  -- Project context
  client TEXT,
  project TEXT,

  -- Engagement metrics
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  -- Extended metadata (JSONB for flexibility)
  metadata JSONB DEFAULT '{}', -- Camera, lens, location, etc.
  exif_data JSONB DEFAULT '{}', -- EXIF data from photos
  color_palette TEXT[] DEFAULT '{}', -- Extracted color hex values

  -- AI features
  ai_generated BOOLEAN DEFAULT FALSE,
  source_prompt TEXT, -- AI generation prompt if applicable
  ai_tags TEXT[] DEFAULT '{}', -- Auto-generated tags

  -- Sharing
  share_url TEXT UNIQUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_dimensions CHECK (width > 0 AND height > 0),
  CONSTRAINT valid_file_size CHECK (file_size > 0)
);

-- Albums Table
CREATE TABLE gallery_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT, -- URL to cover image

  -- Privacy
  privacy album_privacy NOT NULL DEFAULT 'private',
  password TEXT, -- For password-protected albums
  share_url TEXT UNIQUE,

  -- Organization
  parent_album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE, -- Nested albums
  tags TEXT[] DEFAULT '{}',

  -- Statistics
  image_count INTEGER DEFAULT 0,
  total_size BIGINT DEFAULT 0, -- Total bytes of all images
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags Table
CREATE TABLE gallery_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Tag info
  name TEXT NOT NULL,
  color TEXT, -- Hex color for UI
  category TEXT, -- Tag category (e.g., 'Design', 'Media', 'Art')

  -- Statistics
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique per user
  UNIQUE(user_id, name)
);

-- Image-Tags Junction Table
CREATE TABLE gallery_image_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES gallery_tags(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(image_id, tag_id)
);

-- Collections Table (Curated collections like "Featured", "Best of 2024", etc.)
CREATE TABLE gallery_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection info
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,

  -- Configuration
  is_auto_generated BOOLEAN DEFAULT FALSE, -- Smart collections based on rules
  rules JSONB DEFAULT '{}', -- Rules for smart collections

  -- Statistics
  image_count INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Collection Images Junction Table
CREATE TABLE gallery_collection_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES gallery_collections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- Ordering
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint
  UNIQUE(collection_id, image_id)
);

-- Shares Table (Public sharing links)
CREATE TABLE gallery_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Share configuration
  share_url TEXT UNIQUE NOT NULL,
  password TEXT, -- Optional password protection
  expires_at TIMESTAMPTZ, -- Optional expiration
  permissions share_permission[] DEFAULT ARRAY['view']::share_permission[],

  -- Statistics
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Either image or album, not both
  CONSTRAINT image_or_album CHECK (
    (image_id IS NOT NULL AND album_id IS NULL) OR
    (image_id IS NULL AND album_id IS NOT NULL)
  )
);

-- Comments Table
CREATE TABLE gallery_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Comment content
  text TEXT NOT NULL,

  -- Threading
  parent_comment_id UUID REFERENCES gallery_comments(id) ON DELETE CASCADE,

  -- Engagement
  likes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT non_empty_text CHECK (LENGTH(TRIM(text)) > 0)
);

-- Likes Table
CREATE TABLE gallery_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint - one like per user per image
  UNIQUE(image_id, user_id)
);

-- Views Table (Analytics)
CREATE TABLE gallery_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID REFERENCES gallery_images(id) ON DELETE CASCADE,
  album_id UUID REFERENCES gallery_albums(id) ON DELETE CASCADE,

  -- Viewer info (nullable for anonymous views)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,

  -- Context
  referrer TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Either image or album, not both
  CONSTRAINT image_or_album_view CHECK (
    (image_id IS NOT NULL AND album_id IS NULL) OR
    (image_id IS NULL AND album_id IS NOT NULL)
  )
);

-- Downloads Table (Tracking)
CREATE TABLE gallery_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- Downloader info (nullable for anonymous downloads)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,

  -- Download info
  file_format TEXT,
  file_size BIGINT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Edits Table (Version history)
CREATE TABLE gallery_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Edit details
  edit_type edit_type NOT NULL,
  parameters JSONB DEFAULT '{}', -- Edit parameters (e.g., crop coordinates, filter settings)

  -- Version info
  thumbnail TEXT, -- Thumbnail of edited version
  result_url TEXT, -- URL to edited image

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- AI Metadata Table (AI-generated content metadata)
CREATE TABLE gallery_ai_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,

  -- AI generation details
  model TEXT, -- AI model used (e.g., "DALL-E 3", "Midjourney")
  prompt TEXT, -- Generation prompt
  negative_prompt TEXT, -- Negative prompt
  parameters JSONB DEFAULT '{}', -- Generation parameters

  -- Auto-tagging
  auto_tags TEXT[] DEFAULT '{}',
  confidence_scores JSONB DEFAULT '{}', -- Confidence scores for auto-tags

  -- Object detection
  detected_objects JSONB DEFAULT '{}', -- Detected objects with bounding boxes

  -- Content moderation
  moderation_labels TEXT[] DEFAULT '{}',
  is_safe_content BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Gallery Images Indexes
CREATE INDEX idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX idx_gallery_images_album_id ON gallery_images(album_id);
CREATE INDEX idx_gallery_images_category ON gallery_images(category);
CREATE INDEX idx_gallery_images_type ON gallery_images(type);
CREATE INDEX idx_gallery_images_created_at ON gallery_images(created_at DESC);
CREATE INDEX idx_gallery_images_is_favorite ON gallery_images(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_gallery_images_is_public ON gallery_images(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_gallery_images_views ON gallery_images(views DESC);
CREATE INDEX idx_gallery_images_likes ON gallery_images(likes DESC);
CREATE INDEX idx_gallery_images_downloads ON gallery_images(downloads DESC);
CREATE INDEX idx_gallery_images_processing_status ON gallery_images(processing_status) WHERE processing_status != 'completed';
CREATE INDEX idx_gallery_images_ai_generated ON gallery_images(ai_generated) WHERE ai_generated = TRUE;

-- Array and JSONB indexes
CREATE INDEX idx_gallery_images_tags ON gallery_images USING GIN(tags);
CREATE INDEX idx_gallery_images_metadata ON gallery_images USING GIN(metadata);
CREATE INDEX idx_gallery_images_exif_data ON gallery_images USING GIN(exif_data);

-- Full-text search
CREATE INDEX idx_gallery_images_title_search ON gallery_images USING GIN(to_tsvector('english', title));
CREATE INDEX idx_gallery_images_description_search ON gallery_images USING GIN(to_tsvector('english', description));
CREATE INDEX idx_gallery_images_client_search ON gallery_images USING GIN(to_tsvector('english', COALESCE(client, '')));

-- Albums Indexes
CREATE INDEX idx_gallery_albums_user_id ON gallery_albums(user_id);
CREATE INDEX idx_gallery_albums_parent_id ON gallery_albums(parent_album_id);
CREATE INDEX idx_gallery_albums_privacy ON gallery_albums(privacy);
CREATE INDEX idx_gallery_albums_created_at ON gallery_albums(created_at DESC);
CREATE INDEX idx_gallery_albums_image_count ON gallery_albums(image_count DESC);
CREATE INDEX idx_gallery_albums_views ON gallery_albums(views DESC);
CREATE INDEX idx_gallery_albums_tags ON gallery_albums USING GIN(tags);
CREATE INDEX idx_gallery_albums_name_search ON gallery_albums USING GIN(to_tsvector('english', name));

-- Tags Indexes
CREATE INDEX idx_gallery_tags_user_id ON gallery_tags(user_id);
CREATE INDEX idx_gallery_tags_name ON gallery_tags(name);
CREATE INDEX idx_gallery_tags_category ON gallery_tags(category);
CREATE INDEX idx_gallery_tags_usage_count ON gallery_tags(usage_count DESC);
CREATE INDEX idx_gallery_tags_name_search ON gallery_tags USING GIN(to_tsvector('english', name));

-- Junction Tables Indexes
CREATE INDEX idx_gallery_image_tags_image_id ON gallery_image_tags(image_id);
CREATE INDEX idx_gallery_image_tags_tag_id ON gallery_image_tags(tag_id);

-- Collections Indexes
CREATE INDEX idx_gallery_collections_user_id ON gallery_collections(user_id);
CREATE INDEX idx_gallery_collections_is_auto ON gallery_collections(is_auto_generated);
CREATE INDEX idx_gallery_collections_created_at ON gallery_collections(created_at DESC);
CREATE INDEX idx_gallery_collection_images_collection_id ON gallery_collection_images(collection_id);
CREATE INDEX idx_gallery_collection_images_image_id ON gallery_collection_images(image_id);
CREATE INDEX idx_gallery_collection_images_display_order ON gallery_collection_images(collection_id, display_order);

-- Shares Indexes
CREATE INDEX idx_gallery_shares_image_id ON gallery_shares(image_id);
CREATE INDEX idx_gallery_shares_album_id ON gallery_shares(album_id);
CREATE INDEX idx_gallery_shares_created_by ON gallery_shares(created_by);
CREATE INDEX idx_gallery_shares_share_url ON gallery_shares(share_url);
CREATE INDEX idx_gallery_shares_expires_at ON gallery_shares(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_gallery_shares_permissions ON gallery_shares USING GIN(permissions);

-- Comments Indexes
CREATE INDEX idx_gallery_comments_image_id ON gallery_comments(image_id);
CREATE INDEX idx_gallery_comments_user_id ON gallery_comments(user_id);
CREATE INDEX idx_gallery_comments_parent_id ON gallery_comments(parent_comment_id);
CREATE INDEX idx_gallery_comments_created_at ON gallery_comments(created_at DESC);
CREATE INDEX idx_gallery_comments_likes ON gallery_comments(likes DESC);

-- Likes Indexes
CREATE INDEX idx_gallery_likes_image_id ON gallery_likes(image_id);
CREATE INDEX idx_gallery_likes_user_id ON gallery_likes(user_id);
CREATE INDEX idx_gallery_likes_created_at ON gallery_likes(created_at DESC);

-- Views Indexes
CREATE INDEX idx_gallery_views_image_id ON gallery_views(image_id);
CREATE INDEX idx_gallery_views_album_id ON gallery_views(album_id);
CREATE INDEX idx_gallery_views_user_id ON gallery_views(user_id);
CREATE INDEX idx_gallery_views_created_at ON gallery_views(created_at DESC);
CREATE INDEX idx_gallery_views_ip_address ON gallery_views(ip_address);

-- Downloads Indexes
CREATE INDEX idx_gallery_downloads_image_id ON gallery_downloads(image_id);
CREATE INDEX idx_gallery_downloads_user_id ON gallery_downloads(user_id);
CREATE INDEX idx_gallery_downloads_created_at ON gallery_downloads(created_at DESC);

-- Edits Indexes
CREATE INDEX idx_gallery_edits_image_id ON gallery_edits(image_id);
CREATE INDEX idx_gallery_edits_user_id ON gallery_edits(user_id);
CREATE INDEX idx_gallery_edits_edit_type ON gallery_edits(edit_type);
CREATE INDEX idx_gallery_edits_created_at ON gallery_edits(created_at DESC);

-- AI Metadata Indexes
CREATE INDEX idx_gallery_ai_metadata_image_id ON gallery_ai_metadata(image_id);
CREATE INDEX idx_gallery_ai_metadata_model ON gallery_ai_metadata(model);
CREATE INDEX idx_gallery_ai_metadata_is_safe ON gallery_ai_metadata(is_safe_content);
CREATE INDEX idx_gallery_ai_metadata_auto_tags ON gallery_ai_metadata USING GIN(auto_tags);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_collection_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_edits ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_ai_metadata ENABLE ROW LEVEL SECURITY;

-- Gallery Images Policies
CREATE POLICY "Users can view their own images"
  ON gallery_images FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public images"
  ON gallery_images FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can insert their own images"
  ON gallery_images FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images"
  ON gallery_images FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON gallery_images FOR DELETE
  USING (auth.uid() = user_id);

-- Albums Policies
CREATE POLICY "Users can view their own albums"
  ON gallery_albums FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public albums"
  ON gallery_albums FOR SELECT
  USING (privacy = 'public');

CREATE POLICY "Users can view unlisted albums with link"
  ON gallery_albums FOR SELECT
  USING (privacy = 'unlisted' AND share_url IS NOT NULL);

CREATE POLICY "Users can insert their own albums"
  ON gallery_albums FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own albums"
  ON gallery_albums FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own albums"
  ON gallery_albums FOR DELETE
  USING (auth.uid() = user_id);

-- Tags Policies
CREATE POLICY "Users can view their own tags"
  ON gallery_tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tags"
  ON gallery_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags"
  ON gallery_tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags"
  ON gallery_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Image-Tags Policies
CREATE POLICY "Users can view image-tag relationships for their images"
  ON gallery_image_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert image-tag relationships for their images"
  ON gallery_image_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete image-tag relationships for their images"
  ON gallery_image_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- Collections Policies
CREATE POLICY "Users can view their own collections"
  ON gallery_collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON gallery_collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON gallery_collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON gallery_collections FOR DELETE
  USING (auth.uid() = user_id);

-- Collection Images Policies
CREATE POLICY "Users can view collection images for their collections"
  ON gallery_collection_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert collection images for their collections"
  ON gallery_collection_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete collection images for their collections"
  ON gallery_collection_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM gallery_collections
      WHERE id = collection_id AND user_id = auth.uid()
    )
  );

-- Shares Policies
CREATE POLICY "Users can view their own shares"
  ON gallery_shares FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view public shares"
  ON gallery_shares FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can create shares for their content"
  ON gallery_shares FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own shares"
  ON gallery_shares FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own shares"
  ON gallery_shares FOR DELETE
  USING (auth.uid() = created_by);

-- Comments Policies
CREATE POLICY "Users can view comments on images they can view"
  ON gallery_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Authenticated users can insert comments"
  ON gallery_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON gallery_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON gallery_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes Policies
CREATE POLICY "Users can view likes on images they can view"
  ON gallery_likes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND (user_id = auth.uid() OR is_public = TRUE)
    )
  );

CREATE POLICY "Authenticated users can insert likes"
  ON gallery_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON gallery_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Views Policies (Public - for analytics)
CREATE POLICY "Anyone can insert views"
  ON gallery_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view analytics for their content"
  ON gallery_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM gallery_albums
      WHERE id = album_id AND user_id = auth.uid()
    )
  );

-- Downloads Policies
CREATE POLICY "Anyone can insert downloads"
  ON gallery_downloads FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can view download analytics for their images"
  ON gallery_downloads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- Edits Policies
CREATE POLICY "Users can view edit history for their images"
  ON gallery_edits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert edits for their images"
  ON gallery_edits FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

-- AI Metadata Policies
CREATE POLICY "Users can view AI metadata for their images"
  ON gallery_ai_metadata FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM gallery_images
      WHERE id = image_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert AI metadata"
  ON gallery_ai_metadata FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "System can update AI metadata"
  ON gallery_ai_metadata FOR UPDATE
  USING (TRUE);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_images_updated_at
  BEFORE UPDATE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_albums_updated_at
  BEFORE UPDATE ON gallery_albums
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_collections_updated_at
  BEFORE UPDATE ON gallery_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_comments_updated_at
  BEFORE UPDATE ON gallery_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_ai_metadata_updated_at
  BEFORE UPDATE ON gallery_ai_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update album statistics when image is added/removed
CREATE OR REPLACE FUNCTION update_album_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update new album if exists
    IF NEW.album_id IS NOT NULL THEN
      UPDATE gallery_albums
      SET
        image_count = (
          SELECT COUNT(*) FROM gallery_images WHERE album_id = NEW.album_id
        ),
        total_size = (
          SELECT COALESCE(SUM(file_size), 0) FROM gallery_images WHERE album_id = NEW.album_id
        ),
        updated_at = NOW()
      WHERE id = NEW.album_id;
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    -- Update old album if exists and changed
    IF OLD.album_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.album_id != NEW.album_id) THEN
      UPDATE gallery_albums
      SET
        image_count = (
          SELECT COUNT(*) FROM gallery_images WHERE album_id = OLD.album_id
        ),
        total_size = (
          SELECT COALESCE(SUM(file_size), 0) FROM gallery_images WHERE album_id = OLD.album_id
        ),
        updated_at = NOW()
      WHERE id = OLD.album_id;
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_album_statistics
  AFTER INSERT OR UPDATE OR DELETE ON gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION update_album_statistics();

-- Update image likes count
CREATE OR REPLACE FUNCTION update_image_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_images
    SET likes = likes + 1
    WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_images
    SET likes = likes - 1
    WHERE id = OLD.image_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_likes_count
  AFTER INSERT OR DELETE ON gallery_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_image_likes_count();

-- Update image comments count
CREATE OR REPLACE FUNCTION update_image_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_images
    SET comments = comments + 1
    WHERE id = NEW.image_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_images
    SET comments = comments - 1
    WHERE id = OLD.image_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_image_comments_count
  AFTER INSERT OR DELETE ON gallery_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_image_comments_count();

-- Update image views count
CREATE OR REPLACE FUNCTION update_image_views_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_id IS NOT NULL THEN
    UPDATE gallery_images
    SET views = views + 1
    WHERE id = NEW.image_id;
  ELSIF NEW.album_id IS NOT NULL THEN
    UPDATE gallery_albums
    SET views = views + 1
    WHERE id = NEW.album_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_views_count
  AFTER INSERT ON gallery_views
  FOR EACH ROW
  EXECUTE FUNCTION update_image_views_count();

-- Update image downloads count
CREATE OR REPLACE FUNCTION update_image_downloads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gallery_images
  SET downloads = downloads + 1
  WHERE id = NEW.image_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_downloads_count
  AFTER INSERT ON gallery_downloads
  FOR EACH ROW
  EXECUTE FUNCTION update_image_downloads_count();

-- Update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_tags
    SET usage_count = usage_count + 1
    WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_tags
    SET usage_count = usage_count - 1
    WHERE id = OLD.tag_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tag_usage_count
  AFTER INSERT OR DELETE ON gallery_image_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Update collection image count
CREATE OR REPLACE FUNCTION update_collection_image_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE gallery_collections
    SET
      image_count = image_count + 1,
      updated_at = NOW()
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE gallery_collections
    SET
      image_count = image_count - 1,
      updated_at = NOW()
    WHERE id = OLD.collection_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_image_count
  AFTER INSERT OR DELETE ON gallery_collection_images
  FOR EACH ROW
  EXECUTE FUNCTION update_collection_image_count();

-- Update share statistics
CREATE OR REPLACE FUNCTION update_share_statistics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.image_id IS NOT NULL THEN
    UPDATE gallery_images
    SET shares = shares + 1
    WHERE id = NEW.image_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_share_statistics
  AFTER INSERT ON gallery_shares
  FOR EACH ROW
  EXECUTE FUNCTION update_share_statistics();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Full-text search for images
CREATE OR REPLACE FUNCTION search_gallery_images(
  search_query TEXT,
  user_uuid UUID DEFAULT NULL
)
RETURNS SETOF gallery_images AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM gallery_images
  WHERE
    (user_uuid IS NULL OR user_id = user_uuid OR is_public = TRUE)
    AND (
      to_tsvector('english', title) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(description, '')) @@ plainto_tsquery('english', search_query)
      OR to_tsvector('english', COALESCE(client, '')) @@ plainto_tsquery('english', search_query)
      OR search_query = ANY(tags)
    )
  ORDER BY
    ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', search_query)) DESC,
    created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Get similar images based on tags and category
CREATE OR REPLACE FUNCTION get_similar_images(
  target_image_id UUID,
  similarity_limit INTEGER DEFAULT 5
)
RETURNS SETOF gallery_images AS $$
DECLARE
  target_image gallery_images;
BEGIN
  -- Get target image
  SELECT * INTO target_image FROM gallery_images WHERE id = target_image_id;

  IF target_image IS NULL THEN
    RETURN;
  END IF;

  -- Find similar images
  RETURN QUERY
  SELECT gi.*
  FROM gallery_images gi
  WHERE
    gi.id != target_image_id
    AND gi.user_id = target_image.user_id
    AND (
      gi.category = target_image.category
      OR gi.tags && target_image.tags -- Array overlap operator
    )
  ORDER BY
    -- Prioritize same category
    CASE WHEN gi.category = target_image.category THEN 1 ELSE 0 END DESC,
    -- Count matching tags
    (SELECT COUNT(*) FROM unnest(gi.tags) tag WHERE tag = ANY(target_image.tags)) DESC,
    -- Popularity
    gi.views DESC
  LIMIT similarity_limit;
END;
$$ LANGUAGE plpgsql;

-- Get image analytics
CREATE OR REPLACE FUNCTION get_image_analytics(
  target_image_id UUID
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_views', COUNT(DISTINCT v.id),
    'unique_users', COUNT(DISTINCT v.user_id),
    'total_downloads', (SELECT COUNT(*) FROM gallery_downloads WHERE image_id = target_image_id),
    'total_likes', (SELECT COUNT(*) FROM gallery_likes WHERE image_id = target_image_id),
    'total_comments', (SELECT COUNT(*) FROM gallery_comments WHERE image_id = target_image_id),
    'views_by_day', (
      SELECT json_agg(day_stats)
      FROM (
        SELECT
          DATE(created_at) as date,
          COUNT(*) as views
        FROM gallery_views
        WHERE image_id = target_image_id
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) DESC
        LIMIT 30
      ) day_stats
    )
  ) INTO result
  FROM gallery_views v
  WHERE v.image_id = target_image_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Get trending images (most viewed in last N days)
CREATE OR REPLACE FUNCTION get_trending_images(
  days INTEGER DEFAULT 7,
  result_limit INTEGER DEFAULT 10,
  user_uuid UUID DEFAULT NULL
)
RETURNS SETOF gallery_images AS $$
BEGIN
  RETURN QUERY
  SELECT gi.*
  FROM gallery_images gi
  WHERE
    (user_uuid IS NULL OR gi.user_id = user_uuid OR gi.is_public = TRUE)
    AND gi.created_at >= NOW() - (days || ' days')::INTERVAL
  ORDER BY
    gi.views DESC,
    gi.likes DESC,
    gi.downloads DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Clean up expired shares
CREATE OR REPLACE FUNCTION cleanup_expired_shares()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM gallery_shares
  WHERE expires_at IS NOT NULL AND expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Comments
COMMENT ON TABLE gallery_images IS 'Gallery images and videos with comprehensive metadata';
COMMENT ON TABLE gallery_albums IS 'Albums for organizing gallery media';
COMMENT ON TABLE gallery_tags IS 'User-defined tags for categorizing media';
COMMENT ON TABLE gallery_collections IS 'Curated collections of media (manual or smart)';
COMMENT ON TABLE gallery_shares IS 'Public sharing links for images and albums';
COMMENT ON TABLE gallery_comments IS 'Comments on gallery images';
COMMENT ON TABLE gallery_likes IS 'Like tracking for gallery images';
COMMENT ON TABLE gallery_views IS 'View analytics for images and albums';
COMMENT ON TABLE gallery_downloads IS 'Download tracking for gallery images';
COMMENT ON TABLE gallery_edits IS 'Edit history and version tracking';
COMMENT ON TABLE gallery_ai_metadata IS 'AI-generated metadata and content moderation';

-- ============================================================================
-- SAMPLE QUERIES FOR PRODUCTION API
-- ============================================================================

/*
-- Get user's images with filters
SELECT * FROM gallery_images
WHERE user_id = auth.uid()
  AND category = 'branding'
  AND is_favorite = TRUE
ORDER BY created_at DESC
LIMIT 20;

-- Get images in album
SELECT gi.* FROM gallery_images gi
JOIN gallery_albums ga ON gi.album_id = ga.id
WHERE ga.id = 'album-uuid'
  AND (ga.user_id = auth.uid() OR ga.privacy = 'public')
ORDER BY gi.created_at DESC;

-- Search images
SELECT * FROM search_gallery_images('logo design', auth.uid())
LIMIT 20;

-- Get trending images
SELECT * FROM get_trending_images(7, 10, auth.uid());

-- Get similar images
SELECT * FROM get_similar_images('image-uuid', 5);

-- Get image analytics
SELECT get_image_analytics('image-uuid');

-- Get user's collections
SELECT * FROM gallery_collections
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Get images with specific tags
SELECT * FROM gallery_images
WHERE tags && ARRAY['logo', 'branding']
  AND user_id = auth.uid()
ORDER BY created_at DESC;

-- Get top performing images
SELECT * FROM gallery_images
WHERE user_id = auth.uid()
ORDER BY (views * 0.4 + likes * 0.3 + downloads * 0.3) DESC
LIMIT 10;
*/
