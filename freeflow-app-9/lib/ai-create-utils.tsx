/**
 * AI Create Utilities
 * Comprehensive utilities for AI-powered creative asset generation
 * Integrates with Universal Pinpoint System for world-class A+++ capabilities
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AICreateUtils')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface GeneratedAsset {
  id: string
  name: string
  type: string
  field: string // photography, videography, ui-ux-design, graphic-design, music-production, web-development, software-development, content-writing
  style: string
  colorScheme: string
  fileUrl: string
  thumbnailUrl: string
  metadata: {
    format: string
    size: number // in bytes
    dimensions?: string
    duration?: number // in seconds for video/audio
    quality: 'draft' | 'standard' | 'professional' | 'premium'
  }
  prompt: string
  createdAt: string
  downloads: number
  likes: number
  hasUPSFeedback: boolean // Universal Pinpoint System integration flag
  upsCommentCount: number
}

export interface AssetVersion {
  id: string
  assetId: string
  versionNumber: number
  changes: string
  createdAt: string
  fileUrl: string
}

export interface AIModel {
  id: string
  name: string
  provider: string
  category: string[]
  performance: number // 1-10 scale
  costPerGeneration: number // in USD
}

export interface GenerationSettings {
  model: string
  quality: 'draft' | 'standard' | 'professional' | 'premium'
  batchMode: boolean
  batchSize: number
  style: string
  colorScheme: string
  customPrompt?: string
  referenceImage?: string
}

export interface ExportOptions {
  format: string
  quality: number // 1-100
  includeMetadata: boolean
  watermark?: boolean
}

// ============================================================================
// MOCK DATA - 20+ DIVERSE EXAMPLES
// ============================================================================

export const MOCK_GENERATED_ASSETS: GeneratedAsset[] = [
  // Photography Assets
  {
    id: 'asset-photo-1',
    name: 'Cinematic Sunset LUT',
    type: 'luts',
    field: 'photography',
    style: 'Cinematic',
    colorScheme: 'Warm',
    fileUrl: '/assets/luts/cinematic-sunset.cube',
    thumbnailUrl: '/assets/thumbnails/lut-1.jpg',
    metadata: {
      format: '.cube',
      size: 2048000,
      quality: 'professional'
    },
    prompt: 'Create a warm, cinematic LUT with golden hour tones and deep shadows',
    createdAt: '2025-01-15T10:30:00Z',
    downloads: 1247,
    likes: 892,
    hasUPSFeedback: true,
    upsCommentCount: 5
  },
  {
    id: 'asset-photo-2',
    name: 'Moody Noir Preset',
    type: 'presets',
    field: 'photography',
    style: 'Bold',
    colorScheme: 'Dark',
    fileUrl: '/assets/presets/moody-noir.xmp',
    thumbnailUrl: '/assets/thumbnails/preset-1.jpg',
    metadata: {
      format: '.xmp',
      size: 512000,
      quality: 'premium'
    },
    prompt: 'Film noir inspired preset with high contrast and desaturated tones',
    createdAt: '2025-01-14T14:20:00Z',
    downloads: 834,
    likes: 621,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },
  {
    id: 'asset-photo-3',
    name: 'Light Leak Overlay Pack',
    type: 'overlays',
    field: 'photography',
    style: 'Artistic',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/overlays/light-leaks.zip',
    thumbnailUrl: '/assets/thumbnails/overlay-1.jpg',
    metadata: {
      format: '.png',
      size: 15360000,
      dimensions: '4096x4096',
      quality: 'premium'
    },
    prompt: '10 vintage light leak overlays with rainbow and warm tones',
    createdAt: '2025-01-13T09:15:00Z',
    downloads: 2103,
    likes: 1456,
    hasUPSFeedback: true,
    upsCommentCount: 12
  },

  // Videography Assets
  {
    id: 'asset-video-1',
    name: 'Blockbuster Color Grade',
    type: 'luts',
    field: 'videography',
    style: 'Cinematic',
    colorScheme: 'Cool',
    fileUrl: '/assets/video/blockbuster-grade.cube',
    thumbnailUrl: '/assets/thumbnails/video-lut-1.jpg',
    metadata: {
      format: '.cube',
      size: 3072000,
      quality: 'premium'
    },
    prompt: 'Hollywood blockbuster color grading with teal shadows and orange highlights',
    createdAt: '2025-01-16T11:45:00Z',
    downloads: 1892,
    likes: 1334,
    hasUPSFeedback: true,
    upsCommentCount: 8
  },
  {
    id: 'asset-video-2',
    name: 'Smooth Zoom Transitions',
    type: 'transitions',
    field: 'videography',
    style: 'Modern',
    colorScheme: 'Light',
    fileUrl: '/assets/video/zoom-transitions.prproj',
    thumbnailUrl: '/assets/thumbnails/transition-1.jpg',
    metadata: {
      format: '.prproj',
      size: 4096000,
      duration: 2,
      quality: 'professional'
    },
    prompt: '5 smooth zoom transition effects for Premiere Pro',
    createdAt: '2025-01-15T16:30:00Z',
    downloads: 1567,
    likes: 1089,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },
  {
    id: 'asset-video-3',
    name: 'Lower Thirds Bundle',
    type: 'overlays',
    field: 'videography',
    style: 'Professional',
    colorScheme: 'Monochrome',
    fileUrl: '/assets/video/lower-thirds.zip',
    thumbnailUrl: '/assets/thumbnails/lower-thirds-1.jpg',
    metadata: {
      format: '.mogrt',
      size: 8192000,
      duration: 5,
      quality: 'premium'
    },
    prompt: '12 animated lower thirds with customizable text and colors',
    createdAt: '2025-01-12T13:20:00Z',
    downloads: 2456,
    likes: 1823,
    hasUPSFeedback: true,
    upsCommentCount: 15
  },

  // UI/UX Design Assets
  {
    id: 'asset-ui-1',
    name: 'Modern Dashboard Components',
    type: 'figma-components',
    field: 'ui-ux-design',
    style: 'Modern',
    colorScheme: 'Light',
    fileUrl: '/assets/ui/dashboard-components.fig',
    thumbnailUrl: '/assets/thumbnails/ui-1.jpg',
    metadata: {
      format: '.fig',
      size: 6144000,
      quality: 'premium'
    },
    prompt: 'Complete dashboard component library with charts, tables, and cards',
    createdAt: '2025-01-17T10:00:00Z',
    downloads: 3421,
    likes: 2567,
    hasUPSFeedback: true,
    upsCommentCount: 23
  },
  {
    id: 'asset-ui-2',
    name: 'Mobile App Wireframes',
    type: 'wireframes',
    field: 'ui-ux-design',
    style: 'Minimalist',
    colorScheme: 'Monochrome',
    fileUrl: '/assets/ui/mobile-wireframes.fig',
    thumbnailUrl: '/assets/thumbnails/wireframe-1.jpg',
    metadata: {
      format: '.fig',
      size: 4096000,
      quality: 'professional'
    },
    prompt: '25 mobile app wireframe screens for e-commerce application',
    createdAt: '2025-01-16T15:30:00Z',
    downloads: 1923,
    likes: 1456,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },
  {
    id: 'asset-ui-3',
    name: 'Design System Starter',
    type: 'design-systems',
    field: 'ui-ux-design',
    style: 'Professional',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/ui/design-system.fig',
    thumbnailUrl: '/assets/thumbnails/design-system-1.jpg',
    metadata: {
      format: '.fig',
      size: 12288000,
      quality: 'premium'
    },
    prompt: 'Complete design system with typography, colors, components, and guidelines',
    createdAt: '2025-01-14T09:45:00Z',
    downloads: 4567,
    likes: 3421,
    hasUPSFeedback: true,
    upsCommentCount: 34
  },

  // Graphic Design Assets
  {
    id: 'asset-graphic-1',
    name: 'Social Media Templates',
    type: 'templates',
    field: 'graphic-design',
    style: 'Bold',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/graphics/social-templates.zip',
    thumbnailUrl: '/assets/thumbnails/social-1.jpg',
    metadata: {
      format: '.psd',
      size: 20480000,
      dimensions: '1080x1080',
      quality: 'premium'
    },
    prompt: '30 Instagram post templates with modern typography and bold colors',
    createdAt: '2025-01-18T12:00:00Z',
    downloads: 5234,
    likes: 4012,
    hasUPSFeedback: true,
    upsCommentCount: 28
  },
  {
    id: 'asset-graphic-2',
    name: 'Brand Color Palettes',
    type: 'color-schemes',
    field: 'graphic-design',
    style: 'Elegant',
    colorScheme: 'Pastel',
    fileUrl: '/assets/graphics/color-palettes.ase',
    thumbnailUrl: '/assets/thumbnails/colors-1.jpg',
    metadata: {
      format: '.ase',
      size: 256000,
      quality: 'professional'
    },
    prompt: '20 curated color palettes for modern brand design',
    createdAt: '2025-01-17T14:15:00Z',
    downloads: 3156,
    likes: 2389,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },
  {
    id: 'asset-graphic-3',
    name: 'Minimal Icon Set',
    type: 'icons',
    field: 'graphic-design',
    style: 'Minimalist',
    colorScheme: 'Monochrome',
    fileUrl: '/assets/graphics/icon-set.svg',
    thumbnailUrl: '/assets/thumbnails/icons-1.jpg',
    metadata: {
      format: '.svg',
      size: 1024000,
      quality: 'premium'
    },
    prompt: '200 minimal line icons for web and mobile applications',
    createdAt: '2025-01-15T11:30:00Z',
    downloads: 6789,
    likes: 5123,
    hasUPSFeedback: true,
    upsCommentCount: 42
  },

  // Music Production Assets
  {
    id: 'asset-music-1',
    name: 'Synthwave Presets',
    type: 'presets',
    field: 'music-production',
    style: 'Vintage',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/music/synthwave-presets.fxp',
    thumbnailUrl: '/assets/thumbnails/music-1.jpg',
    metadata: {
      format: '.fxp',
      size: 2048000,
      quality: 'premium'
    },
    prompt: '50 retro synthwave presets for Serum synthesizer',
    createdAt: '2025-01-16T10:20:00Z',
    downloads: 2145,
    likes: 1678,
    hasUPSFeedback: true,
    upsCommentCount: 11
  },
  {
    id: 'asset-music-2',
    name: 'Trap Drum Kit',
    type: 'samples',
    field: 'music-production',
    style: 'Modern',
    colorScheme: 'Dark',
    fileUrl: '/assets/music/trap-drums.zip',
    thumbnailUrl: '/assets/thumbnails/drums-1.jpg',
    metadata: {
      format: '.wav',
      size: 102400000,
      duration: 300,
      quality: 'premium'
    },
    prompt: '500 trap drum samples: kicks, snares, hi-hats, and 808s',
    createdAt: '2025-01-14T16:45:00Z',
    downloads: 4567,
    likes: 3421,
    hasUPSFeedback: true,
    upsCommentCount: 19
  },
  {
    id: 'asset-music-3',
    name: 'MIDI Chord Progressions',
    type: 'midi',
    field: 'music-production',
    style: 'Playful',
    colorScheme: 'Light',
    fileUrl: '/assets/music/chord-progressions.zip',
    thumbnailUrl: '/assets/thumbnails/midi-1.jpg',
    metadata: {
      format: '.mid',
      size: 512000,
      quality: 'professional'
    },
    prompt: '100 MIDI chord progressions for pop, EDM, and hip-hop',
    createdAt: '2025-01-13T14:00:00Z',
    downloads: 3234,
    likes: 2456,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },

  // Web Development Assets
  {
    id: 'asset-web-1',
    name: 'React Dashboard Template',
    type: 'templates',
    field: 'web-development',
    style: 'Modern',
    colorScheme: 'Light',
    fileUrl: '/assets/web/react-dashboard.zip',
    thumbnailUrl: '/assets/thumbnails/web-1.jpg',
    metadata: {
      format: '.tsx',
      size: 15360000,
      quality: 'premium'
    },
    prompt: 'Modern React dashboard with TypeScript, Tailwind CSS, and charts',
    createdAt: '2025-01-18T09:30:00Z',
    downloads: 8901,
    likes: 6734,
    hasUPSFeedback: true,
    upsCommentCount: 56
  },
  {
    id: 'asset-web-2',
    name: 'Landing Page Components',
    type: 'components',
    field: 'web-development',
    style: 'Professional',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/web/landing-components.zip',
    thumbnailUrl: '/assets/thumbnails/components-1.jpg',
    metadata: {
      format: '.jsx',
      size: 8192000,
      quality: 'premium'
    },
    prompt: '20 conversion-optimized landing page sections for React',
    createdAt: '2025-01-17T13:15:00Z',
    downloads: 5678,
    likes: 4321,
    hasUPSFeedback: true,
    upsCommentCount: 31
  },
  {
    id: 'asset-web-3',
    name: 'Tailwind UI Theme',
    type: 'themes',
    field: 'web-development',
    style: 'Elegant',
    colorScheme: 'Pastel',
    fileUrl: '/assets/web/tailwind-theme.json',
    thumbnailUrl: '/assets/thumbnails/theme-1.jpg',
    metadata: {
      format: '.json',
      size: 1024000,
      quality: 'professional'
    },
    prompt: 'Complete Tailwind CSS theme with custom colors, typography, and spacing',
    createdAt: '2025-01-16T11:00:00Z',
    downloads: 4123,
    likes: 3234,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },

  // Software Development Assets
  {
    id: 'asset-soft-1',
    name: 'Sorting Algorithms Library',
    type: 'algorithms',
    field: 'software-development',
    style: 'Professional',
    colorScheme: 'Monochrome',
    fileUrl: '/assets/software/sorting-algorithms.ts',
    thumbnailUrl: '/assets/thumbnails/algo-1.jpg',
    metadata: {
      format: '.ts',
      size: 2048000,
      quality: 'premium'
    },
    prompt: 'Optimized implementations of 10 sorting algorithms with benchmarks',
    createdAt: '2025-01-15T10:45:00Z',
    downloads: 2345,
    likes: 1890,
    hasUPSFeedback: true,
    upsCommentCount: 14
  },
  {
    id: 'asset-soft-2',
    name: 'Microservices Architecture',
    type: 'architectures',
    field: 'software-development',
    style: 'Modern',
    colorScheme: 'Light',
    fileUrl: '/assets/software/microservices.pdf',
    thumbnailUrl: '/assets/thumbnails/arch-1.jpg',
    metadata: {
      format: '.pdf',
      size: 4096000,
      quality: 'premium'
    },
    prompt: 'Scalable microservices architecture with Docker and Kubernetes',
    createdAt: '2025-01-14T15:20:00Z',
    downloads: 3456,
    likes: 2678,
    hasUPSFeedback: true,
    upsCommentCount: 21
  },
  {
    id: 'asset-soft-3',
    name: 'API Testing Suite',
    type: 'testing',
    field: 'software-development',
    style: 'Professional',
    colorScheme: 'Dark',
    fileUrl: '/assets/software/api-tests.ts',
    thumbnailUrl: '/assets/thumbnails/test-1.jpg',
    metadata: {
      format: '.ts',
      size: 3072000,
      quality: 'professional'
    },
    prompt: 'Comprehensive REST API testing suite with Jest and Supertest',
    createdAt: '2025-01-13T12:30:00Z',
    downloads: 2890,
    likes: 2123,
    hasUPSFeedback: false,
    upsCommentCount: 0
  },

  // Content Writing Assets
  {
    id: 'asset-content-1',
    name: 'SEO Blog Post Templates',
    type: 'articles',
    field: 'content-writing',
    style: 'Professional',
    colorScheme: 'Light',
    fileUrl: '/assets/content/blog-templates.docx',
    thumbnailUrl: '/assets/thumbnails/blog-1.jpg',
    metadata: {
      format: '.docx',
      size: 1024000,
      quality: 'premium'
    },
    prompt: '10 SEO-optimized blog post templates for different industries',
    createdAt: '2025-01-17T11:15:00Z',
    downloads: 4234,
    likes: 3345,
    hasUPSFeedback: true,
    upsCommentCount: 27
  },
  {
    id: 'asset-content-2',
    name: 'Social Media Caption Pack',
    type: 'social',
    field: 'content-writing',
    style: 'Playful',
    colorScheme: 'Vibrant',
    fileUrl: '/assets/content/social-captions.txt',
    thumbnailUrl: '/assets/thumbnails/social-2.jpg',
    metadata: {
      format: '.txt',
      size: 512000,
      quality: 'professional'
    },
    prompt: '200 engaging social media captions for various platforms',
    createdAt: '2025-01-16T14:00:00Z',
    downloads: 5678,
    likes: 4456,
    hasUPSFeedback: true,
    upsCommentCount: 18
  },
  {
    id: 'asset-content-3',
    name: 'Video Script Templates',
    type: 'scripts',
    field: 'content-writing',
    style: 'Modern',
    colorScheme: 'Light',
    fileUrl: '/assets/content/video-scripts.pdf',
    thumbnailUrl: '/assets/thumbnails/script-1.jpg',
    metadata: {
      format: '.pdf',
      size: 2048000,
      duration: 180,
      quality: 'premium'
    },
    prompt: '15 YouTube video script templates for different content types',
    createdAt: '2025-01-15T09:30:00Z',
    downloads: 3890,
    likes: 2967,
    hasUPSFeedback: false,
    upsCommentCount: 0
  }
]

// ============================================================================
// AI MODELS DATA
// ============================================================================

export const AI_MODELS: AIModel[] = [
  // Free Models
  {
    id: 'openrouter/mistral-7b-instruct-free',
    name: 'Mistral 7B Instruct',
    provider: 'OpenRouter',
    category: ['text', 'code'],
    performance: 7,
    costPerGeneration: 0
  },
  {
    id: 'openrouter/phi-3-mini-free',
    name: 'Phi-3 Mini',
    provider: 'OpenRouter',
    category: ['text', 'code'],
    performance: 7,
    costPerGeneration: 0
  },
  {
    id: 'openrouter/mythomax-l2-13b-free',
    name: 'MythoMax L2 13B',
    provider: 'OpenRouter',
    category: ['text', 'creative'],
    performance: 6,
    costPerGeneration: 0
  },
  {
    id: 'openrouter/cinematika-7b-free',
    name: 'Cinematika 7B',
    provider: 'OpenRouter',
    category: ['text', 'creative'],
    performance: 6,
    costPerGeneration: 0
  },
  // Affordable Models
  {
    id: 'openrouter/llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'OpenRouter',
    category: ['text', 'code'],
    performance: 8,
    costPerGeneration: 0.00006
  },
  {
    id: 'openrouter/mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'OpenRouter',
    category: ['text', 'code', 'reasoning'],
    performance: 8,
    costPerGeneration: 0.00024
  },
  {
    id: 'openrouter/llama-3.1-70b',
    name: 'Llama 3.1 70B',
    provider: 'OpenRouter',
    category: ['text', 'code', 'reasoning'],
    performance: 9,
    costPerGeneration: 0.00036
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'Google',
    category: ['text', 'vision', 'multimodal'],
    performance: 9,
    costPerGeneration: 0.00000038
  },
  // Premium Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    category: ['text', 'code', 'vision', 'multimodal'],
    performance: 10,
    costPerGeneration: 0.015
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: ['text', 'code', 'reasoning'],
    performance: 10,
    costPerGeneration: 0.015
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    category: ['image'],
    performance: 9,
    costPerGeneration: 0.02
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    category: ['image'],
    performance: 10,
    costPerGeneration: 0.04
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a new asset with AI
 */
