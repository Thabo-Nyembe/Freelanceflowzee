'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoRecordingSystem } from './video-recording-system'
import { AIVideoAnalysis } from './ai/ai-video-analysis'
import { VideoTranscription } from './ai/video-transcription'
import { SmartChapters } from './ai/smart-chapters'
import { VideoInsights } from './ai/video-insights'
import { RealTimeAnalysis } from './ai/real-time-analysis'
import { SmartRecordingTips } from './ai/smart-recording-tips'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAIOperations } from '@/lib/hooks/use-ai-operations'
import { toast } from '@/components/ui/use-toast'
import { VoiceEnhancementControls } from './ai/voice-enhancement-controls'
import { BackgroundReplacementControls } from './ai/background-replacement-controls'
import { GestureRecognitionControls } from './ai/gesture-recognition-controls'
import { GestureEvent } from '@/lib/ai/gesture-recognition-service'
import { VideoAnalysisData, VideoInsight } from '@/lib/types/ai'
import { processVideoWithAI } from '@/lib/ai/video-processing-service'
import { HighlightManager } from './ai/highlight-manager'
import { HighlightSegment } from '@/lib/ai/highlight-detection-service'

interface AIEnhancedVideoRecordingProps {
  projectId?: string
  onSave?: (data: VideoAnalysisData) => void
}

// Add type definitions
interface VideoTranscriptionData {
  text: string
  segments: { start: number; end: number; text: string }[]
  language: string
  confidence: number
  languages: string[]
}

interface SmartChaptersData {
  chapters: { title: string; start: number; end: number; summary: string; keywords: string[] }[]
  totalDuration: number
}

interface VideoInsightData {
  insights: { category: string; score: number; details: string; recommendations: string[] }[]
  overallScore: number
  topStrengths: string[]
  improvementAreas: string[]
  topics: string[]
  targetAudience: string[]
  sentiment: { positive: number; neutral: number; negative: number }
  actionItems: string[]
  estimatedWatchTime: number
}

