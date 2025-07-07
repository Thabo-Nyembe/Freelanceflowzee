'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CursorPosition {
  x: number
  y: number
  userId: string
  userName: string
  color: string
}

interface CursorOverlayProps {
  cursors: Record<string, CursorPosition>
}

export function CursorOverlay({ cursors }: CursorOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {Object.values(cursors).map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: cursor.x,
              top: cursor.y,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="relative"
              style={{ color: cursor.color }}
            >
              {/* Cursor icon */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
              </svg>

              {/* User name label */}
              <div
                className="absolute left-full ml-2 px-2 py-1 rounded bg-black text-white text-sm whitespace-nowrap"
                style={{
                  backgroundColor: cursor.color,
                  transform: 'translateY(-50%)',
                }}
              >
                {cursor.userName}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
} 