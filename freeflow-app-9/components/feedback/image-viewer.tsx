"use client"

import React, { useState, useRef } from 'react'
 y?: number } | null>(null)
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<&apos;low&apos; | &apos;medium&apos; | &apos;high&apos; | &apos;critical&apos;>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const imageRef = useRef<HTMLDivElement>(null)

  // Safely filter and display comments
  const validComments = comments?.filter(comment => 
    comment && typeof comment === 'object' && comment.id
  ) || []

  const positionComments = validComments.filter(comment => 
    comment.position && 
    typeof comment.position.x === 'number' && 
    typeof comment.position.y === 'number
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
        className="relative w-full h-96 bg-gray-200 cursor-crosshair
        onClick={handleImageClick}"
        data-testid="image-viewer
      >
        <img src={src} alt={alt}> {"
            (e.target as HTMLImageElement).style.display = 'none
            const placeholder = (e.target as HTMLImageElement).nextElementSibling as HTMLElement
            if (placeholder) placeholder.style.display = 'flex
          }}
        />
        
        {/* Fallback placeholder */}
        <div >
          <div >
            <div >🖼️</div>
            <div >Image: {alt}</div>
          </div>
        </div>

        {/* Position Markers */}
        {positionComments.map((comment, index) => (
          <div key={comment.id} style={{
              left: `${comment.position!.x} testid={`marker-${comment.id} title={comment.content}>
            {index + 1}
          </div>
        ))}
      </div>

      {/* Comments List & Form */}
      <div >
        <h3 >
          <MessageSquare >
          Comments ({validComments.length})
        </h3>
        
        {/* Comment Form - Always visible */}
        <div >
          <h4 >
            {editingComment ? 'Edit Comment' : 'Add Comment'}
          </h4>

          <div >
            {/* Comment Content */}
            <div >
              <label >
                Comment *
              </label>
              <textarea value={newComment}> setNewComment(e.target.value)}
                placeholder="Share your feedback..."
                className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                data-testid={editingComment ? "edit-content" : "comment-content"}
              />
            </div>

            {/* Priority (only for new comments) */}
            {!editingComment && (
              <div >
                <label >
                  Priority
                </label>
                <select value={selectedPriority}> setSelectedPriority(e.target.value as any)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="comment-priority
                >
                  <option >Low</option>
                  <option >Medium</option>
                  <option >High</option>
                  <option >Critical</option>
                </select>
              </div>
            )}

            {/* Tags (only for new comments) */}
            {!editingComment && (
              <div >
                <label >
                  Tags
                </label>
                <div >
                  {availableTags.map(tag => (
                    <button key={tag}> toggleTag(tag)}
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
            <div >
              {editingComment && (
                <button > {
                    setEditingComment(null)
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid="edit-cancel-btn
                >
                  Cancel
                </button>
              )}"
              <button onClick={editingComment ? handleEditSubmit : handleCommentSubmit} disabled={!newComment.trim() || (!clickPosition && !editingComment)} testid={editingComment ? "edit-submit-btn&quot; : &quot;submit-btn&quot;}>
                {editingComment ? 'Update Comment' : 'Add Comment'}
              </button>
            </div>
            
            {!clickPosition && !editingComment && (
              <p >
                Click on the image above to select a position for your comment
              </p>
            )}
          </div>
        </div>
        
        <div >
          {validComments.map((comment) => (
            <div key={comment.id} testid={`comment-${comment.id}>
              <div >
                <div >
                  <div >{comment.author}</div>
                  <div >
                    {new Date(comment.created_at).toLocaleString()}
                    {comment.updated_at && ' (edited)'}
                  </div>
                </div>
                <div >
                  <button > {
                      setEditingComment(comment)
                      setNewComment(comment.content)
                      setShowCommentDialog(false)
                    }}
                    className="p-1 text-gray-400 hover:text-blue-500
                    data-testid={`edit-comment-${comment.id}`}
                  >
                    <Edit >
                  </button>
                  <button > handleDelete(comment.id)}"
                    className="p-1 text-gray-400 hover:text-red-500
                    data-testid={`delete-comment-${comment.id}`}
                  >
                    <Trash2 >
                  </button>
                </div>
              </div>
              
              <div >{comment.content}</div>
              "
              {(comment.priority !== 'medium' || comment.tags?.length) && (
                <div >
                  {comment.priority !== 'medium' && (
                    <span className={`px-2 py-1 rounded-full ${
                      comment.priority === 'critical' ? 'bg-red-100 text-red-700' :
                      comment.priority === 'high' ? 'bg-orange-100 text-orange-700' : "bg-green-100 text-green-700
                    }>
                      {comment.priority}
                    </span>
                  )}
                  {comment.tags?.map(tag => (
                    <span key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          {validComments.length === 0 && (
            <div >
              Add your first comment using the form above
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog Overlay (only when editing) */}
      {editingComment && (
        <>
          <div > {
              setEditingComment(null)"
              setNewComment('')
            }}
          />
          <div >
            <div >
              <h3 >Edit Comment</h3>
              <button > {
                  setEditingComment(null)
                  setNewComment('')
                }}
                className="text-gray-400 hover:text-gray-600
              >
                <X >
              </button>
            </div>

            <div >
              <div >
                <label >
                  Comment *
                </label>
                <textarea value={newComment}> setNewComment(e.target.value)}"
                  placeholder="Share your feedback..."
                  className="w-full p-3 border border-gray-300 rounded-md resize-vertical min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="edit-content
                />
              </div>

              <div >
                <button > {
                    setEditingComment(null)"
                    setNewComment('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  data-testid="edit-cancel-btn
                >
                  Cancel
                </button>
                <button onClick={handleEditSubmit} disabled={!newComment.trim()}>
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
"