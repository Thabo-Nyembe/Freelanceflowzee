-- Resource Library - Complete Digital Asset & Resource Management
-- Manage design assets, code libraries, templates, media files, and educational resources

-- ENUMS
DROP TYPE IF EXISTS resource_type CASCADE;
DROP TYPE IF EXISTS resource_category CASCADE;
DROP TYPE IF EXISTS resource_format CASCADE;
DROP TYPE IF EXISTS license_type CASCADE;
DROP TYPE IF EXISTS access_level CASCADE;

CREATE TYPE resource_type AS ENUM (
  'design-system', 'code', 'template', 'video', 'image', 'audio',
  'document', 'font', '3d-model', 'plugin', 'tutorial', 'ebook'
);

CREATE TYPE resource_category AS ENUM (
  'design', 'development', 'branding', 'motion', 'photography', 'illustration',
  'ui-kit', 'icons', 'fonts', 'textures', 'mockups', 'education', 'marketing'
);

CREATE TYPE resource_format AS ENUM (
  'figma', 'sketch', 'xd', 'psd', 'ai', 'ae', 'zip', 'pdf', 'mp4', 'mov',
  'jpg', 'png', 'svg', 'mp3', 'wav', 'ttf', 'otf', 'obj', 'fbx', 'gltf'
);

CREATE TYPE license_type AS ENUM (
  'commercial', 'personal', 'mit', 'gpl', 'creative-commons', 'proprietary', 'public-domain'
);

CREATE TYPE access_level AS ENUM ('free', 'premium', 'subscription', 'one-time-purchase');

-- TABLES
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS resource_categories CASCADE;
DROP TABLE IF EXISTS resource_collections CASCADE;
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS resource_downloads CASCADE;
DROP TABLE IF EXISTS resource_ratings CASCADE;
DROP TABLE IF EXISTS resource_comments CASCADE;
DROP TABLE IF EXISTS resource_bookmarks CASCADE;
DROP TABLE IF EXISTS resource_tags CASCADE;

CREATE TABLE resource_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id UUID REFERENCES resource_categories(id) ON DELETE CASCADE,

  -- Stats
  resource_count INTEGER NOT NULL DEFAULT 0,
  total_downloads INTEGER NOT NULL DEFAULT 0,

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,

  -- Classification
  resource_type resource_type NOT NULL,
  category_id UUID REFERENCES resource_categories(id) ON DELETE SET NULL,
  format resource_format NOT NULL,

  -- Files & Storage
  file_url TEXT,
  file_size BIGINT, -- bytes
  file_size_formatted TEXT, -- e.g., "45.2 MB"
  thumbnail_url TEXT,
  preview_urls TEXT[] DEFAULT ARRAY[]::TEXT[],

  -- Metadata
  version TEXT,
  author_name TEXT,
  source_url TEXT,
  documentation_url TEXT,
  demo_url TEXT,

  -- Licensing & Access
  license license_type NOT NULL DEFAULT 'commercial',
  access_level access_level NOT NULL DEFAULT 'free',
  price DECIMAL(10, 2) DEFAULT 0,

  -- Engagement Stats
  downloads_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  likes_count INTEGER NOT NULL DEFAULT 0,
  bookmarks_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,

  -- Features
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,

  -- SEO & Discovery
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  search_vector tsvector,

  -- Requirements & Compatibility
  requirements JSONB DEFAULT '{}'::jsonb,
  compatibility JSONB DEFAULT '{}'::jsonb,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Collection Info
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  thumbnail_url TEXT,

  -- Stats
  items_count INTEGER NOT NULL DEFAULT 0,
  total_downloads INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,

  -- Features
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, slug)
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES resource_collections(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,

  -- Display
  display_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,

  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(collection_id, resource_id)
);

CREATE TABLE resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Download Context
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,

  -- Helpful Votes
  helpful_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(resource_id, user_id)
);

CREATE TABLE resource_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES resource_comments(id) ON DELETE CASCADE,

  -- Comment
  content TEXT NOT NULL,

  -- Engagement
  likes_count INTEGER NOT NULL DEFAULT 0,
  replies_count INTEGER NOT NULL DEFAULT 0,

  -- Moderation
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE resource_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Organization
  folder TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(resource_id, user_id)
);

