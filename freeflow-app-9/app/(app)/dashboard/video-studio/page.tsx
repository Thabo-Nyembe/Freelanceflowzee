'use client'

import React from 'react'
import { EnterpriseVideoStudio } from '@/components/collaboration/enterprise-video-studio'
import { AIVideoRecordingSystem } from '@/components/collaboration/ai-video-recording-system'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Monitor, 
  Camera, 
  Video, 
  Users, 
  Download, 
  Play, 
  Brain, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react

export default function VideoStudioPage() {
  const currentUser = { id: '1', name: 'User', email: 'user@example.com' }
  
  const handleRecordingComplete = (data: any) => {
    console.log('Recording completed:', data)
  }
  
  const handleShare = (data: any) => {
    console.log('Sharing:', data)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Studio</h1>
          <p className="text-muted-foreground">
            Create, edit, and share professional videos with AI-powered tools
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          data-testid="record-btn
          className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer
          onClick={() => {
            console.log('Opening recording interface');
            alert('Recording interface opened!');
          }}
        >"
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Monitor className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Record</h3>
            <p className="text-sm text-gray-600">Record your screen with audio</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="edit-btn
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer
          onClick={() => {
            console.log('Opening video editor');
            alert('Video editor opened!');
          }}
        >"
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Edit</h3>
            <p className="text-sm text-gray-600">Edit videos with advanced tools</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="upload-media-btn
          className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer
          onClick={() => {
            console.log('Opening upload dialog');
            alert('Upload dialog opened!');
          }}
        >"
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3">
              <Video className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Upload</h3>
            <p className="text-sm text-gray-600">Upload existing videos</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="share-btn
          className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer
          onClick={() => {
            console.log('Opening share options');
            alert('Share options opened!');
          }}
        >"
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
                data-testid="export-btn
                variant="outline" 
                className="border-orange-200 text-orange-700 hover:bg-orange-50
                onClick={() => {
                  console.log('Opening export dialog');
                  alert('Export dialog opened!');
                }}
              >"
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
            projectId="current-project
            currentUser={currentUser}
            onRecordingComplete={handleRecordingComplete}
            onShare={handleShare}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            {/* AI Recording System */}
            <AIVideoRecordingSystem
              projectId="current-project
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
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>
                    Track video performance and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>View Time</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Engagement Rate</span>
                      <span className="font-semibold">89%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Client Feedback</span>
                      <span className="font-semibold">4.9/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-6">
          <div className="text-center py-12">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Asset Library</h3>
            <p className="text-gray-600 mb-4">Manage your video assets, templates, and media files</p>
            <Button>Browse Assets</Button>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Analytics</h3>
            <p className="text-gray-600 mb-4">Track performance, engagement, and client feedback</p>
            <Button>View Analytics</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 