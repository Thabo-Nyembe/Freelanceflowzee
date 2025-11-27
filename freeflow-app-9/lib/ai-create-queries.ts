/**
 * AI Create Query Library
 *
 * Comprehensive CRUD operations for AI Create feature:
 * - Assets (create, read, update, delete, favorites)
 * - Generations (create, read, update status)
 * - Preferences (read, update, upsert)
 * - Statistics and analytics
 */

import { createClient } from '@/lib/supabase/client'

// ============================================================================
// TYPES
// ============================================================================

export type CreativeField =
  | 'photography'
  | 'videography'
  | 'ui-ux-design'
  | 'graphic-design'
  | 'music-production'
  | 'web-development'
  | 'software-development'
  | 'content-writing'

export type AssetTypeEnum =
  | 'luts'
  | 'presets'
  | 'actions'
  | 'overlays'
  | 'templates'
  | 'filters'
  | 'transitions'
  | 'effects'
  | 'figma-components'
  | 'wireframes'
  | 'prototypes'
  | 'design-systems'
  | 'mockups'
  | 'style-guides'
  | 'color-schemes'
  | 'patterns'
  | 'icons'
  | 'illustrations'
  | 'synth-presets'
  | 'samples'
  | 'midi'
  | 'mixing'
  | 'components'
  | 'themes'
  | 'snippets'
  | 'apis'
  | 'boilerplates'
  | 'algorithms'
  | 'architectures'
  | 'testing'
  | 'documentation'
  | 'devops'
  | 'database'
  | 'articles'
  | 'social'
  | 'copy'
  | 'scripts'
  | 'seo'
  | 'technical'

export type AssetFormat =
  | 'png'
  | 'jpg'
  | 'svg'
  | 'pdf'
  | 'psd'
  | 'ai'
  | 'fig'
  | 'sketch'
  | 'xd'
  | 'mp4'
  | 'mov'
  | 'avi'
  | 'mp3'
  | 'wav'
  | 'midi'
  | 'js'
  | 'ts'
  | 'jsx'
  | 'tsx'
  | 'css'
  | 'html'
  | 'json'
  | 'md'
  | 'txt'
  | 'zip'

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type StylePreset =
  | 'modern'
  | 'vintage'
  | 'minimalist'
  | 'bold'
  | 'elegant'
  | 'playful'
  | 'professional'
  | 'artistic'

export type ColorScheme = 'vibrant' | 'muted' | 'monochrome' | 'pastel' | 'dark' | 'light' | 'warm' | 'cool'

export interface AICreateAsset {
  id: string
  user_id: string
  name: string
  description: string | null
  creative_field: CreativeField
  asset_type: AssetTypeEnum
  format: AssetFormat
  file_size: number | null
  file_url: string | null
  preview_url: string | null
  thumbnail_url: string | null
  tags: string[]
  style: StylePreset | null
  color_scheme: ColorScheme | null
  custom_prompt: string | null
  model_used: string | null
  generation_params: any
  is_favorite: boolean
  download_count: number
  view_count: number
  metadata: any
  created_at: string
  updated_at: string
}

export interface AICreateGeneration {
  id: string
  user_id: string
  creative_field: CreativeField
  asset_type: AssetTypeEnum
  style: StylePreset | null
  color_scheme: ColorScheme | null
  custom_prompt: string | null
  model_used: string
  batch_mode: boolean
  assets_requested: number
  assets_generated: number
  status: GenerationStatus
  error_message: string | null
  generation_time_ms: number | null
  input_file_url: string | null
  generation_params: any
  created_at: string
  completed_at: string | null
}

export interface AICreatePreferences {
  id: string
  user_id: string
  default_model: string
  default_style: StylePreset
  default_color_scheme: ColorScheme
  batch_mode_enabled: boolean
  auto_save_enabled: boolean
  quality_preset: string
  favorite_fields: CreativeField[]
  recent_prompts: string[]
  metadata: any
  created_at: string
  updated_at: string
}

export interface AICreateFavorite {
  id: string
  user_id: string
  asset_id: string
  created_at: string
}

// ============================================================================
// ASSET OPERATIONS
// ============================================================================

/**
 * Get all assets for a user
 */
