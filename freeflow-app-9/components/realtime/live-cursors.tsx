/**
 * KAZI Live Cursors Component
 *
 * Shows collaborator cursors in real-time during collaborative editing.
 *
 * Features:
 * - Smooth cursor movement with interpolation
 * - User labels with colors
 * - Selection highlighting
 * - Click indicators
 * - Performance optimized with RAF
 */

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWebSocket } from '@/hooks/use-websocket'
import { cn } from '@/lib/utils'

export interface CursorPosition {
  x: number
  y: number
  timestamp: number
}

export interface RemoteCursor {
  id: string
  name: string
  color: string
  position: CursorPosition
  isActive: boolean
  isClicking: boolean
  selection?: {
    startX: number
    startY: number
    endX: number
    endY: number
  }
}

export interface LiveCursorsProps {
  roomId: string
  enabled?: boolean
  showLabels?: boolean
  showClicks?: boolean
  throttleMs?: number
  className?: string
  containerRef?: React.RefObject<HTMLElement>
}

// Generate consistent color from user ID
function generateUserColor(userId: string): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ]

  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }

  return colors[Math.abs(hash) % colors.length]
}

// SVG cursor shape
function CursorSVG({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-lg"
    >
      <path
        d="M5.65376 3.50004L19.7071 17.5534L12.6035 17.5534L10.0535 20.1034L5.65376 3.50004Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Click ripple effect
function ClickRipple({ color }: { color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0.8 }}
      animate={{ scale: 2, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        backgroundColor: color,
      }}
    />
  )
}

