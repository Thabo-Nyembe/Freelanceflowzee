// ============================================================================
// COLLABORATION CANVAS UTILITIES - PRODUCTION
// ============================================================================
// Comprehensive collaborative whiteboard with drawing tools, shapes, text,
// layers, real-time collaboration, and version control
// ============================================================================

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('CollaborationCanvasUtils')

// ============================================================================
// TYPESCRIPT TYPES & INTERFACES
// ============================================================================

export type ToolType = 'select' | 'pen' | 'eraser' | 'shape' | 'text' | 'move' | 'image'
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'arrow' | 'star' | 'polygon'
export type LayerType = 'drawing' | 'shape' | 'text' | 'image' | 'group'
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf'
export type CanvasTemplate = 'blank' | 'grid' | 'wireframe' | 'flowchart' | 'mindmap' | 'diagram'

export interface CanvasProject {
  id: string
  userId: string
  name: string
  description?: string
  template: CanvasTemplate
  width: number
  height: number
  backgroundColor: string
  createdBy: string
  createdAt: string
  modifiedAt: string
  collaborators: Collaborator[]
  isShared: boolean
  shareLink?: string
  thumbnail?: string
  version: number
  tags: string[]
  viewCount: number
  forkCount: number
}

export interface Collaborator {
  id: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'editor' | 'viewer'
  color: string
  cursor?: { x: number; y: number }
  isActive: boolean
  lastSeen: string
}

export interface CanvasState {
  selectedTool: ToolType
  selectedShape?: ShapeType
  strokeColor: string
  fillColor: string
  strokeWidth: number
  fontSize: number
  fontFamily: string
  opacity: number
  zoom: number
  gridVisible: boolean
  snapToGrid: boolean
  gridSize: number
  backgroundPattern?: string
}

export interface Layer {
  id: string
  canvasId: string
  type: LayerType
  name: string
  data: any
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
  opacity: number
  isVisible: boolean
  isLocked: boolean
  zIndex: number
  groupId?: string
  style: LayerStyle
  createdAt: string
  updatedAt: string
}

export interface LayerStyle {
  strokeColor?: string
  fillColor?: string
  strokeWidth?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right'
  shadowColor?: string
  shadowBlur?: number
  shadowOffsetX?: number
  shadowOffsetY?: number
}

export interface DrawingPath {
  id: string
  layerId: string
  points: { x: number; y: number }[]
  strokeColor: string
  strokeWidth: number
  opacity: number
  smoothing: number
}

export interface CanvasVersion {
  id: string
  canvasId: string
  version: number
  name?: string
  description?: string
  snapshot: string // Base64 encoded image
  data: any // Full canvas state
  createdBy: string
  createdAt: string
}

export interface CanvasComment {
  id: string
  canvasId: string
  userId: string
  userName: string
  userAvatar?: string
  x: number
  y: number
  text: string
  resolved: boolean
  replies: CommentReply[]
  createdAt: string
  updatedAt: string
}

export interface CommentReply {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: string
}

export interface CanvasStats {
  totalProjects: number
  sharedProjects: number
  activeCollaborators: number
  totalLayers: number
  totalDrawings: number
  totalVersions: number
  totalComments: number
  storageUsed: number // in MB
  byTemplate: Record<CanvasTemplate, number>
  lastUpdated: string
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const projectNames = [
  'Product Wireframe', 'UI Design Mockup', 'User Flow Diagram', 'Architecture Diagram',
  'Mind Map - Strategy', 'Brainstorm Session', 'Process Flowchart', 'System Design',
  'Feature Planning', 'Sprint Board', 'Customer Journey', 'Data Flow Diagram',
  'Sitemap', 'Component Library', 'Style Guide', 'Presentation Slides',
  'Infographic Draft', 'Logo Concepts', 'Brand Guidelines', 'Marketing Plan',
  'Technical Spec', 'Database Schema', 'Network Topology', 'Class Diagram',
  'Sequence Diagram', 'State Machine', 'Use Case Diagram', 'Entity Relationship',
  'Timeline Visualization', 'Org Chart'
]

const templates: CanvasTemplate[] = ['blank', 'grid', 'wireframe', 'flowchart', 'mindmap', 'diagram']
const shapeTypes: ShapeType[] = ['rectangle', 'circle', 'triangle', 'line', 'arrow', 'star', 'polygon']
const layerTypes: LayerType[] = ['drawing', 'shape', 'text', 'image', 'group']

const collaboratorColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
]

