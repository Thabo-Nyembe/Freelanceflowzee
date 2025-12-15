'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface VideoProjectInput {
  title: string
  description?: string
  thumbnail_url?: string
  video_url?: string
  duration_seconds?: number
  file_size_bytes?: number
  status?: 'draft' | 'processing' | 'ready' | 'failed' | 'archived'
  tags?: string[]
  category?: string
  ai_analysis?: Record<string, any>
  has_captions?: boolean
  has_thumbnail?: boolean
  metadata?: Record<string, any>
}

export async function getVideoProjects() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getVideoProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createVideoProject(input: VideoProjectInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('video_projects')
    .insert({
      ...input,
      user_id: user.id,
      tags: input.tags || [],
      ai_analysis: input.ai_analysis || {},
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/video-studio-v2')
  return { data, error: null }
}

export async function updateVideoProject(id: string, input: Partial<VideoProjectInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('video_projects')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/video-studio-v2')
  return { data, error: null }
}

export async function deleteVideoProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('video_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/video-studio-v2')
  return { success: true, error: null }
}

export async function processVideoProject(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Set status to processing
  const { error: updateError } = await supabase
    .from('video_projects')
    .update({
      status: 'processing',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message, data: null }
  }

  // Simulate processing completion (in production this would be async)
  const { data, error } = await supabase
    .from('video_projects')
    .update({
      status: 'ready',
      rendered_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/video-studio-v2')
  return { data, error: null }
}

export async function getVideoProjectStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: projects, error } = await supabase
    .from('video_projects')
    .select('status, views_count, likes_count, duration_seconds')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, data: null }
  }

  const totalDuration = projects?.reduce((sum, p) => sum + (p.duration_seconds || 0), 0) || 0
  const stats = {
    total: projects?.length || 0,
    draft: projects?.filter(p => p.status === 'draft').length || 0,
    processing: projects?.filter(p => p.status === 'processing').length || 0,
    ready: projects?.filter(p => p.status === 'ready').length || 0,
    totalViews: projects?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0,
    totalLikes: projects?.reduce((sum, p) => sum + (p.likes_count || 0), 0) || 0,
    avgDuration: projects && projects.length > 0 ? Math.round(totalDuration / projects.length) : 0
  }

  return { data: stats, error: null }
}
