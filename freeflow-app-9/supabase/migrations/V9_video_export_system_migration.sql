-- Video Export System Migration

-- Create enums
CREATE TYPE video_export_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE video_export_quality AS ENUM ('low', 'medium', 'high', 'source');
CREATE TYPE video_export_format AS ENUM ('mp4', 'mov', 'webm');

-- Create video_exports table
CREATE TABLE video_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status video_export_status NOT NULL DEFAULT 'pending',
  format video_export_format NOT NULL,
  quality video_export_quality NOT NULL,
  output_url TEXT,
  error_message TEXT,
  export_settings JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create export_presets table
CREATE TABLE export_presets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format video_export_format NOT NULL,
  quality video_export_quality NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, name)
);

-- Create indexes
CREATE INDEX video_exports_video_id_idx ON video_exports(video_id);
CREATE INDEX video_exports_user_id_idx ON video_exports(user_id);
CREATE INDEX video_exports_status_idx ON video_exports(status);
CREATE INDEX export_presets_user_id_idx ON export_presets(user_id);
CREATE INDEX export_presets_is_default_idx ON export_presets(is_default);

-- Create RLS policies
ALTER TABLE video_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own exports"
  ON video_exports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exports"
  ON video_exports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exports"
  ON video_exports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own presets"
  ON export_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presets"
  ON export_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presets"
  ON export_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presets"
  ON export_presets FOR DELETE
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_exports_updated_at
  BEFORE UPDATE ON video_exports
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_export_presets_updated_at
  BEFORE UPDATE ON export_presets
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- Create trigger to ensure only one default preset per user
CREATE OR REPLACE FUNCTION handle_default_preset()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default THEN
    UPDATE export_presets
    SET is_default = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER ensure_single_default_preset
  BEFORE INSERT OR UPDATE ON export_presets
  FOR EACH ROW
  EXECUTE PROCEDURE handle_default_preset(); 