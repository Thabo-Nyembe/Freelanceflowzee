'use client'

import { } from 'react'
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
  ExternalLink,
  Edit
} from 'lucide-react';
import ScreenRecorder from '@/components/video/screen-recorder';
import Image from 'next/image';
import { AIVideoRecordingSystem } from '@/components/collaboration/ai-video-recording-system'
import { VideoAIPanel } from '@/components/video/ai/video-ai-panel'
import { EnterpriseVideoStudio } from '@/components/collaboration/enterprise-video-studio'

export default function VideoStudioPage() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)

  const handleRecordingComplete = (videoId: string, videoUrl: string) => {
    setCurrentVideoId(videoId)
    setCurrentVideoUrl(videoUrl)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Video Studio</h1>

      <Tabs defaultValue="record" className="space-y-4">
        <TabsList>
          <TabsTrigger value="record">Record</TabsTrigger>
          <TabsTrigger value="enhance">Enhance</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="record">
          <Card>
            <CardHeader>
              <CardTitle>AI Video Recording</CardTitle>
            </CardHeader>
            <CardContent>
              <AIVideoRecordingSystem
                projectId="demo"
                currentUser={{
                  id: 'user-1',
                  name: 'Demo User',
                  avatar: '/avatars/user-1.jpg'
                }}
                onSave={handleRecordingComplete}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enhance">
          <Card>
            <CardHeader>
              <CardTitle>AI Enhancement Studio</CardTitle>
            </CardHeader>
            <CardContent>
              {currentVideoId ? (
                <VideoAIPanel
                  videoId={currentVideoId}
                  videoTitle="My Recording"
                  videoDuration={0}
                  aiData={{
                    status: {
                      overall: 'pending',
                      features: {
                        transcription: false,
                        analysis: false,
                        tags: false,
                        chapters: false
                      }
                    }
                  }}
                  onProcessAI={async () => {
                    // Handle AI processing
                  }}
                />
              ) : (
                <p>Record or select a video to enhance with AI</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library">
          <Card>
            <CardHeader>
              <CardTitle>Video Library</CardTitle>
            </CardHeader>
            <CardContent>
              <EnterpriseVideoStudio
                onRecordingComplete={(recording) => {
                  console.log('New recording:', recording)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 