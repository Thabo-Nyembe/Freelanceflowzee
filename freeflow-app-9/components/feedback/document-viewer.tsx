"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, MessageSquare, FileText } from "lucide-react"
import { CommentDialog } from "./comment-dialog"

interface DocumentViewerProps {
  file: any
  comments: any[]
  onAddComment: (comments: any[]) => void
}

const sampleText = `# Project Brief: Brand Identity Redesign

## Overview
This document outlines the comprehensive brand identity redesign project for our client. The goal is to modernize their visual identity while maintaining brand recognition.

## Objectives
- Modernize the visual identity
- Improve brand recognition
- Enhance customer engagement
- Align with current market trends

## Deliverables
1. Logo redesign and brand mark
2. Color palette and typography
3. Brand guidelines document
4. Marketing collateral templates
5. Digital asset library

## Timeline
The project will be completed over 6 weeks with regular check-ins and feedback sessions.`

export function DocumentViewer({ file, comments, onAddComment }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [selectedText, setSelectedText] = useState("")
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString())
      setShowCommentDialog(true)
    }
  }

  const handleAddComment = (content: string) => {
    const newComment = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      author: "You",
      selectedText,
      type: "text",
    }

    onAddComment([...comments, newComment])
    setShowCommentDialog(false)
    setSelectedText("")
  }

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button variant="outline" size="sm" onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{comments.length} comments</span>
        </div>
      </div>

      {/* Document */}
      <div className="flex-1 overflow-auto bg-white rounded-lg border">
        <div className="p-8" style={{ fontSize: `${zoom}rem` }}>
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-800">Document Preview</h1>
          </div>

          <div
            className="prose max-w-none"
            onMouseUp={handleTextSelection}
            dangerouslySetInnerHTML={{
              __html: sampleText
                .split("\n")
                .map((line) => {
                  if (line.startsWith("# ")) {
                    return `<h1 class="text-3xl font-bold mt-8 mb-4 text-gray-800">${line.substring(2)}</h1>`
                  } else if (line.startsWith("## ")) {
                    return `<h2 class="text-2xl font-semibold mt-6 mb-3 text-gray-700">${line.substring(3)}</h2>`
                  } else if (line.startsWith("- ")) {
                    return `<li class="ml-4 mb-1">${line.substring(2)}</li>`
                  } else if (line.match(/^\d+\./)) {
                    return `<li class="ml-4 mb-1">${line.substring(line.indexOf(".") + 1)}</li>`
                  } else if (line.trim()) {
                    return `<p class="mb-4 text-gray-600">${line}</p>`
                  }
                  return "<br>"
                })
                .join(""),
            }}
          />
        </div>
      </div>

      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        onSubmit={handleAddComment}
        title="Add Text Comment"
        description={selectedText ? `Comment on: "${selectedText}"` : "Select text to comment on it."}
      />
    </div>
  )
}
