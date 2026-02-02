"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  ZoomIn,
  ZoomOut,
  MessageSquare,
  Edit,
  Trash2,
  FileText,
  Highlighter,
  PenTool,
  Square,
  Circle,
  ArrowRight,
  Eraser,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  RotateCw,
  File
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('DocumentViewer')

// Check if a file is a PDF based on filename or URL
function isPdfFile(filename?: string, url?: string): boolean {
  const name = filename?.toLowerCase() || url?.toLowerCase() || ''
  return name.endsWith('.pdf') || name.includes('application/pdf')
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Comment {
  id: string
  content: string
  position?: { x: number; y: number; page?: number }
  selectedText?: string
  author?: string
  createdAt?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface Annotation {
  id: string
  type: 'highlight' | 'draw' | 'shape' | 'text'
  color: string
  points?: { x: number; y: number }[]
  position?: { x: number; y: number; width?: number; height?: number }
  text?: string
  shapeType?: 'rectangle' | 'circle' | 'arrow'
}

interface DocumentViewerProps {
  documentUrl?: string
  documentContent?: string
  filename?: string
  comments?: Comment[]
  annotations?: Annotation[]
  onCommentAdd?: (comment: Partial<Comment>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  onAnnotationAdd?: (annotation: Annotation) => void
  onAnnotationDelete?: (id: string) => void
  className?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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
// DOCUMENT VIEWER COMPONENT
// ============================================================================

export function DocumentViewer({
  documentUrl,
  documentContent = '',
  filename = 'document.pdf',
  comments = [],
  annotations = [],
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  onAnnotationAdd,
  onAnnotationDelete,
  className = ""
}: DocumentViewerProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [zoom, setZoom] = useState(100)
  const [selectedText, setSelectedText] = useState('')
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number } | null>(null)

  // PDF state
  const [isPdf, setIsPdf] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageInput, setPageInput] = useState('1')
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Drawing state
  const [drawingMode, setDrawingMode] = useState<'none' | 'highlight' | 'draw' | 'shape' | 'text'>('none')
  const [drawingColor, setDrawingColor] = useState('#FFEB3B')
  const [shapeType, setShapeType] = useState<'rectangle' | 'circle' | 'arrow'>('rectangle')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const documentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Detect if document is PDF
  useEffect(() => {
    const isPdfDocument = isPdfFile(filename, documentUrl)
    setIsPdf(isPdfDocument)
    logger.info('Document type detected', { isPdf: isPdfDocument, filename })
  }, [filename, documentUrl])

  // ============================================================================
  // DOCUMENT RENDERING
  // ============================================================================

  const renderDocument = () => {
    if (!documentContent) {
      return <div className="text-gray-500 text-center py-12">No document content available</div>
    }

    // Simple markdown-like rendering
    return documentContent.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">{line.substring(2)}</h1>
      } else if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-200">{line.substring(3)}</h2>
      } else if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold mt-4 mb-2 text-gray-700 dark:text-gray-300">{line.substring(4)}</h3>
      } else if (line.startsWith('- ')) {
        return <li key={index} className="ml-6 mb-1 text-gray-700 dark:text-gray-300">{line.substring(2)}</li>
      } else if (line.match(/^\d+\./)) {
        return <li key={index} className="ml-6 mb-1 text-gray-700 dark:text-gray-300 list-decimal">{line.substring(line.indexOf('.') + 1)}</li>
      } else if (line.trim()) {
        return <p key={index} className="mb-4 text-gray-600 dark:text-gray-400 leading-relaxed">{line}</p>
      }
      return <br key={index} />
    })
  }

  // ============================================================================
  // TEXT SELECTION HANDLING
  // ============================================================================

  const handleTextSelection = (event: React.MouseEvent) => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const rect = documentRef.current?.getBoundingClientRect()
      if (rect) {
        setSelectedText(selection.toString())
        setCommentPosition({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100
        })
        setShowCommentDialog(true)
        setNewComment('')
        setSelectedPriority('medium')
        setSelectedTags([])
        setEditingComment(null)

        logger.info('Text selected for comment', {
          textLength: selection.toString().length,
          position: commentPosition
        })
      }
    }
  }

  // ============================================================================
  // CANVAS DRAWING HANDLERS
  // ============================================================================

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw all annotations
    annotations.forEach(annotation => {
      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color
      ctx.lineWidth = annotation.type === 'highlight' ? 10 : 2
      ctx.globalAlpha = annotation.type === 'highlight' ? 0.3 : 1

      if (annotation.type === 'draw' && annotation.points) {
        ctx.beginPath()
        annotation.points.forEach((point, idx) => {
          if (idx === 0) {
            ctx.moveTo(point.x, point.y)
          } else {
            ctx.lineTo(point.x, point.y)
          }
        })
        ctx.stroke()
      } else if (annotation.type === 'shape' && annotation.position) {
        const { x, y, width = 0, height = 0 } = annotation.position

        if (annotation.shapeType === 'rectangle') {
          ctx.strokeRect(x, y, width, height)
        } else if (annotation.shapeType === 'circle') {
          const radius = Math.sqrt(width ** 2 + height ** 2) / 2
          ctx.beginPath()
          ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (annotation.shapeType === 'arrow') {
          // Draw arrow
          const headlen = 15
          const angle = Math.atan2(height, width)

          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + width, y + height)
          ctx.lineTo(
            x + width - headlen * Math.cos(angle - Math.PI / 6),
            y + height - headlen * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(x + width, y + height)
          ctx.lineTo(
            x + width - headlen * Math.cos(angle + Math.PI / 6),
            y + height - headlen * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      } else if (annotation.type === 'highlight' && annotation.position) {
        const { x, y, width = 0, height = 0 } = annotation.position
        ctx.fillRect(x, y, width, height)
      } else if (annotation.type === 'text' && annotation.position && annotation.text) {
        ctx.globalAlpha = 1
        ctx.font = '16px Arial'
        ctx.fillStyle = annotation.color
        ctx.fillText(annotation.text, annotation.position.x, annotation.position.y)
      }

      ctx.globalAlpha = 1
    })
  }, [annotations])

  const handleCanvasMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawingMode === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setIsDrawing(true)
    setStartPoint({ x, y })

    if (drawingMode === 'draw' || drawingMode === 'highlight') {
      setCurrentPath([{ x, y }])
    }

    logger.debug('Drawing started', { mode: drawingMode, x, y })
  }

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawingMode === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    if (drawingMode === 'draw' || drawingMode === 'highlight') {
      setCurrentPath(prev => [...prev, { x, y }])

      // Draw preview
      const ctx = canvas.getContext('2d')
      if (ctx && currentPath.length > 0) {
        ctx.strokeStyle = drawingColor
        ctx.lineWidth = drawingMode === 'highlight' ? 10 : 2
        ctx.globalAlpha = drawingMode === 'highlight' ? 0.3 : 1
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(currentPath[currentPath.length - 1].x, currentPath[currentPath.length - 1].y)
        ctx.lineTo(x, y)
        ctx.stroke()

        ctx.globalAlpha = 1
      }
    }
  }

  const handleCanvasMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint || drawingMode === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    let annotation: Annotation | null = null

    if (drawingMode === 'draw' || drawingMode === 'highlight') {
      annotation = {
        id: Date.now().toString(),
        type: drawingMode,
        color: drawingColor,
        points: currentPath
      }
    } else if (drawingMode === 'shape') {
      annotation = {
        id: Date.now().toString(),
        type: 'shape',
        color: drawingColor,
        shapeType,
        position: {
          x: Math.min(startPoint.x, x),
          y: Math.min(startPoint.y, y),
          width: Math.abs(x - startPoint.x),
          height: Math.abs(y - startPoint.y)
        }
      }
    }

    if (annotation && onAnnotationAdd) {
      onAnnotationAdd(annotation)
      logger.info('Annotation added', {
        type: annotation.type,
        color: annotation.color
      })
    }

    setIsDrawing(false)
    setCurrentPath([])
    setStartPoint(null)
  }

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !onCommentAdd) return

    const comment = {
      content: newComment.trim(),
      selectedText,
      position: commentPosition || undefined,
      priority: selectedPriority,
      tags: selectedTags
    }

    onCommentAdd(comment)
    setShowCommentDialog(false)
    setNewComment('')
    setSelectedTags([])
    setSelectedText('')

    logger.info('Comment added', {
      hasSelectedText: !!selectedText,
      priority: selectedPriority,
      tagsCount: selectedTags.length
    })
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment)
    setNewComment(comment.content)
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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(200, prev + 10))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(50, prev - 10))
  }

  const clearAnnotations = () => {
    if (window.confirm('Clear all annotations?')) {
      annotations.forEach(a => onAnnotationDelete?.(a.id))
      logger.info('All annotations cleared')
    }
  }

  // ============================================================================
  // PDF NAVIGATION HANDLERS
  // ============================================================================

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const newPage = currentPage - 1
      setCurrentPage(newPage)
      setPageInput(newPage.toString())
      logger.info('PDF page changed', { page: newPage })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1
      setCurrentPage(newPage)
      setPageInput(newPage.toString())
      logger.info('PDF page changed', { page: newPage })
    }
  }

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(pageInput, 10)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        logger.info('PDF page jumped', { page })
      } else {
        setPageInput(currentPage.toString())
      }
    }
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
    logger.info('PDF rotated', { rotation: (rotation + 90) % 360 })
  }

  const handleFullscreen = async () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleDownload = () => {
    if (documentUrl) {
      const link = document.createElement('a')
      link.href = documentUrl
      link.download = filename || 'document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      logger.info('PDF downloaded', { filename })
    }
  }

  // Get page-specific comments
  const getPageComments = useCallback(() => {
    return comments.filter(c => !c.position?.page || c.position.page === currentPage)
  }, [comments, currentPage])

  // ============================================================================
  // PDF VIEWER COMPONENT
  // ============================================================================

  const renderPdfViewer = () => {
    if (!documentUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <File className="w-16 h-16 mb-4 opacity-50" />
          <p>No PDF URL provided</p>
        </div>
      )
    }

    // Use iframe with browser's native PDF viewer
    // Add page parameter for page navigation (works with Chrome/Firefox PDF viewer)
    const pdfUrlWithPage = `${documentUrl}#page=${currentPage}`

    return (
      <div className="relative w-full h-full min-h-[600px]">
        <iframe
          ref={iframeRef}
          src={pdfUrlWithPage}
          className="w-full h-full border-0"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'top center',
            minHeight: '600px'
          }}
          title={filename || 'PDF Document'}
        />

        {/* Page overlay for comments (positioned absolutely) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {/* Comment Markers for current page */}
          {getPageComments().map((comment) => {
            if (!comment.position) return null

            return (
              <div
                key={comment.id}
                className="absolute w-6 h-6 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center text-white text-xs font-bold pointer-events-auto"
                style={{
                  left: `${comment.position.x}%`,
                  top: `${comment.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={comment.content}
              >
                <MessageSquare className="w-3 h-3" />
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={containerRef} className={`flex flex-col h-full bg-gray-50 dark:bg-gray-950 ${className}`}>
      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{filename}</h3>
            {isPdf && (
              <Badge variant="outline" className="text-xs">PDF</Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* PDF Page Navigation */}
            {isPdf && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage <= 1}
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onKeyDown={handlePageInputSubmit}
                    className="w-12 h-8 text-center text-sm"
                  />
                  <span className="text-sm text-gray-500">/ {totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
              </>
            )}

            {/* Zoom Controls */}
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[60px] text-center">{zoom}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>

            {/* Drawing Tools (for non-PDF or when annotations enabled) */}
            {!isPdf && (
              <>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

                <Button
                  variant={drawingMode === 'highlight' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === 'highlight' ? 'none' : 'highlight')}
                  title="Highlight"
                >
                  <Highlighter className="w-4 h-4" />
                </Button>

                <Button
                  variant={drawingMode === 'draw' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === 'draw' ? 'none' : 'draw')}
                  title="Draw"
                >
                  <PenTool className="w-4 h-4" />
                </Button>

                <Button
                  variant={drawingMode === 'shape' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDrawingMode(drawingMode === 'shape' ? 'none' : 'shape')}
                  title="Shape"
                >
                  {shapeType === 'rectangle' && <Square className="w-4 h-4" />}
                  {shapeType === 'circle' && <Circle className="w-4 h-4" />}
                  {shapeType === 'arrow' && <ArrowRight className="w-4 h-4" />}
                </Button>

                {drawingMode === 'shape' && (
                  <Select value={shapeType} onValueChange={(value: any) => setShapeType(value)}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectangle">Rectangle</SelectItem>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="arrow">Arrow</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                  title="Color"
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAnnotations}
                  title="Clear Annotations"
                >
                  <Eraser className="w-4 h-4" />
                </Button>
              </>
            )}

            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

            {/* Comment Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{isPdf ? getPageComments().length : comments.length} comments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Display */}
      <div className="flex-1 overflow-auto p-8">
        <div className="relative max-w-4xl mx-auto">
          {isPdf ? (
            /* PDF Viewer */
            renderPdfViewer()
          ) : (
            <>
              {/* Document Content (Markdown/Text) */}
              <div
                ref={documentRef}
                className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-12 relative"
                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                onMouseUp={handleTextSelection}
              >
                {renderDocument()}

                {/* Comment Markers */}
                {comments.map((comment) => {
                  if (!comment.position) return null

                  return (
                    <div
                      key={comment.id}
                      className="absolute w-6 h-6 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center text-white text-xs font-bold"
                      style={{
                        left: `${comment.position.x}%`,
                        top: `${comment.position.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={comment.content}
                    >
                      <MessageSquare className="w-3 h-3" />
                    </div>
                  )
                })}
              </div>

              {/* Drawing Canvas Overlay */}
              <canvas
                ref={canvasRef}
                width={800}
                height={1200}
                className="absolute top-0 left-0 pointer-events-auto cursor-crosshair"
                style={{
                  transform: `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  display: drawingMode !== 'none' ? 'block' : 'none'
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              />
            </>
          )}
        </div>
      </div>

      {/* Comments Sidebar */}
      {comments.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 max-h-64 overflow-y-auto">
          <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Comments</h4>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border-l-4 ${getPriorityColor(comment.priority)}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    {comment.selectedText && (
                      <div className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mb-2 italic">
                        "{comment.selectedText}"
                      </div>
                    )}
                    <p className="text-sm text-gray-900 dark:text-gray-100">{comment.content}</p>
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
                  <div className="flex items-center gap-1">
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
            ))}
          </div>
        </div>
      )}

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingComment ? 'Edit Comment' : 'Add Comment'}
            </DialogTitle>
          </DialogHeader>

          {selectedText && !editingComment && (
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm italic">
              <strong>Selected text:</strong> "{selectedText}"
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your feedback..."
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
                {['Content', 'Grammar', 'Clarity', 'Structure', 'Formatting', 'Accuracy'].map((tag) => (
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
