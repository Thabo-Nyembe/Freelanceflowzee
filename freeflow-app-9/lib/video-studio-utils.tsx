/**
 * ========================================
 * VIDEO STUDIO UTILITIES
 * ========================================
 *
 * Comprehensive TypeScript utilities for Video Studio
 * - Type definitions and interfaces
 * - Mock data generators
 * - Helper functions
 * - Video processing utilities
 *
 * Created: 2024-11-26
 * Session: 8 - Video Studio Refactoring
 */

import {
  Play, Pause, Video, FileVideo, Music, Image as ImageIcon,
  Type, Sparkles, Award, TrendingUp, Clock, Eye
} from 'lucide-react'
import { createFeatureLogger } from './logger'

const logger = createFeatureLogger('VideoStudioUtils')

// ========================================
// TYPE DEFINITIONS
// ========================================

export type VideoStatus = 'draft' | 'processing' | 'ready' | 'published' | 'archived'
export type VideoQuality = 'low' | 'medium' | 'high' | 'ultra' | '4k' | '8k'
export type AssetType = 'video' | 'audio' | 'image' | 'font' | 'transition' | 'effect' | 'overlay'
export type RecordingType = 'screen' | 'webcam' | 'both' | 'audio'
export type ExportFormat = 'mp4' | 'mov' | 'webm' | 'avi' | 'mkv'
export type TimelineItemType = 'video' | 'audio' | 'image' | 'text' | 'transition' | 'effect'
export type CaptionFormat = 'srt' | 'vtt' | 'ass' | 'json'
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed'

// ========================================
// INTERFACES
// ========================================

export interface VideoMetadata {
  fps: number
  bitrate: number
  codec: string
  colorSpace: string
  hasAudio: boolean
  audioCodec?: string
  channels?: number
  sampleRate?: number
  width: number
  height: number
}

export interface VideoProject {
  id: string
  title: string
  description: string
  duration: number // in seconds
  resolution: string
  format: ExportFormat
  fileSize: number // in bytes
  filePath: string
  thumbnailPath: string
  createdAt: string
  updatedAt: string
  status: VideoStatus
  userId: string
  clientId?: string
  projectId?: string
  views: number
  likes: number
  comments: number
  shares: number
  downloads: number
  tags: string[]
  metadata: VideoMetadata
  category: string
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  category: string
  duration: number
  resolution: string
  thumbnailPath: string
  previewUrl: string
  isPremium: boolean
  price?: number
  usageCount: number
  rating: number
  reviews: number
  tags: string[]
  createdAt: string
  features: string[]
}

export interface VideoAsset {
  id: string
  name: string
  type: AssetType
  duration?: number
  fileSize: number
  format: string
  filePath: string
  thumbnailPath: string
  createdAt: string
  tags: string[]
  metadata: any
  category: string
}

export interface VideoAnalytics {
  projectId: string
  views: number
  uniqueViews: number
  averageWatchTime: number
  completionRate: number
  engagement: number
  shares: number
  downloads: number
  comments: number
  likes: number
  dislikes: number
  topLocations: { country: string; views: number }[]
  deviceBreakdown: { device: string; percentage: number }[]
  trafficSources: { source: string; percentage: number }[]
}

export interface RecordingSettings {
  type: RecordingType
  quality: VideoQuality
  resolution: string
  fps: number
  audioEnabled: boolean
  microphoneId?: string
  cameraId?: string
  screenId?: string
  bitrate: number
}

export interface EditorState {
  timeline: TimelineItem[]
  selectedItem: string | null
  playheadPosition: number
  zoom: number
  volume: number
  isMuted: boolean
  isPlaying: boolean
  duration: number
}

export interface TimelineItem {
  id: string
  type: TimelineItemType
  startTime: number
  endTime: number
  duration: number
  assetId?: string
  properties: Record<string, any>
  layer: number
}

