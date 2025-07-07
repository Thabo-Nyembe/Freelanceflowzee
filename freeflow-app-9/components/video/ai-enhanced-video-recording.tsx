'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { VideoRecordingSystem } from './video-recording-system'
import { AIVideoAnalysis } from './ai/ai-video-analysis'
import { VideoTranscription } from './ai/video-transcription'
import { SmartChapters } from './ai/smart-chapters'
import { VideoInsights } from './ai/video-insights'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAIOperations } from '@/lib/hooks/use-ai-operations'
import { toast } from '@/components/ui/use-toast'

interface AIEnhancedVideoRecordingProps {
  projectId?: string
  onSave?: (videoId: string, videoUrl: string, aiData: any) => void
}

export function AIEnhancedVideoRecording({
  projectId = 'default',
  onSave
}: AIEnhancedVideoRecordingProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('record')
  
  const {
    transcribeVideo,
    analyzeContent,
    generateChapters,
    generateInsights,
    aiData,
    isLoading
  } = useAIOperations()

  const handleRecordingComplete = async (id: string, url: string) => {
    setVideoId(id)
    setVideoUrl(url)
    setActiveTab('enhance')
    
    toast({
      title: 'Recording Complete',
      description: 'Your video is ready for AI enhancement.',
    })
  }

  const handleProcessWithAI = async () => {
    if (!videoId || !videoUrl) return

    setIsProcessing(true)
    
    try {
      // Process video with AI in parallel
      await Promise.all([
        transcribeVideo(videoUrl),
        analyzeContent(videoUrl),
        generateChapters(videoUrl),
        generateInsights(videoUrl)
      ])

      toast({
        title: 'AI Processing Complete',
        description: 'Your video has been enhanced with AI features.',
      })

      if (onSave) {
        onSave(videoId, videoUrl, aiData)
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
            <VideoRecordingSystem
              projectId={projectId}
              onRecordingComplete={handleRecordingComplete}
            />
          </TabsContent>

          <TabsContent value="enhance">
            {videoId && videoUrl && (
              <div className="space-y-4">
                <video
                  src={videoUrl}
                  controls
                  className="w-full aspect-video rounded-lg"
                />
                
                <Button
                  onClick={handleProcessWithAI}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? 'Processing with AI...' : 'Enhance with AI'}
                </Button>

                {isProcessing && (
                  <div className="space-y-4">
                    <AIVideoAnalysis isLoading={isLoading} data={aiData?.analysis} />
                    <VideoTranscription isLoading={isLoading} data={aiData?.transcription} />
                    <SmartChapters isLoading={isLoading} data={aiData?.chapters} />
                    <VideoInsights isLoading={isLoading} data={aiData?.insights} />
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="review">
            {aiData && (
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-2">Content Analysis</h3>
                  <AIVideoAnalysis data={aiData.analysis} />
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Transcription</h3>
                  <VideoTranscription data={aiData.transcription} />
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">Smart Chapters</h3>
                  <SmartChapters data={aiData.chapters} />
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                  <VideoInsights data={aiData.insights} />
                </section>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 