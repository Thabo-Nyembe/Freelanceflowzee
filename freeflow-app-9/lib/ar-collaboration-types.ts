/**
 * AR Collaboration Types
 * Complete type system for augmented reality collaboration
 */

export type ARDeviceType = 'hololens' | 'quest' | 'arkit' | 'arcore' | 'webxr'
export type ARSessionStatus = 'connecting' | 'active' | 'paused' | 'disconnected'
export type ARObjectType = '3d-model' | 'annotation' | 'whiteboard' | 'screen-share' | 'avatar' | 'spatial-audio'
export type ARInteractionMode = 'select' | 'move' | 'rotate' | 'scale' | 'annotate' | 'present'
export type ARSpatialAudioMode = 'stereo' | 'surround' | 'spatial' | 'binaural'

export interface ARSession {
  id: string
  name: string
  description?: string
  hostId: string
  participants: ARParticipant[]
  workspace: ARWorkspace
  status: ARSessionStatus
  startedAt: Date
  duration: number
  maxParticipants: number
  isRecording: boolean
  settings: ARSessionSettings
}

export interface ARParticipant {
  id: string
  userId: string
  name: string
  avatar: ARAvatar
  device: ARDeviceInfo
  position: Vector3
  rotation: Vector3
  isHost: boolean
  isSpeaking: boolean
  isMuted: boolean
  handRaised: boolean
  joinedAt: Date
  latency: number
}

export interface ARAvatar {
  id: string
  model: string
  texture?: string
  color: string
  accessories: string[]
  animations: ARAnimation[]
}

export interface ARDeviceInfo {
  type: ARDeviceType
  model: string
  capabilities: ARCapability[]
  resolution: { width: number; height: number }
  refreshRate: number
  fov: number
}

export interface ARCapability {
  id: string
  name: string
  supported: boolean
  description: string
}

export interface ARWorkspace {
  id: string
  name: string
  environment: AREnvironment
  objects: ARObject[]
  bounds: {
    min: Vector3
    max: Vector3
  }
  lighting: ARLighting
  skybox?: string
}

export interface AREnvironment {
  id: string
  name: string
  type: 'office' | 'studio' | 'outdoor' | 'abstract' | 'custom'
  thumbnail: string
  model?: string
  ambientSound?: string
}

export interface ARObject {
  id: string
  type: ARObjectType
  name: string
  position: Vector3
  rotation: Vector3
  scale: Vector3
  properties: ARObjectProperties
  isLocked: boolean
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface ARObjectProperties {
  model3D?: AR3DModelProperties
  annotation?: ARAnnotationProperties
  whiteboard?: ARWhiteboardProperties
  screenShare?: ARScreenShareProperties
  spatialAudio?: ARSpatialAudioProperties
}

export interface AR3DModelProperties {
  modelUrl: string
  textureUrl?: string
  materialUrl?: string
  animations: string[]
  interactive: boolean
  physics: boolean
}

export interface ARAnnotationProperties {
  text: string
  color: string
  fontSize: number
  backgroundColor?: string
  icon?: string
  pointsTo?: string
}

export interface ARWhiteboardProperties {
  width: number
  height: number
  backgroundColor: string
  strokes: ARStroke[]
  isShared: boolean
}

export interface ARStroke {
  id: string
  points: Vector3[]
  color: string
  width: number
  userId: string
  timestamp: Date
}

export interface ARScreenShareProperties {
  streamUrl: string
  width: number
  height: number
  quality: 'low' | 'medium' | 'high' | 'ultra'
  isInteractive: boolean
}

export interface ARSpatialAudioProperties {
  sourceUrl: string
  volume: number
  range: number
  mode: ARSpatialAudioMode
  isLooping: boolean
}

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface ARLighting {
  ambient: {
    color: string
    intensity: number
  }
  directional: {
    color: string
    intensity: number
    direction: Vector3
    castShadows: boolean
  }[]
  point: {
    color: string
    intensity: number
    position: Vector3
    range: number
  }[]
}

export interface ARGesture {
  type: 'pinch' | 'grab' | 'point' | 'wave' | 'thumbs-up' | 'custom'
  hand: 'left' | 'right' | 'both'
  position: Vector3
  confidence: number
  timestamp: Date
}

export interface ARSessionSettings {
  maxParticipants: number
  allowScreenShare: boolean
  allowAnnotations: boolean
  allowWhiteboard: boolean
  spatialAudioEnabled: boolean
  recordSession: boolean
  requireApproval: boolean
  password?: string
}

export interface ARTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  environment: AREnvironment
  presetObjects: Omit<ARObject, 'id' | 'createdAt' | 'updatedAt'>[]
  popularity: number
  tags: string[]
}

export interface ARAnimation {
  name: string
  duration: number
  loop: boolean
  autoplay: boolean
}

export interface ARCollaborationStats {
  totalSessions: number
  totalParticipants: number
  averageSessionDuration: number
  totalSessionTime: number
  popularEnvironments: string[]
  activeDevices: Record<ARDeviceType, number>
  recentSessions: {
    id: string
    name: string
    participants: number
    duration: number
    date: Date
  }[]
}

export interface ARHandTracking {
  leftHand: ARHandData | null
  rightHand: ARHandData | null
}

export interface ARHandData {
  position: Vector3
  rotation: Vector3
  fingers: {
    thumb: ARFingerData
    index: ARFingerData
    middle: ARFingerData
    ring: ARFingerData
    pinky: ARFingerData
  }
  gesture?: ARGesture
  confidence: number
}

export interface ARFingerData {
  extended: boolean
  joints: Vector3[]
}

export interface ARSpatialAnchor {
  id: string
  position: Vector3
  rotation: Vector3
  persistent: boolean
  cloudSynced: boolean
  createdAt: Date
}
