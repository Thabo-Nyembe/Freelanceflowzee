"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  Palette,
  Undo,
  Redo,
  Trash2,
  Download,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AnnotationOverlay')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Point {
  x: number
  y: number
}

interface DrawingPath {
  id: string
  type: 'draw' | 'erase'
  points: Point[]
  color: string
  lineWidth: number
}

interface Shape {
  id: string
  type: 'rectangle' | 'circle' | 'arrow'
  start: Point
  end: Point
  color: string
  lineWidth: number
}

interface TextAnnotation {
  id: string
  type: 'text'
  position: Point
  text: string
  color: string
  fontSize: number
}

type Annotation = DrawingPath | Shape | TextAnnotation

interface AnnotationOverlayProps {
  isVisible: boolean
  onClose: () => void
  canvasWidth?: number
  canvasHeight?: number
  className?: string
}

type ToolType = 'draw' | 'erase' | 'rectangle' | 'circle' | 'arrow' | 'text' | 'none'

// ============================================================================
// ANNOTATION OVERLAY COMPONENT
// ============================================================================

export function AnnotationOverlay({
  isVisible,
  onClose,
  canvasWidth = 800,
  canvasHeight = 600,
  className = ''
}: AnnotationOverlayProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [currentTool, setCurrentTool] = useState<ToolType>('none')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<Point[]>([])
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [drawColor, setDrawColor] = useState('#FF0000')
  const [lineWidth, setLineWidth] = useState([3])
  const [fontSize, setFontSize] = useState([16])
  const [textInput, setTextInput] = useState('')
  const [textPosition, setTextPosition] = useState<Point | null>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [history, setHistory] = useState<Annotation[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // CANVAS DRAWING
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
      if ('points' in annotation && annotation.type === 'draw') {
        // Draw path
        if (annotation.points.length < 2) return

        ctx.strokeStyle = annotation.color
        ctx.lineWidth = annotation.lineWidth
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y)

        for (let i = 1; i < annotation.points.length; i++) {
          ctx.lineTo(annotation.points[i].x, annotation.points[i].y)
        }

        ctx.stroke()
      } else if ('points' in annotation && annotation.type === 'erase') {
        // Erase path
        if (annotation.points.length < 2) return

        ctx.globalCompositeOperation = 'destination-out'
        ctx.lineWidth = annotation.lineWidth * 2

        ctx.beginPath()
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y)

        for (let i = 1; i < annotation.points.length; i++) {
          ctx.lineTo(annotation.points[i].x, annotation.points[i].y)
        }

        ctx.stroke()
        ctx.globalCompositeOperation = 'source-over'
      } else if ('start' in annotation && 'end' in annotation) {
        // Draw shape
        ctx.strokeStyle = annotation.color
        ctx.lineWidth = annotation.lineWidth

        if (annotation.type === 'rectangle') {
          const width = annotation.end.x - annotation.start.x
          const height = annotation.end.y - annotation.start.y
          ctx.strokeRect(annotation.start.x, annotation.start.y, width, height)
        } else if (annotation.type === 'circle') {
          const radius = Math.sqrt(
            Math.pow(annotation.end.x - annotation.start.x, 2) +
            Math.pow(annotation.end.y - annotation.start.y, 2)
          )
          ctx.beginPath()
          ctx.arc(annotation.start.x, annotation.start.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
        } else if (annotation.type === 'arrow') {
          // Draw arrow line
          ctx.beginPath()
          ctx.moveTo(annotation.start.x, annotation.start.y)
          ctx.lineTo(annotation.end.x, annotation.end.y)
          ctx.stroke()

          // Draw arrow head
          const angle = Math.atan2(
            annotation.end.y - annotation.start.y,
            annotation.end.x - annotation.start.x
          )
          const headLength = 20

          ctx.beginPath()
          ctx.moveTo(annotation.end.x, annotation.end.y)
          ctx.lineTo(
            annotation.end.x - headLength * Math.cos(angle - Math.PI / 6),
            annotation.end.y - headLength * Math.sin(angle - Math.PI / 6)
          )
          ctx.moveTo(annotation.end.x, annotation.end.y)
          ctx.lineTo(
            annotation.end.x - headLength * Math.cos(angle + Math.PI / 6),
            annotation.end.y - headLength * Math.sin(angle + Math.PI / 6)
          )
          ctx.stroke()
        }
      } else if ('text' in annotation) {
        // Draw text
        ctx.fillStyle = annotation.color
        ctx.font = `${annotation.fontSize}px Arial`
        ctx.fillText(annotation.text, annotation.position.x, annotation.position.y)
      }
    })

    // Draw current preview
    if (isDrawing && currentTool === 'draw' && currentPath.length > 0) {
      ctx.strokeStyle = drawColor
      ctx.lineWidth = lineWidth[0]
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      ctx.beginPath()
      ctx.moveTo(currentPath[0].x, currentPath[0].y)

      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y)
      }

      ctx.stroke()
    } else if (isDrawing && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1]

      ctx.strokeStyle = drawColor
      ctx.lineWidth = lineWidth[0]

      if (currentTool === 'rectangle') {
        const width = endPoint.x - startPoint.x
        const height = endPoint.y - startPoint.y
        ctx.strokeRect(startPoint.x, startPoint.y, width, height)
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(endPoint.x - startPoint.x, 2) +
          Math.pow(endPoint.y - startPoint.y, 2)
        )
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI)
        ctx.stroke()
      } else if (currentTool === 'arrow') {
        // Preview arrow
        ctx.beginPath()
        ctx.moveTo(startPoint.x, startPoint.y)
        ctx.lineTo(endPoint.x, endPoint.y)
        ctx.stroke()

        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)
        const headLength = 20

        ctx.beginPath()
        ctx.moveTo(endPoint.x, endPoint.y)
        ctx.lineTo(
          endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
          endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(endPoint.x, endPoint.y)
        ctx.lineTo(
          endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
          endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
      }
    }
  }, [annotations, currentPath, isDrawing, startPoint, currentTool, drawColor, lineWidth])

  // ============================================================================
  // MOUSE HANDLERS
  // ============================================================================

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 'none') return

    const point = getCanvasPoint(e)
    setIsDrawing(true)
    setStartPoint(point)
    setCurrentPath([point])

    if (currentTool === 'text') {
      setTextPosition(point)
    }

    logger.debug('Drawing started', { tool: currentTool, point })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentTool === 'none') return

    const point = getCanvasPoint(e)

    if (currentTool === 'draw' || currentTool === 'erase') {
      setCurrentPath(prev => [...prev, point])
    } else {
      setCurrentPath([point])
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return

    const point = getCanvasPoint(e)

    let newAnnotation: Annotation | null = null

    if (currentTool === 'draw') {
      newAnnotation = {
        id: Date.now().toString(),
        type: 'draw',
        points: currentPath,
        color: drawColor,
        lineWidth: lineWidth[0]
      }
    } else if (currentTool === 'erase') {
      newAnnotation = {
        id: Date.now().toString(),
        type: 'erase',
        points: currentPath,
        color: drawColor,
        lineWidth: lineWidth[0]
      }
    } else if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'arrow') {
      newAnnotation = {
        id: Date.now().toString(),
        type: currentTool,
        start: startPoint,
        end: point,
        color: drawColor,
        lineWidth: lineWidth[0]
      }
    } else if (currentTool === 'text' && textInput.trim()) {
      newAnnotation = {
        id: Date.now().toString(),
        type: 'text',
        position: startPoint,
        text: textInput,
        color: drawColor,
        fontSize: fontSize[0]
      }
      setTextInput('')
      setTextPosition(null)
    }

    if (newAnnotation) {
      const newAnnotations = [...annotations, newAnnotation]
      setAnnotations(newAnnotations)

      // Update history
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newAnnotations)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)

      logger.info('Annotation added', {
        type: newAnnotation.type,
        color: drawColor,
        totalAnnotations: newAnnotations.length
      })
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPath([])
  }

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleClear = () => {
    if (confirm('Clear all annotations?')) {
      setAnnotations([])
      const newHistory = [...history, []]
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
      logger.info('All annotations cleared')
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setAnnotations(history[historyIndex - 1])
      logger.debug('Undo annotation')
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setAnnotations(history[historyIndex + 1])
      logger.debug('Redo annotation')
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob(blob => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `annotations-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)

      logger.info('Annotations downloaded', { count: annotations.length })
    })
  }

  const handleClose = () => {
    onClose()
    logger.info('Annotation overlay closed', { annotationCount: annotations.length })
  }

  if (!isVisible) return null

  // ============================================================================
  // RENDER
  // ============================================================================

  const colorPresets = [
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFFFFF', // White
    '#000000'  // Black
  ]

  return (
    <>
      <div
        ref={overlayRef}
        className={`fixed inset-0 z-50 bg-black/50 ${className}`}
        style={{ display: isVisible ? 'block' : 'none' }}
      >
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Drawing Tools */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={currentTool === 'draw' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('draw')}
                    title="Draw"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={currentTool === 'erase' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('erase')}
                    title="Eraser"
                  >
                    <Eraser className="w-4 h-4" />
                  </Button>

                  <div className="w-px h-6 bg-gray-300" />

                  <Button
                    variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('rectangle')}
                    title="Rectangle"
                  >
                    <Square className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={currentTool === 'circle' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('circle')}
                    title="Circle"
                  >
                    <Circle className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={currentTool === 'arrow' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('arrow')}
                    title="Arrow"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant={currentTool === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentTool('text')}
                    title="Text"
                  >
                    <Type className="w-4 h-4" />
                  </Button>
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-2">
                  <div className="w-px h-6 bg-gray-300" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="relative"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: drawColor }}
                    />
                  </Button>

                  {showColorPicker && (
                    <div className="absolute top-16 bg-white rounded-lg shadow-lg p-3 border border-gray-200 z-10">
                      <div className="grid grid-cols-4 gap-2">
                        {colorPresets.map(color => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded border-2 ${
                              drawColor === color ? 'border-blue-500' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              setDrawColor(color)
                              setShowColorPicker(false)
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-2">
                        <Input
                          type="color"
                          value={drawColor}
                          onChange={(e) => setDrawColor(e.target.value)}
                          className="w-full h-8"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Line Width */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Width:</span>
                  <Slider
                    value={lineWidth}
                    onValueChange={setLineWidth}
                    min={1}
                    max={20}
                    step={1}
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600 w-8">{lineWidth[0]}</span>
                </div>

                {/* History */}
                <div className="flex items-center gap-2">
                  <div className="w-px h-6 bg-gray-300" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    title="Undo"
                  >
                    <Undo className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    title="Redo"
                  >
                    <Redo className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    title="Clear All"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  title="Download Annotations"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>

            {/* Text Input */}
            {currentTool === 'text' && textPosition && (
              <div className="mt-3 flex items-center gap-2">
                <Input
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text annotation..."
                  className="flex-1"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Size:</span>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={10}
                    max={48}
                    step={2}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 w-8">{fontSize[0]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center p-8">
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className="bg-white border-2 border-gray-300 rounded-lg shadow-xl cursor-crosshair"
              style={{
                cursor: currentTool === 'draw' ? 'crosshair' :
                       currentTool === 'erase' ? 'not-allowed' :
                       currentTool === 'text' ? 'text' :
                       currentTool !== 'none' ? 'pointer' : 'default'
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}
