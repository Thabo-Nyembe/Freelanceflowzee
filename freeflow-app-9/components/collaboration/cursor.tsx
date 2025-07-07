'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CollaborationUser } from '@/lib/types/collaboration'

interface CursorProps {
  user: CollaborationUser
  showLabel?: boolean
}

export function Cursor({ user, showLabel = true }: CursorProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide cursor after 5 seconds of inactivity
    if (!user.cursor) return

    const timeout = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [user.cursor])

  if (!user.cursor || !isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          left: user.cursor.x,
          top: user.cursor.y,
          zIndex: 9999,
          pointerEvents: 'none'
        }}
      >
        {/* Cursor */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            transform: 'rotate(-45deg)',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
          }}
        >
          <path
            d="M1.5 1.5L1.5 15.5L5.5 11.5L9.5 17.5L13.5 15.5L9.5 9.5L15.5 9.5L1.5 1.5Z"
            fill={user.color}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* Label */}
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            style={{
              position: 'absolute',
              left: 20,
              top: 20,
              backgroundColor: user.color,
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {user.name}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
} 