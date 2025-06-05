"use client"

import { useState } from "react"
import { MessageSquare } from "lucide-react"
import { CommentDialog } from "./comment-dialog"

interface CodeViewerProps {
  file: any
  comments: any[]
  onAddComment: (comments: any[]) => void
}

const sampleCode = `import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface UserProps {
  name: string
  email: string
}

export function UserCard({ name, email }: UserProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <Card className="p-4">
      <h3 className="font-bold">{name}</h3>
      <p className="text-gray-600">{email}</p>
      <Button 
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Contact'}
      </Button>
    </Card>
  )
}`

export function CodeViewer({ file, comments, onAddComment }: CodeViewerProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  const lines = sampleCode.split("\n")

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber)
    setShowCommentDialog(true)
  }

  const handleAddComment = (content: string) => {
    if (selectedLine === null) return

    const newComment = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toISOString(),
      author: "You",
      lineNumber: selectedLine,
      type: "line",
    }

    onAddComment([...comments, newComment])
    setShowCommentDialog(false)
    setSelectedLine(null)
  }

  const getLineComments = (lineNumber: number) => {
    return comments.filter((comment) => comment.lineNumber === lineNumber)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">TypeScript React Component</span>
        </div>
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm">{comments.length} comments</span>
        </div>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto bg-gray-900 rounded-lg">
        <div className="flex">
          {/* Line Numbers */}
          <div className="bg-gray-800 px-4 py-4 text-right text-sm text-gray-400 select-none">
            {lines.map((_, index) => (
              <div key={index} className="h-6 leading-6">
                {index + 1}
              </div>
            ))}
          </div>

          {/* Code Content */}
          <div className="flex-1">
            <pre className="p-4 text-sm font-mono text-gray-100 overflow-x-auto">
              {lines.map((line, index) => {
                const lineNumber = index + 1
                const lineComments = getLineComments(lineNumber)
                const hasComments = lineComments.length > 0

                return (
                  <div
                    key={index}
                    className={`h-6 leading-6 cursor-pointer hover:bg-gray-800 relative group ${
                      hasComments ? "bg-yellow-900 bg-opacity-30" : ""
                    }`}
                    onClick={() => handleLineClick(lineNumber)}
                  >
                    <code>{line}</code>

                    {hasComments && (
                      <div className="absolute right-2 top-0 flex items-center space-x-1">
                        {lineComments.map((comment) => (
                          <div
                            key={comment.id}
                            className="w-3 h-3 bg-yellow-500 rounded-full"
                            title={comment.content}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </pre>
          </div>
        </div>
      </div>

      <CommentDialog
        open={showCommentDialog}
        onOpenChange={setShowCommentDialog}
        onSubmit={handleAddComment}
        title={`Add Comment to Line ${selectedLine}`}
        description={selectedLine ? `Line ${selectedLine}: ${lines[selectedLine - 1]}` : ""}
      />
    </div>
  )
}
