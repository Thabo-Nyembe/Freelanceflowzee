'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, Pin, Play, Pause, Volume2, Mic, Send, X, 
  CheckCircle, AlertCircle, Clock, User, Eye, Filter, 
  Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut, 
  FileText, Code, Image as ImageIcon, Video, Headphones,
  MapPin, MessageCircle, Target, Settings, Grid, List,
  ChevronRight, ChevronLeft, MoreHorizontal, Trash2,
  Edit, Reply, Heart, ThumbsUp, Flag, Download, Share
} from 'lucide-react'

// 🔁 Core Principle: One Engine, Many Contexts
interface UPFComment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc'
  position: {
    // Spatial media (images, design files, PDFs)
    x?: number
    y?: number
    // Temporal media (video, audio)  
    timestamp?: number
    // Structured media (code, documents)
    line?: number
    character?: number
    // Document text selection
    textSelection?: {
      start: number
      end: number
      text: string
    }
    // Element identification
    elementId?: string
  }
  status: 'open' | 'resolved' | 'needs_revision' | 'approved'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: string
  updatedAt?: string
  resolvedAt?: string
  resolvedBy?: string
  replies: UPFComment[]
  mentions: string[]
  reactions: {
    userId: string
    type: 'like' | 'love' | 'approve' | 'reject'
    createdAt: string
  }[]
  metadata?: {
    voiceNote?: {
      url: string
      duration: number
      waveform: number[]
    }
    drawing?: {
      paths: string[]
      color: string
    }
    attachments?: {
      id: string
      name: string
      url: string
      type: string
    }[]
  }
}

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video' | 'code' | 'audio' | 'doc'
  url: string
  thumbnail?: string
  metadata: {
    // Images & Design Files
    dimensions?: { width: number; height: number }
    // Video & Audio
    duration?: number
    // Documents
    pageCount?: number
    // Code
    language?: string
    lines?: number
  }
  comments: UPFComment[]
  status: 'draft' | 'review' | 'approved' | 'changes_required'
}

interface UPFState {
  activeFile: MediaFile | null
  files: MediaFile[]
  comments: UPFComment[]
  filteredComments: UPFComment[]
  selectedComment: UPFComment | null
  isAddingComment: boolean
  newCommentContent: string
  newCommentPosition: UPFComment['position'] | null
  viewMode: 'overlay' | 'sidebar' | 'fullscreen'
  filterBy: 'all' | 'open' | 'resolved' | 'type' | 'priority' | 'user'
  filterValue: string
  showMiniMap: boolean
  zoom: number
  currentTimestamp: number
  isPlaying: boolean
  volume: number
  clientMode: boolean
  showResolved: boolean
}

