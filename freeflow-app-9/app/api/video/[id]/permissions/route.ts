import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GrantPermissionInput } from '@/lib/types/video-security';

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
  const { email, permission_level }: GrantPermissionInput = await request.json();
  if (!email || !permission_level) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 3. Check if current user is the owner of the video
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select('user_id')
    .eq('id', video_id)
    .single();

  if (videoError || video.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 4. Find the user to grant permissions to by email
  // Note: This requires a way to look up users by email, which might need a security definer function.
  // For now, let's assume we can query the auth.users table directly or have a 'profiles' table.
  const { data: targetUser, error: targetUserError } = await supabase
    .from('users') // This might be 'profiles' in your schema
    .select('id')
    .eq('email', email)
    .single();

  if (targetUserError || !targetUser) {
    return NextResponse.json({ error: `User with email ${email} not found.` }, { status: 404 });
  }
  
  if (targetUser.id === user.id) {
    return NextResponse.json({ error: 'Cannot grant permissions to yourself.' }, { status: 400 });
  }

  // 5. Insert or update the permission
  const { data: permission, error: permissionError } = await supabase
    .from('video_permissions')
    .upsert(
      {
        video_id: video_id,
        user_id: targetUser.id,
        permission_level: permission_level,
      },
      { onConflict: 'video_id, user_id' }
    )
    .select()
    .single();

  if (permissionError) {
    console.error('Error granting permission:', permissionError);
    return NextResponse.json({ error: 'Failed to grant permission' }, { status: 500 });
  }

  return NextResponse.json(permission);
} 