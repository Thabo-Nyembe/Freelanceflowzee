import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MuxVideoPlayer from '@/components/video/mux-video-player';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  Play, 
  Shield,
  Clock,
  Eye
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: 'FreeFlow Video Player',
    description: 'Embedded video player',
    robots: 'noindex, nofollow', // Prevent indexing of embed pages
    other: {
      'X-Frame-Options': 'ALLOWALL', // Allow embedding in iframes
    }
  };
}

export default async function EmbedVideoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get video details (only public videos can be embedded)
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      mux_playback_id,
      duration_seconds,
      view_count,
      status,
      is_public,
      created_at,
      owner_id,
      profiles!videos_owner_id_fkey (
        full_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .single();

  if (error || !video) {
    notFound();
  }

  // Check if video is publicly accessible
  if (!video.is_public) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Private Video</h2>
          <p className="text-gray-400 mb-4">This video is private and cannot be embedded.</p>
          <Button variant="outline" asChild>
            <a href={`${process.env.NEXT_PUBLIC_APP_URL}`} target="_parent">
              Open FreeFlow
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Check if video is ready for viewing
  if (video.status !== 'ready') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Play className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Video Processing</h2>
          <p className="text-gray-400 mb-4">This video is still being processed.</p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-600 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Increment view count (fire and forget)
  supabase
    .from('videos')
    .update({ view_count: (video.view_count || 0) + 1 })
    .eq('id', id)
    .then();

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

  const formatViewCount = (count: number) => {
    if (!count) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Video Player - Takes most of the space */}
      <div className="flex-1 relative">
        <MuxVideoPlayer
          playbackId={video.mux_playback_id!}
          title={video.title || 'Untitled Video'}
          poster={video.thumbnail_url}
          autoPlay={false}
          className="w-full h-full"
        />
        
        {/* Overlay controls for very small embeds */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:hidden">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-xs font-semibold">
                {video.profiles?.[0]?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="text-white/80 truncate">
                {video.profiles?.[0]?.full_name || 'Anonymous'}
              </span>
            </div>
            <Button size="sm" variant="ghost" asChild>
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/share/${id}`} 
                target="_parent"
                className="text-white/80 hover:text-white"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Info Bar - Only shown on larger embeds */}
      <div className="hidden md:block bg-black/90 backdrop-blur border-t border-gray-800 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Creator Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-sm font-semibold shrink-0">
              {video.profiles?.[0]?.full_name?.charAt(0) || 'U'}
            </div>
            
            {/* Video Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate text-sm">
                {video.title || 'Untitled Video'}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>{video.profiles?.[0]?.full_name || 'Anonymous'}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatViewCount(video.view_count || 0)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration_seconds || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* FreeFlow Branding & Link */}
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="secondary" className="text-xs">
              FreeFlow
            </Badge>
            <Button size="sm" variant="outline" asChild>
              <a 
                href={`${process.env.NEXT_PUBLIC_APP_URL}/share/${id}`} 
                target="_parent"
                className="flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Watch
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Minimal branding for very small embeds */}
      <div className="md:hidden bg-black/90 p-2 text-center">
        <a 
          href={`${process.env.NEXT_PUBLIC_APP_URL}/share/${id}`} 
          target="_parent"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Watch on FreeFlow
        </a>
      </div>
    </div>
  );
} 