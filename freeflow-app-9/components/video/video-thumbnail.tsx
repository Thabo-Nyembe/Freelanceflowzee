import Image from 'next/image';
import { cn } from '@/lib/utils';

interface VideoThumbnailProps {
  thumbnailUrl: string;
  title: string;
  className?: string;
}

export function VideoThumbnail({
  thumbnailUrl, title, className, }: VideoThumbnailProps) {
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-lg', className)}>
      <Image
        src={thumbnailUrl}
        alt={`Thumbnail for ${title}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover transition-transform duration-300 hover:scale-105"
        priority={false} // Set to true for above-the-fold images
      />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
} 