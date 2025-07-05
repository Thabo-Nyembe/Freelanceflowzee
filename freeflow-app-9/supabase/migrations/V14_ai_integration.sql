-- AI Integration Migration

-- Add a JSONB column to store AI-generated metadata
ALTER TABLE public.videos
ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- Create a function to trigger AI metadata generation
-- This function will invoke a Supabase Edge Function
CREATE OR REPLACE FUNCTION generate_ai_metadata(video_id_to_process UUID)
RETURNS void AS $$
DECLARE
  -- Get the URL of the edge function from private settings
  edge_function_url text := '{{ .SUPABASE_URL }}/functions/v1/generate-ai-metadata';
  -- Get the service role key from secrets
  service_role_key text := '{{ .SUPABASE_SERVICE_ROLE_KEY }}';
BEGIN
  -- We perform a non-blocking HTTP request to our edge function.
  -- The actual processing will happen asynchronously.
  PERFORM net.http_post(
    url := edge_function_url,
    body := jsonb_build_object('video_id', video_id_to_process),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Optional: Add a trigger to automatically generate metadata on new video uploads
-- that have a 'ready' status and a transcript.
-- This might be better handled by the application logic to avoid unintended costs.
-- CREATE OR REPLACE FUNCTION handle_new_video_for_ai()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.status = 'ready' AND NEW.transcript IS NOT NULL THEN
--     PERFORM generate_ai_metadata(NEW.id);
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_ai_metadata_on_new_video
--   AFTER INSERT ON videos
--   FOR EACH ROW
--   EXECUTE FUNCTION handle_new_video_for_ai(); 