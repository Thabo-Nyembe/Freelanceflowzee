'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollaborationContext } from '@/components/providers/collaboration-provider'

interface CursorProps {
  x: number
  y: number
  name: string
  color: string
}

function Cursor({ x, y, name, color }: CursorProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ opacity: 0, x, y }}
      animate={{ opacity: 1, x, y }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      </svg>
      <div
        className="px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        {name}
      </div>
    </motion.div>
  )
}

const CURSOR_COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#00FFFF', // Cyan
  '#FFD700', // Gold
]

interface CursorOverlayProps {
  cursors: Record<string, { x: number; y: number }>
}

export function CursorOverlay({ cursors }: CursorOverlayProps) {
  const { state } = useCollaborationContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {Object.entries(cursors).map(([userId, position], index) => {
          const user = state.users.find(u => u.id === userId)
          if (!user || !position) return null

          return (
            <Cursor
              key={userId}
              x={position.x}
              y={position.y}
              name={user.name}
              color={CURSOR_COLORS[index % CURSOR_COLORS.length]}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
} 