"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import { nanoid } from "nanoid"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useToast } from "@/components/ui/use-toast"
import { useDebouncedCallback } from "use-debounce"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

// Icons
import {
  Play,
  Pause,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Code,
  FileText,
  ImageIcon,
  Video,
  Mic,
  Monitor,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize,
  Send,
  Plus,
  Volume2,
  Pencil,
  Square,
  Eraser,
  Highlighter,
  Share,
  Download,
  Upload,
  Search,
  MoreVertical,
  Users,
  Flag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  Trash,
  Paperclip,
  Loader2,
} from "lucide-react"

// Define types
type CommentPosition =
  | { type: "image" | "design"; x: number; y: number; zoom?: number }
  | { type: "video" | "audio"; timestamp: number }
  | { type: "document"; page: number; highlight?: [number, number] }
  | { type: "code"; line: number; character?: number }

type CommentStatus = "open" | "resolved" | "in_progress" | "wont_fix"

type CommentType = "text" | "voice" | "screen" | "drawing"

type CommentPriority = "low" | "medium" | "high" | "critical"

interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  role?: string
}

interface Reply {
  id: string
  content: string
  author: User
  createdAt: string
  updatedAt?: string
  type: CommentType
  attachments?: Attachment[]
  voiceUrl?: string
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size?: number
  thumbnail?: string
}

interface Comment {
  id: string
  position: CommentPosition
  content: string
  author: User
  createdAt: string
  updatedAt?: string
  status: CommentStatus
  type: CommentType
  priority: CommentPriority
  replies: Reply[]
  attachments?: Attachment[]
  drawingData?: string // SVG path data for drawings
  voiceUrl?: string
  screenRecordingUrl?: string
  assignedTo?: User
}

interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document" | "code" | "design"
  url: string
  thumbnail?: string
  version: string
  createdAt: string
  updatedAt?: string
  comments: Comment[]
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pages?: number
    lines?: number
    fileSize?: number
    fileType?: string
  }
}

interface UserPresence {
  userId: string
  userName: string
  avatar?: string
  isActive: boolean
  lastActive: string
  currentView?: {
    fileId: string
    position?: { x: number; y: number }
    timestamp?: number
    page?: number
  }
  isTyping?: boolean
}

