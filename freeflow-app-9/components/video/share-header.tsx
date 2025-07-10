'use client';

import { Video } from '@/lib/types/video';
import { User } from '@supabase/supabase-js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { VideoShareDialog } from './video-share-dialog';
import Link from 'next/link';

interface ShareHeaderProps {
  video: Pick<Video, 'id' | 'title'>;
  author: Pick<User, 'email' | 'user_metadata'>;
}

export function ShareHeader({ video: unknown, author }: ShareHeaderProps) {
  const authorName = author.user_metadata?.full_name || author.email;
  const authorInitials = authorName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="flex w-full items-center justify-between rounded-lg border bg-card text-card-foreground shadow-sm p-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-xl font-semibold leading-none tracking-tight">{video.title}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={author.user_metadata?.avatar_url} alt={authorName} />
            <AvatarFallback>{authorInitials}</AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
        <VideoShareDialog videoId={video.id} />
      </div>
    </div>
  );
} 