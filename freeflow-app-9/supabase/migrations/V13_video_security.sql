-- Video Security Migration

-- 1. Create a table for video permissions
CREATE TABLE IF NOT EXISTS public.video_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'comment', 'edit')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(video_id, user_id) -- A user can only have one permission level per video
);

CREATE INDEX IF NOT EXISTS video_permissions_video_id_idx ON public.video_permissions(video_id);
CREATE INDEX IF NOT EXISTS video_permissions_user_id_idx ON public.video_permissions(user_id);

-- 2. Create a table for secure sharing tokens
CREATE TABLE IF NOT EXISTS public.secure_share_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token TEXT NOT NULL UNIQUE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    max_usage INT, -- NULL for unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS secure_share_tokens_video_id_idx ON public.secure_share_tokens(video_id);
CREATE INDEX IF NOT EXISTS secure_share_tokens_token_idx ON public.secure_share_tokens(token);


-- 3. RLS Policies for new tables

-- RLS for video_permissions
ALTER TABLE public.video_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage permissions for their videos"
    ON public.video_permissions
    FOR ALL
    USING (
        (SELECT user_id FROM public.videos WHERE id = video_permissions.video_id) = auth.uid()
    );

CREATE POLICY "Users can view permissions granted to them"
    ON public.video_permissions
    FOR SELECT
    USING (user_id = auth.uid());


-- RLS for secure_share_tokens
ALTER TABLE public.secure_share_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage share tokens for their videos"
    ON public.secure_share_tokens
    FOR ALL
    USING (
        (SELECT user_id FROM public.videos WHERE id = secure_share_tokens.video_id) = auth.uid()
    );

-- 4. Update RLS policy on 'videos' table to check for permissions
-- We need a helper function to check permissions
CREATE OR REPLACE FUNCTION can_view_video(video_id_to_check UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_public BOOLEAN;
  is_owner BOOLEAN;
  has_permission BOOLEAN;
BEGIN
  -- Check if video is public
  SELECT v.is_public INTO is_public FROM public.videos v WHERE v.id = video_id_to_check;
  IF is_public THEN
    RETURN TRUE;
  END IF;

  -- If user is not logged in, they can only see public videos
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is the owner
  SELECT (v.user_id = auth.uid()) INTO is_owner FROM public.videos v WHERE v.id = video_id_to_check;
  IF is_owner THEN
    RETURN TRUE;
  END IF;

  -- Check if user has explicit view permission (or higher)
  SELECT EXISTS (
    SELECT 1 FROM public.video_permissions vp
    WHERE vp.video_id = video_id_to_check AND vp.user_id = auth.uid() AND vp.permission_level IN ('view', 'comment', 'edit')
  ) INTO has_permission;

  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop old select policy if it exists and create a new one
DROP POLICY IF EXISTS "Users can view their own videos or public videos" ON public.videos;
DROP POLICY IF EXISTS "Authenticated users can see public or owned videos" ON public.videos;
DROP POLICY IF EXISTS "Anyone can select public videos" ON public.videos;
DROP POLICY IF EXISTS "Users can select their own videos" ON public.videos;


CREATE POLICY "Users can view videos if they are public, owner, or have permission"
    ON public.videos
    FOR SELECT
    USING (can_view_video(id));

-- Update edit/update policy to include users with 'edit' permission
DROP POLICY IF EXISTS "Users can update their own videos" ON public.videos;
CREATE POLICY "Users with edit permissions can update videos"
    ON public.videos
    FOR UPDATE
    USING (
        (user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.video_permissions
            WHERE video_id = videos.id AND user_id = auth.uid() AND permission_level = 'edit'
        )
    );

-- Update delete policy (only owners should delete)
DROP POLICY IF EXISTS "Users can delete their own videos" ON public.videos;
CREATE POLICY "Only owners can delete their videos"
    ON public.videos
    FOR DELETE
    USING (user_id = auth.uid());

-- Update insert policy (remains the same)
DROP POLICY IF EXISTS "Users can insert their own videos" ON public.videos;
CREATE POLICY "Users can insert videos for themselves"
    ON public.videos
    FOR INSERT
    WITH CHECK (user_id = auth.uid()); 