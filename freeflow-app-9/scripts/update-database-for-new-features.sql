-- ============================================================================
-- FreeflowZee Database Update - New Features Support
-- ============================================================================
-- This script adds database support for all the new features implemented:
-- ✅ Enhanced Sharing Modal System
-- ✅ Community Hub with Social Posts
-- ✅ Social Interactions (likes, shares, comments, bookmarks)
-- ✅ Sharing Analytics and Tracking
-- ✅ Creator Marketplace
-- ✅ Enhanced User Profiles
-- ============================================================================

-- Enable additional extensions for new features
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For composite indexes

-- ============================================================================
-- COMMUNITY & SOCIAL FEATURES
-- ============================================================================

-- Community Posts Table - For social wall/feed
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  
  -- Media support
  media_type VARCHAR(20) CHECK (media_type IN ('text', 'image', 'video', 'audio', 'carousel', 'document')),
  media_url TEXT,
  media_urls TEXT[], -- For carousel posts
  thumbnail_url TEXT,
  duration VARCHAR(20), -- For video/audio duration
  
  -- Post metadata
  tags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}', -- @username mentions
  hashtags TEXT[] DEFAULT '{}', -- #hashtag extraction
  
  -- Post settings
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  
  -- Engagement metrics
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Location and context
  location VARCHAR(255),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Moderation
  is_moderated BOOLEAN DEFAULT false,
  moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'flagged')),
  moderated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Search and discovery
  search_vector tsvector,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Interactions Table - Likes, shares, bookmarks, etc.
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'bookmark', 'view', 'report')),
  
  -- Share-specific data
  share_platform VARCHAR(50), -- 'facebook', 'twitter', 'linkedin', 'email', 'copy_link', etc.
  share_url TEXT,
  
  -- Additional metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure user can only have one interaction of each type per post
  UNIQUE(post_id, user_id, interaction_type)
);

-- Post Comments Table - Threaded comments support
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_comment_id UUID REFERENCES post_comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Comment metadata
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SHARING SYSTEM ENHANCEMENTS
-- ============================================================================

-- Sharing Analytics Table - Track all sharing activities
CREATE TABLE IF NOT EXISTS sharing_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- What was shared
  content_type VARCHAR(50) NOT NULL, -- 'post', 'portfolio', 'gallery', 'asset', 'project', 'file'
  content_id UUID NOT NULL, -- ID of the shared content
  
  -- Who shared it
  shared_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Sharing details
  platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'email', 'copy_link', 'embed', 'native'
  share_url TEXT,
  share_title TEXT,
  share_description TEXT,
  
  -- Tracking and analytics
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Performance metrics
  clicks_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  
  -- Geographic and device data
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(20), -- 'desktop', 'mobile', 'tablet'
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Share Link Tracking - For click tracking
CREATE TABLE IF NOT EXISTS share_link_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sharing_id UUID REFERENCES sharing_analytics(id) ON DELETE CASCADE,
  
  -- Click details
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Geographic data
  country VARCHAR(2),
  city VARCHAR(100),
  
  -- Session tracking
  session_id VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENHANCED USER PROFILES
-- ============================================================================

-- Creator Profiles - Enhanced profiles for marketplace
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  
  -- Professional details
  professional_title VARCHAR(200),
  specialties TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  
  -- Portfolio and skills
  portfolio_url TEXT,
  demo_reel_url TEXT,
  skills TEXT[] DEFAULT '{}',
  tools TEXT[] DEFAULT '{}',
  
  -- Social proof
  rating DECIMAL(3,2) DEFAULT 0, -- Average rating
  total_reviews INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  
  -- Verification and badges
  is_verified BOOLEAN DEFAULT false,
  is_pro BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  badges TEXT[] DEFAULT '{}',
  
  -- Location and availability
  location VARCHAR(255),
  timezone VARCHAR(50),
  languages TEXT[] DEFAULT '{}',
  
  -- Social links
  social_links JSONB DEFAULT '{}',
  
  -- Marketplace settings
  is_available_for_hire BOOLEAN DEFAULT true,
  response_time_hours INTEGER DEFAULT 24,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator Reviews and Ratings
CREATE TABLE IF NOT EXISTS creator_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES creator_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  
  -- Review categories
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Review metadata
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one review per project per reviewer
  UNIQUE(creator_id, reviewer_id, project_id)
);

-- ============================================================================
-- ENHANCED ANALYTICS TABLES
-- ============================================================================

