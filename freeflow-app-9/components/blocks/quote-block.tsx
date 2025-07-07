'use client'

import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface QuoteBlockProps {
  id: string
  content: {
    text: string
    author?: string
    source?: string
  }
  properties: {
    alignment: 'left' | 'center' | 'right'
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function QuoteBlock({
  id,
  content,
  properties,
  onUpdate,
  isSelected
}: QuoteBlockProps) {
  const updateContent = (
    field: keyof typeof content,
    value: string
  ) => {
    onUpdate?.(id, {
      content: { ...content, [field]: value }
    })
  }

  return (
    <div className={cn('space-y-2', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <div className="relative pl-4 border-l-4 border-gray-300">
        <Textarea
          value={content.text}
          onChange={(e) => updateContent('text', e.target.value)}
          className="w-full border-none focus:ring-0 text-lg italic"
          placeholder="Enter quote..."
        />
        
        <div className="mt-2 space-y-1">
          <Input
            value={content.author || ''}
            onChange={(e) => updateContent('author', e.target.value)}
            className="w-full border-none focus:ring-0 text-sm font-medium"
            placeholder="Author name..."
          />
          
          <Input
            value={content.source || ''}
            onChange={(e) => updateContent('source', e.target.value)}
            className="w-full border-none focus:ring-0 text-sm text-gray-500"
            placeholder="Source..."
          />
        </div>
      </div>
    </div>
  )
} 