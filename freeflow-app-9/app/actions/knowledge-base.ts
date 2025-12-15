'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createArticle(data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const slug = data.article_title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .insert({
      ...data,
      user_id: user.id,
      article_slug: slug,
      author: user.email || 'Unknown',
      author_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function updateArticle(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      ...data,
      last_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function deleteArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function publishArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      status: 'published',
      is_published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function unpublishArticle(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      status: 'draft',
      is_published: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function incrementViewCount(id: string, isUnique: boolean = false) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('knowledge_base')
    .select('view_count, unique_views, total_reads')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Article not found')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      view_count: current.view_count + 1,
      unique_views: isUnique ? current.unique_views + 1 : current.unique_views,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function rateArticle(id: string, rating: number, helpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('knowledge_base')
    .select('rating, rating_count, helpful_count, not_helpful_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Article not found')

  const newRatingCount = current.rating_count + 1
  const newRating = parseFloat(
    (((current.rating * current.rating_count) + rating) / newRatingCount).toFixed(2)
  )

  const helpfulCount = helpful ? current.helpful_count + 1 : current.helpful_count
  const notHelpfulCount = helpful ? current.not_helpful_count : current.not_helpful_count + 1
  const totalFeedback = helpfulCount + notHelpfulCount
  const helpfulPercentage = totalFeedback > 0
    ? parseFloat(((helpfulCount / totalFeedback) * 100).toFixed(2))
    : 0

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      rating: newRating,
      rating_count: newRatingCount,
      helpful_count: helpfulCount,
      not_helpful_count: notHelpfulCount,
      helpful_percentage: helpfulPercentage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function trackReadCompletion(id: string, completionRate: number, timeOnPage: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('knowledge_base')
    .select('total_reads, avg_time_on_page_seconds')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Article not found')

  const totalReads = current.total_reads + 1
  const avgTimeOnPage = Math.round(
    ((current.avg_time_on_page_seconds * current.total_reads) + timeOnPage) / totalReads
  )

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      total_reads: totalReads,
      completion_rate: completionRate,
      avg_time_on_page_seconds: avgTimeOnPage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function updateSearchMetrics(id: string, clicked: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('knowledge_base')
    .select('search_appearances, search_clicks')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Article not found')

  const { data: article, error } = await supabase
    .from('knowledge_base')
    .update({
      search_appearances: current.search_appearances + 1,
      search_clicks: clicked ? current.search_clicks + 1 : current.search_clicks,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return article
}

export async function createNewVersion(id: string, changeLog: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current article
  const { data: current } = await supabase
    .from('knowledge_base')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Article not found')

  // Mark current version as not latest
  await supabase
    .from('knowledge_base')
    .update({ is_latest_version: false })
    .eq('id', id)
    .eq('user_id', user.id)

  // Create new version
  const { data: newVersion, error } = await supabase
    .from('knowledge_base')
    .insert({
      ...current,
      id: undefined, // Let DB generate new ID
      version: current.version + 1,
      previous_version_id: id,
      is_latest_version: true,
      change_log: changeLog,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/knowledge-base-v2')
  return newVersion
}