-- Social Engagement Analytics
CREATE TABLE IF NOT EXISTS social_engagement_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Post metrics
  posts_created INTEGER DEFAULT 0,
  posts_liked INTEGER DEFAULT 0,
  posts_shared INTEGER DEFAULT 0,
  posts_commented INTEGER DEFAULT 0,
  posts_bookmarked INTEGER DEFAULT 0,
  
  -- Engagement received
  likes_received INTEGER DEFAULT 0,
  shares_received INTEGER DEFAULT 0,
  comments_received INTEGER DEFAULT 0,
  bookmarks_received INTEGER DEFAULT 0,
  views_received INTEGER DEFAULT 0,
  
  -- Platform breakdown
  platform_breakdown JSONB DEFAULT '{}',
  
  -- Audience metrics
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date, user_id)
);

-- Content Performance Analytics
CREATE TABLE IF NOT EXISTS content_performance_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type VARCHAR(50) NOT NULL,
  content_id UUID NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  
  -- Performance metrics
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  bookmarks INTEGER DEFAULT 0,
  
  -- Sharing breakdown
  social_shares JSONB DEFAULT '{}', -- Breakdown by platform
  
  -- Audience data
  audience_demographics JSONB DEFAULT '{}',
  audience_locations JSONB DEFAULT '{}',
  
  -- Engagement quality
  avg_view_duration DECIMAL(8,2) DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(content_type, content_id, date)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Community Posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_community_posts_is_public ON community_posts(is_public);
CREATE INDEX IF NOT EXISTS idx_community_posts_media_type ON community_posts(media_type);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_community_posts_hashtags ON community_posts USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_community_posts_search ON community_posts USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_community_posts_engagement ON community_posts(likes_count, shares_count, comments_count);

-- Post Interactions indexes
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_post_interactions_created_at ON post_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_post_interactions_platform ON post_interactions(share_platform);

-- Post Comments indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent_id ON post_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at);

-- Sharing Analytics indexes
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_content ON sharing_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_shared_by ON sharing_analytics(shared_by);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_platform ON sharing_analytics(platform);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_created_at ON sharing_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_sharing_analytics_performance ON sharing_analytics(clicks_count, conversions_count);

-- Creator Profiles indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_rating ON creator_profiles(rating);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_availability ON creator_profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_specialties ON creator_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_location ON creator_profiles(location);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_verified ON creator_profiles(is_verified, is_pro);

-- Creator Reviews indexes
CREATE INDEX IF NOT EXISTS idx_creator_reviews_creator_id ON creator_reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_rating ON creator_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_creator_reviews_created_at ON creator_reviews(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_social_engagement_date_user ON social_engagement_analytics(date, user_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_content ON content_performance_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_date ON content_performance_analytics(date);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update post engagement counts
CREATE OR REPLACE FUNCTION update_post_engagement_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment count
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
    -- Decrement count
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

-- Function to update comment counts
CREATE OR REPLACE FUNCTION update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment comment count on post
    UPDATE community_posts 
    SET comments_count = comments_count + 1, updated_at = NOW()
    WHERE id = NEW.post_id;
    
    -- If this is a reply, increment parent comment replies count
    IF NEW.parent_comment_id IS NOT NULL THEN
      UPDATE post_comments
      SET replies_count = replies_count + 1, updated_at = NOW()
      WHERE id = NEW.parent_comment_id;
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement comment count on post
    UPDATE community_posts 
    SET comments_count = GREATEST(comments_count - 1, 0), updated_at = NOW()
    WHERE id = OLD.post_id;
    
    -- If this was a reply, decrement parent comment replies count
    IF OLD.parent_comment_id IS NOT NULL THEN
      UPDATE post_comments
      SET replies_count = GREATEST(replies_count - 1, 0), updated_at = NOW()
      WHERE id = OLD.parent_comment_id;
    END IF;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment counts
CREATE TRIGGER trigger_update_comment_counts
  AFTER INSERT OR DELETE ON post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_counts();

-- Function to update search vector for posts
CREATE OR REPLACE FUNCTION update_post_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.hashtags, ' '), '')), 'C');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for post search vector
CREATE TRIGGER trigger_update_post_search_vector
  BEFORE INSERT OR UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_search_vector();

-- Function to update creator rating
CREATE OR REPLACE FUNCTION update_creator_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  review_count INTEGER;
BEGIN
  -- Calculate new average rating and count
  SELECT 
    ROUND(AVG(rating)::NUMERIC, 2),
    COUNT(*)
  INTO avg_rating, review_count
  FROM creator_reviews 
  WHERE creator_id = COALESCE(NEW.creator_id, OLD.creator_id);
  
  -- Update creator profile
  UPDATE creator_profiles 
  SET 
    rating = COALESCE(avg_rating, 0),
    total_reviews = review_count,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.creator_id, OLD.creator_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for creator rating updates