CREATE TABLE resource_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,

  -- Stats
  usage_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_resources_category_id ON resources(category_id);
CREATE INDEX idx_resources_type ON resources(resource_type);
CREATE INDEX idx_resources_format ON resources(format);
CREATE INDEX idx_resources_access_level ON resources(access_level);
CREATE INDEX idx_resources_featured ON resources(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resources_published ON resources(is_published) WHERE is_published = true;
CREATE INDEX idx_resources_created_at ON resources(created_at DESC);
CREATE INDEX idx_resources_downloads ON resources(downloads_count DESC);
CREATE INDEX idx_resources_rating ON resources(rating_average DESC);
CREATE INDEX idx_resources_tags ON resources USING GIN(tags);
CREATE INDEX idx_resources_search ON resources USING GIN(search_vector);

CREATE INDEX idx_resource_categories_parent ON resource_categories(parent_id);
CREATE INDEX idx_resource_categories_featured ON resource_categories(is_featured) WHERE is_featured = true;
CREATE INDEX idx_resource_categories_order ON resource_categories(display_order);

CREATE INDEX idx_collections_user_id ON resource_collections(user_id);
CREATE INDEX idx_collections_public ON resource_collections(is_public) WHERE is_public = true;
CREATE INDEX idx_collections_featured ON resource_collections(is_featured) WHERE is_featured = true;

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_resource ON collection_items(resource_id);
CREATE INDEX idx_collection_items_order ON collection_items(display_order);

CREATE INDEX idx_downloads_resource ON resource_downloads(resource_id);
CREATE INDEX idx_downloads_user ON resource_downloads(user_id);
CREATE INDEX idx_downloads_date ON resource_downloads(downloaded_at DESC);

CREATE INDEX idx_ratings_resource ON resource_ratings(resource_id);
CREATE INDEX idx_ratings_user ON resource_ratings(user_id);
CREATE INDEX idx_ratings_rating ON resource_ratings(rating DESC);

CREATE INDEX idx_comments_resource ON resource_comments(resource_id);
CREATE INDEX idx_comments_user ON resource_comments(user_id);
CREATE INDEX idx_comments_parent ON resource_comments(parent_id);
CREATE INDEX idx_comments_created ON resource_comments(created_at DESC);

CREATE INDEX idx_bookmarks_resource ON resource_bookmarks(resource_id);
CREATE INDEX idx_bookmarks_user ON resource_bookmarks(user_id);

-- TRIGGERS
CREATE OR REPLACE FUNCTION update_resource_rating() RETURNS TRIGGER AS $$
BEGIN
  UPDATE resources
  SET
    rating_average = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM resource_ratings
      WHERE resource_id = NEW.resource_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM resource_ratings
      WHERE resource_id = NEW.resource_id
    )
  WHERE id = NEW.resource_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_resource_rating
AFTER INSERT OR UPDATE OR DELETE ON resource_ratings
FOR EACH ROW
EXECUTE FUNCTION update_resource_rating();

CREATE OR REPLACE FUNCTION update_resource_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'resource_downloads' THEN
    UPDATE resources
    SET downloads_count = downloads_count + 1
    WHERE id = NEW.resource_id;
  ELSIF TG_TABLE_NAME = 'resource_bookmarks' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE resources SET bookmarks_count = bookmarks_count + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE resources SET bookmarks_count = bookmarks_count - 1 WHERE id = OLD.resource_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'resource_comments' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE resources SET comments_count = comments_count + 1 WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE resources SET comments_count = comments_count - 1 WHERE id = OLD.resource_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_download_stats
AFTER INSERT ON resource_downloads
FOR EACH ROW
EXECUTE FUNCTION update_resource_stats();

CREATE TRIGGER trigger_bookmark_stats
AFTER INSERT OR DELETE ON resource_bookmarks
FOR EACH ROW
EXECUTE FUNCTION update_resource_stats();

CREATE TRIGGER trigger_comment_stats
AFTER INSERT OR DELETE ON resource_comments
FOR EACH ROW
EXECUTE FUNCTION update_resource_stats();

