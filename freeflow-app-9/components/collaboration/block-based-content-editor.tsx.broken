'use client'

import React, { useState, useEffect, useReducer } from 'react'
import {
  PlusCircle,
  GripVertical,
  Trash2,
  Heading1,
  Heading2,
  Heading3,
  List,
  CheckSquare,
  Image,
  Table,
  Link,
  Users,
  Eye,
  Settings,
  Database,
  LayoutTemplate,
  Search,
  Type,
  Hash,
  Quote,
  Code,
  FileText,
  Video,
  Filter,
  Save,
  Share2,
  Copy,
  MoreHorizontal,
  Edit,
  Plus,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import NextImage from 'next/image'

// Type Definitions
interface ContentBlock {
  id: string
  type: 'heading' | 'text' | 'checklist' | 'image' | 'table' | 'list' | 'quote' | 'code' | 'database' | 'file' | 'video'
  content: any
  position: number
  properties: {
    alignment: 'left' | 'center' | 'right'
    fontSize?: 'normal' | 'large' | 'xl'
  }
  createdAt: string
  updatedAt: string
  userId: string
}

interface BlockTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  blocks: ContentBlock[]
  tags: string[]
  isPublic: boolean
  usageCount: number
}

interface DatabaseTable {
  id: string
  name: string
  fields: {
    id: string
    name: string
    type: string
    options?: string[]
  }[]
  records: any[]
}

interface DatabaseSource {
  id: string
  name: string
  type: string
  url: string
  apiKey: string
  tables: DatabaseTable[]
  isConnected: boolean
}

interface EditorState {
  blocks: ContentBlock[]
  selectedBlockId: string | null
  isEditing: boolean
  draggedBlockId: string | null
  showTemplates: boolean
  showDatabase: boolean
  templates: BlockTemplate[]
  databases: DatabaseSource[]
  searchQuery: string
  filterBy: string
  sortBy: string
  viewMode: 'edit' | 'preview'
  collaborators: number
  autoSave: boolean
  wordCount: number
}

type EditorAction =
  | { type: 'ADD_BLOCK'; block: Omit<ContentBlock, 'position'>; position?: number }
  | { type: 'UPDATE_BLOCK'; id: string; updates: Partial<ContentBlock> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'REORDER_BLOCKS'; fromIndex: number; toIndex: number }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SET_EDITING'; editing: boolean }
  | { type: 'SET_DRAGGING'; id: string | null }
  | { type: 'TOGGLE_TEMPLATES' }
  | { type: 'TOGGLE_DATABASE' }
  | { type: 'APPLY_TEMPLATE'; template: BlockTemplate }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'SET_VIEW_MODE'; mode: 'edit' | 'preview' }