// Main component
export function UniversalPinpointFeedback({
  projectId,
  initialFiles,
  readOnly = false,
  onCommentAdd,
  onCommentUpdate,
  onCommentDelete,
}: {
  projectId: string
  initialFiles?: MediaFile[]
  readOnly?: boolean
  onCommentAdd?: (comment: Comment) => void
  onCommentUpdate?: (comment: Comment) => void
  onCommentDelete?: (commentId: string) => void
}) {
  // State
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialFiles || [])
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null)
  const [activeComment, setActiveComment] = useState<string | null>(null)
  const [newCommentContent, setNewCommentContent] = useState("")
  const [newReplyContent, setNewReplyContent] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [zoom, setZoom] = useState(100)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<"voice" | "screen" | null>(null)
  const [commentFilter, setCommentFilter] = useState<CommentStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<CommentPriority | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isExporting, setIsExporting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "unresolved" | "assigned" | "created">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "priority">("newest")
  const [isMobileView, setIsMobileView] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaContainerRef = useRef<HTMLDivElement | null>(null)
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const cursorPositionRef = useRef({ x: 0, y: 0 })

  // Hooks
  const { toast } = useToast()
  const supabase = useSupabaseClient()
  
  // Get current user from auth context
  const currentUser: User = {
    id: "current-user",
    name: "Current User",
    avatar: "CU",
    role: "user",
  }

  // Initialize
  useEffect(() => {
    if (!initialFiles || initialFiles.length === 0) {
      fetchMediaFiles()
    } else {
      setMediaFiles(initialFiles)
      setSelectedFile(initialFiles[0])
      setIsLoading(false)
    }
    
    // Check if mobile view
    setIsMobileView(window.innerWidth < 768)
    if (window.innerWidth < 768) setShowSidebar(false)

    // Handle window resize
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize)
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.unsubscribe()
      }
      if (recordingRef.current && recordingRef.current.state === "recording") {
        recordingRef.current.stop()
      }
    }
  }, [initialFiles])

  // Set up real-time collaboration
  useEffect(() => {
    if (!projectId) return

    const channel = supabase
      .channel(`project-feedback-${projectId}`)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const presenceUsers: UserPresence[] = Object.keys(state).map(key => {
          const userPresence = state[key][0] as UserPresence
          return userPresence
        })
        setActiveUsers(presenceUsers)
      })
      .on("broadcast", { event: "comment-add" }, payload => {
        // Handle new comment from other users
        addCommentToState(payload.comment)
        toast({
          title: "New comment",
          description: `${payload.userName} added a comment`,
        })
      })
      .on("broadcast", { event: "comment-update" }, payload => {
        // Handle comment updates from other users
        updateCommentInState(payload.comment)
      })
      .on("broadcast", { event: "comment-delete" }, payload => {
        // Handle comment deletion from other users
        deleteCommentFromState(payload.commentId)
      })
      .on("broadcast", { event: "reply-add" }, payload => {
        // Handle new reply from other users
        addReplyToState(payload.commentId, payload.reply)
      })
      .on("broadcast", { event: "media-seek" }, payload => {
        // Handle media seeking from other users
        if (mediaRef.current && selectedFile?.id === payload.fileId) {
          mediaRef.current.currentTime = payload.timestamp
          setCurrentTime(payload.timestamp)
        }
      })
      .on("broadcast", { event: "page-change" }, payload => {
        // Handle page change from other users
        if (selectedFile?.id === payload.fileId) {
          setCurrentPage(payload.page)
        }
      })

    // Track user presence
    channel.subscribe(status => {
      if (status === "SUBSCRIBED") {
        channel.track({
          userId: currentUser.id,
          userName: currentUser.name,
          avatar: currentUser.avatar,
          isActive: true,
          lastActive: new Date().toISOString(),
          currentView: selectedFile ? {
            fileId: selectedFile.id,
            position: cursorPositionRef.current,
          } : undefined,
        })
      }
    })

    supabaseChannelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [projectId, selectedFile, supabase, toast, currentUser])

  // Handle cursor movement for real-time collaboration
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mediaContainerRef.current || !supabaseChannelRef.current) return
    
    const rect = mediaContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    cursorPositionRef.current = { x, y }
    
    // Debounce broadcast to avoid excessive messages
    debouncedCursorUpdate({ x, y })
  }, [])

  // Debounced cursor update function
  const debouncedCursorUpdate = useDebouncedCallback(
    (position: { x: number; y: number }) => {
      if (!supabaseChannelRef.current || !selectedFile) return
      
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "cursor-move",
        payload: {
          userId: currentUser.id,
          fileId: selectedFile.id,
          position,
        }
      })
    },
    50
  )

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // In a real implementation, fetch from Supabase
      // const { data, error } = await supabase
      //   .from("project_media")
      //   .select("*")
      //   .eq("project_id", projectId)
      
      // Sample data for demonstration
      const sampleFiles: MediaFile[] = [
        {
          id: "img1",
          name: "Homepage Redesign",
          type: "image",
          url: "/placeholder.svg?height=720&width=1280",
          thumbnail: "/placeholder.svg?height=100&width=100",
          version: "v2.3",
          createdAt: new Date().toISOString(),
          comments: [
            {
              id: "c1",
              position: { type: "image", x: 25, y: 30 },
              content: "The logo should be larger here",
              author: {
                id: "u1",
                name: "Sarah Johnson",
                avatar: "SJ",
              },
              createdAt: new Date().toISOString(),
              status: "open",
              type: "text",
              priority: "medium",
              replies: [
                {
                  id: "r1",
                  content: "I'll increase it by 30% in the next version",
                  author: {
                    id: "u2",
                    name: "John Designer",
                    avatar: "JD",
                  },
                  createdAt: new Date().toISOString(),
                  type: "text",
                },
              ],
            },
            {
              id: "c2",
              position: { type: "image", x: 65, y: 45 },
              content: "Can we use a different font for this heading?",
              author: {
                id: "u1",
                name: "Sarah Johnson",
                avatar: "SJ",
              },
              createdAt: new Date().toISOString(),
              status: "resolved",
              type: "text",
              priority: "low",
              replies: [],
            },
          ],
          metadata: {
            width: 1280,
            height: 720,
          },
        },
        {
          id: "vid1",
          name: "Product Demo Video",
          type: "video",
          url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          thumbnail: "/placeholder.svg?height=100&width=100",
          version: "v1.2",
          createdAt: new Date().toISOString(),
          comments: [
            {
              id: "c3",
              position: { type: "video", timestamp: 2 },
              content: "The transition here is too abrupt",
              author: {
                id: "u1",
                name: "Sarah Johnson",
                avatar: "SJ",
              },
              createdAt: new Date().toISOString(),
              status: "in_progress",
              type: "text",
              priority: "high",
              replies: [],
            },
          ],
          metadata: {
            duration: 6, // 6 seconds
          },
        },
        {
          id: "doc1",
          name: "Project Proposal",
          type: "document",
          url: "/placeholder.svg?height=720&width=1280",
          thumbnail: "/placeholder.svg?height=100&width=100",
          version: "v3.0",
          createdAt: new Date().toISOString(),
          comments: [
            {
              id: "c4",
              position: { type: "document", page: 2 },
              content: "This section needs more detail",
              author: {
                id: "u3",
                name: "Alex Manager",
                avatar: "AM",
              },
              createdAt: new Date().toISOString(),
              status: "open",
              type: "text",
              priority: "medium",
              replies: [],
            },
          ],
          metadata: {
            pages: 12,
          },
        },
        {
          id: "audio1",
          name: "Voice Over Track",
          type: "audio",
          url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
          thumbnail: "/placeholder.svg?height=100&width=100",
          version: "v1.0",
          createdAt: new Date().toISOString(),
          comments: [],
          metadata: {
            duration: 3, // 3 seconds
          },
        },
      ]
      
      setMediaFiles(sampleFiles)
      setSelectedFile(sampleFiles[0])
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || "Failed to load media files")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load media files",
        variant: "destructive",
      })
    }
  }

  // Filter comments based on current filters
  const filteredComments = React.useMemo(() => {
    if (!selectedFile) return []
    
    return selectedFile.comments.filter(comment => {
      // Status filter
      if (commentFilter !== "all" && comment.status !== commentFilter) return false
      
      // Priority filter
      if (priorityFilter !== "all" && comment.priority !== priorityFilter) return false
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const contentMatch = comment.content.toLowerCase().includes(query)
        const replyMatch = comment.replies.some(reply => 
          reply.content.toLowerCase().includes(query)
        )
        const authorMatch = comment.author.name.toLowerCase().includes(query)
        
        if (!contentMatch && !replyMatch && !authorMatch) return false
      }
      
      // View mode filter
      if (viewMode === "unresolved" && comment.status === "resolved") return false
      if (viewMode === "assigned" && (!comment.assignedTo || comment.assignedTo.id !== currentUser.id)) return false
      if (viewMode === "created" && comment.author.id !== currentUser.id) return false
      
      return true
    }).sort((a, b) => {
      // Sort order
      if (sortOrder === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      } else if (sortOrder === "priority") {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return 0
    })
  }, [selectedFile, commentFilter, priorityFilter, searchQuery, viewMode, sortOrder, currentUser.id])

  // Handle media playback
  const togglePlayPause = () => {
    if (!mediaRef.current) return

    if (isPlaying) {
      mediaRef.current.pause()
    } else {
      mediaRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  // Handle seeking to a specific timestamp
  const seekToTimestamp = (timestamp: number) => {
    if (!mediaRef.current || !selectedFile) return
    
    mediaRef.current.currentTime = timestamp
    setCurrentTime(timestamp)
    
    // Broadcast seek event for collaboration
    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "media-seek",
        payload: {
          userId: currentUser.id,
          fileId: selectedFile.id,
          timestamp,
        }
      })
    }
  }

  // Handle page change for documents
  const handlePageChange = (page: number) => {
    if (!selectedFile) return
    
    setCurrentPage(page)
    
    // Broadcast page change event for collaboration
    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "page-change",
        payload: {
          userId: currentUser.id,
          fileId: selectedFile.id,
          page,
        }
      })
    }
  }

  // Format time for media playback
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  // Handle media click for adding comments
  const handleMediaClick = (e: React.MouseEvent) => {
    if (!selectedFile || !mediaContainerRef.current || readOnly) return
    
    const rect = mediaContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Create comment based on media type
    let position: CommentPosition
    
    switch (selectedFile.type) {
      case "image":
      case "design":
        position = { type: selectedFile.type, x, y, zoom }
        break
      case "video":
      case "audio":
        position = { type: selectedFile.type, timestamp: currentTime }
        break
      case "document":
        position = { type: "document", page: currentPage }
        break
      case "code":
        position = { type: "code", line: 1 }
        break
      default:
        return
    }
    
    // Open comment input
    const newCommentId = nanoid()
    
    const newComment: Comment = {
      id: newCommentId,
      position,
      content: "",
      author: currentUser,
      createdAt: new Date().toISOString(),
      status: "open",
      type: "text",
      priority: "medium",
      replies: [],
    }
    
    // Add temporary comment to state
    addCommentToState(newComment)
    
    // Set active comment to start editing
    setActiveComment(newCommentId)
    
    // Focus comment input after render
    setTimeout(() => {
      commentInputRef.current?.focus()
    }, 100)
  }

  // Add comment to state
  const addCommentToState = (comment: Comment) => {
    if (!selectedFile) return
    
    setMediaFiles(prev => 
      prev.map(file => 
        file.id === selectedFile.id 
          ? { ...file, comments: [...file.comments, comment] }
          : file
      )
    )
    
    setSelectedFile(prev => 
      prev ? { ...prev, comments: [...prev.comments, comment] } : prev
    )
  }

  // Update comment in state
  const updateCommentInState = (updatedComment: Comment) => {
    if (!selectedFile) return
    
    setMediaFiles(prev => 
      prev.map(file => 
        file.id === selectedFile.id 
          ? { 
              ...file, 
              comments: file.comments.map(c => 
                c.id === updatedComment.id ? updatedComment : c
              ) 
            }
          : file
      )
    )
    
    setSelectedFile(prev => 
      prev ? { 
        ...prev, 
        comments: prev.comments.map(c => 
          c.id === updatedComment.id ? updatedComment : c
        ) 
      } : prev
    )
  }

  // Delete comment from state
  const deleteCommentFromState = (commentId: string) => {
    if (!selectedFile) return
    
    setMediaFiles(prev => 
      prev.map(file => 
        file.id === selectedFile.id 
          ? { ...file, comments: file.comments.filter(c => c.id !== commentId) }
          : file
      )
    )
    
    setSelectedFile(prev => 
      prev ? { ...prev, comments: prev.comments.filter(c => c.id !== commentId) } : prev
    )
  }

  // Add reply to state
  const addReplyToState = (commentId: string, reply: Reply) => {
    if (!selectedFile) return
    
    setMediaFiles(prev => 
      prev.map(file => 
        file.id === selectedFile.id 
          ? { 
              ...file, 
              comments: file.comments.map(c => 
                c.id === commentId 
                  ? { ...c, replies: [...c.replies, reply] }
                  : c
              ) 
            }
          : file
      )
    )
    
    setSelectedFile(prev => 
      prev ? { 
        ...prev, 
        comments: prev.comments.map(c => 
          c.id === commentId 
            ? { ...c, replies: [...c.replies, reply] }
            : c
        ) 
      } : prev
    )
  }

  // Save comment
  const saveComment = async (commentId: string, content: string) => {
    if (!selectedFile || !content.trim()) {
      // Delete empty comments
      if (!content.trim()) {
        deleteCommentFromState(commentId)
      }
      setActiveComment(null)
      return
    }
    
    const comment = selectedFile.comments.find(c => c.id === commentId)
    
    if (!comment) {
      setActiveComment(null)
      return
    }
    
    const updatedComment = {
      ...comment,
      content,
      updatedAt: new Date().toISOString(),
    }
    
    try {
      // In a real implementation, save to Supabase
      // const { error } = await supabase
      //   .from("comments")
      //   .upsert(updatedComment)
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            comment: updatedComment,
          }
        })
      }
      
      setActiveComment(null)
      setNewCommentContent("")
      
      toast({
        title: "Comment saved",
        description: "Your comment has been saved successfully",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to save comment: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Add reply
  const addReply = async (commentId: string, content: string) => {
    if (!selectedFile || !content.trim()) return
    
    const reply: Reply = {
      id: nanoid(),
      content,
      author: currentUser,
      createdAt: new Date().toISOString(),
      type: "text",
    }
    
    try {
      // In a real implementation, save to Supabase
      // const { error } = await supabase
      //   .from("replies")
      //   .insert(reply)
      
      // Update local state
      addReplyToState(commentId, reply)
      
      // Broadcast reply add
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "reply-add",
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            commentId,
            reply,
          }
        })
      }
      
      setNewReplyContent("")
      
      toast({
        title: "Reply added",
        description: "Your reply has been added successfully",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to add reply: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Update comment status
  const updateCommentStatus = async (commentId: string, status: CommentStatus) => {
    if (!selectedFile) return
    
    const comment = selectedFile.comments.find(c => c.id === commentId)
    
    if (!comment) return
    
    const updatedComment = {
      ...comment,
      status,
      updatedAt: new Date().toISOString(),
    }
    
    try {
      // In a real implementation, save to Supabase
      // const { error } = await supabase
      //   .from("comments")
      //   .update({ status })
      //   .eq("id", commentId)
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            comment: updatedComment,
          }
        })
      }
      
      toast({
        title: "Status updated",
        description: `Comment status changed to ${status}`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update status: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Update comment priority
  const updateCommentPriority = async (commentId: string, priority: CommentPriority) => {
    if (!selectedFile) return
    
    const comment = selectedFile.comments.find(c => c.id === commentId)
    
    if (!comment) return
    
    const updatedComment = {
      ...comment,
      priority,
      updatedAt: new Date().toISOString(),
    }
    
    try {
      // In a real implementation, save to Supabase
      // const { error } = await supabase
      //   .from("comments")
      //   .update({ priority })
      //   .eq("id", commentId)
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            comment: updatedComment,
          }
        })
      }
      
      toast({
        title: "Priority updated",
        description: `Comment priority changed to ${priority}`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to update priority: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Delete comment
  const deleteComment = async (commentId: string) => {
    if (!selectedFile) return
    
    try {
      // In a real implementation, delete from Supabase
      // const { error } = await supabase
      //   .from("comments")
      //   .delete()
      //   .eq("id", commentId)
      
      // Update local state
      deleteCommentFromState(commentId)
      
      // Notify callback
      if (onCommentDelete) {
        onCommentDelete(commentId)
      }
      
      // Broadcast comment delete
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-delete",
          payload: {
            userId: currentUser.id,
            userName: currentUser.name,
            commentId,
          }
        })
      }
      
      toast({
        title: "Comment deleted",
        description: "The comment has been deleted",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to delete comment: " + err.message,
        variant: "destructive",
      })
    }
  }

  // Start recording (voice or screen)
  const startRecording = async (type: "voice" | "screen") => {
    try {
      setRecordingType(type)
      setIsRecording(true)
      recordedChunksRef.current = []
      
      if (type === "voice") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        
        recorder.onstop = () => {
          const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
          const audioUrl = URL.createObjectURL(audioBlob)
          
          // In a real implementation, upload to storage
          // const { data, error } = await supabase.storage
          //   .from("recordings")
          //   .upload(`voice-${Date.now()}.webm`, audioBlob)
          
          // Handle recording completion
          if (activeComment) {
            const comment = selectedFile?.comments.find(c => c.id === activeComment)
            
            if (comment) {
              const updatedComment = {
                ...comment,
                voiceUrl: audioUrl,
                type: "voice" as CommentType,
                updatedAt: new Date().toISOString(),
              }
              
              updateCommentInState(updatedComment)
            }
          }
          
          toast({
            title: "Voice recording completed",
            description: "Your voice comment has been saved",
          })
        }
        
        recorder.start()
        recordingRef.current = recorder
      } else if (type === "screen") {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: "screen" },
          audio: true,
        })
        
        const recorder = new MediaRecorder(stream)
        
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }
        
        recorder.onstop = () => {
          const videoBlob = new Blob(recordedChunksRef.current, { type: "video/webm" })
          const videoUrl = URL.createObjectURL(videoBlob)
          
          // In a real implementation, upload to storage
          // const { data, error } = await supabase.storage
          //   .from("recordings")
          //   .upload(`screen-${Date.now()}.webm`, videoBlob)
          
          // Handle recording completion
          if (activeComment) {
            const comment = selectedFile?.comments.find(c => c.id === activeComment)
            
            if (comment) {
              const updatedComment = {
                ...comment,
                screenRecordingUrl: videoUrl,
                type: "screen" as CommentType,
                updatedAt: new Date().toISOString(),
              }
              
              updateCommentInState(updatedComment)
            }
          }
          
          toast({
            title: "Screen recording completed",
            description: "Your screen recording has been saved",
          })
        }
        
        recorder.start()
        recordingRef.current = recorder
      }
    } catch (err: any) {
      setIsRecording(false)
      setRecordingType(null)
      toast({
        title: "Recording error",
        description: err.message || "Failed to start recording",
        variant: "destructive",
      })
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (recordingRef.current && recordingRef.current.state === "recording") {
      recordingRef.current.stop()
    }
    
    setIsRecording(false)
    setRecordingType(null)
  }

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    
    if (!files || files.length === 0 || !activeComment || !selectedFile) return
    
    try {
      const attachments: Attachment[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // In a real implementation, upload to storage
        // const { data, error } = await supabase.storage
        //   .from("attachments")
        //   .upload(`${Date.now()}-${file.name}`, file)
        
        // For demo purposes, create object URL
        const url = URL.createObjectURL(file)
        
        attachments.push({
          id: nanoid(),
          name: file.name,
          type: file.type,
          url,
          size: file.size,
        })
      }
      
      const comment = selectedFile.comments.find(c => c.id === activeComment)
      
      if (comment) {
        const updatedComment = {
          ...comment,
          attachments: [...(comment.attachments || []), ...attachments],
          updatedAt: new Date().toISOString(),
        }
        
        updateCommentInState(updatedComment)
        
        toast({
          title: "Files attached",
          description: `${attachments.length} file(s) attached to comment`,
        })
      }
    } catch (err: any) {
      toast({
        title: "Upload error",
        description: err.message || "Failed to upload files",
        variant: "destructive",
      })
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleDragLeave = () => {
    setIsDraggingFile(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)
    
    if (!activeComment || !selectedFile) return
    
    const files = e.dataTransfer.files
    
    if (!files || files.length === 0) return
    
    try {
      const attachments: Attachment[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // In a real implementation, upload to storage
        // const { data, error } = await supabase.storage
        //   .from("attachments")
        //   .upload(`${Date.now()}-${file.name}`, file)
        
        // For demo purposes, create object URL
        const url = URL.createObjectURL(file)
        
        attachments.push({
          id: nanoid(),
          name: file.name,
          type: file.type,
          url,
          size: file.size,
        })
      }
      
      const comment = selectedFile.comments.find(c => c.id === activeComment)
      
      if (comment) {
        const updatedComment = {
          ...comment,
          attachments: [...(comment.attachments || []), ...attachments],
          updatedAt: new Date().toISOString(),
        }
        
        updateCommentInState(updatedComment)
        
        toast({
          title: "Files attached",
          description: `${attachments.length} file(s) attached to comment`,
        })
      }
    } catch (err: any) {
      toast({
        title: "Upload error",
        description: err.message || "Failed to upload files",
        variant: "destructive",
      })
    }
  }

  // Export comments
  const exportComments = async (format: "pdf" | "csv" | "json") => {
    if (!selectedFile) return
    
    setIsExporting(true)
    
    try {
      if (format === "pdf") {
        // In a real implementation, generate PDF
        // For demo purposes, create a simple blob
        const content = selectedFile.comments.map(comment => {
          return `
            Comment: ${comment.content}
            Author: ${comment.author.name}
            Status: ${comment.status}
            Priority: ${comment.priority}
            Created: ${format(new Date(comment.createdAt), "PPpp")}
            
            Replies:
            ${comment.replies.map(reply => `- ${reply.author.name}: ${reply.content}`).join("\n")}
            
            ---
          `
        }).join("\n")
        
        const blob = new Blob([content], { type: "application/pdf" })
        const url = URL.createObjectURL(blob)
        
        // Create download link
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedFile.name}-comments.pdf`
        a.click()
        
        // Clean up
        URL.revokeObjectURL(url)
      } else if (format === "csv") {
        // Create CSV content
        const headers = "ID,Content,Author,Status,Priority,Created At\n"
        const rows = selectedFile.comments.map(comment => {
          return `"${comment.id}","${comment.content.replace(/"/g, '""')}","${comment.author.name}","${comment.status}","${comment.priority}","${comment.createdAt}"`
        }).join("\n")
        
        const blob = new Blob([headers + rows], { type: "text/csv" })
        const url = URL.createObjectURL(blob)
        
        // Create download link
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedFile.name}-comments.csv`
        a.click()
        
        // Clean up
        URL.revokeObjectURL(url)
      } else if (format === "json") {
        // Create JSON content
        const data = {
          file: {
            id: selectedFile.id,
            name: selectedFile.name,
            type: selectedFile.type,
            version: selectedFile.version,
          },
          comments: selectedFile.comments,
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        
        // Create download link
        const a = document.createElement("a")
        a.href = url
        a.download = `${selectedFile.name}-comments.json`
        a.click()
        
        // Clean up
        URL.revokeObjectURL(url)
      }
      
      toast({
        title: "Export complete",
        description: `Comments exported as ${format.toUpperCase()}`,
      })
    } catch (err: any) {
      toast({
        title: "Export error",
        description: err.message || `Failed to export as ${format}`,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Assign comment to user
  const assignCommentToUser = async (commentId: string, userId: string) => {
    if (!selectedFile) return
    
    const comment = selectedFile.comments.find(c => c.id === commentId)
    
    if (!comment) return
    
    // Find user in active users
    const assignedUser = activeUsers.find(u => u.userId === userId)
    
    if (!assignedUser) return
    
    const updatedComment = {
      ...comment,
      assignedTo: {
        id: assignedUser.userId,
        name: assignedUser.userName,
        avatar: assignedUser.avatar,
      },
      updatedAt: new Date().toISOString(),
    }
    
    try {
      // In a real implementation, save to Supabase
      // const { error } = await supabase
      //   .from("comments")
      //   .update({ assigned_to: userId })
      //   .eq("id", commentId)
      
      // Update local state
      updateCommentInState(updatedComment)
      
      toast({
        title: "Comment assigned",
        description: `Comment assigned to ${assignedUser.userName}`,
      })
    } catch (err: any) {
      toast({
        title: "Assignment error",
        description: err.message || "Failed to assign comment",
        variant: "destructive",
      })
    }
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    
    setIsFullscreen(!isFullscreen)
  }

  // Render comment marker based on media type
  const renderCommentMarker = (comment: Comment) => {
    if (!selectedFile) return null
    
    switch (selectedFile.type) {
      case "image":
      case "design":
        const position = comment.position as { type: "image" | "design"; x: number; y: number }
        return (
          <div
            key={comment.id}
            className={cn(
              "absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center cursor-pointer transition-all",
              comment.status === "resolved" ? "bg-green-500" : "bg-blue-500",
              activeComment === comment.id ? "ring-2 ring-offset-2 ring-blue-500 z-20" : "z-10"
            )}
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
            }}
            onClick={(e) => {
              e.stopPropagation()
              setActiveComment(activeComment === comment.id ? null : comment.id)
            }}
          >
            <MessageCircle className="w-3 h-3 text-white" />
          </div>
        )
      default:
        return null
    }
  }

  // Render media content based on type
  const renderMediaContent = () => {
    if (!selectedFile) return null
    
    switch (selectedFile.type) {
      case "image":
        return (
          <div className="relative w-full h-full">
            <img
              src={selectedFile.url}
              alt={selectedFile.name}
              className="w-full h-full object-contain"
              style={{ transform: `scale(${zoom / 100})` }}
            />
            {selectedFile.comments.map(renderCommentMarker)}
          </div>
        )
      case "video":
        return (
          <div className="relative w-full h-full">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={selectedFile.url}
              className="w-full h-full object-contain"
              controls={false}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      selectedFile.metadata?.duration
                        ? (currentTime / selectedFile.metadata.duration) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(selectedFile.metadata?.duration || 0)}
              </span>
            </div>
            {selectedFile.comments
              .filter((comment) => {
                const position = comment.position as { type: "video"; timestamp: number }
                return (
                  position.type === "video" &&
                  Math.abs(position.timestamp - currentTime) < 1
                )
              })
              .map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "absolute bottom-8 left-0 right-0 p-2 bg-background border rounded-md shadow-lg",
                    activeComment === comment.id ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setActiveComment(activeComment === comment.id ? null : comment.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{comment.author.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs font-medium">{comment.author.name}</div>
                    <Badge
                      variant={
                        comment.status === "resolved"
                          ? "success"
                          : comment.status === "in_progress"
                          ? "warning"
                          : "default"
                      }
                      className="text-xs"
                    >
                      {comment.status}
                    </Badge>
                  </div>
                  <div className="mt-1 text-sm">{comment.content}</div>
                </div>
              ))}
          </div>
        )
      case "audio":
        return (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={selectedFile.url}
              className="w-full"
              controls={false}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-md mb-4">
              {/* Audio waveform visualization would go here */}
              <div className="w-full h-full flex items-center justify-center">
                <Volume2 className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <div className="w-full bg-black bg-opacity-50 p-2 flex items-center space-x-2 rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:text-white hover:bg-white/20"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${
                      selectedFile.metadata?.duration
                        ? (currentTime / selectedFile.metadata.duration) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-white">
                {formatTime(currentTime)} / {formatTime(selectedFile.metadata?.duration || 0)}
              </span>
            </div>
          </div>
        )
      case "document":
        return (
          <div className="relative w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm">
                  Page {currentPage} of {selectedFile.metadata?.pages || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(
                      Math.min(selectedFile.metadata?.pages || 1, currentPage + 1)
                    )
                  }
                  disabled={currentPage >= (selectedFile.metadata?.pages || 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 10))}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 10))}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div
                  className="bg-white dark:bg-gray-700 shadow-lg"
                  style={{
                    width: "80%",
                    height: "90%",
                    transform: `scale(${zoom / 100})`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500 ml-2">Page {currentPage}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium">Unsupported file type</p>
              <p className="text-sm text-gray-500">
                This file type cannot be previewed
              </p>
            </div>
          </div>
        )
    }
  }

  // Render comment detail
  const renderCommentDetail = (comment: Comment) => {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{comment.author.avatar}</AvatarFallback>
                {comment.author.avatar && <AvatarImage src={comment.author.avatar} />}
              </Avatar>
              <div>
                <div className="font-medium">{comment.author.name}</div>
                <div className="text-xs text-gray-500">
                  {format(new Date(comment.createdAt), "PPp")}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  comment.status === "resolved"
                    ? "success"
                    : comment.status === "in_progress"
                    ? "warning"
                    : comment.status === "wont_fix"
                    ? "destructive"
                    : "default"
                }
              >
                {comment.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => updateCommentStatus(comment.id, "open")}>
                    Mark as Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentStatus(comment.id, "in_progress")}>
                    Mark as In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentStatus(comment.id, "resolved")}>
                    Mark as Resolved
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentStatus(comment.id, "wont_fix")}>
                    Mark as Won't Fix
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => updateCommentPriority(comment.id, "low")}>
                    Set Low Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentPriority(comment.id, "medium")}>
                    Set Medium Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentPriority(comment.id, "high")}>
                    Set High Priority
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateCommentPriority(comment.id, "critical")}>
                    Set Critical Priority
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {activeUsers.length > 0 && (
                    <>
                      <DropdownMenuLabel>Assign to</DropdownMenuLabel>
                      {activeUsers.map(user => (
                        <DropdownMenuItem
                          key={user.userId}
                          onClick={() => assignCommentToUser(comment.id, user.userId)}
                        >
                          {user.userName}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-500"
                  >
                    Delete Comment
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {activeComment === comment.id ? (
            <div className="space-y-2">
              <Textarea
                ref={commentInputRef}
                value={newCommentContent || comment.content}
                onChange={(e) => setNewCommentContent(e.target.value)}
                className="w-full min-h-[100px]"
                placeholder="Enter your comment..."
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            fileInputRef.current?.click()
                          }}
                        >
                          <Paperclip className="w-4 h-4 mr-1" />
                          Attach
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Attach files</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={handleFileUpload}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startRecording("voice")}
                          disabled={isRecording}
                        >
                          <Mic className="w-4 h-4 mr-1" />
                          Voice
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Record voice comment</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startRecording("screen")}
                          disabled={isRecording}
                        >
                          <Monitor className="w-4 h-4 mr-1" />
                          Screen
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Record screen</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveComment(null)
                      setNewCommentContent("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveComment(comment.id, newCommentContent || comment.content)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-sm">{comment.content}</div>
              
              {/* Display voice recording */}
              {comment.type === "voice" && comment.voiceUrl && (
                <div className="mt-2">
                  <audio src={comment.voiceUrl} controls className="w-full" />
                </div>
              )}
              
              {/* Display screen recording */}
              {comment.type === "screen" && comment.screenRecordingUrl && (
                <div className="mt-2">
                  <video src={comment.screenRecordingUrl} controls className="w-full" />
                </div>
              )}
              
              {/* Display attachments */}
              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-medium">Attachments</div>
                  <div className="flex flex-wrap gap-2">
                    {comment.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Paperclip className="w-3 h-3 mr-1" />
                        {attachment.name.length > 20
                          ? `${attachment.name.substring(0, 17)}...`
                          : attachment.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display drawing */}
              {comment.drawingData && (
                <div className="mt-2">
                  <img src={comment.drawingData} alt="Drawing" className="max-w-full rounded" />
                </div>
              )}
              
              {/* Display priority badge */}
              <div className="mt-2">
                <Badge
                  variant={
                    comment.priority === "critical"
                      ? "destructive"
                      : comment.priority === "high"
                      ? "default"
                      : comment.priority === "medium"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-xs"
                >
                  {comment.priority} priority
                </Badge>
                
                {/* Display assigned user */}
                {comment.assignedTo && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Assigned to {comment.assignedTo.name}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="px-4 pb-2">
            <Separator className="my-2" />
            <div className="text-xs font-medium mb-2">Replies</div>
            <div className="space-y-2">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="bg-gray-50 dark:bg-gray-800 rounded p-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{reply.author.avatar}</AvatarFallback>
                      {reply.author.avatar && <AvatarImage src={reply.author.avatar} />}
                    </Avatar>
                    <div className="text-xs font-medium">{reply.author.name}</div>
                    <div className="text-xs text-gray-500">
                      {format(new Date(reply.createdAt), "PPp")}
                    </div>
                  </div>
                  <div className="text-sm mt-1">{reply.content}</div>
                  
                  {/* Display voice recording */}
                  {reply.type === "voice" && reply.voiceUrl && (
                    <div className="mt-2">
                      <audio src={reply.voiceUrl} controls className="w-full" />
                    </div>
                  )}
                  
                  {/* Display attachments */}
                  {reply.attachments && reply.attachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reply.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-1 bg-gray-100 dark:bg-gray-700 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          <Paperclip className="w-3 h-3 mr-1" />
                          {attachment.name.length > 15
                            ? `${attachment.name.substring(0, 12)}...`
                            : attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Add reply */}
        <CardFooter className="flex flex-col items-stretch pt-0">
          <div className="flex items-center space-x-2 w-full">
            <Avatar className="w-6 h-6">
              <AvatarFallback>{currentUser.avatar}</AvatarFallback>
              {currentUser.avatar && <AvatarImage src={currentUser.avatar} />}
            </Avatar>
            <Input
              value={newReplyContent}
              onChange={(e) => setNewReplyContent(e.target.value)}
              placeholder="Add a reply..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  addReply(comment.id, newReplyContent)
                }
              }}
            />
            <Button
              size="icon"
              onClick={() => addReply(comment.id, newReplyContent)}
              disabled={!newReplyContent.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Main render
  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col h-full w-full border rounded-md overflow-hidden bg-background",
        isFullscreen && "fixed inset-0 z-50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold">Feedback</h2>
          {selectedFile && (
            <Badge variant="outline" className="ml-2">
              {selectedFile.name} ({selectedFile.version})
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSidebar(!showSidebar)}
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showSidebar ? "Hide" : "Show"} comments</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFullscreen}
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Fullscreen</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export Comments</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => exportComments("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportComments("csv")}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportComments("json")}>
                Export as JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File selector */}
        <div className="w-48 border-r p-2 overflow-y-auto hidden md:block">
          <div className="text-sm font-medium mb-2">Files</div>
          <div className="space-y-1">
            {mediaFiles.map((file) => (
              <Button
                key={file.id}
                variant={selectedFile?.id === file.id ? "secondary" : "ghost"}
                className="w-full justify-start text-sm"
                onClick={() => setSelectedFile(file)}
              >
                {file.type === "image" && <ImageIcon className="w-4 h-4 mr-2" />}
                {file.type === "video" && <Video className="w-4 h-4 mr-2" />}
                {file.type === "audio" && <Volume2 className="w-4 h-4 mr-2" />}
                {file.type === "document" && <FileText className="w-4 h-4 mr-2" />}
                {file.type === "code" && <Code className="w-4 h-4 mr-2" />}
                <span className="truncate">{file.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Media viewer */}
        <div
          className={cn(
            "flex-1 relative",
            isDraggingFile && "bg-blue-100 dark:bg-blue-900/20"
          )}
          ref={mediaContainerRef}
          onClick={handleMediaClick}
          onMouseMove={handleMouseMove}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-lg font-medium">Error loading media</p>
                <p className="text-sm text-gray-500">{error}</p>
                <Button className="mt-4" onClick={fetchMediaFiles}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : !selectedFile ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-lg font-medium">No file selected</p>
                <p className="text-sm text-gray-500">Select a file to view and add comments</p>
              </div>
            </div>
          ) : (
            renderMediaContent()
          )}

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-2 animate-pulse">
              <div className="w-2 h-2 
