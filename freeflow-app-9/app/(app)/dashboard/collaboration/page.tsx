'use client'

import { RealTimeCollaborationSystem } from '@/components/collaboration/real-time-collaboration'
import { UniversalPinpointFeedbackSystem } from '@/components/collaboration/universal-pinpoint-feedback-system'
import UniversalMediaPreviewsEnhanced from '@/components/collaboration/universal-media-previews-enhanced'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  MessageCircle,
  Target,
  MessageSquare,
  Image as ImageIcon,
  Brain,
  FolderOpen
} from 'lucide-react'

// Mock data for demonstration
const currentUser = {
  id: 'user-1',
  name: 'Sarah Chen',
  email: 'sarah@example.com',
  avatar: '/avatars/sarah.jpg',
  role: 'freelancer' as const,
  isOnline: true
}

// Sample files for Universal Pinpoint Feedback
const sampleFiles = [
  {
    id: 'img_1',
    name: 'Homepage_Mockup_v3.jpg',
    type: 'image' as const,
    url: '/images/homepage-mockup.jpg',
    thumbnail: '/images/homepage-thumb.jpg',
    metadata: {
      dimensions: { width: 1920, height: 1080 }
    },
    status: 'review' as const,
    comments: []
  }
]

export default function CollaborationPage() {
  return (
    <div className="container-responsive py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="heading-responsive font-bold text-slate-900">
          Enhanced Collaboration Hub
        </h1>
        <p className="text-responsive text-slate-600 max-w-3xl mx-auto">
          Experience the future of creative collaboration with real-time feedback, 
          AI-powered insights, and seamless client communication.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700">
            <Video className="w-3 h-3 mr-1" />
            Real-time Collaboration
          </Badge>
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-700">
            <MessageCircle className="w-3 h-3 mr-1" />
            Universal Feedback
          </Badge>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 text-purple-700">
            <Brain className="w-3 h-3 mr-1" />
            AI-Powered Insights
          </Badge>
        </div>
      </div>

      {/* Collaboration Tabs */}
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="bg-white/60 backdrop-blur-sm border-slate-200/50">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Enhanced Chat</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Media</span>
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Gallery</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <RealTimeCollaborationSystem />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-6">
          <Card className="glass-card">
            <CardContent>
              <UniversalPinpointFeedbackSystem 
                projectId="current-project"
                files={sampleFiles}
                currentUser={{
                  id: currentUser.id,
                  name: currentUser.name,
                  avatar: currentUser.avatar,
                  role: 'freelancer'
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                Universal Media Previews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UniversalMediaPreviewsEnhanced />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-orange-600" />
                Project Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Gallery</h3>
                <p className="text-gray-600">
                  Browse and manage all project files and assets in one place.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}