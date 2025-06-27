import { CanvasState, CanvasObject, CursorPosition } from './canvas-types

// Action types
interface AddObjectAction {
  type: 'ADD_OBJECT
  object: CanvasObject
}

interface UpdateObjectAction {
  type: 'UPDATE_OBJECT
  object: CanvasObject
}

interface DeleteObjectAction {
  type: 'DELETE_OBJECT
  objectId: string
}

interface SelectObjectAction {
  type: 'SELECT_OBJECT
  objectId: string
}

interface UpdateCursorAction {
  type: 'UPDATE_CURSOR
  cursor: CursorPosition
}

interface SetTemplateAction {
  type: 'SET_TEMPLATE
  template: CanvasState['selectedTemplate']
}

interface SetTemplateAnalysisAction {
  type: 'SET_TEMPLATE_ANALYSIS
  analysis: CanvasState['templateAnalysis']
}

type CanvasAction =
  | AddObjectAction
  | UpdateObjectAction
  | DeleteObjectAction
  | SelectObjectAction
  | UpdateCursorAction
  | SetTemplateAction
  | SetTemplateAnalysisAction

export function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
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
          [action.object.id]: action.object
        }
      }

    case 'DELETE_OBJECT':
      const { [action.objectId]: _, ...remainingObjects } = state.objects
      return {
        ...state,
        objects: remainingObjects,
        selectedObjects: state.selectedObjects.filter(id => id !== action.objectId)
      }

    case 'SELECT_OBJECT':
      return {
        ...state,
        selectedObjects: [action.objectId]
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

    case 'SET_TEMPLATE':
      return {
        ...state,
        selectedTemplate: action.template
      }

    case 'SET_TEMPLATE_ANALYSIS':
      return {
        ...state,
        templateAnalysis: action.analysis
      }

    default:
      return state
  }
} 