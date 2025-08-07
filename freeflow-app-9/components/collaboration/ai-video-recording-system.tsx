"use client"

import React, { useState, useEffect, useReducer, useRef, useMemo, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Download, 
  Share2, 
  Settings, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  SkipBack, 
  SkipForward, 
  Clock, 
  Users, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Video,
  Mic,
  MicOff,
  Captions,
  MapPin,
  Sparkles,
  BarChart3,
  MessageCircle,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  UserIcon,
  Zap
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAnalytics } from '@/hooks/use-analytics'
import { ErrorBoundary } from '@/components/error-boundary'
import { useEnhancedNavigation } from '@/components/enhanced-navigation'

/**
 * Sentiment type representing the emotional tone of transcribed content
 */
type Sentiment = 'positive' | 'neutral' | 'negative' | 'mixed'

/**
 * Video annotation interface for comments, hotspots, and highlights
 */
interface VideoAnnotation {
  id: string
  timestamp: number
  x: number
  y: number
  type: 'comment' | 'hotspot' | 'highlight'
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

/**
 * Transcription segment with enhanced AI features
 */
interface TranscriptionSegment {
  id: string
  startTime: number
  endTime: number
  text: string
  confidence: number
  speaker: string
  keywords: string[]
  sentiment?: Sentiment
  isHighlighted?: boolean
  entities?: Array<{
    text: string
    type: string
    confidence: number
  }>
}

/**
 * Video chapter with AI-generated title and summary
 */
interface VideoChapter {
  id: string
  title: string
  startTime: number
  endTime: number
  summary: string
  keyTopics: string[]
}

/**
 * Comprehensive video analytics data
 */
interface VideoAnalytics {
  totalViews: number
  uniqueViewers: number
  averageWatchTime: number
  completionRate: number
  engagementScore: number
  heatmapData: { timestamp: number; engagement: number }[]
  topMoments: { timestamp: number; description: string; score: number }[]
  viewerDropoff: { timestamp: number; dropoffRate: number }[]
  deviceBreakdown: { device: string; percentage: number }[]
  geographicData?: { region: string; viewers: number }[]
}

/**
 * Live collaboration user data
 */
interface CollaborationUser {
  id: string
  name: string
  avatar: string
  isActive: boolean
  cursorPosition?: { x: number; y: number }
  lastActivity: Date
  role: 'viewer' | 'editor' | 'owner'
}

/**
 * Recording state interface
 */
interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  isPlaying: boolean
  duration: number
  currentTime: number
  volume: number
  isMuted: boolean
  recordingMode: 'screen' | 'camera' | 'both'
  quality: 'hd' | 'fullhd' | '4k'
  annotations: VideoAnnotation[]
  transcription: TranscriptionSegment[]
  analytics: VideoAnalytics
  isProcessing: boolean
  processingProgress: number
  recordedBlob: Blob | null
  videoUrl: string | null
  showAnnotations: boolean
  showTranscription: boolean
  showAnalytics: boolean
  isFullscreen: boolean
  playbackSpeed: number
  chapters: VideoChapter[]
  collaborators: CollaborationUser[]
  error: Error | null
  wsConnection: WebSocket | null
  aiProcessingStatus: 'idle' | 'connecting' | 'processing' | 'completed' | 'failed'
}

/**
 * Recording action types for reducer
 */
type RecordingAction = 
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob }
  | { type: 'PAUSE_RECORDING' }
  | { type: 'RESUME_RECORDING' }
  | { type: 'SET_PLAYING'; playing: boolean }
  | { type: 'SET_CURRENT_TIME'; time: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'ADD_ANNOTATION'; annotation: VideoAnnotation }
  | { type: 'UPDATE_ANNOTATION'; id: string; annotation: Partial<VideoAnnotation> }
  | { type: 'DELETE_ANNOTATION'; id: string }
  | { type: 'ADD_ANNOTATION_RESPONSE'; annotationId: string; response: VideoAnnotation['responses'][0] }
  | { type: 'UPDATE_TRANSCRIPTION'; segments: TranscriptionSegment[] }
  | { type: 'ADD_TRANSCRIPTION_SEGMENT'; segment: TranscriptionSegment }
  | { type: 'SET_PROCESSING'; processing: boolean }
  | { type: 'SET_PROCESSING_PROGRESS'; progress: number }
  | { type: 'TOGGLE_ANNOTATIONS' }
  | { type: 'TOGGLE_TRANSCRIPTION' }
  | { type: 'TOGGLE_ANALYTICS' }
  | { type: 'SET_PLAYBACK_SPEED'; speed: number }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'UPDATE_CHAPTERS'; chapters: VideoChapter[] }
  | { type: 'ADD_CHAPTER'; chapter: VideoChapter }
  | { type: 'UPDATE_COLLABORATORS'; collaborators: CollaborationUser[] }
  | { type: 'UPDATE_COLLABORATOR'; id: string; data: Partial<CollaborationUser> }
  | { type: 'SET_ERROR'; error: Error | null }
  | { type: 'SET_WS_CONNECTION'; connection: WebSocket | null }
  | { type: 'SET_AI_PROCESSING_STATUS'; status: RecordingState['aiProcessingStatus'] }
  | { type: 'UPDATE_ANALYTICS'; analytics: Partial<VideoAnalytics> }

