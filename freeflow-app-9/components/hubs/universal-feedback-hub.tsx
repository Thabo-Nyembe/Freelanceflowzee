"use client

import React, { useState, useRef } from 'react'
)
  const [status setStatus] = useState('all')
  const [project setProject] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [feedbackPoints, setFeedbackPoints] = useState<Array<{x: number, y: number, comment: string}>>([])
  const [currentPosition, setCurrentPosition] = useState<{x: number, y: number} | null>(null)
  const [newComment, setNewComment] = useState('')'
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaViewerRef = useRef<HTMLDivElement>(null)

  // Use mock data for now
  const allFeedbackItems = mockFeedbackItems

  // feedback items
  const filteredItems = allFeedbackItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.project_title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesMediaType = mediaType === 'all' || item.media_type === mediaType
    const matchesStatus = status === 'all' || item.status === status
    const matchesProject = project === 'all' || item.project_id === project
    
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
    setNewComment('')'
  }

  const MediaViewer = ({ feedback }: { feedback: FeedbackItem }) => {
    const MediaIcon = mediaTypeIcons[feedback.media_type]
    
    return (
      <div className= "relative">
        <div 
          ref={mediaViewerRef}
          className= "relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
          style={{ aspectRatio: '16/9' }}
          onClick={(e) => handleMediaClick(e, feedback)}
        >
          {/* Media Content */}
          {feedback.media_type === 'image' || feedback.media_type === 'screenshot' ? (
            <img src={feedback.media_url} alt={feedback.title}> {
                // Show placeholder if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : (
            <div >
              <div >
                <MediaIcon >
                <p >{feedback.media_type.toUpperCase()} Preview</p>
                <p >Click to add feedback points</p>
              </div>
            </div>
          )}
          
          {/* Existing Feedback Points */}
          {feedback.feedback_points.map((point) => (
            <div key={point.id} style={{ 
                left: `${point.x} title={point.comment}>
              <span >
                {feedback.feedback_points.indexOf(point) + 1}
              </span>
            </div>
          ))}
          
          {/* New Feedback Point */}
          {currentPosition && (
            <div style={{ 
                left: `${currentPosition.x}>
              <span >?</span>
            </div>
          )}
        </div>
        
        {/* Add Comment Form */}
        {currentPosition && (
          <div >
            <Label >Add feedback comment:</Label>
            <Textarea value={newComment}> setNewComment(e.target.value)}
              placeholder= "Enter your feedback..."
              className= "mt-2"
              rows={3}
            />
            <div >
              <Button onClick={addFeedbackPoint}>
                Add Comment
              </Button>
              <Button > {
                  setCurrentPosition(null)
                  setNewComment('')'
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
      <Card >
        <CardHeader >
          <div >
            <div >
              <CardTitle >
                {feedback.title}
              </CardTitle>
              <CardDescription >
                {feedback.description}
              </CardDescription>
              <p >
                {feedback.project_title}
              </p>
            </div>
            <DropdownMenu >
              <DropdownMenuTrigger >
                <Button >
                  <MoreHorizontal >
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent >
                <DropdownMenuItem > {
                  setSelectedFeedback(feedback)
                  setIsViewerOpen(true)
                }}>
                  <Eye >
                  View & Comment
                </DropdownMenuItem>
                <DropdownMenuItem >
                  <Download >
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem >
                  <Share >
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator >
                <DropdownMenuItem >
                  <Edit >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem >
                  <Trash2 >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div >
            <Badge >
              <MediaIcon >
              {feedback.media_type.toUpperCase()}
            </Badge>
            <Badge className={statusColors[feedback.status]}>
              {feedback.status.replace('-', ' ').toUpperCase()}
            </Badge>
            <Badge className={priorityColors[feedback.priority]}>
              {feedback.priority.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent >
          <div >
            {/* Feedback Stats */}
            <div >
              <div >
                <span >
                  <MapPin >
                  {feedback.feedback_points.length} points
                </span>
                {pendingPoints > 0 && (
                  <span >
                    <AlertCircle >
                    {pendingPoints} pending
                  </span>
                )}
              </div>
              <span >
                <Clock >
                {formatDate(feedback.updated_at)}
              </span>
            </div>
            
            {/* Creator Info */}
            <div >
              <Avatar >
                <AvatarFallback >
                  {feedback.created_by.split(' ').map(n => n[0]).join()}
                </AvatarFallback>
              </Avatar>
              <span >
                Created by {feedback.created_by}
              </span>
            </div>
            
            {/* Actions */}
            <div >
              <Button > {
                  setSelectedFeedback(feedback)
                  setIsViewerOpen(true)
                }}
              >
                <Eye >
                View & Comment
              </Button>
              <Button >
                <MessageSquare >
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div >
      {/* Header */}
      <div >
        <div >
          <h1 >Universal Feedback</h1>
          <p >
            Pinpoint feedback system for images, videos, audio, documents, code, and screenshots.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger >
            <Button >
              <Plus >
              Upload Media
            </Button>
          </DialogTrigger>
          <DialogContent >
            <DialogHeader >
              <DialogTitle >Upload Media for Feedback</DialogTitle>
              <DialogDescription >
                Upload media files to collect pinpoint feedback from your team and clients.
              </DialogDescription>
            </DialogHeader>
            <div >
              <div >
                <Upload >
                <h3 >Upload Media</h3>
                <p >
                  Support for images, videos, audio, documents, code files, and screenshots
                </p>
                <Button > fileInputRef.current?.click()}>
                  Choose Files
                </Button>
                <input ref={fileInputRef}>
              </div>
              
              <div >
                <div >
                  <Label >Title</Label>
                  <Input >
                </div>
                <div >
                  <Label >Description</Label>
                  <Textarea rows={3}>
                </div>
                <div >
                  <Label >Project</Label>
                  <Select >
                    <SelectTrigger >
                      <SelectValue >
                    </SelectTrigger>
                    <SelectContent >
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
            <div >
              <Button > setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button > setIsCreateDialogOpen(false)}>
                Upload & Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/*s */}
      <div >
        <div >
          <Search >
          <Input value={searchQuery}> setSearchQuery(e.target.value)}
            className= "pl-10"
          />
        </div>
        <div >
          <Select value={mediaType} onValueChange={setMediaType}>
            <SelectTrigger >
              <SelectValue >
            </SelectTrigger>
            <SelectContent >
              <SelectItem >All Types</SelectItem>
              <SelectItem >Images</SelectItem>
              <SelectItem >Videos</SelectItem>
              <SelectItem >Audio</SelectItem>
              <SelectItem >Documents</SelectItem>
              <SelectItem >Code</SelectItem>
              <SelectItem >Screenshots</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger >
              <SelectValue >
            </SelectTrigger>
            <SelectContent >
              <SelectItem >All Status</SelectItem>
              <SelectItem >Open</SelectItem>
              <SelectItem >In Review</SelectItem>
              <SelectItem >Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Feedback Items */}
      {filteredItems.length > 0 ? (
        <div >
          {filteredItems.map((feedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback}>
          ))}
        </div>
      ) : (
        <div >
          <MessageSquare >
          <h3 >No feedback items found</h3>
          <p >
            {searchQuery || mediaType !== 'all' || status !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by uploading your first media file.'}
          </p>
          {!searchQuery && mediaType === 'all' && status === 'all' && (
            <div >
              <Button > setIsCreateDialogOpen(true)}>
                <Plus >
                Upload Media
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Media Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent >
          {selectedFeedback && (
            <>
              <DialogHeader >
                <DialogTitle >{selectedFeedback.title}</DialogTitle>
                <DialogDescription >
                  {selectedFeedback.description} • {selectedFeedback.project_title}
                </DialogDescription>
              </DialogHeader>
              
              <div >
                <div >
                  <MediaViewer feedback={selectedFeedback}>
                </div>
                
                <div >
                  <h3 >Feedback Points</h3>
                  <div >
                    {selectedFeedback.feedback_points.map((point, index) => (
                      <Card key={point.id}>
                        <div >
                          <div style={{ backgroundColor: pointStatusColors[point.status] }>
                            {index + 1}
                          </div>
                          <div >
                            <p >{point.comment}</p>
                            <div >
                              <span >{point.created_by}</span>
                              <span >•</span>
                              <span >{formatDate(point.created_at)}</span>
                              <Badge style={{ 
                                  borderColor: pointStatusColors[point.status],
                                  color: pointStatusColors[point.status]
                                }>
                                {point.status}
                              </Badge>
                            </div>
                            {point.replies && point.replies.length > 0 && (
                              <div >
                                {point.replies.map((reply) => (
                                  <div key={reply.id}>
                                    <p >{reply.comment}</p>
                                    <p >
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