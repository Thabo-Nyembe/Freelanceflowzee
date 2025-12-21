'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('3d-models-actions')

export interface CreateModelInput {
  title: string
  description?: string
  category?: string
  file_url?: string
  thumbnail_url?: string
  file_format?: string
  file_size?: number
  polygon_count?: number
  vertex_count?: number
  texture_count?: number
  material_count?: number
  render_quality?: string
  render_samples?: number
  is_public?: boolean
  tags?: string[]
}

export interface UpdateModelInput {
  title?: string
  description?: string
  category?: string
  status?: string
  file_url?: string
  thumbnail_url?: string
  file_format?: string
  file_size?: number
  polygon_count?: number
  vertex_count?: number
  texture_count?: number
  material_count?: number
  render_quality?: string
  render_samples?: number
  last_render_time?: number
  is_public?: boolean
  downloads?: number
  views?: number
  likes?: number
  tags?: string[]
}

export async function createModel(input: CreateModelInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('three_d_models')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description,
        category: input.category || 'general',
        file_url: input.file_url,
        thumbnail_url: input.thumbnail_url,
        file_format: input.file_format || 'OBJ',
        file_size: input.file_size || 0,
        polygon_count: input.polygon_count || 0,
        vertex_count: input.vertex_count || 0,
        texture_count: input.texture_count || 0,
        material_count: input.material_count || 0,
        render_quality: input.render_quality || 'medium',
        render_samples: input.render_samples || 128,
        is_public: input.is_public || false,
        tags: input.tags || []
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create 3D model', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('3D model created successfully', { modelId: data.id })
    return actionSuccess(data, '3D model created successfully')
  } catch (error) {
    logger.error('Unexpected error creating 3D model', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateModel(id: string, input: UpdateModelInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('three_d_models')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update 3D model', { error, modelId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('3D model updated successfully', { modelId: id })
    return actionSuccess(data, '3D model updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating 3D model', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishModel(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('three_d_models')
      .update({ status: 'published', is_public: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish 3D model', { error, modelId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('3D model published successfully', { modelId: id })
    return actionSuccess(data, '3D model published successfully')
  } catch (error) {
    logger.error('Unexpected error publishing 3D model', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startRender(id: string, quality?: string, samples?: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('three_d_models')
      .update({
        status: 'rendering',
        render_quality: quality || 'high',
        render_samples: samples || 512
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start render', { error, modelId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('Render started successfully', { modelId: id })
    return actionSuccess(data, 'Render started successfully')
  } catch (error) {
    logger.error('Unexpected error starting render', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function completeRender(id: string, renderTime: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('three_d_models')
      .update({
        status: 'draft',
        last_render_time: renderTime
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to complete render', { error, modelId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('Render completed successfully', { modelId: id, renderTime })
    return actionSuccess(data, 'Render completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing render', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementModelViews(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { error } = await supabase.rpc('increment_model_views', { model_id: id })

    if (error) {
      // Fallback if RPC doesn't exist
      const { data: model } = await supabase
        .from('three_d_models')
        .select('views')
        .eq('id', id)
        .single()

      if (model) {
        await supabase
          .from('three_d_models')
          .update({ views: model.views + 1 })
          .eq('id', id)
      }
    }

    logger.info('Model views incremented', { modelId: id })
    return actionSuccess(undefined, 'Views updated successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing views', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteModel(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('three_d_models')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete 3D model', { error, modelId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/3d-modeling-v2')
    logger.info('3D model deleted successfully', { modelId: id })
    return actionSuccess(undefined, '3D model deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting 3D model', { error, modelId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getModels(filters?: {
  category?: string
  status?: string
}): Promise<ActionResult<any[]>> {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    let query = supabase
      .from('three_d_models')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query.limit(100)

    if (error) {
      logger.error('Failed to fetch 3D models', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('3D models fetched successfully', { count: data?.length || 0 })
    return actionSuccess(data, '3D models fetched successfully')
  } catch (error) {
    logger.error('Unexpected error fetching 3D models', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
