import React, { useReducer, useRef, useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MousePointer, Square, Circle, Type, Move, RotateCcw, 
  Copy, Trash2, Layers, Eye, EyeOff, Users, Palette, 
  Grid, Undo, Redo, Download, Share2, GitBranch, Clock,
  Sparkles, Target, Pin, MessageSquare, Lock, Image,
  Video, Shapes, LayoutTemplate, Layout, Group, Filter,
  SlidersHorizontal, Wand2, Frame, Crop, Brush,
  Camera, Scissors, Eraser, Pipette, Spline
} from 'lucide-react'
import { canvasReducer, CanvasState } from './canvas-reducer'
import { 
  CanvasObject as CanvasObjectType,
  UPFComment as UPFCommentType,
  AIAnalysisResult,
  AIStyleSuggestion,
  AILayoutOptimization,
  ImageFilters,
  LayerEffects,
  MaskSettings,
  BlendMode,
  Transform3D,
  AnimationSettings
} from './types'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { nanoid } from 'nanoid'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CanvasObject extends CanvasObjectType {}
interface UPFComment extends UPFCommentType {
  position: { x: number; y: number }
}

interface AIAnalysisResultWithId extends AIAnalysisResult {
  objectId: string
}

interface AIEnhancedCanvasCollaborationProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    avatar: string
    color: string
  }
  onSave?: (objects: CanvasObject[]) => void
  onShare?: (shareData: any) => void
  className?: string
}

interface ExtendedCanvasState extends Omit<CanvasState, 'objects'> {
  objects: { [key: string]: CanvasObject }
  selectedObjects: string[]
  selectedIds: string[]
  history: CanvasState[]
  historyIndex: number
  cursors: Array<{
    userId: string
    userName: string
    userColor: string
    x: number
    y: number
    isActive: boolean
    tool: string
    timestamp: number
  }>
}

const initialState: ExtendedCanvasState = {
  objects: {},
  selectedObjects: [],
  selectedIds: [],
  activeTool: 'select',
  zoom: 1,
  panX: 0,
  panY: 0,
  isCollaborating: false,
  showGrid: true,
  snapToGrid: true,
  gridSize: 20,
  undoStack: [],
  redoStack: [],
  comments: [],
  showComments: true,
  isAddingComment: false,
  selectedCommentId: null,
  aiAnalysisEnabled: true,
  history: [],
  historyIndex: -1,
  cursors: []
}

const mockAIStyle: AIStyleSuggestion = {
  colorPalette: {
    primary: '#2563eb',
    secondary: ['#1d4ed8', '#3b82f6'],
    accent: ['#f59e0b', '#10b981'],
    neutral: ['#f3f4f6', '#9ca3af', '#4b5563']
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0.5,
    recommendations: [
      'Use larger font size for headers',
      'Increase line height for better readability'
    ],
    pairings: {
      heading: 'Montserrat',
      body: 'Inter',
      accent: 'Playfair Display'
    }
  },
  effects: {
    shadows: ['0 2px 4px rgba(0,0,0,0.1)'],
    gradients: ['linear-gradient(to right, #2563eb, #1d4ed8)'],
    animations: ['fade-in', 'slide-up'],
    textures: ['noise', 'grain', 'paper'],
    overlays: ['soft-light', 'color-burn']
  },
  brandConsistency: {
    score: 0.85,
    improvements: [
      'Align colors with brand guidelines',
      'Maintain consistent font usage'
    ],
    guidelines: {
      colors: ['#2563eb', '#1d4ed8', '#3b82f6'],
      fonts: ['Inter', 'Montserrat'],
      spacing: [4, 8, 16, 24, 32],
      imagery: ['modern', 'clean', 'professional']
    }
  },
  industrySpecific: {
    photography: {
      filters: {
        brightness: 1.1,
        contrast: 1.2,
        saturation: 1.1,
        exposure: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        sharpness: 1.1,
        blur: 0,
        noise: 0,
        vibrance: 1.1
      },
      compositions: ['rule-of-thirds', 'golden-ratio'],
      lightingSetups: ['natural', 'studio', 'dramatic']
    },
    graphicDesign: {
      layouts: ['grid', 'asymmetric', 'minimal'],
      patterns: ['geometric', 'organic', 'abstract'],
      iconStyles: ['outlined', 'filled', 'duotone']
    },
    videoEditing: {
      transitions: ['fade', 'slide', 'zoom'],
      effects: ['color-grade', 'blur', 'glow'],
      colorGrades: ['cinematic', 'vibrant', 'muted']
    },
    webDesign: {
      components: ['buttons', 'cards', 'forms'],
      interactions: ['hover', 'click', 'scroll'],
      responsive: ['mobile', 'tablet', 'desktop']
    }
  }
}

const mockAILayout: AILayoutOptimization = {
  gridSystem: {
    score: 0.85,
    suggestions: ['Align elements to grid', 'Use consistent spacing'],
    columns: 12,
    gutters: 16,
    margins: 24
  },
  spacing: {
    score: 0.9,
    recommendations: ['Increase whitespace', 'Use consistent padding'],
    metrics: {
      padding: [8, 16, 24],
      margin: [16, 24, 32],
      whitespace: [8, 16, 24]
    }
  },
  hierarchy: {
    score: 0.8,
    improvements: ['Make headings more prominent', 'Add visual hierarchy'],
    structure: {
      primary: ['Header', 'Hero section'],
      secondary: ['Features', 'Benefits'],
      tertiary: ['Footer', 'Social links']
    }
  },
  composition: {
    balance: 0.85,
    flow: 'left-to-right',
    suggestions: ['Balance visual weight', 'Improve content flow'],
    rules: {
      ruleOfThirds: true,
      goldenRatio: true,
      symmetry: false
    }
  }
}

// Enhanced template management system
interface TemplateCategory {
  id: string
  name: string
  description: string
  templates: Template[]
}

interface Template {
  id: string
  name: string
  description: string
  thumbnail: string
  tags: string[]
  industry: string[]
  complexity: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number
  objects: CanvasObject[]
  aiSuggestions?: string[]
}

