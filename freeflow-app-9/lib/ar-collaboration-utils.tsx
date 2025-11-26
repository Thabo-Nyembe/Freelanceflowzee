/**
 * 🥽 AR COLLABORATION UTILITIES
 * Comprehensive utilities for augmented reality collaboration and immersive workspaces
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AR-Collaboration-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type AREnvironment = 'office' | 'studio' | 'park' | 'abstract' | 'conference' | 'zen'
export type DeviceType = 'hololens' | 'quest' | 'arkit' | 'arcore' | 'webxr' | 'browser'
export type SessionStatus = 'active' | 'scheduled' | 'ended' | 'archived'
export type ParticipantStatus = 'connected' | 'away' | 'disconnected'
export type ObjectType = '3d-model' | 'annotation' | 'whiteboard' | 'screen' | 'marker' | 'portal'
export type InteractionType = 'grab' | 'point' | 'gesture' | 'voice' | 'controller'

export interface Vector3D {
  x: number
  y: number
  z: number
}

export interface ARParticipant {
  id: string
  userId: string
  sessionId: string
  name: string
  avatar: string
  device: DeviceType
  status: ParticipantStatus
  position: Vector3D
  rotation: Vector3D
  scale: number
  isMuted: boolean
  isVideoEnabled: boolean
  isSharingScreen: boolean
  isHandTrackingEnabled: boolean
  joinedAt: Date
  leftAt?: Date
  latency: number // in ms
  bandwidth: number // in kbps
  fps: number
  quality: 'low' | 'medium' | 'high' | 'ultra'
  permissions: {
    canAnnotate: boolean
    canPlace3D: boolean
    canControlWhiteboard: boolean
    canRecord: boolean
  }
}

export interface ARSession {
  id: string
  userId: string
  name: string
  description: string
  hostId: string
  hostName: string
  environment: AREnvironment
  status: SessionStatus
  participants: string[] // Participant IDs
  currentParticipants: number
  maxParticipants: number
  startTime?: Date
  endTime?: Date
  duration?: number // in seconds
  scheduledTime?: Date
  isRecording: boolean
  isLocked: boolean
  password?: string
  tags: string[]
  features: {
    spatialAudio: boolean
    whiteboard: boolean
    screenShare: boolean
    objects3D: boolean
    recording: boolean
    handTracking: boolean
    eyeTracking: boolean
    faceTracking: boolean
    roomMapping: boolean
    lightEstimation: boolean
  }
  objects: ARObject[]
  settings: {
    audioQuality: 'low' | 'medium' | 'high'
    videoQuality: 'low' | 'medium' | 'high' | 'ultra'
    renderQuality: 'low' | 'medium' | 'high' | 'ultra'
    networkOptimization: boolean
    autoReconnect: boolean
  }
  createdAt: Date
  updatedAt: Date
}

export interface ARObject {
  id: string
  sessionId: string
  type: ObjectType
  name: string
  position: Vector3D
  rotation: Vector3D
  scale: number
  color?: string
  texture?: string
  modelUrl?: string
  isInteractive: boolean
  isVisible: boolean
  ownerId: string
  permissions: {
    canMove: boolean
    canRotate: boolean
    canScale: boolean
    canDelete: boolean
  }
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ARAnnotation {
  id: string
  sessionId: string
  objectId?: string
  authorId: string
  content: string
  position: Vector3D
  color: string
  size: number
  type: 'text' | 'drawing' | 'marker' | 'highlight'
  strokeWidth?: number
  points?: Vector3D[]
  isVisible: boolean
  createdAt: Date
}

export interface ARWhiteboard {
  id: string
  sessionId: string
  name: string
  position: Vector3D
  rotation: Vector3D
  width: number
  height: number
  content: string // JSON or base64 image
  strokes: WhiteboardStroke[]
  isLocked: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface WhiteboardStroke {
  id: string
  authorId: string
  points: Vector3D[]
  color: string
  width: number
  opacity: number
  timestamp: Date
}

export interface ARRecording {
  id: string
  sessionId: string
  userId: string
  name: string
  duration: number
  fileSize: number
  format: 'mp4' | 'webm' | 'glb'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  thumbnail?: string
  url: string
  startTime: Date
  endTime: Date
  participants: string[]
  createdAt: Date
}

export interface AREnvironmentConfig {
  id: AREnvironment
  name: string
  description: string
  thumbnail: string
  skybox?: string
  lighting: {
    ambient: number
    directional: number
    shadows: boolean
  }
  fog: {
    enabled: boolean
    color: string
    density: number
  }
  objects: {
    type: string
    position: Vector3D
    rotation: Vector3D
    scale: number
  }[]
}

export interface ARSessionMetrics {
  sessionId: string
  period: 'session' | 'hour' | 'day'
  totalParticipants: number
  peakParticipants: number
  averageParticipants: number
  duration: number
  objectsCreated: number
  annotationsCreated: number
  messagesExchanged: number
  dataTransferred: number // in MB
  averageLatency: number
  averageFPS: number
  disconnections: number
  reconnections: number
  quality: {
    audio: number // 0-100
    video: number // 0-100
    network: number // 0-100
  }
}

// ============================================================================
// MOCK DATA - 60 AR Sessions
// ============================================================================

const sessionNames = [
  'Product Design Review', 'Team Standup', 'Client Presentation', 'Architecture Planning',
  'Creative Brainstorm', 'Training Session', 'Project Kickoff', 'Sprint Planning',
  'Design Workshop', 'Code Review', 'Strategy Meeting', 'Demo Session',
  '3D Model Review', 'Prototype Testing', 'User Research', 'Marketing Review'
]

const hostNames = [
  'Sarah Chen', 'Michael Brown', 'Emily Davis', 'David Wilson', 'Lisa Anderson',
  'James Taylor', 'Maria Garcia', 'Robert Johnson', 'Jennifer Lee', 'William Martinez'
]

export const mockARSessions: ARSession[] = Array.from({ length: 60 }, (_, i) => {
  const environments: AREnvironment[] = ['office', 'studio', 'park', 'abstract', 'conference', 'zen']
  const statuses: SessionStatus[] = ['active', 'scheduled', 'ended', 'archived']

  const createdDate = new Date()
  createdDate.setHours(createdDate.getHours() - Math.floor(Math.random() * 168))

  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const maxParticipants = Math.floor(Math.random() * 20) + 5
  const currentParticipants = status === 'active' ? Math.floor(Math.random() * maxParticipants) + 1 : 0

  const startTime = status === 'active' || status === 'ended' ? new Date(createdDate.getTime() + 60000) : undefined
  const duration = status === 'ended' ? Math.floor(Math.random() * 7200) + 300 : undefined
  const endTime = status === 'ended' && startTime ? new Date(startTime.getTime() + (duration || 0) * 1000) : undefined
  const scheduledTime = status === 'scheduled' ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined

  return {
    id: `ARS-${String(i + 1).padStart(4, '0')}`,
    userId: 'user_demo_123',
    name: sessionNames[i % sessionNames.length],
    description: `Collaborative AR session for ${sessionNames[i % sessionNames.length]}`,
    hostId: `HOST-${String(i % 10).padStart(3, '0')}`,
    hostName: hostNames[i % hostNames.length],
    environment: environments[Math.floor(Math.random() * environments.length)],
    status,
    participants: Array.from({ length: currentParticipants }, (_, j) => `PART-${i}-${j}`),
    currentParticipants,
    maxParticipants,
    startTime,
    endTime,
    duration,
    scheduledTime,
    isRecording: status === 'active' && Math.random() > 0.7,
    isLocked: Math.random() > 0.8,
    password: Math.random() > 0.8 ? 'secure123' : undefined,
    tags: ['design', 'development', 'meeting', 'workshop'].slice(0, Math.floor(Math.random() * 3) + 1),
    features: {
      spatialAudio: true,
      whiteboard: Math.random() > 0.3,
      screenShare: Math.random() > 0.4,
      objects3D: Math.random() > 0.5,
      recording: Math.random() > 0.6,
      handTracking: Math.random() > 0.7,
      eyeTracking: Math.random() > 0.8,
      faceTracking: Math.random() > 0.8,
      roomMapping: Math.random() > 0.5,
      lightEstimation: Math.random() > 0.6
    },
    objects: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
      id: `OBJ-${i}-${j}`,
      sessionId: `ARS-${String(i + 1).padStart(4, '0')}`,
      type: ['3d-model', 'annotation', 'whiteboard', 'screen'][Math.floor(Math.random() * 4)] as ObjectType,
      name: `Object ${j + 1}`,
      position: { x: Math.random() * 10 - 5, y: Math.random() * 3, z: Math.random() * 10 - 5 },
      rotation: { x: 0, y: Math.random() * 360, z: 0 },
      scale: 0.5 + Math.random() * 1.5,
      isInteractive: true,
      isVisible: true,
      ownerId: `HOST-${String(i % 10).padStart(3, '0')}`,
      permissions: {
        canMove: true,
        canRotate: true,
        canScale: true,
        canDelete: true
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    })),
    settings: {
      audioQuality: 'high',
      videoQuality: 'high',
      renderQuality: 'high',
      networkOptimization: true,
      autoReconnect: true
    },
    createdAt: createdDate,
    updatedAt: new Date()
  }
})

// ============================================================================
// MOCK DATA - 100 AR Participants
// ============================================================================

export const mockARParticipants: ARParticipant[] = Array.from({ length: 100 }, (_, i) => {
  const devices: DeviceType[] = ['hololens', 'quest', 'arkit', 'arcore', 'webxr', 'browser']
  const statuses: ParticipantStatus[] = ['connected', 'away', 'disconnected']
  const qualities = ['low', 'medium', 'high', 'ultra'] as const

  const sessionIndex = Math.floor(i / 5)
  const session = mockARSessions[sessionIndex % mockARSessions.length]

  return {
    id: `PART-${String(i + 1).padStart(4, '0')}`,
    userId: `user_${i}`,
    sessionId: session.id,
    name: `Participant ${i + 1}`,
    avatar: `https://i.pravatar.cc/150?img=${i + 1}`,
    device: devices[Math.floor(Math.random() * devices.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    position: { x: Math.random() * 10 - 5, y: 1.5, z: Math.random() * 10 - 5 },
    rotation: { x: 0, y: Math.random() * 360, z: 0 },
    scale: 1.0,
    isMuted: Math.random() > 0.7,
    isVideoEnabled: Math.random() > 0.5,
    isSharingScreen: Math.random() > 0.9,
    isHandTrackingEnabled: Math.random() > 0.6,
    joinedAt: new Date(Date.now() - Math.random() * 3600000),
    latency: Math.floor(Math.random() * 100) + 20,
    bandwidth: Math.floor(Math.random() * 5000) + 1000,
    fps: 60 + Math.floor(Math.random() * 30),
    quality: qualities[Math.floor(Math.random() * qualities.length)],
    permissions: {
      canAnnotate: true,
      canPlace3D: Math.random() > 0.5,
      canControlWhiteboard: Math.random() > 0.7,
      canRecord: Math.random() > 0.8
    }
  }
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

export function formatLatency(ms: number): string {
  if (ms < 50) return `${ms}ms (Excellent)`
  if (ms < 100) return `${ms}ms (Good)`
  if (ms < 200) return `${ms}ms (Fair)`
  return `${ms}ms (Poor)`
}

export function formatBandwidth(kbps: number): string {
  if (kbps < 1000) return `${kbps} kbps`
  return `${(kbps / 1000).toFixed(1)} Mbps`
}

export function getSessionsByStatus(sessions: ARSession[], status: SessionStatus): ARSession[] {
  logger.debug('Filtering sessions by status', { status, totalSessions: sessions.length })
  return sessions.filter(s => s.status === status)
}

export function getSessionsByEnvironment(sessions: ARSession[], environment: AREnvironment): ARSession[] {
  logger.debug('Filtering sessions by environment', { environment, totalSessions: sessions.length })
  return sessions.filter(s => s.environment === environment)
}

export function getActiveSessions(sessions: ARSession[]): ARSession[] {
  logger.debug('Getting active sessions', { totalSessions: sessions.length })
  return sessions.filter(s => s.status === 'active')
}

export function getScheduledSessions(sessions: ARSession[]): ARSession[] {
  logger.debug('Getting scheduled sessions', { totalSessions: sessions.length })
  return sessions.filter(s => s.status === 'scheduled')
}

export function getRecordingSessions(sessions: ARSession[]): ARSession[] {
  logger.debug('Getting recording sessions', { totalSessions: sessions.length })
  return sessions.filter(s => s.isRecording)
}

export function searchSessions(sessions: ARSession[], query: string): ARSession[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching sessions', { query, totalSessions: sessions.length })

  return sessions.filter(s =>
    s.name.toLowerCase().includes(searchLower) ||
    s.description.toLowerCase().includes(searchLower) ||
    s.hostName.toLowerCase().includes(searchLower) ||
    s.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}

export function sortSessions(
  sessions: ARSession[],
  sortBy: 'name' | 'participants' | 'recent' | 'duration'
): ARSession[] {
  logger.debug('Sorting sessions', { sortBy, totalSessions: sessions.length })

  return [...sessions].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'participants':
        return b.currentParticipants - a.currentParticipants
      case 'recent':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'duration':
        return (b.duration || 0) - (a.duration || 0)
      default:
        return 0
    }
  })
}

export function getParticipantsBySession(participants: ARParticipant[], sessionId: string): ARParticipant[] {
  logger.debug('Getting participants for session', { sessionId, totalParticipants: participants.length })
  return participants.filter(p => p.sessionId === sessionId)
}

export function getConnectedParticipants(participants: ARParticipant[]): ARParticipant[] {
  logger.debug('Getting connected participants', { totalParticipants: participants.length })
  return participants.filter(p => p.status === 'connected')
}

export function getParticipantsByDevice(participants: ARParticipant[], device: DeviceType): ARParticipant[] {
  logger.debug('Filtering participants by device', { device, totalParticipants: participants.length })
  return participants.filter(p => p.device === device)
}

export function calculateSessionStats(sessions: ARSession[], participants: ARParticipant[]) {
  logger.debug('Calculating session statistics')

  const totalSessions = sessions.length
  const activeSessions = sessions.filter(s => s.status === 'active').length
  const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length
  const endedSessions = sessions.filter(s => s.status === 'ended').length

  const totalParticipants = participants.length
  const connectedParticipants = participants.filter(p => p.status === 'connected').length
  const avgParticipantsPerSession = totalSessions > 0 ? totalParticipants / totalSessions : 0

  const recordingSessions = sessions.filter(s => s.isRecording).length
  const lockedSessions = sessions.filter(s => s.isLocked).length

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const avgDuration = totalSessions > 0 ? totalDuration / totalSessions : 0

  const environmentStats = sessions.reduce((acc, s) => {
    acc[s.environment] = (acc[s.environment] || 0) + 1
    return acc
  }, {} as Record<AREnvironment, number>)

  const deviceStats = participants.reduce((acc, p) => {
    acc[p.device] = (acc[p.device] || 0) + 1
    return acc
  }, {} as Record<DeviceType, number>)

  const stats = {
    totalSessions,
    activeSessions,
    scheduledSessions,
    endedSessions,
    totalParticipants,
    connectedParticipants,
    avgParticipantsPerSession,
    recordingSessions,
    lockedSessions,
    totalDuration,
    avgDuration,
    environmentStats,
    deviceStats,
    avgLatency: participants.reduce((sum, p) => sum + p.latency, 0) / totalParticipants,
    avgBandwidth: participants.reduce((sum, p) => sum + p.bandwidth, 0) / totalParticipants,
    avgFPS: participants.reduce((sum, p) => sum + p.fps, 0) / totalParticipants
  }

  logger.info('Session statistics calculated', stats)
  return stats
}

export function getSessionStatusColor(status: SessionStatus): string {
  const colors = {
    active: 'bg-green-100 text-green-800',
    scheduled: 'bg-blue-100 text-blue-800',
    ended: 'bg-gray-100 text-gray-800',
    archived: 'bg-purple-100 text-purple-800'
  }
  return colors[status]
}

export function getEnvironmentColor(environment: AREnvironment): string {
  const colors = {
    office: 'bg-blue-100 text-blue-800',
    studio: 'bg-purple-100 text-purple-800',
    park: 'bg-green-100 text-green-800',
    abstract: 'bg-pink-100 text-pink-800',
    conference: 'bg-orange-100 text-orange-800',
    zen: 'bg-teal-100 text-teal-800'
  }
  return colors[environment]
}

export function getDeviceColor(device: DeviceType): string {
  const colors = {
    hololens: 'bg-blue-100 text-blue-800',
    quest: 'bg-purple-100 text-purple-800',
    arkit: 'bg-gray-100 text-gray-800',
    arcore: 'bg-green-100 text-green-800',
    webxr: 'bg-orange-100 text-orange-800',
    browser: 'bg-yellow-100 text-yellow-800'
  }
  return colors[device]
}

export function getParticipantStatusColor(status: ParticipantStatus): string {
  const colors = {
    connected: 'bg-green-100 text-green-800',
    away: 'bg-yellow-100 text-yellow-800',
    disconnected: 'bg-red-100 text-red-800'
  }
  return colors[status]
}

export function calculateDistance(p1: Vector3D, p2: Vector3D): number {
  return Math.sqrt(
    Math.pow(p2.x - p1.x, 2) +
    Math.pow(p2.y - p1.y, 2) +
    Math.pow(p2.z - p1.z, 2)
  )
}

export function getNearbyParticipants(
  participants: ARParticipant[],
  position: Vector3D,
  maxDistance: number = 5
): ARParticipant[] {
  logger.debug('Getting nearby participants', { position, maxDistance })

  return participants.filter(p => {
    const distance = calculateDistance(position, p.position)
    return distance <= maxDistance && p.status === 'connected'
  })
}

export function getSessionQuality(session: ARSession, participants: ARParticipant[]): {
  score: number
  rating: 'poor' | 'fair' | 'good' | 'excellent'
  factors: string[]
} {
  let score = 100
  const factors: string[] = []

  const sessionParticipants = participants.filter(p => p.sessionId === session.id && p.status === 'connected')

  // Check average latency
  if (sessionParticipants.length > 0) {
    const avgLatency = sessionParticipants.reduce((sum, p) => sum + p.latency, 0) / sessionParticipants.length
    if (avgLatency > 200) {
      score -= 30
      factors.push('High latency')
    } else if (avgLatency > 100) {
      score -= 15
      factors.push('Moderate latency')
    }

    // Check FPS
    const avgFPS = sessionParticipants.reduce((sum, p) => sum + p.fps, 0) / sessionParticipants.length
    if (avgFPS < 30) {
      score -= 25
      factors.push('Low FPS')
    } else if (avgFPS < 60) {
      score -= 10
      factors.push('Moderate FPS')
    }
  }

  // Check participant count vs capacity
  const capacityRatio = session.currentParticipants / session.maxParticipants
  if (capacityRatio > 0.9) {
    score -= 10
    factors.push('Near capacity')
  }

  let rating: 'poor' | 'fair' | 'good' | 'excellent'
  if (score >= 90) rating = 'excellent'
  else if (score >= 70) rating = 'good'
  else if (score >= 50) rating = 'fair'
  else rating = 'poor'

  if (factors.length === 0) factors.push('Optimal performance')

  logger.debug('Session quality calculated', { sessionId: session.id, score, rating, factors })

  return { score, rating, factors }
}

logger.info('AR Collaboration utilities initialized', {
  mockSessions: mockARSessions.length,
  mockParticipants: mockARParticipants.length
})
