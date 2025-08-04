import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import MuxVideoPlayer from '@/components/video/mux-video-player';
import { VideoStatusIndicator } from '@/components/video/video-status-indicator';
import { VideoShareActions } from '@/components/video/video-share-actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoStatusMonitor } from '@/components/video/video-status-monitor';
import { 
  Play, 
  Share2, 
  Clock, 
  Eye, 
  User,
  Calendar,
  ExternalLink,
  Shield,
  Globe
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  // Get video details for metadata
  const { data: video } = await supabase
    .from('videos')
    .select('title, description, thumbnail_url, mux_playback_id, duration_seconds, created_at, owner_id, profiles(full_name)')
    .eq('id', id)
    .eq('is_public', true)
    .eq('status', 'ready')
    .single();

  if (!video) {
    return {
      title: 'Video Not Found | FreeFlow',
      description: 'The requested video could not be found or is not publicly available.'
    };
  }

  const title = video.title || 'Untitled Video';
  const description = video.description || `Watch "${title}" on FreeFlow - Professional video sharing for freelancers`;
  const thumbnailUrl = video.thumbnail_url || 
    (video.mux_playback_id ? `https://image.mux.com/${video.mux_playback_id}/thumbnail.jpg?width=1200&height=630&fit_mode=pad` : null);

  return {
    title: `${title} | FreeFlow`,
    description,
    openGraph: {
      title,
      description,
      type: 'video.other',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/share/${id}`,
      images: thumbnailUrl ? [
        {
          url: thumbnailUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ] : [],
      videos: video.mux_playback_id ? [
        {
          url: `https://stream.mux.com/${video.mux_playback_id}.m3u8`,
          type: 'application/x-mpegURL',
        }
      ] : [],
    },
    twitter: {
      card: 'player',
      title,
      description,
      images: thumbnailUrl ? [thumbnailUrl] : [],
      players: video.mux_playback_id ? [
        {
          playerUrl: `${process.env.NEXT_PUBLIC_APP_URL}/embed/${id}`,
          streamUrl: `https://stream.mux.com/${video.mux_playback_id}.m3u8`,
          width: 1280,
          height: 720,
        }
      ] : [],
    },
    other: {
      'video:duration': video.duration_seconds?.toString() || '0',
      'video:release_date': video.created_at,
    }
  };
}

export default async function PublicVideoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get video details with owner information
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      id,
      title,
      description,
      thumbnail_url,
      mux_playback_id,
      mux_asset_id,
      duration_seconds,
      view_count,
      status,
      is_public,
      password_protected,
      created_at,
      updated_at,
      owner_id,
      profiles!videos_owner_id_fkey (
        id,
        full_name,
        avatar_url,
        company
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Private Video</CardTitle>
            <CardDescription>
              This video is private and cannot be accessed without permission.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">Go to FreeFlow</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if video is ready for viewing
  if (video.status !== 'ready') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Video Processing</CardTitle>
            <CardDescription>
              This video is still being processed. Please check back in a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <VideoStatusMonitor 
              videoId={id} 
              showDebugInfo={false}
              autoStart={true}
              className="mx-auto"
            />
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/" className="font-bold text-xl">FreeFlow</Link>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Public
              </Badge>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/" className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Open FreeFlow
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="aspect-video rounded-lg overflow-hidden bg-black">
              <MuxVideoPlayer
                videoId={video.id}
                playbackId={video.mux_playback_id!}
                title={video.title || 'Untitled Video'}
                poster={video.thumbnail_url}
                autoPlay={false}
                className="w-full h-full"
              />
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {video.title || 'Untitled Video'}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatViewCount(video.view_count || 0)} views
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(video.duration_seconds || 0)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(video.created_at).toLocaleDateString()}
                  </div>
                                     <VideoStatusIndicator 
                     videoId={video.id} 
                     size="sm" 
                     showProgress={false}
                     autoRefresh={false}
                   />
                </div>
              </div>

              {video.description && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {video.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                                 <div className="flex items-start gap-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white font-semibold">
                     {video.profiles?.[0]?.full_name?.charAt(0) || 'U'}
                   </div>
                   <div className="flex-1">
                     <h3 className="font-medium">
                       {video.profiles?.[0]?.full_name || 'Anonymous'}
                     </h3>
                     {video.profiles?.[0]?.company && (
                       <p className="text-sm text-muted-foreground">
                         {video.profiles[0].company}
                       </p>
                     )}
                   </div>
                 </div>
              </CardContent>
            </Card>

            {/* Sharing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VideoShareActions
                  videoId={video.id}
                  currentUrl={`${process.env.NEXT_PUBLIC_APP_URL}/share/${video.id}`}
                  embedUrl={`${process.env.NEXT_PUBLIC_APP_URL}/embed/${video.id}`}
                  title={video.title || 'Untitled Video'}
                />
              </CardContent>
            </Card>

            {/* Video Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Video Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{formatDuration(video.duration_seconds || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Views</span>
                  <span>{formatViewCount(video.view_count || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Published</span>
                  <span>{new Date(video.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default">Ready</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Powered by <Link href="/" className="font-medium hover:underline">FreeFlow</Link> - 
              Professional video sharing for freelancers
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 