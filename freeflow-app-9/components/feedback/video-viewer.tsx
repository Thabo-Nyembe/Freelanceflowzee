"use client"

import React, { useState, useRef, useEffect } from 'react'
 y?: number; timestamp?: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<&apos;low&apos; | &apos;medium&apos; | &apos;high&apos; | &apos;critical&apos;>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Safely filter and display comments
  const validComments = comments?.filter(comment => 
    comment && typeof comment === 'object' && comment.id
  ) || []

  const positionComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.x === 'number' && 
    typeof comment.position.y === 'number
  )

  const timelineComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.timestamp === 'number
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
    return `${mins}:${secs.toString().padStart(2, '0')}
  }

  const availableTags = ['Design', 'Content', 'Technical', 'Urgent']

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-96 bg-white border-2 border-purple-200 cursor-pointer
        onClick={handleVideoClick}"
        data-testid="video-viewer
      >
        <video
          ref={videoRef}
          src={src}"
          className="w-full h-full object-cover
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
            // Show placeholder on error"
            const placeholder = containerRef.current?.querySelector('[data-testid= "video-placeholder"]') as HTMLElement
            if (placeholder) {
              placeholder.style.display = 'flex
            }
          }}
        />
        
        {/* Fallback placeholder */}
        <div 
          className="absolute inset-0 bg-white border-2 border-purple-200 flex items-center justify-center text-gray-900 hidden"
          data-testid="video-placeholder
        >"
          <div className= "text-center">
            <div className= "text-4xl mb-2">🎥</div>
            <div>Video: {title}</div>
            {duration > 0 && (
              <div className= "text-sm opacity-75">Duration: {formatTime(duration)}</div>
            )}
          </div>
        </div>

        {/* Position Markers */}
        {positionComments.map((comment, index) => (
          <div
            key={comment.id}
            className="absolute w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-red-600 transform -translate-x-1/2 -translate-y-1/2
            style={{
              left: `${comment.position!.x}%`,
              top: `${comment.position!.y}%
            }}
            data-testid={`marker-${comment.id}`}
            title={`${comment.content} (at ${formatTime(comment.position!.timestamp || 0)})`}
          >
            {index + 1}
          </div>
        ))}

        {/* Video Controls Overlay */}"
        <div className= "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-4 border-t border-purple-200">
          <div className= "flex items-center gap-3 text-white">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePlayPause()
              }}
              className="p-2 hover:bg-white/20 rounded-full
            >"
              {isPlaying ? <Pause className= "w-5 h-5" /> : <Play className= "w-5 h-5" />}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleMuteToggle()
              }}
              className="p-2 hover:bg-white/20 rounded-full
            >"
              {isMuted ? <VolumeX className= "w-5 h-5" /> : <Volume2 className= "w-5 h-5" />}
            </button>

            <div className= "flex-1 text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className= "p-4">
        <div 
          className="relative h-3 bg-gray-300 rounded-full cursor-pointer
          onClick={handleTimelineClick}"
          data-testid="timeline
        >
          {/* Progress Bar */}
          <div"
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}"
            data-testid="timeline-progress
          />

          {/* Timeline Markers */}
          {timelineComments.map((comment) => (
            <div
              key={comment.id}"
              className="absolute w-3 h-3 bg-red-500 border border-white rounded-full transform -translate-x-1/2 -translate-y-0
              style={{
                left: `${duration > 0 ? (comment.position!.timestamp! / duration) * 100 : 0}%`,"
                top: '0px'
              }}
              data-testid={`timeline-marker-${comment.id}`}
              title={`${formatTime(comment.position!.timestamp!)} - ${comment.content}`}
            />
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className= "px-4 pb-4" data-testid= "comment-list">
        <h3 className= "text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className= "w-5 h-5" />
          Comments ({validComments.length})
        </h3>
        
        <div className= "space-y-3 max-h-64 overflow-y-auto">
          {validComments.map((comment) => (
            <div 
              key={comment.id} 
              className="comment-item bg-white p-3 rounded-lg border border-gray-200
              data-testid={`comment-${comment.id}`}
            >"
              <div className= "flex justify-between items-start mb-2">
                <div className= "flex-1">
                  <div className= "font-medium text-sm text-gray-900">{comment.author}</div>
                  <div className= "text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                    {comment.updated_at && ' (edited)'}
                    {comment.position?.timestamp && (
                      <span className= "ml-2">• at {formatTime(comment.position.timestamp)}</span>
                    )}
                  </div>
                </div>
                <div className= "flex gap-1">
                  <button
                    onClick={() => {
                      setEditingComment(comment)
                      setNewComment(comment.content)
                      setShowCommentDialog(false)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500
                    data-testid={`edit-comment-${comment.id}`}
                  >"
                    <Edit className= "w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-500
                    data-testid={`delete-comment-${comment.id}`}
                  >"
                    <Trash2 className= "w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className= "text-sm text-gray-700 mb-2">{comment.content}</div>
              
              {(comment.priority !== 'medium' || comment.tags?.length) && (
                <div className= "flex gap-2 text-xs">
                  {comment.priority !== 'medium' && (
                    <span className={`px-2 py-1 rounded-full ${
                      comment.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      comment.priority === 'high' ? 'bg-orange-100 text-orange-700' : "bg-green-100 text-green-700
                    }`}>
                      {comment.priority}
                    </span>
                  )}
                  {comment.tags?.map(tag => ("
                    <span key={tag} className= "px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {validComments.length === 0 && (
            <div className= "text-center text-gray-500 py-8">
              Click on the video or timeline to add your first comment
            </div>
          )}
        </div>

        {/* Comment Form - Always visible */}
        <div className= "mt-6 p-4 bg-gray-50 rounded-lg" data-testid= "comment-dialog">
          <h4 className= "text-md font-medium mb-3">
            {editingComment ? 'Edit Comment' : 'Add Comment'}
          </h4>

          <div className= "space-y-4">
            {/* Comment Position Info */}
            {!editingComment && clickPosition && (
              <div className= "text-sm text-gray-600 bg-gray-100 p-3 rounded">
                {clickPosition.timestamp !== undefined && (
                  <div>Time: {formatTime(clickPosition.timestamp)}</div>
                )}
                {clickPosition.x !== undefined && clickPosition.y !== undefined && (
                  <div>Position: {Math.round(clickPosition.x)}%, {Math.round(clickPosition.y)}%</div>
                )}
              </div>
            )}

            {/* Comment Content */}
            <div>
              <label className= "block text-sm font-medium text-gray-700 mb-1">
                Comment *
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid={editingComment ? "edit-content" : "comment-content"}
              />
            </div>

            {/* Priority (only for new comments) */}
            {!editingComment && (
              <div>
                <label className= "block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="comment-priority
                >"
                  <option value= "low">Low</option>
                  <option value= "medium">Medium</option>
                  <option value= "high">High</option>
                  <option value= "critical">Critical</option>
                </select>
              </div>
            )}

            {/* Tags (only for new comments) */}
            {!editingComment && (
              <div>
                <label className= "block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className= "flex flex-wrap gap-2" data-testid= "tag-container">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        selectedTags.includes(tag)"
                          ? 'bg-blue-500 text-white border-blue-500
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      data-testid={`tag-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className= "flex gap-3">
              {editingComment && (
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid="edit-cancel-btn
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingComment ? handleEditSubmit : handleCommentSubmit}
                disabled={!newComment.trim()}"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                data-testid={editingComment ? "edit-submit-btn" : "submit-btn"}
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p className= "text-sm text-gray-500 italic">
                Click on the video or timeline to select a position for your comment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      {(showCommentDialog || editingComment) && (
        <>
          <div 
            className="fixed inset-0 bg-white/95 backdrop-blur-sm z-40
            onClick={() => {
              setShowCommentDialog(false)
              setEditingComment(null)"
              setNewComment('')
            }}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-[90vw] z-50 shadow-lg"
            data-testid={editingComment ? "edit-dialog" : "comment-dialog"}
          >
            <div className= "flex justify-between items-center mb-4">
              <h3 className= "text-lg font-semibold">
                {editingComment ? 'Edit Comment' : 'Add Video Comment'}
              </h3>
              <button
                onClick={() => {
                  setShowCommentDialog(false)
                  setEditingComment(null)
                  setNewComment('')
                }}
                className="text-gray-400 hover:text-gray-600
              >"
                <X className= "w-5 h-5" />
              </button>
            </div>

            <div className= "space-y-4">
              {/* Comment Position Info */}
              {!editingComment && clickPosition && (
                <div className= "text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  {clickPosition.timestamp !== undefined && (
                    <div>Time: {formatTime(clickPosition.timestamp)}</div>
                  )}
                  {clickPosition.x !== undefined && clickPosition.y !== undefined && (
                    <div>Position: {Math.round(clickPosition.x)}%, {Math.round(clickPosition.y)}%</div>
                  )}
                </div>
              )}

              {/* Comment Content */}
              <div>
                <label className= "block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your feedback..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid={editingComment ? "edit-content" : "comment-content"}
                />
              </div>

              {/* Priority (only for new comments) */}
              {!editingComment && (
                <div>
                  <label className= "block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="comment-priority
                  >"
                    <option value= "low">Low</option>
                    <option value= "medium">Medium</option>
                    <option value= "high">High</option>
                    <option value= "critical">Critical</option>
                  </select>
                </div>
              )}

              {/* Tags (only for new comments) */}
              {!editingComment && (
                <div>
                  <label className= "block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className= "flex flex-wrap gap-2" data-testid= "tag-container">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          selectedTags.includes(tag)"
                            ? 'bg-blue-500 text-white border-blue-500
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        data-testid={`tag-${tag.toLowerCase()}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className= "flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCommentDialog(false)
                    setEditingComment(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid={editingComment ? "edit-cancel-btn" : "cancel-btn"}
                >
                  Cancel
                </button>
                <button
                  onClick={editingComment ? handleEditSubmit : handleCommentSubmit}
                  disabled={!newComment.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid={editingComment ? "edit-submit-btn" : "submit-btn"}
                >
                  {editingComment ? 'Update Comment' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
