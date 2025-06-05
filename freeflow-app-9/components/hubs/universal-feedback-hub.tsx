"use client"

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  FileAudio,
  FileText,
  Code,
  Camera,
  Upload,
  MapPin,
  MessageSquare,
  Clock,
  Eye,
  Download,
  Share,
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface FeedbackItem {
  id: string
  project_id: string
  project_title: string
  media_type: 'image' | 'video' | 'audio' | 'document' | 'code' | 'screenshot'
  media_url: string
  title: string
  description: string
  feedback_points: Array<{
    id: string
    x: number
    y: number
    comment: string
    status: 'pending' | 'in-progress' | 'resolved'
    created_by: string
    created_at: string
    replies?: Array<{
      id: string
      comment: string
      created_by: string
      created_at: string
    }>
  }>
  status: 'open' | 'in-review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  created_by: string
  created_at: string
  updated_at: string
}

interface UniversalFeedbackHubProps {
  projects: any[]
  userId: string
}

const mediaTypeIcons = {
  image: ImageIcon,
  video: Video,
  audio: FileAudio,
  document: FileText,
  code: Code,
  screenshot: Camera,
}

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-review': 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
}

const pointStatusColors = {
  pending: 'bg-red-500',
  'in-progress': 'bg-yellow-500',
  resolved: 'bg-green-500',
}

// Mock feedback data
const mockFeedbackItems: FeedbackItem[] = [
  {
    id: 'fb-1',
    project_id: 'proj-1',
    project_title: 'E-commerce Website Redesign',
    media_type: 'image',
    media_url: '/demo/design-mockup.jpg',
    title: 'Homepage Design Review',
    description: 'Initial design review for the new homepage layout',
    feedback_points: [
      {
        id: 'point-1',
        x: 25,
        y: 30,
        comment: 'The header logo needs to be larger for better brand visibility',
        status: 'pending',
        created_by: 'John Client',
        created_at: '2024-02-15T10:30:00Z',
        replies: [
          {
            id: 'reply-1',
            comment: 'Agreed, I\'ll increase the logo size by 20%',
            created_by: 'You',
            created_at: '2024-02-15T11:00:00Z'
          }
        ]
      },
      {
        id: 'point-2',
        x: 70,
        y: 60,
        comment: 'The CTA button color doesn\'t match the brand guidelines',
        status: 'in-progress',
        created_by: 'Jane Designer',
        created_at: '2024-02-15T14:20:00Z'
      }
    ],
    status: 'open',
    priority: 'high',
    created_by: 'John Client',
    created_at: '2024-02-15T09:00:00Z',
    updated_at: '2024-02-15T14:20:00Z'
  },
  {
    id: 'fb-2',
    project_id: 'proj-2',
    project_title: 'Mobile App Development',
    media_type: 'video',
    media_url: '/demo/app-demo.mp4',
    title: 'App Flow Demo Review',
    description: 'User flow demonstration for the mobile app',
    feedback_points: [
      {
        id: 'point-3',
        x: 50,
        y: 40,
        comment: 'The animation feels too slow, can we speed it up?',
        status: 'resolved',
        created_by: 'Mike Product Manager',
        created_at: '2024-02-14T16:45:00Z'
      }
    ],
    status: 'completed',
    priority: 'medium',
    created_by: 'Mike Product Manager',
    created_at: '2024-02-14T15:00:00Z',
    updated_at: '2024-02-15T08:30:00Z'
  },
  {
    id: 'fb-3',
    project_id: 'proj-1',
    project_title: 'E-commerce Website Redesign',
    media_type: 'code',
    media_url: '/demo/component-code.tsx',
    title: 'React Component Review',
    description: 'Code review for the new product card component',
    feedback_points: [
      {
        id: 'point-4',
        x: 15,
        y: 25,
        comment: 'Consider using TypeScript interfaces for better type safety',
        status: 'pending',
        created_by: 'Tech Lead',
        created_at: '2024-02-15T13:00:00Z'
      }
    ],
    status: 'open',
    priority: 'low',
    created_by: 'Tech Lead',
    created_at: '2024-02-15T12:30:00Z',
    updated_at: '2024-02-15T13:00:00Z'
  }
]

