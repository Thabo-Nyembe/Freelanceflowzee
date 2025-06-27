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
    <div className="collaboration-container">
      {/* Header */}
      <div className="collaboration-tabs-container text-center space-y-4">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Enhanced Collaboration Hub
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
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
      <div className="tab-content-container">
        <Tabs defaultValue="chat" className="h-full flex flex-col">
          <TabsList className="tabs-list-fixed">
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

          <div className="tabs-content-area">
            <TabsContent value="chat" className="h-full m-0">
              <div className="glass-card">
                <div className="tab-panel p-6">
                  <RealTimeCollaborationSystem />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="feedback" className="h-full m-0">
              <div className="glass-card">
                <div className="tab-panel p-6">
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="media" className="h-full m-0">
              <div className="glass-card">
                <div className="p-6 flex-shrink-0 border-b border-white/20">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <ImageIcon className="w-5 h-5 text-purple-600" />
                    Universal Media Previews
                  </h3>
                </div>
                <div className="tab-panel p-6">
                  <UniversalMediaPreviewsEnhanced />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="h-full m-0">
              <div className="glass-card">
                <div className="p-6 flex-shrink-0 border-b border-white/20">
                  <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <FolderOpen className="w-5 h-5 text-orange-600" />
                    Project Gallery
                  </h3>
                </div>
                <div className="tab-panel p-6">
                  <div className="text-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Gallery</h3>
                    <p className="text-gray-600">
                      Browse and manage all project files and assets in one place.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}