// Mock data following the specification
const sampleFiles: MediaFile[] = [
  {
    id: 'img_1',
    name: 'Homepage_Mockup_v3.jpg',
    type: 'image',
    url: '/images/homepage-mockup.jpg',
    thumbnail: '/images/homepage-thumb.jpg',
    metadata: {
      dimensions: { width: 1920, height: 1080 }
    },
    status: 'review',
    comments: [
      {
        id: 'comment_1',
        userId: 'client_1',
        userName: 'Sarah Johnson',
        userAvatar: '/avatars/sarah.jpg',
        content: 'The hero section needs more contrast. Hard to read the text.',
        type: 'image',
        position: { x: 45, y: 25, elementId: 'hero_section' },
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T10:30:00Z',
        replies: [],
        mentions: ['designer_1'],
        reactions: []
      },
      {
        id: 'comment_2',
        userId: 'client_1',
        userName: 'Sarah Johnson',
        userAvatar: '/avatars/sarah.jpg',
        content: 'Love this color scheme! Looks very professional.',
        type: 'image',
        position: { x: 30, y: 60, elementId: 'color_palette' },
        status: 'approved',
        priority: 'medium',
        createdAt: '2024-01-15T11:00:00Z',
        replies: [
          {
            id: 'reply_1',
            userId: 'designer_1',
            userName: 'Alex Designer',
            userAvatar: '/avatars/alex.jpg',
            content: 'Thank you! I\'ll apply this color scheme across all pages.',
            type: 'image',
            position: { x: 30, y: 60 },
            status: 'open',
            priority: 'low',
            createdAt: '2024-01-15T11:15:00Z',
            replies: [],
            mentions: ['client_1'],
            reactions: []
          }
        ],
        mentions: [],
        reactions: [
          { userId: 'designer_1', type: 'like', createdAt: '2024-01-15T11:05:00Z' }
        ]
      }
    ]
  },
  {
    id: 'vid_1',
    name: 'Product_Demo_v2.mp4',
    type: 'video',
    url: '/videos/product-demo.mp4',
    thumbnail: '/images/video-thumb.jpg',
    metadata: {
      duration: 120, // 2 minutes
      dimensions: { width: 1920, height: 1080 }
    },
    status: 'review',
    comments: [
      {
        id: 'comment_3',
        userId: 'client_2',
        userName: 'Mike Chen',
        userAvatar: '/avatars/mike.jpg',
        content: 'The transition here feels too abrupt. Can we make it smoother?',
        type: 'video',
        position: { timestamp: 45.5 },
        status: 'open',
        priority: 'medium',
        createdAt: '2024-01-15T14:20:00Z',
        replies: [],
        mentions: ['animator_1'],
        reactions: []
      },
      {
        id: 'comment_4',
        userId: 'client_2',
        userName: 'Mike Chen',
        userAvatar: '/avatars/mike.jpg',
        content: 'Perfect ending! This captures our brand perfectly.',
        type: 'video',
        position: { timestamp: 115.2 },
        status: 'approved',
        priority: 'low',
        createdAt: '2024-01-15T14:25:00Z',
        replies: [],
        mentions: [],
        reactions: [
          { userId: 'animator_1', type: 'love', createdAt: '2024-01-15T14:30:00Z' }
        ]
      }
    ]
  },
  {
    id: 'code_1',
    name: 'PaymentComponent.tsx',
    type: 'code',
    url: '/code/payment-component.tsx',
    metadata: {
      language: 'typescript',
      lines: 156
    },
    status: 'review',
    comments: [
      {
        id: 'comment_5',
        userId: 'client_3',
        userName: 'Lisa Tech',
        userAvatar: '/avatars/lisa.jpg',
        content: 'Should we add error handling for failed payments here?',
        type: 'code',
        position: { line: 42, character: 12 },
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T16:00:00Z',
        replies: [],
        mentions: ['developer_1'],
        reactions: []
      }
    ]
  },
  {
    id: 'doc_1',
    name: 'Project_Proposal.pdf',
    type: 'doc',
    url: '/documents/project-proposal.pdf',
    metadata: {
      pageCount: 12
    },
    status: 'review',
    comments: [
      {
        id: 'comment_6',
        userId: 'client_1',
        userName: 'Sarah Johnson',
        userAvatar: '/avatars/sarah.jpg',
        content: 'The timeline in this section seems too aggressive.',
        type: 'doc',
        position: { 
          textSelection: { 
            start: 245, 
            end: 298, 
            text: 'Phase 2 completion within 2 weeks' 
          } 
        },
        status: 'open',
        priority: 'high',
        createdAt: '2024-01-15T17:30:00Z',
        replies: [],
        mentions: ['project_manager_1'],
        reactions: []
      }
    ]
  }
]

interface UniversalPinpointFeedbackProps {
  projectId: string
  files?: MediaFile[]
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer' | 'admin'
  }
  clientMode?: boolean
  onCommentAdd?: (comment: UPFComment) => void
  onCommentUpdate?: (commentId: string, updates: Partial<UPFComment>) => void
  onStatusChange?: (fileId: string, status: MediaFile['status']) => void
  className?: string
}

