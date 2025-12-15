'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createAnimation(input: AnimationInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data }
}

export async function updateAnimation(id: string, updates: Partial<AnimationInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data }
}

export async function deleteAnimation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('animations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { success: true }
}

export async function startRender(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data }
}

export async function completeRender(id: string, videoUrl?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data }
}

export async function likeAnimation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: animation } = await supabase
    .from('animations')
    .select('likes_count')
    .eq('id', id)
    .single()

  if (!animation) {
    return { error: 'Animation not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data }
}

export async function downloadAnimation(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: animation } = await supabase
    .from('animations')
    .select('downloads_count, video_url')
    .eq('id', id)
    .single()

  if (!animation) {
    return { error: 'Animation not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/motion-graphics-v2')
  return { data, downloadUrl: animation.video_url }
}

export async function getAnimations() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('animations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