const templateCategories: TemplateCategory[] = [
  {
    id: 'photography',
    name: 'Photography',
    description: 'Professional photography layouts and presentations',
    templates: [
      {
        id: 'portfolio-grid',
        name: 'Portfolio Grid',
        description: 'Clean grid layout for photo portfolios',
        thumbnail: '/templates/portfolio-grid.jpg',
        tags: ['portfolio', 'grid', 'gallery'],
        industry: ['photography', 'art'],
        complexity: 'beginner',
        estimatedTime: 10,
        objects: [
          // Template objects
        ]
      },
      // More photography templates
    ]
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    description: 'Professional design templates and brand assets',
    templates: [
      {
        id: 'brand-identity',
        name: 'Brand Identity Pack',
        description: 'Complete brand identity template set',
        thumbnail: '/templates/brand-identity.jpg',
        tags: ['branding', 'logo', 'identity'],
        industry: ['design', 'marketing'],
        complexity: 'advanced',
        estimatedTime: 30,
        objects: [
          // Template objects
        ]
      },
      // More design templates
    ]
  }
]

// Template management functions
const handleTemplateSelect = async (templateId: string) => {
  try {
    // Find template
    const template = findTemplateById(templateId)
    if (!template) return

    // Clear canvas if needed
    if (state.objects.length > 0) {
      const shouldClear = await confirmClearCanvas()
      if (!shouldClear) return
    }

    // Apply template
    applyTemplate(template)

    // Generate AI suggestions for the template
    generateTemplateAISuggestions(template)
  } catch (error) {
    console.error('Error applying template:', error)
  }
}

const findTemplateById = (templateId: string): Template | undefined => {
  for (const category of templateCategories) {
    const template = category.templates.find(t => t.id === templateId)
    if (template) return template
  }
}

const applyTemplate = (template: Template) => {
  // Clear existing objects
  dispatch({ type: 'CLEAR_CANVAS' })

  // Add template objects
  template.objects.forEach(obj => {
    dispatch({
      type: 'ADD_OBJECT',
      object: {
        ...obj,
        id: nanoid() // Generate new ID for each object
      }
    })
  })

  // Update canvas settings
  if (template.settings) {
    dispatch({
      type: 'UPDATE_CANVAS_SETTINGS',
      settings: template.settings
    })
  }
}

const generateTemplateAISuggestions = async (template: Template) => {
  try {
    // Analyze template content
    const analysis = await analyzeTemplateContent(template)

    // Generate industry-specific suggestions
    const suggestions = generateIndustrySuggestions(template.industry, analysis)

    // Update template with AI suggestions
    template.aiSuggestions = suggestions
  } catch (error) {
    console.error('Error generating template suggestions:', error)
  }
}

// Template recommendation system
const getRecommendedTemplates = (userPreferences: any, recentActivity: any): Template[] => {
  const recommendations: Template[] = []

  // Analyze user preferences and recent activity
  const userInterests = analyzeUserInterests(userPreferences, recentActivity)

  // Score templates based on user interests
  const scoredTemplates = templateCategories
    .flatMap(category => category.templates)
    .map(template => ({
      template,
      score: calculateTemplateScore(template, userInterests)
    }))
    .sort((a, b) => b.score - a.score)

  // Return top recommendations
  return scoredTemplates.slice(0, 5).map(item => item.template)
}

// Render comments
const renderComments = (ctx: CanvasRenderingContext2D, comments: UPFComment[], zoom: number) => {
  comments.forEach(comment => {
    if (!comment.position) return
    ctx.save()
    ctx.fillStyle = comment.resolved ? '#4CAF50' : '#FF9800'
    ctx.beginPath()
    ctx.arc(comment.position.x, comment.position.y, 5 / zoom, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  })
}

// Enhanced AI analysis with more sophisticated capabilities
const analyzeCanvas = async () => {
  if (!state.aiAnalysisEnabled) return

  try {
    // Group objects by type for contextual analysis
    const objectsByType = Object.values(state.objects).reduce((acc, obj) => {
      if (!acc[obj.type]) acc[obj.type] = []
      acc[obj.type].push(obj)
      return acc
    }, {} as Record<string, CanvasObject[]>)

    // Analyze spatial relationships
    const spatialAnalysis = analyzeSpatialRelationships(Object.values(state.objects))

    // Analyze visual hierarchy
    const hierarchyAnalysis = analyzeVisualHierarchy(Object.values(state.objects))

    // Analyze color harmony
    const colorAnalysis = analyzeColorHarmony(Object.values(state.objects))

    // Analyze accessibility
    const accessibilityAnalysis = analyzeAccessibility(Object.values(state.objects))

    // Generate industry-specific recommendations
    const industryRecommendations = generateIndustryRecommendations(
      Object.values(state.objects),
      state.selectedTemplate
    )

    // Update objects with AI insights
    Object.keys(state.objects).forEach(id => {
      const object = state.objects[id]
      dispatch({
        type: 'UPDATE_OBJECT',
        id,
        updates: {
          aiSuggestions: [
            ...spatialAnalysis.suggestions,
            ...hierarchyAnalysis.suggestions,
            ...colorAnalysis.suggestions,
            ...accessibilityAnalysis.suggestions,
            ...industryRecommendations
          ],
          aiConfidence: calculateOverallConfidence([
            spatialAnalysis.confidence,
            hierarchyAnalysis.confidence,
            colorAnalysis.confidence,
            accessibilityAnalysis.confidence
          ])
        }
      })
    })

  } catch (error) {
    console.error('AI analysis failed:', error)
  }
}

// Analyze spatial relationships between objects
const analyzeSpatialRelationships = (objects: CanvasObject[]) => {
  const suggestions: string[] = []
  let confidence = 0

  // Analyze alignment
  const alignmentScore = analyzeAlignment(objects)
  if (alignmentScore < 0.8) {
    suggestions.push('Improve object alignment for better visual structure')
  }

  // Analyze spacing
  const spacingScore = analyzeSpacing(objects)
  if (spacingScore < 0.8) {
    suggestions.push('Adjust spacing between elements for better rhythm')
  }

  // Analyze grouping
  const groupingScore = analyzeGrouping(objects)
  if (groupingScore < 0.8) {
    suggestions.push('Consider grouping related elements together')
  }

  confidence = (alignmentScore + spacingScore + groupingScore) / 3
  return { suggestions, confidence }
}

// Analyze visual hierarchy
const analyzeVisualHierarchy = (objects: CanvasObject[]) => {
  const suggestions: string[] = []
  let confidence = 0

  // Analyze size hierarchy
  const sizeScore = analyzeSizeHierarchy(objects)
  if (sizeScore < 0.8) {
    suggestions.push('Adjust element sizes to establish clear hierarchy')
  }

  // Analyze contrast hierarchy
  const contrastScore = analyzeContrastHierarchy(objects)
  if (contrastScore < 0.8) {
    suggestions.push('Improve contrast between elements for better readability')
  }

  confidence = (sizeScore + contrastScore) / 2
  return { suggestions, confidence }
}

// Analyze color harmony
const analyzeColorHarmony = (objects: CanvasObject[]) => {
  const suggestions: string[] = []
  let confidence = 0

  // Extract colors from objects
  const colors = objects
    .map(obj => obj.fill)
    .filter(color => color && color !== 'transparent')

  // Analyze color scheme
  const { harmony, score } = analyzeColorScheme(colors)
  if (score < 0.8) {
    suggestions.push(`Consider using a ${harmony} color scheme for better harmony`)
  }

  confidence = score
  return { suggestions, confidence }
}

// Analyze accessibility
const analyzeAccessibility = (objects: CanvasObject[]) => {
  const suggestions: string[] = []
  let confidence = 0

  // Check contrast ratios
  const contrastIssues = checkContrastRatios(objects)
  suggestions.push(...contrastIssues)

  // Check text sizes
  const textIssues = checkTextSizes(objects)
  suggestions.push(...textIssues)

  // Check touch target sizes
  const touchTargetIssues = checkTouchTargets(objects)
  suggestions.push(...touchTargetIssues)

  confidence = calculateAccessibilityScore(contrastIssues, textIssues, touchTargetIssues)
  return { suggestions, confidence }
}

// Calculate overall confidence score
const calculateOverallConfidence = (scores: number[]) => {
  return scores.reduce((acc, score) => acc + score, 0) / scores.length
}

// Advanced collaboration features
interface CollaborationSettings {
  syncMode: 'full' | 'selective'
  syncedLayers: number[]
  syncedObjectTypes: string[]
  syncedUsers: string[]
  autoSync: boolean
  conflictResolution: 'latest' | 'manual'
  changeNotifications: boolean
}

interface CollaborationState {
  settings: CollaborationSettings
  activeUsers: {
    id: string
    name: string
    color: string
    cursor: { x: number; y: number }
    selectedObjects: string[]
    lastActivity: number
  }[]
  pendingChanges: {
    id: string
    userId: string
    type: string
    data: any
    timestamp: number
  }[]
  conflicts: {
    id: string
    objectId: string
    users: string[]
    changes: any[]
    resolved: boolean
  }[]
}

// Initialize collaboration state
const [collaborationState, setCollaborationState] = useState<CollaborationState>({
  settings: {
    syncMode: 'full',
    syncedLayers: [],
    syncedObjectTypes: [],
    syncedUsers: [],
    autoSync: true,
    conflictResolution: 'latest',
    changeNotifications: true
  },
  activeUsers: [],
  pendingChanges: [],
  conflicts: []
})

// Enhanced real-time collaboration
useEffect(() => {
  if (!state.isCollaborating) return

  const channel = supabase.channel(`canvas:${projectId}`)

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      updateActiveUsers(presenceState)
    })
    .on('broadcast', { event: 'canvas-update' }, ({ payload }) => {
      handleCollaborationUpdate(payload)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: currentUser.id,
          name: currentUser.name,
          color: currentUser.color,
          cursor: { x: 0, y: 0 },
          selectedObjects: [],
          lastActivity: Date.now()
        })
      }
    })

  return () => {
    channel.unsubscribe()
  }
}, [state.isCollaborating, projectId, currentUser])

