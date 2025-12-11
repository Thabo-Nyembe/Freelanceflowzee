-- User Preferences Table
-- Stores user preferences and onboarding completion status

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Onboarding status
  storage_onboarding_completed BOOLEAN DEFAULT false,
  storage_onboarding_completed_at TIMESTAMPTZ,
  storage_onboarding_skipped BOOLEAN DEFAULT false,

  -- UI preferences
  files_view_mode TEXT DEFAULT 'grid' CHECK (files_view_mode IN ('grid', 'list')),
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),

  -- Feature preferences
  auto_sync_enabled BOOLEAN DEFAULT true,
  cache_files_locally BOOLEAN DEFAULT true,
  show_hidden_files BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one preference record per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_updated_at();

-- Function to initialize user preferences on first access
CREATE OR REPLACE FUNCTION get_or_create_user_preferences(p_user_id UUID)
RETURNS user_preferences AS $$
DECLARE
  v_preferences user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO v_preferences
  FROM user_preferences
  WHERE user_id = p_user_id;

  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO user_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_preferences;
  END IF;

  RETURN v_preferences;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_or_create_user_preferences(UUID) TO authenticated;

-- Comments
COMMENT ON TABLE user_preferences IS 'Stores user preferences and onboarding completion status';
COMMENT ON COLUMN user_preferences.storage_onboarding_completed IS 'Whether user has completed storage onboarding wizard';
COMMENT ON COLUMN user_preferences.storage_onboarding_skipped IS 'Whether user skipped the onboarding wizard';
COMMENT ON COLUMN user_preferences.files_view_mode IS 'Preferred view mode for file browsing (grid or list)';
COMMENT ON COLUMN user_preferences.auto_sync_enabled IS 'Whether to automatically sync files from cloud providers';
COMMENT ON COLUMN user_preferences.cache_files_locally IS 'Whether to cache file metadata locally for faster access';
COMMENT ON COLUMN user_preferences.show_hidden_files IS 'Whether to show hidden files in file browser';
