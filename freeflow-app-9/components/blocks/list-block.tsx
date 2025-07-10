'use client'

import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface ListBlockProps {
  id: string
  content: string[]
  properties: {
    alignment: 'left' | 'center' | 'right'
  }
  onUpdate?: (id: string, updates: Partial<any>) => void
  isSelected?: boolean
}

interface SortableItemProps {
  id: string
  value: string
  onChange: (value: string) => void
  onRemove: () => void
}

function SortableItem({ id: unknown, value: unknown, onChange: unknown, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <span className="text-gray-500">•</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-none focus:ring-0"
        placeholder="List item..."
      />
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

export function ListBlock({
  id: unknown, content: unknown, properties: unknown, onUpdate: unknown, isSelected
}: ListBlockProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const addItem = () => {
    onUpdate?.(id, {
      content: [...content, '']
    })
  }

  const removeItem = (index: number) => {
    const newContent = [...content]
    newContent.splice(index, 1)
    onUpdate?.(id, { content: newContent })
  }

  const updateItem = (index: number, value: string) => {
    const newContent = [...content]
    newContent[index] = value
    onUpdate?.(id, { content: newContent })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = content.findIndex(item => `item-${item}` === active.id)
    const newIndex = content.findIndex(item => `item-${item}` === over.id)

    const newContent = [...content]
    const [movedItem] = newContent.splice(oldIndex, 1)
    newContent.splice(newIndex, 0, movedItem)

    onUpdate?.(id, { content: newContent })
  }

  return (
    <div className={cn('space-y-2', {
      'text-left': properties.alignment === 'left',
      'text-center': properties.alignment === 'center',
      'text-right': properties.alignment === 'right'
    })}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={content.map(item => `item-${item}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {content.map((item, index) => (
              <SortableItem
                key={`item-${item}`}
                id={`item-${item}`}
                value={item}
                onChange={(value) => updateItem(index, value)}
                onRemove={() => removeItem(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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