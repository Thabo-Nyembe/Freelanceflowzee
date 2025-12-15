'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createModel(input: CreateModelInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { data }
}

export async function updateModel(id: string, input: UpdateModelInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('three_d_models')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { data }
}

export async function publishModel(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('three_d_models')
    .update({ status: 'published', is_public: true })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { data }
}

export async function startRender(id: string, quality?: string, samples?: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { data }
}

export async function completeRender(id: string, renderTime: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { data }
}

export async function incrementModelViews(id: string) {
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

  return { success: true }
}

export async function deleteModel(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('three_d_models')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/3d-modeling-v2')
  return { success: true }
}

export async function getModels(filters?: {
  category?: string
  status?: string
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Unauthorized' }
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
    return { error: error.message }
  }

  return { data }
}
