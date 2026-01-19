/**
 * Drawing Canvas - FreeFlow A+++ Implementation
 * Frame.io-style drawing annotation tool
 */

'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { X, Check, Undo, Redo, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DrawingTool } from '@/lib/hooks/use-video-comments';
import {
  createSmoothPath,
  simplifyPath,
  type Point,
  type Stroke,
  type DrawingData,
} from '@/lib/video/frame-comments';

interface DrawingCanvasProps {
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  width: number;
  height: number;
  onDrawingComplete?: (drawing: DrawingData) => void;
  onCancel?: () => void;
  initialDrawing?: DrawingData;
  className?: string;
}

export function DrawingCanvas({
  tool,
  color,
  strokeWidth,
  width,
  height,
  onDrawingComplete,
  onCancel,
  initialDrawing,
  className,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>(initialDrawing?.strokes || []);
  const [undoStack, setUndoStack] = useState<Stroke[][]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[][]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  // Get canvas context
  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext('2d');
  }, []);

  // Convert mouse event to canvas coordinates
  const getCanvasPoint = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  // Draw all strokes
  const redrawCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw existing strokes
    for (const stroke of strokes) {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (stroke.points.length === 0) continue;

      const path = new Path2D(createSmoothPath(stroke.points));
      ctx.stroke(path);
    }
  }, [getContext, strokes, width, height]);

  // Redraw when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Draw current stroke while drawing
  const drawCurrentStroke = useCallback(() => {
    const ctx = getContext();
    if (!ctx || currentPoints.length === 0) return;

    redrawCanvas();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pen') {
      const path = new Path2D(createSmoothPath(currentPoints));
      ctx.stroke(path);
    } else if (tool === 'arrow' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      drawArrow(ctx, startPoint, end, color, strokeWidth);
    } else if (tool === 'rectangle' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      ctx.strokeRect(
        startPoint.x,
        startPoint.y,
        end.x - startPoint.x,
        end.y - startPoint.y
      );
    } else if (tool === 'circle' && startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];
      const radius = Math.sqrt(
        Math.pow(end.x - startPoint.x, 2) + Math.pow(end.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }, [getContext, currentPoints, color, strokeWidth, tool, startPoint, redrawCanvas]);

  useEffect(() => {
    if (isDrawing) {
      drawCurrentStroke();
    }
  }, [isDrawing, drawCurrentStroke]);

  // Draw arrow helper
  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    from: Point,
    to: Point,
    strokeColor: string,
    lineWidth: number
  ) => {
    const headLength = Math.max(10, lineWidth * 3);
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Line
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);

    // Arrow head
    ctx.lineTo(
      to.x - headLength * Math.cos(angle - Math.PI / 6),
      to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLength * Math.cos(angle + Math.PI / 6),
      to.y - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.stroke();
  };

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (tool === 'select') return;

      const point = getCanvasPoint(e);
      setIsDrawing(true);
      setStartPoint(point);
      setCurrentPoints([point]);
    },
    [tool, getCanvasPoint]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing || tool === 'select') return;

      const point = getCanvasPoint(e);

      if (tool === 'pen') {
        setCurrentPoints((prev) => [...prev, point]);
      } else {
        setCurrentPoints([point]);
      }
    },
    [isDrawing, tool, getCanvasPoint]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || tool === 'select') return;

    setIsDrawing(false);

    let newStroke: Stroke;

    if (tool === 'pen') {
      // Simplify the path for smoother lines
      const simplifiedPoints = simplifyPath(currentPoints, 2);
      newStroke = {
        points: simplifiedPoints,
        color,
        width: strokeWidth,
      };
    } else if (startPoint && currentPoints.length > 0) {
      const end = currentPoints[currentPoints.length - 1];

      if (tool === 'arrow') {
        // Store arrow as two points
        newStroke = {
          points: [startPoint, end],
          color,
          width: strokeWidth,
        };
      } else if (tool === 'rectangle') {
        // Store rectangle as four corner points
        newStroke = {
          points: [
            startPoint,
            { x: end.x, y: startPoint.y },
            end,
            { x: startPoint.x, y: end.y },
            startPoint,
          ],
          color,
          width: strokeWidth,
        };
      } else if (tool === 'circle') {
        // Store circle as center and radius point
        newStroke = {
          points: [startPoint, end],
          color,
          width: strokeWidth,
        };
      } else {
        return;
      }
    } else {
      return;
    }

    // Save for undo
    setUndoStack((prev) => [...prev, strokes]);
    setRedoStack([]);

    setStrokes((prev) => [...prev, newStroke]);
    setCurrentPoints([]);
    setStartPoint(null);
  }, [isDrawing, tool, currentPoints, startPoint, color, strokeWidth, strokes]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousStrokes = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, strokes]);
    setStrokes(previousStrokes);
    setUndoStack((prev) => prev.slice(0, -1));
  }, [undoStack, strokes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextStrokes = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, strokes]);
    setStrokes(nextStrokes);
    setRedoStack((prev) => prev.slice(0, -1));
  }, [redoStack, strokes]);

  const handleClear = useCallback(() => {
    setUndoStack((prev) => [...prev, strokes]);
    setRedoStack([]);
    setStrokes([]);
  }, [strokes]);

  const handleComplete = useCallback(() => {
    onDrawingComplete?.({ strokes });
  }, [onDrawingComplete, strokes]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (e.key === 'Escape') {
        onCancel?.();
      } else if (e.key === 'Enter') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleComplete, onCancel]);

  return (
    <div
      className={cn(
        'absolute inset-0 z-10',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={cn(
          'absolute inset-0 w-full h-full',
          tool !== 'select' ? 'cursor-crosshair' : 'cursor-default'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />

      {/* Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/75 rounded-lg p-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleClear}
          disabled={strokes.length === 0}
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-white/30 mx-1" />

        <Button
          variant="ghost"
          size="icon"
          className="text-red-400 hover:bg-red-500/20"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-green-400 hover:bg-green-500/20"
          onClick={handleComplete}
          disabled={strokes.length === 0}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white text-sm px-4 py-2 rounded-lg">
        Draw on the video • Press <kbd className="px-1 bg-white/20 rounded">Enter</kbd> to save
        • <kbd className="px-1 bg-white/20 rounded">Esc</kbd> to cancel
      </div>
    </div>
  );
}
