'use client'

import React from 'react'
import { RealTimeCollaborationSystem } from '@/components/collaboration/real-time-collaboration'
import { EnhancedCollaborationChat } from '@/components/collaboration/enhanced-collaboration-chat'
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
  Mic
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

const sampleImage = "/images/design-preview.jpg"

export default function CollaborationPage() {
  const handleCommentAdd = (content: string, position?: { x: number; y: number }) => {
    console.log('New comment added:', { content, position })
    // In a real app, this would save to the database
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
      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Enhanced Chat
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Video Calls
          </TabsTrigger>
          <TabsTrigger value="collaboration" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Real-time Collab
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-0">
          <EnhancedCollaborationChat
            currentUser={currentUser}
            connectedUsers={connectedUsers}
            selectedImage={sampleImage}
            onCommentAdd={handleCommentAdd}
          />
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
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

        <TabsContent value="collaboration" className="space-y-0">
          <RealTimeCollaborationSystem />
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 