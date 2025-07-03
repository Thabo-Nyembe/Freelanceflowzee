/**
 * Video Status API Route
 * Provides real-time video processing status updates
 * Implements Cap-style status polling for UI updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVideoAsset } from '@/lib/video/mux-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get video from database
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { success: false, error: 'Video not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this video
    const hasAccess = video.owner_id === user.id || video.is_public;
    
    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // If video is still processing and has Mux asset, get updated status
    let muxStatus: any = null;
    if (video.mux_asset_id && video.status !== 'ready') {
      const muxResult = await getVideoAsset(video.mux_asset_id);
      if (muxResult.success) {
        muxStatus = {
          status: muxResult.status,
          duration: muxResult.duration,
          aspectRatio: muxResult.aspectRatio,
          playbackIds: muxResult.playbackIds
        };

        // Update database if status changed
        if (muxResult.status !== video.status) {
          const updateData: any = {
            status: muxResult.status,
            updated_at: new Date().toISOString()
          };

          if (muxResult.status === 'ready') {
            updateData.processing_progress = 100;
            updateData.duration_seconds = Math.round(muxResult.duration || 0);
            updateData.mux_playback_id = muxResult.playbackIds?.[0]?.id;
            updateData.published_at = new Date().toISOString();
            
            // Extract aspect ratio if available
            if (muxResult.aspectRatio) {
              updateData.aspect_ratio = muxResult.aspectRatio;
            }
          } else if (muxResult.status === 'errored') {
            updateData.processing_progress = 0;
            updateData.error_message = 'Video processing failed';
          }

          await supabase
            .from('videos')
            .update(updateData)
            .eq('id', id);

          // Update local video object for response
          Object.assign(video, updateData);
        }
      }
    }

    // Determine processing steps and current step
    const processingSteps = [
      {
        name: 'upload',
        status: video.status === 'uploading' ? 'processing' : 'completed',
        progress: video.status === 'uploading' ? video.processing_progress : 100
      },
      {
        name: 'encoding',
        status: video.status === 'processing' ? 'processing' : 
               video.status === 'ready' ? 'completed' : 'pending',
        progress: video.status === 'processing' ? video.processing_progress :
                 video.status === 'ready' ? 100 : 0
      },
      {
        name: 'thumbnail_generation',
        status: video.status === 'ready' ? 'completed' : 'pending',
        progress: video.status === 'ready' ? 100 : 0
      },
      {
        name: 'ai_processing',
        status: video.transcript ? 'completed' : 'pending',
        progress: video.transcript ? 100 : 0
      }
    ];

    const currentStep: any = processingSteps.find(step => step.status === 'processing')?.name || 
                       (video.status === 'ready' ? 'completed' : 'upload');

    // Estimate completion time based on current progress
    let estimatedCompletion = null;
    if (video.status === 'processing' && video.processing_progress > 0) {
      const remainingProgress = 100 - video.processing_progress;
      const estimatedMinutes = Math.ceil((remainingProgress / 100) * 5); // Rough estimate
      estimatedCompletion = new Date(Date.now() + estimatedMinutes * 60000).toISOString();
    }

    return NextResponse.json({
      success: true,
      data: {
        video_id: video.id,
        status: video.status,
        progress: video.processing_progress,
        current_step: currentStep,
        estimated_completion: estimatedCompletion,
        error: video.error_message,
        
        // Processing steps breakdown
        steps: processingSteps,
        
        // Video metadata (when ready)
        metadata: video.status === 'ready' ? {
          duration_seconds: video.duration_seconds,
          aspect_ratio: video.aspect_ratio,
          resolution: video.resolution,
          file_size_bytes: video.file_size_bytes,
          mux_playback_id: video.mux_playback_id,
          thumbnail_url: video.thumbnail_url,
          preview_gif_url: video.preview_gif_url
        } : null,
        
        // AI processing status
        ai_status: {
          transcript_ready: !!video.transcript,
          summary_ready: !!video.ai_summary,
          chapters_ready: video.ai_chapters?.length > 0,
          action_items_ready: video.ai_action_items?.length > 0
        },
        
        // Mux status for debugging
        mux_status: muxStatus,
        
        // Last updated
        updated_at: video.updated_at
      }
    });

  } catch (error) {
    console.error('Video status API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH endpoint to manually update video status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, progress, error_message } = body;

    // Get video and verify ownership
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('owner_id', user.id)
      .single();

    if (videoError || !video) {
      return NextResponse.json(
        { success: false, error: 'Video not found or access denied' },
        { status: 404 }
      );
    }

    // Update video status
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (status) updateData.status = status;
    if (typeof progress === 'number') updateData.processing_progress = progress;
    if (error_message) updateData.error_message = error_message;

    const { error: updateError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update video status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video status updated successfully'
    });

  } catch (error) {
    console.error('Video status update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
} 