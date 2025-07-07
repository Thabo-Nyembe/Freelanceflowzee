/* eslint-disable @typescript-eslint/consistent-type-imports */
"use client"

/* ------------------------------------------------------------------
 * React / hooks
 * ------------------------------------------------------------------ */
import React, {
  useState,
  useReducer,
  useRef,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Download,
  Share2,
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
const videoStudioReducer = (state: VideoStudioState, action: { type: string; [key: string]: unknown }): VideoStudioState => {
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
      return { ...state, recordingMode: action.mode as string }
    case "TOGGLE_AUDIO":
      return { ...state, audioEnabled: !state.audioEnabled }
    case "TOGGLE_VIDEO":
      return { ...state, videoEnabled: !state.videoEnabled }
    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.time as number }
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom as number }
    case "TOGGLE_PLAY":
      return { ...state, isPlaying: !state.isPlaying }
    case "ADD_RECORDING":
      return { ...state, recordings: [...state.recordings, action.recording as VideoRecording] }
    case "ADD_COMMENT":
      return { ...state, comments: [...state.comments, action.comment as VideoComment] }
    case "UPDATE_TRANSCRIPTION":
      return { ...state, transcription: action.transcription as TranscriptionSegment[] }
    case "UPDATE_AI_ANALYSIS":
      return { ...state, aiAnalysis: action.analysis as AIAnalysis }
    case "ADD_LIVE_VIEWER":
      return { ...state, liveViewers: [...state.liveViewers, action.viewer as LiveViewer] }
    case "REMOVE_LIVE_VIEWER":
      return { ...state, liveViewers: state.liveViewers.filter(v => v.id !== action.viewerId as string) }
    case "UPDATE_VIEWER_CURSOR":
      return {
        ...state,
        liveViewers: state.liveViewers.map(v =>
          v.id === action.viewerId as string ? { ...v, cursor: action.cursor as { x: number; y: number } } : v
        )
      }
    case "SET_QUALITY_SETTINGS":
      return { ...state, qualitySettings: { ...state.qualitySettings, ...action.settings as QualitySettings } }
    case "ADD_ANNOTATION":
      return { ...state, annotations: [...state.annotations, action.annotation as VideoAnnotation] }
    case "UPDATE_VIEWER_ANALYTICS":
      return { ...state, viewerAnalytics: { ...state.viewerAnalytics, ...action.analytics as ViewerAnalytics } }
    case "SET_VOLUME":
      return { ...state, volume: action.volume as number }
    default:
      return state
  }
}

const initialState: VideoStudioState = {
  isRecording: false,
  isPaused: false,
  recordingMode: 'desktop',
  audioEnabled: true,
  videoEnabled: true,
  currentTime: 0,
  duration: 0,
  zoom: 1,
  isPlaying: false,
  selectedClip: null,
  recordings: [],
  liveViewers: [],
  comments: [],
  transcription: [],
  aiAnalysis: {
    summary: '',
    keyTopics: [],
    sentiment: '',
    engagementScore: 0,
    suggestedTags: [],
    optimizationTips: [],
    accessibilityScore: 0,
    qualityScore: 0,
    contentType: '',
    difficulty: '',
    estimatedWatchTime: 0,
  },
  collaborators: [],
  isLiveSession: false,
  qualitySettings: {
    resolution: '1080p',
    frameRate: 30,
    bitrate: 5000,
    audioQuality: 'high',
    compression: 'h264',
  },
  annotations: [],
  chapters: [],
  isEditing: false,
  editingTool: null,
  exportProgress: 0,
  viewerAnalytics: {
    totalViews: 0,
    averageWatchTime: 0,
    engagementRate: 0,
    dropOffPoints: [],
    audienceRetention: [],
    peakViewers: 0,
    comments: 0,
    shares: 0,
    likes: 0,
  },
  volume: 80,
};

interface EnterpriseVideoStudioProps {
  className?: string
  onRecordingComplete?: (rec: VideoRecording) => void
}

export function EnterpriseVideoStudio({
  className = "",
  onRecordingComplete,
}: EnterpriseVideoStudioProps) {
  const [state, dispatch] = useReducer(videoStudioReducer, initialState)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [isClient, setIsClient] = useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])


  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      const newRecording: VideoRecording = {
        id: `rec-${Date.now()}`,
        title: `Recording ${new Date().toLocaleString()}`,
        duration: state.currentTime,
        size: event.data.size,
        format: event.data.type,
        quality: state.qualitySettings.resolution,
        thumbnail: '', // Placeholder
        createdAt: new Date().toISOString(),
        views: 0,
        comments: 0,
        likes: 0,
        shares: 0,
        url: URL.createObjectURL(event.data),
        transcriptUrl: '',
        aiSummary: '',
        tags: [],
        isPublic: false,
        downloadEnabled: true,
        passwordProtected: false,
      };
      dispatch({ type: 'ADD_RECORDING', recording: newRecording });
      if (onRecordingComplete) {
        onRecordingComplete(newRecording);
      }
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
    dispatch({ type: 'START_RECORDING' });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      dispatch({ type: 'STOP_RECORDING' });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-lg ${className}`}>
      {/* Main Video Player & Controls */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-t-lg relative">
              <video ref={videoRef} className="w-full h-full" />
              {/* Add canvas for annotations here */}
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button onClick={() => dispatch({ type: 'TOGGLE_PLAY' })} size="icon">
                    <Play className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{formatTime(state.currentTime)}</span>
                    <span className="text-sm text-gray-400">/</span>
                    <span className="text-sm font-mono">{formatTime(state.duration)}</span>
                  </div>
                </div>
                {/* Add more controls like volume, fullscreen, etc. here */}
              </div>
              <Progress value={state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0} className="mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with Tabs */}
      <div>
        <Tabs defaultValue="recordings">
          <TabsList>
            <TabsTrigger value="recordings">Recordings</TabsTrigger>
            <TabsTrigger value="live">Live</TabsTrigger>
            <TabsTrigger value="ai">AI Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="recordings">
            <div className="space-y-4">
              {state.recordings.map((rec) => (
                <Card key={rec.id}>
                  <CardHeader>
                    <CardTitle>{rec.title}</CardTitle>
                    <CardDescription>{new Date(rec.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{formatFileSize(rec.size)}</Badge>
                      <Badge variant="secondary">{formatTime(rec.duration)}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="ghost"><Share2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost"><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="live">
            {/* Live viewers content here */}
          </TabsContent>
          <TabsContent value="ai">
            {/* AI insights content here */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default EnterpriseVideoStudio;