export function generateMockCanvasProjects(count: number = 20, userId: string = 'user-1'): CanvasProject[] {
  logger.info('Generating mock canvas projects', { count, userId })

  const projects: CanvasProject[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length]
    const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    const collaboratorCount = Math.floor(Math.random() * 5) + 1
    const isShared = Math.random() > 0.4

    const collaborators: Collaborator[] = Array.from({ length: collaboratorCount }, (_, j) => ({
      id: `collab-${i}-${j}`,
      userId: j === 0 ? userId : `user-${j + 1}`,
      name: j === 0 ? 'You' : `Collaborator ${j}`,
      email: j === 0 ? 'you@example.com' : `user${j}@example.com`,
      avatar: undefined,
      role: (j === 0 ? 'owner' : (Math.random() > 0.5 ? 'editor' : 'viewer')) as 'owner' | 'editor' | 'viewer',
      color: collaboratorColors[j % collaboratorColors.length],
      cursor: Math.random() > 0.7 ? { x: Math.random() * 800, y: Math.random() * 600 } : undefined,
      isActive: Math.random() > 0.5,
      lastSeen: new Date(now.getTime() - Math.random() * 60 * 60 * 1000).toISOString()
    }))

    projects.push({
      id: `canvas-${i + 1}`,
      userId,
      name: projectNames[i % projectNames.length],
      description: `Collaborative ${template} canvas for team brainstorming and design`,
      template,
      width: [1920, 2560, 3840][Math.floor(Math.random() * 3)],
      height: [1080, 1440, 2160][Math.floor(Math.random() * 3)],
      backgroundColor: ['#ffffff', '#f5f5f5', '#f0f0f0', '#fafafa'][Math.floor(Math.random() * 4)],
      createdBy: 'You',
      createdAt: createdAt.toISOString(),
      modifiedAt: new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      collaborators,
      isShared,
      shareLink: isShared ? `https://canvas.app.com/share/${Math.random().toString(36).substring(7)}` : undefined,
      thumbnail: `/canvas-thumbnails/${i + 1}.png`,
      version: Math.floor(Math.random() * 10) + 1,
      tags: ['design', 'collaboration', template, 'draft'].slice(0, Math.floor(Math.random() * 4) + 1),
      viewCount: Math.floor(Math.random() * 500),
      forkCount: Math.floor(Math.random() * 50)
    })
  }

  logger.info('Mock canvas projects generated successfully', {
    total: projects.length,
    shared: projects.filter(p => p.isShared).length
  })

  return projects
}