export async function generateAsset(
  field: string,
  assetType: string,
  settings: GenerationSettings
): Promise<GeneratedAsset> {
  logger.info('Generating asset', { field, assetType, settings })

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  const timestamp = new Date().toISOString()
  const assetId = `asset-${field}-${Date.now()}`

  const asset: GeneratedAsset = {
    id: assetId,
    name: `${assetType} ${Math.floor(Math.random() * 1000)}`,
    type: assetType,
    field,
    style: settings.style,
    colorScheme: settings.colorScheme,
    fileUrl: `/assets/${field}/${assetId}.file`,
    thumbnailUrl: `/assets/thumbnails/${assetId}.jpg`,
    metadata: {
      format: getFormatForField(field),
      size: Math.floor(Math.random() * 20000000) + 1000000,
      dimensions: field === 'photography' || field === 'graphic-design' ? '4096x4096' : undefined,
      duration: field === 'videography' || field === 'music-production' ? Math.floor(Math.random() * 300) + 10 : undefined,
      quality: settings.quality
    },
    prompt: settings.customPrompt || `Generated ${assetType} for ${field}`,
    createdAt: timestamp,
    downloads: 0,
    likes: 0,
    hasUPSFeedback: false,
    upsCommentCount: 0
  }

  logger.info('Asset generated successfully', { assetId: asset.id })
  return asset
}

