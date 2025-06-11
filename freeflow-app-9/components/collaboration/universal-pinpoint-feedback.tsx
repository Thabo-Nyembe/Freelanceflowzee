'use client'

import React, { useState, useRef, useReducer, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Pin, 
  MapPin,
  Mic,
  MicOff,
  Play,
  Pause,
  Video,
  Image as ImageIcon,
  FileText,
  Code,
  Send,
  X,
  ChevronDown,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Sparkles,
  Volume2,
  Download,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Heart,
  ThumbsUp,
  MessageSquare,
  Zap,
  Target,
  Grid,
  List,
  Settings
} from 'lucide-react'
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer'
import '@cyntler/react-doc-viewer/dist/index.css'

// Types for Universal Comment System
interface UPFComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc' | 'text'
  position?: {
    x?: number
    y?: number
    timestamp?: number
    line?: number
    startChar?: number
    endChar?: number
  }
  status: 'open' | 'resolved' | 'in_progress'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt?: string
  replies: UPFComment[]
  reactions: UPFReaction[]
  mentions: string[]
  voiceNote?: {
    url: string
    duration: number
    waveform: number[]
  }
  aiSuggestion?: {
    summary: string
    category: string
    severity: 'info' | 'warning' | 'error'
  }
  attachments?: UPFAttachment[]
}

interface UPFReaction {
  userId: string
  type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'thumbs_up' | 'thumbs_down'
  createdAt: string
}

interface UPFAttachment {
  id: string
  name: string
  url: string
  type: string
  size: number
}

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'pdf' | 'code' | 'audio' | 'doc'
  url: string
  thumbnail?: string
  metadata?: {
    duration?: number
    dimensions?: { width: number; height: number }
    pageCount?: number
    language?: string
  }
}

// Context7 Pattern: Advanced State Management
interface UPFState {
  activeFile: MediaFile | null
  comments: UPFComment[]
  filteredComments: UPFComment[]
  isRecording: boolean
  recordingDuration: number
  selectedPosition: UPFComment['position'] | null
  isAddingComment: boolean
  commentContent: string
  commentType: UPFComment['type']
  commentPriority: UPFComment['priority']
  voiceBlob: Blob | null
  isPlayingAudio: { [key: string]: boolean }
  viewMode: 'grid' | 'overlay' | 'timeline'
  filterBy: 'all' | 'open' | 'resolved' | 'priority'
  searchQuery: string
  showAISuggestions: boolean
  isProcessingAI: boolean
  clientMode: boolean
}

type UPFAction =
  | { type: 'SET_ACTIVE_FILE'; file: MediaFile | null }
  | { type: 'ADD_COMMENT'; comment: UPFComment }
  | { type: 'UPDATE_COMMENT'; id: string; updates: Partial<UPFComment> }
  | { type: 'DELETE_COMMENT'; id: string }
  | { type: 'SET_SELECTED_POSITION'; position: UPFComment['position'] | null }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING'; blob: Blob; duration: number }
  | { type: 'SET_COMMENT_CONTENT'; content: string }
  | { type: 'SET_COMMENT_TYPE'; commentType: UPFComment['type'] }
  | { type: 'SET_COMMENT_PRIORITY'; priority: UPFComment['priority'] }
  | { type: 'TOGGLE_ADDING_COMMENT' }
  | { type: 'SET_VIEW_MODE'; mode: UPFState['viewMode'] }
  | { type: 'SET_FILTER'; filter: UPFState['filterBy'] }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'TOGGLE_AI_SUGGESTIONS' }
  | { type: 'SET_AI_PROCESSING'; processing: boolean }
  | { type: 'TOGGLE_AUDIO_PLAYBACK'; commentId: string }
  | { type: 'ADD_REACTION'; commentId: string; reaction: UPFReaction }
  | { type: 'FILTER_COMMENTS' }

