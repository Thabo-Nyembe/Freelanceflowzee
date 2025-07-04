/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client"

/* ------------------------------------------------------------------
 * React / hooks
 * ------------------------------------------------------------------ */
import React, {
  useState,
  useReducer,
  useRef,
  useEffect,
  type JSX,
} from 'react'

/* ------------------------------------------------------------------
 * UI building-blocks
 * ------------------------------------------------------------------ */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  Monitor, 
  Camera, 
  Settings,
  Download,
  Share2,
  Users,
  MessageSquare,
  TrendingUp,
  RotateCcw,
  VolumeX,
  Maximize,
  Video,
  Mic,
  Eye,
  Brain,
  Sparkles,
  Edit3,
  StopCircle,
  Upload,
  Clock,
  Zap,
  Subtitles,
  Heart,
  MoreHorizontal
} from 'lucide-react'

// Type definitions
interface VideoStudioState {
  isRecording: boolean
  isPaused: boolean
  recordingMode: string
  audioEnabled: boolean
  videoEnabled: boolean
  currentTime: number
  duration: number
  zoom: number
  isPlaying: boolean
  selectedClip: unknown
  recordings: VideoRecording[]
  liveViewers: LiveViewer[]
  comments: VideoComment[]
  transcription: TranscriptionSegment[]
  aiAnalysis: AIAnalysis
  collaborators: unknown[]
  isLiveSession: boolean
  qualitySettings: QualitySettings
  annotations: VideoAnnotation[]
  chapters: VideoChapter[]
  isEditing: boolean
  editingTool: unknown
  exportProgress: number
  viewerAnalytics: ViewerAnalytics
  volume: number
}

interface LiveViewer {
  id: string
  name: string
  avatar: string
  timestamp: number
  isActive: boolean
  cursor: { x: number; y: number }
  isWatching: boolean
}

interface VideoComment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  timestamp: number
  videoTimestamp: number
  replies: unknown[]
  reactions: unknown[]
  createdAt: string
  isResolved: boolean
  aiSentiment: string
}

interface TranscriptionSegment {
  id: string
  text: string
  startTime: number
  endTime: number
  confidence: number
  aiGenerated: boolean
  isEdited: boolean
}

interface AIAnalysis {
  summary: string
  keyTopics: string[]
  sentiment: string
  engagementScore: number
  suggestedTags: string[]
  optimizationTips: string[]
  accessibilityScore: number
  qualityScore: number
  contentType: string
  difficulty: string
  estimatedWatchTime: number
}

interface QualitySettings {
  resolution: string
  frameRate: number
  bitrate: number
  audioQuality: string
  compression: string
}

interface VideoRecording {
  id: string
  title: string
  duration: number
  size: number
  format: string
  quality: string
  thumbnail: string
  createdAt: string
  views: number
  comments: number
  likes: number
  shares: number
  url: string
  transcriptUrl: string
  aiSummary: string
  tags: string[]
  isPublic: boolean
  downloadEnabled: boolean
  passwordProtected: boolean
}

interface VideoAnnotation {
  id: string
  timestamp: number
  x: number
  y: number
  startTime: number
  endTime: number
  style: unknown
  createdBy: string
}

interface VideoChapter {
  id: string
  title: string
  startTime: number
  thumbnail: string
  description?: string
}

interface ViewerAnalytics {
  totalViews: number
  averageWatchTime: number
  engagementRate: number
  dropOffPoints: { time: number; percentage: number }[]
  audienceRetention: number[]
  peakViewers: number
  comments: number
  shares: number
  likes: number
}

