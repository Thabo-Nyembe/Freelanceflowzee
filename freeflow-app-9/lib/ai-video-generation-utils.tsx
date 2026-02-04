/**
 * 🎬 AI VIDEO GENERATION UTILITIES
 * Comprehensive utilities for AI-powered video generation and management
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AI-Video-Generation-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type VideoStyle = 'cinematic' | 'professional' | 'casual' | 'animated' | 'explainer' | 'social-media'
export type VideoFormat = 'landscape' | 'portrait' | 'square' | 'widescreen'
export type VideoQuality = 'sd' | 'hd' | 'full-hd' | '4k'
export type AIModel = 'kazi-ai' | 'runway-gen3' | 'pika-labs' | 'stable-video'
export type GenerationStatus = 'idle' | 'analyzing' | 'generating' | 'rendering' | 'completed' | 'failed'
export type VideoCategory = 'marketing' | 'tutorial' | 'entertainment' | 'business' | 'education' | 'social'

export interface GeneratedVideo {
  id: string
  userId: string
  title: string
  prompt: string
  style: VideoStyle
  format: VideoFormat
  quality: VideoQuality
  aiModel: AIModel
  status: GenerationStatus
  progress: number
  videoUrl?: string
  thumbnailUrl: string
  duration: number // in seconds
  fileSize: number // in bytes
  views: number
  downloads: number
  likes: number
  shares: number
  isPublic: boolean
  tags: string[]
  category: VideoCategory
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  metadata: VideoMetadata
}

export interface VideoMetadata {
  width: number
  height: number
  fps: number
  codec: string
  bitrate: string
  aspectRatio: string
  colorSpace?: string
  audioCodec?: string
  audioBitrate?: string
}

export interface VideoTemplate {
  id: string
  name: string
  description: string
  thumbnail: string
  style: VideoStyle
  format: VideoFormat
  duration: number
  scenes: number
  premium: boolean
  category: VideoCategory
  tags: string[]
  price?: number
}

export interface GenerationSettings {
  userId: string
  defaultModel: AIModel
  defaultQuality: VideoQuality
  defaultFormat: VideoFormat
  autoSave: boolean
  highQualityPreviews: boolean
  watermarkEnabled: boolean
  maxConcurrentGenerations: number
}

export interface VideoAnalytics {
  videoId: string
  totalViews: number
  uniqueViews: number
  totalDownloads: number
  totalShares: number
  totalLikes: number
  avgWatchTime: number // in seconds
  completionRate: number // 0-100
  engagementScore: number // 0-100
  viewsByDevice: {
    desktop: number
    mobile: number
    tablet: number
  }
  viewsByCountry: {
    [country: string]: number
  }
}

// ============================================================================
// MOCK DATA - 60 Generated Videos
// ============================================================================

const VIDEO_PROMPTS = [
  'A serene sunset over mountains with flying birds in cinematic slow motion',
  'Modern office space with creative team collaborating on innovative projects',
  'Product showcase with elegant lighting and 360-degree rotation',
  'Energetic fitness workout in urban environment with dynamic camera angles',
  'Cozy coffee shop ambiance with morning sunlight streaming through windows',
  'Tech startup office with innovative workspace and cutting-edge technology',
  'Fashion model walking down neon-lit city street at night',
  'Cooking tutorial with fresh ingredients close-up and step-by-step process',
  'Travel vlog exploring ancient temple ruins in Southeast Asia',
  'Music video with abstract light patterns and synchronized visual effects',
  'Real estate tour of luxury penthouse apartment with city views',
  'Educational explainer about space exploration and Mars colonization',
  'Corporate presentation with animated data visualization and infographics',
  'Gaming highlights with epic battle sequences and special effects',
  'Nature documentary with wildlife in dense tropical forest',
  'Social media ad for sustainable eco-friendly products',
  'Wedding ceremony in beautiful garden setting with romantic atmosphere',
  'Automotive review with sports car on professional race track',
  'Meditation guide with calming ocean waves and peaceful scenery',
  'Art timelapse of painting coming to life stroke by stroke',
  'Drone footage of coastal landscape with waves crashing on rocks',
  'Product unboxing with dramatic reveals and close-up details',
  'Dance performance in urban setting with street art background',
  'Food commercial with ingredients floating in mid-air',
  'Technology review showcasing latest smartphone features',
  'Fitness transformation journey with before and after sequences',
  'Behind-the-scenes look at professional photography studio',
  'Real estate walkthrough of modern minimalist home',
  'Tutorial on digital illustration techniques and workflow',
  'Brand story showing company evolution and growth timeline'
]

const VIDEO_TAGS = [
  'cinematic', 'professional', 'creative', 'marketing', 'tutorial',
  'lifestyle', 'business', 'tech', 'fashion', 'travel',
  'food', 'fitness', 'music', 'gaming', 'education',
  'nature', 'product', 'commercial', 'vlog', 'documentary',
  'animation', 'explainer', 'social-media', 'corporate', 'startup',
  'real-estate', 'automotive', 'wellness', 'art', 'photography'
]

export const mockGeneratedVideos: GeneratedVideo[] = Array.from({ length: 60 }, (_, i) => {
  const styles: VideoStyle[] = ['cinematic', 'professional', 'casual', 'animated', 'explainer', 'social-media']
  const formats: VideoFormat[] = ['landscape', 'portrait', 'square', 'widescreen']
  const qualities: VideoQuality[] = ['sd', 'hd', 'full-hd', '4k']
  const models: AIModel[] = ['kazi-ai', 'runway-gen3', 'pika-labs', 'stable-video']
  const statuses: GenerationStatus[] = ['completed', 'generating', 'failed']
  const categories: VideoCategory[] = ['marketing', 'tutorial', 'entertainment', 'business', 'education', 'social']

  const style = styles[Math.floor(Math.random() * styles.length)]
  const format = formats[Math.floor(Math.random() * formats.length)]
  const quality = qualities[Math.floor(Math.random() * qualities.length)]
  const model = models[Math.floor(Math.random() * models.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const category = categories[Math.floor(Math.random() * categories.length)]
  const prompt = VIDEO_PROMPTS[i % VIDEO_PROMPTS.length]

  const createdDate = new Date()
  createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90))

  const duration = 15 + Math.floor(Math.random() * 90) // 15-105 seconds
  const fileSize = duration * 1024 * 1024 * (quality === '4k' ? 8 : quality === 'full-hd' ? 4 : quality === 'hd' ? 2 : 1)

  const numTags = 2 + Math.floor(Math.random() * 4)
  const tags = Array.from({ length: numTags }, () =>
    VIDEO_TAGS[Math.floor(Math.random() * VIDEO_TAGS.length)]
  ).filter((tag, index, self) => self.indexOf(tag) === index)

  const width = format === 'landscape' ? 1920 : format === 'portrait' ? 1080 : format === 'square' ? 1080 : 2560
  const height = format === 'landscape' ? 1080 : format === 'portrait' ? 1920 : format === 'square' ? 1080 : 1440

  return {
    id: `vid_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'user_demo_123',
    title: prompt.substring(0, 60),
    prompt,
    style,
    format,
    quality,
    aiModel: model,
    status,
    progress: status === 'completed' ? 100 : status === 'generating' ? 50 + Math.floor(Math.random() * 30) : 0,
    videoUrl: status === 'completed' ? `/videos/${i % 10 + 1}.mp4` : undefined,
    thumbnailUrl: `/videos/thumbnails/${i % 20 + 1}.jpg`,
    duration,
    fileSize,
    views: Math.floor(Math.random() * 5000),
    downloads: Math.floor(Math.random() * 500),
    likes: Math.floor(Math.random() * 1000),
    shares: Math.floor(Math.random() * 200),
    isPublic: Math.random() > 0.5,
    tags,
    category,
    createdAt: createdDate,
    updatedAt: createdDate,
    completedAt: status === 'completed' ? new Date(createdDate.getTime() + duration * 1000) : undefined,
    metadata: {
      width,
      height,
      fps: 30,
      codec: 'h264',
      bitrate: quality === '4k' ? '40 Mbps' : quality === 'full-hd' ? '20 Mbps' : quality === 'hd' ? '10 Mbps' : '5 Mbps',
      aspectRatio: format === 'landscape' ? '16:9' : format === 'portrait' ? '9:16' : format === 'square' ? '1:1' : '21:9',
      colorSpace: 'sRGB',
      audioCodec: 'aac',
      audioBitrate: '192 kbps'
    }
  }
})

// ============================================================================
// MOCK DATA - 12 Video Templates
// ============================================================================

export const mockVideoTemplates: VideoTemplate[] = [
  {
    id: 'tpl_1',
    name: 'Product Showcase',
    description: 'Professional product presentation with elegant animations and 360° rotation views',
    thumbnail: '/templates/product-showcase.jpg',
    style: 'professional',
    format: 'landscape',
    duration: 30,
    scenes: 5,
    premium: false,
    category: 'marketing',
    tags: ['product', 'commercial', 'professional', 'showcase'],
    price: 0
  },
  {
    id: 'tpl_2',
    name: 'Social Media Ad',
    description: 'Eye-catching vertical video optimized for Instagram, TikTok, and Stories',
    thumbnail: '/templates/social-ad.jpg',
    style: 'social-media',
    format: 'portrait',
    duration: 15,
    scenes: 3,
    premium: false,
    category: 'social',
    tags: ['social-media', 'instagram', 'tiktok', 'short-form'],
    price: 0
  },
  {
    id: 'tpl_3',
    name: 'Cinematic Trailer',
    description: 'Epic cinematic video with dramatic effects and professional color grading',
    thumbnail: '/templates/cinematic-trailer.jpg',
    style: 'cinematic',
    format: 'widescreen',
    duration: 60,
    scenes: 8,
    premium: true,
    category: 'entertainment',
    tags: ['cinematic', 'trailer', 'epic', 'dramatic'],
    price: 29
  },
  {
    id: 'tpl_4',
    name: 'Explainer Video',
    description: 'Clear educational content with animated illustrations and infographics',
    thumbnail: '/templates/explainer.jpg',
    style: 'explainer',
    format: 'landscape',
    duration: 45,
    scenes: 6,
    premium: false,
    category: 'education',
    tags: ['explainer', 'education', 'tutorial', 'animated'],
    price: 0
  },
  {
    id: 'tpl_5',
    name: 'Brand Story',
    description: 'Compelling brand narrative with emotional storytelling and impact',
    thumbnail: '/templates/brand-story.jpg',
    style: 'cinematic',
    format: 'landscape',
    duration: 90,
    scenes: 10,
    premium: true,
    category: 'business',
    tags: ['brand', 'storytelling', 'corporate', 'professional'],
    price: 49
  },
  {
    id: 'tpl_6',
    name: 'Quick Tutorial',
    description: 'Fast-paced how-to video perfect for social media platforms',
    thumbnail: '/templates/quick-tutorial.jpg',
    style: 'casual',
    format: 'square',
    duration: 20,
    scenes: 4,
    premium: false,
    category: 'tutorial',
    tags: ['tutorial', 'how-to', 'quick', 'casual'],
    price: 0
  },
  {
    id: 'tpl_7',
    name: 'Real Estate Tour',
    description: 'Professional property walkthrough with smooth transitions',
    thumbnail: '/templates/real-estate.jpg',
    style: 'professional',
    format: 'landscape',
    duration: 120,
    scenes: 12,
    premium: true,
    category: 'business',
    tags: ['real-estate', 'property', 'tour', 'professional'],
    price: 39
  },
  {
    id: 'tpl_8',
    name: 'Food Commercial',
    description: 'Appetizing food video with close-ups and slow motion effects',
    thumbnail: '/templates/food-commercial.jpg',
    style: 'cinematic',
    format: 'landscape',
    duration: 30,
    scenes: 6,
    premium: false,
    category: 'marketing',
    tags: ['food', 'commercial', 'cinematic', 'appetizing'],
    price: 0
  },
  {
    id: 'tpl_9',
    name: 'Testimonial Video',
    description: 'Customer testimonial with professional interview setup',
    thumbnail: '/templates/testimonial.jpg',
    style: 'professional',
    format: 'landscape',
    duration: 60,
    scenes: 5,
    premium: false,
    category: 'business',
    tags: ['testimonial', 'interview', 'customer', 'professional'],
    price: 0
  },
  {
    id: 'tpl_10',
    name: 'Event Highlights',
    description: 'Dynamic event recap with energetic pacing and music',
    thumbnail: '/templates/event-highlights.jpg',
    style: 'casual',
    format: 'landscape',
    duration: 90,
    scenes: 15,
    premium: true,
    category: 'entertainment',
    tags: ['event', 'highlights', 'recap', 'dynamic'],
    price: 35
  },
  {
    id: 'tpl_11',
    name: 'Product Demo',
    description: 'Step-by-step product demonstration with annotations',
    thumbnail: '/templates/product-demo.jpg',
    style: 'explainer',
    format: 'landscape',
    duration: 120,
    scenes: 10,
    premium: false,
    category: 'tutorial',
    tags: ['product', 'demo', 'tutorial', 'explainer'],
    price: 0
  },
  {
    id: 'tpl_12',
    name: 'Motion Graphics Intro',
    description: 'Eye-catching animated intro with logo reveal',
    thumbnail: '/templates/motion-intro.jpg',
    style: 'animated',
    format: 'landscape',
    duration: 10,
    scenes: 3,
    premium: true,
    category: 'business',
    tags: ['animation', 'intro', 'logo', 'motion-graphics'],
    price: 25
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

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

export function getStatusColor(status: GenerationStatus): string {
  switch (status) {
    case 'completed': return 'text-green-400'
    case 'generating': return 'text-blue-400'
    case 'analyzing': return 'text-yellow-400'
    case 'rendering': return 'text-purple-400'
    case 'failed': return 'text-red-400'
    default: return 'text-gray-400'
  }
}

export function getStatusBadgeColor(status: GenerationStatus): string {
  switch (status) {
    case 'completed': return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'generating': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'analyzing': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    case 'rendering': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    case 'failed': return 'bg-red-500/20 text-red-300 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

export function calculateEngagementScore(video: GeneratedVideo): number {
  const viewWeight = 0.3
  const downloadWeight = 0.3
  const likeWeight = 0.25
  const shareWeight = 0.15

  const maxViews = 10000
  const maxDownloads = 1000
  const maxLikes = 2000
  const maxShares = 500

  const viewScore = Math.min((video.views / maxViews) * 100, 100)
  const downloadScore = Math.min((video.downloads / maxDownloads) * 100, 100)
  const likeScore = Math.min((video.likes / maxLikes) * 100, 100)
  const shareScore = Math.min((video.shares / maxShares) * 100, 100)

  return Math.round(
    viewScore * viewWeight +
    downloadScore * downloadWeight +
    likeScore * likeWeight +
    shareScore * shareWeight
  )
}

export function getVideosByStatus(videos: GeneratedVideo[], status: GenerationStatus): GeneratedVideo[] {
  logger.debug('Filtering videos by status', { status, totalVideos: videos.length })
  return videos.filter(v => v.status === status)
}

export function getVideosByQuality(videos: GeneratedVideo[], quality: VideoQuality): GeneratedVideo[] {
  logger.debug('Filtering videos by quality', { quality, totalVideos: videos.length })
  return videos.filter(v => v.quality === quality)
}

export function getVideosByCategory(videos: GeneratedVideo[], category: VideoCategory): GeneratedVideo[] {
  logger.debug('Filtering videos by category', { category, totalVideos: videos.length })
  return videos.filter(v => v.category === category)
}

export function searchVideos(videos: GeneratedVideo[], searchTerm: string): GeneratedVideo[] {
  const searchLower = searchTerm.toLowerCase()
  logger.debug('Searching videos', { searchTerm, totalVideos: videos.length })

  return videos.filter(v =>
    v.title.toLowerCase().includes(searchLower) ||
    v.prompt.toLowerCase().includes(searchLower) ||
    v.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
    v.category.toLowerCase().includes(searchLower)
  )
}

export function sortVideos(
  videos: GeneratedVideo[],
  sortBy: 'date' | 'title' | 'duration' | 'views' | 'downloads' | 'likes' | 'engagement'
): GeneratedVideo[] {
  logger.debug('Sorting videos', { sortBy, totalVideos: videos.length })

  return [...videos].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'duration':
        return b.duration - a.duration
      case 'views':
        return b.views - a.views
      case 'downloads':
        return b.downloads - a.downloads
      case 'likes':
        return b.likes - a.likes
      case 'engagement':
        return calculateEngagementScore(b) - calculateEngagementScore(a)
      case 'date':
      default:
        return b.createdAt.getTime() - a.createdAt.getTime()
    }
  })
}

export function getPopularVideos(videos: GeneratedVideo[], limit: number = 10): GeneratedVideo[] {
  logger.debug('Getting popular videos', { limit, totalVideos: videos.length })
  return sortVideos(videos, 'views').slice(0, limit)
}

export function getTrendingVideos(videos: GeneratedVideo[], limit: number = 10): GeneratedVideo[] {
  logger.debug('Getting trending videos', { limit, totalVideos: videos.length })

  // Trending = high engagement in recent videos
  const recentVideos = videos.filter(v => {
    const daysSinceCreated = (Date.now() - v.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreated <= 30
  })

  return sortVideos(recentVideos, 'engagement').slice(0, limit)
}

export function calculateVideoStats(videos: GeneratedVideo[]) {
  logger.debug('Calculating video statistics', { totalVideos: videos.length })

  const total = videos.length
  const completed = videos.filter(v => v.status === 'completed').length
  const generating = videos.filter(v => v.status === 'generating').length
  const failed = videos.filter(v => v.status === 'failed').length
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalDownloads = videos.reduce((sum, v) => sum + v.downloads, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0)
  const totalShares = videos.reduce((sum, v) => sum + v.shares, 0)
  const totalDuration = videos
    .filter(v => v.status === 'completed')
    .reduce((sum, v) => sum + v.duration, 0)
  const totalFileSize = videos
    .filter(v => v.status === 'completed')
    .reduce((sum, v) => sum + v.fileSize, 0)
  const publicVideos = videos.filter(v => v.isPublic).length
  const avgDuration = completed > 0 ? Math.round(totalDuration / completed) : 0
  const avgEngagement = completed > 0
    ? Math.round(videos.reduce((sum, v) => sum + calculateEngagementScore(v), 0) / completed)
    : 0

  const stats = {
    total,
    completed,
    generating,
    failed,
    totalViews,
    totalDownloads,
    totalLikes,
    totalShares,
    totalDuration,
    totalFileSize,
    publicVideos,
    avgDuration,
    avgEngagement,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    successRate: total > 0 ? Math.round((completed / (completed + failed)) * 100) : 0
  }

  logger.info('Video statistics calculated', stats)
  return stats
}

export function getTemplatesByCategory(templates: VideoTemplate[], category: VideoCategory): VideoTemplate[] {
  logger.debug('Filtering templates by category', { category, totalTemplates: templates.length })
  return templates.filter(t => t.category === category)
}

export function getPremiumTemplates(templates: VideoTemplate[]): VideoTemplate[] {
  logger.debug('Getting premium templates', { totalTemplates: templates.length })
  return templates.filter(t => t.premium)
}

export function getFreeTemplates(templates: VideoTemplate[]): VideoTemplate[] {
  logger.debug('Getting free templates', { totalTemplates: templates.length })
  return templates.filter(t => !t.premium)
}

logger.info('AI Video Generation utilities initialized', {
  mockVideos: mockGeneratedVideos.length,
  mockTemplates: mockVideoTemplates.length
})
