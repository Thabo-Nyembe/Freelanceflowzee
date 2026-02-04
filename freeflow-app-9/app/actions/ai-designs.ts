'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'
import { uuidSchema } from '@/lib/validations'

const logger = createSimpleLogger('ai-designs')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface DesignFilters {
  style?: string
  status?: string
  isPublic?: boolean
}

interface DesignData {
  title?: string
  prompt: string
  style?: string
  category?: string
  model?: string
  resolution?: string
  tags?: string[]
}

interface DesignUpdates {
  title?: string
  is_public?: boolean
  tags?: string[]
  status?: string
}

interface DesignResult {
  thumbnailUrl: string
  outputUrl: string
  outputUrls?: string[]
  generationTimeMs: number
  creditsUsed: number
  cost: number
  qualityScore?: number
}

interface DesignStats {
  total: number
  completed: number
  pending: number
  failed: number
  totalLikes: number
  totalViews: number
  totalDownloads: number
  totalCreditsUsed: number
  avgQualityScore: number
  avgGenerationTime: number
}

// ============================================
// SERVER ACTIONS
// ============================================

export async function getDesigns(
  options?: DesignFilters
): Promise<ActionResult<unknown[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getDesigns')
      return actionError('Not authenticated')
    }

    let query = supabase
      .from('ai_designs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (options?.style) {
      query = query.eq('style', options.style)
    }
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    if (options?.isPublic !== undefined) {
      query = query.eq('is_public', options.isPublic)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to fetch designs', { error, userId: user.id })
      return actionError(error.message)
    }

    logger.info('Designs fetched successfully', { userId: user.id, count: data?.length })
    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error in getDesigns', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function createDesign(
  designData: DesignData
): Promise<ActionResult<unknown>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to createDesign')
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_designs')
      .insert({
        user_id: user.id,
        title: designData.title || `${designData.style || 'modern'} Design`,
        prompt: designData.prompt,
        style: designData.style || 'modern',
        category: designData.category || 'general',
        model: designData.model || 'dall-e-3',
        resolution: designData.resolution || '1024x1024',
        tags: designData.tags || [],
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create design', { error, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design created successfully', { designId: data.id, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in createDesign', { error })
    return actionError('An unexpected error occurred')
  }
}

export async function updateDesign(
  designId: string,
  updates: DesignUpdates
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to updateDesign', { designId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_designs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', designId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update design', { error, designId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design updated successfully', { designId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in updateDesign', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function completeDesign(
  designId: string,
  result: DesignResult
): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to completeDesign', { designId })
      return actionError('Not authenticated')
    }

    const { data, error } = await supabase
      .from('ai_designs')
      .update({
        status: 'completed',
        thumbnail_url: result.thumbnailUrl,
        output_url: result.outputUrl,
        output_urls: result.outputUrls || [result.outputUrl],
        generation_time_ms: result.generationTimeMs,
        credits_used: result.creditsUsed,
        total_cost: result.cost,
        quality_score: result.qualityScore || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', designId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete design', { error, designId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design completed successfully', { designId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in completeDesign', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function likeDesign(designId: string): Promise<ActionResult<unknown>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to likeDesign', { designId })
      return actionError('Not authenticated')
    }

    const { data: design } = await supabase
      .from('ai_designs')
      .select('likes')
      .eq('id', designId)
      .single()

    if (!design) {
      logger.warn('Design not found', { designId, userId: user.id })
      return actionError('Design not found')
    }

    const { data, error } = await supabase
      .from('ai_designs')
      .update({
        likes: (design.likes || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', designId)
      .select()
      .single()

    if (error) {
      logger.error('Failed to like design', { error, designId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design liked successfully', { designId, userId: user.id })
    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error in likeDesign', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function incrementViews(designId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: design } = await supabase
      .from('ai_designs')
      .select('views')
      .eq('id', designId)
      .single()

    if (!design) {
      logger.warn('Design not found for view increment', { designId })
      return actionError('Design not found')
    }

    const { error } = await supabase
      .from('ai_designs')
      .update({ views: (design.views || 0) + 1 })
      .eq('id', designId)

    if (error) {
      logger.error('Failed to increment views', { error, designId })
      return actionError(error.message)
    }

    logger.info('Design views incremented', { designId })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in incrementViews', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function incrementDownloads(designId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: design } = await supabase
      .from('ai_designs')
      .select('downloads')
      .eq('id', designId)
      .single()

    if (!design) {
      logger.warn('Design not found for download increment', { designId })
      return actionError('Design not found')
    }

    const { error } = await supabase
      .from('ai_designs')
      .update({
        downloads: (design.downloads || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', designId)

    if (error) {
      logger.error('Failed to increment downloads', { error, designId })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design downloads incremented', { designId })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in incrementDownloads', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function deleteDesign(designId: string): Promise<ActionResult<boolean>> {
  try {
    const validationResult = uuidSchema.safeParse(designId)
    if (!validationResult.success) {
      return actionError('Invalid design ID format')
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to deleteDesign', { designId })
      return actionError('Not authenticated')
    }

    const { error } = await supabase
      .from('ai_designs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', designId)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete design', { error, designId, userId: user.id })
      return actionError(error.message)
    }

    revalidatePath('/dashboard/ai-design-v2')
    logger.info('Design deleted successfully', { designId, userId: user.id })
    return actionSuccess(true)
  } catch (error) {
    logger.error('Unexpected error in deleteDesign', { error, designId })
    return actionError('An unexpected error occurred')
  }
}

export async function getDesignStats(): Promise<ActionResult<DesignStats | null>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      logger.warn('Unauthorized access attempt to getDesignStats')
      return actionError('Not authenticated')
    }

    const { data: designs } = await supabase
      .from('ai_designs')
      .select('status, likes, views, downloads, credits_used, quality_score, generation_time_ms')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (!designs) {
      logger.info('No designs found for stats', { userId: user.id })
      return actionSuccess(null)
    }

    const completedDesigns = designs.filter(d => d.status === 'completed')

    const stats: DesignStats = {
      total: designs.length,
      completed: completedDesigns.length,
      pending: designs.filter(d => d.status === 'pending' || d.status === 'processing').length,
      failed: designs.filter(d => d.status === 'failed').length,
      totalLikes: designs.reduce((sum, d) => sum + (d.likes || 0), 0),
      totalViews: designs.reduce((sum, d) => sum + (d.views || 0), 0),
      totalDownloads: designs.reduce((sum, d) => sum + (d.downloads || 0), 0),
      totalCreditsUsed: designs.reduce((sum, d) => sum + (d.credits_used || 0), 0),
      avgQualityScore: completedDesigns.length > 0
        ? completedDesigns.reduce((sum, d) => sum + (d.quality_score || 0), 0) / completedDesigns.length
        : 0,
      avgGenerationTime: completedDesigns.length > 0
        ? completedDesigns.reduce((sum, d) => sum + (d.generation_time_ms || 0), 0) / completedDesigns.length
        : 0
    }

    logger.info('Design stats fetched successfully', { userId: user.id })
    return actionSuccess(stats)
  } catch (error) {
    logger.error('Unexpected error in getDesignStats', { error })
    return actionError('An unexpected error occurred')
  }
}
