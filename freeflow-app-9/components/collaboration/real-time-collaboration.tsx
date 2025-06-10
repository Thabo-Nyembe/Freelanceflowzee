'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Video, 
  Image as ImageIcon, 
  Bell, 
  Send, 
  CheckCircle, 
  Clock, 
  Eye, 
  Heart, 
  Play, 
  Pause,
  MoreHorizontal,
  Users,
  Zap,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Share2,
  Download,
  Pin,
  Star,
  Wifi,
  WifiOff,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  MonitorOff
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'freelancer' | 'client' | 'admin'
  isOnline: boolean
  lastSeen?: string
}

interface MediaFile {
  id: string
  name: string
  type: 'video' | 'image' | 'document'
  url: string
  thumbnail?: string
  duration?: number
  uploadedBy: string
  uploadedAt: string
  status: 'pending' | 'in_review' | 'approved' | 'revision_requested' | 'rejected'
  comments: Comment[]
  approvals: Approval[]
  viewCount: number
  downloadCount: number
  likes: number
  isLiked: boolean
}

interface Comment {
  id: string
  userId: string
  content: string
  timestamp?: number // For video time-code comments
  position?: { x: number; y: number } // For image annotations
  createdAt: string
  updatedAt?: string
  type: 'comment' | 'note' | 'suggestion' | 'issue'
  isResolved: boolean
  replies: Comment[]
  reactions: Reaction[]
  mentions: string[]
}

interface Approval {
  id: string
  userId: string
  status: 'approved' | 'rejected' | 'revision_requested'
  message?: string
  createdAt: string
  conditions?: string[]
}

interface Reaction {
  userId: string
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry'
  createdAt: string
}

interface NotificationItem {
  id: string
  type: 'comment' | 'approval' | 'mention' | 'upload' | 'status_change'
  title: string
  message: string
  fileId?: string
  fromUser: string
  createdAt: string
  isRead: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionRequired: boolean
}

interface WorkflowStep {
  id: string
  name: string
  description: string
  requiredApprovers: string[]
  isCompleted: boolean
  completedAt?: string
  autoAdvance: boolean
}

