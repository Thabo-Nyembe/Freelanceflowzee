'use client

import React, { useState, useEffect, useRef, useReducer } from 'react
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Download, 
  Share2, 
  MessageSquare, 
  Eye, 
  BarChart3, 
  Settings, 
  Monitor, 
  Camera, 
  Video,
  Mic,
  MicOff
} from 'lucide-react

interface VideoAnnotation {
  id: string
  timestamp: number
  x: number
  y: number
  type: 'comment' | 'hotspot' | 'highlight
  content: string
  userId: string
  userName: string
  createdAt: string
  responses: {
    id: string
    userId: string
    userName: string
    content: string
    timestamp: number
    createdAt: string
  }[]
}

interface TranscriptionSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  confidence: number
  speaker: string
  keywords: string[]
}

interface VideoAnalytics {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  engagementScore: number
  heatmapData: { timestamp: number; engagement: number }[]
  topMoments: { timestamp: number; description: string; score: number }[]
}

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  isPlaying: boolean
  duration: number
  currentTime: number
  volume: number
  isMuted: boolean
  recordingMode: 'screen' | 'camera' | 'both
  quality: 'hd' | 'fullhd' | '4k
  annotations: VideoAnnotation[]
  transcription: TranscriptionSegment[]
  analytics: VideoAnalytics
  isProcessing: boolean
  recordedBlob: Blob | null
  videoUrl: string | null
  showAnnotations: boolean
  showTranscription: boolean
  showAnalytics: boolean
  isFullscreen: boolean
  playbackSpeed: number
}

type RecordingAction = 
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING' }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'ADD_ANNOTATION'; annotation: VideoAnnotation }
  | { type: 'UPDATE_TRANSCRIPTION'; segments: TranscriptionSegment[] }
  | { type: 'SET_PROCESSING'; processing: boolean }
  | { type: 'TOGGLE_ANNOTATIONS' }
  | { type: 'TOGGLE_TRANSCRIPTION' }
  | { type: 'TOGGLE_ANALYTICS' }
  | { type: 'SET_PLAYBACK_SPEED'; speed: number }

const initialState: RecordingState = {
  isRecording: false,
  isPaused: false,
  isPlaying: false,
  duration: 0,
  currentTime: 0,
  volume: 100,
  isMuted: false,
  recordingMode: 'screen',
  quality: 'fullhd',
  annotations: [
    {
      id: 'ann-1',
      timestamp: 15.5,
      x: 45,
      y: 30,
      type: 'hotspot',
      content: 'Click here to access the main dashboard',
      userId: 'user-1',
      userName: 'Sarah Chen',
      createdAt: new Date().toISOString(),
      responses: [
        {
          id: 'resp-1',
          userId: 'user-2',
          userName: 'Mike Johnson',
          content: 'Great explanation! This really helps.',
          timestamp: 16.2,
          createdAt: new Date().toISOString()
        }
      ]
    },
    {
      id: 'ann-2',
      timestamp: 32.1,
      x: 60,
      y: 50,
      type: 'comment',
      content: 'Notice how the animation smoothly transitions between states',
      userId: 'user-1',
      userName: 'Sarah Chen',
      createdAt: new Date().toISOString(),
      responses: []
    }
  ],
  transcription: [
    {
      id: 'trans-1',
      startTime: 0,
      endTime: 5.2,
      text: "Welcome to FreeflowZee! Today I'll show you how to create your first project.",
      confidence: 0.98,
      speaker: 'Sarah Chen',
      keywords: ['welcome', 'project', 'create']
    },
    {
      id: 'trans-2',
      startTime: 5.2,
      endTime: 12.8,
      text: "First, navigate to the dashboard by clicking on the main menu button in the top left corner.",
      confidence: 0.95,
      speaker: 'Sarah Chen',
      keywords: ['dashboard', 'menu', 'navigate']
    },
    {
      id: 'trans-3',
      startTime: 12.8,
      endTime: 18.5,
      text: "You'll see all your projects listed here with their current status and progress indicators.",
      confidence: 0.97,
      speaker: 'Sarah Chen',
      keywords: ['projects', 'status', 'progress']
    }
  ],
  analytics: {
    totalViews: 1247,
    uniqueViewers: 892,
    averageWatchTime: 156.7,
    completionRate: 78.3,
    engagementScore: 85.2,
    heatmapData: [
      { timestamp: 0, engagement: 95 },
      { timestamp: 15, engagement: 88 },
      { timestamp: 30, engagement: 92 },
      { timestamp: 45, engagement: 76 },
      { timestamp: 60, engagement: 89 }
    ],
    topMoments: [
      { timestamp: 15.5, description: 'Dashboard navigation explanation', score: 95 },
      { timestamp: 32.1, description: 'Animation demonstration', score: 89 },
      { timestamp: 48.7, description: 'Project creation walkthrough', score: 92 }
    ]
  },
  isProcessing: false,
  recordedBlob: null,
  videoUrl: '/media/placeholder-video.mp4',
  showAnnotations: true,
  showTranscription: true,
  showAnalytics: false,
  isFullscreen: false,
  playbackSpeed: 1
}

