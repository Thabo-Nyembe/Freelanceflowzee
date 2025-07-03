"use client";

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Play, Clock, Eye, Loader2, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useVideoStatus } from '@/hooks/useVideoStatus';
import { VideoStatusBadge } from './video-status-indicator';

interface VideoThumbnailProps {
  videoId: string;
  title?: string;
  duration?: number;
  viewCount?: number;
  status?: 'processing' | 'ready' | 'error' | 'uploading'; // Optional - will use real-time status if not provided
  thumbnailUrl?: string;
  playbackId?: string;
  width?: number;
  height?: number;
  className?: string;
  showPlayIcon?: boolean;
  showStats?: boolean;
  showStatus?: boolean;
  useRealTimeStatus?: boolean; // Enable real-time status polling
  onClick?: () => void;
  fallbackGradient?: string;
  aspectRatio?: 'video' | 'square' | 'wide';
}

const GRADIENT_PRESETS = [
  'from-blue-400 to-purple-600',
  'from-green-400 to-blue-500',
  'from-pink-400 to-red-600',
  'from-yellow-400 to-orange-500',
  'from-indigo-400 to-purple-600',
  'from-teal-400 to-blue-600',
  'from-rose-400 to-pink-600',
  'from-cyan-400 to-teal-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-green-600'
];

