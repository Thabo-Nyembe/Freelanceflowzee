-- ============================================================================
-- COMMUNITY HUB SYSTEM - SUPABASE MIGRATION
-- Complete community platform with social networking
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE post_type AS ENUM (
  'text',
  'image',
  'video',
  'link',
  'poll',
  'event',
  'job',
  'showcase'
);

CREATE TYPE post_visibility AS ENUM (
  'public',
  'connections',
  'private'
);

CREATE TYPE member_category AS ENUM (
  'freelancer',
  'client',
  'agency',
  'student'
);

CREATE TYPE member_availability AS ENUM (
  'available',
  'busy',
  'away',
  'offline'
);

CREATE TYPE group_type AS ENUM (
  'public',
  'private',
  'secret'
);

CREATE TYPE event_type AS ENUM (
  'online',
  'offline',
  'hybrid'
);

-- ============================================================================
-- TABLE: community_members
-- ============================================================================

CREATE TABLE community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  is_online BOOLEAN DEFAULT false,
  bio TEXT,
  total_projects INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0,
  completion_rate INTEGER DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  response_time TEXT,
  languages TEXT[] DEFAULT ARRAY[]::TEXT[],
  certifications TEXT[] DEFAULT ARRAY[]::TEXT[],
  portfolio_url TEXT,
  is_connected BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  is_following BOOLEAN DEFAULT false,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  category member_category NOT NULL DEFAULT 'freelancer',
  availability member_availability NOT NULL DEFAULT 'available',
  hourly_rate DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  timezone TEXT DEFAULT 'UTC',
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  badges TEXT[] DEFAULT ARRAY[]::TEXT[],
  achievements TEXT[] DEFAULT ARRAY[]::TEXT[],
  endorsements INTEGER DEFAULT 0,
  testimonials INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_posts
-- ============================================================================

CREATE TABLE community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type post_type NOT NULL DEFAULT 'text',
  visibility post_visibility NOT NULL DEFAULT 'public',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  bookmarks_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  hashtags TEXT[] DEFAULT ARRAY[]::TEXT[],
  mentions UUID[] DEFAULT ARRAY[]::UUID[],
  is_pinned BOOLEAN DEFAULT false,
  is_promoted BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_post_likes
-- ============================================================================

CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ============================================================================
-- TABLE: community_comments
-- ============================================================================

CREATE TABLE community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_groups
-- ============================================================================

CREATE TABLE community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  avatar TEXT,
  cover_image TEXT,
  category TEXT NOT NULL,
  type group_type NOT NULL DEFAULT 'public',
  member_count INTEGER DEFAULT 0,
  admin_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_premium BOOLEAN DEFAULT false,
  rating DECIMAL(3, 2) DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_group_members
-- ============================================================================

CREATE TABLE community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_pending BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- ============================================================================
-- TABLE: community_events
-- ============================================================================