/**
 * Generate multiple assets in batch mode
 */
export async function generateAssetBatch(
  field: string,
  assetType: string,
  settings: GenerationSettings
): Promise<GeneratedAsset[]> {
  logger.info('Generating asset batch', { field, assetType, batchSize: settings.batchSize })

  const assets: GeneratedAsset[] = []
  for (let i = 0; i < settings.batchSize; i++) {
    const asset = await generateAsset(field, assetType, settings)
    assets.push(asset)
  }

  logger.info('Batch generation complete', { assetsGenerated: assets.length })
  return assets
}

/**
 * Export asset with specific options
 */
export async function exportAsset(
  asset: GeneratedAsset,
  options: ExportOptions
): Promise<{ success: boolean; downloadUrl: string }> {
  logger.info('Exporting asset', { assetId: asset.id, options })

  // Simulate export processing
  await new Promise(resolve => setTimeout(resolve, 1000))

  return {
    success: true,
    downloadUrl: `${asset.fileUrl}?format=${options.format}&quality=${options.quality}`
  }
}

/**
 * Create a new version of an asset
 */
export function createAssetVersion(
  assetId: string,
  changes: string,
  fileUrl: string
): AssetVersion {
  logger.info('Creating asset version', { assetId, changes })

  return {
    id: `version-${Date.now()}`,
    assetId,
    versionNumber: Math.floor(Math.random() * 10) + 1,
    changes,
    createdAt: new Date().toISOString(),
    fileUrl
  }
}

