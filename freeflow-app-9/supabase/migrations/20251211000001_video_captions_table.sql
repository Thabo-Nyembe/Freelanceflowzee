-- Video Captions Table Migration
-- Stores transcription and caption data for video projects

-- STEP 1: Force drop the table completely
DROP TABLE IF EXISTS public.video_captions CASCADE;

-- STEP 2: Create video_captions table
CREATE TABLE public.video_captions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'en',
  is_translation BOOLEAN DEFAULT false,
  source_language VARCHAR(10),
  format VARCHAR(10) NOT NULL DEFAULT 'srt',
  file_path TEXT NOT NULL,
  transcription_text TEXT,
  word_count INTEGER DEFAULT 0,
  segment_count INTEGER DEFAULT 0,
  duration DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_video_captions_project FOREIGN KEY (project_id) REFERENCES public.video_projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_video_captions_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT unique_caption_per_project_language UNIQUE(project_id, language)
);

-- STEP 3: Create indexes
CREATE INDEX idx_video_captions_project_id ON public.video_captions(project_id);
CREATE INDEX idx_video_captions_user_id ON public.video_captions(user_id);
CREATE INDEX idx_video_captions_language ON public.video_captions(language);

-- STEP 4: Enable RLS
ALTER TABLE public.video_captions ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create policies (referencing user_id column explicitly)
CREATE POLICY "video_captions_select_policy"
  ON public.video_captions
  FOR SELECT
  USING (auth.uid() = video_captions.user_id);

CREATE POLICY "video_captions_insert_policy"
  ON public.video_captions
  FOR INSERT
  WITH CHECK (auth.uid() = video_captions.user_id);

CREATE POLICY "video_captions_update_policy"
  ON public.video_captions
  FOR UPDATE
  USING (auth.uid() = video_captions.user_id);

CREATE POLICY "video_captions_delete_policy"
  ON public.video_captions
  FOR DELETE
  USING (auth.uid() = video_captions.user_id);

-- STEP 6: Add columns to video_projects
DO $$
BEGIN
  ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS has_captions BOOLEAN DEFAULT false;
  ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS caption_language VARCHAR(10);
  ALTER TABLE public.video_projects ADD COLUMN IF NOT EXISTS transcription_data JSONB;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Some columns may already exist';
END $$;

-- STEP 7: Create trigger
CREATE OR REPLACE FUNCTION public.update_video_captions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS video_captions_updated_at ON public.video_captions;
CREATE TRIGGER video_captions_updated_at
  BEFORE UPDATE ON public.video_captions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_video_captions_updated_at();

-- STEP 8: Grant permissions
GRANT ALL ON public.video_captions TO authenticated;
GRANT ALL ON public.video_captions TO service_role;
