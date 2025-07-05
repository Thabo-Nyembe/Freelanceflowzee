import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { CreateShareTokenInput } from '@/lib/types/video-security';
import { randomBytes } from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { id: video_id } = params;

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate request body
  const { expires_at, max_usage }: CreateShareTokenInput = await request.json();

  // 3. Check if current user is the owner of the video
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('user_id')
    .eq('id', video_id)
    .single();

  if (videoError || video.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Generate a secure, URL-friendly token
  const token = randomBytes(24).toString('hex');

  // 5. Create the share token record
  const { data: shareToken, error: tokenError } = await supabase
    .from('secure_share_tokens')
    .insert({
      video_id,
      token,
      created_by: user.id,
      expires_at,
      max_usage,
    })
    .select()
    .single();

  if (tokenError) {
    console.error('Error creating share token:', tokenError);
    return NextResponse.json({ error: 'Failed to create share token' }, { status: 500 });
  }

  // 6. Construct the shareable URL
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`;

  return NextResponse.json({ ...shareToken, shareUrl });
} 