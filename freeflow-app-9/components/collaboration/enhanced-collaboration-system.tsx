'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Play, 
  Pause, 
  MessageCircle, 
  Heart, 
  ThumbsUp, 
  ThumbsDown, 
  Star,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Users,
  Bell,
  AlertCircle,
  CheckSquare,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface VideoAnnotation {
  id: string
  timestamp: number
  content: string
  type: 'comment' | 'note' | 'suggestion' | 'issue' | 'approval_required'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  author: {
    id: string
    name: string
    avatar?: string
  }
  reactions: Reaction[]
  isResolved: boolean
  createdAt: string
}

interface ImageAnnotation {
  id: string
  position: { x: number; y: number }
  content: string
  type: 'comment' | 'note' | 'suggestion' | 'issue' | 'approval_required'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  author: {
    id: string
    name: string
    avatar?: string
  }
  reactions: Reaction[]
  isResolved: boolean
  createdAt: string
}

interface Reaction {
  type: 'like' | 'love' | 'laugh' | 'wow' | 'sad' | 'angry' | 'approve' | 'reject'
  users: string[]
}

interface ClientPreference {
  id: string
  fileId: string
  type: 'favorite' | 'like' | 'dislike' | 'selected_for_final'
  notes?: string
  createdAt: string
}

interface ApprovalStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'revision_requested'
  requiredApprovers: string[]
  completedApprovers: string[]
  dueDate?: string
  autoAdvance: boolean
  escrowTrigger: boolean
}

interface EnhancedCollaborationSystemProps {
  projectId: string
  fileId: string
  fileType: 'video' | 'image'
  fileUrl: string
  thumbnailUrl?: string
  escrowStatus: 'pending' | 'funded' | 'milestone_released' | 'fully_released'
  downloadPassword?: string
  currentUser: {
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer'
  }
  collaborators: Array<{
    id: string
    name: string
    avatar?: string
    role: 'client' | 'freelancer' | 'reviewer'
    isOnline: boolean
  }>
}

