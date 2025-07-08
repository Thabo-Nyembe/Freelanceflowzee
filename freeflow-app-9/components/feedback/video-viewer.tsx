"use client"

import React, { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, MessageSquare, Edit, Trash2 } from 'lucide-react'

interface Comment {
  id: string
  content: string
  position?: { x?: number; y?: number; timestamp?: number }
  author?: string
  timestamp?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface VideoViewerProps {
  src: string
  title: string
  comments?: Comment[]
  onCommentAdd?: (comment: Partial<Comment>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  className?: string
}

export function VideoViewer({ 
  src, 
  title, 
  comments = [], 
  onCommentAdd, 
  onCommentEdit, 
  onCommentDelete, 
  className = "" 
}: VideoViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x?: number; y?: number; timestamp?: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const videoRef =<HTMLVideoElement>(null)
  const containerRef =<HTMLDivElement>(null)

  // Safely filter and display comments
  const validComments = comments?.filter(comment => 
    comment && typeof comment === 'object' && comment.id
  ) || []

  const positionComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.x === 'number' && 
    typeof comment.position.y === 'number'
  )

  const timelineComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.timestamp === 'number'
  )

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const handlePlayPause = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || editingComment) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    const timestamp = position * duration
    
    // Seek to that position
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
    }
    
    setClickPosition({ timestamp })
    setShowCommentDialog(true)
    setNewComment('')
    setSelectedPriority('medium')
    setSelectedTags([])
  }

  const handleVideoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || editingComment) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    
    setClickPosition({ x, y, timestamp: currentTime })
    setShowCommentDialog(true)
    setNewComment('')
    setSelectedPriority('medium')
    setSelectedTags([])
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !clickPosition || !onCommentAdd) return
    
    const comment = {
      content: newComment.trim(),
      position: clickPosition,
      priority: selectedPriority,
      tags: selectedTags
    }
    
    onCommentAdd(comment)
    setShowCommentDialog(false)
    setClickPosition(null)
    setNewComment('')
    setSelectedTags([])
  }

  const handleEditSubmit = () => {
    if (!newComment.trim() || !editingComment || !onCommentEdit) return
    
    onCommentEdit(editingComment.id, newComment.trim())
    setEditingComment(null)
    setNewComment('')
  }

  const handleDelete = (commentId: string) => {
    if (!onCommentDelete) return
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onCommentDelete(commentId)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const availableTags = ['Design', 'Content', 'Technical', 'Urgent']

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-white border-2 border-purple-200 cursor-pointer"
        onClick={handleVideoClick}
        data-testid="video-viewer"
      >
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-cover"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            // Show placeholder on error
            const placeholder = containerRef.current?.querySelector('[data-testid="video-placeholder"]') as HTMLElement
            if (placeholder) {
              placeholder.style.display = 'flex'
            }
          }}
        />
        
        {/* Fallback placeholder */}
        <div 
          className="absolute inset-0 bg-white border-2 border-purple-200 flex items-center justify-center text-gray-900 hidden"
          data-testid="video-placeholder"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🎥</div>
            <div>Video: {title}</div>
            {duration > 0 && (
              <div className="text-sm opacity-75">Duration: {formatTime(duration)}</div>
            )}
          </div>
        </div>

        {/* Position Markers */}
        {positionComments.map((comment, index) => (
          <div
            key={comment.id}
            className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-red-600 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${comment.position!.x}%`,
              top: `${comment.position!.y}%`
            }}
            data-testid={`marker-${comment.id}`}
            title={`${comment.content} (at ${formatTime(comment.position!.timestamp || 0)})`}
          >
            {index + 1}
          </div>
        ))}

        {/* Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <div className="flex items-center space-x-2 text-white">
            <button onClick={handlePlayPause} className="p-2 hover:bg-white/20 rounded">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={handleMuteToggle} className="p-2 hover:bg-white/20 rounded">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <div className="flex-1 text-center">
              <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <div 
            className="h-8 bg-gray-200 rounded cursor-pointer relative"
            onClick={handleTimelineClick}
          >
            {/* Progress bar */}
            <div 
              className="h-full bg-blue-500 rounded transition-all duration-100"
              style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
            />
            
            {/* Timeline comment markers */}
            {timelineComments.map((comment) => (
              <div
                key={comment.id}
                className="absolute top-0 w-2 h-8 bg-red-500 rounded transform -translate-x-1/2"
                style={{ 
                  left: duration > 0 ? `${((comment.position!.timestamp || 0) / duration) * 100}%` : '0%' 
                }}
                title={comment.content}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">Click on timeline to add timestamp comments</p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="p-4 bg-white">
        <h3 className="flex items-center text-lg font-semibold mb-4">
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments ({validComments.length})
        </h3>
        
        {/* Comment Form */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">
            {editingComment ? 'Edit Comment' : 'Add Comment'}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {!editingComment && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select 
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button 
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              {editingComment && (
                <button 
                  onClick={() => {
                    setEditingComment(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={editingComment ? handleEditSubmit : handleCommentSubmit} 
                disabled={!newComment.trim() || (!clickPosition && !editingComment)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p className="text-sm text-gray-500 italic">
                Click on the video or timeline to place a comment
              </p>
            )}
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {validComments.map((comment, index) => (
            <div key={comment.id} className="p-3 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {comment.position && (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">
                      {index + 1}
                    </span>
                  )}
                  <span className="font-medium text-gray-900">
                    {comment.author || 'Anonymous'}
                  </span>
                  {comment.priority && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      comment.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      comment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      comment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {comment.priority}
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingComment(comment)
                      setNewComment(comment.content)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {comment.position?.timestamp !== undefined && (
                <p className="text-xs text-gray-500">
                  At {formatTime(comment.position.timestamp)}
                </p>
              )}
              {comment.tags && comment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {comment.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
