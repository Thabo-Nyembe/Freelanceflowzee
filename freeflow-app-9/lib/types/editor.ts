export interface ContentBlock {
  id: string
  type: 'heading' | 'text' | 'checklist' | 'image' | 'table' | 'list' | 'quote' | 'code' | 'database' | 'file' | 'video'
  content: unknown
  position: number
  properties: {
    alignment: 'left' | 'center' | 'right'
    fontSize?: 'normal' | 'large' | 'xl'
    level?: 1 | 2 | 3 // For headings
    language?: string // For code blocks
    checked?: boolean[] // For checklists
    columns?: string[] // For tables
    url?: string // For images, videos, files
    caption?: string // For media blocks
  }
  createdAt: string
  updatedAt: string
  userId: string
}

export interface BlockTemplate {
  id: string
  name: string
  description: string
  blocks: ContentBlock[]
  category: string
  tags: string[]
  thumbnail?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface DatabaseSource {
  id: string
  name: string
  description: string
  type: 'supabase' | 'postgres' | 'mysql'
  connection: {
    host: string
    port: number
    database: string
    schema: string
    table: string
  }
  fields: {
    name: string
    type: string
    isRequired: boolean
  }[]
  createdAt: string
  updatedAt: string
}

export interface EditorState {
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

export type EditorAction =
  | { type: 'ADD_BLOCK'; block: ContentBlock; position?: number }
  | { type: 'UPDATE_BLOCK'; id: string; updates: Partial<ContentBlock> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'REORDER_BLOCKS'; fromIndex: number; toIndex: number }
  | { type: 'SELECT_BLOCK'; id: string | null }
  | { type: 'SET_EDITING'; editing: boolean }
  | { type: 'SET_DRAGGING'; id: string | null }
  | { type: 'TOGGLE_TEMPLATES' }
  | { type: 'TOGGLE_DATABASE' }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'SET_SORT'; sort: string }
  | { type: 'SET_VIEW_MODE'; mode: 'edit' | 'preview' }
  | { type: 'SET_COLLABORATORS'; count: number }
  | { type: 'TOGGLE_AUTO_SAVE' }
  | { type: 'UPDATE_WORD_COUNT'; count: number }

export interface BlockBasedContentEditorProps {
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