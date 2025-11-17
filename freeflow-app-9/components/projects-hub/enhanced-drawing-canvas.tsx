"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  DrawingState,
  DrawingElement,
  DrawingLayer,
  DrawingTool
} from "./enhanced-drawing-tools"

interface EnhancedDrawingCanvasProps {
  width: number
  height: number
  drawingState: DrawingState
  layers: DrawingLayer[]
  activeLayerId: string
  onElementAdd: (element: DrawingElement) => void
  onElementUpdate: (elementId: string, updates: Partial<DrawingElement>) => void
  onElementDelete: (elementId: string) => void
  backgroundImage?: string
  zoom: number
  className?: string
  disabled?: boolean
}

interface Point {
  x: number
  y: number
  pressure?: number
  timestamp?: number
}

interface DrawingSession {
  points: Point[]
  tool: DrawingTool
  style: DrawingElement["style"]
}

export function EnhancedDrawingCanvas({
  width,
  height,
  drawingState,
  layers,
  activeLayerId,
  onElementAdd,
  onElementUpdate,
  onElementDelete,
  backgroundImage,
  zoom = 1,
  className,
  disabled = false
}: EnhancedDrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentSession, setCurrentSession] = useState<DrawingSession | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<Point | null>(null)
  const [lastPointerPosition, setLastPointerPosition] = useState<Point | null>(null)

  // Get canvas context
  const getContext = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
    }
    return ctx
  }

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number): Point => {
    if (!canvasRef.current) return { x: 0, y: 0 }

    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (screenX - rect.left) / zoom,
      y: (screenY - rect.top) / zoom
    }
  }, [zoom])

  // Get pressure from pointer event
  const getPressure = (e: PointerEvent): number => {
    return e.pressure || 1
  }

  // Start drawing session
  const startDrawing = useCallback((e: PointerEvent) => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const point = screenToCanvas(e.clientX, e.clientY)
    const pressure = getPressure(e)

    setIsDrawing(true)
    setLastPointerPosition(point)

    // Handle different tools
    switch (drawingState.tool) {
      case "pen":
      case "pencil":
      case "highlighter":
      case "brush":
        setCurrentSession({
          points: [{ ...point, pressure, timestamp: Date.now() }],
          tool: drawingState.tool,
          style: {
            color: drawingState.color,
            size: drawingState.size,
            opacity: drawingState.opacity,
            strokeWidth: drawingState.strokeWidth,
            style: drawingState.style
          }
        })
        break

      case "line":
      case "rectangle":
      case "circle":
      case "arrow":
        setCurrentSession({
          points: [point],
          tool: drawingState.tool,
          style: {
            color: drawingState.color,
            size: drawingState.size,
            opacity: drawingState.opacity,
            strokeWidth: drawingState.strokeWidth,
            fill: drawingState.fill,
            fillColor: drawingState.fillColor,
            style: drawingState.style
          }
        })
        break

      case "eraser":
        // Find elements to erase at this point
        const elementsToErase = findElementsAtPoint(point)
        elementsToErase.forEach(element => onElementDelete(element.id))
        break

      case "select":
      case "move":
        // Find element to select/move
        const elementToSelect = findElementAtPoint(point)
        if (elementToSelect) {
          setSelectedElement(elementToSelect.id)
          if (drawingState.tool === "move") {
            setDragOffset({
              x: point.x - (elementToSelect.bounds?.x || 0),
              y: point.y - (elementToSelect.bounds?.y || 0)
            })
          }
        } else {
          setSelectedElement(null)
        }
        break
    }
  }, [
    disabled,
    drawingState,
    screenToCanvas,
    onElementDelete
  ])

  // Continue drawing
  const continueDrawing = useCallback((e: PointerEvent) => {
    if (!isDrawing || disabled) return

    const point = screenToCanvas(e.clientX, e.clientY)
    const pressure = getPressure(e)

    switch (drawingState.tool) {
      case "pen":
      case "pencil":
      case "highlighter":
      case "brush":
        if (currentSession) {
          setCurrentSession(prev => prev ? {
            ...prev,
            points: [...prev.points, { ...point, pressure, timestamp: Date.now() }]
          } : prev)
        }
        break

      case "line":
      case "rectangle":
      case "circle":
      case "arrow":
        if (currentSession) {
          setCurrentSession(prev => prev ? {
            ...prev,
            points: [prev.points[0], point]
          } : prev)
        }
        break

      case "move":
        if (selectedElement && dragOffset) {
          const newX = point.x - dragOffset.x
          const newY = point.y - dragOffset.y

          onElementUpdate(selectedElement, {
            bounds: {
              x: newX,
              y: newY,
              width: 0, // These would be calculated based on element type
              height: 0
            }
          })
        }
        break
    }

    setLastPointerPosition(point)
    redrawOverlay()
  }, [
    isDrawing,
    disabled,
    drawingState.tool,
    currentSession,
    selectedElement,
    dragOffset,
    screenToCanvas,
    onElementUpdate
  ])

  // End drawing session
  const endDrawing = useCallback(() => {
    if (!isDrawing || !currentSession) return

    // Create the drawing element
    const element: DrawingElement = {
      id: `element-${Date.now()}`,
      type: currentSession.tool,
      points: currentSession.points,
      style: currentSession.style,
      layerId: activeLayerId,
      timestamp: Date.now()
    }

    // Calculate bounds for shape tools
    if (["line", "rectangle", "circle", "arrow"].includes(currentSession.tool)) {
      const [start, end] = currentSession.points
      if (start && end) {
        element.bounds = {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        }
      }
    }

    onElementAdd(element)

    setIsDrawing(false)
    setCurrentSession(null)
    setDragOffset(null)
    clearOverlay()
  }, [isDrawing, currentSession, activeLayerId, onElementAdd])

  // Find elements at a point
  const findElementsAtPoint = (point: Point): DrawingElement[] => {
    const elements: DrawingElement[] = []

    layers.forEach(layer => {
      if (!layer.visible) return

      layer.elements.forEach(element => {
        if (isPointInElement(point, element)) {
          elements.push(element)
        }
      })
    })

    return elements
  }

  // Find single element at point (topmost)
  const findElementAtPoint = (point: Point): DrawingElement | null => {
    const elements = findElementsAtPoint(point)
    return elements.length > 0 ? elements[elements.length - 1] : null
  }

  // Check if point is inside element
  const isPointInElement = (point: Point, element: DrawingElement): boolean => {
    if (element.bounds) {
      const { x, y, width, height } = element.bounds
      return point.x >= x && point.x <= x + width &&
             point.y >= y && point.y <= y + height
    }

    // For freehand drawing, check if point is near any path point
    if (element.points.length > 0) {
      const threshold = element.style.size + 5
      return element.points.some(p => {
        const distance = Math.sqrt(
          Math.pow(point.x - p.x, 2) + Math.pow(point.y - p.y, 2)
        )
        return distance <= threshold
      })
    }

    return false
  }

  // Clear overlay canvas
  const clearOverlay = () => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const ctx = getContext(canvas)
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  // Redraw overlay with current session
  const redrawOverlay = () => {
    const canvas = overlayCanvasRef.current
    if (!canvas || !currentSession) return

    const ctx = getContext(canvas)
    if (!ctx) return

    clearOverlay()
    drawElement(ctx, {
      id: "temp",
      type: currentSession.tool,
      points: currentSession.points,
      style: currentSession.style,
      layerId: activeLayerId,
      timestamp: Date.now()
    })
  }

  // Draw a single element
  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { type, points, style } = element

    ctx.save()
    ctx.globalAlpha = style.opacity
    ctx.strokeStyle = style.color
    ctx.fillStyle = style.fillColor || style.color
    ctx.lineWidth = style.strokeWidth || style.size

    // Set line style
    if (style.style === "dashed") {
      ctx.setLineDash([5, 5])
    } else if (style.style === "dotted") {
      ctx.setLineDash([2, 3])
    } else {
      ctx.setLineDash([])
    }

    switch (type) {
      case "pen":
      case "pencil":
      case "brush":
        drawFreehandPath(ctx, points, style)
        break

      case "highlighter":
        ctx.globalCompositeOperation = "multiply"
        drawFreehandPath(ctx, points, style)
        break

      case "line":
        drawLine(ctx, points, style)
        break

      case "rectangle":
        drawRectangle(ctx, points, style)
        break

      case "circle":
        drawCircle(ctx, points, style)
        break

      case "arrow":
        drawArrow(ctx, points, style)
        break
    }

    ctx.restore()
  }

  // Draw freehand path
  const drawFreehandPath = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    style: DrawingElement["style"]
  ) => {
    if (points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)

    // Use pressure-sensitive line width if available
    for (let i = 1; i < points.length; i++) {
      const point = points[i]
      const prevPoint = points[i - 1]

      // Adjust line width based on pressure
      if (point.pressure && style.size) {
        ctx.lineWidth = style.size * point.pressure
      }

      // Smooth curve using quadratic bezier
      const midX = (prevPoint.x + point.x) / 2
      const midY = (prevPoint.y + point.y) / 2
      ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY)
    }

    ctx.stroke()
  }

  // Draw line
  const drawLine = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    style: DrawingElement["style"]
  ) => {
    if (points.length < 2) return

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    ctx.lineTo(points[1].x, points[1].y)
    ctx.stroke()
  }

  // Draw rectangle
  const drawRectangle = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    style: DrawingElement["style"]
  ) => {
    if (points.length < 2) return

    const [start, end] = points
    const x = Math.min(start.x, end.x)
    const y = Math.min(start.y, end.y)
    const width = Math.abs(end.x - start.x)
    const height = Math.abs(end.y - start.y)

    if (style.fill) {
      ctx.fillRect(x, y, width, height)
    }
    ctx.strokeRect(x, y, width, height)
  }

  // Draw circle
  const drawCircle = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    style: DrawingElement["style"]
  ) => {
    if (points.length < 2) return

    const [start, end] = points
    const radius = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    )

    ctx.beginPath()
    ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI)

    if (style.fill) {
      ctx.fill()
    }
    ctx.stroke()
  }

  // Draw arrow
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    points: Point[],
    style: DrawingElement["style"]
  ) => {
    if (points.length < 2) return

    const [start, end] = points
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const arrowLength = 15
    const arrowAngle = Math.PI / 6

    // Draw line
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    // Draw arrowhead
    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle - arrowAngle),
      end.y - arrowLength * Math.sin(angle - arrowAngle)
    )
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(
      end.x - arrowLength * Math.cos(angle + arrowAngle),
      end.y - arrowLength * Math.sin(angle + arrowAngle)
    )
    ctx.stroke()
  }

  // Redraw all layers
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = getContext(canvas)
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background image if provided
    if (backgroundImage) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        drawLayers(ctx)
      }
      img.src = backgroundImage
    } else {
      drawLayers(ctx)
    }
  }, [backgroundImage, layers])

  // Draw all layers
  const drawLayers = (ctx: CanvasRenderingContext2D) => {
    layers.forEach(layer => {
      if (!layer.visible) return

      ctx.save()
      ctx.globalAlpha = layer.opacity

      layer.elements.forEach(element => {
        drawElement(ctx, element)
      })

      ctx.restore()
    })
  }

  // Set up canvas size and redraw when props change
  useEffect(() => {
    const canvas = canvasRef.current
    const overlay = overlayCanvasRef.current

    if (canvas && overlay) {
      canvas.width = width
      canvas.height = height
      overlay.width = width
      overlay.height = height

      redrawCanvas()
    }
  }, [width, height, redrawCanvas])

  // Set up event listeners
  useEffect(() => {
    const canvas = overlayCanvasRef.current
    if (!canvas) return

    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault()
      startDrawing(e)
    }

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault()
      continueDrawing(e)
    }

    const handlePointerUp = (e: PointerEvent) => {
      e.preventDefault()
      endDrawing()
    }

    canvas.addEventListener("pointerdown", handlePointerDown)
    canvas.addEventListener("pointermove", handlePointerMove)
    canvas.addEventListener("pointerup", handlePointerUp)
    canvas.addEventListener("pointerleave", handlePointerUp)

    // Enable touch events
    canvas.style.touchAction = "none"

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown)
      canvas.removeEventListener("pointermove", handlePointerMove)
      canvas.removeEventListener("pointerup", handlePointerUp)
      canvas.removeEventListener("pointerleave", handlePointerUp)
    }
  }, [startDrawing, continueDrawing, endDrawing])

  return (
    <div className={cn("relative", className)}>
      {/* Background canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left"
        }}
      />

      {/* Interactive overlay canvas */}
      <canvas
        ref={overlayCanvasRef}
        className={cn(
          "absolute inset-0 cursor-crosshair",
          disabled && "pointer-events-none",
          drawingState.tool === "move" && "cursor-move",
          drawingState.tool === "select" && "cursor-pointer",
          drawingState.tool === "eraser" && "cursor-cell"
        )}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top left"
        }}
      />

      {/* Selection indicator */}
      {selectedElement && (
        <motion.div
          className="absolute border-2 border-primary border-dashed pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            // Position would be calculated based on selected element bounds
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            transform: `scale(${zoom})`
          }}
        />
      )}
    </div>
  )
}