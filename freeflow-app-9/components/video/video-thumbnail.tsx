import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useState } from 'react';

// Blur placeholder for video thumbnails
const VIDEO_THUMBNAIL_BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAME/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDBBEhABIxBQYTQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8AyRU9NL06aKjqzBUxNulkZQWBJYEA+xYfPmtaKpqa6ljqqaZopozlHXkHTWk0w5JOp//Z";

interface VideoThumbnailProps {
  thumbnailUrl: string;
  title: string;
  className?: string;
  priority?: boolean;
}

export function VideoThumbnail({
  thumbnailUrl,
  title,
  className,
  priority = false,
}: VideoThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-lg', className)}>
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <Image
        src={thumbnailUrl}
        alt={`Thumbnail for ${title}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "object-cover transition-all duration-300 hover:scale-105",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        placeholder="blur"
        blurDataURL={VIDEO_THUMBNAIL_BLUR}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        onLoad={() => setIsLoading(false)}
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
} 