export interface VideoTranscript {
  id: string
  projectId: string
  status: TranscriptionStatus
  language: string
  text: string
  timestamps: { start: number; end: number; text: string }[]
  confidence: number
  createdAt: string
}

export interface VideoCaption {
  id: string
  projectId: string
  language: string
  format: CaptionFormat
  filePath: string
  isDefault: boolean
  createdAt: string
}

// ========================================
// MOCK DATA
// ========================================

export const MOCK_VIDEO_PROJECTS: VideoProject[] = [
  {
    id: 'VID-001',
    title: 'Product Launch Video - SaaS Platform',
    description: 'Professional product launch video showcasing our new SaaS features and benefits',
    duration: 185,
    resolution: '1920x1080',
    format: 'mp4',
    fileSize: 45678900,
    filePath: '/videos/product-launch-saas.mp4',
    thumbnailPath: '/thumbnails/product-launch-saas.jpg',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    userId: 'USER-001',
    clientId: 'CLIENT-001',
    views: 3547,
    likes: 892,
    comments: 156,
    shares: 234,
    downloads: 89,
    tags: ['product', 'saas', 'launch', 'marketing'],
    category: 'Marketing',
    metadata: {
      fps: 30,
      bitrate: 8000000,
      codec: 'h264',
      colorSpace: 'sRGB',
      hasAudio: true,
      audioCodec: 'aac',
      channels: 2,
      sampleRate: 48000,
      width: 1920,
      height: 1080
    }
  },
  {
    id: 'VID-002',
    title: 'Customer Testimonial - Enterprise Client',
    description: 'Authentic testimonial from Fortune 500 client discussing ROI and implementation success',
    duration: 124,
    resolution: '3840x2160',
    format: 'mp4',
    fileSize: 125678900,
    filePath: '/videos/testimonial-enterprise.mp4',
    thumbnailPath: '/thumbnails/testimonial-enterprise.jpg',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    userId: 'USER-001',
    clientId: 'CLIENT-002',
    views: 2134,
    likes: 567,
    comments: 89,
    shares: 145,
    downloads: 56,
    tags: ['testimonial', 'enterprise', 'case-study'],
    category: 'Testimonial',
    metadata: {
      fps: 60,
      bitrate: 20000000,
      codec: 'h265',
      colorSpace: 'HDR10',
      hasAudio: true,
      audioCodec: 'aac',
      channels: 2,
      sampleRate: 48000,
      width: 3840,
      height: 2160
    }
  },
  {
    id: 'VID-003',
    title: 'Tutorial: Getting Started with API',
    description: 'Step-by-step tutorial for developers integrating with our API',
    duration: 456,
    resolution: '1920x1080',
    format: 'mp4',
    fileSize: 89012300,
    filePath: '/videos/tutorial-api-basics.mp4',
    thumbnailPath: '/thumbnails/tutorial-api-basics.jpg',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    userId: 'USER-002',
    views: 8921,
    likes: 1234,
    comments: 345,
    shares: 456,
    downloads: 234,
    tags: ['tutorial', 'api', 'developer', 'education'],
    category: 'Training',
    metadata: {
      fps: 30,
      bitrate: 6000000,
      codec: 'h264',
      colorSpace: 'sRGB',
      hasAudio: true,
      audioCodec: 'aac',
      channels: 2,
      sampleRate: 44100,
      width: 1920,
      height: 1080
    }
  },
  {
    id: 'VID-004',
    title: 'Social Media Reel - Brand Awareness',
    description: '30-second engaging reel for Instagram and TikTok showcasing brand personality',
    duration: 30,
    resolution: '1080x1920',
    format: 'mp4',
    fileSize: 12345678,
    filePath: '/videos/social-reel-brand.mp4',
    thumbnailPath: '/thumbnails/social-reel-brand.jpg',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
    userId: 'USER-003',
    views: 15234,
    likes: 3456,
    comments: 567,
    shares: 890,
    downloads: 123,
    tags: ['social', 'instagram', 'tiktok', 'vertical'],
    category: 'Social',
    metadata: {
      fps: 30,
      bitrate: 10000000,
      codec: 'h264',
      colorSpace: 'sRGB',
      hasAudio: true,
      audioCodec: 'aac',
      channels: 2,
      sampleRate: 48000,
      width: 1080,
      height: 1920
    }
  },
  {
    id: 'VID-005',
    title: 'Webinar Recording - Q4 Strategy',
    description: 'Full recording of quarterly strategy webinar with leadership team',
    duration: 3245,
    resolution: '1920x1080',
    format: 'mp4',
    fileSize: 456789012,
    filePath: '/videos/webinar-q4-strategy.mp4',
    thumbnailPath: '/thumbnails/webinar-q4-strategy.jpg',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    userId: 'USER-001',
    views: 5678,
    likes: 234,
    comments: 89,
    shares: 56,
    downloads: 345,
    tags: ['webinar', 'strategy', 'internal'],
    category: 'Webinar',
    metadata: {
      fps: 30,
      bitrate: 4000000,
      codec: 'h264',
      colorSpace: 'sRGB',
      hasAudio: true,
      audioCodec: 'aac',
      channels: 2,
      sampleRate: 44100,
      width: 1920,
      height: 1080
    }
  },
  // Add 35 more projects with varying data...
  ...Array.from({ length: 35 }, (_, i) => {
    const num = i + 6
    const statuses: VideoStatus[] = ['draft', 'processing', 'ready', 'published', 'archived']
    const categories = ['Marketing', 'Training', 'Social', 'Testimonial', 'Webinar', 'Product Demo', 'Tutorial', 'Event']
    const resolutions = ['1920x1080', '3840x2160', '1280x720', '1080x1920', '2560x1440']

    return {
      id: `VID-${String(num).padStart(3, '0')}`,
      title: `Video Project ${num}`,
      description: `Professional video content for ${categories[num % categories.length].toLowerCase()} purposes`,
      duration: Math.floor(Math.random() * 600) + 30,
      resolution: resolutions[num % resolutions.length],
      format: 'mp4' as ExportFormat,
      fileSize: Math.floor(Math.random() * 500000000) + 10000000,
      filePath: `/videos/project-${num}.mp4`,
      thumbnailPath: `/thumbnails/project-${num}.jpg`,
      createdAt: new Date(Date.now() - (num * 24 * 60 * 60 * 1000)).toISOString(),
      updatedAt: new Date(Date.now() - ((num - 1) * 24 * 60 * 60 * 1000)).toISOString(),
      status: statuses[num % statuses.length],
      userId: `USER-${String(Math.floor(num / 10) + 1).padStart(3, '0')}`,
      clientId: num % 3 === 0 ? `CLIENT-${String(Math.floor(num / 3)).padStart(3, '0')}` : undefined,
      views: Math.floor(Math.random() * 10000),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 200),
      shares: Math.floor(Math.random() * 300),
      downloads: Math.floor(Math.random() * 150),
      tags: ['video', categories[num % categories.length].toLowerCase(), 'content'],
      category: categories[num % categories.length],
      metadata: {
        fps: [24, 30, 60][num % 3],
        bitrate: [4000000, 8000000, 20000000][num % 3],
        codec: num % 2 === 0 ? 'h264' : 'h265',
        colorSpace: 'sRGB',
        hasAudio: true,
        audioCodec: 'aac',
        channels: 2,
        sampleRate: num % 2 === 0 ? 44100 : 48000,
        width: parseInt(resolutions[num % resolutions.length].split('x')[0]),
        height: parseInt(resolutions[num % resolutions.length].split('x')[1])
      }
    }
  })
]

