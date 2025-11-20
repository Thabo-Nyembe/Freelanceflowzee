/**
 * Motion Graphics Utilities
 * Helper functions and mock data for motion design system
 */

import {
  MotionProject,
  MotionTemplate,
  MotionPreset,
  MotionAsset,
  MotionStats,
  AnimationType,
  EasingFunction,
  LayerType
} from './motion-graphics-types'

export const ANIMATION_TYPES: Array<{ id: AnimationType; name: string; description: string; icon: string }> = [
  { id: 'fade', name: 'Fade', description: 'Smooth opacity transition', icon: '✨' },
  { id: 'slide', name: 'Slide', description: 'Position-based movement', icon: '➡️' },
  { id: 'scale', name: 'Scale', description: 'Size transformation', icon: '🔍' },
  { id: 'rotate', name: 'Rotate', description: 'Rotation animation', icon: '🔄' },
  { id: 'bounce', name: 'Bounce', description: 'Spring-like motion', icon: '⚡' },
  { id: 'elastic', name: 'Elastic', description: 'Elastic easing effect', icon: '🎯' },
  { id: 'custom', name: 'Custom', description: 'Custom animation curve', icon: '🎨' }
]

export const EASING_FUNCTIONS: Array<{ id: EasingFunction; name: string; curve: string }> = [
  { id: 'linear', name: 'Linear', curve: 'linear' },
  { id: 'ease-in', name: 'Ease In', curve: 'cubic-bezier(0.42, 0, 1.0, 1.0)' },
  { id: 'ease-out', name: 'Ease Out', curve: 'cubic-bezier(0, 0, 0.58, 1.0)' },
  { id: 'ease-in-out', name: 'Ease In Out', curve: 'cubic-bezier(0.42, 0, 0.58, 1.0)' },
  { id: 'cubic-bezier', name: 'Custom Bezier', curve: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)' }
]

export const MOTION_TEMPLATES: MotionTemplate[] = [
  {
    id: 'template-1',
    name: 'Logo Reveal',
    description: 'Professional logo animation with shine effect',
    category: 'Branding',
    thumbnail: '/templates/logo-reveal.jpg',
    duration: 3,
    layers: [],
    width: 1920,
    height: 1080,
    frameRate: 30,
    popularity: 95,
    tags: ['logo', 'branding', 'intro']
  },
  {
    id: 'template-2',
    name: 'Lower Third',
    description: 'Animated name and title overlay',
    category: 'Broadcast',
    thumbnail: '/templates/lower-third.jpg',
    duration: 5,
    layers: [],
    width: 1920,
    height: 1080,
    frameRate: 30,
    popularity: 88,
    tags: ['lower-third', 'overlay', 'broadcast']
  },
  {
    id: 'template-3',
    name: 'Text Animation',
    description: 'Dynamic text reveal with particles',
    category: 'Typography',
    thumbnail: '/templates/text-animation.jpg',
    duration: 4,
    layers: [],
    width: 1920,
    height: 1080,
    frameRate: 30,
    popularity: 92,
    tags: ['text', 'kinetic', 'typography']
  },
  {
    id: 'template-4',
    name: 'Social Media Post',
    description: 'Square format animation for social',
    category: 'Social Media',
    thumbnail: '/templates/social-post.jpg',
    duration: 6,
    layers: [],
    width: 1080,
    height: 1080,
    frameRate: 30,
    popularity: 90,
    tags: ['social', 'instagram', 'square']
  }
]

export const MOTION_PRESETS: MotionPreset[] = [
  {
    id: 'preset-1',
    name: 'Slide In Left',
    category: 'Entrance',
    animationType: 'slide',
    keyframes: [
      { time: 0, value: { x: -100, y: 0 } },
      { time: 1, value: { x: 0, y: 0 } }
    ],
    easing: 'ease-out',
    duration: 1,
    description: 'Slide element from left to center'
  },
  {
    id: 'preset-2',
    name: 'Fade In',
    category: 'Entrance',
    animationType: 'fade',
    keyframes: [
      { time: 0, value: 0 },
      { time: 1, value: 1 }
    ],
    easing: 'ease-in',
    duration: 0.8,
    description: 'Smooth fade in effect'
  },
  {
    id: 'preset-3',
    name: 'Scale Up',
    category: 'Entrance',
    animationType: 'scale',
    keyframes: [
      { time: 0, value: { x: 0, y: 0 } },
      { time: 1, value: { x: 1, y: 1 } }
    ],
    easing: 'ease-out',
    duration: 0.6,
    description: 'Scale from 0 to full size'
  },
  {
    id: 'preset-4',
    name: 'Bounce In',
    category: 'Entrance',
    animationType: 'bounce',
    keyframes: [
      { time: 0, value: { x: 1, y: 1 } },
      { time: 0.5, value: { x: 1.2, y: 1.2 } },
      { time: 1, value: { x: 1, y: 1 } }
    ],
    easing: 'ease-in-out',
    duration: 0.8,
    description: 'Bounce scale animation'
  }
]

