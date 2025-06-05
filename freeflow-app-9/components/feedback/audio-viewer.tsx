"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, MessageSquare, X, Edit, Trash2, Music } from 'lucide-react'

export interface Comment {
  id: string
  content: string
  position?: {
    timestamp?: number
  }
  author: string
  created_at: string
  updated_at?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

export interface AudioViewerProps {
  src: string
  title: string
  comments?: Comment[]
  onCommentAdd?: (comment: Omit<Comment, 'id' | 'author' | 'created_at'>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  className?: string
}

export default function AudioViewer({
  src,
  title,
  comments = [],
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  className = ''
}: AudioViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ timestamp?: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Safely filter and display comments
  const validComments = comments?.filter(comment => 
    comment && typeof comment === 'object' && comment.id
  ) || []

  const timelineComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.timestamp === 'number'
  )

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
    }
  }, [])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleMuteToggle = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (newVolume: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = newVolume
    setVolume(newVolume)
    
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true)
      audio.muted = true
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false)
      audio.muted = false
    }
  }

  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!duration || editingComment) return
    
    const rect = event.currentTarget.getBoundingClientRect()
    const position = (event.clientX - rect.left) / rect.width
    const timestamp = position * duration
    
    // Seek to that position
    if (audioRef.current) {
      audioRef.current.currentTime = timestamp
    }
    
    setClickPosition({ timestamp })
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
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => {
          console.error('Audio failed to load:', src)
        }}
      />

      {/* Audio Player Interface */}
      <div className="p-6" data-testid="audio-viewer">
        {/* Audio Visual Representation */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Music className="w-16 h-16 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
          <div className="text-sm text-gray-600">
            {duration > 0 && `Duration: ${formatTime(duration)}`}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteToggle}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="text-sm text-gray-600 min-w-[80px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-6">
          <div 
            className="relative h-4 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleTimelineClick}
            data-testid="timeline"
          >
            {/* Progress Bar */}
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              data-testid="timeline-progress"
            />

            {/* Current Time Indicator */}
            <div
              className="absolute w-4 h-4 bg-blue-600 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-0"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />

            {/* Timeline Markers */}
            {timelineComments.map((comment) => (
              <div
                key={comment.id}
                className="absolute w-3 h-3 bg-red-500 border border-white rounded-full transform -translate-x-1/2 translate-y-0.5"
                style={{
                  left: `${duration > 0 ? (comment.position!.timestamp! / duration) * 100 : 0}%`,
                  top: '100%'
                }}
                data-testid={`timeline-marker-${comment.id}`}
                title={`${formatTime(comment.position!.timestamp!)} - ${comment.content}`}
              />
            ))}
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center">
            Click on the timeline to add comments at specific times
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="px-6 pb-6" data-testid="comment-list">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({validComments.length})
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {validComments.map((comment) => (
            <div 
              key={comment.id} 
              className="comment-item bg-white p-3 rounded-lg border border-gray-200"
              data-testid={`comment-${comment.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{comment.author}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.created_at).toLocaleString()}
                    {comment.updated_at && ' (edited)'}
                    {comment.position?.timestamp && (
                      <span className="ml-2">• at {formatTime(comment.position.timestamp)}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingComment(comment)
                      setNewComment(comment.content)
                      setShowCommentDialog(false)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500"
                    data-testid={`edit-comment-${comment.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                    data-testid={`delete-comment-${comment.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-2">{comment.content}</div>
              
              {(comment.priority !== 'medium' || comment.tags?.length) && (
                <div className="flex gap-2 text-xs">
                  {comment.priority !== 'medium' && (
                    <span className={`px-2 py-1 rounded-full ${
                      comment.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      comment.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {comment.priority}
                    </span>
                  )}
                  {comment.tags?.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {validComments.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Click on the timeline to add your first comment
            </div>
          )}
        </div>

        {/* Comment Form - Always visible */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg" data-testid="comment-dialog">
          <h4 className="text-md font-medium mb-3">
            {editingComment ? 'Edit Comment' : 'Add Comment'}
          </h4>

          <div className="space-y-4">
            {/* Comment Position Info */}
            {!editingComment && clickPosition && clickPosition.timestamp !== undefined && (
              <div className="text-sm text-gray-600 bg-gray-100 p-3 rounded">
                <div>Time: {formatTime(clickPosition.timestamp)}</div>
              </div>
            )}

            {/* Comment Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="comment-priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            )}

            {/* Tags (only for new comments) */}
            {!editingComment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2" data-testid="tag-container">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-500 text-white border-blue-500'
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
            <div className="flex gap-3">
              {editingComment && (
                <button
                  onClick={() => {
                    setEditingComment(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid="edit-cancel-btn"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={editingComment ? handleEditSubmit : handleCommentSubmit}
                disabled={!newComment.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                data-testid={editingComment ? "edit-submit-btn" : "submit-btn"}
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p className="text-sm text-gray-500 italic">
                Click on the timeline to select a timestamp for your comment
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comment Dialog */}
      {(showCommentDialog || editingComment) && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowCommentDialog(false)
              setEditingComment(null)
              setNewComment('')
            }}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-[90vw] z-50 shadow-lg"
            data-testid={editingComment ? "edit-dialog" : "comment-dialog"}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingComment ? 'Edit Comment' : 'Add Audio Comment'}
              </h3>
              <button
                onClick={() => {
                  setShowCommentDialog(false)
                  setEditingComment(null)
                  setNewComment('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Comment Position Info */}
              {!editingComment && clickPosition && clickPosition.timestamp !== undefined && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  <div>Time: {formatTime(clickPosition.timestamp)}</div>
                </div>
              )}

              {/* Comment Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="comment-priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              )}

              {/* Tags (only for new comments) */}
              {!editingComment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2" data-testid="tag-container">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-sm border ${
                          selectedTags.includes(tag)
                            ? 'bg-blue-500 text-white border-blue-500'
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
              <div className="flex gap-3 pt-4">
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
