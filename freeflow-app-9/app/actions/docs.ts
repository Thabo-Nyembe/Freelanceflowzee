'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createDoc(data: {
  doc_title: string
  doc_category: string
  doc_type?: string
  content?: string
  summary?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Generate slug from title
  const slug = data.doc_title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const { data: doc, error } = await supabase
    .from('docs')
    .insert({
      user_id: user.id,
      ...data,
      slug,
      status: 'draft'
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function publishDoc(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      status: 'published',
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function recordView(id: string, isUnique: boolean = false) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('docs')
    .select('total_views, unique_views, monthly_views, weekly_views, daily_views')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const updateData: any = {
    total_views: (current?.total_views || 0) + 1,
    monthly_views: (current?.monthly_views || 0) + 1,
    weekly_views: (current?.weekly_views || 0) + 1,
    daily_views: (current?.daily_views || 0) + 1
  }

  if (isUnique) {
    updateData.unique_views = (current?.unique_views || 0) + 1
  }

  const { data: doc, error } = await supabase
    .from('docs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function recordFeedback(id: string, isHelpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('docs')
    .select('helpful_count, not_helpful_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const helpfulCount = (current?.helpful_count || 0) + (isHelpful ? 1 : 0)
  const notHelpfulCount = (current?.not_helpful_count || 0) + (isHelpful ? 0 : 1)
  const totalFeedback = helpfulCount + notHelpfulCount
  const helpfulRatingPercent = totalFeedback > 0
    ? parseFloat(((helpfulCount / totalFeedback) * 100).toFixed(2))
    : 0

  const updateData: any = {
    helpful_rating_percent: helpfulRatingPercent
  }

  if (isHelpful) {
    updateData.helpful_count = helpfulCount
  } else {
    updateData.not_helpful_count = notHelpfulCount
  }

  const { data: doc, error } = await supabase
    .from('docs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function recordCodeCopy(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('docs')
    .select('code_copy_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      code_copy_count: (current?.code_copy_count || 0) + 1
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function updateAPIMetrics(id: string, requestCount: number, avgResponseTime: number, successRate: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      request_count: requestCount,
      avg_response_time_ms: avgResponseTime,
      success_rate: successRate
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function updateReadingMetrics(id: string, metrics: {
  read_time_seconds: number
  completion_rate: number
  bounce_rate: number
  scroll_depth_percent: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      avg_read_time_seconds: metrics.read_time_seconds,
      completion_rate: metrics.completion_rate,
      bounce_rate: metrics.bounce_rate,
      scroll_depth_percent: metrics.scroll_depth_percent
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}

export async function markAsOutdated(id: string, needsReview: boolean = true) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: doc, error } = await supabase
    .from('docs')
    .update({
      is_outdated: true,
      needs_review: needsReview
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/docs-v2')
  return doc
}
