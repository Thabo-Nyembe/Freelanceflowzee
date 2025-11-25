-- Kazi Storage Bucket RLS Policies
-- Run this in Supabase SQL Editor after creating all buckets
-- URL: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new

-- ============================================================================
-- PRIVATE BUCKET POLICIES
-- ============================================================================

-- Files Bucket Policy
CREATE POLICY "Users can manage their own files"
ON storage.objects
FOR ALL
USING (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents Bucket Policy
CREATE POLICY "Users can manage their own documents"
ON storage.objects
FOR ALL
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Videos Bucket Policy
CREATE POLICY "Users can manage their own videos"
ON storage.objects
FOR ALL
USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Exports Bucket Policy
CREATE POLICY "Users can manage their own exports"
ON storage.objects
FOR ALL
USING (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- PUBLIC BUCKET POLICIES (More permissive)
-- ============================================================================

-- Avatars Bucket Policy (Anyone can view, owners can manage)
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Images Bucket Policy (Anyone can view, owners can manage)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects
FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- NOTES
-- ============================================================================

-- This policy structure allows:
-- 1. Users to manage files in their own user folder: /{user_id}/filename.ext
-- 2. Public buckets are viewable by everyone, but only owners can modify
-- 3. Private buckets are only accessible to the owner
--
-- File path structure should be:
--   /{user_id}/optional-subfolder/filename.ext
--
-- The policy checks that the first folder name matches auth.uid()
--
-- Example upload in your app:
--   const userId = user.id
--   const filePath = `${userId}/documents/invoice.pdf`
--   await supabase.storage.from('files').upload(filePath, file)
