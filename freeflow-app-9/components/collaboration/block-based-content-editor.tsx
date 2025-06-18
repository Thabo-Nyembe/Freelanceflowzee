'use client'

import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, 
  Type, 
  Image, 
  Video, 
  FileText, 
  Table, 
  List, 
  CheckSquare, 
  Calendar, 
  Code, 
  Quote, 
  Divider, 
  GripVertical, 
  Trash2, 
  Copy, 
  Move, 
  Save, 
  Share2, 
  Template, 
  Database, 
  Filter, 
  Sort, 
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Sparkles,
  Link,
  Hash,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline
} from 'lucide-react'

// Types for block-based editor
interface ContentBlock {
  id: string
  type: 'text' | 'heading' | 'image' | 'video' | 'code' | 'quote' | 'divider' | 'list' | 'checklist' | 'table' | 'database' | 'embed' | 'file'
  content: any
  position: number
  properties: BlockProperties
  createdAt: string
  updatedAt: string
  userId: string
}

interface BlockProperties {
  alignment?: 'left' | 'center' | 'right'
  color?: string
  backgroundColor?: string
  fontSize?: 'small' | 'normal' | 'large' | 'xl'
  formatting?: {
    bold?: boolean
    italic?: boolean
    underline?: boolean
    strikethrough?: boolean
  }
  indent?: number
  collapsed?: boolean
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

interface DatabaseConnection {
  id: string
  name: string
  type: 'notion' | 'airtable' | 'google_sheets' | 'supabase'
  url: string
  apiKey: string
  tables: DatabaseTable[]
  isConnected: boolean
}

interface DatabaseTable {
  id: string
  name: string
  fields: DatabaseField[]
  records: any[]
}

interface DatabaseField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox' | 'url' | 'email' | 'phone'
  options?: string[]
}

interface EditorState {
  blocks: ContentBlock[]
  selectedBlockId: string | null
  isEditing: boolean
  draggedBlockId: string | null
  showTemplates: boolean
  showDatabase: boolean
  templates: BlockTemplate[]
  databases: DatabaseConnection[]
  searchQuery: string
  filterBy: string
  sortBy: 'created' | 'updated' | 'position'
  viewMode: 'edit' | 'preview'
  collaborators: number
  autoSave: boolean
  wordCount: number
}

type EditorAction = 
  | { type: 'ADD_BLOCK'; block: ContentBlock; position?: number }
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
  onShare?: (shareData: any) => void
  className?: string
}

