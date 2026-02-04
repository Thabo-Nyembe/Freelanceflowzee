/**
 * 🎨 CANVAS COLLABORATION UTILITIES
 * Comprehensive utilities for design and prototyping workspace
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Canvas-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type CanvasStatus = 'in-progress' | 'completed' | 'archived' | 'shared'
export type CanvasTemplate = 'blank' | 'ui-design' | 'wireframe' | 'illustration' | 'presentation' | 'infographic' | 'social-media' | 'logo-design'
export type ExportFormat = 'png' | 'svg' | 'pdf' | 'figma' | 'sketch' | 'jpg' | 'webp'
export type CollaboratorRole = 'owner' | 'editor' | 'viewer' | 'commenter'
export type LayerType = 'shape' | 'text' | 'image' | 'group' | 'frame' | 'vector'
export type BlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'

export interface CanvasCollaborator {
  id: string
  userId: string
  name: string
  email: string
  avatar: string
  role: CollaboratorRole
  color: string
  lastSeen: Date
  isOnline: boolean
  joinedAt: Date
}

export interface CanvasLayer {
  id: string
  artboardId: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: BlendMode
  zIndex: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
  properties: Record<string, any>
}

export interface CanvasArtboard {
  id: string
  canvasId: string
  name: string
  width: number
  height: number
  backgroundColor: string
  x: number
  y: number
  layers: CanvasLayer[]
  isPrototype: boolean
}

export interface CanvasProject {
  id: string
  userId: string
  name: string
  description: string
  thumbnail: string
  template: CanvasTemplate
  status: CanvasStatus
  artboards: CanvasArtboard[]
  collaborators: CanvasCollaborator[]
  totalLayers: number
  size: number // in MB
  version: number
  isStarred: boolean
  isShared: boolean
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  lastModifiedBy: string
  tags: string[]
}

export interface CanvasVersion {
  id: string
  canvasId: string
  version: number
  name: string
  description: string
  thumbnail: string
  size: number
  createdAt: Date
  createdBy: string
}

export interface CanvasComment {
  id: string
  canvasId: string
  artboardId?: string
  layerId?: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  x?: number
  y?: number
  resolved: boolean
  replies: CanvasCommentReply[]
  createdAt: Date
  updatedAt: Date
}

export interface CanvasCommentReply {
  id: string
  commentId: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: Date
}

// ============================================================================
// MOCK DATA - 50 Canvas Projects
// ============================================================================

export const mockCanvasProjects: CanvasProject[] = Array.from({ length: 50 }, (_, i) => {
  const templates: CanvasTemplate[] = ['ui-design', 'wireframe', 'illustration', 'presentation', 'infographic', 'social-media', 'logo-design', 'blank']
  const statuses: CanvasStatus[] = ['in-progress', 'completed', 'archived', 'shared']

  const canvasNames = [
    'Mobile App Redesign', 'Website Landing Page', 'Dashboard UI', 'Marketing Campaign',
    'Brand Identity', 'Social Media Posts', 'Wireframe Collection', 'Product Mockups',
    'Presentation Deck', 'Infographic Design', 'Logo Concepts', 'User Flow Diagram',
    'Icon Set Design', 'Email Templates', 'Mobile Onboarding', 'Web Dashboard',
    'Marketing Materials', 'UI Component Library', 'App Prototype', 'Brand Guidelines',
    'Social Graphics Pack', 'Product Illustrations', 'Website Redesign', 'Mobile App UI',
    'Landing Page Design', 'E-commerce UI', 'SaaS Dashboard', 'Portfolio Website',
    'Blog Design', 'Admin Panel', 'Presentation Templates', 'Marketing Banners',
    'App Icons', 'Web Components', 'Mobile Screens', 'User Interface Kit',
    'Design System', 'Wireframe Kit', 'Product Cards', 'Hero Sections',
    'Feature Illustrations', 'Pricing Tables', 'Testimonial Cards', 'Footer Designs',
    'Navigation Menus', 'Form Designs', 'Button Library', 'Card Components',
    'Modal Designs', 'Alert Components'
  ]

  const template = templates[i % templates.length]
  const status = statuses[i % statuses.length]
  const name = canvasNames[i % canvasNames.length]

  const artboardCount = Math.floor(Math.random() * 10) + 1
  const createdDate = new Date()
  createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90))

  return {
    id: `CVS-${String(i + 1).padStart(4, '0')}`,
    userId: 'user_demo_123',
    name,
    description: `Professional ${template.replace('-', ' ')} project with multiple artboards and layers`,
    thumbnail: `https://picsum.photos/seed/${i}/800/600`,
    template,
    status,
    artboards: [],
    collaborators: [],
    totalLayers: Math.floor(Math.random() * 100) + 10,
    size: parseFloat((Math.random() * 50 + 1).toFixed(2)),
    version: Math.floor(Math.random() * 15) + 1,
    isStarred: Math.random() > 0.7,
    isShared: Math.random() > 0.6,
    isPublic: Math.random() > 0.8,
    createdAt: createdDate,
    updatedAt: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    lastModifiedBy: ['Sarah Johnson', 'Michael Chen', 'Emma Davis', 'You'][Math.floor(Math.random() * 4)],
    tags: ['UI/UX', 'Web', 'Mobile', 'Branding', 'Marketing', 'Illustration'].slice(0, Math.floor(Math.random() * 3) + 1)
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export function getCanvasByStatus(canvases: CanvasProject[], status: CanvasStatus): CanvasProject[] {
  logger.debug('Filtering canvases by status', { status, totalCanvases: canvases.length })
  return canvases.filter(c => c.status === status)
}

export function getCanvasByTemplate(canvases: CanvasProject[], template: CanvasTemplate): CanvasProject[] {
  logger.debug('Filtering canvases by template', { template, totalCanvases: canvases.length })
  return canvases.filter(c => c.template === template)
}

export function getStarredCanvases(canvases: CanvasProject[]): CanvasProject[] {
  logger.debug('Getting starred canvases', { totalCanvases: canvases.length })
  return canvases.filter(c => c.isStarred)
}

export function getSharedCanvases(canvases: CanvasProject[]): CanvasProject[] {
  logger.debug('Getting shared canvases', { totalCanvases: canvases.length })
  return canvases.filter(c => c.isShared)
}

export function searchCanvases(canvases: CanvasProject[], searchTerm: string): CanvasProject[] {
  const searchLower = searchTerm.toLowerCase()
  logger.debug('Searching canvases', { searchTerm, totalCanvases: canvases.length })

  return canvases.filter(c =>
    c.name.toLowerCase().includes(searchLower) ||
    c.description.toLowerCase().includes(searchLower) ||
    c.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    c.template.toLowerCase().includes(searchLower)
  )
}

export function sortCanvases(
  canvases: CanvasProject[],
  sortBy: 'recent' | 'name' | 'size' | 'artboards' | 'layers' | 'collaborators' | 'version'
): CanvasProject[] {
  logger.debug('Sorting canvases', { sortBy, totalCanvases: canvases.length })

  return [...canvases].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'recent':
        return b.updatedAt.getTime() - a.updatedAt.getTime()
      case 'size':
        return b.size - a.size
      case 'artboards':
        return b.artboards.length - a.artboards.length
      case 'layers':
        return b.totalLayers - a.totalLayers
      case 'collaborators':
        return b.collaborators.length - a.collaborators.length
      case 'version':
        return b.version - a.version
      default:
        return 0
    }
  })
}

export function calculateCanvasStats(canvases: CanvasProject[]) {
  logger.debug('Calculating canvas statistics', { totalCanvases: canvases.length })

  const total = canvases.length
  const inProgress = canvases.filter(c => c.status === 'in-progress').length
  const completed = canvases.filter(c => c.status === 'completed').length
  const archived = canvases.filter(c => c.status === 'archived').length
  const shared = canvases.filter(c => c.isShared).length
  const starred = canvases.filter(c => c.isStarred).length
  const totalArtboards = canvases.reduce((sum, c) => sum + c.artboards.length, 0)
  const totalLayers = canvases.reduce((sum, c) => sum + c.totalLayers, 0)
  const totalCollaborators = new Set(
    canvases.flatMap(c => c.collaborators.map(col => col.id))
  ).size
  const totalSize = canvases.reduce((sum, c) => sum + c.size, 0)

  const stats = {
    total,
    inProgress,
    completed,
    archived,
    shared,
    starred,
    totalArtboards,
    totalLayers,
    totalCollaborators,
    totalSize,
    avgArtboardsPerCanvas: total > 0 ? Math.round(totalArtboards / total) : 0,
    avgLayersPerCanvas: total > 0 ? Math.round(totalLayers / total) : 0,
    avgSizePerCanvas: total > 0 ? parseFloat((totalSize / total).toFixed(2)) : 0
  }

  logger.info('Canvas statistics calculated', stats)
  return stats
}

export function duplicateCanvas(canvas: CanvasProject): CanvasProject {
  logger.info('Duplicating canvas', { canvasId: canvas.id, name: canvas.name })

  const duplicated: CanvasProject = {
    ...canvas,
    id: `CVS-${Date.now()}`,
    name: `${canvas.name} (Copy)`,
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    isStarred: false
  }

  logger.info('Canvas duplicated', { originalId: canvas.id, duplicateId: duplicated.id })
  return duplicated
}

export function getCanvasTemplateInfo(template: CanvasTemplate) {
  const templates = {
    'blank': { name: 'Blank Canvas', width: 1920, height: 1080, color: 'gray' },
    'ui-design': { name: 'UI Design', width: 1440, height: 900, color: 'blue' },
    'wireframe': { name: 'Wireframe', width: 1024, height: 768, color: 'slate' },
    'illustration': { name: 'Illustration', width: 2000, height: 2000, color: 'purple' },
    'presentation': { name: 'Presentation', width: 1920, height: 1080, color: 'orange' },
    'infographic': { name: 'Infographic', width: 1200, height: 3000, color: 'green' },
    'social-media': { name: 'Social Media', width: 1080, height: 1080, color: 'pink' },
    'logo-design': { name: 'Logo Design', width: 1000, height: 1000, color: 'amber' }
  }

  return templates[template] || templates.blank
}

export function getStatusColor(status: CanvasStatus): string {
  switch (status) {
    case 'in-progress': return 'blue'
    case 'completed': return 'green'
    case 'archived': return 'gray'
    case 'shared': return 'purple'
    default: return 'gray'
  }
}

export function getRolePermissions(role: CollaboratorRole) {
  return {
    owner: { canView: true, canEdit: true, canComment: true, canShare: true, canDelete: true },
    editor: { canView: true, canEdit: true, canComment: true, canShare: false, canDelete: false },
    commenter: { canView: true, canEdit: false, canComment: true, canShare: false, canDelete: false },
    viewer: { canView: true, canEdit: false, canComment: false, canShare: false, canDelete: false }
  }[role]
}

export function calculateStorageUsed(canvases: CanvasProject[]): number {
  logger.debug('Calculating storage used', { totalCanvases: canvases.length })
  return canvases.reduce((total, canvas) => total + canvas.size, 0)
}

export function getRecentCanvases(canvases: CanvasProject[], limit: number = 10): CanvasProject[] {
  logger.debug('Getting recent canvases', { limit, totalCanvases: canvases.length })
  return sortCanvases(canvases, 'recent').slice(0, limit)
}

export function getCanvasByCollaborator(canvases: CanvasProject[], collaboratorId: string): CanvasProject[] {
  logger.debug('Getting canvases by collaborator', { collaboratorId, totalCanvases: canvases.length })
  return canvases.filter(c => c.collaborators.some(col => col.id === collaboratorId))
}

export function exportCanvas(canvas: CanvasProject, format: ExportFormat): Blob {
  logger.info('Exporting canvas', { canvasId: canvas.id, name: canvas.name, format })

  // Note: This is a mock implementation
  // In production, this would generate actual file content
  const content = JSON.stringify({
    canvas: canvas.name,
    format,
    artboards: canvas.artboards.length,
    layers: canvas.totalLayers,
    exportedAt: new Date().toISOString()
  })

  const blob = new Blob([content], { type: 'application/json' })
  logger.info('Canvas exported', { canvasId: canvas.id, format, size: blob.size })
  return blob
}

logger.info('Canvas utilities initialized', {
  mockCanvases: mockCanvasProjects.length
})
