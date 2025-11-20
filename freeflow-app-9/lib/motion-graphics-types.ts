/**
 * Motion Graphics Types
 * Complete type system for motion design and animation
 */

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'elastic'
  | 'custom'

export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'

export type LayerType =
  | 'shape'
  | 'text'
  | 'image'
  | 'video'
  | 'solid'
  | 'group'

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'line'
  | 'path'

export interface MotionProject {
  id: string
  name: string
  description?: string
  width: number
  height: number
  frameRate: number
  duration: number
  backgroundColor: string
  layers: Layer[]
  timeline: Timeline
  exportSettings: ExportSettings
  createdAt: Date
  updatedAt: Date
  createdBy: string
  thumbnail?: string
  tags?: string[]
}

export interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: BlendMode
  transform: Transform
  properties: LayerProperties
  animations: Animation[]
  parent?: string
  order: number
  startTime: number
  endTime: number
}

export interface Transform {
  position: { x: number; y: number }
  anchor: { x: number; y: number }
  scale: { x: number; y: number }
  rotation: number
  skew: { x: number; y: number }
}

export interface LayerProperties {
  shape?: ShapeProperties
  text?: TextProperties
  image?: ImageProperties
  video?: VideoProperties
  solid?: SolidProperties
}

export interface ShapeProperties {
  type: ShapeType
  fill: Fill
  stroke: Stroke
  width?: number
  height?: number
  radius?: number
  sides?: number
  points?: Array<{ x: number; y: number }>
}

export interface Fill {
  enabled: boolean
  color: string
  opacity: number
  gradient?: Gradient
}

export interface Stroke {
  enabled: boolean
  color: string
  width: number
  opacity: number
  lineCap: 'butt' | 'round' | 'square'
  lineJoin: 'miter' | 'round' | 'bevel'
}

export interface Gradient {
  type: 'linear' | 'radial'
  stops: Array<{
    position: number
    color: string
  }>
  angle?: number
  center?: { x: number; y: number }
}

export interface TextProperties {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  fontStyle: 'normal' | 'italic'
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight: number
  letterSpacing: number
  textDecoration?: 'none' | 'underline' | 'line-through'
}

export interface ImageProperties {
  url: string
  width: number
  height: number
  objectFit: 'fill' | 'contain' | 'cover' | 'none'
}

export interface VideoProperties {
  url: string
  width: number
  height: number
  volume: number
  loop: boolean
  muted: boolean
}

export interface SolidProperties {
  color: string
  width: number
  height: number
}

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'

export interface Animation {
  id: string
  property: AnimatableProperty
  keyframes: Keyframe[]
  type: AnimationType
  easing: EasingFunction
  loop: boolean
  pingPong: boolean
  delay: number
  enabled: boolean
}

export type AnimatableProperty =
  | 'position.x'
  | 'position.y'
  | 'scale.x'
  | 'scale.y'
  | 'rotation'
  | 'opacity'
  | 'color'
  | 'width'
  | 'height'

export interface Keyframe {
  id: string
  time: number
  value: number | string | { x: number; y: number }
  easing?: EasingFunction
}

export interface Timeline {
  currentTime: number
  duration: number
  playbackSpeed: number
  markers: Marker[]
  isPlaying: boolean
  loop: boolean
}

export interface Marker {
  id: string
  time: number
  label: string
  color: string
}

export interface ExportSettings {
  format: 'mp4' | 'webm' | 'gif' | 'png-sequence' | 'svg' | 'lottie'
  quality: 'low' | 'medium' | 'high' | 'ultra'
  fps: number
  resolution: { width: number; height: number }
  transparent: boolean
  codec?: string
}

export interface MotionTemplate {
  id: string
  name: string
  description: string
  category: string
  thumbnail: string
  duration: number
  layers: Omit<Layer, 'id'>[]
  width: number
  height: number
  frameRate: number
  popularity: number
  tags: string[]
}

export interface MotionPreset {
  id: string
  name: string
  category: string
  animationType: AnimationType
  keyframes: Omit<Keyframe, 'id'>[]
  easing: EasingFunction
  duration: number
  description?: string
}

export interface MotionAsset {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'font' | 'shape'
  url: string
  size: number
  format: string
  dimensions?: { width: number; height: number }
  duration?: number
  createdAt: Date
  tags?: string[]
}

export interface MotionEffect {
  id: string
  name: string
  type: 'blur' | 'glow' | 'shadow' | 'color-correction' | 'distortion' | 'stylize'
  parameters: Record<string, number | string | boolean>
  enabled: boolean
}

export interface MotionCollaboration {
  projectId: string
  collaborators: Array<{
    userId: string
    name: string
    role: 'owner' | 'editor' | 'viewer'
    lastActive: Date
  }>
  comments: Array<{
    id: string
    userId: string
    userName: string
    time: number
    text: string
    position?: { x: number; y: number }
    createdAt: Date
  }>
}

export interface MotionStats {
  totalProjects: number
  totalAnimations: number
  totalExports: number
  storageUsed: number
  storageLimit: number
  renderTime: number
  popularTemplates: string[]
}