function upfReducer(state: UPFState, action: UPFAction): UPFState {
  switch (action.type) {
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFile: action.file, selectedPosition: null }
    
    case 'ADD_COMMENT':
      const newComments = [...state.comments, action.comment]
      return { 
        ...state, 
        comments: newComments,
        filteredComments: filterComments(newComments, state.filterBy, state.searchQuery),
        commentContent: '',
        selectedPosition: null,
        isAddingComment: false,
        voiceBlob: null
      }
    
    case 'UPDATE_COMMENT':
      const updatedComments = state.comments.map(c => 
        c.id === action.id ? { ...c, ...action.updates } : c
      )
      return { 
        ...state, 
        comments: updatedComments,
        filteredComments: filterComments(updatedComments, state.filterBy, state.searchQuery)
      }
    
    case 'SET_SELECTED_POSITION':
      return { ...state, selectedPosition: action.position }
    
    case 'START_RECORDING':
      return { ...state, isRecording: true, recordingDuration: 0 }
    
    case 'STOP_RECORDING':
      return { 
        ...state, 
        isRecording: false, 
        voiceBlob: action.blob,
        recordingDuration: action.duration
      }
    
    case 'SET_COMMENT_CONTENT':
      return { ...state, commentContent: action.content }
    
    case 'SET_COMMENT_TYPE':
      return { ...state, commentType: action.commentType }
    
    case 'SET_COMMENT_PRIORITY':
      return { ...state, commentPriority: action.priority }
    
    case 'TOGGLE_ADDING_COMMENT':
      return { ...state, isAddingComment: !state.isAddingComment }
    
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.mode }
    
    case 'SET_FILTER':
      const filtered = filterComments(state.comments, action.filter, state.searchQuery)
      return { ...state, filterBy: action.filter, filteredComments: filtered }
    
    case 'SET_SEARCH_QUERY':
      const searchFiltered = filterComments(state.comments, state.filterBy, action.query)
      return { ...state, searchQuery: action.query, filteredComments: searchFiltered }
    
    case 'TOGGLE_AI_SUGGESTIONS':
      return { ...state, showAISuggestions: !state.showAISuggestions }
    
    case 'SET_AI_PROCESSING':
      return { ...state, isProcessingAI: action.processing }
    
    case 'TOGGLE_AUDIO_PLAYBACK':
      return { 
        ...state, 
        isPlayingAudio: { 
          ...state.isPlayingAudio, 
          [action.commentId]: !state.isPlayingAudio[action.commentId] 
        }
      }
    
    case 'ADD_REACTION':
      const reactedComments = state.comments.map(c => 
        c.id === action.commentId 
          ? { 
              ...c, 
              reactions: c.reactions.filter(r => r.userId !== action.reaction.userId).concat(action.reaction)
            }
          : c
      )
      return { 
        ...state, 
        comments: reactedComments,
        filteredComments: filterComments(reactedComments, state.filterBy, state.searchQuery)
      }
    
    case 'FILTER_COMMENTS':
      return { 
        ...state, 
        filteredComments: filterComments(state.comments, state.filterBy, state.searchQuery)
      }
    
    default:
      return state
  }
}

// Helper function to filter comments
function filterComments(comments: UPFComment[], filter: string, search: string): UPFComment[] {
  let filtered = comments

  // Apply status filter
  if (filter !== 'all') {
    if (filter === 'priority') {
      filtered = filtered.filter(c => c.priority === 'high' || c.priority === 'urgent')
    } else {
      filtered = filtered.filter(c => c.status === filter)
    }
  }

  // Apply search filter
  if (search.trim()) {
    filtered = filtered.filter(c => 
      c.content.toLowerCase().includes(search.toLowerCase()) ||
      c.userName.toLowerCase().includes(search.toLowerCase())
    )
  }

  return filtered
}

interface UniversalPinpointFeedbackProps {
  projectId: string
  files: MediaFile[]
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer'
  }
  onCommentAdd?: (comment: UPFComment) => void
  onCommentUpdate?: (commentId: string, updates: Partial<UPFComment>) => void
  className?: string
}

