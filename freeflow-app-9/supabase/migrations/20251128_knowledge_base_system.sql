-- ============================================================================
-- KNOWLEDGE BASE SYSTEM - Complete Database Schema
-- ============================================================================
-- Description: Comprehensive schema for client help center and documentation
-- Features: Articles, Categories, Video Tutorials, FAQs, Search, Analytics
-- Created: 2025-11-28
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE kb_article_status AS ENUM ('draft', 'published', 'archived', 'scheduled');
CREATE TYPE kb_content_type AS ENUM ('article', 'video', 'faq', 'guide', 'tutorial');
CREATE TYPE kb_difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE kb_feedback_type AS ENUM ('helpful', 'not_helpful');

-- ============================================================================
-- TABLE: kb_categories
-- Description: Knowledge base categories for organizing content
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Category Details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Icon name (lucide-react)
  color TEXT, -- Tailwind color class

  -- Hierarchy
  parent_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,

  -- Visibility
  is_visible BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Metadata
  article_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_articles
-- Description: Help articles and documentation
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- Article Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,

  -- Metadata
  status kb_article_status DEFAULT 'draft',
  content_type kb_content_type DEFAULT 'article',
  difficulty_level kb_difficulty_level DEFAULT 'beginner',

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],

  -- Author & Publishing
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,

  -- Reading Stats
  read_time_minutes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,

  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Related Content
  related_article_ids UUID[] DEFAULT '{}',

  -- Featured
  is_featured BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,

  -- Versioning
  version INTEGER DEFAULT 1,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_article_versions
-- Description: Version history for articles
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_article_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,

  -- Version Data
  version_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,

  -- Change Tracking
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  change_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_video_tutorials
-- Description: Video tutorials and guides
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_video_tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- Video Details
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Video Source
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT, -- Format: "5:24"
  duration_seconds INTEGER,

  -- Metadata
  status kb_article_status DEFAULT 'draft',
  difficulty_level kb_difficulty_level DEFAULT 'beginner',

  -- Stats
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  -- Related
  related_video_ids UUID[] DEFAULT '{}',
  related_article_ids UUID[] DEFAULT '{}',

  -- Featured
  is_featured BOOLEAN DEFAULT false,

  -- Publishing
  published_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_faqs
-- Description: Frequently asked questions
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES kb_categories(id) ON DELETE SET NULL,

  -- FAQ Content
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  -- Metadata
  status kb_article_status DEFAULT 'published',

  -- Stats
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,

  -- Organization
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,

  -- Tags
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_article_feedback
-- Description: User feedback on articles
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback
  feedback_type kb_feedback_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Context
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_video_feedback
-- Description: User feedback on video tutorials
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_video_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_search_queries
-- Description: Track search queries for analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Search Details
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,

  -- Context
  user_agent TEXT,
  ip_address INET,

  -- Results Clicked
  clicked_article_id UUID REFERENCES kb_articles(id) ON DELETE SET NULL,
  clicked_video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_article_views
-- Description: Track article views with analytics
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- View Details
  time_spent_seconds INTEGER,
  scroll_percentage INTEGER,
  completed_reading BOOLEAN DEFAULT false,

  -- Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_video_views
-- Description: Track video tutorial views
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_video_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- View Details
  watch_time_seconds INTEGER,
  completion_percentage INTEGER,
  completed_video BOOLEAN DEFAULT false,

  -- Context
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TABLE: kb_bookmarks
-- Description: User bookmarks for articles and videos
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Bookmark Target
  article_id UUID REFERENCES kb_articles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES kb_video_tutorials(id) ON DELETE CASCADE,

  -- Notes
  notes TEXT,

  -- Organization
  folder TEXT,
  tags TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure only one of article_id or video_id is set
  CHECK (
    (article_id IS NOT NULL AND video_id IS NULL) OR
    (article_id IS NULL AND video_id IS NOT NULL)
  )
);

