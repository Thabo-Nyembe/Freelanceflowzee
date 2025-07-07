'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CollaborationUser } from '@/lib/types/collaboration'

interface SelectionProps {
  user: CollaborationUser
  blockElement: HTMLElement | null
}

export function Selection({ user, blockElement }: SelectionProps) {
  const [selectionRects, setSelectionRects] = useState<DOMRect[]>([])
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide selection after 5 seconds of inactivity
    if (!user.selection) return

    const timeout = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timeout)
  }, [user.selection])

  useEffect(() => {
    if (!user.selection || !blockElement || !isVisible) {
      setSelectionRects([])
      return
    }

    // Get text nodes within the block
    const textNodes: Text[] = []
    const walker = document.createTreeWalker(
      blockElement,
      NodeFilter.SHOW_TEXT,
      null
    )

    let node: Text | null
    while ((node = walker.nextNode() as Text)) {
      textNodes.push(node)
    }

    // Calculate selection range
    let currentPos = 0
    const rects: DOMRect[] = []
    let inSelection = false

    textNodes.forEach(node => {
      const text = node.textContent || ''
      const startOffset = currentPos
      const endOffset = startOffset + text.length

      // Check if this node intersects with the selection
      if (
        (startOffset <= user.selection!.start && endOffset > user.selection!.start) ||
        (startOffset < user.selection!.end && endOffset >= user.selection!.end) ||
        (startOffset >= user.selection!.start && endOffset <= user.selection!.end)
      ) {
        const range = document.createRange()
        const selectionStart = Math.max(0, user.selection!.start - startOffset)
        const selectionEnd = Math.min(text.length, user.selection!.end - startOffset)

        range.setStart(node, selectionStart)
        range.setEnd(node, selectionEnd)

        const clientRects = Array.from(range.getClientRects())
        rects.push(...clientRects)
      }

      currentPos += text.length
    })

    setSelectionRects(rects)
  }, [user.selection, blockElement, isVisible])

  if (!user.selection || !isVisible || selectionRects.length === 0) return null

  return (
    <AnimatePresence>
      {selectionRects.map((rect, index) => (
        <motion.div
          key={`${user.id}-selection-${index}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
            backgroundColor: `${user.color}33`, // 20% opacity
            border: `2px solid ${user.color}`,
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: 9998
          }}
        />
      ))}
    </AnimatePresence>
  )
} 