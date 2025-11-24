/**
 * Remote Cursors Component
 * Displays real-time cursor positions of other users in a room
 */

'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CursorPosition } from '@/lib/websocket/socket-server'

interface RemoteCursorsProps {
  cursors: CursorPosition[]
  containerRef?: React.RefObject<HTMLElement>
}

export function RemoteCursors({ cursors, containerRef }: RemoteCursorsProps) {
  const [containerOffset, setContainerOffset] = useState({ top: 0, left: 0 })

  // Calculate container offset for absolute positioning
  useEffect(() => {
    if (containerRef?.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerOffset({ top: rect.top, left: rect.left })
    } else {
      setContainerOffset({ top: 0, left: 0 })
    }
  }, [containerRef])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <motion.div
            key={cursor.userId}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              left: cursor.x - containerOffset.left,
              top: cursor.y - containerOffset.top,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.65376 12.3673L10.6538 7.36729L13.6538 10.3673L18.6538 5.36729L19.3609 6.07444C20.8754 7.58892 20.8754 10.0635 19.3609 11.578L13.6538 17.2851C12.1393 18.7996 9.66464 18.7996 8.15017 17.2851L5.65376 14.7887C4.13928 13.2742 4.13928 10.7996 5.65376 9.28508L5.65376 12.3673Z"
                fill={cursor.color}
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>

            {/* User name label */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="absolute top-6 left-0 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: cursor.color,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              {cursor.userName}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
