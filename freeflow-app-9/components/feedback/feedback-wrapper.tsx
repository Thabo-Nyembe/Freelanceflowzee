'use client'

import React, { useState } from 'react'
import ImageViewer from './image-viewer'
import VideoViewer from './video-viewer'
import AudioViewer from './audio-viewer'

export interface Comment {
  id: string
  content: string
  position?: {
    x?: number
    y?: number
    timestamp?: number
  }
  author: string
  created_at: string
  updated_at?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface FeedbackWrapperProps {
  type: 'video' | 'audio' | 'image'
  src: string
  title?: string
  alt?: string
  initialComments?: Comment[]
}

export default function FeedbackWrapper({
  type,
  src,
  title,
  alt,
  initialComments = []
}: FeedbackWrapperProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)

  const handleCommentAdd = (comment: Omit<Comment, 'id' | 'author' | 'created_at'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      author: 'Test User',
      created_at: new Date().toISOString(),
    }
    setComments(prev => [...prev, newComment])
    console.log('Adding comment:', newComment)
  }

  const handleCommentEdit = (id: string, content: string) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === id 
          ? { ...comment, content, updated_at: new Date().toISOString() }
          : comment
      )
    )
    console.log('Editing comment:', id, content)
  }

  const handleCommentDelete = (id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id))
    console.log('Deleting comment:', id)
  }

  const commonProps = {
    comments,
    onCommentAdd: handleCommentAdd,
    onCommentEdit: handleCommentEdit,
    onCommentDelete: handleCommentDelete
  }

  switch (type) {
    case 'image':
      return (
        <ImageViewer
          src={src}
          alt={alt || 'Image'}
          {...commonProps}
        />
      )
    case 'video':
      return (
        <VideoViewer
          src={src}
          title={title || 'Video'}
          {...commonProps}
        />
      )
    case 'audio':
      return (
        <AudioViewer
          src={src}
          title={title || 'Audio'}
          {...commonProps}
        />
      )
    default:
      return (
        <VideoViewer
          src={src}
          title={title || 'Video'}
          {...commonProps}
        />
      )
  }
} 