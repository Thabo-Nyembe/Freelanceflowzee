'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Plus,
  Pin,
  Clock,
  User,
  Calendar,
  Image,
  Video,
  FileText,
  Download,
  Share2,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Upload,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Send,
  Users,
  Activity,
  X,
  Loader2
} from 'lucide-react'

interface MediaFile {
  id: string
  type: 'video' | 'image' | 'document'
  name: string
  url: string
  thumbnail?: string
  duration?: number
  comments: Comment[]
  likes: number
  isLiked: boolean
  viewCount: number
  status?: 'pending' | 'approved' | 'revision_requested' | 'rejected'
  submittedAt?: string
}

interface Comment {
  id: string
  user: {
    name: string
    avatar?: string
    role: 'client' | 'freelancer'
  }
  content: string
  timestamp: number // For videos: time in seconds, for images: null
  position?: { x: number; y: number } // For image annotations
  createdAt: string
  replies?: Comment[]
  type: 'comment' | 'note' | 'approval' | 'revision'
}

interface UploadFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  preview?: string
  type: 'video' | 'image' | 'document'
}

interface VideoPlayerProps {
  file: MediaFile
  onAddComment: (timestamp: number, content: string) => void
}

function VideoPlayer({ file, onAddComment }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentText, setCommentText] = useState('')

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(currentTime, commentText)
      setCommentText('')
      setShowCommentForm(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={file.url}
          className="w-full h-auto"
          onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-4">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={togglePlay}
              className="text-white hover:bg-white/20"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(file.duration || 0)}
            </span>
            
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => setShowCommentForm(true)}
              className="text-white hover:bg-white/20 ml-auto"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>

        {/* Comment Markers */}
        {file.comments.map((comment) => (
          <div
            key={comment.id}
            className="absolute top-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-yellow-300"
            style={{ left: `${(comment.timestamp / (file.duration || 1)) * 100}%` }}
            onClick={() => videoRef.current && (videoRef.current.currentTime = comment.timestamp)}
          >
            {formatTime(comment.timestamp)}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Clock className="h-4 w-4" />
                Adding note at {formatTime(currentTime)}
              </div>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add your feedback or note..."
                className="w-full p-3 border rounded-md resize-none h-24"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} size="sm">
                  Add Note
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCommentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ImageViewerProps {
  file: MediaFile
  onAddComment: (position: { x: number; y: number }, content: string) => void
}

function ImageViewer({ file, onAddComment }: ImageViewerProps) {
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)
  const [commentText, setCommentText] = useState('')

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setCommentPosition({ x, y })
    setShowCommentForm(true)
  }

  const handleAddComment = () => {
    if (commentText.trim() && commentPosition) {
      onAddComment(commentPosition, commentText)
      setCommentText('')
      setShowCommentForm(false)
      setCommentPosition(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <div 
          className="relative cursor-crosshair"
          onClick={handleImageClick}
        >
          <img 
            src={file.url} 
            alt={file.name}
            className="w-full h-auto"
          />
          
          {/* Existing Comments */}
          {file.comments.map((comment) => (
            comment.position && (
              <div
                key={comment.id}
                className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:bg-red-600 transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${comment.position.x}%`, 
                  top: `${comment.position.y}%` 
                }}
                title={comment.content}
              >
                <MessageCircle className="h-3 w-3" />
              </div>
            )
          ))}
        </div>
      </div>

      {/* Comment Form */}
      {showCommentForm && commentPosition && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Pin className="h-4 w-4" />
                Adding annotation at ({Math.round(commentPosition.x)}%, {Math.round(commentPosition.y)}%)
              </div>
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Describe what needs attention at this location..."
                className="w-full p-3 border rounded-md resize-none h-24"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleAddComment} size="sm">
                  Add Annotation
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowCommentForm(false)
                    setCommentPosition(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// File Upload Component
function FileUploadZone({ onUploadComplete }: { onUploadComplete: (files: UploadFile[]) => void }) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isDragActive, setIsDragActive] = useState(false)

  const getFileType = (file: File): 'video' | 'image' | 'document' => {
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('image/')) return 'image'
    return 'document'
  }

  const simulateUpload = (file: UploadFile) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: 100, status: 'completed' as const }
            : f
        ))
      } else {
        setUploadFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress }
            : f
        ))
      }
    }, 300)
  }

  const handleFileInput = (files: FileList | null) => {
    if (!files) return
    
    const fileArray = Array.from(files)
    const newFiles: UploadFile[] = fileArray.map(file => {
      const id = `${Date.now()}_${file.name}`
      const type = getFileType(file)
      
      let preview: string | undefined
      if (type === 'image') {
        preview = URL.createObjectURL(file)
      }

      return {
        id,
        file,
        progress: 0,
        status: 'uploading' as const,
        preview,
        type
      }
    })

    setUploadFiles(prev => [...prev, ...newFiles])
    newFiles.forEach(simulateUpload)
  }

  const completedFiles = uploadFiles.filter(f => f.status === 'completed')

  return (
    <div className="space-y-6">
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}>
        <CardContent className="p-8">
          <div 
            className="text-center cursor-pointer"
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragActive(false)
              handleFileInput(e.dataTransfer.files)
            }}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <input 
              id="file-upload"
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={(e) => handleFileInput(e.target.files)}
              className="hidden"
            />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${
              isDragActive ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop files here' : 'Upload project files'}
            </h3>
            <p className="text-gray-600 mb-4">
              Drag & drop or click to upload videos, images, and documents
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading Files ({uploadFiles.length})
            </h4>
            
            <div className="space-y-4">
              {uploadFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.file.name}</p>
                    <Progress value={file.progress} className="mt-2" />
                  </div>
                  {file.status === 'completed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>

            {completedFiles.length > 0 && (
              <Button 
                onClick={() => onUploadComplete(completedFiles)}
                className="w-full mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
              >
                Add {completedFiles.length} files to project
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function CollaborationPage() {
  const [files, setFiles] = useState<MediaFile[]>([
    {
      id: 'file_001',
      type: 'video',
      name: 'Brand Animation Preview',
      url: '/videos/brand-animation.mp4',
      duration: 145,
      status: 'pending',
      submittedAt: '2024-02-01T10:30:00Z',
      comments: [
        {
          id: 'c1',
          user: { name: 'Sarah Johnson', role: 'client' },
          content: 'Love the transition here! Can we make it slightly slower?',
          timestamp: 23,
          createdAt: '2024-02-01T10:30:00Z',
          type: 'note'
        },
        {
          id: 'c2',
          user: { name: 'Alex Designer', role: 'freelancer' },
          content: 'Updated the timing as requested',
          timestamp: 23,
          createdAt: '2024-02-01T14:15:00Z',
          type: 'comment'
        }
      ],
      likes: 12,
      isLiked: true,
      viewCount: 45
    },
    {
      id: 'file_002',
      type: 'image',
      name: 'Homepage Mockup v2',
      url: '/images/homepage-mockup.jpg',
      status: 'approved',
      submittedAt: '2024-02-01T09:45:00Z',
      comments: [
        {
          id: 'c3',
          user: { name: 'Mike Wilson', role: 'client' },
          content: 'The header looks great, but could we try a different font for the subtitle?',
          timestamp: 0,
          position: { x: 50, y: 20 },
          createdAt: '2024-02-01T09:45:00Z',
          type: 'revision'
        }
      ],
      likes: 8,
      isLiked: false,
      viewCount: 23
    }
  ])

  const handleVideoComment = (fileId: string, timestamp: number, content: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      user: { name: 'Current User', role: 'freelancer' },
      content,
      timestamp,
      createdAt: new Date().toISOString(),
      type: 'note'
    }
    
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, comments: [...file.comments, newComment] }
        : file
    ))
  }

  const handleImageComment = (fileId: string, position: { x: number; y: number }, content: string) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      user: { name: 'Current User', role: 'freelancer' },
      content,
      timestamp: 0,
      position,
      createdAt: new Date().toISOString(),
      type: 'note'
    }
    
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, comments: [...file.comments, newComment] }
        : file
    ))
  }

  const handleApproval = (fileId: string, status: 'approved' | 'revision_requested' | 'rejected', message?: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status }
        : file
    ))
  }

  const getCommentTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-100 text-blue-800'
      case 'revision': return 'bg-orange-100 text-orange-800'
      case 'approval': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'revision_requested': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            🤝 Client Collaboration
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time feedback and approval system for your creative work
          </p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Share2 className="mr-2 h-4 w-4" />
          Share Project
        </Button>
      </div>

      {/* Collaboration Tabs */}
      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Reviews & Feedback
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Files
          </TabsTrigger>
        </TabsList>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          {files.map((file) => (
            <Card key={file.id} className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {file.type === 'video' && <Video className="h-5 w-5 text-blue-600" />}
                    {file.type === 'image' && <Image className="h-5 w-5 text-green-600" />}
                    {file.type === 'document' && <FileText className="h-5 w-5 text-purple-600" />}
                    
                    <div>
                      <CardTitle className="text-xl">{file.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {file.viewCount} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {file.comments.length} comments
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className={`h-4 w-4 ${file.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                          {file.likes} likes
                        </span>
                        {file.status && (
                          <Badge className={getStatusColor(file.status)}>
                            {file.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Media Viewer */}
                {file.type === 'video' && (
                  <VideoPlayer 
                    file={file} 
                    onAddComment={(timestamp, content) => handleVideoComment(file.id, timestamp, content)} 
                  />
                )}
                
                {file.type === 'image' && (
                  <ImageViewer 
                    file={file} 
                    onAddComment={(position, content) => handleImageComment(file.id, position, content)} 
                  />
                )}

                {/* Comments Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments & Feedback
                  </h4>
                  
                  <div className="space-y-4">
                    {file.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.user.avatar} />
                          <AvatarFallback>
                            {comment.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{comment.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.user.role}
                            </Badge>
                            <Badge className={getCommentTypeColor(comment.type)}>
                              {comment.type}
                            </Badge>
                            {comment.timestamp > 0 && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {Math.floor(comment.timestamp / 60)}:{Math.floor(comment.timestamp % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700">{comment.content}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            <button className="flex items-center gap-1 hover:text-blue-600">
                              <ThumbsUp className="h-3 w-3" />
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Heart className="mr-2 h-4 w-4" />
                    {file.isLiked ? 'Liked' : 'Like'}
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-6">
          <div className="grid gap-6">
            {files.filter(f => f.status === 'pending').map((file) => (
              <Card key={file.id} className="border-yellow-200 bg-yellow-50/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        {file.type === 'video' && <Video className="h-5 w-5 text-blue-600" />}
                        {file.type === 'image' && <Image className="h-5 w-5 text-green-600" />}
                        
                        <div>
                          <h4 className="font-semibold text-gray-900">{file.name}</h4>
                          <p className="text-sm text-gray-600">
                            Submitted {file.submittedAt && new Date(file.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <Badge className={getStatusColor(file.status)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Pending Review
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproval(file.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(file.id, 'revision_requested')}
                        className="text-orange-600 border-orange-200"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Request Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApproval(file.id, 'rejected')}
                        className="text-red-600 border-red-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <FileUploadZone 
            onUploadComplete={(uploadedFiles) => {
              // Handle completed uploads
              console.log('Files uploaded:', uploadedFiles)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 