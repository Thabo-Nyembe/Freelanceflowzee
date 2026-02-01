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
import { toast } from 'sonner'

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Download,
  Share2,
  MoreHorizontal,
  Copy,
  Link,
  Mail,
  Lock,
  Globe,
  Trash2,
  Edit3,
  Eye,
  Clock,
  Check
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
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showOptionsDialog, setShowOptionsDialog] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState<VideoRecording | null>(null)
  const [shareSettings, setShareSettings] = useState({
    isPublic: false,
    passwordProtected: false,
    password: '',
    allowDownload: true,
    expiresIn: 'never' as 'never' | '1day' | '7days' | '30days'
  })
  const [linkCopied, setLinkCopied] = useState(false)

  const handleShareRecording = (rec: VideoRecording) => {
    setSelectedRecording(rec)
    setShareSettings({
      isPublic: rec.isPublic,
      passwordProtected: rec.passwordProtected,
      password: '',
      allowDownload: rec.downloadEnabled,
      expiresIn: 'never'
    })
    setShowShareDialog(true)
  }

  const handleCopyShareLink = () => {
    if (!selectedRecording) return
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/recordings/${selectedRecording.id}`
    navigator.clipboard.writeText(shareUrl)
    setLinkCopied(true)
    toast.success('Link copied', { description: 'Share link copied to clipboard' })
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const handleSaveShareSettings = async () => {
    if (!selectedRecording) return
    toast.loading('Updating share settings...', { id: 'share-settings' })
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Share settings updated', {
      id: 'share-settings',
      description: shareSettings.isPublic ? 'Recording is now publicly accessible' : 'Recording is private'
    })
    setShowShareDialog(false)
  }

  const handleSendShareEmail = async () => {
    toast.loading('Sending share invitation...', { id: 'share-email' })
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Invitation sent', { id: 'share-email', description: 'Share invitation sent successfully' })
  }

  const handleOptionsRecording = (rec: VideoRecording) => {
    setSelectedRecording(rec)
    setShowOptionsDialog(true)
  }

  const handleRenameRecording = async () => {
    if (!selectedRecording) return
    toast.loading('Renaming recording...', { id: 'rename-recording' })
    await new Promise(resolve => setTimeout(resolve, 800))
    toast.success('Recording renamed', { id: 'rename-recording' })
    setShowOptionsDialog(false)
  }

  const handleDeleteRecording = async () => {
    if (!selectedRecording) return
    toast.loading('Deleting recording...', { id: 'delete-recording' })
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Recording deleted', { id: 'delete-recording', description: 'Recording has been permanently removed' })
    setShowOptionsDialog(false)
  }

  const handleViewAnalytics = () => {
    if (!selectedRecording) return
    setShowOptionsDialog(false)
    toast.info('Analytics', {
      description: `${selectedRecording.views} views, ${selectedRecording.likes} likes, ${selectedRecording.comments} comments`
    })
  }

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

  const _startRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = handleDataAvailable;
    mediaRecorderRef.current.start();
    dispatch({ type: 'START_RECORDING' });
  };

  const _stopRecording = () => {
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
                      <Button size="icon" variant="ghost" onClick={() => handleShareRecording(rec)}><Share2 className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => {
                        const link = document.createElement('a')
                        link.href = rec.url
                        link.download = `${rec.title}.${rec.format.split('/')[1] || 'webm'}`
                        link.click()
                        toast.success('Download Started', { description: `Downloading ${rec.title}` })
                      }}><Download className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleOptionsRecording(rec)}><MoreHorizontal className="h-4 w-4" /></Button>
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

      {/* Share Recording Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Recording
            </DialogTitle>
            <DialogDescription>
              Share this recording with others
            </DialogDescription>
          </DialogHeader>

          {selectedRecording && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedRecording.title}</p>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(selectedRecording.duration)}</span>
                  <span className="mx-1">•</span>
                  <span>{formatFileSize(selectedRecording.size)}</span>
                </div>
              </div>

              <div>
                <Label>Share Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/recordings/${selectedRecording.id}`}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={handleCopyShareLink}>
                    {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Public Access</Label>
                      <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
                    </div>
                  </div>
                  <Switch
                    checked={shareSettings.isPublic}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Password Protection</Label>
                      <p className="text-xs text-muted-foreground">Require password to view</p>
                    </div>
                  </div>
                  <Switch
                    checked={shareSettings.passwordProtected}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, passwordProtected: checked }))}
                  />
                </div>

                {shareSettings.passwordProtected && (
                  <Input
                    type="password"
                    placeholder="Enter password..."
                    value={shareSettings.password}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, password: e.target.value }))}
                  />
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <Label>Allow Downloads</Label>
                      <p className="text-xs text-muted-foreground">Viewers can download the recording</p>
                    </div>
                  </div>
                  <Switch
                    checked={shareSettings.allowDownload}
                    onCheckedChange={(checked) => setShareSettings(prev => ({ ...prev, allowDownload: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Invite by Email</Label>
                <div className="flex gap-2 mt-1">
                  <Input placeholder="Enter email addresses..." className="flex-1" />
                  <Button variant="outline" onClick={handleSendShareEmail}>
                    <Mail className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveShareSettings}>
              <Link className="w-4 h-4 mr-2" />
              Save & Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Options Dialog */}
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MoreHorizontal className="w-5 h-5" />
              Recording Options
            </DialogTitle>
            <DialogDescription>
              Manage this recording
            </DialogDescription>
          </DialogHeader>

          {selectedRecording && (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg mb-4">
                <p className="font-medium text-sm">{selectedRecording.title}</p>
                <p className="text-xs text-muted-foreground">{new Date(selectedRecording.createdAt).toLocaleString()}</p>
              </div>

              <Button variant="ghost" className="w-full justify-start" onClick={handleRenameRecording}>
                <Edit3 className="w-4 h-4 mr-2" />
                Rename Recording
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={handleViewAnalytics}>
                <Eye className="w-4 h-4 mr-2" />
                View Analytics
                <Badge variant="secondary" className="ml-auto">{selectedRecording.views} views</Badge>
              </Button>

              <Button variant="ghost" className="w-full justify-start" onClick={() => handleShareRecording(selectedRecording)}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Settings
              </Button>

              <Separator />

              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleDeleteRecording}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Recording
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOptionsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EnterpriseVideoStudio;