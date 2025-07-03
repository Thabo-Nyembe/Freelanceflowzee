/**
 * TypeScript types for FreeFlow Video Infrastructure
 * These types match the database schema defined in V3_video_infrastructure_migration.sql
 */

// Base video record type
export interface Video {
  id: string;
  title: string;
  description?: string;
  
  // Ownership and project integration
  owner_id: string;
  project_id?: string;
  
  // Mux integration
  mux_asset_id?: string;
  mux_playback_id?: string;
  mux_upload_id?: string;
  
  // Video metadata
  duration_seconds: number;
  aspect_ratio: string;
  resolution?: string;
  file_size_bytes: number;
  thumbnail_url?: string;
  preview_gif_url?: string;
  
  // Processing status
  status: VideoStatus;
  processing_progress: number;
  error_message?: string;
  
  // AI processing status
  ai_processing_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'disabled';
  ai_processing_started_at?: string;
  ai_processing_completed_at?: string;
  has_transcription?: boolean;
  has_ai_analysis?: boolean;
  has_ai_tags?: boolean;
  has_ai_chapters?: boolean;
  
  // Legacy AI features (deprecated - use separate tables)
  transcript?: string;
  ai_summary?: string;
  ai_chapters: VideoChapter[];
  ai_action_items: ActionItem[];
  ai_metadata: Record<string, any>;
  
  // Sharing and permissions
  is_public: boolean;
  password_hash?: string;
  sharing_settings: SharingSettings;
  
  // Analytics
  view_count: number;
  comment_count: number;
  share_count: number;
  
  // Search and categorization
  tags: string[];
  embedding?: number[];
  search_vector?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
  
  // Additional metadata
  metadata: Record<string, any>;
}

// Video status enum
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'error';

// Video sharing settings
export interface SharingSettings {
  allowComments: boolean;
  allowDownload: boolean;
  trackViews: boolean;
  requirePassword?: boolean;
  expiresAt?: string;
  viewLimit?: number;
}

// AI-generated video chapters
export interface VideoChapter {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  summary?: string;
  thumbnail_url?: string;
}

// AI-extracted action items
export interface ActionItem {
  id: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp?: number;
  assigned_to?: string;
  due_date?: string;
  completed: boolean;
}

// Video comment type
export interface VideoComment {
  id: string;
  video_id: string;
  user_id: string;
  parent_comment_id?: string;
  
  // Comment content
  content: string;
  timestamp_seconds?: number;
  
  // Status and moderation
  is_resolved: boolean;
  is_edited: boolean;
  is_deleted: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Additional data
  metadata: Record<string, any>;
  
  // Populated user data (for joins)
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  
  // Nested replies
  replies?: VideoComment[];
}

// Video share/access tracking
export interface VideoShare {
  id: string;
  video_id: string;
  shared_by_user_id: string;
  
  // Share details
  share_type: ShareType;
  recipient_email?: string;
  access_level: AccessLevel;
  
  // Access control
  expires_at?: string;
  password_protected: boolean;
  view_limit?: number;
  views_used: number;
  
  // Share metadata
  share_url?: string;
  embed_settings: EmbedSettings;
  
  // Timestamps
  created_at: string;
  last_accessed_at?: string;
  
  // Additional data
  metadata: Record<string, any>;
}

export type ShareType = 'public_link' | 'email' | 'client_portal' | 'embed';
export type AccessLevel = 'view' | 'comment' | 'download';

// Embed settings for video sharing
export interface EmbedSettings {
  autoplay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  responsive?: boolean;
  width?: number;
  height?: number;
  customColor?: string;
}

// Video analytics event
export interface VideoAnalyticsEvent {
  id: string;
  video_id: string;
  user_id?: string;
  session_id?: string;
  
  // Event details
  event_type: AnalyticsEventType;
  timestamp_seconds?: number;
  duration_watched_seconds?: number;
  
  // Context
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  location_data?: LocationData;
  
  // Device info
  device_type?: string;
  browser?: string;
  os?: string;
  
  // Timestamps
  created_at: string;
  
  // Additional data
  metadata: Record<string, any>;
}

export type AnalyticsEventType = 'view' | 'play' | 'pause' | 'seek' | 'complete' | 'download' | 'share';

// Location data for analytics
export interface LocationData {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
}

// Video thumbnail
export interface VideoThumbnail {
  id: string;
  video_id: string;
  
  // Thumbnail details
  thumbnail_type: ThumbnailType;
  size_variant: ThumbnailSize;
  url: string;
  width?: number;
  height?: number;
  file_size_bytes?: number;
  
  // Status
  is_primary: boolean;
  processing_status: string;
  
  // Timestamps
  created_at: string;
}

