/**
 * OAuth User Profiles Migration
 * Creates table to store OAuth profile data from multiple providers
 * Supports: Google, GitHub, LinkedIn, Apple, Figma, GitLab, Notion, Zoom, Slack
 */

-- Drop existing table if it exists (for clean re-run)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  provider TEXT,
  provider_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_provider ON user_profiles(provider);
CREATE INDEX idx_user_profiles_provider_id ON user_profiles(provider_id);
CREATE INDEX idx_user_profiles_metadata ON user_profiles USING GIN(metadata);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Add comments for documentation
COMMENT ON TABLE user_profiles IS 'Stores user profile data synchronized from OAuth providers';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users.id - the authenticated user';
COMMENT ON COLUMN user_profiles.full_name IS 'User full name from OAuth provider';
COMMENT ON COLUMN user_profiles.avatar_url IS 'Profile picture URL from OAuth provider';
COMMENT ON COLUMN user_profiles.provider IS 'OAuth provider name (google, github, linkedin, etc)';
COMMENT ON COLUMN user_profiles.provider_id IS 'Unique user ID from OAuth provider';
COMMENT ON COLUMN user_profiles.metadata IS 'Additional provider-specific data (GitHub username, LinkedIn URL, company, location, bio, etc)';
