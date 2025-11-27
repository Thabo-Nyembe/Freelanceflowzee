-- Minimal Community Hub Schema
--
-- Community platform for networking, posts, groups, and events:
-- - Member profiles with skills, ratings, and stats
-- - Posts with likes and comments
-- - Groups with membership management
-- - Events with attendees
-- - Connections/networking system

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS post_type CASCADE;
DROP TYPE IF EXISTS post_visibility CASCADE;
DROP TYPE IF EXISTS member_category CASCADE;
DROP TYPE IF EXISTS member_availability CASCADE;
DROP TYPE IF EXISTS group_type CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;

-- Post types
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

-- Post visibility levels
CREATE TYPE post_visibility AS ENUM (
  'public',
  'connections',
  'private'
);

-- Member categories
CREATE TYPE member_category AS ENUM (
  'freelancer',
  'client',
  'agency',
  'student'
);

-- Member availability status
CREATE TYPE member_availability AS ENUM (
  'available',
  'busy',
  'away',
  'offline'
);

-- Group types
CREATE TYPE group_type AS ENUM (
  'public',
  'private',
  'secret'
);

-- Event types
CREATE TYPE event_type AS ENUM (
  'online',
  'offline',
  'hybrid'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS community_connections CASCADE;
DROP TABLE IF EXISTS community_event_attendees CASCADE;
DROP TABLE IF EXISTS community_events CASCADE;
DROP TABLE IF EXISTS community_group_members CASCADE;
DROP TABLE IF EXISTS community_groups CASCADE;
DROP TABLE IF EXISTS community_comments CASCADE;
DROP TABLE IF EXISTS community_post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_members CASCADE;

-- Community member profiles
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

-- Community posts
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

-- Post likes
CREATE TABLE community_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Post comments (threaded)
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

-- Community groups
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

-- Group membership
CREATE TABLE community_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  is_pending BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, member_id)
);

-- Community events
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

-- Event attendees
CREATE TABLE community_event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES community_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES community_members(id) ON DELETE CASCADE,
  is_attending BOOLEAN DEFAULT true,
  is_interested BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, member_id)
);

-- User connections/network
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
CREATE INDEX IF NOT EXISTS idx_community_members_user_id ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_category ON community_members(category);
CREATE INDEX IF NOT EXISTS idx_community_members_availability ON community_members(availability);
CREATE INDEX IF NOT EXISTS idx_community_members_is_online ON community_members(is_online);
CREATE INDEX IF NOT EXISTS idx_community_members_is_verified ON community_members(is_verified);
CREATE INDEX IF NOT EXISTS idx_community_members_rating ON community_members(rating DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_skills ON community_members USING gin(skills);

-- community_posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(type);
CREATE INDEX IF NOT EXISTS idx_community_posts_visibility ON community_posts(visibility);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_likes_count ON community_posts(likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_tags ON community_posts USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_community_posts_hashtags ON community_posts USING gin(hashtags);

-- community_post_likes indexes
CREATE INDEX IF NOT EXISTS idx_community_post_likes_post_id ON community_post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_likes_user_id ON community_post_likes(user_id);

-- community_comments indexes
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id ON community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON community_comments(created_at DESC);

-- community_groups indexes
CREATE INDEX IF NOT EXISTS idx_community_groups_type ON community_groups(type);
CREATE INDEX IF NOT EXISTS idx_community_groups_category ON community_groups(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_member_count ON community_groups(member_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_groups_created_at ON community_groups(created_at DESC);

-- community_group_members indexes
CREATE INDEX IF NOT EXISTS idx_community_group_members_group_id ON community_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_community_group_members_member_id ON community_group_members(member_id);

-- community_events indexes
CREATE INDEX IF NOT EXISTS idx_community_events_organizer_id ON community_events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_community_events_type ON community_events(type);
CREATE INDEX IF NOT EXISTS idx_community_events_event_date ON community_events(event_date);
CREATE INDEX IF NOT EXISTS idx_community_events_category ON community_events(category);

-- community_event_attendees indexes
CREATE INDEX IF NOT EXISTS idx_community_event_attendees_event_id ON community_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_community_event_attendees_member_id ON community_event_attendees(member_id);

-- community_connections indexes
CREATE INDEX IF NOT EXISTS idx_community_connections_requester_id ON community_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_community_connections_recipient_id ON community_connections(recipient_id);
CREATE INDEX IF NOT EXISTS idx_community_connections_status ON community_connections(status);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_community_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_community_members_updated_at
  BEFORE UPDATE ON community_members
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

CREATE TRIGGER trigger_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

CREATE TRIGGER trigger_community_comments_updated_at
  BEFORE UPDATE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

CREATE TRIGGER trigger_community_groups_updated_at
  BEFORE UPDATE ON community_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

CREATE TRIGGER trigger_community_events_updated_at
  BEFORE UPDATE ON community_events
  FOR EACH ROW
  EXECUTE FUNCTION update_community_updated_at();

-- Auto-update post like counts
CREATE OR REPLACE FUNCTION update_post_like_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_post_like_counts
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_counts();