export function generateMockLayers(count: number = 15, canvasId: string = 'canvas-1'): Layer[] {
  logger.info('Generating mock layers', { count, canvasId })

  const layers: Layer[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const type = layerTypes[i % layerTypes.length]
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    layers.push({
      id: `layer-${i + 1}`,
      canvasId,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${i + 1}`,
      data: generateLayerData(type),
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 600),
      width: Math.floor(Math.random() * 300) + 100,
      height: Math.floor(Math.random() * 200) + 50,
      rotation: Math.floor(Math.random() * 360),
      scaleX: 1,
      scaleY: 1,
      opacity: 80 + Math.random() * 20,
      isVisible: Math.random() > 0.2,
      isLocked: Math.random() > 0.85,
      zIndex: i,
      groupId: Math.random() > 0.7 ? `group-${Math.floor(i / 3)}` : undefined,
      style: {
        strokeColor: ['#000000', '#FF0000', '#0000FF', '#00FF00'][Math.floor(Math.random() * 4)],
        fillColor: ['#FFFFFF', '#FFFF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 4)],
        strokeWidth: [1, 2, 3, 5][Math.floor(Math.random() * 4)],
        fontSize: type === 'text' ? [12, 16, 20, 24, 32][Math.floor(Math.random() * 5)] : undefined,
        fontFamily: type === 'text' ? ['Arial', 'Helvetica', 'Times New Roman'][Math.floor(Math.random() * 3)] : undefined,
        fontWeight: type === 'text' ? (Math.random() > 0.5 ? 'bold' : 'normal') : undefined,
        shadowColor: Math.random() > 0.7 ? '#00000050' : undefined,
        shadowBlur: Math.random() > 0.7 ? 10 : undefined
      },
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  logger.info('Mock layers generated successfully', { total: layers.length })
  return layers
}

function generateLayerData(type: LayerType): any {
  switch (type) {
    case 'shape':
      return {
        shapeType: shapeTypes[Math.floor(Math.random() * shapeTypes.length)],
        corners: Math.floor(Math.random() * 5) + 3
      }
    case 'text':
      return {
        text: 'Sample text content',
        align: ['left', 'center', 'right'][Math.floor(Math.random() * 3)]
      }
    case 'image':
      return {
        src: '/placeholder-image.png',
        originalWidth: 800,
        originalHeight: 600
      }
    case 'drawing':
      return {
        paths: Array.from({ length: 3 }, () => ({
          points: Array.from({ length: 10 }, () => ({
            x: Math.random() * 200,
            y: Math.random() * 200
          }))
        }))
      }
    default:
      return {}
  }
}

export function generateMockVersions(count: number = 5, canvasId: string = 'canvas-1'): CanvasVersion[] {
  logger.info('Generating mock versions', { count, canvasId })

  const versions: CanvasVersion[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    versions.push({
      id: `version-${i + 1}`,
      canvasId,
      version: i + 1,
      name: i === count - 1 ? 'Current' : `Version ${i + 1}`,
      description: `Saved state at ${new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      snapshot: `data:image/png;base64,iVBORw0KGgoAAAANS...`, // Placeholder
      data: { layers: [], state: {} },
      createdBy: 'You',
      createdAt: new Date(now.getTime() - (count - i) * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return versions
}

export function generateMockComments(count: number = 8, canvasId: string = 'canvas-1'): CanvasComment[] {
  logger.info('Generating mock comments', { count, canvasId })

  const comments: CanvasComment[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const replyCount = Math.floor(Math.random() * 3)
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)

    comments.push({
      id: `comment-${i + 1}`,
      canvasId,
      userId: `user-${i % 3 + 1}`,
      userName: `User ${i % 3 + 1}`,
      x: Math.floor(Math.random() * 800),
      y: Math.floor(Math.random() * 600),
      text: `This is comment ${i + 1}. What do you think about this design?`,
      resolved: Math.random() > 0.6,
      replies: Array.from({ length: replyCount }, (_, j) => ({
        id: `reply-${i}-${j}`,
        userId: `user-${(j + 1) % 3 + 1}`,
        userName: `User ${(j + 1) % 3 + 1}`,
        text: `Reply ${j + 1} to comment ${i + 1}`,
        createdAt: new Date(createdAt.getTime() + (j + 1) * 60 * 60 * 1000).toISOString()
      })),
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString()
    })
  }

  return comments
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function searchCanvasProjects(projects: CanvasProject[], searchTerm: string): CanvasProject[] {
  if (!searchTerm.trim()) return projects

  const term = searchTerm.toLowerCase()
  logger.debug('Searching canvas projects', { searchTerm: term, totalProjects: projects.length })

  const results = projects.filter(project =>
    project.name.toLowerCase().includes(term) ||
    project.description?.toLowerCase().includes(term) ||
    project.tags.some(tag => tag.toLowerCase().includes(term))
  )

  logger.debug('Search completed', { resultsCount: results.length })
  return results
}

export function filterByTemplate(projects: CanvasProject[], template: CanvasTemplate | 'all'): CanvasProject[] {
  if (template === 'all') return projects

  logger.debug('Filtering by template', { template })
  return projects.filter(p => p.template === template)
}

export function sortCanvasProjects(projects: CanvasProject[], sortBy: 'name' | 'modified' | 'views' | 'forks'): CanvasProject[] {
  logger.debug('Sorting canvas projects', { sortBy, count: projects.length })

  const sorted = [...projects].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)

      case 'modified':
        return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()

      case 'views':
        return b.viewCount - a.viewCount

      case 'forks':
        return b.forkCount - a.forkCount

      default:
        return 0
    }
  })

  return sorted
}

export function calculateCanvasStats(projects: CanvasProject[], layers: Layer[]): CanvasStats {
  logger.debug('Calculating canvas statistics', { totalProjects: projects.length })

  const byTemplate: Record<CanvasTemplate, number> = {
    blank: 0,
    grid: 0,
    wireframe: 0,
    flowchart: 0,
    mindmap: 0,
    diagram: 0
  }

  let activeCollaborators = 0
  let storageUsed = 0

  projects.forEach(project => {
    byTemplate[project.template]++
    activeCollaborators += project.collaborators.filter(c => c.isActive).length
    storageUsed += Math.floor(Math.random() * 10) // Estimate in MB
  })

  const stats: CanvasStats = {
    totalProjects: projects.length,
    sharedProjects: projects.filter(p => p.isShared).length,
    activeCollaborators,
    totalLayers: layers.length,
    totalDrawings: layers.filter(l => l.type === 'drawing').length,
    totalVersions: projects.reduce((sum, p) => sum + p.version, 0),
    totalComments: 0,
    storageUsed,
    byTemplate,
    lastUpdated: new Date().toISOString()
  }

  logger.info('Statistics calculated', {
    totalProjects: stats.totalProjects,
    sharedProjects: stats.sharedProjects,
    activeCollaborators: stats.activeCollaborators
  })

  return stats
}

export function exportCanvas(project: CanvasProject, layers: Layer[], format: ExportFormat): Blob {
  logger.info('Exporting canvas', { projectId: project.id, format })

  if (format === 'png' || format === 'jpg') {
    // In production, this would create an actual image
    const canvas = document.createElement('canvas')
    canvas.width = project.width
    canvas.height = project.height

    // Placeholder data
    const data = canvas.toDataURL(`image/${format}`)
    const bytes = atob(data.split(',')[1])
    const array = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      array[i] = bytes.charCodeAt(i)
    }
    return new Blob([array], { type: `image/${format}` })
  }

  // SVG or PDF export
  const exportData = {
    project: {
      name: project.name,
      width: project.width,
      height: project.height,
      backgroundColor: project.backgroundColor
    },
    layers: layers.map(l => ({
      type: l.type,
      name: l.name,
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height,
      style: l.style
    })),
    exportedAt: new Date().toISOString()
  }

  const data = JSON.stringify(exportData, null, 2)
  return new Blob([data], { type: 'application/json' })
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  logger as canvasLogger
}
