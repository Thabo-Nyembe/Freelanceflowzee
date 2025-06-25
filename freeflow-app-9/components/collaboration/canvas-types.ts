export interface CanvasState {
  objects: { [key: string]: CanvasObject }
  selectedObjects: string[]
  activeTool: string | null
  zoom: number
  pan: { x: number; y: number }
  history: CanvasObject[][]
  undoStack: CanvasObject[][]
  redoStack: CanvasObject[][]
  collaborators: string[]
  aiAnalysisEnabled: boolean
  selectedTemplate: Template | null
  templateAnalysis: TemplateAnalysis | null
  cursors: CursorPosition[]
}

export interface CanvasObject {
  id: string
  type: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  text?: string
  fontSize?: number
  fontFamily?: string
  textAlign?: string
  path?: string
  points?: { x: number; y: number }[]
}

export interface CursorPosition {
  userId: string
  x: number
  y: number
  timestamp: number
}

export interface Template {
  id: string
  name: string
  metadata?: {
    license?: string
    tags?: string[]
    category?: string
  }
  aiStyle?: {
    brandConsistency?: {
      score?: number
    }
  }
}

export interface TemplateAnalysis {
  score: number
  suggestions: string[]
} 