export type ThumbnailType = 'auto' | 'custom' | 'animated';
export type ThumbnailSize = 'small' | 'medium' | 'large' | 'original';

// Video upload progress tracking
export interface VideoUploadProgress {
  uploadId: string;
  videoId?: string;
  progress: number;
  status: UploadStatus;
  error?: string;
  
  // File details
  fileName: string;
  fileSize: number;
  fileType: string;
  
  // Upload metrics
  uploadedBytes: number;
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
  
  // Timestamps
  startedAt: string;
  completedAt?: string;
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Video processing webhook event
export interface VideoWebhookEvent {
  id: string;
  type: string;
  data: any;
  timestamp: string;
  signature?: string;
  processed: boolean;
  error?: string;
}

// Video search filters
export interface VideoSearchFilters {
  query?: string;
  owner_id?: string;
  project_id?: string;
  status?: VideoStatus[];
  tags?: string[];
  created_after?: string;
  created_before?: string;
  duration_min?: number;
  duration_max?: number;
  is_public?: boolean;
  has_transcript?: boolean;
  has_ai_summary?: boolean;
}

// Video search results
export interface VideoSearchResult {
  video: Video;
  similarity?: number;
  snippet?: string;
  highlights?: string[];
  project?: {
    id: string;
    title: string;
  };
  owner?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Video analytics summary
export interface VideoAnalyticsSummary {
  video_id: string;
  total_views: number;
  unique_viewers: number;
  total_watch_time: number;
  average_watch_time: number;
  completion_rate: number;
  engagement_score: number;
  top_traffic_sources: TrafficSource[];
  viewer_locations: LocationSummary[];
  device_breakdown: DeviceBreakdown[];
  time_series_data: TimeSeriesData[];
}

// Traffic source analytics
export interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
}

// Location analytics summary
export interface LocationSummary {
  location: string;
  views: number;
  percentage: number;
}

// Device breakdown for analytics
export interface DeviceBreakdown {
  device_type: string;
  count: number;
  percentage: number;
}

// Time series data for analytics charts
export interface TimeSeriesData {
  timestamp: string;
  views: number;
  watch_time: number;
  unique_viewers: number;
}

// Video player configuration
export interface VideoPlayerConfig {
  playback_id: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  responsive?: boolean;
  poster?: string;
  chapters?: VideoChapter[];
  subtitles?: SubtitleTrack[];
  analytics?: boolean;
  sharing?: boolean;
  download?: boolean;
  speed_controls?: boolean;
  quality_selector?: boolean;
  fullscreen?: boolean;
  picture_in_picture?: boolean;
}

// Subtitle track
export interface SubtitleTrack {
  label: string;
  language: string;
  src: string;
  default?: boolean;
}

// Video creation/update input types
export interface CreateVideoInput {
  title: string;
  description?: string;
  project_id?: string;
  tags?: string[];
  is_public?: boolean;
  sharing_settings?: Partial<SharingSettings>;
  metadata?: Record<string, any>;
}

export interface UpdateVideoInput {
  title?: string;
  description?: string;
  project_id?: string;
  tags?: string[];
  is_public?: boolean;
  sharing_settings?: Partial<SharingSettings>;
  metadata?: Record<string, any>;
}

// Video API response types
export interface VideoApiResponse<T = Video> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface VideoListResponse {
  success: boolean;
  data: Video[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

// Video processing status response
export interface VideoProcessingStatus {
  video_id: string;
  status: VideoStatus;
  progress: number;
  estimated_completion?: string;
  current_step?: string;
  error?: string;
  
  // Processing steps
  steps: ProcessingStep[];
}

export interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

// Export utility types
export type VideoWithProject = Video & {
  project?: {
    id: string;
    title: string;
    client_name?: string;
  };
};

export type VideoWithOwner = Video & {
  owner: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
};

export type VideoWithComments = Video & {
  comments: VideoComment[];
};

export type VideoWithAnalytics = Video & {
  analytics: VideoAnalyticsSummary;
};

// Database operation types
export type VideoInsert = Omit<Video, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'comment_count' | 'share_count'>;
export type VideoUpdate = Partial<Pick<Video, 'title' | 'description' | 'is_public' | 'sharing_settings' | 'tags' | 'metadata'>>;

// Hook return types for React components
export interface UseVideoReturn {
  video: Video | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseVideosReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export interface UseVideoUploadReturn {
  upload: (file: File, options?: CreateVideoInput) => Promise<void>;
  progress: VideoUploadProgress | null;
  uploading: boolean;
  error: string | null;
  cancel: () => void;
}

export interface UseVideoPlayerReturn {
  playerRef: React.RefObject<any>;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  fullscreen: boolean;
  
  // Player controls
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  
  // Analytics
  trackEvent: (event: AnalyticsEventType, data?: any) => void;
} 