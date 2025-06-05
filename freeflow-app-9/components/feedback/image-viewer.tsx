"use client"

import React, { useState, useRef } from 'react'
import { MessageSquare, X, Edit, Trash2 } from 'lucide-react'

export interface Comment {
  id: string
  content: string
  position?: {
    x: number
    y: number
    timestamp?: number
  }
  author: string
  created_at: string
  updated_at?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

export interface ImageViewerProps {
  src: string
  alt: string
  comments?: Comment[]
  onCommentAdd?: (comment: Omit<Comment, 'id' | 'author' | 'created_at'>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  className?: string
}

export default function ImageViewer({
  src,
  alt,
  comments = [],
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  className = ''
}: ImageViewerProps) {
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const imageRef = useRef<HTMLDivElement>(null)

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
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none'
            const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
            if (placeholder) placeholder.style.display = 'flex'
          }}
        />
        
        {/* Fallback placeholder */}
        <div 
          className="absolute inset-0 bg-gray-300 flex items-center justify-center text-gray-600 hidden"
          data-testid="image-placeholder"
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <div>Image: {alt}</div>
          </div>
        </div>

        {/* Position Markers */}
        {positionComments.map((comment, index) => (
          <div
            key={comment.id}
            className="absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:bg-blue-600 transform -translate-x-1/2 -translate-y-1/2"
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
      <div className="p-4" data-testid="comment-list">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Comments ({validComments.length})
        </h3>
        
        {/* Comment Form - Always visible */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg" data-testid="comment-dialog">
          <h4 className="text-md font-medium mb-3">
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
                disabled={!newComment.trim() || (!clickPosition && !editingComment)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                data-testid={editingComment ? "edit-submit-btn" : "submit-btn"}
              >
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p className="text-sm text-gray-500 italic">
                Click on the image above to select a position for your comment
              </p>
            )}
          </div>
        </div>
        
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
              Add your first comment using the form above
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog Overlay (only when editing) */}
      {editingComment && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setEditingComment(null)
              setNewComment('')
            }}
          />
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-[90vw] z-50 shadow-lg"
            data-testid="edit-dialog"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Comment</h3>
              <button
                onClick={() => {
                  setEditingComment(null)
                  setNewComment('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  data-testid="edit-content"
                />
              </div>

              <div className="flex gap-3 pt-4">
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
                <button
                  onClick={handleEditSubmit}
                  disabled={!newComment.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  data-testid="edit-submit-btn"
                >
                  Update Comment
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