export const MOCK_VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: 'TMPL-001',
    name: 'Product Launch Intro',
    description: 'Cinematic intro template perfect for product launches and announcements',
    category: 'Marketing',
    duration: 15,
    resolution: '1920x1080',
    thumbnailPath: '/templates/product-launch-intro.jpg',
    previewUrl: '/templates/product-launch-intro.mp4',
    isPremium: true,
    price: 29.99,
    usageCount: 1234,
    rating: 4.8,
    reviews: 156,
    tags: ['intro', 'product', 'cinematic'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['Customizable Text', '4K Ready', 'Sound Effects', 'Logo Placeholder']
  },
  {
    id: 'TMPL-002',
    name: 'Social Media Story Pack',
    description: 'Collection of 10 vertical story templates for Instagram and TikTok',
    category: 'Social',
    duration: 30,
    resolution: '1080x1920',
    thumbnailPath: '/templates/social-story-pack.jpg',
    previewUrl: '/templates/social-story-pack.mp4',
    isPremium: false,
    usageCount: 5678,
    rating: 4.6,
    reviews: 892,
    tags: ['social', 'instagram', 'tiktok', 'stories'],
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['10 Variations', 'Vertical Format', 'Trending Transitions', 'Music Included']
  },
  {
    id: 'TMPL-003',
    name: 'Corporate Presentation',
    description: 'Professional presentation template for business and corporate videos',
    category: 'Business',
    duration: 120,
    resolution: '1920x1080',
    thumbnailPath: '/templates/corporate-presentation.jpg',
    previewUrl: '/templates/corporate-presentation.mp4',
    isPremium: true,
    price: 49.99,
    usageCount: 892,
    rating: 4.9,
    reviews: 234,
    tags: ['corporate', 'business', 'professional'],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['Data Charts', 'Infographics', 'Professional Fonts', 'Color Schemes']
  },
  {
    id: 'TMPL-004',
    name: 'Tutorial Walkthrough',
    description: 'Clean and clear template for software tutorials and how-to videos',
    category: 'Education',
    duration: 180,
    resolution: '1920x1080',
    thumbnailPath: '/templates/tutorial-walkthrough.jpg',
    previewUrl: '/templates/tutorial-walkthrough.mp4',
    isPremium: false,
    usageCount: 3456,
    rating: 4.7,
    reviews: 567,
    tags: ['tutorial', 'education', 'software'],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['Screen Recording Layout', 'Call-out Animations', 'Progress Indicators', 'Chapter Markers']
  },
  {
    id: 'TMPL-005',
    name: 'Testimonial Showcase',
    description: 'Elegant template for customer testimonials and case studies',
    category: 'Marketing',
    duration: 90,
    resolution: '1920x1080',
    thumbnailPath: '/templates/testimonial-showcase.jpg',
    previewUrl: '/templates/testimonial-showcase.mp4',
    isPremium: true,
    price: 39.99,
    usageCount: 1567,
    rating: 4.8,
    reviews: 345,
    tags: ['testimonial', 'case-study', 'customer'],
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    features: ['Quote Animations', 'Photo Frames', 'Rating Stars', 'Company Logos']
  },
  ...Array.from({ length: 20 }, (_, i) => {
    const num = i + 6
    const categories = ['Marketing', 'Social', 'Business', 'Education', 'Entertainment']

    return {
      id: `TMPL-${String(num).padStart(3, '0')}`,
      name: `Template ${num}`,
      description: `Professional video template for ${categories[num % categories.length].toLowerCase()} content`,
      category: categories[num % categories.length],
      duration: Math.floor(Math.random() * 120) + 15,
      resolution: num % 2 === 0 ? '1920x1080' : '3840x2160',
      thumbnailPath: `/templates/template-${num}.jpg`,
      previewUrl: `/templates/template-${num}.mp4`,
      isPremium: num % 3 === 0,
      price: num % 3 === 0 ? Math.floor(Math.random() * 50) + 20 : undefined,
      usageCount: Math.floor(Math.random() * 5000),
      rating: 4.0 + Math.random(),
      reviews: Math.floor(Math.random() * 500),
      tags: ['template', categories[num % categories.length].toLowerCase()],
      createdAt: new Date(Date.now() - (num * 5 * 24 * 60 * 60 * 1000)).toISOString(),
      features: ['Customizable', 'HD Quality', 'Easy to Edit', 'No Plugins']
    }
  })
]

