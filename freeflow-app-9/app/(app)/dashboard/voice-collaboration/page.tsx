'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Mic, MicOff, PhoneCall, PhoneOff, Users, Volume2,
  Video, VideoOff, User, Clock, Circle, Copy
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Participant {
  id: string
  name: string
  avatar?: string
  isMuted: boolean
  isVideoOn: boolean
  isSpeaking: boolean
  isHost: boolean
  connectionQuality: 'excellent' | 'good' | 'poor'
  joinedAt: Date
}

interface VoiceMessage {
  id: string
  sender: string
  senderName: string
  duration: number
  timestamp: Date
  isPlaying: boolean
  audioUrl: string
}

const MOCK_PARTICIPANTS: Participant[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    isMuted: false,
    isVideoOn: true,
    isSpeaking: true,
    isHost: true,
    connectionQuality: 'excellent',
    joinedAt: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    name: 'Sarah Chen',
    isMuted: false,
    isVideoOn: false,
    isSpeaking: false,
    isHost: false,
    connectionQuality: 'good',
    joinedAt: new Date(Date.now() - 240000)
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    isMuted: true,
    isVideoOn: true,
    isSpeaking: false,
    isHost: false,
    connectionQuality: 'excellent',
    joinedAt: new Date(Date.now() - 180000)
  }
]

const MOCK_VOICE_MESSAGES: VoiceMessage[] = [
  {
    id: '1',
    sender: '1',
    senderName: 'Alex Johnson',
    duration: 45,
    timestamp: new Date(Date.now() - 60000),
    isPlaying: false,
    audioUrl: '/api/placeholder/audio'
  },
  {
    id: '2',
    sender: '2',
    senderName: 'Sarah Chen',
    duration: 23,
    timestamp: new Date(Date.now() - 120000),
    isPlaying: false,
    audioUrl: '/api/placeholder/audio'
  }
]

