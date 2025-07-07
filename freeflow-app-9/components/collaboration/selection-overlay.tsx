'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Selection {
  userId: string
  userName: string
  color: string
  start: number
  end: number
  blockId: string
}

interface SelectionOverlayProps {
  selections: Record<string, Selection>
}

export function SelectionOverlay({ selections }: SelectionOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      <AnimatePresence>
        {Object.values(selections).map((selection) => {
          // Get the DOM element for the block
          const blockElement = document.getElementById(selection.blockId)
          if (!blockElement) return null

          // Get the text node range
          const range = document.createRange()
          const textNodes = Array.from(blockElement.childNodes).filter(
            node => node.nodeType === Node.TEXT_NODE
          )

          let currentPos = 0
          let startNode: Node | null = null
          let startOffset = 0
          let endNode: Node | null = null
          let endOffset = 0

          // Find the start and end positions in the text nodes
          for (const node of textNodes) {
            const length = node.textContent?.length || 0

            if (!startNode && currentPos + length >= selection.start) {
              startNode = node
              startOffset = selection.start - currentPos
            }

            if (!endNode && currentPos + length >= selection.end) {
              endNode = node
              endOffset = selection.end - currentPos
              break
            }

            currentPos += length
          }

          if (!startNode || !endNode) return null

          // Set the range
          range.setStart(startNode, startOffset)
          range.setEnd(endNode, endOffset)

          // Get the client rects for the range
          const rects = Array.from(range.getClientRects())

          return (
            <motion.div
              key={selection.userId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {rects.map((rect, index) => (
                <div
                  key={index}
                  className="absolute rounded-sm"
                  style={{
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    backgroundColor: selection.color,
                    opacity: 0.2,
                  }}
                />
              ))}
              <div
                className="absolute px-2 py-1 rounded text-white text-sm"
                style={{
                  left: rects[0]?.left || 0,
                  top: (rects[0]?.top || 0) - 24,
                  backgroundColor: selection.color,
                }}
              >
                {selection.userName}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
} 