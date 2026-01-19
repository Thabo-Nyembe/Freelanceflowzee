/**
 * Video Markers API - FreeFlow A+++ Implementation
 * Frame.io-style markers for chapters, bookmarks, and notes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export interface VideoMarkerPayload {
  videoId: string;
  timestampMs: number;
  durationMs?: number;
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  markerType: 'bookmark' | 'chapter' | 'note' | 'todo';
}

// GET - Fetch markers for a video
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const markerType = searchParams.get('markerType');

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
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

    // Build query
    let query = supabase
      .from('video_markers')
      .select(`
        *,
        user:users!video_markers_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .eq('video_id', videoId)
      .order('timestamp_ms', { ascending: true });

    // Filter by marker type if specified
    if (markerType) {
      query = query.eq('marker_type', markerType);
    }

    const { data: markers, error } = await query;

    if (error) {
      console.error('Error fetching markers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch markers' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedMarkers = (markers || []).map(marker => ({
      id: marker.id,
      videoId: marker.video_id,
      userId: marker.user_id,
      timestampMs: marker.timestamp_ms,
      durationMs: marker.duration_ms,
      title: marker.title,
      description: marker.description,
      color: marker.color,
      icon: marker.icon,
      markerType: marker.marker_type,
      createdAt: marker.created_at,
      updatedAt: marker.updated_at,
      user: marker.user ? {
        id: marker.user.id,
        name: marker.user.name,
        avatarUrl: marker.user.avatar_url,
      } : null,
    }));

    return NextResponse.json(transformedMarkers);
  } catch (error) {
    console.error('Error in GET /api/video-markers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new marker
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: VideoMarkerPayload = await request.json();

    // Validate required fields
    if (!body.videoId || body.timestampMs === undefined || !body.title || !body.markerType) {
      return NextResponse.json(
        { error: 'videoId, timestampMs, title, and markerType are required' },
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

    // Verify video exists and user has access
    const { data: video, error: videoError } = await supabase
      .from('video_assets')
      .select('id, user_id, is_public')
      .eq('id', body.videoId)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user has access (owner or public video)
    if (video.user_id !== user.id && !video.is_public) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Create marker
    const { data: marker, error: insertError } = await supabase
      .from('video_markers')
      .insert({
        video_id: body.videoId,
        user_id: user.id,
        timestamp_ms: body.timestampMs,
        duration_ms: body.durationMs || null,
        title: body.title,
        description: body.description || null,
        color: body.color || '#3b82f6',
        icon: body.icon || null,
        marker_type: body.markerType,
      })
      .select(`
        *,
        user:users!video_markers_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating marker:', insertError);
      return NextResponse.json(
        { error: 'Failed to create marker' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedMarker = {
      id: marker.id,
      videoId: marker.video_id,
      userId: marker.user_id,
      timestampMs: marker.timestamp_ms,
      durationMs: marker.duration_ms,
      title: marker.title,
      description: marker.description,
      color: marker.color,
      icon: marker.icon,
      markerType: marker.marker_type,
      createdAt: marker.created_at,
      updatedAt: marker.updated_at,
      user: marker.user ? {
        id: marker.user.id,
        name: marker.user.name,
        avatarUrl: marker.user.avatar_url,
      } : null,
    };

    return NextResponse.json(transformedMarker, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/video-markers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a marker
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Marker ID is required' },
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
    const { data: existingMarker, error: fetchError } = await supabase
      .from('video_markers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingMarker) {
      return NextResponse.json(
        { error: 'Marker not found' },
        { status: 404 }
      );
    }

    if (existingMarker.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Transform camelCase to snake_case
    const dbUpdates: Record<string, unknown> = {};
    if (updates.timestampMs !== undefined) dbUpdates.timestamp_ms = updates.timestampMs;
    if (updates.durationMs !== undefined) dbUpdates.duration_ms = updates.durationMs;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
    if (updates.markerType !== undefined) dbUpdates.marker_type = updates.markerType;
    dbUpdates.updated_at = new Date().toISOString();

    // Update marker
    const { data: marker, error: updateError } = await supabase
      .from('video_markers')
      .update(dbUpdates)
      .eq('id', id)
      .select(`
        *,
        user:users!video_markers_user_id_fkey(
          id,
          name,
          avatar_url
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating marker:', updateError);
      return NextResponse.json(
        { error: 'Failed to update marker' },
        { status: 500 }
      );
    }

    // Transform to camelCase
    const transformedMarker = {
      id: marker.id,
      videoId: marker.video_id,
      userId: marker.user_id,
      timestampMs: marker.timestamp_ms,
      durationMs: marker.duration_ms,
      title: marker.title,
      description: marker.description,
      color: marker.color,
      icon: marker.icon,
      markerType: marker.marker_type,
      createdAt: marker.created_at,
      updatedAt: marker.updated_at,
      user: marker.user ? {
        id: marker.user.id,
        name: marker.user.name,
        avatarUrl: marker.user.avatar_url,
      } : null,
    };

    return NextResponse.json(transformedMarker);
  } catch (error) {
    console.error('Error in PATCH /api/video-markers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a marker
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Marker ID is required' },
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
    const { data: existingMarker, error: fetchError } = await supabase
      .from('video_markers')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingMarker) {
      return NextResponse.json(
        { error: 'Marker not found' },
        { status: 404 }
      );
    }

    if (existingMarker.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Delete marker
    const { error: deleteError } = await supabase
      .from('video_markers')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting marker:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete marker' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/video-markers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