export function EnhancedCollaborationSystem({
  projectId,
  fileId,
  fileType,
  fileUrl,
  thumbnailUrl,
  escrowStatus,
  downloadPassword,
  currentUser,
  collaborators
}: EnhancedCollaborationSystemProps) {
  // State management
  const [videoAnnotations, setVideoAnnotations] = useState<VideoAnnotation[]>([])
  const [imageAnnotations, setImageAnnotations] = useState<ImageAnnotation[]>([])
  const [preferences, setPreferences] = useState<ClientPreference[]>([])
  const [approvalSteps, setApprovalSteps] = useState<ApprovalStep[]>([])
  const [realTimeActivity, setRealTimeActivity] = useState<any[]>([])
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)
  
  // Annotation state
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [newAnnotationTime, setNewAnnotationTime] = useState<number | null>(null)
  const [newAnnotationPosition, setNewAnnotationPosition] = useState<{x: number, y: number} | null>(null)
  const [annotationContent, setAnnotationContent] = useState('')
  const [annotationType, setAnnotationType] = useState<'comment' | 'note' | 'suggestion' | 'issue' | 'approval_required'>('comment')
  const [annotationPriority, setAnnotationPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  
  // UI state
  const [activeTab, setActiveTab] = useState('annotations')
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false)
  const [downloadAccessDialog, setDownloadAccessDialog] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')

  useEffect(() => {
    loadCollaborationData()
    setupRealTimeListeners()
  }, [projectId, fileId])

  const loadCollaborationData = async () => {
    try {
      const [annotationsRes, preferencesRes, activityRes, approvalRes] = await Promise.all([
        fetch(`/api/collaboration/enhanced?action=get_annotations&fileId=${fileId}`),
        fetch(`/api/collaboration/enhanced?action=get_preferences&projectId=${projectId}`),
        fetch(`/api/collaboration/enhanced?action=get_activity&projectId=${projectId}`),
        fetch(`/api/collaboration/enhanced?action=get_approval_status&projectId=${projectId}`)
      ])

      const [annotations, prefs, activity, approval] = await Promise.all([
        annotationsRes.json(),
        preferencesRes.json(),
        activityRes.json(),
        approvalRes.json()
      ])

      setVideoAnnotations(annotations.videoAnnotations || [])
      setImageAnnotations(annotations.imageAnnotations || [])
      setPreferences(prefs.preferences || [])
      setRealTimeActivity(activity.activity || [])
      setApprovalSteps(approval.steps || [])
    } catch (error) {
      console.error('Failed to load collaboration data:', error)
    }
  }

  const setupRealTimeListeners = () => {
    // In production, this would be WebSocket/SSE connections
    const interval = setInterval(() => {
      loadCollaborationData()
    }, 5000) // Poll every 5 seconds for demo

    return () => clearInterval(interval)
  }

  // Video player controls
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  // Annotation functions
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isAddingAnnotation && videoRef.current) {
      setNewAnnotationTime(videoRef.current.currentTime)
      setIsAddingAnnotation(false)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isAddingAnnotation) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setNewAnnotationPosition({ x, y })
      setIsAddingAnnotation(false)
    }
  }

  const submitAnnotation = async () => {
    if (!annotationContent.trim()) return

    try {
      const response = await fetch('/api/collaboration/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: fileType === 'video' ? 'add_video_annotation' : 'add_image_annotation',
          fileId,
          content: annotationContent,
          timestamp: newAnnotationTime,
          position: newAnnotationPosition,
          type: annotationType,
          priority: annotationPriority,
          mentions: extractMentions(annotationContent)
        })
      })

      if (response.ok) {
        setAnnotationContent('')
        setNewAnnotationTime(null)
        setNewAnnotationPosition(null)
        loadCollaborationData()
      }
    } catch (error) {
      console.error('Failed to submit annotation:', error)
    }
  }

  const updateClientPreference = async (type: 'favorite' | 'like' | 'dislike' | 'selected_for_final', notes?: string) => {
    try {
      const response = await fetch('/api/collaboration/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_client_preference',
          fileId,
          type,
          notes
        })
      })

      if (response.ok) {
        loadCollaborationData()
      }
    } catch (error) {
      console.error('Failed to update preference:', error)
    }
  }

  const submitApproval = async (stepId: string, status: 'approved' | 'rejected' | 'revision_requested', comments?: string) => {
    try {
      const response = await fetch('/api/collaboration/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_approval',
          projectId,
          stepId,
          status,
          comments,
          triggerEscrow: true
        })
      })

      if (response.ok) {
        loadCollaborationData()
      }
    } catch (error) {
      console.error('Failed to submit approval:', error)
    }
  }

  const handleDownloadAccess = async () => {
    if (!passwordInput.trim()) return

    try {
      const response = await fetch('/api/collaboration/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_download_access',
          projectId,
          password: passwordInput
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        // Handle successful download access
        window.open(result.downloadTokens[0]?.downloadUrl, '_blank')
        setDownloadAccessDialog(false)
        setPasswordInput('')
      } else {
        alert(result.error || 'Invalid password')
      }
    } catch (error) {
      console.error('Failed to generate download access:', error)
    }
  }

  const extractMentions = (content: string): string[] => {
    const mentions = content.match(/@(\w+)/g)
    return mentions ? mentions.map(m => m.substring(1)) : []
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPreferenceForFile = (type: string) => {
    return preferences.find(p => p.fileId === fileId && p.type === type)
  }

  const currentAnnotations = fileType === 'video' ? videoAnnotations : imageAnnotations

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with file info and collaborators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Collaboration Center</h2>
          <Badge variant={escrowStatus === 'fully_released' ? 'default' : 'secondary'}>
            {escrowStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Online collaborators */}
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-500" />
            <div className="flex -space-x-2">
              {collaborators.filter(c => c.isOnline).map((collaborator) => (
                <Avatar key={collaborator.id} className="border-2 border-white w-8 h-8">
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback>{collaborator.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* Download button */}
          {escrowStatus === 'fully_released' && (
            <Dialog open={downloadAccessDialog} onOpenChange={setDownloadAccessDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Download Password</DialogTitle>
                  <DialogDescription>
                    Please enter the password provided to access your project files.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="password"
                    placeholder="Download password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleDownloadAccess()}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setDownloadAccessDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleDownloadAccess}>
                      Access Downloads
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Media viewer */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-0">
              {fileType === 'video' ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={fileUrl}
                    poster={thumbnailUrl}
                    className="w-full rounded-lg cursor-pointer"
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={handleVideoClick}
                  />
                  
                  {/* Video controls */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <div className="flex-1 flex items-center space-x-2">
                        <span className="text-white text-sm">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-2 bg-white/20 rounded-full">
                          <div
                            className="h-full bg-white rounded-full"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{formatTime(duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Video annotations overlay */}
                  {showAnnotations && videoAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-lg cursor-pointer"
                      style={{
                        display: Math.abs(currentTime - annotation.timestamp) < 2 ? 'block' : 'none'
                      }}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={fileUrl}
                    alt="Project file"
                    className="w-full rounded-lg cursor-pointer"
                    onClick={handleImageClick}
                  />
                  
                  {/* Image annotations overlay */}
                  {showAnnotations && imageAnnotations.map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute bg-blue-500 text-white p-2 rounded-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${annotation.position.x}%`,
                        top: `${annotation.position.y}%`
                      }}
                      onClick={() => setSelectedAnnotation(annotation.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client preferences */}
          {currentUser.role === 'client' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Your Preferences</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={getPreferenceForFile('favorite') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateClientPreference('favorite')}
                    className="space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Favorite</span>
                  </Button>
                  
                  <Button
                    variant={getPreferenceForFile('like') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateClientPreference('like')}
                    className="space-x-2"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Like</span>
                  </Button>
                  
                  <Button
                    variant={getPreferenceForFile('dislike') ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => updateClientPreference('dislike')}
                    className="space-x-2"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Dislike</span>
                  </Button>
                  
                  <Button
                    variant={getPreferenceForFile('selected_for_final') ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateClientPreference('selected_for_final')}
                    className="space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Select for Final</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Collaboration panel */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="annotations">
                <MessageCircle className="h-4 w-4 mr-2" />
                Comments
              </TabsTrigger>
              <TabsTrigger value="approval">
                <CheckSquare className="h-4 w-4 mr-2" />
                Approval
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Bell className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="annotations" className="space-y-4">
              {/* Add annotation */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Comment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Select value={annotationType} onValueChange={(value: any) => setAnnotationType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comment">Comment</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                        <SelectItem value="suggestion">Suggestion</SelectItem>
                        <SelectItem value="issue">Issue</SelectItem>
                        <SelectItem value="approval_required">Needs Approval</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={annotationPriority} onValueChange={(value: any) => setAnnotationPriority(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Textarea
                    placeholder={fileType === 'video' ? 
                      'Click on the video to add a time-specific comment...' : 
                      'Click on the image to add a position-specific comment...'
                    }
                    value={annotationContent}
                    onChange={(e) => setAnnotationContent(e.target.value)}
                  />
                  
                  {(newAnnotationTime !== null || newAnnotationPosition !== null) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {fileType === 'video' 
                          ? `Time: ${formatTime(newAnnotationTime || 0)}`
                          : `Position: ${newAnnotationPosition?.x.toFixed(1)}%, ${newAnnotationPosition?.y.toFixed(1)}%`
                        }
                      </span>
                      <Button onClick={submitAnnotation} size="sm">
                        <Send className="h-4 w-4 mr-2" />
                        Submit
                      </Button>
                    </div>
                  )}
                  
                  {!isAddingAnnotation && newAnnotationTime === null && newAnnotationPosition === null && (
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingAnnotation(true)}
                      className="w-full"
                    >
                      Click {fileType} to select {fileType === 'video' ? 'time' : 'position'}
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Annotations list */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {currentAnnotations.map((annotation) => (
                  <Card key={annotation.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={annotation.author.avatar} />
                        <AvatarFallback>{annotation.author.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{annotation.author.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {annotation.type}
                            </Badge>
                            <Badge variant={
                              annotation.priority === 'urgent' ? 'destructive' :
                              annotation.priority === 'high' ? 'default' :
                              'secondary'
                            } className="text-xs">
                              {annotation.priority}
                            </Badge>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {fileType === 'video' ? formatTime(annotation.timestamp) : 
                             `${annotation.position.x.toFixed(1)}%, ${annotation.position.y.toFixed(1)}%`}
                          </span>
                        </div>
                        
                        <p className="text-sm">{annotation.content}</p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {['like', 'love', 'approve'].map((reactionType) => {
                              const reaction = annotation.reactions.find(r => r.type === reactionType)
                              return (
                                <Button
                                  key={reactionType}
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                >
                                  {reactionType === 'like' && <ThumbsUp className="h-3 w-3 mr-1" />}
                                  {reactionType === 'love' && <Heart className="h-3 w-3 mr-1" />}
                                  {reactionType === 'approve' && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {reaction?.users.length || 0}
                                </Button>
                              )
                            })}
                          </div>
                          
                          {fileType === 'video' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => seekToTime(annotation.timestamp)}
                              className="h-6 px-2 text-xs"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Go to time
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approval" className="space-y-4">
              {approvalSteps.map((step) => (
                <Card key={step.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{step.name}</span>
                      <Badge variant={
                        step.status === 'approved' ? 'default' :
                        step.status === 'rejected' ? 'destructive' :
                        step.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {step.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{step.description}</p>
                    
                    {step.status === 'in_progress' && step.requiredApprovers.includes(currentUser.id) && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => submitApproval(step.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => submitApproval(step.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => submitApproval(step.id, 'revision_requested')}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                      </div>
                    )}
                    
                    {step.escrowTrigger && (
                      <div className="flex items-center space-x-2 text-sm text-amber-600">
                        <Lock className="h-4 w-4" />
                        <span>Triggers escrow release when approved</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity" className="space-y-3">
              <div className="max-h-96 overflow-y-auto space-y-3">
                {realTimeActivity.map((activity) => (
                  <Card key={activity.id} className="p-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={activity.user?.avatar_url} />
                        <AvatarFallback>{activity.user?.full_name?.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{activity.user?.full_name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          {activity.type === 'annotation_added' && 'Added a comment'}
                          {activity.type === 'approval_given' && 'Submitted an approval'}
                          {activity.type === 'escrow_updated' && 'Updated escrow status'}
                          {activity.type === 'download_unlocked' && 'Unlocked downloads'}
                        </p>
                        
                        {activity.priority === 'high' && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            High Priority
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 