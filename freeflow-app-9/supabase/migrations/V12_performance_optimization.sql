-- Performance Optimization Migration

-- Add indexes to frequently queried columns on the videos table
CREATE INDEX CONCURRENTLY IF NOT EXISTS videos_user_id_idx ON public.videos(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS videos_project_id_idx ON public.videos(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS videos_status_idx ON public.videos(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS videos_created_at_idx ON public.videos(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS videos_is_public_idx ON public.videos(is_public);

-- Add index for comments table
CREATE INDEX CONCURRENTLY IF NOT EXISTS comments_video_id_user_id_idx ON public.comments(video_id, user_id);

-- Add index for analytics table if it exists
DO $$
BEGIN
   IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'video_analytics') THEN
      CREATE INDEX CONCURRENTLY IF NOT EXISTS video_analytics_video_id_event_type_idx ON public.video_analytics(video_id, event_type);
   END IF;
END
$$;

-- Note on CONCURRENTLY:
-- Using CREATE INDEX CONCURRENTLY allows creating indexes without locking the table,
-- which is crucial for a production environment to avoid downtime.
-- This command may take longer to complete but is non-blocking. 