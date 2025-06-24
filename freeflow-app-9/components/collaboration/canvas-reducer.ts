import { CanvasObject, UPFComment, AIAnalysisResult, AIStyleSuggestion, AILayoutOptimization } from './types'

export interface CanvasState {
  objects: { [key: string]: CanvasObject }
  selectedObjects: string[]
  activeTool: string
  zoom: number
  panX: number
  panY: number
  isCollaborating: boolean
  showGrid: boolean
  snapToGrid: boolean
  gridSize: number
  undoStack: CanvasState[]
  redoStack: CanvasState[]
  comments: UPFComment[]
  showComments: boolean
  isAddingComment: boolean
  selectedCommentId: string | null
  aiAnalysisEnabled: boolean
}

type CanvasAction =
  | { type: 'ADD_OBJECT'; object: CanvasObject }
  | { type: 'UPDATE_OBJECT'; id: string; updates: Partial<CanvasObject> }
  | { type: 'DELETE_OBJECT'; id: string }
  | { type: 'SET_TOOL'; tool: string }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_PAN'; x: number; y: number }
  | { type: 'SET_COLLABORATING'; isCollaborating: boolean }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'SET_GRID_SIZE'; size: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'ADD_COMMENT'; comment: UPFComment }
  | { type: 'UPDATE_COMMENT'; id: string; updates: Partial<UPFComment> }
  | { type: 'DELETE_COMMENT'; id: string }
  | { type: 'TOGGLE_COMMENTS' }
  | { type: 'SET_ADDING_COMMENT'; isAdding: boolean }
  | { type: 'SET_SELECTED_COMMENT'; id: string | null }
  | { type: 'TOGGLE_AI_ANALYSIS' }
  | { type: 'SELECT_OBJECTS'; ids: string[] }
  | { type: 'DESELECT_OBJECTS' }
  | { type: 'UPDATE_CURSOR'; cursor: { userId: string; x: number; y: number; tool: string } }

export const canvasReducer = (state: CanvasState, action: CanvasAction): CanvasState => {
  switch (action.type) {
    case 'ADD_OBJECT':
      return {
        ...state,
        objects: {
          ...state.objects,
          [action.object.id]: action.object
        }
      }

    case 'UPDATE_OBJECT':
      return {
        ...state,
        objects: {
          ...state.objects,
          [action.id]: {
            ...state.objects[action.id],
            ...action.updates
          }
        }
      }

    case 'DELETE_OBJECT':
      const { [action.id]: deleted, ...remainingObjects } = state.objects
      return {
        ...state,
        objects: remainingObjects,
        selectedObjects: state.selectedObjects.filter(id => id !== action.id)
      }

    case 'SET_TOOL':
      return {
        ...state,
        activeTool: action.tool
      }

    case 'SET_ZOOM':
      return {
        ...state,
        zoom: action.zoom
      }

    case 'SET_PAN':
      return {
        ...state,
        panX: action.x,
        panY: action.y
      }

    case 'SET_COLLABORATING':
      return {
        ...state,
        isCollaborating: action.isCollaborating
      }

    case 'TOGGLE_GRID':
      return {
        ...state,
        showGrid: !state.showGrid
      }

    case 'TOGGLE_SNAP':
      return {
        ...state,
        snapToGrid: !state.snapToGrid
      }

    case 'SET_GRID_SIZE':
      return {
        ...state,
        gridSize: action.size
      }

    case 'UNDO':
      if (state.undoStack.length === 0) return state
      const previousState = state.undoStack[state.undoStack.length - 1]
      return {
        ...previousState,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state]
      }

    case 'REDO':
      if (state.redoStack.length === 0) return state
      const nextState = state.redoStack[state.redoStack.length - 1]
      return {
        ...nextState,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state]
      }

    case 'ADD_COMMENT':
      return {
        ...state,
        comments: [...state.comments, action.comment]
      }

    case 'UPDATE_COMMENT':
      return {
        ...state,
        comments: state.comments.map(comment =>
          comment.id === action.id
            ? { ...comment, ...action.updates }
            : comment
        )
      }

    case 'DELETE_COMMENT':
      return {
        ...state,
        comments: state.comments.filter(comment => comment.id !== action.id)
      }

    case 'TOGGLE_COMMENTS':
      return {
        ...state,
        showComments: !state.showComments
      }

    case 'SET_ADDING_COMMENT':
      return {
        ...state,
        isAddingComment: action.isAdding
      }

    case 'SET_SELECTED_COMMENT':
      return {
        ...state,
        selectedCommentId: action.id
      }

    case 'TOGGLE_AI_ANALYSIS':
      return {
        ...state,
        aiAnalysisEnabled: !state.aiAnalysisEnabled
      }

    case 'SELECT_OBJECTS':
      return {
        ...state,
        selectedObjects: action.ids
      }

    case 'DESELECT_OBJECTS':
      return {
        ...state,
        selectedObjects: []
      }

    case 'UPDATE_CURSOR':
      return {
        ...state,
        cursors: state.cursors.map(cursor =>
          cursor.userId === action.cursor.userId
            ? { ...cursor, ...action.cursor }
            : cursor
        )
      }

    default:
      return state
  }
} 