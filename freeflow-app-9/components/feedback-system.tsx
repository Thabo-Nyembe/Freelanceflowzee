"use client"

import { useState } from "react"
import { UniversalPinpointFeedback } from "@/components/projects-hub/universal-pinpoint-feedback"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent } from "@/components/ui/card"

// Types for the feedback system
interface MediaFile {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document" | "code" | "design"
  url: string
  thumbnail?: string
  version: string
  createdAt: string
  comments: Comment[]
  metadata?: {
    width?: number
    height?: number
    duration?: number
    pages?: number
    lines?: number
  }
}

interface User {
  id: string
  name: string
  avatar?: string
}

interface Comment {
  id: string
  position: any
  content: string
  author: User
  createdAt: string
  status: "open" | "resolved" | "in_progress" | "wont_fix"
  type: "text" | "voice" | "screen" | "drawing"
  priority: "low" | "medium" | "high" | "critical"
  replies: any[]
  attachments?: any[]
}

interface FeedbackSystemProps {
  projectId: string
  initialFiles?: MediaFile[]
  readOnly?: boolean
  className?: string
}

export function FeedbackSystem({
  projectId,
  initialFiles,
  readOnly = false,
  className
}: FeedbackSystemProps) {
  const { toast } = useToast()
  const [commentCount, setCommentCount] = useState(
    initialFiles?.reduce((count, file) => count + file.comments.length, 0) || 0
  )

  // Comment event handlers
  const handleCommentAdd = (comment: Comment) => {
    setCommentCount(prev => prev + 1)
    toast({
      title: "Comment added",
      description: "Your comment has been added successfully",
    })
  }

  const handleCommentUpdate = (comment: Comment) => {
    toast({
      title: "Comment updated",
      description: "The comment has been updated successfully",
    })
  }

  const handleCommentDelete = (commentId: string) => {
    setCommentCount(prev => Math.max(0, prev - 1))
    toast({
      title: "Comment deleted",
      description: "The comment has been deleted successfully",
    })
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 h-[600px]">
        <UniversalPinpointFeedback
          projectId={projectId}
          initialFiles={initialFiles}
          readOnly={readOnly}
          onCommentAdd={handleCommentAdd}
          onCommentUpdate={handleCommentUpdate}
          onCommentDelete={handleCommentDelete}
        />
      </CardContent>
    </Card>
  )
}