function recordingReducer(state: RecordingState, action: RecordingAction): RecordingState {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        isPaused: false,
        duration: 0,
        currentTime: 0
      }
    
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        isPaused: false,
        recordedBlob: action.blob,
        videoUrl: URL.createObjectURL(action.blob)
      }
    
    case 'PAUSE_RECORDING':
      return {
        ...state,
        isPaused: true
      }
    
    case 'RESUME_RECORDING':
      return {
        ...state,
        isPaused: false
      }
    
    case 'SET_PLAYING':
      return {
        ...state,
        isPlaying: action.playing
      }
    
    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.time
      }
    
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.volume,
        isMuted: action.volume === 0
      }
    
    case 'TOGGLE_MUTE':
      return {
        ...state,
        isMuted: !state.isMuted
      }
    
    case 'ADD_ANNOTATION':
      return {
        ...state,
        annotations: [...state.annotations, action.annotation]
      }
    
    case 'UPDATE_TRANSCRIPTION':
      return {
        ...state,
        transcription: action.segments
      }
    
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.processing
      }
    
    case 'TOGGLE_ANNOTATIONS':
      return {
        ...state,
        showAnnotations: !state.showAnnotations
      }
    
    case 'TOGGLE_TRANSCRIPTION':
      return {
        ...state,
        showTranscription: !state.showTranscription
      }
    
    case 'TOGGLE_ANALYTICS':
      return {
        ...state,
        showAnalytics: !state.showAnalytics
      }
    
    case 'SET_PLAYBACK_SPEED':
      return {
        ...state,
        playbackSpeed: action.speed
      }
    
    default:
      return state
  }
}

interface AIVideoRecordingSystemProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar: string
  }
  onSave?: (videoData: unknown) => void
  onShare?: (shareData: unknown) => void
  className?: string
}