CREATE TABLE community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  type event_type NOT NULL DEFAULT 'online',
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  max_attendees INTEGER,
  price DECIMAL(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  attendee_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TABLE: community_event_attendees
-- ============================================================================

CREATE TABLE community_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  is_attending BOOLEAN DEFAULT true,
  is_interested BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- ============================================================================
-- TABLE: community_connections
-- ============================================================================

CREATE TABLE community_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(requester_id, recipient_id),
  CHECK (requester_id != recipient_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- community_members indexes
CREATE INDEX idx_community_members_user_id ON community_members(user_id);
CREATE INDEX idx_community_members_category ON community_members(category);
CREATE INDEX idx_community_members_availability ON community_members(availability);
CREATE INDEX idx_community_members_is_online ON community_members(is_online);
CREATE INDEX idx_community_members_is_verified ON community_members(is_verified);
CREATE INDEX idx_community_members_rating ON community_members(rating DESC);
CREATE INDEX idx_community_members_name_trgm ON community_members USING gin(name gin_trgm_ops);
CREATE INDEX idx_community_members_skills ON community_members USING gin(skills);

-- community_posts indexes
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_type ON community_posts(type);
CREATE INDEX idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX idx_community_posts_likes_count ON community_posts(likes_count DESC);
CREATE INDEX idx_community_posts_tags ON community_posts USING gin(tags);
CREATE INDEX idx_community_posts_hashtags ON community_posts USING gin(hashtags);

-- community_post_likes indexes
CREATE INDEX idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX idx_community_post_likes_user_id ON community_post_likes(user_id);

-- community_comments indexes
CREATE INDEX idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX idx_community_comments_author_id ON community_comments(author_id);
CREATE INDEX idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX idx_community_comments_created_at ON community_comments(created_at DESC);

-- community_groups indexes
CREATE INDEX idx_community_groups_type ON community_groups(type);
CREATE INDEX idx_community_groups_category ON community_groups(category);
CREATE INDEX idx_community_groups_member_count ON community_groups(member_count DESC);
CREATE INDEX idx_community_groups_created_at ON community_groups(created_at DESC);

-- community_group_members indexes
CREATE INDEX idx_community_group_members_group_id ON community_group_members(group_id);
CREATE INDEX idx_community_group_members_member_id ON community_group_members(member_id);

-- community_events indexes
CREATE INDEX idx_community_events_organizer_id ON community_events(organizer_id);
CREATE INDEX idx_community_events_type ON community_events(type);
CREATE INDEX idx_community_events_event_date ON community_events(event_date);
CREATE INDEX idx_community_events_category ON community_events(category);

-- community_event_attendees indexes
CREATE INDEX idx_community_event_attendees_event_id ON community_event_attendees(event_id);
CREATE INDEX idx_community_event_attendees_member_id ON community_event_attendees(member_id);

-- community_connections indexes
CREATE INDEX idx_community_connections_requester_id ON community_connections(requester_id);
CREATE INDEX idx_community_connections_recipient_id ON community_connections(recipient_id);
CREATE INDEX idx_community_connections_status ON community_connections(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;

-- community_members policies
CREATE POLICY "Anyone can view community members"
  ON community_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON community_members FOR UPDATE
  USING (auth.uid() = user_id);

-- community_posts policies
CREATE POLICY "Anyone can view public posts"
  ON community_posts FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view their own posts"
  ON community_posts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_posts.author_id
    AND community_members.user_id = auth.uid()
  ));

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_posts.author_id
    AND community_members.user_id = auth.uid()
  ));

-- community_post_likes policies
CREATE POLICY "Users can like posts"
  ON community_post_likes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM community_members
    WHERE community_members.id = community_post_likes.user_id
    AND community_members.user_id = auth.uid()
  ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_members_updated_at
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update post likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes_count
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_likes_count();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get trending posts
CREATE OR REPLACE FUNCTION get_trending_posts(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  content TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  shares_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.content,
    p.likes_count,
    p.comments_count,
    p.shares_count
  FROM community_posts p
  WHERE p.visibility = 'public'
  ORDER BY (p.likes_count + p.comments_count + p.shares_count) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Search community members
CREATE OR REPLACE FUNCTION search_community_members(
  p_search_term TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  title TEXT,
  rating DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.name,
    m.title,
    m.rating
  FROM community_members m
  WHERE
    m.name ILIKE '%' || p_search_term || '%'
    OR m.title ILIKE '%' || p_search_term || '%'
    OR p_search_term = ANY(m.skills)
  ORDER BY m.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get member statistics
CREATE OR REPLACE FUNCTION get_member_statistics(p_member_id UUID)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'total_posts', COUNT(DISTINCT p.id),
      'total_likes', COALESCE(SUM(p.likes_count), 0),
      'total_comments', COALESCE(SUM(p.comments_count), 0),
      'total_shares', COALESCE(SUM(p.shares_count), 0)
    )
    FROM community_posts p
    WHERE p.author_id = p_member_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