const initialState: EditorState = {
  blocks: [
    {
      id: 'block-1',
      type: 'heading',
      content: { text: 'Project Documentation', level: 1 },
      position: 0,
      properties: { alignment: 'left', fontSize: 'xl' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1'
    },
    {
      id: 'block-2',
      type: 'text',
      content: { text: 'This document outlines the project requirements, timeline, and deliverables for the FreeflowZee platform enhancement.' },
      position: 1,
      properties: { alignment: 'left', fontSize: 'normal' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1'
    },
    {
      id: 'block-3',
      type: 'checklist',
      content: {
        items: [
          { id: 'item-1', text: 'Complete UI/UX design', checked: true },
          { id: 'item-2', text: 'Implement real-time collaboration', checked: true },
          { id: 'item-3', text: 'Add AI-powered features', checked: false },
          { id: 'item-4', text: 'Deploy to production', checked: false }
        ]
      },
      position: 2,
      properties: { alignment: 'left' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'user-1'
    }
  ],
  selectedBlockId: null,
  isEditing: false,
  draggedBlockId: null,
  showTemplates: false,
  showDatabase: false,
  templates: [
    {
      id: 'template-1',
      name: 'Project Brief',
      description: 'Complete project documentation template',
      category: 'Project Management',
      thumbnail: '/templates/project-brief.svg',
      blocks: [],
      tags: ['project', 'documentation', 'brief'],
      isPublic: true,
      usageCount: 1247
    },
    {
      id: 'template-2',
      name: 'Meeting Notes',
      description: 'Structured meeting notes with action items',
      category: 'Meetings',
      thumbnail: '/templates/meeting-notes.svg',
      blocks: [],
      tags: ['meeting', 'notes', 'action items'],
      isPublic: true,
      usageCount: 892
    },
    {
      id: 'template-3',
      name: 'Design System',
      description: 'Complete design system documentation',
      category: 'Design',
      thumbnail: '/templates/design-system.svg',
      blocks: [],
      tags: ['design', 'system', 'components'],
      isPublic: true,
      usageCount: 634
    }
  ],
  databases: [
    {
      id: 'db-1',
      name: 'Project Tasks',
      type: 'supabase',
      url: 'https://ouzcjoxaupimazrivyta.supabase.co',
      apiKey: 'anon-key',
      tables: [
        {
          id: 'table-1',
          name: 'tasks',
          fields: [
            { id: 'field-1', name: 'title', type: 'text' },
            { id: 'field-2', name: 'status', type: 'select', options: ['Todo', 'In Progress', 'Done'] },
            { id: 'field-3', name: 'priority', type: 'select', options: ['Low', 'Medium', 'High'] },
            { id: 'field-4', name: 'due_date', type: 'date' }
          ],
          records: [
            { id: 1, title: 'Design homepage', status: 'Done', priority: 'High', due_date: '2024-12-20' },
            { id: 2, title: 'Implement authentication', status: 'In Progress', priority: 'High', due_date: '2024-12-22' },
            { id: 3, title: 'Add payment integration', status: 'Todo', priority: 'Medium', due_date: '2024-12-25' }
          ]
        }
      ],
      isConnected: true
    }
  ],
  searchQuery: '',
  filterBy: 'all',
  sortBy: 'position',
  viewMode: 'edit',
  collaborators: 3,
  autoSave: true,
  wordCount: 0
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'ADD_BLOCK':
      const newBlocks = [...state.blocks]
      const insertPosition = action.position ?? state.blocks.length
      newBlocks.splice(insertPosition, 0, {
        ...action.block,
        position: insertPosition
      })
      // Update positions of subsequent blocks
      newBlocks.forEach((block, index) => {
        block.position = index
      })
      return {
        ...state,
        blocks: newBlocks
      }
    
    case 'UPDATE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.map(block => 
          block.id === action.id 
            ? { ...block, ...action.updates, updatedAt: new Date().toISOString() }
            : block
        )
      }
    
    case 'DELETE_BLOCK':
      return {
        ...state,
        blocks: state.blocks.filter(block => block.id !== action.id),
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId
      }
    
    case 'REORDER_BLOCKS':
      const reorderedBlocks = [...state.blocks]
      const [movedBlock] = reorderedBlocks.splice(action.fromIndex, 1)
      reorderedBlocks.splice(action.toIndex, 0, movedBlock)
      // Update positions
      reorderedBlocks.forEach((block, index) => {
        block.position = index
      })
      return {
        ...state,
        blocks: reorderedBlocks
      }
    
    case 'SELECT_BLOCK':
      return {
        ...state,
        selectedBlockId: action.id
      }
    
    case 'SET_EDITING':
      return {
        ...state,
        isEditing: action.editing
      }
    
    case 'SET_DRAGGING':
      return {
        ...state,
        draggedBlockId: action.id
      }
    
    case 'TOGGLE_TEMPLATES':
      return {
        ...state,
        showTemplates: !state.showTemplates
      }
    
    case 'TOGGLE_DATABASE':
      return {
        ...state,
        showDatabase: !state.showDatabase
      }
    
    case 'APPLY_TEMPLATE':
      return {
        ...state,
        blocks: [...state.blocks, ...action.template.blocks],
        showTemplates: false
      }
    
    case 'SET_SEARCH':
      return {
        ...state,
        searchQuery: action.query
      }
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.mode
      }
    
    default:
      return state
  }
}

interface BlockBasedContentEditorProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar: string
  }
  onSave?: (blocks: ContentBlock[]) => void
  onShare?: (shareData: unknown) => void
  className?: string
}

