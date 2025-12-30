"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "next-themes"
import { useUser } from "@/lib/hooks/use-user"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { formatDistanceToNow } from "date-fns"
import { useMediaQuery } from "@/lib/hooks/use-media-query"
import { useToast } from "@/components/ui/use-toast"

// UI Components
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"











// Icons
import {
  Play,
  Pause,
  MessageCircle,
  FileText,
  Mic,
  Send,
  Square,
  Upload,
  User,
  AlertCircle,
  ThumbsUp,
  ChevronRight,
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
  mentionedUsers?: string[]
}

interface Reaction {
  type: string
  users: string[]
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
  drawingData?: string
  voiceUrl?: string
  screenRecordingUrl?: string
  assignedTo?: User
  labels?: string[]
  reactions?: Reaction[]
  mentionedUsers?: string[]
  aiSuggestion?: string
  version?: string
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

// Voice playback component
const VoicePlaybackControls = ({
  voiceUrl,
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
  playbackSpeed,
  onSpeedChange
}: {
  voiceUrl: string
  isPlaying: boolean
  onPlayPause: () => void
  currentTime: number
  duration: number
  playbackSpeed: number
  onSpeedChange: (speed: number) => void
}) => {
  return (
    <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md">
      <Button
        variant="ghost"
        size="sm"
        onClick={onPlayPause}
        className="h-8 w-8 p-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>

      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-200"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      <span className="text-xs text-muted-foreground min-w-[4rem]">
        {Math.floor(currentTime)}s / {Math.floor(duration)}s
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            {playbackSpeed}x
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onSpeedChange(0.5)}>0.5x</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSpeedChange(0.75)}>0.75x</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSpeedChange(1)}>1x</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSpeedChange(1.25)}>1.25x</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSpeedChange(1.5)}>1.5x</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSpeedChange(2)}>2x</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// Enhanced waveform visualization component
const WaveformVisualization = ({ audioData, isRecording }: { audioData: number[]; isRecording: boolean }) => {
  return (
    <div className="h-16 flex items-end justify-center space-x-1 mb-3 bg-muted/30 rounded-md p-2">
      {audioData.length > 0 ? (
        audioData.map((value, index) => (
          <motion.div
            key={index}
            className="bg-primary rounded-full"
            style={{ width: "3px" }}
            initial={{ height: 2 }}
            animate={{
              height: Math.max(2, value * 40),
              opacity: value * 0.8 + 0.2
            }}
            transition={{ duration: 0.1 }}
          />
        ))
      ) : (
        <div className="flex items-center justify-center space-x-1">
          {Array.from({ length: 30 }).map((_, index) => (
            <motion.div
              key={index}
              className="w-1 bg-gray-300 rounded-full"
              initial={{ height: 2 }}
              animate={{
                height: isRecording ? [2, 8, 2] : 2,
                opacity: isRecording ? [0.3, 1, 0.3] : 0.3
              }}
              transition={{
                duration: 1,
                delay: index * 0.05,
                repeat: isRecording ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Comment template selector component
const CommentTemplates = ({ onSelectTemplate }: { onSelectTemplate: (template: string) => void }) => {
  const templates = [
    { name: "UI Feedback", content: "Consider adjusting the [element] to improve [aspect]." },
    { name: "Content Review", content: "This section needs [specific feedback]. Please [action required]." },
    { name: "Bug Report", content: "Issue found: [description]. Steps to reproduce: [steps]." },
    { name: "Enhancement", content: "Suggestion: [improvement idea] to enhance [feature/area]." },
    { name: "Question", content: "Quick question about [topic] - [specific question]?" },
    { name: "Approval", content: "This looks great! Ready for [next step/approval]." }
  ]

  return (
    <div className="grid grid-cols-2 gap-2 p-2">
      {templates.map((template) => (
        <Button
          key={template.name}
          variant="outline"
          size="sm"
          className="text-left h-auto p-2 flex flex-col items-start"
          onClick={() => onSelectTemplate(template.content)}
        >
          <span className="font-medium text-xs">{template.name}</span>
          <span className="text-xs text-muted-foreground truncate w-full">
            {template.content.substring(0, 40)}...
          </span>
        </Button>
      ))}
    </div>
  )
}

// Main enhanced component
export function UniversalPinpointFeedbackSystemEnhanced({
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
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [commentFilter, setCommentFilter] = useState<CommentStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<CommentPriority | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showSidebar, setShowSidebar] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  // Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mediaContainerRef = useRef<HTMLDivElement | null>(null)
  const recordingRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Hooks
  const { toast } = useToast()
  const { theme } = useTheme()
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

  // Helper functions
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms}`
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

    return () => {
      // Cleanup
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
      if (audioContext) {
        audioContext.close()
      }
    }
  }, [initialFiles])

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0)
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1)
      }, 100)
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [isRecording])

  // Waveform visualization effect
  useEffect(() => {
    if (analyser && isRecording) {
      const updateWaveform = () => {
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteFrequencyData(dataArray)

        // Convert to normalized array for visualization
        const normalizedData = Array.from(dataArray).slice(0, 50).map(value => value / 255)
        setWaveformData(normalizedData)

        animationFrameRef.current = requestAnimationFrame(updateWaveform)
      }

      updateWaveform()
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [analyser, isRecording])

  // Fetch media files
  const fetchMediaFiles = async () => {
    try {
      setIsLoading(true)
      setError(null)

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
              replies: [],
            },
          ],
          metadata: {
            width: 1280,
            height: 720,
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

  // Start recording with enhanced audio analysis
  const startRecording = async (type: "voice" | "screen") => {
    try {
      setRecordingType(type)
      setIsRecording(true)
      recordedChunksRef.current = []

      if (type === "voice") {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        setAudioStream(stream)

        // Set up audio analysis for waveform
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioCtx.createMediaStreamSource(stream)
        const analyserNode = audioCtx.createAnalyser()

        analyserNode.fftSize = 256
        analyserNode.smoothingTimeConstant = 0.85
        source.connect(analyserNode)

        setAudioContext(audioCtx)
        setAnalyser(analyserNode)

        const recorder = new MediaRecorder(stream)

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data)
          }
        }

        recorder.onstop = () => {
          const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" })
          const audioUrl = URL.createObjectURL(audioBlob)

          toast({
            title: "Voice recording completed",
            description: "Your voice comment has been saved",
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

  // Stop recording with cleanup
  const stopRecording = () => {
    if (recordingRef.current && recordingRef.current.state === "recording") {
      recordingRef.current.stop()
    }

    // Clean up audio context and stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
      setAudioStream(null)
    }

    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
    }

    setAnalyser(null)
    setWaveformData([])
    setIsRecording(false)
    setRecordingType(null)
    setRecordingDuration(0)
  }

  // Handle file drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(true)
  }

  const handleDragLeave = () => {
    setIsDraggingFile(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingFile(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      // Handle file upload
      toast({
        title: "Files dropped",
        description: `${files.length} file(s) ready for upload`,
      })
    }
  }

  // Filter comments
  const filteredComments = useMemo(() => {
    if (!selectedFile) return []

    return selectedFile.comments.filter(comment => {
      if (commentFilter !== "all" && comment.status !== commentFilter) return false
      if (priorityFilter !== "all" && comment.priority !== priorityFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const contentMatch = comment.content.toLowerCase().includes(query)
        const authorMatch = comment.author.name.toLowerCase().includes(query)
        if (!contentMatch && !authorMatch) return false
      }
      return true
    })
  }, [selectedFile, commentFilter, priorityFilter, searchQuery])

  // Voice Recording Controls Component
  const VoiceRecordingControls = () => {
    if (!isRecording && recordingType !== "voice") return null

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Card className="w-96 p-4 backdrop-blur-lg bg-background/95 border shadow-2xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-3 h-3 bg-red-500 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                  <span className="text-sm font-medium">Recording...</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRecordingTime(recordingDuration)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopRecording}
                  className="text-red-500 hover:text-red-600"
                >
                  <Square className="w-4 h-4 mr-1" />
                  Stop
                </Button>
              </div>

              {/* Enhanced Waveform Visualization */}
              <WaveformVisualization audioData={waveformData} isRecording={isRecording} />

              <div className="flex items-center justify-center space-x-2">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">
                  Speaking into microphone...
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Enhanced comment item with threading
  const CommentItem = ({ comment }: { comment: Comment }) => {
    const [showReplies, setShowReplies] = useState(false)
    const [replyContent, setReplyContent] = useState("")
    const [isPlayingVoice, setIsPlayingVoice] = useState(false)
    const [voiceCurrentTime, setVoiceCurrentTime] = useState(0)
    const [voiceDuration, setVoiceDuration] = useState(0)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <Card className="p-3 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{comment.author.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium truncate">
                  {comment.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>

              <p className="text-sm mb-2">{comment.content}</p>

              {/* Voice playback controls */}
              {comment.voiceUrl && (
                <VoicePlaybackControls
                  voiceUrl={comment.voiceUrl}
                  isPlaying={isPlayingVoice}
                  onPlayPause={() => setIsPlayingVoice(!isPlayingVoice)}
                  currentTime={voiceCurrentTime}
                  duration={voiceDuration}
                  playbackSpeed={playbackSpeed}
                  onSpeedChange={setPlaybackSpeed}
                />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Badge
                    variant={
                      comment.status === "resolved"
                        ? "secondary"
                        : comment.status === "in_progress"
                        ? "outline"
                        : "default"
                    }
                    className="text-xs"
                  >
                    {comment.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {comment.priority}
                  </Badge>
                </div>

                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="h-7 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {comment.replies.length} replies
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Threaded replies */}
              <AnimatePresence>
                {showReplies && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pl-4 border-l-2 border-muted space-y-2"
                  >
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="text-sm">
                        <div className="flex items-center space-x-2 mb-1">
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">{reply.author.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs font-medium">{reply.author.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs">{reply.content}</p>
                      </div>
                    ))}

                    {/* Reply input */}
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="Add a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="text-xs h-8"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          if (replyContent.trim()) {
                            // Add reply logic here
                            setReplyContent("")
                          }
                        }}
                        className="h-8 px-3"
                      >
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading feedback system...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col bg-background relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Voice Recording Controls */}
      <VoiceRecordingControls />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Media Viewer */}
        <div className="flex-1 relative">
          <div
            ref={mediaContainerRef}
            className="w-full h-full relative overflow-hidden bg-muted/10"
          >
            {selectedFile ? (
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ transform: `scale(${zoom / 100})` }}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No file selected</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Comment Sidebar */}
        {showSidebar && (
          <div className="w-96 border-l bg-muted/5 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Comments & Feedback</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 mb-3">
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => isRecording ? stopRecording() : startRecording("voice")}
                  disabled={!selectedFile}
                  className="flex-1"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  {isRecording ? "Stop Recording" : "Voice Note"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedFile}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  <FileText className="w-4 h-4" />
                </Button>
              </div>

              {/* Comment templates */}
              <AnimatePresence>
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3"
                  >
                    <CommentTemplates onSelectTemplate={setNewCommentContent} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Select value={commentFilter} onValueChange={setCommentFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1 p-4">
              {filteredComments.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>No comments yet</p>
                  <p className="text-xs">Click on the media to add feedback</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredComments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Comment Input */}
            <div className="p-4 border-t bg-background/50 backdrop-blur-sm">
              <div className="flex space-x-2">
                <Textarea
                  ref={commentInputRef}
                  placeholder="Add a comment..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  className="min-h-[60px] resize-none"
                />
                <Button
                  onClick={() => {
                    if (newCommentContent.trim()) {
                      // Add comment logic here
                      setNewCommentContent("")
                    }
                  }}
                  disabled={!newCommentContent.trim()}
                  className="self-end"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files
          if (files && files.length > 0) {
            toast({
              title: "Files selected",
              description: `${files.length} file(s) ready for upload`,
            })
          }
        }}
      />

      {/* Drag overlay */}
      <AnimatePresence>
        {isDraggingFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary flex items-center justify-center z-50"
          >
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-primary font-medium">Drop files to attach</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating action button to toggle sidebar */}
      {!showSidebar && (
        <Button
          onClick={() => setShowSidebar(true)}
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
          size="icon"
        >
          <MessageCircle className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}