export default function VoiceCollaborationPage() {
  const [isInCall, setIsInCall] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [participants] = useState<Participant[]>(MOCK_PARTICIPANTS)
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>(MOCK_VOICE_MESSAGES)
  const [isRecordingVoiceMessage, setIsRecordingVoiceMessage] = useState(false)
  const [voiceMessageDuration, setVoiceMessageDuration] = useState(0)
  const [roomCode] = useState('ROOM-12345')
  const recordingTimer = useRef<NodeJS.Timeout>()
  const voiceMessageTimer = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (isRecordingVoiceMessage) {
      voiceMessageTimer.current = setInterval(() => {
        setVoiceMessageDuration(prev => prev + 1)
      }, 1000)
    } else {
      if (voiceMessageTimer.current) {
        clearInterval(voiceMessageTimer.current)
      }
    }

    return () => {
      if (voiceMessageTimer.current) {
        clearInterval(voiceMessageTimer.current)
      }
    }
  }, [isRecordingVoiceMessage])

  const toggleCall = () => {
    console.log(isInCall ? "📞 Ended call" : "📞 Started call")
    setIsInCall(!isInCall)
    if (!isInCall) {
      setRecordingDuration(0)
    }
  }

  const toggleMute = () => {
    console.log(isMuted ? "🎤 Unmuted microphone" : "🔇 Muted microphone")
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    console.log(isVideoOn ? "📹 Video off" : "📹 Video on")
    setIsVideoOn(!isVideoOn)
  }

  const toggleRecording = () => {
    console.log(isRecording ? "⏹️ Stopped recording" : "⏺️ Started recording")
    setIsRecording(!isRecording)
    if (!isRecording) {
      setRecordingDuration(0)
    }
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
    console.log('📋 Room code copied to clipboard!')
  }

  const startVoiceMessage = () => {
    console.log('🎤 Started recording voice message...')
    setIsRecordingVoiceMessage(true)
    setVoiceMessageDuration(0)
  }

  const stopVoiceMessage = () => {
    console.log('⏹️ Stopped recording voice message')
    setIsRecordingVoiceMessage(false)
    if (voiceMessageDuration > 0) {
      const newVoiceMessage: VoiceMessage = {
        id: Date.now().toString(),
        sender: 'current-user',
        senderName: 'You',
        duration: voiceMessageDuration,
        timestamp: new Date(),
        isPlaying: false,
        audioUrl: '/api/placeholder/audio'
      }
      setVoiceMessages(prev => [newVoiceMessage, ...prev])
    }
    setVoiceMessageDuration(0)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500'
      case 'good': return 'bg-yellow-500'
      case 'poor': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <ErrorBoundary level="page" name="Voice Collaboration">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
            <Users className="w-4 h-4" />
            Voice Collaboration
          </div>
          <h1 className="text-4xl font-bold">Real-Time Voice & Video</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with your team through high-quality voice and video calls with recording capabilities
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Call Area */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              {/* Room Info */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <h3 className="font-semibold">Room Code</h3>
                  <p className="text-2xl font-mono font-bold text-primary">{roomCode}</p>
                </div>
                <button
                  data-testid="copy-room-code-btn"
                  onClick={copyRoomCode}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              {/* Call Status */}
              {isInCall && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Circle className="w-3 h-3 fill-green-500 text-green-500 animate-pulse" />
                      <span className="font-medium text-green-600 dark:text-green-400">Call in Progress</span>
                    </div>
                    {isRecording && (
                      <div className="flex items-center gap-2 text-red-600">
                        <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
                        <span className="font-medium">Recording: {formatDuration(recordingDuration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Participants Grid */}
              <div className="grid grid-cols-2 gap-4">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      participant.isSpeaking
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getConnectionQualityColor(participant.connectionQuality)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{participant.name}</p>
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs">Host</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {participant.isMuted ? (
                            <MicOff className="w-3 h-3" />
                          ) : (
                            <Mic className="w-3 h-3" />
                          )}
                          {participant.isVideoOn ? (
                            <Video className="w-3 h-3" />
                          ) : (
                            <VideoOff className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  data-testid="toggle-mute-btn"
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-colors ${
                    isMuted
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                  data-testid="toggle-call-btn"
                  onClick={toggleCall}
                  className={`p-6 rounded-full transition-colors ${
                    isInCall
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isInCall ? <PhoneOff className="w-8 h-8" /> : <PhoneCall className="w-8 h-8" />}
                </button>

                <button
                  data-testid="toggle-video-btn"
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    !isVideoOn
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                </button>

                {isInCall && (
                  <button
                    data-testid="toggle-recording-btn"
                    onClick={toggleRecording}
                    className={`p-4 rounded-full transition-colors ${
                      isRecording
                        ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    <Circle className={`w-6 h-6 ${isRecording ? 'fill-current' : ''}`} />
                  </button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Voice Messages */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-primary" />
                Voice Messages
              </h3>

              {/* Record Voice Message */}
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                {isRecordingVoiceMessage ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-red-600">Recording...</span>
                      <span className="text-sm font-mono">{formatDuration(voiceMessageDuration)}</span>
                    </div>
                    <Progress value={(voiceMessageDuration % 60) * 100 / 60} className="h-2" />
                    <button
                      data-testid="stop-voice-message-btn"
                      onClick={stopVoiceMessage}
                      className="w-full px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md"
                    >
                      Stop Recording
                    </button>
                  </div>
                ) : (
                  <button
                    data-testid="start-voice-message-btn"
                    onClick={startVoiceMessage}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Record Voice Message
                  </button>
                )}
              </div>

              {/* Voice Messages List */}
              <div className="space-y-3">
                {voiceMessages.map((message) => (
                  <div key={message.id} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{message.senderName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(message.duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded">
                        {message.isPlaying ? (
                          <Circle className="w-3 h-3" />
                        ) : (
                          <Circle className="w-3 h-3 fill-current" />
                        )}
                      </button>
                      <Progress value={message.isPlaying ? 50 : 0} className="h-1 flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Call Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Call Statistics
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-medium">{participants.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={isInCall ? "default" : "secondary"}>
                    {isInCall ? "Active" : "Idle"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Audio</span>
                  <Badge variant={isMuted ? "destructive" : "default"}>
                    {isMuted ? "Muted" : "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Video</span>
                  <Badge variant={isVideoOn ? "default" : "secondary"}>
                    {isVideoOn ? "On" : "Off"}
                  </Badge>
                </div>
                {isRecording && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Recording</span>
                    <Badge variant="destructive">{formatDuration(recordingDuration)}</Badge>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}
