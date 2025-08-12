"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { nanoid } from "nanoid"
import { useUser } from "@/lib/hooks/use-user"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { RealtimeChannel } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useLocalStorage } from "@/lib/hooks/use-local-storage"
import { useToast } from "@/components/ui/use-toast"
import { useHotkeys } from "react-hotkeys-hook"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useDebouncedCallback } from "use-debounce"
import { useMeasure } from "react-use"
import { PDFDocument } from "pdf-lib"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CommandMenu } from "@/components/command-menu"

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
  Sparkles,
  Filter,
  Layers,
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
  MoreHorizontal,
  MoreVertical,
  Users,
  User,
  UserPlus,
  Flag,
  AlertTriangle,
  AlertCircle,
  Tag,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronsDown,
  RefreshCw,
  RotateCw,
  Save,
  Trash,
  Copy,
  Scissors,
  Link,
  Eye,
  EyeOff,
  Settings,
  Sliders,
  HelpCircle,
  Info,
  Bell,
  BellOff,
  Calendar,
  ClipboardList,
  Paperclip,
  Loader2,
  Loader,
  Circle,
  Triangle,
  Hexagon,
  PenTool,
  Type,
  Crop,
  Move,
  SlidersHorizontal,
  Undo,
  Redo,
  History,
  Award,
  Zap,
  Bot,
  FileImage,
  FileAudio,
  FileVideo,
  FileText as FileTextIcon,
  FileCode,
  FilePlus,
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
  lastActive?: string
  isTyping?: boolean
  cursorPosition?: { x: number; y: number }
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
  reactions?: Reaction[]
  mentionedUsers?: string[] // User IDs
}

interface Reaction {
  type: string // emoji code
  users: string[] // User IDs who reacted
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
  labels?: string[]
  reactions?: Reaction[]
  mentionedUsers?: string[] // User IDs
  aiSuggestion?: string
  version?: string // For version tracking
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
    layers?: { id: string; name: string; visible: boolean }[]
    codeLanguage?: string
  }
}

interface DrawingOptions {
  tool: "pencil" | "highlight" | "shape" | "arrow" | "text" | "eraser"
  color: string
  width: number
  opacity: number
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
    line?: number
  }
  isTyping?: boolean
}

