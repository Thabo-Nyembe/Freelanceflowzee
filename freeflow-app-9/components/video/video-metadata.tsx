import { Video } from '@/lib/types/video';
import { Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface VideoMetadataProps {
  video: Pick<Video, 'description' | 'created_at' | 'view_count'>;
}

export function VideoMetadata({ video }: VideoMetadataProps) {
  return (
    <div className="space-y-4">
      <div className="pb-4 border-b">
        <h2 className="text-lg font-semibold">About this video</h2>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          <span>{video.view_count || 0} views</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Uploaded {formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
        </div>
      </div>
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <p>{video.description || 'No description provided.'}</p>
      </div>
    </div>
  );
} 