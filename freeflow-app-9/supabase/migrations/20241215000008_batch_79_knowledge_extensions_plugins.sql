-- Batch 79: Knowledge Articles, Extensions, Plugins V2 Integration
-- Tables for Knowledge Base, Extensions, and Plugins with RLS

-- ============================================
-- Knowledge Articles Table
-- ============================================
CREATE TABLE IF NOT EXISTS knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT,
  article_type VARCHAR(50) DEFAULT 'guide' CHECK (article_type IN ('guide', 'how-to', 'best-practice', 'case-study', 'reference', 'glossary', 'concept')),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'review', 'archived', 'scheduled')),
  level VARCHAR(20) DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  author VARCHAR(255),
  contributors_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 5,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  related_articles UUID[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Knowledge Articles RLS
ALTER TABLE knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own articles" ON knowledge_articles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create articles" ON knowledge_articles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles" ON knowledge_articles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles" ON knowledge_articles
  FOR DELETE USING (auth.uid() = user_id);

-- Knowledge Articles Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_user_id ON knowledge_articles(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_status ON knowledge_articles(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_type ON knowledge_articles(article_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_articles_level ON knowledge_articles(level);

-- ============================================
-- Extensions Table
-- ============================================
CREATE TABLE IF NOT EXISTS extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  developer VARCHAR(255),
  category VARCHAR(50) DEFAULT 'utility' CHECK (category IN ('browser', 'desktop', 'mobile', 'api', 'workflow', 'integration', 'utility', 'enhancement')),
  extension_type VARCHAR(50) DEFAULT 'third-party' CHECK (extension_type IN ('official', 'verified', 'third-party', 'experimental', 'legacy')),
  status VARCHAR(20) DEFAULT 'disabled' CHECK (status IN ('enabled', 'disabled', 'installing', 'updating', 'error')),
  users_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  size VARCHAR(20),
  platform VARCHAR(100),
  permissions TEXT[] DEFAULT '{}',
  features TEXT[] DEFAULT '{}',
  compatibility TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon_url VARCHAR(500),
  download_url VARCHAR(500),
  documentation_url VARCHAR(500),
  release_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Extensions RLS
ALTER TABLE extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own extensions" ON extensions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create extensions" ON extensions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own extensions" ON extensions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own extensions" ON extensions
  FOR DELETE USING (auth.uid() = user_id);

-- Extensions Indexes
CREATE INDEX IF NOT EXISTS idx_extensions_user_id ON extensions(user_id);
CREATE INDEX IF NOT EXISTS idx_extensions_status ON extensions(status);
CREATE INDEX IF NOT EXISTS idx_extensions_category ON extensions(category);
CREATE INDEX IF NOT EXISTS idx_extensions_type ON extensions(extension_type);

-- ============================================
-- Plugins Table
-- ============================================
CREATE TABLE IF NOT EXISTS plugins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(20) DEFAULT '1.0.0',
  author VARCHAR(255),
  category VARCHAR(50) DEFAULT 'utility' CHECK (category IN ('productivity', 'security', 'analytics', 'integration', 'communication', 'automation', 'ui-enhancement', 'developer-tools')),
  plugin_type VARCHAR(50) DEFAULT 'community' CHECK (plugin_type IN ('core', 'premium', 'community', 'enterprise', 'beta')),
  status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'updating', 'error', 'disabled')),
  installs_count INTEGER DEFAULT 0,
  active_users_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  size VARCHAR(20),
  compatibility VARCHAR(50),
  permissions TEXT[] DEFAULT '{}',
  api_calls_count INTEGER DEFAULT 0,
  performance_score INTEGER DEFAULT 100,
  tags TEXT[] DEFAULT '{}',
  icon_url VARCHAR(500),
  repository_url VARCHAR(500),
  documentation_url VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plugins RLS
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plugins" ON plugins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create plugins" ON plugins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plugins" ON plugins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plugins" ON plugins
  FOR DELETE USING (auth.uid() = user_id);

-- Plugins Indexes
CREATE INDEX IF NOT EXISTS idx_plugins_user_id ON plugins(user_id);
CREATE INDEX IF NOT EXISTS idx_plugins_status ON plugins(status);
CREATE INDEX IF NOT EXISTS idx_plugins_category ON plugins(category);
CREATE INDEX IF NOT EXISTS idx_plugins_type ON plugins(plugin_type);
