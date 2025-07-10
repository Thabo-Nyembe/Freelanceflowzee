import Mux from '@mux/mux-node';

// Initialize Mux client with environment variables
const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

export { mux };

// Video processing status types
export type VideoProcessingStatus = 
  | 'uploading'
  | 'uploaded' 
  | 'processing'
  | 'ready'
  | 'errored'
  | 'transcribing'
  | 'transcribed';

// Mux asset status mapping
export const MUX_STATUS_MAP: Record<string, VideoProcessingStatus> = {
  'waiting': 'uploaded',
  'preparing': 'processing', 
  'ready': 'ready',
  'errored': 'errored',
};

// Video quality settings
export const VIDEO_QUALITY_SETTINGS = {
  low: {
    max_resolution_tier: '720p',
    encoding_tier: 'baseline',
  },
  medium: {
    max_resolution_tier: '1080p', 
    encoding_tier: 'smart',
  },
  high: {
    max_resolution_tier: '1440p',
    encoding_tier: 'smart',
  },
};

// Upload settings
export const UPLOAD_SETTINGS = {
  cors_origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  new_asset_settings: {
    playback_policy: ['public'],
    encoding_tier: 'smart',
    max_resolution_tier: '1080p',
  },
};

// Helper functions
export async function createMuxAsset(url: string, options?: unknown) {
  try {
    const asset = await mux.video.assets.create({
      input: url,
      playback_policy: ['public'],
      encoding_tier: 'smart',
      max_resolution_tier: '1080p',
      ...options,
    });
    return asset;
  } catch (error) {
    console.error('Error creating Mux asset:', error);
    throw error;
  }
}

export async function getMuxAsset(assetId: string) {
  try {
    const asset = await mux.video.assets.retrieve(assetId);
    return asset;
  } catch (error) {
    console.error('Error retrieving Mux asset:', error);
    throw error;
  }
}

export async function deleteMuxAsset(assetId: string) {
  try {
    await mux.video.assets.delete(assetId);
    return true;
  } catch (error) {
    console.error('Error deleting Mux asset:', error);
    throw error;
  }
}

export async function createUploadUrl() {
  try {
    const upload = await mux.video.uploads.create(UPLOAD_SETTINGS);
    return upload;
  } catch (error) {
    console.error('Error creating upload URL:', error);
    throw error;
  }
} 