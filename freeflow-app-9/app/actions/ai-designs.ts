'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getDesigns(options?: {
  style?: string
  status?: string
  isPublic?: boolean
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  return { data }
}

export async function createDesign(designData: {
  title?: string
  prompt: string
  style?: string
  category?: string
  model?: string
  resolution?: string
  tags?: string[]
}) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-design-v2')
  return { data }
}

export async function updateDesign(
  designId: string,
  updates: {
    title?: string
    is_public?: boolean
    tags?: string[]
    status?: string
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-design-v2')
  return { data }
}

export async function completeDesign(
  designId: string,
  result: {
    thumbnailUrl: string
    outputUrl: string
    outputUrls?: string[]
    generationTimeMs: number
    creditsUsed: number
    cost: number
    qualityScore?: number
  }
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-design-v2')
  return { data }
}

export async function likeDesign(designId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get current likes
  const { data: design } = await supabase
    .from('ai_designs')
    .select('likes')
    .eq('id', designId)
    .single()

  if (!design) {
    return { error: 'Design not found' }
  }

  const { data, error } = await supabase
    .from('ai_designs')
    .update({
      likes: design.likes + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', designId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-design-v2')
  return { data }
}

export async function incrementViews(designId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: design } = await supabase
    .from('ai_designs')
    .select('views')
    .eq('id', designId)
    .single()

  if (!design) {
    return { error: 'Design not found' }
  }

  await supabase
    .from('ai_designs')
    .update({ views: design.views + 1 })
    .eq('id', designId)

  return { success: true }
}

export async function incrementDownloads(designId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: design } = await supabase
    .from('ai_designs')
    .select('downloads')
    .eq('id', designId)
    .single()

  if (!design) {
    return { error: 'Design not found' }
  }

  await supabase
    .from('ai_designs')
    .update({
      downloads: design.downloads + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', designId)

  revalidatePath('/dashboard/ai-design-v2')
  return { success: true }
}

export async function deleteDesign(designId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('ai_designs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', designId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/ai-design-v2')
  return { success: true }
}

export async function getDesignStats() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: designs } = await supabase
    .from('ai_designs')
    .select('status, likes, views, downloads, credits_used, quality_score, generation_time_ms')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (!designs) {
    return { data: null }
  }

  const completedDesigns = designs.filter(d => d.status === 'completed')

  const stats = {
    total: designs.length,
    completed: completedDesigns.length,
    pending: designs.filter(d => d.status === 'pending' || d.status === 'processing').length,
    failed: designs.filter(d => d.status === 'failed').length,
    totalLikes: designs.reduce((sum, d) => sum + d.likes, 0),
    totalViews: designs.reduce((sum, d) => sum + d.views, 0),
    totalDownloads: designs.reduce((sum, d) => sum + d.downloads, 0),
    totalCreditsUsed: designs.reduce((sum, d) => sum + d.credits_used, 0),
    avgQualityScore: completedDesigns.length > 0
      ? completedDesigns.reduce((sum, d) => sum + d.quality_score, 0) / completedDesigns.length
      : 0,
    avgGenerationTime: completedDesigns.length > 0
      ? completedDesigns.reduce((sum, d) => sum + d.generation_time_ms, 0) / completedDesigns.length
      : 0
  }

  return { data: stats }
}