export async function getAssets(
  userId: string,
  filters?: {
    creative_field?: CreativeField
    asset_type?: AssetTypeEnum
    is_favorite?: boolean
    search?: string
    tags?: string[]
  }
): Promise<{ data: AICreateAsset[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_create_assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.creative_field) {
    query = query.eq('creative_field', filters.creative_field)
  }

  if (filters?.asset_type) {
    query = query.eq('asset_type', filters.asset_type)
  }

  if (filters?.is_favorite !== undefined) {
    query = query.eq('is_favorite', filters.is_favorite)
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Get a single asset by ID
 */
export async function getAsset(assetId: string): Promise<{ data: AICreateAsset | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase.from('ai_create_assets').select('*').eq('id', assetId).single()

  return { data, error }
}

/**
 * Create a new asset
 */
export async function createAsset(
  userId: string,
  asset: {
    name: string
    description?: string
    creative_field: CreativeField
    asset_type: AssetTypeEnum
    format: AssetFormat
    file_size?: number
    file_url?: string
    preview_url?: string
    thumbnail_url?: string
    tags?: string[]
    style?: StylePreset
    color_scheme?: ColorScheme
    custom_prompt?: string
    model_used?: string
    generation_params?: any
    metadata?: any
  }
): Promise<{ data: AICreateAsset | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_assets')
    .insert({
      user_id: userId,
      name: asset.name,
      description: asset.description,
      creative_field: asset.creative_field,
      asset_type: asset.asset_type,
      format: asset.format,
      file_size: asset.file_size,
      file_url: asset.file_url,
      preview_url: asset.preview_url,
      thumbnail_url: asset.thumbnail_url,
      tags: asset.tags || [],
      style: asset.style,
      color_scheme: asset.color_scheme,
      custom_prompt: asset.custom_prompt,
      model_used: asset.model_used,
      generation_params: asset.generation_params || {},
      metadata: asset.metadata || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update an asset
 */
export async function updateAsset(
  assetId: string,
  updates: Partial<
    Pick<
      AICreateAsset,
      | 'name'
      | 'description'
      | 'tags'
      | 'is_favorite'
      | 'file_url'
      | 'preview_url'
      | 'thumbnail_url'
      | 'metadata'
    >
  >
): Promise<{ data: AICreateAsset | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_assets')
    .update(updates)
    .eq('id', assetId)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete an asset
 */
export async function deleteAsset(assetId: string): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase.from('ai_create_assets').delete().eq('id', assetId)

  return { error }
}

/**
 * Increment asset download count
 */
export async function incrementDownloadCount(assetId: string): Promise<{ data: AICreateAsset | null; error: any }> {
  const supabase = createClient()

  // Get current count
  const { data: currentAsset } = await supabase
    .from('ai_create_assets')
    .select('download_count')
    .eq('id', assetId)
    .single()

  if (!currentAsset) {
    return { data: null, error: new Error('Asset not found') }
  }

  // Increment
  const { data, error } = await supabase
    .from('ai_create_assets')
    .update({ download_count: currentAsset.download_count + 1 })
    .eq('id', assetId)
    .select()
    .single()

  return { data, error }
}

/**
 * Increment asset view count
 */
export async function incrementViewCount(assetId: string): Promise<{ data: AICreateAsset | null; error: any }> {
  const supabase = createClient()

  // Get current count
  const { data: currentAsset } = await supabase
    .from('ai_create_assets')
    .select('view_count')
    .eq('id', assetId)
    .single()

  if (!currentAsset) {
    return { data: null, error: new Error('Asset not found') }
  }

  // Increment
  const { data, error } = await supabase
    .from('ai_create_assets')
    .update({ view_count: currentAsset.view_count + 1 })
    .eq('id', assetId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// FAVORITE OPERATIONS
// ============================================================================

/**
 * Add asset to favorites
 */
export async function addFavorite(
  userId: string,
  assetId: string
): Promise<{ data: AICreateFavorite | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_favorites')
    .insert({
      user_id: userId,
      asset_id: assetId
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Remove asset from favorites
 */
export async function removeFavorite(userId: string, assetId: string): Promise<{ error: any }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ai_create_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('asset_id', assetId)

  return { error }
}

/**
 * Toggle favorite status
 */
export async function toggleFavorite(
  userId: string,
  assetId: string
): Promise<{ data: AICreateFavorite | null; removed: boolean; error: any }> {
  const supabase = createClient()

  // Check if already favorited
  const { data: existingFavorite } = await supabase
    .from('ai_create_favorites')
    .select('*')
    .eq('user_id', userId)
    .eq('asset_id', assetId)
    .single()

  if (existingFavorite) {
    // Remove favorite
    await supabase.from('ai_create_favorites').delete().eq('id', existingFavorite.id)
    return { data: null, removed: true, error: null }
  } else {
    // Add favorite
    const { data, error } = await supabase
      .from('ai_create_favorites')
      .insert({ user_id: userId, asset_id: assetId })
      .select()
      .single()
    return { data, removed: false, error }
  }
}

/**
 * Get user's favorite assets
 */
export async function getFavorites(userId: string): Promise<{ data: AICreateAsset[] | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_assets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false })

  return { data, error }
}

// ============================================================================
// GENERATION OPERATIONS
// ============================================================================

/**
 * Get generation history for a user
 */
export async function getGenerations(
  userId: string,
  filters?: {
    status?: GenerationStatus
    creative_field?: CreativeField
  }
): Promise<{ data: AICreateGeneration[] | null; error: any }> {
  const supabase = createClient()
  let query = supabase
    .from('ai_create_generations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.creative_field) {
    query = query.eq('creative_field', filters.creative_field)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Create a generation record
 */
export async function createGeneration(
  userId: string,
  generation: {
    creative_field: CreativeField
    asset_type: AssetTypeEnum
    style?: StylePreset
    color_scheme?: ColorScheme
    custom_prompt?: string
    model_used: string
    batch_mode?: boolean
    assets_requested?: number
    input_file_url?: string
    generation_params?: any
  }
): Promise<{ data: AICreateGeneration | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_generations')
    .insert({
      user_id: userId,
      creative_field: generation.creative_field,
      asset_type: generation.asset_type,
      style: generation.style,
      color_scheme: generation.color_scheme,
      custom_prompt: generation.custom_prompt,
      model_used: generation.model_used,
      batch_mode: generation.batch_mode || false,
      assets_requested: generation.assets_requested || 1,
      input_file_url: generation.input_file_url,
      generation_params: generation.generation_params || {},
      status: 'pending'
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Update generation status
 */
export async function updateGenerationStatus(
  generationId: string,
  updates: {
    status: GenerationStatus
    assets_generated?: number
    error_message?: string
    generation_time_ms?: number
  }
): Promise<{ data: AICreateGeneration | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_generations')
    .update(updates)
    .eq('id', generationId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// PREFERENCES OPERATIONS
// ============================================================================

/**
 * Get user preferences
 */
export async function getPreferences(
  userId: string
): Promise<{ data: AICreatePreferences | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

/**
 * Upsert user preferences (create or update)
 */
export async function upsertPreferences(
  userId: string,
  preferences: Partial<
    Pick<
      AICreatePreferences,
      | 'default_model'
      | 'default_style'
      | 'default_color_scheme'
      | 'batch_mode_enabled'
      | 'auto_save_enabled'
      | 'quality_preset'
      | 'favorite_fields'
      | 'recent_prompts'
      | 'metadata'
    >
  >
): Promise<{ data: AICreatePreferences | null; error: any }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ai_create_preferences')
    .upsert(
      {
        user_id: userId,
        ...preferences
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single()

  return { data, error }
}

/**
 * Add to recent prompts (max 10)
 */
export async function addRecentPrompt(userId: string, prompt: string): Promise<{ data: AICreatePreferences | null; error: any }> {
  const supabase = createClient()

  // Get current preferences
  const { data: currentPrefs } = await supabase
    .from('ai_create_preferences')
    .select('recent_prompts')
    .eq('user_id', userId)
    .single()

  let recentPrompts: string[] = currentPrefs?.recent_prompts || []

  // Add new prompt to beginning, remove duplicates, limit to 10
  recentPrompts = [prompt, ...recentPrompts.filter((p) => p !== prompt)].slice(0, 10)

  // Update preferences
  const { data, error } = await supabase
    .from('ai_create_preferences')
    .upsert(
      {
        user_id: userId,
        recent_prompts: recentPrompts
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get asset statistics for a user
 */
export async function getAssetStats(
  userId: string
): Promise<{
  data: {
    total_assets: number
    favorite_assets: number
    total_downloads: number
    total_views: number
    by_field: Record<string, number>
    by_type: Record<string, number>
  } | null
  error: any
}> {
  const supabase = createClient()

  const { data: assets, error } = await supabase
    .from('ai_create_assets')
    .select('creative_field, asset_type, download_count, view_count, is_favorite')
    .eq('user_id', userId)

  if (error || !assets) {
    return { data: null, error }
  }

  const stats = {
    total_assets: assets.length,
    favorite_assets: assets.filter((a) => a.is_favorite).length,
    total_downloads: assets.reduce((sum, a) => sum + a.download_count, 0),
    total_views: assets.reduce((sum, a) => sum + a.view_count, 0),
    by_field: {} as Record<string, number>,
    by_type: {} as Record<string, number>
  }

  // Count by field
  assets.forEach((asset) => {
    stats.by_field[asset.creative_field] = (stats.by_field[asset.creative_field] || 0) + 1
    stats.by_type[asset.asset_type] = (stats.by_type[asset.asset_type] || 0) + 1
  })

  return { data: stats, error: null }
}

/**
 * Get generation statistics for a user
 */
export async function getGenerationStats(
  userId: string
): Promise<{
  data: {
    total_generations: number
    completed_generations: number
    failed_generations: number
    total_assets_generated: number
    avg_generation_time_ms: number | null
    by_status: Record<string, number>
  } | null
  error: any
}> {
  const supabase = createClient()

  const { data: generations, error } = await supabase
    .from('ai_create_generations')
    .select('status, assets_generated, generation_time_ms')
    .eq('user_id', userId)

  if (error || !generations) {
    return { data: null, error }
  }

  const completedGenerations = generations.filter((g) => g.status === 'completed')
  const avgTime =
    completedGenerations.length > 0
      ? completedGenerations.reduce((sum, g) => sum + (g.generation_time_ms || 0), 0) /
        completedGenerations.length
      : null

  const stats = {
    total_generations: generations.length,
    completed_generations: generations.filter((g) => g.status === 'completed').length,
    failed_generations: generations.filter((g) => g.status === 'failed').length,
    total_assets_generated: generations.reduce((sum, g) => sum + g.assets_generated, 0),
    avg_generation_time_ms: avgTime,
    by_status: {} as Record<string, number>
  }

  // Count by status
  generations.forEach((gen) => {
    stats.by_status[gen.status] = (stats.by_status[gen.status] || 0) + 1
  })

  return { data: stats, error: null }
}