// Main component
export function UniversalPinpointFeedbackSystem({
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
  const [drawingOptions, setDrawingOptions] = useState<DrawingOptions>({
    tool: "pencil",
    color: "#ff0000",
    width: 2,
    opacity: 1,
  })
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<"voice" | "screen" | null>(null)
  const [commentFilter, setCommentFilter] = useState<CommentStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<CommentPriority | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMinimap, setShowMinimap] = useState(true)
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([])
  const [showUserCursors, setShowUserCursors] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentCodeLine, setCurrentCodeLine] = useState(1)
  const [showAIInsights, setShowAIInsights] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<"pdf" | "csv" | "json">("pdf")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"all" | "unresolved" | "assigned" | "created">("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "priority">("newest")
  const [userSettings, setUserSettings] = useLocalStorage("feedback-settings", {
    showResolvedComments: true,
    autoPlayMedia: false,
    notificationsEnabled: true,
    highlightComments: true,
    darkModeEditor: true,
    keyboardShortcuts: true,
  })
  const [isMobileView, setIsMobileView] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentLayer, setCurrentLayer] = useState<string | null>(null)
  const [isPdfLoaded, setIsPdfLoaded] = useState(false)

  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaContainerRef = useRef<HTMLDivElement | null>(null)
  const pdfDocumentRef = useRef<any>(null)
  const codeEditorRef = useRef<HTMLDivElement | null>(null)
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const cursorPositionRef = useRef({ x: 0, y: 0 })
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [containerRef2, { width: containerWidth, height: containerHeight }] = useMeasure()

  // Hooks
  const { toast } = useToast()
  const { theme } = useTheme()
  const router = useRouter()
  const supabase = useSupabaseClient()
  const { user } = useUser()
  const isMobile = useMediaQuery("(max-width: 768px)")
  
  // Derived state
  const isDarkMode = theme === "dark"
  const currentUser: User | null = user ? {
    id: user.id,
    name: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
    email: user.email,
    avatar: user.user_metadata?.avatar_url,
    role: user.user_metadata?.role || "user",
  } : null

  // Initialize
  useEffect(() => {
    if (!initialFiles || initialFiles.length === 0) {
      fetchMediaFiles()
    } else {
      setMediaFiles(initialFiles)
      setSelectedFile(initialFiles[0])
      setIsLoading(false)
    }
    
    setIsMobileView(isMobile)
    if (isMobile) setShowSidebar(false)

    return () => {
      // Cleanup
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.unsubscribe()
      }
      if (recordingRef.current && recordingRef.current.state === "recording") {
        recordingRef.current.stop()
      }
    }
  }, [initialFiles, isMobile])

  // Set up real-time collaboration
  useEffect(() => {
    if (!projectId || !user) return

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
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        const newUser = newPresences[0] as UserPresence
        toast({
          title: "User joined",
          description: `${newUser.userName} is now viewing the feedback`,
        })
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        const leftUser = leftPresences[0] as UserPresence
        // Update active users
      })
      .on("broadcast", { event: "cursor-move" }, payload => {
        // Update cursor positions for other users
        setActiveUsers(prev => 
          prev.map(u => 
            u.userId === payload.userId 
              ? { ...u, currentView: { ...u.currentView, position: payload.position } }
              : u
          )
        )
      })
      .on("broadcast", { event: "typing" }, payload => {
        // Update typing indicators
        setActiveUsers(prev => 
          prev.map(u => 
            u.userId === payload.userId 
              ? { ...u, isTyping: payload.isTyping }
              : u
          )
        )
      })
      .on("broadcast", { event: "comment-add" }, payload => {
        // Handle new comment from other users
        addCommentToState(payload.comment)
        if (userSettings.notificationsEnabled) {
          toast({
            title: "New comment",
            description: `${payload.userName} added a comment`,
          })
        }
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
          userId: user.id,
          userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
          avatar: user.user_metadata?.avatar_url,
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
  }, [projectId, user, selectedFile, supabase, toast, userSettings.notificationsEnabled])

  // Handle cursor movement for real-time collaboration
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mediaContainerRef.current || !showUserCursors || !supabaseChannelRef.current) return
    
    const rect = mediaContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    cursorPositionRef.current = { x, y }
    
    // Debounce broadcast to avoid excessive messages
    debouncedCursorUpdate({ x, y })
  }, [showUserCursors])

  // Debounced cursor update function
  const debouncedCursorUpdate = useDebouncedCallback(
    (position: { x: number; y: number }) => {
      if (!supabaseChannelRef.current || !selectedFile || !user) return
      
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "cursor-move",
        payload: {
          userId: user.id,
          fileId: selectedFile.id,
          position,
        }
      })
    },
    50
  )

  // Handle typing indicator
  const handleTypingStart = useCallback(() => {
    if (!supabaseChannelRef.current || !user) return
    
    if (!isTyping) {
      setIsTyping(true)
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: user.id,
          isTyping: true,
        }
      })
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      supabaseChannelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: user.id,
          isTyping: false,
        }
      })
    }, 2000)
  }, [isTyping, user])

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // In a real implementation, fetch from Supabase
      const { data, error } = await supabase
        .from("project_media")
        .select("*")
        .eq("project_id", projectId)
      
      if (error) throw error
      
      // This is a fallback for demo purposes
      if (!data || data.length === 0) {
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
                position: { type: "video", timestamp: 45 },
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
              duration: 180, // 3 minutes
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
                position: { type: "document", page: 2, highlight: [150, 200] },
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
            id: "code1",
            name: "Main Component",
            type: "code",
            url: "https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/components/ui/button.tsx",
            thumbnail: "/placeholder.svg?height=100&width=100",
            version: "v1.5",
            createdAt: new Date().toISOString(),
            comments: [
              {
                id: "c5",
                position: { type: "code", line: 42 },
                content: "This function could be optimized",
                author: {
                  id: "u4",
                  name: "Dev Team",
                  avatar: "DT",
                },
                createdAt: new Date().toISOString(),
                status: "open",
                type: "text",
                priority: "low",
                replies: [],
              },
            ],
            metadata: {
              lines: 250,
              codeLanguage: "typescript",
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
              duration: 90, // 1.5 minutes
            },
          },
        ]
        
        setMediaFiles(sampleFiles)
        setSelectedFile(sampleFiles[0])
      } else {
        setMediaFiles(data as MediaFile[])
        setSelectedFile(data[0] as MediaFile)
      }
      
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
  const filteredComments = useMemo(() => {
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
      if (viewMode === "assigned" && (!comment.assignedTo || comment.assignedTo.id !== currentUser?.id)) return false
      if (viewMode === "created" && comment.author.id !== currentUser?.id) return false
      
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
  }, [selectedFile, commentFilter, priorityFilter, searchQuery, viewMode, sortOrder, currentUser])

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
    if (supabaseChannelRef.current && user) {
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "media-seek",
        payload: {
          userId: user.id,
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
    if (supabaseChannelRef.current && user) {
      supabaseChannelRef.current.send({
        type: "broadcast",
        event: "page-change",
        payload: {
          userId: user.id,
          fileId: selectedFile.id,
          page,
        }
      })
    }
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
        position = { type: "code", line: currentCodeLine }
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
      author: currentUser || {
        id: "anonymous",
        name: "Anonymous",
        avatar: "AN",
      },
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
      
      // if (error) throw error
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
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
    if (!selectedFile || !content.trim() || !currentUser) return
    
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
      
      // if (error) throw error
      
      // Update local state
      addReplyToState(commentId, reply)
      
      // Broadcast reply add
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "reply-add",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
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
      
      // if (error) throw error
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
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
      
      // if (error) throw error
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Notify callback
      if (onCommentUpdate) {
        onCommentUpdate(updatedComment)
      }
      
      // Broadcast comment update
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
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
      
      // if (error) throw error
      
      // Update local state
      deleteCommentFromState(commentId)
      
      // Notify callback
      if (onCommentDelete) {
        onCommentDelete(commentId)
      }
      
      // Broadcast comment delete
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-delete",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
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
              
              // Broadcast comment update
              if (supabaseChannelRef.current && user) {
                supabaseChannelRef.current.send({
                  type: "broadcast",
                  event: "comment-update",
                  payload: {
                    userId: user.id,
                    userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
                    comment: updatedComment,
                  }
                })
              }
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
              
              // Broadcast comment update
              if (supabaseChannelRef.current && user) {
                supabaseChannelRef.current.send({
                  type: "broadcast",
                  event: "comment-update",
                  payload: {
                    userId: user.id,
                    userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
                    comment: updatedComment,
                  }
                })
              }
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
        
        // if (error) throw error
        
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
        
        // Broadcast comment update
        if (supabaseChannelRef.current && user) {
          supabaseChannelRef.current.send({
            type: "broadcast",
            event: "comment-update",
            payload: {
              userId: user.id,
              userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
              comment: updatedComment,
            }
          })
        }
        
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
        
        // if (error) throw error
        
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
        
        // Broadcast comment update
        if (supabaseChannelRef.current && user) {
          supabaseChannelRef.current.send({
            type: "broadcast",
            event: "comment-update",
            payload: {
              userId: user.id,
              userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
              comment: updatedComment,
            }
          })
        }
        
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

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    setIsDrawingMode(!isDrawingMode)
    
    if (!isDrawingMode && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }

  // Handle drawing
  const handleDrawingStart = (e: React.MouseEvent) => {
    if (!isDrawingMode || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // Set drawing style based on selected tool
    ctx.strokeStyle = drawingOptions.color
    ctx.lineWidth = drawingOptions.width
    ctx.globalAlpha = drawingOptions.opacity
    
    // Add event listeners for drawing
    canvas.addEventListener("mousemove", handleDrawingMove)
    canvas.addEventListener("mouseup", handleDrawingEnd)
    canvas.addEventListener("mouseleave", handleDrawingEnd)
  }

  const handleDrawingMove = (e: MouseEvent) => {
    if (!isDrawingMode || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (drawingOptions.tool === "pencil") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (drawingOptions.tool === "highlight") {
      ctx.lineTo(x, y)
      ctx.stroke()
    } else if (drawingOptions.tool === "shape") {
      // Clear and redraw for shape preview
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.rect(x - 25, y - 25, 50, 50)
      ctx.stroke()
    }
  }

  const handleDrawingEnd = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    
    // Remove event listeners
    canvas.removeEventListener("mousemove", handleDrawingMove)
    canvas.removeEventListener("mouseup", handleDrawingEnd)
    canvas.removeEventListener("mouseleave", handleDrawingEnd)
    
    // Save drawing to active comment if exists
    if (activeComment && selectedFile) {
      const comment = selectedFile.comments.find(c => c.id === activeComment)
      
      if (comment) {
        const drawingData = canvas.toDataURL("image/png")
        
        const updatedComment = {
          ...comment,
          drawingData,
          type: "drawing" as CommentType,
          updatedAt: new Date().toISOString(),
        }
        
        updateCommentInState(updatedComment)
        
        // Broadcast comment update
        if (supabaseChannelRef.current && user) {
          supabaseChannelRef.current.send({
            type: "broadcast",
            event: "comment-update",
            payload: {
              userId: user.id,
              userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
              comment: updatedComment,
            }
          })
        }
      }
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
      
      // if (error) throw error
      
      // Update local state
      updateCommentInState(updatedComment)
      
      // Broadcast comment update
      if (supabaseChannelRef.current && user) {
        supabaseChannelRef.current.send({
          type: "broadcast",
          event: "comment-update",
          payload: {
            userId: user.id,
            userName: user.user_metadata?.name || user.email?.split("@")[0] || "Anonymous",
            comment: updatedComment,
          }
        })
      }
      
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

  // Handle keyboard shortcuts
  useHotkeys("ctrl+enter, cmd+enter", () => {
    if (activeComment) {
      saveComment(activeComment, newCommentContent)
    }
  }, { enableOnFormTags: true })
  
  useHotkeys("escape", () => {
    setActiveComment(null)
  })
  
  useHotkeys("ctrl+z, cmd+z", () => {
    // Undo drawing
  })
  
  useHotkeys("ctrl+shift+z, cmd+shift+z", () => {
    // Redo drawing
  })
  
  useHotkeys("ctrl+s, cmd+s", (e) => {
    e.preventDefault()
    // Save current state
  })
  
  useHotkeys("ctrl+f, cmd+f", (e) => {
    e.preventDefault()
    // Focus search
  })
  
  useHotkeys("ctrl+/, cmd+/", () => {
    // Toggle keyboard shortcuts help
  })

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
            {selectedFile.comments
              .filter((comment) => {
                const position = comment.position as { type: "audio"; timestamp: number }
                return (
                  position.type === "audio" &&
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
              {isPdfLoaded ? (
                <div className="w-full h-full flex items-center justify-center">
                  {/* PDF document would render here */}
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
                      <p className="text-gray-500">Page {currentPage}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">Loading document...</p>
                </div>
              )}
            </div>
            {selectedFile.comments
              .filter((comment) => {
                const position = comment.position as { type: "document"; page: number }
                return position.type === "document" && position.page === currentPage
              })
              .map((comment) => (
                <div
                  key={comment.id}
                  className={cn(
                    "absolute top-20 right-4 w-64 p-2 bg-background border rounded-md shadow-lg",
                    activeComment === comment.id ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setActiveComment(activeComment === comment.id ? null : comment.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback>{comment.author.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="text-xs font-medium">{comment.author.name}</div>
