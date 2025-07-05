'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function generateAiMetadataAction(videoId: string) {
  if (!videoId) {
    return { error: 'Video ID is required.' };
  }

  const supabase = createClient();

  // 1. Check if the current user has permission to edit the video.
  // This is a crucial security step. We'll rely on RLS to enforce this,
  // but an explicit check is good practice.
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('id')
    .eq('id', videoId)
    .single();

  if (videoError) {
    // RLS will prevent row from being returned if user does not have access.
    return { error: 'You do not have permission to perform this action.' };
  }

  // 2. Call the database function to trigger the Edge Function.
  const { error: rpcError } = await supabase.rpc('generate_ai_metadata', {
    video_id_to_process: videoId,
  });

  if (rpcError) {
    console.error('RPC Error:', rpcError);
    return { error: 'Failed to start AI metadata generation.' };
  }

  // 3. Revalidate the path to ensure the client gets updated data
  // once the async process is complete and the page is refreshed.
  revalidatePath(`/video/${videoId}`);

  return { success: 'AI metadata generation has been started. It may take a few moments to complete.' };
} 