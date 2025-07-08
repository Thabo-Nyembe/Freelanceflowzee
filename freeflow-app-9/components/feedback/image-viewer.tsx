"use client"

import React, { useState } from 'react'
import { MessageSquare, Edit, Trash2 } from 'lucide-react'

interface Comment {
  id: string
  content: string
  position?: { x: number; y: number }
  author?: string
  timestamp?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface ImageViewerProps {
  src: string
  alt: string
  comments?: Comment[]
  onCommentAdd?: (comment: Partial<Comment>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  className?: string
}

export function ImageViewer({ 
  src, 
  alt, 
  comments = [], 
  onCommentAdd, 
  onCommentEdit, 
  onCommentDelete, 
  className = "" 
}: ImageViewerProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const imageRef =<HTMLDivElement>(null)

  // Safely filter and display comments
  const validComments = comments?.filter(comment => 
    comment && typeof comment === 'object' && comment.id
  ) || []

  const positionComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.x === 'number' && 
    typeof comment.position.y === 'number'
  )

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || editingComment) return
    
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    
    setClickPosition({ x, y })
    setShowCommentDialog(true)
    setNewComment('')
    setSelectedPriority('medium')
    setSelectedTags([])
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !clickPosition || !onCommentAdd) return
    
    const comment = {
      content: newComment.trim(),
      position: {
        x: clickPosition.x,
        y: clickPosition.y
      },
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

  const availableTags = ['Design', 'Content', 'Technical', 'Urgent']

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Image Container */}
      <div 
        ref={imageRef}
        className="relative w-full h-96 bg-gray-200 cursor-crosshair"
        onClick={handleImageClick}
        data-testid="image-viewer"
      >
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
            if (placeholder) placeholder.style.display = 'flex'
          }}
        />
        
        {/* Fallback placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500" style={{ display: 'none' }}>
          <div className="text-center">
            <div className="text-6xl mb-2">🖼️</div>
            <div className="text-lg">Image: {alt}</div>
          </div>
        </div>

        {/* Position Markers */}
        {positionComments.map((comment, index) => (
          <div 
            key={comment.id} 
            className="absolute w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${comment.position!.x}%`,
              top: `${comment.position!.y}%`
            }}
            data-testid={`marker-${comment.id}`} 
            title={comment.content}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Comments List & Form */}
      <div className="p-4 bg-white">
        <h3 className="flex items-center text-lg font-semibold mb-4">
          <MessageSquare className="w-5 h-5 mr-2" />
          Comments ({validComments.length})
        </h3>
        
        {/* Comment Form - Always visible */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">
            {editingComment ? 'Edit Comment' : 'Add Comment'}
          </h4>

          <div className="space-y-4">
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
                  onChange={(e) => setSelectedPriority(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
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
                      data-testid={`tag-${tag.toLowerCase()}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
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
                disabled={!newComment.trim() || (!clickPosition && !editingComment)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                data-testid={editingComment ? "edit-submit-btn" : "submit-btn"}
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p className="text-sm text-gray-500 italic">
                Click on the image to place a comment marker
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
                    data-testid={`edit-${comment.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    data-testid={`delete-${comment.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 mb-2">{comment.content}</p>
              {comment.tags && comment.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
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
              {comment.timestamp && (
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(comment.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}