/**
 * Initial state for the recording system
 */
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
      keywords: ['welcome', 'project', 'create'],
      sentiment: 'positive'
    },
    {
      id: 'trans-2',
      startTime: 5.2,
      endTime: 12.8,
      text: "First, navigate to the dashboard by clicking on the main menu button in the top left corner.",
      confidence: 0.95,
      speaker: 'Sarah Chen',
      keywords: ['dashboard', 'menu', 'navigate'],
      sentiment: 'neutral'
    },
    {
      id: 'trans-3',
      startTime: 12.8,
      endTime: 18.5,
      text: "You'll see all your projects listed here with their current status and progress indicators.",
      confidence: 0.97,
      speaker: 'Sarah Chen',
      keywords: ['projects', 'status', 'progress'],
      sentiment: 'neutral'
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
    ],
    viewerDropoff: [
      { timestamp: 30, dropoffRate: 5 },
      { timestamp: 60, dropoffRate: 12 },
      { timestamp: 90, dropoffRate: 25 }
    ],
    deviceBreakdown: [
      { device: 'Desktop', percentage: 68 },
      { device: 'Mobile', percentage: 24 },
      { device: 'Tablet', percentage: 8 }
    ]
  },
  isProcessing: false,
  processingProgress: 0,
  recordedBlob: null,
  videoUrl: '/media/placeholder-video.mp4',
  showAnnotations: true,
  showTranscription: true,
  showAnalytics: false,
  isFullscreen: false,
  playbackSpeed: 1,
  chapters: [
    {
      id: 'chapter-1',
      title: 'Introduction',
      startTime: 0,
      endTime: 18.5,
      summary: 'Introduction to the platform and basic navigation',
      keyTopics: ['welcome', 'navigation', 'dashboard']
    },
    {
      id: 'chapter-2',
      title: 'Creating Your First Project',
      startTime: 18.5,
      endTime: 45.2,
      summary: 'Step-by-step guide to creating your first project',
      keyTopics: ['project creation', 'setup', 'configuration']
    }
  ],
  collaborators: [
    {
      id: 'user-1',
      name: 'Sarah Chen',
      avatar: 'SC',
      isActive: true,
      lastActivity: new Date(),
      role: 'owner'
    },
    {
      id: 'user-2',
      name: 'Mike Johnson',
      avatar: 'MJ',
      isActive: false,
      lastActivity: new Date(Date.now() - 300000), // 5 minutes ago
      role: 'viewer'
    }
  ],
  error: null,
  wsConnection: null,
  aiProcessingStatus: 'idle'
}

/**
 * Reducer function for managing recording state
 */
function recordingReducer(state: RecordingState, action: RecordingAction): RecordingState {
  switch (action.type) {
    case 'START_RECORDING':
      return {
        ...state,
        isRecording: true,
        isPaused: false,
        duration: 0,
        currentTime: 0,
        error: null
      }
    case 'STOP_RECORDING':
      return {
        ...state,
        isRecording: false,
        isPaused: false,
        recordedBlob: action.blob,
        videoUrl: URL.createObjectURL(action.blob),
        aiProcessingStatus: 'connecting'
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
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.duration
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
    case 'UPDATE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.map(ann => 
          ann.id === action.id ? { ...ann, ...action.annotation } : ann
        )
      }
    case 'DELETE_ANNOTATION':
      return {
        ...state,
        annotations: state.annotations.filter(ann => ann.id !== action.id)
      }
    case 'ADD_ANNOTATION_RESPONSE':
      return {
        ...state,
        annotations: state.annotations.map(ann => 
          ann.id === action.annotationId 
            ? { ...ann, responses: [...ann.responses, action.response] } 
            : ann
        )
      }
    case 'UPDATE_TRANSCRIPTION':
      return {
        ...state,
        transcription: action.segments
      }
    case 'ADD_TRANSCRIPTION_SEGMENT':
      return {
        ...state,
        transcription: [...state.transcription, action.segment]
      }
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.processing,
        processingProgress: action.processing ? state.processingProgress : 0
      }
    case 'SET_PROCESSING_PROGRESS':
      return {
        ...state,
        processingProgress: action.progress
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
    case 'TOGGLE_FULLSCREEN':
      return {
        ...state,
        isFullscreen: !state.isFullscreen
      }
    case 'UPDATE_CHAPTERS':
      return {
        ...state,
        chapters: action.chapters
      }
    case 'ADD_CHAPTER':
      return {
        ...state,
        chapters: [...state.chapters, action.chapter]
      }
    case 'UPDATE_COLLABORATORS':
      return {
        ...state,
        collaborators: action.collaborators
      }
    case 'UPDATE_COLLABORATOR':
      return {
        ...state,
        collaborators: state.collaborators.map(collab => 
          collab.id === action.id ? { ...collab, ...action.data } : collab
        )
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        aiProcessingStatus: action.error ? 'failed' : state.aiProcessingStatus
      }
    case 'SET_WS_CONNECTION':
      return {
        ...state,
        wsConnection: action.connection
      }
    case 'SET_AI_PROCESSING_STATUS':
      return {
        ...state,
        aiProcessingStatus: action.status
      }
    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, ...action.analytics }
      }
    default:
      return state
  }
}

/**
 * Props for the AI Video Recording System component
 */
interface AIVideoRecordingSystemProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar: string
  }
  onSave?: (videoData: any) => void
  onShare?: (shareData: any) => void
  className?: string
  aiApiEndpoint?: string
  collaborationEnabled?: boolean
  accessibilityMode?: boolean
}

