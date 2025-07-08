"use client"

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { CommentDialog } from './comment-dialog'

interface CodeViewerProps {
  file: Record<string, unknown>
  comments: Record<string, unknown>[]
  onAddComment: (comments: Record<string, unknown>[]) => void
}

const sampleCode = `import { useState } from 'react'
import { Button } from '@/components/ui/button'

function MyComponent() {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  )
}

export default MyComponent`

export function CodeViewer({ file, comments, onAddComment }: CodeViewerProps) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)

  const lines = sampleCode.split('\n')

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber)
    setShowCommentDialog(true)
  }

  const handleAddComment = (comment: string) => {
    const newComment = {
      id: Date.now(),
      line: selectedLine,
      text: comment,
      author: 'Current User',
      timestamp: new Date().toISOString()
    }
    onAddComment([...comments, newComment])
    setShowCommentDialog(false)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
      <div className="mb-4 text-white">
        <h3 className="font-semibold">{(file.name as string) || 'Code File'}</h3>
      </div>
      <div className="space-y-1">
        {lines.map((line, index) => {
          const lineNumber = index + 1
          const lineComments = comments.filter(c => (c.line as number) === lineNumber)
          
          return (
            <div key={lineNumber} className="group">
              <div 
                className="flex items-center hover:bg-gray-800 rounded px-2 py-1 cursor-pointer"
                onClick={() => handleLineClick(lineNumber)}
              >
                <span className="text-gray-500 w-8 text-right mr-4">
                  {lineNumber}
                </span>
                <code className="text-gray-300 flex-1">{line}</code>
                {lineComments.length > 0 && (
                  <MessageSquare className="w-4 h-4 text-blue-400 ml-2" />
                )}
              </div>
              {lineComments.map((comment) => (
                <div key={(comment.id as string)} className="ml-12 mb-2 p-2 bg-blue-50 rounded text-sm">
                  <div className="font-medium text-blue-900">{comment.author as string}</div>
                  <div className="text-blue-800">{comment.text as string}</div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      
      <CommentDialog 
        open={showCommentDialog}
        onClose={() => setShowCommentDialog(false)}
        onSubmit={handleAddComment}
        lineNumber={selectedLine}
      />
    </div>
  )
}
