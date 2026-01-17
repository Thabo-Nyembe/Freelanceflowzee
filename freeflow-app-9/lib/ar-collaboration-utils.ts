/**
 * AR Collaboration Utilities
 * Helper functions and mock data for AR workspace
 */

import {
  ARSession,
  ARParticipant,
  AREnvironment,
  ARTemplate,
  ARCollaborationStats,
  ARDeviceType,
  Vector3
} from './ar-collaboration-types'

export const AR_ENVIRONMENTS: AREnvironment[] = [
  {
    id: 'env-1',
    name: 'Modern Office',
    type: 'office',
    thumbnail: '/ar/office.jpg',
    model: '/models/office.glb',
    ambientSound: '/audio/office-ambient.mp3'
  },
  {
    id: 'env-2',
    name: 'Creative Studio',
    type: 'studio',
    thumbnail: '/ar/studio.jpg',
    model: '/models/studio.glb',
    ambientSound: '/audio/studio-ambient.mp3'
  },
  {
    id: 'env-3',
    name: 'Outdoor Park',
    type: 'outdoor',
    thumbnail: '/ar/park.jpg',
    model: '/models/park.glb',
    ambientSound: '/audio/nature-ambient.mp3'
  },
  {
    id: 'env-4',
    name: 'Abstract Space',
    type: 'abstract',
    thumbnail: '/ar/abstract.jpg',
    model: '/models/abstract.glb'
  },
  {
    id: 'env-5',
    name: 'Conference Room',
    type: 'office',
    thumbnail: '/ar/conference.jpg',
    model: '/models/conference.glb'
  },
  {
    id: 'env-6',
    name: 'Zen Garden',
    type: 'outdoor',
    thumbnail: '/ar/zen.jpg',
    model: '/models/zen-garden.glb',
    ambientSound: '/audio/zen-ambient.mp3'
  }
]

export const AR_TEMPLATES: ARTemplate[] = [
  {
    id: 'template-1',
    name: 'Team Standup',
    description: 'Quick daily standup in AR space',
    category: 'Meeting',
    thumbnail: '/ar/templates/standup.jpg',
    environment: AR_ENVIRONMENTS[0],
    presetObjects: [],
    popularity: 95,
    tags: ['meeting', 'quick', 'daily']
  },
  {
    id: 'template-2',
    name: 'Design Review',
    description: '3D model review workspace',
    category: 'Design',
    thumbnail: '/ar/templates/design-review.jpg',
    environment: AR_ENVIRONMENTS[1],
    presetObjects: [],
    popularity: 88,
    tags: ['design', '3d', 'review']
  },
  {
    id: 'template-3',
    name: 'Brainstorming Session',
    description: 'Creative ideation with whiteboards',
    category: 'Creative',
    thumbnail: '/ar/templates/brainstorm.jpg',
    environment: AR_ENVIRONMENTS[3],
    presetObjects: [],
    popularity: 92,
    tags: ['brainstorm', 'creative', 'whiteboard']
  },
  {
    id: 'template-4',
    name: 'Training Workshop',
    description: 'Educational AR training space',
    category: 'Education',
    thumbnail: '/ar/templates/training.jpg',
    environment: AR_ENVIRONMENTS[0],
    presetObjects: [],
    popularity: 85,
    tags: ['training', 'education', 'workshop']
  }
]

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_AR_SESSIONS: Partial<ARSession>[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_AR_PARTICIPANTS: Partial<ARParticipant>[] = []

// MIGRATED: Batch #15 - Removed mock data, using database hooks
export const MOCK_AR_STATS: ARCollaborationStats = {
  totalSessions: 0,
  totalParticipants: 0,
  averageSessionDuration: 0,
  totalSessionTime: 0,
  popularEnvironments: [],
  activeDevices: {
    hololens: 0,
    quest: 0,
    arkit: 0,
    arcore: 0,
    webxr: 0
  },
  recentSessions: []
}

// Helper Functions
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${mins}m`
}

export function getDeviceIcon(deviceType: ARDeviceType): string {
  const icons: Record<ARDeviceType, string> = {
    hololens: '🥽',
    quest: '🎮',
    arkit: '📱',
    arcore: '📱',
    webxr: '🌐'
  }
  return icons[deviceType]
}

export function getDeviceName(deviceType: ARDeviceType): string {
  const names: Record<ARDeviceType, string> = {
    hololens: 'HoloLens',
    quest: 'Meta Quest',
    arkit: 'ARKit (iOS)',
    arcore: 'ARCore (Android)',
    webxr: 'WebXR Browser'
  }
  return names[deviceType]
}

export function calculateDistance(pos1: Vector3, pos2: Vector3): number {
  const dx = pos2.x - pos1.x
  const dy = pos2.y - pos1.y
  const dz = pos2.z - pos1.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function getLatencyColor(latency: number): string {
  if (latency < 50) return 'text-green-500'
  if (latency < 100) return 'text-yellow-500'
  return 'text-red-500'
}

export function getLatencyLabel(latency: number): string {
  if (latency < 50) return 'Excellent'
  if (latency < 100) return 'Good'
  if (latency < 150) return 'Fair'
  return 'Poor'
}

export function formatPosition(position: Vector3): string {
  return `(${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`
}

export function isNearby(pos1: Vector3, pos2: Vector3, threshold: number = 2.0): boolean {
  return calculateDistance(pos1, pos2) <= threshold
}

export function getEnvironmentIcon(type: AREnvironment['type']): string {
  const icons = {
    office: '🏢',
    studio: '🎨',
    outdoor: '🌳',
    abstract: '✨',
    custom: '🔧'
  }
  return icons[type] || '🌐'
}

export function calculateSessionCost(duration: number, participants: number): number {
  // $0.10 per hour per participant
  const hours = duration / 3600
  return hours * participants * 0.10
}

export function estimateBandwidth(participants: number, quality: string): number {
  // MB per hour
  const baseRate = {
    low: 500,
    medium: 1000,
    high: 2000,
    ultra: 4000
  }[quality] || 1000

  return baseRate * participants
}

export function getRecommendedQuality(bandwidth: number): 'low' | 'medium' | 'high' | 'ultra' {
  if (bandwidth < 10) return 'low'
  if (bandwidth < 25) return 'medium'
  if (bandwidth < 50) return 'high'
  return 'ultra'
}

export function validateWorkspaceBounds(position: Vector3, bounds: any): boolean {
  return (
    position.x >= bounds.min.x && position.x <= bounds.max.x &&
    position.y >= bounds.min.y && position.y <= bounds.max.y &&
    position.z >= bounds.min.z && position.z <= bounds.max.z
  )
}

export function generateSpatialAudioFalloff(distance: number, maxRange: number): number {
  if (distance >= maxRange) return 0
  return Math.max(0, 1 - (distance / maxRange))
}

export function createDefaultVector3(): Vector3 {
  return { x: 0, y: 0, z: 0 }
}

export function addVectors(v1: Vector3, v2: Vector3): Vector3 {
  return {
    x: v1.x + v2.x,
    y: v1.y + v2.y,
    z: v1.z + v2.z
  }
}

export function normalizeVector(v: Vector3): Vector3 {
  const length = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (length === 0) return { x: 0, y: 0, z: 0 }
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  }
}
