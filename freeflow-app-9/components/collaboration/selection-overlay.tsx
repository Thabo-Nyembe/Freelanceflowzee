'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCollaborationContext } from '@/components/providers/collaboration-provider'

interface SelectionProps {
  start: number
  end: number
  color: string
  name: string
}

function Selection({ start, end, color, name }: SelectionProps) {
  const [rects, setRects] = useState<DOMRect[]>([])

  useEffect(() => {
    // Get all text nodes in the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    )

    const textNodes: Text[] = []
    let node: Text | null = walker.nextNode() as Text
    while (node) {
      textNodes.push(node)
      node = walker.nextNode() as Text
    }

    // Find the nodes that contain the selection
    let currentIndex = 0
    const selectionRects: DOMRect[] = []

    for (const node of textNodes) {
      const length = node.textContent?.length || 0
      const nodeStart = currentIndex
      const nodeEnd = currentIndex + length

      if (
        (start >= nodeStart && start < nodeEnd) ||
        (end > nodeStart && end <= nodeEnd) ||
        (start <= nodeStart && end >= nodeEnd)
      ) {
        const range = document.createRange()
        const startOffset = Math.max(0, start - nodeStart)
        const endOffset = Math.min(length, end - nodeStart)
        
        range.setStart(node, startOffset)
        range.setEnd(node, endOffset)
        
        const clientRects = Array.from(range.getClientRects())
        selectionRects.push(...clientRects)
      }

      currentIndex += length
    }

    setRects(selectionRects)
  }, [start, end])

  return (
    <>
      {rects.map((rect, index) => (
        <motion.div
          key={index}
          className="absolute pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          style={{
            left: rect.left + window.scrollX,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height,
            backgroundColor: color,
          }}
        />
      ))}
      {rects.length > 0 && (
        <motion.div
          className="absolute pointer-events-none px-2 py-1 rounded text-xs text-white whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            left: rects[0].left + window.scrollX,
            top: rects[0].top + window.scrollY - 20,
            backgroundColor: color,
          }}
        >
          {name}
        </motion.div>
      )}
    </>
  )
}

const SELECTION_COLORS = [
  'rgba(255, 0, 0, 0.3)',   // Red
  'rgba(0, 255, 0, 0.3)',   // Green
  'rgba(0, 0, 255, 0.3)',   // Blue
  'rgba(255, 165, 0, 0.3)', // Orange
  'rgba(128, 0, 128, 0.3)', // Purple
  'rgba(255, 192, 203, 0.3)', // Pink
  'rgba(0, 255, 255, 0.3)', // Cyan
  'rgba(255, 215, 0, 0.3)', // Gold
]

interface SelectionOverlayProps {
  selections: Record<string, { start: number; end: number }>
}

export function SelectionOverlay({ selections }: SelectionOverlayProps) {
  const { state } = useCollaborationContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {Object.entries(selections).map(([userId, selection], index) => {
          const user = state.users.find(u => u.id === userId)
          if (!user || !selection) return null

          return (
            <Selection
              key={userId}
              start={selection.start}
              end={selection.end}
              name={user.name}
              color={SELECTION_COLORS[index % SELECTION_COLORS.length]}
            />
          )
        })}
      </AnimatePresence>
    </div>
  )
} 