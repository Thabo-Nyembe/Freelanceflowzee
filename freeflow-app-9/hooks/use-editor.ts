import { useReducer, useCallback, useEffect } from 'react'
import { EditorState, EditorAction, ContentBlock } from '@/lib/types/editor'
import { defaultTemplates, defaultDatabases, calculateWordCount } from '@/lib/utils/editor'

const initialState: EditorState = {
  blocks: [],
  selectedBlockId: null,
  isEditing: false,
  draggedBlockId: null,
  showTemplates: false,
  showDatabase: false,
  templates: defaultTemplates,
  databases: defaultDatabases,
  searchQuery: '',
  filterBy: 'all',
  sortBy: 'position',
  viewMode: 'edit',
  collaborators: 0,
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
        blocks: newBlocks,
        wordCount: calculateWordCount(newBlocks)
      }
    
    case 'UPDATE_BLOCK':
      const updatedBlocks = state.blocks.map(block => 
        block.id === action.id 
          ? { ...block, ...action.updates, updatedAt: new Date().toISOString() }
          : block
      )
      return {
        ...state,
        blocks: updatedBlocks,
        wordCount: calculateWordCount(updatedBlocks)
      }
    
    case 'DELETE_BLOCK':
      const remainingBlocks = state.blocks.filter(block => block.id !== action.id)
      return {
        ...state,
        blocks: remainingBlocks,
        selectedBlockId: state.selectedBlockId === action.id ? null : state.selectedBlockId,
        wordCount: calculateWordCount(remainingBlocks)
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
    
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.query
      }
    
    case 'SET_FILTER':
      return {
        ...state,
        filterBy: action.filter
      }
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.sort
      }
    
    case 'SET_VIEW_MODE':
      return {
        ...state,
        viewMode: action.mode
      }
    
    case 'SET_COLLABORATORS':
      return {
        ...state,
        collaborators: action.count
      }
    
    case 'TOGGLE_AUTO_SAVE':
      return {
        ...state,
        autoSave: !state.autoSave
      }
    
    case 'UPDATE_WORD_COUNT':
      return {
        ...state,
        wordCount: action.count
      }
    
    default:
      return state
  }
}

export function useEditor(initialBlocks: ContentBlock[] = [], onSave?: (blocks: ContentBlock[]) => void
) {
  const [state, dispatch] = useReducer(editorReducer, {
    ...initialState,
    blocks: initialBlocks,
    wordCount: calculateWordCount(initialBlocks)
  })

  // Auto-save functionality
  useEffect(() => {
    if (state.autoSave && onSave) {
      const saveTimer = setTimeout(() => {
        onSave(state.blocks)
      }, 2000)
      return () => clearTimeout(saveTimer)
    }
  }, [state.blocks, state.autoSave, onSave])

  // Block management
  const addBlock = useCallback((block: ContentBlock, position?: number) => {
    dispatch({ type: 'ADD_BLOCK', block, position })
  }, [])

  const updateBlock = useCallback((id: string, updates: Partial<ContentBlock>) => {
    dispatch({ type: 'UPDATE_BLOCK', id, updates })
  }, [])

  const deleteBlock = useCallback((id: string) => {
    dispatch({ type: 'DELETE_BLOCK', id })
  }, [])

  const reorderBlocks = useCallback((fromIndex: number, toIndex: number) => {
    dispatch({ type: 'REORDER_BLOCKS', fromIndex, toIndex })
  }, [])

  const selectBlock = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_BLOCK', id })
  }, [])

  // UI state management
  const setEditing = useCallback((editing: boolean) => {
    dispatch({ type: 'SET_EDITING', editing })
  }, [])

  const setDragging = useCallback((id: string | null) => {
    dispatch({ type: 'SET_DRAGGING', id })
  }, [])

  const toggleTemplates = useCallback(() => {
    dispatch({ type: 'TOGGLE_TEMPLATES' })
  }, [])

  const toggleDatabase = useCallback(() => {
    dispatch({ type: 'TOGGLE_DATABASE' })
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', query })
  }, [])

  const setFilter = useCallback((filter: string) => {
    dispatch({ type: 'SET_FILTER', filter })
  }, [])

  const setSort = useCallback((sort: string) => {
    dispatch({ type: 'SET_SORT', sort })
  }, [])

  const setViewMode = useCallback((mode: 'edit' | 'preview') => {
    dispatch({ type: 'SET_VIEW_MODE', mode })
  }, [])

  const setCollaborators = useCallback((count: number) => {
    dispatch({ type: 'SET_COLLABORATORS', count })
  }, [])

  const toggleAutoSave = useCallback(() => {
    dispatch({ type: 'TOGGLE_AUTO_SAVE' })
  }, [])

  return {
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
  }
} 