-- Migration: Add feature notifications and requests tables
-- Created: 2026-02-03
-- Purpose: Support coming-soon page feature notification subscriptions and feature requests

-- Feature Notifications Table
CREATE TABLE IF NOT EXISTS feature_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  feature TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT feature_notifications_email_or_user CHECK (
    email IS NOT NULL OR user_id IS NOT NULL
  )
);

-- Feature Requests Table
CREATE TABLE IF NOT EXISTS feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  feature_request TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewing', 'planned', 'in_progress', 'completed', 'rejected')),
  votes INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feature_notifications_user_id ON feature_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_notifications_email ON feature_notifications(email);
CREATE INDEX IF NOT EXISTS idx_feature_notifications_feature ON feature_notifications(feature);
CREATE INDEX IF NOT EXISTS idx_feature_notifications_status ON feature_notifications(status);

CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON feature_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_priority ON feature_requests(priority);
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes ON feature_requests(votes DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_submitted_at ON feature_requests(submitted_at DESC);

-- Row Level Security (RLS)
ALTER TABLE feature_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_notifications
CREATE POLICY "Users can view their own notifications"
  ON feature_notifications FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert their own notifications"
  ON feature_notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications"
  ON feature_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON feature_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for feature_requests
CREATE POLICY "Anyone can view feature requests"
  ON feature_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert feature requests"
  ON feature_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own feature requests"
  ON feature_requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feature requests"
  ON feature_requests FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_feature_notifications_updated_at ON feature_notifications;
CREATE TRIGGER update_feature_notifications_updated_at
  BEFORE UPDATE ON feature_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_requests_updated_at ON feature_requests;
CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE feature_notifications IS 'Stores user subscriptions for feature launch notifications';
COMMENT ON TABLE feature_requests IS 'Stores user-submitted feature requests with voting and status tracking';
COMMENT ON COLUMN feature_notifications.status IS 'Subscription status: active, unsubscribed, or bounced';
COMMENT ON COLUMN feature_requests.status IS 'Request lifecycle: submitted, reviewing, planned, in_progress, completed, rejected';
COMMENT ON COLUMN feature_requests.priority IS 'Request priority: low, normal, high, critical';
COMMENT ON COLUMN feature_requests.votes IS 'Number of upvotes from other users';
