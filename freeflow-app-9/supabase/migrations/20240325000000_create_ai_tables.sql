-- Create enum for asset types
CREATE TYPE asset_type AS ENUM ('image', 'code', 'text', 'audio', 'video');

-- Create enum for generation status
CREATE TYPE generation_status AS ENUM ('generating', 'complete', 'failed');

-- Create enum for quality levels
CREATE TYPE quality_level AS ENUM ('draft', 'standard', 'premium');

-- Create table for AI generations
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type asset_type NOT NULL,
  prompt TEXT NOT NULL,
  settings JSONB NOT NULL,
  status generation_status NOT NULL DEFAULT 'generating',
  output TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create table for AI analysis
CREATE TABLE ai_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL,
  type TEXT NOT NULL,
  results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_generations_user_id ON ai_generations(user_id);
CREATE INDEX idx_generations_type ON ai_generations(type);
CREATE INDEX idx_generations_status ON ai_generations(status);
CREATE INDEX idx_analysis_user_id ON ai_analysis(user_id);
CREATE INDEX idx_analysis_file_id ON ai_analysis(file_id);

-- Set up Row Level Security (RLS)
ALTER TABLE ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own generations"
  ON ai_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations"
  ON ai_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON ai_generations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations"
  ON ai_generations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own analysis"
  ON ai_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis"
  ON ai_analysis FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis"
  ON ai_analysis FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis"
  ON ai_analysis FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_generations_updated_at
  BEFORE UPDATE ON ai_generations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 