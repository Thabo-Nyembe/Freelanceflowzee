'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChecklistBlockProps {
  id: string
  content: string[]
  properties: {
    alignment: 'left' | 'center' | 'right'
    checked: boolean[]
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

export function ChecklistBlock({
  id: unknown, content: unknown, properties: unknown, onUpdate: unknown, isSelected
}: ChecklistBlockProps) {
  const addItem = () => {
    onUpdate?.(id, {
      content: [...content, ''],
      properties: {
        ...properties,
        checked: [...properties.checked, false]
      }
    })
  }

  const removeItem = (index: number) => {
    const newContent = [...content]
    const newChecked = [...properties.checked]
    newContent.splice(index, 1)
    newChecked.splice(index, 1)
    onUpdate?.(id, {
      content: newContent,
      properties: {
        ...properties,
        checked: newChecked
      }
    })
  }

  const updateItem = (index: number, value: string) => {
    const newContent = [...content]
    newContent[index] = value
    onUpdate?.(id, { content: newContent })
  }

  const toggleItem = (index: number) => {
    const newChecked = [...properties.checked]
    newChecked[index] = !newChecked[index]
    onUpdate?.(id, {
      properties: {
        ...properties,
        checked: newChecked
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className={cn('space-y-1', {
        'text-left': properties.alignment === 'left',
        'text-center': properties.alignment === 'center',
        'text-right': properties.alignment === 'right'
      })}>
        {content.map((item, index) => (
          <div key={index} className="flex items-center gap-2 group">
            <Checkbox
              checked={properties.checked[index]}
              onCheckedChange={() => toggleItem(index)}
            />
            <Input
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              className={cn(
                'flex-1 border-none focus:ring-0',
                properties.checked[index] && 'line-through text-gray-400'
              )}
              placeholder="List item..."
            />
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100"
              onClick={() => removeItem(index)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-center gap-1"
        onClick={addItem}
      >
        <Plus className="w-4 h-4" />
        Add item
      </Button>
    </div>
  )
} 