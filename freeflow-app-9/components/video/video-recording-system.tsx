'use client'

import { useEffect, useState } from 'react'
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
  StopCircle,
} from 'lucide-react'

interface VideoRecordingSystemProps {
  projectId: string
  onRecordingComplete: (id: string, url: string) => void
  onRecordingStart: (stream: MediaStream) => void
  onRecordingStop: () => void
  enhancedAudioStream?: MediaStream
  processedVideoStream?: MediaStream
  videoRef?: React.RefObject<HTMLVideoElement>
}

export function VideoRecordingSystem({
  projectId: unknown, onRecordingComplete: unknown, onRecordingStart: unknown, onRecordingStop: unknown, enhancedAudioStream: unknown, processedVideoStream: unknown, videoRef: externalVideoRef
}: VideoRecordingSystemProps) {
  const [isRecording, setIsRecording] = useState<any>(false)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const internalVideoRef =<HTMLVideoElement>(null)
  const chunksRef =<Blob[]>([])

  const videoElementRef = externalVideoRef || internalVideoRef

  useEffect(() => {
    if (!videoElementRef.current) return

    const startRecording = async () => {
      try {
        let finalStream: MediaStream

        if (processedVideoStream) {
          // Use processed video stream with enhanced audio if available
          finalStream = new MediaStream([
            ...processedVideoStream.getVideoTracks(),
            ...(enhancedAudioStream?.getAudioTracks() || processedVideoStream.getAudioTracks())
          ])
        } else {
          // Get raw video stream
          const videoStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: !enhancedAudioStream // Only request audio if not using enhanced audio
          })

          // If we have enhanced audio, create a new stream with video and enhanced audio
          finalStream = enhancedAudioStream
            ? new MediaStream([
                ...videoStream.getVideoTracks(),
                ...enhancedAudioStream.getAudioTracks()
              ])
            : videoStream
        }

        setVideoStream(finalStream)
        if (videoElementRef.current) {
          videoElementRef.current.srcObject = finalStream
        }

        const recorder = new MediaRecorder(finalStream)
        setMediaRecorder(recorder)

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data)
          }
        }

        recorder.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: 'video/webm' })
          chunksRef.current = []

          // Upload the recording
          const formData = new FormData()
          formData.append('file', blob, 'recording.webm')
          formData.append('projectId', projectId)

          try {
            const response = await fetch('/api/video/upload', {
              method: 'POST',
              body: formData
            })

            if (!response.ok) throw new Error('Failed to upload video')

            const { id, url } = await response.json()
            onRecordingComplete(id, url)
          } catch (error) {
            console.error('Failed to upload video:', error)
            toast({
              title: 'Error',
              description: 'Failed to upload video. Please try again.',
              variant: 'destructive'
            })
          }
        }

        recorder.start()
        setIsRecording(true)
        onRecordingStart(finalStream)
      } catch (error) {
        console.error('Failed to start recording:', error)
        toast({
          title: 'Error',
          description: 'Failed to start recording. Please check your camera and microphone permissions.',
          variant: 'destructive'
        })
      }
    }

    startRecording()

    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [projectId, enhancedAudioStream, processedVideoStream, onRecordingComplete, onRecordingStart, videoElementRef])

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      onRecordingStop()

      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <video
          ref={videoElementRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <Button
            variant={isRecording ? 'destructive' : 'default'}
            size="lg"
            onClick={handleStopRecording}
            disabled={!isRecording}
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        </div>
      </div>
    </div>
  )
} 