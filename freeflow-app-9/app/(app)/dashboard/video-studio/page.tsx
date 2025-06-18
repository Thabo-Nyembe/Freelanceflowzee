'use client'

import React from 'react'
import { EnterpriseVideoStudio } from '@/components/collaboration/enterprise-video-studio'
import { AIVideoRecordingSystem } from '@/components/collaboration/ai-video-recording-system'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  Mic, 
  Monitor, 
  Brain, 
  Users, 
  Sparkles, 
  Eye, 
  TrendingUp,
  Camera,
  Settings,
  Share2,
  Download,
  Play,
  Edit3
} from 'lucide-react'

// Mock current user for demo
const currentUser = {
  id: 'user-1',
  name: 'Current User',
  email: 'user@example.com',
  avatar: '/avatars/current-user.jpg',
  color: '#6366f1'
}

export default function VideoStudioPage() {
  const handleRecordingComplete = (recording: any) => {
    console.log('Recording completed:', recording)
    // Handle recording completion logic here
  }

  const handleShare = (shareData: any) => {
    console.log('Sharing:', shareData)
    // Handle sharing logic here
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Video className="h-8 w-8" />
              </div>
              Enterprise Video Studio
            </h1>
            <p className="text-xl text-white/90 mb-4">
              Loom-level video recording with AI transcription, real-time collaboration & advanced editing
            </p>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Brain className="h-3 w-3 mr-1" />
                AI Enhanced
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Users className="h-3 w-3 mr-1" />
                Real-time Collaboration
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                A+++ Enterprise
              </Badge>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-center">
                <div className="text-2xl font-bold">247</div>
                <div className="text-sm text-white/80">Videos Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15.6K</div>
                <div className="text-sm text-white/80">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">94%</div>
                <div className="text-sm text-white/80">Engagement Rate</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Eye className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <TrendingUp className="h-4 w-4 mr-2" />
                Growth Insights
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          data-testid="create-video-btn"
          className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => {
            console.log('Starting screen recording');
            alert('Screen recording started!');
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Monitor className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Record</h3>
            <p className="text-sm text-gray-600">Record your screen with audio</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="edit-btn"
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => {
            console.log('Opening video editor');
            alert('Video editor opened!');
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Edit</h3>
            <p className="text-sm text-gray-600">Edit videos with advanced tools</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="upload-media-btn"
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => {
            console.log('Opening upload dialog');
            alert('Upload dialog opened!');
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Upload</h3>
            <p className="text-sm text-gray-600">Upload existing videos</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="share-btn"
          className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer"
          onClick={() => {
            console.log('Opening share options');
            alert('Share options opened!');
          }}
        >
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Share</h3>
            <p className="text-sm text-gray-600">Share videos with clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Export Action */}
      <div className="mt-6">
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Export Options</h3>
                  <p className="text-sm text-gray-600">Download in various formats</p>
                </div>
              </div>
              <Button 
                data-testid="export-btn"
                variant="outline" 
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => {
                  console.log('Opening export dialog');
                  alert('Export dialog opened!');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Video Studio Interface */}
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Assets
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-6">
          <EnterpriseVideoStudio
            projectId="current-project"
            currentUser={currentUser}
            onRecordingComplete={handleRecordingComplete}
            onShare={handleShare}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            {/* AI Recording System */}
            <AIVideoRecordingSystem
              projectId="current-project"
              currentUser={currentUser}
              onSave={(data) => console.log('Saved:', data)}
              onShare={handleShare}
            />

            {/* AI Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    Auto Transcription
                  </CardTitle>
                  <CardDescription>
                    AI-powered speech-to-text with 99.5% accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Processing Speed</span>
                      <span className="font-semibold">Real-time</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Languages Supported</span>
                      <span className="font-semibold">50+</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accuracy Rate</span>
                      <span className="font-semibold">99.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Smart Analysis
                  </CardTitle>
                  <CardDescription>
                    AI content analysis and optimization suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Content Topics</span>
                      <span className="font-semibold">Auto-detected</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement Score</span>
                      <span className="font-semibold">87/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Optimization Tips</span>
                      <span className="font-semibold">Real-time</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Live Collaboration
                  </CardTitle>
                  <CardDescription>
                    Real-time viewing, commenting, and interaction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Max Viewers</span>
                      <span className="font-semibold">Unlimited</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Live Comments</span>
                      <span className="font-semibold">Real-time</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Screen Sharing</span>
                      <span className="font-semibold">HD Quality</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Library</CardTitle>
                  <CardDescription>
                    Manage your recorded videos with advanced organization
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Organize
                  </Button>
                  <Button size="sm" data-testid="upload-btn">
                    <Video className="h-4 w-4 mr-2" />
                    New Recording
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                <p className="text-gray-600 mb-6">
                  Start recording to see your videos appear here
                </p>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Video className="h-4 w-4 mr-2" />
                  Create First Recording
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Views</p>
                    <p className="text-2xl font-bold">15,647</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Avg. Watch Time</p>
                    <p className="text-2xl font-bold">4:32</p>
                  </div>
                  <Play className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Engagement Rate</p>
                    <p className="text-2xl font-bold">94%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Total Videos</p>
                    <p className="text-2xl font-bold">247</p>
                  </div>
                  <Video className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>
                AI-powered analytics and recommendations for better engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-600">
                  Detailed analytics and insights will be available once you start recording
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 