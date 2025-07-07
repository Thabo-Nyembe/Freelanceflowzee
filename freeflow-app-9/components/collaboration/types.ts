export interface CanvasObject {
  id: string
  type: 'rectangle' | 'circle' | 'text' | 'line' | 'component' | 'image' | 'video' | 'shape' | 'template' | 'artboard' | 'group'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fill: string
  stroke: string
  strokeWidth: number
  text?: string
  fontSize?: number
  fontFamily?: string
  opacity: number
  locked: boolean
  visible: boolean
  layer: number
  filters?: ImageFilters
  effects?: LayerEffects
  mask?: MaskSettings
  blendMode?: BlendMode
  transform?: Transform3D
  animation?: AnimationSettings
  aiGenerated?: boolean
  aiConfidence?: number
  aiSuggestions?: string[]
  aiStyle?: AIStyleSuggestion
  aiLayout?: AILayoutOptimization
  complexity?: 'low' | 'medium' | 'high'
  cachedVersion?: HTMLCanvasElement
  metadata?: AssetMetadata
}

export interface ImageFilters {
  brightness: number
  contrast: number
  saturation: number
  exposure: number
  temperature: number
  tint: number
  highlights: number
  shadows: number
  sharpness: number
  blur: number
  noise: number
  vibrance: number
}

export interface LayerEffects {
  shadow?: {
    color: string
    blur: number
    spread: number
    distance: number
    angle: number
  }
  glow?: {
    color: string
    blur: number
    spread: number
    intensity: number
  }
  overlay?: {
    type: 'color' | 'gradient' | 'pattern'
    value: string
    blendMode: BlendMode
    opacity: number
  }
}

export interface MaskSettings {
  type: 'alpha' | 'luminance' | 'vector'
  path?: string
  feather: number
  invert: boolean
}

export type BlendMode = 
  | 'normal' | 'multiply' | 'screen' | 'overlay' 
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity'

export interface Transform3D {
  perspective: number
  rotateX: number
  rotateY: number
  rotateZ: number
  scale: number
}

export interface AnimationSettings {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'custom'
  duration: number
  delay: number
  easing: string
  repeat: number
  autoplay: boolean
  keyframes?: AnimationKeyframe[]
}

export interface AnimationKeyframe {
  offset: number
  transform: string
  opacity: number
}

export interface AssetMetadata {
  title: string
  description: string
  tags: string[]
  category: string
  license: 'free' | 'premium' | 'custom'
  author: string
  created: string
  modified: string
  dimensions: {
    width: number
    height: number
    dpi: number
  }
  fileInfo: {
    size: number
    type: string
    format: string
  }
}

export interface UPFComment {
  id: string
  text: string
  author: string
  timestamp: number
  resolved: boolean
  replies: UPFComment[]
  attachments: string[]
  position: {
    x: number
    y: number
  }
}

export interface UPFReply {
  id: string
  text: string
  author: string
  timestamp: number
  aiEnhanced: boolean
}

export interface UPFAttachment {
  id: string
  type: 'image' | 'file' | 'link'
  url: string
  name: string
  size?: number
  thumbnail?: string
}

export interface AIAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative'
  priority: 'low' | 'medium' | 'high'
  category: string
  suggestions: string[]
  confidence: number
}

export interface AIStyleSuggestion {
  colorPalette: {
    primary: string
    secondary: string[]
    accent: string[]
    neutral: string[]
  }
  typography: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    letterSpacing: number
    recommendations: string[]
    pairings: {
      heading: string
      body: string
      accent: string
    }
  }
  effects: {
    shadows: string[]
    gradients: string[]
    animations: string[]
    textures: string[]
    overlays: string[]
  }
  brandConsistency: {
    score: number
    improvements: string[]
    guidelines: {
      colors: string[]
      fonts: string[]
      spacing: number[]
      imagery: string[]
    }
  }
  industrySpecific: {
    photography: {
      filters: {
        brightness: number
        contrast: number
        saturation: number
        exposure: number
        temperature: number
        tint: number
        highlights: number
        shadows: number
        sharpness: number
        blur: number
        noise: number
        vibrance: number
      }
      compositions: string[]
      lightingSetups: string[]
    }
    graphicDesign: {
      layouts: string[]
      patterns: string[]
      iconStyles: string[]
    }
    videoEditing: {
      transitions: string[]
      effects: string[]
      colorGrades: string[]
    }
    webDesign: {
      components: string[]
      interactions: string[]
      responsive: string[]
    }
  }
}

export interface AILayoutOptimization {
  gridSystem: {
    score: number
    suggestions: string[]
    columns: number
    gutters: number
    margins: number
  }
  spacing: {
    score: number
    recommendations: string[]
    metrics: {
      padding: number[]
      margin: number[]
      whitespace: number[]
    }
  }
  hierarchy: {
    score: number
    improvements: string[]
    structure: {
      primary: string[]
      secondary: string[]
      tertiary: string[]
    }
  }
  composition: {
    balance: number
    flow: string
    suggestions: string[]
    rules: {
      ruleOfThirds: boolean
      goldenRatio: boolean
      symmetry: boolean
    }
  }
}

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

export interface Viewport {
  left: number
  top: number
  right: number
  bottom: number
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