'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  ImageIcon,
  BlurIcon,
  RefreshCwIcon,
  ImageOffIcon,
  UploadIcon
} from 'lucide-react'
import { BackgroundReplacementService } from '@/lib/ai/background-replacement-service'

interface BackgroundReplacementControlsProps {
  videoStream?: MediaStream
  onProcessedStream?: (stream: MediaStream) => void
}

export function BackgroundReplacementControls({
  videoStream, onProcessedStream
}: BackgroundReplacementControlsProps) {
  const [isEnabled, setIsEnabled] = useState<any>(false)
  const [isBlur, setIsBlur] = useState<any>(true)
  const [backgroundService, setBackgroundService] = useState<BackgroundReplacementService | null>(null)
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState<any>(false)

  // Initialize background service
  useEffect(() => {
    const service = new BackgroundReplacementService()
    service.initialize()
    setBackgroundService(service)

    return () => {
      service.cleanup()
    }
  }, [])

  // Handle video processing
  useEffect(() => {
    if (!videoStream || !backgroundService || !isEnabled) return

    let animationFrameId: number
    const videoElement = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const outputCanvas = document.createElement('canvas')
    const outputCtx = outputCanvas.getContext('2d')

    videoElement.srcObject = videoStream
    videoElement.play()

    const processFrame = async () => {
      if (!ctx || !outputCtx) return

      // Set canvas dimensions
      const width = videoElement.videoWidth
      const height = videoElement.videoHeight
      canvas.width = width
      canvas.height = height
      outputCanvas.width = width
      outputCanvas.height = height

      // Draw current frame
      ctx.drawImage(videoElement, 0, 0)

      // Process frame with background replacement
      const processedFrame = await backgroundService.processFrame(
        canvas,
        width,
        height
      )

      if (processedFrame) {
        outputCtx.putImageData(processedFrame, 0, 0)
      }

      // Create processed stream
      const processedStream = outputCanvas.captureStream()

      // Add audio tracks from original stream
      videoStream.getAudioTracks().forEach(track => {
        processedStream.addTrack(track)
      })

      if (onProcessedStream) {
        onProcessedStream(processedStream)
      }

      animationFrameId = requestAnimationFrame(processFrame)
    }

    processFrame()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      videoElement.srcObject = null
    }
  }, [videoStream, backgroundService, isEnabled, onProcessedStream])

  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !backgroundService) return

    setIsProcessing(true)
    try {
      const url = URL.createObjectURL(file)
      await backgroundService.setVirtualBackground(url)
      setSelectedBackground(url)
      setIsBlur(false)
    } catch (error) {
      console.error('Failed to load background:', error)
    }
    setIsProcessing(false)
  }

  const handleBlurBackground = async () => {
    if (!backgroundService) return

    setIsProcessing(true)
    try {
      await backgroundService.setVirtualBackground(null)
      setSelectedBackground(null)
      setIsBlur(true)
    } catch (error) {
      console.error('Failed to set blur background:', error)
    }
    setIsProcessing(false)
  }

  const handleDisableBackground = () => {
    setIsEnabled(false)
    setSelectedBackground(null)
    setIsBlur(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Background Replacement
          </CardTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label="Enable background replacement"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBlurBackground}
              disabled={!isEnabled || isProcessing || isBlur}
            >
              <BlurIcon className="h-4 w-4 mr-2" />
              Blur Background
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('background-upload')?.click()}
              disabled={!isEnabled || isProcessing}
            >
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload Background
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDisableBackground}
              disabled={!isEnabled || isProcessing}
            >
              <ImageOffIcon className="h-4 w-4 mr-2" />
              Disable
            </Button>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center py-2">
              <RefreshCwIcon className="h-5 w-5 animate-spin" />
              <span className="ml-2">Processing...</span>
            </div>
          )}

          <input
            type="file"
            id="background-upload"
            className="hidden"
            accept="image/*"
            onChange={handleBackgroundUpload}
          />

          {selectedBackground && (
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img src={selectedBackground}
                alt="Virtual Background"
                className="w-full h-full object-cover"
              loading="lazy" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 