export function AIEnhancedVideoRecording({
  projectId = 'default', onSave
}: AIEnhancedVideoRecordingProps) {
  const [isRecording, setIsRecording] = useState<any>(false)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [aiData, setAiData] = useState<VideoAnalysisData | null>(null)
  const [activeTab, setActiveTab] = useState<any>('record')
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [enhancedAudioStream, setEnhancedAudioStream] = useState<MediaStream | null>(null)
  const [processedVideoStream, setProcessedVideoStream] = useState<MediaStream | null>(null)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<any>(0)
  const [audioLevel, setAudioLevel] = useState<any>(0)
  const [noiseLevel, setNoiseLevel] = useState<any>(0)
  const [contentQuality, setContentQuality] = useState<any>(0)
  const [isProcessing, setIsProcessing] = useState<any>(false)
  const [realtimeInsights, setRealtimeInsights] = useState<string[]>([])
  const [highlights, setHighlights] = useState<HighlightSegment[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)

  const {
    audioLevel: aiAudioLevel = 0,
    noiseLevel: aiNoiseLevel = 0,
    contentQuality: aiContentQuality = 0,
    recordingDuration: aiRecordingDuration = 0,
    effectiveness = 0
  } = aiData || {}

  const {
    transcribeVideo,
    analyzeContent,
    generateChapters,
    generateInsights,
    aiData: aiDataFromOperations,
    isLoading
  } = useAIOperations()

  const handleRecordingComplete = async (id: string, url: string) => {
    setVideoId(id)
    setIsProcessing(true)

    try {
      // Process video with AI
      const aiResult = await processVideoWithAI(id, url)
      setAiData(aiResult)
      setActiveTab('enhance')

      if (onSave) {
        onSave(aiResult)
      }
    } catch (error) {
      console.error('Failed to process video:', error)
      toast({
        title: 'Error',
        description: 'Failed to process video with AI. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRecordingStart = async (stream: MediaStream) => {
    setIsRecording(true)
    setRecordingStream(stream)
    setAudioStream(stream)
  }

  const handleRecordingStop = () => {
    setIsRecording(false)
    setRecordingStream(null)
    setAudioStream(null)
  }

  const handleEnhancedStream = (stream: MediaStream) => {
    setEnhancedAudioStream(stream)
  }

  const handleProcessedStream = (stream: MediaStream) => {
    setProcessedVideoStream(stream)
  }

  const handleInsightGenerated = (insight: VideoInsight) => {
    setRealtimeInsights(prev => [...prev, insight.message])
    
    // Update metrics based on insight type
    switch (insight.type) {
      case 'audio_quality':
        setAudioLevel(insight.score)
        break
      case 'background_noise':
        setNoiseLevel(100 - insight.score)
        break
      case 'content_quality':
        if (insight.metrics) {
          setContentQuality(insight.metrics.effectiveness)
        }
        break
    }
  }

  const handleHighlightsGenerated = (newHighlights: HighlightSegment[]) => {
    setHighlights(newHighlights)
    // Update AI data with highlights
    if (aiData) {
      setAiData({
        ...aiData,
        highlights: newHighlights
      })
    }
  }

  const handleProcessWithAI = async () => {
    if (!videoId || !aiData) return

    setIsProcessing(true)
    
    try {
      // Include real-time insights in AI processing
      const enhancedAiData = {
        ...aiData,
        realtimeInsights
      }

      // Process video with AI in parallel
      await Promise.all([
        transcribeVideo(aiData.videoUrl),
        analyzeContent(aiData.videoUrl),
        generateChapters(aiData.videoUrl),
        generateInsights(aiData.videoUrl)
      ])

      toast({
        title: 'AI Processing Complete',
        description: 'Your video has been enhanced with AI features.',
      })

      if (onSave) {
        onSave(enhancedAiData)
      }
    } catch (error) {
      console.error('Failed to process video with AI:', error)
      toast({
        title: 'Error',
        description: 'Failed to process video with AI. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGestureDetected = (gesture: GestureEvent) => {
    switch (gesture.type) {
      case 'swipe_left':
        // Handle previous slide/section
        break
      case 'swipe_right':
        // Handle next slide/section
        break
      case 'point':
        // Handle highlighting or selection
        break
      case 'wave':
        // Handle menu toggle
        break
      case 'thumbs_up':
        // Handle positive feedback
        break
      case 'thumbs_down':
        // Handle negative feedback
        break
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Video Recording Studio</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="enhance" disabled={!videoId}>
              Enhance
            </TabsTrigger>
            <TabsTrigger value="review" disabled={!aiData}>
              Review
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <VideoRecordingSystem
                  projectId={projectId}
                  onRecordingComplete={handleRecordingComplete}
                  onRecordingStart={handleRecordingStart}
                  onRecordingStop={handleRecordingStop}
                  enhancedAudioStream={enhancedAudioStream || undefined}
                  processedVideoStream={processedVideoStream || undefined}
                  videoRef={videoRef}
                />
                
                <SmartRecordingTips
                  isRecording={isRecording}
                  audioLevel={audioLevel}
                  noiseLevel={noiseLevel}
                  contentQuality={contentQuality}
                  recordingDuration={recordingDuration}
                />

                <VoiceEnhancementControls
                  audioStream={audioStream || undefined}
                  onEnhancedStream={handleEnhancedStream}
                />

                <BackgroundReplacementControls
                  videoStream={recordingStream || undefined}
                  onProcessedStream={handleProcessedStream}
                />

                <GestureRecognitionControls
                  videoElement={videoRef.current}
                  onGestureDetected={handleGestureDetected}
                />

                <HighlightManager
                  videoStream={recordingStream || undefined}
                  onHighlightsGenerated={handleHighlightsGenerated}
                />
              </div>
              
              <RealTimeAnalysis
                isRecording={isRecording}
                audioStream={audioStream || undefined}
                onInsightGenerated={handleInsightGenerated}
                realtimeInsights={realtimeInsights}
              />
            </div>
          </TabsContent>

          <TabsContent value="enhance">
            <div className="space-y-4">
              {aiData?.videoUrl && (
                <video
                  src={aiData.videoUrl}
                  controls
                  className="w-full aspect-video rounded-lg"
                />
              )}

              <Button
                onClick={handleProcessWithAI}
                disabled={isProcessing || !aiData}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : 'Process with AI'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="space-y-6">
              <VideoTranscription data={aiData?.transcription as VideoTranscriptionData} />
              <SmartChapters data={aiData?.chapters as SmartChaptersData} />
              <AIVideoAnalysis data={aiData?.analysis} />
              <VideoInsights data={aiData?.insights as VideoInsightData} />
              
              {highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Video Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {highlights.map((highlight, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          {highlight.thumbnail && (
                            <img
                              src={highlight.thumbnail}
                              alt={`Highlight ${index + 1}`}
                              className="h-16 w-24 rounded object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-medium">{highlight.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {highlight.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 