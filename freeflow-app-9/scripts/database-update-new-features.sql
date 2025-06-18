-- FreeflowZee Database Update - New Features Support
-- This script adds database support for:
-- ✅ Enhanced Sharing Modal System
-- ✅ Community Hub with Social Posts  
-- ✅ Social Interactions (likes, shares, comments, bookmarks)
-- ✅ Creator Marketplace

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Community Posts Table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  media_type VARCHAR(20) CHECK (media_type IN ('text', 'image', 'video', 'audio', 'carousel')),
  media_url TEXT,
  media_urls TEXT[],
  thumbnail_url TEXT,
  duration VARCHAR(20),
  tags TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  search_vector tsvector,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Interactions Table  
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'bookmark', 'view')),
  share_platform VARCHAR(50),
  share_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Post Comments Table
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sharing Analytics Table
CREATE TABLE IF NOT EXISTS sharing_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform VARCHAR(50) NOT NULL,
  share_url TEXT,
  share_title TEXT,
  share_description TEXT,
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator Profiles Table
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  professional_title VARCHAR(200),
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  availability_status VARCHAR(20) DEFAULT 'available',
  skills TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_pro BOOLEAN DEFAULT false,
  location VARCHAR(255),
  social_links JSONB DEFAULT '{}',
  is_available_for_hire BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator Reviews Table
CREATE TABLE IF NOT EXISTS creator_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_rating ON creator_profiles(rating);

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts 
    SET 
      likes_count = CASE WHEN NEW.interaction_type = 'like' THEN likes_count + 1 ELSE likes_count END,
      shares_count = CASE WHEN NEW.interaction_type = 'share' THEN shares_count + 1 ELSE shares_count END,
      bookmarks_count = CASE WHEN NEW.interaction_type = 'bookmark' THEN bookmarks_count + 1 ELSE bookmarks_count END,
      views_count = CASE WHEN NEW.interaction_type = 'view' THEN views_count + 1 ELSE views_count END,
      updated_at = NOW()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts 
    SET 
      likes_count = CASE WHEN OLD.interaction_type = 'like' THEN GREATEST(likes_count - 1, 0) ELSE likes_count END,
      shares_count = CASE WHEN OLD.interaction_type = 'share' THEN GREATEST(shares_count - 1, 0) ELSE shares_count END,
      bookmarks_count = CASE WHEN OLD.interaction_type = 'bookmark' THEN GREATEST(bookmarks_count - 1, 0) ELSE bookmarks_count END,
      views_count = CASE WHEN OLD.interaction_type = 'view' THEN GREATEST(views_count - 1, 0) ELSE views_count END,
      updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post engagement counts
CREATE TRIGGER trigger_update_post_engagement_counts
  AFTER INSERT OR DELETE ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_post_engagement_counts();

-- Enable Row Level Security
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public posts" ON community_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own posts" ON community_posts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Users can create interactions" ON post_interactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own interactions" ON post_interactions FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view creator profiles" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own creator profile" ON creator_profiles FOR ALL USING (id = auth.uid());

-- Sample data for testing
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id INTO demo_user_id FROM auth.users WHERE email LIKE '%demo%' OR email LIKE '%test%' LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    INSERT INTO community_posts (author_id, content, media_type, tags, likes_count, shares_count, comments_count)
    VALUES 
      (demo_user_id, 'Welcome to our new community hub! 🎨', 'text', ARRAY['welcome', 'community'], 25, 8, 5),
      (demo_user_id, 'Just finished an amazing project! Check it out 🚀', 'image', ARRAY['project', 'design'], 42, 12, 8)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO creator_profiles (id, professional_title, specialties, rating, total_reviews, is_verified)
    VALUES (demo_user_id, 'Creative Director', ARRAY['Design', 'Video', 'Branding'], 4.8, 24, true)
    ON CONFLICT (id) DO UPDATE SET
      professional_title = EXCLUDED.professional_title,
      specialties = EXCLUDED.specialties,
      rating = EXCLUDED.rating,
      total_reviews = EXCLUDED.total_reviews,
      is_verified = EXCLUDED.is_verified;
  END IF;
END $$; 