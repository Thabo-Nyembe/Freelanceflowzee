'use client'

import React, { useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface HeadingBlockProps {
  id: string
  content: string
  properties: {
    alignment: 'left' | 'center' | 'right'
    level: 1 | 2 | 3
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function HeadingBlock({
  id,
  content,
  properties,
  onUpdate,
  isSelected
}: HeadingBlockProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus when selected
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isSelected])

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select
          value={properties.level.toString()}
          onValueChange={(value) =>
            onUpdate?.(id, {
              properties: { ...properties, level: parseInt(value) }
            })
          }
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">H1</SelectItem>
            <SelectItem value="2">H2</SelectItem>
            <SelectItem value="3">H3</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      <Input
        ref={inputRef}
        value={content}
        onChange={(e) => onUpdate?.(id, { content: e.target.value })}
        className={cn(
          'w-full border-none focus:ring-0 font-bold',
          {
            'text-4xl': properties.level === 1,
            'text-3xl': properties.level === 2,
            'text-2xl': properties.level === 3,
            'text-left': properties.alignment === 'left',
            'text-center': properties.alignment === 'center',
            'text-right': properties.alignment === 'right'
          }
        )}
        placeholder={`Heading ${properties.level}`}
      />
    </div>
  )
} 