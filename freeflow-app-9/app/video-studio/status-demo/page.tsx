'use client';

import React, { useState } from 'react';
import { VideoStatusMonitor } from '@/components/video/video-status-monitor';
import { VideoStatusIndicator, VideoStatusBadge } from '@/components/video/video-status-indicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Play, 
  Code, 
  Zap, 
  Monitor, 
  Eye,
  VideoIcon,
  Settings,
  Activity
} from 'lucide-react';
import { useVideoStatus, VideoStatus } from '@/hooks/useVideoStatus';

export default function VideoStatusDemoPage() {
  const [demoVideoId, setDemoVideoId] = useState('');
  const [mockVideoIds] = useState([
    'demo-uploading-001',
    'demo-processing-002', 
    'demo-transcribing-003',
    'demo-ready-004',
    'demo-error-005'
  ]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-blue-600" />
          <h1 className="text-4xl font-bold">Video Status Polling System</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Real-time video processing status updates inspired by Cap.so's implementation.
          Experience live polling, progress tracking, and status synchronization.
        </p>
        
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time Polling
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Monitor className="h-3 w-3" />
            Live Progress
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <VideoIcon className="h-3 w-3" />
            Status Sync
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor">Full Monitor</TabsTrigger>
          <TabsTrigger value="indicators">Status Indicators</TabsTrigger>
          <TabsTrigger value="custom">Custom Video</TabsTrigger>
          <TabsTrigger value="integration">Integration Guide</TabsTrigger>
        </TabsList>

        {/* Full Status Monitor Demo */}
        <TabsContent value="monitor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Full Status Monitor Component
              </CardTitle>
              <CardDescription>
                Complete video processing monitor with real-time updates, progress tracking, 
                and detailed processing pipeline visualization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {mockVideoIds.slice(0, 2).map((videoId) => (
                  <VideoStatusMonitor
                    key={videoId}
                    videoId={videoId}
                    showDebugInfo={false}
                    autoStart={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Status Indicators Demo */}
        <TabsContent value="indicators" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Compact Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Status Indicators
                </CardTitle>
                <CardDescription>
                  Compact status indicators for integration in video lists and UI elements.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Small Size</Label>
                  {mockVideoIds.map((videoId) => (
                    <div key={videoId} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">Video {videoId.split('-')[1]}</span>
                      <VideoStatusIndicator 
                        videoId={videoId} 
                        size="sm" 
                        showProgress={false}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <Label>Medium Size with Progress</Label>
                  {mockVideoIds.slice(0, 3).map((videoId) => (
                    <div key={videoId} className="flex items-center justify-between p-3 border rounded">
                      <span className="font-medium">Video {videoId.split('-')[1]}</span>
                      <VideoStatusIndicator 
                        videoId={videoId} 
                        size="md" 
                        showProgress={true}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Thumbnail Overlays */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <VideoIcon className="h-5 w-5" />
                  Thumbnail Overlays
                </CardTitle>
                <CardDescription>
                  Status badges for video thumbnails and gallery views.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {mockVideoIds.map((videoId, index) => (
                    <div key={videoId} className="relative">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                        <Play className="h-8 w-8 text-blue-600" />
                      </div>
                      <VideoStatusBadge videoId={videoId} />
                      <div className="mt-2 text-sm font-medium text-center">
                        Demo Video {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Video Demo */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test with Your Video
              </CardTitle>
              <CardDescription>
                Enter a video ID to test the status polling system with your own videos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="videoId">Video ID</Label>
                  <Input
                    id="videoId"
                    placeholder="Enter video ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                    value={demoVideoId}
                    onChange={(e) => setDemoVideoId(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={() => setDemoVideoId('')}
                  variant="outline"
                  className="mt-6"
                >
                  Clear
                </Button>
              </div>

              {demoVideoId && (
                <div className="mt-6">
                  <VideoStatusMonitor
                    videoId={demoVideoId}
                    showDebugInfo={true}
                    autoStart={true}
                  />
                </div>
              )}

              {!demoVideoId && (
                <Alert>
                  <VideoIcon className="h-4 w-4" />
                  <AlertTitle>Ready to Test</AlertTitle>
                  <AlertDescription>
                    Enter a video ID above to monitor its processing status in real-time.
                    The system will automatically poll for updates every 2 seconds.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Guide */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Integration Examples
                </CardTitle>
                <CardDescription>
                  Learn how to integrate the video status polling system into your application.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Hook Usage */}
                <div>
                  <h3 className="font-semibold mb-2">1. Basic Hook Usage</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                    <pre>{`import { useVideoStatus, VideoStatus } from '@/hooks/useVideoStatus';

function VideoComponent({ videoId }: { videoId: string }) {
  const {
    status,
    isPolling,
    isReady,
    overallProgress
  } = useVideoStatus({
    videoId,
    enabled: true,
    pollingInterval: 2000,
    onProcessingComplete: (video: VideoStatus) => {
      console.log('Video ready!', video);
    }
  });

  return (
    <div>
      <p>Status: {status?.processing_status}</p>
      <p>Progress: {overallProgress}%</p>
    </div>
  );
}`}</pre>
                  </div>
                </div>

                {/* Status Monitor Component */}
                <div>
                  <h3 className="font-semibold mb-2">2. Full Status Monitor</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                    <pre>{`import { VideoStatusMonitor } from '@/components/video/video-status-monitor';

<VideoStatusMonitor
  videoId="your-video-id"
  showDebugInfo={false}
  autoStart={true}
  className="max-w-lg"
/>`}</pre>
                  </div>
                </div>

                {/* Compact Indicators */}
                <div>
                  <h3 className="font-semibold mb-2">3. Compact Status Indicators</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                    <pre>{`import { VideoStatusIndicator, VideoStatusBadge } from '@/components/video/video-status-indicator';

// In video lists
<VideoStatusIndicator 
  videoId="video-id" 
  size="sm" 
  showProgress={true}
/>

// On video thumbnails
<div className="relative">
  <img src="thumbnail.jpg" />
  <VideoStatusBadge videoId="video-id" />
</div>`}</pre>
                  </div>
                </div>

                {/* API Integration */}
                <div>
                  <h3 className="font-semibold mb-2">4. API Endpoint Structure</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono">
                    <pre>{`// GET /api/video/[id]/status
{
  "success": true,
  "data": {
    "video_id": "uuid",
    "status": "processing",
    "progress": 65,
    "current_step": "encoding",
    "estimated_completion": "2024-01-15T10:30:00Z",
    "steps": [
      {
        "name": "upload",
        "status": "completed",
        "progress": 100
      },
      {
        "name": "encoding", 
        "status": "processing",
        "progress": 65
      }
    ]
  }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Real-time Polling</h4>
                    <p className="text-sm text-muted-foreground">
                      Automatic status updates every 2-5 seconds with intelligent polling that stops when processing completes.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Progress Tracking</h4>
                    <p className="text-sm text-muted-foreground">
                      Detailed progress indicators for each processing stage with estimated completion times.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Error Handling</h4>
                    <p className="text-sm text-muted-foreground">
                      Graceful error handling with retry mechanisms and user-friendly error messages.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Flexible Components</h4>
                    <p className="text-sm text-muted-foreground">
                      Multiple component sizes and styles for different use cases throughout your application.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 