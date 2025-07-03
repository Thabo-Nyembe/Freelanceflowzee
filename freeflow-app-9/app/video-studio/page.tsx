import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Monitor, 
  Upload, 
  Play, 
  Settings, 
  Zap,
  FileVideo,
  Clock,
  Users,
  TrendingUp,
  Activity,
  ExternalLink
} from 'lucide-react';
import ScreenRecorder from '@/components/video/screen-recorder';
import { VideoThumbnailGrid } from '@/components/video/video-thumbnail';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Video Studio | FreeFlow',
  description: 'Professional screen recording and video management for freelancers',
};

export default async function VideoStudioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user's recent videos
  const { data: recentVideos } = await supabase
    .from('videos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get user's video stats
  const { data: videoStats } = await supabase
    .from('videos')
    .select('id, view_count, duration, status')
    .eq('user_id', user.id);

  const stats = {
    totalVideos: videoStats?.length || 0,
    totalViews: videoStats?.reduce((sum, video) => sum + (video.view_count || 0), 0) || 0,
    totalDuration: videoStats?.reduce((sum, video) => sum + (video.duration || 0), 0) || 0,
    processingVideos: videoStats?.filter(video => video.status === 'processing').length || 0
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleRecordingComplete = (videoBlob: Blob, metadata: any) => {
    console.log('Recording completed:', { size: videoBlob.size, metadata });
  };

  const handleUploadComplete = (videoId: string) => {
    console.log('Upload completed:', videoId);
    // Redirect to video page or show success message
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Video Studio</h1>
          <p className="text-muted-foreground">
            Create, record, and manage your professional videos with real-time status monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/video-studio/status-demo" className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Status Demo
              <ExternalLink className="w-3 h-3" />
            </a>
          </Button>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Powered by Mux
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <FileVideo className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Videos</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalVideos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Views</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.totalViews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Content Created</span>
            </div>
            <div className="text-2xl font-bold mt-2">{formatDuration(stats.totalDuration)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Processing</span>
            </div>
            <div className="text-2xl font-bold mt-2">{stats.processingVideos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="record" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Screen Recorder
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Library
          </TabsTrigger>
        </TabsList>

        {/* Screen Recording Tab */}
        <TabsContent value="record" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Screen Recorder */}
            <div className="lg:col-span-2">
              <ScreenRecorder
                onRecordingComplete={handleRecordingComplete}
                onUploadComplete={handleUploadComplete}
              />
            </div>

            {/* Tips & Guidelines */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Recording Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-2">
                    <p className="font-medium">🎥 Best Practices:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Close unnecessary applications</li>
                      <li>• Use a quiet environment</li>
                      <li>• Test your microphone first</li>
                      <li>• Plan your recording outline</li>
                    </ul>
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <p className="font-medium">📊 Quality Settings:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• High: Best for tutorials</li>
                      <li>• Medium: Good for presentations</li>
                      <li>• Low: Quick screen shares</li>
                    </ul>
                  </div>

                  <div className="text-sm space-y-2">
                    <p className="font-medium">🔒 Security:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Videos are private by default</li>
                      <li>• Enable password protection</li>
                      <li>• Share links expire automatically</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Keyboard Shortcuts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Start Recording</span>
                      <Badge variant="outline">Ctrl + R</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pause/Resume</span>
                      <Badge variant="outline">Space</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Stop Recording</span>
                      <Badge variant="outline">Ctrl + S</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload existing video files to your FreeFlow library
              </p>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Video Files</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your video files here or click to browse
                </p>
                <Button>
                  Choose Files
                </Button>
                <div className="mt-4 text-xs text-muted-foreground">
                  Supported formats: MP4, WebM, MOV • Max size: 5GB
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Recent Videos</h2>
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                Real-time Status
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>

          {recentVideos && recentVideos.length > 0 ? (
            <VideoThumbnailGrid
              videos={recentVideos.map(video => ({
                id: video.id,
                title: video.title,
                duration: video.duration,
                viewCount: video.view_count,
                // Don't pass status to enable real-time polling
                playbackId: video.mux_playback_id
              }))}
              onVideoClick={(videoId) => {
                // Navigate to video page
                window.location.href = `/video/${videoId}`;
              }}
              columns={3}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by recording your first screen capture or uploading a video
                </p>
                <Button>
                  <Monitor className="w-4 h-4 mr-2" />
                  Start Recording
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 