export function UniversalFeedbackHub({ projects, userId }: UniversalFeedbackHubProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [feedbackPoints, setFeedbackPoints] = useState<Array<{x: number, y: number, comment: string}>>([])
  const [currentPosition, setCurrentPosition] = useState<{x: number, y: number} | null>(null)
  const [newComment, setNewComment] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaViewerRef = useRef<HTMLDivElement>(null)

  // Use mock data for now
  const allFeedbackItems = mockFeedbackItems

  // Filter feedback items
  const filteredItems = allFeedbackItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.project_title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMediaType = mediaTypeFilter === 'all' || item.media_type === mediaTypeFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesProject = projectFilter === 'all' || item.project_id === projectFilter
    
    return matchesSearch && matchesMediaType && matchesStatus && matchesProject
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleMediaClick = (event: React.MouseEvent, feedback: FeedbackItem) => {
    if (!mediaViewerRef.current) return
    
    const rect = mediaViewerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    
    setCurrentPosition({ x, y })
  }

  const addFeedbackPoint = () => {
    if (!currentPosition || !newComment.trim()) return
    
    const newPoint = {
      x: currentPosition.x,
      y: currentPosition.y,
      comment: newComment.trim()
    }
    
    setFeedbackPoints([...feedbackPoints, newPoint])
    setCurrentPosition(null)
    setNewComment('')
  }

  const MediaViewer = ({ feedback }: { feedback: FeedbackItem }) => {
    const MediaIcon = mediaTypeIcons[feedback.media_type]
    
    return (
      <div className="relative">
        <div 
          ref={mediaViewerRef}
          className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
          style={{ aspectRatio: '16/9' }}
          onClick={(e) => handleMediaClick(e, feedback)}
        >
          {/* Media Content */}
          {feedback.media_type === 'image' || feedback.media_type === 'screenshot' ? (
            <img 
              src={feedback.media_url} 
              alt={feedback.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Show placeholder if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="text-center">
                <MediaIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">{feedback.media_type.toUpperCase()} Preview</p>
                <p className="text-xs text-gray-400 mt-1">Click to add feedback points</p>
              </div>
            </div>
          )}
          
          {/* Existing Feedback Points */}
          {feedback.feedback_points.map((point) => (
            <div
              key={point.id}
              className="absolute w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${point.x}%`, 
                top: `${point.y}%`,
                backgroundColor: pointStatusColors[point.status]
              }}
              title={point.comment}
            >
              <span className="text-white text-xs font-bold">
                {feedback.feedback_points.indexOf(point) + 1}
              </span>
            </div>
          ))}
          
          {/* New Feedback Point */}
          {currentPosition && (
            <div
              className="absolute w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 animate-pulse"
              style={{ 
                left: `${currentPosition.x}%`, 
                top: `${currentPosition.y}%` 
              }}
            >
              <span className="text-white text-xs font-bold">?</span>
            </div>
          )}
        </div>
        
        {/* Add Comment Form */}
        {currentPosition && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
            <Label htmlFor="new-comment">Add feedback comment:</Label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Enter your feedback..."
              className="mt-2"
              rows={3}
            />
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={addFeedbackPoint}>
                Add Comment
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setCurrentPosition(null)
                  setNewComment('')
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  const FeedbackCard = ({ feedback }: { feedback: FeedbackItem }) => {
    const MediaIcon = mediaTypeIcons[feedback.media_type]
    const pendingPoints = feedback.feedback_points.filter(p => p.status === 'pending').length
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-1">
                {feedback.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {feedback.description}
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-1">
                {feedback.project_title}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  setSelectedFeedback(feedback)
                  setIsViewerOpen(true)
                }}>
                  <Eye className="mr-2 h-4 w-4" />
                  View & Comment
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            <Badge className="flex items-center gap-1">
              <MediaIcon className="h-3 w-3" />
              {feedback.media_type.toUpperCase()}
            </Badge>
            <Badge className={statusColors[feedback.status]}>
              {feedback.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge variant="outline" className={priorityColors[feedback.priority]}>
              {feedback.priority.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {/* Feedback Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {feedback.feedback_points.length} points
                </span>
                {pendingPoints > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {pendingPoints} pending
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDate(feedback.updated_at)}
              </span>
            </div>
            
            {/* Creator Info */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {feedback.created_by.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">
                Created by {feedback.created_by}
              </span>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  setSelectedFeedback(feedback)
                  setIsViewerOpen(true)
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View & Comment
              </Button>
              <Button variant="outline" size="sm">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Universal Feedback</h1>
          <p className="text-muted-foreground">
            Pinpoint feedback system for images, videos, audio, documents, code, and screenshots.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Media for Feedback</DialogTitle>
              <DialogDescription>
                Upload media files to collect pinpoint feedback from your team and clients.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Media</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Support for images, videos, audio, documents, code files, and screenshots
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.js,.jsx,.ts,.tsx,.css,.html"
                  className="hidden"
                />
              </div>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="feedback-title">Title</Label>
                  <Input id="feedback-title" placeholder="Enter a descriptive title..." />
                </div>
                <div>
                  <Label htmlFor="feedback-description">Description</Label>
                  <Textarea 
                    id="feedback-description" 
                    placeholder="Describe what feedback you're looking for..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="feedback-project">Project</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Upload & Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Media Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="audio">Audio</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="screenshot">Screenshots</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback Items */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No feedback items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || mediaTypeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by uploading your first media file.'}
          </p>
          {!searchQuery && mediaTypeFilter === 'all' && statusFilter === 'all' && (
            <div className="mt-6">
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Upload Media
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Media Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedFeedback && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFeedback.title}</DialogTitle>
                <DialogDescription>
                  {selectedFeedback.description} • {selectedFeedback.project_title}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <MediaViewer feedback={selectedFeedback} />
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Feedback Points</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedFeedback.feedback_points.map((point, index) => (
                      <Card key={point.id} className="p-3">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                            style={{ backgroundColor: pointStatusColors[point.status] }}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{point.comment}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>{point.created_by}</span>
                              <span>•</span>
                              <span>{formatDate(point.created_at)}</span>
                              <Badge 
                                variant="outline" 
                                className="ml-auto"
                                style={{ 
                                  borderColor: pointStatusColors[point.status],
                                  color: pointStatusColors[point.status]
                                }}
                              >
                                {point.status}
                              </Badge>
                            </div>
                            {point.replies && point.replies.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {point.replies.map((reply) => (
                                  <div key={reply.id} className="bg-gray-50 p-2 rounded text-sm">
                                    <p>{reply.comment}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {reply.created_by} • {formatDate(reply.created_at)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 