export default function VideoThumbnail({
  videoId,
  title,
  duration,
  viewCount,
  status: staticStatus,
  thumbnailUrl,
  playbackId,
  width = 320,
  height = 180,
  className,
  showPlayIcon = true,
  showStats = true,
  showStatus = true,
  useRealTimeStatus = true,
  onClick,
  fallbackGradient,
  aspectRatio = 'video'
}: VideoThumbnailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  // Use real-time status polling when enabled and no static status provided
  const { 
    status: realTimeStatus, 
    isReady, 
    hasError, 
    isProcessing, 
    isUploading,
    overallProgress 
  } = useVideoStatus({
    videoId,
    enabled: useRealTimeStatus && !staticStatus,
    pollingInterval: 5000, // Slower polling for thumbnails
    maxPollingDuration: 300000
  });

  // Determine which status to use
  const status = staticStatus || (realTimeStatus?.processing_status as 'processing' | 'ready' | 'error' | 'uploading') || 'ready';

  // Generate consistent gradient based on videoId
  const getGradient = () => {
    if (fallbackGradient) return fallbackGradient;
    
    // Use videoId to consistently select a gradient
    const hash = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const index = Math.abs(hash) % GRADIENT_PRESETS.length;
    return GRADIENT_PRESETS[index];
  };

  // Generate thumbnail URLs for different sources
  const getThumbnailUrl = () => {
    if (thumbnailUrl) return thumbnailUrl;
    if (playbackId) {
      // Mux thumbnail URL with optimal sizing
      const muxWidth = Math.min(width * 2, 1920); // 2x for retina, max 1920
      return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${muxWidth}&height=${Math.round(muxWidth * (9/16))}&fit_mode=pad&time=1`;
    }
    return null;
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Format view count
  const formatViewCount = (count: number) => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'wide': return 'aspect-[21/9]';
      case 'video':
      default: return 'aspect-video';
    }
  };

  // Simulate loading progress for processing videos
  useEffect(() => {
    if (status === 'processing' || status === 'uploading') {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          const increment = Math.random() * 5 + 1;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [status]);

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  // Status configuration
  const statusConfig = {
    processing: { 
      label: 'Processing', 
      color: 'bg-blue-500', 
      icon: Loader2,
      animate: true 
    },
    uploading: { 
      label: 'Uploading', 
      color: 'bg-orange-500', 
      icon: Loader2,
      animate: true 
    },
    ready: { 
      label: 'Ready', 
      color: 'bg-green-500', 
      icon: Play,
      animate: false 
    },
    error: { 
      label: 'Error', 
      color: 'bg-red-500', 
      icon: ImageIcon,
      animate: false 
    }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;
  const gradientClass = getGradient();
  const finalThumbnailUrl = getThumbnailUrl();

  return (
    <div 
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-lg bg-muted transition-all duration-200',
        'hover:ring-2 hover:ring-primary hover:shadow-lg',
        className
      )}
      style={{ width, height: aspectRatio === 'video' ? height : undefined }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Main thumbnail container */}
      <div className={cn('relative w-full overflow-hidden', getAspectRatioClass())}>
        {/* Background gradient fallback */}
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-br transition-opacity duration-300',
            gradientClass,
            (imageLoaded && !imageError) ? 'opacity-0' : 'opacity-100'
          )}
        />

        {/* Thumbnail image */}
        {finalThumbnailUrl && (
          <img
            ref={imageRef}
            src={finalThumbnailUrl}
            alt={title || `Video ${videoId}`}
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-300',
              imageLoaded && !imageError ? 'opacity-100' : 'opacity-0',
              isHovered && 'scale-105'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}

        {/* Loading overlay for processing videos */}
        {(status === 'processing' || status === 'uploading') && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
              <div className="text-white text-sm font-medium mb-2">
                {currentStatus.label}...
              </div>
              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="text-white/70 text-xs mt-1">
                {Math.round(loadingProgress)}%
              </div>
            </div>
          </div>
        )}

        {/* Error state overlay */}
        {status === 'error' && (
          <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center h-full">
              <ImageIcon className="w-8 h-8 text-red-400 mb-2" />
              <div className="text-red-400 text-sm font-medium">
                Failed to load
              </div>
            </div>
          </div>
        )}

        {/* Play icon overlay */}
        {showPlayIcon && status === 'ready' && (
          <div 
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-200',
              'bg-black/0 group-hover:bg-black/40'
            )}
          >
            <div 
              className={cn(
                'w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transition-all duration-200',
                'scale-90 opacity-70 group-hover:scale-100 group-hover:opacity-100',
                'shadow-lg backdrop-blur-sm'
              )}
            >
              <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
            </div>
          </div>
        )}

        {/* Duration badge */}
        {duration && showStats && (
          <div className="absolute bottom-2 right-2">
            <Badge 
              variant="secondary" 
              className="bg-black/70 text-white border-none text-xs font-mono"
            >
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(duration)}
            </Badge>
          </div>
        )}

        {/* Status indicator */}
        {showStatus && status !== 'ready' && (
          <div className="absolute top-2 left-2">
            <Badge className={cn('text-white border-none text-xs', currentStatus.color)}>
              <StatusIcon className={cn('w-3 h-3 mr-1', currentStatus.animate && 'animate-spin')} />
              {currentStatus.label}
            </Badge>
          </div>
        )}

        {/* View count */}
        {viewCount !== undefined && showStats && (
          <div className="absolute bottom-2 left-2">
            <Badge 
              variant="secondary" 
              className="bg-black/70 text-white border-none text-xs"
            >
              <Eye className="w-3 h-3 mr-1" />
              {formatViewCount(viewCount)}
            </Badge>
          </div>
        )}
      </div>

      {/* Title overlay (optional) */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight">
            {title}
          </h3>
        </div>
      )}

      {/* Shimmer loading effect */}
      {!imageLoaded && !imageError && finalThumbnailUrl && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      )}
    </div>
  );
}

// Shimmer animation keyframes (add to your global CSS)
export const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-shimmer {
    animation: shimmer 1.5s infinite;
  }
`;

// Gallery component for multiple thumbnails
interface VideoThumbnailGridProps {
  videos: Array<{
    id: string;
    title?: string;
    duration?: number;
    viewCount?: number;
    status?: 'processing' | 'ready' | 'error' | 'uploading';
    thumbnailUrl?: string;
    playbackId?: string;
  }>;
  onVideoClick?: (videoId: string) => void;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function VideoThumbnailGrid({ 
  videos, 
  onVideoClick, 
  columns = 3,
  className 
}: VideoThumbnailGridProps) {
  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
  }[columns];

  return (
    <div className={cn('grid gap-4', gridClass, className)}>
      {videos.map((video) => (
        <VideoThumbnail
          key={video.id}
          videoId={video.id}
          title={video.title}
          duration={video.duration}
          viewCount={video.viewCount}
          status={video.status}
          thumbnailUrl={video.thumbnailUrl}
          playbackId={video.playbackId}
          onClick={() => onVideoClick?.(video.id)}
        />
      ))}
    </div>
  );
} 