// Handle collaboration updates
const handleCollaborationUpdate = (payload: any) => {
  if (payload.userId === currentUser.id) return

  // Check if update should be synced based on settings
  if (!shouldSyncUpdate(payload)) return

  // Handle conflicts
  if (hasConflict(payload)) {
    handleConflict(payload)
    return
  }

  // Apply update
  dispatch(payload.action)

  // Notify if enabled
  if (collaborationState.settings.changeNotifications) {
    notifyChange(payload)
  }
}

// Selective sync helpers
const shouldSyncUpdate = (payload: any) => {
  const { settings } = collaborationState

  if (settings.syncMode === 'full') return true

  // Check layer sync
  if (settings.syncedLayers.length > 0) {
    const affectedLayer = getAffectedLayer(payload)
    if (!settings.syncedLayers.includes(affectedLayer)) return false
  }

  // Check object type sync
  if (settings.syncedObjectTypes.length > 0) {
    const affectedType = getAffectedObjectType(payload)
    if (!settings.syncedObjectTypes.includes(affectedType)) return false
  }

  // Check user sync
  if (settings.syncedUsers.length > 0) {
    if (!settings.syncedUsers.includes(payload.userId)) return false
  }

  return true
}

// Conflict management
const hasConflict = (payload: any) => {
  const { objects, selectedObjects } = state
  const affectedObject = payload.action.id && objects[payload.action.id]

  if (!affectedObject) return false

  // Check for simultaneous edits
  const isBeingEdited = selectedObjects.includes(payload.action.id)
  const hasRecentLocalChanges = hasLocalChangesInLastSecond(payload.action.id)

  return isBeingEdited || hasRecentLocalChanges
}

const handleConflict = (payload: any) => {
  const { settings } = collaborationState

  if (settings.conflictResolution === 'latest') {
    // Apply latest change
    dispatch(payload.action)
    return
  }

  // Add to conflicts for manual resolution
  setCollaborationState(prev => ({
    ...prev,
    conflicts: [
      ...prev.conflicts,
      {
        id: nanoid(),
        objectId: payload.action.id,
        users: [payload.userId, currentUser.id],
        changes: [payload.action],
        resolved: false
      }
    ]
  }))
}

// Activity tracking
const updateCursorPosition = (e: React.MouseEvent) => {
  if (!state.isCollaborating) return

  const channel = supabase.channel(`canvas:${projectId}`)
  const cursor = getCanvasPoint(e)

  channel.track({
    user_id: currentUser.id,
    cursor,
    lastActivity: Date.now()
  })
}

