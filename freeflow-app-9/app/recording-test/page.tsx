'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import VideoMessageRecorder from '@/components/video/VideoMessageRecorder'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createFeatureLogger('Recording-Test')

export default function RecordingTestPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [isModalOpen, setIsModalOpen] = useState<any>(false)

  // A+++ LOAD RECORDING TEST DATA
  useEffect(() => {
    const loadRecordingTestData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load recording test'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('Recording test loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recording test')
        setIsLoading(false)
        announce('Error loading recording test', 'assertive')
      }
    }

    loadRecordingTestData()
  }, [announce])

  const handleRecordingComplete = (videoUrl: string, videoId: string) => {
    logger.info('Recording complete', {
      videoUrl,
      videoId,
      timestamp: new Date().toISOString()
    })

    toast.success('Recording complete', {
      description: `Video saved successfully - ID: ${videoId.substring(0, 8)}...`
    })

    setIsModalOpen(false)
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Video Recording Test
          </h1>
          <p className="text-gray-600">
            Test the video recording functionality with screen capture and webcam.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Video Recording</h2>
          <p className="text-gray-600 mb-6">
            Click the button below to open the video recording modal and test the functionality.
          </p>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                Record Feedback
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Record Video Feedback</DialogTitle>
              </DialogHeader>
              <VideoMessageRecorder
                onRecordingComplete={handleRecordingComplete}
                assetId="test-asset-123"
              />
            </DialogContent>
          </Dialog>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>1. Click "Record Feedback" to open the recording modal</li>
              <li>2. Click "Prepare to Record" to initialize the recorder</li>
              <li>3. Enable camera and/or screen sharing</li>
              <li>4. Start recording and test the functionality</li>
              <li>5. Stop recording and verify the video is processed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 