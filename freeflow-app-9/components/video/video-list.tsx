import React, { memo, useCallback, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/video/config';
import { Play, Clock, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  viewCount?: number;
  createdAt: string;
  status: 'processing' | 'ready' | 'error';
}

interface VideoListItemProps {
  video: Video;
  isMobile: boolean;
  onVideoClick?: (videoId: string) => void;
}

// Memoized list item to prevent unnecessary re-renders
const VideoListItem = memo(function VideoListItem({ video, isMobile, onVideoClick }: VideoListItemProps) {
  const handleClick = useCallback(() => {
    onVideoClick?.(video.id);
  }, [onVideoClick, video.id]);

  const formattedDate = useMemo(() => {
    return new Date(video.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [video.createdAt]);

  return (
    <Link
      href={`/video/${video.id}`}
      onClick={handleClick}
      className={cn(
        'group block overflow-hidden rounded-lg border bg-card transition-colors hover:bg-accent/50',
        isMobile ? 'p-3' : 'p-4'
      )}
    >
      <div className={cn(
        'grid gap-4',
        isMobile ? 'grid-cols-1' : 'grid-cols-[240px,1fr]'
      )}>
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {video.duration && (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs text-white">
              {formatDuration(video.duration)}
            </div>
          )}
          {video.status !== 'ready' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded bg-black/80 px-2 py-1 text-sm text-white">
                {video.status === 'processing' ? 'Processing...' : 'Error'}
              </span>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h3 className={cn(
              'font-semibold leading-tight',
              isMobile ? 'text-base' : 'text-lg'
            )}>
              {video.title}
            </h3>
            {!isMobile && video.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {video.description}
              </p>
            )}
          </div>

          <div className={cn(
            'flex gap-4 text-sm text-muted-foreground',
            isMobile ? 'mt-2' : 'mt-4'
          )}>
            {video.viewCount !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {video.viewCount} views
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formattedDate}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

interface VideoListProps {
  videos: Video[];
  className?: string;
  onVideoClick?: (videoId: string) => void;
}

// Memoized list component
export const VideoList = memo(function VideoList({ videos, className, onVideoClick }: VideoListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={cn('space-y-4', className)}>
      {videos.map((video) => (
        <VideoListItem
          key={video.id}
          video={video}
          isMobile={isMobile}
          onVideoClick={onVideoClick}
        />
      ))}
    </div>
  );
});

// Export for backwards compatibility
export default VideoList;
