import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface VideoSettingsUpdate {
  isPublic?: boolean;
  passwordProtected?: boolean;
  password?: string;
  allowEmbedding?: boolean;
  allowDownload?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const updates: VideoSettingsUpdate = await request.json();

    // Validate video exists and user owns it
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, owner_id')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this video' },
        { status: 403 }
      );
    }

    // Prepare update object
    const updateData: any = {};

    if (updates.isPublic !== undefined) {
      updateData.is_public = updates.isPublic;
    }

    if (updates.passwordProtected !== undefined) {
      updateData.password_protected = updates.passwordProtected;
    }

    if (updates.password !== undefined) {
      updateData.password = updates.password || null;
    }

    if (updates.allowEmbedding !== undefined) {
      updateData.allow_embedding = updates.allowEmbedding;
    }

    if (updates.allowDownload !== undefined) {
      updateData.allow_download = updates.allowDownload;
    }

    // If making video private, ensure embedding is also disabled
    if (updates.isPublic === false) {
      updateData.allow_embedding = false;
      updateData.password_protected = false;
      updateData.password = null;
    }

    // If disabling password protection, clear the password
    if (updates.passwordProtected === false) {
      updateData.password = null;
    }

    // Update video settings
    const { data: updatedVideo, error: updateError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select('id, is_public, password_protected, allow_embedding, allow_download')
      .single();

    if (updateError) {
      console.error('Error updating video settings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update video settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      video: updatedVideo
    });

  } catch (error) {
    console.error('Error in video settings update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get video settings
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('id, is_public, password_protected, allow_embedding, allow_download, owner_id')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    if (video.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this video' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      isPublic: video.is_public,
      passwordProtected: video.password_protected,
      allowEmbedding: video.allow_embedding,
      allowDownload: video.allow_download
    });

  } catch (error) {
    console.error('Error fetching video settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 