-- Minimal Collaboration Feedback Schema
--
-- User feedback system for collaboration workspaces:
-- - Feedback submissions (bugs, features, improvements)
-- - Priority and status tracking
-- - Upvotes/downvotes with voting system
-- - Threaded replies
-- - Assignment to team members

-- Drop existing tables if they exist
DROP TABLE IF EXISTS collaboration_feedback_votes CASCADE;
DROP TABLE IF EXISTS collaboration_feedback_replies CASCADE;
DROP TABLE IF EXISTS collaboration_feedback CASCADE;

-- Main feedback table
CREATE TABLE collaboration_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Feedback classification
  category TEXT CHECK (category IN ('bug', 'feature', 'improvement', 'question', 'other')) DEFAULT 'other',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',

  -- Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Engagement
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  is_starred BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback replies (threaded discussions)
CREATE TABLE collaboration_feedback_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Reply content
  reply_text TEXT NOT NULL,
  is_solution BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feedback votes (upvote/downvote tracking)
CREATE TABLE collaboration_feedback_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES collaboration_feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Vote type
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure one vote per user per feedback
  UNIQUE(feedback_id, user_id)
);

-- Indexes for Collaboration Feedback
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_user_id ON collaboration_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_category ON collaboration_feedback(category);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_priority ON collaboration_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_status ON collaboration_feedback(status);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_assigned_to ON collaboration_feedback(assigned_to);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_created_at ON collaboration_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_is_starred ON collaboration_feedback(is_starred);

-- Indexes for Feedback Replies
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_replies_feedback_id ON collaboration_feedback_replies(feedback_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_replies_user_id ON collaboration_feedback_replies(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_replies_created_at ON collaboration_feedback_replies(created_at DESC);

-- Indexes for Feedback Votes
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_votes_feedback_id ON collaboration_feedback_votes(feedback_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_feedback_votes_user_id ON collaboration_feedback_votes(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collaboration_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_collaboration_feedback_updated_at
  BEFORE UPDATE ON collaboration_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_collaboration_feedback_updated_at();

-- Trigger to automatically update vote counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_feedback_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Add vote
    IF NEW.vote_type = 'up' THEN
      UPDATE collaboration_feedback SET upvotes = upvotes + 1 WHERE id = NEW.feedback_id;
    ELSE
      UPDATE collaboration_feedback SET downvotes = downvotes + 1 WHERE id = NEW.feedback_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    -- Remove vote
    IF OLD.vote_type = 'up' THEN
      UPDATE collaboration_feedback SET upvotes = upvotes - 1 WHERE id = OLD.feedback_id;
    ELSE
      UPDATE collaboration_feedback SET downvotes = downvotes - 1 WHERE id = OLD.feedback_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Change vote type
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE collaboration_feedback
      SET upvotes = upvotes - 1, downvotes = downvotes + 1
      WHERE id = NEW.feedback_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE collaboration_feedback
      SET upvotes = upvotes + 1, downvotes = downvotes - 1
      WHERE id = NEW.feedback_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feedback_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON collaboration_feedback_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_vote_counts();