-- ============================================================================
-- TABLE: kb_suggested_topics
-- Description: User-suggested topics for future articles
-- ============================================================================
CREATE TABLE IF NOT EXISTS kb_suggested_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Suggestion
  title TEXT NOT NULL,
  description TEXT,
  category_suggestion TEXT,

  -- Priority
  votes INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'planned', 'in-progress', 'completed', 'rejected')) DEFAULT 'pending',

  -- Admin Response
  admin_notes TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Categories
CREATE INDEX idx_kb_categories_user_id ON kb_categories(user_id);
CREATE INDEX idx_kb_categories_parent_id ON kb_categories(parent_id);
CREATE INDEX idx_kb_categories_slug ON kb_categories(slug);

-- Articles
CREATE INDEX idx_kb_articles_user_id ON kb_articles(user_id);
CREATE INDEX idx_kb_articles_category_id ON kb_articles(category_id);
CREATE INDEX idx_kb_articles_slug ON kb_articles(slug);
CREATE INDEX idx_kb_articles_status ON kb_articles(status);
CREATE INDEX idx_kb_articles_published_at ON kb_articles(published_at);
CREATE INDEX idx_kb_articles_tags ON kb_articles USING GIN(tags);
CREATE INDEX idx_kb_articles_search ON kb_articles USING GIN(to_tsvector('english', title || ' ' || content));

-- Article Versions
CREATE INDEX idx_kb_article_versions_article_id ON kb_article_versions(article_id);

-- Video Tutorials
CREATE INDEX idx_kb_video_tutorials_user_id ON kb_video_tutorials(user_id);
CREATE INDEX idx_kb_video_tutorials_category_id ON kb_video_tutorials(category_id);
CREATE INDEX idx_kb_video_tutorials_slug ON kb_video_tutorials(slug);
CREATE INDEX idx_kb_video_tutorials_tags ON kb_video_tutorials USING GIN(tags);

-- FAQs
CREATE INDEX idx_kb_faqs_category_id ON kb_faqs(category_id);
CREATE INDEX idx_kb_faqs_tags ON kb_faqs USING GIN(tags);

-- Feedback
CREATE INDEX idx_kb_article_feedback_article_id ON kb_article_feedback(article_id);
CREATE INDEX idx_kb_article_feedback_user_id ON kb_article_feedback(user_id);
CREATE INDEX idx_kb_video_feedback_video_id ON kb_video_feedback(video_id);

-- Search
CREATE INDEX idx_kb_search_queries_query ON kb_search_queries(query);
CREATE INDEX idx_kb_search_queries_created_at ON kb_search_queries(created_at);

-- Views
CREATE INDEX idx_kb_article_views_article_id ON kb_article_views(article_id);
CREATE INDEX idx_kb_article_views_user_id ON kb_article_views(user_id);
CREATE INDEX idx_kb_video_views_video_id ON kb_video_views(video_id);

-- Bookmarks
CREATE INDEX idx_kb_bookmarks_user_id ON kb_bookmarks(user_id);
CREATE INDEX idx_kb_bookmarks_article_id ON kb_bookmarks(article_id);
CREATE INDEX idx_kb_bookmarks_video_id ON kb_bookmarks(video_id);

-- Suggestions
CREATE INDEX idx_kb_suggested_topics_status ON kb_suggested_topics(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE kb_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_video_tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_video_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_suggested_topics ENABLE ROW LEVEL SECURITY;

-- Categories: Users can read all, but only modify their own
CREATE POLICY "Users can view all categories" ON kb_categories FOR SELECT USING (true);
CREATE POLICY "Users can manage their own categories" ON kb_categories FOR ALL USING (auth.uid() = user_id);

-- Articles: Published articles visible to all, users manage their own
CREATE POLICY "Users can view published articles" ON kb_articles FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own articles" ON kb_articles FOR ALL USING (auth.uid() = user_id);

-- Article Versions: Users can view versions of articles they can see
CREATE POLICY "Users can view article versions" ON kb_article_versions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM kb_articles
    WHERE kb_articles.id = kb_article_versions.article_id
    AND (kb_articles.status = 'published' OR kb_articles.user_id = auth.uid())
  )
);

