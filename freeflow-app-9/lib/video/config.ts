/**
 * Video Infrastructure Configuration
 * Comprehensive setup for Mux integration and video processing
 */

// Mux API Configuration
export const muxConfig = {
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
  environment: process.env.MUX_ENVIRONMENT || 'sandbox',
  
  // Mux API base URLs
  apiUrl: 'https://api.mux.com',
  webhookPath: '/api/video/webhooks/mux',
  
  // Default video settings
  defaultSettings: {
    playbackPolicy: ['public'],
    maxResolution: '1080p',
    encoding: 'h264',
    generateSubtitles: true,
    normalizeAudio: true,
    aspectRatio: '16:9'
  }
} as const;

// Video Upload Configuration
export const uploadConfig = {
  maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_VIDEO_SIZE_MB || '500') * 1024 * 1024, // Convert MB to bytes
  supportedFormats: (process.env.NEXT_PUBLIC_SUPPORTED_VIDEO_FORMATS || 'mp4,mov,avi,webm,mkv').split(','),
  chunkSize: 5 * 1024 * 1024, // 5MB chunks for resumable uploads
  timeout: parseInt(process.env.VIDEO_PROCESSING_TIMEOUT_MINUTES || '30') * 60 * 1000, // Convert to milliseconds
  
  // Allowed MIME types
  allowedMimeTypes: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska'
  ]
} as const;

// Video Processing Configuration
export const processingConfig = {
  // AI transcription settings
  transcription: {
    enabled: true,
    language: 'en',
    accuracy: 'enhanced',
    speakerLabels: true,
    profanityFilter: false
  },
  
  // Thumbnail generation
  thumbnails: {
    count: 3,
    formats: ['jpg', 'webp'],
    sizes: [
      { name: 'small', width: 320, height: 180 },
      { name: 'medium', width: 640, height: 360 },
      { name: 'large', width: 1280, height: 720 }
    ],
    timeOffsets: [0.1, 0.5, 0.9] // Generate thumbnails at 10%, 50%, and 90% of video duration
  },
  
  // Video optimization
  optimization: {
    createGif: true,
    gifDuration: 3, // seconds
    gifWidth: 480,
    generatePreview: true,
    previewDuration: 10 // seconds
  }
} as const;

// Sharing and Security Configuration
export const securityConfig = {
  // Password protection
  passwordMinLength: 8,
  passwordComplexity: true,
  
  // Share link settings
  defaultLinkExpiry: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  maxViewLimit: 1000,
  
  // Analytics privacy
  anonymizeIPs: true,
  dataRetentionDays: 90,
  
  // Content security
  enableWatermark: false,
  preventDownload: false,
  restrictPlayback: false
} as const;

// Analytics Configuration
export const analyticsConfig = {
  // Event tracking
  trackEvents: ['view', 'play', 'pause', 'seek', 'complete', 'download', 'share'],
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  
  // Engagement metrics
  engagementThresholds: {
    shortView: 0.25,  // 25% watched
    mediumView: 0.50, // 50% watched
    longView: 0.75,   // 75% watched
    completeView: 0.95 // 95% watched
  },
  
  // Real-time updates
  realTimeUpdates: true,
  updateInterval: 1000 // 1 second
} as const;

// Integration Settings
export const integrationConfig = {
  // Project integration
  autoLinkToProject: true,
  inheritProjectPermissions: true,
  syncProjectTags: true,
  
  // AI integration
  aiProcessing: {
    enabled: true,
    autoSummary: true,
    extractActionItems: true,
    generateChapters: true,
    detectLanguage: true
  },
  
  // Client features
  clientAccess: {
    allowComments: true,
    allowDownloads: false,
    requireApproval: false,
    notifyOnComment: true
  }
} as const;

// API Rate Limiting
export const rateLimitConfig = {
  upload: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10 // 10 uploads per window
  },
  
  view: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100 // 100 views per minute
  },
  
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000 // 1000 API calls per minute
  }
} as const;

// Development and Testing
export const devConfig = {
  isDevelopment: process.env.NODE_ENV === 'development',
  enableDebugLogs: process.env.VIDEO_DEBUG === 'true',
  mockMuxAPI: process.env.MOCK_MUX_API === 'true',
  testVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
} as const;

// Validation functions
export const validateMuxConfig = () => {
  const required = ['MUX_TOKEN_ID', 'MUX_TOKEN_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required Mux configuration: ${missing.join(', ')}`);
  }
  
  return true;
};

export const validateUploadFile = (file: File) => {
  const errors: string[] = [];
  
  // Check file size
  if (file.size > uploadConfig.maxFileSize) {
    errors.push(`File size exceeds maximum allowed size of ${uploadConfig.maxFileSize / (1024 * 1024)}MB`);
  }
  
  // Check file type
  if (!uploadConfig.allowedMimeTypes.includes(file.type as any)) {
    errors.push(`File type ${file.type} is not supported`);
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !uploadConfig.supportedFormats.includes(extension)) {
    errors.push(`File extension .${extension} is not supported`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper functions for configuration
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Export all configurations
export const videoConfig = {
  mux: muxConfig,
  upload: uploadConfig,
  processing: processingConfig,
  security: securityConfig,
  analytics: analyticsConfig,
  integration: integrationConfig,
  rateLimit: rateLimitConfig,
  dev: devConfig
} as const;

export default videoConfig; 