'use client'

import React, { useState, useReducer, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  Subtitles
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
    case 'START_RECORDING':
      return { ...state, isRecording: true, isPaused: false }
    case 'STOP_RECORDING':
      return { ...state, isRecording: false, isPaused: false }
    case 'PAUSE_RECORDING':
      return { ...state, isPaused: !state.isPaused }
    case 'SET_RECORDING_MODE':
      return { ...state, recordingMode: action.mode }
    case 'TOGGLE_AUDIO':
      return { ...state, audioEnabled: !state.audioEnabled }
    case 'TOGGLE_VIDEO':
      return { ...state, videoEnabled: !state.videoEnabled }
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.time }
    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom }
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }
    case 'ADD_RECORDING':
      return { ...state, recordings: [...state.recordings, action.recording] }
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.comment] }
    case 'UPDATE_TRANSCRIPTION':
      return { ...state, transcription: action.transcription }
    case 'UPDATE_AI_ANALYSIS':
      return { ...state, aiAnalysis: action.analysis }
    case 'ADD_LIVE_VIEWER':
      return { ...state, liveViewers: [...state.liveViewers, action.viewer] }
    case 'REMOVE_LIVE_VIEWER':
      return { ...state, liveViewers: state.liveViewers.filter(v => v.id !== action.viewerId) }
    case 'UPDATE_VIEWER_CURSOR':
      return {
        ...state,
        liveViewers: state.liveViewers.map(v =>
          v.id === action.viewerId ? { ...v, cursor: action.cursor } : v
        )
      }
    case 'SET_QUALITY_SETTINGS':
      return { ...state, qualitySettings: { ...state.qualitySettings, ...action.settings } }
    case 'ADD_ANNOTATION':
      return { ...state, annotations: [...state.annotations, action.annotation] }
    case 'UPDATE_VIEWER_ANALYTICS':
      return { ...state, viewerAnalytics: { ...state.viewerAnalytics, ...action.analytics } }
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
    audioQuality: 'high',
    compression: 'medium'
  },
  annotations: [],
  chapters: [],
  isEditing: false,
  editingTool: null,
  exportProgress: 0,
  viewerAnalytics: {
    totalViews: 1250,
    averageWatchTime: 420,
    engagementRate: 78,
    dropOffPoints: [],
    audienceRetention: [],
    peakViewers: 45,
    comments: 23,
    shares: 12,
    likes: 89
  }
}

interface EnterpriseVideoStudioProps {
  projectId: string
  currentUser: unknown
  onRecordingComplete?: (recording: VideoRecording) => void
  onShare?: (recording: VideoRecording) => void
  className?: string
}

export function EnterpriseVideoStudio({
  projectId,
  currentUser,
  onRecordingComplete,
  onShare,
  className = ''
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
        video: { mediaSource: 'screen' },
        audio: state.audioEnabled
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      
      dispatch({ type: 'START_RECORDING' })
      
      // Simulate AI transcription start
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_TRANSCRIPTION',
          transcription: [
            {
              id: '1',
              text: 'Hello everyone, welcome to today\'s presentation.',
              startTime: 0,
              endTime: 3,
              confidence: 0.95,
              aiGenerated: true,
              isEdited: false
            }
          ]
        })
      }, 3000)
      
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }

  const stopRecording = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    dispatch({ type: 'STOP_RECORDING' })
    
    // Simulate recording completion with AI analysis
    const newRecording: VideoRecording = {
      id: Date.now().toString(),
      title: `Recording ${new Date().toLocaleDateString()}`,
      duration: state.currentTime,
      size: Math.round(state.currentTime / 60 * 25), // Estimate MB
      format: 'MP4',
      quality: state.qualitySettings.resolution,
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
              <Video className="h-8 w-8 text-white" />
            </div>
            Enterprise Video Studio
          </h2>
          <p className="text-gray-600 mt-1">
            Loom-level video recording with AI transcription, real-time collaboration & advanced editing
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Eye className="h-3 w-3 mr-1" />
            {state.liveViewers.filter(v => v.isWatching).length} watching
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Brain className="h-3 w-3 mr-1" />
            AI Enhanced
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
          <div className="grid grid-cols-12 gap-6">
            {/* Recording Interface */}
            <div className="col-span-8">
              <Card className="bg-gradient-to-br from-slate-50 to-white border-slate-200/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-600" />
                      Recording Studio
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {state.isRecording && (
                        <Badge variant="destructive" className="animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                          REC {formatTime(state.currentTime)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Recording Preview */}
                  <div className="relative bg-black rounded-lg aspect-video overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      playsInline
                    />
                    
                    {/* Live Cursors for Collaboration */}
                    {state.liveViewers.map((viewer) => (
                      <div
                        key={viewer.id}
                        className="absolute pointer-events-none transition-all duration-200"
                        style={{
                          left: `${viewer.cursor.x}px`,
                          top: `${viewer.cursor.y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                            {viewer.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Select
                        value={state.recordingMode}
                        onValueChange={(mode) => dispatch({ type: 'SET_RECORDING_MODE', mode })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="screen">Screen Only</SelectItem>
                          <SelectItem value="camera">Camera Only</SelectItem>
                          <SelectItem value="both">Screen + Camera</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant={state.audioEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => dispatch({ type: 'TOGGLE_AUDIO' })}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>

                      <Button
                        variant={state.videoEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => dispatch({ type: 'TOGGLE_VIDEO' })}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {!state.isRecording ? (
                        <Button
                          onClick={startRecording}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                        >
                          <StopCircle className="h-4 w-4 mr-2" />
                          Stop Recording
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="col-span-4 space-y-4">
              {/* Live Viewers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Live Viewers ({state.liveViewers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {state.liveViewers.map((viewer) => (
                      <div key={viewer.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                            {viewer.avatar}
                          </div>
                          <span className="text-sm font-medium">{viewer.name}</span>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${viewer.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.recordings.map((recording) => (
              <Card key={recording.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-0">
                  <div className="relative">
                    <img src={recording.thumbnail} alt={recording.title} className="w-full h-40 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
                      {formatTime(recording.duration)}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{recording.title}</h3>
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="bg-gray-100 px-2 py-1 rounded">{recording.quality}</span>
                      <span>{formatFileSize(recording.size * 1024 * 1024)}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {recording.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {recording.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="h-3 w-3" />
                        {recording.shares}
                      </span>
                    </div>
                    
                    {recording.aiSummary && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {recording.aiSummary}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-700 text-sm font-medium">Total Views</p>
                    <p className="text-2xl font-bold text-blue-900">{state.viewerAnalytics.totalViews.toLocaleString()}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-700 text-sm font-medium">Avg. Watch Time</p>
                    <p className="text-2xl font-bold text-green-900">{formatTime(state.viewerAnalytics.averageWatchTime)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-700 text-sm font-medium">Engagement Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{state.viewerAnalytics.engagementRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-700 text-sm font-medium">Peak Viewers</p>
                    <p className="text-2xl font-bold text-orange-900">{state.viewerAnalytics.peakViewers}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Live Session Tab */}
        <TabsContent value="collaborate" className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-indigo-900">
                <Sparkles className="h-6 w-6 text-indigo-600" />
                Enterprise Live Collaboration
              </CardTitle>
              <CardDescription className="text-indigo-700">
                Real-time co-viewing, commenting, and AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-indigo-100">
                <Zap className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Live Session</h3>
                <p className="text-gray-600 mb-6">
                  Invite team members for real-time collaboration with AI transcription and smart annotations
                </p>
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Users className="h-5 w-5 mr-2" />
                  Create Live Session
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 