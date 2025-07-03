import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Calendar, 
  Clock, 
  User, 
  Share, 
  Download,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Play
} from 'lucide-react';
import MuxVideoPlayer from '@/components/video/mux-video-player';
import { VideoThumbnailGrid } from '@/components/video/video-thumbnail';
import { createClient } from '@/lib/supabase/server';
import { formatDuration } from '@/lib/video/config';

interface VideoPageProps {
  params: {
    id: string;
  };
  searchParams: {
    t?: string; // timestamp
  };
}

export async function generateMetadata({ params }: VideoPageProps): Promise<Metadata> {
  const supabase = await createClient();
  
  const { data: video } = await supabase
    .from('videos')
    .select('title, description')
    .eq('id', params.id)
    .single();

  return {
    title: video?.title ? `${video.title} | FreeFlow` : 'Video | FreeFlow',
    description: video?.description || 'Watch this video on FreeFlow',
  };
}

export default async function VideoPage({ params, searchParams }: VideoPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get video details
  const { data: video, error } = await supabase
    .from('videos')
    .select(`
      *,
      user:user_id (
        display_name,
        avatar_url
      ),
      project:project_id (
        name,
        description
      )
    `)
    .eq('id', params.id)
    .single();

  if (error || !video) {
    notFound();
  }

  // Check video permissions
  const isOwner = user?.id === video.user_id;
  const isPublic = video.is_public;
  
  if (!isOwner && !isPublic) {
    // Check if user has access through project or sharing
    notFound();
  }

  // Get related videos
  const { data: relatedVideos } = await supabase
    .from('videos')
    .select('id, title, duration, view_count, status, mux_playback_id, created_at')
    .eq('user_id', video.user_id)
    .neq('id', video.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(6);

  // Increment view count
  if (!isOwner) {
    await supabase
      .from('videos')
      .update({ view_count: (video.view_count || 0) + 1 })
      .eq('id', video.id);
  }

  // Parse timestamp from URL
  const startTime = searchParams.t ? parseInt(searchParams.t) : undefined;

  // Sample chapters (would come from database)
  const chapters = [
    {
      id: '1',
      title: 'Introduction',
      startTime: 0,
      endTime: 30,
      description: 'Welcome and overview'
    },
    {
      id: '2',
      title: 'Main Content',
      startTime: 30,
      endTime: 300,
      description: 'Core tutorial content'
    },
    {
      id: '3',
      title: 'Conclusion',
      startTime: 300,
      description: 'Wrap up and next steps'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: video.title,
        text: video.description,
        url
      });
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Video Player Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Video Player */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-black rounded-lg overflow-hidden">
            {video.mux_playback_id ? (
              <MuxVideoPlayer
                playbackId={video.mux_playback_id}
                title={video.title}
                poster={video.thumbnail_url}
                chapters={chapters}
                className="w-full"
                aspectRatio="16/9"
                showControls={true}
                allowSharing={true}
                onPlay={() => console.log('Video started playing')}
                onTimeUpdate={(time) => console.log('Time update:', time)}
              />
            ) : (
              <div className="aspect-video flex items-center justify-center bg-muted">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Video is still processing...</p>
                  <Badge variant="outline" className="mt-2">
                    {video.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Video Information */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {video.view_count || 0} views
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(video.created_at)}
                </div>
                {video.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDuration(video.duration)}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <ThumbsUp className="w-4 h-4 mr-2" />
                Like
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
              {isOwner && (
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>

            <Separator />

            {/* Creator Information */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {video.user?.display_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-muted-foreground">Content Creator</p>
              </div>
              <Button variant="outline" size="sm">
                Subscribe
              </Button>
            </div>

            {/* Description */}
            {video.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}

            {/* Project Information */}
            {video.project && (
              <div className="space-y-2">
                <h3 className="font-semibold">Related Project</h3>
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium">{video.project.name}</h4>
                    {video.project.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {video.project.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Video Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Views</span>
                <span className="font-medium">{video.view_count || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Duration</span>
                <span className="font-medium">
                  {video.duration ? formatDuration(video.duration) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Status</span>
                <Badge variant={video.status === 'ready' ? 'secondary' : 'outline'}>
                  {video.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Published</span>
                <span className="font-medium">{formatDate(video.created_at)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comments feature coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Videos */}
      {relatedVideos && relatedVideos.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">More from this creator</h2>
          <VideoThumbnailGrid
            videos={relatedVideos.map(vid => ({
              id: vid.id,
              title: vid.title,
              duration: vid.duration,
              viewCount: vid.view_count,
              status: vid.status as 'processing' | 'ready' | 'error' | 'uploading',
              playbackId: vid.mux_playback_id
            }))}
            onVideoClick={(videoId) => {
              window.location.href = `/video/${videoId}`;
            }}
            columns={4}
          />
        </div>
      )}
    </div>
  );
} 