/**
 * Mux API Client for FreeFlow Video Infrastructure
 * Based on Cap.so's implementation but integrated with FreeFlow's architecture
 */

import Mux from '@mux/mux-node';
import crypto from 'crypto';
import { muxConfig, validateMuxConfig } from './config';

// Initialize Mux client
let muxClient: Mux | null = null;

export const getMuxClient = (): Mux => {
  if (!muxClient) {
    validateMuxConfig();
    muxClient = new Mux({
      tokenId: muxConfig.tokenId!,
      tokenSecret: muxConfig.tokenSecret!,
    });
  }
  return muxClient;
};

// Video asset management
export const createVideoAsset = async (options: {
  url?: string;
  uploadId?: string;
  title?: string;
  description?: string;
  generateSubtitles?: boolean;
  passthrough?: string;
}) => {
  const mux = getMuxClient();
  
  const assetOptions: unknown = {
    input: options.url || { upload_id: options.uploadId },
    playback_policy: ['public'],
    encoding_tier: 'smart',
    video_quality: 'plus',
    master_access: 'temporary',
    mp4_support: 'standard',
    normalize_audio: true,
  };

  // Add metadata if provided
  if (options.title || options.description) {
    assetOptions.metadata = {
      title: options.title,
      description: options.description,
    };
  }

  // Enable subtitles if requested
  if (options.generateSubtitles) {
    assetOptions.generate_subtitles = [{
      name: 'English',
      language_code: 'en',
      passthrough: 'english'
    }];
  }

  // Add passthrough data for tracking
  if (options.passthrough) {
    assetOptions.passthrough = options.passthrough;
  }

  try {
    const asset = await mux.video.assets.create(assetOptions);
    return {
      success: true,
      data: asset,
      assetId: asset.id,
      playbackId: asset.playback_ids?.[0]?.id,
    };
  } catch (error) {
    console.error('Error creating Mux asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Create direct upload for client-side uploads
export const createDirectUpload = async (options: {
  timeout?: number;
  corsOrigin?: string;
  passthrough?: string;
}) => {
  const mux = getMuxClient();

  try {
    const upload = await mux.video.uploads.create({
      timeout: options.timeout || 3600, // 1 hour default
      cors_origin: options.corsOrigin || '*',
             new_asset_settings: {
         playback_policy: ['public'],
         encoding_tier: 'smart',
         video_quality: 'plus',
         passthrough: options.passthrough,
       },
    });

    return {
      success: true,
      data: upload,
      uploadId: upload.id,
      uploadUrl: upload.url,
    };
  } catch (error) {
    console.error('Error creating direct upload:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Get video asset details
export const getVideoAsset = async (assetId: string) => {
  const mux = getMuxClient();

  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return {
      success: true,
      data: asset,
      status: asset.status,
      duration: asset.duration,
      aspectRatio: asset.aspect_ratio,
      playbackIds: asset.playback_ids,
    };
  } catch (error) {
    console.error('Error retrieving Mux asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Delete video asset
export const deleteVideoAsset = async (assetId: string) => {
  const mux = getMuxClient();

  try {
    await mux.video.assets.delete(assetId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Generate thumbnail URLs
export const generateThumbnailUrls = (playbackId: string, options?: {
  width?: number;
  height?: number;
  fitMode?: 'pad' | 'preserve' | 'crop';
  time?: number;
}) => {
  const baseUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
  const params = new URLSearchParams();

  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.fitMode) params.append('fit_mode', options.fitMode);
  if (options?.time) params.append('time', options.time.toString());

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

// Generate animated GIF URLs
export const generateGifUrl = (playbackId: string, options?: {
  width?: number;
  height?: number;
  fps?: number;
  start?: number;
  end?: number;
}) => {
  const baseUrl = `https://image.mux.com/${playbackId}/animated.gif`;
  const params = new URLSearchParams();

  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  if (options?.fps) params.append('fps', options.fps.toString());
  if (options?.start) params.append('start', options.start.toString());
  if (options?.end) params.append('end', options.end.toString());

  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

// Get video analytics
export const getVideoAnalytics = async (options: {
  assetId?: string;
  playbackId?: string;
  timeframe?: string[];
  metrics?: string[];
  groupBy?: string;
}) => {
  const mux = getMuxClient();

  try {
    const filters: unknown[] = [];
    if (options.assetId) filters.push(`asset_id:${options.assetId}`);
    if (options.playbackId) filters.push(`playback_id:${options.playbackId}`);

    const analytics = await (mux.data.metrics as Record<string, unknown>).get('video_view', {
      timeframe: options.timeframe,
      filters,
      group_by: options.groupBy,
      measurement: options.metrics || ['views'],
    });

    return {
      success: true,
      data: analytics,
    };
  } catch (error) {
    console.error('Error retrieving video analytics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Create live stream (for future screen recording feature)
export const createLiveStream = async (options: {
  playbackPolicy?: string[];
  reconnectWindow?: number;
  reducedLatency?: boolean;
  passthrough?: string;
}) => {
  const mux = getMuxClient();

  try {
    const liveStream = await mux.video.liveStreams.create({
      playback_policy: (options.playbackPolicy || ['public']),
      reconnect_window: options.reconnectWindow || 300,
      reduced_latency: options.reducedLatency || false,
      passthrough: options.passthrough,
    });

    return {
      success: true,
      data: liveStream,
      streamKey: liveStream.stream_key,
      playbackIds: liveStream.playback_ids,
    };
  } catch (error) {
    console.error('Error creating live stream:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string,
  signature: string,
  secret: string = muxConfig.webhookSecret || ''
): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

// Process webhook events
export const processWebhookEvent = (event) => {
  const { type, data } = event;
  
  switch (type) {
    case 'video.asset.ready':
      return {
        action: 'asset_ready',
        assetId: data.id,
        status: data.status,
        duration: data.duration,
        playbackIds: data.playback_ids,
      };
      
    case 'video.asset.errored':
      return {
        action: 'asset_error',
        assetId: data.id,
        error: data.errors?.[0]?.message || 'Unknown processing error',
      };
      
    case 'video.upload.asset_created':
      return {
        action: 'upload_complete',
        uploadId: data.upload_id,
        assetId: data.asset_id,
      };
      
    case 'video.live_stream.connected':
      return {
        action: 'stream_connected',
        streamId: data.id,
      };
      
    case 'video.live_stream.recording.ready':
      return {
        action: 'recording_ready',
        streamId: data.live_stream_id,
        assetId: data.asset_id,
      };
      
    default:
      return {
        action: 'unknown',
        type,
        data,
      };
  }
};

// Utility functions for video URLs
export const getPlaybackUrl = (playbackId: string, format: 'hls' | 'mp4' = 'hls') => {
  if (format === 'mp4') {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }
  return `https://stream.mux.com/${playbackId}.m3u8`;
};

export const getEmbedUrl = (playbackId: string, options?: {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}) => {
  const baseUrl = `https://stream.mux.com/${playbackId}`;
  const params = new URLSearchParams();
  
  if (options?.autoplay) params.append('autoplay', '1');
  if (options?.muted) params.append('muted', '1');
  if (options?.loop) params.append('loop', '1');
  if (options?.controls === false) params.append('controls', '0');
  
  return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
};

// Export the main client and utilities
export default {
  createVideoAsset,
  createDirectUpload,
  getVideoAsset,
  deleteVideoAsset,
  generateThumbnailUrls,
  generateGifUrl,
  getVideoAnalytics,
  createLiveStream,
  verifyWebhookSignature,
  processWebhookEvent,
  getPlaybackUrl,
  getEmbedUrl,
}; 