export const MOCK_MOTION_PROJECTS: MotionProject[] = [
  {
    id: 'proj-1',
    name: 'Product Launch Video',
    description: 'Animated promo for new product',
    width: 1920,
    height: 1080,
    frameRate: 30,
    duration: 15,
    backgroundColor: '#000000',
    layers: [],
    timeline: {
      currentTime: 0,
      duration: 15,
      playbackSpeed: 1,
      markers: [],
      isPlaying: false,
      loop: false
    },
    exportSettings: {
      format: 'mp4',
      quality: 'high',
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      transparent: false
    },
    createdAt: new Date(Date.now() - 86400000 * 3),
    updatedAt: new Date(Date.now() - 3600000),
    createdBy: 'user-1',
    tags: ['product', 'promo', 'commercial']
  },
  {
    id: 'proj-2',
    name: 'Social Media Ad',
    description: 'Square format for Instagram',
    width: 1080,
    height: 1080,
    frameRate: 30,
    duration: 10,
    backgroundColor: '#ffffff',
    layers: [],
    timeline: {
      currentTime: 0,
      duration: 10,
      playbackSpeed: 1,
      markers: [],
      isPlaying: false,
      loop: false
    },
    exportSettings: {
      format: 'mp4',
      quality: 'high',
      fps: 30,
      resolution: { width: 1080, height: 1080 },
      transparent: false
    },
    createdAt: new Date(Date.now() - 86400000 * 7),
    updatedAt: new Date(Date.now() - 7200000),
    createdBy: 'user-1',
    tags: ['social', 'instagram', 'ad']
  }
]

export const MOCK_MOTION_ASSETS: MotionAsset[] = [
  {
    id: 'asset-1',
    name: 'Company Logo',
    type: 'image',
    url: '/assets/logo.png',
    size: 524288,
    format: 'PNG',
    dimensions: { width: 1000, height: 500 },
    createdAt: new Date(Date.now() - 86400000 * 15),
    tags: ['logo', 'branding']
  },
  {
    id: 'asset-2',
    name: 'Background Video',
    type: 'video',
    url: '/assets/bg-video.mp4',
    size: 10485760,
    format: 'MP4',
    dimensions: { width: 1920, height: 1080 },
    duration: 20,
    createdAt: new Date(Date.now() - 86400000 * 10),
    tags: ['background', 'video']
  }
]

export const MOCK_MOTION_STATS: MotionStats = {
  totalProjects: 12,
  totalAnimations: 87,
  totalExports: 34,
  storageUsed: 1258291200,
  storageLimit: 5368709120,
  renderTime: 3420,
  popularTemplates: ['template-1', 'template-3', 'template-2']
}

// Helper Functions
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatFrameRate(fps: number): string {
  return `${fps} fps`
}

export function formatResolution(width: number, height: number): string {
  if (width === 1920 && height === 1080) return '1080p (Full HD)'
  if (width === 3840 && height === 2160) return '4K (Ultra HD)'
  if (width === 1280 && height === 720) return '720p (HD)'
  if (width === 1080 && height === 1080) return 'Square (1:1)'
  return `${width}x${height}`
}

export function calculateStoragePercentage(used: number, limit: number): number {
  return Math.round((used / limit) * 100)
}

export function estimateRenderTime(
  duration: number,
  layers: number,
  resolution: { width: number; height: number },
  quality: string
): number {
  const baseTime = duration * 2 // 2 seconds per second of video
  const layerMultiplier = 1 + (layers * 0.1)
  const resolutionMultiplier = (resolution.width * resolution.height) / (1920 * 1080)
  const qualityMultiplier = {
    low: 0.5,
    medium: 1,
    high: 1.5,
    ultra: 2
  }[quality] || 1

  return Math.ceil(baseTime * layerMultiplier * resolutionMultiplier * qualityMultiplier)
}

export function getLayerIcon(type: LayerType): string {
  const icons: Record<LayerType, string> = {
    shape: '⬛',
    text: '📝',
    image: '🖼️',
    video: '🎬',
    solid: '🎨',
    group: '📁'
  }
  return icons[type] || '📄'
}

export function getAnimationIcon(type: AnimationType): string {
  const icons: Record<AnimationType, string> = {
    fade: '✨',
    slide: '➡️',
    scale: '🔍',
    rotate: '🔄',
    bounce: '⚡',
    elastic: '🎯',
    custom: '🎨'
  }
  return icons[type] || '🎬'
}

export function validateProjectDimensions(width: number, height: number): boolean {
  return width > 0 && height > 0 && width <= 7680 && height <= 4320
}

export function convertTimeToFrame(time: number, frameRate: number): number {
  return Math.floor(time * frameRate)
}

export function convertFrameToTime(frame: number, frameRate: number): number {
  return frame / frameRate
}

export function interpolateValue(
  start: number,
  end: number,
  progress: number,
  easing: EasingFunction = 'linear'
): number {
  let easedProgress = progress

  switch (easing) {
    case 'ease-in':
      easedProgress = progress * progress
      break
    case 'ease-out':
      easedProgress = progress * (2 - progress)
      break
    case 'ease-in-out':
      easedProgress = progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress
      break
    default:
      easedProgress = progress
  }

  return start + (end - start) * easedProgress
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

export function calculateBoundingBox(layers: any[]): {
  x: number
  y: number
  width: number
  height: number
} {
  if (layers.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  layers.forEach(layer => {
    const { position } = layer.transform
    minX = Math.min(minX, position.x)
    minY = Math.min(minY, position.y)
    maxX = Math.max(maxX, position.x)
    maxY = Math.max(maxY, position.y)
  })

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
}