// Enhanced Context7 Reducer
const videoStudioReducer = (state: VideoStudioState, action: any): VideoStudioState => {
  switch (action.type) {
    case "START_RECORDING":
      return { ...state, isRecording: true, isPaused: false }
    case "STOP_RECORDING":
      return { ...state, isRecording: false, isPaused: false }
    case "PAUSE_RECORDING":
      return { ...state, isPaused: true }
    case "RESUME_RECORDING":
      return { ...state, isPaused: false }
    case "SET_RECORDING_MODE":
      return { ...state, recordingMode: action.mode }
    case "TOGGLE_AUDIO":
      return { ...state, audioEnabled: !state.audioEnabled }
    case "TOGGLE_VIDEO":
      return { ...state, videoEnabled: !state.videoEnabled }
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.time }
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom }
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying }
    case "ADD_RECORDING":
      return { ...state, recordings: [...state.recordings, action.recording] }
    case "ADD_COMMENT":
      return { ...state, comments: [...state.comments, action.comment] }
    case "UPDATE_TRANSCRIPTION":
      return { ...state, transcription: action.transcription }
    case "UPDATE_AI_ANALYSIS":
      return { ...state, aiAnalysis: action.analysis }
    case "ADD_LIVE_VIEWER":
      return { ...state, liveViewers: [...state.liveViewers, action.viewer] }
    case "REMOVE_LIVE_VIEWER":
      return { ...state, liveViewers: state.liveViewers.filter(v => v.id !== action.viewerId) }
    case "UPDATE_VIEWER_CURSOR":
      return {
        ...state,
        liveViewers: state.liveViewers.map(v =>
          v.id === action.viewerId ? { ...v, cursor: action.cursor } : v
        )
      }
    case "SET_QUALITY_SETTINGS":
      return { ...state, qualitySettings: { ...state.qualitySettings, ...action.settings } }
    case "ADD_ANNOTATION":
      return { ...state, annotations: [...state.annotations, action.annotation] }
    case "UPDATE_VIEWER_ANALYTICS":
      return { ...state, viewerAnalytics: { ...state.viewerAnalytics, ...action.analytics } }
    case "SET_VOLUME":
      return { ...state, volume: action.volume }
    default:
      return state
  }
}

// Initial state with Context7 enhancements
const initialState: VideoStudioState = {
  isRecording: false,
  isPaused: false,
  recordingMode: 'screen',
  audioEnabled: true,
  videoEnabled: true,
  currentTime: 0,
  duration: 0,
  zoom: 100,
  isPlaying: false,
  selectedClip: null,
  recordings: [
    {
      id: '1',
      title: 'Project Overview Presentation',
      duration: 1845,
      size: 250,
      format: 'MP4',
      quality: '1080p',
      thumbnail: '/images/video-thumb-1.jpg',
      createdAt: '2024-01-15T10:30:00Z',
      views: 124,
      comments: 8,
      likes: 23,
      shares: 5,
      url: '/videos/project-overview.mp4',
      transcriptUrl: '/transcripts/project-overview.txt',
      aiSummary: 'Comprehensive overview of Q1 project goals and team responsibilities.',
      tags: ['presentation', 'overview', 'project'],
      isPublic: true,
      downloadEnabled: true,
      passwordProtected: false
    }
  ],
  liveViewers: [
    {
      id: 'viewer-1',
      name: 'Sarah Chen',
      avatar: 'SC',
      timestamp: Date.now(),
      isActive: true,
      cursor: { x: 250, y: 150 },
      isWatching: true
    }
  ],
  comments: [],
  transcription: [],
  aiAnalysis: {
    summary: 'Professional video recording with clear audio and engaging presentation style.',
    keyTopics: ['project management', 'team collaboration', 'quarterly goals'],
    sentiment: 'positive',
    engagementScore: 85,
    suggestedTags: ['business', 'presentation', 'quarterly'],
    optimizationTips: ['Consider adding captions', 'Optimize for mobile viewing'],
    accessibilityScore: 78,
    qualityScore: 92,
    contentType: 'presentation',
    difficulty: 'intermediate',
    estimatedWatchTime: 1680
  },
  collaborators: [],
  isLiveSession: false,
  qualitySettings: {
    resolution: '1080p',
    frameRate: 30,
    bitrate: 5000,
    audioQuality: "high",
    compression: ""
  },
  volume: 80,
}

interface EnterpriseVideoStudioProps {
  className?: string
  onRecordingComplete?: (rec: VideoRecording) => void
}