CREATE TRIGGER trigger_update_creator_rating
  AFTER INSERT OR UPDATE OR DELETE ON creator_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creator_rating();

-- ============================================================================
-- SECURITY (ROW LEVEL SECURITY)
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sharing_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_performance_analytics ENABLE ROW LEVEL SECURITY;

-- Community Posts RLS Policies
CREATE POLICY "Users can view public posts" ON community_posts FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view their own posts" ON community_posts FOR SELECT USING (author_id = auth.uid());
CREATE POLICY "Users can create posts" ON community_posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can delete their own posts" ON community_posts FOR DELETE USING (author_id = auth.uid());

-- Post Interactions RLS Policies
CREATE POLICY "Users can view interactions on public posts" ON post_interactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_posts WHERE id = post_id AND (is_public = true OR author_id = auth.uid()))
);
CREATE POLICY "Users can create interactions" ON post_interactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own interactions" ON post_interactions FOR DELETE USING (user_id = auth.uid());

-- Post Comments RLS Policies
CREATE POLICY "Users can view comments on public posts" ON post_comments FOR SELECT USING (
  EXISTS (SELECT 1 FROM community_posts WHERE id = post_id AND (is_public = true OR author_id = auth.uid()))
);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON post_comments FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON post_comments FOR DELETE USING (author_id = auth.uid());

-- Creator Profiles RLS Policies
CREATE POLICY "Anyone can view creator profiles" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own creator profile" ON creator_profiles FOR ALL USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Creator Reviews RLS Policies
CREATE POLICY "Anyone can view reviews" ON creator_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON creator_reviews FOR INSERT WITH CHECK (reviewer_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON creator_reviews FOR UPDATE USING (reviewer_id = auth.uid()) WITH CHECK (reviewer_id = auth.uid());

-- Sharing Analytics RLS Policies
CREATE POLICY "Users can view their own sharing analytics" ON sharing_analytics FOR SELECT USING (shared_by = auth.uid());
CREATE POLICY "Users can create sharing analytics" ON sharing_analytics FOR INSERT WITH CHECK (shared_by = auth.uid() OR shared_by IS NULL);

-- Social Engagement Analytics RLS Policies
CREATE POLICY "Users can view their own engagement analytics" ON social_engagement_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own engagement analytics" ON social_engagement_analytics FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample creator profiles (only if they don't exist)
INSERT INTO creator_profiles (id, professional_title, specialties, years_experience, hourly_rate, rating, total_reviews, is_verified)
SELECT 
  id,
  'Creative Professional',
  ARRAY['Design', 'Video', 'Photography'],
  5,
  75.00,
  4.8,
  24,
  true
FROM auth.users 
WHERE email = 'demo@freeflowzee.com'
ON CONFLICT (id) DO NOTHING;

-- Insert sample community posts
DO $$
DECLARE
  demo_user_id UUID;
BEGIN
  SELECT id INTO demo_user_id FROM auth.users WHERE email = 'demo@freeflowzee.com' LIMIT 1;
  
  IF demo_user_id IS NOT NULL THEN
    INSERT INTO community_posts (author_id, content, media_type, tags, likes_count, shares_count, comments_count)
    VALUES 
      (demo_user_id, 'Just finished an amazing brand identity project! 🎨 The creative process was incredibly fulfilling.', 'text', ARRAY['branding', 'design', 'identity'], 42, 12, 8),
      (demo_user_id, 'Behind the scenes of our latest video production. The energy on set was incredible! 🎬', 'image', ARRAY['video', 'production', 'bts'], 67, 23, 15)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'FreeflowZee Database Update Complete! ✅';
  RAISE NOTICE '';
  RAISE NOTICE 'New Features Added:';
  RAISE NOTICE '✅ Community Posts & Social Wall';
  RAISE NOTICE '✅ Post Interactions (likes, shares, bookmarks)';
  RAISE NOTICE '✅ Threaded Comments System';
  RAISE NOTICE '✅ Enhanced Sharing Analytics';
  RAISE NOTICE '✅ Creator Profiles & Marketplace';
  RAISE NOTICE '✅ Social Engagement Analytics';
  RAISE NOTICE '✅ Content Performance Tracking';
  RAISE NOTICE '✅ Comprehensive RLS Security';
  RAISE NOTICE '';
  RAISE NOTICE 'All features are now ready for production! 🚀';
END $$; 