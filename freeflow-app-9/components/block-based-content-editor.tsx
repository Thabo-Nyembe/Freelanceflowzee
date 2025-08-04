'use client'

import React from 'react'
import { useEditor } from '@/hooks/use-editor'
import { BlockWrapper } from '@/components/blocks/block-wrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Settings,
  Eye,
  Save,
  Share2,
  Users,
  Database,
  LayoutTemplate
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { createBlock } from '@/lib/utils/editor'
import { ContentBlock } from '@/lib/types/editor'

interface BlockBasedContentEditorProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  onSave?: (blocks: ContentBlock[]) => void
  onShare?: (options) => void
  className?: string
}

export function BlockBasedContentEditor({
  projectId, currentUser, onSave, onShare, className
}: BlockBasedContentEditorProps) {
  const {
    state,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    selectBlock,
    setEditing,
    setDragging,
    toggleTemplates,
    toggleDatabase,
    setSearchQuery,
    setFilter,
    setSort,
    setViewMode,
    setCollaborators,
    toggleAutoSave
  } = useEditor([], onSave)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = state.blocks.findIndex(block => block.id === active.id)
    const newIndex = state.blocks.findIndex(block => block.id === over.id)

    reorderBlocks(oldIndex, newIndex)
  }

  const handleAddBlock = (type: ContentBlock['type']) => {
    const block = createBlock(type)
    block.userId = currentUser.id
    addBlock(block)
    selectBlock(block.id)
    setEditing(true)
  }

  return (
    <div className={className}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search blocks..."
            className="w-64"
            value={state.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Blocks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('text')}>
                Text Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('media')}>
                Media Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSort('position')}>
                Position
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('created')}>
                Created Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('updated')}>
                Updated Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{state.collaborators}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(state.viewMode === 'edit' ? 'preview' : 'edit')}
          >
            {state.viewMode === 'edit' ? (
              <Eye className="w-4 h-4 mr-2" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            {state.viewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>
          <Button size="sm" onClick={() => onSave?.(state.blocks)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={() => onShare?.({})}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.blocks.map(block => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {state.blocks.map((block) => (
                <BlockWrapper
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  isSelected={block.id === state.selectedBlockId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {/* Add Block Button */}
        <div className="mt-8 flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Block
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAddBlock('text')}>
                Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('heading')}>
                Heading
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('checklist')}>
                Checklist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('image')}>
                Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('table')}>
                Table
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('list')}>
                List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('quote')}>
                Quote
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('code')}>
                Code
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('database')}>
                Database
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('file')}>
                File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddBlock('video')}>
                Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Templates Panel */}
      {state.showTemplates && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Templates</h3>
            <Button variant="ghost" size="icon" onClick={toggleTemplates}>
              <LayoutTemplate className="w-4 h-4" />
            </Button>
          </div>
          {/* Template list would go here */}
        </div>
      )}

      {/* Database Panel */}
      {state.showDatabase && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Databases</h3>
            <Button variant="ghost" size="icon" onClick={toggleDatabase}>
              <Database className="w-4 h-4" />
            </Button>
          </div>
          {/* Database list would go here */}
        </div>
      )}
    </div>
  )
} 