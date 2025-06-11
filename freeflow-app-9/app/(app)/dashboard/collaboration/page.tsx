'use client'

import React from 'react'
import { RealTimeCollaborationSystem } from '@/components/collaboration/real-time-collaboration'
import { EnhancedCollaborationChat } from '@/components/collaboration/enhanced-collaboration-chat'
import { UniversalPinpointFeedback } from '@/components/collaboration/universal-pinpoint-feedback'
import { UniversalMediaPreviews } from '@/components/collaboration/universal-media-previews'
import { EnhancedClientCollaboration } from '@/components/collaboration/enhanced-client-collaboration'
import { AIDesignAssistant } from '@/components/collaboration/ai-powered-design-assistant'
import { AdvancedClientPortal } from '@/components/collaboration/advanced-client-portal'
import { EnhancedGallery } from '@/components/portfolio/enhanced-gallery'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  MessageCircle, 
  Users, 
  Settings,
  Phone,
  Camera,
  Mic,
  Target,
  Sparkles,
  MessageSquare,
  Eye,
  Image,
  Brain,
  Palette2,
  UserCheck,
  FolderOpen
} from 'lucide-react'

// Mock data for demonstration
const currentUser = {
  id: 'user_1',
  name: 'Alex Designer',
  avatar: '/avatars/alex.jpg',
  role: 'freelancer' as const,
  isOnline: true
}

const connectedUsers = [
  {
    id: 'user_2',
    name: 'Sarah Johnson',
    avatar: '/avatars/sarah.jpg',
    role: 'client' as const,
    isOnline: true
  },
  {
    id: 'user_3',
    name: 'Mike Developer',
    avatar: '/avatars/mike.jpg',
    role: 'freelancer' as const,
    isOnline: true
  },
  {
    id: 'user_4',
    name: 'Lisa Manager',
    avatar: '/avatars/lisa.jpg',
    role: 'client' as const,
    isOnline: false
  }
]

// Sample project files for UPF demo
const sampleProjectFiles = [
  {
    id: 'file_1',
    name: 'Brand Animation.mp4',
    type: 'video' as const,
    url: '/videos/brand-animation.mp4',
    thumbnail: '/images/video-thumb-1.jpg',
    metadata: {
      duration: 45,
      dimensions: { width: 1920, height: 1080 }
    }
  },
  {
    id: 'file_2',
    name: 'Homepage Mockup.jpg',
    type: 'image' as const,
    url: '/images/homepage-mockup.jpg',
    metadata: {
      dimensions: { width: 1440, height: 2560 }
    }
  },
  {
    id: 'file_3',
    name: 'Brand Guidelines.pdf',
    type: 'pdf' as const,
    url: '/documents/brand-guidelines.pdf',
    metadata: {
      pageCount: 24
    }
  },
  {
    id: 'file_4',
    name: 'Component Library.tsx',
    type: 'code' as const,
    url: '/code/component-library.tsx',
    metadata: {
      language: 'typescript'
    }
  }
]

const sampleImage = "/images/design-preview.jpg"