export function BlockBasedContentEditor({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = ''
}: BlockBasedContentEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const [blockMenuPosition, setBlockMenuPosition] = useState({ x: 0, y: 0 })
  const editorRef = useRef<HTMLDivElement>(null)

  // Block types configuration
  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', description: 'Plain text paragraph' },
    { type: 'heading', icon: Hash, label: 'Heading', description: 'Section heading' },
    { type: 'list', icon: List, label: 'Bulleted List', description: 'Simple bulleted list' },
    { type: 'checklist', icon: CheckSquare, label: 'To-do List', description: 'List with checkboxes' },
    { type: 'quote', icon: Quote, label: 'Quote', description: 'Capture a quote' },
    { type: 'code', icon: Code, label: 'Code', description: 'Code snippet with syntax highlighting' },
    { type: 'divider', icon: Divider, label: 'Divider', description: 'Visual divider' },
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
  }, [state.blocks])

  const createBlock = (type: ContentBlock['type'], content: any = {}) => {
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

  const renderBlock = (block: ContentBlock) => {
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
            <p 
              className="cursor-text"
              onClick={() => dispatch({ type: 'SET_EDITING', editing: true })}
            >
              {block.content.text || 'Type something...'}
            </p>
          )

        case 'heading':
          const HeadingTag = `h${block.content.level || 1}` as keyof JSX.IntrinsicElements
          return isEditing ? (
            <Input
              value={block.content.text || ''}
              onChange={(e) => dispatch({
                type: 'UPDATE_BLOCK',
                id: block.id,
                updates: { content: { ...block.content, text: e.target.value } }
              })}
              onBlur={() => dispatch({ type: 'SET_EDITING', editing: false })}
              className="border-none p-0 text-2xl font-bold focus:ring-0"
              autoFocus
            />
          ) : (
            <HeadingTag 
              className="cursor-text text-2xl font-bold"
              onClick={() => dispatch({ type: 'SET_EDITING', editing: true })}
            >
              {block.content.text || 'Heading'}
            </HeadingTag>
          )

        case 'checklist':
          return (
            <div className="space-y-2">
              {block.content.items?.map((item: any, index: number) => (
                <div key={item.id || index} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={(e) => {
                      const updatedItems = [...block.content.items]
                      updatedItems[index] = { ...item, checked: e.target.checked }
                      dispatch({
                        type: 'UPDATE_BLOCK',
                        id: block.id,
                        updates: { content: { ...block.content, items: updatedItems } }
                      })
                    }}
                    className="rounded"
                  />
                  <Input
                    value={item.text || ''}
                    onChange={(e) => {
                      const updatedItems = [...block.content.items]
                      updatedItems[index] = { ...item, text: e.target.value }
                      dispatch({
                        type: 'UPDATE_BLOCK',
                        id: block.id,
                        updates: { content: { ...block.content, items: updatedItems } }
                      })
                    }}
                    className="border-none p-0 focus:ring-0"
                    placeholder="To-do item"
                  />
                </div>
              ))}
            </div>
          )

        case 'code':
          return (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <select
                  value={block.content.language || 'javascript'}
                  onChange={(e) => dispatch({
                    type: 'UPDATE_BLOCK',
                    id: block.id,
                    updates: { content: { ...block.content, language: e.target.value } }
                  })}
                  className="bg-gray-800 text-gray-200 text-sm border-gray-700 rounded px-2 py-1"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="css">CSS</option>
                  <option value="html">HTML</option>
                </select>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-200">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={block.content.code || ''}
                onChange={(e) => dispatch({
                  type: 'UPDATE_BLOCK',
                  id: block.id,
                  updates: { content: { ...block.content, code: e.target.value } }
                })}
                className="bg-transparent border-none text-gray-100 font-mono text-sm resize-none focus:ring-0"
                placeholder="// Enter your code here"
                rows={6}
              />
            </div>
          )

        case 'quote':
          return (
            <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-700">
              <Textarea
                value={block.content.text || ''}
                onChange={(e) => dispatch({
                  type: 'UPDATE_BLOCK',
                  id: block.id,
                  updates: { content: { ...block.content, text: e.target.value } }
                })}
                className="border-none p-0 italic resize-none focus:ring-0"
                placeholder="Enter quote..."
              />
              {block.content.author && (
                <footer className="text-sm text-gray-500 mt-2">
                  — {block.content.author}
                </footer>
              )}
            </blockquote>
          )

        case 'divider':
          return <hr className="border-gray-300 my-4" />

        case 'table':
          return (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    {block.content.headers?.map((header: string, index: number) => (
                      <th key={index} className="border border-gray-300 p-2 text-left">
                        <Input
                          value={header}
                          onChange={(e) => {
                            const updatedHeaders = [...block.content.headers]
                            updatedHeaders[index] = e.target.value
                            dispatch({
                              type: 'UPDATE_BLOCK',
                              id: block.id,
                              updates: { content: { ...block.content, headers: updatedHeaders } }
                            })
                          }}
                          className="border-none p-0 font-medium focus:ring-0"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.content.rows?.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-gray-300 p-2">
                          <Input
                            value={cell}
                            onChange={(e) => {
                              const updatedRows = [...block.content.rows]
                              updatedRows[rowIndex][cellIndex] = e.target.value
                              dispatch({
                                type: 'UPDATE_BLOCK',
                                id: block.id,
                                updates: { content: { ...block.content, rows: updatedRows } }
                              })
                            }}
                            className="border-none p-0 focus:ring-0"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                      <Sort className="h-3 w-3 mr-1" />
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
          return <div className="text-gray-500">Unsupported block type: {block.type}</div>
      }
    })()

    return (
      <div
        key={block.id}
        className={`group relative p-2 rounded-lg transition-colors ${
          isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
        }`}
        onClick={(e) => handleBlockClick(block.id, e)}
        draggable
        onDragStart={() => dispatch({ type: 'SET_DRAGGING', id: block.id })}
        onDragEnd={() => dispatch({ type: 'SET_DRAGGING', id: null })}
      >
        {/* Block Handle */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 cursor-grab">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        {/* Block Content */}
        <div className={`${block.properties.alignment === 'center' ? 'text-center' : block.properties.alignment === 'right' ? 'text-right' : 'text-left'}`}>
          {blockContent}
        </div>

        {/* Block Actions */}
        {isSelected && (
          <div className="absolute right-0 top-0 transform translate-x-full flex gap-1 ml-2">
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <Copy className="h-3 w-3" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0"
              onClick={() => dispatch({ type: 'DELETE_BLOCK', id: block.id })}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            Block-Based Content Editor
          </h2>
          <p className="text-gray-600">Notion-level knowledge management with blocks</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {state.blocks.filter(b => b.type === 'text' || b.type === 'heading').reduce((count, block) => {
              const text = block.content.text || ''
              return count + text.split(/\s+/).filter(word => word.length > 0).length
            }, 0)} words
          </Badge>

          <Button
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_TEMPLATES' })}
          >
            <Template className="h-4 w-4 mr-2" />
            Templates
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: 'TOGGLE_DATABASE' })}
          >
            <Database className="h-4 w-4 mr-2" />
            Database
          </Button>

          <Button
            size="sm"
            variant={state.viewMode === 'preview' ? 'default' : 'outline'}
            onClick={() => dispatch({ 
              type: 'SET_VIEW_MODE', 
              mode: state.viewMode === 'edit' ? 'preview' : 'edit' 
            })}
          >
            {state.viewMode === 'edit' ? <Eye className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {state.viewMode === 'edit' ? 'Preview' : 'Edit'}
          </Button>

          <Button onClick={() => onSave?.(state.blocks)} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button onClick={() => onShare?.({ blocks: state.blocks, projectId })} size="sm" variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Editor */}
        <div className="col-span-9">
          <Card>
            <CardContent className="p-6">
              <div ref={editorRef} className="space-y-4 min-h-[600px]">
                {state.blocks.map((block) => renderBlock(block))}
                
                {/* Add Block Button */}
                <div className="flex items-center justify-center py-4">
                  <Button
                    variant="ghost"
                    onClick={handleAddBlockClick}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add a block
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-3 space-y-4">
          {/* Templates */}
          {state.showTemplates && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {state.templates.map(template => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => dispatch({ type: 'APPLY_TEMPLATE', template })}
                  >
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{template.description}</div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{template.category}</Badge>
                      <span className="text-xs text-gray-500">{template.usageCount} uses</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Database Connections */}
          {state.showDatabase && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Connections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {state.databases.map(database => (
                  <div key={database.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm">{database.name}</div>
                      <Badge variant={database.isConnected ? 'default' : 'secondary'} className="text-xs">
                        {database.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{database.type}</div>
                    <div className="space-y-1">
                      {database.tables.map(table => (
                        <div
                          key={table.id}
                          className="text-xs p-1 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            const block = createBlock('database', {
                              databaseId: database.id,
                              tableId: table.id
                            })
                            dispatch({ type: 'ADD_BLOCK', block })
                          }}
                        >
                          {table.name} ({table.records.length} records)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Block Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Add Blocks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {blockTypes.map(blockType => (
                <Button
                  key={blockType.type}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-2"
                  onClick={() => addBlock(blockType.type as ContentBlock['type'])}
                >
                  <blockType.icon className="h-4 w-4 mr-3 text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{blockType.label}</div>
                    <div className="text-xs text-gray-500">{blockType.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Document Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Document Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Blocks:</span>
                <span>{state.blocks.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Words:</span>
                <span>
                  {state.blocks.filter(b => b.type === 'text' || b.type === 'heading').reduce((count, block) => {
                    const text = block.content.text || ''
                    return count + text.split(/\s+/).filter(word => word.length > 0).length
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Characters:</span>
                <span>
                  {state.blocks.filter(b => b.type === 'text' || b.type === 'heading').reduce((count, block) => {
                    return count + (block.content.text || '').length
                  }, 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Collaborators:</span>
                <span>{state.collaborators}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Block Menu Modal */}
      {showBlockMenu && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96 max-h-96 overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-sm">Choose a block type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {blockTypes.map(blockType => (
                <Button
                  key={blockType.type}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => addBlock(blockType.type as ContentBlock['type'])}
                >
                  <blockType.icon className="h-5 w-5 mr-3 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium">{blockType.label}</div>
                    <div className="text-xs text-gray-500">{blockType.description}</div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 