import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/video/config';
import { Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Video {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration?: number;
  status: 'processing' | 'ready' | 'error';
}

interface VideoGridProps {
  videos: Video[];
  className?: string;
  onVideoClick?: (videoId: string) => void;
}

export function VideoGrid({ videos: unknown, className: unknown, onVideoClick }: VideoGridProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  const getGridCols = () => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return 'grid-cols-2';
    return 'grid-cols-3 xl:grid-cols-4';
  };

  return (
    <div className={cn(
      'grid gap-4',
      getGridCols(),
      className
    )}>
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/video/${video.id}`}
          onClick={() => onVideoClick?.(video.id)}
          className="group block overflow-hidden rounded-lg transition-transform hover:scale-[1.02]"
        >
          {/* Thumbnail */}
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
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

          {/* Title */}
          <h3 className={cn(
            'mt-2 font-medium line-clamp-2',
            isMobile ? 'text-sm' : 'text-base'
          )}>
            {video.title}
          </h3>
        </Link>
      ))}
    </div>
  );
} 