/**
 * AI Video Recording System component with real-time transcription and collaboration
 */
export function AIVideoRecordingSystem({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = '',
  aiApiEndpoint = '/api/ai/video-processing',
  collaborationEnabled = true,
  accessibilityMode = false
}: AIVideoRecordingSystemProps) {
  const [state, dispatch] = useReducer(recordingReducer, initialState)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)
  const [newAnnotationPos, setNewAnnotationPos] = useState<{ x: number; y: number } | null>(null)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null)
  const { toast } = useToast()
  const { trackEvent } = useAnalytics()
  const { addBreadcrumb } = useEnhancedNavigation()

  /**
   * Set up navigation breadcrumbs
   */
  useEffect(() => {
    addBreadcrumb({
      label: 'Video Recording',
      href: `/projects/${projectId}/video-recording`,
      icon: Video
    })
    
    // Track page view
    trackEvent('video_recording_view', {
      projectId,
      userId: currentUser.id
    })
    
    return () => {
      // Clean up any connections when component unmounts
      closeWebSocketConnection()
    }
  }, [projectId, currentUser.id, addBreadcrumb, trackEvent])

  /**
   * Auto-update current time and duration
   */
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => {
      dispatch({ type: 'SET_CURRENT_TIME', time: video.currentTime })
    }
    
    const updateDuration = () => {
      dispatch({ type: 'SET_DURATION', duration: video.duration })
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  /**
   * Handle fullscreen changes
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null
      if (state.isFullscreen !== isFullscreen) {
        dispatch({ type: 'TOGGLE_FULLSCREEN' })
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [state.isFullscreen])

  /**
   * Handle volume changes
   */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = state.volume / 100
      videoRef.current.muted = state.isMuted
    }
  }, [state.volume, state.isMuted])

  /**
   * Handle playback speed changes
   */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = state.playbackSpeed
    }
  }, [state.playbackSpeed])

  /**
   * Set up real-time collaboration
   */
  useEffect(() => {
    if (!collaborationEnabled) return
    
    // Set up collaboration WebSocket
    const collaborationWs = new WebSocket(`wss://${window.location.host}/api/collaboration/${projectId}`)
    
    collaborationWs.onopen = () => {
      console.log('Collaboration WebSocket connected')
      collaborationWs.send(JSON.stringify({
        type: 'JOIN',
        user: currentUser
      }))
    }
    
    collaborationWs.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case 'USERS_UPDATE':
            dispatch({ type: 'UPDATE_COLLABORATORS', collaborators: data.users })
            break
          case 'CURSOR_MOVE':
            dispatch({ 
              type: 'UPDATE_COLLABORATOR', 
              id: data.userId, 
              data: { cursorPosition: data.position, isActive: true } 
            })
            break
          case 'ANNOTATION_ADD':
            dispatch({ type: 'ADD_ANNOTATION', annotation: data.annotation })
            break
          case 'ANNOTATION_RESPONSE':
            dispatch({ 
              type: 'ADD_ANNOTATION_RESPONSE', 
              annotationId: data.annotationId, 
              response: data.response 
            })
            break
        }
      } catch (error) {
        console.error('Error parsing collaboration message:', error)
      }
    }
    
    collaborationWs.onerror = (error) => {
      console.error('Collaboration WebSocket error:', error)
      toast({
        title: 'Collaboration Error',
        description: 'Could not connect to collaboration service',
        variant: 'destructive'
      })
    }
    
    // Send cursor position updates
    const handleMouseMove = (e: MouseEvent) => {
      if (!videoContainerRef.current) return
      
      const rect = videoContainerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      setCursorPosition({ x, y })
      
      // Throttle sending cursor updates
      if (collaborationWs.readyState === WebSocket.OPEN) {
        collaborationWs.send(JSON.stringify({
          type: 'CURSOR_MOVE',
          userId: currentUser.id,
          position: { x, y }
        }))
      }
    }
    
    if (videoContainerRef.current) {
      videoContainerRef.current.addEventListener('mousemove', handleMouseMove)
    }
    
    return () => {
      collaborationWs.close()
      if (videoContainerRef.current) {
        videoContainerRef.current.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [collaborationEnabled, projectId, currentUser, toast, trackEvent])

  /**
   * Initialize audio analysis for real-time transcription
   */
  const initializeAudioAnalysis = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      
      return { audioContext, analyser }
    } catch (error) {
      console.error('Error initializing audio analysis:', error)
      toast({
        title: 'Audio Analysis Error',
        description: 'Could not initialize audio processing',
        variant: 'destructive'
      })
      return null
    }
  }, [toast])

  /**
   * Create and manage WebSocket connection for real-time AI processing
   */
  const setupWebSocketConnection = useCallback(() => {
    try {
      // Close any existing connection
      closeWebSocketConnection()
      
      // Create new WebSocket connection
      const ws = new WebSocket(`wss://${window.location.host}/api/ai/transcription`)
      wsRef.current = ws
      
      ws.onopen = () => {
        console.log('WebSocket connected for real-time transcription')
        dispatch({ type: 'SET_WS_CONNECTION', connection: ws })
        dispatch({ type: 'SET_AI_PROCESSING_STATUS', status: 'processing' })
        
        // Send initial metadata
        ws.send(JSON.stringify({
          type: 'metadata',
          projectId,
          userId: currentUser.id,
          recordingMode: state.recordingMode,
          quality: state.quality
        }))
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case 'transcription_segment':
              // Add new transcription segment
              dispatch({ 
                type: 'ADD_TRANSCRIPTION_SEGMENT', 
                segment: data.segment 
              })
              break
            case 'transcription_complete':
              // Update all transcription segments
              dispatch({ 
                type: 'UPDATE_TRANSCRIPTION', 
                segments: data.segments 
              })
              break
            case 'chapter_detected':
              // Add new chapter
              dispatch({ 
                type: 'ADD_CHAPTER', 
                chapter: data.chapter 
              })
              break
            case 'chapters_complete':
              // Update all chapters
              dispatch({ 
                type: 'UPDATE_CHAPTERS', 
                chapters: data.chapters 
              })
              break
            case 'analytics_update':
              // Update analytics data
              dispatch({ 
                type: 'UPDATE_ANALYTICS', 
                analytics: data.analytics 
              })
              break
            case 'processing_progress':
              // Update processing progress
              dispatch({ 
                type: 'SET_PROCESSING_PROGRESS', 
                progress: data.progress 
              })
              break
            case 'processing_complete':
              // Processing complete
              dispatch({ type: 'SET_PROCESSING', processing: false })
              dispatch({ type: 'SET_AI_PROCESSING_STATUS', status: 'completed' })
              
              // Track completion
              trackEvent('ai_processing_complete', {
                projectId,
                userId: currentUser.id,
                duration: state.duration,
                segmentsCount: data.segments?.length || 0
              })
              
              toast({
                title: 'Processing Complete',
                description: 'AI analysis of your video is complete',
                variant: 'default'
              })
              break
            case 'error':
              // Handle error
              dispatch({ 
                type: 'SET_ERROR', 
                error: new Error(data.message) 
              })
              
              toast({
                title: 'Processing Error',
                description: data.message,
                variant: 'destructive'
              })
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        dispatch({ 
          type: 'SET_ERROR', 
          error: new Error('WebSocket connection error') 
        })
        
        toast({
          title: 'Connection Error',
          description: 'Could not connect to AI processing service',
          variant: 'destructive'
        })
      }
      
      ws.onclose = () => {
        console.log('WebSocket connection closed')
        dispatch({ type: 'SET_WS_CONNECTION', connection: null })
      }
      
      return ws
    } catch (error) {
      console.error('Error setting up WebSocket connection:', error)
      dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error : new Error('Unknown WebSocket error') 
      })
      return null
    }
  }, [projectId, currentUser.id, state.recordingMode, state.quality, state.duration, toast, trackEvent])

  /**
   * Close WebSocket connection
   */
  const closeWebSocketConnection = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }
    wsRef.current = null
    dispatch({ type: 'SET_WS_CONNECTION', connection: null })
  }, [])

  /**
   * Process audio data for real-time transcription
   */
  const processAudioData = useCallback((audioData: Float32Array) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    
    // Send audio data for processing
    wsRef.current.send(JSON.stringify({
      type: 'audio_data',
      audioData: Array.from(audioData),
      timestamp: state.currentTime
    }))
  }, [state.currentTime])

  /**
   * Start screen recording with real-time processing
   */
  const startScreenRecording = useCallback(async () => {
    try {
      // Track recording start
      trackEvent('recording_started', {
        projectId,
        userId: currentUser.id,
        recordingMode: state.recordingMode,
        quality: state.quality
      })
      
      // Initialize audio analysis
      const audioSetup = initializeAudioAnalysis()
      if (!audioSetup) return
      
      // Request media stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: state.quality === '4k' ? 3840 : state.quality === 'fullhd' ? 1920 : 1280 },
          height: { ideal: state.quality === '4k' ? 2160 : state.quality === 'fullhd' ? 1080 : 720 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      // Set up MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      
      // Connect audio for analysis
      const audioSource = audioSetup.audioContext.createMediaStreamSource(stream)
      audioSource.connect(audioSetup.analyser)
      
      // Set up WebSocket for real-time transcription
      setupWebSocketConnection()
      
      // Collect chunks
      const chunks: BlobPart[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        dispatch({ type: 'STOP_RECORDING', blob })
        processVideoWithAI(blob)
        
        // Track recording stop
        trackEvent('recording_stopped', {
          projectId,
          userId: currentUser.id,
          duration: state.currentTime,
          fileSize: blob.size
        })
      }
      
      // Start recording
      mediaRecorder.start(1000) // Capture in 1-second chunks
      dispatch({ type: 'START_RECORDING' })
      
      // Start timer to track recording duration
      let seconds = 0
      recordingTimerRef.current = setInterval(() => {
        seconds++
        dispatch({ type: 'SET_CURRENT_TIME', time: seconds })
        dispatch({ type: 'SET_DURATION', duration: seconds })
        
        // Process audio data for real-time transcription
        if (audioSetup.analyser) {
          const dataArray = new Float32Array(audioSetup.analyser.frequencyBinCount)
          audioSetup.analyser.getFloatTimeDomainData(dataArray)
          processAudioData(dataArray)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error starting screen recording: ', error)
      
      toast({
        title: 'Recording Error',
        description: 'Could not start recording. Please check permissions.',
        variant: 'destructive'
      })
      
      dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error : new Error('Unknown recording error') 
      })
    }
  }, [
    projectId, 
    currentUser.id, 
    state.recordingMode, 
    state.quality, 
    state.currentTime, 
    initializeAudioAnalysis, 
    setupWebSocketConnection, 
    processAudioData, 
    toast, 
    trackEvent
  ])

  /**
   * Stop recording and clean up resources
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
      
      // Stop all tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      }
      
      // Clear recording timer
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
      
      // Close audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [state.isRecording])

  /**
   * Process video with AI after recording
   */
  const processVideoWithAI = useCallback(async (blob: Blob) => {
    dispatch({ type: 'SET_PROCESSING', processing: true })
    
    try {
      // Upload video for processing if WebSocket is not available
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        // Create form data for upload
        const formData = new FormData()
        formData.append('video', blob)
        formData.append('projectId', projectId)
        formData.append('userId', currentUser.id)
        
        // Upload video for processing
        const response = await fetch(aiApiEndpoint, {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Update state with processed data
        dispatch({ type: 'UPDATE_TRANSCRIPTION', segments: data.transcription })
        dispatch({ type: 'UPDATE_CHAPTERS', chapters: data.chapters })
        dispatch({ type: 'UPDATE_ANALYTICS', analytics: data.analytics })
        dispatch({ type: 'SET_PROCESSING', processing: false })
        dispatch({ type: 'SET_AI_PROCESSING_STATUS', status: 'completed' })
        
        toast({
          title: 'Processing Complete',
          description: 'AI analysis of your video is complete',
          variant: 'default'
        })
      }
    } catch (error) {
      console.error('Error processing video with AI:', error)
      
      dispatch({ 
        type: 'SET_ERROR', 
        error: error instanceof Error ? error : new Error('Unknown processing error') 
      })
      
      toast({
        title: 'Processing Error',
        description: 'Could not process video with AI',
        variant: 'destructive'
      })
      
      dispatch({ type: 'SET_PROCESSING', processing: false })
      dispatch({ type: 'SET_AI_PROCESSING_STATUS', status: 'failed' })
    }
  }, [projectId, currentUser.id, aiApiEndpoint, toast])

  /**
   * Handle video click for adding annotations
   */
  const handleVideoClick = useCallback((e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isAddingAnnotation) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setNewAnnotationPos({ x, y })
    
    // Track annotation click
    trackEvent('annotation_position_selected', {
      projectId,
      userId: currentUser.id,
      position: { x, y },
      timestamp: state.currentTime
    })
  }, [isAddingAnnotation, projectId, currentUser.id, state.currentTime, trackEvent])

  /**
   * Add annotation at current position and time
   */
  const addAnnotation = useCallback((content: string, type: VideoAnnotation['type'] = 'comment') => {
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
    
    // Send annotation to collaborators if WebSocket is open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ANNOTATION_ADD',
        annotation
      }))
    }
    
    // Track annotation added
    trackEvent('annotation_added', {
      projectId,
      userId: currentUser.id,
      annotationType: type,
      timestamp: state.currentTime
    })
    
    toast({
      title: 'Annotation Added',
      description: `${type} annotation added at ${formatTime(state.currentTime)}`,
      variant: 'default'
    })
  }, [
    newAnnotationPos, 
    state.currentTime, 
    currentUser.id, 
    currentUser.name, 
    projectId, 
    toast, 
    trackEvent
  ])

  /**
   * Jump to specific timestamp in video
   */
  const jumpToTimestamp = useCallback((timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      dispatch({ type: 'SET_CURRENT_TIME', time: timestamp })
      
      // Track timestamp jump
      trackEvent('timestamp_jump', {
        projectId,
        userId: currentUser.id,
        fromTime: state.currentTime,
        toTime: timestamp
      })
    }
  }, [projectId, currentUser.id, state.currentTime, trackEvent])

  /**
   * Format time in minutes:seconds
   */
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  /**
   * Export video to file
   */
  const exportVideo = useCallback(() => {
    if (state.recordedBlob) {
      const link = document.createElement('a')
      link.href = URL.createObjectURL(state.recordedBlob)
      link.download = `recording-${projectId}-${Date.now()}.webm`
      link.click()
      
      // Track export
      trackEvent('video_exported', {
        projectId,
        userId: currentUser.id,
        fileSize: state.recordedBlob.size,
        duration: state.duration
      })
      
      toast({
        title: 'Video Exported',
        description: 'Your recording has been downloaded',
        variant: 'default'
      })
    }
  }, [state.recordedBlob, projectId, currentUser.id, state.duration, toast, trackEvent])

  /**
   * Share video with team
   */
  const shareVideo = useCallback(() => {
    const shareData = {
      projectId,
      videoUrl: state.videoUrl,
      annotations: state.annotations,
      transcription: state.transcription,
      analytics: state.analytics,
      chapters: state.chapters,
      duration: state.duration,
      timestamp: new Date().toISOString(),
      sharedBy: currentUser
    }
    
    onShare?.(shareData)
    
    // Track share
    trackEvent('video_shared', {
      projectId,
      userId: currentUser.id,
      annotationsCount: state.annotations.length,
      transcriptionSegments: state.transcription.length
    })
    
    toast({
      title: 'Video Shared',
      description: 'Your recording has been shared with the team',
      variant: 'default'
    })
  }, [
    projectId, 
    state.videoUrl, 
    state.annotations, 
    state.transcription, 
    state.analytics, 
    state.chapters, 
    state.duration, 
    currentUser, 
    onShare, 
    toast, 
    trackEvent
  ])

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err)
      })
    } else {
      document.exitFullscreen()
    }
  }, [])

  /**
   * Render sentiment icon based on sentiment value
   */
  const renderSentimentIcon = useMemo(() => (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <Smile className="h-4 w-4 text-green-500" />
      case 'negative':
        return <Frown className="h-4 w-4 text-red-500" />
      case 'mixed':
        return <Meh className="h-4 w-4 text-yellow-500" />
      default:
        return <Meh className="h-4 w-4 text-gray-500" />
    }
  }, [])

  /**
   * Get chapter for current timestamp
   */
  const currentChapter = useMemo(() => {
    return state.chapters.find(
      chapter => state.currentTime >= chapter.startTime && state.currentTime <= chapter.endTime
    )
  }, [state.chapters, state.currentTime])

  /**
   * Get annotations for current timestamp (within 5 seconds)
   */
  const currentAnnotations = useMemo(() => {
    return state.annotations.filter(
      annotation => Math.abs(state.currentTime - annotation.timestamp) < 5
    )
  }, [state.annotations, state.currentTime])

  /**
   * Get transcription segment for current timestamp
   */
  const currentTranscriptionSegment = useMemo(() => {
    return state.transcription.find(
      segment => state.currentTime >= segment.startTime && state.currentTime <= segment.endTime
    )
  }, [state.transcription, state.currentTime])

  /**
   * Check if recording can be started
   */
  const canStartRecording = useMemo(() => {
    return !state.isRecording && !state.isProcessing && state.aiProcessingStatus !== 'processing'
  }, [state.isRecording, state.isProcessing, state.aiProcessingStatus])

  /**
   * Check if recording can be stopped
   */
  const canStopRecording = useMemo(() => {
    return state.isRecording && !state.isPaused
  }, [state.isRecording, state.isPaused])

  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Video Recording Error</h3>
          <p className="text-gray-600 mb-4">
            An error occurred with the video recording system. Please refresh and try again.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      }
    >
      <div className={`space-y-6 ${className}`} data-testid="ai-video-recording-system">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2" id="recording-title">
              <Video className="h-6 w-6 text-purple-600" aria-hidden="true" />
              AI Video Recording Studio
            </h2>
            <p className="text-gray-600">Loom-level video creation with AI-powered features</p>
          </div>

          <div className="flex items-center gap-2">
            {canStartRecording && (
              <Button 
                onClick={startScreenRecording} 
                className="bg-red-600 hover:bg-red-700"
                aria-label="Start recording"
              >
                <Maximize className="h-4 w-4 mr-2" aria-hidden="true" />
                Start Recording
              </Button>
            )}
            
            {canStopRecording && (
              <div className="flex gap-2">
                <Button 
                  onClick={stopRecording} 
                  variant="destructive"
                  aria-label="Stop recording"
                >
                  <Square className="h-4 w-4 mr-2" aria-hidden="true" />
                  Stop Recording
                </Button>
                {state.isPaused ? (
                  <Button 
                    onClick={() => dispatch({ type: 'RESUME_RECORDING' })} 
                    variant="outline"
                    aria-label="Resume recording"
                  >
                    <Play className="h-4 w-4 mr-2" aria-hidden="true" />
                    Resume
                  </Button>
                ) : (
                  <Button 
                    onClick={() => dispatch({ type: 'PAUSE_RECORDING' })} 
                    variant="outline"
                    aria-label="Pause recording"
                  >
                    <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                    Pause
                  </Button>
                )}
              </div>
            )}

            {state.videoUrl && !state.isRecording && (
              <>
                <Button 
                  onClick={exportVideo} 
                  variant="outline"
                  size="sm"
                  aria-label="Export video"
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export
                </Button>
                <Button 
                  onClick={shareVideo} 
                  size="sm"
                  aria-label="Share video"
                >
                  <Share2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Share
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Recording Status */}
        {state.isRecording && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" aria-hidden="true"></div>
                  <span className="font-medium text-red-800">
                    {state.isPaused ? 'Recording Paused' : 'Recording in Progress'}
                  </span>
                  <Badge variant="outline" className="bg-white">
                    {formatTime(state.duration)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{state.recordingMode}</Badge>
                  <Badge variant="outline">{state.quality}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Status */}
        {state.isProcessing && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 animate-spin" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-medium text-blue-800">AI Processing Video</div>
                  <div className="text-sm text-blue-600">
                    {state.aiProcessingStatus === 'connecting' 
                      ? 'Connecting to AI service...' 
                      : 'Generating transcription and analyzing content...'}
                  </div>
                  <Progress 
                    value={state.processingProgress} 
                    className="mt-2"
                    aria-label={`Processing progress: ${state.processingProgress}%`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Status */}
        {state.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">Processing Error</div>
                  <div className="text-sm text-red-600">{state.error.message}</div>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_ERROR', error: null })}
                  aria-label="Dismiss error"
                >
                  Dismiss
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Chapter Indicator */}
        {currentChapter && !state.isRecording && (
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-purple-600" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-medium text-purple-800">
                    Chapter: {currentChapter.title}
                  </div>
                  <div className="text-sm text-purple-600">{currentChapter.summary}</div>
                  <div className="flex gap-2 mt-1">
                    {currentChapter.keyTopics.map(topic => (
                      <Badge key={topic} variant="outline" className="bg-white">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Video Player */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Video Player</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={state.showAnnotations ? 'default' : 'outline'}
                      onClick={() => dispatch({ type: 'TOGGLE_ANNOTATIONS' })}
                      aria-pressed={state.showAnnotations}
                      aria-label="Toggle annotations"
                    >
                      <MapPin className="h-4 w-4 mr-1" aria-hidden="true" />
                      Annotations
                    </Button>
                    <Button
                      size="sm"
                      variant={isAddingAnnotation ? 'default' : 'outline'}
                      onClick={() => setIsAddingAnnotation(!isAddingAnnotation)}
                      aria-pressed={isAddingAnnotation}
                      aria-label="Add note"
                      disabled={state.isRecording}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                      Add Note
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleFullscreen}
                      aria-label="Toggle fullscreen"
                    >
                      {state.isFullscreen ? (
                        <Minimize className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Maximize className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="relative"
                  ref={videoContainerRef}
                  aria-label="Video player container"
                >
                  <video
                    ref={videoRef}
                    src={state.videoUrl || undefined}
                    className="w-full rounded-lg bg-black cursor-pointer"
                    controls={false}
                    onClick={handleVideoClick}
                    onPlay={() => dispatch({ type: 'SET_PLAYING', playing: true })}
                    onPause={() => dispatch({ type: 'SET_PLAYING', playing: false })}
                    aria-label="Video player"
                    playsInline
                  />

                  {/* Video Annotations */}
                  {state.showAnnotations && currentAnnotations.map(annotation => (
                    <div
                      key={annotation.id}
                      className="absolute bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
                      style={{
                        left: `${annotation.x}%`,
                        top: `${annotation.y}%`
                      }}
                      onClick={() => jumpToTimestamp(annotation.timestamp)}
                      title={annotation.content}
                      role="button"
                      aria-label={`Annotation: ${annotation.content} at ${formatTime(annotation.timestamp)}`}
                      tabIndex={0}
                    >
                      {annotation.type === 'comment' ? (
                        <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                  ))}

                  {/* New Annotation Marker */}
                  {newAnnotationPos && (
                    <div
                      className="absolute bg-yellow-400 text-black p-2 rounded-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-lg"
                      style={{
                        left: `${newAnnotationPos.x}%`,
                        top: `${newAnnotationPos.y}%`
                      }}
                      aria-label="New annotation position"
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </div>
                  )}

                  {/* Collaborator Cursors */}
                  {collaborationEnabled && state.collaborators.filter(c => c.id !== currentUser.id && c.isActive && c.cursorPosition).map(collaborator => (
                    <div
                      key={`cursor-${collaborator.id}`}
                      className="absolute pointer-events-none transition-all duration-200 z-50"
                      style={{
                        left: `${collaborator.cursorPosition?.x || 0}%`,
                        top: `${collaborator.cursorPosition?.y || 0}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      aria-hidden="true"
                    >
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                          {collaborator.name}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Live Transcription Caption */}
                  {currentTranscriptionSegment && !state.isRecording && (
                    <div 
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white p-2 px-4 rounded-lg max-w-[80%] text-center"
                      aria-live="polite"
                    >
                      <div className="flex items-center gap-2 mb-1 justify-center">
                        <UserIcon className="h-3 w-3" aria-hidden="true" />
                        <span className="text-xs">{currentTranscriptionSegment.speaker}</span>
                        {currentTranscriptionSegment.sentiment && (
                          <span aria-label={`Sentiment: ${currentTranscriptionSegment.sentiment}`}>
                            {renderSentimentIcon(currentTranscriptionSegment.sentiment)}
                          </span>
                        )}
                      </div>
                      <p>{currentTranscriptionSegment.text}</p>
                    </div>
                  )}
                </div>

                {/* Custom Controls */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (videoRef.current) {
                          if (state.isPlaying) {
                            videoRef.current.pause()
                          } else {
                            videoRef.current.play()
                          }
                        }
                      }}
                      aria-label={state.isPlaying ? "Pause" : "Play"}
                    >
                      {state.isPlaying ? (
                        <Pause className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Play className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => jumpToTimestamp(Math.max(0, state.currentTime - 10))}
                      aria-label="Skip back 10 seconds"
                    >
                      <SkipBack className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => jumpToTimestamp(state.currentTime + 10)}
                      aria-label="Skip forward 10 seconds"
                    >
                      <SkipForward className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    <div className="flex-1">
                      <Progress 
                        value={(state.currentTime / (state.duration || 1)) * 100} 
                        className="cursor-pointer"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const percent = (e.clientX - rect.left) / rect.width
                          const newTime = percent * (state.duration || 0)
                          jumpToTimestamp(newTime)
                        }}
                        aria-label={`Video progress: ${Math.round((state.currentTime / (state.duration || 1)) * 100)}%`}
                      />
                    </div>

                    <span className="text-sm text-gray-600 min-w-[80px]" aria-label="Video time">
                      {formatTime(state.currentTime)} / {formatTime(state.duration || 0)}
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dispatch({ type: 'TOGGLE_MUTE' })}
                      aria-label={state.isMuted ? "Unmute" : "Mute"}
                      aria-pressed={state.isMuted}
                    >
                      {state.isMuted ? (
                        <VolumeX className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-4 w-4" aria-hidden="true" />
                      )}
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
                      className="px-2 py-1 text-sm border rounded"
                      aria-label="Playback speed"
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
                  <Card className="mt-4 border-purple-200 bg-purple-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-purple-800 mb-2">Add Video Annotation</h4>
                      <Textarea
                        placeholder="Describe what's happening at this moment..."
                        className="mb-3"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            addAnnotation(e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        aria-label="Annotation content"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            addAnnotation(textarea.value, 'comment')
                            textarea.value = ''
                          }}
                          aria-label="Add comment"
                        >
                          Add Comment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const textarea = document.querySelector('textarea') as HTMLTextAreaElement
                            addAnnotation(textarea.value, 'hotspot')
                            textarea.value = ''
                          }}
                          aria-label="Add hotspot"
                        >
                          Add Hotspot
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setIsAddingAnnotation(false)
                            setNewAnnotationPos(null)
                          }}
                          aria-label="Cancel adding annotation"
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
          <div className="col-span-4 space-y-4">
            {/* Transcription */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Captions className="h-4 w-4" aria-hidden="true" />
                    AI Transcription
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'TOGGLE_TRANSCRIPTION' })}
                    aria-label={state.showTranscription ? "Hide transcription" : "Show transcription"}
                    aria-pressed={state.showTranscription}
                  >
                    {state.showTranscription ? (
                      <EyeOff className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3 w-3" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {state.showTranscription && (
                <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                  {state.transcription.length === 0 && (
                    <p className="text-sm text-gray-500 text-center p-4">
                      No transcription available yet
                    </p>
                  )}
                  {state.transcription.map(segment => (
                    <div
                      key={segment.id}
                      className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                        state.currentTime >= segment.startTime && state.currentTime <= segment.endTime
                          ? 'bg-purple-100 border-purple-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => jumpToTimestamp(segment.startTime)}
                      role="button"
                      aria-label={`Jump to ${formatTime(segment.startTime)}: ${segment.text}`}
                      tabIndex={0}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                        <div className="flex items-center gap-1">
                          {segment.sentiment && (
                            <span aria-label={`Sentiment: ${segment.sentiment}`}>
                              {renderSentimentIcon(segment.sentiment)}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {Math.round(segment.confidence * 100)}%
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-700">{segment.text}</p>
                      {segment.keywords.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {segment.keywords.slice(0, 3).map(keyword => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
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

            {/* Chapters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" aria-hidden="true" />
                  AI Chapters ({state.chapters.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                {state.chapters.length === 0 && (
                  <p className="text-sm text-gray-500 text-center p-4">
                    No chapters available yet
                  </p>
                )}
                {state.chapters.map(chapter => (
                  <div
                    key={chapter.id}
                    className={`p-2 rounded text-sm cursor-pointer transition-colors ${
                      state.currentTime >= chapter.startTime && state.currentTime <= chapter.endTime
                        ? 'bg-blue-100 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => jumpToTimestamp(chapter.startTime)}
                    role="button"
                    aria-label={`Jump to chapter: ${chapter.title} at ${formatTime(chapter.startTime)}`}
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{chapter.title}</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(chapter.startTime)} - {formatTime(chapter.endTime)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{chapter.summary}</p>
                    {chapter.keyTopics.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {chapter.keyTopics.slice(0, 2).map(topic => (
                          <Badge key={topic} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Annotations Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Annotations ({state.annotations.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-48 overflow-y-auto">
                {state.annotations.length === 0 && (
                  <p className="text-sm text-gray-500 text-center p-4">
                    No annotations added yet
                  </p>
                )}
                {state.annotations.map(annotation => (
                  <div
                    key={annotation.id}
                    className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => jumpToTimestamp(annotation.timestamp)}
                    role="button"
                    aria-label={`Jump to annotation at ${formatTime(annotation.timestamp)}: ${annotation.content}`}
                    tabIndex={0}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={annotation.type === 'hotspot' ? 'default' : 'outline'} className="text-xs">
                        {annotation.type}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" aria-hidden="true" />
                        {formatTime(annotation.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{annotation.content}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      by {annotation.userName}
                    </div>
                    {annotation.responses.length > 0 && (
                      <Badge variant="outline" className="text-xs mt-1">
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
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" aria-hidden="true" />
                    Video Analytics
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dispatch({ type: 'TOGGLE_ANALYTICS' })}
                    aria-label={state.showAnalytics ? "Hide analytics" : "Show analytics"}
                    aria-pressed={state.showAnalytics}
                  >
                    {state.showAnalytics ? (
                      <EyeOff className="h-3 w-3" aria-hidden="true" />
                    ) : (
                      <Eye className="h-3 w-3" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              {state.showAnalytics && (
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">{state.analytics.totalViews}</div>
                      <div className="text-xs text-blue-700">Total Views</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">{state.analytics.uniqueViewers}</div>
                      <div className="text-xs text-green-700">Unique Viewers</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded">
                      <div className="text-lg font-bold text-purple-600">{state.analytics.completionRate}%</div>
                      <div className="text-xs text-purple-700">Completion Rate</div>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded">
                      <div className="text-lg font-bold text-orange-600">{state.analytics.engagementScore}</div>
                      <div className="text-xs text-orange-700">Engagement Score</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium mb-2">Top Moments</h4>
                    {state.analytics.topMoments.map((moment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-