export function UniversalPinpointFeedbackSystem({
  projectId,
  files = sampleFiles,
  currentUser,
  clientMode = false,
  onCommentAdd,
  onCommentUpdate,
  onStatusChange,
  className = ''
}: UniversalPinpointFeedbackProps) {
  const [state, setState] = useState<UPFState>({
    activeFile: files[0] || null,
    files,
    comments: files[0]?.comments || [],
    filteredComments: files[0]?.comments || [],
    selectedComment: null,
    isAddingComment: false,
    newCommentContent: '',
    newCommentPosition: null,
    viewMode: 'overlay',
    filterBy: 'all',
    filterValue: '',
    showMiniMap: true,
    zoom: 1,
    currentTimestamp: 0,
    isPlaying: false,
    volume: 0.8,
    clientMode,
    showResolved: true
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // 🎯 Media-Type Specific Interactions

  // 🖼️ Images & Design Files - Pin Dropping
  const handleImageClick = useCallback((event: React.MouseEvent<HTMLImageElement>) => {
    if (!state.isAddingComment || !state.activeFile || state.activeFile.type !== 'image') return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100

    setState(prev => ({
      ...prev,
      newCommentPosition: { x, y },
      isAddingComment: true
    }))
  }, [state.isAddingComment, state.activeFile])

  // 🎬 Video & 🎧 Audio - Timestamp Comments
  const handleVideoTimeClick = useCallback((timestamp: number) => {
    if (!state.isAddingComment || !state.activeFile || state.activeFile.type !== 'video') return

    setState(prev => ({
      ...prev,
      newCommentPosition: { timestamp },
      currentTimestamp: timestamp,
      isAddingComment: true
    }))
  }, [state.isAddingComment, state.activeFile])

  // 💻 Code - Line Comments
  const handleCodeLineClick = useCallback((line: number, character: number = 0) => {
    if (!state.isAddingComment || !state.activeFile || state.activeFile.type !== 'code') return

    setState(prev => ({
      ...prev,
      newCommentPosition: { line, character },
      isAddingComment: true
    }))
  }, [state.isAddingComment, state.activeFile])

  // 🧾 Documents - Text Selection
  const handleTextSelection = useCallback(() => {
    if (!state.isAddingComment || !state.activeFile || state.activeFile.type !== 'doc') return

    const selection = window.getSelection()
    if (selection && selection.toString().length > 0) {
      const selectedText = selection.toString()
      setState(prev => ({
        ...prev,
        newCommentPosition: {
          textSelection: {
            start: selection.anchorOffset,
            end: selection.focusOffset,
            text: selectedText
          }
        },
        isAddingComment: true
      }))
    }
  }, [state.isAddingComment, state.activeFile])

  // Comment Management
  const addComment = useCallback(() => {
    if (!state.newCommentContent.trim() || !state.newCommentPosition || !state.activeFile) return

    const newComment: UPFComment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: state.newCommentContent,
      type: state.activeFile.type,
      position: state.newCommentPosition,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      replies: [],
      mentions: [],
      reactions: []
    }

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, newComment],
      filteredComments: [...prev.filteredComments, newComment],
      newCommentContent: '',
      newCommentPosition: null,
      isAddingComment: false
    }))

    onCommentAdd?.(newComment)
  }, [state.newCommentContent, state.newCommentPosition, state.activeFile, currentUser, onCommentAdd])

  // Filter comments
  const applyFilters = useCallback(() => {
    let filtered = state.comments

    switch (state.filterBy) {
      case 'open':
        filtered = filtered.filter(c => c.status === 'open')
        break
      case 'resolved':
        filtered = filtered.filter(c => c.status === 'resolved')
        break
      case 'type':
        filtered = filtered.filter(c => c.type === state.filterValue)
        break
      case 'priority':
        filtered = filtered.filter(c => c.priority === state.filterValue)
        break
      case 'user':
        filtered = filtered.filter(c => c.userName.toLowerCase().includes(state.filterValue.toLowerCase()))
        break
    }

    if (!state.showResolved) {
      filtered = filtered.filter(c => c.status !== 'resolved')
    }

    setState(prev => ({ ...prev, filteredComments: filtered }))
  }, [state.comments, state.filterBy, state.filterValue, state.showResolved])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // File switching
  const switchFile = useCallback((file: MediaFile) => {
    setState(prev => ({
      ...prev,
      activeFile: file,
      comments: file.comments,
      filteredComments: file.comments,
      selectedComment: null,
      isAddingComment: false,
      newCommentPosition: null,
      currentTimestamp: 0,
      isPlaying: false
    }))
  }, [])

  const getCommentIcon = (type: UPFComment['type']) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />
      case 'video': return <Video className="w-4 h-4" />
      case 'audio': return <Headphones className="w-4 h-4" />
      case 'code': return <Code className="w-4 h-4" />
      case 'doc': return <FileText className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: UPFComment['status']) => {
    switch (status) {
      case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'needs_revision': return 'bg-red-100 text-red-800 border-red-200'
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: UPFComment['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const jumpToComment = useCallback((comment: UPFComment) => {
    setState(prev => ({ ...prev, selectedComment: comment }))

    if (comment.type === 'video' && comment.position.timestamp !== undefined) {
      if (videoRef.current) {
        videoRef.current.currentTime = comment.position.timestamp
      }
    } else if (comment.type === 'audio' && comment.position.timestamp !== undefined) {
      if (audioRef.current) {
        audioRef.current.currentTime = comment.position.timestamp
      }
    }
  }, [])

  if (!state.activeFile) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No files available for feedback</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with File Selector */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">Universal Pinpoint Feedback</h2>
          <p className="text-slate-600">One engine, many contexts - unified feedback across all media types</p>
          
          {/* File Tabs */}
          <div className="flex gap-2 mt-4">
            {state.files.map((file) => (
              <Button
                key={file.id}
                variant={state.activeFile?.id === file.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => switchFile(file)}
                className="flex items-center gap-2"
              >
                {getCommentIcon(file.type)}
                <span className="max-w-32 truncate">{file.name}</span>
                {file.comments.filter(c => c.status === 'open').length > 0 && (
                  <Badge className="h-5 min-w-[20px] text-xs bg-red-500 text-white">
                    {file.comments.filter(c => c.status === 'open').length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Client Mode vs Creator Mode */}
          <Badge variant={state.clientMode ? 'default' : 'outline'}>
            {state.clientMode ? '👤 Client Mode' : '🛠️ Creator Mode'}
          </Badge>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState(prev => ({ ...prev, showMiniMap: !prev.showMiniMap }))}
          >
            <MapPin className="w-4 h-4" />
            Mini-map
          </Button>
          
          <Button
            variant={state.isAddingComment ? 'default' : 'outline'}
            size="sm"
            onClick={() => setState(prev => ({ ...prev, isAddingComment: !prev.isAddingComment }))}
          >
            <Pin className="w-4 h-4 mr-2" />
            Add Comment
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Media Viewer */}
        <div className="col-span-8">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6">
              {/* Status Bar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(state.activeFile.status === 'review' ? 'open' : 'resolved')}>
                    {state.activeFile.status}
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {state.comments.filter(c => c.status === 'open').length} open, {state.comments.filter(c => c.status === 'resolved').length} resolved
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {state.activeFile.type === 'image' && (
                    <>
                      <Button size="sm" variant="outline">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm px-2">{Math.round(state.zoom * 100)}%</span>
                      <Button size="sm" variant="outline">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Media-Specific Viewers */}
              <div className="relative">
                {/* 🖼️ Image Viewer */}
                {state.activeFile.type === 'image' && (
                  <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                    <img
                      ref={imageRef}
                      src={state.activeFile.url}
                      alt={state.activeFile.name}
                      className="w-full h-auto cursor-crosshair"
                      onClick={handleImageClick}
                      style={{ transform: `scale(${state.zoom})` }}
                    />
                    
                    {/* Pin Overlay */}
                    {state.comments.map((comment) => (
                      comment.position.x !== undefined && comment.position.y !== undefined && (
                        <div
                          key={comment.id}
                          className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                          style={{ 
                            left: `${comment.position.x}%`, 
                            top: `${comment.position.y}%`,
                            transform: `scale(${state.zoom}) translate(-50%, -50%)`
                          }}
                          onClick={() => jumpToComment(comment)}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-lg hover:scale-110 transition-transform ${
                            comment.status === 'resolved' ? 'bg-green-500' :
                            comment.status === 'approved' ? 'bg-blue-500' :
                            comment.status === 'needs_revision' ? 'bg-red-500' :
                            'bg-yellow-500'
                          }`}>
                            <Pin className="w-3 h-3" />
                          </div>
                          
                          {/* Priority Indicator */}
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityColor(comment.priority)}`}></div>
                          
                          {/* Hover Preview */}
                          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="font-medium">{comment.userName}</div>
                            <div className="max-w-48 truncate">{comment.content}</div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* 🎬 Video Viewer */}
                {state.activeFile.type === 'video' && (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
                      src={state.activeFile.url}
                      className="w-full rounded-lg"
                      controls
                      onTimeUpdate={(e) => setState(prev => ({ 
                        ...prev, 
                        currentTimestamp: (e.target as HTMLVideoElement).currentTime 
                      }))}
                    />
                    
                    {/* Timeline with Comment Markers */}
                    <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
                      <div className="absolute inset-0 flex items-center">
                        {state.comments.map((comment) => (
                          comment.position.timestamp !== undefined && (
                            <div
                              key={comment.id}
                              className="absolute w-2 h-6 cursor-pointer group"
                              style={{ 
                                left: `${(comment.position.timestamp / (state.activeFile?.metadata.duration || 120)) * 100}%` 
                              }}
                              onClick={() => jumpToComment(comment)}
                            >
                              <div className={`w-full h-full rounded-sm ${
                                comment.status === 'resolved' ? 'bg-green-500' :
                                comment.status === 'approved' ? 'bg-blue-500' :
                                comment.status === 'needs_revision' ? 'bg-red-500' :
                                'bg-yellow-500'
                              } hover:scale-x-150 transition-transform`}></div>
                              
                              {/* Timestamp Tooltip */}
                              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="font-medium">{comment.userName}</div>
                                <div className="text-xs">{Math.floor(comment.position.timestamp! / 60)}:{String(Math.floor(comment.position.timestamp! % 60)).padStart(2, '0')}</div>
                                <div className="max-w-48 truncate">{comment.content}</div>
                              </div>
                            </div>
                          )
                        ))}
                      </div>
                      
                      {/* Current Time Indicator */}
                      <div 
                        className="absolute w-0.5 h-full bg-red-500"
                        style={{ 
                          left: `${(state.currentTimestamp / (state.activeFile?.metadata.duration || 120)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    {/* Add Comment at Current Time */}
                    {state.isAddingComment && (
                      <Button
                        size="sm"
                        onClick={() => handleVideoTimeClick(state.currentTimestamp)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Pin className="w-4 h-4 mr-2" />
                        Add Comment at {Math.floor(state.currentTimestamp / 60)}:{String(Math.floor(state.currentTimestamp % 60)).padStart(2, '0')}
                      </Button>
                    )}
                  </div>
                )}

                {/* 💻 Code Viewer */}
                {state.activeFile.type === 'code' && (
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
                    {/* Mock Code with Line Numbers */}
                    {Array.from({ length: 50 }, (_, i) => i + 1).map((lineNumber) => (
                      <div
                        key={lineNumber}
                        className="flex hover:bg-slate-800 cursor-pointer"
                        onClick={() => handleCodeLineClick(lineNumber)}
                      >
                        <span className="w-12 text-slate-500 text-right pr-4 select-none">
                          {lineNumber}
                        </span>
                        <span className="text-slate-300 flex-1">
                          {lineNumber === 42 ? (
                            <span className="text-blue-400">
                              const handlePayment = async (amount: number) ={'>'} {'{'}
                            </span>
                          ) : lineNumber === 43 ? (
                            <span className="text-slate-300 pl-4">
                              // Payment processing logic here
                            </span>
                          ) : (
                            <span className="text-slate-400">
                              // Code line {lineNumber}
                            </span>
                          )}
                        </span>
                        
                        {/* Line Comments */}
                        {state.comments.map((comment) => (
                          comment.position.line === lineNumber && (
                            <div
                              key={comment.id}
                              className="ml-2 w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation()
                                jumpToComment(comment)
                              }}
                            >
                              <MessageCircle className="w-2 h-2 text-white" />
                            </div>
                          )
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* 🧾 Document Viewer */}
                {state.activeFile.type === 'doc' && (
                  <div 
                    className="bg-white p-8 rounded-lg border min-h-96 cursor-text"
                    onMouseUp={handleTextSelection}
                  >
                    <h3 className="text-xl font-bold mb-4">Project Proposal - Phase 2</h3>
                    <p className="text-slate-700 leading-relaxed">
                      This project will be completed in multiple phases to ensure quality delivery. 
                      <span className="bg-yellow-200 px-1">Phase 2 completion within 2 weeks</span> includes 
                      the development of core features and initial testing. The timeline has been carefully 
                      planned to accommodate all stakeholder requirements while maintaining high standards.
                    </p>
                    
                    {/* Text Selection Comments */}
                    {state.comments.map((comment) => (
                      comment.position.textSelection && (
                        <div
                          key={comment.id}
                          className="inline-block ml-1 w-4 h-4 rounded-full bg-yellow-500 align-middle cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => jumpToComment(comment)}
                        >
                          <MessageCircle className="w-3 h-3 text-white m-0.5" />
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* New Comment Input */}
                {state.isAddingComment && state.newCommentPosition && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.avatar} />
                        <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add your feedback..."
                          value={state.newCommentContent}
                          onChange={(e) => setState(prev => ({ ...prev, newCommentContent: e.target.value }))}
                          className="min-h-20"
                        />
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-slate-600">
                            Position: {
                              state.newCommentPosition.x !== undefined ? 
                                `${Math.round(state.newCommentPosition.x)}%, ${Math.round(state.newCommentPosition.y!)}%` :
                              state.newCommentPosition.timestamp !== undefined ?
                                `${Math.floor(state.newCommentPosition.timestamp / 60)}:${String(Math.floor(state.newCommentPosition.timestamp % 60)).padStart(2, '0')}` :
                              state.newCommentPosition.line !== undefined ?
                                `Line ${state.newCommentPosition.line}` :
                              state.newCommentPosition.textSelection ?
                                `"${state.newCommentPosition.textSelection.text.substring(0, 20)}..."` :
                                'Unknown'
                            }
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setState(prev => ({ 
                                ...prev, 
                                isAddingComment: false, 
                                newCommentPosition: null,
                                newCommentContent: ''
                              }))}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={addComment}
                              disabled={!state.newCommentContent.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              Add Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ✨ Unified UX Components - Sidebar Feedback Thread */}
        <div className="col-span-4">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Feedback Thread ({state.filteredComments.length})
                </CardTitle>
                
                {/* View Mode Toggle */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={state.viewMode === 'overlay' ? 'default' : 'outline'}
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'overlay' }))}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={state.viewMode === 'sidebar' ? 'default' : 'outline'}
                    onClick={() => setState(prev => ({ ...prev, viewMode: 'sidebar' }))}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={state.filterBy === 'all' ? 'default' : 'outline'}
                    onClick={() => setState(prev => ({ ...prev, filterBy: 'all' }))}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={state.filterBy === 'open' ? 'default' : 'outline'}
                    onClick={() => setState(prev => ({ ...prev, filterBy: 'open' }))}
                  >
                    Open
                  </Button>
                  <Button
                    size="sm"
                    variant={state.filterBy === 'resolved' ? 'default' : 'outline'}
                    onClick={() => setState(prev => ({ ...prev, filterBy: 'resolved' }))}
                  >
                    Resolved
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {state.filteredComments.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`border rounded-lg p-3 space-y-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    state.selectedComment?.id === comment.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => jumpToComment(comment)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <div className="flex items-center gap-1">
                          {getCommentIcon(comment.type)}
                          <Badge className={getStatusColor(comment.status)} variant="outline">
                            {comment.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-700">{comment.content}</p>
                      
                      {/* Position Info */}
                      <div className="text-xs text-slate-500">
                        {comment.position.x !== undefined ? 
                          `📍 ${Math.round(comment.position.x)}%, ${Math.round(comment.position.y!)}%` :
                        comment.position.timestamp !== undefined ?
                          `⏰ ${Math.floor(comment.position.timestamp / 60)}:${String(Math.floor(comment.position.timestamp % 60)).padStart(2, '0')}` :
                        comment.position.line !== undefined ?
                          `💻 Line ${comment.position.line}` :
                        comment.position.textSelection ?
                          `📄 "${comment.position.textSelection.text.substring(0, 30)}..."` :
                          '📌 Generic'
                        }
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-6 px-2">
                            <Reply className="w-3 h-3" />
                          </Button>
                          {!state.clientMode && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                onCommentUpdate?.(comment.id, { status: 'resolved' })
                              }}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className="ml-4 border-l-2 border-slate-200 pl-3 space-y-2">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="text-sm">
                              <span className="font-medium">{reply.userName}:</span>
                              <span className="ml-2 text-slate-600">{reply.content}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {state.filteredComments.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No comments found</p>
                  <p className="text-sm">Click "Add Comment" to start giving feedback</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mini-map for Pins */}
          {state.showMiniMap && state.activeFile.type === 'image' && (
            <Card className="mt-4 bg-white/70 backdrop-blur-sm border-slate-200/50">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Comment Mini-map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full h-24 bg-slate-200 rounded overflow-hidden">
                  <img
                    src={state.activeFile.url}
                    alt="Mini-map"
                    className="w-full h-full object-cover opacity-50"
                  />
                  {state.comments.map((comment) => (
                    comment.position.x !== undefined && comment.position.y !== undefined && (
                      <div
                        key={comment.id}
                        className="absolute w-2 h-2 rounded-full cursor-pointer hover:scale-150 transition-transform"
                        style={{ 
                          left: `${comment.position.x}%`, 
                          top: `${comment.position.y}%`,
                          backgroundColor: comment.status === 'resolved' ? '#10b981' :
                                         comment.status === 'approved' ? '#3b82f6' :
                                         comment.status === 'needs_revision' ? '#ef4444' :
                                         '#eab308'
                        }}
                        onClick={() => jumpToComment(comment)}
                      />
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 