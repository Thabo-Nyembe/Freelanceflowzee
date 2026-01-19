-- AI Transcriptions Table - FreeFlow A+++ Implementation
-- Standalone transcription storage for Voice AI Mode

-- Create transcriptions table if not exists
CREATE TABLE IF NOT EXISTS transcriptions (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('transcribe', 'translate')),
  text_content TEXT NOT NULL,
  result JSONB NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  duration DECIMAL(10, 2) NOT NULL DEFAULT 0,
  word_count INTEGER NOT NULL DEFAULT 0,
  speakers TEXT[] DEFAULT ARRAY[]::TEXT[],
  insights JSONB DEFAULT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON transcriptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transcriptions_language ON transcriptions(language);
CREATE INDEX IF NOT EXISTS idx_transcriptions_type ON transcriptions(type);

-- Full-text search index on transcription content
CREATE INDEX IF NOT EXISTS idx_transcriptions_text_search
  ON transcriptions USING gin(to_tsvector('english', text_content));

-- Enable Row Level Security
ALTER TABLE transcriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transcriptions"
  ON transcriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcriptions"
  ON transcriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcriptions"
  ON transcriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcriptions"
  ON transcriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transcriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transcriptions_updated_at
  BEFORE UPDATE ON transcriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_transcriptions_updated_at();

-- Comments
COMMENT ON TABLE transcriptions IS 'AI-powered voice transcriptions with Whisper';
COMMENT ON COLUMN transcriptions.type IS 'Type of transcription: transcribe or translate';
COMMENT ON COLUMN transcriptions.result IS 'Full transcription result including segments and timestamps';
COMMENT ON COLUMN transcriptions.insights IS 'AI-extracted insights: action items, key points, decisions';