export function UniversalPinpointFeedback({
  projectId,
  files,
  currentUser,
  onCommentAdd,
  onCommentUpdate,
  className = ''
}: UniversalPinpointFeedbackProps) {
  // Initialize state with Context7 reducer pattern
  const [state, dispatch] = useReducer(upfReducer, {
    activeFile: files[0] || null,
    comments: [],
    filteredComments: [],
    isRecording: false,
    recordingDuration: 0,
    selectedPosition: null,
    isAddingComment: false,
    commentContent: '',
    commentType: 'text',
    commentPriority: 'medium',
    voiceBlob: null,
    isPlayingAudio: {},
    viewMode: 'overlay',
    filterBy: 'all',
    searchQuery: '',
    showAISuggestions: true,
    isProcessingAI: false,
    clientMode: currentUser.role === 'client'
  })

  // Refs for media elements
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const recordingTimer = useRef<NodeJS.Timeout | null>(null)

  // Initialize with sample data for demo
  useEffect(() => {
    const sampleComments: UPFComment[] = [
      {
        id: 'comment_1',
        userId: 'user_2',
        userName: 'Sarah Johnson',
        userAvatar: '/avatars/sarah.jpg',
        content: 'Love this transition! Can we make it 0.2s slower for better impact?',
        type: 'video',
        position: { timestamp: 23.5 },
        status: 'open',
        priority: 'medium',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        replies: [],
        reactions: [
          { userId: 'user_1', type: 'thumbs_up', createdAt: new Date().toISOString() }
        ],
        mentions: ['user_1'],
        aiSuggestion: {
          summary: 'Timing adjustment suggestion for smoother user experience',
          category: 'UX Enhancement',
          severity: 'info'
        }
      },
      {
        id: 'comment_2',
        userId: 'user_3',
        userName: 'Mike Developer',
        content: 'The header positioning needs adjustment on mobile devices',
        type: 'image',
        position: { x: 15, y: 25 },
        status: 'open',
        priority: 'high',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        replies: [],
        reactions: [],
        mentions: [],
        aiSuggestion: {
          summary: 'Responsive design issue requiring mobile optimization',
          category: 'Responsive Design',
          severity: 'warning'
        }
      }
    ]
    
    sampleComments.forEach(comment => {
      dispatch({ type: 'ADD_COMMENT', comment })
    })
  }, [])

  // Voice recording functions
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        dispatch({ type: 'STOP_RECORDING', blob, duration: state.recordingDuration })
      }

      mediaRecorder.current.start()
      dispatch({ type: 'START_RECORDING' })

      // Start timer
      let seconds = 0
      recordingTimer.current = setInterval(() => {
        seconds += 1
        dispatch({ type: 'STOP_RECORDING', blob: new Blob(), duration: seconds })
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorder.current && state.isRecording) {
      mediaRecorder.current.stop()
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop())
      
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current)
      }
    }
  }

  // AI-powered comment analysis
  const analyzeCommentWithAI = async (content: string): Promise<UPFComment['aiSuggestion']> => {
    dispatch({ type: 'SET_AI_PROCESSING', processing: true })
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const suggestions = [
      {
        summary: 'Design improvement suggestion with high impact potential',
        category: 'Design Enhancement',
        severity: 'info' as const
      },
      {
        summary: 'Critical accessibility issue requiring immediate attention',
        category: 'Accessibility',
        severity: 'error' as const
      },
      {
        summary: 'Performance optimization opportunity identified',
        category: 'Performance',
        severity: 'warning' as const
      }
    ]
    
    dispatch({ type: 'SET_AI_PROCESSING', processing: false })
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  // Media interaction handlers
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!state.isAddingComment) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    dispatch({ 
      type: 'SET_SELECTED_POSITION', 
      position: { x, y }
    })
    dispatch({ type: 'SET_COMMENT_TYPE', commentType: 'image' })
  }

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!state.isAddingComment || !videoRef.current) return
    
    const timestamp = videoRef.current.currentTime
    dispatch({ 
      type: 'SET_SELECTED_POSITION', 
      position: { timestamp }
    })
    dispatch({ type: 'SET_COMMENT_TYPE', commentType: 'video' })
  }

  // Comment submission
  const submitComment = async () => {
    if (!state.commentContent.trim() && !state.voiceBlob) return

    const newComment: UPFComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: state.commentContent,
      type: state.commentType,
      position: state.selectedPosition,
      status: 'open',
      priority: state.commentPriority,
      createdAt: new Date().toISOString(),
      replies: [],
      reactions: [],
      mentions: extractMentions(state.commentContent),
      voiceNote: state.voiceBlob ? {
        url: URL.createObjectURL(state.voiceBlob),
        duration: state.recordingDuration,
        waveform: generateWaveform()
      } : undefined
    }

    // Add AI analysis if enabled
    if (state.showAISuggestions && state.commentContent.trim()) {
      newComment.aiSuggestion = await analyzeCommentWithAI(state.commentContent)
    }

    dispatch({ type: 'ADD_COMMENT', comment: newComment })
    onCommentAdd?.(newComment)
  }

  // Helper functions
  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@(\w+)/g)
    return mentions ? mentions.map(m => m.substring(1)) : []
  }

  const generateWaveform = (): number[] => {
    return Array.from({ length: 50 }, () => Math.random() * 100)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPriorityColor = (priority: UPFComment['priority']) => {
    const colors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[priority]
  }

  const getStatusColor = (status: UPFComment['status']) => {
    const colors = {
      open: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800'
    }
    return colors[status]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-600" />
            Universal Pinpoint Feedback
          </h2>
          <p className="text-gray-600">AI-powered collaboration across all media types</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => dispatch({ type: 'TOGGLE_AI_SUGGESTIONS' })}
            variant={state.showAISuggestions ? "default" : "outline"}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Insights
          </Button>
          
          <div className="flex border border-gray-200 rounded-lg">
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'overlay' })}
              variant={state.viewMode === 'overlay' ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'timeline' })}
              variant={state.viewMode === 'timeline' ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
            >
              <Clock className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: 'grid' })}
              variant={state.viewMode === 'grid' ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media Viewer */}
        <div className="lg:col-span-2 space-y-4">
          {/* File Selector */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {files.map((file) => (
                  <Button
                    key={file.id}
                    onClick={() => dispatch({ type: 'SET_ACTIVE_FILE', file })}
                    variant={state.activeFile?.id === file.id ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col items-center gap-2"
                  >
                    {file.type === 'video' && <Video className="h-6 w-6" />}
                    {file.type === 'image' && <ImageIcon className="h-6 w-6" />}
                    {file.type === 'pdf' && <FileText className="h-6 w-6" />}
                    {file.type === 'code' && <Code className="h-6 w-6" />}
                    <span className="text-xs text-center">{file.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Media Display */}
          {state.activeFile && (
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">{state.activeFile.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => dispatch({ type: 'TOGGLE_ADDING_COMMENT' })}
                      variant={state.isAddingComment ? "default" : "outline"}
                      size="sm"
                      className={state.isAddingComment ? "bg-purple-600" : "border-purple-200 text-purple-600"}
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      {state.isAddingComment ? 'Click to Pin' : 'Add Comment'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="relative">
                  {/* Video Player */}
                  {state.activeFile.type === 'video' && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={state.activeFile.url}
                        className="w-full rounded-lg cursor-pointer"
                        controls
                        onClick={handleVideoClick}
                      />
                      
                      {/* Video Timestamp Comments */}
                      {state.viewMode === 'overlay' && state.filteredComments
                        .filter(c => c.type === 'video' && c.position?.timestamp !== undefined)
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className="absolute bottom-16 bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors transform -translate-x-1/2"
                            style={{
                              left: `${((comment.position?.timestamp || 0) / (state.activeFile?.metadata?.duration || 1)) * 100}%`
                            }}
                            title={comment.content}
                          >
                            <Clock className="h-4 w-4" />
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Image Viewer */}
                  {state.activeFile.type === 'image' && (
                    <div className="relative">
                      <img
                        src={state.activeFile.url}
                        alt={state.activeFile.name}
                        className="w-full rounded-lg cursor-pointer"
                        onClick={handleImageClick}
                      />
                      
                      {/* Image Position Comments */}
                      {state.viewMode === 'overlay' && state.filteredComments
                        .filter(c => c.type === 'image' && c.position?.x !== undefined)
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className="absolute bg-purple-500 text-white p-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors transform -translate-x-1/2 -translate-y-1/2"
                            style={{
                              left: `${comment.position?.x}%`,
                              top: `${comment.position?.y}%`
                            }}
                            title={comment.content}
                          >
                            <MapPin className="h-4 w-4" />
                          </div>
                        ))}

                      {/* Selected Position Indicator */}
                      {state.selectedPosition?.x !== undefined && (
                        <div
                          className="absolute bg-yellow-400 text-black p-2 rounded-lg transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
                          style={{
                            left: `${state.selectedPosition.x}%`,
                            top: `${state.selectedPosition.y}%`
                          }}
                        >
                          <MapPin className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Document Viewer */}
                  {state.activeFile.type === 'pdf' && (
                    <div className="w-full h-96">
                      <DocViewer
                        documents={[{ uri: state.activeFile.url, fileName: state.activeFile.name }]}
                        pluginRenderers={DocViewerRenderers}
                        style={{ height: '100%' }}
                      />
                    </div>
                  )}
                </div>

                {/* Comment Input */}
                {state.isAddingComment && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-purple-800">Add Your Feedback</h4>
                      {state.selectedPosition && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-700">
                          Position: {state.selectedPosition.x?.toFixed(1)}%, {state.selectedPosition.y?.toFixed(1)}%
                          {state.selectedPosition.timestamp && ` | Time: ${formatTime(state.selectedPosition.timestamp)}`}
                        </Badge>
                      )}
                    </div>

                    <Textarea
                      value={state.commentContent}
                      onChange={(e) => dispatch({ type: 'SET_COMMENT_CONTENT', content: e.target.value })}
                      placeholder="Share your feedback..."
                      className="bg-white"
                    />

                    <div className="flex items-center gap-3">
                      <select 
                        value={state.commentPriority}
                        onChange={(e) => dispatch({ type: 'SET_COMMENT_PRIORITY', priority: e.target.value as UPFComment['priority'] })}
                        className="px-3 py-1 border border-purple-200 rounded-md text-sm"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="urgent">Urgent</option>
                      </select>

                      <Button
                        onClick={state.isRecording ? stopVoiceRecording : startVoiceRecording}
                        variant={state.isRecording ? "destructive" : "outline"}
                        size="sm"
                        className="min-w-[100px]"
                      >
                        {state.isRecording ? (
                          <>
                            <MicOff className="h-4 w-4 mr-2" />
                            Stop ({state.recordingDuration}s)
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Voice Note
                          </>
                        )}
                      </Button>

                      {state.voiceBlob && (
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          <Volume2 className="h-3 w-3 mr-1" />
                          {state.recordingDuration}s recorded
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {state.showAISuggestions && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI Analysis Enabled
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            dispatch({ type: 'TOGGLE_ADDING_COMMENT' })
                            dispatch({ type: 'SET_SELECTED_POSITION', position: null })
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitComment}
                          disabled={!state.commentContent.trim() && !state.voiceBlob}
                          className="bg-purple-600 hover:bg-purple-700"
                          size="sm"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Comments Panel */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-4 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
                  placeholder="Search comments..."
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'open', 'resolved', 'priority'].map((filter) => (
                  <Button
                    key={filter}
                    onClick={() => dispatch({ type: 'SET_FILTER', filter: filter as UPFState['filterBy'] })}
                    variant={state.filterBy === filter ? "default" : "outline"}
                    size="sm"
                    className="capitalize"
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Feedback ({state.filteredComments.length})
                </span>
                <Badge variant="outline" className="bg-purple-100 text-purple-700">
                  {state.filteredComments.filter(c => c.status === 'open').length} Open
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {state.filteredComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userAvatar} />
                        <AvatarFallback className="text-xs">{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">{comment.userName}</span>
                          <Badge className={getPriorityColor(comment.priority)} variant="outline">
                            {comment.priority}
                          </Badge>
                          <Badge className={getStatusColor(comment.status)} variant="outline">
                            {comment.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                        
                        {comment.position && (
                          <div className="text-xs text-purple-600 mb-2">
                            {comment.type === 'video' && comment.position.timestamp !== undefined && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Time: {formatTime(comment.position.timestamp)}
                              </span>
                            )}
                            {comment.type === 'image' && comment.position.x !== undefined && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Position: {comment.position.x.toFixed(1)}%, {comment.position.y?.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}

                        {comment.voiceNote && (
                          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                            <Button
                              onClick={() => dispatch({ type: 'TOGGLE_AUDIO_PLAYBACK', commentId: comment.id })}
                              size="sm"
                              variant="ghost"
                            >
                              {state.isPlayingAudio[comment.id] ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1 h-8 bg-blue-100 rounded flex items-center px-2">
                              <div className="flex gap-1">
                                {comment.voiceNote.waveform.slice(0, 20).map((height, i) => (
                                  <div
                                    key={i}
                                    className="w-1 bg-blue-500 rounded"
                                    style={{ height: `${height/5}px` }}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-blue-600">{comment.voiceNote.duration}s</span>
                          </div>
                        )}

                        {comment.aiSuggestion && state.showAISuggestions && (
                          <div className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded border-l-4 border-purple-400">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-purple-800">AI Insight</span>
                              <Badge 
                                variant="outline" 
                                className={
                                  comment.aiSuggestion.severity === 'error' ? 'bg-red-100 text-red-700' :
                                  comment.aiSuggestion.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-blue-100 text-blue-700'
                                }
                              >
                                {comment.aiSuggestion.category}
                              </Badge>
                            </div>
                            <p className="text-xs text-purple-700">{comment.aiSuggestion.summary}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              {['thumbs_up', 'heart', 'laugh'].map((reactionType) => {
                                const count = comment.reactions.filter(r => r.type === reactionType).length
                                return count > 0 ? (
                                  <Button
                                    key={reactionType}
                                    onClick={() => dispatch({
                                      type: 'ADD_REACTION',
                                      commentId: comment.id,
                                      reaction: {
                                        userId: currentUser.id,
                                        type: reactionType as UPFReaction['type'],
                                        createdAt: new Date().toISOString()
                                      }
                                    })}
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                  >
                                    {reactionType === 'thumbs_up' && <ThumbsUp className="h-3 w-3" />}
                                    {reactionType === 'heart' && <Heart className="h-3 w-3" />}
                                    {reactionType === 'laugh' && '😂'}
                                    <span className="ml-1">{count}</span>
                                  </Button>
                                ) : null
                              })}
                            </div>
                            
                            <Button
                              onClick={() => dispatch({
                                type: 'ADD_REACTION',
                                commentId: comment.id,
                                reaction: {
                                  userId: currentUser.id,
                                  type: 'thumbs_up',
                                  createdAt: new Date().toISOString()
                                }
                              })}
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs"
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Reply
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {currentUser.role === 'freelancer' && (
                              <Button
                                onClick={() => dispatch({
                                  type: 'UPDATE_COMMENT',
                                  id: comment.id,
                                  updates: { 
                                    status: comment.status === 'resolved' ? 'open' : 'resolved',
                                    updatedAt: new Date().toISOString()
                                  }
                                })}
                                size="sm"
                                variant={comment.status === 'resolved' ? "default" : "outline"}
                                className="h-6 px-2 text-xs"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {comment.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                              </Button>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {state.filteredComments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No comments found</p>
                  <p className="text-sm">Start by adding feedback to your media files</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Summary Panel */}
          {state.showAISuggestions && state.filteredComments.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {state.filteredComments.filter(c => c.priority === 'high' || c.priority === 'urgent').length}
                    </div>
                    <div className="text-xs text-purple-700">High Priority</div>
                  </div>
                  <div className="text-center p-3 bg-white/60 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {state.filteredComments.filter(c => c.aiSuggestion?.category === 'UX Enhancement').length}
                    </div>
                    <div className="text-xs text-blue-700">UX Issues</div>
                  </div>
                </div>
                
                <div className="p-3 bg-white/60 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Key Themes:</strong> Design improvements, responsive issues, and timing adjustments are the main focus areas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 