/**
 * AI Create Utilities
 * Comprehensive utilities for AI-powered creative asset generation
 * Integrates with Universal Pinpoint System for world-class A+++ capabilities
 */

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AICreateUtils')

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