// Collaboration UI components
const CollaborationPanel = () => {
  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Collaboration Settings</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Sync Mode</label>
        <Select
          value={collaborationState.settings.syncMode}
          onValueChange={value => updateCollaborationSettings({ syncMode: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose sync mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Sync</SelectItem>
            <SelectItem value="selective">Selective Sync</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {collaborationState.settings.syncMode === 'selective' && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Synced Layers</label>
            <MultiSelect
              values={collaborationState.settings.syncedLayers}
              options={getAvailableLayers()}
              onChange={layers => updateCollaborationSettings({ syncedLayers: layers })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Synced Object Types</label>
            <MultiSelect
              values={collaborationState.settings.syncedObjectTypes}
              options={getAvailableObjectTypes()}
              onChange={types => updateCollaborationSettings({ syncedObjectTypes: types })}
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Active Users</label>
        <div className="space-y-1">
          {collaborationState.activeUsers.map(user => (
            <div key={user.id} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm">{user.name}</span>
              <span className="text-xs text-gray-500">
                {getActivityStatus(user.lastActivity)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {collaborationState.conflicts.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Conflicts</label>
          <div className="space-y-1">
            {collaborationState.conflicts.map(conflict => (
              <div key={conflict.id} className="p-2 border rounded">
                <p className="text-sm">
                  Conflict on object {conflict.objectId} between{' '}
                  {conflict.users.join(' and ')}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(conflict.id, 'keep-local')}
                  >
                    Keep Local
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => resolveConflict(conflict.id, 'keep-remote')}
                  >
                    Keep Remote
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Industry-specific tool sets
interface IndustryTools {
  id: string
  name: string
  description: string
  tools: Tool[]
  presets: Preset[]
  shortcuts: Shortcut[]
  aiFeatures: AIFeature[]
}

interface Tool {
  id: string
  name: string
  icon: any
  description: string
  shortcut?: string
  settings?: any
}

interface Preset {
  id: string
  name: string
  thumbnail: string
  settings: any
}

interface Shortcut {
  id: string
  name: string
  keys: string[]
  action: () => void
}

interface AIFeature {
  id: string
  name: string
  description: string
  trigger: () => void
}

const industryTools: Record<string, IndustryTools> = {
  photography: {
    id: 'photography',
    name: 'Photography',
    description: 'Professional photography tools and effects',
    tools: [
      {
        id: 'crop-ratio',
        name: 'Crop Ratio',
        icon: CropIcon,
        description: 'Crop with common photography ratios',
        settings: {
          ratios: ['1:1', '4:3', '16:9', '3:2']
        }
      },
      {
        id: 'exposure',
        name: 'Exposure',
        icon: SunIcon,
        description: 'Adjust image exposure and lighting',
        settings: {
          exposure: { min: -2, max: 2 },
          contrast: { min: -100, max: 100 },
          highlights: { min: -100, max: 100 },
          shadows: { min: -100, max: 100 }
        }
      },
      {
        id: 'color-grade',
        name: 'Color Grade',
        icon: PaletteIcon,
        description: 'Professional color grading tools',
        settings: {
          temperature: { min: -100, max: 100 },
          tint: { min: -100, max: 100 },
          vibrance: { min: -100, max: 100 },
          saturation: { min: -100, max: 100 }
        }
      }
    ],
    presets: [
      {
        id: 'portrait',
        name: 'Portrait',
        thumbnail: '/presets/portrait.jpg',
        settings: {
          exposure: 0.1,
          contrast: 10,
          highlights: -20,
          shadows: 10,
          temperature: 5,
          tint: -5
        }
      },
      {
        id: 'landscape',
        name: 'Landscape',
        thumbnail: '/presets/landscape.jpg',
        settings: {
          exposure: 0,
          contrast: 15,
          highlights: -30,
          shadows: 20,
          temperature: -5,
          tint: 0
        }
      }
    ],
    shortcuts: [
      {
        id: 'exposure-up',
        name: 'Increase Exposure',
        keys: ['Shift', 'Up'],
        action: () => {}
      },
      {
        id: 'exposure-down',
        name: 'Decrease Exposure',
        keys: ['Shift', 'Down'],
        action: () => {}
      }
    ],
    aiFeatures: [
      {
        id: 'auto-enhance',
        name: 'Auto Enhance',
        description: 'AI-powered image enhancement',
        trigger: () => {}
      },
      {
        id: 'style-transfer',
        name: 'Style Transfer',
        description: 'Apply AI-generated artistic styles',
        trigger: () => {}
      }
    ]
  },
  graphicDesign: {
    id: 'graphicDesign',
    name: 'Graphic Design',
    description: 'Professional design and branding tools',
    tools: [
      {
        id: 'vector-pen',
        name: 'Vector Pen',
        icon: PenIcon,
        description: 'Create precise vector paths',
        settings: {
          smoothing: { min: 0, max: 100 },
          snapToGrid: true
        }
      },
      {
        id: 'typography',
        name: 'Typography',
        icon: TypeIcon,
        description: 'Advanced typography controls',
        settings: {
          fontMetrics: true,
          openType: true,
          kerning: true
        }
      },
      {
        id: 'color-picker',
        name: 'Color Picker',
        icon: EyeDropperIcon,
        description: 'Advanced color selection tools',
        settings: {
          formats: ['hex', 'rgb', 'hsl', 'cmyk'],
          palettes: true
        }
      }
    ],
    presets: [
      {
        id: 'brand-colors',
        name: 'Brand Colors',
        thumbnail: '/presets/brand-colors.jpg',
        settings: {
          primary: '#2563eb',
          secondary: '#1d4ed8',
          accent: '#f59e0b'
        }
      },
      {
        id: 'typography-scale',
        name: 'Typography Scale',
        thumbnail: '/presets/typography.jpg',
        settings: {
          baseSize: 16,
          scaleRatio: 1.25
        }
      }
    ],
    shortcuts: [
      {
        id: 'align-center',
        name: 'Align Center',
        keys: ['Alt', 'C'],
        action: () => {}
      },
      {
        id: 'distribute',
        name: 'Distribute',
        keys: ['Alt', 'D'],
        action: () => {}
      }
    ],
    aiFeatures: [
      {
        id: 'color-harmony',
        name: 'Color Harmony',
        description: 'AI-powered color scheme suggestions',
        trigger: () => {}
      },
      {
        id: 'layout-assistant',
        name: 'Layout Assistant',
        description: 'AI-powered layout optimization',
        trigger: () => {}
      }
    ]
  },
  webDevelopment: {
    id: 'webDevelopment',
    name: 'Web Development',
    description: 'Web design and prototyping tools',
    tools: [
      {
        id: 'responsive-grid',
        name: 'Responsive Grid',
        icon: GridIcon,
        description: 'Create responsive layouts',
        settings: {
          columns: 12,
          gutters: 16,
          breakpoints: ['sm', 'md', 'lg']
        }
      },
      {
        id: 'component-library',
        name: 'Component Library',
        icon: CubeIcon,
        description: 'Reusable component management',
        settings: {
          categories: ['layout', 'navigation', 'forms'],
          variants: true
        }
      },
      {
        id: 'interaction',
        name: 'Interaction',
        icon: GestureIcon,
        description: 'Add interactive behaviors',
        settings: {
          triggers: ['hover', 'click', 'scroll'],
          animations: true
        }
      }
    ],
    presets: [
      {
        id: 'responsive-layout',
        name: 'Responsive Layout',
        thumbnail: '/presets/responsive.jpg',
        settings: {
          grid: true,
          breakpoints: true
        }
      },
      {
        id: 'component-set',
        name: 'Component Set',
        thumbnail: '/presets/components.jpg',
        settings: {
          buttons: true,
          cards: true,
          forms: true
        }
      }
    ],
    shortcuts: [
      {
        id: 'preview',
        name: 'Toggle Preview',
        keys: ['Ctrl', 'P'],
        action: () => {}
      },
      {
        id: 'responsive',
        name: 'Toggle Responsive',
        keys: ['Ctrl', 'R'],
        action: () => {}
      }
    ],
    aiFeatures: [
      {
        id: 'code-generation',
        name: 'Code Generation',
        description: 'Generate clean, semantic code',
        trigger: () => {}
      },
      {
        id: 'accessibility',
        name: 'Accessibility Check',
        description: 'AI-powered accessibility analysis',
        trigger: () => {}
      }
    ]
  }
}

// Industry-specific tool panel
const IndustryToolPanel = ({ industry }: { industry: string }) => {
  const tools = industryTools[industry]
  if (!tools) return null

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tools.name}</h3>
        <p className="text-sm text-gray-500">{tools.description}</p>
      </div>

      <div className="space-y-4">
        {/* Tools */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tools</h4>
          <div className="grid grid-cols-2 gap-2">
            {tools.tools.map(tool => (
              <Button
                key={tool.id}
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleToolSelect(tool)}
              >
                <tool.icon className="h-4 w-4 mr-2" />
                {tool.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Presets</h4>
          <div className="grid grid-cols-2 gap-2">
            {tools.presets.map(preset => (
              <Button
                key={preset.id}
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handlePresetSelect(preset)}
              >
                <img
                  src={preset.thumbnail}
                  alt={preset.name}
                  className="w-full h-20 object-cover rounded mb-1"
                />
                <span className="text-xs">{preset.name}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* AI Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">AI Features</h4>
          <div className="grid grid-cols-2 gap-2">
            {tools.aiFeatures.map(feature => (
              <Button
                key={feature.id}
                size="sm"
                variant="outline"
                className="w-full text-left"
                onClick={feature.trigger}
              >
                <div>
                  <div className="font-medium">{feature.name}</div>
                  <div className="text-xs text-gray-500">{feature.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Shortcuts</h4>
          <div className="space-y-1">
            {tools.shortcuts.map(shortcut => (
              <div
                key={shortcut.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{shortcut.name}</span>
                <div className="flex gap-1">
                  {shortcut.keys.map(key => (
                    <kbd
                      key={key}
                      className="px-2 py-1 text-xs bg-gray-100 rounded"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AIEnhancedCanvasCollaboration({
  projectId,
  currentUser,
  onSave,
  onShare,
  className = ''
}: AIEnhancedCanvasCollaborationProps) {
  const [state, dispatch] = useReducer(canvasReducer, initialState)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null)
  const supabase = useSupabaseClient()
  const user = useUser()
  const [showStylePanel, setShowStylePanel] = useState(false)
  const [showLayoutPanel, setShowLayoutPanel] = useState(false)
  const [optimizationProgress, setOptimizationProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('tools')
  const [selectedFilter, setSelectedFilter] = useState<Partial<ImageFilters>>({})
  const [selectedEffect, setSelectedEffect] = useState<Partial<LayerEffects>>({})
  const [selectedTemplate, setSelectedTemplate] = useState('')

  // Canvas rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom and pan
    ctx.save()
    ctx.translate(state.panX, state.panY)
    ctx.scale(state.zoom, state.zoom)

    // Draw grid if enabled and zoomed out enough
    if (state.showGrid && state.zoom < 3) {
      drawGrid(ctx, canvas, state)
    }

    // Group objects by layer for efficient rendering
    const layeredObjects = Object.values(state.objects).reduce((acc, obj) => {
      const layer = obj.layer || 0
      if (!acc[layer]) acc[layer] = []
      acc[layer].push(obj)
      return acc
    }, {} as Record<number, CanvasObject[]>)

    // Get visible viewport bounds
    const viewport = {
      left: -state.panX / state.zoom,
      top: -state.panY / state.zoom,
      right: (canvas.width - state.panX) / state.zoom,
      bottom: (canvas.height - state.panY) / state.zoom,
    }

    // Render objects layer by layer with culling
    Object.keys(layeredObjects)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(layer => {
        const objects = layeredObjects[Number(layer)]
        objects.forEach(obj => {
          // Skip if object is not visible or outside viewport
          if (!obj.visible || !isObjectInViewport(obj, viewport)) return
          
          // Use object-specific optimized rendering
          renderObject(ctx, obj, state.zoom)
        })
      })

    // Draw comments if enabled (always on top)
    if (state.showComments) {
      renderComments(ctx, state.comments, state.zoom)
    }

    ctx.restore()
  }, [state])

  // Viewport culling helper
  const isObjectInViewport = (obj: CanvasObject, viewport: any) => {
    const margin = 100 // Add margin for rotated objects
    return (
      obj.x - margin < viewport.right &&
      obj.x + obj.width + margin > viewport.left &&
      obj.y - margin < viewport.bottom &&
      obj.y + obj.height + margin > viewport.top
    )
  }

  // Optimized object rendering
  const renderObject = (ctx: CanvasRenderingContext2D, obj: CanvasObject, zoom: number) => {
    ctx.save()
    ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2)
    ctx.rotate(obj.rotation * Math.PI / 180)
    ctx.translate(-(obj.x + obj.width / 2), -(obj.y + obj.height / 2))
    ctx.globalAlpha = obj.opacity

    // Use cached version for complex objects when zoomed out
    if (obj.complexity === 'high' && zoom < 0.5 && obj.cachedVersion) {
      ctx.drawImage(obj.cachedVersion, obj.x, obj.y, obj.width, obj.height)
      ctx.restore()
      return
    }

    switch (obj.type) {
      case 'rectangle':
        ctx.fillStyle = obj.fill
        ctx.strokeStyle = obj.stroke
        ctx.lineWidth = obj.strokeWidth
        if (obj.fill) ctx.fillRect(obj.x, obj.y, obj.width, obj.height)
        if (obj.stroke) ctx.strokeRect(obj.x, obj.y, obj.width, obj.height)
        break

      case 'circle':
        ctx.beginPath()
        ctx.fillStyle = obj.fill
        ctx.strokeStyle = obj.stroke
        ctx.lineWidth = obj.strokeWidth
        ctx.arc(
          obj.x + obj.width / 2,
          obj.y + obj.height / 2,
          Math.min(obj.width, obj.height) / 2,
          0,
          2 * Math.PI
        )
        if (obj.fill) ctx.fill()
        if (obj.stroke) ctx.stroke()
        break

      case 'text':
        if (obj.text && obj.fontSize) {
          ctx.font = `${obj.fontSize}px ${obj.fontFamily || 'Arial'}`
          ctx.fillStyle = obj.fill
          ctx.fillText(obj.text, obj.x, obj.y + obj.fontSize)
        }
        break
    }

    ctx.restore()
  }

  // Optimized grid rendering
  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, state: any) => {
    ctx.beginPath()
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1 / state.zoom

    const gridSize = state.gridSize
    const startX = Math.floor(-state.panX / state.zoom / gridSize) * gridSize
    const startY = Math.floor(-state.panY / state.zoom / gridSize) * gridSize
    const endX = Math.ceil((canvas.width - state.panX) / state.zoom / gridSize) * gridSize
    const endY = Math.ceil((canvas.height - state.panY) / state.zoom / gridSize) * gridSize

    for (let x = startX; x <= endX; x += gridSize) {
      ctx.moveTo(x, startY)
      ctx.lineTo(x, endY)
    }
    for (let y = startY; y <= endY; y += gridSize) {
      ctx.moveTo(startX, y)
      ctx.lineTo(endX, y)
    }
    ctx.stroke()
  }

  // Canvas event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true)
    const point = getCanvasPoint(e)
    setLastPoint(point)

    if (state.isAddingComment) {
      dispatch({
        type: 'ADD_COMMENT',
        comment: {
          id: nanoid(),
          x: point.x,
          y: point.y,
          text: '',
          author: user?.email || 'Anonymous',
          timestamp: Date.now(),
          resolved: false,
          replies: [],
          attachments: []
        }
      })
      dispatch({ type: 'SET_ADDING_COMMENT', isAdding: false })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return
    const point = getCanvasPoint(e)

    if (state.activeTool === 'select' && lastPoint) {
      const dx = point.x - lastPoint.x
      const dy = point.y - lastPoint.y
      state.selectedObjects.forEach(id => {
        const obj = state.objects.find(obj => obj.id === id)
        if (obj) {
          dispatch({
            type: 'UPDATE_OBJECT',
            id,
            updates: {
              x: obj.x + dx,
              y: obj.y + dy
            }
          })
        }
      })
    }

    setLastPoint(point)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  // Utility functions
  const getCanvasPoint = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - state.panX) / state.zoom,
      y: (e.clientY - rect.top - state.panY) / state.zoom
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50'
    if (confidence >= 0.6) return '#FFC107'
    return '#F44336'
  }

  const handleStyleSuggestion = useCallback(async (objectId: string) => {
    try {
      // Here we would call an AI service to get style suggestions
      const aiStyle: AIStyleSuggestion = {
        colorPalette: {
          primary: '#2563eb',
          secondary: ['#1d4ed8', '#3b82f6'],
          accent: ['#f59e0b', '#10b981'],
          neutral: ['#f3f4f6', '#9ca3af', '#4b5563']
        },
        typography: {
          fontFamily: 'Inter',
          fontSize: 16,
          lineHeight: 1.5,
          letterSpacing: 0.5,
          recommendations: [
            'Use larger font size for headers',
            'Increase line height for better readability'
          ],
          pairings: {
            heading: 'Montserrat',
            body: 'Inter',
            accent: 'Playfair Display'
          }
        },
        effects: {
          shadows: ['0 2px 4px rgba(0,0,0,0.1)'],
          gradients: ['linear-gradient(to right, #2563eb, #1d4ed8)'],
          animations: ['fade-in', 'slide-up'],
          textures: ['noise', 'grain', 'paper'],
          overlays: ['soft-light', 'color-burn']
        },
        brandConsistency: {
          score: 0.85,
          improvements: [
            'Align colors with brand guidelines',
            'Maintain consistent font usage'
          ],
          guidelines: {
            colors: ['#2563eb', '#1d4ed8', '#3b82f6'],
            fonts: ['Inter', 'Montserrat'],
            spacing: [4, 8, 16, 24, 32],
            imagery: ['modern', 'clean', 'professional']
          }
        },
        industrySpecific: {
          photography: {
            filters: {
              brightness: 1.1,
              contrast: 1.2,
              saturation: 1.1,
              exposure: 0,
              temperature: 0,
              tint: 0,
              highlights: 0,
              shadows: 0,
              sharpness: 1.1,
              blur: 0,
              noise: 0,
              vibrance: 1.1
            },
            compositions: ['rule-of-thirds', 'golden-ratio'],
            lightingSetups: ['natural', 'studio', 'dramatic']
          },
          graphicDesign: {
            layouts: ['grid', 'asymmetric', 'minimal'],
            patterns: ['geometric', 'organic', 'abstract'],
            iconStyles: ['outlined', 'filled', 'duotone']
          },
          videoEditing: {
            transitions: ['fade', 'slide', 'zoom'],
            effects: ['color-grade', 'blur', 'glow'],
            colorGrades: ['cinematic', 'vibrant', 'muted']
          },
          webDesign: {
            components: ['buttons', 'cards', 'forms'],
            interactions: ['hover', 'click', 'scroll'],
            responsive: ['mobile', 'tablet', 'desktop']
          }
        }
      };

      dispatch({ type: 'APPLY_AI_STYLE', id: objectId, style: aiStyle });
    } catch (error) {
      console.error('Error generating style suggestions:', error);
    }
  }, [dispatch]);

  const handleLayoutOptimization = useCallback(async (objectIds: string[]) => {
    try {
      setOptimizationProgress(0);
      const interval = setInterval(() => {
        setOptimizationProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Here we would call an AI service to get layout optimization
      const aiLayout: AILayoutOptimization = {
        gridAlignment: {
          score: 0.92,
          suggestions: [
            'Align elements to 8px grid',
            'Maintain consistent spacing'
          ]
        },
        spacing: {
          score: 0.88,
          recommendations: [
            'Increase padding between elements',
            'Use consistent margins'
          ]
        },
        hierarchy: {
          score: 0.85,
          improvements: [
            'Emphasize primary actions',
            'Group related elements'
          ]
        },
        composition: {
          balance: 0.9,
          flow: 'left-to-right',
          suggestions: [
            'Improve visual weight distribution',
            'Create clear reading path'
          ]
        },
        accessibility: {
          contrast: 0.95,
          readability: 0.87,
          improvements: [
            'Increase text contrast',
            'Enlarge touch targets'
          ]
        },
        responsiveness: {
          breakpoints: ['sm', 'md', 'lg'],
          adaptations: [
            'Stack elements on mobile',
            'Adjust spacing for tablets'
          ]
        }
      };

      dispatch({ type: 'OPTIMIZE_LAYOUT', objects: objectIds, optimization: aiLayout });
      clearInterval(interval);
      setOptimizationProgress(100);
      
      setTimeout(() => {
        setOptimizationProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Error optimizing layout:', error);
      setOptimizationProgress(0);
    }
  }, [dispatch]);

  // Professional templates by category
  const templates = {
    photography: [
      { id: 'photo-1', name: 'Portfolio Layout', thumbnail: '/templates/photo-portfolio.jpg' },
      { id: 'photo-2', name: 'Wedding Album', thumbnail: '/templates/wedding-album.jpg' },
      { id: 'photo-3', name: 'Product Showcase', thumbnail: '/templates/product-showcase.jpg' }
    ],
    graphicDesign: [
      { id: 'design-1', name: 'Brand Identity Pack', thumbnail: '/templates/brand-pack.jpg' },
      { id: 'design-2', name: 'Social Media Kit', thumbnail: '/templates/social-kit.jpg' },
      { id: 'design-3', name: 'Marketing Materials', thumbnail: '/templates/marketing.jpg' }
    ],
    videoProduction: [
      { id: 'video-1', name: 'Intro Sequence', thumbnail: '/templates/video-intro.jpg' },
      { id: 'video-2', name: 'Lower Thirds', thumbnail: '/templates/lower-thirds.jpg' },
      { id: 'video-3', name: 'End Credits', thumbnail: '/templates/end-credits.jpg' }
    ]
  }

  // Professional tools by category
  const tools = {
    basic: [
      { id: 'select', icon: MousePointer, label: 'Select' },
      { id: 'rectangle', icon: Square, label: 'Rectangle' },
      { id: 'circle', icon: Circle, label: 'Circle' },
      { id: 'text', icon: Type, label: 'Text' }
    ],
    image: [
      { id: 'crop', icon: Crop, label: 'Crop' },
      { id: 'filter', icon: Filter, label: 'Filter' },
      { id: 'adjust', icon: SlidersHorizontal, label: 'Adjust' },
      { id: 'mask', icon: Scissors, label: 'Mask' }
    ],
    advanced: [
      { id: 'brush', icon: Brush, label: 'Brush' },
      { id: 'pen', icon: Spline, label: 'Pen' },
      { id: 'eraser', icon: Eraser, label: 'Eraser' },
      { id: 'eyedropper', icon: Pipette, label: 'Color Picker' }
    ]
  }

  // Professional filters
  const filters = {
    presets: [
      { id: 'natural', name: 'Natural', values: { contrast: 1.1, saturation: 1.1 } },
      { id: 'vibrant', name: 'Vibrant', values: { contrast: 1.2, saturation: 1.3 } },
      { id: 'moody', name: 'Moody', values: { contrast: 1.3, temperature: 0.9 } }
    ],
    adjustments: [
      { id: 'exposure', name: 'Exposure', min: -100, max: 100 },
      { id: 'contrast', name: 'Contrast', min: -100, max: 100 },
      { id: 'saturation', name: 'Saturation', min: -100, max: 100 }
    ]
  }

  // Handle template selection
  const handleTemplateSelect = async (templateId: string) => {
    setSelectedTemplate(templateId)
    // Load template content and apply to canvas
    const template = Object.values(templates)
      .flat()
      .find(t => t.id === templateId)
    
    if (template) {
      const templateObjs = await fetchTemplateObjects(templateId)
      templateObjs.forEach(obj => {
        dispatch({ type: 'ADD_OBJECT', object: { ...obj, id: nanoid() } })
      })
    }
  }

  // Handle filter application
  const handleFilterChange = (filterId: string, value: number) => {
    const newFilters = { ...selectedFilter, [filterId]: value }
    setSelectedFilter(newFilters)
    
    state.selectedObjects.forEach(id => {
      dispatch({
        type: 'UPDATE_OBJECT',
        id,
        updates: { filters: newFilters }
      })
    })
  }

  // Handle effect application
  const handleEffectChange = (effect: Partial<LayerEffects>) => {
    setSelectedEffect(effect)
    
    state.selectedObjects.forEach(id => {
      dispatch({
        type: 'UPDATE_OBJECT',
        id,
        updates: { effects: effect }
      })
    })
  }

  // Update comment handling
  const handleAddComment = (point: { x: number; y: number }) => {
    const newComment: UPFComment = {
      id: nanoid(),
      userId: currentUser.id,
      userName: currentUser.name || '',
      userAvatar: currentUser.avatar || '',
      content: '',
      type: 'canvas',
      position: point,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      replies: [],
      reactions: []
    }
    
    dispatch({ type: 'ADD_COMMENT', comment: newComment })
  }

  // Render component
  return (
    <div className="flex h-full">
      <div className="w-64 bg-background border-r p-4 space-y-4">
        <Tabs defaultValue="tools" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
          </TabsList>

          <TabsContent value="tools" className="space-y-4">
            {Object.entries(tools).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(tool => (
                    <Button
                      key={tool.id}
                      size="sm"
                      variant={state.activeTool === tool.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => dispatch({ type: 'SET_TOOL', tool: tool.id })}
                    >
                      <tool.icon className="h-4 w-4 mr-2" />
                      {tool.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {Object.entries(templates).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <h3 className="text-sm font-medium capitalize">{category}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {items.map(template => (
                    <Button
                      key={template.id}
                      size="sm"
                      variant={selectedTemplate === template.id ? 'default' : 'outline'}
                      className="w-full justify-start"
                      onClick={() => handleTemplateSelect(template.id)}
                    >
                      <img 
                        src={template.thumbnail} 
                        alt={template.name}
                        className="w-full h-20 object-cover rounded mb-1"
                      />
                      <span className="text-xs">{template.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Presets</h3>
                <Select onValueChange={preset => {
                  const values = filters.presets.find(p => p.id === preset)?.values
                  if (values) setSelectedFilter(values)
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose preset" />
                  </SelectTrigger>
                  <SelectContent>
                    {filters.presets.map(preset => (
                      <SelectItem key={preset.id} value={preset.id}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Adjustments</h3>
                {filters.adjustments.map(adj => (
                  <div key={adj.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{adj.name}</span>
                      <span>{selectedFilter[adj.id as keyof ImageFilters] || 0}</span>
                    </div>
                    <Slider
                      min={adj.min}
                      max={adj.max}
                      step={1}
                      value={[selectedFilter[adj.id as keyof ImageFilters] || 0]}
                      onValueChange={([value]) => handleFilterChange(adj.id, value)}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Effects</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEffectChange({
                      shadow: { color: '#000000', blur: 10, spread: 0, distance: 5, angle: 45 }
                    })}
                  >
                    Drop Shadow
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEffectChange({
                      glow: { color: '#ffffff', blur: 20, spread: 0, intensity: 1 }
                    })}
                  >
                    Outer Glow
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex-1">
        <div className="relative w-full h-full">
          <Card className="flex-grow">
            <CardHeader>
              <CardTitle>AI-Enhanced Canvas Collaboration</CardTitle>
              <CardDescription>
                Real-time collaborative canvas with AI-powered suggestions and UPF integration
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 relative">
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant={state.activeTool === 'select' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: 'select' })}
                >
                  <MousePointer className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.activeTool === 'rectangle' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: 'rectangle' })}
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.activeTool === 'circle' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: 'circle' })}
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.activeTool === 'text' ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'SET_TOOL', tool: 'text' })}
                >
                  <Type className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => dispatch({ type: 'UNDO' })}
                  disabled={state.undoStack.length === 0}
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => dispatch({ type: 'REDO' })}
                  disabled={state.redoStack.length === 0}
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.isCollaborating ? 'default' : 'outline'}
                  onClick={() => {
                    dispatch({ type: 'SET_COLLABORATING', isCollaborating: !state.isCollaborating })
                  }}
                >
                  <Users className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.showComments ? 'default' : 'outline'}
                  onClick={() => dispatch({ type: 'TOGGLE_COMMENTS' })}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant={state.aiAnalysisEnabled ? 'default' : 'outline'}
                  onClick={() => {
                    dispatch({ type: 'TOGGLE_AI_ANALYSIS' })
                    if (!state.aiAnalysisEnabled) {
                      analyzeCanvas()
                    }
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </div>

              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              {state.selectedObjects.length > 0 && (
                <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      state.selectedObjects.forEach(id => {
                        dispatch({
                          type: 'UPDATE_OBJECT',
                          id,
                          updates: { locked: !state.objects.find(obj => obj.id === id)?.locked }
                        })
                      })
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Toggle Lock
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      state.selectedObjects.forEach(id => {
                        const obj = state.objects.find(o => o.id === id)
                        if (obj) {
                          const newObj: CanvasObject = {
                            ...obj,
                            id: nanoid(),
                            x: obj.x + 20,
                            y: obj.y + 20,
                            layer: Math.max(0, ...state.objects.map(o => o.layer)) + 1
                          }
                          dispatch({
                            type: 'ADD_OBJECT',
                            object: newObj
                          })
                        }
                      })
                    }}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => dispatch({ type: 'DELETE_OBJECTS', ids: state.selectedObjects })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Style Panel */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="ml-2"
                disabled={state.selectedObjects.length === 0}
              >
                AI Style
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">AI Style Suggestions</h3>
                {state.selectedObjects.map(id => {
                  const object = state.objects.find(obj => obj.id === id)
                  return (
                    <div key={id} className="space-y-2">
                      <h4 className="font-medium">{object?.type}</h4>
                      {object?.aiStyle && (
                        <>
                          <div className="flex items-center justify-between">
                            <span>Brand Consistency</span>
                            <span className="text-sm">{object.aiStyle.brandConsistency.score * 100}%</span>
                          </div>
                          <div className="space-y-1">
                            {object.aiStyle.brandConsistency.improvements.map((improvement, i) => (
                              <p key={i} className="text-sm text-gray-600">{improvement}</p>
                            ))}
                          </div>
                        </>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleStyleSuggestion(id)}
                      >
                        Generate Suggestions
                      </Button>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {/* AI Layout Panel */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="ml-2"
                disabled={state.selectedObjects.length === 0}
              >
                AI Layout
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold">Layout Optimization</h3>
                {optimizationProgress > 0 && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-200"
                        style={{ width: `${optimizationProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Optimizing layout... {optimizationProgress}%
                    </p>
                  </div>
                )}
                {state.selectedObjects.length > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleAIAnalysis(state.selectedObjects)}
                    disabled={optimizationProgress > 0}
                  >
                    Optimize Selected Elements
                  </Button>
                )}
                {state.selectedObjects.some(id => state.objects.find(obj => obj.id === id)?.aiLayout) && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Optimization Results</h4>
                    <div className="space-y-1">
                      {Object.entries(state.objects.find(obj => obj.id === state.selectedObjects[0])?.aiLayout?.gridAlignment || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="capitalize">{key}</span>
                          <span className="text-sm">
                            {typeof value === 'number' ? `${value * 100}%` : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Properties panel */}
      <div className="w-64 bg-background border-l p-4 space-y-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Properties</h3>
          
          {state.selectedObjects.length > 0 && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-medium">Position</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs">X</label>
                    <input
                      type="number"
                      className="w-full"
                      value={state.objects[state.selectedObjects[0]]?.x || 0}
                      onChange={e => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { x: Number(e.target.value) }
                          })
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Y</label>
                    <input
                      type="number"
                      className="w-full"
                      value={state.objects[state.selectedObjects[0]]?.y || 0}
                      onChange={e => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { y: Number(e.target.value) }
                          })
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium">Size</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs">Width</label>
                    <input
                      type="number"
                      className="w-full"
                      value={state.objects[state.selectedObjects[0]]?.width || 0}
                      onChange={e => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { width: Number(e.target.value) }
                          })
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Height</label>
                    <input
                      type="number"
                      className="w-full"
                      value={state.objects[state.selectedObjects[0]]?.height || 0}
                      onChange={e => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { height: Number(e.target.value) }
                          })
                        })
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium">Style</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs">Opacity</label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[state.objects[state.selectedObjects[0]]?.opacity * 100 || 100]}
                      onValueChange={([value]) => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { opacity: value / 100 }
                          })
                        })
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs">Blend Mode</label>
                    <Select
                      value={state.objects[state.selectedObjects[0]]?.blendMode || 'normal'}
                      onValueChange={value => {
                        state.selectedObjects.forEach(id => {
                          dispatch({
                            type: 'UPDATE_OBJECT',
                            id,
                            updates: { blendMode: value as BlendMode }
                          })
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="multiply">Multiply</SelectItem>
                        <SelectItem value="screen">Screen</SelectItem>
                        <SelectItem value="overlay">Overlay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 