/**
 * Get asset statistics
 */
export function getAssetStatistics(assets: GeneratedAsset[]) {
  const totalAssets = assets.length
  const totalDownloads = assets.reduce((sum, asset) => sum + asset.downloads, 0)
  const totalLikes = assets.reduce((sum, asset) => sum + asset.likes, 0)
  const assetsWithFeedback = assets.filter(asset => asset.hasUPSFeedback).length
  const totalComments = assets.reduce((sum, asset) => sum + asset.upsCommentCount, 0)

  const fieldDistribution = assets.reduce((acc, asset) => {
    acc[asset.field] = (acc[asset.field] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const qualityDistribution = assets.reduce((acc, asset) => {
    acc[asset.metadata.quality] = (acc[asset.metadata.quality] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalAssets,
    totalDownloads,
    totalLikes,
    assetsWithFeedback,
    totalComments,
    fieldDistribution,
    qualityDistribution,
    averageDownloads: totalAssets > 0 ? Math.floor(totalDownloads / totalAssets) : 0,
    averageLikes: totalAssets > 0 ? Math.floor(totalLikes / totalAssets) : 0
  }
}

/**
 * Filter assets by criteria
 */
export function filterAssets(
  assets: GeneratedAsset[],
  filters: {
    field?: string
    type?: string
    style?: string
    colorScheme?: string
    quality?: string
    hasUPSFeedback?: boolean
  }
): GeneratedAsset[] {
  return assets.filter(asset => {
    if (filters.field && asset.field !== filters.field) return false
    if (filters.type && asset.type !== filters.type) return false
    if (filters.style && asset.style !== filters.style) return false
    if (filters.colorScheme && asset.colorScheme !== filters.colorScheme) return false
    if (filters.quality && asset.metadata.quality !== filters.quality) return false
    if (filters.hasUPSFeedback !== undefined && asset.hasUPSFeedback !== filters.hasUPSFeedback) return false
    return true
  })
}

/**
 * Sort assets by criteria
 */
export function sortAssets(
  assets: GeneratedAsset[],
  sortBy: 'name' | 'downloads' | 'likes' | 'createdAt' | 'upsCommentCount',
  direction: 'asc' | 'desc' = 'desc'
): GeneratedAsset[] {
  return [...assets].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name)
        break
      case 'downloads':
        comparison = a.downloads - b.downloads
        break
      case 'likes':
        comparison = a.likes - b.likes
        break
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case 'upsCommentCount':
        comparison = a.upsCommentCount - b.upsCommentCount
        break
    }

    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format duration (seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Get file format based on creative field
 */
function getFormatForField(field: string): string {
  const formats: Record<string, string> = {
    'photography': '.jpg',
    'videography': '.mp4',
    'ui-ux-design': '.fig',
    'graphic-design': '.psd',
    'music-production': '.wav',
    'web-development': '.tsx',
    'software-development': '.ts',
    'content-writing': '.docx'
  }

  return formats[field] || '.file'
}

/**
 * Get estimated generation time based on model and quality
 */
export function getEstimatedGenerationTime(
  modelId: string,
  quality: string,
  batchMode: boolean
): number {
  const model = AI_MODELS.find(m => m.id === modelId)
  if (!model) return 30

  let baseTime = 10 // seconds

  // Adjust for model performance
  baseTime += (11 - model.performance) * 2

  // Adjust for quality
  const qualityMultipliers: Record<string, number> = {
    'draft': 0.5,
    'standard': 1,
    'professional': 1.5,
    'premium': 2
  }
  baseTime *= qualityMultipliers[quality] || 1

  // Adjust for batch mode
  if (batchMode) {
    baseTime *= 2.5 // Slightly less than 3x due to parallel processing
  }

  return Math.floor(baseTime)
}

/**
 * Validate asset for export
 */
export function validateAssetForExport(asset: GeneratedAsset): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!asset.fileUrl) {
    errors.push('Asset file URL is missing')
  }

  if (asset.metadata.size === 0) {
    errors.push('Asset file size is invalid')
  }

  if (!asset.metadata.format) {
    errors.push('Asset format is not specified')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Add UPS feedback to asset
 */
export function addUPSFeedbackToAsset(
  asset: GeneratedAsset,
  commentCount: number = 1
): GeneratedAsset {
  logger.info('Adding UPS feedback to asset', { assetId: asset.id, commentCount })

  return {
    ...asset,
    hasUPSFeedback: true,
    upsCommentCount: asset.upsCommentCount + commentCount
  }
}

/**
 * Remove UPS feedback from asset
 */
export function removeUPSFeedbackFromAsset(
  asset: GeneratedAsset,
  commentCount: number = 1
): GeneratedAsset {
  logger.info('Removing UPS feedback from asset', { assetId: asset.id, commentCount })

  const newCommentCount = Math.max(0, asset.upsCommentCount - commentCount)

  return {
    ...asset,
    hasUPSFeedback: newCommentCount > 0,
    upsCommentCount: newCommentCount
  }
}
