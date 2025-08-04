'use client'

import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ContentBlock } from '@/lib/types/editor'
import { Card } from '@/components/ui/card'
import { GripVertical, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { BlockRenderer } from './block-renderer'

interface BlockWrapperProps {
  block: ContentBlock
  onUpdate?: (id: string, updates: Partial<ContentBlock>) => void
  onDelete?: (id: string) => void
  isSelected?: boolean
  className?: string
}

export function BlockWrapper({
  block, onUpdate, onDelete, isSelected, className
}: BlockWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group border-2 transition-all',
        isSelected ? 'border-primary' : 'border-transparent',
        isDragging ? 'shadow-lg' : '',
        className
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Block content */}
      <div className="p-4">
        <BlockRenderer
          block={block}
          onUpdate={onUpdate}
          isSelected={isSelected}
        />
      </div>

      {/* Actions menu */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-gray-100 rounded">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onDelete?.(block.id)}>
              Delete
            </DropdownMenuItem>
            {/* Add more actions as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
} 