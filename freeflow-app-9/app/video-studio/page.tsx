'use client'

import { useState } from 'react'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
// import { AIVideoRecordingSystem } from '@/components/collaboration/ai-video-recording-system'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  Monitor, 
  Upload, 
  Play, 
  Settings, 
  Zap,
  Camera,
  Mic,
  Square
} from 'lucide-react'

export default function VideoStudioPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const handleStartRecording = () => {
    setIsRecording(true)
    // In a real implementation, this would start the actual recording
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    // In a real implementation, this would stop the recording and save the video
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Video Studio</h1>
          <p className="text-secondary">Professional video recording and editing platform</p>
        </div>

        <Tabs defaultValue="record" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="record" className="flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Record
            </TabsTrigger>
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Enhance
            </TabsTrigger>
            <TabsTrigger value="library" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Library
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record">
            {/* AI Video Recording System - Temporarily disabled */}
            <div className="mb-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">AI Video Recording System</h3>
              <p className="text-blue-700 dark:text-blue-300">Advanced video recording with AI transcription and analysis - Coming Soon!</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recording Interface */}
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Video Recording
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-4">
                  {/* Video Preview Area */}
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="text-center">
                      <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">Camera preview will appear here</p>
                    </div>
                  </div>

                  {/* Recording Controls */}
                  <div className="flex items-center justify-center gap-4">
                    {!isRecording ? (
                      <EnhancedButton
                        onClick={handleStartRecording}
                        variant="kazi"
                        size="lg"
                        leftIcon={<Play className="h-5 w-5" />}
                      >
                        Start Recording
                      </EnhancedButton>
                    ) : (
                      <EnhancedButton
                        onClick={handleStopRecording}
                        variant="destructive"
                        size="lg"
                        leftIcon={<Square className="h-5 w-5" />}
                      >
                        Stop Recording
                      </EnhancedButton>
                    )}
                  </div>

                  {isRecording && (
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        Recording: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  )}
                </EnhancedCardContent>
              </EnhancedCard>

              {/* Recording Settings */}
              <EnhancedCard>
                <EnhancedCardHeader>
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Recording Settings
                  </EnhancedCardTitle>
                </EnhancedCardHeader>
                <EnhancedCardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Video Quality
                      </label>
                      <select className="w-full input-enhanced">
                        <option value="1080p">1080p HD</option>
                        <option value="720p">720p HD</option>
                        <option value="480p">480p SD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-secondary mb-2">
                        Frame Rate
                      </label>
                      <select className="w-full input-enhanced">
                        <option value="60">60 FPS</option>
                        <option value="30">30 FPS</option>
                        <option value="24">24 FPS</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="audio" className="rounded" />
                      <label htmlFor="audio" className="text-sm text-secondary">
                        Record audio
                      </label>
                      <Mic className="h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="webcam" className="rounded" />
                      <label htmlFor="webcam" className="text-sm text-secondary">
                        Include webcam overlay
                      </label>
                    </div>
                  </div>
                </EnhancedCardContent>
              </EnhancedCard>
            </div>
          </TabsContent>

          <TabsContent value="enhance">
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Video Enhancement
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-center py-12">
                  <Zap className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-primary mb-2">AI Enhancement Tools</h3>
                  <p className="text-secondary mb-6">
                    Enhance your videos with AI-powered tools for better quality and engagement
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-primary mb-2">Auto Enhance</h4>
                      <p className="text-sm text-secondary">Automatically improve video quality</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-primary mb-2">Noise Reduction</h4>
                      <p className="text-sm text-secondary">Remove background noise from audio</p>
                    </div>
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium text-primary mb-2">Auto Captions</h4>
                      <p className="text-sm text-secondary">Generate captions automatically</p>
                    </div>
                  </div>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </TabsContent>

          <TabsContent value="library">
            <EnhancedCard>
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Library
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="text-center py-12">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-primary mb-2">Your Video Library</h3>
                  <p className="text-secondary mb-6">
                    Manage and organize all your recorded videos
                  </p>
                  <EnhancedButton variant="outline" leftIcon={<Upload className="h-4 w-4" />}>
                    Upload Video
                  </EnhancedButton>
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}