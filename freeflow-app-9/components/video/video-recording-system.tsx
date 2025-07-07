'use client'

import { useEffect, useRef, useState } from 'react'
import { MediaStreamComposer } from '@api.video/media-stream-composer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import {
  Camera,
  Mic,
  Monitor,
  Pause,
  Play,
  Square,
  Video,
} from 'lucide-react'

interface VideoRecordingSystemProps {
  onRecordingComplete: (videoId: string, videoUrl: string) => void
  projectId?: string
  quality?: 'low' | 'medium' | 'high'
}

export function VideoRecordingSystem({
  onRecordingComplete,
  projectId = 'default',
  quality = 'high',
}: VideoRecordingSystemProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isCameraEnabled, setIsCameraEnabled] = useState(true)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false)
  const [volume, setVolume] = useState(100)
  
  const composerRef = useRef<MediaStreamComposer | null>(null)
  const previewRef = useRef<HTMLVideoElement>(null)
  
  useEffect(() => {
    const initComposer = async () => {
      try {
        composerRef.current = new MediaStreamComposer({
          video: {
            width: quality === 'high' ? 1920 : quality === 'medium' ? 1280 : 854,
            height: quality === 'high' ? 1080 : quality === 'medium' ? 720 : 480,
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })

        if (previewRef.current) {
          previewRef.current.srcObject = composerRef.current.getPreviewStream()
        }
      } catch (error) {
        console.error('Failed to initialize video composer:', error)
        toast({
          title: 'Error',
          description: 'Failed to initialize video recording. Please check your camera and microphone permissions.',
          variant: 'destructive',
        })
      }
    }

    initComposer()

    return () => {
      if (composerRef.current) {
        composerRef.current.destroy()
      }
    }
  }, [quality])

  const handleStartRecording = async () => {
    try {
      if (!composerRef.current) return

      await composerRef.current.startRecording()
      setIsRecording(true)
      setIsPaused(false)
      
      toast({
        title: 'Recording Started',
        description: 'Your video recording has begun.',
      })
    } catch (error) {
      console.error('Failed to start recording:', error)
      toast({
        title: 'Error',
        description: 'Failed to start recording. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleStopRecording = async () => {
    try {
      if (!composerRef.current) return

      const blob = await composerRef.current.stopRecording()
      setIsRecording(false)
      setIsPaused(false)

      // Here we would normally upload to API.video
      // For demo, we'll create a local URL
      const videoUrl = URL.createObjectURL(blob)
      const videoId = `recording-${Date.now()}`

      onRecordingComplete(videoId, videoUrl)
      
      toast({
        title: 'Recording Complete',
        description: 'Your video has been recorded successfully.',
      })
    } catch (error) {
      console.error('Failed to stop recording:', error)
      toast({
        title: 'Error',
        description: 'Failed to stop recording. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handlePauseRecording = async () => {
    try {
      if (!composerRef.current) return

      if (isPaused) {
        await composerRef.current.resumeRecording()
        toast({
          title: 'Recording Resumed',
          description: 'Your video recording has resumed.',
        })
      } else {
        await composerRef.current.pauseRecording()
        toast({
          title: 'Recording Paused',
          description: 'Your video recording is paused.',
        })
      }

      setIsPaused(!isPaused)
    } catch (error) {
      console.error('Failed to pause/resume recording:', error)
      toast({
        title: 'Error',
        description: 'Failed to pause/resume recording. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const toggleCamera = async () => {
    try {
      if (!composerRef.current) return

      if (isCameraEnabled) {
        await composerRef.current.disableVideo()
      } else {
        await composerRef.current.enableVideo()
      }
      setIsCameraEnabled(!isCameraEnabled)
    } catch (error) {
      console.error('Failed to toggle camera:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle camera. Please check your permissions.',
        variant: 'destructive',
      })
    }
  }

  const toggleMicrophone = async () => {
    try {
      if (!composerRef.current) return

      if (isMicEnabled) {
        await composerRef.current.disableAudio()
      } else {
        await composerRef.current.enableAudio()
      }
      setIsMicEnabled(!isMicEnabled)
    } catch (error) {
      console.error('Failed to toggle microphone:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle microphone. Please check your permissions.',
        variant: 'destructive',
      })
    }
  }

  const toggleScreenShare = async () => {
    try {
      if (!composerRef.current) return

      if (isScreenShareEnabled) {
        await composerRef.current.stopScreenSharing()
      } else {
        await composerRef.current.startScreenSharing()
      }
      setIsScreenShareEnabled(!isScreenShareEnabled)
    } catch (error) {
      console.error('Failed to toggle screen share:', error)
      toast({
        title: 'Error',
        description: 'Failed to toggle screen sharing. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (previewRef.current) {
      previewRef.current.volume = newVolume / 100
    }
  }

  return (
    <Card className="p-4">
      <div className="aspect-video relative rounded-lg overflow-hidden bg-black">
        <video
          ref={previewRef}
          autoPlay
          playsInline
          muted={!isMicEnabled}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            size="lg"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Video className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>

          {isRecording && (
            <Button
              variant="outline"
              size="lg"
              onClick={handlePauseRecording}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleCamera}
            className={!isCameraEnabled ? 'opacity-50' : ''}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleMicrophone}
            className={!isMicEnabled ? 'opacity-50' : ''}
          >
            <Mic className="h-4 w-4 mr-2" />
            Microphone
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleScreenShare}
            className={!isScreenShareEnabled ? 'opacity-50' : ''}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Screen Share
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm">Volume:</span>
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="w-[200px]"
          />
        </div>
      </div>
    </Card>
  )
} 