export const MOCK_VIDEO_ASSETS: VideoAsset[] = [
  {
    id: 'ASSET-001',
    name: 'Corporate Background Music',
    type: 'audio',
    duration: 180,
    fileSize: 5678900,
    format: 'mp3',
    filePath: '/assets/audio/corporate-bg.mp3',
    thumbnailPath: '/assets/audio/corporate-bg-thumb.jpg',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['music', 'corporate', 'background'],
    category: 'Audio',
    metadata: { bitrate: 320000, sampleRate: 48000 }
  },
  {
    id: 'ASSET-002',
    name: 'Smooth Fade Transition',
    type: 'transition',
    duration: 1,
    fileSize: 123456,
    format: 'webm',
    filePath: '/assets/transitions/smooth-fade.webm',
    thumbnailPath: '/assets/transitions/smooth-fade-thumb.jpg',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['transition', 'fade', 'smooth'],
    category: 'Transition',
    metadata: { type: 'fade', duration: 1000 }
  },
  {
    id: 'ASSET-003',
    name: 'Brand Logo Animation',
    type: 'video',
    duration: 5,
    fileSize: 2345678,
    format: 'mp4',
    filePath: '/assets/video/logo-animation.mp4',
    thumbnailPath: '/assets/video/logo-animation-thumb.jpg',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['logo', 'animation', 'brand'],
    category: 'Video',
    metadata: { hasAlpha: true, fps: 60 }
  },
  ...Array.from({ length: 27 }, (_, i) => {
    const num = i + 4
    const types: AssetType[] = ['video', 'audio', 'image', 'transition', 'effect', 'overlay']
    const categories = ['Video', 'Audio', 'Image', 'Transition', 'Effect', 'Overlay']

    return {
      id: `ASSET-${String(num).padStart(3, '0')}`,
      name: `Asset ${num}`,
      type: types[num % types.length],
      duration: types[num % types.length] === 'image' ? undefined : Math.floor(Math.random() * 30) + 1,
      fileSize: Math.floor(Math.random() * 10000000) + 100000,
      format: types[num % types.length] === 'audio' ? 'mp3' : types[num % types.length] === 'image' ? 'png' : 'mp4',
      filePath: `/assets/${types[num % types.length]}/asset-${num}`,
      thumbnailPath: `/assets/${types[num % types.length]}/asset-${num}-thumb.jpg`,
      createdAt: new Date(Date.now() - (num * 2 * 24 * 60 * 60 * 1000)).toISOString(),
      tags: [types[num % types.length], 'asset'],
      category: categories[num % categories.length],
      metadata: {}
    }
  })
]

