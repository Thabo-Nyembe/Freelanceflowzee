/**
 * Screen Recordings API - FreeFlow A+++ Implementation
 * Loom-style screen recordings management
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('recordings');

export interface RecordingPayload {
  title: string;
  description?: string;
  videoAssetId?: string;
  duration: number;
  fileSize: number;
  mimeType: string;
  resolution?: string;
  recordingType: 'screen' | 'webcam' | 'both' | 'audio';
  projectId?: string;
  isPublic?: boolean;
  password?: string;
  expiresAt?: string;
  thumbnailUrl?: string;
  transcriptEnabled?: boolean;
}

// GET - List recordings for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('projectId');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('screen_recordings')
      .select(`
        *,
        video_asset:video_assets(
          id,
          title,
          thumbnail_url,
          playback_id,
          duration
        ),
        project:projects(
          id,
          title
        ),
        views:screen_recording_views(count)
      `, { count: 'exact' })
      .eq('user_id', user.id);

    // Filter by project
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    // Search by title or description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sort
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: recordings, error, count } = await query;

    if (error) {
      logger.error('Error fetching recordings', { error });
      return NextResponse.json(
        { error: 'Failed to fetch recordings' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedRecordings = (recordings || []).map(recording => ({
      id: recording.id,
      userId: recording.user_id,
      title: recording.title,
      description: recording.description,
      videoAssetId: recording.video_asset_id,
      duration: recording.duration,
      fileSize: recording.file_size,
      mimeType: recording.mime_type,
      resolution: recording.resolution,
      recordingType: recording.recording_type,
      projectId: recording.project_id,
      isPublic: recording.is_public,
      password: recording.password ? '******' : null,
      expiresAt: recording.expires_at,
      thumbnailUrl: recording.thumbnail_url,
      transcriptEnabled: recording.transcript_enabled,
      shareUrl: recording.share_url,
      viewCount: recording.views?.[0]?.count || 0,
      createdAt: recording.created_at,
      updatedAt: recording.updated_at,
      videoAsset: recording.video_asset ? {
        id: recording.video_asset.id,
        title: recording.video_asset.title,
        thumbnailUrl: recording.video_asset.thumbnail_url,
        playbackId: recording.video_asset.playback_id,
        duration: recording.video_asset.duration,
      } : null,
      project: recording.project ? {
        id: recording.project.id,
        title: recording.project.title,
      } : null,
    }));

    return NextResponse.json({
      recordings: transformedRecordings,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    logger.error('Error in GET /api/recordings', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new recording
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: RecordingPayload = await request.json();

    // Validate required fields
    if (!body.title || !body.duration || !body.fileSize) {
      return NextResponse.json(
        { error: 'title, duration, and fileSize are required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate share URL
    const shareId = generateShareId();
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/recording/${shareId}`;

    // Create recording
    const { data: recording, error: insertError } = await supabase
      .from('screen_recordings')
      .insert({
        user_id: user.id,
        title: body.title,
        description: body.description || null,
        video_asset_id: body.videoAssetId || null,
        duration: body.duration,
        file_size: body.fileSize,
        mime_type: body.mimeType || 'video/webm',
        resolution: body.resolution || null,
        recording_type: body.recordingType || 'screen',
        project_id: body.projectId || null,
        is_public: body.isPublic || false,
        password: body.password || null,
        expires_at: body.expiresAt || null,
        thumbnail_url: body.thumbnailUrl || null,
        transcript_enabled: body.transcriptEnabled || false,
        share_id: shareId,
        share_url: shareUrl,
      })
      .select()
      .single();

    if (insertError) {
      logger.error('Error creating recording', { error: insertError });
      return NextResponse.json(
        { error: 'Failed to create recording' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedRecording = {
      id: recording.id,
      userId: recording.user_id,
      title: recording.title,
      description: recording.description,
      videoAssetId: recording.video_asset_id,
      duration: recording.duration,
      fileSize: recording.file_size,
      mimeType: recording.mime_type,
      resolution: recording.resolution,
      recordingType: recording.recording_type,
      projectId: recording.project_id,
      isPublic: recording.is_public,
      expiresAt: recording.expires_at,
      thumbnailUrl: recording.thumbnail_url,
      transcriptEnabled: recording.transcript_enabled,
      shareId: recording.share_id,
      shareUrl: recording.share_url,
      createdAt: recording.created_at,
      updatedAt: recording.updated_at,
    };

    return NextResponse.json(transformedRecording, { status: 201 });
  } catch (error) {
    logger.error('Error in POST /api/recordings', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a recording
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingRecording, error: fetchError } = await supabase
      .from('screen_recordings')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingRecording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    if (existingRecording.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Transform camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
    if (updates.password !== undefined) dbUpdates.password = updates.password;
    if (updates.expiresAt !== undefined) dbUpdates.expires_at = updates.expiresAt;
    if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.transcriptEnabled !== undefined) dbUpdates.transcript_enabled = updates.transcriptEnabled;
    if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
    dbUpdates.updated_at = new Date().toISOString();

    // Update recording
    const { data: recording, error: updateError } = await supabase
      .from('screen_recordings')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      logger.error('Error updating recording', { error: updateError });
      return NextResponse.json(
        { error: 'Failed to update recording' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedRecording = {
      id: recording.id,
      userId: recording.user_id,
      title: recording.title,
      description: recording.description,
      videoAssetId: recording.video_asset_id,
      duration: recording.duration,
      fileSize: recording.file_size,
      mimeType: recording.mime_type,
      resolution: recording.resolution,
      recordingType: recording.recording_type,
      projectId: recording.project_id,
      isPublic: recording.is_public,
      expiresAt: recording.expires_at,
      thumbnailUrl: recording.thumbnail_url,
      transcriptEnabled: recording.transcript_enabled,
      shareId: recording.share_id,
      shareUrl: recording.share_url,
      createdAt: recording.created_at,
      updatedAt: recording.updated_at,
    };

    return NextResponse.json(transformedRecording);
  } catch (error) {
    logger.error('Error in PATCH /api/recordings', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a recording
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Recording ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingRecording, error: fetchError } = await supabase
      .from('screen_recordings')
      .select('user_id, video_asset_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingRecording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    if (existingRecording.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete recording
    const { error: deleteError } = await supabase
      .from('screen_recordings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('Error deleting recording', { error: deleteError });
      return NextResponse.json(
        { error: 'Failed to delete recording' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in DELETE /api/recordings', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper: Generate unique share ID
function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