-- Video Tutorials: Published videos visible to all
CREATE POLICY "Users can view published videos" ON kb_video_tutorials FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own videos" ON kb_video_tutorials FOR ALL USING (auth.uid() = user_id);

-- FAQs: All users can read published FAQs
CREATE POLICY "Users can view published FAQs" ON kb_faqs FOR SELECT USING (status = 'published' OR auth.uid() = user_id);
CREATE POLICY "Users can manage their own FAQs" ON kb_faqs FOR ALL USING (auth.uid() = user_id);

-- Feedback: Users can add feedback and view their own
CREATE POLICY "Users can add article feedback" ON kb_article_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own article feedback" ON kb_article_feedback FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add video feedback" ON kb_video_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own video feedback" ON kb_video_feedback FOR SELECT USING (auth.uid() = user_id);

-- Search Queries: Users can log searches
CREATE POLICY "Users can log search queries" ON kb_search_queries FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Views: Users can log views
CREATE POLICY "Users can log article views" ON kb_article_views FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can log video views" ON kb_video_views FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Bookmarks: Users manage their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON kb_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Suggestions: Users can view and create suggestions
CREATE POLICY "Users can view all suggestions" ON kb_suggested_topics FOR SELECT USING (true);
CREATE POLICY "Users can create suggestions" ON kb_suggested_topics FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update article count in categories
CREATE OR REPLACE FUNCTION update_category_article_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE kb_categories
    SET article_count = article_count + 1
    WHERE id = NEW.category_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE kb_categories
    SET article_count = article_count - 1
    WHERE id = OLD.category_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.category_id != OLD.category_id THEN
    UPDATE kb_categories
    SET article_count = article_count - 1
    WHERE id = OLD.category_id;
    UPDATE kb_categories
    SET article_count = article_count + 1
    WHERE id = NEW.category_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update article count
CREATE TRIGGER trigger_update_category_article_count
AFTER INSERT OR UPDATE OR DELETE ON kb_articles
FOR EACH ROW EXECUTE FUNCTION update_category_article_count();

-- Function to calculate article rating
CREATE OR REPLACE FUNCTION calculate_article_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE kb_articles
  SET rating = (
    CASE
      WHEN (helpful_count + not_helpful_count) = 0 THEN 0
      ELSE (helpful_count::DECIMAL / (helpful_count + not_helpful_count)) * 5
    END
  )
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate rating after feedback
CREATE TRIGGER trigger_calculate_article_rating
AFTER INSERT OR UPDATE ON kb_article_feedback
FOR EACH ROW EXECUTE FUNCTION calculate_article_rating();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE kb_categories IS 'Knowledge base categories for organizing help content';
COMMENT ON TABLE kb_articles IS 'Help articles and documentation with full-text search';
COMMENT ON TABLE kb_article_versions IS 'Version history for tracking article changes';
COMMENT ON TABLE kb_video_tutorials IS 'Video tutorials and guides';
COMMENT ON TABLE kb_faqs IS 'Frequently asked questions with voting';
COMMENT ON TABLE kb_article_feedback IS 'User feedback and ratings on articles';
COMMENT ON TABLE kb_video_feedback IS 'User feedback on video tutorials';
COMMENT ON TABLE kb_search_queries IS 'Search query tracking for analytics and improvements';
COMMENT ON TABLE kb_article_views IS 'Detailed article view tracking with engagement metrics';
COMMENT ON TABLE kb_video_views IS 'Video view tracking with watch time analytics';
COMMENT ON TABLE kb_bookmarks IS 'User bookmarks for saving articles and videos';
COMMENT ON TABLE kb_suggested_topics IS 'User-suggested topics for future content';