// ========================================
// HELPER FUNCTIONS
// ========================================

export function formatVideoDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

export function formatBitrate(bps: number): string {
  if (bps < 1000000) {
    return `${Math.floor(bps / 1000)} kbps`
  }
  return `${(bps / 1000000).toFixed(1)} Mbps`
}

export function formatResolution(width: number, height: number): string {
  if (width === 1920 && height === 1080) return '1080p'
  if (width === 1280 && height === 720) return '720p'
  if (width === 3840 && height === 2160) return '4K'
  if (width === 7680 && height === 4320) return '8K'
  if (width === 1080 && height === 1920) return '1080p Vertical'
  return `${width}x${height}`
}

export function calculateVideoSize(duration: number, bitrate: number): number {
  return Math.floor((duration * bitrate) / 8)
}

export function getVideoQualityLabel(resolution: string): string {
  if (resolution === '3840x2160') return '4K Ultra HD'
  if (resolution === '1920x1080') return 'Full HD'
  if (resolution === '1280x720') return 'HD'
  if (resolution === '7680x4320') return '8K'
  return resolution
}

export function getStatusColor(status: VideoStatus): string {
  const colors: Record<VideoStatus, string> = {
    draft: 'gray',
    processing: 'blue',
    ready: 'green',
    published: 'purple',
    archived: 'slate'
  }
  return colors[status] || 'gray'
}