CREATE OR REPLACE FUNCTION update_collection_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE resource_collections
    SET items_count = items_count + 1
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE resource_collections
    SET items_count = items_count - 1
    WHERE id = OLD.collection_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collection_items_count
AFTER INSERT OR DELETE ON collection_items
FOR EACH ROW
EXECUTE FUNCTION update_collection_stats();

CREATE OR REPLACE FUNCTION update_category_stats() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE resource_categories
    SET resource_count = resource_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
    UPDATE resource_categories SET resource_count = resource_count - 1 WHERE id = OLD.category_id;
    UPDATE resource_categories SET resource_count = resource_count + 1 WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE resource_categories
    SET resource_count = resource_count - 1
    WHERE id = OLD.category_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_category_resource_count
AFTER INSERT OR UPDATE OR DELETE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_category_stats();

CREATE OR REPLACE FUNCTION update_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_search_vector
BEFORE INSERT OR UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION update_search_vector();

-- HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION record_download(
  p_resource_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  download_id UUID;
BEGIN
  INSERT INTO resource_downloads (
    resource_id,
    user_id,
    ip_address,
    metadata
  ) VALUES (
    p_resource_id,
    p_user_id,
    p_ip_address,
    p_metadata
  ) RETURNING id INTO download_id;

  RETURN download_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_popular_resources(
  p_time_period TEXT DEFAULT '7d',
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE (
  resource_id UUID,
  title TEXT,
  downloads INTEGER,
  rank INTEGER
) AS $$
DECLARE
  start_date TIMESTAMPTZ;
BEGIN
  CASE p_time_period
    WHEN '24h' THEN start_date := now() - interval '24 hours';
    WHEN '7d' THEN start_date := now() - interval '7 days';
    WHEN '30d' THEN start_date := now() - interval '30 days';
    ELSE start_date := now() - interval '7 days';
  END CASE;

  RETURN QUERY
  SELECT
    r.id,
    r.title,
    COUNT(rd.id)::INTEGER as downloads,
    ROW_NUMBER() OVER (ORDER BY COUNT(rd.id) DESC)::INTEGER as rank
  FROM resources r
  LEFT JOIN resource_downloads rd ON r.id = rd.resource_id
  WHERE rd.downloaded_at >= start_date
  GROUP BY r.id, r.title
  ORDER BY downloads DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ROW LEVEL SECURITY
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;

-- Categories are public
CREATE POLICY resource_categories_public ON resource_categories
  FOR SELECT USING (is_active = true);

-- Resources: Public can view published, users can manage their own
CREATE POLICY resources_select_public ON resources
  FOR SELECT USING (is_published = true OR auth.uid() = user_id);

CREATE POLICY resources_insert_user ON resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY resources_update_owner ON resources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY resources_delete_owner ON resources
  FOR DELETE USING (auth.uid() = user_id);

-- Collections: Public can view public collections, users manage their own
CREATE POLICY collections_select_policy ON resource_collections
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY collections_manage_owner ON resource_collections
  FOR ALL USING (auth.uid() = user_id);

-- Collection items follow collection permissions
CREATE POLICY collection_items_policy ON collection_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM resource_collections
      WHERE resource_collections.id = collection_items.collection_id
      AND resource_collections.user_id = auth.uid()
    )
  );

-- Downloads: Anyone can record, users see their own
CREATE POLICY downloads_insert_policy ON resource_downloads
  FOR INSERT WITH CHECK (true);

CREATE POLICY downloads_select_user ON resource_downloads
  FOR SELECT USING (auth.uid() = user_id);

-- Ratings: Users can rate, see all ratings
CREATE POLICY ratings_select_all ON resource_ratings
  FOR SELECT USING (true);

CREATE POLICY ratings_manage_own ON resource_ratings
  FOR ALL USING (auth.uid() = user_id);

-- Comments: Public can view, users manage their own
CREATE POLICY comments_select_all ON resource_comments
  FOR SELECT USING (NOT is_deleted);

CREATE POLICY comments_manage_own ON resource_comments
  FOR ALL USING (auth.uid() = user_id);

-- Bookmarks: Users manage their own
CREATE POLICY bookmarks_policy ON resource_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Tags are public
CREATE POLICY tags_select_all ON resource_tags
  FOR SELECT USING (true);
