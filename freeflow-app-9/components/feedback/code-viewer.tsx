"use client"

import React, { useState, useEffect } from 'react'
import { sanitizeCode } from '@/lib/sanitize'
import {
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Code,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('CodeViewer')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Comment {
  id: string
  content: string
  lineNumber: number
  author?: string
  createdAt?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  resolved?: boolean
}

interface CodeViewerProps {
  code: string
  language?: string
  filename?: string
  comments?: Comment[]
  onCommentAdd?: (comment: Partial<Comment>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  onCommentResolve?: (id: string) => void
  className?: string
  showLineNumbers?: boolean
}

// ============================================================================
// SYNTAX HIGHLIGHTING HELPER
// ============================================================================

function highlightCode(code: string, language: string): string {
  // Basic syntax highlighting for common languages
  const keywords: Record<string, string[]> = {
    javascript: ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'async', 'await', 'try', 'catch', 'throw', 'new'],
    typescript: ['import', 'export', 'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'async', 'await', 'try', 'catch', 'throw', 'new', 'interface', 'type', 'enum', 'public', 'private', 'protected'],
    python: ['import', 'from', 'def', 'class', 'return', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'with', 'as', 'async', 'await'],
    java: ['import', 'package', 'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'try', 'catch', 'finally', 'new', 'static', 'void'],
  }

  const langKeywords = keywords[language] || keywords.javascript

  // Escape HTML
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Highlight strings
  highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="text-green-400">$&</span>')

  // Highlight comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500 italic">$1</span>')
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500 italic">$1</span>')
  highlighted = highlighted.replace(/(#.*$)/gm, '<span class="text-gray-500 italic">$1</span>')

  // Highlight keywords
  langKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g')
    highlighted = highlighted.replace(regex, '<span class="text-purple-400 font-semibold">$1</span>')
  })

  // Highlight numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="text-orange-400">$1</span>')

  // Highlight functions
  highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="text-blue-400">$1</span>(')

  return highlighted
}

function getPriorityColor(priority: string = 'medium'): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 dark:bg-red-950 border-red-500'
    case 'high': return 'bg-orange-100 dark:bg-orange-950 border-orange-500'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-500'
    case 'low': return 'bg-blue-100 dark:bg-blue-950 border-blue-500'
    default: return 'bg-gray-100 dark:bg-gray-900 border-gray-500'
  }
}

// ============================================================================
// CODE VIEWER COMPONENT
// ============================================================================

export function CodeViewer({
  code,
  language = 'javascript',
  filename = 'code.js',
  comments = [],
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  onCommentResolve,
  className = "",
  showLineNumbers = true
}: CodeViewerProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [lines, setLines] = useState<string[]>([])
  const [highlightedLines, setHighlightedLines] = useState<string[]>([])
  const [selectedLine, setSelectedLine] = useState<number | null>(null)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [showResolvedComments, setShowResolvedComments] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  // ============================================================================
  // PROCESS CODE INTO LINES
  // ============================================================================

  useEffect(() => {
    const codeLines = code.split('\n')
    setLines(codeLines)

    const highlighted = codeLines.map(line => highlightCode(line, language))
    setHighlightedLines(highlighted)

    logger.info('Code processed', {
      filename,
      language,
      lineCount: codeLines.length
    })
  }, [code, language, filename])

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  const handleLineClick = (lineNumber: number) => {
    setSelectedLine(lineNumber)
    setShowCommentDialog(true)
    setNewComment('')
    setSelectedPriority('medium')
    setSelectedTags([])
    setEditingComment(null)

    logger.info('Adding comment to line', { lineNumber, filename })
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || selectedLine === null || !onCommentAdd) return

    const comment = {
      content: newComment.trim(),
      lineNumber: selectedLine,
      priority: selectedPriority,
      tags: selectedTags,
      resolved: false
    }

    onCommentAdd(comment)
    setShowCommentDialog(false)
    setNewComment('')
    setSelectedTags([])

    logger.info('Comment added', {
      lineNumber: selectedLine,
      priority: selectedPriority,
      tagsCount: selectedTags.length
    })
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment)
    setNewComment(comment.content)
    setSelectedLine(comment.lineNumber)
    setSelectedPriority(comment.priority || 'medium')
    setSelectedTags(comment.tags || [])
    setShowCommentDialog(true)

    logger.info('Editing comment', { commentId: comment.id })
  }

  const handleEditSubmit = () => {
    if (!newComment.trim() || !editingComment || !onCommentEdit) return

    onCommentEdit(editingComment.id, newComment.trim())
    setEditingComment(null)
    setShowCommentDialog(false)
    setNewComment('')
    setSelectedTags([])

    logger.info('Comment edited', { commentId: editingComment.id })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!onCommentDelete) return

    if (window.confirm('Are you sure you want to delete this comment?')) {
      onCommentDelete(commentId)
      logger.info('Comment deleted', { commentId })
    }
  }

  const handleResolveComment = (commentId: string) => {
    if (!onCommentResolve) return

    onCommentResolve(commentId)
    logger.info('Comment resolved', { commentId })
  }

  const toggleCommentExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // ============================================================================
  // FILTER COMMENTS
  // ============================================================================

  const getLineComments = (lineNumber: number) => {
    return comments.filter(c =>
      c.lineNumber === lineNumber &&
      (showResolvedComments || !c.resolved)
    )
  }

  const unresolvedCount = comments.filter(c => !c.resolved).length
  const resolvedCount = comments.filter(c => c.resolved).length

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code className="w-5 h-5 text-gray-400" />
          <h3 className="text-white font-semibold">{filename}</h3>
          <Badge variant="outline" className="text-xs text-gray-300">
            {language}
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400">
            {unresolvedCount} unresolved, {resolvedCount} resolved
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResolvedComments(!showResolvedComments)}
            className="text-gray-300"
          >
            {showResolvedComments ? (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Hide Resolved
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Show Resolved
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code Display */}
      <div className="p-4 overflow-x-auto">
        <div className="font-mono text-sm">
          {lines.map((line, index) => {
            const lineNumber = index + 1
            const lineComments = getLineComments(lineNumber)
            const hasComments = lineComments.length > 0

            return (
              <div key={lineNumber} className="group">
                {/* Code Line */}
                <div
                  className={`flex items-start hover:bg-gray-800 transition-colors ${
                    hasComments ? 'bg-gray-800/50' : ''
                  }`}
                >
                  {/* Line Number */}
                  {showLineNumbers && (
                    <div className="sticky left-0 bg-gray-900 group-hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-2 px-3 py-1">
                        <span className="text-gray-500 text-right w-8 select-none">
                          {lineNumber}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => handleLineClick(lineNumber)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Code Content */}
                  <div className="flex-1 px-4 py-1">
                    <code
                      className="text-gray-300"
                      dangerouslySetInnerHTML={{ __html: sanitizeCode(highlightedLines[index] || line) }}
                    />
                  </div>

                  {/* Comment Indicator */}
                  {hasComments && (
                    <div className="px-3 py-1">
                      <MessageSquare className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>

                {/* Inline Comments */}
                {hasComments && (
                  <div className="ml-16 mb-2 space-y-2">
                    {lineComments.map((comment) => {
                      const isExpanded = expandedComments.has(comment.id)

                      return (
                        <div
                          key={comment.id}
                          className={`p-3 rounded-lg border-l-4 ${getPriorityColor(comment.priority)} ${
                            comment.resolved ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {/* Comment Header */}
                              <div className="flex items-center gap-2 mb-2">
                                {comment.priority && comment.priority !== 'medium' && (
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {comment.priority}
                                  </Badge>
                                )}
                                {comment.resolved && (
                                  <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-950">
                                    Resolved
                                  </Badge>
                                )}
                                {comment.author && (
                                  <span className="text-xs text-gray-400">
                                    {comment.author}
                                  </span>
                                )}
                                {comment.createdAt && (
                                  <span className="text-xs text-gray-500">
                                    {comment.createdAt}
                                  </span>
                                )}
                              </div>

                              {/* Comment Content */}
                              <p className={`text-sm text-gray-100 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {comment.content}
                              </p>

                              {/* Expand/Collapse for long comments */}
                              {comment.content.length > 100 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 text-xs text-gray-400"
                                  onClick={() => toggleCommentExpanded(comment.id)}
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="w-3 h-3 mr-1" />
                                      Show Less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-3 h-3 mr-1" />
                                      Show More
                                    </>
                                  )}
                                </Button>
                              )}

                              {/* Tags */}
                              {comment.tags && comment.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {comment.tags.map((tag, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Comment Actions */}
                            <div className="flex items-center gap-1">
                              {!comment.resolved && onCommentResolve && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResolveComment(comment.id)}
                                  title="Mark as resolved"
                                >
                                  <Check className="w-3 h-3 text-green-600" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditComment(comment)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingComment ? 'Edit Comment' : 'Add Comment'} on Line {selectedLine}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your feedback or suggestion..."
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['Bug', 'Performance', 'Security', 'Style', 'Refactor', 'Documentation'].map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingComment ? handleEditSubmit : handleCommentSubmit}>
              {editingComment ? 'Save Changes' : 'Add Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
