'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  HandIcon,
  GestureIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  HandMetalIcon,
  WavyLineIcon
} from 'lucide-react'
import {
  GestureRecognitionService,
  GestureEvent
} from '@/lib/ai/gesture-recognition-service'

interface GestureRecognitionControlsProps {
  videoElement?: HTMLVideoElement | null
  onGestureDetected?: (gesture: GestureEvent) => void
}

export function GestureRecognitionControls({
  videoElement, onGestureDetected
}: GestureRecognitionControlsProps) {
  const [isEnabled, setIsEnabled] = useState<any>(false)
  const [gestureService, setGestureService] = useState<GestureRecognitionService | null>(null)
  const [lastGesture, setLastGesture] = useState<GestureEvent | null>(null)
  const animationFrameRef = useRef<number>()

  // Initialize gesture service
  useEffect(() => {
    const service = new GestureRecognitionService()
    service.initialize()
    setGestureService(service)

    return () => {
      service.cleanup()
    }
  }, [])

  // Handle gesture detection
  useEffect(() => {
    if (!videoElement || !gestureService || !isEnabled) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const detectGestures = async () => {
      await gestureService.detectGestures(videoElement, (gesture) => {
        setLastGesture(gesture)
        if (onGestureDetected) {
          onGestureDetected(gesture)
        }
      })

      animationFrameRef.current = requestAnimationFrame(detectGestures)
    }

    detectGestures()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [videoElement, gestureService, isEnabled, onGestureDetected])

  const getGestureIcon = (type: string) => {
    switch (type) {
      case 'swipe_left':
        return <ArrowLeftIcon className="h-4 w-4" />
      case 'swipe_right':
        return <ArrowRightIcon className="h-4 w-4" />
      case 'point':
        return <HandIcon className="h-4 w-4" />
      case 'wave':
        return <WavyLineIcon className="h-4 w-4" />
      case 'thumbs_up':
      case 'thumbs_down':
        return <HandMetalIcon className="h-4 w-4" />
      default:
        return <GestureIcon className="h-4 w-4" />
    }
  }

  const getGestureDescription = (type: string) => {
    switch (type) {
      case 'swipe_left':
        return 'Previous Slide'
      case 'swipe_right':
        return 'Next Slide'
      case 'point':
        return 'Highlight'
      case 'wave':
        return 'Toggle Menu'
      case 'thumbs_up':
        return 'Like'
      case 'thumbs_down':
        return 'Dislike'
      default:
        return 'Unknown Gesture'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HandIcon className="h-5 w-5" />
            Gesture Control
          </CardTitle>
          <Switch
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
            aria-label="Enable gesture recognition"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Available Gestures</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Swipe Left</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRightIcon className="h-4 w-4" />
                  <span>Swipe Right</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HandIcon className="h-4 w-4" />
                  <span>Point</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <WavyLineIcon className="h-4 w-4" />
                  <span>Wave</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <HandMetalIcon className="h-4 w-4" />
                  <span>Thumbs Up/Down</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Last Detected</h3>
              {lastGesture ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getGestureIcon(lastGesture.type)}
                    <span className="text-sm font-medium">
                      {getGestureDescription(lastGesture.type)}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {Math.round(lastGesture.confidence * 100)}% Confidence
                  </Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No gestures detected yet
                </p>
              )}
            </div>
          </div>

          {isEnabled && (
            <p className="text-sm text-muted-foreground">
              Use hand gestures to control your presentation. Make sure your hands
              are clearly visible in the frame.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 