export default function EnterpriseVideoStudio({
  className = "",
  onRecordingComplete,
}: EnterpriseVideoStudioProps) {
  const [state, dispatch] = useReducer(videoStudioReducer, initialState)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [selectedViewer, setSelectedViewer] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Context7 enhanced recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' as any },
        audio: true
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      dispatch({ type: 'START_RECORDING' })
    } catch (error) {
      console.error('Error starting recording: ', error)
    }
  }

  const stopRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    dispatch({ type: 'STOP_RECORDING' })
    
    const newRecording: VideoRecording = {
      id: Date.now().toString(),
      title: `Recording ${new Date().toLocaleDateString()}`,
      duration: state.currentTime,
      size: Math.round(state.currentTime / 60 * 25),
      format: 'MP4',
      quality: '1080p',
      thumbnail: '/images/recording-thumb.jpg',
      createdAt: new Date().toISOString(),
      views: 0,
      comments: 0,
      likes: 0,
      shares: 0,
      url: `/videos/recording-${Date.now()}.mp4`,
      transcriptUrl: `/transcripts/recording-${Date.now()}.txt`,
      aiSummary: 'AI-generated summary will be available shortly...',
      tags: [],
      isPublic: false,
      downloadEnabled: true,
      passwordProtected: false
    }
    
    dispatch({ type: 'ADD_RECORDING', recording: newRecording })
    onRecordingComplete?.(newRecording)
  }

  const addComment = (content: string, timestamp: number) => {
    const comment: VideoComment = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: 'CU',
      content,
      timestamp: Date.now(),
      videoTimestamp: timestamp,
      replies: [],
      reactions: [],
      createdAt: new Date().toISOString(),
      isResolved: false,
      aiSentiment: 'neutral'
    }
    dispatch({ type: 'ADD_COMMENT', comment })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl">
              <Video className="h-6 w-6 text-white" />
            </div>
            Enterprise Video Studio
          </h2>
          <p className="text-gray-600 mt-1">
            Professional video recording and collaboration tools
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            Live Recording
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Brain className="h-3 w-3 mr-1" />
            AI-Powered
          </Badge>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Enterprise
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="record" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Record
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Square className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="collaborate" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Live Session
          </TabsTrigger>
        </TabsList>

        {/* Record Tab */}
        <TabsContent value="record" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recording Controls</CardTitle>
              <CardDescription>Start, pause, or stop your video recording</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {!state.isRecording ? (
                  <Button onClick={startRecording} className="bg-red-500 hover:bg-red-600">
                    <Video className="h-4 w-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="outline">
                    <Square className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                <Button variant="outline">
                  <Mic className="h-4 w-4 mr-2" />
                  Audio: ON
                </Button>
                
                <Button variant="outline">
                  <Camera className="h-4 w-4 mr-2" />
                  Camera: ON
                </Button>
              </div>

              {state.isRecording && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording: {formatTime(state.currentTime)}</span>
                  </div>
                  <Progress value={75} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Library</CardTitle>
              <CardDescription>Manage your recorded videos and presentations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.recordings.map((recording) => (
                  <Card key={recording.id} className="overflow-hidden">
                    <div className="aspect-video bg-gray-100 relative">
                      <img 
                        src={recording.thumbnail} 
                        alt={recording.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Button size="sm" variant="secondary">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {formatTime(recording.duration)}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{recording.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{formatFileSize(recording.size)}</span>
                        <span>{recording.quality}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {recording.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {recording.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {recording.likes}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Share2 className="h-3 w-3 mr-1" />
                          Share
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.viewerAnalytics.totalViews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Watch Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatTime(state.viewerAnalytics.averageWatchTime)}</div>
                <p className="text-xs text-muted-foreground">+8% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.viewerAnalytics.engagementRate}%</div>
                <p className="text-xs text-muted-foreground">+3% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collaboration Tab */}
        <TabsContent value="collaborate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Collaboration</CardTitle>
              <CardDescription>Real-time video collaboration and feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Live Session</h3>
                <p className="text-gray-600 mb-4">Invite team members to collaborate in real-time</p>
                <Button>
                  <Video className="h-4 w-4 mr-2" />
                  Start Live Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <video ref={videoRef} className="hidden" />
    </div>
  )
}