export default function CollaborationPage() {
  const handleCommentAdd = (content: string, position?: { x: number; y: number }) => {
    console.log('New comment added:', { content, position })
    // In a real app, this would save to the database
  }

  const handleUPFCommentAdd = (comment: any) => {
    console.log('UPF comment added:', comment)
    // In a real app, this would save to the database via API
  }

  const handleUPFCommentUpdate = (commentId: string, updates: any) => {
    console.log('UPF comment updated:', { commentId, updates })
    // In a real app, this would update via API
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Collaboration</h1>
          <p className="text-gray-600">Real-time communication and project collaboration</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            {connectedUsers.filter(u => u.isOnline).length + 1} Online
          </Badge>
        </div>
      </div>

      {/* Collaboration Tabs */}
      <Tabs defaultValue="client-collab" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9 bg-white/60 backdrop-blur-xl border-white/20">
          <TabsTrigger value="client-collab" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Client Collaboration
          </TabsTrigger>
          <TabsTrigger value="upf" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Universal Feedback
          </TabsTrigger>
          <TabsTrigger value="previews" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Media Previews
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Enhanced Chat
          </TabsTrigger>
          <TabsTrigger value="calls" className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Voice & Video
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Gallery
          </TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="client-portal" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Client Portal
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="client-collab" className="space-y-0">
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-1">
            <EnhancedClientCollaboration
              projectId="project_demo_123"
              currentUser={currentUser}
              onCommentAdd={(comment) => console.log('Client comment added:', comment)}
              onCommentUpdate={(id, updates) => console.log('Client comment updated:', { id, updates })}
              onFileApproval={(fileId, status) => console.log('File approval:', { fileId, status })}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-6"
            />
          </div>
        </TabsContent>

        <TabsContent value="upf" className="space-y-0">
          <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl p-1">
            <UniversalPinpointFeedback
              projectId="project_demo_123"
              files={sampleProjectFiles}
              currentUser={currentUser}
              onCommentAdd={handleUPFCommentAdd}
              onCommentUpdate={handleUPFCommentUpdate}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-6"
            />
          </div>
        </TabsContent>

        <TabsContent value="previews" className="space-y-0">
          <UniversalMediaPreviews />
        </TabsContent>

        <TabsContent value="chat" className="space-y-0">
          <EnhancedCollaborationChat
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            selectedImage={sampleImage}
            onCommentAdd={handleCommentAdd}
          />
        </TabsContent>

        <TabsContent value="calls" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Conference Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600">Set up video conferences with your team and clients</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                  <CardContent className="p-4 text-center">
                    <Camera className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-800 mb-1">Video Calls</h3>
                    <p className="text-sm text-blue-600">High-quality video conferencing</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
                  <CardContent className="p-4 text-center">
                    <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-800 mb-1">Audio Calls</h3>
                    <p className="text-sm text-green-600">Crystal clear voice communication</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-0">
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-1">
            <EnhancedGallery
              showCollections={true}
              allowUpload={true}
              showAnalytics={true}
              mode="portfolio"
              className="bg-white/70 backdrop-blur-sm rounded-lg p-6"
            />
          </div>
        </TabsContent>

        <TabsContent value="ai-assistant" className="space-y-0">
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-1">
            <AIDesignAssistant
              projectId="project_demo_123"
              currentFile={sampleProjectFiles[0]}
              onSuggestionApply={(suggestion) => {
                console.log('Applying AI suggestion:', suggestion)
                // In a real app, this would apply the suggestion to the design
              }}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-6"
            />
          </div>
        </TabsContent>

        <TabsContent value="client-portal" className="space-y-0">
          <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-xl p-1">
            <AdvancedClientPortal
              projectId="project_demo_123"
              clientId="client_demo_456"
              initialAccessLevel="preview"
              onUpgradeAccess={(level) => {
                console.log('Upgrading access to:', level)
                // In a real app, this would trigger payment flow
              }}
              className="bg-white/70 backdrop-blur-sm rounded-lg p-6"
            />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Communication Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Default Microphone</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg">
                  <option>Built-in Microphone</option>
                  <option>External USB Microphone</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Default Camera</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg">
                  <option>Built-in Camera</option>
                  <option>External Webcam</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Audio Quality</label>
                <select className="w-full p-2 border border-slate-200 rounded-lg">
                  <option>High Quality</option>
                  <option>Standard Quality</option>
                  <option>Low Bandwidth</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">AI Analysis</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Enable AI-powered feedback analysis</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  AI will automatically categorize and provide insights on feedback comments
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Voice Notes</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Enable voice note recording</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Allow voice notes in feedback comments for better communication
                </p>
              </div>
            </CardContent>
          </Card>

          {/* UPF Feature Overview Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Universal Pinpoint Feedback Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-700">Multi-Media Support</h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Images with pixel-perfect positioning</li>
                    <li>• Videos with timestamp comments</li>
                    <li>• PDFs with page-specific feedback</li>
                    <li>• Code files with line annotations</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-700">AI-Powered Features</h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Automatic feedback categorization</li>
                    <li>• Priority assessment</li>
                    <li>• Theme extraction</li>
                    <li>• Effort estimation</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-700">Voice & Media</h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Voice note recording</li>
                    <li>• Audio waveform visualization</li>
                    <li>• Screen recording comments</li>
                    <li>• File attachments</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-purple-700">Collaboration Tools</h4>
                  <ul className="text-sm text-purple-600 space-y-1">
                    <li>• Real-time reactions</li>
                    <li>• Threaded discussions</li>
                    <li>• @mention notifications</li>
                    <li>• Status tracking</li>
                  </ul>
                </div>
              </div>
              
              <div className="p-3 bg-white/60 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  <strong>What sets UPF apart:</strong> One unified commenting system that works seamlessly 
                  across all file types with AI-powered insights, voice recording capabilities, and 
                  intelligent feedback summarization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 