export function RealTimeCollaborationSystem() {
  const [currentUser] = useState<User>({
    id: 'user_001',
    name: 'Alex Designer',
    email: 'alex@freelancer.com',
    avatar: '/avatars/alex.jpg',
    role: 'freelancer',
    isOnline: true
  })

  const [connectedUsers, setConnectedUsers] = useState<User[]>([
    {
      id: 'user_002',
      name: 'Sarah Johnson',
      email: 'sarah@client.com',
      avatar: '/avatars/sarah.jpg',
      role: 'client',
      isOnline: true
    },
    {
      id: 'user_003',
      name: 'Mike Wilson',
      email: 'mike@client.com',
      role: 'client',
      isOnline: false,
      lastSeen: '2024-02-01T15:30:00Z'
    }
  ])

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([
    {
      id: 'file_001',
      name: 'Brand Animation Preview',
      type: 'video',
      url: '/videos/brand-animation.mp4',
      thumbnail: '/images/video-thumb.jpg',
      duration: 145,
      uploadedBy: 'user_001',
      uploadedAt: '2024-02-01T10:00:00Z',
      status: 'in_review',
      viewCount: 23,
      downloadCount: 5,
      likes: 8,
      isLiked: false,
      comments: [
        {
          id: 'comment_001',
          userId: 'user_002',
          content: 'Love the transition at 0:23! Can we make it slightly slower?',
          timestamp: 23,
          createdAt: '2024-02-01T11:30:00Z',
          type: 'suggestion',
          isResolved: false,
          replies: [
            {
              id: 'reply_001',
              userId: 'user_001',
              content: 'Absolutely! I\'ll adjust the timing.',
              createdAt: '2024-02-01T11:45:00Z',
              type: 'comment',
              isResolved: false,
              replies: [],
              reactions: [
                { userId: 'user_002', type: 'like', createdAt: '2024-02-01T11:46:00Z' }
              ],
              mentions: []
            }
          ],
          reactions: [
            { userId: 'user_001', type: 'like', createdAt: '2024-02-01T11:31:00Z' }
          ],
          mentions: ['user_001']
        }
      ],
      approvals: [
        {
          id: 'approval_001',
          userId: 'user_002',
          status: 'revision_requested',
          message: 'Great work! Just need the timing adjustment mentioned in comments.',
          createdAt: '2024-02-01T12:00:00Z',
          conditions: ['Slow down transition at 0:23']
        }
      ]
    },
    {
      id: 'file_002',
      name: 'Homepage Mockup v3',
      type: 'image',
      url: '/images/homepage-mockup.jpg',
      uploadedBy: 'user_001',
      uploadedAt: '2024-02-01T14:00:00Z',
      status: 'pending',
      viewCount: 15,
      downloadCount: 2,
      likes: 12,
      isLiked: true,
      comments: [
        {
          id: 'comment_002',
          userId: 'user_002',
          content: 'The header section looks fantastic! Maybe we could try a different font for the CTA button?',
          position: { x: 50, y: 25 },
          createdAt: '2024-02-01T14:30:00Z',
          type: 'suggestion',
          isResolved: false,
          replies: [],
          reactions: [],
          mentions: []
        }
      ],
      approvals: []
    }
  ])

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_001',
      type: 'comment',
      title: 'New comment on Brand Animation',
      message: 'Sarah Johnson added a comment with timestamp',
      fileId: 'file_001',
      fromUser: 'user_002',
      createdAt: '2024-02-01T11:30:00Z',
      isRead: false,
      priority: 'medium',
      actionRequired: true
    },
    {
      id: 'notif_002',
      type: 'approval',
      title: 'Revision requested',
      message: 'Sarah Johnson requested revisions on Brand Animation',
      fileId: 'file_001',
      fromUser: 'user_002',
      createdAt: '2024-02-01T12:00:00Z',
      isRead: false,
      priority: 'high',
      actionRequired: true
    }
  ])

  const [workflowSteps] = useState<WorkflowStep[]>([
    {
      id: 'step_001',
      name: 'Initial Review',
      description: 'Client reviews and provides initial feedback',
      requiredApprovers: ['user_002'],
      isCompleted: true,
      completedAt: '2024-02-01T12:00:00Z',
      autoAdvance: true
    },
    {
      id: 'step_002',
      name: 'Revision Implementation',
      description: 'Freelancer implements requested changes',
      requiredApprovers: ['user_001'],
      isCompleted: false,
      autoAdvance: false
    },
    {
      id: 'step_003',
      name: 'Final Approval',
      description: 'Client provides final approval for delivery',
      requiredApprovers: ['user_002', 'user_003'],
      isCompleted: false,
      autoAdvance: true
    }
  ])

  const [isConnected, setIsConnected] = useState(true)
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(mediaFiles[0])
  const [newComment, setNewComment] = useState('')
  const [commentType, setCommentType] = useState<'comment' | 'note' | 'suggestion' | 'issue'>('comment')
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isCallInProgress, setIsCallInProgress] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)

  // Simulate WebSocket connection
  useEffect(() => {
    const simulateWebSocket = () => {
      // Simulate connection status changes
      const connectionInterval = setInterval(() => {
        setIsConnected(prev => Math.random() > 0.1 ? true : prev)
      }, 5000)

      // Simulate real-time updates
      const updateInterval = setInterval(() => {
        if (Math.random() > 0.7) {
          // Simulate new notification
          const newNotif: NotificationItem = {
            id: `notif_${Date.now()}`,
            type: 'comment',
            title: 'Real-time update',
            message: 'New activity detected',
            fromUser: 'user_002',
            createdAt: new Date().toISOString(),
            isRead: false,
            priority: 'low',
            actionRequired: false
          }
          setNotifications(prev => [newNotif, ...prev.slice(0, 9)])
        }
      }, 10000)

      return () => {
        clearInterval(connectionInterval)
        clearInterval(updateInterval)
      }
    }

    return simulateWebSocket()
  }, [])

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedFile) return

    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      content: newComment,
      timestamp: selectedFile.type === 'video' ? currentVideoTime : undefined,
      createdAt: new Date().toISOString(),
      type: commentType,
      isResolved: false,
      replies: [],
      reactions: [],
      mentions: []
    }

    setMediaFiles(prev => prev.map(file =>
      file.id === selectedFile.id
        ? { ...file, comments: [...file.comments, comment] }
        : file
    ))

    // Create notification for other users
    const notification: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'comment',
      title: `New ${commentType} on ${selectedFile.name}`,
      message: newComment.substring(0, 100) + (newComment.length > 100 ? '...' : ''),
      fileId: selectedFile.id,
      fromUser: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      priority: commentType === 'issue' ? 'high' : 'medium',
      actionRequired: commentType === 'issue'
    }

    setNotifications(prev => [notification, ...prev])
    setNewComment('')
  }

  const handleApproval = (status: 'approved' | 'rejected' | 'revision_requested', message?: string) => {
    if (!selectedFile) return

    const approval: Approval = {
      id: `approval_${Date.now()}`,
      userId: currentUser.id,
      status,
      message,
      createdAt: new Date().toISOString()
    }

    setMediaFiles(prev => prev.map(file =>
      file.id === selectedFile.id
        ? { 
            ...file, 
            approvals: [...file.approvals, approval],
            status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'revision_requested'
          }
        : file
    ))

    // Create notification
    const notification: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'approval',
      title: `File ${status.replace('_', ' ')}`,
      message: message || `${selectedFile.name} was ${status.replace('_', ' ')}`,
      fileId: selectedFile.id,
      fromUser: currentUser.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      priority: status === 'rejected' ? 'high' : 'medium',
      actionRequired: status === 'revision_requested'
    }

    setNotifications(prev => [notification, ...prev])
  }

  const handleReaction = (commentId: string, reactionType: Reaction['type']) => {
    setMediaFiles(prev => prev.map(file => ({
      ...file,
      comments: file.comments.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              reactions: comment.reactions.filter(r => r.userId !== currentUser.id).concat([
                { userId: currentUser.id, type: reactionType, createdAt: new Date().toISOString() }
              ])
            }
          : comment
      )
    })))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      case 'revision_requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'in_review': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length
  const getUserById = (id: string) => connectedUsers.find(u => u.id === id) || currentUser

  // Call management functions
  const startCall = (type: 'audio' | 'video') => {
    setCallType(type)
    setIsCallInProgress(true)
    setCallDuration(0)
    
    // Simulate call connection and timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1)
    }, 1000)
    
    // Store timer ID for cleanup
    // In production, this would be real WebRTC implementation
  }

  const endCall = () => {
    setIsCallInProgress(false)
    setCallType(null)
    setCallDuration(0)
    setIsMuted(false)
    setIsCameraOn(true)
    setIsScreenSharing(false)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn)
  }

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing)
  }

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🤝 Real-Time Collaboration Hub
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            Enhanced workflow management with live feedback and approvals
            <Badge className={isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connected Users */}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <div className="flex -space-x-2">
              {connectedUsers.filter(u => u.isOnline).map(user => (
                <Avatar key={user.id} className="border-2 border-white h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <Button
            variant="outline"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
              >
                Mark All Read
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-100 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-900' : 'text-blue-900'
                        }`}>
                          {notification.title}
                        </span>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          From {getUserById(notification.fromUser).name} • {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                        {notification.actionRequired && (
                          <Badge className="bg-orange-100 text-orange-800">
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-indigo-600" />
                Project Files
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mediaFiles.map(file => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedFile?.id === file.id 
                        ? 'ring-2 ring-indigo-500 bg-indigo-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedFile(file)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {file.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                          {file.type === 'image' && <ImageIcon className="h-4 w-4 text-green-600" />}
                          <span className="font-medium text-sm">{file.name}</span>
                        </div>
                        <Badge className={getStatusColor(file.status)}>
                          {file.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{file.comments.length} comments</span>
                          <span>{file.viewCount} views</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>{file.likes} likes</span>
                          <span>By {getUserById(file.uploadedBy).name}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media Viewer */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedFile.type === 'video' && <Video className="h-5 w-5 text-blue-600" />}
                    {selectedFile.type === 'image' && <ImageIcon className="h-5 w-5 text-green-600" />}
                    {selectedFile.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedFile.status)}>
                      {selectedFile.status.replace('_', ' ')}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Media Display */}
                <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                  {selectedFile.type === 'video' ? (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={selectedFile.url}
                        className="w-full h-auto"
                        controls
                        onTimeUpdate={(e) => setCurrentVideoTime((e.target as HTMLVideoElement).currentTime)}
                      />
                      
                      {/* Time-code Comments */}
                      {selectedFile.comments
                        .filter(c => c.timestamp !== undefined)
                        .map(comment => (
                          <div
                            key={comment.id}
                            className="absolute top-2 bg-yellow-400 text-black px-2 py-1 rounded text-xs font-medium cursor-pointer hover:bg-yellow-300"
                            style={{ left: `${(comment.timestamp! / (selectedFile.duration || 1)) * 100}%` }}
                            onClick={() => {
                              if (videoRef.current) {
                                videoRef.current.currentTime = comment.timestamp!
                              }
                            }}
                            title={comment.content}
                          >
                            {formatTime(comment.timestamp!)}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={selectedFile.url} 
                        alt={selectedFile.name}
                        className="w-full h-auto"
                      />
                      
                      {/* Position Comments */}
                      {selectedFile.comments
                        .filter(c => c.position)
                        .map(comment => (
                          <div
                            key={comment.id}
                            className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-red-600 transform -translate-x-1/2 -translate-y-1/2"
                            style={{ 
                              left: `${comment.position!.x}%`, 
                              top: `${comment.position!.y}%` 
                            }}
                            title={comment.content}
                          >
                            <Pin className="h-3 w-3" />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* File Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedFile.viewCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {selectedFile.comments.length} comments
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className={`h-4 w-4 ${selectedFile.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      {selectedFile.likes} likes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Add Comment Form */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={commentType}
                          onChange={(e) => setCommentType(e.target.value as any)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="comment">Comment</option>
                          <option value="note">Note</option>
                          <option value="suggestion">Suggestion</option>
                          <option value="issue">Issue</option>
                        </select>
                        {selectedFile.type === 'video' && (
                          <Badge variant="outline" className="text-xs">
                            At {formatTime(currentVideoTime)}
                          </Badge>
                        )}
                      </div>
                      
                      <Textarea
                        placeholder={`Add a ${commentType}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="resize-none"
                        rows={3}
                      />
                      
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startCall('audio')}
                            size="sm"
                            variant="outline"
                            className="border-green-200 text-green-600 hover:bg-green-50"
                            disabled={isCallInProgress}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            Audio Call
                          </Button>
                          <Button
                            onClick={() => startCall('video')}
                            size="sm"
                            variant="outline"
                            className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            disabled={isCallInProgress}
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Video Call
                          </Button>
                        </div>
                        <Button
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Add {commentType}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Approval Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Approval Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="flex items-start gap-3">
                  <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center ${
                    step.isCompleted ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}>
                    {step.isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                    {!step.isCompleted && index === 1 && <Clock className="h-3 w-3 text-white" />}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{step.name}</h4>
                    <p className="text-xs text-gray-600">{step.description}</p>
                    <div className="mt-1 text-xs text-gray-500">
                      Approvers: {step.requiredApprovers.map(id => getUserById(id).name).join(', ')}
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedFile && currentUser.role === 'client' && (
                <div className="pt-4 border-t space-y-2">
                  <h5 className="font-medium text-sm">Provide Approval</h5>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApproval('approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproval('revision_requested', 'Please make the requested changes')}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproval('rejected', 'This needs significant changes')}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments List */}
          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Comments ({selectedFile.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedFile.comments.map(comment => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={getUserById(comment.userId).avatar} />
                            <AvatarFallback className="text-xs">
                              {getUserById(comment.userId).name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">
                            {getUserById(comment.userId).name}
                          </span>
                          <Badge className={`text-xs ${
                            comment.type === 'issue' ? 'bg-red-100 text-red-800' :
                            comment.type === 'suggestion' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {comment.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-700">{comment.content}</p>
                      
                      {comment.timestamp !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(comment.timestamp)}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {(['like', 'love', 'wow'] as const).map(reactionType => (
                          <Button
                            key={reactionType}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReaction(comment.id, reactionType)}
                            className="h-6 px-2 text-xs"
                          >
                            {reactionType === 'like' && '👍'}
                            {reactionType === 'love' && '❤️'}
                            {reactionType === 'wow' && '😮'}
                            <span className="ml-1">
                              {comment.reactions.filter(r => r.type === reactionType).length}
                            </span>
                          </Button>
                        ))}
                      </div>
                    </div>
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