export function getStatusIcon(status: VideoStatus) {
  const icons: Record<VideoStatus, any> = {
    draft: FileVideo,
    processing: Clock,
    ready: Play,
    published: TrendingUp,
    archived: Award
  }
  return icons[status] || FileVideo
}

export function getTemplateCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Marketing: 'purple',
    Social: 'pink',
    Business: 'blue',
    Education: 'green',
    Entertainment: 'amber',
    Testimonial: 'cyan'
  }
  return colors[category] || 'gray'
}

export function getAssetTypeIcon(type: AssetType) {
  const icons: Record<AssetType, any> = {
    video: Video,
    audio: Music,
    image: ImageIcon,
    font: Type,
    transition: Sparkles,
    effect: Sparkles,
    overlay: ImageIcon
  }
  return icons[type] || FileVideo
}

export function calculateCompletionRate(views: number, completions: number): number {
  if (views === 0) return 0
  return Math.min(100, Math.round((completions / views) * 100))
}

export function calculateEngagementScore(analytics: VideoAnalytics): number {
  const {
    views,
    likes,
    comments,
    shares,
    completionRate,
    averageWatchTime
  } = analytics

  if (views === 0) return 0

  const likeRate = (likes / views) * 100
  const commentRate = (comments / views) * 100
  const shareRate = (shares / views) * 100

  const score =
    likeRate * 0.3 +
    commentRate * 0.2 +
    shareRate * 0.2 +
    completionRate * 0.2 +
    averageWatchTime * 0.1

  return Math.min(100, Math.round(score))
}

export function sortProjectsByDate(projects: VideoProject[]): VideoProject[] {
  return [...projects].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export function sortProjectsByViews(projects: VideoProject[]): VideoProject[] {
  return [...projects].sort((a, b) => b.views - a.views)
}

export function filterProjectsByStatus(
  projects: VideoProject[],
  status: VideoStatus
): VideoProject[] {
  return projects.filter(p => p.status === status)
}

export function filterProjectsByTag(
  projects: VideoProject[],
  tag: string
): VideoProject[] {
  return projects.filter(p => p.tags.includes(tag.toLowerCase()))
}

export function searchProjects(
  projects: VideoProject[],
  query: string
): VideoProject[] {
  const lowercaseQuery = query.toLowerCase()
  return projects.filter(
    p =>
      p.title.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

export function getTopPerformingProjects(
  projects: VideoProject[],
  limit: number = 10
): VideoProject[] {
  return sortProjectsByViews(projects).slice(0, limit)
}

export function getProjectsByCategory(
  projects: VideoProject[],
  category: string
): VideoProject[] {
  return projects.filter(p => p.category === category)
}

export function getRecentProjects(
  projects: VideoProject[],
  days: number = 7
): VideoProject[] {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return projects.filter(p => new Date(p.createdAt) > cutoff)
}

export function getTotalVideoDuration(projects: VideoProject[]): number {
  return projects.reduce((sum, p) => sum + p.duration, 0)
}

export function getTotalStorageUsed(projects: VideoProject[]): number {
  return projects.reduce((sum, p) => sum + p.fileSize, 0)
}

export function getAverageVideoLength(projects: VideoProject[]): number {
  if (projects.length === 0) return 0
  return Math.floor(getTotalVideoDuration(projects) / projects.length)
}

export function getPublishedProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'published')
}

export function getDraftProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'draft')
}

export function getProcessingProjects(projects: VideoProject[]): VideoProject[] {
  return filterProjectsByStatus(projects, 'processing')
}

logger.info('Video Studio utilities loaded', {
  projects: MOCK_VIDEO_PROJECTS.length,
  templates: MOCK_VIDEO_TEMPLATES.length,
  assets: MOCK_VIDEO_ASSETS.length
})
