"use client"

import type React from 'react'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, MessageSquare, Pen, Square } from 'lucide-react'
import { CommentDialog } from './comment-dialog'

interface ScreenshotViewerProps {
  file: Record<string, unknown>
  comments: Record<string, unknown>[]
  onAddComment: (comments: Record<string, unknown>[]) => void
}

export function ScreenshotViewer({ file, comments, onAddComment }: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [tool, setTool] = useState<&quot;comment&quot; | &quot;pen&quot; | &quot;rectangle&quot;>("comment")
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const handleImageClick = (e: React.MouseEvent) => {
    if (tool !== "comment" || !imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setClickPosition({ x, y })
    setShowCommentDialog(true)
  }

  const handleAddComment = (content: string) => {
    if (!clickPosition) return

    const newComment = {
      id: Date.now().toString(),
      content,
      position: clickPosition,
      author: "You",
      timestamp: new Date().toISOString(),
      type: "position",
    }

    onAddComment([...comments, newComment])
    setShowCommentDialog(false)
    setClickPosition(null)
  }

  return (
    <div className= "h-full flex flex-col">
      {/* Controls */}
      <div className= "flex items-center justify-between mb-4">
        <div className= "flex items-center space-x-2">
          <div className= "flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button variant={tool === "comment" ? &quot;default&quot; : &quot;ghost&quot;} size= "sm" onClick={() => setTool("comment")}>
              <MessageSquare className= "w-4 h-4" />
            </Button>
            <Button variant={tool === "pen" ? &quot;default&quot; : &quot;ghost&quot;} size= "sm" onClick={() => setTool("pen")}>
              <Pen className= "w-4 h-4" />
            </Button>
            <Button variant={tool === "rectangle" ? &quot;default&quot; : &quot;ghost&quot;} size= "sm" onClick={() => setTool("rectangle")}>
              <Square className= "w-4 h-4" />
            </Button>
          </div>

          <div className= "flex items-center space-x-1">
            <Button variant= "outline" size= "sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
              <ZoomOut className= "w-4 h-4" />
            </Button>
            <span className= "text-sm font-medium">{Math.round(zoom * 100)}%</span>
            <Button variant= "outline" size= "sm" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
              <ZoomIn className= "w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className= "flex items-center space-x-2">
          <MessageSquare className= "w-4 h-4" />
          <span className= "text-sm">{comments.length} comments</span>
        </div>
      </div>

      {/* Screenshot */}
      <div className= "flex-1 overflow-auto bg-gray-100 rounded-lg relative">
        <div className= "flex items-center justify-center min-h-full p-4">
          <div
            ref={imageRef}
            className="relative"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            onClick={handleImageClick}
          >
            <img src={file.url || "/placeholder.svg"} alt={file.name} className={`max-w-full max-h-full shadow-lg rounded ${
                tool === "comment" ? "cursor-crosshair" : 'cursor-crosshair'
              } draggable={false}>

            {/* Comment Pins */}
            {comments.map((comment) =>
              comment.position ? (
                <div key={comment.id} style={{
                    left: `${comment.position.x} title={comment.content}>
                  <MessageSquare >
                </div>
              ) : null,
            )}
          </div>
        </div>
      </div>

      {/* Tool Instructions */}
      <div >
        {tool === "comment" && "Click anywhere to add a comment"}
        {tool === "pen" && "Click and drag to draw"}
        {tool === "rectangle" && "Click and drag to draw a rectangle"}
      </div>

      <CommentDialog open={showCommentDialog} onOpenChange={setShowCommentDialog} onSubmit={handleAddComment}>
    </div>
  )
}
