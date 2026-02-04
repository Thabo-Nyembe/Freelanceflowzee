/**
 * Video Call Component
 * Complete WebRTC video calling interface
 *
 * Features:
 * - Grid layout for participants
 * - Local video preview
 * - Screen sharing
 * - Recording
 * - Device controls
 * - Mute/unmute
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebRTC } from '@/hooks/use-webrtc'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Radio,
  Settings,
  Maximize,
  Minimize,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('VideoCall')

export interface VideoCallProps {
  roomId: string
  userId: string
  userName: string
  onEnd?: () => void
  className?: string
}

export function VideoCall({
  roomId,
  userId,
  userName,
  onEnd,
  className
}: VideoCallProps) {
  const {
    localStream,
    remoteStreams,
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,
    isRecording,
    availableDevices,
    currentDevices,
    startLocalMedia,
    stopLocalMedia,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    switchCamera,
    closeAllConnections,
    activePeers
  } = useWebRTC({
    roomId,
    userId,
    userName,
    onRemoteStream: (userId, stream) => {
      logger.info('Remote stream added', { userId })
    },
    onRemoteStreamRemoved: (userId) => {
      logger.info('Remote stream removed', { userId })
    }
  })

  const [isCallActive, setIsCallActive] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [layout, setLayout] = useState<'grid' | 'sidebar' | 'focus'>('grid')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-start local media when component mounts
  useEffect(() => {
    startLocalMedia({
      video: true,
      audio: true,
      resolution: '720p',
      frameRate: 30
    })

    return () => {
      stopLocalMedia()
      closeAllConnections()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleStartCall = () => {
    setIsCallActive(true)
    logger.info('Call started', { roomId })
  }

  const handleEndCall = () => {
    setIsCallActive(false)
    stopLocalMedia()
    closeAllConnections()

    logger.info('Call ended', { roomId })

    onEnd?.()
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }

  const handleCameraChange = (deviceId: string) => {
    switchCamera(deviceId)
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getGridColumns = () => {
    const totalParticipants = remoteStreams.length + 1 // +1 for local

    if (totalParticipants <= 1) return 'grid-cols-1'
    if (totalParticipants <= 2) return 'grid-cols-2'
    if (totalParticipants <= 4) return 'grid-cols-2'
    if (totalParticipants <= 6) return 'grid-cols-3'
    return 'grid-cols-4'
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!isCallActive) {
    return (
      <div className={cn(
        'flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600',
        className
      )}>
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <Video className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-2">Ready to join?</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {roomId}
                </p>
              </div>

              {/* Local preview */}
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                {localStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="w-20 h-20">
                      <AvatarFallback className="text-2xl">
                        {getUserInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}

                {!isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <VideoOff className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Pre-call controls */}
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant={isVideoEnabled ? 'default' : 'destructive'}
                  size="icon"
                  onClick={toggleVideo}
                >
                  {isVideoEnabled ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <VideoOff className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant={isAudioEnabled ? 'default' : 'destructive'}
                  size="icon"
                  onClick={toggleAudio}
                >
                  {isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>

              {/* Settings */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Camera
                      </label>
                      <Select
                        value={currentDevices.videoDeviceId}
                        onValueChange={handleCameraChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDevices
                            .filter(d => d.kind === 'videoinput')
                            .map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Microphone
                      </label>
                      <Select value={currentDevices.audioDeviceId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select microphone" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDevices
                            .filter(d => d.kind === 'audioinput')
                            .map(device => (
                              <SelectItem key={device.deviceId} value={device.deviceId}>
                                {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Join button */}
              <Button
                size="lg"
                onClick={handleStartCall}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-5 h-5 mr-2" />
                Join Call
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active call UI
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative min-h-screen bg-gray-900',
        className
      )}
    >
      {/* Participants grid */}
      <div className={cn(
        'grid gap-4 p-4',
        layout === 'grid' && getGridColumns(),
        layout === 'sidebar' && 'grid-cols-[1fr_300px]',
        layout === 'focus' && 'grid-cols-1'
      )}>
        {/* Local video */}
        <motion.div
          layout
          className={cn(
            'relative aspect-video bg-gray-800 rounded-lg overflow-hidden',
            layout === 'sidebar' && remoteStreams.length > 0 && 'col-start-2 row-span-full'
          )}
        >
          {localStream && isVideoEnabled ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-3xl">
                  {getUserInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="w-16 h-16 text-gray-400" />
            </div>
          )}

          {isScreenSharing && (
            <Badge className="absolute top-3 left-3 bg-blue-600">
              <Monitor className="w-3 h-3 mr-1" />
              Sharing
            </Badge>
          )}

          <div className="absolute bottom-3 left-3">
            <Badge variant="secondary">
              {userName} (You)
            </Badge>
          </div>

          {!isAudioEnabled && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-red-600 rounded-full p-2">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </motion.div>

        {/* Remote videos */}
        {remoteStreams.map(({ userId: remoteUserId, stream }) => (
          <RemoteVideo
            key={remoteUserId}
            userId={remoteUserId}
            stream={stream}
            layout={layout}
          />
        ))}

        {/* Empty state */}
        {remoteStreams.length === 0 && (
          <div className="col-span-full flex items-center justify-center text-gray-400 py-12">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">Waiting for others to join...</p>
              <p className="text-sm mt-2">Share the room ID: <code className="bg-gray-800 px-2 py-1 rounded">{roomId}</code></p>
            </div>
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Card className="bg-gray-800/95 backdrop-blur border-gray-700">
          <CardContent className="flex items-center gap-3 p-4">
            <Button
              variant={isVideoEnabled ? 'default' : 'destructive'}
              size="icon"
              onClick={toggleVideo}
              className="rounded-full"
            >
              {isVideoEnabled ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isAudioEnabled ? 'default' : 'destructive'}
              size="icon"
              onClick={toggleAudio}
              className="rounded-full"
            >
              {isAudioEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isScreenSharing ? 'default' : 'outline'}
              size="icon"
              onClick={isScreenSharing ? stopScreenShare : startScreenShare}
              className="rounded-full"
            >
              {isScreenSharing ? (
                <MonitorOff className="w-5 h-5" />
              ) : (
                <Monitor className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className="rounded-full"
            >
              <Radio className={cn(
                'w-5 h-5',
                isRecording && 'animate-pulse'
              )} />
            </Button>

            <div className="w-px h-8 bg-gray-700" />

            <Button
              variant="outline"
              size="icon"
              onClick={handleToggleFullscreen}
              className="rounded-full"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </Button>

            <div className="w-px h-8 bg-gray-700" />

            <Button
              variant="destructive"
              size="icon"
              onClick={handleEndCall}
              className="rounded-full"
            >
              <PhoneOff className="w-5 h-5" />
            </Button>

            {activePeers > 0 && (
              <Badge className="ml-2">
                <Users className="w-3 h-3 mr-1" />
                {activePeers + 1}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ============================================================================
// REMOTE VIDEO COMPONENT
// ============================================================================

interface RemoteVideoProps {
  userId: string
  stream: MediaStream
  layout: 'grid' | 'sidebar' | 'focus'
}

function RemoteVideo({ userId, stream, layout }: RemoteVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const hasVideo = stream.getVideoTracks().some(track => track.enabled)
  const hasAudio = stream.getAudioTracks().some(track => track.enabled)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative aspect-video bg-gray-800 rounded-lg overflow-hidden',
        layout === 'focus' && 'col-span-full'
      )}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-3xl">
              {userId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <VideoOff className="w-16 h-16 text-gray-400" />
        </div>
      )}

      <div className="absolute bottom-3 left-3">
        <Badge variant="secondary">
          {userId}
        </Badge>
      </div>

      {!hasAudio && (
        <div className="absolute bottom-3 right-3">
          <div className="bg-red-600 rounded-full p-2">
            <MicOff className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  )
}