export function AIVideoRecordingSystem({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = 
}: AIVideoRecordingSystemProps) {
  const [state, dispatch] = useReducer(recordingReducer, initialState)
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)
  const [newAnnotationPos, setNewAnnotationPos] = useState<{ x: number; y: number } | null>(null)

  // Auto-update current time
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      dispatch({ type: 'SET_CURRENT_TIME', time: video.currentTime })
    }

    video.addEventListener('timeupdate', updateTime)
    return () => video.removeEventListener('timeupdate', updateTime)
  }, [])

  // Screen recording functions
  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        dispatch({ type: 'STOP_RECORDING', blob })
        processVideoWithAI(blob)
      }
      
      mediaRecorder.start()
      dispatch({ type: 'START_RECORDING' })
      
    } catch (error) {
      console.error('Error starting screen recording:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
    }
  }

  const processVideoWithAI = async (blob: Blob) => {
    dispatch({ type: 'SET_PROCESSING', processing: true })
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate transcription
    const mockTranscription: TranscriptionSegment[] = [
      {
        id: 'new-trans-1',
        startTime: 0,
        endTime: 8.3,
        text: "In this recording, I'll demonstrate the new features of our platform.",
        confidence: 0.96,
        speaker: currentUser.name,
        keywords: ['recording', 'demonstrate', 'features', 'platform']
      },
      {
        id: 'new-trans-2',
        startTime: 8.3,
        endTime: 15.7,
        text: "First, let's look at the improved user interface and navigation system.",
        confidence: 0.94,
        speaker: currentUser.name,
        keywords: ['interface', 'navigation', 'system', 'improved']
      }
    ]
    
    dispatch({ type: 'UPDATE_TRANSCRIPTION', segments: mockTranscription })
    dispatch({ type: 'SET_PROCESSING', processing: false })
  }

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isAddingAnnotation) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setNewAnnotationPos({ x, y })
  }

  const addAnnotation = (content: string, type: VideoAnnotation['type'] = 'comment') => {
    if (!newAnnotationPos) return
    
    const annotation: VideoAnnotation = {
      id: `ann-${Date.now()}`,
      timestamp: state.currentTime,
      x: newAnnotationPos.x,
      y: newAnnotationPos.y,
      type,
      content,
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
      responses: []
    }
    
    dispatch({ type: 'ADD_ANNOTATION', annotation })
    setIsAddingAnnotation(false)
    setNewAnnotationPos(null)
  }

  const jumpToTimestamp = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      dispatch({ type: 'SET_CURRENT_TIME', time: timestamp })
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}
  }

  const exportVideo = () => {
    if (state.recordedBlob) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(state.recordedBlob)
      link.download = `recording-${projectId}.webm
      link.click()
    }
  }

  const shareVideo = () => {
    const shareData = {
      projectId,
      videoUrl: state.videoUrl,
      annotations: state.annotations,
      transcription: state.transcription,
      analytics: state.analytics
    }
    onShare?.(shareData)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className= "h-6 w-6 text-purple-600" />
            AI Video Recording Studio
          </h2>
          <p className= "text-gray-600">Loom-level video creation with AI-powered features</p>
        </div>

        <div className= "flex items-center gap-2">
          {!state.isRecording ? (
            <Button onClick={startScreenRecording} className= "bg-red-600 hover:bg-red-700">
              <Monitor className= "h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <div className= "flex gap-2">
              <Button onClick={stopRecording} variant= "destructive">
                <Square className= "h-4 w-4 mr-2" />
                Stop Recording
              </Button>
              {state.isPaused ? (
                <Button onClick={() => dispatch({ type: 'RESUME_RECORDING&apos; })} variant= "outline">
                  <Play className= "h-4 w-4 mr-2" />
                  Resume
                </Button>
              ) : (
                <Button onClick={() => dispatch({ type: &apos;PAUSE_RECORDING&apos; })} variant= "outline">
                  <Pause className= "h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
            </div>
          )}

          {state.videoUrl && (
            <>
              <Button onClick={exportVideo} variant= "outline" size= "sm">
                <Download className= "h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={shareVideo} size= "sm">
                <Share2 className= "h-4 w-4 mr-2" />
                Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Recording Status */}
      {state.isRecording && (
        <Card className= "border-red-200 bg-red-50">
          <CardContent className= "p-4">
            <div className= "flex items-center justify-between">
              <div className= "flex items-center gap-3">
                <div className= "w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className= "font-medium text-red-800">
                  {state.isPaused ? 'Recording Paused' : 'Recording in Progress'}
                </span>
                <Badge variant= "outline" className= "bg-white">
                  {formatTime(state.duration)}
                </Badge>
              </div>
              
              <div className= "flex items-center gap-2">
                <Badge variant= "outline">{state.recordingMode}</Badge>
                <Badge variant= "outline">{state.quality}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {state.isProcessing && (
        <Card className= "border-blue-200 bg-blue-50">
          <CardContent className= "p-4">
            <div className= "flex items-center gap-3">
              <Sparkles className= "h-5 w-5 text-blue-600 animate-spin" />
              <div className= "flex-1">
                <div className= "font-medium text-blue-800">AI Processing Video</div>
                <div className= "text-sm text-blue-600">Generating transcription and analyzing content...</div>
                <Progress value={65} className= "mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className= "grid grid-cols-12 gap-6">
        {/* Video Player */}
        <div className= "col-span-8">
          <Card>
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle>Video Player</CardTitle>
                <div className= "flex items-center gap-2">
                  <Button
                    size= "sm
                    variant={state.showAnnotations ? 'default' : 'outline'}
                    onClick={() => dispatch({ type: 'TOGGLE_ANNOTATIONS' })}
                  >
                    <MapPin className= "h-4 w-4 mr-1" />
                    Annotations
                  </Button>
                  <Button
                    size= "sm
                    variant={isAddingAnnotation ? 'default' : 'outline'}
                    onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                  >
                    <MessageCircle className= "h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className= "relative">
                <video
                  ref={videoRef}
                  src={state.videoUrl || undefined}
                  className= "w-full rounded-lg bg-black cursor-pointer
                  controls={false}
                  onClick={handleVideoClick}
                  onPlay={() => dispatch({ type: 'SET_PLAYING', playing: true })}
                  onPause={() => dispatch({ type: 'SET_PLAYING', playing: false })}
                />

                {/* Video Annotations */}
                {state.showAnnotations && state.annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className= "absolute bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors transform -translate-x-1/2 -translate-y-1/2
                    style={{
                      left: `${annotation.x}%`,
                      top: `${annotation.y}%`,
                      display: Math.abs(state.currentTime - annotation.timestamp) < 2 ? 'block' : 'none
                    }}
                    onClick={() => jumpToTimestamp(annotation.timestamp)}
                    title={annotation.content}
                  >
                    <MapPin className= "h-4 w-4" />
                  </div>
                ))}

                {/* New Annotation Marker */}
                {newAnnotationPos && (
                  <div
                    className= "absolute bg-yellow-400 text-black p-2 rounded-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse
                    style={{
                      left: `${newAnnotationPos.x}%`,
                      top: `${newAnnotationPos.y}%
                    }}
                  >
                    <MapPin className= "h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Custom Controls */}
              <div className= "mt-4 space-y-3">
                <div className= "flex items-center gap-3">
                  <Button
                    size= "sm
                    variant= "outline
                    onClick={() => {
                      if (videoRef.current) {
                        if (state.isPlaying) {
                          videoRef.current.pause()
                        } else {
                          videoRef.current.play()
                        }
                      }
                    }}
                  >
                    {state.isPlaying ? <Pause className= "h-4 w-4" /> : <Play className= "h-4 w-4" />}
                  </Button>

                  <Button
                    size= "sm
                    variant= "outline
                    onClick={() => jumpToTimestamp(Math.max(0, state.currentTime - 10))}
                  >
                    <SkipBack className= "h-4 w-4" />
                  </Button>

                  <Button
                    size= "sm
                    variant= "outline
                    onClick={() => jumpToTimestamp(state.currentTime + 10)}
                  >
                    <SkipForward className= "h-4 w-4" />
                  </Button>

                  <div className= "flex-1">
                    <Progress 
                      value={(state.currentTime / (videoRef.current?.duration || 1)) * 100} 
                      className= "cursor-pointer
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        const newTime = percent * (videoRef.current?.duration || 0)
                        jumpToTimestamp(newTime)
                      }}
                    />
                  </div>

                  <span className= "text-sm text-gray-600 min-w-[80px]">
                    {formatTime(state.currentTime)} / {formatTime(videoRef.current?.duration || 0)}
                  </span>

                  <Button
                    size= "sm
                    variant= "outline
                    onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
                  >
                    {state.isMuted ? <VolumeX className= "h-4 w-4" /> : <Volume2 className= "h-4 w-4" />}
                  </Button>

                  <select
                    value={state.playbackSpeed}
                    onChange={(e) => {
                      const speed = parseFloat(e.target.value)
                      dispatch({ type: 'SET_PLAYBACK_SPEED', speed })
                      if (videoRef.current) {
                        videoRef.current.playbackRate = speed
                      }
                    }}
                    className= "px-2 py-1 text-sm border rounded
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>
              </div>

              {/* Add Annotation Form */}
              {isAddingAnnotation && newAnnotationPos && (
                <Card className= "mt-4 border-purple-200 bg-purple-50">
                  <CardContent className= "p-4">
                    <h4 className= "font-medium text-purple-800 mb-2">Add Video Annotation</h4>
                    <Textarea
                      placeholder= "Describe what's happening at this moment...
                      className= "mb-3
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          addAnnotation(e.currentTarget.value)
                          e.currentTarget.value = 
                        }
                      }}
                    />
                    <div className= "flex gap-2">
                      <Button
                        size= "sm
                        onClick={() => {
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                          addAnnotation(textarea.value, 'comment')
                          textarea.value = 
                        }}
                      >
                        Add Comment
                      </Button>
                      <Button
                        size= "sm
                        variant= "outline
                        onClick={() => {
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                          addAnnotation(textarea.value, 'hotspot')
                          textarea.value = 
                        }}
                      >
                        Add Hotspot
                      </Button>
                      <Button
                        size= "sm
                        variant= "ghost
                        onClick={() => {
                          setIsAddingAnnotation(false)
                          setNewAnnotationPos(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel */}
        <div className= "col-span-4 space-y-4">
          {/* Transcription */}
          <Card>
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle className= "text-sm flex items-center gap-2">
                  <Captions className= "h-4 w-4" />
                  AI Transcription
                </CardTitle>
                <Button
                  size= "sm
                  variant= "outline
                  onClick={() => dispatch({ type: 'TOGGLE_TRANSCRIPTION' })}
                >
                  {state.showTranscription ? <EyeOff className= "h-3 w-3" /> : <Eye className= "h-3 w-3" />}
                </Button>
              </div>
            </CardHeader>
            {state.showTranscription && (
              <CardContent className= "space-y-2 max-h-64 overflow-y-auto">
                {state.transcription.map(segment => (
                  <div
                    key={segment.id}
                    className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                      state.currentTime >= segment.startTime && state.currentTime <= segment.endTime
                        ? 'bg-purple-100 border-purple-200
                        : 'hover:bg-gray-50
                    }`}
                    onClick={() => jumpToTimestamp(segment.startTime)}
                  >
                    <div className= "flex items-center justify-between mb-1">
                      <span className= "text-xs text-gray-500">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </span>
                      <Badge variant= "outline" className= "text-xs">
                        {Math.round(segment.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className= "text-gray-700">{segment.text}</p>
                    {segment.keywords.length > 0 && (
                      <div className= "flex gap-1 mt-1">
                        {segment.keywords.slice(0, 3).map(keyword => (
                          <Badge key={keyword} variant= "secondary" className= "text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>

          {/* Annotations Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className= "text-sm flex items-center gap-2">
                <MessageCircle className= "h-4 w-4" />
                Annotations ({state.annotations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className= "space-y-2 max-h-64 overflow-y-auto">
              {state.annotations.map(annotation => (
                <div
                  key={annotation.id}
                  className= "p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                  onClick={() => jumpToTimestamp(annotation.timestamp)}
                >
                  <div className= "flex items-center justify-between mb-1">
                    <Badge variant={annotation.type === 'hotspot' ? &apos;default&apos; : &apos;outline&apos;} className= "text-xs">
                      {annotation.type}
                    </Badge>
                    <span className= "text-xs text-gray-500">
                      <Clock className= "h-3 w-3 inline mr-1" />
                      {formatTime(annotation.timestamp)}
                    </span>
                  </div>
                  <p className= "text-sm text-gray-700">{annotation.content}</p>
                  <div className= "text-xs text-gray-500 mt-1">
                    by {annotation.userName}
                  </div>
                  {annotation.responses.length > 0 && (
                    <Badge variant= "outline" className= "text-xs mt-1">
                      {annotation.responses.length} responses
                    </Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card>
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle className= "text-sm flex items-center gap-2">
                  <BarChart3 className= "h-4 w-4" />
                  Video Analytics
                </CardTitle>
                <Button
                  size= "sm
                  variant= "outline
                  onClick={() => dispatch({ type: 'TOGGLE_ANALYTICS' })}
                >
                  {state.showAnalytics ? <EyeOff className= "h-3 w-3" /> : <Eye className= "h-3 w-3" />}
                </Button>
              </div>
            </CardHeader>
            {state.showAnalytics && (
              <CardContent className= "space-y-3">
                <div className= "grid grid-cols-2 gap-2">
                  <div className= "text-center p-2 bg-blue-50 rounded">
                    <div className= "text-lg font-bold text-blue-600">{state.analytics.totalViews}</div>
                    <div className= "text-xs text-blue-700">Total Views</div>
                  </div>
                  <div className= "text-center p-2 bg-green-50 rounded">
                    <div className= "text-lg font-bold text-green-600">{state.analytics.uniqueViewers}</div>
                    <div className= "text-xs text-green-700">Unique Viewers</div>
                  </div>
                  <div className= "text-center p-2 bg-purple-50 rounded">
                    <div className= "text-lg font-bold text-purple-600">{state.analytics.completionRate}%</div>
                    <div className= "text-xs text-purple-700">Completion Rate</div>
                  </div>
                  <div className= "text-center p-2 bg-orange-50 rounded">
                    <div className= "text-lg font-bold text-orange-600">{state.analytics.engagementScore}</div>
                    <div className= "text-xs text-orange-700">Engagement Score</div>
                  </div>
                </div>

                <div>
                  <h4 className= "text-xs font-medium mb-2">Top Moments</h4>
                  {state.analytics.topMoments.map((moment, index) => (
                    <div
                      key={index}
                      className= "flex items-center justify-between p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100
                      onClick={() => jumpToTimestamp(moment.timestamp)}
                    >
                      <span>{moment.description}</span>
                      <Badge variant= "outline">{moment.score}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
} 