// Single remote cursor
function RemoteCursorComponent({
  cursor,
  showLabel,
  showClick,
}: {
  cursor: RemoteCursor
  showLabel: boolean
  showClick: boolean
}) {
  const [showClickRipple, setShowClickRipple] = useState(false)
  const prevClicking = useRef(cursor.isClicking)

  // Detect click start
  useEffect(() => {
    if (cursor.isClicking && !prevClicking.current) {
      setShowClickRipple(true)
      setTimeout(() => setShowClickRipple(false), 500)
    }
    prevClicking.current = cursor.isClicking
  }, [cursor.isClicking])

  return (
    <motion.div
      className="absolute top-0 left-0 pointer-events-none z-50"
      initial={{ opacity: 0 }}
      animate={{
        opacity: cursor.isActive ? 1 : 0.5,
        x: cursor.position.x,
        y: cursor.position.y,
      }}
      exit={{ opacity: 0 }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 200,
        mass: 0.5,
      }}
    >
      {/* Selection rectangle */}
      {cursor.selection && (
        <div
          className="absolute border-2 rounded-sm pointer-events-none"
          style={{
            left: Math.min(cursor.selection.startX, cursor.selection.endX) - cursor.position.x,
            top: Math.min(cursor.selection.startY, cursor.selection.endY) - cursor.position.y,
            width: Math.abs(cursor.selection.endX - cursor.selection.startX),
            height: Math.abs(cursor.selection.endY - cursor.selection.startY),
            borderColor: cursor.color,
            backgroundColor: `${cursor.color}20`,
          }}
        />
      )}

      {/* Click ripple */}
      {showClick && showClickRipple && <ClickRipple color={cursor.color} />}

      {/* Cursor icon */}
      <CursorSVG color={cursor.color} />

      {/* User label */}
      {showLabel && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-5 top-5 whitespace-nowrap"
        >
          <div
            className="px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export function LiveCursors({
  roomId,
  enabled = true,
  showLabels = true,
  showClicks = true,
  throttleMs = 50,
  className,
  containerRef,
}: LiveCursorsProps) {
  const { sendMessage, currentRoom, user } = useWebSocket()
  const [cursors, setCursors] = useState<Map<string, RemoteCursor>>(new Map())
  const lastSentRef = useRef<number>(0)
  const frameRef = useRef<number>()

  // Get container bounds
  const getBounds = useCallback(() => {
    if (containerRef?.current) {
      return containerRef.current.getBoundingClientRect()
    }
    return { left: 0, top: 0 }
  }, [containerRef])

  // Handle incoming cursor updates from other users
  useEffect(() => {
    if (!currentRoom) return

    const handleCursorUpdate = (data: {
      userId: string
      userName: string
      position: CursorPosition
      isClicking?: boolean
      selection?: RemoteCursor['selection']
    }) => {
      // Ignore own cursor
      if (data.userId === user?.id) return

      setCursors(prev => {
        const next = new Map(prev)
        next.set(data.userId, {
          id: data.userId,
          name: data.userName,
          color: generateUserColor(data.userId),
          position: data.position,
          isActive: true,
          isClicking: data.isClicking || false,
          selection: data.selection,
        })
        return next
      })
    }

    const handleUserLeft = (userId: string) => {
      setCursors(prev => {
        const next = new Map(prev)
        next.delete(userId)
        return next
      })
    }

    // Subscribe to cursor updates (would be handled by WebSocket)
    // This is a placeholder - actual implementation depends on WebSocket setup
    const unsubscribe = () => {}

    return unsubscribe
  }, [currentRoom, user?.id])

  // Mark inactive cursors
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCursors(prev => {
        let changed = false
        const next = new Map(prev)

        next.forEach((cursor, id) => {
          if (now - cursor.position.timestamp > 5000) {
            if (cursor.isActive) {
              next.set(id, { ...cursor, isActive: false })
              changed = true
            }
          }
          // Remove very stale cursors
          if (now - cursor.position.timestamp > 30000) {
            next.delete(id)
            changed = true
          }
        })

        return changed ? next : prev
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Send cursor position updates
  const sendCursorUpdate = useCallback(
    (position: CursorPosition, isClicking = false) => {
      if (!enabled || !user) return

      const now = Date.now()
      if (now - lastSentRef.current < throttleMs) return
      lastSentRef.current = now

      sendMessage({
        type: 'cursor-move',
        roomId,
        data: {
          userId: user.id,
          userName: user.name,
          position,
          isClicking,
        },
      })
    },
    [enabled, user, roomId, throttleMs, sendMessage]
  )

  // Track mouse movement
  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = getBounds()
      const position: CursorPosition = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
        timestamp: Date.now(),
      }

      // Use RAF for smooth updates
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
      frameRef.current = requestAnimationFrame(() => {
        sendCursorUpdate(position, e.buttons === 1)
      })
    }

    const handleMouseDown = (e: MouseEvent) => {
      const bounds = getBounds()
      const position: CursorPosition = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
        timestamp: Date.now(),
      }
      sendCursorUpdate(position, true)
    }

    const handleMouseUp = (e: MouseEvent) => {
      const bounds = getBounds()
      const position: CursorPosition = {
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
        timestamp: Date.now(),
      }
      sendCursorUpdate(position, false)
    }

    const target = containerRef?.current || document
    target.addEventListener('mousemove', handleMouseMove as EventListener)
    target.addEventListener('mousedown', handleMouseDown as EventListener)
    target.addEventListener('mouseup', handleMouseUp as EventListener)

    return () => {
      target.removeEventListener('mousemove', handleMouseMove as EventListener)
      target.removeEventListener('mousedown', handleMouseDown as EventListener)
      target.removeEventListener('mouseup', handleMouseUp as EventListener)
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [enabled, containerRef, getBounds, sendCursorUpdate])

  // Convert cursors map to array for rendering
  const cursorArray = useMemo(() => Array.from(cursors.values()), [cursors])

  if (!enabled || cursorArray.length === 0) {
    return null
  }

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-50', className)}>
      <AnimatePresence>
        {cursorArray.map(cursor => (
          <RemoteCursorComponent
            key={cursor.id}
            cursor={cursor}
            showLabel={showLabels}
            showClick={showClicks}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Hook for cursor tracking in a specific container
 */
export function useLiveCursors(roomId: string, containerRef?: React.RefObject<HTMLElement>) {
  const { sendMessage, user, isConnected } = useWebSocket()
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([])

  const sendCursorPosition = useCallback(
    (x: number, y: number, isClicking = false) => {
      if (!isConnected || !user) return

      sendMessage({
        type: 'cursor-move',
        roomId,
        data: {
          userId: user.id,
          userName: user.name,
          position: { x, y, timestamp: Date.now() },
          isClicking,
        },
      })
    },
    [isConnected, user, roomId, sendMessage]
  )

  return {
    remoteCursors,
    sendCursorPosition,
    isConnected,
  }
}

export default LiveCursors
