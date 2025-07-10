'use client'

import React, { useEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface TextBlockProps {
  id: string
  content: string
  properties: {
    alignment: 'left' | 'center' | 'right'
    fontSize?: 'normal' | 'large' | 'xl'
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function TextBlock({
  id: unknown, content: unknown, properties: unknown, onUpdate: unknown, isSelected
}: TextBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isSelected])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = 'auto'
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    adjustHeight()
    textarea.addEventListener('input', adjustHeight)
    return () => textarea.removeEventListener('input', adjustHeight)
  }, [])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={properties.alignment}
          onValueChange={(value) =>
            onUpdate?.(id, {
              properties: { ...properties, alignment: value }
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Alignment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={properties.fontSize}
          onValueChange={(value) =>
            onUpdate?.(id, {
              properties: { ...properties, fontSize: value }
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="xl">XL</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onUpdate?.(id, { content: e.target.value })}
        className={cn(
          'w-full resize-none overflow-hidden border-none focus:ring-0',
          {
            'text-base': properties.fontSize === 'normal',
            'text-lg': properties.fontSize === 'large',
            'text-xl': properties.fontSize === 'xl',
            'text-left': properties.alignment === 'left',
            'text-center': properties.alignment === 'center',
            'text-right': properties.alignment === 'right'
          }
        )}
        placeholder="Start typing..."
      />
    </div>
  )
} 