export function BlockBasedContentEditor({
  projectId,
  currentUser,
  onSave,
  onShare,
  className,
}: BlockBasedContentEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 })
  const editorRef =<HTMLDivElement>(null)

  // Block types configuration
  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', description: 'Plain text paragraph' },
    { type: 'heading', icon: Hash, label: 'Heading', description: 'Section heading' },
    { type: 'list', icon: List, label: 'Bulleted List', description: 'Simple bulleted list' },
    { type: 'checklist', icon: CheckSquare, label: 'To-do List', description: 'List with checkboxes' },
    { type: 'quote', icon: Quote, label: 'Quote', description: 'Capture a quote' },
    { type: 'code', icon: Code, label: 'Code', description: 'Code snippet with syntax highlighting' },
    { type: 'image', icon: Image, label: 'Image', description: 'Upload or embed an image' },
    { type: 'video', icon: Video, label: 'Video', description: 'Embed a video' },
    { type: 'table', icon: Table, label: 'Table', description: 'Simple table' },
    { type: 'database', icon: Database, label: 'Database', description: 'Connected database view' },
    { type: 'file', icon: FileText, label: 'File', description: 'Upload any file' }
  ]

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSave) {
      const saveTimer = setTimeout(() => {
        onSave?.(state.blocks)
      }, 2000)
      return () => clearTimeout(saveTimer)
    }
  }, [state.blocks, state.autoSave, onSave])

  // Word count calculation
  useEffect(() => {
    const wordCount = state.blocks.reduce((count, block) => {
      if (block.type === 'text' || block.type === 'heading') {
        const text = block.content.text || ''
        return count + text.split(/\s+/).filter(word => word.length > 0).length
      }
      return count
    }, 0)
    
    // Update word count in state if needed
    if (wordCount !== state.wordCount) {
      // This would typically be done through a reducer action
    }
  }, [state.blocks, state.wordCount])

  const createBlock = (type: ContentBlock['type'], content: unknown = {}) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      content,
      position: state.blocks.length,
      properties: { alignment: 'left', fontSize: 'normal' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: currentUser.id
    }
    return newBlock
  }

  const addBlock = (type: ContentBlock['type'], position?: number) => {
    let content = {}
    
    switch (type) {
      case 'text':
        content = { text: '' }
        break
      case 'heading':
        content = { text: '', level: 1 }
        break
      case 'list':
        content = { items: [''] }
        break
      case 'checklist':
        content = { items: [{ id: `item-${Date.now()}`, text: '', checked: false }] }
        break
      case 'quote':
        content = { text: '', author: '' }
        break
      case 'code':
        content = { code: '', language: 'javascript' }
        break
      case 'table':
        content = { 
          headers: ['Column 1', 'Column 2'], 
          rows: [['', '']] 
        }
        break
      case 'database':
        content = { databaseId: '', viewId: '', filters: [] }
        break
    }
    
    const block = createBlock(type, content)
    dispatch({ type: 'ADD_BLOCK', block, position })
    dispatch({ type: 'SELECT_BLOCK', id: block.id })
    dispatch({ type: 'SET_EDITING', editing: true })
    setShowBlockMenu(false)
  }

  const handleBlockClick = (blockId: string, event: React.MouseEvent) => {
    dispatch({ type: 'SELECT_BLOCK', id: blockId })
    
    // Show add block menu if clicking at the end of a block
    if (event.detail === 2) { // Double click
      dispatch({ type: 'SET_EDITING', editing: true })
    }
  }

  const handleAddBlockClick = (event: React.MouseEvent) => {
    setBlockMenuPosition({ x: event.clientX, y: event.clientY })
    setShowBlockMenu(true)
  }

  const renderBlock = (block: ContentBlock, attributes?: any, listeners?: any) => {
    const isSelected = state.selectedBlockId === block.id
    const isEditing = isSelected && state.isEditing

    const blockContent = (() => {
      switch (block.type) {
        case 'text':
          return isEditing ? (
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => dispatch({
                type: 'UPDATE_BLOCK',
                id: block.id,
                updates: { content: { ...block.content, text: e.target.value } }
              })}
              onBlur={() => dispatch({ type: 'SET_EDITING', editing: false })}
              className="border-none p-0 resize-none focus:ring-0"
              autoFocus
            />
          ) : (
            <p className="min-h-[24px]">{block.content.text}</p>
          )

        case 'heading':
          const HeadingTag = `h${block.content.level || 1}` as keyof JSX.IntrinsicElements;
          return isEditing ? (
            <input
              value={block.content.text || ''}
              onChange={(e) => dispatch({
                type: 'UPDATE_BLOCK',
                id: block.id,
                updates: { content: { ...block.content, text: e.target.value } }
              })}
              onBlur={() => dispatch({ type: 'SET_EDITING', editing: false })}
              className="border-none p-0 focus:ring-0 font-bold w-full"
              autoFocus
            />
          ) : (
            <HeadingTag className="font-bold">{block.content.text}</HeadingTag>
          )

        case 'checklist':
          return (
            <div className="space-y-2">
              {block.content.items.map((item: any, index: number) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[index] = { ...item, checked: e.target.checked };
                      dispatch({
                        type: 'UPDATE_BLOCK',
                        id: block.id,
                        updates: { content: { ...block.content, items: newItems } }
                      });
                    }}
                  />
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...block.content.items];
                      newItems[index] = { ...item, text: e.target.value };
                      dispatch({
                        type: 'UPDATE_BLOCK',
                        id: block.id,
                        updates: { content: { ...block.content, items: newItems } }
                      });
                    }}
                    className="flex-grow border-none p-0 focus:ring-0"
                  />
                </div>
              ))}
            </div>
          )

        case 'image':
          return (
            <div className="my-2">
              <NextImage
                src={block.content.url}
                alt={block.content.caption || 'Image block'}
                width={500}
                height={300}
                className="w-full h-auto rounded-lg"
              />
              <p className="text-sm text-gray-500 italic mt-1">{block.content.caption}</p>
            </div>
          )

        case 'table':
          return (
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  {block.content.headers.map((header: string, colIndex: number) => (
                    <th key={colIndex} className="border p-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.content.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="border p-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )

        case 'database':
          const database = state.databases.find(db => db.id === block.content.databaseId)
          const table = database?.tables.find(t => t.id === block.content.tableId)
          
          return (
            <Card className="border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    {database?.name || 'Select Database'}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Filter className="h-3 w-3 mr-1" />
                      Filter
                    </Button>
                    <Button size="sm" variant="outline">
                      <ArrowUpDown className="h-3 w-3 mr-1" />
                      Sort
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {table ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          {table.fields.map(field => (
                            <th key={field.id} className="text-left p-2 font-medium">
                              {field.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.records.slice(0, 5).map((record, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            {table.fields.map(field => (
                              <td key={field.id} className="p-2">
                                {record[field.name]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {table.records.length > 5 && (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        +{table.records.length - 5} more rows
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Database className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Select a database to display</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => dispatch({ type: 'TOGGLE_DATABASE' })}
                    >
                      Choose Database
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )

        default:
          return <div className="p-4 bg-gray-100 rounded-lg">Unsupported block type: {block.type}</div>
      }
    })()

    return (
      <div
        className={`relative group p-2 rounded-lg ${
          isSelected ? 'bg-purple-50 ring-2 ring-purple-300' : 'hover:bg-gray-50'
        }`}
        onClick={(e) => handleBlockClick(block.id, e)}
      >
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div
          className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-5 h-5 text-gray-400 cursor-pointer" onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'DELETE_BLOCK', id: block.id })
          }} />
        </div>
        <div className={`${block.properties.alignment === 'center' ? 'text-center' : block.properties.alignment === 'right' ? 'text-right' : 'text-left'}`}>
          {blockContent}
        </div>
      </div>
    )
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    dispatch({ type: 'SET_DRAGGING', id: event.active.id as string })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = state.blocks.findIndex((b) => b.id === active.id)
      const newIndex = state.blocks.findIndex((b) => b.id === over.id)
      dispatch({ type: 'REORDER_BLOCKS', fromIndex: oldIndex, toIndex: newIndex })
    }
    dispatch({ type: 'SET_DRAGGING', id: null })
  }
  
  const BlockWrapper = ({ block }: { block: ContentBlock }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: block.id })
    
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }
    
    return (
      <div ref={setNodeRef} style={style}>
        {renderBlock(block, attributes, listeners)}
      </div>
    )
  }

  const filteredTemplates = state.templates.filter(
    (template) =>
      template.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  const filteredDatabases = state.databases.filter(
    (db) =>
      db.name.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  const CardComponent = Card as any;
  const _CardHeaderComponent = CardHeader as any;
  const _CardTitleComponent = CardTitle as any;
  const _CardContentComponent = CardContent as any;
  const ButtonComponent = Button as any;
  const _TextareaComponent = Textarea as any;
  const _InputComponent = Input as any;
  const _HeadingTagComponent = 'h1' as any; // Placeholder
  const DndContextComponent = DndContext as any;
  const SortableContextComponent = SortableContext as any;
  const DragOverlayComponent = DragOverlay as any;

  return (
    <div className={`flex h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Main Editor */}
      <div className="flex-1 p-8 overflow-y-auto" ref={editorRef}>
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold">Content Editor</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{state.collaborators}</span>
            </div>
            <ButtonComponent variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_VIEW_MODE', mode: state.viewMode === 'edit' ? 'preview' : 'edit' })}>
              {state.viewMode === 'edit' ? <Eye className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
              {state.viewMode === 'edit' ? 'Preview' : 'Edit'}
            </ButtonComponent>
            <ButtonComponent size="sm" onClick={() => onSave?.(state.blocks)}>Save</ButtonComponent>
            <ButtonComponent size="sm" variant="secondary" onClick={() => onShare?.({})}>Share</ButtonComponent>
          </div>
        </header>

        <DndContextComponent
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContextComponent items={state.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {state.blocks.map((block) => (
                <BlockWrapper key={block.id} block={block} />
              ))}
            </div>
          </SortableContextComponent>
          <DragOverlayComponent>
            {state.draggedBlockId ? (
              renderBlock(state.blocks.find(b => b.id === state.draggedBlockId)!)
            ) : null}
          </DragOverlayComponent>
        </DndContextComponent>

        <div className="mt-8 text-center">
          <ButtonComponent variant="ghost" onClick={handleAddBlockClick}>
            <PlusCircle className="w-6 h-6 text-gray-400" />
          </ButtonComponent>
        </div>
      </div>

      {/* Side Panel for Templates/Database */}
      {(state.showTemplates || state.showDatabase) && (
        <div className="w-80 border-l bg-gray-50 p-4 flex flex-col">
           <div className="flex gap-2 mb-4 border-b">
            <ButtonComponent variant="ghost" size="sm" onClick={() => dispatch({type: 'TOGGLE_TEMPLATES'})} disabled={state.showTemplates}>
              <LayoutTemplate className="w-4 h-4 mr-2"/>
              Templates
            </ButtonComponent>
             <ButtonComponent variant="ghost" size="sm" onClick={() => dispatch({type: 'TOGGLE_DATABASE'})} disabled={state.showDatabase}>
              <Database className="w-4 h-4 mr-2"/>
              Database
            </ButtonComponent>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text"
              placeholder="Search..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH', query: e.target.value })}
              className="w-full pl-8 pr-2 py-1.5 border rounded-md"
            />
          </div>

          {state.showTemplates && (
            <div className="overflow-y-auto space-y-2">
              {filteredTemplates.map(template => (
                <div key={template.id} className="p-3 border rounded-lg hover:bg-gray-100 cursor-pointer" onClick={() => dispatch({type: 'APPLY_TEMPLATE', template})}>
                  <h4 className="font-semibold">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          )}

          {state.showDatabase && (
             <div className="overflow-y-auto space-y-2">
              {filteredDatabases.map(db => (
                <div key={db.id} className="p-3 border rounded-lg">
                  <h4 className="font-semibold">{db.name}</h4>
                  <p className={`text-sm ${db.isConnected ? 'text-green-600' : 'text-red-600'}`}>
                    {db.isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Block Add Menu */}
      {showBlockMenu && (
        <div 
          className="fixed z-50 bg-white shadow-lg rounded-lg p-2"
          style={{ top: blockMenuPosition.y, left: blockMenuPosition.x }}
        >
          <div className="grid grid-cols-2 gap-1">
            {blockTypes.map(blockType => (
              <div 
                key={blockType.type}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={() => addBlock(blockType.type as ContentBlock['type'])}
              >
                <blockType.icon className="w-5 h-5" />
                <div>
                  <p className="font-medium">{blockType.label}</p>
                  <p className="text-xs text-gray-500">{blockType.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 