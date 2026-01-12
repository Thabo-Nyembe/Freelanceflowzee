'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('animations-actions')

export interface AnimationInput {
  title: string
  description?: string
  category?: string
  resolution?: string
  fps?: number
  is_template?: boolean
  preset_type?: string
  tags?: string[]
}

export async function createAnimation(input: AnimationInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('animations')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description || null,
        category: input.category || 'general',
        resolution: input.resolution || '1080p',
        fps: input.fps || 30,
        is_template: input.is_template || false,
        preset_type: input.preset_type || null,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create animation', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animation created successfully', { animationId: data.id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess(data, 'Animation created successfully')
  } catch (error: any) {
    logger.error('Unexpected error creating animation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateAnimation(id: string, updates: Partial<AnimationInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('animations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update animation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animation updated successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess(data, 'Animation updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error updating animation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteAnimation(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('animations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete animation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animation deleted successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess({ success: true }, 'Animation deleted successfully')
  } catch (error: any) {
    logger.error('Unexpected error deleting animation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startRender(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('animations')
      .update({
        status: 'rendering',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start render', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Render started successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess(data, 'Render started successfully')
  } catch (error: any) {
    logger.error('Unexpected error starting render', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeRender(id: string, videoUrl?: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('animations')
      .update({
        status: 'ready',
        video_url: videoUrl || null,
        rendered_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete render', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Render completed successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess(data, 'Render completed successfully')
  } catch (error: any) {
    logger.error('Unexpected error completing render', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function likeAnimation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: animation } = await supabase
      .from('animations')
      .select('likes_count')
      .eq('id', id)
      .single()

    if (!animation) {
      return actionError('Animation not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('animations')
      .update({
        likes_count: animation.likes_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to like animation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animation liked successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess(data, 'Animation liked successfully')
  } catch (error: any) {
    logger.error('Unexpected error liking animation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function downloadAnimation(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: animation } = await supabase
      .from('animations')
      .select('downloads_count, video_url')
      .eq('id', id)
      .single()

    if (!animation) {
      return actionError('Animation not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('animations')
      .update({
        downloads_count: animation.downloads_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to download animation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animation downloaded successfully', { animationId: id })
    revalidatePath('/dashboard/motion-graphics-v2')
    return actionSuccess({ ...data, downloadUrl: animation.video_url }, 'Animation download tracked successfully')
  } catch (error: any) {
    logger.error('Unexpected error downloading animation', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getAnimations(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('animations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get animations', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Animations retrieved successfully', { count: data?.length || 0 })
    return actionSuccess(data || [], 'Animations retrieved successfully')
  } catch (error: any) {
    logger.error('Unexpected error getting animations', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
