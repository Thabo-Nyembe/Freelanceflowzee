/**
 * Mux Webhook Handler
 * Processes video upload completion and status updates from Mux
 * Updates video records and triggers AI processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWebhookSignature, processWebhookEvent } from '@/lib/video/mux-client';
import { muxConfig } from '@/lib/video/config';

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('mux-signature');

    if (!signature) {
      console.error('Missing Mux signature header');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, muxConfig.webhookSecret || '');
    if (!isValid) {
      console.error('Invalid Mux webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(body);
    console.log('Received Mux webhook:', event.type, event.data?.id);

    // Process the webhook event
    const processedEvent = processWebhookEvent(event);
    
    // Initialize Supabase client
    const supabase = await createClient();

    switch (processedEvent.action) {
      case 'upload_complete':
        await handleUploadComplete(supabase, processedEvent, event.data);
        break;
        
      case 'asset_ready':
        await handleAssetReady(supabase, processedEvent, event.data);
        break;
        
      case 'asset_error':
        await handleAssetError(supabase, processedEvent, event.data);
        break;
        
      case 'recording_ready':
        await handleRecordingReady(supabase, processedEvent, event.data);
        break;
        
      default:
        console.log('Unhandled webhook event:', processedEvent.action);
    }

    return NextResponse.json({ success: true, action: processedEvent.action });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle upload completion - asset created from upload
async function handleUploadComplete(supabase: any, processedEvent: any, eventData: any) {
  try {
    const { uploadId, assetId } = processedEvent;
    
    // Find video by upload ID
    const { data: video, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('mux_upload_id', uploadId)
      .single();

    if (findError || !video) {
      console.error('Video not found for upload ID:', uploadId);
      return;
    }

    // Update video with asset ID and status
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        mux_asset_id: assetId,
        status: 'processing',
        processing_progress: 50,
        updated_at: new Date().toISOString()
      })
      .eq('id', video.id);

    if (updateError) {
      console.error('Failed to update video with asset ID:', updateError);
      return;
    }

    console.log(`Video ${video.id} upload completed, asset ID: ${assetId}`);

  } catch (error) {
    console.error('Upload complete handler error:', error);
  }
}

// Handle asset ready - video processing completed
async function handleAssetReady(supabase: any, processedEvent: any, eventData: any) {
  try {
    const { assetId, duration, playbackIds } = processedEvent;
    
    // Find video by asset ID
    const { data: video, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('mux_asset_id', assetId)
      .single();

    if (findError || !video) {
      console.error('Video not found for asset ID:', assetId);
      return;
    }

    // Extract playback ID and other metadata
    const playbackId = playbackIds?.[0]?.id;
    const updateData: any = {
      status: 'ready',
      processing_progress: 100,
      mux_playback_id: playbackId,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add duration if available
    if (duration) {
      updateData.duration_seconds = Math.round(duration);
    }

    // Add aspect ratio if available
    if (eventData.aspect_ratio) {
      updateData.aspect_ratio = eventData.aspect_ratio;
    }

    // Add resolution if available
    if (eventData.resolution_tier) {
      updateData.resolution = eventData.resolution_tier;
    }

    // Generate thumbnail URL
    if (playbackId) {
      updateData.thumbnail_url = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=640&height=360&fit_mode=crop`;
      updateData.preview_gif_url = `https://image.mux.com/${playbackId}/animated.gif?width=480&height=270&fps=15&start=1&end=4`;
    }

    // Update video record
    const { error: updateError } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', video.id);

    if (updateError) {
      console.error('Failed to update video as ready:', updateError);
      return;
    }

    console.log(`Video ${video.id} is now ready, playback ID: ${playbackId}`);

    // Trigger AI processing if enabled
    if (video.project_id) {
      await triggerAIProcessing(supabase, video.id, playbackId);
    }

  } catch (error) {
    console.error('Asset ready handler error:', error);
  }
}

// Handle asset error - video processing failed
async function handleAssetError(supabase: any, processedEvent: any, eventData: any) {
  try {
    const { assetId, error: assetError } = processedEvent;
    
    // Find video by asset ID
    const { data: video, error: findError } = await supabase
      .from('videos')
      .select('*')
      .eq('mux_asset_id', assetId)
      .single();

    if (findError || !video) {
      console.error('Video not found for asset ID:', assetId);
      return;
    }

    // Update video with error status
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        status: 'error',
        processing_progress: 0,
        error_message: assetError || 'Video processing failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', video.id);

    if (updateError) {
      console.error('Failed to update video error status:', updateError);
      return;
    }

    console.error(`Video ${video.id} processing failed:`, assetError);

  } catch (error) {
    console.error('Asset error handler error:', error);
  }
}

// Handle recording ready - live stream recording completed
async function handleRecordingReady(supabase: any, processedEvent: any, eventData: any) {
  try {
    const { streamId, assetId } = processedEvent;
    
    console.log(`Live stream recording ready - Stream: ${streamId}, Asset: ${assetId}`);
    
    // This would handle screen recording completion
    // Implementation depends on how screen recording is integrated
    
  } catch (error) {
    console.error('Recording ready handler error:', error);
  }
}

// Trigger AI processing for video transcription and analysis
async function triggerAIProcessing(supabase: any, videoId: string, playbackId: string) {
  try {
    console.log(`Triggering AI processing for video ${videoId}`);
    
    // This would trigger AI transcription and analysis
    // Could be implemented as:
    // 1. Queue job in background processing system
    // 2. Call external AI service
    // 3. Use existing FreeFlow AI API
    
    // For now, we'll mark it as pending AI processing
    const { error } = await supabase
      .from('videos')
      .update({
        metadata: {
          ai_processing_queued: true,
          ai_processing_queued_at: new Date().toISOString()
        }
      })
      .eq('id', videoId);

    if (error) {
      console.error('Failed to queue AI processing:', error);
    }

  } catch (error) {
    console.error('AI processing trigger error:', error);
  }
}

// GET endpoint for webhook testing/health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Mux webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
} 